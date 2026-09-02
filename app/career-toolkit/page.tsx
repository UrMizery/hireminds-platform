"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

type Tool = {
  title: string;
  description: string;
  href: string;
  label?: "Generator" | "Guide" | "Analyzer" | "Resource";
  accent?: "blue" | "navy" | "ice";
};

const tools: Tool[] = [
  {
    title: "Resume Generator",
    description:
      "Build, preview, save, and print a professional resume using guided sections.",
    href: "/resume-builder",
    label: "Generator",
    accent: "blue",
  },
  {
    title: "Resume Format Guide",
    description:
      "Compare resume formats and determine which structure may work best for your experience.",
    href: "/career-toolkit/resume-type-helper",
    label: "Guide",
    accent: "navy",
  },
  {
    title: "Cover Letter Generator",
    description:
      "Create a professional cover letter using guided prompts and career-ready wording.",
    href: "/career-toolkit/cover-letter-generator",
    label: "Generator",
    accent: "blue",
  },
  {
    title: "Job Description Analyzer",
    description:
      "Identify important skills, qualifications, keywords, systems, and employer expectations in a job posting.",
    href: "/career-toolkit/job-description-analyzer",
    label: "Analyzer",
    accent: "navy",
  },
  {
    title: "Resume Match Analyzer",
    description:
      "Compare your resume to a job description and identify where your experience aligns or needs strengthening.",
    href: "/career-toolkit/resume-match-analyzer",
    label: "Analyzer",
    accent: "blue",
  },
  {
    title: "New Opportunities Resume Generator",
    description:
      "Build a resume when restarting, reentering, changing direction, or presenting your experience in a new way.",
    href: "/career-toolkit/new-opportunities-resume-generator",
    label: "Generator",
    accent: "ice",
  },
  {
    title: "Interview Question Generator",
    description:
      "Generate general and industry-focused interview questions for practice.",
    href: "/career-toolkit/interview-question-generator",
    label: "Generator",
    accent: "blue",
  },
  {
    title: "Interview Questions & Preparation",
    description:
      "Review common interview questions, preparation guidance, sample responses, and questions you can ask an employer.",
    href: "/career-toolkit/interview-questions",
    label: "Guide",
    accent: "navy",
  },
  {
    title: "Career Path Generator",
    description:
      "Explore possible career paths based on your interests, work preferences, experience, and goals.",
    href: "/career-toolkit/career-path-generator",
    label: "Generator",
    accent: "blue",
  },
  {
    title: "Career Goal Generator",
    description:
      "Turn your career ideas into a clearer goal with practical next steps.",
    href: "/career-toolkit/career-goal-generator",
    label: "Generator",
    accent: "navy",
  },
  {
    title: "Professional Branding Generator",
    description:
      "Strengthen your professional summary, biography, positioning, and career-ready language.",
    href: "/career-toolkit/professional-branding-generator",
    label: "Generator",
    accent: "blue",
  },
  {
    title: "Budget Generator",
    description:
      "Create a simple monthly budget to understand income, expenses, and financial priorities.",
    href: "/career-toolkit/budget-generator",
    label: "Generator",
    accent: "ice",
  },
  {
    title: "Job Log Generator",
    description:
      "Track applications, employers, dates, contacts, interviews, outcomes, and follow-up activity.",
    href: "/career-toolkit/job-log-generator",
    label: "Generator",
    accent: "blue",
  },
  {
    title: "The House of Letters",
    description:
      "Create professional follow-ups, thank-you letters, requests, resignations, and workplace communication.",
    href: "/career-toolkit/employer-follow-up-generator",
    label: "Generator",
    accent: "navy",
  },
  {
    title: "Job Search Tips",
    description:
      "Review practical guidance for applications, job descriptions, employer research, and job-search strategy.",
    href: "/career-toolkit/job-search-tips",
    label: "Guide",
    accent: "ice",
  },
  {
    title: "Soft Skills",
    description:
      "Explore communication, teamwork, adaptability, organization, problem solving, and other transferable strengths.",
    href: "/career-toolkit/soft-skills",
    label: "Guide",
    accent: "blue",
  },
  {
    title: "Industry Core Skills",
    description:
      "Explore important skills used across healthcare, manufacturing, logistics, administration, hospitality, IT, trades, retail, and more.",
    href: "/career-toolkit/industry-core-skills",
    label: "Guide",
    accent: "navy",
  },
];

