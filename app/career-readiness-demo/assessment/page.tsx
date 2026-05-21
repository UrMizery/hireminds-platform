"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const modules = [
  {
    title: "Module 1: Resume Basics",
    description:
      "Build a healthcare-focused resume using transferable skills, training, customer service, reliability, and workplace readiness.",
    href: "/career-readiness-demo/module-1",
    completionKey: "twp_career_readiness_module_1",
  },
  {
    title: "Module 2: Job Description + Cover Letter",
    description:
      "Read healthcare job postings, identify keywords, match skills, and prepare a short professional cover letter.",
    href: "/career-readiness-demo/module-2",
    completionKey: "twp_career_readiness_module_2",
  },
  {
    title: "Module 3: Interview + Professionalism",
    description:
      "Practice interview responses, professionalism, communication, workplace expectations, and follow-up readiness.",
    href: "/career-readiness-demo/module-3",
    completionKey: "twp_career_readiness_module_3",
  },
];

export default function CareerReadinessHubPage() {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  function refreshCompletion() {
    const map: Record<string, boolean> = {};

    modules.forEach((module) => {
      map[module.completionKey] =
        localStorage.getItem(module.completionKey) === "true";
    });

    setCompletedMap(map);
  }

  useEffect(() => {
    refreshCompletion();
    window.addEventListener("focus", refreshCompletion);

    return () => {
      window.removeEventListener("focus", refreshCompletion);
    };
  }, []);

  function isUnlocked(index: number) {
    if (index === 0) return true;
    return completedMap[modules[index - 1].completionKey] === true;
  }

  function resetCareerReadinessDemo() {
    [
      "twp_career_readiness_module_1",
      "twp_career_readiness_module_2",
      "twp_career_readiness_module_3",
      "twp_career_readiness_assessment_passed",
      "twp_resume_completed",
    ].forEach((key) => localStorage.removeItem(key));

    refreshCompletion();
  }

  const allComplete = modules.every(
    (module) => completedMap[module.completionKey] === true
  );

  return (
    <main style={styles.main}>
      <section style={styles.card}>
        <p style={styles.kicker}>TWP2026 • Day 2</p>

        <h1 style={styles.title}>Career Readiness Training</h1>

        <p style={styles.subtitle}>
          Complete each Career Readiness module in order. Each module contains
          30-second demo content. After all three modules are complete, the
          final Career Readiness assessment unlocks.
        </p>

        <div style={styles.moduleList}>
          {modules.map((module, index) => {
            const complete = completedMap[module.completionKey];
            const unlocked = isUnlocked(index);

            if (!unlocked) {
              return (
                <div key={module.completionKey} style={styles.lockedModule}>
                  <div>
                    <h3 style={styles.moduleTitle}>{module.title}</h3>
                    <p style={styles.moduleText}>{module.description}</p>
                  </div>
                  <strong>Locked</strong>
                </div>
              );
            }

            return (
              <Link
                key={module.completionKey}
                href={module.href}
                style={{
                  ...styles.moduleCard,
                  ...(complete ? styles.completeModule : {}),
                }}
              >
                <div>
                  <h3 style={styles.moduleTitle}>{module.title}</h3>
                  <p style={styles.moduleText}>{module.description}</p>
                </div>
                <strong>{complete ? "Done" : "Start"}</strong>
              </Link>
            );
          })}
        </div>

        <div style={styles.buttonGroup}>
          {allComplete ? (
            <Link
              href="/career-readiness-demo/assessment"
              style={styles.primaryButton}
            >
              Start Final Assessment
            </Link>
          ) : (
            <span style={styles.lockedButton}>Final Assessment Locked</span>
          )}

          <button
            type="button"
            onClick={resetCareerReadinessDemo}
            style={styles.resetButton}
          >
            Reset Career Readiness Demo
          </button>

          <Link href="/skillsquest" style={styles.secondaryButton}>
            Back to Career Pathway
          </Link>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(0,122,255,.20), transparent 35%), linear-gradient(180deg,#050505,#101010)",
    color: "#ffffff",
    padding: "32px",
    fontFamily: "system-ui, Arial, sans-serif",
  },
  card: {
    maxWidth: 760,
    margin: "0 auto",
    padding: 26,
    borderRadius: 22,
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
  },
  kicker: {
    color: "#7db7ff",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1.3,
    fontSize: 12,
  },
  title: {
    fontSize: 38,
    fontWeight: 950,
    margin: "8px 0",
  },
  subtitle: {
    color: "rgba(255,255,255,.76)",
    lineHeight: 1.6,
    fontSize: 15,
  },
  moduleList: {
    display: "grid",
    gap: 12,
    marginTop: 22,
  },
  moduleCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "center",
    background: "rgba(255,255,255,.08)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 14,
    padding: "16px",
    color: "#ffffff",
    textDecoration: "none",
  },
  completeModule: {
    background: "rgba(125,255,179,.13)",
    border: "1px solid rgba(125,255,179,.25)",
  },
  lockedModule: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "center",
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 14,
    padding: "16px",
    color: "rgba(255,255,255,.45)",
  },
  moduleTitle: {
    color: "#7db7ff",
    fontSize: 20,
    margin: "0 0 6px",
  },
  moduleText: {
    margin: 0,
    color: "rgba(255,255,255,.72)",
    lineHeight: 1.5,
  },
  buttonGroup: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 22,
  },
  primaryButton: {
    background: "#0A84FF",
    color: "#ffffff",
    padding: "12px 16px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 850,
    display: "inline-block",
  },
  secondaryButton: {
    background: "rgba(255,255,255,.09)",
    color: "#ffffff",
    padding: "12px 16px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 850,
    border: "1px solid rgba(255,255,255,.16)",
  },
  resetButton: {
    background: "rgba(255,255,255,.09)",
    color: "#ffffff",
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 850,
    border: "1px solid rgba(255,255,255,.16)",
    cursor: "pointer",
  },
  lockedButton: {
    background: "rgba(255,255,255,.09)",
    color: "rgba(255,255,255,.68)",
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 850,
    display: "inline-block",
  },
};
