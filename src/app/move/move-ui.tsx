"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  defaultMoveProfile,
  estimateTokenCost,
  gradeFor,
  moveCompanySuggestions,
  movePriorityOptions,
  moveStatuses,
  moveStorageKeys,
  recommendationFor,
  sampleMoveJobs,
  type MoveCompanyTier,
  type MoveEvaluation,
  type MoveJob,
  type MoveProfile,
  type MoveStatus,
} from "@/lib/move";

type KarmaSegment = "outsourcing" | "fresher" | "manager" | "robotics";

type KarmaAssessmentSnapshot = {
  segment: KarmaSegment;
  roleId?: string;
  nickname?: string;
};

const defaultAssessmentSnapshot: KarmaAssessmentSnapshot = { segment: "manager", roleId: "delivery-manager" };

function loadAssessmentSnapshot() {
  if (typeof window === "undefined") return defaultAssessmentSnapshot;
  try {
    return { ...defaultAssessmentSnapshot, ...JSON.parse(window.localStorage.getItem("karma:assessment") || "{}") } as KarmaAssessmentSnapshot;
  } catch {
    return defaultAssessmentSnapshot;
  }
}

function moveGuidance(segment: KarmaSegment) {
  const guidance: Record<KarmaSegment, { label: string; title: string; body: string; setup: string; examples: string[]; priority: "highest" | "standard" }> = {
    fresher: {
      label: "Highest relevance: Freshers",
      title: "Your first-job command centre",
      body: "KARMA Move helps freshers avoid random applications. It scores openings, shows which roles fit your stream and proof, and prepares better applications.",
      setup: "We need 5 minutes to understand your target role, city, college proof, internships, and first-job preferences.",
      examples: ["Find realistic first roles", "Avoid weak mass-apply openings", "Prepare fresher-friendly CV proof"],
      priority: "highest",
    },
    manager: {
      label: "Highest relevance: Mid and senior managers",
      title: "Your market optionality command centre",
      body: "KARMA Move is especially useful for managers who need options before restructuring pressure arrives. It filters senior roles and helps shape a stronger transition story.",
      setup: "We need 5 minutes to understand your target roles, locations, leadership proof, and companies to watch.",
      examples: ["Test the external market", "Filter weak senior roles", "Prepare stronger leadership applications"],
      priority: "highest",
    },
    outsourcing: {
      label: "Available for BPO and outsourcing",
      title: "Your safer-role search assistant",
      body: "KARMA Move helps outsourcing professionals compare roles where judgment, controls, client handling, and domain skill are valued.",
      setup: "We need 5 minutes to understand your target roles, locations, process skills, and companies to watch.",
      examples: ["Find roles with more judgment", "Compare finance/support openings", "Prepare role-specific applications"],
      priority: "standard",
    },
    robotics: {
      label: "Available for robotics-exposed work",
      title: "Your operations career-move assistant",
      body: "KARMA Move helps automation-exposed workers compare roles where safety, troubleshooting, supervision, and process ownership matter.",
      setup: "We need 5 minutes to understand your target operations roles, locations, systems, and companies to watch.",
      examples: ["Find safer operations roles", "Compare automation exposure", "Prepare practical proof for applications"],
      priority: "standard",
    },
  };
  return guidance[segment];
}

function suggestedMoveProfile(assessment: KarmaAssessmentSnapshot): MoveProfile {
  const base = defaultMoveProfile();
  if (assessment.segment === "fresher") {
    return {
      ...base,
      targetRoles: ["Graduate Trainee", "Junior Analyst", "Associate"],
      locations: ["Bangalore", "Mumbai", "Remote"],
      minSalary: "Rs 8-15L",
      proofPoints: ["Built a college project or internship proof that can be shown to recruiters", "", ""],
    };
  }
  if (assessment.segment === "manager") {
    return {
      ...base,
      targetRoles: ["Program Manager", "Delivery Manager", "FP&A Manager"],
      locations: ["Mumbai", "Bangalore", "Remote"],
      minSalary: "Rs 25-40L",
      proofPoints: ["Improved delivery, margin, risk, or team outcomes with measurable impact", "", ""],
    };
  }
  if (assessment.segment === "robotics") {
    return {
      ...base,
      targetRoles: ["Operations Supervisor", "Process Excellence Lead", "Automation Support Lead"],
      locations: ["Pune", "Bangalore", "Hybrid"],
      minSalary: "Rs 8-15L",
      proofPoints: ["Reduced downtime, improved safety, or handled process exceptions in operations", "", ""],
    };
  }
  return base;
}

