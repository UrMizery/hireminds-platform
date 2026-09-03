"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

type Tool = {
  title: string;
  description: string;
  href: string;
  label: string;
};

const heroWords = ["build.", "match.", "prepare.", "advance."];

const careerMaterials: Tool[] = [
  {
    title: "Resume Generator",
    description:
      "Build, preview, strengthen, and print a professional resume with guided sections and AI assistance.",
    href: "/resume-builder",
    label: "Resume",
  },
  {
    title: "Reentry / Second Chance Resume Generator",
    description:
      "Create a professional resume from limited, nontraditional, institutional, volunteer, or reentry experience.",
    href: "/career-toolkit/new-opportunities-resume-generator",
    label: "Resume",
  },
  {
    title: "Cover Letter Generator",
    description:
      "Build a polished cover letter using your resume, job description, company information, and AI assistance.",
    href: "/career-toolkit/cover-letter-generator",
    label: "Letter",
  },
  {
    title: "Resume Format Guide",
    description:
      "Compare Chronological, Functional, and Combination resume formats before you build.",
    href: "/career-toolkit/resume-type-helper",
    label: "Guide",
  },
  {
    title: "Skills Explorer",
    description:
      "Explore transferable, soft, and industry core skills in one place.",
    href: "/career-toolkit/industry-core-skills",
    label: "Skills",
  },
  {
    title: "The House of Letters",
    description:
      "Create professional follow-ups, thank-you letters, resignation letters, requests, and workplace communication.",
    href: "/career-toolkit/employer-follow-up-generator",
    label: "Letters",
  },
];

const jobMatchTools: Tool[] = [
  {
    title: "Job Match Analyzer",
    description:
      "Compare your resume against a job posting, identify what the employer is asking for, and see where your application needs attention.",
    href: "/career-toolkit/resume-match-analyzer",
    label: "Analyzer",
  },
];

const interviewTools: Tool[] = [
  {
    title: "Interview Prep Studio",
    description:
      "Prepare for interviews in one place with role-focused questions, answer guidance, STAR support, and employer questions.",
    href: "/career-toolkit/interview-question-generator",
    label: "Interview",
  },
];

const directionTools: Tool[] = [
  {
    title: "Career Path Generator",
    description:
      "Explore realistic career paths based on your interests, strengths, work preferences, and goals.",
    href: "/career-toolkit/career-path-generator",
    label: "Direction",
  },
  {
    title: "Career Goal Generator",
    description:
      "Turn a career direction into a clear goal with practical next steps and an action plan.",
    href: "/career-toolkit/career-goal-generator",
    label: "Goal",
  },
];

const resources: Tool[] = [
  {
    title: "Job Search Tips",
    description:
      "Practical guidance for applications, employer research, job descriptions, and job-search strategy.",
    href: "/career-toolkit/job-search-tips",
    label: "Guide",
  },
  {
    title: "Career Video Library",
    description:
      "Short career videos, quick takes, and practical guidance you can return to anytime.",
    href: "/career-toolkit/community-feed",
    label: "Video",
  },
];

