import { createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";

export type AgentActionKind = "browser_action" | "cron_job" | "parallel_task" | "llm_call" | "job_search" | "document_generation";
export type AgentModelTier = "cheap_filter" | "standard_reasoning" | "premium_document";
export type AgentStatus = "allowed" | "blocked" | "paused_security_hold" | "requires_human_review";

export type AgentSafetyInput = {
  userId?: string;
  runToken?: string;
  agentName: "job_hunter" | "asset_customizer" | "outreach" | "audio_briefing" | "scout" | "sentinel";
  actionKind: AgentActionKind;
  targetPortal?: "naukri" | "linkedin" | "indeed" | "shine" | "foundit" | "iimjobs" | "glassdoor" | "other";
  connectorType?: "native_api" | "secure_client_side" | "search_url" | "manual_paste" | "browser_cursor";
  modelTier?: AgentModelTier;
  estimatedCostInr?: number;
  estimatedJobSearches?: number;
  consecutiveSecurityBlocks?: number;
  targetStatusCode?: number;
  targetErrorText?: string;
  payload?: unknown;
  currentStep?: string;
  completedJobKeys?: string[];
  alreadyChargedKeys?: string[];
};

export type AgentSafetyDecision = {
  status: AgentStatus;
  allowed: boolean;
  runToken: string;
  delayMs: number;
  reason: string;
  safeMessage: string;
  recommendedConnector: "native_api" | "secure_client_side" | "search_url" | "manual_paste";
  modelTier: AgentModelTier;
  localResumeToken: string;
  checkpoint: {
    runToken: string;
    lastGoodStep: string;
    completedJobKeys: string[];
    alreadyChargedKeys: string[];
  };
};

type UsageTotals = {
  monthCostInr: number;
  dailyJobSearches: number;
};

type UsageAggregate = { _sum: { estimatedInr: number | null; jobSearches: number | null } };
type SafeLogMeta = Record<string, string | number | boolean | null | string[]>;

const monthlyCostLimitInr = 1000;
const dailyJobSearchLimit = 100;
const minBrowserDelayMs = 1500;
const maxBrowserDelayMs = 4500;
const sensitiveKeyPattern = /(password|token|secret|cookie|credential|session|otp|authorization|api[-_]?key|csrf)/i;
const sensitiveValuePattern = /(Bearer\s+[A-Za-z0-9._-]+|sk-[A-Za-z0-9._-]+|eyJ[A-Za-z0-9._-]+|sessionid=|csrf=|cookie:)/i;

const dbUnsafe = db as unknown as {
  agentUsageLedger?: {
    aggregate: (args: unknown) => Promise<{ _sum: { estimatedInr: number | null; jobSearches: number | null } }>;
    create: (args: unknown) => Promise<unknown>;
  };
  agentSafetyEvent?: {
    create: (args: unknown) => Promise<unknown>;
  };
  agentRun?: {
    upsert: (args: unknown) => Promise<unknown>;
    updateMany: (args: unknown) => Promise<unknown>;
  };
  agentResumeCheckpoint?: {
    upsert: (args: unknown) => Promise<unknown>;
  };
};

async function ignoreDbUnavailable(task: () => Promise<unknown>) {
  try {
    await task();
  } catch {
    // The sentinel still needs to return a safe decision when local PostgreSQL
    // is not configured. Persistence becomes active once DATABASE_URL is valid.
  }
}

export function buildRunToken() {
  return `run_${randomBytes(16).toString("hex")}`;
}

export function buildLocalResumeToken() {
  return `local_resume_${randomBytes(18).toString("hex")}`;
}

export function randomizedBrowserDelayMs() {
  return minBrowserDelayMs + Math.floor(Math.random() * (maxBrowserDelayMs - minBrowserDelayMs + 1));
}

export function safeHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function sanitizeAgentMeta(input: AgentSafetyInput): SafeLogMeta {
  return {
    agentName: input.agentName,
    actionKind: input.actionKind,
    targetPortal: input.targetPortal ?? null,
    connectorType: input.connectorType ?? null,
    modelTier: input.modelTier ?? null,
    targetStatusCode: input.targetStatusCode ?? null,
    consecutiveSecurityBlocks: input.consecutiveSecurityBlocks ?? 0,
    estimatedCostInr: input.estimatedCostInr ?? 0,
    estimatedJobSearches: input.estimatedJobSearches ?? 0,
    currentStep: input.currentStep ?? null,
    completedJobCount: input.completedJobKeys?.length ?? 0,
  };
}

export function payloadHasSensitiveData(payload: unknown): boolean {
  if (!payload) return false;
  const inspect = (value: unknown, path = ""): boolean => {
    if (value == null) return false;
    if (typeof value === "string") return sensitiveValuePattern.test(value);
    if (typeof value !== "object") return false;
    if (Array.isArray(value)) return value.some((item, index) => inspect(item, `${path}.${index}`));
    return Object.entries(value as Record<string, unknown>).some(([key, child]) => sensitiveKeyPattern.test(key) || inspect(child, `${path}.${key}`));
  };
  return inspect(payload);
}

export function recommendedConnectorFor(input: AgentSafetyInput): AgentSafetyDecision["recommendedConnector"] {
  if (input.connectorType === "native_api") return "native_api";
  if (input.connectorType === "secure_client_side") return "secure_client_side";
  if (input.connectorType === "manual_paste") return "manual_paste";
  return "search_url";
}

export function resolveModelTier(input: AgentSafetyInput): AgentModelTier {
  if (input.actionKind === "document_generation") return "premium_document";
  if (input.actionKind === "llm_call" && input.modelTier === "premium_document") return "premium_document";
  if (input.actionKind === "job_search" || input.actionKind === "browser_action") return "cheap_filter";
  return input.modelTier ?? "standard_reasoning";
}

export function mapAnthropicError(error: unknown) {
  const maybe = error as { status?: number; name?: string; message?: string; type?: string };
  if (maybe.status === 429) return { code: "model_rate_limited", retryable: true, safeMessage: "The model provider is busy. Karma paused this step without charging it twice." };
  if (maybe.status === 401 || maybe.status === 403) return { code: "model_auth_error", retryable: false, safeMessage: "The model provider rejected this request. Karma paused the agent safely." };
  if (maybe.status && maybe.status >= 500) return { code: "model_provider_down", retryable: true, safeMessage: "The model provider failed temporarily. Karma saved the checkpoint." };
  if (maybe.name === "APIConnectionError") return { code: "model_network_error", retryable: true, safeMessage: "Network dropped during model use. Karma saved the checkpoint." };
  return { code: "model_unknown_error", retryable: false, safeMessage: "A model step failed. Karma isolated the failure." };
}

async function usageTotalsFor(userId: string): Promise<UsageTotals> {
  if (!dbUnsafe.agentUsageLedger) return { monthCostInr: 0, dailyJobSearches: 0 };
  const now = new Date();
  const monthKey = now.toISOString().slice(0, 7);
  const cycleDate = now.toISOString().slice(0, 10);
  let month: UsageAggregate = { _sum: { estimatedInr: 0, jobSearches: 0 } };
  let day: UsageAggregate = { _sum: { estimatedInr: 0, jobSearches: 0 } };
  try {
    [month, day] = await Promise.all([
      dbUnsafe.agentUsageLedger.aggregate({
        where: { userId, monthKey },
        _sum: { estimatedInr: true, jobSearches: true },
      }),
      dbUnsafe.agentUsageLedger.aggregate({
        where: { userId, cycleDate },
        _sum: { estimatedInr: true, jobSearches: true },
      }),
    ]);
  } catch {
    return { monthCostInr: 0, dailyJobSearches: 0 };
  }
  return {
    monthCostInr: month._sum.estimatedInr ?? 0,
    dailyJobSearches: day._sum.jobSearches ?? 0,
  };
}

async function persistSafetyEvent(input: AgentSafetyInput, severity: "info" | "warning" | "critical", reason: string, action: AgentStatus) {
  if (!dbUnsafe.agentSafetyEvent) return;
  await ignoreDbUnavailable(() =>
    dbUnsafe.agentSafetyEvent!.create({
      data: {
        userId: input.userId,
        runToken: input.runToken,
        severity,
        reason,
        action,
        safeMeta: sanitizeAgentMeta(input),
      },
    }),
  );
}

function runStatusData(status: AgentStatus, input: AgentSafetyInput) {
  const data: Record<string, unknown> = {
    status,
    currentStep: input.currentStep,
    checkpointHash: safeHash(JSON.stringify(input.completedJobKeys ?? [])),
  };
  if (status !== "allowed") data.finishedAt = new Date();
  return data;
}

async function persistRunStatus(input: AgentSafetyInput, status: AgentStatus, runToken: string) {
  if (!input.userId || !dbUnsafe.agentRun) return;
  await ignoreDbUnavailable(() =>
    dbUnsafe.agentRun!.upsert({
      where: { runToken },
      create: {
        userId: input.userId,
        runToken,
        agentName: input.agentName,
        ...runStatusData(status, input),
      },
      update: runStatusData(status, input),
    }),
  );
}

async function persistUsage(input: AgentSafetyInput, modelTier: AgentModelTier) {
  if (!input.userId || !dbUnsafe.agentUsageLedger) return;
  const now = new Date();
  await ignoreDbUnavailable(() =>
    dbUnsafe.agentUsageLedger!.create({
      data: {
        userId: input.userId,
        cycleDate: now.toISOString().slice(0, 10),
        monthKey: now.toISOString().slice(0, 7),
        actionType: input.actionKind,
        modelTier,
        estimatedInr: Math.max(0, Math.ceil(input.estimatedCostInr ?? 0)),
        jobSearches: Math.max(0, Math.ceil(input.estimatedJobSearches ?? 0)),
        metadata: sanitizeAgentMeta(input),
      },
    }),
  );
}

async function persistCheckpoint(input: AgentSafetyInput, runToken: string, localResumeToken: string) {
  const checkpoint = {
    runToken,
    lastGoodStep: input.currentStep ?? "not_started",
    completedJobKeys: input.completedJobKeys ?? [],
    alreadyChargedKeys: input.alreadyChargedKeys ?? [],
  };
  if (input.userId && dbUnsafe.agentResumeCheckpoint) {
    await ignoreDbUnavailable(() =>
      dbUnsafe.agentResumeCheckpoint!.upsert({
        where: { runToken },
        create: {
          userId: input.userId,
          runToken,
          anonymousToken: localResumeToken,
          lastGoodStep: checkpoint.lastGoodStep,
          completedJobKeys: JSON.stringify(checkpoint.completedJobKeys),
          creditDebits: JSON.stringify(checkpoint.alreadyChargedKeys),
        },
        update: {
          anonymousToken: localResumeToken,
          lastGoodStep: checkpoint.lastGoodStep,
          completedJobKeys: JSON.stringify(checkpoint.completedJobKeys),
          creditDebits: JSON.stringify(checkpoint.alreadyChargedKeys),
        },
      }),
    );
  }
  return checkpoint;
}

function targetLooksBlocked(input: AgentSafetyInput) {
  const blockedStatus = input.targetStatusCode === 403 || input.targetStatusCode === 429;
  const blockedText = /(captcha|access denied|blocked|bot detected|unusual traffic)/i.test(input.targetErrorText ?? "");
  return blockedStatus || blockedText;
}

export async function evaluateAgentPrecautions(input: AgentSafetyInput): Promise<AgentSafetyDecision> {
  const runToken = input.runToken || buildRunToken();
  const localResumeToken = buildLocalResumeToken();
  const modelTier = resolveModelTier(input);
  const delayMs = input.actionKind === "browser_action" ? randomizedBrowserDelayMs() : 0;
  const recommendedConnector = recommendedConnectorFor(input);
  const checkpoint = await persistCheckpoint(input, runToken, localResumeToken);

  const securityBlocks = input.consecutiveSecurityBlocks ?? 0;
  if (targetLooksBlocked(input) && securityBlocks >= 2) {
    await persistSafetyEvent({ ...input, runToken }, "critical", "portal_security_hold", "paused_security_hold");
    await persistRunStatus({ ...input, runToken }, "paused_security_hold", runToken);
    return {
      status: "paused_security_hold",
      allowed: false,
      runToken,
      delayMs,
      reason: "portal_security_hold",
      safeMessage: "The job portal showed repeated security blocks. Karma paused the agent to protect the user's account.",
      recommendedConnector,
      modelTier,
      localResumeToken,
      checkpoint,
    };
  }

  if (input.actionKind === "browser_action" && input.connectorType === "browser_cursor" && recommendedConnector !== "native_api") {
    await persistSafetyEvent({ ...input, runToken }, "warning", "browser_cursor_deprioritized", "requires_human_review");
    return {
      status: "requires_human_review",
      allowed: false,
      runToken,
      delayMs,
      reason: "browser_cursor_deprioritized",
      safeMessage: "Karma prefers APIs, search links, manual paste, or secure client-side review before cursor-style browser automation.",
      recommendedConnector,
      modelTier,
      localResumeToken,
      checkpoint,
    };
  }

  if (payloadHasSensitiveData(input.payload)) {
    await persistSafetyEvent({ ...input, runToken }, "critical", "sensitive_payload_rejected", "blocked");
    return {
      status: "blocked",
      allowed: false,
      runToken,
      delayMs,
      reason: "sensitive_payload_rejected",
      safeMessage: "Karma blocked this action because it may contain credentials, cookies, tokens, or session data.",
      recommendedConnector,
      modelTier,
      localResumeToken,
      checkpoint,
    };
  }

  if (input.userId) {
    const totals = await usageTotalsFor(input.userId);
    const projectedCost = totals.monthCostInr + Math.max(0, input.estimatedCostInr ?? 0);
    const projectedSearches = totals.dailyJobSearches + Math.max(0, input.estimatedJobSearches ?? 0);
    if (projectedCost > monthlyCostLimitInr) {
      await persistSafetyEvent({ ...input, runToken }, "critical", "monthly_credit_limit_reached", "blocked");
      await persistRunStatus({ ...input, runToken }, "blocked", runToken);
      return {
        status: "blocked",
        allowed: false,
        runToken,
        delayMs,
        reason: "monthly_credit_limit_reached",
        safeMessage: "Karma stopped this run because the monthly agent credit limit has been reached.",
        recommendedConnector,
        modelTier,
        localResumeToken,
        checkpoint,
      };
    }
    if (projectedSearches > dailyJobSearchLimit) {
      await persistSafetyEvent({ ...input, runToken }, "critical", "daily_job_search_limit_reached", "blocked");
      await persistRunStatus({ ...input, runToken }, "blocked", runToken);
      return {
        status: "blocked",
        allowed: false,
        runToken,
        delayMs,
        reason: "daily_job_search_limit_reached",
        safeMessage: "Karma stopped this run because the 24-hour job-search limit has been reached.",
        recommendedConnector,
        modelTier,
        localResumeToken,
        checkpoint,
      };
    }
  }

  if (modelTier === "premium_document" && input.actionKind !== "document_generation" && input.actionKind !== "llm_call") {
    await persistSafetyEvent({ ...input, runToken }, "warning", "premium_model_wrong_stage", "blocked");
    return {
      status: "blocked",
      allowed: false,
      runToken,
      delayMs,
      reason: "premium_model_wrong_stage",
      safeMessage: "Premium models are reserved for final CV and cover-letter generation.",
      recommendedConnector,
      modelTier: "cheap_filter",
      localResumeToken,
      checkpoint,
    };
  }

  await persistUsage({ ...input, runToken }, modelTier);
  await persistRunStatus({ ...input, runToken }, "allowed", runToken);
  await persistSafetyEvent({ ...input, runToken }, "info", "action_allowed", "allowed");
  return {
    status: "allowed",
    allowed: true,
    runToken,
    delayMs,
    reason: "action_allowed",
    safeMessage: "Karma allowed this agent step with privacy, cost, and security limits active.",
    recommendedConnector,
    modelTier,
    localResumeToken,
    checkpoint,
  };
}

export async function runAgentThreadSafely<T>(
  input: AgentSafetyInput,
  task: () => Promise<T>,
  fallback: T,
): Promise<{ ok: boolean; value: T; decision: AgentSafetyDecision; errorCode?: string }> {
  const decision = await evaluateAgentPrecautions(input);
  if (!decision.allowed) return { ok: false, value: fallback, decision, errorCode: decision.reason };
  if (decision.delayMs > 0) await new Promise((resolve) => setTimeout(resolve, decision.delayMs));
  try {
    return { ok: true, value: await task(), decision };
  } catch (error) {
    const mapped = mapAnthropicError(error);
    await persistSafetyEvent({ ...input, runToken: decision.runToken }, mapped.retryable ? "warning" : "critical", mapped.code, "blocked");
    return { ok: false, value: fallback, decision: { ...decision, allowed: false, status: "blocked", reason: mapped.code, safeMessage: mapped.safeMessage }, errorCode: mapped.code };
  }
}
