"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

type Tool = {
  title: string;
  description: string;
  href: string;
  label: "Generator" | "Guide" | "Analyzer" | "Resource";
};

const tools: Tool[] = [
  {
    title: "Resume Generator",
    description: "Build, preview, save, and print a professional resume using guided sections.",
    href: "/resume-builder",
    label: "Generator",
  },
  {
    title: "Cover Letter Generator",
    description: "Create a professional cover letter using guided prompts and career-ready wording.",
    href: "/career-toolkit/cover-letter-generator",
    label: "Generator",
  },
  {
    title: "New Opportunities Resume Generator",
    description: "Build a resume when restarting, reentering, changing direction, or presenting your experience in a new way.",
    href: "/career-toolkit/new-opportunities-resume-generator",
    label: "Generator",
  },
  {
    title: "Interview Question Generator",
    description: "Generate general and industry-focused interview questions for practice.",
    href: "/career-toolkit/interview-question-generator",
    label: "Generator",
  },
  {
    title: "Career Path Generator",
    description: "Explore possible career paths based on your interests, work preferences, experience, and goals.",
    href: "/career-toolkit/career-path-generator",
    label: "Generator",
  },
  {
    title: "Career Goal Generator",
    description: "Turn your career ideas into a clearer goal with practical next steps.",
    href: "/career-toolkit/career-goal-generator",
    label: "Generator",
  },
  {
    title: "Professional Branding Generator",
    description: "Strengthen your professional summary, biography, positioning, and career-ready language.",
    href: "/career-toolkit/professional-branding-generator",
    label: "Generator",
  },
  {
    title: "Budget Generator",
    description: "Create a simple monthly budget to understand income, expenses, and financial priorities.",
    href: "/career-toolkit/budget-generator",
    label: "Generator",
  },
  {
    title: "Job Log Generator",
    description: "Track applications, employers, dates, contacts, interviews, outcomes, and follow-up activity.",
    href: "/career-toolkit/job-log-generator",
    label: "Generator",
  },
  {
    title: "The House of Letters",
    description: "Create professional follow-ups, thank-you letters, requests, resignations, and workplace communication.",
    href: "/career-toolkit/employer-follow-up-generator",
    label: "Generator",
  },
  {
    title: "Job Description Analyzer",
    description: "Pull out the skills, qualifications, keywords, systems, and employer expectations inside a job posting.",
    href: "/career-toolkit/job-description-analyzer",
    label: "Analyzer",
  },
  {
    title: "Resume Match Analyzer",
    description: "Compare your resume to a job description and see where you align or where your application needs strengthening.",
    href: "/career-toolkit/resume-match-analyzer",
    label: "Analyzer",
  },
  {
    title: "Resume Format Guide",
    description: "Compare resume formats and choose the structure that makes the most sense for your experience.",
    href: "/career-toolkit/resume-type-helper",
    label: "Guide",
  },
  {
    title: "Interview Questions & Preparation",
    description: "Review common questions, preparation guidance, sample responses, and questions you can ask an employer.",
    href: "/career-toolkit/interview-questions",
    label: "Guide",
  },
  {
    title: "Job Search Tips",
    description: "Review practical guidance for applications, employer research, job descriptions, and job-search strategy.",
    href: "/career-toolkit/job-search-tips",
    label: "Guide",
  },
  {
    title: "Soft Skills",
    description: "Explore communication, teamwork, adaptability, organization, problem solving, and other transferable strengths.",
    href: "/career-toolkit/soft-skills",
    label: "Guide",
  },
  {
    title: "Industry Core Skills",
    description: "Explore important skills used across healthcare, manufacturing, logistics, administration, hospitality, IT, trades, retail, and more.",
    href: "/career-toolkit/industry-core-skills",
    label: "Guide",
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

  const generators = useMemo(() => tools.filter((tool) => tool.label === "Generator"), []);
  const analyzers = useMemo(() => tools.filter((tool) => tool.label === "Analyzer"), []);
  const guides = useMemo(() => tools.filter((tool) => tool.label === "Guide" || tool.label === "Resource"), []);

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

        @keyframes hmFloat {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
        }

        @keyframes hmPulse {
          0%, 100% { opacity: .72; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        @keyframes hmTicker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .hm-float {
          animation: hmFloat 5s ease-in-out infinite;
        }

        .hm-pulse {
          animation: hmPulse 3.5s ease-in-out infinite;
        }

        .hm-ticker-track {
          animation: hmTicker 24s linear infinite;
        }

        .hm-tool-link,
        .hm-mini-link,
        .hm-video-link {
          transition: transform .18s ease, color .18s ease, opacity .18s ease;
        }

        .hm-tool-link:hover {
          transform: translateX(5px);
        }

        .hm-mini-link:hover,
        .hm-video-link:hover {
          transform: translateY(-2px);
        }

        .hm-tool-link:hover .hm-tool-arrow {
          transform: translateX(4px);
        }

        .hm-resume-paper span {
          box-sizing: border-box;
        }

        .hm-resume-paper div[style*="display: grid"] > span {
          display: block;
          height: 7px;
          border-radius: 999px;
          background: #E4E9EF;
        }

        .hm-tool-arrow {
          transition: transform .18s ease;
        }

        @media (max-width: 1040px) {
          .hm-hero-grid,
          .hm-feature-grid,
          .hm-analysis-grid,
          .hm-guide-grid {
            grid-template-columns: 1fr !important;
          }

          .hm-resume-stage,
          .hm-analysis-stage {
            min-height: 500px !important;
          }

          .hm-tool-columns {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 720px) {
          .hm-section {
            padding: 58px 20px !important;
          }

          .hm-hero {
            padding: 56px 20px 68px !important;
          }

          .hm-display-title {
            font-size: 49px !important;
          }

          .hm-resume-paper {
            width: 88% !important;
            padding: 30px 26px !important;
          }

          .hm-analyzer-board {
            grid-template-columns: 1fr !important;
          }

          .hm-ticker {
            font-size: 19px !important;
          }
        }
      `}</style>

      <section className="hm-hero hm-hero-grid" style={styles.hero}>
        <div style={styles.heroCopy}>
          <div style={styles.eyebrow}>CAREER TOOLKIT / HIREMINDS</div>

          <h1 className="hm-display-title" style={styles.heroTitle}>
            Your career stack.
            <br />
            <span style={styles.heroBlue}>All in one place.</span>
          </h1>

          <p style={styles.heroText}>
            Build the materials. Read the job. Check the match. Practice the interview.
            Track the search. HireMinds connects the moves instead of making you piece
            everything together.
          </p>

          <div style={styles.heroActions}>
            <a href="#generators" style={styles.primaryButton}>Start building</a>
            <a href="#analyzers" style={styles.ghostButton}>See the analyzers</a>
          </div>

          <div style={styles.socialStrip}>
            <span>BUILD</span>
            <i>•</i>
            <span>MATCH</span>
            <i>•</i>
            <span>PREPARE</span>
            <i>•</i>
            <span>TRACK</span>
            <i>•</i>
            <span>ADVANCE</span>
          </div>
        </div>

        <div className="hm-resume-stage" style={styles.resumeStage}>
          <div style={styles.blueHalo} className="hm-pulse" />
          <div style={styles.backSheet} />

          <div className="hm-resume-paper hm-float" style={styles.resumePaper}>
            <div style={styles.resumeTop}>
              <div>
                <div style={styles.resumeName}>Jordan Taylor</div>
                <div style={styles.resumeRole}>Talent Acquisition Professional</div>
              </div>
              <div style={styles.resumeContact}>Hartford, CT<br />jordan@email.com</div>
            </div>

            <div style={styles.resumeRule} />

            <div style={styles.resumeSectionLabel}>PROFESSIONAL SUMMARY</div>
            <p style={styles.resumeCopy}>
              Talent acquisition professional with experience leading full-cycle recruiting,
              sourcing strategy, candidate engagement, interviewing, and hiring workflows.
            </p>

            <div style={styles.resumeSectionLabel}>CORE SKILLS</div>
            <div style={styles.resumeSkills}>
              <span>Recruiting</span>
              <span>Sourcing</span>
              <span>Interviewing</span>
              <span>ATS / CRM</span>
            </div>

            <div style={styles.resumeSectionLabel}>EXPERIENCE</div>
            <div style={styles.resumeLines}>
              <span />
              <span />
              <span style={{ width: "72%" }} />
            </div>
          </div>

          <div style={styles.tagOne}>NO RIGID TEMPLATES</div>
          <div style={styles.tagTwo}>BUILT AROUND YOU</div>
          <div style={styles.sparkOne}>✦</div>
          <div style={styles.sparkTwo}>✦</div>
        </div>
      </section>

      <div style={styles.tickerWrap}>
        <div className="hm-ticker-track" style={styles.tickerTrack}>
          {[...Array(2)].flatMap((_, index) => [
            <span className="hm-ticker" style={styles.ticker} key={`a-${index}`}>RESUME GENERATOR</span>,
            <span key={`b-${index}`} style={styles.tickerDot}>✦</span>,
            <span className="hm-ticker" style={styles.ticker} key={`c-${index}`}>JOB DESCRIPTION ANALYZER</span>,
            <span key={`d-${index}`} style={styles.tickerDot}>✦</span>,
            <span className="hm-ticker" style={styles.ticker} key={`e-${index}`}>INTERVIEW PREP</span>,
            <span key={`f-${index}`} style={styles.tickerDot}>✦</span>,
            <span className="hm-ticker" style={styles.ticker} key={`g-${index}`}>CAREER PLANNING</span>,
            <span key={`h-${index}`} style={styles.tickerDot}>✦</span>,
          ])}
        </div>
      </div>

      <section id="generators" className="hm-section hm-feature-grid" style={styles.generatorsSection}>
        <div style={styles.sectionCopy}>
          <div style={styles.sectionEyebrow}>GENERATORS</div>
          <h2 className="hm-display-title" style={styles.lightTitle}>
            Make the thing.
            <br />
            <span style={styles.blueWord}>Then make it better.</span>
          </h2>
          <p style={styles.lightText}>
            These are your build tools — resume, cover letter, career path, goals,
            professional branding, interview questions, job logs, budgets, and more.
          </p>

          <a href="/resume-builder" style={styles.inlineFeatureLink}>
            Try the Resume Generator <span>↗</span>
          </a>
        </div>

        <div style={styles.generatorVisual}>
          <div style={styles.generatorTopLine}>
            <span>RESUME GENERATOR</span>
            <strong>LIVE PREVIEW</strong>
          </div>

          <div style={styles.generatorHeadline}>Your experience in. Stronger language out.</div>

          <div style={styles.generatorInput}>
            <span>Target role</span>
            <strong>Administrative Assistant</strong>
          </div>
          <div style={styles.generatorInput}>
            <span>Professional summary</span>
            <strong>Client-focused administrative professional...</strong>
          </div>

          <div style={styles.generatorBottom}>
            <span>AI-assisted</span>
            <button type="button" style={styles.fakeBlueButton}>Generate ideas</button>
          </div>

          <div style={styles.generatorGlow} />
        </div>

        <ToolLines tools={generators} dark={false} />
      </section>

      <section id="analyzers" className="hm-section" style={styles.analyzersSection}>
        <div className="hm-analysis-grid" style={styles.analysisGrid}>
          <div style={styles.analysisCopy}>
            <div style={styles.darkEyebrow}>ANALYZERS</div>
            <h2 className="hm-display-title" style={styles.darkTitle}>
              Don’t guess.
              <br />
              <span style={styles.analysisBlue}>Read the signal.</span>
            </h2>
            <p style={styles.darkText}>
              HireMinds pulls apart the job description and compares your resume so you
              can see what matters before you hit apply.
            </p>
          </div>

          <div className="hm-analysis-stage" style={styles.analysisStage}>
            <div className="hm-analyzer-board" style={styles.analyzerBoard}>
              <div style={styles.analyzerLeft}>
                <div style={styles.analyzerKicker}>JOB DESCRIPTION</div>
                <h3 style={styles.analyzerTitle}>Senior Talent Acquisition Partner</h3>
                <p style={styles.analyzerCopy}>
                  Lead end-to-end recruiting strategy while partnering with business
                  leaders to identify talent needs, develop pipelines, and improve hiring outcomes.
                </p>

                <div style={styles.keywordCloud}>
                  <span>recruiting strategy</span>
                  <span>stakeholders</span>
                  <span>sourcing</span>
                  <span>ATS / CRM</span>
                </div>
              </div>

              <div style={styles.analyzerRight}>
                <div style={styles.foundKicker}>WHAT HIREMINDS FOUND</div>

                {[
                  ["Recruiting Strategy", "Detected"],
                  ["Stakeholder Management", "Detected"],
                  ["Talent Sourcing", "Detected"],
                  ["ATS / CRM", "Focus"],
                ].map(([skill, status]) => (
                  <div key={skill} style={styles.foundRow}>
                    <span>{skill}</span>
                    <strong>{status}</strong>
                  </div>
                ))}

                <div style={styles.focusBlock}>
                  <span>APPLICATION FOCUS</span>
                  <p>Lead with recruiting strategy, stakeholder partnership, and measurable hiring results.</p>
                </div>
              </div>
            </div>

            <div style={styles.analysisStamp}>MATCH SMARTER</div>
          </div>
        </div>

        <ToolLines tools={analyzers} dark />
      </section>

      <section id="guides" className="hm-section hm-guide-grid" style={styles.guidesSection}>
        <div style={styles.guideVisual}>
          <div style={styles.guidePhone}>
            <div style={styles.phoneTop}>HIREMINDS</div>
            <div style={styles.reelLabel}>CAREER QUICK TAKE</div>
            <div style={styles.reelTitle}>3 things to do before your next interview.</div>

            <div style={styles.reelList}>
              <span>01 / Know the role</span>
              <span>02 / Build your examples</span>
              <span>03 / Prepare your questions</span>
            </div>

            <div style={styles.reelFooter}>
              <span>Save this for later</span>
              <strong>♡</strong>
            </div>
          </div>

          <div style={styles.phoneGlow} />
        </div>

        <div style={styles.sectionCopy}>
          <div style={styles.sectionEyebrow}>GUIDES + RESOURCES</div>
          <h2 className="hm-display-title" style={styles.lightTitle}>
            Learn fast.
            <br />
            <span style={styles.blueWord}>Use it immediately.</span>
          </h2>
          <p style={styles.lightText}>
            Short, practical guidance for resume formats, interviews, job-search habits,
            soft skills, core industry skills, and the parts of the process people usually overthink.
          </p>

          <a href="/career-toolkit/community-feed" className="hm-video-link" style={styles.videoLink}>
            <span style={styles.playButton}>▶</span>
            <span>
              <small>FEATURED RESOURCE</small>
              <strong>Career Video Library</strong>
            </span>
            <b>Watch →</b>
          </a>
        </div>

        <ToolLines tools={guides} dark={false} />
      </section>

      <section style={styles.finalSection}>
        <div style={styles.finalKicker}>ONE ACCOUNT. EVERY TOOL.</div>
        <h2 style={styles.finalTitle}>Build. Stand out. Advance.</h2>
        <p style={styles.finalText}>
          Use the tool you need now. Come back for the next move when you’re ready.
        </p>
        <a href="/profile" style={styles.finalButton}>Back to Profile →</a>
      </section>
    </main>
  );
}

function ToolLines({ tools, dark }: { tools: Tool[]; dark: boolean }) {
  return (
    <div className="hm-tool-columns" style={styles.toolColumns}>
      {tools.map((tool) => (
        <a
          key={tool.title}
          href={tool.href}
          className="hm-tool-link"
          style={{
            ...styles.toolLine,
            borderColor: dark ? "rgba(255,255,255,.11)" : "#D7E0EA",
            color: dark ? "#FFFFFF" : "#0C1B30",
          }}
        >
          <div>
            <span style={{ ...styles.toolType, color: dark ? "#78B7FF" : "#1677FF" }}>
              {tool.label}
            </span>
            <h3 style={styles.toolLineTitle}>{tool.title}</h3>
            <p style={{ ...styles.toolLineDescription, color: dark ? "#AABCD0" : "#68778A" }}>
              {tool.description}
            </p>
          </div>

          <span
            className="hm-tool-arrow"
            style={{ ...styles.toolLineArrow, color: dark ? "#78B7FF" : "#1677FF" }}
          >
            ↗
          </span>
        </a>
      ))}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  loadingPage: {
    minHeight: "100vh",
    background: "#06172A",
    display: "grid",
    placeItems: "center",
  },

  loadingGlow: {
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    background: "radial-gradient(circle, #1677FF 0%, rgba(22,119,255,0) 72%)",
  },

  page: {
    minHeight: "100vh",
    overflow: "hidden",
    background: "#F0F4F9",
    color: "#0F172A",
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  hero: {
    minHeight: "720px",
    padding: "76px max(6vw, 44px)",
    display: "grid",
    gridTemplateColumns: "minmax(0,.86fr) minmax(560px,1.14fr)",
    gap: "56px",
    alignItems: "center",
    background:
      "radial-gradient(circle at 88% 8%, rgba(22,119,255,.34), transparent 25%), linear-gradient(115deg, #05172A 0%, #0A284B 54%, #0B3F7B 110%)",
    position: "relative",
  },

  heroCopy: {
    position: "relative",
    zIndex: 2,
    maxWidth: "720px",
  },

  eyebrow: {
    marginBottom: "20px",
    color: "#49A0FF",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".18em",
  },

  heroTitle: {
    margin: "0 0 26px",
    color: "#FFFFFF",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(62px, 7vw, 108px)",
    lineHeight: .94,
    letterSpacing: "-.055em",
    fontWeight: 400,
  },

  heroBlue: {
    color: "#3390FF",
  },

  heroText: {
    margin: 0,
    maxWidth: "680px",
    color: "#C1CEDD",
    fontSize: "18px",
    lineHeight: 1.72,
  },

  heroActions: {
    marginTop: "30px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  primaryButton: {
    minHeight: "46px",
    display: "inline-flex",
    alignItems: "center",
    padding: "0 18px",
    borderRadius: "999px",
    background: "#1677FF",
    color: "#FFFFFF",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 850,
    boxShadow: "0 12px 30px rgba(22,119,255,.28)",
  },

  ghostButton: {
    minHeight: "46px",
    display: "inline-flex",
    alignItems: "center",
    padding: "0 18px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,.20)",
    background: "rgba(255,255,255,.05)",
    color: "#E4EEFA",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 850,
  },

  socialStrip: {
    marginTop: "28px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    color: "#7FB6F4",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".14em",
  },

  resumeStage: {
    minHeight: "600px",
    position: "relative",
    display: "grid",
    placeItems: "center",
  },

  blueHalo: {
    position: "absolute",
    width: "430px",
    height: "430px",
    borderRadius: "50%",
    right: "2%",
    top: "7%",
    background: "radial-gradient(circle, rgba(32,131,255,.34), rgba(32,131,255,.03) 53%, transparent 72%)",
  },

  backSheet: {
    position: "absolute",
    width: "72%",
    height: "77%",
    right: "8%",
    bottom: "5%",
    borderRadius: "14px",
    transform: "rotate(5deg)",
    background: "linear-gradient(145deg, #DDE5ED 0%, #AEBCCB 100%)",
    boxShadow: "0 30px 70px rgba(0,0,0,.24)",
  },

  resumePaper: {
    position: "relative",
    zIndex: 2,
    width: "78%",
    minHeight: "500px",
    padding: "48px 46px",
    background: "#FFFFFF",
    boxShadow: "0 30px 80px rgba(0,0,0,.30)",
  },

  resumeTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
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
    color: "#7A8797",
    fontSize: "11px",
    lineHeight: 1.5,
    textAlign: "right",
  },

  resumeRule: {
    height: "3px",
    margin: "28px 0 26px",
    background: "#1677FF",
  },

  resumeSectionLabel: {
    margin: "0 0 9px",
    color: "#111827",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".07em",
  },

  resumeCopy: {
    margin: "0 0 26px",
    color: "#59687B",
    fontSize: "11px",
    lineHeight: 1.65,
  },

  resumeSkills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px 14px",
    marginBottom: "28px",
    color: "#516174",
    fontSize: "10px",
  },

  resumeLines: {
    display: "grid",
    gap: "8px",
  },

  tagOne: {
    position: "absolute",
    zIndex: 4,
    top: "18%",
    right: "0",
    padding: "13px 17px",
    borderRadius: "999px",
    background: "#1677FF",
    color: "#FFFFFF",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".04em",
    boxShadow: "0 14px 30px rgba(22,119,255,.27)",
  },

  tagTwo: {
    position: "absolute",
    zIndex: 4,
    left: "2%",
    bottom: "11%",
    padding: "12px 16px",
    borderRadius: "999px",
    background: "#081522",
    color: "#E3EDF8",
    border: "1px solid rgba(255,255,255,.15)",
    fontSize: "10px",
    fontWeight: 850,
  },

  sparkOne: {
    position: "absolute",
    zIndex: 4,
    color: "#78B8FF",
    top: "9%",
    left: "8%",
    fontSize: "32px",
  },

  sparkTwo: {
    position: "absolute",
    zIndex: 4,
    color: "#FFFFFF",
    right: "9%",
    bottom: "11%",
    fontSize: "22px",
    opacity: .8,
  },

  tickerWrap: {
    overflow: "hidden",
    background: "#1677FF",
    borderTop: "1px solid rgba(255,255,255,.12)",
    borderBottom: "1px solid rgba(255,255,255,.12)",
  },

  ticker: {
    fontSize: "22px",
    fontWeight: 900,
    letterSpacing: ".05em",
    whiteSpace: "nowrap",
  },

  tickerTrack: {
    width: "max-content",
    display: "flex",
    alignItems: "center",
    gap: "24px",
    padding: "15px 0",
    color: "#FFFFFF",
  },

  tickerDot: {
    opacity: .65,
    fontSize: "14px",
  },

  generatorsSection: {
    padding: "94px max(6vw, 44px)",
    display: "grid",
    gridTemplateColumns: "minmax(0,.78fr) minmax(520px,1.22fr)",
    gap: "64px",
    alignItems: "center",
    background:
      "radial-gradient(circle at 9% 10%, rgba(22,119,255,.08), transparent 28%), #EEF3F8",
  },

  sectionCopy: {
    maxWidth: "650px",
  },

  sectionEyebrow: {
    marginBottom: "18px",
    color: "#1677FF",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".18em",
  },

  lightTitle: {
    margin: "0 0 22px",
    color: "#0B1728",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(54px, 5.8vw, 86px)",
    lineHeight: .96,
    letterSpacing: "-.05em",
    fontWeight: 400,
  },

  blueWord: {
    color: "#1677FF",
  },

  lightText: {
    margin: 0,
    color: "#65758A",
    fontSize: "17px",
    lineHeight: 1.75,
  },

  inlineFeatureLink: {
    display: "inline-flex",
    gap: "10px",
    alignItems: "center",
    marginTop: "24px",
    color: "#0B376B",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 850,
  },

  generatorVisual: {
    position: "relative",
    overflow: "hidden",
    padding: "34px",
    borderTop: "1px solid #D9E3EE",
    borderBottom: "1px solid #D9E3EE",
    background: "linear-gradient(110deg, rgba(255,255,255,.72), rgba(236,245,255,.95))",
  },

  generatorTopLine: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#1677FF",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".12em",
  },

  generatorHeadline: {
    position: "relative",
    zIndex: 2,
    margin: "22px 0",
    maxWidth: "520px",
    color: "#0D1C31",
    fontSize: "32px",
    lineHeight: 1.08,
    letterSpacing: "-.035em",
    fontWeight: 800,
  },

  generatorInput: {
    position: "relative",
    zIndex: 2,
    padding: "14px 0",
    borderBottom: "1px solid #DDE6EF",
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    color: "#607085",
    fontSize: "11px",
  },

  generatorBottom: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    paddingTop: "18px",
    color: "#76859A",
    fontSize: "10px",
  },

  fakeBlueButton: {
    border: "none",
    borderRadius: "999px",
    padding: "10px 14px",
    background: "#1677FF",
    color: "#FFFFFF",
    fontWeight: 850,
    fontSize: "10px",
  },

  generatorGlow: {
    position: "absolute",
    width: "260px",
    height: "260px",
    right: "-70px",
    top: "-95px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(22,119,255,.22), transparent 68%)",
  },

  toolColumns: {
    gridColumn: "1 / -1",
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    columnGap: "42px",
    marginTop: "18px",
  },

  toolLine: {
    minHeight: "150px",
    padding: "23px 0",
    borderTop: "1px solid",
    textDecoration: "none",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
  },

  toolType: {
    display: "block",
    marginBottom: "7px",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".12em",
    textTransform: "uppercase",
  },

  toolLineTitle: {
    margin: "0 0 7px",
    fontSize: "19px",
    lineHeight: 1.25,
    letterSpacing: "-.025em",
    fontWeight: 820,
  },

  toolLineDescription: {
    margin: 0,
    maxWidth: "520px",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  toolLineArrow: {
    flexShrink: 0,
    fontSize: "20px",
  },

  analyzersSection: {
    padding: "96px max(6vw,44px)",
    background:
      "radial-gradient(circle at 88% 18%, rgba(22,119,255,.20), transparent 25%), linear-gradient(135deg, #061422 0%, #0A213B 100%)",
  },

  analysisGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0,.72fr) minmax(560px,1.28fr)",
    gap: "64px",
    alignItems: "center",
  },

  analysisCopy: {
    maxWidth: "650px",
  },

  darkEyebrow: {
    marginBottom: "18px",
    color: "#69AEFF",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".18em",
  },

  darkTitle: {
    margin: "0 0 22px",
    color: "#FFFFFF",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(54px,5.8vw,86px)",
    lineHeight: .96,
    letterSpacing: "-.05em",
    fontWeight: 400,
  },

  analysisBlue: {
    color: "#4D9FFF",
  },

  darkText: {
    margin: 0,
    color: "#AFC0D3",
    fontSize: "17px",
    lineHeight: 1.75,
  },

  analysisStage: {
    position: "relative",
    minHeight: "490px",
    display: "grid",
    placeItems: "center",
  },

  analyzerBoard: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    overflow: "hidden",
    boxShadow: "0 32px 70px rgba(0,0,0,.34)",
  },

  analyzerLeft: {
    padding: "42px 36px",
    background: "#FFFFFF",
  },

  analyzerRight: {
    padding: "42px 36px",
    background: "#061221",
    color: "#FFFFFF",
  },

  analyzerKicker: {
    color: "#78889A",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".11em",
  },

  analyzerTitle: {
    margin: "24px 0 22px",
    color: "#0E1726",
    fontSize: "28px",
    lineHeight: 1.18,
    letterSpacing: "-.03em",
  },

  analyzerCopy: {
    margin: 0,
    color: "#65758A",
    fontSize: "12px",
    lineHeight: 1.72,
  },

  keywordCloud: {
    marginTop: "24px",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    color: "#1677FF",
    fontSize: "9px",
    fontWeight: 800,
  },

  foundKicker: {
    marginBottom: "18px",
    color: "#65ADFF",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".11em",
  },

  foundRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "14px 0",
    borderBottom: "1px solid rgba(255,255,255,.09)",
    color: "#D7E2EE",
    fontSize: "10px",
  },

  focusBlock: {
    marginTop: "20px",
    padding: "15px",
    background: "#0A2A4F",
    color: "#DDEBFA",
  },

  analysisStamp: {
    position: "absolute",
    right: "-10px",
    bottom: "6%",
    transform: "rotate(-5deg)",
    padding: "12px 15px",
    background: "#1677FF",
    color: "#FFFFFF",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".11em",
    boxShadow: "0 12px 28px rgba(22,119,255,.25)",
  },

  guidesSection: {
    padding: "96px max(6vw,44px)",
    display: "grid",
    gridTemplateColumns: "minmax(520px,1fr) minmax(0,.82fr)",
    gap: "72px",
    alignItems: "center",
    background:
      "radial-gradient(circle at 12% 18%, rgba(22,119,255,.09), transparent 27%), #F4F7FB",
  },

  guideVisual: {
    minHeight: "560px",
    position: "relative",
    display: "grid",
    placeItems: "center",
  },

  guidePhone: {
    position: "relative",
    zIndex: 2,
    width: "330px",
    minHeight: "540px",
    padding: "24px",
    borderRadius: "34px",
    background:
      "linear-gradient(180deg, #081729 0%, #0B2A4F 56%, #0B417C 120%)",
    border: "8px solid #071321",
    boxShadow: "0 35px 75px rgba(15,23,42,.22)",
    color: "#FFFFFF",
  },

  phoneTop: {
    color: "#55A5FF",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".15em",
  },

  reelLabel: {
    marginTop: "70px",
    color: "#8BC3FF",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".12em",
  },

  reelTitle: {
    marginTop: "12px",
    color: "#FFFFFF",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "34px",
    lineHeight: 1.05,
  },

  reelList: {
    marginTop: "34px",
    display: "grid",
    gap: "14px",
    color: "#D3E1EF",
    fontSize: "11px",
  },

  reelFooter: {
    position: "absolute",
    left: "24px",
    right: "24px",
    bottom: "24px",
    paddingTop: "15px",
    borderTop: "1px solid rgba(255,255,255,.12)",
    display: "flex",
    justifyContent: "space-between",
    color: "#9DCBFF",
    fontSize: "10px",
  },

  phoneGlow: {
    position: "absolute",
    width: "410px",
    height: "410px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(22,119,255,.20), transparent 70%)",
  },

  videoLink: {
    marginTop: "26px",
    display: "grid",
    gridTemplateColumns: "48px 1fr auto",
    gap: "14px",
    alignItems: "center",
    padding: "16px 0",
    borderTop: "1px solid #D8E2EC",
    borderBottom: "1px solid #D8E2EC",
    color: "#0D1B2D",
    textDecoration: "none",
  },

  playButton: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    background: "#1677FF",
    color: "#FFFFFF",
    fontSize: "13px",
  },

  finalSection: {
    padding: "78px max(6vw,44px)",
    textAlign: "center",
    background: "#FFFFFF",
  },

  finalKicker: {
    color: "#1677FF",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".15em",
  },

  finalTitle: {
    margin: "12px 0",
    color: "#0A1727",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(48px,5vw,74px)",
    lineHeight: 1,
    letterSpacing: "-.045em",
    fontWeight: 400,
  },

  finalText: {
    margin: "0 auto",
    maxWidth: "620px",
    color: "#68778A",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  finalButton: {
    marginTop: "24px",
    minHeight: "44px",
    display: "inline-flex",
    alignItems: "center",
    padding: "0 18px",
    borderRadius: "999px",
    background: "#1677FF",
    color: "#FFFFFF",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 850,
  },
};
