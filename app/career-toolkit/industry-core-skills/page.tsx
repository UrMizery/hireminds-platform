"use client";

import {
  FormEvent,
  ReactNode,
  useState,
} from "react";

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

  const [result, setResult] =
    useState<CareerResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleGenerate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const title = jobTitle.trim();

    if (!title) {
      setError(
        "Enter a job title to continue."
      );

      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "/api/industry-core-skills",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          cache: "no-store",

          body: JSON.stringify({
            jobTitle: title,
          }),
        }
      );

      const responseText =
        await response.text();

      let data: any = null;

      try {
        data = responseText
          ? JSON.parse(responseText)
          : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "We couldn't generate your career snapshot. Please try again."
        );
      }

      if (!data) {
        throw new Error(
          "HireMinds did not receive career information. Please try again."
        );
      }

      setResult(data);

      window.setTimeout(() => {
        document
          .getElementById(
            "career-results"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 100);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.blueGlow} />

      <div style={styles.grayGlow} />

      <div style={styles.dotPattern} />

      <div style={styles.shell}>
        {/* HERO */}

        <header style={styles.hero}>
          <p style={styles.kicker}>
            CAREER TOOLKIT
          </p>

          <h1 style={styles.title}>
            Industry Core Skills
          </h1>

          <p style={styles.subtitle}>
            Enter a job title to explore
            the skills, technology, wages,
            employment trends, and
            workplace expectations
            connected to that occupation.
          </p>
        </header>

        {/* GENERATOR */}

        <section style={styles.generator}>
          <form
            onSubmit={handleGenerate}
            style={styles.form}
          >
            <div style={styles.inputWrap}>
              <label
                htmlFor="jobTitle"
                style={styles.label}
              >
                Job Title
              </label>

              <input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(event) => {
                  setJobTitle(
                    event.target.value
                  );

                  if (error) {
                    setError("");
                  }
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

                ...(loading
                  ? styles.disabledButton
                  : {}),
              }}
            >
              {loading
                ? "Generating..."
                : "Generate"}
            </button>
          </form>

          <p style={styles.hint}>
            Enter one occupation or job
            title for the most relevant
            results.
          </p>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}
        </section>

        {/* EMPTY STATE */}

        {!result && !loading && !error && (
          <section style={styles.emptyState}>
            <div style={styles.iconCircle}>
              <div
                style={
                  styles.magnifierCircle
                }
              />

              <div
                style={
                  styles.magnifierHandle
                }
              />
            </div>

            <p style={styles.emptyKicker}>
              CAREER SNAPSHOT
            </p>

            <h2 style={styles.emptyTitle}>
              Start with the job you want
              to explore.
            </h2>

            <p style={styles.emptyText}>
              HireMinds will organize the
              occupation into practical
              career information you can
              use for your resume,
              interview preparation,
              career planning, and job
              search.
            </p>
          </section>
        )}

        {/* LOADING */}

        {loading && (
          <section
            style={styles.loadingState}
          >
            <div style={styles.loader}>
              HM
            </div>

            <h2
              style={styles.loadingTitle}
            >
              Building your career
              snapshot...
            </h2>

            <p style={styles.loadingText}>
              Reviewing the skills and
              career information connected
              to{" "}
              <strong>{jobTitle}</strong>.
            </p>
          </section>
        )}

        {/* RESULTS */}

        {result && !loading && (
          <section
            id="career-results"
            style={styles.results}
          >
            {/* OCCUPATION OVERVIEW */}

            <div
              style={styles.resultHeader}
            >
              <p
                style={
                  styles.resultKicker
                }
              >
                CAREER SNAPSHOT
              </p>

              <h2
                style={
                  styles.occupationTitle
                }
              >
                {result.occupationTitle}
              </h2>

              <div
                style={
                  styles.overviewBlock
                }
              >
                <p
                  style={
                    styles.overviewLabel
                  }
                >
                  OCCUPATION OVERVIEW
                </p>

                <p
                  style={
                    styles.overviewText
                  }
                >
                  {result.overview}
                </p>
              </div>
            </div>

            {/* CORE SKILLS */}

            <ResultSection
              title="Core Skills"
              description="Job-specific hard and technical skills commonly associated with this occupation."
            >
              <SkillList
                skills={
                  result.coreSkills
                }
              />
            </ResultSection>

            {/* SOFT SKILLS */}

            <ResultSection
              title="Soft Skills"
              description="People and workplace skills that support success in this occupation."
            >
              <SkillList
                skills={
                  result.softSkills
                }
              />
            </ResultSection>

            {/* TRANSFERABLE SKILLS */}

            <ResultSection
              title="Transferable Skills"
              description="Skills from this occupation that can carry into other jobs and industries."
            >
              <div
                style={
                  styles.transferGrid
                }
              >
                {result.transferableSkills.map(
                  (item) => (
                    <div
                      key={item.skill}
                      style={
                        styles.transferItem
                      }
                    >
                      <h3
                        style={
                          styles.transferTitle
                        }
                      >
                        {item.skill}
                      </h3>

                      <p
                        style={
                          styles.transferText
                        }
                      >
                        {
                          item.explanation
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            </ResultSection>

            {/* SOFTWARE & TECHNOLOGY */}

            <ResultSection
              title="Software & Technology Skills"
              description="Relevant systems, software, technology, tools, platforms, or equipment commonly used in this occupation."
            >
              {result
                .technologySkills
                ?.length > 0 ? (
                <SkillList
                  skills={
                    result.technologySkills
                  }
                />
              ) : (
                <p
                  style={
                    styles.standardText
                  }
                >
                  {result.technologyNote ||
                    "This occupation does not typically require specialized software or technology."}
                </p>
              )}
            </ResultSection>

            {/* WAGE & EMPLOYMENT TRENDS */}

            <section
              style={
                styles.wageSection
              }
            >
              <div
                style={
                  styles.wageHeading
                }
              >
                <h2
                  style={
                    styles.wageSectionTitle
                  }
                >
                  Wage & Employment
                  Trends
                </h2>

                <p
                  style={
                    styles.wageDescription
                  }
                >
                  General national U.S.
                  career information.
                  Actual wages and
                  employment conditions
                  vary by location,
                  employer, experience,
                  and industry.
                </p>
              </div>

              <div
                style={
                  styles.wageRows
                }
              >
                <TrendRow
                  icon="clock"
                  label="Median Hourly Wage"
                  value={
                    result.wageTrends
                      .medianHourly
                  }
                />

                <TrendRow
                  icon="money"
                  label="Median Annual Wage"
                  value={
                    result.wageTrends
                      .medianAnnual
                  }
                />

                <TrendRow
                  icon="people"
                  label="Employment Level"
                  value={
                    result.wageTrends
                      .employmentLevel
                  }
                />

                <TrendRow
                  icon="growth"
                  label="Projected Growth / Decline"
                  value={
                    result.wageTrends
                      .projectedGrowth
                  }
                />

                <TrendRow
                  icon="briefcase"
                  label="Projected Job Openings"
                  value={
                    result.wageTrends
                      .projectedOpenings
                  }
                  last
                />
              </div>
            </section>

            {/* WORK ATTIRE */}

            <ResultSection
              title="Work Attire & Interview Dress"
              description="Typical workplace clothing expectations and what to wear when interviewing for this type of role."
            >
              <div
                style={styles.attireGrid}
              >
                <div
                  style={
                    styles.attireBlock
                  }
                >
                  <p
                    style={
                      styles.attireLabel
                    }
                  >
                    TYPICAL WORK ATTIRE
                  </p>

                  <p
                    style={
                      styles.attireText
                    }
                  >
                    {
                      result.workAttire
                    }
                  </p>
                </div>

                <div
                  style={
                    styles.attireBlock
                  }
                >
                  <p
                    style={
                      styles.attireLabel
                    }
                  >
                    INTERVIEW ATTIRE
                  </p>

                  <p
                    style={
                      styles.attireText
                    }
                  >
                    {
                      result.interviewAttire
                    }
                  </p>
                </div>
              </div>
            </ResultSection>

            {/* DISCLAIMER */}

            <div
              style={styles.disclaimer}
            >
              <span
                style={styles.hmMark}
              >
                HM
              </span>

              <p
                style={
                  styles.disclaimerText
                }
              >
                Use this career snapshot
                as a guide. Job
                requirements, wages,
                technology, attire, and
                workplace expectations
                can vary by employer and
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
/* RESULT SECTION                                                             */
/* -------------------------------------------------------------------------- */

function ResultSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      style={styles.resultSection}
    >
      <div
        style={styles.sectionHeading}
      >
        <h2
          style={styles.sectionTitle}
        >
          {title}
        </h2>

        <p
          style={
            styles.sectionDescription
          }
        >
          {description}
        </p>
      </div>

      <div
        style={styles.sectionContent}
      >
        {children}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* SKILL LIST                                                                 */
/* -------------------------------------------------------------------------- */

function SkillList({
  skills,
}: {
  skills: string[];
}) {
  return (
    <div style={styles.skillList}>
      {skills.map((skill) => (
        <span
          key={skill}
          style={styles.skillTag}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* WAGE / EMPLOYMENT ROW                                                      */
/* -------------------------------------------------------------------------- */

type TrendIcon =
  | "clock"
  | "money"
  | "people"
  | "growth"
  | "briefcase";

function TrendRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: TrendIcon;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.trendRow,

        ...(last
          ? styles.trendRowLast
          : {}),
      }}
    >
      <div
        style={
          styles.trendIconCircle
        }
      >
        <TrendIconGraphic
          type={icon}
        />
      </div>

      <div
        style={styles.trendContent}
      >
        <p
          style={styles.trendLabel}
        >
          {label}
        </p>

        <p
          style={styles.trendValue}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TREND ICONS                                                                */
/* -------------------------------------------------------------------------- */

function TrendIconGraphic({
  type,
}: {
  type: TrendIcon;
}) {
  const common = {
    width: 29,
    height: 29,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#2563eb",
    strokeWidth: 1.9,
    strokeLinecap:
      "round" as const,
    strokeLinejoin:
      "round" as const,
  };

  if (type === "clock") {
    return (
      <svg {...common}>
        <circle
          cx="12"
          cy="12"
          r="8.5"
        />

        <path d="M12 7.5v5l3.5 2" />
      </svg>
    );
  }

  if (type === "money") {
    return (
      <svg {...common}>
        <ellipse
          cx="12"
          cy="6"
          rx="6.5"
          ry="2.5"
        />

        <path d="M5.5 6v4c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V6" />

        <path d="M5.5 10v4c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-4" />

        <path d="M5.5 14v3.5C5.5 18.9 8.4 20 12 20s6.5-1.1 6.5-2.5V14" />
      </svg>
    );
  }

  if (type === "people") {
    return (
      <svg {...common}>
        <circle
          cx="9"
          cy="8"
          r="3"
        />

        <circle
          cx="16.5"
          cy="9"
          r="2.4"
        />

        <path d="M3.5 19c.5-4 2.4-6 5.5-6s5 2 5.5 6" />

        <path d="M14.5 14c2.8 0 4.8 1.7 5.5 5" />
      </svg>
    );
  }

  if (type === "growth") {
    return (
      <svg {...common}>
        <path d="M5 19V14" />

        <path d="M10 19V10" />

        <path d="M15 19V7" />

        <path d="M20 19V4" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect
        x="4"
        y="7"
        width="16"
        height="12"
        rx="2"
      />

      <path d="M9 7V5.5C9 4.7 9.7 4 10.5 4h3c.8 0 1.5.7 1.5 1.5V7" />

      <path d="M4 11.5c4.7 2 11.3 2 16 0" />

      <path d="M10.5 12h3" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",

    background:
      "linear-gradient(180deg, #f7f9fc 0%, #ffffff 44%, #f6f8fb 100%)",

    color: "#0f172a",

    padding: "0 32px 80px",

    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  blueGlow: {
    position: "absolute",

    width: "680px",
    height: "680px",

    top: "-410px",
    right: "-140px",

    borderRadius: "50%",

    background:
      "radial-gradient(circle, rgba(37,99,235,.13) 0%, rgba(37,99,235,.04) 45%, rgba(37,99,235,0) 72%)",

    pointerEvents: "none",
  },

  grayGlow: {
    position: "absolute",

    width: "540px",
    height: "540px",

    top: "650px",
    left: "-300px",

    borderRadius: "50%",

    background:
      "radial-gradient(circle, rgba(100,116,139,.09) 0%, rgba(100,116,139,0) 72%)",

    pointerEvents: "none",
  },

  dotPattern: {
    position: "absolute",

    top: "34px",
    right: "8%",

    width: "200px",
    height: "200px",

    opacity: 0.2,

    backgroundImage:
      "radial-gradient(#2563eb 1.5px, transparent 1.5px)",

    backgroundSize:
      "27px 27px",

    pointerEvents: "none",
  },

  shell: {
    position: "relative",

    zIndex: 1,

    width: "100%",

    maxWidth: "1320px",

    margin: "0 auto",
  },

  /* HERO */

  hero: {
    maxWidth: "850px",

    padding:
      "14px 0 54px",
  },

  kicker: {
    margin: "0 0 20px",

    color: "#2563eb",

    fontSize: "13px",

    fontWeight: 800,

    letterSpacing: ".18em",
  },

  title: {
    margin: 0,

    color: "#0f172a",

    fontSize:
      "clamp(44px, 6vw, 68px)",

    lineHeight: 1,

    fontWeight: 750,

    letterSpacing: "-0.05em",
  },

  subtitle: {
    maxWidth: "790px",

    margin: "26px 0 0",

    color: "#64748b",

    fontSize: "18px",

    lineHeight: 1.75,
  },

  /* GENERATOR */

  generator: {
    padding: "30px",

    background:
      "rgba(255,255,255,.94)",

    border:
      "1px solid #d8e1ec",

    borderRadius: "17px",

    boxShadow:
      "0 18px 55px rgba(15,23,42,.06)",
  },

  form: {
    display: "flex",

    alignItems: "flex-end",

    gap: "14px",

    flexWrap: "wrap",
  },

  inputWrap: {
    flex: "1 1 650px",
  },

  label: {
    display: "block",

    marginBottom: "10px",

    color: "#172033",

    fontSize: "13px",

    fontWeight: 750,
  },

  input: {
    width: "100%",

    height: "56px",

    boxSizing: "border-box",

    padding: "0 18px",

    background: "#ffffff",

    border:
      "1px solid #cbd5e1",

    borderRadius: "10px",

    outline: "none",

    color: "#0f172a",

    fontSize: "16px",
  },

  generateButton: {
    height: "56px",

    padding: "0 36px",

    border:
      "1px solid #2563eb",

    borderRadius: "10px",

    background: "#2563eb",

    color: "#ffffff",

    fontSize: "15px",

    fontWeight: 800,

    cursor: "pointer",

    boxShadow:
      "0 10px 24px rgba(37,99,235,.18)",
  },

  disabledButton: {
    opacity: 0.65,

    cursor: "not-allowed",
  },

  hint: {
    margin: "11px 0 0",

    color: "#94a3b8",

    fontSize: "12px",
  },

  error: {
    marginTop: "18px",

    padding: "14px 16px",

    background: "#fff7f7",

    borderLeft:
      "3px solid #ef4444",

    color: "#991b1b",

    fontSize: "13px",

    lineHeight: 1.5,
  },

  /* EMPTY */

  emptyState: {
    maxWidth: "720px",

    margin: "0 auto",

    padding:
      "95px 20px 70px",

    textAlign: "center",
  },

  iconCircle: {
    position: "relative",

    width: "86px",
    height: "86px",

    margin:
      "0 auto 26px",

    borderRadius: "50%",

    background: "#eff6ff",
  },

  magnifierCircle: {
    position: "absolute",

    width: "29px",
    height: "29px",

    top: "21px",
    left: "21px",

    border:
      "5px solid #3b82f6",

    borderRadius: "50%",
  },

  magnifierHandle: {
    position: "absolute",

    width: "26px",
    height: "5px",

    top: "53px",
    left: "51px",

    borderRadius: "999px",

    background: "#2563eb",

    transform:
      "rotate(45deg)",

    transformOrigin:
      "left center",
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

    margin:
      "14px auto 0",

    color: "#64748b",

    fontSize: "15px",

    lineHeight: 1.75,
  },

  /* LOADING */

  loadingState: {
    padding:
      "90px 20px",

    textAlign: "center",
  },

  loader: {
    display: "flex",

    alignItems: "center",

    justifyContent:
      "center",

    width: "52px",
    height: "52px",

    margin:
      "0 auto 20px",

    borderRadius: "14px",

    background: "#eff6ff",

    border:
      "1px solid #bfdbfe",

    color: "#2563eb",

    fontSize: "13px",

    fontWeight: 900,
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
    marginTop: "58px",

    padding: "0 4px",

    scrollMarginTop:
      "30px",
  },

  resultHeader: {
    maxWidth: "900px",

    paddingBottom:
      "44px",
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

    fontSize:
      "clamp(34px, 5vw, 50px)",

    lineHeight: 1.08,

    fontWeight: 750,

    letterSpacing: "-.035em",
  },

  overviewBlock: {
    marginTop: "28px",

    paddingLeft: "18px",

    borderLeft:
      "3px solid #2563eb",
  },

  overviewLabel: {
    margin: "0 0 7px",

    color: "#2563eb",

    fontSize: "10px",

    fontWeight: 800,

    letterSpacing: ".1em",
  },

  overviewText: {
    margin: 0,

    color: "#475569",

    fontSize: "15px",

    lineHeight: 1.75,
  },

  /* STANDARD RESULT SECTIONS */

  resultSection: {
    display: "grid",

    gridTemplateColumns:
      "minmax(220px, 290px) minmax(0, 1fr)",

    gap: "52px",

    padding: "36px 0",

    borderTop:
      "1px solid #e2e8f0",
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

    border:
      "1px solid #cbd5e1",

    borderRadius: "7px",

    color: "#334155",

    fontSize: "13px",

    lineHeight: 1.35,
  },

  /* TRANSFERABLE */

  transferGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",

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

  /* WAGE & EMPLOYMENT - NO BOXES */

  wageSection: {
    display: "grid",

    gridTemplateColumns:
      "minmax(220px, 290px) minmax(0, 1fr)",

    gap: "52px",

    padding: "44px 0",

    borderTop:
      "1px solid #e2e8f0",
  },

  wageHeading: {
    alignSelf: "start",

    paddingTop: "3px",
  },

  wageSectionTitle: {
    margin: 0,

    color: "#0f172a",

    fontSize: "24px",

    fontWeight: 760,

    lineHeight: 1.25,

    letterSpacing: "-.02em",
  },

  wageDescription: {
    maxWidth: "270px",

    margin: "12px 0 0",

    color: "#94a3b8",

    fontSize: "13px",

    lineHeight: 1.7,
  },

  wageRows: {
    minWidth: 0,

    borderTop:
      "1px solid #dce5ef",
  },

  trendRow: {
    display: "grid",

    gridTemplateColumns:
      "72px minmax(0, 1fr)",

    alignItems: "center",

    gap: "22px",

    minHeight: "128px",

    padding: "22px 8px",

    borderBottom:
      "1px solid #dce5ef",
  },

  trendRowLast: {
    borderBottom: "none",
  },

  trendIconCircle: {
    display: "flex",

    alignItems: "center",

    justifyContent:
      "center",

    width: "66px",
    height: "66px",

    borderRadius: "50%",

    background:
      "linear-gradient(145deg, #eff6ff 0%, #e8f1ff 100%)",
  },

  trendContent: {
    minWidth: 0,
  },

  trendLabel: {
    margin: "0 0 8px",

    color: "#64748b",

    fontSize: "11px",

    fontWeight: 800,

    textTransform:
      "uppercase",

    letterSpacing: ".055em",
  },

  trendValue: {
    maxWidth: "720px",

    margin: 0,

    color: "#0f2347",

    fontSize:
      "clamp(18px, 2vw, 25px)",

    fontWeight: 760,

    lineHeight: 1.42,

    letterSpacing: "-.015em",
  },

  /* ATTIRE */

  attireGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",

    gap: "30px",
  },

  attireBlock: {
    paddingLeft: "16px",

    borderLeft:
      "3px solid #3b82f6",
  },

  attireLabel: {
    margin: "0 0 7px",

    color: "#2563eb",

    fontSize: "10px",

    fontWeight: 800,

    letterSpacing: ".08em",
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

    alignItems:
      "flex-start",

    gap: "13px",

    marginTop: "18px",

    paddingTop: "22px",

    borderTop:
      "1px solid #e2e8f0",
  },

  hmMark: {
    display: "flex",

    alignItems: "center",

    justifyContent:
      "center",

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