function loadProfile() {
  if (typeof window === "undefined") return defaultMoveProfile();
  try {
    const saved = window.localStorage.getItem(moveStorageKeys.profile);
    const assessment = loadAssessmentSnapshot();
    return { ...suggestedMoveProfile(assessment), ...(saved ? JSON.parse(saved) : {}) } as MoveProfile;
  } catch {
    return defaultMoveProfile();
  }
}

function saveProfile(profile: MoveProfile) {
  window.localStorage.setItem(moveStorageKeys.profile, JSON.stringify(profile));
}

function loadPipeline() {
  if (typeof window === "undefined") return [] as MoveJob[];
  try {
    return JSON.parse(window.localStorage.getItem(moveStorageKeys.pipeline) || "[]") as MoveJob[];
  } catch {
    return [];
  }
}

function savePipeline(jobs: MoveJob[]) {
  window.localStorage.setItem(moveStorageKeys.pipeline, JSON.stringify(jobs));
}

function upsertJob(job: MoveJob) {
  const jobs = loadPipeline();
  const next = [job, ...jobs.filter((item) => item.id !== job.id)];
  savePipeline(next);
  return next;
}

function gradeClass(grade?: string) {
  return `move-grade grade-${(grade || "C").toLowerCase()}`;
}

function TagInput({ label, values, placeholder, onChange }: { label: string; values: string[]; placeholder: string; onChange: (values: string[]) => void }) {
  const [draft, setDraft] = useState("");
  function add(value = draft) {
    const clean = value.trim();
    if (!clean) return;
    onChange([...values.filter((item) => item.toLowerCase() !== clean.toLowerCase()), clean]);
    setDraft("");
  }
  return (
    <label className="move-field">
      {label}
      <div className="move-chip-input">
        {values.map((value) => (
          <button key={value} type="button" onClick={() => onChange(values.filter((item) => item !== value))}>
            {value} x
          </button>
        ))}
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
      </div>
    </label>
  );
}

