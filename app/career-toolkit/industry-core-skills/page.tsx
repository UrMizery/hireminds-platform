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
      /*
        This page is ready for the O*NET-backed API route.

        Expected route:
        POST /api/industry-core-skills

        Body:
        {
          jobTitle: "Medical Assistant"
        }

        Expected response shape:
        CareerResult
      */

      const response = await fetch("/api/industry-core-skills", {
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
            "We couldn't generate career information for that job title."
        );
      }

      const data: CareerResult = await response.json();
      setResult(data);
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
      {/* subtle abstract background */}
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      <div style={styles.shell}>
        {/* HEADER */}
        <header style={styles.header}>
          <a href="/career-toolkit" style={styles.backLink}>
            ← Career ToolKit
          </a>

          <div style={styles.headerLine} />

          <div style={styles.hero}>
            <p style={styles.kicker}>HIREMINDS CAREER TOOLKIT</p>

            <h1 style={styles.title}>Industry Core Skills</h1>

            <p style={styles.subtitle}>
              Explore the skills, technology, wages, and workplace expectations
              connected to a specific occupation.
            </p>
          </div>
        </header>

        {/* SEARCH */}
        <section style={styles.searchSection}>
          <form onSubmit={handleGenerate} style={styles.form}>
            <div style={styles.inputWrap}>
              <label htmlFor="jobTitle" style={styles.label}>
                Job Title
              </label>

              <input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                placeholder="Example: Medical Assistant"
                style={styles.input}
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.generateButton,
                ...(loading ? styles.buttonDisabled : {}),
              }}
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </form>

          <p style={styles.searchHint}>
            Enter one occupation or job title for the most relevant results.
          </p>

          {error && <div style={styles.error}>{error}</div>}
        </section>

        {/* EMPTY STATE */}
        {!result && !loading && (
          <section style={styles.emptyState}>
            <div style={styles.emptyAccent} />

            <div>
              <p style={styles.emptyEyebrow}>CAREER SNAPSHOT</p>

              <h2 style={styles.emptyTitle}>
                Start with the job you want to explore.
              </h2>

              <p style={styles.emptyText}>
                HireMinds will organize the occupation into practical career
                information you can use for your resume, interview preparation,
                career planning, and job search.
              </p>
            </div>
          </section>
        )}

        {/* LOADING */}
        {loading && (
          <section style={styles.loadingSection}>
            <div style={styles.spinner} />

            <div>
              <h2 style={styles.loadingTitle}>
                Building your career snapshot
              </h2>

              <p style={styles.loadingText}>
                Reviewing occupation skills, technology, wages, and workplace
                information.
              </p>
            </div>
          </section>
        )}

        {/* RESULTS */}
        {result && !loading && (
          <section style={styles.results}>
            {/* OCCUPATION HEADER */}
            <div style={styles.resultHeader}>
              <p style={styles.resultEyebrow}>CAREER SNAPSHOT</p>

              <h2 style={styles.occupationTitle}>
                {result.occupationTitle}
              </h2>

              <p style={styles.overview}>{result.overview}</p>
            </div>

            {/* CORE SKILLS */}
            <ResultSection
              title="Core Skills"
              description="Job-specific skills commonly associated with this occupation."
            >
              <SkillList skills={result.coreSkills} />
            </ResultSection>

            {/* SOFT SKILLS */}
            <ResultSection
              title="Soft Skills"
              description="Workplace and people skills that support success in this role."
            >
              <SkillList skills={result.softSkills} />
            </ResultSection>

            {/* TRANSFERABLE */}
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

            {/* TECHNOLOGY */}
            <ResultSection
              title="Software & Technology Skills"
              description="Technology, systems, equipment, or software commonly connected to this occupation."
            >
              {result.technologySkills.length > 0 ? (
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
              description="National occupation data. Wages and employment conditions may vary by location, employer, and experience."
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

              <p style={styles.dataNote}>
                National figures are shown by default.
              </p>
            </ResultSection>

            {/* ATTIRE */}
            <ResultSection
              title="Work Attire & Interview Dress"
              description="General clothing expectations for the workplace and for interviewing for this type of role."
            >
              <div style={styles.attireGrid}>
                <div style={styles.attireItem}>
                  <p style={styles.smallLabel}>TYPICAL WORK ATTIRE</p>
                  <p style={styles.attireText}>{result.workAttire}</p>
                </div>

                <div style={styles.attireItem}>
                  <p style={styles.smallLabel}>INTERVIEW ATTIRE</p>
                  <p style={styles.attireText}>{result.interviewAttire}</p>
                </div>
              </div>
            </ResultSection>

            <div style={styles.footerNote}>
              <span style={styles.footerMark}>HM</span>

              <p style={styles.footerText}>
                Use this career snapshot as a guide. Job requirements, wages,
                technology, and workplace expectations can vary by employer and
                location.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTS                                                                 */
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
      "linear-gradient(145deg, #05080d 0%, #08111d 48%, #0b1420 100%)",
    color: "#f8fafc",
    padding: "28px 22px 70px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  glowOne: {
    position: "absolute",
    width: "620px",
    height: "620px",
    top: "-260px",
    right: "-170px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(37,99,235,.17) 0%, rgba(37,99,235,0) 70%)",
    pointerEvents: "none",
  },

  glowTwo: {
    position: "absolute",
    width: "520px",
    height: "520px",
    left: "-260px",
    top: "500px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(71,85,105,.13) 0%, rgba(71,85,105,0) 72%)",
    pointerEvents: "none",
  },

  shell: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1180px",
    margin: "0 auto",
  },

  header: {
    padding: "8px 0 30px",
  },

  backLink: {
    display: "inline-block",
    color: "#94a3b8",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "20px",
  },

  headerLine: {
    height: "1px",
    background:
      "linear-gradient(90deg, #2563eb 0%, rgba(71,85,105,.65) 35%, rgba(71,85,105,0) 100%)",
    marginBottom: "36px",
  },

  hero: {
    maxWidth: "820px",
  },

  kicker: {
    margin: "0 0 12px",
    color: "#60a5fa",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: ".18em",
  },

  title: {
    margin: 0,
    color: "#ffffff",
    fontSize: "clamp(38px, 6vw, 64px)",
    lineHeight: 1.02,
    letterSpacing: "-0.045em",
    fontWeight: 700,
  },

  subtitle: {
    maxWidth: "720px",
    margin: "18px 0 0",
    color: "#aeb9c7",
    fontSize: "17px",
    lineHeight: 1.7,
  },

  searchSection: {
    padding: "28px 0 42px",
    borderBottom: "1px solid rgba(148,163,184,.18)",
  },

  form: {
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
  },

  inputWrap: {
    flex: "1 1 520px",
  },

  label: {
    display: "block",
    marginBottom: "9px",
    color: "#cbd5e1",
    fontSize: "13px",
    fontWeight: 700,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    background: "rgba(15,23,42,.62)",
    border: "1px solid #334155",
    borderRadius: "10px",
    color: "#ffffff",
    padding: "15px 16px",
    outline: "none",
    fontSize: "16px",
    boxShadow: "0 12px 40px rgba(0,0,0,.12)",
  },

  generateButton: {
    minHeight: "51px",
    border: "1px solid #3b82f6",
    borderRadius: "10px",
    padding: "0 28px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 30px rgba(37,99,235,.18)",
  },

  buttonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },

  searchHint: {
    margin: "10px 0 0",
    color: "#64748b",
    fontSize: "12px",
  },

  error: {
    marginTop: "16px",
    borderLeft: "3px solid #ef4444",
    padding: "10px 14px",
    background: "rgba(127,29,29,.14)",
    color: "#fecaca",
    fontSize: "14px",
  },

  emptyState: {
    display: "grid",
    gridTemplateColumns: "4px minmax(0, 680px)",
    gap: "22px",
    marginTop: "52px",
    padding: "8px 0",
  },

  emptyAccent: {
    width: "4px",
    borderRadius: "10px",
    background: "linear-gradient(180deg, #3b82f6, #1e3a8a)",
  },

  emptyEyebrow: {
    margin: "0 0 10px",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: ".16em",
  },

  emptyTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "26px",
    fontWeight: 650,
    letterSpacing: "-.02em",
  },

  emptyText: {
    margin: "12px 0 0",
    color: "#94a3b8",
    fontSize: "15px",
    lineHeight: 1.7,
  },

  loadingSection: {
    display: "flex",
    gap: "18px",
    alignItems: "center",
    padding: "55px 0",
  },

  spinner: {
    width: "28px",
    height: "28px",
    border: "3px solid #334155",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
  },

  loadingTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#f8fafc",
  },

  loadingText: {
    margin: "6px 0 0",
    color: "#94a3b8",
    lineHeight: 1.6,
  },

  results: {
    paddingTop: "46px",
  },

  resultHeader: {
    maxWidth: "850px",
    paddingBottom: "38px",
  },

  resultEyebrow: {
    margin: "0 0 10px",
    color: "#60a5fa",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: ".16em",
  },

  occupationTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "clamp(30px, 5vw, 46px)",
    lineHeight: 1.08,
    letterSpacing: "-.035em",
    fontWeight: 700,
  },

  overview: {
    margin: "16px 0 0",
    color: "#b8c2cf",
    fontSize: "16px",
    lineHeight: 1.75,
  },

  resultSection: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 300px) minmax(0, 1fr)",
    gap: "50px",
    padding: "34px 0",
    borderTop: "1px solid rgba(148,163,184,.18)",
  },

  sectionHeading: {
    alignSelf: "start",
  },

  sectionTitle: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "21px",
    lineHeight: 1.25,
    fontWeight: 650,
  },

  sectionDescription: {
    margin: "9px 0 0",
    color: "#718096",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  sectionContent: {
    minWidth: 0,
  },

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
    border: "1px solid #334155",
    borderRadius: "7px",
    background: "rgba(30,41,59,.38)",
    color: "#dbeafe",
    fontSize: "13px",
    lineHeight: 1.35,
  },

  transferGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "0 28px",
  },

  transferItem: {
    padding: "0 0 20px",
  },

  transferTitle: {
    margin: "0 0 6px",
    color: "#dbeafe",
    fontSize: "15px",
    fontWeight: 700,
  },

  transferText: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "13px",
    lineHeight: 1.65,
  },

  standardText: {
    margin: 0,
    color: "#aeb9c7",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))",
    gap: "1px",
    overflow: "hidden",
    border: "1px solid #273449",
    borderRadius: "10px",
    background: "#273449",
  },

  stat: {
    minHeight: "96px",
    padding: "17px",
    background: "#0d1623",
  },

  statLabel: {
    margin: "0 0 10px",
    color: "#718096",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".06em",
  },

  statValue: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "20px",
    fontWeight: 700,
  },

  dataNote: {
    margin: "12px 0 0",
    color: "#64748b",
    fontSize: "11px",
  },

  attireGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "28px",
  },

  attireItem: {
    borderLeft: "2px solid #2563eb",
    paddingLeft: "16px",
  },

  smallLabel: {
    margin: "0 0 8px",
    color: "#60a5fa",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: ".12em",
  },

  attireText: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  footerNote: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    marginTop: "20px",
    paddingTop: "24px",
    borderTop: "1px solid rgba(148,163,184,.18)",
  },

  footerMark: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 auto",
    width: "32px",
    height: "32px",
    border: "1px solid #334155",
    borderRadius: "7px",
    color: "#60a5fa",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".04em",
  },

  footerText: {
    maxWidth: "720px",
    margin: 0,
    color: "#64748b",
    fontSize: "11px",
    lineHeight: 1.65,
  },
};
