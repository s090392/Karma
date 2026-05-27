import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import {
  evaluateAgentPrecautions,
  mapAnthropicError,
  type AgentActionKind,
  type AgentModelTier,
  type AgentSafetyInput,
} from "@/lib/agent-precaution-engine";

export const dynamic = "force-dynamic";

const sentinelSchema = z.object({
  runToken: z.string().optional(),
  agentName: z.enum(["job_hunter", "asset_customizer", "outreach", "audio_briefing", "scout", "sentinel"]).default("sentinel"),
  actionKind: z.enum(["browser_action", "cron_job", "parallel_task", "llm_call", "job_search", "document_generation"]),
  targetPortal: z.enum(["naukri", "linkedin", "indeed", "shine", "foundit", "iimjobs", "glassdoor", "other"]).optional(),
  connectorType: z.enum(["native_api", "secure_client_side", "search_url", "manual_paste", "browser_cursor"]).optional(),
  modelTier: z.enum(["cheap_filter", "standard_reasoning", "premium_document"]).optional(),
  estimatedCostInr: z.number().min(0).max(1000).optional(),
  estimatedJobSearches: z.number().int().min(0).max(250).optional(),
  consecutiveSecurityBlocks: z.number().int().min(0).max(20).optional(),
  targetStatusCode: z.number().int().min(100).max(599).optional(),
  targetErrorText: z.string().max(500).optional(),
  payload: z.unknown().optional(),
  currentStep: z.string().max(160).optional(),
  completedJobKeys: z.array(z.string().max(160)).max(500).optional(),
  alreadyChargedKeys: z.array(z.string().max(160)).max(500).optional(),
});

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "karma-agent-sentinel",
    mode: "guardrail_only",
    rules: {
      browserDelayMs: "1500-4500 for browser actions",
      portalSecurityHold: "pause after more than 2 consecutive captcha/access-denied blocks",
      monthlyCostLimitInr: 1000,
      dailyJobSearchLimit: 100,
      privacy: "credentials, cookies, tokens, and session payloads are rejected",
      modelPolicy: {
        cheap_filter: "search, scraping-safe text filtering, mapping",
        standard_reasoning: "normal planning and rubric decisions",
        premium_document: "final CV and cover-letter generation only",
      },
    },
  });
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = sentinelSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          allowed: false,
          status: "blocked",
          reason: "invalid_sentinel_request",
          safeMessage: "Karma could not validate this agent request.",
          issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
        },
        { status: 400 },
      );
    }

    const user = await getSessionUser();
    const input: AgentSafetyInput = {
      ...parsed.data,
      userId: user?.id,
      actionKind: parsed.data.actionKind as AgentActionKind,
      modelTier: parsed.data.modelTier as AgentModelTier | undefined,
    };
    const decision = await evaluateAgentPrecautions(input);
    const httpStatus = decision.status === "allowed" ? 200 : decision.status === "requires_human_review" ? 409 : 423;
    return NextResponse.json(
      {
        ...decision,
        privacyNote: "Store localResumeToken and checkpoint only in local device storage. Do not upload cookies, credentials, or portal session state.",
        humanSubmissionRequired: true,
      },
      { status: httpStatus },
    );
  } catch (error) {
    const mapped = mapAnthropicError(error);
    return NextResponse.json(
      {
        allowed: false,
        status: "blocked",
        reason: mapped.code,
        safeMessage: mapped.safeMessage,
        retryable: mapped.retryable,
      },
      { status: mapped.retryable ? 503 : 500 },
    );
  }
}