export default function CareerToolkitPage() {
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

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

    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroWords.length);
    }, 1850);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const tickerItems = useMemo(
    () => [
      "CAREER MATERIALS",
      "JOB MATCH",
      "INTERVIEW PREP STUDIO",
      "CAREER DIRECTION",
      "SKILLS EXPLORER",
      "HOUSE OF LETTERS",
      "CAREER VIDEO LIBRARY",
    ],
    []
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

        @keyframes hmWordReveal {
          0% { opacity: 0; transform: translateY(12px); filter: blur(4px); }
          18% { opacity: 1; transform: translateY(0); filter: blur(0); }
          78% { opacity: 1; transform: translateY(0); filter: blur(0); }
          100% { opacity: 0; transform: translateY(-9px); filter: blur(3px); }
        }

        @keyframes hmFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
        }

        @keyframes hmFloatTwo {
          0%, 100% { transform: translateY(0) rotate(3deg); }
          50% { transform: translateY(7px) rotate(2deg); }
        }

        @keyframes hmPulse {
          0%, 100% { opacity: .62; transform: scale(.96); }
          50% { opacity: 1; transform: scale(1.06); }
        }

        @keyframes hmTicker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes hmShine {
          0%, 56% { left: -35%; }
          78%, 100% { left: 125%; }
        }

        .hm-changing-word {
          animation: hmWordReveal 1.85s ease-in-out;
        }

        .hm-float {
          animation: hmFloat 5.5s ease-in-out infinite;
        }

        .hm-float-two {
          animation: hmFloatTwo 6s ease-in-out infinite;
        }

        .hm-pulse {
          animation: hmPulse 4.5s ease-in-out infinite;
        }

        .hm-ticker-track {
          animation: hmTicker 28s linear infinite;
        }

        .hm-tool-row {
          transition: transform .18s ease, background .18s ease, border-color .18s ease;
        }

        .hm-tool-row:hover {
          transform: translateX(5px);
          background: rgba(22,119,255,.045);
        }

        .hm-tool-row-dark:hover {
          background: rgba(255,255,255,.035);
        }

        .hm-tool-row:hover .hm-arrow {
          transform: translateX(5px);
        }

        .hm-arrow {
          transition: transform .18s ease;
        }

        .hm-primary-cta {
          position: relative;
          overflow: hidden;
        }

        .hm-primary-cta::before {
          content: "";
          position: absolute;
          top: -40%;
          left: -35%;
          width: 24%;
          height: 180%;
          transform: rotate(18deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.34),
            transparent
          );
          animation: hmShine 4.8s ease-in-out infinite;
        }

        @media (max-width: 1080px) {
          .hm-hero-grid,
          .hm-showcase-grid,
          .hm-direction-grid {
            grid-template-columns: 1fr !important;
          }

          .hm-stage {
            min-height: 500px !important;
          }

          .hm-direction-tools {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .hm-section {
            padding: 64px 20px !important;
          }

          .hm-hero {
            padding: 56px 20px 70px !important;
          }

          .hm-display {
            font-size: 50px !important;
          }

          .hm-material-stage {
            min-height: 450px !important;
          }

          .hm-resume-sheet {
            width: 82% !important;
          }

          .hm-letter-sheet {
            width: 58% !important;
            right: 0 !important;
          }

          .hm-match-board {
            grid-template-columns: 1fr !important;
          }

          .hm-phone {
            width: 290px !important;
          }

          .hm-ticker-text {
            font-size: 18px !important;
          }
        }
      `}</style>

      <section className="hm-hero hm-hero-grid" style={styles.hero}>
        <div style={styles.heroGlowOne} className="hm-pulse" />
        <div style={styles.heroGlowTwo} className="hm-pulse" />

        <div style={styles.heroCopy}>
          <p style={styles.eyebrow}>CAREER TOOLKIT / HIREMINDS</p>

          <h1 className="hm-display" style={styles.heroTitle}>
            Your career tools.
            <br />
            Built to help you{" "}
            <span
              key={heroIndex}
              className="hm-changing-word"
              style={styles.heroBlue}
            >
              {heroWords[heroIndex]}
            </span>
          </h1>

          <p style={styles.heroText}>
            Build your materials, understand the job, prepare for the interview,
            and make your next move without bouncing between disconnected tools.
          </p>

          <div style={styles.heroActions}>
            <a
              href="#career-materials"
              className="hm-primary-cta"
              style={styles.primaryButton}
            >
              <span style={{ position: "relative", zIndex: 2 }}>
                Start with Career Materials
              </span>
            </a>

            <a href="#job-match" style={styles.ghostButton}>
              Explore the Roadmap →
            </a>
          </div>

          <div style={styles.heroMicro}>
            <span>BUILD</span>
            <i>•</i>
            <span>MATCH</span>
            <i>•</i>
            <span>PREPARE</span>
            <i>•</i>
            <span>ADVANCE</span>
          </div>
        </div>

        <div className="hm-stage" style={styles.heroStage}>
          <div style={styles.heroOrbit} className="hm-pulse" />

          <div className="hm-float" style={styles.heroResume}>
            <div style={styles.heroResumeTop}>
              <div>
                <strong style={styles.heroResumeName}>Jordan Taylor</strong>
                <span style={styles.heroResumeRole}>Operations Professional</span>
              </div>
              <span style={styles.heroResumeContact}>
                Hartford, CT
                <br />
                jordan@email.com
              </span>
            </div>

            <div style={styles.heroResumeRule} />

            <span style={styles.heroResumeLabel}>PROFESSIONAL SUMMARY</span>
            <div style={styles.fakeLineWide} />
            <div style={styles.fakeLineMedium} />

            <span style={styles.heroResumeLabel}>CORE SKILLS</span>
            <div style={styles.fakeSkillRow}>
              <span>Teamwork</span>
              <span>Operations</span>
              <span>Communication</span>
            </div>

            <span style={styles.heroResumeLabel}>EXPERIENCE</span>
            <div style={styles.fakeLineWide} />
            <div style={styles.fakeLineShort} />
          </div>

          <div className="hm-float-two" style={styles.heroAnalyzer}>
            <span style={styles.heroCardKicker}>JOB MATCH</span>
            <strong style={styles.heroCardTitle}>82% aligned</strong>
            <div style={styles.matchBar}>
              <span style={styles.matchBarFill} />
            </div>
            <span style={styles.matchSmall}>7 strong matches</span>
            <span style={styles.matchSmall}>2 areas to strengthen</span>
          </div>

          <div style={styles.tagOne}>AI-ASSISTED</div>
          <div style={styles.tagTwo}>BUILT AROUND YOU</div>
          <div style={styles.sparkOne}>✦</div>
          <div style={styles.sparkTwo}>✦</div>
        </div>
      </section>

      <div style={styles.tickerWrap}>
        <div className="hm-ticker-track" style={styles.tickerTrack}>
          {[...Array(2)].flatMap((_, outerIndex) =>
            tickerItems.flatMap((item, itemIndex) => [
              <span
                className="hm-ticker-text"
                style={styles.tickerText}
                key={`${outerIndex}-${itemIndex}-text`}
              >
                {item}
              </span>,
              <span
                key={`${outerIndex}-${itemIndex}-dot`}
                style={styles.tickerDot}
              >
                ✦
              </span>,
            ])
          )}
        </div>
      </div>

      <section
        id="career-materials"
        className="hm-section hm-showcase-grid"
        style={styles.materialsSection}
      >
        <div style={styles.sectionCopy}>
          <p style={styles.sectionEyebrow}>CAREER MATERIALS</p>
          <h2 className="hm-display" style={styles.lightTitle}>
            Build the materials.
            <br />
            <span style={styles.blueWord}>Strengthen the story.</span>
          </h2>
          <p style={styles.lightText}>
            This is the core HireMinds workspace. Build the resume, identify the
            right skills, choose the right format, create the cover letter, and
            handle the professional communication that comes next.
          </p>

          <div style={styles.roadmapLine}>
            <span>FORMAT</span>
            <i>→</i>
            <span>RESUME</span>
            <i>→</i>
            <span>SKILLS</span>
            <i>→</i>
            <span>COVER LETTER</span>
            <i>→</i>
            <span>FOLLOW-UP</span>
          </div>
        </div>

        <div className="hm-material-stage" style={styles.materialStage}>
          <div style={styles.materialGlow} className="hm-pulse" />

          <div
            className="hm-resume-sheet hm-float"
            style={styles.materialResume}
          >
            <div style={styles.materialTopLine}>
              <span>RESUME GENERATOR</span>
              <strong>LIVE PREVIEW</strong>
            </div>

            <div style={styles.materialHeadline}>
              Your experience. Stronger language. Cleaner structure.
            </div>

            <div style={styles.mockInput}>
              <span>Professional Summary</span>
              <strong>AI-assisted writing</strong>
            </div>

            <div style={styles.mockInput}>
              <span>Core Skills</span>
              <strong>9 focused skills</strong>
            </div>

            <div style={styles.mockFooter}>
              <span>Polished Professional</span>
              <span>ATS Structured</span>
            </div>
          </div>

          <div
            className="hm-letter-sheet hm-float-two"
            style={styles.materialLetter}
          >
            <span style={styles.letterKicker}>COVER LETTER</span>
            <strong style={styles.letterTitle}>Tailored to the role.</strong>
            <div style={styles.letterLine} />
            <div style={styles.letterLine} />
            <div style={{ ...styles.letterLine, width: "72%" }} />
            <span style={styles.letterSignature}>Your Name</span>
          </div>

          <div style={styles.materialTagOne}>SKILLS EXPLORER</div>
          <div style={styles.materialTagTwo}>HOUSE OF LETTERS</div>
        </div>

        <ToolRows tools={careerMaterials} dark={false} />
      </section>

      <section
        id="job-match"
        className="hm-section hm-showcase-grid"
        style={styles.matchSection}
      >
        <div style={styles.sectionCopy}>
          <p style={styles.darkEyebrow}>JOB MATCH</p>
          <h2 className="hm-display" style={styles.darkTitle}>
            Read the role.
            <br />
            <span style={styles.analysisBlue}>See the match.</span>
          </h2>
          <p style={styles.darkText}>
            One place to understand what the employer is asking for and how your
            resume lines up before you apply.
          </p>

          <a
            href="/career-toolkit/resume-match-analyzer"
            style={styles.darkInlineLink}
          >
            Open Job Match Analyzer ↗
          </a>
        </div>

        <div style={styles.matchStage}>
          <div className="hm-match-board" style={styles.matchBoard}>
            <div style={styles.matchLeft}>
              <span style={styles.matchKicker}>JOB DESCRIPTION</span>
              <h3 style={styles.matchTitle}>Operations Coordinator</h3>
              <p style={styles.matchCopy}>
                Coordinate daily workflows, maintain records, communicate across
                teams, and support operational priorities.
              </p>

              <div style={styles.keywordCloud}>
                <span>organization</span>
                <span>communication</span>
                <span>records</span>
                <span>operations</span>
              </div>
            </div>

            <div style={styles.matchRight}>
              <span style={styles.matchFound}>YOUR MATCH</span>

              {[
                ["Communication", "Strong"],
                ["Organization", "Strong"],
                ["Records", "Present"],
                ["Operations", "Strengthen"],
              ].map(([skill, status]) => (
                <div key={skill} style={styles.matchRow}>
                  <span>{skill}</span>
                  <strong>{status}</strong>
                </div>
              ))}

              <div style={styles.focusBox}>
                <span>APPLICATION FOCUS</span>
                <p>
                  Lead with workflow coordination, communication, recordkeeping,
                  and reliability.
                </p>
              </div>
            </div>
          </div>

          <div style={styles.matchStamp}>MATCH SMARTER</div>
        </div>

        <ToolRows tools={jobMatchTools} dark />
      </section>

      <section
        id="interview"
        className="hm-section hm-showcase-grid"
        style={styles.interviewSection}
      >
        <div style={styles.interviewStage}>
          <div style={styles.interviewGlow} className="hm-pulse" />

          <div className="hm-phone" style={styles.phone}>
            <div style={styles.phoneTop}>
              <span>HIREMINDS</span>
              <strong>INTERVIEW PREP</strong>
            </div>

            <div style={styles.phoneQuestionLabel}>QUESTION</div>
            <div style={styles.phoneQuestion}>
              Tell me about a time you had to solve a problem quickly.
            </div>

            <div style={styles.phoneTip}>BUILD YOUR ANSWER</div>

            <div style={styles.starRow}>
              <span>S</span>
              <p>Situation</p>
            </div>
            <div style={styles.starRow}>
              <span>T</span>
              <p>Task</p>
            </div>
            <div style={styles.starRow}>
              <span>A</span>
              <p>Action</p>
            </div>
            <div style={styles.starRow}>
              <span>R</span>
              <p>Result</p>
            </div>

            <div style={styles.phoneFooter}>
              <span>Practice. Strengthen. Repeat.</span>
              <strong>→</strong>
            </div>
          </div>

          <div style={styles.interviewTag}>ROLE-FOCUSED QUESTIONS</div>
        </div>

        <div style={styles.sectionCopy}>
          <p style={styles.sectionEyebrow}>INTERVIEW PREP STUDIO</p>
          <h2 className="hm-display" style={styles.lightTitle}>
            Prepare the answer.
            <br />
            <span style={styles.blueWord}>Not just the question.</span>
          </h2>
          <p style={styles.lightText}>
            The interview tools are now presented as one preparation experience:
            questions, answer guidance, STAR structure, employer questions, and
            interview readiness.
          </p>

          <ToolRows tools={interviewTools} dark={false} />
        </div>
      </section>

      <section
        id="career-direction"
        className="hm-section hm-direction-grid"
        style={styles.directionSection}
      >
        <div style={styles.directionCopy}>
          <p style={styles.darkEyebrow}>CAREER DIRECTION</p>
          <h2 className="hm-display" style={styles.darkTitle}>
            Figure out the move.
            <br />
            <span style={styles.analysisBlue}>Then make the plan.</span>
          </h2>
          <p style={styles.darkText}>
            Career Path and Career Goal stay together here because they solve
            different parts of the same question: where could you go, and what
            should you do next?
          </p>
        </div>

        <div className="hm-direction-tools" style={styles.directionTools}>
          {directionTools.map((tool, index) => (
            <a
              key={tool.title}
              href={tool.href}
              style={styles.directionTool}
              className="hm-tool-row hm-tool-row-dark"
            >
              <span style={styles.directionNumber}>0{index + 1}</span>
              <span style={styles.directionToolLabel}>{tool.label}</span>
              <strong style={styles.directionToolTitle}>{tool.title}</strong>
              <p style={styles.directionToolCopy}>{tool.description}</p>
              <span className="hm-arrow" style={styles.directionArrow}>
                ↗
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="hm-section" style={styles.resourcesSection}>
        <div style={styles.resourceIntro}>
          <p style={styles.sectionEyebrow}>RESOURCES</p>
          <h2 className="hm-display" style={styles.resourceTitle}>
            Quick guidance.
            <br />
            <span style={styles.blueWord}>Useful when you need it.</span>
          </h2>
        </div>

        <div style={styles.resourceGrid}>
          {resources.map((tool) => (
            <a
              key={tool.title}
              href={tool.href}
              style={styles.resourceLink}
              className="hm-tool-row"
            >
              <span style={styles.resourceLabel}>{tool.label}</span>
              <strong style={styles.resourceName}>{tool.title}</strong>
              <p style={styles.resourceCopy}>{tool.description}</p>
              <span className="hm-arrow" style={styles.resourceArrow}>
                ↗
              </span>
            </a>
          ))}
        </div>
      </section>

      <section style={styles.finalSection}>
        <p style={styles.finalKicker}>ONE ACCOUNT. EVERY TOOL.</p>
        <h2 style={styles.finalTitle}>Build. Match. Prepare. Advance.</h2>
        <p style={styles.finalText}>
          Start where you are. Use the tool you need now. Come back for the next
          move when you’re ready.
        </p>

        <a href="/profile" style={styles.finalButton}>
          Back to Profile →
        </a>
      </section>
    </main>
  );
}

function ToolRows({ tools, dark }: { tools: Tool[]; dark: boolean }) {
  return (
    <div style={styles.toolRows}>
      {tools.map((tool) => (
        <a
          key={tool.title}
          href={tool.href}
          className={`hm-tool-row ${dark ? "hm-tool-row-dark" : ""}`}
          style={{
            ...styles.toolRow,
            borderColor: dark ? "rgba(255,255,255,.11)" : "#D7E0EA",
            color: dark ? "#FFFFFF" : "#0C1B30",
          }}
        >
          <div>
            <span
              style={{
                ...styles.toolLabel,
                color: dark ? "#78B7FF" : "#1677FF",
              }}
            >
              {tool.label}
            </span>
            <h3 style={styles.toolTitle}>{tool.title}</h3>
            <p
              style={{
                ...styles.toolDescription,
                color: dark ? "#AABCD0" : "#68778A",
              }}
            >
              {tool.description}
            </p>
          </div>

          <span
            className="hm-arrow"
            style={{
              ...styles.toolArrow,
              color: dark ? "#78B7FF" : "#1677FF",
            }}
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
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, #1677FF 0%, rgba(22,119,255,0) 72%)",
  },

  page: {
    minHeight: "100vh",
    overflow: "hidden",
    background: "#F0F4F9",
    color: "#0F172A",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  hero: {
    minHeight: "720px",
    padding: "76px max(6vw,44px)",
    display: "grid",
    gridTemplateColumns: "minmax(0,.88fr) minmax(560px,1.12fr)",
    gap: "58px",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    background:
      "radial-gradient(circle at 88% 8%, rgba(22,119,255,.34), transparent 24%), radial-gradient(circle at 8% 72%, rgba(68,145,255,.12), transparent 28%), linear-gradient(115deg, #041423 0%, #082846 54%, #0B3E77 115%)",
  },

  heroGlowOne: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    right: "-90px",
    top: "-100px",
    background:
      "radial-gradient(circle, rgba(22,119,255,.24), transparent 70%)",
  },

  heroGlowTwo: {
    position: "absolute",
    width: "340px",
    height: "340px",
    borderRadius: "50%",
    left: "30%",
    bottom: "-150px",
    background:
      "radial-gradient(circle, rgba(91,162,255,.14), transparent 70%)",
  },

  heroCopy: {
    position: "relative",
    zIndex: 3,
    maxWidth: "720px",
  },

  eyebrow: {
    margin: "0 0 18px",
    color: "#5FA9FF",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".18em",
  },

  heroTitle: {
    margin: "0 0 24px",
    color: "#FFFFFF",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(58px,6.7vw,102px)",
    lineHeight: .94,
    letterSpacing: "-.055em",
    fontWeight: 400,
  },

  heroBlue: {
    display: "inline-block",
    color: "#3B95FF",
  },

  heroText: {
    margin: 0,
    maxWidth: "690px",
    color: "#C5D2E0",
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
    boxShadow: "0 14px 30px rgba(22,119,255,.28)",
  },

  ghostButton: {
    minHeight: "46px",
    display: "inline-flex",
    alignItems: "center",
    padding: "0 18px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,.18)",
    background: "rgba(255,255,255,.04)",
    color: "#DCE8F5",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 850,
  },

  heroMicro: {
    marginTop: "28px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    color: "#79B4F7",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".14em",
  },

  heroStage: {
    minHeight: "600px",
    position: "relative",
    display: "grid",
    placeItems: "center",
    zIndex: 2,
  },

  heroOrbit: {
    position: "absolute",
    width: "440px",
    height: "440px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(38,136,255,.28), rgba(38,136,255,.03) 54%, transparent 72%)",
  },

  heroResume: {
    position: "relative",
    zIndex: 2,
    width: "74%",
    minHeight: "480px",
    padding: "42px 40px",
    background: "#FFFFFF",
    boxShadow: "0 34px 80px rgba(0,0,0,.30)",
  },

  heroResumeTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
  },

  heroResumeName: {
    display: "block",
    color: "#101827",
    fontSize: "28px",
  },

  heroResumeRole: {
    display: "block",
    marginTop: "6px",
    color: "#1677FF",
    fontSize: "11px",
    fontWeight: 850,
  },

  heroResumeContact: {
    color: "#758397",
    fontSize: "10px",
    lineHeight: 1.5,
    textAlign: "right",
  },

  heroResumeRule: {
    height: "3px",
    margin: "25px 0 23px",
    background: "#1677FF",
  },

  heroResumeLabel: {
    display: "block",
    margin: "18px 0 7px",
    color: "#111827",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".07em",
  },

  fakeLineWide: {
    width: "100%",
    height: "7px",
    borderRadius: "999px",
    background: "#E4E9EF",
    marginBottom: "7px",
  },

  fakeLineMedium: {
    width: "78%",
    height: "7px",
    borderRadius: "999px",
    background: "#E4E9EF",
  },

  fakeLineShort: {
    width: "58%",
    height: "7px",
    borderRadius: "999px",
    background: "#E4E9EF",
  },

  fakeSkillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    color: "#607085",
    fontSize: "9px",
  },

  heroAnalyzer: {
    position: "absolute",
    zIndex: 4,
    right: "0",
    bottom: "6%",
    width: "220px",
    padding: "18px",
    borderRadius: "15px",
    background: "#071727",
    border: "1px solid rgba(255,255,255,.12)",
    boxShadow: "0 18px 42px rgba(0,0,0,.28)",
    color: "#FFFFFF",
  },

  heroCardKicker: {
    display: "block",
    marginBottom: "8px",
    color: "#67AEFF",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".11em",
  },

  heroCardTitle: {
    display: "block",
    fontSize: "24px",
  },

  matchBar: {
    height: "5px",
    margin: "12px 0",
    borderRadius: "999px",
    overflow: "hidden",
    background: "rgba(255,255,255,.12)",
  },

  matchBarFill: {
    display: "block",
    width: "82%",
    height: "100%",
    borderRadius: "999px",
    background: "#1677FF",
  },

  matchSmall: {
    display: "block",
    marginTop: "4px",
    color: "#B9C9DA",
    fontSize: "9px",
  },

  tagOne: {
    position: "absolute",
    zIndex: 5,
    top: "15%",
    right: "2%",
    padding: "12px 15px",
    borderRadius: "999px",
    background: "#1677FF",
    color: "#FFFFFF",
    fontSize: "9px",
    fontWeight: 900,
    boxShadow: "0 14px 28px rgba(22,119,255,.24)",
  },

  tagTwo: {
    position: "absolute",
    zIndex: 5,
    left: "1%",
    bottom: "10%",
    padding: "11px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,.15)",
    background: "#081521",
    color: "#DCE7F3",
    fontSize: "9px",
    fontWeight: 850,
  },

  sparkOne: {
    position: "absolute",
    zIndex: 5,
    left: "8%",
    top: "10%",
    color: "#78B8FF",
    fontSize: "30px",
  },

  sparkTwo: {
    position: "absolute",
    zIndex: 5,
    right: "8%",
    bottom: "13%",
    color: "#FFFFFF",
    fontSize: "20px",
    opacity: .8,
  },

  tickerWrap: {
    overflow: "hidden",
    background: "#1677FF",
    borderTop: "1px solid rgba(255,255,255,.12)",
    borderBottom: "1px solid rgba(255,255,255,.12)",
  },

  tickerTrack: {
    width: "max-content",
    display: "flex",
    alignItems: "center",
    gap: "24px",
    padding: "15px 0",
    color: "#FFFFFF",
  },

  tickerText: {
    fontSize: "21px",
    fontWeight: 900,
    letterSpacing: ".05em",
    whiteSpace: "nowrap",
  },

  tickerDot: {
    opacity: .7,
    fontSize: "14px",
  },

  materialsSection: {
    padding: "96px max(6vw,44px)",
    display: "grid",
    gridTemplateColumns: "minmax(0,.78fr) minmax(520px,1.22fr)",
    gap: "66px",
    alignItems: "center",
    background:
      "radial-gradient(circle at 10% 10%, rgba(22,119,255,.08), transparent 27%), #EEF3F8",
  },

  sectionCopy: {
    maxWidth: "680px",
  },

  sectionEyebrow: {
    margin: "0 0 17px",
    color: "#1677FF",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".18em",
  },

  lightTitle: {
    margin: "0 0 22px",
    color: "#0B1728",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(52px,5.6vw,84px)",
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
    lineHeight: 1.74,
  },

  roadmapLine: {
    marginTop: "25px",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "8px",
    color: "#31608F",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".08em",
  },

  materialStage: {
    minHeight: "520px",
    position: "relative",
    display: "grid",
    placeItems: "center",
  },

  materialGlow: {
    position: "absolute",
    width: "430px",
    height: "430px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(22,119,255,.18), transparent 70%)",
  },

  materialResume: {
    position: "relative",
    zIndex: 2,
    width: "78%",
    padding: "34px",
    background:
      "linear-gradient(145deg, rgba(255,255,255,.98), rgba(242,247,252,.98))",
    boxShadow: "0 30px 65px rgba(33,57,83,.16)",
  },

  materialTopLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#1677FF",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".10em",
  },

  materialHeadline: {
    margin: "24px 0",
    maxWidth: "500px",
    color: "#0D1C31",
    fontSize: "29px",
    lineHeight: 1.1,
    fontWeight: 820,
    letterSpacing: "-.035em",
  },

  mockInput: {
    padding: "13px 0",
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    borderBottom: "1px solid #DCE5EE",
    color: "#68788C",
    fontSize: "10px",
  },

  mockFooter: {
    paddingTop: "17px",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#1677FF",
    fontSize: "9px",
    fontWeight: 850,
  },

  materialLetter: {
    position: "absolute",
    zIndex: 3,
    width: "42%",
    minHeight: "240px",
    right: "-2%",
    bottom: "2%",
    padding: "24px",
    background: "#081B30",
    color: "#FFFFFF",
    boxShadow: "0 24px 48px rgba(12,37,67,.22)",
  },

  letterKicker: {
    display: "block",
    marginBottom: "9px",
    color: "#67AEFF",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".11em",
  },

  letterTitle: {
    display: "block",
    marginBottom: "18px",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "22px",
    fontWeight: 400,
  },

  letterLine: {
    width: "100%",
    height: "5px",
    marginBottom: "8px",
    borderRadius: "999px",
    background: "rgba(255,255,255,.15)",
  },

  letterSignature: {
    display: "block",
    marginTop: "24px",
    color: "#8CC5FF",
    fontFamily: '"Segoe Script", "Lucida Handwriting", cursive',
    fontSize: "18px",
  },

  materialTagOne: {
    position: "absolute",
    zIndex: 5,
    left: "0",
    top: "11%",
    padding: "10px 13px",
    borderRadius: "999px",
    background: "#1677FF",
    color: "#FFFFFF",
    fontSize: "8px",
    fontWeight: 900,
  },

  materialTagTwo: {
    position: "absolute",
    zIndex: 5,
    left: "6%",
    bottom: "7%",
    padding: "10px 13px",
    borderRadius: "999px",
    background: "#FFFFFF",
    color: "#214E7A",
    border: "1px solid #D7E3EF",
    fontSize: "8px",
    fontWeight: 900,
  },

  toolRows: {
    gridColumn: "1 / -1",
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    columnGap: "42px",
    marginTop: "16px",
  },

  toolRow: {
    minHeight: "148px",
    padding: "22px 0",
    borderTop: "1px solid",
    textDecoration: "none",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
  },

  toolLabel: {
    display: "block",
    marginBottom: "7px",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".12em",
    textTransform: "uppercase",
  },

  toolTitle: {
    margin: "0 0 7px",
    fontSize: "19px",
    lineHeight: 1.25,
    letterSpacing: "-.025em",
    fontWeight: 820,
  },

  toolDescription: {
    margin: 0,
    maxWidth: "520px",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  toolArrow: {
    flexShrink: 0,
    fontSize: "20px",
  },

  matchSection: {
    padding: "98px max(6vw,44px)",
    display: "grid",
    gridTemplateColumns: "minmax(0,.72fr) minmax(560px,1.28fr)",
    gap: "68px",
    alignItems: "center",
    background:
      "radial-gradient(circle at 88% 18%, rgba(22,119,255,.18), transparent 25%), linear-gradient(135deg, #061422 0%, #0A213B 100%)",
  },

  darkEyebrow: {
    margin: "0 0 18px",
    color: "#69AEFF",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".18em",
  },

  darkTitle: {
    margin: "0 0 22px",
    color: "#FFFFFF",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(52px,5.6vw,84px)",
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
    lineHeight: 1.74,
  },

  darkInlineLink: {
    display: "inline-flex",
    marginTop: "24px",
    color: "#87C0FF",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 850,
  },

  matchStage: {
    position: "relative",
    minHeight: "490px",
    display: "grid",
    placeItems: "center",
  },

  matchBoard: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    overflow: "hidden",
    boxShadow: "0 32px 70px rgba(0,0,0,.34)",
  },

  matchLeft: {
    padding: "40px 34px",
    background: "#FFFFFF",
  },

  matchRight: {
    padding: "40px 34px",
    background: "#061221",
    color: "#FFFFFF",
  },

  matchKicker: {
    color: "#78889A",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".11em",
  },

  matchTitle: {
    margin: "22px 0 20px",
    color: "#0E1726",
    fontSize: "27px",
    lineHeight: 1.18,
    letterSpacing: "-.03em",
  },

  matchCopy: {
    margin: 0,
    color: "#65758A",
    fontSize: "12px",
    lineHeight: 1.72,
  },

  keywordCloud: {
    marginTop: "22px",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    color: "#1677FF",
    fontSize: "9px",
    fontWeight: 800,
  },

  matchFound: {
    display: "block",
    marginBottom: "17px",
    color: "#65ADFF",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".11em",
  },

  matchRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "14px 0",
    borderBottom: "1px solid rgba(255,255,255,.09)",
    color: "#D7E2EE",
    fontSize: "10px",
  },

  focusBox: {
    marginTop: "20px",
    padding: "15px",
    background: "#0A2A4F",
    color: "#DDEBFA",
  },

  matchStamp: {
    position: "absolute",
    right: "-8px",
    bottom: "6%",
    transform: "rotate(-5deg)",
    padding: "12px 15px",
    background: "#1677FF",
    color: "#FFFFFF",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".11em",
    boxShadow: "0 12px 28px rgba(22,119,255,.24)",
  },

  interviewSection: {
    padding: "98px max(6vw,44px)",
    display: "grid",
    gridTemplateColumns: "minmax(520px,1fr) minmax(0,.85fr)",
    gap: "76px",
    alignItems: "center",
    background:
      "radial-gradient(circle at 12% 20%, rgba(22,119,255,.09), transparent 28%), #F3F7FB",
  },

  interviewStage: {
    minHeight: "570px",
    position: "relative",
    display: "grid",
    placeItems: "center",
  },

  interviewGlow: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(22,119,255,.18), transparent 70%)",
  },

  phone: {
    position: "relative",
    zIndex: 2,
    width: "330px",
    minHeight: "540px",
    padding: "24px",
    borderRadius: "34px",
    border: "8px solid #071321",
    background:
      "linear-gradient(180deg, #081729 0%, #0B2A4F 56%, #0B417C 120%)",
    boxShadow: "0 35px 75px rgba(15,23,42,.22)",
    color: "#FFFFFF",
  },

  phoneTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#6EB4FF",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".10em",
  },

  phoneQuestionLabel: {
    marginTop: "65px",
    color: "#8BC3FF",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".12em",
  },

  phoneQuestion: {
    marginTop: "10px",
    color: "#FFFFFF",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "30px",
    lineHeight: 1.05,
  },

  phoneTip: {
    marginTop: "30px",
    color: "#75B8FF",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".11em",
  },

  starRow: {
    marginTop: "9px",
    padding: "8px 0",
    display: "grid",
    gridTemplateColumns: "30px 1fr",
    gap: "9px",
    borderBottom: "1px solid rgba(255,255,255,.09)",
    color: "#DCE7F3",
    fontSize: "10px",
  },

  phoneFooter: {
    position: "absolute",
    left: "24px",
    right: "24px",
    bottom: "24px",
    paddingTop: "14px",
    borderTop: "1px solid rgba(255,255,255,.11)",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#9ECBFF",
    fontSize: "9px",
  },

  interviewTag: {
    position: "absolute",
    zIndex: 4,
    right: "2%",
    top: "14%",
    padding: "11px 13px",
    borderRadius: "999px",
    background: "#1677FF",
    color: "#FFFFFF",
    fontSize: "8px",
    fontWeight: 900,
  },

  directionSection: {
    padding: "98px max(6vw,44px)",
    display: "grid",
    gridTemplateColumns: "minmax(0,.72fr) minmax(560px,1.28fr)",
    gap: "68px",
    alignItems: "start",
    background:
      "radial-gradient(circle at 85% 16%, rgba(22,119,255,.17), transparent 24%), linear-gradient(135deg, #061422 0%, #0A213B 100%)",
  },

  directionCopy: {
    maxWidth: "650px",
  },

  directionTools: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },

  directionTool: {
    position: "relative",
    minHeight: "300px",
    padding: "28px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(255,255,255,.025)",
    color: "#FFFFFF",
    textDecoration: "none",
  },

  directionNumber: {
    display: "block",
    marginBottom: "44px",
    color: "#1677FF",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "38px",
  },

  directionToolLabel: {
    display: "block",
    marginBottom: "7px",
    color: "#71B4FF",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".11em",
  },

  directionToolTitle: {
    display: "block",
    marginBottom: "11px",
    fontSize: "24px",
    lineHeight: 1.1,
  },

  directionToolCopy: {
    margin: 0,
    color: "#AFC0D3",
    fontSize: "11px",
    lineHeight: 1.6,
  },

  directionArrow: {
    position: "absolute",
    right: "24px",
    bottom: "22px",
    color: "#7BB8FF",
    fontSize: "20px",
  },

  resourcesSection: {
    padding: "88px max(6vw,44px)",
    background: "#F3F6FA",
  },

  resourceIntro: {
    maxWidth: "750px",
    marginBottom: "36px",
  },

  resourceTitle: {
    margin: 0,
    color: "#0C1B2D",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(48px,5vw,76px)",
    lineHeight: .98,
    letterSpacing: "-.045em",
    fontWeight: 400,
  },

  resourceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: "28px",
  },

  resourceLink: {
    position: "relative",
    minHeight: "190px",
    padding: "22px 0",
    borderTop: "1px solid #D3DEE9",
    color: "#0F172A",
    textDecoration: "none",
  },

  resourceLabel: {
    display: "block",
    marginBottom: "8px",
    color: "#1677FF",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".11em",
  },

  resourceName: {
    display: "block",
    marginBottom: "8px",
    fontSize: "21px",
  },

  resourceCopy: {
    margin: 0,
    maxWidth: "560px",
    color: "#69798B",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  resourceArrow: {
    position: "absolute",
    right: 0,
    top: "22px",
    color: "#1677FF",
    fontSize: "20px",
  },

  finalSection: {
    padding: "78px max(6vw,44px)",
    textAlign: "center",
    background: "#FFFFFF",
  },

  finalKicker: {
    margin: 0,
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
    maxWidth: "640px",
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