export function MoveDashboard() {
  const [profile, setProfile] = useState<MoveProfile>(defaultMoveProfile());
  const [jobs, setJobs] = useState<MoveJob[]>([]);
  const [assessment, setAssessment] = useState<KarmaAssessmentSnapshot>(defaultAssessmentSnapshot);
  useEffect(() => {
    setProfile(loadProfile());
    setJobs(loadPipeline());
    setAssessment(loadAssessmentSnapshot());
  }, []);
  const evaluated = jobs.filter((job) => job.status === "evaluated" || job.evaluation);
  const applied = jobs.filter((job) => job.status === "applied");
  const interviews = jobs.filter((job) => job.status === "interview");
  const avg = evaluated.length ? evaluated.reduce((sum, job) => sum + (job.evaluation?.overallScore || 0), 0) / evaluated.length : 0;
  const conversion = evaluated.length ? Math.round((applied.length / evaluated.length) * 100) : 0;
  const guidance = moveGuidance(assessment.segment);

  return (
    <main className="move-shell">
      <MoveHeader assessment={assessment} />
      <section className={`move-relevance-card ${guidance.priority}`}>
        <div>
          <p>{guidance.label}</p>
          <h2>{guidance.title}</h2>
          <span>{guidance.body}</span>
        </div>
        <ul>
          {guidance.examples.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
      {!profile.setupComplete ? (
        <section className="move-panel setup-prompt">
          <h2>{guidance.setup}</h2>
          <p>The more context you give Karma about your experience and proof points, the more accurate your scores become.</p>
          <Link className="move-primary" href="/move/setup">
            Set Up My Job Search
          </Link>
        </section>
      ) : (
        <>
          <section className="move-stats">
            <Stat label="Jobs Evaluated" value={String(evaluated.length)} />
            <Stat label="Applications Sent" value={String(applied.length)} />
            <Stat label="Interviews Booked" value={String(interviews.length)} />
            <Stat label="Average Match Score" value={avg ? `${avg.toFixed(1)}/5` : "-"} />
          </section>
          <section className="move-funnel move-panel">
            <h2>Santiago's real 2026 funnel</h2>
            <p>740 evaluated - 66 applied (9%) - 12 interviews - 1 offer (Head of AI)</p>
            <div className="funnel-bars">
              <span style={{ width: "100%" }}>740 evaluated</span>
              <span style={{ width: "36%" }}>66 applied</span>
              <span style={{ width: "18%" }}>12 interviews</span>
              <span style={{ width: "8%" }}>1 offer</span>
            </div>
            <p>Your funnel: {evaluated.length} evaluated - {applied.length} applied ({conversion}%) - {interviews.length} interviews</p>
          </section>
          <section className="move-actions-row">
            <Link className="move-primary" href="/move/search">Find New Roles</Link>
            <Link className="move-secondary" href="/move/pipeline">View My Pipeline</Link>
            <Link className="move-secondary" href="/move/setup">Resume Search Settings</Link>
          </section>
          <section className="move-panel">
            <h2>Recent pipeline</h2>
            <div className="move-list">
              {jobs.slice(0, 5).map((job) => <JobMini key={job.id} job={job} />)}
              {!jobs.length && <p>No applications yet. Start by evaluating a few roles.</p>}
            </div>
          </section>
          <section className="concierge-card">
            <h2>Need help doing all of this?</h2>
            <p>Our Concierge service does the whole job search with you via WhatsApp. Designed for professionals who have not job-searched in 10+ years. Rs 4,999/month.</p>
            <a href="https://wa.me/?text=Hi%2C%20I%20am%20interested%20in%20KARMA%20Concierge.%20I%20found%20it%20on%20mykarma.work." target="_blank" rel="noreferrer">Talk to a KARMA Advisor</a>
          </section>
        </>
      )}
      <p className="move-attribution">KARMA Move is built on the intelligence framework from <a href="https://github.com/santifer/career-ops" target="_blank" rel="noreferrer">career-ops</a> by Santiago Fernandez de Valderrama, published under MIT licence.</p>
    </main>
  );
}

function MoveHeader({ assessment = defaultAssessmentSnapshot }: { assessment?: KarmaAssessmentSnapshot }) {
  const guidance = moveGuidance(assessment.segment);
  return (
    <header className="move-hero">
      <Link href="/" className="move-home-link">Karma</Link>
      <h1>KARMA Move</h1>
      <p>{guidance.body} Available for every Karma category, with highest relevance for freshers and mid/senior managers.</p>
      <small>Intelligence adapted from career-ops by Santiago Fernandez de Valderrama (MIT licence)</small>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <article><span>{label}</span><strong>{value}</strong></article>;
}

function JobMini({ job }: { job: MoveJob }) {
  return (
    <Link href={`/move/apply/${job.id}`} className="job-mini">
      <span className={gradeClass(job.evaluation?.grade)}>{job.evaluation?.grade || job.grade || "C"}</span>
      <strong>{job.jobTitle}</strong>
      <em>{job.company} - {job.status || "evaluated"}</em>
    </Link>
  );
}

export function MoveSetup() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<MoveProfile>(defaultMoveProfile());
  const [draftCompany, setDraftCompany] = useState("");
  useEffect(() => setProfile(loadProfile()), []);
  const progress = Math.round(((step + 1) / 5) * 100);
  function update(next: Partial<MoveProfile>) {
    setProfile((current) => ({ ...current, ...next }));
  }
  function addCompany(name: string) {
    const clean = name.trim();
    if (!clean) return;
    update({ companies: [...profile.companies.filter((company) => company.name.toLowerCase() !== clean.toLowerCase()), { name: clean, tier: "C" }] });
    setDraftCompany("");
  }
  function cycleTier(name: string) {
    const order: MoveCompanyTier[] = ["A", "B", "C", "X"];
    update({ companies: profile.companies.map((company) => (company.name === name ? { ...company, tier: order[(order.indexOf(company.tier) + 1) % order.length] } : company)) });
  }
  function finish() {
    saveProfile({ ...profile, setupComplete: true });
    window.location.href = "/move/search";
  }
  return (
    <main className="move-shell">
      <MoveHeader />
      <div className="move-progress"><span style={{ width: `${progress}%` }} /></div>
      <section className="move-panel move-setup-card">
        {step === 0 && (
          <>
            <h2>What are you looking for?</h2>
            <TagInput label="Target role title(s)" values={profile.targetRoles} placeholder="Finance Controls Analyst" onChange={(targetRoles) => update({ targetRoles })} />
            <TagInput label="Preferred locations" values={profile.locations} placeholder="Mumbai, Remote" onChange={(locations) => update({ locations })} />
            <label className="move-field">Work type preference<select value={profile.workType} onChange={(event) => update({ workType: event.target.value })}><option>On-site</option><option>Hybrid</option><option>Remote</option><option>No preference</option></select></label>
            <label className="move-field">Minimum salary<select value={profile.minSalary} onChange={(event) => update({ minSalary: event.target.value })}><option>Under Rs 8L</option><option>Rs 8-15L</option><option>Rs 15-25L</option><option>Rs 25-40L</option><option>Rs 40L+</option></select></label>
          </>
        )}
        {step === 1 && (
          <>
            <h2>Drag to rank what matters most in your next role</h2>
            <p>Use the up/down buttons to rank priorities. Higher rank increases score weighting.</p>
            <div className="ranking-list">
              {profile.priorityRanking.map((item, index) => (
                <div key={item}><strong>{index + 1}. {item}</strong><button onClick={() => update({ priorityRanking: moveItem(profile.priorityRanking, index, Math.max(0, index - 1)) })}>Up</button><button onClick={() => update({ priorityRanking: moveItem(profile.priorityRanking, index, Math.min(profile.priorityRanking.length - 1, index + 1)) })}>Down</button></div>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2>Your CV and story</h2>
            <label className="move-upload">Upload CV<input type="file" accept=".pdf,.docx" onChange={(event) => update({ cvFileName: event.target.files?.[0]?.name })} /><span>{profile.cvFileName || "Parsed locally on your device. Never sent to our servers."}</span></label>
            <label className="move-field">Career story<textarea maxLength={1200} value={profile.careerStory} onChange={(event) => update({ careerStory: event.target.value })} /></label>
            {profile.proofPoints.map((point, index) => <label className="move-field" key={index}>Proof point {index + 1}<input value={point} onChange={(event) => update({ proofPoints: profile.proofPoints.map((p, i) => (i === index ? event.target.value : p)) })} /></label>)}
            <label className="move-field">What to avoid<textarea value={profile.avoidList} onChange={(event) => update({ avoidList: event.target.value })} /></label>
          </>
        )}
        {step === 3 && (
          <>
            <h2>Companies to watch</h2>
            <div className="company-entry"><input value={draftCompany} onChange={(event) => setDraftCompany(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCompany(draftCompany); } }} placeholder="Type company and press Enter" /><button onClick={() => addCompany(draftCompany)}>Add</button></div>
            <div className="suggestion-row">{moveCompanySuggestions.map((company) => <button key={company} onClick={() => addCompany(company)}>{company}</button>)}</div>
            <div className="company-tier-grid">{profile.companies.map((company) => <button className={`tier-${company.tier.toLowerCase()}`} key={company.name} onClick={() => cycleTier(company.name)}>{company.name}<span>Tier {company.tier}</span></button>)}</div>
          </>
        )}
        {step === 4 && (
          <>
            <h2>Your job search profile is ready.</h2>
            <Summary profile={profile} />
            <button className="move-primary" onClick={finish}>Start Finding Roles</button>
          </>
        )}
        <div className="move-actions-row">
          <button className="move-secondary" disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1))}>Back</button>
          {step < 4 && <button className="move-primary" onClick={() => { saveProfile(profile); setStep(step + 1); }}>Continue</button>}
        </div>
      </section>
    </main>
  );
}

