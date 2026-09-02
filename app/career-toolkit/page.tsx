"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

type Tool = {
  title: string;
  description: string;
  href: string;
  label?: "Generator" | "Guide" | "Analyzer" | "Resource";
};

type Category = {
  id: string;
  title: string;
  description: string;
  tools: Tool[];
};

const categories: Category[] = [
  {
    id: "resume-application",
    title: "Resume & Application",
    description:
      "Build stronger application materials, understand job postings, and improve how your experience is presented.",
    tools: [
      {
        title: "Resume Generator",
        description:
          "Build, preview, save, and print a professional resume using guided sections.",
        href: "/resume-builder",
        label: "Generator",
      },
      {
        title: "Resume Format Guide",
        description:
          "Compare resume formats and determine which structure may work best for your experience.",
        href: "/career-toolkit/resume-type-helper",
        label: "Guide",
      },
      {
        title: "Cover Letter Generator",
        description:
          "Create a professional cover letter using guided prompts and career-ready wording.",
        href: "/career-toolkit/cover-letter-generator",
        label: "Generator",
      },
      {
        title: "Job Description Analyzer",
        description:
          "Identify important skills, qualifications, keywords, systems, and employer expectations in a job posting.",
        href: "/career-toolkit/job-description-analyzer",
        label: "Analyzer",
      },
      {
        title: "Resume Match Analyzer",
        description:
          "Compare your resume to a job description and identify where your experience aligns or needs strengthening.",
        href: "/career-toolkit/resume-match-analyzer",
        label: "Analyzer",
      },
      {
        title: "New Opportunities Resume Generator",
        description:
          "Build a resume when restarting, reentering, changing direction, or presenting your experience in a new way.",
        href: "/career-toolkit/new-opportunities-resume-generator",
        label: "Generator",
      },
    ],
  },
  {
    id: "interview",
    title: "Interview Preparation",
    description:
      "Practice common and role-specific questions, organize your talking points, and prepare for stronger conversations.",
    tools: [
      {
        title: "Interview Question Generator",
        description:
          "Generate general and industry-focused interview questions for practice.",
        href: "/career-toolkit/interview-question-generator",
        label: "Generator",
      },
      {
        title: "Interview Questions & Preparation",
        description:
          "Review common interview questions, preparation guidance, sample responses, and questions you can ask an employer.",
        href: "/career-toolkit/interview-questions",
        label: "Guide",
      },
    ],
  },
  {
    id: "career-planning",
    title: "Career Planning & Branding",
    description:
      "Clarify your direction, strengthen your professional identity, and turn ideas into practical next steps.",
    tools: [
      {
        title: "Career Path Generator",
        description:
          "Explore possible career paths based on your interests, work preferences, experience, and goals.",
        href: "/career-toolkit/career-path-generator",
        label: "Generator",
      },
      {
        title: "Career Goal Generator",
        description:
          "Turn your career ideas into a clearer goal with practical next steps.",
        href: "/career-toolkit/career-goal-generator",
        label: "Generator",
      },
      {
        title: "Professional Branding Generator",
        description:
          "Strengthen your professional summary, biography, positioning, and career-ready language.",
        href: "/career-toolkit/professional-branding-generator",
        label: "Generator",
      },
      {
        title: "Budget Generator",
        description:
          "Create a simple monthly budget to understand income, expenses, and financial priorities.",
        href: "/career-toolkit/budget-generator",
        label: "Generator",
      },
    ],
  },
  {
    id: "job-search",
    title: "Job Search & Follow-Up",
    description:
      "Stay organized, communicate professionally, and keep applications and follow-up activity moving.",
    tools: [
      {
        title: "Job Log Generator",
        description:
          "Track applications, employers, dates, contacts, interviews, outcomes, and follow-up activity.",
        href: "/career-toolkit/job-log-generator",
        label: "Generator",
      },
      {
        title: "The House of Letters",
        description:
          "Create professional follow-ups, thank-you letters, requests, resignations, and workplace communication.",
        href: "/career-toolkit/employer-follow-up-generator",
        label: "Generator",
      },
      {
        title: "Job Search Tips",
        description:
          "Review practical guidance for applications, job descriptions, employer research, and job-search strategy.",
        href: "/career-toolkit/job-search-tips",
        label: "Guide",
      },
    ],
  },
  {
    id: "skills",
    title: "Skills & Career Development",
    description:
      "Identify transferable strengths and understand the skills employers look for across industries.",
    tools: [
      {
        title: "Soft Skills",
        description:
          "Explore communication, teamwork, adaptability, organization, problem solving, and other transferable strengths.",
        href: "/career-toolkit/soft-skills",
        label: "Guide",
      },
      {
        title: "Industry Core Skills",
        description:
          "Explore important skills used across healthcare, manufacturing, logistics, administration, hospitality, IT, trades, retail, and more.",
        href: "/career-toolkit/industry-core-skills",
        label: "Guide",
      },
    ],
  },
];

