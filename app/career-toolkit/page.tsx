"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type Tool = {
  title: string;
  description: string;
  href: string;
  label?: "Generator" | "Guide" | "Analyzer" | "Resource";
};

type Category = {
  title: string;
  description: string;
  tools: Tool[];
};

/* =========================================================
   TOOL CATEGORIES
========================================================= */

const categories: Category[] = [
  {
    title: "Resume & Application Tools",
    description:
      "Create resumes and cover letters, analyze job descriptions, and strengthen your applications.",
    tools: [
      {
        title: "Resume Generator",
        description:
          "Build, preview, save, and print a professional resume.",
        href: "/resume-builder",
        label: "Generator",
      },
      {
        title: "Resume Format Guide",
        description:
          "Learn which resume format may work best for your experience and career goals.",
        href: "/career-toolkit/resume-type-helper",
        label: "Guide",
      },
      {
        title: "Cover Letter Generator",
        description:
          "Create a professional cover letter using guided prompts.",
        href: "/career-toolkit/cover-letter-generator",
        label: "Generator",
      },
      {
        title: "Job Description Analyzer",
        description:
          "Identify important skills, qualifications, keywords, and employer expectations in a job posting.",
        href: "/career-toolkit/job-description-analyzer",
        label: "Analyzer",
      },
      {
        title: "Resume Match Analyzer",
        description:
          "Compare your resume with a job description and identify opportunities to improve alignment.",
        href: "/career-toolkit/resume-match-analyzer",
        label: "Analyzer",
      },
      {
        title: "New Opportunities Resume Generator",
        description:
          "Build a resume when restarting, reentering, changing direction, or presenting experience in a new way.",
        href: "/career-toolkit/new-opportunities-resume-generator",
        label: "Generator",
      },
    ],
  },

  {
    title: "Interview Preparation Tools",
    description:
      "Practice interview questions, prepare stronger answers, and get ready for the conversation.",
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
          "Review common questions, sample responses, preparation guidance, and questions to ask an employer.",
        href: "/career-toolkit/interview-questions",
        label: "Guide",
      },
    ],
  },

  {
    title: "Career Planning & Branding Tools",
    description:
      "Explore career options, establish goals, strengthen your professional identity, and plan your next steps.",
    tools: [
      {
        title: "Career Path Generator",
        description:
          "Explore possible career paths based on your interests, preferences, and goals.",
        href: "/career-toolkit/career-path-generator",
        label: "Generator",
      },
      {
        title: "Career Goal Generator",
        description:
          "Turn your career ideas into a clearer goal and actionable next steps.",
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
    title: "Job Search & Follow-Up Tools",
    description:
      "Organize your job search, track applications, communicate professionally, and follow up.",
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
    title: "Skills & Career Development Guides",
    description:
      "Identify transferable strengths and understand the skills employers look for across industries.",
    tools: [
      {
        title: "Soft Skills",
        description:
          "Explore communication, teamwork, adaptability, organization, problem solving, and other transferable skills.",
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

  {
    title: "Career Videos & Learning Resources",
    description:
      "Watch short career-development videos and explore practical learning resources.",
    tools: [
      {
        title: "Vid Feed Library",
        description:
          "Watch career-development videos covering resumes, interviews, applications, job searching, and professional communication.",
        href: "/career-toolkit/community-feed",
        label: "Resource",
      },
    ],
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function CareerToolkitPage() {
  const [checkingAccess, setCheckingAccess] = useState(true);

  // null = everything closed when the page first loads
  const [openCategory, setOpenCategory] = useState<number | null>(null);

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

    checkAccess();

    return () => {
      mounted = false;
    };
  }, []);

  function toggleCategory(index: number) {
    setOpenCategory((current) => (current === index ? null : index));
  }

  if (checkingAccess) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.loadingDot} />
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />

      <div style={styles.container}>
        {/* =================================================
            HEADER
        ================================================= */}

        <section style={styles.hero}>
          <div style={styles.heroBadge}>Career ToolKit</div>

          <h1 style={styles.heroTitle}>
            What would you like to work on?
          </h1>

          <p style={styles.heroDescription}>
            Select a category to find the right generator, guide,
            analyzer, or career resource.
          </p>
        </section>

        {/* =================================================
            ACCORDION
        ================================================= */}

        <section style={styles.accordion}>
          {categories.map((category, index) => {
            const isOpen = openCategory === index;

            return (
              <div
                key={category.title}
                style={{
                  ...styles.category,
                  ...(isOpen ? styles.categoryOpen : {}),
                }}
              >
                {/* CATEGORY HEADER */}

                <button
                  type="button"
                  onClick={() => toggleCategory(index)}
                  aria-expanded={isOpen}
                  style={styles.categoryButton}
                >
                  <div style={styles.categoryText}>
                    <div style={styles.categoryTitleRow}>
                      <h2 style={styles.categoryTitle}>
                        {category.title}
                      </h2>

                      <span style={styles.toolCount}>
                        {category.tools.length}{" "}
                        {category.tools.length === 1 ? "tool" : "tools"}
                      </span>
                    </div>

                    <p style={styles.categoryDescription}>
                      {category.description}
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.chevron,
                      transform: isOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    ↓
                  </span>
                </button>

                {/* OPEN CATEGORY */}

                {isOpen && (
                  <div style={styles.toolList}>
                    {category.tools.map((tool) => (
                      <a
                        key={tool.title}
                        href={tool.href}
                        style={styles.toolRow}
                      >
                        <div style={styles.toolMain}>
                          <div style={styles.toolHeading}>
                            <h3 style={styles.toolTitle}>
                              {tool.title}
                            </h3>

                            {tool.label && (
                              <span style={styles.toolLabel}>
                                {tool.label}
                              </span>
                            )}
                          </div>

                          <p style={styles.toolDescription}>
                            {tool.description}
                          </p>
                        </div>

                        <span style={styles.toolArrow}>→</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* =================================================
            FOOTER MESSAGE
        ================================================= */}

        <section style={styles.helpPanel}>
          <div>
            <p style={styles.helpEyebrow}>Not sure where to start?</p>

            <h2 style={styles.helpTitle}>
              Choose the area that matches what you need today.
            </h2>

            <p style={styles.helpText}>
              You do not need to complete every tool. Open a category,
              choose the resource that fits your goal, and come back
              whenever you are ready for the next step.
            </p>
          </div>

          <a href="/profile" style={styles.profileLink}>
            Career Passport
            <span>→</span>
          </a>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles: Record<string, CSSProperties> = {
  loadingPage: {
    minHeight: "100vh",
    background: "#06080d",
    display: "grid",
    placeItems: "center",
  },

  loadingDot: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(23,232,255,.55), rgba(23,232,255,0))",
  },

  page: {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
    padding: "42px 20px 80px",
    background:
      "linear-gradient(180deg, #05070b 0%, #080a10 48%, #06080d 100%)",
    color: "#f6f7fb",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  glowOne: {
    position: "absolute",
    width: "700px",
    height: "700px",
    left: "-300px",
    top: "-300px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(23,232,255,.09), transparent 67%)",
    pointerEvents: "none",
  },

  glowTwo: {
    position: "absolute",
    width: "700px",
    height: "700px",
    right: "-350px",
    top: "100px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(126,106,255,.09), transparent 67%)",
    pointerEvents: "none",
  },

  container: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "1120px",
    margin: "0 auto",
  },

  /* HERO */

  hero: {
    marginBottom: "34px",
    padding: "6px 4px",
  },

  heroBadge: {
    display: "inline-flex",
    marginBottom: "15px",
    padding: "7px 11px",
    borderRadius: "999px",
    border: "1px solid rgba(23,232,255,.18)",
    background: "rgba(23,232,255,.055)",
    color: "#a9f8ff",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".15em",
    textTransform: "uppercase",
  },

  heroTitle: {
    margin: "0 0 12px",
    color: "#ffffff",
    fontSize: "clamp(34px, 5vw, 54px)",
    lineHeight: 1,
    letterSpacing: "-.05em",
    fontWeight: 850,
  },

  heroDescription: {
    margin: 0,
    maxWidth: "690px",
    color: "#a7aebb",
    fontSize: "15px",
    lineHeight: 1.7,
  },

  /* ACCORDION */

  accordion: {
    display: "grid",
    gap: "12px",
  },

  category: {
    overflow: "hidden",
    borderRadius: "22px",
    border: "1px solid rgba(255,255,255,.07)",
    background:
      "linear-gradient(145deg, rgba(15,18,25,.94), rgba(8,10,15,.98))",
    boxShadow: "0 18px 55px rgba(0,0,0,.22)",
  },

  categoryOpen: {
    border: "1px solid rgba(23,232,255,.16)",
  },

  categoryButton: {
    width: "100%",
    border: "none",
    outline: "none",
    cursor: "pointer",
    background: "transparent",
    color: "inherit",
    padding: "23px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    textAlign: "left",
    fontFamily: "inherit",
  },

  categoryText: {
    flex: 1,
    minWidth: 0,
  },

  categoryTitleRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "7px",
  },

  categoryTitle: {
    margin: 0,
    color: "#f4f6fa",
    fontSize: "19px",
    lineHeight: 1.2,
    letterSpacing: "-.025em",
    fontWeight: 820,
  },

  toolCount: {
    padding: "5px 8px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,.065)",
    background: "rgba(255,255,255,.025)",
    color: "#838b98",
    fontSize: "9px",
    fontWeight: 850,
    textTransform: "uppercase",
    letterSpacing: ".06em",
  },

  categoryDescription: {
    margin: 0,
    maxWidth: "780px",
    color: "#8f97a4",
    fontSize: "13px",
    lineHeight: 1.55,
  },

  chevron: {
    flexShrink: 0,
    width: "34px",
    height: "34px",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    border: "1px solid rgba(23,232,255,.15)",
    background: "rgba(23,232,255,.045)",
    color: "#9df6ff",
    fontSize: "17px",
    transition: "transform .2s ease",
  },

  /* TOOL LIST */

  toolList: {
    borderTop: "1px solid rgba(255,255,255,.055)",
    padding: "8px",
    display: "grid",
    gap: "6px",
  },

  toolRow: {
    width: "100%",
    minHeight: "86px",
    padding: "16px 17px",
    borderRadius: "15px",
    border: "1px solid transparent",
    background: "rgba(255,255,255,.018)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    textDecoration: "none",
    color: "inherit",
    cursor: "pointer",
  },

  toolMain: {
    flex: 1,
    minWidth: 0,
  },

  toolHeading: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "6px",
  },

  toolTitle: {
    margin: 0,
    color: "#eef1f6",
    fontSize: "15px",
    lineHeight: 1.25,
    fontWeight: 800,
  },

  toolLabel: {
    padding: "4px 7px",
    borderRadius: "999px",
    border: "1px solid rgba(126,106,255,.18)",
    background: "rgba(126,106,255,.06)",
    color: "#c6bdff",
    fontSize: "8px",
    lineHeight: 1,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: ".07em",
  },

  toolDescription: {
    margin: 0,
    maxWidth: "820px",
    color: "#858e9c",
    fontSize: "12px",
    lineHeight: 1.55,
  },

  toolArrow: {
    flexShrink: 0,
    color: "#91f3fb",
    fontSize: "19px",
    fontWeight: 500,
  },

  /* HELP PANEL */

  helpPanel: {
    marginTop: "26px",
    padding: "24px",
    borderRadius: "22px",
    border: "1px solid rgba(255,255,255,.06)",
    background: "rgba(255,255,255,.018)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "20px",
  },

  helpEyebrow: {
    margin: "0 0 7px",
    color: "#7d8693",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".12em",
    textTransform: "uppercase",
  },

  helpTitle: {
    margin: "0 0 7px",
    color: "#f3f5f9",
    fontSize: "19px",
    lineHeight: 1.25,
    fontWeight: 800,
    letterSpacing: "-.02em",
  },

  helpText: {
    margin: 0,
    maxWidth: "720px",
    color: "#8e96a3",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  profileLink: {
    flexShrink: 0,
    padding: "11px 14px",
    borderRadius: "13px",
    border: "1px solid rgba(23,232,255,.15)",
    background: "rgba(23,232,255,.045)",
    color: "#b7f9ff",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "11px",
    fontWeight: 850,
  },
};
