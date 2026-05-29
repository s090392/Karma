import styles from "./page.module.css";

const exams = ["CAT", "GMAT", "GRE", "SAT", "Banking", "SSC", "IELTS", "NEET"];

const factoryStats = [
  { label: "Daily drill cycles", value: "18K+" },
  { label: "Weak topics isolated", value: "94%" },
  { label: "Average focus sprint", value: "27m" },
  { label: "Adaptive mocks shipped", value: "6.2K" },
];

const lanes = [
  {
    label: "Diagnose",
    title: "Find the score leak",
    copy: "InvisibleGuru reads attempts, time loss, and hesitation patterns to identify the exact chapters bleeding marks.",
  },
  {
    label: "Drill",
    title: "Run precision reps",
    copy: "Micro-drills hit one weakness at a time with timer pressure, instant explanations, and retry loops.",
  },
  {
    label: "Mock",
    title: "Simulate the real room",
    copy: "Exam-grade mocks adjust difficulty, section order, and fatigue load until the candidate is test-hardened.",
  },
  {
    label: "Pass",
    title: "Ship the outcome",
    copy: "The dashboard shows readiness, risk zones, and the next highest-return action. No motivational clutter.",
  },
];

const missions = [
  "Quant speed lock",
  "Verbal accuracy grid",
  "Data interpretation attack map",
  "Formula recall bunker",
  "Elimination technique lab",
  "Mock recovery protocol",
];

export default function InvisibleGuruPage() {
  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <nav className={styles.nav} aria-label="InvisibleGuru navigation">
          <a className={styles.brand} href="#top" aria-label="InvisibleGuru home">
            <span className={styles.mark}>
              <i />
            </span>
            <span>
              <strong>InvisibleGuru</strong>
              <small>Stealth test prep command center</small>
            </span>
          </a>
          <div className={styles.navLinks}>
            <a href="#factory">Factory</a>
            <a href="#missions">Missions</a>
            <a href="#readiness">Readiness</a>
            <a href="#pricing">Plans</a>
          </div>
          <a className={styles.navCta} href="#factory">Start diagnostic</a>
        </nav>

        <div className={styles.heroGrid} id="top">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>High-efficiency exam ops</p>
            <h1>Pass faster. Waste fewer attempts.</h1>
            <p>
              InvisibleGuru is a stealth-tech test prep platform built like a passing factory: diagnose the leak,
              drill the weakness, simulate pressure, and ship readiness with ruthless clarity.
            </p>
            <div className={styles.heroActions}>
              <a href="#factory">Run my first scan</a>
              <a href="#readiness">View readiness system</a>
            </div>
          </div>

          <div className={styles.commandPanel} aria-label="Live student command panel">
            <div className={styles.panelHeader}>
              <span>Candidate X-104</span>
              <strong>Readiness: 82%</strong>
            </div>
            <div className={styles.radar}>
              <span />
              <span />
              <span />
              <i />
            </div>
            <div className={styles.signalList}>
              <p><strong>Leak detected</strong><span>Quant: time lost on ratio traps</span></p>
              <p><strong>Next action</strong><span>14-question speed drill, 11 min cap</span></p>
              <p><strong>Risk</strong><span>Verbal accuracy drops after minute 32</span></p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.examStrip} aria-label="Supported exam tracks">
        {exams.map((exam) => (
          <span key={exam}>{exam}</span>
        ))}
      </section>

      <section className={styles.statsGrid} id="factory">
        {factoryStats.map((stat) => (
          <article key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </section>

      <section className={styles.factorySection}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Passing factory</p>
          <h2>One streamlined loop. No academic maze.</h2>
          <p>
            The product experience is designed for candidates who need progress, not a library. Every screen pushes
            toward a measurable next action.
          </p>
        </div>
        <div className={styles.laneGrid}>
          {lanes.map((lane, index) => (
            <article key={lane.label}>
              <span>0{index + 1} / {lane.label}</span>
              <h3>{lane.title}</h3>
              <p>{lane.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.opsGrid} id="missions">
        <div className={styles.missionPanel}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Mission queue</p>
            <h2>Today&apos;s highest-return work</h2>
          </div>
          <div className={styles.missionList}>
            {missions.map((mission, index) => (
              <div key={mission}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{mission}</strong>
                <em>{index < 2 ? "Critical" : index < 4 ? "Active" : "Standby"}</em>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.mockPanel}>
          <span>Mock engine</span>
          <h2>Pressure simulation calibrated.</h2>
          <div className={styles.progressStack}>
            <p><strong>Accuracy</strong><i style={{ "--value": "78%" } as React.CSSProperties} /></p>
            <p><strong>Speed</strong><i style={{ "--value": "64%" } as React.CSSProperties} /></p>
            <p><strong>Stamina</strong><i style={{ "--value": "83%" } as React.CSSProperties} /></p>
            <p><strong>Review discipline</strong><i style={{ "--value": "71%" } as React.CSSProperties} /></p>
          </div>
        </div>
      </section>

      <section className={styles.readiness} id="readiness">
        <div>
          <p className={styles.eyebrow}>Readiness OS</p>
          <h2>A dashboard that tells students exactly what to do next.</h2>
          <p>
            The interface removes decision fatigue. Students see readiness, topic leaks, mock risk, and the next drill
            that can move the score today.
          </p>
        </div>
        <div className={styles.readinessCard}>
          <span>Pass probability</span>
          <strong>High</strong>
          <p>3 weak zones left. 9 days to test date. Recommended pace: 2 mocks, 11 drills, 4 review blocks.</p>
        </div>
      </section>

      <section className={styles.pricing} id="pricing">
        <div>
          <p className={styles.eyebrow}>Launch offer</p>
          <h2>Built for serious candidates and coaching teams.</h2>
        </div>
        <a href="#top">Deploy the diagnostic</a>
      </section>
    </main>
  );
}
