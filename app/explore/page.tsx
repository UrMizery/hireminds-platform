"use client";

import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";

const heroWords = [
  "build.",
  "match.",
  "analyze.",
  "optimize.",
  "advance.",
];

const resumeWords = [
  "your experience.",
  "your strengths.",
  "your value.",
  "your story.",
];

const matchWords = [
  "before you apply.",
  "before you guess.",
  "before you submit.",
];

const analyzeWords = [
  "skills.",
  "requirements.",
  "keywords.",
  "priorities.",
];

const finalWords = [
  "Create.",
  "Analyze.",
  "Optimize.",
  "Track.",
  "Advance.",
];

export default function ExplorePage() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [resumeIndex, setResumeIndex] = useState(0);
  const [matchIndex, setMatchIndex] = useState(0);
  const [analyzeIndex, setAnalyzeIndex] = useState(0);
  const [finalIndex, setFinalIndex] = useState(0);

  const [matchScore, setMatchScore] = useState(72);

  const [coverStep, setCoverStep] = useState(0);

  const [activeKeyword, setActiveKeyword] = useState(0);

  useEffect(() => {
    const heroTimer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroWords.length);
    }, 1750);

    const resumeTimer = window.setInterval(() => {
      setResumeIndex((prev) => (prev + 1) % resumeWords.length);
    }, 2200);

    const matchTimer = window.setInterval(() => {
      setMatchIndex((prev) => (prev + 1) % matchWords.length);
    }, 2200);

    const analyzeTimer = window.setInterval(() => {
      setAnalyzeIndex((prev) => (prev + 1) % analyzeWords.length);
    }, 2100);

    const finalTimer = window.setInterval(() => {
      setFinalIndex((prev) => (prev + 1) % finalWords.length);
    }, 1500);

    return () => {
      window.clearInterval(heroTimer);
      window.clearInterval(resumeTimer);
      window.clearInterval(matchTimer);
      window.clearInterval(analyzeTimer);
      window.clearInterval(finalTimer);
    };
  }, []);

  useEffect(() => {
    const scores = [72, 81, 88, 93];
    let index = 0;

    const timer = window.setInterval(() => {
      index = (index + 1) % scores.length;
      setMatchScore(scores[index]);
    }, 1700);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCoverStep((prev) => (prev + 1) % 4);
    }, 1900);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveKeyword((prev) => (prev + 1) % 5);
    }, 1400);

    return () => window.clearInterval(timer);
  }, []);

  const coverStepLabel = useMemo(() => {
    if (coverStep === 0) return "Role selected";
    if (coverStep === 1) return "Experience identified";
    if (coverStep === 2) return "Tone aligned";
    return "Letter generated";
  }, [coverStep]);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroGlowOne} />
        <div style={styles.heroGlowTwo} />

        <div style={styles.heroInner}>
          <div style={styles.heroCopy}>
            <p style={styles.kicker}>EXPLORE HIREMINDS</p>

            <h1 style={styles.heroTitle}>
              One platform built
              <br />
              to help you
              <br />
              <span key={heroIndex} style={styles.wordSwap}>
                {heroWords[heroIndex]}
              </span>
            </h1>

            <p style={styles.heroSubtitle}>
              Build stronger career materials, understand the roles you want,
              improve how you match, and manage your search with tools designed
              to work together.
            </p>

            <div style={styles.heroActions}>
              <a href="/sign-up" style={styles.primaryButton}>
                Create Career Passport
              </a>

              <a href="#resume" style={styles.secondaryLink}>
                Explore the Platform ↓
              </a>
            </div>
          </div>

          <div style={styles.heroVisual}>
            <div style={styles.heroResumeBack} />
            <div style={styles.heroResumeMid} />

            <div style={styles.heroResume}>
              <div style={styles.resumeHeaderRow}>
                <div>
                  <div style={styles.resumeName}>Jordan Taylor</div>
                  <div style={styles.resumeRole}>
                    Talent Acquisition Professional
                  </div>
                </div>

                <div style={styles.resumeContact}>
                  Hartford, CT
                  <br />
                  jordan@email.com
                </div>
              </div>

              <div style={styles.resumeDivider} />

              <div style={styles.resumeSection}>
                <div style={styles.resumeSectionLabel}>
                  PROFESSIONAL SUMMARY
                </div>

                <p style={styles.resumeText}>
                  Talent acquisition professional with experience leading
                  full-cycle recruiting, sourcing strategy, candidate
                  engagement, interviewing, and hiring workflows.
                </p>
              </div>

              <div style={styles.resumeSection}>
                <div style={styles.resumeSectionLabel}>CORE SKILLS</div>

                <div style={styles.skillRow}>
                  <span>Recruiting</span>
                  <span>Sourcing</span>
                  <span>Interviewing</span>
                  <span>ATS / CRM</span>
                </div>
              </div>

              <div style={styles.resumeSection}>
                <div style={styles.resumeSectionLabel}>EXPERIENCE</div>

                <div style={styles.experienceHeader}>
                  <div>
                    <b>Senior Recruiter</b>
                    <small>Sample Company</small>
                  </div>

                  <small>2023 – Present</small>
                </div>

                <div style={styles.textLine} />
                <div style={styles.textLine} />
                <div style={styles.textLineShort} />
              </div>
            </div>

            <div style={styles.heroPillOne}>No rigid templates</div>
            <div style={styles.heroPillTwo}>Built around you</div>
          </div>
        </div>
      </section>

      <section id="resume" style={styles.lightSection}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionCopy}>
            <p style={styles.kicker}>RESUME BUILDER</p>

            <h2 style={styles.lightTitle}>
              Build around
              <br />
              <span key={resumeIndex} style={styles.wordSwapBlue}>
                {resumeWords[resumeIndex]}
              </span>
            </h2>

            <p style={styles.lightText}>
              HireMinds is not built around a stack of rigid resume templates.
              Your resume is created around your actual experience, skills,
              accomplishments, and career direction.
            </p>

            <a href="/sign-up" style={styles.textLink}>
              Start Building →
            </a>
          </div>

          <div style={styles.resumeShowcase}>
            <div style={styles.resumeShowcaseBar}>
              <span>Resume Builder</span>
              <span style={styles.statusDot}>● Live Preview</span>
            </div>

            <div style={styles.resumeShowcaseBody}>
              <div style={styles.resumeSidebar}>
                <div style={styles.sidebarActive}>Summary</div>
                <div>Skills</div>
                <div>Experience</div>
                <div>Education</div>
              </div>

              <div style={styles.resumeEditor}>
                <div style={styles.editorLabel}>PROFESSIONAL SUMMARY</div>

                <div style={styles.editorField}>
                  Talent acquisition professional with experience managing
                  sourcing, screening, interviews, candidate pipelines, and
                  hiring workflows.
                </div>

                <div style={styles.editorActionRow}>
                  <span>Improve wording</span>
                  <span>Strengthen impact</span>
                </div>
              </div>

              <div style={styles.resumePreviewMini}>
                <div style={styles.previewName}>Jordan Taylor</div>
                <div style={styles.previewRole}>
                  Talent Acquisition Professional
                </div>
                <div style={styles.previewBlueLine} />

                <div style={styles.previewLabel}>SUMMARY</div>
                <div style={styles.previewLine} />
                <div style={styles.previewLine} />
                <div style={styles.previewLineShort} />

                <div style={styles.previewLabel}>SKILLS</div>
                <div style={styles.previewSkillLine}>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.darkSection}>
        <div style={styles.sectionInner}>
          <div style={styles.matchVisual}>
            <div style={styles.matchHeader}>
              <span>Resume Match Analyzer</span>
              <span style={styles.statusDot}>● Analyzing</span>
            </div>

            <div style={styles.matchBody}>
              <div style={styles.scoreArea}>
                <div style={styles.scoreRing}>
                  <span style={styles.scoreNumber}>{matchScore}</span>
                  <span style={styles.scoreText}>MATCH</span>
                </div>
              </div>

              <div style={styles.matchDetails}>
                <MatchRow label="Core Skills" width="92%" />
                <MatchRow label="Experience" width="86%" />
                <MatchRow label="Keywords" width="78%" />
                <MatchRow label="Role Alignment" width="90%" />

                <div style={styles.matchRecommendation}>
                  <span style={styles.recommendationLabel}>
                    RECOMMENDED FOCUS
                  </span>

                  <p>
                    Add stronger language around stakeholder partnership and
                    recruiting strategy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.darkCopy}>
            <p style={styles.kicker}>RESUME MATCH ANALYZER</p>

            <h2 style={styles.darkTitle}>
              Know where you stand
              <br />
              <span key={matchIndex} style={styles.wordSwap}>
                {matchWords[matchIndex]}
              </span>
            </h2>

            <p style={styles.darkText}>
              Compare your resume to the job you want and quickly identify
              strengths, gaps, and areas worth improving before you submit.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.lightSection}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionCopy}>
            <p style={styles.kicker}>JOB DESCRIPTION ANALYZER</p>

            <h2 style={styles.lightTitle}>
              Pull out the
              <br />
              <span key={analyzeIndex} style={styles.wordSwapBlue}>
                {analyzeWords[analyzeIndex]}
              </span>
            </h2>

            <p style={styles.lightText}>
              Stop guessing what matters. Break the job description into the
              skills, requirements, keywords, and priorities that should guide
              your application.
            </p>
          </div>

          <div style={styles.jdVisual}>
            <div style={styles.jdLeft}>
              <div style={styles.jdHeader}>JOB DESCRIPTION</div>

              <div style={styles.jdTitle}>
                Senior Talent Acquisition Partner
              </div>

              <p style={styles.jdParagraph}>
                Lead end-to-end recruiting strategy while partnering with
                business leaders to identify talent needs, develop sourcing
                pipelines, improve candidate experience, and deliver hiring
                outcomes.
              </p>

              <p style={styles.jdParagraph}>
                The ideal candidate will have experience with high-volume
                hiring, stakeholder management, ATS systems, talent sourcing,
                interviewing, and recruiting analytics.
              </p>
            </div>

            <div style={styles.jdRight}>
              <div style={styles.jdResultHeader}>WHAT HIREMINDS FOUND</div>

              {[
                "Recruiting Strategy",
                "Stakeholder Management",
                "Talent Sourcing",
                "High-Volume Hiring",
                "ATS / CRM",
              ].map((item, index) => (
                <div
                  key={item}
                  style={{
                    ...styles.keywordRow,
                    ...(activeKeyword === index
                      ? styles.keywordRowActive
                      : {}),
                  }}
                >
                  <span>{item}</span>
                  <span>
                    {activeKeyword === index ? "Focus" : "Detected"}
                  </span>
                </div>
              ))}

              <div style={styles.jdRecommendation}>
                <span style={styles.recommendationLabel}>
                  APPLICATION FOCUS
                </span>

                <p>
                  Lead with recruiting strategy, stakeholder partnership, and
                  measurable hiring results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.darkSection}>
        <div style={styles.sectionInner}>
          <div style={styles.coverVisual}>
            <div style={styles.coverTop}>
              <span>Cover Letter Generator</span>

              <span style={styles.coverStep}>
                {coverStepLabel}
              </span>
            </div>

            <div style={styles.coverBody}>
              <div style={styles.coverControls}>
                <CoverControl
                  label="TARGET ROLE"
                  value="Senior Talent Acquisition Partner"
                  active={coverStep >= 0}
                />

                <CoverControl
                  label="EXPERIENCE"
                  value="Recruiting • Sourcing • Stakeholder Management"
                  active={coverStep >= 1}
                />

                <CoverControl
                  label="TONE"
                  value="Professional • Confident • Direct"
                  active={coverStep >= 2}
                />
              </div>

              <div style={styles.coverLetter}>
                <div style={styles.coverLetterTitle}>
                  Dear Hiring Manager,
                </div>

                <p
                  style={{
                    ...styles.coverLetterText,
                    opacity: coverStep >= 1 ? 1 : 0.24,
                  }}
                >
                  I am excited to apply for the Senior Talent Acquisition
                  Partner opportunity. My background includes full-cycle
                  recruiting, talent sourcing, candidate pipeline development,
                  and collaboration with hiring leaders across fast-moving
                  environments.
                </p>

                <p
                  style={{
                    ...styles.coverLetterText,
                    opacity: coverStep >= 2 ? 1 : 0.16,
                  }}
                >
                  I bring a practical recruiting approach focused on alignment,
                  candidate experience, and measurable hiring outcomes.
                </p>

                <div
                  style={{
                    ...styles.generatedIndicator,
                    opacity: coverStep === 3 ? 1 : 0,
                  }}
                >
                  Ready to review
                </div>
              </div>
            </div>
          </div>

          <div style={styles.darkCopy}>
            <p style={styles.kicker}>COVER LETTER GENERATOR</p>

            <h2 style={styles.darkTitle}>
              Turn your experience
              <br />
              <span style={styles.blueText}>into a stronger story.</span>
            </h2>

            <p style={styles.darkText}>
              Build a more relevant cover letter around the role you're
              targeting, the experience you actually have, and the tone you
              want to use.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.statementSection}>
        <div style={styles.statementInner}>
          <p style={styles.kicker}>THE CAREER TOOLKIT</p>

          <h2 style={styles.statementTitle}>
            More than one tool.
            <br />
            <span style={styles.blueText}>One connected experience.</span>
          </h2>

          <div style={styles.toolTextStrip}>
            <span>Resume Builder</span>
            <span>Resume Match</span>
            <span>Job Analyzer</span>
            <span>Cover Letters</span>
            <span>Career Path</span>
            <span>Application Tracking</span>
          </div>
        </div>
      </section>

      <section style={styles.lightSection}>
        <div style={styles.trackerInner}>
          <div style={styles.trackerCopy}>
            <p style={styles.kicker}>APPLICATION TRACKING</p>

            <h2 style={styles.lightTitle}>
              Keep the search
              <br />
              <span style={styles.blueText}>moving forward.</span>
            </h2>

            <p style={styles.lightText}>
              Organize where you applied, what stage you're in, and what needs
              your attention next without losing track of your search.
            </p>
          </div>

          <div style={styles.trackerVisual}>
            <div style={styles.trackerHeader}>
              <span>MY APPLICATIONS</span>
              <span>4 ACTIVE</span>
            </div>

            <TrackerRow
              company="Apex Health"
              role="Talent Acquisition Partner"
              status="Interview"
              active
            />

            <TrackerRow
              company="Northline"
              role="Senior Recruiter"
              status="Applied"
            />

            <TrackerRow
              company="Meridian"
              role="Recruiting Manager"
              status="Follow Up"
            />

            <TrackerRow
              company="BrightPath"
              role="Talent Partner"
              status="Saved"
            />
          </div>
        </div>
      </section>

      <section style={styles.finalSection}>
        <div style={styles.finalGlow} />

        <div style={styles.finalInner}>
          <p style={styles.kicker}>HIREMINDS</p>

          <h2 style={styles.finalTitle}>
            <span key={finalIndex} style={styles.wordSwap}>
              {finalWords[finalIndex]}
            </span>
            <br />
            your next move.
          </h2>

          <p style={styles.finalText}>
            One account. Every tool. Built to help you move through your career
            with more clarity, stronger materials, and better decisions.
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

        @keyframes hmWordSwap {
          0% {
            opacity: 0;
            transform: translateY(14px);
            filter: blur(4px);
          }

          18% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }

          82% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }

          100% {
            opacity: 0;
            transform: translateY(-12px);
            filter: blur(3px);
          }
        }

        @keyframes hmFloatResume {
          0%,
          100% {
            transform: translateY(0) rotate(-1deg);
          }

          50% {
            transform: translateY(-10px) rotate(-0.25deg);
          }
        }

        @keyframes hmFloatPill {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes hmPulseDot {
          0%,
          100% {
            opacity: 0.45;
          }

          50% {
            opacity: 1;
          }
        }

        @media (max-width: 960px) {
          .hm-stack {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 700px) {
          .hm-tool-strip {
            gap: 18px !important;
            justify-content: flex-start !important;
          }
        }
      `}</style>
    </main>
  );
}

function MatchRow({
  label,
  width,
}: {
  label: string;
  width: string;
}) {
  return (
    <div style={styles.matchRow}>
      <div style={styles.matchRowTop}>
        <span>{label}</span>
        <span>Strong</span>
      </div>

      <div style={styles.matchTrack}>
        <div
          style={{
            ...styles.matchFill,
            width,
          }}
        />
      </div>
    </div>
  );
}

function CoverControl({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div
      style={{
        ...styles.coverControl,
        borderColor: active
          ? "rgba(22,119,255,.45)"
          : "rgba(255,255,255,.08)",
      }}
    >
      <span style={styles.coverControlLabel}>{label}</span>

      <span
        style={{
          ...styles.coverControlValue,
          opacity: active ? 1 : 0.35,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function TrackerRow({
  company,
  role,
  status,
  active = false,
}: {
  company: string;
  role: string;
  status: string;
  active?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.trackerRow,
        background: active ? "#eef5ff" : "transparent",
      }}
    >
      <div>
        <strong style={styles.trackerCompany}>{company}</strong>
        <span style={styles.trackerRole}>{role}</span>
      </div>

      <span
        style={{
          ...styles.trackerStatus,
          color: active ? "#1677FF" : "#65707c",
        }}
      >
        {status}
      </span>
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
    overflow: "hidden",
    background:
      "radial-gradient(ellipse at 14% 16%, rgba(42,121,230,.20) 0%, rgba(10,54,112,.10) 30%, transparent 55%), radial-gradient(ellipse at 86% 70%, rgba(25,104,214,.18) 0%, rgba(8,43,92,.08) 32%, transparent 58%), radial-gradient(ellipse at 52% -8%, rgba(90,162,255,.11) 0%, transparent 40%), linear-gradient(135deg,#020812 0%,#05172a 28%,#03101f 50%,#08213d 72%,#020914 100%)",
  },

  heroGlowOne: {
    position: "absolute",
    width: "680px",
    height: "680px",
    borderRadius: "50%",
    right: "-210px",
    top: "-260px",
    background: "rgba(22,119,255,.14)",
    filter: "blur(120px)",
  },

  heroGlowTwo: {
    position: "absolute",
    width: "520px",
    height: "520px",
    borderRadius: "50%",
    left: "-180px",
    bottom: "-210px",
    background: "rgba(22,119,255,.08)",
    filter: "blur(110px)",
  },

  heroInner: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "115px 28px 125px",
    display: "grid",
    gridTemplateColumns: "0.92fr 1.08fr",
    gap: "80px",
    alignItems: "center",
  },

  heroCopy: {
    maxWidth: "640px",
  },

  kicker: {
    margin: "0 0 17px",
    color: "#1677FF",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: ".22em",
  },

  heroTitle: {
    margin: 0,
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(58px, 7vw, 96px)",
    fontWeight: 500,
    lineHeight: 0.94,
    letterSpacing: "-0.055em",
  },

  wordSwap: {
    display: "inline-block",
    color: "#1677FF",
    animation: "hmWordSwap 1.75s ease-in-out",
  },

  wordSwapBlue: {
    display: "inline-block",
    color: "#1677FF",
    animation: "hmWordSwap 2.1s ease-in-out",
  },

  blueText: {
    color: "#1677FF",
  },

  heroSubtitle: {
    maxWidth: "620px",
    margin: "28px 0 32px",
    color: "#b8c3cf",
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
    justifyContent: "center",
    alignItems: "center",
    padding: "15px 25px",
    borderRadius: "11px",
    background: "#1677FF",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 800,
    boxShadow: "0 18px 42px rgba(22,119,255,.22)",
  },

  secondaryLink: {
    color: "#d1dae4",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 700,
  },

  heroVisual: {
    position: "relative",
    minHeight: "610px",
  },

  heroResumeBack: {
    position: "absolute",
    width: "70%",
    height: "77%",
    right: "3%",
    top: "14%",
    background: "#0d2340",
    transform: "rotate(8deg)",
    borderRadius: "7px",
    opacity: 0.6,
  },

  heroResumeMid: {
    position: "absolute",
    width: "72%",
    height: "80%",
    right: "8%",
    top: "10%",
    background: "#d8e0e8",
    transform: "rotate(3deg)",
    borderRadius: "7px",
  },

  heroResume: {
    position: "absolute",
    width: "74%",
    minHeight: "475px",
    left: "5%",
    top: "4%",
    padding: "44px",
    boxSizing: "border-box",
    background: "#ffffff",
    color: "#111827",
    boxShadow: "0 50px 100px rgba(0,0,0,.3)",
    animation: "hmFloatResume 6s ease-in-out infinite",
  },

  resumeHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "22px",
  },

  resumeName: {
    fontSize: "28px",
    fontWeight: 800,
  },

  resumeRole: {
    marginTop: "5px",
    color: "#1677FF",
    fontSize: "12px",
    fontWeight: 700,
  },

  resumeContact: {
    color: "#7b8794",
    fontSize: "10px",
    lineHeight: 1.6,
    textAlign: "right",
  },

  resumeDivider: {
    height: "2px",
    margin: "23px 0",
    background: "#1677FF",
  },

  resumeSection: {
    marginBottom: "23px",
  },

  resumeSectionLabel: {
    marginBottom: "9px",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: ".08em",
  },

  resumeText: {
    margin: 0,
    color: "#4c5967",
    fontSize: "11px",
    lineHeight: 1.65,
  },

  skillRow: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
    color: "#415063",
    fontSize: "9px",
  },

  experienceHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    fontSize: "10px",
  },

  textLine: {
    height: "6px",
    marginTop: "9px",
    borderRadius: "999px",
    background: "#e6ebf0",
  },

  textLineShort: {
    width: "68%",
    height: "6px",
    marginTop: "9px",
    borderRadius: "999px",
    background: "#e6ebf0",
  },

  heroPillOne: {
    position: "absolute",
    right: "0",
    top: "90px",
    padding: "11px 16px",
    borderRadius: "999px",
    background: "#1677FF",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 800,
    boxShadow: "0 18px 40px rgba(22,119,255,.3)",
    animation: "hmFloatPill 4s ease-in-out infinite",
  },

  heroPillTwo: {
    position: "absolute",
    left: "0",
    bottom: "85px",
    padding: "11px 16px",
    borderRadius: "999px",
    background: "#07101d",
    border: "1px solid rgba(255,255,255,.14)",
    color: "#d6deea",
    fontSize: "12px",
    fontWeight: 700,
    animation: "hmFloatPill 5s ease-in-out infinite",
  },

  lightSection: {
    padding: "125px 28px",
    background: "#f4f7fb",
    color: "#101827",
  },

  sectionInner: {
    maxWidth: "1220px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "0.82fr 1.18fr",
    gap: "85px",
    alignItems: "center",
  },

  sectionCopy: {
    maxWidth: "510px",
  },

  lightTitle: {
    margin: 0,
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(46px, 5vw, 70px)",
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: "-0.045em",
  },

  lightText: {
    margin: "24px 0",
    color: "#5f6a77",
    fontSize: "17px",
    lineHeight: 1.76,
  },

  textLink: {
    color: "#1677FF",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 800,
  },

  resumeShowcase: {
    overflow: "hidden",
    background: "#061221",
    boxShadow: "0 35px 85px rgba(26,46,72,.18)",
  },

  resumeShowcaseBar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 19px",
    borderBottom: "1px solid rgba(255,255,255,.07)",
    color: "#c4d0de",
    fontSize: "11px",
    fontWeight: 700,
  },

  statusDot: {
    color: "#1677FF",
    fontSize: "10px",
  },

  resumeShowcaseBody: {
    minHeight: "390px",
    display: "grid",
    gridTemplateColumns: "145px 1fr 240px",
  },

  resumeSidebar: {
    padding: "28px 18px",
    display: "grid",
    alignContent: "start",
    gap: "13px",
    borderRight: "1px solid rgba(255,255,255,.07)",
    color: "#71839a",
    fontSize: "12px",
  },

  sidebarActive: {
    color: "#ffffff",
    fontWeight: 800,
  },

  resumeEditor: {
    padding: "32px",
  },

  editorLabel: {
    color: "#1677FF",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: ".1em",
  },

  editorField: {
    marginTop: "16px",
    padding: "20px",
    minHeight: "110px",
    background: "#091a2d",
    color: "#c7d2de",
    fontSize: "13px",
    lineHeight: 1.7,
  },

  editorActionRow: {
    marginTop: "18px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    color: "#7faeff",
    fontSize: "11px",
  },

  resumePreviewMini: {
    padding: "28px",
    background: "#ffffff",
    color: "#101827",
  },

  previewName: {
    fontSize: "18px",
    fontWeight: 800,
  },

  previewRole: {
    marginTop: "4px",
    color: "#1677FF",
    fontSize: "9px",
  },

  previewBlueLine: {
    height: "2px",
    margin: "14px 0",
    background: "#1677FF",
  },

  previewLabel: {
    marginTop: "16px",
    color: "#111827",
    fontSize: "8px",
    fontWeight: 800,
  },

  previewLine: {
    height: "5px",
    marginTop: "8px",
    background: "#e4e9ef",
  },

  previewLineShort: {
    width: "65%",
    height: "5px",
    marginTop: "8px",
    background: "#e4e9ef",
  },

  previewSkillLine: {
    display: "flex",
    gap: "5px",
    marginTop: "9px",
  },

  darkSection: {
    padding: "125px 28px",
    background:
      "radial-gradient(circle at 82% 18%, rgba(22,119,255,.09), transparent 28%), #020812",
  },

  darkCopy: {
    maxWidth: "510px",
  },

  darkTitle: {
    margin: 0,
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(46px, 5vw, 70px)",
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: "-0.045em",
  },

  darkText: {
    margin: "24px 0 0",
    color: "#9caaba",
    fontSize: "17px",
    lineHeight: 1.76,
  },

  matchVisual: {
    background: "#07111f",
    boxShadow: "0 35px 90px rgba(0,0,0,.28)",
  },

  matchHeader: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,.07)",
    color: "#c2cfdb",
    fontSize: "11px",
    fontWeight: 700,
  },

  matchBody: {
    minHeight: "365px",
    padding: "38px",
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "46px",
    alignItems: "center",
  },

  scoreArea: {
    display: "flex",
    justifyContent: "center",
  },

  scoreRing: {
    width: "190px",
    height: "190px",
    borderRadius: "50%",
    border: "11px solid rgba(22,119,255,.22)",
    boxShadow: "0 0 55px rgba(22,119,255,.08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  scoreNumber: {
    fontSize: "62px",
    fontWeight: 800,
  },

  scoreText: {
    marginTop: "4px",
    color: "#1677FF",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: ".14em",
  },

  matchDetails: {
    display: "grid",
    gap: "19px",
  },

  matchRow: {
    display: "grid",
    gap: "7px",
  },

  matchRowTop: {
    display: "flex",
    justifyContent: "space-between",
    color: "#aebccc",
    fontSize: "11px",
  },

  matchTrack: {
    height: "5px",
    borderRadius: "999px",
    background: "#14263c",
    overflow: "hidden",
  },

  matchFill: {
    height: "100%",
    borderRadius: "999px",
    background: "#1677FF",
    transition: "width .6s ease",
  },

  matchRecommendation: {
    marginTop: "5px",
    paddingTop: "18px",
    borderTop: "1px solid rgba(255,255,255,.08)",
    color: "#b8c4d0",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  recommendationLabel: {
    color: "#1677FF",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: ".12em",
  },

  jdVisual: {
    minHeight: "430px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "#ffffff",
    boxShadow: "0 35px 85px rgba(27,49,75,.15)",
  },

  jdLeft: {
    padding: "34px",
    borderRight: "1px solid #e3e8ee",
  },

  jdRight: {
    padding: "34px",
    background: "#07111f",
    color: "#ffffff",
  },

  jdHeader: {
    color: "#7c8794",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: ".12em",
  },

  jdTitle: {
    margin: "16px 0 22px",
    color: "#101827",
    fontSize: "24px",
    fontWeight: 800,
  },

  jdParagraph: {
    color: "#606b78",
    fontSize: "12px",
    lineHeight: 1.75,
  },

  jdResultHeader: {
    marginBottom: "20px",
    color: "#7faeff",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: ".12em",
  },

  keywordRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "13px 0",
    borderBottom: "1px solid rgba(255,255,255,.07)",
    color: "#b8c3cf",
    fontSize: "11px",
    transition: "all .35s ease",
  },

  keywordRowActive: {
    padding: "13px 12px",
    background: "rgba(22,119,255,.1)",
    color: "#ffffff",
  },

  jdRecommendation: {
    marginTop: "22px",
    color: "#b9c5d1",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  coverVisual: {
    background: "#06111f",
    boxShadow: "0 35px 90px rgba(0,0,0,.26)",
  },

  coverTop: {
    display: "flex",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,.07)",
    color: "#c6d0dc",
    fontSize: "11px",
    fontWeight: 700,
  },

  coverStep: {
    color: "#1677FF",
  },

  coverBody: {
    minHeight: "395px",
    display: "grid",
    gridTemplateColumns: "0.8fr 1.2fr",
  },

  coverControls: {
    padding: "28px",
    borderRight: "1px solid rgba(255,255,255,.07)",
    display: "grid",
    alignContent: "start",
    gap: "14px",
  },

  coverControl: {
    padding: "15px",
    border: "1px solid",
    background: "#081828",
    transition: "all .35s ease",
  },

  coverControlLabel: {
    display: "block",
    marginBottom: "8px",
    color: "#7188a3",
    fontSize: "8px",
    fontWeight: 800,
    letterSpacing: ".12em",
  },

  coverControlValue: {
    color: "#d6deea",
    fontSize: "11px",
  },

  coverLetter: {
    position: "relative",
    padding: "35px",
    background: "#ffffff",
    color: "#111827",
  },

  coverLetterTitle: {
    marginBottom: "22px",
    fontSize: "16px",
    fontWeight: 700,
  },

  coverLetterText: {
    color: "#566170",
    fontSize: "12px",
    lineHeight: 1.75,
    transition: "opacity .45s ease",
  },

  generatedIndicator: {
    position: "absolute",
    right: "24px",
    bottom: "22px",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#1677FF",
    color: "#ffffff",
    fontSize: "9px",
    fontWeight: 800,
    transition: "opacity .4s ease",
  },

  statementSection: {
    padding: "130px 28px",
    background: "#ffffff",
    color: "#101827",
    textAlign: "center",
  },

  statementInner: {
    maxWidth: "1120px",
    margin: "0 auto",
  },

  statementTitle: {
    margin: 0,
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(48px, 7vw, 88px)",
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: "-0.055em",
  },

  toolTextStrip: {
    marginTop: "46px",
    display: "flex",
    gap: "32px",
    justifyContent: "center",
    flexWrap: "wrap",
    color: "#7a8693",
    fontSize: "13px",
    fontWeight: 700,
  },

  trackerInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "0.8fr 1.2fr",
    gap: "85px",
    alignItems: "center",
  },

  trackerCopy: {
    maxWidth: "500px",
  },

  trackerVisual: {
    background: "#ffffff",
    boxShadow: "0 35px 85px rgba(27,49,75,.14)",
  },

  trackerHeader: {
    display: "flex",
    justifyContent: "space-between",
    padding: "17px 22px",
    borderBottom: "1px solid #e5eaf0",
    color: "#788492",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: ".11em",
  },

  trackerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "20px 22px",
    borderBottom: "1px solid #edf0f4",
  },

  trackerCompany: {
    display: "block",
    color: "#111827",
    fontSize: "13px",
  },

  trackerRole: {
    display: "block",
    marginTop: "5px",
    color: "#7b8794",
    fontSize: "11px",
  },

  trackerStatus: {
    alignSelf: "center",
    fontSize: "11px",
    fontWeight: 800,
  },

  finalSection: {
    position: "relative",
    padding: "145px 28px",
    overflow: "hidden",
    background:
      "linear-gradient(135deg,#020812 0%,#071c35 52%,#020812 100%)",
  },

  finalGlow: {
    position: "absolute",
    width: "700px",
    height: "700px",
    borderRadius: "50%",
    top: "-250px",
    right: "-180px",
    background: "rgba(22,119,255,.14)",
    filter: "blur(120px)",
  },

  finalInner: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1120px",
    margin: "0 auto",
  },

  finalTitle: {
    margin: 0,
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(60px, 8vw, 104px)",
    fontWeight: 500,
    lineHeight: 0.94,
    letterSpacing: "-0.055em",
  },

  finalText: {
    maxWidth: "650px",
    margin: "30px 0 32px",
    color: "#b4c0cd",
    fontSize: "17px",
    lineHeight: 1.72,
  },

  finalButton: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "16px 26px",
    borderRadius: "11px",
    background: "#1677FF",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 800,
    boxShadow: "0 18px 45px rgba(22,119,255,.24)",
  },
};
