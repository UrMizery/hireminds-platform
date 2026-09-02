"use client";

import { useMemo, useState } from "react";

type DemoSection = "summary" | "skills" | "experience" | "education";

const toolCards = [
  {
    title: "Resume Builder",
    text: "Build a polished resume without being locked into a rigid template.",
  },
  {
    title: "Resume Match Analyzer",
    text: "Compare your resume against a role before you apply.",
  },
  {
    title: "Job Description Analyzer",
    text: "Break down skills, requirements, and keywords in seconds.",
  },
  {
    title: "Cover Letter Generator",
    text: "Turn your experience into a stronger tailored cover letter.",
  },
  {
    title: "Application Tracking",
    text: "Keep your search organized and know exactly where you stand.",
  },
  {
    title: "Career Passport",
    text: "Keep your career information and materials together in one place.",
  },
];

export default function ExplorePage() {
  const [activeSection, setActiveSection] =
    useState<DemoSection>("summary");

  const [summary, setSummary] = useState(
    "Talent acquisition professional with experience managing full-cycle recruiting, candidate pipelines, sourcing strategies, and high-volume hiring."
  );

  const [skills, setSkills] = useState([
    "Full-Cycle Recruiting",
    "Talent Sourcing",
    "Interviewing",
    "Candidate Screening",
    "Pipeline Development",
    "ATS / CRM",
  ]);

  const [experience, setExperience] = useState(
    "Led full-cycle recruiting across multiple roles while managing sourcing, screening, interviews, candidate communication, and hiring workflows."
  );

  const [education, setEducation] = useState(
    "Professional Development & Workforce Training"
  );

  const activeLabel = useMemo(() => {
    if (activeSection === "summary") return "Professional Summary";
    if (activeSection === "skills") return "Core Skills";
    if (activeSection === "experience") return "Experience";
    return "Education";
  }, [activeSection]);

  function updateSkill(index: number, value: string) {
    setSkills((current) =>
      current.map((skill, i) => (i === index ? value : skill))
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroGlowOne} />
        <div style={styles.heroGlowTwo} />

        <div style={styles.heroInner}>
          <p style={styles.kicker}>EXPLORE HIREMINDS</p>

          <h1 style={styles.heroTitle}>
            More than a resume builder.
            <br />
            <span style={styles.blueText}>
              A smarter way to build your career.
            </span>
          </h1>

          <p style={styles.heroSubtitle}>
            See how HireMinds helps you build, improve, analyze, and manage
            your career materials without forcing you into a one-size-fits-all
            resume template.
          </p>

          <a href="#demo" style={styles.primaryButton}>
            Explore the Experience
          </a>
        </div>
      </section>

      <section style={styles.flashSection}>
        <div style={styles.marquee}>
          <div style={styles.marqueeTrack}>
            {[
              ...toolCards,
              ...toolCards,
            ].map((tool, index) => (
              <div key={`${tool.title}-${index}`} style={styles.flashCard}>
                <span style={styles.flashDot} />
                <div>
                  <strong style={styles.flashTitle}>{tool.title}</strong>
                  <p style={styles.flashText}>{tool.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" style={styles.demoSection}>
        <div style={styles.sectionHeadingWrap}>
          <p style={styles.kicker}>DON'T JUST WATCH IT</p>

          <h2 style={styles.sectionTitle}>
            Try the resume experience.
          </h2>

          <p style={styles.sectionSubtitle}>
            Click a section, change the content, and see how easy it is to
            work inside HireMinds.
          </p>
        </div>

        <div style={styles.demoGrid}>
          <div style={styles.editorPanel}>
            <div style={styles.editorTop}>
              <div>
                <p style={styles.editorEyebrow}>LIVE DEMO</p>
                <h3 style={styles.editorTitle}>{activeLabel}</h3>
              </div>

              <span style={styles.demoBadge}>Demo Only</span>
            </div>

            <div style={styles.sectionButtons}>
              <button
                type="button"
                onClick={() => setActiveSection("summary")}
                style={{
                  ...styles.sectionButton,
                  ...(activeSection === "summary"
                    ? styles.sectionButtonActive
                    : {}),
                }}
              >
                Summary
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("skills")}
                style={{
                  ...styles.sectionButton,
                  ...(activeSection === "skills"
                    ? styles.sectionButtonActive
                    : {}),
                }}
              >
                Skills
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("experience")}
                style={{
                  ...styles.sectionButton,
                  ...(activeSection === "experience"
                    ? styles.sectionButtonActive
                    : {}),
                }}
              >
                Experience
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("education")}
                style={{
                  ...styles.sectionButton,
                  ...(activeSection === "education"
                    ? styles.sectionButtonActive
                    : {}),
                }}
              >
                Education
              </button>
            </div>

            <div style={styles.editorBody}>
              {activeSection === "summary" ? (
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  style={styles.textarea}
                />
              ) : null}

              {activeSection === "skills" ? (
                <div style={styles.skillsEditor}>
                  {skills.map((skill, index) => (
                    <input
                      key={index}
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      style={styles.input}
                    />
                  ))}
                </div>
              ) : null}

              {activeSection === "experience" ? (
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  style={styles.textarea}
                />
              ) : null}

              {activeSection === "education" ? (
                <input
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  style={styles.input}
                />
              ) : null}
            </div>

            <div style={styles.editorNotice}>
              Your changes are only for this demo and are not saved.
            </div>
          </div>

          <div style={styles.resumeShell}>
            <div style={styles.resumePaper}>
              <div style={styles.resumeHeader}>
                <div>
                  <h3 style={styles.resumeName}>Jordan Taylor</h3>
                  <p style={styles.resumeRole}>Talent Acquisition Professional</p>
                </div>

                <div style={styles.resumeContact}>
                  <span>jordan@email.com</span>
                  <span>Hartford, CT</span>
                </div>
              </div>

              <div style={styles.resumeDivider} />

              <ResumeSection title="Professional Summary">
                <p style={styles.resumeParagraph}>{summary}</p>
              </ResumeSection>

              <ResumeSection title="Core Skills">
                <div style={styles.resumeSkills}>
                  {skills.map((skill, index) => (
                    <span key={index} style={styles.resumeSkill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </ResumeSection>

              <ResumeSection title="Experience">
                <div style={styles.resumeExperienceHeading}>
                  <div>
                    <strong style={styles.resumeStrong}>
                      Senior Recruiter
                    </strong>
                    <div style={styles.resumeMuted}>Sample Company</div>
                  </div>

                  <span style={styles.resumeMuted}>2023 – Present</span>
                </div>

                <p style={styles.resumeParagraph}>{experience}</p>
              </ResumeSection>

              <ResumeSection title="Education">
                <p style={styles.resumeParagraph}>{education}</p>
              </ResumeSection>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.toolsSection}>
        <div style={styles.sectionHeadingWrap}>
          <p style={styles.kicker}>ONE PLATFORM</p>

          <h2 style={styles.sectionTitle}>
            Your resume is only the beginning.
          </h2>

          <p style={styles.sectionSubtitle}>
            Move from building your materials to analyzing the role, improving
            your match, preparing your application, and tracking your search.
          </p>
        </div>

        <div style={styles.toolGrid}>
          {toolCards.map((tool, index) => (
            <article
              key={tool.title}
              style={{
                ...styles.toolCard,
                transform:
                  index % 2 === 0 ? "translateY(0px)" : "translateY(18px)",
              }}
            >
              <div style={styles.toolNumber}>
                {String(index + 1).padStart(2, "0")}
              </div>

              <h3 style={styles.toolTitle}>{tool.title}</h3>

              <p style={styles.toolText}>{tool.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={styles.ctaSection}>
        <div style={styles.ctaGlow} />

        <div style={styles.ctaInner}>
          <p style={styles.kicker}>READY WHEN YOU ARE</p>

          <h2 style={styles.ctaTitle}>
            Like what you see?
            <br />
            <span style={styles.blueText}>Make it yours.</span>
          </h2>

          <p style={styles.ctaText}>
            Unlock the full HireMinds experience and start building with your
            own career information.
          </p>

          <a href="/sign-up" style={styles.primaryButton}>
            Create My Career Passport
          </a>
        </div>
      </section>

      <style jsx global>{`
        @keyframes hiremindsMarquee {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 900px) {
          .hireminds-demo-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

function ResumeSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={styles.resumeSection}>
      <h4 style={styles.resumeSectionTitle}>{title}</h4>
      {children}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#020812",
    color: "#ffffff",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    overflow: "hidden",
  },

  hero: {
    position: "relative",
    minHeight: "620px",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    background:
      "radial-gradient(ellipse at 14% 16%, rgba(42,121,230,.20) 0%, rgba(10,54,112,.10) 30%, transparent 55%), radial-gradient(ellipse at 86% 70%, rgba(25,104,214,.18) 0%, rgba(8,43,92,.08) 32%, transparent 58%), radial-gradient(ellipse at 52% -8%, rgba(90,162,255,.11) 0%, transparent 40%), linear-gradient(135deg,#020812 0%,#05172a 28%,#03101f 50%,#08213d 72%,#020914 100%)",
  },

  heroGlowOne: {
    position: "absolute",
    width: "520px",
    height: "520px",
    borderRadius: "50%",
    background: "rgba(22,119,255,0.13)",
    filter: "blur(90px)",
    top: "-220px",
    right: "-100px",
  },

  heroGlowTwo: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "rgba(61,137,255,0.08)",
    filter: "blur(110px)",
    bottom: "-260px",
    left: "-140px",
  },

  heroInner: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "80px 28px",
  },

  kicker: {
    margin: "0 0 14px",
    color: "#1677FF",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.2em",
  },

  heroTitle: {
    margin: 0,
    maxWidth: "950px",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(48px, 7vw, 86px)",
    fontWeight: 500,
    lineHeight: 0.98,
    letterSpacing: "-0.05em",
  },

  blueText: {
    color: "#1677FF",
  },

  heroSubtitle: {
    maxWidth: "720px",
    margin: "28px 0 32px",
    color: "#c4ccd7",
    fontSize: "18px",
    lineHeight: 1.75,
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "15px 24px",
    borderRadius: "14px",
    background: "#1677FF",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 700,
    boxShadow: "0 16px 40px rgba(22,119,255,0.25)",
  },

  flashSection: {
    padding: "22px 0",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    background: "#030a14",
  },

  marquee: {
    overflow: "hidden",
    width: "100%",
  },

  marqueeTrack: {
    width: "max-content",
    display: "flex",
    gap: "18px",
    paddingLeft: "18px",
    animation: "hiremindsMarquee 34s linear infinite",
  },

  flashCard: {
    width: "330px",
    minHeight: "104px",
    padding: "20px",
    display: "flex",
    gap: "14px",
    borderRadius: "18px",
    border: "1px solid rgba(120,145,175,0.18)",
    background:
      "linear-gradient(180deg, rgba(10,21,37,0.95), rgba(5,12,23,0.95))",
    boxSizing: "border-box",
  },

  flashDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    background: "#1677FF",
    marginTop: "6px",
    boxShadow: "0 0 18px rgba(22,119,255,0.85)",
    flexShrink: 0,
  },

  flashTitle: {
    color: "#ffffff",
    fontSize: "15px",
  },

  flashText: {
    margin: "7px 0 0",
    color: "#97a5b6",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  demoSection: {
    padding: "100px 28px",
    background:
      "linear-gradient(180deg, #f7f9fc 0%, #edf2f7 100%)",
    color: "#101723",
  },

  sectionHeadingWrap: {
    maxWidth: "1180px",
    margin: "0 auto 48px",
  },

  sectionTitle: {
    margin: 0,
    color: "#101723",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(40px, 5vw, 62px)",
    fontWeight: 500,
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
  },

  sectionSubtitle: {
    maxWidth: "690px",
    margin: "18px 0 0",
    color: "#5e6a78",
    fontSize: "17px",
    lineHeight: 1.7,
  },

  demoGrid: {
    maxWidth: "1180px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "0.9fr 1.1fr",
    gap: "28px",
    alignItems: "start",
  },

  editorPanel: {
    padding: "28px",
    borderRadius: "24px",
    background:
      "linear-gradient(180deg, #081425 0%, #050c17 100%)",
    border: "1px solid rgba(22,119,255,0.22)",
    boxShadow: "0 24px 70px rgba(14,35,63,0.18)",
  },

  editorTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "center",
  },

  editorEyebrow: {
    margin: "0 0 6px",
    color: "#1677FF",
    fontSize: "11px",
    letterSpacing: "0.18em",
    fontWeight: 700,
  },

  editorTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "26px",
  },

  demoBadge: {
    padding: "7px 10px",
    borderRadius: "999px",
    background: "rgba(22,119,255,0.12)",
    border: "1px solid rgba(22,119,255,0.28)",
    color: "#6ca9ff",
    fontSize: "11px",
    fontWeight: 700,
  },

  sectionButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "24px",
  },

  sectionButton: {
    border: "1px solid #263a54",
    background: "#07111f",
    color: "#aeb9c6",
    borderRadius: "999px",
    padding: "9px 13px",
    cursor: "pointer",
    fontSize: "13px",
  },

  sectionButtonActive: {
    background: "#1677FF",
    border: "1px solid #1677FF",
    color: "#ffffff",
  },

  editorBody: {
    marginTop: "22px",
  },

  textarea: {
    width: "100%",
    minHeight: "170px",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #263a54",
    background: "#030a13",
    color: "#ffffff",
    fontSize: "14px",
    lineHeight: 1.65,
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
  },

  skillsEditor: {
    display: "grid",
    gap: "10px",
  },

  input: {
    width: "100%",
    padding: "14px 15px",
    borderRadius: "14px",
    border: "1px solid #263a54",
    background: "#030a13",
    color: "#ffffff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },

  editorNotice: {
    marginTop: "16px",
    color: "#718095",
    fontSize: "12px",
  },

  resumeShell: {
    perspective: "1200px",
  },

  resumePaper: {
    minHeight: "720px",
    padding: "46px",
    borderRadius: "6px",
    background: "#ffffff",
    boxShadow: "0 35px 80px rgba(19,35,55,0.17)",
    transform: "rotateY(-1.5deg) rotateX(0.8deg)",
    boxSizing: "border-box",
  },

  resumeHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
  },

  resumeName: {
    margin: 0,
    color: "#111827",
    fontSize: "30px",
    fontWeight: 700,
  },

  resumeRole: {
    margin: "5px 0 0",
    color: "#1677FF",
    fontSize: "14px",
    fontWeight: 700,
  },

  resumeContact: {
    display: "grid",
    gap: "6px",
    color: "#667085",
    fontSize: "12px",
    textAlign: "right",
  },

  resumeDivider: {
    height: "2px",
    margin: "24px 0 20px",
    background: "#1677FF",
  },

  resumeSection: {
    marginBottom: "24px",
  },

  resumeSectionTitle: {
    margin: "0 0 10px",
    color: "#111827",
    fontSize: "13px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  resumeParagraph: {
    margin: 0,
    color: "#434e5c",
    fontSize: "13px",
    lineHeight: 1.65,
  },

  resumeSkills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
  },

  resumeSkill: {
    padding: "6px 9px",
    borderRadius: "6px",
    background: "#f0f5fb",
    color: "#334155",
    fontSize: "11px",
  },

  resumeExperienceHeading: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "9px",
  },

  resumeStrong: {
    color: "#111827",
    fontSize: "13px",
  },

  resumeMuted: {
    color: "#7b8794",
    fontSize: "11px",
  },

  toolsSection: {
    padding: "100px 28px 120px",
    background:
      "radial-gradient(circle at 75% 20%, rgba(22,119,255,0.10), transparent 30%), #020812",
  },

  toolGrid: {
    maxWidth: "1180px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: "22px",
  },

  toolCard: {
    minHeight: "235px",
    padding: "28px",
    borderRadius: "22px",
    border: "1px solid rgba(120,145,175,0.17)",
    background:
      "linear-gradient(180deg, rgba(9,19,34,0.96), rgba(5,11,21,0.98))",
    boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
  },

  toolNumber: {
    color: "#1677FF",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.12em",
  },

  toolTitle: {
    margin: "54px 0 12px",
    color: "#ffffff",
    fontSize: "22px",
  },

  toolText: {
    margin: 0,
    color: "#9ba7b7",
    fontSize: "14px",
    lineHeight: 1.65,
  },

  ctaSection: {
    position: "relative",
    padding: "110px 28px",
    overflow: "hidden",
    background:
      "linear-gradient(135deg,#061225 0%,#0a2749 45%,#061225 100%)",
  },

  ctaGlow: {
    position: "absolute",
    width: "620px",
    height: "620px",
    borderRadius: "50%",
    background: "rgba(22,119,255,0.13)",
    filter: "blur(110px)",
    right: "-180px",
    top: "-200px",
  },

  ctaInner: {
    position: "relative",
    maxWidth: "1180px",
    margin: "0 auto",
    zIndex: 2,
  },

  ctaTitle: {
    margin: 0,
    maxWidth: "850px",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(44px, 6vw, 72px)",
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: "-0.04em",
  },

  ctaText: {
    maxWidth: "660px",
    margin: "22px 0 28px",
    color: "#c1cad5",
    fontSize: "17px",
    lineHeight: 1.7,
  },
};