const quickStart = [
  {
    eyebrow: "Build",
    title: "Create your resume",
    description: "Start with the Resume Generator and build a polished resume you can edit and print.",
    href: "/resume-builder",
  },
  {
    eyebrow: "Match",
    title: "Check your fit",
    description: "Compare your resume against a job posting before you apply.",
    href: "/career-toolkit/resume-match-analyzer",
  },
  {
    eyebrow: "Prepare",
    title: "Practice for interviews",
    description: "Generate questions and prepare stronger answers before the conversation.",
    href: "/career-toolkit/interview-question-generator",
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

      if (mounted) {
        setCheckingAccess(false);
      }
    }

    void checkAccess();

    return () => {
      mounted = false;
    };
  }, []);

  if (checkingAccess) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.loadingIndicator} />
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        @media (max-width: 980px) {
          .toolkit-hero-grid {
            grid-template-columns: 1fr !important;
          }

          .toolkit-quick-grid {
            grid-template-columns: 1fr !important;
          }

          .toolkit-tools-grid {
            grid-template-columns: 1fr !important;
          }

          .toolkit-category-header {
            grid-template-columns: 1fr !important;
          }

          .toolkit-video-card {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 680px) {
          .toolkit-page {
            padding: 26px 16px 56px !important;
          }

          .toolkit-hero {
            padding: 28px 22px !important;
          }

          .toolkit-hero-title {
            font-size: 38px !important;
          }

          .toolkit-category-nav {
            gap: 7px !important;
          }

          .toolkit-nav-link {
            width: 100% !important;
          }

          .toolkit-section {
            padding: 24px 20px !important;
          }

          .toolkit-tool-card {
            min-height: auto !important;
          }
        }
      `}</style>

      <div className="toolkit-page" style={styles.container}>
        <section className="toolkit-hero toolkit-hero-grid" style={styles.hero}>
          <div style={styles.heroCopy}>
            <div style={styles.eyebrow}>CAREER TOOLKIT</div>

            <h1 className="toolkit-hero-title" style={styles.heroTitle}>
              Tools that help you move your career forward.
            </h1>

            <p style={styles.heroText}>
              Build stronger career materials, prepare for interviews, organize your
              job search, and make clearer career decisions — all from one place.
            </p>

            <div style={styles.heroActions}>
              <a href="#quick-start" style={styles.primaryButton}>
                Start here
              </a>
              <a href="#all-tools" style={styles.secondaryButton}>
                Browse all tools
              </a>
            </div>
          </div>

          <div style={styles.heroPanel}>
            <div style={styles.heroPanelLabel}>YOUR TOOLKIT</div>
            <div style={styles.heroStatRow}>
              <div>
                <strong style={styles.heroStatNumber}>
                  {categories.reduce((sum, category) => sum + category.tools.length, 0)}
                </strong>
                <span style={styles.heroStatLabel}>career tools</span>
              </div>
              <div style={styles.heroStatDivider} />
              <div>
                <strong style={styles.heroStatNumber}>{categories.length}</strong>
                <span style={styles.heroStatLabel}>organized categories</span>
              </div>
            </div>

            <p style={styles.heroPanelText}>
              Not sure where to begin? Use the quick-start options below or jump directly
              to the category that matches what you need right now.
            </p>
          </div>
        </section>

        <nav className="toolkit-category-nav" style={styles.categoryNav} aria-label="Career Toolkit categories">
          {categories.map((category) => (
            <a
              key={category.id}
              className="toolkit-nav-link"
              href={`#${category.id}`}
              style={styles.categoryNavLink}
            >
              {category.title}
            </a>
          ))}
        </nav>

        <section id="quick-start" style={styles.quickStartSection}>
          <div style={styles.sectionHeadingRow}>
            <div>
              <div style={styles.sectionEyebrow}>QUICK START</div>
              <h2 style={styles.sectionTitle}>What do you want to work on?</h2>
            </div>
            <p style={styles.sectionIntro}>
              Choose the closest match. You can always return here and use another tool.
            </p>
          </div>

          <div className="toolkit-quick-grid" style={styles.quickGrid}>
            {quickStart.map((item, index) => (
              <a key={item.title} href={item.href} style={styles.quickCard}>
                <div style={styles.quickNumber}>{String(index + 1).padStart(2, "0")}</div>
                <div style={styles.quickEyebrow}>{item.eyebrow}</div>
                <h3 style={styles.quickTitle}>{item.title}</h3>
                <p style={styles.quickDescription}>{item.description}</p>
                <span style={styles.cardAction}>Open tool →</span>
              </a>
            ))}
          </div>
        </section>

        <a
          href="/career-toolkit/community-feed"
          className="toolkit-video-card"
          style={styles.videoFeature}
        >
          <div style={styles.videoIcon}>▶</div>

          <div>
            <div style={styles.featuredLabel}>FEATURED RESOURCE</div>
            <h2 style={styles.videoTitle}>Career Video Library</h2>
            <p style={styles.videoDescription}>
              Watch short career-development videos covering resumes, interviews,
              applications, professional communication, job-search strategy, and practical
              career guidance.
            </p>
          </div>

          <span style={styles.videoAction}>Watch videos →</span>
        </a>

        <section id="all-tools" style={styles.allToolsIntro}>
          <div style={styles.sectionEyebrow}>ALL CAREER TOOLS</div>
          <h2 style={styles.allToolsTitle}>Browse by what you need.</h2>
          <p style={styles.allToolsText}>
            Everything is grouped by purpose so you can scan the page, understand what each
            tool does, and choose without opening and closing multiple sections.
          </p>
        </section>

        <div style={styles.sectionsWrap}>
          {categories.map((category, index) => (
            <section
              key={category.id}
              id={category.id}
              className="toolkit-section"
              style={styles.categorySection}
            >
              <div className="toolkit-category-header" style={styles.categoryHeader}>
                <div>
                  <div style={styles.categoryNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h2 style={styles.categoryTitle}>{category.title}</h2>
                </div>

                <p style={styles.categoryDescription}>{category.description}</p>
              </div>

              <div className="toolkit-tools-grid" style={styles.toolsGrid}>
                {category.tools.map((tool) => (
                  <ToolCard key={tool.title} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <a href={tool.href} className="toolkit-tool-card" style={styles.toolCard}>
      <div style={styles.toolCardTop}>
        <div style={styles.toolIcon}>{getToolInitials(tool.title)}</div>

        {tool.label ? <span style={styles.toolLabel}>{tool.label}</span> : null}
      </div>

      <div>
        <h3 style={styles.toolTitle}>{tool.title}</h3>
        <p style={styles.toolDescription}>{tool.description}</p>
      </div>

      <div style={styles.toolFooter}>
        <span>Open tool</span>
        <span style={styles.toolArrow}>→</span>
      </div>
    </a>
  );
}

function getToolInitials(title: string) {
  const ignored = new Set(["the", "of", "and", "&"]);

  const words = title
    .split(" ")
    .filter((word) => word && !ignored.has(word.toLowerCase()));

  return (
    words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "HM"
  );
}

const styles: Record<string, CSSProperties> = {
  loadingPage: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f8fafc",
  },

  loadingIndicator: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "3px solid #dbeafe",
    borderTopColor: "#1677FF",
  },

  page: {
    minHeight: "100vh",
    background: "#f7f9fc",
    color: "#0f172a",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  container: {
    width: "100%",
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "38px 22px 72px",
  },

  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.55fr) minmax(300px, 0.75fr)",
    gap: "34px",
    alignItems: "stretch",
    padding: "44px 42px",
    borderRadius: "24px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 18px 48px rgba(15,23,42,0.06)",
  },

  heroCopy: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  eyebrow: {
    marginBottom: "16px",
    color: "#1677FF",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.16em",
  },

  heroTitle: {
    margin: "0 0 18px",
    maxWidth: "780px",
    fontSize: "clamp(42px, 5vw, 64px)",
    lineHeight: 0.98,
    letterSpacing: "-0.055em",
    fontWeight: 800,
    color: "#0f172a",
  },

  heroText: {
    margin: 0,
    maxWidth: "760px",
    color: "#536174",
    fontSize: "16px",
    lineHeight: 1.7,
  },

  heroActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "26px",
  },

  primaryButton: {
    minHeight: "44px",
    padding: "0 18px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    background: "#1677FF",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 800,
  },

  secondaryButton: {
    minHeight: "44px",
    padding: "0 18px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#1e293b",
    border: "1px solid #cbd5e1",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 800,
  },

  heroPanel: {
    borderRadius: "18px",
    border: "1px solid #dbeafe",
    background: "#f8fbff",
    padding: "26px",
  },

  heroPanelLabel: {
    color: "#1677FF",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.14em",
    marginBottom: "18px",
  },

  heroStatRow: {
    display: "flex",
    alignItems: "center",
    gap: "22px",
  },

  heroStatNumber: {
    display: "block",
    color: "#0f172a",
    fontSize: "32px",
    lineHeight: 1,
    letterSpacing: "-0.04em",
  },

  heroStatLabel: {
    display: "block",
    marginTop: "6px",
    color: "#64748b",
    fontSize: "11px",
  },

  heroStatDivider: {
    width: "1px",
    height: "44px",
    background: "#dbe3ee",
  },

  heroPanelText: {
    margin: "22px 0 0",
    paddingTop: "18px",
    borderTop: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.65,
  },

  categoryNav: {
    display: "flex",
    flexWrap: "wrap",
    gap: "9px",
    margin: "18px 0 38px",
    padding: "12px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
  },

  categoryNavLink: {
    padding: "10px 13px",
    borderRadius: "9px",
    color: "#334155",
    background: "#f8fafc",
    border: "1px solid #edf2f7",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 700,
  },

  quickStartSection: {
    marginBottom: "28px",
  },

  sectionHeadingRow: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "22px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },

  sectionEyebrow: {
    marginBottom: "7px",
    color: "#1677FF",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.14em",
  },

  sectionTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "30px",
    lineHeight: 1.1,
    letterSpacing: "-0.04em",
    fontWeight: 800,
  },

  sectionIntro: {
    margin: 0,
    maxWidth: "520px",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },

  quickCard: {
    position: "relative",
    minHeight: "190px",
    padding: "22px",
    borderRadius: "16px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    textDecoration: "none",
    color: "inherit",
    boxShadow: "0 10px 28px rgba(15,23,42,0.035)",
  },

  quickNumber: {
    position: "absolute",
    right: "18px",
    top: "16px",
    color: "#cbd5e1",
    fontSize: "25px",
    fontWeight: 800,
    letterSpacing: "-0.03em",
  },

  quickEyebrow: {
    marginBottom: "12px",
    color: "#1677FF",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },

  quickTitle: {
    margin: "0 0 9px",
    color: "#0f172a",
    fontSize: "20px",
    letterSpacing: "-0.025em",
    fontWeight: 800,
  },

  quickDescription: {
    margin: 0,
    maxWidth: "330px",
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  cardAction: {
    display: "inline-block",
    marginTop: "18px",
    color: "#1677FF",
    fontSize: "12px",
    fontWeight: 800,
  },

  videoFeature: {
    display: "grid",
    gridTemplateColumns: "56px minmax(0, 1fr) auto",
    gap: "20px",
    alignItems: "center",
    margin: "0 0 38px",
    padding: "24px 26px",
    borderRadius: "18px",
    background: "#eef6ff",
    border: "1px solid #cfe3ff",
    textDecoration: "none",
    color: "inherit",
  },

  videoIcon: {
    width: "52px",
    height: "52px",
    display: "grid",
    placeItems: "center",
    borderRadius: "13px",
    background: "#1677FF",
    color: "#ffffff",
    fontSize: "17px",
  },

  featuredLabel: {
    marginBottom: "5px",
    color: "#1677FF",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: "0.12em",
  },

  videoTitle: {
    margin: "0 0 6px",
    color: "#0f172a",
    fontSize: "23px",
    letterSpacing: "-0.03em",
    fontWeight: 800,
  },

  videoDescription: {
    margin: 0,
    maxWidth: "800px",
    color: "#526176",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  videoAction: {
    color: "#1677FF",
    fontSize: "12px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  allToolsIntro: {
    marginBottom: "18px",
  },

  allToolsTitle: {
    margin: "0 0 9px",
    color: "#0f172a",
    fontSize: "34px",
    lineHeight: 1.08,
    letterSpacing: "-0.045em",
    fontWeight: 800,
  },

  allToolsText: {
    margin: 0,
    maxWidth: "760px",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.7,
  },

  sectionsWrap: {
    display: "grid",
    gap: "18px",
  },

  categorySection: {
    scrollMarginTop: "18px",
    padding: "30px",
    borderRadius: "20px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 12px 34px rgba(15,23,42,0.04)",
  },

  categoryHeader: {
    display: "grid",
    gridTemplateColumns: "minmax(240px, 0.75fr) minmax(0, 1.25fr)",
    gap: "28px",
    alignItems: "end",
    paddingBottom: "22px",
    marginBottom: "18px",
    borderBottom: "1px solid #e8edf3",
  },

  categoryNumber: {
    marginBottom: "8px",
    color: "#1677FF",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.12em",
  },

  categoryTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "25px",
    lineHeight: 1.15,
    letterSpacing: "-0.035em",
    fontWeight: 800,
  },

  categoryDescription: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.65,
  },

  toolsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },

  toolCard: {
    minHeight: "176px",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    background: "#fbfcfe",
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  toolCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "17px",
  },

  toolIcon: {
    width: "40px",
    height: "40px",
    display: "grid",
    placeItems: "center",
    borderRadius: "10px",
    background: "#eaf3ff",
    border: "1px solid #d2e5ff",
    color: "#1677FF",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.04em",
  },

  toolLabel: {
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#ffffff",
    border: "1px solid #d9e2ec",
    color: "#64748b",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
  },

  toolTitle: {
    margin: "0 0 7px",
    color: "#0f172a",
    fontSize: "17px",
    lineHeight: 1.25,
    letterSpacing: "-0.025em",
    fontWeight: 800,
  },

  toolDescription: {
    margin: 0,
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  toolFooter: {
    marginTop: "18px",
    paddingTop: "13px",
    borderTop: "1px solid #e8edf3",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#1677FF",
    fontSize: "11px",
    fontWeight: 800,
  },

  toolArrow: {
    fontSize: "16px",
  },
};
