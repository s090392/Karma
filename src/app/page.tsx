"use client";

import { useEffect, useMemo, useState } from "react";

type View = "home" | "assessment" | "market" | "mission" | "plans" | "profile" | "results";
type Segment = "outsourcing" | "fresher" | "manager" | "robotics";
type Adoption = "none" | "pilot" | "scaling" | "replacing";
type Rag = "RED" | "AMBER" | "GREEN";
type PlanId = "free" | "explorer" | "navigator" | "pioneer";

type AssessmentState = {
  nickname: string;
  country: string;
  companyName: string;
  segment: Segment;
  roleId: string;
  salaryBand: "lower" | "middle" | "higher";
  experienceYears: number;
  tenureYears: number;
  aiAdoption: Adoption;
  mechanicalAtoms: string[];
  logicalAtoms: string[];
  personalStrengths: string[];
  responseMap: Record<string, string>;
  fixedCommitmentPct: number;
};

type Score = {
  safetyScore: number;
  riskScore: number;
  logicQuotient: number;
  careerSafetyWindow: number;
  safetyDate: string;
  rag: Rag;
  atomRatio: number;
  marketValueDrift: string;
  percentile: number;
  marketPressure: number;
  scoreVersion: string;
  scoreFingerprint: string;
  rawRiskPoints: number;
  parameters: ScoreParameter[];
};

type ScoreParameter = {
  label: string;
  value: string;
  points: string;
  direction: "raises-risk" | "lowers-risk" | "neutral";
  detail: string;
};

type PrescriptionCard = {
  label: string;
  title: string;
  body: string;
  action: string;
};

type StrengthSignal = {
  points: number;
  labels: string[];
  detail: string;
};

type Chip = {
  label: string;
  kind: "mechanical" | "logical";
};

type AtomQuestion = {
  prompt: string;
  chips: Chip[];
};

type RoleContainer = {
  id: string;
  title: string;
  description: string;
  riskModifier: number;
  questions: AtomQuestion[];
};

type LearnedActivityMap = Record<string, string[]>;

type MarketAlert = {
  id: string;
  date: string;
  headline: string;
  company: string;
  country: string;
  functionArea: string;
  technology: string;
  industry: string;
  severity: "Watch" | "Urgent" | "Critical";
  whyItMatters: string;
  sourceName: string;
  sourceUrl: string;
};

type LiveMarketAlert = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  category: string;
  lane?: "personal" | "industry";
  url: string;
  query: string;
};

type ImprovementWindow = {
  label: string;
  score: number;
  gain: string;
  action: string;
};

const navItems: { id: View; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "assessment", label: "Check Score" },
  { id: "market", label: "Market Signals" },
  { id: "mission", label: "Mission" },
  { id: "plans", label: "Plans" },
  { id: "profile", label: "Profile" },
];

const countries = [
  { code: "IN", name: "India", currency: "INR", explorer: 299, navigator: 799, pioneer: 1499 },
  { code: "PH", name: "Philippines", currency: "PHP", explorer: 350, navigator: 950, pioneer: 1800 },
  { code: "MY", name: "Malaysia", currency: "MYR", explorer: 15, navigator: 38, pioneer: 72 },
  { code: "AE", name: "UAE", currency: "AED", explorer: 18, navigator: 52, pioneer: 88 },
  { code: "GB", name: "UK", currency: "GBP", explorer: 4, navigator: 12, pioneer: 20 },
  { code: "US", name: "USA", currency: "USD", explorer: 5, navigator: 14, pioneer: 24 },
  { code: "PL", name: "Poland", currency: "PLN", explorer: 19, navigator: 49, pioneer: 89 },
  { code: "MX", name: "Mexico", currency: "MXN", explorer: 89, navigator: 249, pioneer: 429 },
];

const segments: Record<Segment, { label: string; title: string; copy: string }> = {
  outsourcing: {
    label: "BPO / IT outsourcing",
    title: "Shared services and delivery roles",
    copy: "Finance ops, support, HR ops, LPO, analytics, and IT services.",
  },
  fresher: {
    label: "Fresher",
    title: "Graduates and first-job workers",
    copy: "Early roles where routine entry-level work is compressing quickly.",
  },
  manager: {
    label: "Manager",
    title: "Middle and senior management",
    copy: "P&L or people leaders exposed by coordination-heavy work.",
  },
  robotics: {
    label: "Robotics exposed",
    title: "Physical automation exposure",
    copy: "Operations, logistics, plant, warehouse, and field roles.",
  },
};

