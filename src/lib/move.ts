export type MoveCompanyTier = "A" | "B" | "C" | "X";
export type MoveStatus = "evaluated" | "saved" | "applied" | "interview" | "offer" | "rejected" | "withdrawn" | "dismissed";

export type MoveProfile = {
  targetRoles: string[];
  locations: string[];
  workType: string;
  minSalary: string;
  priorityRanking: string[];
  careerStory: string;
  proofPoints: string[];
  avoidList: string;
  companies: { name: string; tier: MoveCompanyTier }[];
  cvFileName?: string;
  setupComplete?: boolean;
  alerts?: { frequency: "daily" | "weekly"; lastAlertCheck?: string };
};

export type MoveDimensionKey = "cvMatch" | "roleFit" | "careerGrowth" | "aiStability" | "companyHealth" | "strategicFit";

export type MoveEvaluation = {
  overallScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  dimensions: Record<MoveDimensionKey, { score: number; reason: string }>;
  recommendation: string;
  redFlags: string[];
  greenFlags: string[];
  archetype: string;
  salarySignal: string;
  estimatedSalaryRange: string;
  requirementsMet?: { requirement: string; evidence: string }[];
  gaps?: string[];
  atsKeywords?: string[];
};

export type MoveJob = {
  id: string;
  jobTitle: string;
  company: string;
  location?: string;
  salaryRange?: string;
  jobUrl?: string;
  jobDescription: string;
  source?: string;
  postedDate?: string;
  status?: MoveStatus;
  grade?: string;
  createdAt?: string;
  notes?: string;
  evaluation?: MoveEvaluation;
  coverLetterText?: string;
  formAnswers?: { question: string; answer: string }[];
};

export const moveStorageKeys = {
  profile: "karma_move_profile",
  pipeline: "karma_move_pipeline",
  firstVisit: "karma_move_first_visit_seen",
};

export const movePriorityOptions = [
  "Role fit with my experience",
  "Salary and compensation",
  "Career growth trajectory",
  "AI stability (low automation risk in this role)",
  "Company health and stability",
  "Work-life balance",
  "Location and commute",
  "Learning and development",
];

export const moveCompanySuggestions = [
  "TCS",
  "Infosys",
  "Wipro",
  "Accenture",
  "WNS",
  "Genpact",
  "Capgemini",
  "EY",
  "Deloitte",
  "KPMG",
  "PwC",
  "IBM",
  "Cognizant",
  "HCL",
  "Mphasis",
];

export const moveStatuses: { id: MoveStatus; label: string }[] = [
  { id: "evaluated", label: "Evaluated" },
  { id: "saved", label: "Saved" },
  { id: "applied", label: "Applied" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "rejected", label: "Rejected" },
  { id: "withdrawn", label: "Withdrawn" },
];

export const sampleMoveJobs: MoveJob[] = [
  {
    id: "sample-finance-controls",
    jobTitle: "Finance Controls Analyst",
    company: "Genpact",
    location: "Bangalore / Hybrid",
    salaryRange: "Rs 15-25 LPA",
    source: "manual",
    postedDate: "Last 7 days",
    jobDescription:
      "Own finance controls, exception investigation, BlackLine reconciliation governance, stakeholder reviews, audit evidence, and automation improvement for a global shared-services finance process.",
  },
  {
    id: "sample-fpa-manager",
    jobTitle: "FP&A Manager",
    company: "Accenture",
    location: "Mumbai",
    salaryRange: "Rs 25-40 LPA",
    source: "manual",
    postedDate: "Last 30 days",
    jobDescription:
      "Lead forecasting, variance analysis, senior stakeholder narratives, pricing support, margin improvement, and business partnering for a high-growth operations portfolio.",
  },
  {
    id: "sample-ai-audit",
    jobTitle: "AI Audit Lead",
    company: "Deloitte",
    location: "Remote",
    salaryRange: "Rs 40L+",
    source: "manual",
    postedDate: "Last 24h",
    jobDescription:
      "Build AI governance controls, evaluate model risk, advise audit teams, translate business risk into assurance programs, and lead client workshops on responsible automation.",
  },
];

export function defaultMoveProfile(): MoveProfile {
  return {
    targetRoles: ["Finance Controls Analyst", "FP&A Manager"],
    locations: ["Mumbai", "Remote"],
    workType: "Hybrid",
    minSalary: "Rs 15-25L",
    priorityRanking: [...movePriorityOptions],
    careerStory: "",
    proofPoints: ["Reduced invoice processing time by 40% using BlackLine", "", ""],
    avoidList: "",
    companies: [
      { name: "Accenture", tier: "B" },
      { name: "Genpact", tier: "B" },
      { name: "Infosys", tier: "C" },
    ],
    setupComplete: false,
    alerts: { frequency: "weekly" },
  };
}

export function gradeFor(score: number): MoveEvaluation["grade"] {
  if (score >= 4.5) return "A";
  if (score >= 4) return "B";
  if (score >= 3) return "C";
  if (score >= 2) return "D";
  return "F";
}

export function recommendationFor(score: number) {
  if (score >= 4.5) return "Strong match - worth your time.";
  if (score >= 4) return "Good match - apply after tailoring your proof points.";
  if (score >= 3) return "Moderate match - review carefully before applying.";
  return "Weak match - career-ops recommends skipping jobs below 4.0/5.";
}

export function estimateTokenCost(text: string) {
  const tokens = Math.max(900, Math.round(text.length / 3.8 + 1200));
  const rupees = (tokens / 1000) * 0.12;
  return { tokens, rupees: Number(rupees.toFixed(2)) };
}

