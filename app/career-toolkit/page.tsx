"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

type Tool = {
  title: string;
  description: string;
  href: string;
  label?: "Generator" | "Guide" | "Analyzer" | "Resource";
  accent?: "blue" | "navy" | "slate";
};

type Category = {
  title: string;
  description: string;
  tools: Tool[];
};

const categories: Category[] = [
  {
    title: "Resume & Application Tools",
    description:
      "Build stronger career materials, understand job postings, and make your application more competitive.",
    tools: [
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
        accent: "slate",
      },
    ],
  },
  {
    title: "Interview Preparation Tools",
    description:
      "Practice stronger answers, organize your talking points, and prepare for the conversation before the interview begins.",
    tools: [
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
    ],
  },
  {
    title: "Career Planning & Branding Tools",
    description:
      "Clarify your direction, strengthen your professional identity, and turn career ideas into practical next steps.",
    tools: [
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
        accent: "slate",
      },
    ],
  },
  {
    title: "Job Search & Follow-Up Tools",
    description:
      "Organize your job search, communicate professionally, and stay on top of applications and follow-up activity.",
    tools: [
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
        accent: "slate",
      },
    ],
  },
  {
    title: "Skills & Career Development Guides",
    description:
      "Identify transferable strengths and understand the skills employers look for across industries.",
    tools: [
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
    ],
  },
];

