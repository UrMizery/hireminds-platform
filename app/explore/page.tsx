"use client";

import { useEffect, useState, type CSSProperties } from "react";

const rotatingWords = [
  "Build.",
  "Match.",
  "Analyze.",
  "Improve.",
  "Advance.",
];

export default function ExplorePage() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroGlowOne} />
        <div style={styles.heroGlowTwo} />

        <div style={styles.heroInner}>
          <div style={styles.heroCopy}>
            <p style={styles.kicker}>EXPLORE HIREMINDS</p>

            <h1 style={styles.heroTitle}>
              Your career tools
              <br />
              should work
              <br />
              <span style={styles.blueText}>smarter.</span>
            </h1>

            <p style={styles.heroSubtitle}>
              Build stronger career materials, understand the jobs you want,
              improve how you match, and manage your search from one intelligent
              platform.
            </p>

            <div style={styles.heroActions}>
              <a href="/sign-up" style={styles.primaryButton}>
                Create Career Passport
              </a>

              <a href="#experience" style={styles.secondaryLink}>
                See How It Works ↓
              </a>
            </div>
          </div>

          <div style={styles.heroVisual}>
            <div style={styles.floatingLabelTop}>
              Resume Builder
            </div>

            <div style={styles.resumeStage}>
              <div style={styles.resumeSheetBack} />
              <div style={styles.resumeSheetMiddle} />

              <div style={styles.resumeSheet}>
                <div style={styles.resumeTopRow}>
                  <div>
                    <div style={styles.fakeName}>Jordan Taylor</div>
                    <div style={styles.fakeRole}>
                      Talent Acquisition Professional
                    </div>
                  </div>

                  <div style={styles.fakeContact}>
                    Hartford, CT
                    <br />
                    jordan@email.com
                  </div>
                </div>

                <div style={styles.resumeBlueLine} />

                <div style={styles.resumeMiniSection}>
                  <div style={styles.resumeMiniTitle}>
                    PROFESSIONAL SUMMARY
                  </div>
                  <div style={styles.resumeLineLong} />
                  <div style={styles.resumeLineLong} />
                  <div style={styles.resumeLineMedium} />
                </div>

                <div style={styles.resumeMiniSection}>
                  <div style={styles.resumeMiniTitle}>CORE SKILLS</div>

                  <div style={styles.fakeSkills}>
                    <span style={styles.fakeSkill}>Recruiting</span>
                    <span style={styles.fakeSkill}>Sourcing</span>
                    <span style={styles.fakeSkill}>Interviewing</span>
                    <span style={styles.fakeSkill}>ATS / CRM</span>
                  </div>
                </div>

                <div style={styles.resumeMiniSection}>
                  <div style={styles.resumeMiniTitle}>EXPERIENCE</div>

                  <div style={styles.resumeExperienceRow}>
                    <div>
                      <div style={styles.resumeCompany}>Senior Recruiter</div>
                      <div style={styles.resumeGrayText}>Sample Company</div>
                    </div>

                    <div style={styles.resumeGrayText}>2023 – Present</div>
                  </div>

                  <div style={styles.resumeLineLong} />
                  <div style={styles.resumeLineLong} />
                  <div style={styles.resumeLineMedium} />
                </div>
              </div>
            </div>

            <div style={styles.floatingLabelBottom}>
              No rigid templates.
            </div>
          </div>
        </div>

        <div style={styles.heroWordWrap}>
          <span style={styles.heroWordPrefix}>One platform to </span>
          <span key={wordIndex} style={styles.rotatingWord}>
            {rotatingWords[wordIndex]}
          </span>
        </div>
      </section>

      <section id="experience" style={styles.lightSection}>
        <div style={styles.splitSection}>
          <div style={styles.sectionCopy}>
            <p style={styles.kicker}>RESUME BUILDER</p>

            <h2 style={styles.lightTitle}>
              Your resume.
              <br />
              <span style={styles.blueText}>Not a template.</span>
            </h2>

            <p style={styles.lightText}>
              Build around your experience instead of forcing your career into
              a rigid design. Edit the sections that matter and keep the focus
              on your skills, accomplishments, and value.
            </p>

            <a href="/sign-up" style={styles.textCta}>
              Start Building →
            </a>
          </div>

          <div style={styles.resumeFeatureVisual}>
            <div style={styles.bigResume}>
              <div style={styles.bigResumeHeader}>
                <div>
                  <div style={styles.bigResumeName}>Jordan Taylor</div>
                  <div style={styles.bigResumeRole}>
                    Talent Acquisition Professional
                  </div>
                </div>

                <div style={styles.bigResumeContact}>
                  Hartford, CT
                  <br />
                  jordan@email.com
                </div>
              </div>

              <div style={styles.bigResumeDivider} />

              <div style={styles.bigResumeSection}>
                <strong>PROFESSIONAL SUMMARY</strong>
                <p>
                  Talent acquisition professional with experience managing
                  recruiting strategy, candidate pipelines, sourcing,
                  interviews, and hiring workflows.
                </p>
              </div>

              <div style={styles.bigResumeSection}>
                <strong>CORE SKILLS</strong>

                <div style={styles.bigSkillWrap}>
                  <span>Full-Cycle Recruiting</span>
                  <span>Talent Sourcing</span>
                  <span>Interviewing</span>
                  <span>Pipeline Development</span>
                  <span>ATS / CRM</span>
                  <span>Candidate Screening</span>
                </div>
              </div>

              <div style={styles.bigResumeSection}>
                <strong>EXPERIENCE</strong>

                <div style={styles.bigExperienceRow}>
                  <div>
                    <b>Senior Recruiter</b>
                    <div>Sample Company</div>
                  </div>

                  <span>2023 – Present</span>
                </div>

                <p>
                  Led recruiting workflows while managing sourcing, screening,
                  candidate communication, interviews, and selection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.darkFeatureSection}>
        <div style={styles.sectionNumber}>01</div>

        <div style={styles.darkFeatureInner}>
          <div style={styles.darkFeatureCopy}>
            <p style={styles.kicker}>RESUME MATCH ANALYZER</p>

            <h2 style={styles.darkTitle}>
              Know how you match
              <br />
              <span style={styles.blueText}>before you apply.</span>
            </h2>

            <p style={styles.darkText}>
              Compare your resume against a job and quickly see where you are
              aligned, where you're missing key language, and what deserves
              attention before you submit.
            </p>
          </div>

          <div style={styles.analyzerVisual}>
            <div style={styles.scoreCircle}>
              <span style={styles.scoreNumber}>86</span>
              <span style={styles.scoreLabel}>MATCH</span>
            </div>

            <div style={styles.analyzerDetails}>
              <AnalyzerLine
                label="Core Skills"
                value="Strong"
                width="88%"
              />
              <AnalyzerLine
                label="Experience"
                value="Aligned"
                width="78%"
              />
              <AnalyzerLine
                label="Keywords"
                value="Improve"
                width="62%"
              />
              <AnalyzerLine
                label="Role Fit"
                value="High"
                width="84%"
              />
            </div>
          </div>
        </div>
      </section>

      <section style={styles.lightSection}>
        <div style={styles.splitSectionReverse}>
          <div style={styles.analyzerPanelLight}>
            <div style={styles.fakeAnalyzerTop}>
              <span>JOB DESCRIPTION ANALYZER</span>
              <span style={styles.activeDot}>●</span>
            </div>

            <div style={styles.fakeAnalyzerHeadline}>
              Senior Talent Acquisition Partner
            </div>

            <div style={styles.analysisBlock}>
              <span style={styles.analysisLabel}>TOP SKILLS</span>

              <div style={styles.analysisTags}>
                <span>Recruiting Strategy</span>
                <span>Stakeholder Management</span>
                <span>Talent Sourcing</span>
                <span>ATS</span>
                <span>High-Volume Hiring</span>
              </div>
            </div>

            <div style={styles.analysisBlock}>
              <span style={styles.analysisLabel}>WHAT STANDS OUT</span>

              <p style={styles.analysisParagraph}>
                Strong emphasis on end-to-end recruiting, business partnership,
                candidate pipelines, and hiring strategy.
              </p>
            </div>

            <div style={styles.analysisBlock}>
              <span style={styles.analysisLabel}>RECOMMENDED FOCUS</span>

              <p style={styles.analysisParagraph}>
                Highlight measurable recruiting outcomes, stakeholder
                collaboration, and sourcing strategy.
              </p>
            </div>
          </div>

          <div style={styles.sectionCopy}>
            <p style={styles.kicker}>JOB DESCRIPTION ANALYZER</p>

            <h2 style={styles.lightTitle}>
              Understand the job
              <br />
              <span style={styles.blueText}>before you chase it.</span>
            </h2>

            <p style={styles.lightText}>
              Pull apart the job description, identify what matters most, and
              make smarter decisions about where to focus your application.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.statementSection}>
        <div style={styles.statementInner}>
          <p style={styles.kicker}>MORE THAN DOCUMENTS</p>

          <h2 style={styles.statementTitle}>
            Build.
            <span> Analyze.</span>
            <span> Optimize.</span>
            <span> Track.</span>
          </h2>

          <p style={styles.statementText}>
            HireMinds gives you the tools to move from creating career
            materials to making better career decisions.
          </p>
        </div>
      </section>

      <section style={styles.toolShowcaseSection}>
        <div style={styles.toolShowcaseInner}>
          <ToolRow
            number="02"
            title="Cover Letter Generator"
            description="Create stronger, more relevant cover letters using your own experience and the role you're targeting."
            side="left"
          />

          <ToolRow
            number="03"
            title="Career Path Generator"
            description="Explore where your current skills can take you and identify practical next moves."
            side="right"
          />

          <ToolRow
            number="04"
            title="Application Tracking"
            description="Keep your applications, progress, and next steps organized without losing track of your search."
            side="left"
          />
        </div>
      </section>

      <section style={styles.finalSection}>
        <div style={styles.finalGlow} />

        <div style={styles.finalInner}>
          <p style={styles.kicker}>HIREMINDS</p>

          <h2 style={styles.finalTitle}>
            One account.
            <br />
            Every tool.
            <br />
            <span style={styles.blueText}>Real results.</span>
          </h2>

          <p style={styles.finalText}>
            Build better materials. Make smarter moves. Manage your career from
            one platform.
          </p>

          <a href="/sign-up" style={styles.finalButton}>
            Create Career Passport
          </a>
        </div>
      </section>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes wordFade {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }

          20% {
            opacity: 1;
            transform: translateY(0);
          }

          80% {
            opacity: 1;
            transform: translateY(0);
          }

          100% {
            opacity: 0;
            transform: translateY(-10px);
          }
        }

        @keyframes floatResume {
          0%,
          100% {
            transform: translateY(0px) rotate(-1deg);
          }

          50% {
            transform: translateY(-10px) rotate(-0.2deg);
          }
        }

        @keyframes floatLabel {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-6px);
          }
        }

        @media (max-width: 900px) {
          .hm-mobile-stack {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

function AnalyzerLine({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div style={styles.analyzerLine}>
      <div style={styles.analyzerLineTop}>
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressBar,
            width,
          }}
        />
      </div>
    </div>
  );
}