function moveItem(items: string[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function Summary({ profile }: { profile: MoveProfile }) {
  return <div className="move-summary"><p><strong>Roles:</strong> {profile.targetRoles.join(", ")}</p><p><strong>Locations:</strong> {profile.locations.join(", ")}</p><p><strong>Companies:</strong> {profile.companies.map((c) => `${c.name} (${c.tier})`).join(", ")}</p></div>;
}

export function MoveSearch() {
  const [profile, setProfile] = useState<MoveProfile>(defaultMoveProfile());
  const [jobs, setJobs] = useState<MoveJob[]>([]);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [jd, setJd] = useState("");
  const [batch, setBatch] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const loaded = loadProfile();
    setProfile(loaded);
    setQuery(loaded.targetRoles.join(", "));
    setLocation(loaded.locations.join(", "));
    setJobs(sampleMoveJobs.map((job) => ({ ...job, evaluation: undefined })));
  }, []);
  async function evaluate(text: string) {
    setLoading(true);
    const response = await fetch("/api/move/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobDescription: text, moveProfile: profile }) });
    const payload = await response.json();
    const job = payload.job as MoveJob;
    setJobs((current) => [job, ...current]);
    upsertJob(job);
    setLoading(false);
  }
  async function searchUrls() {
    const response = await fetch(`/api/move/jobs?role=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&source=Naukri,LinkedIn,Indeed,Shine,Foundit,iimjobs,Glassdoor`);
    const payload = await response.json();
    (payload.searchUrls as { url: string }[]).forEach((item) => window.open(item.url, "_blank"));
  }
  return (
    <main className="move-shell">
      <MoveHeader />
      <section className="move-search-layout">
        <aside className="move-panel search-controls">
          <h2>Search controls</h2>
          <label className="move-field">Search query<input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <label className="move-field">Location<input value={location} onChange={(event) => setLocation(event.target.value)} /></label>
          <label className="move-field">Date posted<select><option>Any</option><option>Last 24h</option><option>Last 7 days</option><option>Last 30 days</option></select></label>
          <label className="move-field">Minimum score<select><option>Show all</option><option>B+ only (4.0+)</option><option>A only (4.5+)</option></select></label>
          <button className="move-primary" onClick={searchUrls}>Search Now</button>
          <details open><summary>Paste a job URL or description</summary><textarea value={jd} onChange={(event) => setJd(event.target.value)} placeholder="Paste full job description here" /><p className="cost-note">This will use approximately {estimateTokenCost(jd).tokens} tokens (~Rs {estimateTokenCost(jd).rupees}).</p><button className="move-primary" disabled={!jd || loading} onClick={() => evaluate(jd)}>Evaluate This Job</button></details>
          <details><summary>Paste up to 10 job descriptions</summary><textarea value={batch} onChange={(event) => setBatch(event.target.value)} /><button className="move-secondary" onClick={() => batch.split(/\n\n+/).slice(0, 10).forEach(evaluate)}>Evaluate All</button></details>
          <p className="move-tip">This is NOT a spray-and-pray tool. It is a filter.</p>
        </aside>
        <section className="move-results">
          {loading && <div className="move-panel">Evaluating role...</div>}
          {jobs.map((job) => <JobScoreCard key={job.id} job={job} onSave={() => { const saved = { ...job, status: "saved" as MoveStatus }; upsertJob(saved); setJobs((current) => current.map((item) => item.id === job.id ? saved : item)); }} onDismiss={() => setJobs((current) => current.filter((item) => item.id !== job.id))} />)}
        </section>
      </section>
    </main>
  );
}

function JobScoreCard({ job, onSave, onDismiss }: { job: MoveJob; onSave: () => void; onDismiss: () => void }) {
  const evaluation = job.evaluation || { overallScore: 0, grade: "C" as const, dimensions: undefined, recommendation: "Evaluate this role to see the score." };
  return (
    <article className="job-score-card">
      <div className="job-card-head"><span className={gradeClass(evaluation.grade)}>{evaluation.grade}</span><div><h2>{job.company} - {job.jobTitle}</h2><p>{job.location} - {job.salaryRange} - {job.postedDate}</p></div></div>
      <strong className="overall-score">Overall score: {evaluation.overallScore ? `${evaluation.overallScore}/5.0` : "Not evaluated"}</strong>
      {evaluation.dimensions && <DimensionBars evaluation={evaluation as MoveEvaluation} />}
      <p>{evaluation.recommendation || recommendationFor(evaluation.overallScore)}</p>
      <div className="move-actions-row"><button className="move-secondary">Evaluate</button><button className="move-primary" onClick={onSave}>Save</button><button className="move-secondary" onClick={onDismiss}>Dismiss</button></div>
    </article>
  );
}

function DimensionBars({ evaluation }: { evaluation: MoveEvaluation }) {
  return <div className="dimension-bars">{Object.entries(evaluation.dimensions).map(([key, value]) => <div key={key}><span>{key.slice(0, 8)}</span><i><b style={{ width: `${(value.score / 5) * 100}%` }} /></i><em>{value.score}/5</em></div>)}</div>;
}

export function MovePipeline() {
  const [jobs, setJobs] = useState<MoveJob[]>([]);
  useEffect(() => setJobs(loadPipeline()), []);
  function updateStatus(id: string, status: MoveStatus) {
    const job = jobs.find((item) => item.id === id);
    if (status === "applied" && job?.evaluation && job.evaluation.overallScore < 4 && !window.confirm("This role scored below 4.0/5. Are you sure? Focusing on stronger matches improves your success rate.")) return;
    const next = jobs.map((item) => item.id === id ? { ...item, status } : item);
    setJobs(next);
    savePipeline(next);
  }
  return (
    <main className="move-shell">
      <MoveHeader />
      <section className="pipeline-header move-panel"><h2>{jobs.length} evaluated / {jobs.filter((j) => j.status === "applied").length} applied / {jobs.filter((j) => j.status === "interview").length} interviews</h2><Link className="move-primary" href="/move/search">Find More Roles</Link></section>
      <section className="kanban-board">
        {moveStatuses.map((status) => {
          const lane = jobs.filter((job) => (job.status || "evaluated") === status.id);
          return <div className="kanban-column" key={status.id}><h3>{status.label} <span>{lane.length}</span></h3>{lane.map((job) => <article className="kanban-card" key={job.id}><span className={gradeClass(job.evaluation?.grade)}>{job.evaluation?.grade || "C"}</span><strong>{job.jobTitle}</strong><p>{job.company}</p><select value={job.status || "evaluated"} onChange={(event) => updateStatus(job.id, event.target.value as MoveStatus)}>{moveStatuses.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><Link href={`/move/apply/${job.id}`}>Apply workspace</Link></article>)}</div>;
        })}
      </section>
      <p className="move-tip">Career-ops recommends: only apply to roles scoring B or above (4.0/5.0+). Your time is valuable. So is the recruiter's.</p>
    </main>
  );
}

export function MoveApply({ id }: { id: string }) {
  const [jobs, setJobs] = useState<MoveJob[]>([]);
  const [tab, setTab] = useState<"score" | "documents" | "track">("score");
  const [cover, setCover] = useState("");
  const [cv, setCv] = useState<unknown>(null);
  const [questions, setQuestions] = useState("");
  const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);
  useEffect(() => setJobs(loadPipeline()), []);
  const job = jobs.find((item) => item.id === id) || sampleMoveJobs.find((item) => item.id === id) || jobs[0];
  if (!job) return <main className="move-shell"><MoveHeader /><section className="move-panel">Job not found.</section></main>;
  const profile = loadProfile();
  async function generateCv() {
    const response = await fetch("/api/move/generate-cv", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ job, moveProfile: profile }) });
    setCv((await response.json()).cv);
  }
  async function generateCover() {
    const response = await fetch("/api/move/cover-letter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ job, moveProfile: profile }) });
    setCover((await response.json()).coverLetter);
  }
  async function generateAnswers() {
    const response = await fetch("/api/move/form-answers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ job, moveProfile: profile, questions: questions.split("\n").filter(Boolean) }) });
    setAnswers((await response.json()).answers);
  }
  return (
    <main className="move-shell">
      <MoveHeader />
      <section className="move-panel"><h2>{job.jobTitle} at {job.company}</h2><div className="move-tabs"><button onClick={() => setTab("score")}>Score</button><button onClick={() => setTab("documents")}>Documents</button><button onClick={() => setTab("track")}>Track</button></div></section>
      {tab === "score" && <section className="move-panel">{job.evaluation ? <><DimensionBars evaluation={job.evaluation} /><h3>Recommendation</h3><p>{job.evaluation.recommendation}</p><h3>Red flags</h3><Checklist items={job.evaluation.redFlags} /><h3>Green flags</h3><Checklist items={job.evaluation.greenFlags} /></> : <p>No evaluation found.</p>}</section>}
      {tab === "documents" && <section className="documents-grid"><div className="move-panel"><h2>Tailored CV</h2><button className="move-primary" onClick={generateCv}>Generate My Tailored CV</button>{Boolean(cv) && <pre>{JSON.stringify(cv, null, 2)}</pre>}</div><div className="move-panel"><h2>Cover Letter</h2><button className="move-primary" onClick={generateCover}>Generate Cover Letter</button><textarea value={cover} onChange={(event) => setCover(event.target.value)} /><button onClick={() => navigator.clipboard.writeText(cover)}>Copy</button></div><div className="move-panel"><h2>Form Answers</h2><textarea value={questions} onChange={(event) => setQuestions(event.target.value)} placeholder="Paste application questions here" /><button className="move-primary" onClick={generateAnswers}>Generate Answers</button>{answers.map((answer) => <label className="move-field" key={answer.question}>{answer.question}<textarea value={answer.answer} readOnly /></label>)}</div></section>}
      {tab === "track" && <TrackForm job={job} jobs={jobs} setJobs={setJobs} />}
    </main>
  );
}

function TrackForm({ job, jobs, setJobs }: { job: MoveJob; jobs: MoveJob[]; setJobs: (jobs: MoveJob[]) => void }) {
  const [status, setStatus] = useState<MoveStatus>((job.status || "evaluated") as MoveStatus);
  const [notes, setNotes] = useState(job.notes || "");
  function save() {
    const next = jobs.map((item) => item.id === job.id ? { ...item, status, notes } : item);
    setJobs(next);
    savePipeline(next);
  }
  return <section className="move-panel"><label className="move-field">Status<select value={status} onChange={(event) => setStatus(event.target.value as MoveStatus)}>{moveStatuses.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label className="move-field">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} /></label><button className="move-primary" onClick={save}>Save</button><p className="move-tip">Always review before submitting. Karma prepares documents. The human submits.</p></section>;
}

function Checklist({ items }: { items: string[] }) {
  return <ul className="move-checklist">{items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>None</li>}</ul>;
}