function keywordScore(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  const hits = keywords.filter((keyword) => lower.includes(keyword.toLowerCase())).length;
  return Math.min(5, 2.4 + hits * 0.42);
}

export function evaluateJobDeterministic(jobDescription: string, profile: MoveProfile): MoveEvaluation {
  const text = jobDescription || "";
  const proofText = `${profile.careerStory} ${profile.proofPoints.join(" ")} ${profile.targetRoles.join(" ")}`;
  const avoidHits = profile.avoidList
    ? profile.avoidList
        .split(/[,.\n]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => text.toLowerCase().includes(item.toLowerCase())).length
    : 0;
  const cvMatch = keywordScore(`${text} ${proofText}`, profile.targetRoles.concat(profile.proofPoints).filter(Boolean));
  const roleFit = keywordScore(text, ["lead", "owner", "control", "stakeholder", "exception", "analysis", "manager", "audit", "finance"]);
  const careerGrowth = keywordScore(text, ["lead", "senior", "growth", "strategy", "transformation", "global", "business partner"]);
  const aiStability = keywordScore(text, ["judgment", "governance", "risk", "client", "stakeholder", "strategy", "audit", "exception"]);
  const companyHealth = keywordScore(text, ["growth", "investment", "new team", "global", "expansion", "mission", "transformation"]);
  const strategicFit = keywordScore(text, profile.priorityRanking.slice(0, 4));
  const raw = { cvMatch, roleFit, careerGrowth, aiStability, companyHealth, strategicFit };
  const overall = Object.values(raw).reduce((sum, value) => sum + value, 0) / 6 - avoidHits * 0.5;
  const overallScore = Number(Math.max(1, Math.min(5, overall)).toFixed(1));
  const grade = gradeFor(overallScore);

  return {
    overallScore,
    grade,
    dimensions: {
      cvMatch: { score: Number(cvMatch.toFixed(1)), reason: "Compared target roles, proof points, and role language." },
      roleFit: { score: Number(roleFit.toFixed(1)), reason: "Checks whether the role uses strengths rather than routine tasks." },
      careerGrowth: { score: Number(careerGrowth.toFixed(1)), reason: "Looks for seniority, scope, and trajectory signals." },
      aiStability: { score: Number(aiStability.toFixed(1)), reason: "Rewards judgment, exception handling, risk, and stakeholder work." },
      companyHealth: { score: Number(companyHealth.toFixed(1)), reason: "Reads the description for investment and clarity signals." },
      strategicFit: { score: Number(strategicFit.toFixed(1)), reason: "Maps the role to the user's ranked priorities." },
    },
    recommendation: recommendationFor(overallScore),
    redFlags: avoidHits ? ["This role appears to touch something from your avoid list."] : overallScore < 4 ? ["Below the 4.0/5 career-ops apply threshold."] : [],
    greenFlags: ["Role has enough signal for a structured review.", aiStability >= 4 ? "The role appears to contain human judgment work." : "AI stability needs review."],
    archetype: overallScore >= 4.3 ? "Strategic Advisor" : overallScore >= 3.8 ? "Domain Expert" : "Transition Role",
    salarySignal: text.toLowerCase().includes("salary") || text.toLowerCase().includes("lpa") ? "Market rate" : "Not specified",
    estimatedSalaryRange: "Rs 15-35 LPA based on role signals",
    requirementsMet: [
      { requirement: "Domain experience", evidence: profile.proofPoints.find(Boolean) || "Candidate has relevant functional proof points." },
      { requirement: "Judgment under ambiguity", evidence: "Karma maps this to logical atoms and career story." },
    ],
    gaps: overallScore < 4 ? ["Add more proof points or target a role closer to your strongest experience."] : [],
    atsKeywords: ["controls", "stakeholder management", "automation", "risk", "analysis", "governance", "process improvement"],
  };
}

export function extractJobBasics(description: string, fallbackUrl?: string) {
  const lines = description
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const first = lines[0] || "Pasted job listing";
  const companyMatch = description.match(/(?:company|organisation|organization)[:\s]+([A-Z][\w\s&.-]{2,40})/i);
  return {
    jobTitle: first.slice(0, 80),
    company: companyMatch?.[1]?.trim() || (fallbackUrl ? new URL(fallbackUrl).hostname.replace("www.", "") : "Company not specified"),
    location: description.match(/(?:location)[:\s]+([A-Z][\w\s,/.-]{2,50})/i)?.[1]?.trim() || "Not specified",
    salaryRange: description.match(/(?:salary|ctc)[:\s]+([A-Za-z0-9\s,.-]{2,40})/i)?.[1]?.trim() || "Not specified",
  };
}

export function buildSearchUrls(role: string, location: string, sources: string[]) {
  const q = encodeURIComponent(`${role} ${location}`.trim());
  const map: Record<string, string> = {
    Naukri: `https://www.naukri.com/${q}-jobs`,
    LinkedIn: `https://www.linkedin.com/jobs/search/?keywords=${q}`,
    Indeed: `https://www.indeed.com/jobs?q=${q}`,
    Shine: `https://www.shine.com/job-search/${q}-jobs`,
    Foundit: `https://www.foundit.in/srp/results?query=${q}`,
    iimjobs: `https://www.iimjobs.com/search/${q}.html`,
    Glassdoor: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${q}`,
  };
  return sources.map((source) => ({ source, url: map[source] || `https://www.google.com/search?q=${q}+jobs` }));
}