const roleQuestionContainers: Record<Segment, RoleContainer[]> = {
  outsourcing: [
    {
      id: "accounts-payable",
      title: "Accounts payable",
      description: "Invoice processing, vendor queries, payment controls, and finance operations.",
      riskModifier: 0.45,
      questions: [
        {
          prompt: "Which accounts payable work do you do most weeks?",
          chips: [
            { label: "Invoice matching", kind: "mechanical" },
            { label: "PO and GRN checks", kind: "mechanical" },
            { label: "Vendor query triage", kind: "mechanical" },
            { label: "Exception root-cause analysis", kind: "logical" },
          ],
        },
        {
          prompt: "Where do you personally add judgment?",
          chips: [
            { label: "Payment run preparation", kind: "mechanical" },
            { label: "Aging report updates", kind: "mechanical" },
            { label: "Control redesign", kind: "logical" },
            { label: "Audit-risk decisioning", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "voice-support",
      title: "Calling / voice support",
      description: "Inbound or outbound calls, scripts, CRM updates, retention, and escalations.",
      riskModifier: 0.5,
      questions: [
        {
          prompt: "What does a normal calling shift contain?",
          chips: [
            { label: "Scripted call handling", kind: "mechanical" },
            { label: "CRM notes and dispositions", kind: "mechanical" },
            { label: "Call wrap-up coding", kind: "mechanical" },
            { label: "Retention judgment", kind: "logical" },
          ],
        },
        {
          prompt: "Which calls still need human judgment from you?",
          chips: [
            { label: "Identity checks", kind: "mechanical" },
            { label: "Follow-up reminders", kind: "mechanical" },
            { label: "Escalation diagnosis", kind: "logical" },
            { label: "Emotion-sensitive negotiation", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "customer-service",
      title: "Customer service / chat",
      description: "Ticket queues, chat resolution, helpdesk workflows, and customer recovery.",
      riskModifier: 0.42,
      questions: [
        {
          prompt: "Which support atoms fill your queue?",
          chips: [
            { label: "FAQ response drafting", kind: "mechanical" },
            { label: "Ticket categorization", kind: "mechanical" },
            { label: "Refund status updates", kind: "mechanical" },
            { label: "Complaint pattern analysis", kind: "logical" },
          ],
        },
        {
          prompt: "What makes your customer work harder to replace?",
          chips: [
            { label: "Macro-based replies", kind: "mechanical" },
            { label: "SLA follow-ups", kind: "mechanical" },
            { label: "Customer recovery judgment", kind: "logical" },
            { label: "Policy exception calls", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "it-support",
      title: "IT support",
      description: "Access requests, troubleshooting, L1/L2 tickets, and service desk operations.",
      riskModifier: 0.34,
      questions: [
        {
          prompt: "Which IT support requests are most common?",
          chips: [
            { label: "Password resets", kind: "mechanical" },
            { label: "Access provisioning", kind: "mechanical" },
            { label: "Ticket routing", kind: "mechanical" },
            { label: "Incident diagnosis", kind: "logical" },
          ],
        },
        {
          prompt: "Where do you create reusable value?",
          chips: [
            { label: "Runbook execution", kind: "mechanical" },
            { label: "Status communication", kind: "mechanical" },
            { label: "Root-cause prevention", kind: "logical" },
            { label: "Automation design", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "python-developer",
      title: "Python developer",
      description: "Application code, scripts, automation, data pipelines, and production fixes.",
      riskModifier: 0.12,
      questions: [
        {
          prompt: "What kind of Python work takes most of your week?",
          chips: [
            { label: "Boilerplate code", kind: "mechanical" },
            { label: "Unit-test fixes", kind: "mechanical" },
            { label: "API wiring", kind: "mechanical" },
            { label: "Architecture tradeoffs", kind: "logical" },
          ],
        },
        {
          prompt: "Where are you accountable beyond code generation?",
          chips: [
            { label: "Code review cleanup", kind: "mechanical" },
            { label: "Documentation updates", kind: "mechanical" },
            { label: "Production debugging", kind: "logical" },
            { label: "Data-model judgment", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "project-manager",
      title: "Project manager",
      description: "Delivery governance, status rhythms, stakeholder alignment, and delivery risk.",
      riskModifier: 0.38,
      questions: [
        {
          prompt: "Which project management work repeats every week?",
          chips: [
            { label: "Status tracking", kind: "mechanical" },
            { label: "Roadmap minutes", kind: "mechanical" },
            { label: "Follow-up chasing", kind: "mechanical" },
            { label: "Delivery tradeoff calls", kind: "logical" },
          ],
        },
        {
          prompt: "Where do stakeholders depend on your judgment?",
          chips: [
            { label: "RAID log updates", kind: "mechanical" },
            { label: "Deck preparation", kind: "mechanical" },
            { label: "Customer prioritization", kind: "logical" },
            { label: "Outcome ownership", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "manual-testing",
      title: "Manual testing",
      description: "Regression execution, test evidence, defect logging, and release confidence.",
      riskModifier: 0.52,
      questions: [
        {
          prompt: "Which testing activities dominate your cycle?",
          chips: [
            { label: "Regression execution", kind: "mechanical" },
            { label: "Defect logging", kind: "mechanical" },
            { label: "Test evidence capture", kind: "mechanical" },
            { label: "Risk-based test design", kind: "logical" },
          ],
        },
        {
          prompt: "What would be missed if your test cases were automated?",
          chips: [
            { label: "Checklist runs", kind: "mechanical" },
            { label: "Re-test updates", kind: "mechanical" },
            { label: "Release risk judgment", kind: "logical" },
            { label: "User-impact reasoning", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "automated-testing",
      title: "Automated testing",
      description: "Test automation scripts, frameworks, CI reliability, and quality engineering.",
      riskModifier: 0.16,
      questions: [
        {
          prompt: "Which automation work is routine for you?",
          chips: [
            { label: "Script maintenance", kind: "mechanical" },
            { label: "Locator fixes", kind: "mechanical" },
            { label: "Report cleanup", kind: "mechanical" },
            { label: "Framework design", kind: "logical" },
          ],
        },
        {
          prompt: "Where do you improve system quality?",
          chips: [
            { label: "Pipeline reruns", kind: "mechanical" },
            { label: "Test data setup", kind: "mechanical" },
            { label: "Flaky test triage", kind: "logical" },
            { label: "Quality strategy", kind: "logical" },
          ],
        },
      ],
    },
  ],
  fresher: [
    {
      id: "commerce-fresher",
      title: "Commerce fresher",
      description: "Entry finance, MIS, reconciliations, audit support, and office operations.",
      riskModifier: 0.42,
      questions: [
        {
          prompt: "What kind of first-job work are you doing or targeting?",
          chips: [
            { label: "Data entry", kind: "mechanical" },
            { label: "Basic reconciliation", kind: "mechanical" },
            { label: "MIS formatting", kind: "mechanical" },
            { label: "Business variance explanation", kind: "logical" },
          ],
        },
        {
          prompt: "Where can you show judgment early?",
          chips: [
            { label: "Template reports", kind: "mechanical" },
            { label: "Document collection", kind: "mechanical" },
            { label: "Control observation", kind: "logical" },
            { label: "Cost-saving idea", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "engineering-fresher",
      title: "Engineering fresher",
      description: "Junior coding, QA, support engineering, and AI-assisted software work.",
      riskModifier: 0.24,
      questions: [
        {
          prompt: "Which engineering atoms are closest to your current work?",
          chips: [
            { label: "CRUD implementation", kind: "mechanical" },
            { label: "Bug ticket fixes", kind: "mechanical" },
            { label: "Basic documentation", kind: "mechanical" },
            { label: "System reasoning", kind: "logical" },
          ],
        },
        {
          prompt: "Where do you verify AI or senior output?",
          chips: [
            { label: "Syntax cleanup", kind: "mechanical" },
            { label: "Test case updates", kind: "mechanical" },
            { label: "AI output verification", kind: "logical" },
            { label: "Performance diagnosis", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "bca-mca-fresher",
      title: "BCA / MCA fresher",
      description: "Application support, web development, QA, databases, and automation entry roles.",
      riskModifier: 0.28,
      questions: [
        {
          prompt: "Which technical tasks are you strongest in today?",
          chips: [
            { label: "Simple web pages", kind: "mechanical" },
            { label: "SQL query edits", kind: "mechanical" },
            { label: "Support ticket fixes", kind: "mechanical" },
            { label: "Requirement interpretation", kind: "logical" },
          ],
        },
        {
          prompt: "What proof can you build faster than your peers?",
          chips: [
            { label: "Assignment completion", kind: "mechanical" },
            { label: "Tutorial replication", kind: "mechanical" },
            { label: "Working product demo", kind: "logical" },
            { label: "User problem framing", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "mba-fresher",
      title: "MBA fresher",
      description: "Analyst, sales, marketing, operations, product, and strategy entry roles.",
      riskModifier: 0.3,
      questions: [
        {
          prompt: "Which MBA entry work fills your week?",
          chips: [
            { label: "Market research compilation", kind: "mechanical" },
            { label: "Deck formatting", kind: "mechanical" },
            { label: "CRM updates", kind: "mechanical" },
            { label: "Go-to-market reasoning", kind: "logical" },
          ],
        },
        {
          prompt: "Where do you create business signal?",
          chips: [
            { label: "Meeting notes", kind: "mechanical" },
            { label: "Competitor tables", kind: "mechanical" },
            { label: "Customer insight synthesis", kind: "logical" },
            { label: "Revenue hypothesis", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "general-graduate",
      title: "General graduate",
      description: "Operations, admin, sales support, coordinator, and trainee roles.",
      riskModifier: 0.36,
      questions: [
        {
          prompt: "Which generalist atoms are closest to your work?",
          chips: [
            { label: "Email coordination", kind: "mechanical" },
            { label: "Record updates", kind: "mechanical" },
            { label: "Basic research", kind: "mechanical" },
            { label: "Problem framing", kind: "logical" },
          ],
        },
        {
          prompt: "Where can you become visibly useful?",
          chips: [
            { label: "Calendar follow-ups", kind: "mechanical" },
            { label: "Template creation", kind: "mechanical" },
            { label: "Process improvement", kind: "logical" },
            { label: "Ownership of a metric", kind: "logical" },
          ],
        },
      ],
    },
  ],
  manager: [
    {
      id: "delivery-manager",
      title: "Delivery manager",
      description: "Service delivery, SLAs, governance, client updates, escalations, and teams.",
      riskModifier: 0.42,
      questions: [
        {
          prompt: "Which delivery management work repeats most weeks?",
          chips: [
            { label: "Status meetings", kind: "mechanical" },
            { label: "Approval follow-ups", kind: "mechanical" },
            { label: "Dashboard consolidation", kind: "mechanical" },
            { label: "Client escalation calls", kind: "logical" },
          ],
        },
        {
          prompt: "What makes your layer hard to flatten?",
          chips: [
            { label: "Review decks", kind: "mechanical" },
            { label: "Capacity tracking", kind: "mechanical" },
            { label: "Commercial tradeoff call", kind: "logical" },
            { label: "Delivery strategy", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "pnl-manager",
      title: "P&L manager",
      description: "Revenue, margin, costs, forecasting, client economics, and business outcomes.",
      riskModifier: 0.16,
      questions: [
        {
          prompt: "How much of your role is true P&L judgment?",
          chips: [
            { label: "Forecast formatting", kind: "mechanical" },
            { label: "Variance deck updates", kind: "mechanical" },
            { label: "P&L judgment", kind: "logical" },
            { label: "Margin rescue decisions", kind: "logical" },
          ],
        },
        {
          prompt: "Where do you personally change outcomes?",
          chips: [
            { label: "Budget tracker updates", kind: "mechanical" },
            { label: "Invoice follow-ups", kind: "mechanical" },
            { label: "Pricing negotiation", kind: "logical" },
            { label: "Revenue expansion plan", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "people-manager",
      title: "People manager",
      description: "Hiring, performance, team rituals, conflict handling, coaching, and retention.",
      riskModifier: 0.28,
      questions: [
        {
          prompt: "Which people management atoms dominate your calendar?",
          chips: [
            { label: "One-on-one scheduling", kind: "mechanical" },
            { label: "Performance form updates", kind: "mechanical" },
            { label: "Attendance follow-ups", kind: "mechanical" },
            { label: "Coaching judgment", kind: "logical" },
          ],
        },
        {
          prompt: "What human problems do you resolve?",
          chips: [
            { label: "Policy reminders", kind: "mechanical" },
            { label: "Hiring tracker updates", kind: "mechanical" },
            { label: "Conflict resolution", kind: "logical" },
            { label: "Team design", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "finance-manager",
      title: "Finance manager",
      description: "FP&A, controls, monthly close, reviews, compliance, and financial decisions.",
      riskModifier: 0.24,
      questions: [
        {
          prompt: "Which finance management work is routine?",
          chips: [
            { label: "Close checklist reviews", kind: "mechanical" },
            { label: "Report consolidation", kind: "mechanical" },
            { label: "Approval routing", kind: "mechanical" },
            { label: "Control-risk judgment", kind: "logical" },
          ],
        },
        {
          prompt: "Where do leaders need your interpretation?",
          chips: [
            { label: "Ledger variance pulls", kind: "mechanical" },
            { label: "Compliance evidence", kind: "mechanical" },
            { label: "Forecast narrative", kind: "logical" },
            { label: "Capital allocation advice", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "product-program-manager",
      title: "Product / program manager",
      description: "Roadmaps, stakeholder tradeoffs, customer discovery, launches, and outcomes.",
      riskModifier: 0.18,
      questions: [
        {
          prompt: "Which product or program atoms repeat?",
          chips: [
            { label: "Roadmap minutes", kind: "mechanical" },
            { label: "Jira hygiene", kind: "mechanical" },
            { label: "Status broadcast", kind: "mechanical" },
            { label: "Customer prioritization", kind: "logical" },
          ],
        },
        {
          prompt: "Where do you make hard tradeoffs?",
          chips: [
            { label: "Launch checklist updates", kind: "mechanical" },
            { label: "Dependency follow-ups", kind: "mechanical" },
            { label: "Outcome ownership", kind: "logical" },
            { label: "Strategy narrative", kind: "logical" },
          ],
        },
      ],
    },
  ],
  robotics: [
    {
      id: "warehouse-logistics",
      title: "Warehouse / logistics",
      description: "Pick-pack, sorting, inventory movement, routing, and fulfilment operations.",
      riskModifier: 0.5,
      questions: [
        {
          prompt: "Which physical workflow repeats most?",
          chips: [
            { label: "Pick-pack movement", kind: "mechanical" },
            { label: "Barcode scanning", kind: "mechanical" },
            { label: "Inventory counting", kind: "mechanical" },
            { label: "Exception routing", kind: "logical" },
          ],
        },
        {
          prompt: "Where do you prevent operational loss?",
          chips: [
            { label: "Standard dispatch", kind: "mechanical" },
            { label: "Slotting updates", kind: "mechanical" },
            { label: "Safety judgment", kind: "logical" },
            { label: "Process redesign", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "plant-operator",
      title: "Plant operator",
      description: "Line operations, machine monitoring, safety, maintenance signals, and output.",
      riskModifier: 0.38,
      questions: [
        {
          prompt: "Which plant tasks happen on repeat?",
          chips: [
            { label: "Machine status scans", kind: "mechanical" },
            { label: "Routine parameter logging", kind: "mechanical" },
            { label: "Line checklist runs", kind: "mechanical" },
            { label: "Anomaly diagnosis", kind: "logical" },
          ],
        },
        {
          prompt: "Where is your experience hard to automate?",
          chips: [
            { label: "Daily output reports", kind: "mechanical" },
            { label: "Standard start-stop steps", kind: "mechanical" },
            { label: "Safety tradeoff judgment", kind: "logical" },
            { label: "Maintenance escalation call", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "quality-inspector",
      title: "Quality inspector",
      description: "Inspection, defect classification, compliance evidence, and quality decisions.",
      riskModifier: 0.46,
      questions: [
        {
          prompt: "Which quality inspection atoms are routine?",
          chips: [
            { label: "Routine inspection", kind: "mechanical" },
            { label: "Photo evidence capture", kind: "mechanical" },
            { label: "Measurement logging", kind: "mechanical" },
            { label: "Defect severity judgment", kind: "logical" },
          ],
        },
        {
          prompt: "Where do you find causes, not just defects?",
          chips: [
            { label: "Checklist compliance", kind: "mechanical" },
            { label: "Pass-fail tagging", kind: "mechanical" },
            { label: "Root-cause diagnosis", kind: "logical" },
            { label: "Supplier feedback", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "field-service",
      title: "Field service",
      description: "Site visits, equipment repair, customer issues, diagnostics, and safety.",
      riskModifier: 0.22,
      questions: [
        {
          prompt: "Which field tasks are predictable?",
          chips: [
            { label: "Visit logging", kind: "mechanical" },
            { label: "Standard part replacement", kind: "mechanical" },
            { label: "Service checklist", kind: "mechanical" },
            { label: "On-site diagnosis", kind: "logical" },
          ],
        },
        {
          prompt: "Where does human context matter?",
          chips: [
            { label: "Report upload", kind: "mechanical" },
            { label: "Travel coordination", kind: "mechanical" },
            { label: "Customer trust repair", kind: "logical" },
            { label: "Safety decision", kind: "logical" },
          ],
        },
      ],
    },
    {
      id: "dispatch-fleet",
      title: "Dispatch / fleet",
      description: "Fleet routing, load planning, driver coordination, exceptions, and service levels.",
      riskModifier: 0.4,
      questions: [
        {
          prompt: "Which dispatch atoms happen daily?",
          chips: [
            { label: "Route status updates", kind: "mechanical" },
            { label: "Driver follow-ups", kind: "mechanical" },
            { label: "ETA communication", kind: "mechanical" },
            { label: "Exception prioritization", kind: "logical" },
          ],
        },
        {
          prompt: "Where do you make costly calls?",
          chips: [
            { label: "Load board updates", kind: "mechanical" },
            { label: "Trip sheet checks", kind: "mechanical" },
            { label: "Service recovery judgment", kind: "logical" },
            { label: "Cost-risk tradeoff", kind: "logical" },
          ],
        },
      ],
    },
  ],
};

const plans = [
  {
    id: "free" as PlanId,
    name: "Free",
    description: "Career Safety Score and a basic mission preview.",
    features: ["5-minute assessment", "Basic score", "Private local backup"],
  },
  {
    id: "explorer" as PlanId,
    name: "Explorer",
    description: "Understand what is driving your risk.",
    features: ["Full score breakdown", "Career Safety Window", "Logic Quotient tracking"],
  },
  {
    id: "navigator" as PlanId,
    name: "Navigator",
    description: "Turn awareness into weekly action.",
    features: ["90-day mission", "Peer benchmarking", "Market signal tracking", "Financial guard"],
  },
  {
    id: "pioneer" as PlanId,
    name: "Pioneer",
    description: "Grow, move, and rebuild market value.",
    features: ["Career Translator", "Karma Move", "Interview prep", "Weekly check-in"],
  },
];

const llmValidators = [
  { name: "ChatGPT", strength: "Product reasoning, safety tone, UX clarity" },
  { name: "Gemini", strength: "Broad market context, regional phrasing, coverage gaps" },
  { name: "DeepSeek", strength: "Logic consistency, scoring structure, technical roles" },
  { name: "Claude", strength: "Sensitive wording, emotional safety, long-form critique" },
];

const crisisStats = [
  { value: "9.1/10", label: "AI risk signal: finance and accounting", source: "Mockup benchmark" },
  { value: "9.0/10", label: "AI risk signal: software development", source: "Mockup benchmark" },
  { value: "22M+", label: "Professionals in exposed India/PH service roles", source: "NASSCOM + IBPAP cited" },
  { value: "60%", label: "IT hiring decline signal", source: "FY2026 hiring watch" },
];

const marketForces = [
  {
    title: "Agentic AI handles workflows",
    body: "AI is moving from drafting and assistance into multi-step work: writing, checking, routing, summarising, and following up.",
    note: "Risk moves from task replacement to role compression.",
  },
  {
    title: "Cost-benefit flip",
    body: "When an AI agent costs less than entry-level monthly salary, routine work loses bargaining power fast.",
    note: "Entry roles need judgment proof earlier.",
  },
  {
    title: "Companies are compressing layers",
    body: "Hiring freezes, margin pressure, and AI-first operating models make coordination-heavy roles easier to flatten.",
    note: "A 1.0 job can become a 0.4 job.",
  },
  {
    title: "Contractor economy rising",
    body: "More companies keep a smaller full-time core and move routine work to contractors, freelancers, vendors, and AI systems.",
    note: "Permanence is no longer the default.",
  },
];

const scienceCards = [
  {
    title: "Income Safety Date",
    body: "The estimated month when your current role's value could fall below the cost of automation or replacement.",
    example: "Example: 7 months remaining",
  },
  {
    title: "Market Value Drift",
    body: "The silent monthly erosion in bargaining power when your week is dominated by mechanical work.",
    example: "Example: INR 15K-35K/month at risk",
  },
  {
    title: "Logic Quotient",
    body: "Your human-edge score: how much of your week depends on judgment, context, trust, tradeoffs, and ownership.",
    example: "Your moat against AI",
  },
];

const companyRiskSignals = [
  { company: "Finance operations", signal: "AP and reconciliation roles moving to automation-first delivery." },
  { company: "Documentation teams", signal: "Technical writing and knowledge-base maintenance becoming AI-assisted commodities." },
  { company: "Operations layers", signal: "AI-first restructuring compressing reporting, review, and coordination layers." },
];

const comparisonRows = [
  { old: "Generic job title score", karma: "Daily task atoms classified by the user" },
  { old: "One broad industry average", karma: "Personal safety window by role, country, and work pattern" },
  { old: "Static report", karma: "Score, mission plan, market signals, and privacy controls" },
];

const landingSteps = [
  { title: "Map the real work", body: "Choose your track, exact role, and the task atoms that fill your week." },
  { title: "Get your safety timeline", body: "See RAG rating, Income Safety Date, Logic Quotient, and Market Value Drift." },
  { title: "Act before the signal becomes personal", body: "Start a 90-day mission and share the wake-up call with someone you care about." },
];

const marketAlerts: MarketAlert[] = [
  {
    id: "cloudflare-ai-first",
    date: "May 7, 2026",
    headline: "Cloudflare to cut about 20% of workforce in AI-first restructuring.",
    company: "Cloudflare",
    country: "United States / Global",
    functionArea: "Engineering, HR, finance, marketing",
    technology: "Agentic AI",
    industry: "Technology infrastructure",
    severity: "Critical",
    whyItMatters:
      "Staff functions are being redesigned around AI operating models, not only engineering efficiency.",
    sourceName: "Reuters via WKZO",
    sourceUrl: "https://wkzo.com/2026/05/07/cloudflare-to-cut-20-jobs-quarterly-revenue-forecast-falls-short/",
  },
  {
    id: "meta-may-wave",
    date: "April 17, 2026",
    headline: "Meta targets May 20 for first layoff wave, with more cuts expected later in 2026.",
    company: "Meta",
    country: "United States / Global",
    functionArea: "Corporate, management, technology",
    technology: "Generative AI",
    industry: "Social platforms",
    severity: "Critical",
    whyItMatters:
      "Large platforms are using AI investment and operating efficiency to rethink layers, teams, and headcount.",
    sourceName: "Reuters via Investing.com",
    sourceUrl: "https://www.investing.com/news/stock-market-news/exclusivemeta-targets-may-20-for-first-wave-of-layoffs-additional-cuts-later-in-2026-4621507",
  },
  {
    id: "freshworks-coinbase",
    date: "May 2026",
    headline: "Freshworks and Coinbase announce reductions tied to AI-native operations.",
    company: "Freshworks / Coinbase",
    country: "India / United States / Global",
    functionArea: "Software, support, operations",
    technology: "AI coding and automation",
    industry: "SaaS and crypto",
    severity: "Urgent",
    whyItMatters:
      "Routine software, support, and operations work needs a personal risk view when reductions are connected to AI-native operations.",
    sourceName: "TechRadar",
    sourceUrl:
      "https://www.techradar.com/pro/freshworks-and-coinbase-announce-more-than-1-in-10-jobs-to-go-as-companies-replace-workforce-with-ai-technologies-tech-company-layoffs-near-100k-in-2026-alone",
  },
  {
    id: "multi-sector-list",
    date: "May 2026",
    headline: "Layoffs are spreading across tech, retail, finance, media, logistics, and consumer brands.",
    company: "Meta, Amazon, Citi, UPS, Target and others",
    country: "United States / Global",
    functionArea: "Managers, corporate, operations, support",
    technology: "Automation and AI efficiency",
    industry: "Multi-sector",
    severity: "Watch",
    whyItMatters:
      "Professionals often miss signals outside their employer. Karma turns the market into a habit.",
    sourceName: "Business Insider",
    sourceUrl: "https://www.businessinsider.com/recent-company-layoffs-laying-off-workers-2026",
  },
];

const defaultAssessment: AssessmentState = {
  nickname: "",
  country: "IN",
  companyName: "",
  segment: "manager",
  roleId: "delivery-manager",
  salaryBand: "middle",
  experienceYears: 12,
  tenureYears: 7,
  aiAdoption: "scaling",
  mechanicalAtoms: ["Status meetings", "Approval follow-ups", "Dashboard consolidation"],
  logicalAtoms: ["Client escalation calls", "Commercial tradeoff call"],
  personalStrengths: ["People leadership", "Client communication"],
  responseMap: {
    "manager-level": "middle",
    "role-predictability": "mixed",
  },
  fixedCommitmentPct: 55,
};

const steps = ["Track", "Profile", "AI Pressure", "Work Atoms", "Commitments"];
const scoreMethodVersion = "Karma Dynamic Score v0.4";
const otherRoleId = "other-role";
const personalStrengthOptions = [
  "English communication",
  "Regional language",
  "Foreign language",
  "AI tools",
  "Excel / Sheets",
  "Coding",
  "Data analysis",
  "Public speaking",
  "Sports discipline",
  "Team leadership",
  "Client communication",
  "Writing",
  "Design / creativity",
  "Teaching / mentoring",
];

function clamp(value: number, min = 1, max = 10) {
  return Math.max(min, Math.min(max, value));
}

function countryFor(code: string) {
  return countries.find((country) => country.code === code) ?? countries[0];
}

function rolesFor(segment: Segment) {
  return roleQuestionContainers[segment];
}

function roleFor(data: AssessmentState) {
  if (data.roleId === otherRoleId) {
    return {
      id: otherRoleId,
      title: data.responseMap["custom-role-title"] || "Other role",
      description: "A custom role path for work that does not fit the current categories.",
      riskModifier: 0.35,
      questions: [
        {
          prompt: "Which custom-role activities fill your week?",
          chips: customActivities(data).length
            ? customActivities(data)
            : [
                { label: "Routine coordination", kind: "mechanical" as const },
                { label: "Standard reporting", kind: "mechanical" as const },
                { label: "Exception handling", kind: "logical" as const },
                { label: "Stakeholder judgment", kind: "logical" as const },
              ],
        },
      ],
    };
  }
  return rolesFor(data.segment).find((role) => role.id === data.roleId) ?? rolesFor(data.segment)[0];
}

function normalizeAssessment(raw: Partial<AssessmentState>) {
  const merged = { ...defaultAssessment, ...raw };
  const validRole = merged.roleId === otherRoleId || rolesFor(merged.segment).some((role) => role.id === merged.roleId);
  return {
    ...merged,
    personalStrengths: raw.personalStrengths ?? defaultAssessment.personalStrengths,
    responseMap: { ...defaultAssessment.responseMap, ...(raw.responseMap ?? {}) },
    tenureYears: Math.min(merged.tenureYears, Math.max(merged.experienceYears, 0)),
    roleId: validRole ? merged.roleId : rolesFor(merged.segment)[0].id,
  };
}

function roleActivities(role: RoleContainer) {
  const seen = new Set<string>();
  return role.questions.flatMap((question) => question.chips).filter((chip) => {
    if (seen.has(chip.label)) return false;
    seen.add(chip.label);
    return true;
  });
}

function inferActivityKind(label: string): Chip["kind"] {
  const lower = label.toLowerCase();
  return /(decide|judgment|risk|client|customer|strategy|root|exception|design|own|negotiate|diagnos|control|improve)/.test(lower) ? "logical" : "mechanical";
}

function activityBucketId(segment: Segment, roleId: string, customRoleTitle?: string) {
  const custom = customRoleTitle?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${segment}:${roleId === otherRoleId && custom ? `${otherRoleId}:${custom}` : roleId}`;
}

function customActivityResponseKey(data: AssessmentState) {
  return `custom-activities:${activityBucketId(data.segment, data.roleId, data.responseMap["custom-role-title"])}`;
}

function customActivities(data: AssessmentState): Chip[] {
  return (data.responseMap[customActivityResponseKey(data)] || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((label) => ({ label, kind: inferActivityKind(label) }));
}

function learnedActivitiesFor(learnedActivities: LearnedActivityMap, data: AssessmentState): Chip[] {
  return (learnedActivities[activityBucketId(data.segment, data.roleId, data.responseMap["custom-role-title"])] ?? [])
    .map((label) => label.trim())
    .filter(Boolean)
    .map((label) => ({ label, kind: inferActivityKind(label) }));
}

function mergeActivityChips(...groups: Chip[][]) {
  const seen = new Set<string>();
  return groups.flat().filter((chip) => {
    const key = chip.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function segmentDefaults(segment: Segment) {
  const defaults: Record<Segment, Partial<AssessmentState>> = {
    outsourcing: {
      roleId: "accounts-payable",
      experienceYears: 4,
      tenureYears: 2,
      responseMap: { "work-model": "shared-services", "role-predictability": "high" },
    },
    fresher: {
      roleId: "commerce-fresher",
      experienceYears: 0,
      tenureYears: 0,
      salaryBand: "lower",
      responseMap: { "fresher-stage": "job-search", "fresher-exposure": "projects", "role-predictability": "mixed" },
    },
    manager: {
      roleId: "delivery-manager",
      experienceYears: 12,
      tenureYears: 7,
      responseMap: { "manager-level": "middle", "role-predictability": "mixed" },
    },
    robotics: {
      roleId: "warehouse-logistics",
      experienceYears: 5,
      tenureYears: 3,
      responseMap: { "automation-setting": "warehouse", "role-predictability": "high" },
    },
  };
  return defaults[segment];
}

function responseRisk(data: AssessmentState) {
  const map = data.responseMap;
  let risk = 0;
  if (map["fresher-stage"] === "student") risk += 0.15;
  if (map["fresher-stage"] === "job-search") risk += 0.35;
  if (map["fresher-exposure"] === "none") risk += 0.45;
  if (map["fresher-exposure"] === "internship") risk -= 0.12;
  if (map["fresher-exposure"] === "client-proof") risk -= 0.24;
  if (map["internship-depth"] === "none") risk += 0.28;
  if (map["internship-depth"] === "serious") risk -= 0.12;
  if (map["internship-depth"] === "ppo") risk -= 0.24;
  if (map["placement-support"] === "none" || map["placement-support"] === "off-campus") risk += 0.18;
  if (map["placement-support"] === "strong") risk -= 0.1;
  if (map["work-model"] === "voice-queue" || map["work-model"] === "transaction-factory") risk += 0.25;
  if (map["work-model"] === "client-embedded") risk -= 0.12;
  if (map["process-function"] === "ap" || map["process-function"] === "customer-service") risk += 0.08;
  if (map["manager-level"] === "coordination-heavy") risk += 0.36;
  if (map["manager-level"] === "pnl-owner") risk -= 0.2;
  if (map["decision-ownership"] === "relay") risk += 0.22;
  if (map["decision-ownership"] === "own") risk -= 0.22;
  if (map["automation-setting"] === "highly-automated") risk += 0.34;
  if (map["automation-setting"] === "human-critical") risk -= 0.18;
  if (map["role-predictability"] === "high") risk += 0.42;
  if (map["role-predictability"] === "low") risk -= 0.22;
  return risk;
}

function interpretTaskText(text: string) {
  const lower = text.toLowerCase();
  const mechanicalWords = [
    "routine",
    "repeat",
    "daily",
    "report",
    "reconcile",
    "ticket",
    "email",
    "spreadsheet",
    "update",
    "follow up",
    "checklist",
    "copy",
    "paste",
    "status",
    "dashboard",
    "script",
  ];
  const logicalWords = [
    "decide",
    "judgment",
    "client",
    "customer",
    "root cause",
    "exception",
    "strategy",
    "negotiate",
    "risk",
    "design",
    "prioritize",
    "own",
    "revenue",
    "diagnose",
    "tradeoff",
  ];
  const mechanical = mechanicalWords.filter((word) => lower.includes(word)).length;
  const logical = logicalWords.filter((word) => lower.includes(word)).length;
  return {
    mechanical,
    logical,
    risk: Math.min(0.7, mechanical * 0.12) - Math.min(0.45, logical * 0.1),
  };
}

function questionBankStats() {
  const roles = Object.values(roleQuestionContainers).flat();
  const questions = roles.flatMap((role) => role.questions);
  const chips = questions.flatMap((question) => question.chips);
  return {
    segments: Object.keys(roleQuestionContainers).length,
    roles: roles.length,
    questions: questions.length,
    atoms: chips.length,
  };
}

function buildValidationPacket() {
  return {
    product: "Karma",
    version: "question-bank-validation-v1",
    purpose:
      "Validate the role-specific assessment questions before launch. The user is often anxious about job loss, so questions must be sharp without being cruel.",
    validators: llmValidators,
    stats: questionBankStats(),
    nonNegotiables: [
      "Do not request exact salary, employer name, manager name, CV, or personally sensitive career history.",
      "Questions must create useful mechanical/logical task atoms for scoring.",
      "Questions must be role-specific, not generic motivational prompts.",
      "Tone should create urgency without fake panic or shame.",
      "Questions should work for India-first users and remain understandable internationally.",
      "Flag any phrasing that could feel legally risky, discriminatory, or emotionally triggering.",
    ],
    scoringRubric: [
      "Role specificity: 1-5",
      "Atom quality for scoring: 1-5",
      "Privacy safety: 1-5",
      "Emotional safety: 1-5",
      "Market realism: 1-5",
      "Conversion strength: 1-5",
    ],
    requestedOutput:
      "Return JSON with overallScore, topRisks, missingRoles, weakQuestions, rewriteSuggestions, and launchVerdict. Keep rewrites concise.",
    questionBank: roleQuestionContainers,
  };
}

function buildValidationPrompt() {
  return `You are validating the first launch question bank for Karma, a privacy-first Career Safety Score app for people worried about AI, automation, outsourcing, layoffs, and middle-management flattening.

Review the attached JSON question bank as a launch-readiness expert. Be strict.

Evaluate every role container against:
1. Role specificity
2. Whether answers create useful mechanical/logical task atoms
3. Privacy safety
4. Emotional safety for a distressed employee
5. Market realism
6. Conversion strength

Do not add questions asking for exact salary, employer name, manager name, CV, age, or highly sensitive personal history.

Return only JSON:
{
  "overallScore": 0-100,
  "launchVerdict": "ship" | "ship_after_minor_edits" | "do_not_ship",
  "topRisks": ["..."],
  "missingRoles": ["..."],
  "weakQuestions": [
    {
      "segment": "...",
      "roleId": "...",
      "question": "...",
      "problem": "...",
      "rewrite": "..."
    }
  ],
  "bestQuestions": ["..."],
  "roleAdditions": [
    {
      "segment": "...",
      "roleTitle": "...",
      "questions": [
        {
          "prompt": "...",
          "chips": [
            { "label": "...", "kind": "mechanical" },
            { "label": "...", "kind": "logical" }
          ]
        }
      ]
    }
  ]
}`;
}

function titleCase(value: string) {
  return value
    .split("-")
    .join(" ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function monthYearFromNow(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatSourceDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date from source";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function marketPulseUrl(data: AssessmentState) {
  const params = new URLSearchParams({
    segment: data.segment,
    role: roleFor(data).title,
  });
  if (data.companyName.trim()) params.set("company", data.companyName.trim());
  return `/api/market-pulse?${params.toString()}`;
}

function sourceFeedPressure(alerts: LiveMarketAlert[]) {
  const riskWords = [
    "ai",
    "automation",
    "layoff",
    "layoffs",
    "hiring freeze",
    "restructuring",
    "job cuts",
    "cut jobs",
    "replace",
    "workforce",
    "flattening",
  ];
  const pressure = alerts.reduce((total, item) => {
    const title = item.title.toLowerCase();
    const hits = riskWords.filter((word) => title.includes(word)).length;
    if (!hits) return total;
    return total + Math.min(0.16, hits * 0.035) * (item.lane === "personal" ? 1.45 : 1);
  }, 0);
  return {
    level: Number(Math.min(1.2, pressure).toFixed(2)),
    riskAdjustment: Math.min(0.85, pressure),
    windowDrag: Math.round(Math.min(4, pressure * 3)),
  };
}

function formatRiskPoints(value: number) {
  const rounded = Number(value.toFixed(2));
  if (rounded > 0) return `+${rounded}`;
  return `${rounded}`;
}

function directionFor(value: number): ScoreParameter["direction"] {
  if (value > 0.03) return "raises-risk";
  if (value < -0.03) return "lowers-risk";
  return "neutral";
}

function scoreParameter(label: string, value: string, contribution: number, detail: string): ScoreParameter {
  return {
    label,
    value,
    points: formatRiskPoints(contribution),
    direction: directionFor(contribution),
    detail,
  };
}

function strengthSignal(data: AssessmentState): StrengthSignal {
  const selected = new Set(data.personalStrengths);
  let points = 0;
  if (selected.has("AI tools")) points -= 0.28;
  if (selected.has("English communication")) points -= 0.16;
  if (selected.has("Regional language")) points -= 0.08;
  if (selected.has("Foreign language")) points -= 0.18;
  if (selected.has("Excel / Sheets")) points -= 0.1;
  if (selected.has("Coding")) points -= 0.16;
  if (selected.has("Data analysis")) points -= 0.18;
  if (selected.has("Public speaking")) points -= 0.12;
  if (selected.has("Sports discipline")) points -= 0.1;
  if (selected.has("Team leadership")) points -= 0.14;
  if (selected.has("Client communication")) points -= 0.16;
  if (selected.has("Writing")) points -= 0.08;
  if (selected.has("Design / creativity")) points -= 0.1;
  if (selected.has("Teaching / mentoring")) points -= 0.12;
  if ((data.responseMap["other-strengths"] ?? "").trim()) points -= 0.08;
  points = Math.max(-0.95, points);
  const labels = [...selected];
  if ((data.responseMap["other-strengths"] ?? "").trim()) labels.push(data.responseMap["other-strengths"].trim());
  return {
    points,
    labels,
    detail: selected.size
      ? "Personal strengths create alternate ways to prove value beyond routine tasks."
      : "No additional strengths captured yet, so Karma cannot give resilience credit here.",
  };
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function scoreFingerprintFor(data: AssessmentState, alerts: LiveMarketAlert[], market: ReturnType<typeof sourceFeedPressure>) {
  const payload = {
    version: scoreMethodVersion,
    country: data.country,
    segment: data.segment,
    roleId: data.roleId,
    customRole: data.responseMap["custom-role-title"] ?? "",
    salaryBand: data.salaryBand,
    experienceYears: data.experienceYears,
    tenureYears: data.tenureYears,
    aiAdoption: data.aiAdoption,
    mechanicalAtoms: [...data.mechanicalAtoms].sort(),
    logicalAtoms: [...data.logicalAtoms].sort(),
    personalStrengths: [...data.personalStrengths].sort(),
    responseMap: Object.keys(data.responseMap).sort().reduce<Record<string, string>>((memo, key) => {
      memo[key] = data.responseMap[key];
      return memo;
    }, {}),
    fixedCommitmentPct: data.fixedCommitmentPct,
    market,
    marketItems: alerts.map((alert) => `${alert.category}:${alert.source}:${alert.title}`).sort().slice(0, 20),
  };
  return stableHash(JSON.stringify(payload));
}

function calculateScore(data: AssessmentState, alerts: LiveMarketAlert[] = []): Score {
  const role = roleFor(data);
  const market = sourceFeedPressure(alerts);
  const segmentWeight: Record<Segment, number> = { outsourcing: 4.6, fresher: 3.6, manager: 4.2, robotics: 4.5 };
  const adoptionWeight: Record<Adoption, number> = { none: 1.4, pilot: 2.4, scaling: 3.7, replacing: 5 };
  const textSignal = interpretTaskText(data.responseMap["role-open-task"] ?? "");
  const atomTotal = data.mechanicalAtoms.length + data.logicalAtoms.length + textSignal.mechanical + textSignal.logical;
  const atomRatio = atomTotal ? (data.mechanicalAtoms.length + textSignal.mechanical) / atomTotal : 0.55;
  const salaryDrag = data.salaryBand === "higher" ? 0.25 : data.salaryBand === "lower" ? -0.1 : 0;
  const experienceLift = data.experienceYears < 3 ? 0.55 : data.experienceYears > 12 ? -0.15 : 0;
  const tenureDrag = data.tenureYears > 10 ? 0.55 : data.tenureYears > 6 ? 0.25 : 0;
  const answerDrag = responseRisk(data) + textSignal.risk;
  const strengths = strengthSignal(data);
  const baseRiskPoints = ((segmentWeight[data.segment] + adoptionWeight[data.aiAdoption]) / 2) * 1.72;
  const taskMixPoints = (atomRatio - 0.55) * 2.3;
  const rawRiskPoints =
    baseRiskPoints +
    taskMixPoints +
    salaryDrag +
    tenureDrag +
    experienceLift +
    role.riskModifier +
    answerDrag +
    strengths.points +
    market.riskAdjustment;
  const riskScore = Number(
    clamp(
      rawRiskPoints,
    ).toFixed(1),
  );
  const logicQuotient = Number(clamp(11 - riskScore + (data.logicalAtoms.length + textSignal.logical) * 0.28).toFixed(1));
  const baseWindow: Record<Adoption, number> = { none: 28, pilot: 20, scaling: 13, replacing: 7 };
  const commitmentDrag = data.fixedCommitmentPct >= 70 ? 0.68 : data.fixedCommitmentPct <= 30 ? 1.25 : 1;
  const careerSafetyWindow = Math.max(3, Math.round(baseWindow[data.aiAdoption] * commitmentDrag - tenureDrag * 2 - market.windowDrag));
  const safetyScore = Number(
    clamp(11 - riskScore * 0.64 - (careerSafetyWindow < 12 ? 1.25 : 0) - (data.fixedCommitmentPct > 65 ? 0.75 : 0) - market.level * 0.22).toFixed(1),
  );
  const rag: Rag = safetyScore >= 6.5 ? "GREEN" : safetyScore >= 3.5 ? "AMBER" : "RED";
  const driftBase = data.salaryBand === "higher" ? 92000 : data.salaryBand === "middle" ? 42000 : 18000;
  const percentile = Math.round(clamp(atomRatio * 100 + (data.segment === "manager" ? 18 : 8) + role.riskModifier * 12, 18, 96));
  const parameters = [
    scoreParameter("Work category and AI pressure", `${segments[data.segment].label} / ${titleCase(data.aiAdoption)}`, baseRiskPoints, "Base risk is set by the category and how visible AI adoption is around the role."),
    scoreParameter("Task mix", `${Math.round(atomRatio * 100)}% routine/mechanical`, taskMixPoints, "More repeatable work raises risk. More judgment work lowers risk."),
    scoreParameter("Role type", role.title, role.riskModifier, "Each role has a fixed role-risk adjustment based on how automatable the typical work is."),
    scoreParameter("Experience stage", `${data.experienceYears} years`, experienceLift, "Very early careers need proof faster. Deep experience can reduce risk when it carries judgment."),
    scoreParameter("Current company tenure", `${data.tenureYears} years`, tenureDrag, "Long tenure in one environment can raise risk if the market has moved faster outside."),
    scoreParameter("Salary band", titleCase(data.salaryBand), salaryDrag, "Higher salary bands can face more scrutiny in restructuring; lower bands carry slightly less cost pressure."),
    scoreParameter("Personal strengths", strengths.labels.length ? strengths.labels.join(", ") : "Not captured", strengths.points, strengths.detail),
    scoreParameter("Answers and open-text signals", `${formatRiskPoints(answerDrag)} answer points`, answerDrag, "Dropdown answers and the private task description are translated into risk signals locally."),
    scoreParameter("Live market pressure", `${market.level}/1.2`, market.riskAdjustment, "Google News source signals can move the score when the market around the user changes."),
    scoreParameter("Money pressure", `${data.fixedCommitmentPct}% committed`, data.fixedCommitmentPct > 65 ? 0.75 : data.fixedCommitmentPct <= 30 ? -0.15 : 0, "Money pressure does not mean job risk, but it reduces the safety margin and urgency window."),
  ];
  return {
    safetyScore,
    riskScore,
    logicQuotient,
    careerSafetyWindow,
    safetyDate: monthYearFromNow(careerSafetyWindow),
    rag,
    atomRatio: Math.round(atomRatio * 100),
    marketValueDrift: `${countryFor(data.country).currency} ${Math.round(driftBase * (riskScore / 8)).toLocaleString("en-US")}/mo`,
    percentile,
    marketPressure: market.level,
    scoreVersion: scoreMethodVersion,
    scoreFingerprint: scoreFingerprintFor(data, alerts, market),
    rawRiskPoints: Number(rawRiskPoints.toFixed(2)),
    parameters,
  };
}

function scoreImprovementWindows(score: Score, data: AssessmentState, alerts: LiveMarketAlert[]): ImprovementWindow[] {
  const market = sourceFeedPressure(alerts);
  const mechanicalOpportunity = score.atomRatio >= 70 ? 0.35 : score.atomRatio >= 55 ? 0.24 : 0.14;
  const pressureBonus = Math.min(0.18, market.level * 0.12);
  const commitmentBonus = data.fixedCommitmentPct >= 70 ? 0.08 : 0;
  const windows = [
    {
      label: "Weekly",
      gain: mechanicalOpportunity + pressureBonus,
      action: "Convert one recurring mechanical atom into an AI-assisted workflow and add one proof note.",
    },
    {
      label: "Monthly",
      gain: mechanicalOpportunity * 2.4 + pressureBonus + commitmentBonus,
      action: "Shift two routine tasks toward exception handling, client judgment, or measurable ownership.",
    },
    {
      label: "Quarterly",
      gain: mechanicalOpportunity * 4.2 + pressureBonus * 2 + commitmentBonus,
      action: "Build a visible proof artifact: savings, revenue, risk reduction, automation design, or customer recovery.",
    },
  ];

  return windows.map((item) => {
    const projected = Number(clamp(score.safetyScore + item.gain).toFixed(1));
    return {
      label: item.label,
      score: projected,
      gain: `+${Math.max(0, Number((projected - score.safetyScore).toFixed(1))).toFixed(1)}`,
      action: item.action,
    };
  });
}

function priceFor(plan: PlanId, countryCode: string) {
  const country = countryFor(countryCode);
  if (plan === "free") return `${country.currency} 0`;
  return `${country.currency} ${country[plan].toLocaleString("en-US")}`;
}

function ragCopy(rag: Rag) {
  if (rag === "RED") {
    return {
      title: "Immediate intent required.",
      body: "Your career safety score requires immediate intent. You have time to act, but not time to ignore the signals. Start by reducing mechanical work and creating visible proof of judgment.",
    };
  }
  if (rag === "AMBER") {
    return {
      title: "You are in the transition zone.",
      body: "Your role is not unsafe by default, but your current footprint needs strengthening. A focused 90-day plan can move you toward more resilient work.",
    };
  }
  return {
    title: "Your career footprint is resilient.",
    body: "Your career footprint is highly resilient. Keep monitoring the market, keep your judgment visible, and avoid becoming complacent.",
  };
}

function moveCopyForSegment(segment: Segment) {
  const copy: Record<Segment, { label: string; title: string; body: string; cta: string }> = {
    fresher: {
      label: "Highly relevant for freshers",
      title: "KARMA Move helps you find your first strong role.",
      body: "For freshers, the hardest part is knowing which openings are worth applying to. Move filters jobs, scores fit, and helps prepare applications without technical setup.",
      cta: "Open First-Job Search",
    },
    manager: {
      label: "Highly relevant for managers",
      title: "KARMA Move helps managers build market optionality.",
      body: "For mid and senior managers, Move is most useful for testing the external market, filtering weak roles, and preparing stronger transition stories.",
      cta: "Open Manager Job Search",
    },
    outsourcing: {
      label: "Available for BPO and outsourcing",
      title: "KARMA Move can help you compare safer roles.",
      body: "For outsourcing roles, Move helps you find openings where judgment, controls, customer handling, and domain skill matter more than repetitive task execution.",
      cta: "Open KARMA Move",
    },
    robotics: {
      label: "Available for robotics-exposed work",
      title: "KARMA Move can help you move toward safer operations roles.",
      body: "For physical automation exposure, Move helps you compare roles where safety judgment, process ownership, supervision, and troubleshooting are still valued.",
      cta: "Open KARMA Move",
    },
  };
  return copy[segment];
}

function prescriptionFor(data: AssessmentState, score: Score): PrescriptionCard[] {
  const role = roleFor(data);
  const strengths = data.personalStrengths.length ? data.personalStrengths.slice(0, 3).join(", ") : "your strongest transferable skills";
  const sharedCheck = score.rag === "RED" ? "Check your score again in 7 days." : score.rag === "AMBER" ? "Check your score again in 30 days." : "Check your score monthly.";
  const prescriptions: Record<Segment, PrescriptionCard[]> = {
    fresher: [
      {
        label: "Stop",
        title: "Stop applying everywhere.",
        body: "Random applications waste energy. Focus on roles that match your stream, city, projects, internships, and first-job proof.",
        action: "Remove weak-fit openings from your list.",
      },
      {
        label: "Automate",
        title: "Use AI to improve your proof.",
        body: "Use AI to review your resume, explain your project clearly, and practice interview answers. Do not use it to fake experience.",
        action: "Rewrite one project into a proof story.",
      },
      {
        label: "Build Proof",
        title: "Build visible proof, not just certificates.",
        body: `Create one small project, internship case note, dashboard, analysis, or demo that uses ${strengths} as proof.`,
        action: "Create two proof artifacts in 30 days.",
      },
      {
        label: "Move",
        title: "Find first roles that fit your proof.",
        body: "Use KARMA Move to compare openings and avoid jobs that are either too generic or too far from your current proof.",
        action: "Open First-Job Search.",
      },
      {
        label: "Check Again",
        title: "Track your readiness score.",
        body: "Your score should change as you add internships, proof, projects, and better role targets.",
        action: sharedCheck,
      },
    ],
    outsourcing: [
      {
        label: "Stop",
        title: "Stop staying invisible in transaction work.",
        body: "If your value is only volume, speed, or queue clearance, AI and workflow tools can compress that work quickly.",
        action: "Pick one routine task to move away from.",
      },
      {
        label: "Automate",
        title: "Automate one repeatable process.",
        body: "Use AI or workflow tools to reduce manual reporting, reconciliation, ticket triage, or follow-up effort.",
        action: "Build one AI-assisted workflow.",
      },
      {
        label: "Build Proof",
        title: "Show control, exception, or savings impact.",
        body: `Write proof around error reduction, turnaround time, audit quality, or process improvement, using ${strengths} where relevant.`,
        action: "Create one measurable proof note.",
      },
      {
        label: "Move",
        title: "Move toward judgment-heavy roles.",
        body: `For ${role.title.toLowerCase()}, safer paths usually involve exception handling, controls, client judgment, domain tools, or process ownership.`,
        action: "Open KARMA Move.",
      },
      {
        label: "Check Again",
        title: "Track whether your task mix improves.",
        body: "Your goal is to reduce routine atoms and increase judgment atoms over time.",
        action: sharedCheck,
      },
    ],
    manager: [
      {
        label: "Stop",
        title: "Stop being only the coordination layer.",
        body: "Meetings, follow-ups, approvals, and dashboards are easier to flatten than commercial, people, risk, or transformation ownership.",
        action: "Identify one coordination task to delegate or automate.",
      },
      {
        label: "Automate",
        title: "Compress reporting and status work.",
        body: "Use AI to prepare summaries, meeting notes, risk logs, and dashboards so your time moves toward decisions.",
        action: "Automate one weekly reporting rhythm.",
      },
      {
        label: "Build Proof",
        title: "Build leadership proof.",
        body: `Create evidence of margin improvement, delivery rescue, risk reduction, or transformation outcomes. Anchor the story in ${strengths}.`,
        action: "Write one executive proof story.",
      },
      {
        label: "Move",
        title: "Build market optionality before pressure arrives.",
        body: "Use KARMA Move to test demand for your leadership story and identify roles that value ownership over coordination.",
        action: "Open Manager Job Search.",
      },
      {
        label: "Check Again",
        title: "Monitor role compression risk.",
        body: "Your score should improve as your proof shifts from coordination to outcomes.",
        action: sharedCheck,
      },
    ],
    robotics: [
      {
        label: "Stop",
        title: "Stop being only manual execution.",
        body: "Routine movement, scanning, inspection, and machine operation are more exposed as automation enters the workplace.",
        action: "Identify one task that machines or software can absorb.",
      },
      {
        label: "Automate",
        title: "Learn the systems around automation.",
        body: "Move closer to dashboards, WMS, sensors, safety checks, troubleshooting, maintenance coordination, or process control.",
        action: "Learn one adjacent system or tool.",
      },
      {
        label: "Build Proof",
        title: "Show safety, uptime, or exception handling.",
        body: `Proof of fewer incidents, faster recovery, better quality, or process improvement is stronger when it uses ${strengths}.`,
        action: "Create one operations impact note.",
      },
      {
        label: "Move",
        title: "Move toward supervision and troubleshooting.",
        body: "Use KARMA Move to find roles where human judgment, safety, process ownership, and escalation handling still matter.",
        action: "Open KARMA Move.",
      },
      {
        label: "Check Again",
        title: "Track automation-adjacent progress.",
        body: "Your score should improve as your work moves closer to judgment, systems, and process ownership.",
        action: sharedCheck,
      },
    ],
  };
  return prescriptions[data.segment];
}

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [assessment, setAssessment] = useState<AssessmentState>(defaultAssessment);
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<PlanId>("free");
  const [marketFilter, setMarketFilter] = useState("All");
  const [liveMarketAlerts, setLiveMarketAlerts] = useState<LiveMarketAlert[]>([]);
  const [marketPulseStatus, setMarketPulseStatus] = useState<"loading" | "live" | "offline">("loading");
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [learnedActivities, setLearnedActivities] = useState<LearnedActivityMap>({});
  const score = useMemo(() => calculateScore(assessment, liveMarketAlerts), [assessment, liveMarketAlerts]);

  useEffect(() => {
    const saved = window.localStorage.getItem("karma:assessment");
    const savedPlan = window.localStorage.getItem("karma:plan") as PlanId | null;
    const savedCompletion = window.localStorage.getItem("karma:assessment-complete");
    const savedLearnedActivities = window.localStorage.getItem("karma:learned-activities");
    if (saved) {
      try {
        setAssessment(normalizeAssessment(JSON.parse(saved)));
      } catch {
        setAssessment(defaultAssessment);
      }
    }
    if (savedPlan) setPlan(savedPlan);
    if (savedCompletion === "true") setHasCompletedAssessment(true);
    if (savedLearnedActivities) {
      try {
        setLearnedActivities(JSON.parse(savedLearnedActivities));
      } catch {
        setLearnedActivities({});
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("karma:assessment", JSON.stringify(assessment));
  }, [assessment]);

  useEffect(() => {
    window.localStorage.setItem("karma:plan", plan);
  }, [plan]);

  useEffect(() => {
    window.localStorage.setItem("karma:assessment-complete", String(hasCompletedAssessment));
  }, [hasCompletedAssessment]);

  useEffect(() => {
    let active = true;
    async function loadMarketPulse() {
      try {
        const response = await fetch(marketPulseUrl(assessment), { cache: "no-store" });
        const payload = (await response.json()) as { items?: LiveMarketAlert[] };
        if (!active) return;
        setLiveMarketAlerts(payload.items ?? []);
        setMarketPulseStatus(response.ok && payload.items?.length ? "live" : "offline");
      } catch {
        if (!active) return;
        setLiveMarketAlerts([]);
        setMarketPulseStatus("offline");
      }
    }

    loadMarketPulse();
    const interval = window.setInterval(loadMarketPulse, 15 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [assessment.companyName, assessment.segment, assessment.roleId]);

  function update<K extends keyof AssessmentState>(key: K, value: AssessmentState[K]) {
    setAssessment((current) => ({ ...current, [key]: value }));
  }

  function selectSegment(segment: Segment) {
    const defaults = segmentDefaults(segment);
    setAssessment((current) => ({
      ...current,
      segment,
      ...defaults,
      roleId: defaults.roleId ?? rolesFor(segment)[0].id,
      responseMap: defaults.responseMap ?? {},
      mechanicalAtoms: [],
      logicalAtoms: [],
      personalStrengths: current.personalStrengths,
    }));
  }

  function selectRole(roleId: string) {
    setAssessment((current) => ({
      ...current,
      roleId,
      responseMap: {
        ...current.responseMap,
        "role-open-task": "",
        ...(roleId === otherRoleId ? { "custom-role-title": current.responseMap["custom-role-title"] || "" } : {}),
      },
      mechanicalAtoms: [],
      logicalAtoms: [],
      personalStrengths: current.personalStrengths,
    }));
  }

  function updateResponse(id: string, value: string) {
    setAssessment((current) => ({ ...current, responseMap: { ...current.responseMap, [id]: value } }));
  }

  function addCustomActivity(label: string) {
    const clean = label.trim();
    if (!clean) return;
    const chip = { label: clean, kind: inferActivityKind(clean) };
    setAssessment((current) => {
      const responseKey = customActivityResponseKey(current);
      const bucketKey = activityBucketId(current.segment, current.roleId, current.responseMap["custom-role-title"]);
      const existing = new Set((current.responseMap[responseKey] || "").split("|").filter(Boolean));
      existing.add(clean);
      setLearnedActivities((currentLearned) => {
        const learnedSet = new Set([...(currentLearned[bucketKey] ?? []), clean]);
        const nextLearned = { ...currentLearned, [bucketKey]: [...learnedSet] };
        window.localStorage.setItem("karma:learned-activities", JSON.stringify(nextLearned));
        return nextLearned;
      });
      const key = chip.kind === "mechanical" ? "mechanicalAtoms" : "logicalAtoms";
      return {
        ...current,
        responseMap: { ...current.responseMap, [responseKey]: [...existing].join("|") },
        [key]: current[key].includes(clean) ? current[key] : [...current[key], clean],
      };
    });
  }

  function toggleChip(chip: Chip) {
    const key = chip.kind === "mechanical" ? "mechanicalAtoms" : "logicalAtoms";
    setAssessment((current) => {
      const exists = current[key].includes(chip.label);
      return {
        ...current,
        [key]: exists ? current[key].filter((item) => item !== chip.label) : [...current[key], chip.label],
      };
    });
  }

  function toggleStrength(label: string) {
    setAssessment((current) => {
      const exists = current.personalStrengths.includes(label);
      return {
        ...current,
        personalStrengths: exists ? current.personalStrengths.filter((item) => item !== label) : [...current.personalStrengths, label],
      };
    });
  }

  function exportBackup() {
    const payload = {
      version: "karma-backup-v1",
      exportedAt: new Date().toISOString(),
      assessment,
      plan,
      score,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "karma-backup.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function purgeFootprint() {
    window.localStorage.clear();
    window.sessionStorage.clear();
    if (typeof indexedDB !== "undefined" && indexedDB.databases) {
      const databases = await indexedDB.databases();
      await Promise.all(databases.map((database) => database.name && indexedDB.deleteDatabase(database.name)));
    }
    setAssessment(defaultAssessment);
    setPlan("free");
    setHasCompletedAssessment(false);
    setStep(0);
    setView("home");
  }

  function completeAssessment() {
    setHasCompletedAssessment(true);
    setView("results");
  }

  return (
    <main className="karma-shell">
      <TopNav view={view} setView={setView} />
      <section className="app-workspace">
        {view === "home" && (
          <HomeLanding
            setView={setView}
            score={score}
            assessment={assessment}
            hasCompletedAssessment={hasCompletedAssessment}
            liveAlerts={liveMarketAlerts}
            marketPulseStatus={marketPulseStatus}
          />
        )}
        {view === "assessment" && (
          <AssessmentWizard
            assessment={assessment}
            update={update}
            updateResponse={updateResponse}
            addCustomActivity={addCustomActivity}
            learnedActivities={learnedActivities}
            selectSegment={selectSegment}
            selectRole={selectRole}
            step={step}
            setStep={setStep}
            toggleChip={toggleChip}
            toggleStrength={toggleStrength}
            completeAssessment={completeAssessment}
          />
        )}
        {view === "results" && <Results assessment={assessment} score={score} liveAlerts={liveMarketAlerts} setView={setView} />}
        {view === "market" && (
          <MarketSignals
            filter={marketFilter}
            setFilter={setMarketFilter}
            setView={setView}
            liveAlerts={liveMarketAlerts}
            marketPulseStatus={marketPulseStatus}
          />
        )}
        {view === "mission" && <Mission assessment={assessment} score={score} setView={setView} />}
        {view === "plans" && <Plans assessment={assessment} plan={plan} setPlan={setPlan} />}
        {view === "profile" && (
          <Profile assessment={assessment} score={score} update={update} exportBackup={exportBackup} purgeFootprint={purgeFootprint} setView={setView} />
        )}
      </section>
    </main>
  );
}

function TopNav({ view, setView }: { view: View; setView: (view: View) => void }) {
  return (
    <header className="top-nav">
      <button className="brand-lockup" onClick={() => setView("home")} aria-label="Karma home">
        <Logo />
        <span>
          <strong>Karma</strong>
          <small>Career safety intelligence</small>
        </span>
      </button>
      <nav aria-label="Primary navigation">
        {navItems.map((item) => (
          <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>
            {item.label}
          </button>
        ))}
        <button onClick={() => { window.location.href = "/move"; }}>
          KARMA Move
        </button>
      </nav>
      <button className="nav-cta" onClick={() => setView("assessment")}>
        Start Free
      </button>
    </header>
  );
}

function Logo() {
  return (
    <svg className="karma-logo" viewBox="0 0 44 44" role="img" aria-label="Karma logo">
      <circle cx="22" cy="22" r="16" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M12 25c7.5 6.4 18.6 5.8 24-4.8" fill="none" stroke="var(--teal-700)" strokeLinecap="round" strokeWidth="4" />
    </svg>
  );
}

function HomeLanding({
  setView,
  score,
  assessment,
  hasCompletedAssessment,
  liveAlerts,
  marketPulseStatus,
}: {
  setView: (view: View) => void;
  score: Score;
  assessment: AssessmentState;
  hasCompletedAssessment: boolean;
  liveAlerts: LiveMarketAlert[];
  marketPulseStatus: "loading" | "live" | "offline";
}) {
  const topAlert = liveAlerts[0];

  if (hasCompletedAssessment) {
    return (
      <PersonalizedHome
        assessment={assessment}
        score={score}
        setView={setView}
        liveAlerts={liveAlerts}
        marketPulseStatus={marketPulseStatus}
      />
    );
  }

  return (
    <div className="landing-page">
      <button className="market-ticker" onClick={() => setView("market")}>
        <span>{marketPulseStatus === "live" ? "Google News live pulse" : "Google News pulse"}</span>
        <strong>{topAlert ? `"${topAlert.title}"` : "Fetching source headlines from Google News..."}</strong>
        <em>{topAlert ? `Source: ${topAlert.source}` : marketPulseStatus === "offline" ? "Live feed unavailable" : "Loading"}</em>
      </button>

      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">AI career risk intelligence</p>
          <h1>How long is your income really safe?</h1>
          <p>
            AI is the underlying career risk. Karma analyses your actual daily tasks, not generic job titles, to estimate
            how exposed your role is to automation, role compression, and cheaper AI-first operating models.
          </p>
          <p className="hero-subcopy">Your risk is unique. Your score should be too.</p>
          <div className="hero-actions">
            <button className="primary-btn large" onClick={() => setView("assessment")}>
              Find My Date
            </button>
            <button className="secondary-btn large" onClick={() => setView("profile")}>
              How Karma protects my data
            </button>
          </div>
          <div className="trust-strip">
            <span>Free</span>
            <span>No credit card</span>
            <span>Private by default</span>
          </div>
        </div>
        <div className="hero-card">
          <span className={`rag-chip ${score.rag.toLowerCase()}`}>{score.rag}</span>
          <div className="mini-gauge" style={{ "--score": score.safetyScore } as React.CSSProperties}>
            <strong>{score.safetyScore}</strong>
            <span>/10</span>
          </div>
          <p>Private sample score. Raw answers stay on this device.</p>
          <div className="hero-stats">
            <span>{score.careerSafetyWindow} month safety window</span>
            <span>{score.logicQuotient}/10 LQ</span>
            <span>{score.safetyDate}</span>
          </div>
        </div>
      </section>

      <section className="crisis-section">
        <div className="section-head">
          <p className="eyebrow">The crisis</p>
          <h2>This is not only a forecast. The signals are already visible.</h2>
          <p>Karma turns those signals into a personal check instead of a vague headline.</p>
        </div>
        <div className="signal-grid">
          {crisisStats.map((item) => (
            <article className="signal-card" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <em>{item.source}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="force-section">
        <div className="section-head">
          <p className="eyebrow">What's actually happening</p>
          <h2>Four forces reshaping careers right now.</h2>
        </div>
        <div className="force-grid">
          {marketForces.map((force) => (
            <article className="force-card" key={force.title}>
              <h3>{force.title}</h3>
              <p>{force.body}</p>
              <span>{force.note}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="science-section">
        <div className="section-head">
          <p className="eyebrow">The Atomic Logic Framework</p>
          <h2>Every job is a collection of tasks. Karma scores the atoms.</h2>
          <p>
            Two people with the same title can have completely different risk profiles. A finance manager spending most
            of the week on reconciliation is not the same as one making pricing, risk, or client decisions.
          </p>
        </div>
        <div className="science-grid">
          {scienceCards.map((card) => (
            <article className="science-card" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              <span>{card.example}</span>
            </article>
          ))}
        </div>
        <div className="atom-compare">
          <div>
            <p className="eyebrow">Mechanical atoms</p>
            <h3>AI can already do these.</h3>
            <p>Routine email responses, reconciliation, status updates, repeatable coding, ticket routing, and report formatting.</p>
          </div>
          <div>
            <p className="eyebrow">Logical atoms</p>
            <h3>These protect your market value.</h3>
            <p>Crisis handling, client judgment, exception diagnosis, tradeoff calls, trust repair, ownership, and strategy.</p>
          </div>
        </div>
      </section>

      <section className="audience-section">
        <div className="section-head">
          <p className="eyebrow">Who is at risk</p>
          <h2>Four groups. Four risk profiles. One private assessment.</h2>
        </div>
        <div className="audience-grid">
          {(Object.keys(segments) as Segment[]).map((segment) => (
            <button className="audience-card" key={segment} onClick={() => setView("assessment")}>
              <span>{segments[segment].label}</span>
              <h3>{segments[segment].title}</h3>
              <p>{segments[segment].copy}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="company-risk-section">
        <div>
          <p className="eyebrow">Company risk alert</p>
          <h2>Is your company next?</h2>
          <p>
            If these signals are showing up in your industry, your safest move is to measure your role before the wave
            reaches your team.
          </p>
        </div>
        <div className="company-risk-list">
          {companyRiskSignals.map((item) => (
            <article key={item.company}>
              <strong>{item.company}</strong>
              <span>{item.signal}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="why-karma-section">
        <div className="section-head">
          <p className="eyebrow">Why Karma</p>
          <h2>Other tools score your job title. Karma scores your work pattern.</h2>
        </div>
        <div className="comparison-table">
          {comparisonRows.map((row) => (
            <div key={row.old}>
              <span>{row.old}</span>
              <strong>{row.karma}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="calm-band">
        <div>
          <p className="eyebrow">The management-layer signal</p>
          <h2>Coordination is not career safety.</h2>
        </div>
        <p>
          If your week is mostly reviews, approvals, follow-ups, and dashboards, Karma helps you convert invisible risk
          into a visible plan.
        </p>
      </section>

      <section className="start-section">
        <div className="section-head">
          <p className="eyebrow">Get started</p>
          <h2>Three steps. Two minutes. One number that changes the conversation.</h2>
        </div>
        <div className="step-grid">
          {landingSteps.map((step, index) => (
            <article key={step.title}>
              <span>Step {index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="privacy-section">
        <div className="section-head">
          <p className="eyebrow">Privacy first</p>
          <h2>Your data stays yours. Always.</h2>
        </div>
        <div className="privacy-grid">
          <article>
            <h3>Zero raw data on servers</h3>
            <p>Your salary band, task atoms, employer details, and private assessment inputs stay local by default.</p>
          </article>
          <article>
            <h3>Anonymous by design</h3>
            <p>Use a nickname or no name. Karma does not need your employer name or phone number to calculate your score.</p>
          </article>
          <article>
            <h3>GDPR and DPDP ready</h3>
            <p>Export your private backup, clear device data, and control your footprint from Profile.</p>
          </article>
        </div>
      </section>

      <section className="final-cta-section">
        <h2>The only risk is not knowing.</h2>
        <p>Find out if your current work pattern is resilient before your employer's next operating model decides for you.</p>
        <button className="primary-btn large" onClick={() => setView("assessment")}>
          Find My Date - Free
        </button>
        <div className="trust-strip centered">
          <span>Your data stays on your device</span>
          <span>No exact salary</span>
          <span>No employer required</span>
        </div>
      </section>
    </div>
  );
}

function PersonalizedHome({
  assessment,
  score,
  setView,
  liveAlerts,
  marketPulseStatus,
}: {
  assessment: AssessmentState;
  score: Score;
  setView: (view: View) => void;
  liveAlerts: LiveMarketAlert[];
  marketPulseStatus: "loading" | "live" | "offline";
}) {
  const role = roleFor(assessment);
  const personalItems = liveAlerts.filter((item) => item.lane === "personal").slice(0, 5);
  const industryItems = liveAlerts.filter((item) => item.lane === "industry").slice(0, 6);
  const improvements = scoreImprovementWindows(score, assessment, liveAlerts);

  return (
    <div className="page-stack">
      <section className="returning-hero">
        <div>
          <p className="eyebrow">Your Karma dashboard</p>
          <h1>{assessment.nickname ? `${assessment.nickname}, ` : ""}your AI risk watch is live.</h1>
          <p>
            Karma is monitoring source headlines for {assessment.companyName ? assessment.companyName : "your role"} and
            the wider {segments[assessment.segment].label.toLowerCase()} market. These are quoted source items, not Karma claims.
          </p>
          <div className="hero-actions">
            <button className="primary-btn large" onClick={() => setView("results")}>
              View My Score
            </button>
            <button className="secondary-btn large" onClick={() => setView("profile")}>
              Update Company Watch
            </button>
          </div>
        </div>
        <div className="returning-score-card">
          <span className={`rag-chip ${score.rag.toLowerCase()}`}>{score.rag}</span>
          <strong>{score.safetyScore}/10</strong>
          <p>Market pressure adjustment: {score.marketPressure.toFixed(2)}</p>
          <p>{role.title} · {score.careerSafetyWindow} month safety window</p>
        </div>
      </section>

      <ScoreImprovementPanel improvements={improvements} score={score} />

      <section className="source-dashboard-grid">
        <SourceFeedPanel
          title="Personal impact feed"
          label={assessment.companyName ? `Company watch: ${assessment.companyName}` : "Company watch not enabled"}
          description={
            assessment.companyName
              ? "Latest Google News source items that mention the company you saved, plus AI, automation, workforce, jobs, or strategy terms."
              : "Add a company in Profile to turn on company-specific source monitoring."
          }
          items={personalItems}
          emptyCta={assessment.companyName ? "No company-specific source items right now." : "Add Company Watch"}
          onEmptyAction={() => setView("profile")}
          status={marketPulseStatus}
        />
        <SourceFeedPanel
          title="Industry update"
          label={`${segments[assessment.segment].label} · ${role.title}`}
          description="Live Google News source items for your role, function, and industry risk pattern."
          items={industryItems}
          emptyCta="Refresh Market Signals"
          onEmptyAction={() => setView("market")}
          status={marketPulseStatus}
        />
      </section>

      <section className="panel">
        <h2>Clear marking</h2>
        <p>
          Personal impact feed is based on the company name you choose to monitor. Industry update is based on your
          assessment track and role. Both are sourced from Google News RSS and quote publisher headlines directly.
        </p>
      </section>
    </div>
  );
}

function ScoreImprovementPanel({ improvements, score }: { improvements: ImprovementWindow[]; score: Score }) {
  return (
    <section className="improvement-panel">
      <div className="section-head">
        <p className="eyebrow">Score movement</p>
        <h2>Weekly, monthly, and quarterly improvement path.</h2>
        <p>
          Projections update when your profile or live source-feed pressure changes. Current market pressure adjustment:
          {` ${score.marketPressure.toFixed(2)}`}.
        </p>
      </div>
      <div className="improvement-grid">
        {improvements.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.score}/10</strong>
            <em>{item.gain}</em>
            <p>{item.action}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function SourceFeedPanel({
  title,
  label,
  description,
  items,
  emptyCta,
  onEmptyAction,
  status,
}: {
  title: string;
  label: string;
  description: string;
  items: LiveMarketAlert[];
  emptyCta: string;
  onEmptyAction: () => void;
  status: "loading" | "live" | "offline";
}) {
  return (
    <section className="source-feed-panel">
      <div className="source-feed-head">
        <p className="eyebrow">{title}</p>
        <h2>{label}</h2>
        <p>{description}</p>
        <span>{status === "live" ? "Live Google News RSS" : status === "loading" ? "Loading sources" : "Live source unavailable"}</span>
      </div>
      <div className="source-feed-list">
        {items.length ? (
          items.map((item) => (
            <a href={item.url} target="_blank" rel="noreferrer" key={item.id}>
              <strong>"{item.title}"</strong>
              <span>{item.source} · {formatSourceDate(item.publishedAt)}</span>
            </a>
          ))
        ) : (
          <button className="source-empty" onClick={onEmptyAction}>
            {emptyCta}
          </button>
        )}
      </div>
    </section>
  );
}

function AssessmentWizard({
  assessment,
  update,
  updateResponse,
  addCustomActivity,
  learnedActivities,
  selectSegment,
  selectRole,
  step,
  setStep,
  toggleChip,
  toggleStrength,
  completeAssessment,
}: {
  assessment: AssessmentState;
  update: <K extends keyof AssessmentState>(key: K, value: AssessmentState[K]) => void;
  updateResponse: (id: string, value: string) => void;
  addCustomActivity: (label: string) => void;
  learnedActivities: LearnedActivityMap;
  selectSegment: (segment: Segment) => void;
  selectRole: (roleId: string) => void;
  step: number;
  setStep: (step: number) => void;
  toggleChip: (chip: Chip) => void;
  toggleStrength: (label: string) => void;
  completeAssessment: () => void;
}) {
  const progress = Math.round(((step + 1) / steps.length) * 100);
  const selectedRole = roleFor(assessment);
  const roleTextSignal = interpretTaskText(assessment.responseMap["role-open-task"] ?? "");
  const [activityDraft, setActivityDraft] = useState("");
  const selectedActivities = mergeActivityChips(roleActivities(selectedRole), learnedActivitiesFor(learnedActivities, assessment), customActivities(assessment));

  function updateExperienceYears(value: number) {
    const years = Math.max(0, value);
    update("experienceYears", years);
    if (assessment.tenureYears > years) update("tenureYears", years);
  }

  function updateTenureYears(value: number) {
    update("tenureYears", Math.min(Math.max(0, value), assessment.experienceYears));
  }

  return (
    <section className="wizard-shell">
      <div className="wizard-progress">
        <span>
          Step {step + 1} of {steps.length} - {progress}% complete
        </span>
        <div>
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="wizard-card">
        {step === 0 && (
            <div className="question-stack">
            <p className="eyebrow">Start</p>
            <h1>Tell us what kind of work you do.</h1>
            <p>Choose your work type and closest role. Karma will only ask questions that match your situation.</p>
            <div className="journey-form-grid">
              <label className="field">
                Display name or nickname
                <input value={assessment.nickname} onChange={(event) => update("nickname", event.target.value)} placeholder="Optional" />
              </label>
              <label className="field">
                Country
                <select value={assessment.country} onChange={(event) => update("country", event.target.value)}>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="track-switcher">
              {(Object.keys(segments) as Segment[]).map((segment) => (
                <button className={assessment.segment === segment ? "selected" : ""} key={segment} onClick={() => selectSegment(segment)}>
                  <span>{segments[segment].label}</span>
                  <strong>{segments[segment].title}</strong>
                </button>
              ))}
            </div>
            <div className="flow-card">
              <div className="flow-card-copy">
                <p className="eyebrow">Role</p>
                <h2>Pick the closest role.</h2>
                <p>{selectedRole.description}</p>
              </div>
              <label className="field">
                Your role
                <select value={assessment.roleId} onChange={(event) => selectRole(event.target.value)}>
                  {rolesFor(assessment.segment).map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.title}
                    </option>
                  ))}
                  <option value={otherRoleId}>Other role not listed</option>
                </select>
              </label>
              {assessment.roleId === otherRoleId && (
                <label className="field">
                  Name your role
                  <input
                    value={assessment.responseMap["custom-role-title"] || ""}
                    onChange={(event) => updateResponse("custom-role-title", event.target.value)}
                    placeholder="Example: Revenue assurance analyst"
                  />
                </label>
              )}
              <div className="activity-preview">
                <div>
                  <p className="eyebrow">Related activities/functions</p>
                  <h3>Select what you do. Add anything missing once.</h3>
                </div>
                <div className="activity-chip-row">
                  {selectedActivities.map((chip) => {
                    const selected =
                      chip.kind === "mechanical"
                        ? assessment.mechanicalAtoms.includes(chip.label)
                        : assessment.logicalAtoms.includes(chip.label);
                    return (
                      <button className={`${chip.kind} ${selected ? "selected" : ""}`} key={chip.label} onClick={() => toggleChip(chip)}>
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
                <div className="other-activity-row">
                  <input
                    value={activityDraft}
                    onChange={(event) => setActivityDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addCustomActivity(activityDraft);
                        setActivityDraft("");
                      }
                    }}
                    placeholder="Add another activity"
                  />
                  <button
                    onClick={() => {
                      addCustomActivity(activityDraft);
                      setActivityDraft("");
                    }}
                  >
                    Add activity
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="question-stack">
            <p className="eyebrow">Profile</p>
            <h1>
              {assessment.segment === "fresher"
                ? "Now tell us about your education and job readiness."
                : "Now tell us about your work pressure. No exact salary needed."}
            </h1>
            <p>
              {assessment.segment === "fresher"
                ? "For freshers, college, stream, city, internships, and placement support matter more than work experience."
                : "Karma only needs broad bands and simple experience details. We do not need private salary numbers."}
            </p>
            <div className="journey-form-grid">
              <label className="field">
                {assessment.segment === "fresher" ? "Expected salary range" : "Salary range"}
                <select value={assessment.salaryBand} onChange={(event) => update("salaryBand", event.target.value as AssessmentState["salaryBand"])}>
                  <option value="lower">Lower local band</option>
                  <option value="middle">Middle local band</option>
                  <option value="higher">Higher local band</option>
                </select>
              </label>
              {assessment.segment === "fresher" ? (
                <>
                  <label className="field">
                    What is your current stage?
                    <select value={assessment.responseMap["fresher-stage"] ?? "job-search"} onChange={(event) => updateResponse("fresher-stage", event.target.value)}>
                      <option value="student">Still studying</option>
                      <option value="final-year">Final year / recently graduated</option>
                      <option value="job-search">Looking for first full-time role</option>
                      <option value="first-job">In first role under 12 months</option>
                    </select>
                  </label>
                  <label className="field">
                    What proof do you already have?
                    <select value={assessment.responseMap["fresher-exposure"] ?? "projects"} onChange={(event) => updateResponse("fresher-exposure", event.target.value)}>
                      <option value="none">Mostly coursework</option>
                      <option value="projects">Projects or portfolio</option>
                      <option value="internship">Internship / apprenticeship</option>
                      <option value="client-proof">Client, open-source, revenue, or live proof</option>
                    </select>
                  </label>
                  <label className="field">
                    {assessment.roleId === "engineering-fresher" ? "Engineering specialization" : "Graduation specialization"}
                    <select value={assessment.responseMap["fresher-stream"] ?? ""} onChange={(event) => updateResponse("fresher-stream", event.target.value)}>
                      <option value="">Select specialization</option>
                      <option value="computer-science">Computer Science / IT</option>
                      <option value="electronics">Electronics / E&TC</option>
                      <option value="mechanical">Mechanical</option>
                      <option value="civil">Civil</option>
                      <option value="electrical">Electrical</option>
                      <option value="chemical">Chemical</option>
                      <option value="commerce">Commerce / Accounting</option>
                      <option value="management">Management / MBA</option>
                      <option value="arts-science">Arts / Science</option>
                      <option value="other">Other specialization</option>
                    </select>
                  </label>
                  {assessment.responseMap["fresher-stream"] === "other" && (
                    <label className="field">
                      Name your specialization
                      <input
                        value={assessment.responseMap["fresher-stream-other"] ?? ""}
                        onChange={(event) => updateResponse("fresher-stream-other", event.target.value)}
                        placeholder="Example: Data science, biotechnology, hotel management"
                      />
                    </label>
                  )}
                  <label className="field">
                    College name
                    <input
                      value={assessment.responseMap["college-name"] ?? ""}
                      onChange={(event) => updateResponse("college-name", event.target.value)}
                      placeholder="Example: Pune Institute of Computer Technology"
                    />
                  </label>
                  <label className="field">
                    College city
                    <input
                      value={assessment.responseMap["college-city"] ?? ""}
                      onChange={(event) => updateResponse("college-city", event.target.value)}
                      placeholder="Example: Pune"
                    />
                  </label>
                  <label className="field">
                    Year of passing
                    <select value={assessment.responseMap["passing-year"] ?? ""} onChange={(event) => updateResponse("passing-year", event.target.value)}>
                      <option value="">Select year</option>
                      <option value="2027">2027</option>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="before-2024">Before 2024</option>
                    </select>
                  </label>
                  <label className="field">
                    Internship experience
                    <select value={assessment.responseMap["internship-depth"] ?? ""} onChange={(event) => updateResponse("internship-depth", event.target.value)}>
                      <option value="">Select experience</option>
                      <option value="none">No internship yet</option>
                      <option value="short">Short internship / training project</option>
                      <option value="serious">Serious internship with real deliverables</option>
                      <option value="ppo">Internship with PPO / strong recommendation</option>
                    </select>
                  </label>
                  <label className="field">
                    College placement support
                    <select value={assessment.responseMap["placement-support"] ?? ""} onChange={(event) => updateResponse("placement-support", event.target.value)}>
                      <option value="">Select support</option>
                      <option value="strong">Strong campus placement</option>
                      <option value="limited">Limited placement support</option>
                      <option value="none">No placement support</option>
                      <option value="off-campus">Mostly off-campus search</option>
                    </select>
                  </label>
                </>
              ) : (
                <>
                  <label className="field">
                    Total experience years
                    <input type="number" min="0" value={assessment.experienceYears} onChange={(event) => updateExperienceYears(Number(event.target.value))} />
                  </label>
                  <label className="field">
                    Years in current company
                    <input
                      type="number"
                      min="0"
                      max={assessment.experienceYears}
                      value={assessment.tenureYears}
                      onChange={(event) => updateTenureYears(Number(event.target.value))}
                    />
                  </label>
                </>
              )}
            </div>
            {assessment.segment === "outsourcing" && (
              <div className="journey-form-grid">
                <label className="field">
                  What best describes your delivery environment?
                  <select value={assessment.responseMap["work-model"] ?? "shared-services"} onChange={(event) => updateResponse("work-model", event.target.value)}>
                    <option value="shared-services">Shared services / back office</option>
                    <option value="transaction-factory">High-volume transaction factory</option>
                    <option value="voice-queue">Voice or ticket queue</option>
                    <option value="client-embedded">Client-embedded judgment work</option>
                    <option value="other">Other environment</option>
                  </select>
                </label>
                {assessment.responseMap["work-model"] === "other" && (
                  <label className="field">
                    Describe your environment
                    <input
                      value={assessment.responseMap["work-model-other"] ?? ""}
                      onChange={(event) => updateResponse("work-model-other", event.target.value)}
                      placeholder="Example: Captive finance COE, hybrid client ops"
                    />
                  </label>
                )}
                <label className="field">
                  Primary process or function
                  <select value={assessment.responseMap["process-function"] ?? ""} onChange={(event) => updateResponse("process-function", event.target.value)}>
                    <option value="">Select function</option>
                    <option value="ap">Accounts payable</option>
                    <option value="ar">Accounts receivable</option>
                    <option value="r2r">Record to report</option>
                    <option value="customer-service">Customer service</option>
                    <option value="it-support">IT support</option>
                    <option value="other">Other function</option>
                  </select>
                </label>
                {assessment.responseMap["process-function"] === "other" && (
                  <label className="field">
                    Name your function
                    <input
                      value={assessment.responseMap["process-function-other"] ?? ""}
                      onChange={(event) => updateResponse("process-function-other", event.target.value)}
                      placeholder="Example: Revenue assurance, procurement ops"
                    />
                  </label>
                )}
                <label className="field">
                  Main tools
                  <input value={assessment.responseMap["tools-used"] ?? ""} onChange={(event) => updateResponse("tools-used", event.target.value)} placeholder="SAP, Oracle, BlackLine, Excel" />
                </label>
              </div>
            )}
            {assessment.segment === "manager" && (
              <div className="journey-form-grid">
                <label className="field">
                  What kind of management layer are you?
                  <select value={assessment.responseMap["manager-level"] ?? "middle"} onChange={(event) => updateResponse("manager-level", event.target.value)}>
                    <option value="coordination-heavy">Mostly coordination, reviews, approvals</option>
                    <option value="middle">Mixed people, delivery, and decisions</option>
                    <option value="pnl-owner">P&L, pricing, strategy, or client outcomes</option>
                    <option value="specialist-leader">Specialist domain leader</option>
                    <option value="other">Other management layer</option>
                  </select>
                </label>
                {assessment.responseMap["manager-level"] === "other" && (
                  <label className="field">
                    Describe your layer
                    <input
                      value={assessment.responseMap["manager-level-other"] ?? ""}
                      onChange={(event) => updateResponse("manager-level-other", event.target.value)}
                      placeholder="Example: Program owner, transition lead, SME manager"
                    />
                  </label>
                )}
                <label className="field">
                  Team size
                  <select value={assessment.responseMap["team-size"] ?? ""} onChange={(event) => updateResponse("team-size", event.target.value)}>
                    <option value="">Select team size</option>
                    <option value="none">No direct reports</option>
                    <option value="small">1-5</option>
                    <option value="medium">6-20</option>
                    <option value="large">21+</option>
                  </select>
                </label>
                <label className="field">
                  Decision ownership
                  <select value={assessment.responseMap["decision-ownership"] ?? ""} onChange={(event) => updateResponse("decision-ownership", event.target.value)}>
                    <option value="">Select ownership</option>
                    <option value="relay">Mostly relay decisions</option>
                    <option value="recommend">Recommend decisions</option>
                    <option value="own">Own commercial/people/risk decisions</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                {assessment.responseMap["decision-ownership"] === "other" && (
                  <label className="field">
                    Describe decision ownership
                    <input
                      value={assessment.responseMap["decision-ownership-other"] ?? ""}
                      onChange={(event) => updateResponse("decision-ownership-other", event.target.value)}
                      placeholder="Example: Own client risk calls but not pricing"
                    />
                  </label>
                )}
              </div>
            )}
            {assessment.segment === "robotics" && (
              <div className="journey-form-grid">
                <label className="field">
                  How automated is your physical workplace already?
                  <select value={assessment.responseMap["automation-setting"] ?? "warehouse"} onChange={(event) => updateResponse("automation-setting", event.target.value)}>
                    <option value="manual">Mostly manual today</option>
                    <option value="warehouse">Some scanners, routing, WMS, or dashboards</option>
                    <option value="highly-automated">Robots, sensors, computer vision, or automated lines are active</option>
                    <option value="human-critical">Human safety judgment remains central</option>
                    <option value="other">Other setting</option>
                  </select>
                </label>
                {assessment.responseMap["automation-setting"] === "other" && (
                  <label className="field">
                    Describe automation level
                    <input
                      value={assessment.responseMap["automation-setting-other"] ?? ""}
                      onChange={(event) => updateResponse("automation-setting-other", event.target.value)}
                      placeholder="Example: Manual checks with AI camera pilot"
                    />
                  </label>
                )}
                <label className="field">
                  Worksite type
                  <select value={assessment.responseMap["worksite-type"] ?? ""} onChange={(event) => updateResponse("worksite-type", event.target.value)}>
                    <option value="">Select worksite</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="plant">Plant / factory</option>
                    <option value="field">Field service</option>
                    <option value="fleet">Fleet / dispatch</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                {assessment.responseMap["worksite-type"] === "other" && (
                  <label className="field">
                    Name your worksite
                    <input
                      value={assessment.responseMap["worksite-type-other"] ?? ""}
                      onChange={(event) => updateResponse("worksite-type-other", event.target.value)}
                      placeholder="Example: Hospital logistics, retail store ops"
                    />
                  </label>
                )}
                <label className="field">
                  Main systems or machines
                  <input value={assessment.responseMap["automation-tools"] ?? ""} onChange={(event) => updateResponse("automation-tools", event.target.value)} placeholder="WMS, scanners, PLC, robots" />
                </label>
              </div>
            )}
            <section className="strength-panel">
              <div>
                <p className="eyebrow">Personal strengths</p>
                <h2>What else can help you stand out?</h2>
                <p>
                  These are not hobbies for decoration. Karma gives points when a strength can help you prove value,
                  communicate better, learn faster, or move into safer work.
                </p>
              </div>
              <div className="strength-chip-grid">
                {personalStrengthOptions.map((item) => (
                  <button className={assessment.personalStrengths.includes(item) ? "selected" : ""} key={item} onClick={() => toggleStrength(item)}>
                    {item}
                  </button>
                ))}
              </div>
              <label className="field">
                Other strength, optional
                <input
                  value={assessment.responseMap["other-strengths"] ?? ""}
                  onChange={(event) => updateResponse("other-strengths", event.target.value)}
                  placeholder="Example: chess, debate, volunteering, sales, music, NCC"
                />
              </label>
            </section>
          </div>
        )}

        {step === 2 && (
          <div className="question-stack">
            <p className="eyebrow">Environment</p>
            <h1>The core risk is AI replacing or compressing the work around you.</h1>
            <p>Layoffs are the symptom. AI-driven task replacement, role compression, and lower-cost operating models are the disease Karma is measuring.</p>
            <div className="choice-grid adoption">
              {[
                ["none", "Not visible yet", "No clear adoption around your team."],
                ["pilot", "Pilots and experiments", "AI tools are being tested."],
                ["scaling", "Scaling inside teams", "AI is entering regular workflows."],
                ["replacing", "Replacing tasks", "Some work is already being removed or redesigned."],
              ].map(([id, title, copy]) => (
                <button
                  className={assessment.aiAdoption === id ? "selected" : ""}
                  key={id}
                  onClick={() => update("aiAdoption", id as Adoption)}
                >
                  <strong>{title}</strong>
                  <span>{copy}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="question-stack">
            <p className="eyebrow">Task Fingerprint</p>
            <h1>{selectedRole.title}: now Karma listens to the work itself.</h1>
            <p>
              Start with role-specific atoms, then answer one dropdown and one open task. Karma interprets those answers
              locally into mechanical and logical signals.
            </p>
            <div className="atom-question-stack">
              {selectedRole.questions.map((question) => (
                <section className="atom-question-card" key={question.prompt}>
                  <h2>{question.prompt}</h2>
                  <div className="atom-option-grid">
                    {question.chips.map((chip) => {
                      const selected =
                        chip.kind === "mechanical"
                          ? assessment.mechanicalAtoms.includes(chip.label)
                          : assessment.logicalAtoms.includes(chip.label);
                      return (
                        <button
                          className={`${chip.kind} ${selected ? "selected" : ""}`}
                          key={`${question.prompt}-${chip.label}`}
                          onClick={() => toggleChip(chip)}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
              <section className="atom-question-card">
                <h2>How predictable is your {selectedRole.title.toLowerCase()} week?</h2>
                <label className="field">
                  Predictability of your work
                  <select value={assessment.responseMap["role-predictability"] ?? "mixed"} onChange={(event) => updateResponse("role-predictability", event.target.value)}>
                    <option value="high">Highly predictable: most work follows a playbook</option>
                    <option value="mixed">Mixed: some playbooks, some exceptions</option>
                    <option value="low">Low predictability: judgment and exceptions dominate</option>
                  </select>
                </label>
              </section>
              <section className="atom-question-card">
                <h2>Describe one recurring task in your own words.</h2>
                <label className="field">
                  Private local text
                  <textarea
                    value={assessment.responseMap["role-open-task"] ?? ""}
                    onChange={(event) => updateResponse("role-open-task", event.target.value)}
                    placeholder={`Example: Every day I update status dashboards, follow up on blockers, and decide which client escalations need my attention.`}
                  />
                </label>
                <div className="interpretation-strip">
                  <span>Mechanical signals: {roleTextSignal.mechanical}</span>
                  <span>Logical signals: {roleTextSignal.logical}</span>
                  <span>Interpreted on this device</span>
                </div>
              </section>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="question-stack">
            <p className="eyebrow">Money pressure</p>
            <h1>How much of your monthly income is already committed?</h1>
            <p>
              Move the slider to show roughly how much goes into fixed payments like rent, EMI, school fees, insurance,
              and regular family support.
            </p>
            <label className="slider-card">
              <span>Monthly income already committed</span>
              <strong>{assessment.fixedCommitmentPct}%</strong>
              <input
                type="range"
                min="0"
                max="100"
                value={assessment.fixedCommitmentPct}
                onChange={(event) => update("fixedCommitmentPct", Number(event.target.value))}
              />
            </label>
            <p className="privacy-note">Example: choose 60% if around 60 out of every 100 you earn is already committed. No exact salary or bank details needed.</p>
          </div>
        )}

        <div className="wizard-actions">
          <button className="secondary-btn" disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1))}>
            Back
          </button>
          {step < steps.length - 1 ? (
            <button className="primary-btn" onClick={() => setStep(step + 1)}>
              Continue
            </button>
          ) : (
            <button className="primary-btn" onClick={completeAssessment}>
              See My Score
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function Results({
  assessment,
  score,
  liveAlerts,
  setView,
}: {
  assessment: AssessmentState;
  score: Score;
  liveAlerts: LiveMarketAlert[];
  setView: (view: View) => void;
}) {
  const copy = ragCopy(score.rag);
  const country = countryFor(assessment.country).name;
  const role = roleFor(assessment);
  const segment = segments[assessment.segment].label.toLowerCase();
  const improvements = scoreImprovementWindows(score, assessment, liveAlerts);
  const prescription = prescriptionFor(assessment, score);

  return (
    <div className="page-stack">
      <section className="result-stage">
        <div className="score-gauge" style={{ "--score": score.safetyScore } as React.CSSProperties}>
          <div>
            <strong>{score.safetyScore}</strong>
            <span>/10</span>
          </div>
        </div>
        <div className="result-copy">
          <p className="eyebrow">Career Safety Score</p>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
          <div className={`rag-message ${score.rag.toLowerCase()}`}>
            <strong>{score.rag}</strong>
            <span>Your safety window ends around {score.safetyDate}.</span>
          </div>
        </div>
      </section>

      <section className="metric-row">
        <MetricCard label="AI Exposure Risk" value={`${score.riskScore}/10`} />
        <MetricCard label="Career Safety Window" value={`${score.careerSafetyWindow} mo`} />
        <MetricCard label="Logic Quotient" value={`${score.logicQuotient}/10`} />
        <MetricCard label="Market Value Drift" value={score.marketValueDrift} />
      </section>

      <ScoreBreakdownPanel score={score} />

      <ScoreImprovementPanel improvements={improvements} score={score} />

      <section className="panel">
        <h2>Peer benchmark</h2>
        <p>
          Your task fingerprint is in the {score.percentile}th percentile compared to other {role.title.toLowerCase()} profiles
          in {country} across the {segment} track. That means your week appears more automation-exposed than most peers unless
          you move visible effort toward judgment, ownership, and market-facing outcomes.
        </p>
      </section>

      <section className="prescription-panel">
        <div className="prescription-header">
          <p className="eyebrow">Career Safety Prescription</p>
          <h2>A score is not the product. The plan is.</h2>
          <p>
            Karma has diagnosed the exposed parts of your work. These are the recommended next actions to reduce risk,
            build proof, and create career options.
          </p>
        </div>
        <div className="prescription-grid">
          {prescription.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <strong>{item.action}</strong>
            </article>
          ))}
        </div>
        <div className="actions-row">
          <button className="primary-btn" onClick={() => setView("mission")}>
            Unlock My Treatment Plan
          </button>
          <button className="secondary-btn" onClick={() => setView("market")}>
            See Market Signals
          </button>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">{moveCopyForSegment(assessment.segment).label}</p>
        <h2>{moveCopyForSegment(assessment.segment).title}</h2>
        <p>{moveCopyForSegment(assessment.segment).body}</p>
        <div className="actions-row">
          <button className="primary-btn" onClick={() => { window.location.href = "/move"; }}>
            {moveCopyForSegment(assessment.segment).cta}
          </button>
        </div>
      </section>
    </div>
  );
}

function ScoreBreakdownPanel({ score }: { score: Score }) {
  return (
    <section className="score-method-panel">
      <div className="score-method-header">
        <div>
          <p className="eyebrow">Score method</p>
          <h2>Why this score was generated</h2>
          <p>
            Karma uses a deterministic scoring method. The same profile, answers, tasks, and market-source inputs will
            generate the same score fingerprint every time.
          </p>
        </div>
        <div className="score-fingerprint">
          <span>{score.scoreVersion}</span>
          <strong>{score.scoreFingerprint}</strong>
          <small>Raw risk points: {score.rawRiskPoints}</small>
        </div>
      </div>
      <div className="score-parameter-table">
        {score.parameters.map((item) => (
          <article className={item.direction} key={item.label}>
            <div>
              <strong>{item.label}</strong>
              <span>{item.value}</span>
            </div>
            <b>{item.points}</b>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MarketSignals({
  filter,
  setFilter,
  setView,
  liveAlerts,
  marketPulseStatus,
}: {
  filter: string;
  setFilter: (filter: string) => void;
  setView: (view: View) => void;
  liveAlerts: LiveMarketAlert[];
  marketPulseStatus: "loading" | "live" | "offline";
}) {
  const filters = ["All", "Country", "Company", "Function", "Tech", "Industry", "Managers"];
  const filtered = liveAlerts.filter((alert) => filter === "All" || alert.category === filter);

  return (
    <div className="page-stack">
      <section className="market-hero">
        <p className="eyebrow">Live Source Feed</p>
        <h1>AI job-risk news, quoted from live publishers.</h1>
        <p>
          Karma surfaces Google News RSS headlines with publisher source, date, and link. No editorial claim is added to
          these live market items.
        </p>
        <button className="primary-btn large" onClick={() => setView("assessment")}>
          Turn Source Signals Into My Score
        </button>
      </section>
      <section className="market-control-panel">
        <div>
          <h2>Google News market pulse</h2>
          <p>
            Status: {marketPulseStatus === "live" ? "Live Google News RSS feed" : marketPulseStatus === "loading" ? "Loading live sources" : "Live feed unavailable"}
          </p>
        </div>
        <div className="filter-row">
          {filters.map((item) => (
            <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>
      </section>
      <section className="market-alert-grid">
        {filtered.length ? (
          filtered.map((alert) => (
            <article className="market-alert source-led" key={alert.id}>
              <div className="alert-topline">
                <span>{alert.category}</span>
                <time>{formatSourceDate(alert.publishedAt)}</time>
              </div>
              <h2>"{alert.title}"</h2>
              <p>
                Reported by <strong>{alert.source}</strong>. Search query: {alert.query}.
              </p>
              <div className="alert-taxonomy">
                <span>Source: {alert.source}</span>
                <span>Feed: Google News RSS</span>
                <span>Category: {alert.category}</span>
              </div>
              <a href={alert.url} target="_blank" rel="noreferrer">
                Open source item
              </a>
            </article>
          ))
        ) : (
          <article className="market-alert source-led">
            <div className="alert-topline">
              <span>{marketPulseStatus === "loading" ? "Loading" : "Offline"}</span>
              <time>Google News RSS</time>
            </div>
            <h2>No live source items are available right now.</h2>
            <p>Karma is not showing fallback claims here. Please refresh when the live source feed is reachable.</p>
          </article>
        )}
      </section>
    </div>
  );
}

function Mission({ assessment, score, setView }: { assessment: AssessmentState; score: Score; setView: (view: View) => void }) {
  const role = roleFor(assessment);

  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="eyebrow">90-day mission</p>
        <h1>{assessment.nickname ? `${assessment.nickname}, ` : ""}move from awareness to agency.</h1>
        <p>A small weekly rhythm is enough to begin changing your career safety profile.</p>
      </header>
      <section className="mission-grid">
        <MissionCard week="Weeks 1-2" title="Stabilize" items={["Map mechanical work", "Pick one AI workflow", "Update financial guard"]} />
        <MissionCard week="Weeks 3-6" title="Build proof" items={["Publish one artifact", "Document business impact", "Ask for domain ownership"]} />
        <MissionCard week="Weeks 7-12" title="Move optionality" items={["Benchmark safer roles", "Refresh LinkedIn", "Start 5 warm conversations"]} />
      </section>
      <section className="panel">
        <h2>Current mission context</h2>
        <p>
          Your {role.title.toLowerCase()} score is {score.safetyScore}/10 with a {score.careerSafetyWindow}-month safety window.
          Karma recommends acting before {score.safetyDate}.
        </p>
        <button className="primary-btn" onClick={() => setView("plans")}>
          Unlock Guided Mission
        </button>
      </section>
    </div>
  );
}

function Plans({ assessment, plan, setPlan }: { assessment: AssessmentState; plan: PlanId; setPlan: (plan: PlanId) => void }) {
  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="eyebrow">Plans</p>
        <h1>Choose how much guidance you want.</h1>
        <p>Pricing adapts to {countryFor(assessment.country).name}. Stripe supports international checkout; Razorpay supports India.</p>
      </header>
      <section className="plan-grid">
        {plans.map((item) => (
          <article className={`plan-card ${plan === item.id ? "selected" : ""}`} key={item.id}>
            <h2>{item.name}</h2>
            <strong>{priceFor(item.id, assessment.country)}/mo</strong>
            <p>{item.description}</p>
            <Checklist items={item.features} />
            <button className={item.id === "navigator" ? "primary-btn" : "secondary-btn"} onClick={() => setPlan(item.id)}>
              Select {item.name}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

function Profile({
  assessment,
  score,
  update,
  exportBackup,
  purgeFootprint,
  setView,
}: {
  assessment: AssessmentState;
  score: Score;
  update: <K extends keyof AssessmentState>(key: K, value: AssessmentState[K]) => void;
  exportBackup: () => void;
  purgeFootprint: () => void;
  setView: (view: View) => void;
}) {
  const [showRestricted, setShowRestricted] = useState(false);
  const role = roleFor(assessment);

  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="eyebrow">Profile and data controls</p>
        <h1>Your private Karma footprint.</h1>
        <p>Raw assessment inputs remain local. Export or purge them any time.</p>
      </header>

      <section className="profile-grid">
        <div className="panel">
          <h2>Private profile</h2>
          <label className="field company-watch-field">
            Company watch, optional
            <input
              value={assessment.companyName}
              onChange={(event) => update("companyName", event.target.value)}
              placeholder="Example: Infosys, Accenture, Microsoft"
            />
          </label>
          <p className="privacy-note">
            This stays in your local Karma profile. When company watch is enabled, Karma uses it to request Google News
            source headlines for your dashboard.
          </p>
          <dl className="profile-list">
            <div>
              <dt>Name</dt>
              <dd>{assessment.nickname || "Not provided"}</dd>
            </div>
            <div>
              <dt>Track</dt>
              <dd>{segments[assessment.segment].label}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{role.title}</dd>
            </div>
            <div>
              <dt>Score</dt>
              <dd>
                {score.safetyScore}/10 ({score.rag})
              </dd>
            </div>
          </dl>
        </div>
        <div className="panel">
          <h2>Data controls</h2>
          <p>Export a local JSON backup or purge browser storage and IndexedDB from this device.</p>
          <div className="actions-row">
            <button className="secondary-btn" onClick={exportBackup}>
              Export Private Backup
            </button>
            <button className="danger-btn" onClick={purgeFootprint}>
              Purge My Footprint
            </button>
          </div>
        </div>
        <div className="panel">
          <p className="eyebrow">{moveCopyForSegment(assessment.segment).label}</p>
          <h2>Job Search</h2>
          <p>{moveCopyForSegment(assessment.segment).body}</p>
          <button className="primary-btn" onClick={() => { window.location.href = "/move"; }}>
            {moveCopyForSegment(assessment.segment).cta}
          </button>
        </div>
      </section>

      <section className="restricted-panel">
        <button className="restricted-toggle" onClick={() => setShowRestricted(!showRestricted)}>
          Restricted Developer Section
        </button>
        {showRestricted && (
          <div className="restricted-grid">
            <FounderPanel score={score} />
            <AdminPanel setView={setView} />
          </div>
        )}
      </section>
    </div>
  );
}

function FounderPanel({ score }: { score: Score }) {
  return (
    <div className="panel">
      <h2>Founder GTM Dashboard</h2>
      <div className="metric-row compact">
        <MetricCard label="Visitors" value="18,420" />
        <MetricCard label="Starts" value="6,240" />
        <MetricCard label="Shares" value="1,144" />
      </div>
      <p>FOMO hook: My Karma score is {score.safetyScore}/10. Check yours before the next restructure cycle.</p>
    </div>
  );
}

function AdminPanel({ setView }: { setView: (view: View) => void }) {
  return (
    <div className="panel">
      <h2>Admin Panel</h2>
      <Checklist items={["Pricing controls", "Legal copy versions", "Insight cache review", "Question bank"]} />
      <button className="secondary-btn" onClick={() => setView("market")}>
        Review Market Signals
      </button>
      <QuestionValidationPanel />
    </div>
  );
}

function QuestionValidationPanel() {
  const [copied, setCopied] = useState(false);
  const stats = questionBankStats();

  function downloadValidationPacket() {
    const payload = {
      ...buildValidationPacket(),
      masterPrompt: buildValidationPrompt(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "karma-question-bank-llm-validation.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyValidationPrompt() {
    const prompt = `${buildValidationPrompt()}\n\nQUESTION_BANK_JSON:\n${JSON.stringify(buildValidationPacket(), null, 2)}`;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="validation-console">
      <div>
        <p className="eyebrow">LLM validation council</p>
        <h3>First-time question bank audit</h3>
        <p>
          Export once, ask each LLM for a strict JSON review, then merge only the strongest suggestions into Karma.
        </p>
      </div>
      <div className="validation-stats">
        <span>{stats.segments} tracks</span>
        <span>{stats.roles} roles</span>
        <span>{stats.questions} questions</span>
        <span>{stats.atoms} atoms</span>
      </div>
      <div className="llm-grid">
        {llmValidators.map((validator) => (
          <article key={validator.name}>
            <strong>{validator.name}</strong>
            <span>{validator.strength}</span>
          </article>
        ))}
      </div>
      <div className="prompt-preview">
        <strong>Validation rule</strong>
        <span>No exact salary, employer, manager name, CV, or sensitive personal history. Review for usefulness, privacy, realism, and emotional safety.</span>
      </div>
      <div className="actions-row">
        <button className="secondary-btn" onClick={downloadValidationPacket}>
          Export Validation Packet
        </button>
        <button className="primary-btn" onClick={copyValidationPrompt}>
          {copied ? "Copied" : "Copy LLM Prompt"}
        </button>
      </div>
    </section>
  );
}

function MissionCard({ week, title, items }: { week: string; title: string; items: string[] }) {
  return (
    <article className="mission-card">
      <span>{week}</span>
      <h2>{title}</h2>
      <Checklist items={items} />
    </article>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="check-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
