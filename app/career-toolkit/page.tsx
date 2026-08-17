"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { supabase } from "../lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type Tool = {
  title: string;
  description: string;
  href: string;
  status?: "Live" | "New";
  accent?: "cyan" | "purple" | "blue" | "green";
};

type ToolSection = {
  eyebrow: string;
  title: string;
  description: string;
  tools: Tool[];
};

/* =========================================================
   DATA
========================================================= */

const sections: ToolSection[] = [
  {
    eyebrow: "Resume & Applications",
    title: "Build stronger application materials",
    description:
      "Create, strengthen, compare, and tailor the documents you use throughout your job search.",
    tools: [
      {
        title: "Resume Generator",
        description:
          "Build, preview, save, and print a professional resume using guided sections and a structured layout.",
        href: "/resume-builder",
        status: "Live",
        accent: "cyan",
      },
      {
        title: "Resume Format Guide",
        description:
          "Compare chronological, functional, combination, and hybrid resume formats before deciding which structure fits your experience.",
        href: "/career-toolkit/resume-type-helper",
        status: "Live",
        accent: "blue",
      },
      {
        title: "Cover Letter Generator",
        description:
          "Create a polished cover letter using guided prompts, professional wording, and a live preview.",
        href: "/career-toolkit/cover-letter-generator",
        status: "Live",
        accent: "purple",
      },
      {
        title: "Job Description Analyzer",
        description:
          "Break down a job posting to identify important skills, qualifications, keywords, systems, and employer expectations.",
        href: "/career-toolkit/job-description-analyzer",
        status: "New",
        accent: "cyan",
      },
      {
        title: "Resume Match Analyzer",
        description:
          "Compare your resume with a job description to identify strengths, missing keywords, gaps, and opportunities to improve alignment.",
        href: "/career-toolkit/resume-match-analyzer",
        status: "New",
        accent: "purple",
      },
      {
        title: "New Opportunities Resume Generator",
        description:
          "A guided resume experience for people rebuilding, reentering, restarting, or positioning life experience for a new professional direction.",
        href: "/career-toolkit/new-opportunities-resume-generator",
        status: "New",
        accent: "green",
      },
    ],
  },

  {
    eyebrow: "Interview Preparation",
    title: "Prepare before the conversation",
    description:
      "Practice common questions, understand what employers may ask, and walk into interviews better prepared.",
    tools: [
      {
        title: "Interview Question Generator",
        description:
          "Generate general and industry-focused interview questions so you can practice before the interview.",
        href: "/career-toolkit/interview-question-generator",
        status: "New",
        accent: "purple",
      },
      {
        title: "Interview Questions & Preparation",
        description:
          "Review common interview questions, sample responses, preparation guidance, and smart questions you can ask the employer.",
        href: "/career-toolkit/interview-questions",
        status: "Live",
        accent: "cyan",
      },
    ],
  },

  {
    eyebrow: "Career Planning",
    title: "Build direction around what comes next",
    description:
      "Explore career options, clarify your goals, strengthen your professional identity, and plan your next move.",
    tools: [
      {
        title: "Career Path Generator",
        description:
          "Explore possible career paths based on the type of work you enjoy, your preferred environment, and how quickly you want to get started.",
        href: "/career-toolkit/career-path-generator",
        status: "New",
        accent: "cyan",
      },
      {
        title: "Career Goal Generator",
        description:
          "Create a stronger career goal that explains where you want to go, why it matters, and what you can do next.",
        href: "/career-toolkit/career-goal-generator",
        status: "New",
        accent: "purple",
      },
      {
        title: "Professional Branding Generator",
        description:
          "Strengthen your professional summary, biography, resume language, and positioning with clearer career-ready wording.",
        href: "/career-toolkit/professional-branding-generator",
        status: "New",
        accent: "blue",
      },
      {
        title: "Budget Generator",
        description:
          "Build a simple monthly budget to better understand income, expenses, financial priorities, and what may remain each month.",
        href: "/career-toolkit/budget-generator",
        status: "New",
        accent: "green",
      },
    ],
  },

  {
    eyebrow: "Job Search & Organization",
    title: "Stay organized while you move forward",
    description:
      "Track your activity, follow up professionally, and use practical guidance throughout your job search.",
    tools: [
      {
        title: "Job Log Generator",
        description:
          "Track applications, employers, dates, contacts, interviews, outcomes, and follow-up activity in one organized place.",
        href: "/career-toolkit/job-log-generator",
        status: "New",
        accent: "cyan",
      },
      {
        title: "The House of Letters",
        description:
          "Create professional follow-ups, workplace letters, requests, resignations, thank-you messages, and other career communication.",
        href: "/career-toolkit/employer-follow-up-generator",
        status: "New",
        accent: "purple",
      },
      {
        title: "Job Search Tips",
        description:
          "Learn how to read job descriptions, identify employer priorities, strengthen applications, and approach the search more intentionally.",
        href: "/career-toolkit/job-search-tips",
        status: "Live",
        accent: "blue",
      },
    ],
  },

  {
    eyebrow: "Skills & Development",
    title: "Strengthen what you bring to the table",
    description:
      "Understand the skills employers look for and identify strengths you can use throughout your career.",
    tools: [
      {
        title: "Soft Skills",
        description:
          "Explore communication, teamwork, adaptability, organization, time management, problem solving, and other transferable strengths.",
        href: "/career-toolkit/soft-skills",
        status: "Live",
        accent: "cyan",
      },
      {
        title: "Industry Core Skills",
        description:
          "Explore important skills across healthcare, manufacturing, warehouse, logistics, administrative work, hospitality, IT, trades, retail, and more.",
        href: "/career-toolkit/industry-core-skills",
        status: "Live",
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

      if (!mounted) return;

      setCheckingAccess(false);
    }

    checkAccess();

    return () => {
      mounted = false;
    };
  }, []);

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

      <div style={styles.shell}>
        {/* =================================================
            HERO
        ================================================= */}

        <section style={styles.hero}>
          <div style={styles.heroMain}>
            <div style={styles.heroBadge}>Career ToolKit</div>

            <h1 style={styles.title}>
              Career tools without the clutter.
            </h1>

            <p style={styles.subtitle}>
              Build your resume, prepare for interviews, organize your
              job search, strengthen your skills, and plan what comes
              next—all from one place.
            </p>

            <div style={styles.heroPills}>
              <HeroPill>Resume & Applications</HeroPill>
              <HeroPill>Interview Preparation</HeroPill>
              <HeroPill>Career Planning</HeroPill>
              <HeroPill>Job Search</HeroPill>
              <HeroPill>Skills & Development</HeroPill>
            </div>
          </div>

          <aside style={styles.featurePanel}>
            <div style={styles.featurePanelGlow} />

            <div style={styles.featurePanelContent}>
              <p style={styles.featureEyebrow}>
                Watch • Learn • Prepare
              </p>

              <h2 style={styles.featurePanelTitle}>
                Vid Feed Library
              </h2>

              <p style={styles.featurePanelText}>
                Watch short career-development videos covering resumes,
                interviews, applications, job boards, professional
                communication, and practical job-search guidance.
              </p>

              <a
                href="/career-toolkit/community-feed"
                style={styles.primaryButton}
              >
                Open Vid Feed Library
                <span style={styles.buttonArrow}>→</span>
              </a>
            </div>
          </aside>
        </section>

        {/* =================================================
            QUICK NAV
        ================================================= */}

        <section style={styles.quickNavSection}>
          <p style={styles.quickNavLabel}>Jump to a section</p>

          <div style={styles.quickNav}>
            {sections.map((section, index) => (
              <a
                key={section.eyebrow}
                href={`#tool-section-${index}`}
                style={styles.quickNavLink}
              >
                {section.eyebrow}
              </a>
            ))}
          </div>
        </section>

        {/* =================================================
            TOOL SECTIONS
        ================================================= */}

        {sections.map((section, sectionIndex) => (
          <section
            key={section.eyebrow}
            id={`tool-section-${sectionIndex}`}
            style={styles.section}
          >
            <div style={styles.sectionHeadingRow}>
              <div>
                <p style={styles.sectionEyebrow}>
                  {section.eyebrow}
                </p>

                <h2 style={styles.sectionTitle}>
                  {section.title}
                </h2>

                <p style={styles.sectionDescription}>
                  {section.description}
                </p>
              </div>

              <div style={styles.sectionCount}>
                {section.tools.length}{" "}
                {section.tools.length === 1 ? "Tool" : "Tools"}
              </div>
            </div>

            <div style={styles.toolGrid}>
              {section.tools.map((tool) => (
                <ToolCard
                  key={`${section.eyebrow}-${tool.title}`}
                  tool={tool}
                />
              ))}
            </div>
          </section>
        ))}

        {/* =================================================
            BOTTOM RESOURCE STRIP
        ================================================= */}

        <section style={styles.bottomPanel}>
          <div>
            <p style={styles.bottomEyebrow}>
              Career ToolKit
            </p>

            <h2 style={styles.bottomTitle}>
              You do not have to use every tool.
            </h2>

            <p style={styles.bottomText}>
              Start with what you need today. Build a resume, prepare
              for an interview, organize your applications, strengthen
              your skills, or explore what comes next.
            </p>
          </div>

          <a
            href="/profile"
            style={styles.secondaryButton}
          >
            Return to Career Passport
            <span style={styles.buttonArrow}>→</span>
          </a>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function ToolCard({
  tool,
}: {
  tool: Tool;
}) {
  const accent = getAccent(tool.accent);

  return (
    <article
      style={{
        ...styles.toolCard,
        borderColor: accent.border,
        boxShadow: accent.shadow,
      }}
    >
      <div
        style={{
          ...styles.toolAccent,
          background: accent.gradient,
        }}
      />

      <div style={styles.toolCardTop}>
        <div
          style={{
            ...styles.toolIcon,
            background: accent.soft,
            borderColor: accent.border,
            color: accent.text,
          }}
        >
          {getToolInitials(tool.title)}
        </div>

        {tool.status && (
          <span
            style={{
              ...styles.statusTag,
              background: accent.soft,
              borderColor: accent.border,
              color: accent.text,
            }}
          >
            {tool.status}
          </span>
        )}
      </div>

      <div style={styles.toolCardBody}>
        <h3 style={styles.toolTitle}>
          {tool.title}
        </h3>

        <p style={styles.toolDescription}>
          {tool.description}
        </p>
      </div>

      <a
        href={tool.href}
        style={{
          ...styles.toolButton,
          borderColor: accent.border,
        }}
      >
        Open Tool
        <span style={styles.buttonArrow}>→</span>
      </a>
    </article>
  );
}

function HeroPill({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span style={styles.heroPill}>
      {children}
    </span>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getToolInitials(title: string) {
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
        !ignored.has(word.toLowerCase()),
    );

  const initials = words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return initials || "HM";
}

function getAccent(
  accent: Tool["accent"] = "cyan",
) {
  const accents = {
    cyan: {
      text: "#9ff6ff",
      soft: "rgba(23,232,255,0.08)",
      border: "rgba(23,232,255,0.20)",
      gradient:
        "linear-gradient(90deg, rgba(23,232,255,0.95), rgba(23,232,255,0.05))",
      shadow:
        "0 24px 70px rgba(0,0,0,0.30), 0 0 32px rgba(23,232,255,0.035)",
    },

    purple: {
      text: "#d0c8ff",
      soft: "rgba(126,106,255,0.10)",
      border: "rgba(126,106,255,0.24)",
      gradient:
        "linear-gradient(90deg, rgba(126,106,255,0.95), rgba(126,106,255,0.05))",
      shadow:
        "0 24px 70px rgba(0,0,0,0.30), 0 0 32px rgba(126,106,255,0.04)",
    },

    blue: {
      text: "#bfdbfe",
      soft: "rgba(59,130,246,0.09)",
      border: "rgba(59,130,246,0.22)",
      gradient:
        "linear-gradient(90deg, rgba(59,130,246,0.95), rgba(59,130,246,0.05))",
      shadow:
        "0 24px 70px rgba(0,0,0,0.30), 0 0 32px rgba(59,130,246,0.04)",
    },

    green: {
      text: "#bbf7d0",
      soft: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.20)",
      gradient:
        "linear-gradient(90deg, rgba(34,197,94,0.90), rgba(34,197,94,0.05))",
      shadow:
        "0 24px 70px rgba(0,0,0,0.30), 0 0 32px rgba(34,197,94,0.035)",
    },
  };

  return accents[accent];
}

/* =========================================================
   STYLES
========================================================= */

const styles: Record<string, CSSProperties> = {
  loadingPage: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #05070b 0%, #080a10 100%)",
    display: "grid",
    placeItems: "center",
  },

  loadingGlow: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(23,232,255,0.45), rgba(23,232,255,0))",
  },

  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(180deg, #05070b 0%, #080a10 42%, #06080d 100%)",
    color: "#f5f7fb",
    padding: "32px 20px 72px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  backgroundGlowOne: {
    position: "absolute",
    top: "-260px",
    left: "-180px",
    width: "720px",
    height: "720px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(23,232,255,0.10) 0%, rgba(23,232,255,0.025) 36%, transparent 70%)",
    pointerEvents: "none",
  },

  backgroundGlowTwo: {
    position: "absolute",
    top: "80px",
    right: "-260px",
    width: "760px",
    height: "760px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(126,106,255,0.11) 0%, rgba(126,106,255,0.025) 38%, transparent 72%)",
    pointerEvents: "none",
  },

  shell: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "1380px",
    margin: "0 auto",
    display: "grid",
    gap: "34px",
  },

  /* HERO */

  hero: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "18px",
  },

  heroMain: {
    minHeight: "315px",
    borderRadius: "34px",
    padding: "38px",
    border:
      "1px solid rgba(255,255,255,0.075)",
    background:
      "linear-gradient(145deg, rgba(17,21,30,0.95), rgba(7,9,14,0.98))",
    boxShadow:
      "0 34px 100px rgba(0,0,0,0.38)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  heroBadge: {
    width: "fit-content",
    marginBottom: "18px",
    padding: "8px 12px",
    borderRadius: "999px",
    border:
      "1px solid rgba(23,232,255,0.20)",
    background:
      "rgba(23,232,255,0.07)",
    color: "#aaf8ff",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  },

  title: {
    margin: "0 0 16px",
    maxWidth: "780px",
    fontSize: "clamp(38px, 5vw, 62px)",
    lineHeight: 0.98,
    letterSpacing: "-0.055em",
    fontWeight: 850,
    color: "#ffffff",
  },

  subtitle: {
    margin: 0,
    maxWidth: "760px",
    color: "#b9c0cc",
    fontSize: "16px",
    lineHeight: 1.75,
  },

  heroPills: {
    marginTop: "26px",
    display: "flex",
    flexWrap: "wrap",
    gap: "9px",
  },

  heroPill: {
    padding: "8px 11px",
    borderRadius: "999px",
    background:
      "rgba(255,255,255,0.035)",
    border:
      "1px solid rgba(255,255,255,0.07)",
    color: "#c9ced7",
    fontSize: "11px",
    fontWeight: 750,
  },

  featurePanel: {
    position: "relative",
    overflow: "hidden",
    minHeight: "315px",
    borderRadius: "34px",
    padding: "34px",
    border:
      "1px solid rgba(126,106,255,0.17)",
    background:
      "linear-gradient(145deg, rgba(15,15,27,0.96), rgba(8,9,15,0.99))",
    boxShadow:
      "0 34px 100px rgba(0,0,0,0.38)",
    display: "flex",
    alignItems: "center",
  },

  featurePanelGlow: {
    position: "absolute",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    top: "-180px",
    right: "-100px",
    background:
      "radial-gradient(circle, rgba(126,106,255,0.22), transparent 68%)",
    pointerEvents: "none",
  },

  featurePanelContent: {
    position: "relative",
    zIndex: 1,
  },

  featureEyebrow: {
    margin: "0 0 10px",
    color: "#a99dff",
    fontSize: "11px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.16em",
  },

  featurePanelTitle: {
    margin: "0 0 12px",
    color: "#ffffff",
    fontSize: "30px",
    lineHeight: 1.08,
    letterSpacing: "-0.035em",
    fontWeight: 850,
  },

  featurePanelText: {
    margin: "0 0 22px",
    color: "#b9c0cc",
    fontSize: "14px",
    lineHeight: 1.75,
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    width: "fit-content",
    textDecoration: "none",
    padding: "13px 17px",
    borderRadius: "15px",
    border:
      "1px solid rgba(126,106,255,0.30)",
    background:
      "linear-gradient(135deg, rgba(126,106,255,0.19), rgba(126,106,255,0.08))",
    color: "#ece9ff",
    fontSize: "13px",
    fontWeight: 850,
  },

  buttonArrow: {
    fontSize: "16px",
    lineHeight: 1,
  },

  /* QUICK NAV */

  quickNavSection: {
    display: "grid",
    gap: "10px",
    padding: "4px 2px",
  },

  quickNavLabel: {
    margin: 0,
    color: "#737b88",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  },

  quickNav: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  quickNavLink: {
    textDecoration: "none",
    padding: "9px 12px",
    borderRadius: "999px",
    border:
      "1px solid rgba(255,255,255,0.065)",
    background:
      "rgba(255,255,255,0.025)",
    color: "#b8bec8",
    fontSize: "11px",
    fontWeight: 750,
  },

  /* SECTIONS */

  section: {
    scrollMarginTop: "24px",
    display: "grid",
    gap: "18px",
    paddingTop: "12px",
  },

  sectionHeadingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: "18px",
  },

  sectionEyebrow: {
    margin: "0 0 8px",
    color: "#76808f",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },

  sectionTitle: {
    margin: "0 0 8px",
    color: "#f5f7fb",
    fontSize: "clamp(27px, 3vw, 36px)",
    lineHeight: 1.08,
    letterSpacing: "-0.04em",
    fontWeight: 850,
  },

  sectionDescription: {
    margin: 0,
    color: "#9199a7",
    fontSize: "14px",
    lineHeight: 1.7,
    maxWidth: "760px",
  },

  sectionCount: {
    flexShrink: 0,
    padding: "8px 11px",
    borderRadius: "999px",
    background:
      "rgba(255,255,255,0.025)",
    border:
      "1px solid rgba(255,255,255,0.06)",
    color: "#7f8794",
    fontSize: "10px",
    fontWeight: 850,
    textTransform: "uppercase",
    letterSpacing: "0.09em",
  },

  toolGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(275px, 1fr))",
    gap: "14px",
  },

  /* TOOL CARDS */

  toolCard: {
    position: "relative",
    overflow: "hidden",
    minHeight: "295px",
    padding: "22px",
    borderRadius: "25px",
    border: "1px solid",
    background:
      "linear-gradient(145deg, rgba(15,18,25,0.94), rgba(7,9,14,0.98))",
    display: "flex",
    flexDirection: "column",
    transition:
      "transform 0.2s ease, border-color 0.2s ease",
  },

  toolAccent: {
    position: "absolute",
    height: "2px",
    top: 0,
    left: "22px",
    right: "22px",
    opacity: 0.85,
  },

  toolCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },

  toolIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "13px",
    border: "1px solid",
    display: "grid",
    placeItems: "center",
    fontSize: "11px",
    fontWeight: 950,
    letterSpacing: "0.05em",
  },

  statusTag: {
    padding: "6px 9px",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.09em",
    textTransform: "uppercase",
  },

  toolCardBody: {
    flex: 1,
  },

  toolTitle: {
    margin: "0 0 10px",
    color: "#f4f6fb",
    fontSize: "20px",
    lineHeight: 1.16,
    letterSpacing: "-0.025em",
    fontWeight: 830,
  },

  toolDescription: {
    margin: 0,
    color: "#9fa6b2",
    fontSize: "13px",
    lineHeight: 1.72,
  },

  toolButton: {
    marginTop: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    textDecoration: "none",
    padding: "11px 13px",
    borderRadius: "13px",
    border: "1px solid",
    background:
      "rgba(255,255,255,0.025)",
    color: "#e7eaf0",
    fontSize: "11px",
    fontWeight: 850,
  },

  /* BOTTOM */

  bottomPanel: {
    marginTop: "12px",
    padding: "28px",
    borderRadius: "28px",
    border:
      "1px solid rgba(255,255,255,0.065)",
    background:
      "linear-gradient(135deg, rgba(15,18,25,0.94), rgba(8,10,15,0.98))",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "22px",
  },

  bottomEyebrow: {
    margin: "0 0 8px",
    color: "#747d8a",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  },

  bottomTitle: {
    margin: "0 0 8px",
    color: "#ffffff",
    fontSize: "24px",
    lineHeight: 1.1,
    letterSpacing: "-0.035em",
    fontWeight: 850,
  },

  bottomText: {
    margin: 0,
    maxWidth: "760px",
    color: "#969eaa",
    fontSize: "13px",
    lineHeight: 1.7,
  },

  secondaryButton: {
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
    padding: "12px 15px",
    borderRadius: "14px",
    border:
      "1px solid rgba(23,232,255,0.18)",
    background:
      "rgba(23,232,255,0.055)",
    color: "#c8fbff",
    fontSize: "11px",
    fontWeight: 850,
  },
};
