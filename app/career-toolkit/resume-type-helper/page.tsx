"use client";

import { useMemo, useState, type CSSProperties } from "react";

type ResumeType = "Chronological" | "Functional" | "Combination" | "Hybrid";

export default function ResumeTypeHelperPage() {
  const [workHistoryStrength, setWorkHistoryStrength] = useState("");
  const [experienceGap, setExperienceGap] = useState("");
  const [careerChange, setCareerChange] = useState("");
  const [recentEducation, setRecentEducation] = useState("");
  const [internVolunteer, setInternVolunteer] = useState("");
  const [skillsStrength, setSkillsStrength] = useState("");

  const recommendation = useMemo(() => {
    const stableWork = workHistoryStrength === "yes";
    const hasGap = experienceGap === "yes";
    const changingCareers = careerChange === "yes";
    const recentSchool = recentEducation === "yes";
    const internshipHelp = internVolunteer === "yes";
    const strongSkills = skillsStrength === "yes";

    let bestFit: ResumeType = "Chronological";

    let reason =
      "A chronological resume is usually the strongest choice when you have steady work history and want employers to quickly see recent experience.";

    let tips: string[] = [
      "Lead with your most recent role and work backward.",
      "Keep dates clear and easy to scan.",
      "Use bullet points that show duties, results, and tools used.",
    ];

    if (changingCareers && strongSkills) {
      bestFit = "Combination";

      reason =
        "A combination resume works well when you want to highlight transferable skills but still show work history. It helps connect past experience to a new direction.";

      tips = [
        "Start with a strong summary and a focused skills section.",
        "Use your work history to support the skills you listed.",
        "Match your skills section to the job description where it is truthful.",
      ];
    } else if (
      (hasGap || !stableWork) &&
      strongSkills &&
      !changingCareers
    ) {
      bestFit = "Functional";

      reason =
        "A functional resume can help place more attention on skills when work history is not the strongest selling point.";

      tips = [
        "Group your strongest abilities into skill areas instead of relying only on job dates.",
        "Keep work history included, even if it is shorter.",
        "Use this format carefully, since many employers still prefer chronological structure.",
      ];
    } else if ((recentSchool || internshipHelp) && strongSkills) {
      bestFit = "Hybrid";

      reason =
        "A hybrid resume is helpful when education, internships, volunteer work, or skills deserve stronger placement near the top.";

      tips = [
        "Place education, internships, and practical experience where they add value quickly.",
        "Use a short summary plus skills before work history if it helps your story.",
        "This format is especially useful for newer job seekers with relevant training.",
      ];
    }

    return { bestFit, reason, tips };
  }, [
    workHistoryStrength,
    experienceGap,
    careerChange,
    recentEducation,
    internVolunteer,
    skillsStrength,
  ]);

  const resumeGuide = {
    Chronological: {
      description:
        "Best for candidates with steady experience in the same field or closely related work. This is usually the safest and most employer-friendly format.",

      strengths: [
        "Easy for employers to review quickly",
        "Shows growth and consistency clearly",
        "Works especially well when recent jobs are relevant",
      ],

      tricks: [
        "Put your strongest and most relevant roles first with measurable bullet points.",
        "If a job title sounds too generic, use stronger bullet points to show the real level of your work.",
        "Lead each job with results, systems used, and important responsibilities.",
        "If you have older unrelated jobs, keep those shorter and simpler.",
        "Use this format whenever your recent history supports the role you want.",
      ],

      plainNote:
        "This is the format most employers expect to see first. It is usually the best choice when your work history is solid.",
    },

    Functional: {
      description:
        "Best for candidates who need to emphasize skills more than timeline, though it should be used carefully because some employers do not prefer it.",

      strengths: [
        "Helps draw attention to strengths and transferable abilities",
        "Can reduce focus on uneven work history",
        "Useful when skills are more important than dates",
      ],

      tricks: [
        "Organize sections by skill area such as communication, operations, customer service, or administration.",
        "Do not hide work history completely. Keep at least a short work-history section.",
        "Use this format only when it clearly helps your story.",
        "Make sure your skill claims are backed by real examples you can discuss.",
      ],

      plainNote:
        "Skill Categories means grouped skill sections like Customer Service, Communication, Leadership, or Operations. Under each one, you show examples of what you can do.",
    },

    Combination: {
      description:
        "Best for candidates who have relevant transferable skills and still want to show solid work history.",

      strengths: [
        "Balances skill emphasis with work history",
        "Works well for career changers",
        "Helps connect past experience to new goals",
      ],

      tricks: [
        "Open with a summary that points directly to the target role.",
        "Use a skills section that mirrors the role you want, if truthful.",
        "Follow your skills with work history that supports those same strengths.",
        "Avoid making the top half too crowded. Keep it clean and focused.",
      ],

      plainNote:
        "This format is strong when you want employers to see both your skills and your work history early.",
    },

    Hybrid: {
      description:
        "Best for candidates who want a flexible structure that blends education, internships, volunteer work, skills, and work history.",

      strengths: [
        "Good for newer candidates or people with fresh training",
        "Can highlight education and practical experience together",
        "Useful when volunteer or internship experience matters",
      ],

      tricks: [
        "Move education, certifications, volunteer work, or internship experience closer to the top when relevant.",
        "Use this format if your nontraditional experience genuinely supports the role.",
        "Keep section order intentional so employers see your strongest value first.",
        "This can work well for entry-level applicants when built cleanly.",
      ],

      plainNote:
        "This format works well when your strongest value is a mix of education, skills, certifications, volunteer work, and experience.",
    },
  } as const;

  return (
    <main style={styles.page}>
      {/* BACKGROUND DECORATION */}

      <div style={styles.blueGlow} />
      <div style={styles.blueGlowTwo} />
      <div style={styles.dotPattern} />

      <div style={styles.shell}>
        {/* HERO */}

        <section style={styles.hero}>
          <p style={styles.kicker}>CAREER TOOLKIT</p>

          <h1 style={styles.title}>Resume Format Guide</h1>

          <p style={styles.subtitle}>
            Answer a few quick questions to figure out which resume style fits
            you best, then review the visual examples, stronger tips, and layout
            guidance before you build your resume.
          </p>

          <a href="/career-toolkit" style={styles.backLink}>
            <span style={styles.backArrow}>←</span>
            Career ToolKit
          </a>
        </section>

        {/* GUIDE */}

        <section style={styles.guideIntro}>
          <div>
            <p style={styles.sectionKicker}>QUICK RESUME GUIDE</p>

            <h2 style={styles.sectionTitle}>
              Which format fits you best?
            </h2>
          </div>

          <p style={styles.guideIntroText}>
            Select Yes or No for each question. Your recommended resume format
            will update automatically.
          </p>
        </section>

        <div style={styles.layout}>
          {/* QUESTIONS */}

          <section style={styles.questions}>
            <Question
              label="Do you have steady recent work history that clearly supports the job you want?"
              value={workHistoryStrength}
              onChange={setWorkHistoryStrength}
            />

            <Question
              label="Do you have major work gaps or a work history that feels inconsistent?"
              value={experienceGap}
              onChange={setExperienceGap}
            />

            <Question
              label="Are you changing careers or trying to move into a different type of role?"
              value={careerChange}
              onChange={setCareerChange}
            />

            <Question
              label="Do you have recent education, training, or certifications that should be highlighted near the top?"
              value={recentEducation}
              onChange={setRecentEducation}
            />

            <Question
              label="Do you have internships, volunteer work, externships, or unpaid experience that is relevant to the role?"
              value={internVolunteer}
              onChange={setInternVolunteer}
            />

            <Question
              label="Are your transferable skills one of the strongest parts of your background?"
              value={skillsStrength}
              onChange={setSkillsStrength}
            />
          </section>

          {/* RECOMMENDATION */}

          <aside style={styles.resultsCol}>
            <div style={styles.previewPaper}>
              <p style={styles.previewKicker}>RECOMMENDED STYLE</p>

              <h2 style={styles.previewTitle}>
                {recommendation.bestFit}
              </h2>

              <div style={styles.blueRule} />

              <p style={styles.previewText}>
                {recommendation.reason}
              </p>

              <div style={styles.tipArea}>
                <p style={styles.tipTitle}>Start here</p>

                <ul style={styles.tipList}>
                  {recommendation.tips.map((tip) => (
                    <li key={tip} style={styles.tipItem}>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* VISUAL EXAMPLES */}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <p style={styles.sectionKicker}>VISUAL EXAMPLES</p>

            <h2 style={styles.sectionTitle}>
              See what each resume type looks like
            </h2>

            <p style={styles.sectionLead}>
              The order of your resume sections changes depending on what part
              of your background needs the most attention.
            </p>
          </div>

          <div style={styles.resumeExamples}>
            <ResumeExample
              type="Chronological"
              recommendation={recommendation.bestFit}
              description="Best when your work history is the strongest part of your background and should stay near the top."
            />

            <ResumeExample
              type="Functional"
              recommendation={recommendation.bestFit}
              description="Best when your strongest value is your skill set and you need to place less attention on timeline."
              note={
                <>
                  <strong>What are Skill Categories?</strong> These are grouped
                  sections like Customer Service, Communication, Leadership,
                  Operations, or Admin Support. Under each category, you show
                  examples of what you can do.
                </>
              }
            />

            <ResumeExample
              type="Combination"
              recommendation={recommendation.bestFit}
              description="Best when you want to highlight strong transferable skills and still show solid work history."
            />

            <ResumeExample
              type="Hybrid"
              recommendation={recommendation.bestFit}
              description="Best when education, certifications, internship, or volunteer experience needs stronger placement near the top."
            />
          </div>
        </section>

        {/* RECOMMENDED FORMAT */}

        <section style={styles.recommendedSection}>
          <div style={styles.recommendedLabelColumn}>
            <p style={styles.sectionKicker}>RECOMMENDED FORMAT</p>

            <h2 style={styles.sectionTitle}>
              Based on your answers
            </h2>
          </div>

          <div style={styles.recommendedContent}>
            <p style={styles.recommendedPanelKicker}>
              SUGGESTED RESUME TYPE
            </p>

            <h3 style={styles.recommendedPanelTitle}>
              {recommendation.bestFit}
            </h3>

            <p style={styles.recommendedPanelText}>
              {recommendation.reason}
            </p>
          </div>
        </section>

        {/* FORMAT BREAKDOWN */}

        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <p style={styles.sectionKicker}>FORMAT BREAKDOWN</p>

            <h2 style={styles.sectionTitle}>
              Tips and tricks by resume style
            </h2>

            <p style={styles.sectionLead}>
              Each format tells your professional story differently. Use the
              structure that puts your strongest qualifications where an
              employer will see them first.
            </p>
          </div>

          <div style={styles.breakdownGrid}>
            {(Object.keys(resumeGuide) as ResumeType[]).map(
              (type, index) => (
                <article key={type} style={styles.breakdownItem}>
                  <div style={styles.breakdownHeading}>
                    <span style={styles.breakdownNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h3 style={styles.breakdownTitle}>{type}</h3>
                  </div>

                  <p style={styles.guideDescription}>
                    {resumeGuide[type].description}
                  </p>

                  <p style={styles.guidePlainNote}>
                    {resumeGuide[type].plainNote}
                  </p>

                  <div style={styles.breakdownColumns}>
                    <div>
                      <p style={styles.guideSubhead}>Why it works</p>

                      <ul style={styles.guideList}>
                        {resumeGuide[type].strengths.map((item) => (
                          <li key={item} style={styles.guideItem}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p style={styles.guideSubhead}>Tips and tricks</p>

                      <ul style={styles.guideList}>
                        {resumeGuide[type].tricks.map((item) => (
                          <li key={item} style={styles.guideItem}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        </section>

        {/* BOTTOM */}

        <section style={styles.bottomSection}>
          <div style={styles.hmMark}>HM</div>

          <div>
            <p style={styles.bottomTitle}>
              Ready to build your resume?
            </p>

            <p style={styles.bottomText}>
              Use the format that best supports your background, then move into
              the HireMinds Resume Generator to begin building.
            </p>
          </div>

          <a href="/resume-builder" style={styles.buildButton}>
            Build Resume
            <span>→</span>
          </a>
        </section>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* QUESTION                                                                   */
/* -------------------------------------------------------------------------- */

function Question({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div style={styles.questionWrap}>
      <p style={styles.questionLabel}>{label}</p>

      <div style={styles.answerRow}>
        <button
          type="button"
          onClick={() => onChange("yes")}
          style={{
            ...styles.answerButton,
            ...(value === "yes" ? styles.answerButtonActive : {}),
          }}
        >
          Yes
        </button>

        <button
          type="button"
          onClick={() => onChange("no")}
          style={{
            ...styles.answerButton,
            ...(value === "no" ? styles.answerButtonActive : {}),
          }}
        >
          No
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* RESUME EXAMPLE                                                             */
/* -------------------------------------------------------------------------- */

function ResumeExample({
  type,
  recommendation,
  description,
  note,
}: {
  type: ResumeType;
  recommendation: ResumeType;
  description: string;
  note?: React.ReactNode;
}) {
  const selected = recommendation === type;

  return (
    <article
      style={{
        ...styles.exampleItem,
        ...(selected ? styles.exampleItemRecommended : {}),
      }}
    >
      <div style={styles.cardTopRow}>
        <div>
          <p style={styles.exampleLabel}>RESUME FORMAT</p>
          <h3 style={styles.guideTitle}>{type}</h3>
        </div>

        {selected ? (
          <span style={styles.recommendedBadge}>Best Match</span>
        ) : null}
      </div>

      <ResumeMockup type={type} />

      <p style={styles.guideDescription}>{description}</p>

      {note ? <p style={styles.functionalNote}>{note}</p> : null}
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* RESUME MOCKUP                                                              */
/* -------------------------------------------------------------------------- */

function ResumeMockup({ type }: { type: ResumeType }) {
  const blocks =
    type === "Chronological"
      ? [
          { label: "Header", tone: "neutral", tall: false },
          { label: "Summary", tone: "neutral", tall: false },
          { label: "Experience", tone: "primary", tall: true },
          { label: "Education", tone: "neutral", tall: false },
          { label: "Skills", tone: "neutral", tall: false },
        ]
      : type === "Functional"
        ? [
            { label: "Header", tone: "neutral", tall: false },
            { label: "Summary", tone: "neutral", tall: false },
            { label: "Skills", tone: "primary", tall: false },
            { label: "Skill Categories", tone: "primary", tall: true },
            { label: "Work History", tone: "neutral", tall: false },
          ]
        : type === "Combination"
          ? [
              { label: "Header", tone: "neutral", tall: false },
              { label: "Summary", tone: "neutral", tall: false },
              { label: "Skills", tone: "primary", tall: false },
              { label: "Experience", tone: "primary", tall: true },
              { label: "Education", tone: "neutral", tall: false },
            ]
          : [
              { label: "Header", tone: "neutral", tall: false },
              { label: "Summary", tone: "neutral", tall: false },
              { label: "Skills", tone: "primary", tall: false },
              { label: "Education/Certs", tone: "secondary", tall: false },
              { label: "Experience", tone: "neutral", tall: true },
            ];

  return (
    <div style={styles.mockupPaper}>
      <div style={styles.mockupHeader}>
        <div style={styles.mockNameLine} />
        <div style={styles.mockContactLine} />
      </div>

      <div style={styles.mockBlueRule} />

      {blocks.map((block, index) => (
        <div
          key={`${type}-${block.label}-${index}`}
          style={{
            ...styles.mockupBlock,
            ...(block.tall ? styles.mockupLongBlock : {}),
            ...(block.tone === "primary"
              ? styles.mockupAccentBlock
              : {}),
            ...(block.tone === "secondary"
              ? styles.mockupSecondaryBlock
              : {}),
          }}
        >
          <span style={styles.mockupLabel}>{block.label}</span>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles: Record<string, CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
    padding: "0 32px 80px",
    background:
      "linear-gradient(180deg, #F7F9FC 0%, #FFFFFF 40%, #F6F8FB 100%)",
    color: "#0F172A",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  shell: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "1320px",
    margin: "0 auto",
  },

  blueGlow: {
    position: "absolute",
    width: "680px",
    height: "680px",
    top: "-420px",
    right: "-150px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(37,99,235,.13) 0%, rgba(37,99,235,.04) 45%, rgba(37,99,235,0) 72%)",
    pointerEvents: "none",
  },

  blueGlowTwo: {
    position: "absolute",
    width: "520px",
    height: "520px",
    left: "-330px",
    top: "980px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(37,99,235,.07), rgba(37,99,235,0) 70%)",
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
      "radial-gradient(#2563EB 1.5px, transparent 1.5px)",
    backgroundSize: "27px 27px",
    pointerEvents: "none",
  },

  /* HERO */

  hero: {
    maxWidth: "920px",
    padding: "18px 0 54px",
  },

  kicker: {
    margin: "0 0 20px",
    color: "#2563EB",
    fontSize: "13px",
    fontWeight: 800,
    letterSpacing: ".18em",
    textTransform: "uppercase",
  },

  title: {
    margin: 0,
    color: "#0F172A",
    fontSize: "clamp(44px, 6vw, 68px)",
    lineHeight: 1,
    fontWeight: 750,
    letterSpacing: "-.05em",
  },

  subtitle: {
    maxWidth: "850px",
    margin: "26px 0 0",
    color: "#64748B",
    fontSize: "18px",
    lineHeight: 1.75,
  },

  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "24px",
    color: "#2563EB",
    fontSize: "13px",
    fontWeight: 750,
    textDecoration: "none",
  },

  backArrow: {
    fontSize: "17px",
  },

  /* INTRO */

  guideIntro: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "40px",
    padding: "34px 0 26px",
    borderTop: "1px solid #E2E8F0",
  },

  guideIntroText: {
    maxWidth: "410px",
    margin: 0,
    color: "#94A3B8",
    fontSize: "13px",
    lineHeight: 1.65,
    textAlign: "right",
  },

  sectionKicker: {
    margin: "0 0 8px",
    color: "#2563EB",
    fontSize: "10px",
    fontWeight: 850,
    letterSpacing: ".16em",
    textTransform: "uppercase",
  },

  sectionTitle: {
    margin: 0,
    color: "#0F172A",
    fontSize: "clamp(26px, 3vw, 34px)",
    lineHeight: 1.15,
    fontWeight: 750,
    letterSpacing: "-.03em",
  },

  sectionLead: {
    maxWidth: "700px",
    margin: "12px 0 0",
    color: "#64748B",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  /* QUESTIONS */

  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.15fr) minmax(340px, .85fr)",
    gap: "64px",
    alignItems: "start",
    paddingBottom: "82px",
  },

  questions: {
    borderTop: "1px solid #E2E8F0",
  },

  questionWrap: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    gap: "24px",
    padding: "24px 0",
    borderBottom: "1px solid #E2E8F0",
  },

  questionLabel: {
    maxWidth: "720px",
    margin: 0,
    color: "#334155",
    fontSize: "15px",
    lineHeight: 1.65,
    fontWeight: 550,
  },

  answerRow: {
    display: "flex",
    gap: "8px",
  },

  answerButton: {
    minWidth: "64px",
    height: "38px",
    padding: "0 15px",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
    background: "#FFFFFF",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 750,
    cursor: "pointer",
  },

  answerButtonActive: {
    border: "1px solid #2563EB",
    background: "#2563EB",
    color: "#FFFFFF",
    boxShadow: "0 7px 16px rgba(37,99,235,.16)",
  },

  /* RECOMMENDATION PAPER */

  resultsCol: {
    position: "sticky",
    top: "24px",
  },

  previewPaper: {
    padding: "34px 36px",
    background: "#FFFFFF",
    border: "1px solid #DDE5EF",
    borderRadius: "17px",
    boxShadow: "0 18px 48px rgba(15,23,42,.08)",
  },

  previewKicker: {
    margin: "0 0 10px",
    color: "#2563EB",
    fontSize: "10px",
    fontWeight: 850,
    letterSpacing: ".15em",
  },

  previewTitle: {
    margin: 0,
    color: "#0F172A",
    fontSize: "36px",
    lineHeight: 1.05,
    fontWeight: 750,
    letterSpacing: "-.035em",
  },

  blueRule: {
    width: "54px",
    height: "3px",
    margin: "22px 0",
    background: "#2563EB",
  },

  previewText: {
    margin: 0,
    color: "#475569",
    fontSize: "15px",
    lineHeight: 1.75,
  },

  tipArea: {
    marginTop: "28px",
    paddingTop: "22px",
    borderTop: "1px solid #E2E8F0",
  },

  tipTitle: {
    margin: "0 0 12px",
    color: "#0F172A",
    fontSize: "13px",
    fontWeight: 800,
  },

  tipList: {
    margin: 0,
    paddingLeft: "18px",
  },

  tipItem: {
    marginBottom: "9px",
    color: "#64748B",
    fontSize: "13px",
    lineHeight: 1.65,
  },

  /* GENERAL SECTIONS */

  section: {
    padding: "72px 0",
    borderTop: "1px solid #E2E8F0",
  },

  sectionHeader: {
    marginBottom: "34px",
  },

  /* VISUAL EXAMPLES */

  resumeExamples: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(275px, 1fr))",
    gap: "30px",
  },

  exampleItem: {
    padding: "26px 0 0",
    borderTop: "2px solid #CBD5E1",
  },

  exampleItemRecommended: {
    borderTop: "3px solid #2563EB",
  },

  cardTopRow: {
    minHeight: "64px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "18px",
  },

  exampleLabel: {
    margin: "0 0 5px",
    color: "#94A3B8",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: ".13em",
  },

  guideTitle: {
    margin: 0,
    color: "#0F172A",
    fontSize: "22px",
    lineHeight: 1.2,
    fontWeight: 750,
    letterSpacing: "-.025em",
  },

  recommendedBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    padding: "7px 10px",
    borderRadius: "999px",
    background: "#EFF6FF",
    color: "#2563EB",
    border: "1px solid #BFDBFE",
    fontSize: "10px",
    fontWeight: 800,
  },

  guideDescription: {
    margin: "17px 0 0",
    color: "#64748B",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  functionalNote: {
    margin: "15px 0 0",
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.7,
  },

  /* MOCKUP */

  mockupPaper: {
    minHeight: "310px",
    padding: "22px",
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    boxShadow: "0 12px 30px rgba(15,23,42,.06)",
  },

  mockupHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "13px",
  },

  mockNameLine: {
    width: "40%",
    height: "10px",
    background: "#0F172A",
  },

  mockContactLine: {
    width: "28%",
    height: "5px",
    background: "#CBD5E1",
  },

  mockBlueRule: {
    height: "2px",
    marginBottom: "14px",
    background: "#2563EB",
  },

  mockupBlock: {
    height: "34px",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    marginBottom: "7px",
    background: "#F1F5F9",
    borderLeft: "3px solid #CBD5E1",
  },

  mockupLongBlock: {
    height: "68px",
  },

  mockupAccentBlock: {
    background: "#EFF6FF",
    borderLeft: "3px solid #2563EB",
  },

  mockupSecondaryBlock: {
    background: "#F8FAFC",
    borderLeft: "3px solid #64748B",
  },

  mockupLabel: {
    color: "#475569",
    fontSize: "10px",
    fontWeight: 750,
    letterSpacing: ".02em",
  },

  /* RECOMMENDED */

  recommendedSection: {
    display: "grid",
    gridTemplateColumns: "minmax(250px, .55fr) minmax(0, 1.45fr)",
    gap: "60px",
    padding: "64px 0",
    borderTop: "1px solid #E2E8F0",
    borderBottom: "1px solid #E2E8F0",
  },

  recommendedLabelColumn: {
    alignSelf: "start",
  },

  recommendedContent: {
    paddingLeft: "30px",
    borderLeft: "4px solid #2563EB",
  },

  recommendedPanelKicker: {
    margin: "0 0 9px",
    color: "#2563EB",
    fontSize: "10px",
    fontWeight: 850,
    letterSpacing: ".15em",
  },

  recommendedPanelTitle: {
    margin: "0 0 12px",
    color: "#0F172A",
    fontSize: "36px",
    lineHeight: 1.05,
    fontWeight: 750,
    letterSpacing: "-.035em",
  },

  recommendedPanelText: {
    maxWidth: "760px",
    margin: 0,
    color: "#64748B",
    fontSize: "15px",
    lineHeight: 1.75,
  },

  /* BREAKDOWN */

  breakdownGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    columnGap: "54px",
  },

  breakdownItem: {
    padding: "30px 0 36px",
    borderTop: "1px solid #CBD5E1",
  },

  breakdownHeading: {
    display: "flex",
    alignItems: "baseline",
    gap: "13px",
    marginBottom: "12px",
  },

  breakdownNumber: {
    color: "#2563EB",
    fontSize: "10px",
    fontWeight: 850,
    letterSpacing: ".08em",
  },

  breakdownTitle: {
    margin: 0,
    color: "#0F172A",
    fontSize: "25px",
    lineHeight: 1.15,
    fontWeight: 750,
    letterSpacing: "-.03em",
  },

  guidePlainNote: {
    margin: "18px 0 0",
    paddingLeft: "15px",
    borderLeft: "2px solid #BFDBFE",
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.7,
  },

  breakdownColumns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "28px",
    marginTop: "25px",
  },

  guideSubhead: {
    margin: "0 0 10px",
    color: "#0F172A",
    fontSize: "12px",
    fontWeight: 800,
  },

  guideList: {
    margin: 0,
    paddingLeft: "17px",
  },

  guideItem: {
    marginBottom: "8px",
    color: "#64748B",
    fontSize: "13px",
    lineHeight: 1.65,
  },

  /* BOTTOM */

  bottomSection: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    gap: "18px",
    marginTop: "20px",
    padding: "30px 0",
    borderTop: "1px solid #E2E8F0",
  },

  hmMark: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "42px",
    height: "42px",
    borderRadius: "9px",
    background: "#EFF6FF",
    color: "#2563EB",
    fontSize: "10px",
    fontWeight: 900,
  },

  bottomTitle: {
    margin: "0 0 5px",
    color: "#334155",
    fontSize: "14px",
    fontWeight: 800,
  },

  bottomText: {
    maxWidth: "680px",
    margin: 0,
    color: "#94A3B8",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  buildButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    minHeight: "44px",
    padding: "0 17px",
    borderRadius: "8px",
    background: "#2563EB",
    color: "#FFFFFF",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(37,99,235,.14)",
  },
};