export default function CareerToolkitPage() {
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        window.location.href = "/sign-in";
        return;
      }

      if (mounted) setCheckingAccess(false);
    }

    void checkAccess();

    return () => {
      mounted = false;
    };
  }, []);

  const generators = useMemo(
    () => tools.filter((tool) => tool.label === "Generator"),
    [],
  );

  const analyzers = useMemo(
    () => tools.filter((tool) => tool.label === "Analyzer"),
    [],
  );

  const guides = useMemo(
    () => tools.filter((tool) => tool.label === "Guide" || tool.label === "Resource"),
    [],
  );

  if (checkingAccess) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.loadingGlow} />
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <style>{`
        html { scroll-behavior: smooth; }

        .hm-tool-card,
        .hm-mini-link,
        .hm-video {
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
        }

        .hm-tool-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 22px 50px rgba(13, 40, 76, .12);
          border-color: rgba(22,119,255,.34) !important;
        }

        .hm-mini-link:hover,
        .hm-video:hover {
          transform: translateY(-2px);
        }

        .hm-tool-card span,
        .hm-tool-card p,
        .hm-tool-card h3 {
          position: relative;
          z-index: 1;
        }

        .hm-hero-grid .fake-lines span,
        .hm-fake-lines span {
          display: block;
          height: 7px;
          border-radius: 999px;
          background: #E5EAF0;
        }

        @media (max-width: 1040px) {
          .hm-hero-grid,
          .hm-showcase-grid,
          .hm-video-grid {
            grid-template-columns: 1fr !important;
          }

          .hm-tool-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 720px) {
          .hm-page-wrap {
            padding: 0 !important;
          }

          .hm-hero,
          .hm-light-section,
          .hm-dark-section {
            padding: 42px 20px !important;
          }

          .hm-tool-grid {
            grid-template-columns: 1fr !important;
          }

          .hm-hero-title,
          .hm-section-title {
            font-size: 44px !important;
          }
        }
      `}</style>

      <div className="hm-page-wrap" style={styles.container}>
        <section className="hm-hero hm-hero-grid" style={styles.hero}>
          <div style={styles.heroCopy}>
            <div style={styles.eyebrow}>CAREER TOOLKIT</div>
            <h1 className="hm-hero-title" style={styles.heroTitle}>
              One place built to help you move smarter.
            </h1>
            <p style={styles.heroText}>
              Create. Analyze. Prepare. Track. Explore. HireMinds brings your career
              tools together so each step connects to the next.
            </p>

            <div style={styles.heroNav}>
              <a href="#generators" style={styles.heroPill}>Generators</a>
              <a href="#analyzers" style={styles.heroPill}>Analyzers</a>
              <a href="#guides" style={styles.heroPill}>Guides & Resources</a>
            </div>
          </div>

          <div style={styles.heroVisual}>
            <div style={styles.resumeSheetBack} />
            <div style={styles.resumeSheet}>
              <div style={styles.resumeTopRow}>
                <div>
                  <div style={styles.resumeName}>Jordan Taylor</div>
                  <div style={styles.resumeRole}>Talent Acquisition Professional</div>
                </div>
                <div style={styles.resumeContact}>
                  Hartford, CT<br />jordan@email.com
                </div>
              </div>
              <div style={styles.resumeBlueLine} />
              <div style={styles.fakeHeading}>PROFESSIONAL SUMMARY</div>
              <div className="hm-fake-lines" style={styles.fakeLines}>
                <span />
                <span />
                <span style={{ width: "78%" }} />
              </div>
              <div style={styles.fakeHeading}>CORE SKILLS</div>
              <div style={styles.skillChips}>
                <span>Recruiting</span>
                <span>Sourcing</span>
                <span>Interviewing</span>
                <span>ATS / CRM</span>
              </div>
              <div style={styles.fakeHeading}>EXPERIENCE</div>
              <div className="hm-fake-lines" style={styles.fakeLines}>
                <span />
                <span />
                <span style={{ width: "68%" }} />
              </div>
            </div>

            <div style={styles.floatingTagBlue}>Built around you</div>
            <div style={styles.floatingTagDark}>No rigid templates</div>
          </div>
        </section>

        <section id="generators" className="hm-light-section" style={styles.lightSection}>
          <div className="hm-showcase-grid" style={styles.showcaseGrid}>
            <div style={styles.showcaseCopy}>
              <div style={styles.sectionEyebrow}>GENERATORS</div>
              <h2 className="hm-section-title" style={styles.sectionTitle}>
                Build the things you need.
              </h2>
              <p style={styles.sectionText}>
                From resumes and cover letters to career goals, interview practice,
                branding, budgets, and job logs — start with a guided tool and turn
                your information into something useful.
              </p>
            </div>

            <div style={styles.generatorMock}>
              <div style={styles.mockHeader}>
                <span style={styles.mockKicker}>RESUME GENERATOR</span>
                <span style={styles.mockStatus}>LIVE</span>
              </div>
              <h3 style={styles.mockTitle}>Build your resume as you work.</h3>
              <div style={styles.mockField}>Professional Summary</div>
              <div style={styles.mockField}>Skills</div>
              <div style={styles.mockField}>Work Experience</div>
              <div style={styles.mockButton}>Generate & Preview</div>
            </div>
          </div>

          <div className="hm-tool-grid" style={styles.toolGrid}>
            {generators.map((tool) => (
              <ToolCard key={tool.title} tool={tool} variant="light" />
            ))}
          </div>
        </section>

        <section id="analyzers" className="hm-dark-section" style={styles.darkSection}>
          <div className="hm-showcase-grid" style={styles.showcaseGrid}>
            <div style={styles.showcaseCopy}>
              <div style={styles.darkEyebrow}>ANALYZERS</div>
              <h2 className="hm-section-title" style={styles.darkTitle}>
                See what the job is really asking for.
              </h2>
              <p style={styles.darkText}>
                Stop guessing. Break down the job description, compare it against your
                resume, and see where you align before you apply.
              </p>
            </div>

            <div style={styles.analyzerMock}>
              <div style={styles.analyzerLeft}>
                <span style={styles.mockKicker}>JOB DESCRIPTION</span>
                <h3 style={styles.analyzerJob}>Senior Talent Acquisition Partner</h3>
                <p style={styles.analyzerBody}>
                  Lead end-to-end recruiting strategy while partnering with business
                  leaders to identify talent needs and improve hiring outcomes.
                </p>
              </div>

              <div style={styles.analyzerRight}>
                <div style={styles.analyzerRightKicker}>WHAT HIREMINDS FOUND</div>
                {[
                  ["Recruiting Strategy", "Detected"],
                  ["Stakeholder Management", "Detected"],
                  ["Talent Sourcing", "Detected"],
                  ["ATS / CRM", "Focus"],
                ].map(([name, status]) => (
                  <div key={name} style={styles.analyzerRow}>
                    <span>{name}</span>
                    <strong>{status}</strong>
                  </div>
                ))}
                <div style={styles.analysisFocus}>
                  <span>APPLICATION FOCUS</span>
                  <p>Lead with recruiting strategy, stakeholder partnership, and measurable hiring results.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hm-tool-grid" style={styles.toolGrid}>
            {analyzers.map((tool) => (
              <ToolCard key={tool.title} tool={tool} variant="dark" />
            ))}
          </div>
        </section>

        <section id="guides" className="hm-light-section" style={styles.lightSectionAlt}>
          <div className="hm-showcase-grid" style={styles.showcaseGrid}>
            <div style={styles.showcaseCopy}>
              <div style={styles.sectionEyebrow}>GUIDES & RESOURCES</div>
              <h2 className="hm-section-title" style={styles.sectionTitle}>
                Learn what matters before you make the move.
              </h2>
              <p style={styles.sectionText}>
                Use practical guides to understand resume formats, interview strategy,
                job search habits, transferable skills, and industry expectations.
              </p>
            </div>

            <a
              href="/career-toolkit/community-feed"
              className="hm-video hm-video-grid"
              style={styles.videoFeature}
            >
              <div style={styles.videoPlay}>▶</div>
              <div>
                <div style={styles.videoKicker}>FEATURED RESOURCE</div>
                <h3 style={styles.videoTitle}>Career Video Library</h3>
                <p style={styles.videoText}>
                  Short career-development videos covering resumes, interviews,
                  applications, professional communication, and job-search strategy.
                </p>
              </div>
              <span style={styles.videoArrow}>Watch →</span>
            </a>
          </div>

          <div className="hm-tool-grid" style={styles.toolGrid}>
            {guides.map((tool) => (
              <ToolCard key={tool.title} tool={tool} variant="light" />
            ))}
          </div>
        </section>

        <section style={styles.bottomBand}>
          <div>
            <div style={styles.bottomKicker}>HIREMINDS</div>
            <h2 style={styles.bottomTitle}>Build. Stand out. Advance.</h2>
          </div>
          <a href="/profile" style={styles.bottomButton}>Back to Profile →</a>
        </section>
      </div>
    </main>
  );
}

