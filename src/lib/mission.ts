import type { ScoreOutput } from "@/lib/scoring";

export function buildMissionPlan(functionArea: string, score: Pick<ScoreOutput, "rag">) {
  const urgentPrefix = score.rag === "red" ? "This week: " : "";
  return [
    {
      track: "Upskilling Prescription",
      actions: [
        `${urgentPrefix}Pick one AI-assisted workflow in your current role and document the before/after time saved.`,
        `Complete one ${functionArea.toUpperCase()}-relevant AI tooling course.`,
        "Create a weekly portfolio note showing judgment, exceptions, and decisions.",
        "Ask one senior colleague which tasks are becoming automated fastest.",
      ],
    },
    {
      track: "Role Options",
      actions: [
        "Shortlist three safer adjacent roles using your current domain knowledge.",
        "Rewrite your role description around outcomes, not tasks.",
        "Speak to one person already doing a safer adjacent role.",
        "Prepare a transition story for interviews and internal movement.",
      ],
    },
    {
      track: "Visibility & Manager Connect",
      actions: [
        "Schedule a manager conversation about AI impact and future responsibilities.",
        "Volunteer for one exception-heavy or client-facing problem.",
        "Share one improvement idea with measurable business impact.",
        "Track visible wins in a weekly brag document.",
      ],
    },
    {
      track: "Financial Stabilisation",
      actions: [
        `${urgentPrefix}Calculate your six-month survival buffer target.`,
        "Identify one recurring expense to pause or reduce.",
        "Keep at least two months of expenses in quickly accessible funds.",
        "Do not take new fixed commitments until your safety score improves.",
      ],
    },
    {
      track: "Mental Resilience",
      actions: [
        "Create a 20-minute daily learning block.",
        "Pick one person for a weekly accountability check-in.",
        "Separate your identity from your current job title in writing.",
        "Use a support resource if anxiety starts affecting sleep or work.",
      ],
    },
  ];
}
