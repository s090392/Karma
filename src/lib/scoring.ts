export type AssessmentInput = {
  segment: "bpo" | "it" | "fresher" | "manager" | "robotics" | "generic";
  functionArea: "fa" | "cs" | "hr" | "it" | "analytics" | "lpo" | "operations" | "generic";
  aiAdoption: "none" | "pilot" | "scaling" | "replacing";
  experienceYears: number;
  tenureYears: number;
  salary: number;
  fixedCommitmentPct: number;
  mechanicalAtoms: string[];
  logicalAtoms: string[];
  complacencyRatio?: number;
  roboticsExposure?: number;
  country: string;
};

export type ScoreOutput = {
  riskScore: number;
  logicQuotient: number;
  safetyWindow: number;
  safetyScore: number;
  valueDrift: number;
  rag: "green" | "amber" | "red";
  atomRatio: number;
};

const weights = {
  function: { fa: 4.6, cs: 4.4, hr: 3.6, it: 3.7, analytics: 3.9, lpo: 3.1, operations: 4.2, generic: 3.2 },
  segment: { bpo: 4.6, it: 3.7, fresher: 3.7, manager: 4.1, robotics: 4.4, generic: 3.2 },
  ai: { none: 1.4, pilot: 2.5, scaling: 3.7, replacing: 5 },
  window: { none: 28, pilot: 20, scaling: 13, replacing: 7 },
};

function clamp(value: number, min = 1, max = 10) {
  return Math.max(min, Math.min(max, value));
}

export function calculateCareerSafety(input: AssessmentInput): ScoreOutput {
  const fnWeight = weights.function[input.functionArea] ?? 3.2;
  const segmentWeight = weights.segment[input.segment] ?? 3.2;
  const aiWeight = weights.ai[input.aiAdoption] ?? 2.5;
  const atomTotal = input.mechanicalAtoms.length + input.logicalAtoms.length;
  const atomRatio = atomTotal ? input.mechanicalAtoms.length / atomTotal : 0.55;
  const experienceAdjustment = input.experienceYears < 3 ? 0.55 : input.experienceYears > 12 ? -0.25 : 0;
  const tenureAdjustment = input.tenureYears > 12 ? 0.65 : input.tenureYears > 7 ? 0.3 : 0;
  const managerAdjustment = input.segment === "manager" && input.complacencyRatio ? (input.complacencyRatio - 45) / 45 : 0;
  const roboticsAdjustment = input.segment === "robotics" && input.roboticsExposure ? input.roboticsExposure / 120 : 0;

  const riskScore = Number(
    clamp(
      ((fnWeight + segmentWeight + aiWeight) / 3) * 1.65 +
        (atomRatio - 0.55) * 2.2 +
        experienceAdjustment +
        tenureAdjustment +
        managerAdjustment +
        roboticsAdjustment,
    ).toFixed(1),
  );
  const logicQuotient = Number(clamp(11 - riskScore + input.logicalAtoms.length * 0.25).toFixed(1));
  const commitmentDrag = input.fixedCommitmentPct >= 70 ? 0.7 : input.fixedCommitmentPct <= 30 ? 1.25 : 1;
  const safetyWindow = Math.max(3, Math.round((weights.window[input.aiAdoption] ?? 16) * commitmentDrag - managerAdjustment * 2));
  const safetyScore = Number(
    clamp(11 - riskScore * 0.64 - (safetyWindow < 12 ? 1.3 : 0) - (input.fixedCommitmentPct > 65 ? 0.8 : 0)).toFixed(1),
  );
  const valueDrift = Math.round((input.salary || 100000) * 0.008 * (riskScore / 5));
  const rag = safetyScore >= 6.5 ? "green" : safetyScore >= 3.5 ? "amber" : "red";

  return {
    riskScore,
    logicQuotient,
    safetyWindow,
    safetyScore,
    valueDrift,
    rag,
    atomRatio: Number(atomRatio.toFixed(2)),
  };
}

export const defaultAtoms = {
  fa: {
    mechanical: ["Invoice matching", "Standard reconciliations", "Report preparation", "Approval follow-ups"],
    logical: ["Exception investigation", "Control redesign", "Client tradeoff decisions"],
  },
  operations: {
    mechanical: ["Routine inspection", "Pick-pack movement", "Status scanning", "Standard machine operation"],
    logical: ["Safety judgment", "Root-cause diagnosis", "Process redesign"],
  },
};