function ToolCard({
  tool,
  variant,
}: {
  tool: Tool;
  variant: "light" | "dark";
}) {
  const dark = variant === "dark";

  return (
    <a
      href={tool.href}
      className="hm-tool-card"
      style={{
        ...styles.toolCard,
        ...(dark ? styles.toolCardDark : styles.toolCardLight),
      }}
    >
      <div style={styles.toolCardTop}>
        <span style={{ ...styles.toolType, ...(dark ? styles.toolTypeDark : {}) }}>
          {tool.label}
        </span>
        <span style={{ ...styles.toolOpenArrow, color: dark ? "#7DB5FF" : "#1677FF" }}>↗</span>
      </div>

      <div>
        <h3 style={{ ...styles.toolTitle, color: dark ? "#FFFFFF" : "#0C1B30" }}>
          {tool.title}
        </h3>
        <p style={{ ...styles.toolDescription, color: dark ? "#AFC0D6" : "#66768A" }}>
          {tool.description}
        </p>
      </div>

      <div style={{ ...styles.toolFooter, borderTopColor: dark ? "rgba(255,255,255,.08)" : "#E3EAF2" }}>
        <span style={{ color: dark ? "#7DB5FF" : "#1677FF" }}>Open tool</span>
      </div>
    </a>
  );
}

