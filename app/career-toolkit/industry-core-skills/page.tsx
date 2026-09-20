"use client";

import { FormEvent, useState } from "react";

type CareerResult = {
  occupationTitle: string;
  overview: string;
  coreSkills: string[];
  softSkills: string[];
  transferableSkills: {
    skill: string;
    explanation: string;
  }[];
  technologySkills: string[];
  technologyNote?: string;
  wageTrends: {
    medianHourly: string;
    medianAnnual: string;
    employmentLevel: string;
    projectedGrowth: string;
    projectedOpenings: string;
  };
  workAttire: string;
  interviewAttire: string;
};

export default function IndustryCoreSkillsPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [result, setResult] = useState<CareerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = jobTitle.trim();

    if (!title) {
      setError("Enter a job title to continue.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/career-snapshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: title,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.error ||
            "We couldn't generate your career snapshot. Please try again."
        );
      }

      const data = await response.json();

      setResult(data);

      setTimeout(() => {
        document.getElementById("career-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      {/* ABSTRACT BACKGROUND */}

      <div style={styles.blueGlow} />
      <div style={styles.grayGlow} />
      <div style={styles.gridPattern} />

      <div style={styles.shell}>
        {/* HERO */}

        <header style={styles.hero}>
          <a href="/career-toolkit" style={styles.backLink}>
            ← Career ToolKit
          </a>

          <p style={styles.kicker}>CAREER TOOLKIT</p>

          <h1 style={styles.title}>Industry Core Skills</h1>

          <p style={styles.subtitle}>
            Enter a job title to explore the skills, technology,
            wages, employment trends, and workplace expectations
            connected to that occupation.
          </p>
        </header>

        {/* GENERATOR */}

        <section style={styles.generator}>
          <form onSubmit={handleGenerate} style={styles.form}>
            <div style={styles.inputWrap}>
              <label htmlFor="jobTitle" style={styles.label}>
                Job Title
              </label>

              <input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(event) => {
                  setJobTitle(event.target.value);
                  setError("");
                }}
                placeholder="Example: IT Technician"
                autoComplete="off"
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.generateButton,
                ...(loading ? styles.disabledButton : {}),
              }}
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </form>

          <p style={styles.hint}>
            Enter one occupation or job title for the most relevant results.
          </p>

          {error && <div style={styles.error}>{error}</div>}
        </section>

        {/* EMPTY STATE */}

        {!result && !loading && (
          <section style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <span style={styles.searchCircle} />
              <span style={styles.searchHandle} />
            </div>

            <p style={styles.emptyKicker}>CAREER SNAPSHOT</p>

            <h2 style={styles.emptyTitle}>
              Start with the job you want to explore.
            </h2>

            <p style={styles.emptyText}>
              HireMinds will turn your job title into practical career
              information you can use for resume development, interview
              preparation, career planning, and your job search.
            </p>
          </section>
        )}

        {/* LOADING */}

        {loading && (
          <section style={styles.loadingState}>
            <div style={styles.loader} />

            <h2 style={styles.loadingTitle}>
              Building your career snapshot...
            </h2>

            <p style={styles.loadingText}>
              Reviewing the skills and career information connected to{" "}
              <strong>{jobTitle}</strong>.
            </p>
          </section>
        )}

        {/* RESULTS */}

        {result && !loading && (
          <section id="career-results" style={styles.results}>
            {/* OCCUPATION OVERVIEW */}

            <div style={styles.resultHero}>
              <p style={styles.resultKicker}>CAREER SNAPSHOT</p>

              <h2 style={styles.occupationTitle}>
                {result.occupationTitle}
              </h2>

              <div style={styles.overview}>
                <p style={styles.overviewLabel}>Occupation Overview</p>

                <p style={styles.overviewText}>{result.overview}</p>
              </div>
            </div>

            {/* CORE SKILLS */}

            <ResultSection
              title="Core Skills"
              description="Job-specific hard and technical skills connected to this occupation."
            >
              <SkillList skills={result.coreSkills} />
            </ResultSection>

            {/* SOFT SKILLS */}

            <ResultSection
              title="Soft Skills"
              description="People and workplace skills that support success in this role."
            >
              <SkillList skills={result.softSkills} />
            </ResultSection>

            {/* TRANSFERABLE SKILLS */}

            <ResultSection
              title="Transferable Skills"
              description="Skills from this occupation that can carry into other jobs and industries."
            >
              <div style={styles.transferGrid}>
                {result.transferableSkills.map((item) => (
                  <div key={item.skill} style={styles.transferItem}>
                    <h3 style={styles.transferTitle}>{item.skill}</h3>

                    <p style={styles.transferText}>{item.explanation}</p>
                  </div>
                ))}
              </div>
            </ResultSection>

            {/* SOFTWARE */}

            <ResultSection
              title="Software & Technology Skills"
              description="Relevant systems, software, technology, tools, platforms, or equipment commonly used in this occupation."
            >
              {result.technologySkills?.length > 0 ? (
                <SkillList skills={result.technologySkills} />
              ) : (
                <p style={styles.standardText}>
                  {result.technologyNote ||
                    "This occupation does not typically require specialized software or technology."}
                </p>
              )}
            </ResultSection>

            {/* WAGES */}

            <ResultSection
              title="Wage & Employment Trends"
              description="National career information. Actual wages and employment conditions vary by location, employer, experience, and industry."
            >
              <div style={styles.statsGrid}>
                <Stat
                  label="Median Hourly Wage"
                  value={result.wageTrends.medianHourly}
                />

                <Stat
                  label="Median Annual Wage"
                  value={result.wageTrends.medianAnnual}
                />

                <Stat
                  label="Employment Level"
                  value={result.wageTrends.employmentLevel}
                />

                <Stat
                  label="Projected Growth / Decline"
                  value={result.wageTrends.projectedGrowth}
                />

                <Stat
                  label="Projected Job Openings"
                  value={result.wageTrends.projectedOpenings}
                />
              </div>
            </ResultSection>

            {/* ATTIRE */}

            <ResultSection
              title="Work Attire & Interview Dress"
              description="Typical workplace clothing expectations and what to wear when interviewing for this type of role."
            >
              <div style={styles.attireGrid}>
                <div style={styles.attireBlock}>
                  <p style={styles.attireLabel}>Typical Work Attire</p>

                  <p style={styles.attireText}>{result.workAttire}</p>
                </div>

                <div style={styles.attireBlock}>
                  <p style={styles.attireLabel}>Interview Attire</p>

                  <p style={styles.attireText}>{result.interviewAttire}</p>
                </div>
              </div>
            </ResultSection>

            <div style={styles.disclaimer}>
              <div style={styles.hmMark}>HM</div>

              <p style={styles.disclaimerText}>
                Use this career snapshot as a guide. Job requirements,
                wages, technology, attire, and workplace expectations
                can vary by employer and location.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* RESULT SECTION                                                             */
/* -------------------------------------------------------------------------- */

function ResultSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section style={styles.resultSection}>
      <div style={styles.sectionHeading}>
        <h2 style={styles.sectionTitle}>{title}</h2>

        <p style={styles.sectionDescription}>{description}</p>
      </div>

      <div style={styles.sectionContent}>{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* SKILL LIST                                                                 */
/* -------------------------------------------------------------------------- */

function SkillList({ skills }: { skills: string[] }) {
  return (
    <div style={styles.skillList}>
      {skills.map((skill) => (
        <span key={skill} style={styles.skillTag}>
          {skill}
        </span>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STAT                                                                       */
/* -------------------------------------------------------------------------- */

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div style={styles.stat}>
      <p style={styles.statLabel}>{label}</p>
      <p style={styles.statValue}>{value}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
    background:
      "linear-gradient(180deg, #f8fbff 0%, #ffffff 42%, #f5f7fa 100%)",
    color: "#111827",
    padding: "34px 24px 80px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  blueGlow: {
    position: "absolute",
    width: "620px",
    height: "620px",
    top: "-330px",
    right: "-150px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(37,99,235,.14) 0%, rgba(37,99,235,.05) 42%, rgba(37,99,235,0) 72%)",
    pointerEvents: "none",
  },

  grayGlow: {
    position: "absolute",
    width: "500px",
    height: "500px",
    left: "-260px",
    top: "650px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(100,116,139,.10) 0%, rgba(100,116,139,0) 70%)",
    pointerEvents: "none",
  },

  gridPattern: {
    position: "absolute",
    top: "115px",
    right: "8%",
    width: "140px",
    height: "140px",
    opacity: 0.22,
    backgroundImage:
      "radial-gradient(#2563eb 1.4px, transparent 1.4px)",
    backgroundSize: "18px 18px",
    pointerEvents: "none",
  },

  shell: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "1220px",
    margin: "0 auto",
  },

  /* HERO */

  hero: {
    maxWidth: "830px",
    padding: "18px 0 34px",
  },

  backLink: {
    display: "inline-block",
    marginBottom: "32px",
    color: "#64748b",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
  },

  kicker: {
    margin: "0 0 12px",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: ".17em",
  },

  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "clamp(38px, 6vw, 60px)",
    lineHeight: 1.04,
    fontWeight: 750,
    letterSpacing: "-0.045em",
  },

  subtitle: {
    maxWidth: "750px",
    margin: "18px 0 0",
    color: "#64748b",
    fontSize: "17px",
    lineHeight: 1.7,
  },

  /* GENERATOR */

  generator: {
    marginTop: "8px",
    padding: "26px",
    background: "rgba(255,255,255,.88)",
    border: "1px solid #dbe3ee",
    borderRadius: "16px",
    boxShadow: "0 14px 45px rgba(15,23,42,.06)",
  },

  form: {
    display: "flex",
    alignItems: "flex-end",
    gap: "14px",
    flexWrap: "wrap",
  },

  inputWrap: {
    flex: "1 1 600px",
  },

  label: {
    display: "block",
    marginBottom: "9px",
    color: "#1e293b",
    fontSize: "13px",
    fontWeight: 700,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    height: "54px",
    padding: "0 17px",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    outline: "none",
    color: "#0f172a",
    fontSize: "16px",
  },

  generateButton: {
    height: "54px",
    padding: "0 32px",
    border: "1px solid #2563eb",
    borderRadius: "9px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 750,
    cursor: "pointer",
    boxShadow: "0 9px 22px rgba(37,99,235,.18)",
  },

  disabledButton: {
    opacity: 0.65,
    cursor: "not-allowed",
  },

  hint: {
    margin: "10px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
  },

  error: {
    marginTop: "18px",
    padding: "12px 14px",
    background: "#fff7f7",
    borderLeft: "3px solid #dc2626",
    color: "#991b1b",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  /* EMPTY */

  emptyState: {
    maxWidth: "720px",
    margin: "0 auto",
    padding: "90px 20px 70px",
    textAlign: "center",
  },

  emptyIcon: {
    position: "relative",
    width: "82px",
    height: "82px",
    margin: "0 auto 26px",
    borderRadius: "50%",
    background: "#eff6ff",
  },

  searchCircle: {
    position: "absolute",
    width: "27px",
    height: "27px",
    top: "22px",
    left: "22px",
    border: "5px solid #3b82f6",
    borderRadius: "50%",
  },

  searchHandle: {
    position: "absolute",
    width: "24px",
    height: "5px",
    top: "52px",
    left: "49px",
    borderRadius: "999px",
    background: "#2563eb",
    transform: "rotate(45deg)",
    transformOrigin: "left center",
  },

  emptyKicker: {
    margin: "0 0 10px",
    color: "#2563eb",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: ".16em",
  },

  emptyTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "28px",
    fontWeight: 750,
    letterSpacing: "-.025em",
  },

  emptyText: {
    maxWidth: "650px",
    margin: "14px auto 0",
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.75,
  },

  /* LOADING */

  loadingState: {
    padding: "90px 20px",
    textAlign: "center",
  },

  loader: {
    width: "38px",
    height: "38px",
    margin: "0 auto 20px",
    border: "4px solid #dbeafe",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
  },

  loadingTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "23px",
  },

  loadingText: {
    margin: "9px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  /* RESULTS */

  results: {
    marginTop: "54px",
    padding: "0 4px",
    scrollMarginTop: "30px",
  },

  resultHero: {
    maxWidth: "900px",
    paddingBottom: "42px",
  },

  resultKicker: {
    margin: "0 0 10px",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: ".16em",
  },

  occupationTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "clamp(34px, 5vw, 48px)",
    lineHeight: 1.08,
    fontWeight: 750,
    letterSpacing: "-.035em",
  },

  overview: {
    marginTop: "28px",
    paddingLeft: "18px",
    borderLeft: "3px solid #2563eb",
  },

  overviewLabel: {
    margin: "0 0 7px",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".08em",
  },

  overviewText: {
    margin: 0,
    color: "#475569",
    fontSize: "15px",
    lineHeight: 1.75,
  },

  /* RESULT SECTIONS */

  resultSection: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 290px) minmax(0, 1fr)",
    gap: "50px",
    padding: "34px 0",
    borderTop: "1px solid #e2e8f0",
  },

  sectionHeading: {
    alignSelf: "start",
  },

  sectionTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "20px",
    fontWeight: 750,
    lineHeight: 1.3,
  },

  sectionDescription: {
    margin: "8px 0 0",
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  sectionContent: {
    minWidth: 0,
  },

  /* SKILLS */

  skillList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "9px",
  },

  skillTag: {
    display: "inline-flex",
    alignItems: "center",
    minHeight: "34px",
    padding: "6px 12px",
    background: "#f8fafc",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    color: "#334155",
    fontSize: "13px",
    lineHeight: 1.35,
  },

  /* TRANSFERABLE */

  transferGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "8px 32px",
  },

  transferItem: {
    padding: "0 0 18px",
  },

  transferTitle: {
    margin: "0 0 5px",
    color: "#1e3a8a",
    fontSize: "14px",
    fontWeight: 750,
  },

  transferText: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.65,
  },

  standardText: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  /* STATS */

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "12px",
  },

  stat: {
    minHeight: "90px",
    padding: "16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "9px",
  },

  statLabel: {
    margin: "0 0 9px",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".05em",
    lineHeight: 1.4,
  },

  statValue: {
    margin: 0,
    color: "#0f172a",
    fontSize: "16px",
    fontWeight: 700,
    lineHeight: 1.4,
  },

  /* ATTIRE */

  attireGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "28px",
  },

  attireBlock: {
    paddingLeft: "16px",
    borderLeft: "3px solid #3b82f6",
  },

  attireLabel: {
    margin: "0 0 7px",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".06em",
  },

  attireText: {
    margin: 0,
    color: "#475569",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  /* DISCLAIMER */

  disclaimer: {
    display: "flex",
    alignItems: "flex-start",
    gap: "13px",
    marginTop: "18px",
    paddingTop: "22px",
    borderTop: "1px solid #e2e8f0",
  },

  hmMark: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 auto",
    width: "31px",
    height: "31px",
    borderRadius: "7px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "10px",
    fontWeight: 900,
  },

  disclaimerText: {
    maxWidth: "760px",
    margin: 0,
    color: "#94a3b8",
    fontSize: "11px",
    lineHeight: 1.6,
  },
};