const quickLinks = [
  {
    title: "Build your resume",
    text: "Create a polished resume and see it update live while you work.",
    href: "/resume-builder",
  },
  {
    title: "Match to a job",
    text: "Compare your resume against a real job description before applying.",
    href: "/career-toolkit/resume-match-analyzer",
  },
  {
    title: "Prepare for an interview",
    text: "Generate interview questions and practice before the conversation.",
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
        <div style={styles.loadingRing} />
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <style>{`
        html { scroll-behavior: smooth; }

        .hm-tool-card,
        .hm-quick-card,
        .hm-video-card {
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }

        .hm-tool-card:hover,
        .hm-quick-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 34px rgba(15, 23, 42, .08);
          border-color: rgba(22,119,255,.28) !important;
        }

        .hm-video-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 42px rgba(7, 31, 75, .14);
        }

        @media (max-width: 1020px) {
          .hm-hero-grid,
          .hm-quick-grid,
          .hm-category-grid,
          .hm-video-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 720px) {
          .hm-page-wrap {
            padding: 24px 16px 56px !important;
          }

          .hm-hero {
            padding: 30px 24px !important;
          }

          .hm-hero-title {
            font-size: 39px !important;
          }

          .hm-category-panel {
            padding: 24px 18px !important;
          }

          .hm-tool-card {
            min-height: auto !important;
          }
        }
      `}</style>

      <div className="hm-page-wrap" style={styles.container}>
        <section className="hm-hero hm-hero-grid" style={styles.hero}>
          <div style={styles.heroMain}>
            <div style={styles.brandStrip}>
              <span style={styles.brandDot} />
              <span>HIREMINDS CAREER TOOLKIT</span>
            </div>

            <h1 className="hm-hero-title" style={styles.heroTitle}>
              Build it. Strengthen it. Move forward.
            </h1>

            <p style={styles.heroText}>
              A practical collection of career tools designed to help you create stronger
              materials, prepare with intention, and manage your next move with more clarity.
            </p>

            <div style={styles.heroButtons}>
              <a href="#career-tools" style={styles.primaryButton}>
                Explore the Toolkit
              </a>
              <a href="/resume-builder" style={styles.secondaryButton}>
                Open Resume Generator
              </a>
            </div>
          </div>

          <div style={styles.heroSide}>
            <div style={styles.heroSideGlow} />
            <div style={styles.heroSideContent}>
              <div style={styles.heroSideKicker}>ONE PLACE. MULTIPLE CAREER MOVES.</div>
              <div style={styles.heroSideLine} />
              <p style={styles.heroSideText}>
                Resume building, job matching, interview preparation, career planning,
                application tracking, professional communication, and skill development.
              </p>
            </div>
          </div>
        </section>

        <section style={styles.quickSection}>
          <div style={styles.sectionTop}>
            <div>
              <div style={styles.sectionKicker}>START WITH WHAT YOU NEED</div>
              <h2 style={styles.sectionTitle}>Choose your next move.</h2>
            </div>

            <p style={styles.sectionLead}>
              You do not need to use everything at once. Start with the task in front of you.
            </p>
          </div>

          <div className="hm-quick-grid" style={styles.quickGrid}>
            {quickLinks.map((item) => (
              <a key={item.title} href={item.href} className="hm-quick-card" style={styles.quickCard}>
                <div style={styles.quickAccent} />
                <h3 style={styles.quickTitle}>{item.title}</h3>
                <p style={styles.quickText}>{item.text}</p>
                <span style={styles.quickAction}>Go to tool →</span>
              </a>
            ))}
          </div>
        </section>

        <a
          href="/career-toolkit/community-feed"
          className="hm-video-card hm-video-grid"
          style={styles.videoCard}
        >
          <div style={styles.videoIconWrap}>
            <div style={styles.videoIcon}>▶</div>
          </div>

          <div>
            <div style={styles.videoKicker}>FEATURED RESOURCE</div>
            <h2 style={styles.videoTitle}>Career Video Library</h2>
            <p style={styles.videoText}>
              Short, practical videos covering resumes, interviews, applications,
              professional communication, job-search strategy, and career development.
            </p>
          </div>

          <div style={styles.videoButton}>Watch Career Videos →</div>
        </a>

        <section id="career-tools" style={styles.toolsIntro}>
          <div style={styles.sectionKicker}>CAREER TOOLS</div>
          <h2 style={styles.toolsIntroTitle}>Everything organized by purpose.</h2>
          <p style={styles.toolsIntroText}>
            Each section groups related tools together so the page is easier to scan and you
            can quickly understand what to use and why.
          </p>
        </section>

        <div style={styles.categoryStack}>
          {categories.map((category) => (
            <section key={category.title} className="hm-category-panel" style={styles.categoryPanel}>
              <div style={styles.categoryHeader}>
                <div style={styles.categoryHeadingBlock}>
                  <span style={styles.categoryAccentBar} />
                  <div>
                    <h2 style={styles.categoryTitle}>{category.title}</h2>
                    <p style={styles.categoryDescription}>{category.description}</p>
                  </div>
                </div>
              </div>

              <div className="hm-category-grid" style={styles.toolsGrid}>
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
  const accent = getAccent(tool.accent);

  return (
    <a
      href={tool.href}
      className="hm-tool-card"
      style={{
        ...styles.toolCard,
        borderTopColor: accent.border,
      }}
    >
      <div style={styles.toolTop}>
        <div
          style={{
            ...styles.toolMark,
            background: accent.soft,
            color: accent.text,
          }}
        >
          {getToolInitials(tool.title)}
        </div>

        {tool.label ? (
          <span
            style={{
              ...styles.toolLabel,
              color: accent.text,
              background: accent.soft,
              borderColor: accent.border,
            }}
          >
            {tool.label}
          </span>
        ) : null}
      </div>

      <div>
        <h3 style={styles.toolTitle}>{tool.title}</h3>
        <p style={styles.toolDescription}>{tool.description}</p>
      </div>

      <div style={styles.toolFooter}>
        <span>Open tool</span>
        <span>→</span>
      </div>
    </a>
  );
}

function getToolInitials(title: string) {
  const ignored = new Set(["the", "of", "and", "&"]);

  return (
    title
      .split(" ")
      .filter((word) => word && !ignored.has(word.toLowerCase()))
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "HM"
  );
}

function getAccent(accent: Tool["accent"] = "blue") {
  const accents = {
    blue: {
      text: "#1677FF",
      soft: "#EAF3FF",
      border: "#BFD9FF",
    },
    navy: {
      text: "#173A63",
      soft: "#EDF2F7",
      border: "#CBD8E6",
    },
    slate: {
      text: "#475569",
      soft: "#F1F5F9",
      border: "#D9E2EC",
    },
  };

  return accents[accent];
}

const styles: Record<string, CSSProperties> = {
  loadingPage: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background:
      "radial-gradient(circle at 15% 10%, rgba(22,119,255,.08), transparent 32%), #F3F6FA",
  },

  loadingRing: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "3px solid #D9E6F5",
    borderTopColor: "#1677FF",
  },

  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 9% 0%, rgba(22,119,255,.09), transparent 26%), radial-gradient(circle at 96% 18%, rgba(8,31,67,.055), transparent 24%), linear-gradient(180deg, #F4F7FB 0%, #EEF3F8 100%)",
    color: "#0F172A",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  container: {
    width: "100%",
    maxWidth: "1260px",
    margin: "0 auto",
    padding: "38px 22px 78px",
  },

  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.5fr) minmax(320px, .75fr)",
    overflow: "hidden",
    borderRadius: "26px",
    background: "#FFFFFF",
    border: "1px solid #DCE5EF",
    boxShadow: "0 24px 60px rgba(15,23,42,.07)",
    marginBottom: "28px",
  },

  heroMain: {
    padding: "48px 46px",
  },

  brandStrip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "9px",
    marginBottom: "20px",
    color: "#1677FF",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".15em",
  },

  brandDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#1677FF",
    boxShadow: "0 0 0 6px rgba(22,119,255,.08)",
  },

  heroTitle: {
    margin: "0 0 18px",
    maxWidth: "760px",
    color: "#0A1830",
    fontSize: "clamp(44px, 5.3vw, 68px)",
    lineHeight: .98,
    letterSpacing: "-.058em",
    fontWeight: 850,
  },

  heroText: {
    margin: 0,
    maxWidth: "760px",
    color: "#56657A",
    fontSize: "16px",
    lineHeight: 1.72,
  },

  heroButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "28px",
  },

  primaryButton: {
    minHeight: "46px",
    padding: "0 19px",
    borderRadius: "10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1677FF",
    color: "#FFFFFF",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 800,
    boxShadow: "0 8px 20px rgba(22,119,255,.18)",
  },

  secondaryButton: {
    minHeight: "46px",
    padding: "0 19px",
    borderRadius: "10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#FFFFFF",
    color: "#173A63",
    border: "1px solid #CBD8E6",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 800,
  },

  heroSide: {
    position: "relative",
    overflow: "hidden",
    minHeight: "100%",
    background:
      "linear-gradient(145deg, #0A1B32 0%, #0D2C53 52%, #1677FF 140%)",
    padding: "34px",
    display: "flex",
    alignItems: "flex-end",
  },

  heroSideGlow: {
    position: "absolute",
    width: "320px",
    height: "320px",
    right: "-110px",
    top: "-120px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(75,154,255,.5), rgba(22,119,255,.10) 42%, transparent 72%)",
  },

  heroSideContent: {
    position: "relative",
    zIndex: 1,
  },

  heroSideKicker: {
    color: "#9CC7FF",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".14em",
    lineHeight: 1.5,
  },

  heroSideLine: {
    width: "54px",
    height: "2px",
    margin: "16px 0",
    background: "#4EA2FF",
  },

  heroSideText: {
    margin: 0,
    color: "#E6EEF8",
    fontSize: "13px",
    lineHeight: 1.72,
  },

  quickSection: {
    marginBottom: "26px",
  },

  sectionTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "22px",
    flexWrap: "wrap",
    marginBottom: "15px",
  },

  sectionKicker: {
    marginBottom: "6px",
    color: "#1677FF",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".14em",
  },

  sectionTitle: {
    margin: 0,
    color: "#0A1830",
    fontSize: "29px",
    lineHeight: 1.12,
    letterSpacing: "-.035em",
    fontWeight: 820,
  },

  sectionLead: {
    margin: 0,
    maxWidth: "500px",
    color: "#6A778A",
    fontSize: "13px",
    lineHeight: 1.62,
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
    gap: "14px",
  },

  quickCard: {
    position: "relative",
    minHeight: "175px",
    overflow: "hidden",
    padding: "23px",
    borderRadius: "17px",
    background: "rgba(255,255,255,.88)",
    border: "1px solid #DDE6F0",
    boxShadow: "0 10px 26px rgba(15,23,42,.04)",
    textDecoration: "none",
    color: "inherit",
  },

  quickAccent: {
    position: "absolute",
    width: "56px",
    height: "3px",
    left: "23px",
    top: 0,
    background: "#1677FF",
    borderRadius: "0 0 3px 3px",
  },

  quickTitle: {
    margin: "8px 0 8px",
    color: "#0F1E33",
    fontSize: "19px",
    letterSpacing: "-.025em",
    fontWeight: 820,
  },

  quickText: {
    margin: 0,
    color: "#68778A",
    fontSize: "12px",
    lineHeight: 1.62,
    maxWidth: "330px",
  },

  quickAction: {
    display: "inline-block",
    marginTop: "18px",
    color: "#1677FF",
    fontSize: "12px",
    fontWeight: 800,
  },

  videoCard: {
    display: "grid",
    gridTemplateColumns: "60px minmax(0,1fr) auto",
    alignItems: "center",
    gap: "20px",
    marginBottom: "34px",
    padding: "25px 27px",
    borderRadius: "19px",
    textDecoration: "none",
    color: "inherit",
    background:
      "linear-gradient(115deg, #F8FBFF 0%, #EFF6FF 58%, #E8F2FF 100%)",
    border: "1px solid #CFE0F5",
    boxShadow: "0 12px 30px rgba(19,58,99,.06)",
  },

  videoIconWrap: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background:
      "linear-gradient(145deg, #0D2C53 0%, #1677FF 100%)",
    padding: "1px",
    boxShadow: "0 10px 22px rgba(22,119,255,.16)",
  },

  videoIcon: {
    width: "100%",
    height: "100%",
    borderRadius: "15px",
    display: "grid",
    placeItems: "center",
    color: "#FFFFFF",
    fontSize: "17px",
  },

  videoKicker: {
    marginBottom: "5px",
    color: "#1677FF",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".13em",
  },

  videoTitle: {
    margin: "0 0 6px",
    color: "#0C1C31",
    fontSize: "23px",
    letterSpacing: "-.03em",
    fontWeight: 820,
  },

  videoText: {
    margin: 0,
    maxWidth: "820px",
    color: "#5D6D81",
    fontSize: "12px",
    lineHeight: 1.62,
  },

  videoButton: {
    color: "#1677FF",
    fontSize: "12px",
    fontWeight: 850,
    whiteSpace: "nowrap",
  },

  toolsIntro: {
    marginBottom: "16px",
  },

  toolsIntroTitle: {
    margin: "0 0 8px",
    color: "#0A1830",
    fontSize: "34px",
    lineHeight: 1.08,
    letterSpacing: "-.045em",
    fontWeight: 830,
  },

  toolsIntroText: {
    margin: 0,
    maxWidth: "760px",
    color: "#68778A",
    fontSize: "13px",
    lineHeight: 1.68,
  },

  categoryStack: {
    display: "grid",
    gap: "18px",
  },

  categoryPanel: {
    position: "relative",
    overflow: "hidden",
    padding: "28px",
    borderRadius: "21px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,.96) 0%, rgba(249,251,253,.96) 100%)",
    border: "1px solid #DDE6F0",
    boxShadow: "0 14px 34px rgba(15,23,42,.045)",
  },

  categoryHeader: {
    paddingBottom: "20px",
    marginBottom: "18px",
    borderBottom: "1px solid #E5EBF2",
  },

  categoryHeadingBlock: {
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
  },

  categoryAccentBar: {
    flexShrink: 0,
    width: "4px",
    height: "46px",
    borderRadius: "999px",
    background:
      "linear-gradient(180deg, #1677FF 0%, #72B4FF 100%)",
    boxShadow: "0 0 18px rgba(22,119,255,.15)",
  },

  categoryTitle: {
    margin: "0 0 6px",
    color: "#0B1A2E",
    fontSize: "24px",
    lineHeight: 1.15,
    letterSpacing: "-.032em",
    fontWeight: 820,
  },

  categoryDescription: {
    margin: 0,
    maxWidth: "850px",
    color: "#657488",
    fontSize: "13px",
    lineHeight: 1.62,
  },

  toolsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: "12px",
  },

  toolCard: {
    minHeight: "170px",
    padding: "19px",
    borderRadius: "15px",
    border: "1px solid #E0E7EF",
    borderTop: "3px solid",
    background:
      "linear-gradient(180deg, #FFFFFF 0%, #FBFCFE 100%)",
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  toolTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "15px",
  },

  toolMark: {
    width: "40px",
    height: "40px",
    borderRadius: "11px",
    display: "grid",
    placeItems: "center",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".03em",
  },

  toolLabel: {
    padding: "5px 8px",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".075em",
    textTransform: "uppercase",
  },

  toolTitle: {
    margin: "0 0 7px",
    color: "#102038",
    fontSize: "17px",
    lineHeight: 1.25,
    letterSpacing: "-.024em",
    fontWeight: 810,
  },

  toolDescription: {
    margin: 0,
    color: "#69788C",
    fontSize: "12px",
    lineHeight: 1.58,
  },

  toolFooter: {
    marginTop: "16px",
    paddingTop: "12px",
    borderTop: "1px solid #E7EDF3",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#1677FF",
    fontSize: "11px",
    fontWeight: 800,
  },
};