const styles: Record<string, CSSProperties> = {
  loadingPage: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#06172A",
  },

  loadingGlow: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(22,119,255,.7), rgba(22,119,255,0) 70%)",
  },

  page: {
    minHeight: "100vh",
    margin: 0,
    background: "#EEF3F8",
    color: "#0F172A",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  container: {
    width: "100%",
    overflow: "hidden",
  },

  hero: {
    minHeight: "720px",
    padding: "74px max(6vw, 34px)",
    display: "grid",
    gridTemplateColumns: "minmax(0, .92fr) minmax(520px, 1.08fr)",
    alignItems: "center",
    gap: "54px",
    background:
      "radial-gradient(circle at 86% 12%, rgba(22,119,255,.26), transparent 26%), linear-gradient(118deg, #06172A 0%, #0A2647 58%, #0B3565 100%)",
  },

  heroCopy: {
    maxWidth: "720px",
  },

  eyebrow: {
    marginBottom: "20px",
    color: "#2587FF",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: ".18em",
  },

  heroTitle: {
    margin: "0 0 28px",
    color: "#FFFFFF",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(62px, 7vw, 112px)",
    lineHeight: .95,
    letterSpacing: "-.055em",
    fontWeight: 400,
  },

  heroText: {
    margin: 0,
    maxWidth: "660px",
    color: "#B8C7D9",
    fontSize: "18px",
    lineHeight: 1.75,
  },

  heroNav: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "30px",
  },

  heroPill: {
    minHeight: "42px",
    display: "inline-flex",
    alignItems: "center",
    padding: "0 16px",
    borderRadius: "999px",
    border: "1px solid rgba(125,181,255,.28)",
    background: "rgba(255,255,255,.045)",
    color: "#DCEAFF",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 800,
  },

  heroVisual: {
    position: "relative",
    minHeight: "600px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  resumeSheetBack: {
    position: "absolute",
    width: "72%",
    height: "78%",
    right: "7%",
    bottom: "4%",
    borderRadius: "9px",
    background:
      "linear-gradient(145deg, #DDE5ED 0%, #B8C5D1 100%)",
    transform: "rotate(4deg)",
    boxShadow: "0 30px 60px rgba(0,0,0,.2)",
  },

  resumeSheet: {
    position: "relative",
    zIndex: 2,
    width: "78%",
    minHeight: "500px",
    padding: "50px 48px",
    background: "#FFFFFF",
    boxShadow: "0 30px 70px rgba(0,0,0,.24)",
  },

  resumeTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    alignItems: "flex-start",
  },

  resumeName: {
    color: "#111827",
    fontSize: "30px",
    fontWeight: 850,
  },

  resumeRole: {
    marginTop: "8px",
    color: "#1677FF",
    fontSize: "12px",
    fontWeight: 850,
  },

  resumeContact: {
    color: "#7A8796",
    textAlign: "right",
    fontSize: "11px",
    lineHeight: 1.55,
  },

  resumeBlueLine: {
    height: "3px",
    margin: "28px 0 26px",
    background: "#1677FF",
  },

  fakeHeading: {
    margin: "0 0 10px",
    color: "#111827",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".06em",
  },

  fakeLines: {
    display: "grid",
    gap: "8px",
    marginBottom: "28px",
  },

  skillChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "30px",
    color: "#5A6675",
    fontSize: "10px",
  },

  floatingTagBlue: {
    position: "absolute",
    zIndex: 3,
    top: "21%",
    right: "0",
    padding: "13px 18px",
    borderRadius: "999px",
    background: "#1677FF",
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: 850,
    boxShadow: "0 12px 28px rgba(22,119,255,.25)",
  },

  floatingTagDark: {
    position: "absolute",
    zIndex: 3,
    bottom: "10%",
    left: "4%",
    padding: "12px 18px",
    borderRadius: "999px",
    background: "#091827",
    color: "#D8E5F4",
    border: "1px solid rgba(255,255,255,.18)",
    fontSize: "11px",
    fontWeight: 800,
  },

  lightSection: {
    padding: "92px max(6vw, 34px)",
    background:
      "radial-gradient(circle at 8% 15%, rgba(22,119,255,.06), transparent 26%), #EEF3F8",
  },

  lightSectionAlt: {
    padding: "92px max(6vw, 34px)",
    background:
      "linear-gradient(180deg, #F8FAFC 0%, #EEF3F8 100%)",
  },

  darkSection: {
    padding: "92px max(6vw, 34px)",
    background:
      "radial-gradient(circle at 88% 18%, rgba(22,119,255,.18), transparent 25%), linear-gradient(135deg, #061423 0%, #091D34 100%)",
  },

  showcaseGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0,.82fr) minmax(520px,1.18fr)",
    gap: "64px",
    alignItems: "center",
    marginBottom: "48px",
  },

  showcaseCopy: {
    maxWidth: "650px",
  },

  sectionEyebrow: {
    marginBottom: "18px",
    color: "#1677FF",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".18em",
  },

  darkEyebrow: {
    marginBottom: "18px",
    color: "#4C9BFF",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".18em",
  },

  sectionTitle: {
    margin: "0 0 24px",
    color: "#0C1525",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(52px, 5.5vw, 82px)",
    lineHeight: .98,
    letterSpacing: "-.045em",
    fontWeight: 400,
  },

  darkTitle: {
    margin: "0 0 24px",
    color: "#FFFFFF",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(52px, 5.5vw, 82px)",
    lineHeight: .98,
    letterSpacing: "-.045em",
    fontWeight: 400,
  },

  sectionText: {
    margin: 0,
    color: "#66758A",
    fontSize: "17px",
    lineHeight: 1.75,
  },

  darkText: {
    margin: 0,
    color: "#B0C0D3",
    fontSize: "17px",
    lineHeight: 1.75,
  },

  generatorMock: {
    padding: "34px",
    borderRadius: "20px",
    background: "#FFFFFF",
    border: "1px solid #DDE6F0",
    boxShadow: "0 28px 60px rgba(15,23,42,.10)",
  },

  mockHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  mockKicker: {
    color: "#1677FF",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".12em",
  },

  mockStatus: {
    padding: "5px 9px",
    borderRadius: "999px",
    background: "#E9F3FF",
    color: "#1677FF",
    fontSize: "9px",
    fontWeight: 900,
  },

  mockTitle: {
    margin: "0 0 24px",
    color: "#0E1D31",
    fontSize: "28px",
    letterSpacing: "-.03em",
  },

  mockField: {
    marginBottom: "10px",
    padding: "14px 15px",
    borderRadius: "10px",
    border: "1px solid #DCE5EE",
    color: "#6C798A",
    background: "#F9FBFD",
    fontSize: "12px",
  },

  mockButton: {
    marginTop: "16px",
    display: "inline-flex",
    padding: "12px 16px",
    borderRadius: "10px",
    background: "#1677FF",
    color: "#FFFFFF",
    fontSize: "11px",
    fontWeight: 850,
  },

  analyzerMock: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    minHeight: "430px",
    overflow: "hidden",
    borderRadius: "14px",
    boxShadow: "0 30px 65px rgba(0,0,0,.30)",
  },

  analyzerLeft: {
    padding: "42px 38px",
    background: "#FFFFFF",
  },

  analyzerRight: {
    padding: "42px 38px",
    background: "#071525",
    color: "#FFFFFF",
  },

  analyzerJob: {
    margin: "24px 0 24px",
    color: "#0F172A",
    fontSize: "27px",
    lineHeight: 1.2,
  },

  analyzerBody: {
    margin: 0,
    color: "#657489",
    fontSize: "13px",
    lineHeight: 1.75,
  },

  analyzerRightKicker: {
    marginBottom: "20px",
    color: "#5DA5FF",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".12em",
  },

  analyzerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    padding: "15px 0",
    borderBottom: "1px solid rgba(255,255,255,.09)",
    color: "#D8E4F1",
    fontSize: "11px",
  },

  analysisFocus: {
    marginTop: "22px",
    padding: "16px",
    background: "#0A2749",
    color: "#DCEAFF",
  },

  toolGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },

  toolCard: {
    minHeight: "190px",
    padding: "21px",
    borderRadius: "16px",
    border: "1px solid",
    textDecoration: "none",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  toolCardLight: {
    background:
      "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
    borderColor: "#DCE5EF",
  },

  toolCardDark: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,.035) 0%, rgba(255,255,255,.02) 100%)",
    borderColor: "rgba(255,255,255,.09)",
  },

  toolCardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    marginBottom: "18px",
  },

  toolType: {
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#EAF3FF",
    color: "#1677FF",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".08em",
    textTransform: "uppercase",
  },

  toolTypeDark: {
    background: "rgba(22,119,255,.12)",
    color: "#7DB5FF",
  },

  toolOpenArrow: {
    fontSize: "18px",
  },

  toolTitle: {
    margin: "0 0 8px",
    fontSize: "18px",
    lineHeight: 1.25,
    letterSpacing: "-.025em",
    fontWeight: 820,
  },

  toolDescription: {
    margin: 0,
    fontSize: "12px",
    lineHeight: 1.6,
  },

  toolFooter: {
    marginTop: "18px",
    paddingTop: "12px",
    borderTop: "1px solid",
    fontSize: "11px",
    fontWeight: 800,
  },

  videoFeature: {
    display: "grid",
    gridTemplateColumns: "64px 1fr auto",
    gap: "18px",
    alignItems: "center",
    padding: "24px",
    borderRadius: "16px",
    background:
      "linear-gradient(120deg, #0A1A2E 0%, #123B6B 100%)",
    color: "#FFFFFF",
    textDecoration: "none",
    boxShadow: "0 24px 55px rgba(13,39,74,.18)",
  },

  videoPlay: {
    width: "56px",
    height: "56px",
    display: "grid",
    placeItems: "center",
    borderRadius: "15px",
    background: "#1677FF",
    color: "#FFFFFF",
  },

  videoKicker: {
    color: "#72B4FF",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".12em",
    marginBottom: "5px",
  },

  videoTitle: {
    margin: "0 0 6px",
    fontSize: "22px",
  },

  videoText: {
    margin: 0,
    color: "#C2D0E0",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  videoArrow: {
    color: "#A9D1FF",
    fontSize: "12px",
    fontWeight: 850,
  },

  bottomBand: {
    padding: "52px max(6vw, 34px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    flexWrap: "wrap",
    background: "#FFFFFF",
    borderTop: "1px solid #DDE6EF",
  },

  bottomKicker: {
    color: "#1677FF",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".15em",
  },

  bottomTitle: {
    margin: "6px 0 0",
    color: "#0D1B2E",
    fontSize: "30px",
    letterSpacing: "-.035em",
  },

  bottomButton: {
    padding: "12px 16px",
    borderRadius: "10px",
    background: "#1677FF",
    color: "#FFFFFF",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 850,
  },

};