function ToolRow({
  number,
  title,
  description,
  side,
}: {
  number: string;
  title: string;
  description: string;
  side: "left" | "right";
}) {
  const isRight = side === "right";

  return (
    <div
      className="hm-mobile-stack"
      style={{
        ...styles.toolRow,
        gridTemplateColumns: isRight ? "1.1fr 0.9fr" : "0.9fr 1.1fr",
      }}
    >
      {isRight ? <ToolVisual title={title} /> : null}

      <div style={styles.toolRowCopy}>
        <span style={styles.toolRowNumber}>{number}</span>

        <h3 style={styles.toolRowTitle}>{title}</h3>

        <p style={styles.toolRowText}>{description}</p>

        <a href="/sign-up" style={styles.textCta}>
          Explore with HireMinds →
        </a>
      </div>

      {!isRight ? <ToolVisual title={title} /> : null}
    </div>
  );
}

function ToolVisual({ title }: { title: string }) {
  return (
    <div style={styles.toolVisual}>
      <div style={styles.toolVisualTop}>
        <span>{title}</span>
        <span style={styles.activeDot}>●</span>
      </div>

      <div style={styles.toolVisualBody}>
        <div style={styles.toolVisualLargeLine} />
        <div style={styles.toolVisualMediumLine} />

        <div style={styles.toolVisualSpace} />

        <div style={styles.toolVisualSmallLabel}>SMART RECOMMENDATION</div>

        <div style={styles.toolVisualTextLine} />
        <div style={styles.toolVisualTextLine} />
        <div style={styles.toolVisualShortLine} />

        <div style={styles.toolVisualButton}>Generate</div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    margin: 0,
    background: "#020812",
    color: "#ffffff",
    overflow: "hidden",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  hero: {
    position: "relative",
    minHeight: "760px",
    overflow: "hidden",
    background:
      "radial-gradient(ellipse at 14% 16%, rgba(42,121,230,.20) 0%, rgba(10,54,112,.10) 30%, transparent 55%), radial-gradient(ellipse at 86% 70%, rgba(25,104,214,.18) 0%, rgba(8,43,92,.08) 32%, transparent 58%), radial-gradient(ellipse at 52% -8%, rgba(90,162,255,.11) 0%, transparent 40%), linear-gradient(135deg,#020812 0%,#05172a 28%,#03101f 50%,#08213d 72%,#020914 100%)",
  },

  heroGlowOne: {
    position: "absolute",
    width: "680px",
    height: "680px",
    borderRadius: "50%",
    top: "-250px",
    right: "-180px",
    background: "rgba(22,119,255,.13)",
    filter: "blur(120px)",
  },

  heroGlowTwo: {
    position: "absolute",
    width: "560px",
    height: "560px",
    borderRadius: "50%",
    left: "-180px",
    bottom: "-240px",
    background: "rgba(42,121,230,.08)",
    filter: "blur(110px)",
  },

  heroInner: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "110px 28px 70px",
    display: "grid",
    gridTemplateColumns: "0.95fr 1.05fr",
    gap: "70px",
    alignItems: "center",
  },

  heroCopy: {
    maxWidth: "620px",
  },

  kicker: {
    margin: "0 0 16px",
    color: "#1677FF",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.2em",
  },

  heroTitle: {
    margin: 0,
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(54px, 7vw, 94px)",
    fontWeight: 500,
    lineHeight: 0.95,
    letterSpacing: "-0.055em",
  },

  blueText: {
    color: "#1677FF",
  },

  heroSubtitle: {
    maxWidth: "620px",
    margin: "28px 0 32px",
    color: "#b9c4d1",
    fontSize: "18px",
    lineHeight: 1.72,
  },

  heroActions: {
    display: "flex",
    gap: "22px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "15px 24px",
    borderRadius: "12px",
    background: "#1677FF",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 800,
    boxShadow: "0 18px 45px rgba(22,119,255,.23)",
  },

  secondaryLink: {
    color: "#d8e0e8",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 700,
  },

  heroVisual: {
    position: "relative",
    minHeight: "560px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  resumeStage: {
    position: "relative",
    width: "100%",
    maxWidth: "520px",
    height: "560px",
  },

  resumeSheetBack: {
    position: "absolute",
    inset: "56px 18px 0 74px",
    background: "#0b1c32",
    borderRadius: "10px",
    transform: "rotate(8deg)",
    opacity: 0.55,
  },

  resumeSheetMiddle: {
    position: "absolute",
    inset: "32px 52px 14px 38px",
    background: "#dce5ef",
    borderRadius: "10px",
    transform: "rotate(3deg)",
  },

  resumeSheet: {
    position: "absolute",
    inset: "0 42px 20px 18px",
    padding: "42px",
    background: "#ffffff",
    color: "#161b22",
    borderRadius: "8px",
    boxShadow: "0 45px 100px rgba(0,0,0,.34)",
    animation: "floatResume 6s ease-in-out infinite",
  },

  floatingLabelTop: {
    position: "absolute",
    right: "5px",
    top: "30px",
    zIndex: 5,
    padding: "10px 16px",
    borderRadius: "999px",
    background: "#1677FF",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 800,
    boxShadow: "0 15px 35px rgba(22,119,255,.28)",
    animation: "floatLabel 4s ease-in-out infinite",
  },

  floatingLabelBottom: {
    position: "absolute",
    left: "-6px",
    bottom: "68px",
    zIndex: 5,
    padding: "10px 16px",
    borderRadius: "999px",
    background: "#07111e",
    border: "1px solid rgba(255,255,255,.15)",
    color: "#d7e0eb",
    fontSize: "12px",
    fontWeight: 700,
    boxShadow: "0 16px 45px rgba(0,0,0,.25)",
    animation: "floatLabel 5s ease-in-out infinite",
  },

  resumeTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "22px",
  },

  fakeName: {
    fontSize: "29px",
    fontWeight: 800,
  },

  fakeRole: {
    marginTop: "6px",
    color: "#1677FF",
    fontSize: "13px",
    fontWeight: 700,
  },

  fakeContact: {
    color: "#7a8490",
    fontSize: "10px",
    lineHeight: 1.6,
    textAlign: "right",
  },

  resumeBlueLine: {
    height: "2px",
    margin: "22px 0",
    background: "#1677FF",
  },

  resumeMiniSection: {
    marginBottom: "24px",
  },

  resumeMiniTitle: {
    marginBottom: "11px",
    color: "#111827",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: ".08em",
  },

  resumeLineLong: {
    height: "6px",
    marginBottom: "8px",
    background: "#e7ebef",
    borderRadius: "999px",
  },

  resumeLineMedium: {
    width: "72%",
    height: "6px",
    background: "#e7ebef",
    borderRadius: "999px",
  },

  fakeSkills: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
  },

  fakeSkill: {
    padding: "6px 8px",
    borderRadius: "5px",
    background: "#eef4fb",
    color: "#314052",
    fontSize: "9px",
  },

  resumeExperienceRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "12px",
  },

  resumeCompany: {
    color: "#111827",
    fontSize: "11px",
    fontWeight: 700,
  },

  resumeGrayText: {
    color: "#88919b",
    fontSize: "9px",
  },

  heroWordWrap: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "0 28px 70px",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(26px, 4vw, 42px)",
  },

  heroWordPrefix: {
    color: "#8898aa",
  },

  rotatingWord: {
    display: "inline-block",
    color: "#ffffff",
    animation: "wordFade 1.8s ease-in-out",
  },

  lightSection: {
    padding: "120px 28px",
    background: "#f7f9fc",
    color: "#111827",
  },

  splitSection: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "0.8fr 1.2fr",
    gap: "80px",
    alignItems: "center",
  },

  splitSectionReverse: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "80px",
    alignItems: "center",
  },

  sectionCopy: {
    maxWidth: "500px",
  },

  lightTitle: {
    margin: 0,
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(46px, 5vw, 68px)",
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: "-0.045em",
  },

  lightText: {
    margin: "24px 0",
    color: "#5d6874",
    fontSize: "17px",
    lineHeight: 1.75,
  },

  textCta: {
    color: "#1677FF",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 800,
  },

  resumeFeatureVisual: {
    position: "relative",
  },

  bigResume: {
    padding: "52px",
    background: "#ffffff",
    boxShadow: "0 35px 90px rgba(36,56,82,.14)",
    transform: "rotate(-1deg)",
  },

  bigResumeHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "22px",
  },

  bigResumeName: {
    fontSize: "32px",
    fontWeight: 800,
  },

  bigResumeRole: {
    marginTop: "5px",
    color: "#1677FF",
    fontSize: "13px",
    fontWeight: 700,
  },

  bigResumeContact: {
    color: "#7c8795",
    fontSize: "11px",
    lineHeight: 1.6,
    textAlign: "right",
  },

  bigResumeDivider: {
    height: "2px",
    margin: "24px 0",
    background: "#1677FF",
  },

  bigResumeSection: {
    marginBottom: "26px",
    color: "#35404d",
    fontSize: "13px",
    lineHeight: 1.65,
  },

  bigSkillWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "12px",
  },

  bigExperienceRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    margin: "12px 0",
  },

  darkFeatureSection: {
    position: "relative",
    padding: "125px 28px",
    background:
      "radial-gradient(circle at 85% 20%, rgba(22,119,255,.10), transparent 30%), #020812",
  },

  sectionNumber: {
    position: "absolute",
    left: "28px",
    top: "45px",
    color: "rgba(255,255,255,.08)",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "120px",
    fontWeight: 700,
  },

  darkFeatureInner: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "0.9fr 1.1fr",
    gap: "80px",
    alignItems: "center",
  },

  darkFeatureCopy: {
    maxWidth: "520px",
  },

  darkTitle: {
    margin: 0,
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(46px, 5vw, 68px)",
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: "-0.045em",
  },

  darkText: {
    margin: "24px 0 0",
    color: "#9faebe",
    fontSize: "17px",
    lineHeight: 1.75,
  },

  analyzerVisual: {
    display: "flex",
    gap: "54px",
    alignItems: "center",
    padding: "30px 0",
  },

  scoreCircle: {
    width: "210px",
    height: "210px",
    borderRadius: "50%",
    border: "12px solid rgba(22,119,255,.18)",
    boxShadow:
      "inset 0 0 0 12px rgba(22,119,255,.08), 0 0 70px rgba(22,119,255,.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  scoreNumber: {
    color: "#ffffff",
    fontSize: "66px",
    fontWeight: 800,
    lineHeight: 1,
  },

  scoreLabel: {
    marginTop: "6px",
    color: "#1677FF",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: ".14em",
  },

  analyzerDetails: {
    flex: 1,
    display: "grid",
    gap: "22px",
  },

  analyzerLine: {
    display: "grid",
    gap: "8px",
  },

  analyzerLineTop: {
    display: "flex",
    justifyContent: "space-between",
    color: "#c2ccd7",
    fontSize: "12px",
  },

  progressTrack: {
    height: "5px",
    borderRadius: "999px",
    background: "#132033",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: "999px",
    background: "#1677FF",
  },

  analyzerPanelLight: {
    padding: "38px",
    background: "#07111f",
    color: "#ffffff",
    boxShadow: "0 35px 90px rgba(20,39,65,.16)",
  },

  fakeAnalyzerTop: {
    display: "flex",
    justifyContent: "space-between",
    color: "#7faef0",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: ".12em",
  },

  activeDot: {
    color: "#1677FF",
  },

  fakeAnalyzerHeadline: {
    margin: "24px 0 34px",
    fontSize: "26px",
    fontWeight: 700,
  },

  analysisBlock: {
    padding: "22px 0",
    borderTop: "1px solid rgba(255,255,255,.08)",
  },

  analysisLabel: {
    color: "#7faef0",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: ".12em",
  },

  analysisTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "13px",
  },

  analysisParagraph: {
    margin: "12px 0 0",
    color: "#b9c4cf",
    fontSize: "13px",
    lineHeight: 1.65,
  },

  statementSection: {
    padding: "130px 28px",
    background: "#ffffff",
    color: "#101723",
    textAlign: "center",
  },

  statementInner: {
    maxWidth: "1100px",
    margin: "0 auto",
  },

  statementTitle: {
    margin: 0,
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(48px, 7vw, 90px)",
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: "-0.055em",
  },

  statementText: {
    maxWidth: "680px",
    margin: "28px auto 0",
    color: "#65707c",
    fontSize: "17px",
    lineHeight: 1.75,
  },

  toolShowcaseSection: {
    padding: "30px 28px 120px",
    background: "#f7f9fc",
    color: "#111827",
  },

  toolShowcaseInner: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  toolRow: {
    display: "grid",
    gap: "80px",
    alignItems: "center",
    padding: "100px 0",
    borderBottom: "1px solid #e1e7ee",
  },

  toolRowCopy: {
    maxWidth: "460px",
  },

  toolRowNumber: {
    color: "#1677FF",
    fontSize: "12px",
    fontWeight: 800,
  },

  toolRowTitle: {
    margin: "16px 0",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "44px",
    fontWeight: 500,
    letterSpacing: "-0.035em",
  },

  toolRowText: {
    margin: "0 0 22px",
    color: "#65707c",
    fontSize: "16px",
    lineHeight: 1.75,
  },

  toolVisual: {
    background: "#06111f",
    color: "#ffffff",
    boxShadow: "0 30px 70px rgba(23,43,69,.18)",
  },

  toolVisualTop: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,.08)",
    color: "#aebdce",
    fontSize: "11px",
    fontWeight: 700,
  },

  toolVisualBody: {
    padding: "32px",
  },

  toolVisualLargeLine: {
    width: "72%",
    height: "13px",
    marginBottom: "10px",
    borderRadius: "999px",
    background: "#dbe3ec",
  },

  toolVisualMediumLine: {
    width: "48%",
    height: "9px",
    borderRadius: "999px",
    background: "#475a72",
  },

  toolVisualSpace: {
    height: "36px",
  },

  toolVisualSmallLabel: {
    color: "#1677FF",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: ".12em",
  },

  toolVisualTextLine: {
    height: "7px",
    marginTop: "12px",
    borderRadius: "999px",
    background: "#27384d",
  },

  toolVisualShortLine: {
    width: "65%",
    height: "7px",
    marginTop: "12px",
    borderRadius: "999px",
    background: "#27384d",
  },

  toolVisualButton: {
    width: "110px",
    marginTop: "34px",
    padding: "10px 14px",
    borderRadius: "8px",
    background: "#1677FF",
    textAlign: "center",
    fontSize: "11px",
    fontWeight: 800,
  },

  finalSection: {
    position: "relative",
    padding: "140px 28px",
    overflow: "hidden",
    background:
      "linear-gradient(135deg,#020812 0%,#061a31 50%,#020812 100%)",
  },

  finalGlow: {
    position: "absolute",
    width: "720px",
    height: "720px",
    top: "-260px",
    right: "-180px",
    borderRadius: "50%",
    background: "rgba(22,119,255,.13)",
    filter: "blur(120px)",
  },

  finalInner: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1100px",
    margin: "0 auto",
  },

  finalTitle: {
    margin: 0,
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(58px, 8vw, 102px)",
    fontWeight: 500,
    lineHeight: 0.93,
    letterSpacing: "-0.055em",
  },

  finalText: {
    maxWidth: "600px",
    margin: "28px 0 32px",
    color: "#b6c2cf",
    fontSize: "17px",
    lineHeight: 1.7,
  },

  finalButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 26px",
    borderRadius: "12px",
    background: "#1677FF",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 800,
    boxShadow: "0 18px 45px rgba(22,119,255,.25)",
  },
};
