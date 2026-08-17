"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
} from "react";

import { supabase } from "../lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type Tool = {
  title: string;
  description: string;
  href: string;
  label?: "Generator" | "Guide" | "Analyzer" | "Resource";
  accent?: "cyan" | "purple" | "blue" | "green";
};

type Category = {
  title: string;
  description: string;
  tools: Tool[];
  accent?: "cyan" | "purple" | "blue";
};

/* =========================================================
   CATEGORIES
========================================================= */

const categories: Category[] = [
  {
    title: "Resume & Application Tools",
    description:
      "Create resumes and cover letters, analyze job descriptions, and strengthen your applications.",
    accent: "cyan",
    tools: [
      {
        title: "Resume Generator",
        description:
          "Build, preview, save, and print a professional resume using guided sections.",
        href: "/resume-builder",
        label: "Generator",
        accent: "cyan",
      },
      {
        title: "Resume Format Guide",
        description:
          "Compare resume formats and determine which structure may work best for your experience.",
        href: "/career-toolkit/resume-type-helper",
        label: "Guide",
        accent: "blue",
      },
      {
        title: "Cover Letter Generator",
        description:
          "Create a professional cover letter using guided prompts and career-ready wording.",
        href: "/career-toolkit/cover-letter-generator",
        label: "Generator",
        accent: "purple",
      },
      {
        title: "Job Description Analyzer",
        description:
          "Identify important skills, qualifications, keywords, systems, and employer expectations in a job posting.",
        href: "/career-toolkit/job-description-analyzer",
        label: "Analyzer",
        accent: "cyan",
      },
      {
        title: "Resume Match Analyzer",
        description:
          "Compare your resume to a job description and identify where your experience aligns or needs strengthening.",
        href: "/career-toolkit/resume-match-analyzer",
        label: "Analyzer",
        accent: "purple",
      },
      {
        title: "New Opportunities Resume Generator",
        description:
          "Build a resume when restarting, reentering, changing direction, or presenting your experience in a new way.",
        href: "/career-toolkit/new-opportunities-resume-generator",
        label: "Generator",
        accent: "green",
      },
    ],
  },

  {
    title: "Interview Preparation Tools",
    description:
      "Practice interview questions, prepare stronger answers, and get ready for the conversation.",
    accent: "purple",
    tools: [
      {
        title: "Interview Question Generator",
        description:
          "Generate general and industry-focused interview questions for practice.",
        href: "/career-toolkit/interview-question-generator",
        label: "Generator",
        accent: "purple",
      },
      {
        title: "Interview Questions & Preparation",
        description:
          "Review common interview questions, preparation guidance, sample responses, and questions you can ask an employer.",
        href: "/career-toolkit/interview-questions",
        label: "Guide",
        accent: "cyan",
      },
    ],
  },

  {
    title: "Career Planning & Branding Tools",
    description:
      "Explore career options, establish goals, strengthen your professional identity, and plan your next steps.",
    accent: "blue",
    tools: [
      {
        title: "Career Path Generator",
        description:
          "Explore possible career paths based on your interests, work preferences, experience, and goals.",
        href: "/career-toolkit/career-path-generator",
        label: "Generator",
        accent: "cyan",
      },
      {
        title: "Career Goal Generator",
        description:
          "Turn your career ideas into a clearer goal with practical next steps.",
        href: "/career-toolkit/career-goal-generator",
        label: "Generator",
        accent: "purple",
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
        accent: "green",
      },
    ],
  },

  {
    title: "Job Search & Follow-Up Tools",
    description:
      "Organize your job search, track applications, communicate professionally, and stay on top of follow-up.",
    accent: "cyan",
    tools: [
      {
        title: "Job Log Generator",
        description:
          "Track applications, employers, dates, contacts, interviews, outcomes, and follow-up activity.",
        href: "/career-toolkit/job-log-generator",
        label: "Generator",
        accent: "cyan",
      },
      {
        title: "The House of Letters",
        description:
          "Create professional follow-ups, thank-you letters, requests, resignations, and workplace communication.",
        href: "/career-toolkit/employer-follow-up-generator",
        label: "Generator",
        accent: "purple",
      },
      {
        title: "Job Search Tips",
        description:
          "Review practical guidance for applications, job descriptions, employer research, and job-search strategy.",
        href: "/career-toolkit/job-search-tips",
        label: "Guide",
        accent: "blue",
      },
    ],
  },

  {
    title: "Skills & Career Development Guides",
    description:
      "Identify transferable strengths and understand the skills employers look for across industries.",
    accent: "purple",
    tools: [
      {
        title: "Soft Skills",
        description:
          "Explore communication, teamwork, adaptability, organization, problem solving, and other transferable strengths.",
        href: "/career-toolkit/soft-skills",
        label: "Guide",
        accent: "cyan",
      },
      {
        title: "Industry Core Skills",
        description:
          "Explore important skills used across healthcare, manufacturing, logistics, administration, hospitality, IT, trades, retail, and more.",
        href: "/career-toolkit/industry-core-skills",
        label: "Guide",
        accent: "purple",
      },
    ],
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function CareerToolkitPage() {
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [openCategory, setOpenCategory] =
    useState<number | null>(null);

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
    setOpenCategory((current) =>
      current === index ? null : index,
    );
  }

  if (checkingAccess) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.loadingGlow} />
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.backgroundGlowOne} />

      <div style={styles.backgroundGlowTwo} />

      <div style={styles.container}>
        {/* =================================================
            PAGE INTRO
        ================================================= */}

        <section style={styles.hero}>
          <div style={styles.heroBadge}>
            Career ToolKit
          </div>

          <h1 style={styles.heroTitle}>
            Find the right tool for what you need.
          </h1>

          <p style={styles.heroDescription}>
            Choose a category to access generators,
            analyzers, guides, and career-development
            resources.
          </p>
        </section>

        {/* =================================================
            FEATURED VIDEO LIBRARY
        ================================================= */}

        <a
          href="/career-toolkit/community-feed"
          style={styles.videoFeature}
        >
          <div style={styles.videoFeatureGlow} />

          <div style={styles.videoFeatureLeft}>
            <div style={styles.videoIcon}>
              ▶
            </div>

            <div>
              <div style={styles.featuredLabel}>
                Featured Resource
              </div>

              <h2 style={styles.videoTitle}>
                Career Video Library
              </h2>

              <p style={styles.videoDescription}>
                Watch short career-development videos
                covering resumes, interviews, job
                applications, professional communication,
                job-search strategies, and practical career
                guidance.
              </p>
            </div>
          </div>

          <div style={styles.videoAction}>
            <span>Watch Career Videos</span>

            <span style={styles.videoArrow}>
              →
            </span>
          </div>
        </a>

        {/* =================================================
            CATEGORY INTRO
        ================================================= */}

        <section style={styles.categoryIntro}>
          <div>
            <div style={styles.sectionLabel}>
              Career Tools
            </div>

            <h2 style={styles.categoryIntroTitle}>
              Choose a category
            </h2>
          </div>

          <p style={styles.categoryIntroText}>
            Open one section at a time to find the
            generator, analyzer, or guide you need.
          </p>
        </section>

        {/* =================================================
            ACCORDION
        ================================================= */}

        <section style={styles.accordion}>
          {categories.map((category, index) => {
            const isOpen =
              openCategory === index;

            const accent =
              getCategoryAccent(
                category.accent,
              );

            return (
              <div
                key={category.title}
                style={{
                  ...styles.category,
                  borderColor: isOpen
                    ? accent.openBorder
                    : "rgba(255,255,255,0.07)",
                  boxShadow: isOpen
                    ? accent.shadow
                    : "0 18px 55px rgba(0,0,0,0.22)",
                }}
              >
                {/* CATEGORY ACCENT LINE */}

                <div
                  style={{
                    ...styles.categoryAccent,
                    background:
                      accent.gradient,
                    opacity: isOpen
                      ? 1
                      : 0.5,
                  }}
                />

                {/* CATEGORY BUTTON */}

                <button
                  type="button"
                  onClick={() =>
                    toggleCategory(index)
                  }
                  aria-expanded={isOpen}
                  style={
                    styles.categoryButton
                  }
                >
                  <div
                    style={
                      styles.categoryText
                    }
                  >
                    <div
                      style={
                        styles.categoryTitleRow
                      }
                    >
                      <h2
                        style={{
                          ...styles.categoryTitle,
                          color: isOpen
                            ? accent.text
                            : "#f4f6fa",
                        }}
                      >
                        {category.title}
                      </h2>

                      <span
                        style={{
                          ...styles.toolCount,
                          borderColor:
                            accent.softBorder,
                          background:
                            accent.softBackground,
                          color: accent.text,
                        }}
                      >
                        {
                          category.tools
                            .length
                        }{" "}
                        {category.tools
                          .length === 1
                          ? "tool"
                          : "tools"}
                      </span>
                    </div>

                    <p
                      style={
                        styles.categoryDescription
                      }
                    >
                      {
                        category.description
                      }
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.chevron,
                      borderColor:
                        accent.softBorder,
                      background:
                        accent.softBackground,
                      color: accent.text,
                      transform: isOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    ↓
                  </span>
                </button>

                {/* TOOL LIST */}

                {isOpen && (
                  <div
                    style={
                      styles.toolList
                    }
                  >
                    {category.tools.map(
                      (tool) => (
                        <ToolRow
                          key={
                            tool.title
                          }
                          tool={tool}
                        />
                      ),
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   TOOL ROW
========================================================= */

function ToolRow({
  tool,
}: {
  tool: Tool;
}) {
  const accent =
    getToolAccent(tool.accent);

  return (
    <a
      href={tool.href}
      style={{
        ...styles.toolRow,
        borderColor: accent.border,
      }}
    >
      <div style={styles.toolAccentBox}>
        <div
          style={{
            ...styles.toolDot,
            background:
              accent.background,
            borderColor:
              accent.border,
            color: accent.text,
          }}
        >
          {getToolInitials(
            tool.title,
          )}
        </div>
      </div>

      <div style={styles.toolMain}>
        <div
          style={styles.toolHeading}
        >
          <h3 style={styles.toolTitle}>
            {tool.title}
          </h3>

          {tool.label && (
            <span
              style={{
                ...styles.toolLabel,
                borderColor:
                  accent.border,
                background:
                  accent.background,
                color: accent.text,
              }}
            >
              {tool.label}
            </span>
          )}
        </div>

        <p
          style={
            styles.toolDescription
          }
        >
          {tool.description}
        </p>
      </div>

      <span
        style={{
          ...styles.toolArrow,
          color: accent.text,
        }}
      >
        →
      </span>
    </a>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getToolInitials(
  title: string,
) {
  const ignored = new Set([
    "the",
    "of",
    "and",
    "&",
  ]);

  const words = title
    .split(" ")
    .filter(
      (word) =>
        word &&
        !ignored.has(
          word.toLowerCase(),
        ),
    );

  return (
    words
      .slice(0, 2)
      .map(
        (word) =>
          word[0]?.toUpperCase(),
      )
      .join("") || "HM"
  );
}

function getToolAccent(
  accent: Tool["accent"] = "cyan",
) {
  const accents = {
    cyan: {
      text: "#8df7ff",
      border:
        "rgba(23,232,255,0.18)",
      background:
        "rgba(23,232,255,0.07)",
    },

    purple: {
      text: "#c9c0ff",
      border:
        "rgba(126,106,255,0.22)",
      background:
        "rgba(126,106,255,0.08)",
    },

    blue: {
      text: "#a9caff",
      border:
        "rgba(59,130,246,0.20)",
      background:
        "rgba(59,130,246,0.07)",
    },

    green: {
      text: "#a7f3c4",
      border:
        "rgba(34,197,94,0.18)",
      background:
        "rgba(34,197,94,0.07)",
    },
  };

  return accents[accent];
}

function getCategoryAccent(
  accent: Category["accent"] = "cyan",
) {
  const accents = {
    cyan: {
      text: "#9ff8ff",

      openBorder:
        "rgba(23,232,255,0.24)",

      softBorder:
        "rgba(23,232,255,0.18)",

      softBackground:
        "rgba(23,232,255,0.06)",

      gradient:
        "linear-gradient(90deg, rgba(23,232,255,0.95), rgba(23,232,255,0.05))",

      shadow:
        "0 22px 70px rgba(0,0,0,0.30), 0 0 38px rgba(23,232,255,0.035)",
    },

    purple: {
      text: "#d1c8ff",

      openBorder:
        "rgba(126,106,255,0.26)",

      softBorder:
        "rgba(126,106,255,0.20)",

      softBackground:
        "rgba(126,106,255,0.07)",

      gradient:
        "linear-gradient(90deg, rgba(126,106,255,0.95), rgba(126,106,255,0.05))",

      shadow:
        "0 22px 70px rgba(0,0,0,0.30), 0 0 38px rgba(126,106,255,0.04)",
    },

    blue: {
      text: "#bad5ff",

      openBorder:
        "rgba(59,130,246,0.25)",

      softBorder:
        "rgba(59,130,246,0.19)",

      softBackground:
        "rgba(59,130,246,0.065)",

      gradient:
        "linear-gradient(90deg, rgba(59,130,246,0.95), rgba(59,130,246,0.05))",

      shadow:
        "0 22px 70px rgba(0,0,0,0.30), 0 0 38px rgba(59,130,246,0.035)",
    },
  };

  return accents[accent];
}

/* =========================================================
   STYLES
========================================================= */

const styles: Record<
  string,
  CSSProperties
> = {
  /* =====================================================
     LOADING
  ===================================================== */

  loadingPage: {
    minHeight: "100vh",

    background:
      "linear-gradient(180deg, #05070b 0%, #080a10 100%)",

    display: "grid",

    placeItems: "center",
  },

  loadingGlow: {
    width: "48px",

    height: "48px",

    borderRadius: "50%",

    background:
      "radial-gradient(circle, rgba(23,232,255,0.55), rgba(23,232,255,0))",
  },

  /* =====================================================
     PAGE
  ===================================================== */

  page: {
    position: "relative",

    minHeight: "100vh",

    overflow: "hidden",

    padding:
      "42px 20px 80px",

    background:
      "linear-gradient(180deg, #05070b 0%, #080a11 46%, #06080d 100%)",

    color: "#f6f7fb",

    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  backgroundGlowOne: {
    position: "absolute",

    width: "760px",

    height: "760px",

    left: "-360px",

    top: "-300px",

    borderRadius: "50%",

    background:
      "radial-gradient(circle, rgba(23,232,255,0.11), transparent 67%)",

    pointerEvents: "none",
  },

  backgroundGlowTwo: {
    position: "absolute",

    width: "760px",

    height: "760px",

    right: "-380px",

    top: "20px",

    borderRadius: "50%",

    background:
      "radial-gradient(circle, rgba(126,106,255,0.12), transparent 67%)",

    pointerEvents: "none",
  },

  container: {
    position: "relative",

    zIndex: 1,

    width: "100%",

    maxWidth: "1160px",

    margin: "0 auto",
  },

  /* =====================================================
     HERO
  ===================================================== */

  hero: {
    padding:
      "4px 4px 28px",
  },

  heroBadge: {
    display: "inline-flex",

    marginBottom: "14px",

    padding:
      "7px 11px",

    borderRadius: "999px",

    border:
      "1px solid rgba(23,232,255,0.20)",

    background:
      "rgba(23,232,255,0.06)",

    color: "#a9f8ff",

    fontSize: "10px",

    fontWeight: 900,

    letterSpacing: "0.15em",

    textTransform: "uppercase",
  },

  heroTitle: {
    margin: "0 0 12px",

    color: "#ffffff",

    fontSize:
      "clamp(36px, 5vw, 56px)",

    lineHeight: 1,

    letterSpacing: "-0.05em",

    fontWeight: 850,
  },

  heroDescription: {
    margin: 0,

    maxWidth: "720px",

    color: "#a4acb9",

    fontSize: "15px",

    lineHeight: 1.7,
  },

  /* =====================================================
     VIDEO FEATURE
  ===================================================== */

  videoFeature: {
    position: "relative",

    overflow: "hidden",

    width: "100%",

    marginBottom: "34px",

    padding:
      "28px 30px",

    borderRadius: "28px",

    border:
      "1px solid rgba(126,106,255,0.28)",

    background:
      "linear-gradient(125deg, rgba(13,21,34,0.98) 0%, rgba(12,13,29,0.98) 52%, rgba(25,15,48,0.96) 100%)",

    boxShadow:
      "0 28px 80px rgba(0,0,0,0.34), 0 0 42px rgba(126,106,255,0.055)",

    textDecoration: "none",

    color: "inherit",

    display: "flex",

    alignItems: "center",

    justifyContent:
      "space-between",

    flexWrap: "wrap",

    gap: "24px",

    cursor: "pointer",
  },

  videoFeatureGlow: {
    position: "absolute",

    width: "420px",

    height: "420px",

    right: "-160px",

    top: "-210px",

    borderRadius: "50%",

    background:
      "radial-gradient(circle, rgba(67,97,255,0.30), rgba(126,106,255,0.10) 40%, transparent 70%)",

    pointerEvents: "none",
  },

  videoFeatureLeft: {
    position: "relative",

    zIndex: 1,

    flex: "1 1 650px",

    display: "flex",

    alignItems: "center",

    gap: "22px",
  },

  videoIcon: {
    flexShrink: 0,

    width: "70px",

    height: "70px",

    borderRadius: "22px",

    display: "grid",

    placeItems: "center",

    border:
      "1px solid rgba(23,232,255,0.26)",

    background:
      "linear-gradient(145deg, rgba(23,232,255,0.13), rgba(126,106,255,0.14))",

    color: "#bffaff",

    fontSize: "26px",

    boxShadow:
      "0 0 28px rgba(23,232,255,0.07)",
  },

  featuredLabel: {
    marginBottom: "7px",

    color: "#9b91ff",

    fontSize: "9px",

    fontWeight: 950,

    letterSpacing: "0.16em",

    textTransform: "uppercase",
  },

  videoTitle: {
    margin: "0 0 9px",

    color: "#ffffff",

    fontSize:
      "clamp(24px, 3vw, 34px)",

    lineHeight: 1.08,

    letterSpacing: "-0.035em",

    fontWeight: 850,
  },

  videoDescription: {
    margin: 0,

    maxWidth: "720px",

    color: "#a9b0bd",

    fontSize: "13px",

    lineHeight: 1.7,
  },

  videoAction: {
    position: "relative",

    zIndex: 1,

    flexShrink: 0,

    padding:
      "13px 16px",

    borderRadius: "15px",

    border:
      "1px solid rgba(23,232,255,0.22)",

    background:
      "rgba(23,232,255,0.07)",

    color: "#c7fbff",

    display: "flex",

    alignItems: "center",

    gap: "12px",

    fontSize: "11px",

    fontWeight: 900,
  },

  videoArrow: {
    fontSize: "18px",
  },

  /* =====================================================
     CATEGORY INTRO
  ===================================================== */

  categoryIntro: {
    marginBottom: "15px",

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "flex-end",

    flexWrap: "wrap",

    gap: "14px",

    padding:
      "0 3px",
  },

  sectionLabel: {
    marginBottom: "6px",

    color: "#75808f",

    fontSize: "9px",

    fontWeight: 950,

    letterSpacing: "0.15em",

    textTransform: "uppercase",
  },

  categoryIntroTitle: {
    margin: 0,

    color: "#f7f8fb",

    fontSize: "25px",

    letterSpacing: "-0.035em",

    lineHeight: 1.1,

    fontWeight: 850,
  },

  categoryIntroText: {
    margin: 0,

    maxWidth: "470px",

    color: "#858e9b",

    fontSize: "12px",

    lineHeight: 1.6,
  },

  /* =====================================================
     ACCORDION
  ===================================================== */

  accordion: {
    display: "grid",

    gap: "12px",
  },

  category: {
    position: "relative",

    overflow: "hidden",

    borderRadius: "22px",

    border: "1px solid",

    background:
      "linear-gradient(145deg, rgba(15,18,25,0.96), rgba(8,10,15,0.99))",

    transition:
      "border-color 0.2s ease, box-shadow 0.2s ease",
  },

  categoryAccent: {
    position: "absolute",

    left: "22px",

    right: "22px",

    top: 0,

    height: "2px",

    transition:
      "opacity 0.2s ease",
  },

  categoryButton: {
    width: "100%",

    border: "none",

    outline: "none",

    cursor: "pointer",

    background:
      "transparent",

    color: "inherit",

    padding:
      "23px 24px",

    display: "flex",

    justifyContent:
      "space-between",

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

    fontSize: "19px",

    lineHeight: 1.2,

    letterSpacing: "-0.025em",

    fontWeight: 830,

    transition:
      "color 0.2s ease",
  },

  toolCount: {
    padding:
      "5px 8px",

    borderRadius: "999px",

    border: "1px solid",

    fontSize: "8px",

    fontWeight: 900,

    textTransform: "uppercase",

    letterSpacing: "0.07em",
  },

  categoryDescription: {
    margin: 0,

    maxWidth: "800px",

    color: "#929aa7",

    fontSize: "13px",

    lineHeight: 1.55,
  },

  chevron: {
    flexShrink: 0,

    width: "36px",

    height: "36px",

    display: "grid",

    placeItems: "center",

    borderRadius: "50%",

    border: "1px solid",

    fontSize: "17px",

    transition:
      "transform 0.2s ease",
  },

  /* =====================================================
     TOOL LIST
  ===================================================== */

  toolList: {
    borderTop:
      "1px solid rgba(255,255,255,0.055)",

    padding: "9px",

    display: "grid",

    gap: "7px",

    background:
      "rgba(0,0,0,0.10)",
  },

  toolRow: {
    width: "100%",

    minHeight: "88px",

    padding:
      "14px 16px",

    borderRadius: "16px",

    border: "1px solid",

    background:
      "linear-gradient(135deg, rgba(255,255,255,0.022), rgba(255,255,255,0.012))",

    display: "flex",

    alignItems: "center",

    gap: "15px",

    textDecoration: "none",

    color: "inherit",

    cursor: "pointer",
  },

  toolAccentBox: {
    flexShrink: 0,
  },

  toolDot: {
    width: "44px",

    height: "44px",

    borderRadius: "13px",

    border: "1px solid",

    display: "grid",

    placeItems: "center",

    fontSize: "10px",

    fontWeight: 950,

    letterSpacing: "0.04em",
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

    marginBottom: "5px",
  },

  toolTitle: {
    margin: 0,

    color: "#f1f3f7",

    fontSize: "15px",

    lineHeight: 1.25,

    fontWeight: 820,
  },

  toolLabel: {
    padding:
      "4px 7px",

    borderRadius: "999px",

    border: "1px solid",

    fontSize: "8px",

    lineHeight: 1,

    fontWeight: 900,

    textTransform: "uppercase",

    letterSpacing: "0.07em",
  },

  toolDescription: {
    margin: 0,

    maxWidth: "820px",

    color: "#89929f",

    fontSize: "12px",

    lineHeight: 1.55,
  },

  toolArrow: {
    flexShrink: 0,

    fontSize: "19px",

    fontWeight: 500,

    padding:
      "0 4px",
  },
};
