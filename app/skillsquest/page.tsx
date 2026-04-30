"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const REQUIRED_CODE = "TWP2026";

type ModuleItem = {
  week: string;
  day: string;
  title: string;
  description: string;
  studyHref?: string;
  assessmentHref?: string;
  statusKey?: string;
};

const healthcareModules: ModuleItem[] = [
  {
    week: "Week 1",
    day: "Day 1",
    title: "Orientation",
    description: "Program overview, expectations, platform access, and career goals.",
  },
  {
    week: "Week 1",
    day: "Day 2",
    title: "Introduction to Healthcare Careers",
    description: "Explore healthcare roles, work environments, and entry-level pathways.",
  },
  {
    week: "Week 1",
    day: "Day 3",
    title: "Foundations in Customer Service",
    description: "Understand service delivery, professionalism, and patient-facing expectations.",
  },
  {
    week: "Week 2",
    day: "Day 4",
    title: "Customer Service Methodology",
    description: "Build stronger communication, active listening, and service response skills.",
  },
  {
    week: "Week 2",
    day: "Day 5",
    title: "Introduction to Medical Terminology",
    description: "Learn prefixes, suffixes, root words, and common healthcare terms.",
    studyHref: "/medical-terminology-study",
    assessmentHref: "/medical-terminology-assessment",
    statusKey: "medicalTerminologyStudyComplete",
  },
  {
    week: "Week 2",
    day: "Day 6",
    title: "Foundations in Home and Community-Based Healthcare",
    description: "Learn patient intake, privacy, scheduling, insurance basics, and communication.",
    studyHref: "/healthcare-admin-study",
    assessmentHref: "/healthcare-admin-assessment",
    statusKey: "healthcareAdminStudyComplete",
  },
  {
    week: "Week 3",
    day: "Day 7",
    title: "CPR and First Aid",
    description: "Review CPR/First Aid importance and prepare for external certification.",
  },
  {
    week: "Week 3",
    day: "Day 8",
    title: "Career Search for Healthcare Workers",
    description: "Learn how to identify roles, read job descriptions, and track applications.",
  },
  {
    week: "Week 3",
    day: "Day 9",
    title: "Resume, Cover Letters and Interview Prep",
    description: "Use HireMinds tools to prepare documents and practice for interviews.",
  },
];

export default function SkillsQuestPage() {
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      const userReferralCode = String(
        user?.user_metadata?.referral_code ||
          user?.user_metadata?.referralCode ||
          user?.user_metadata?.access_code ||
          ""
      )
        .trim()
        .toUpperCase();

      const completionMap: Record<string, boolean> = {};

      healthcareModules.forEach((module) => {
        if (module.statusKey) {
          completionMap[module.statusKey] =
            localStorage.getItem(module.statusKey) === "true";
        }
      });

      setAllowed(userReferralCode === REQUIRED_CODE);
      setCompleted(completionMap);
      setChecked(true);
    }

    checkAccess();
  }, []);

  if (!checked) {
    return (
      <main style={styles.main}>
        <p>Loading SkillsQuest...</p>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main style={styles.main}>
        <section style={styles.lockCard}>
          <p style={styles.kicker}>Restricted Learning Area</p>
          <h1 style={styles.title}>SkillsQuest Locked</h1>
          <p style={styles.subtitle}>
            This learning area is currently available only to approved
            participants.
          </p>

          <Link href="/" style={styles.primaryButton}>
            Return Home
          </Link>
        </section>
      </main>
    );
  }

  const activeModules = healthcareModules.filter((m) => m.studyHref).length;
  const completedModules = healthcareModules.filter(
    (m) => m.statusKey && completed[m.statusKey]
  ).length;

  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <p style={styles.kicker}>HireMinds Learning Hub</p>
        <h1 style={styles.title}>SkillsQuest</h1>
        <p style={styles.subtitle}>
          Structured learning pathways, timed study guides, assessments,
          certificates, and career readiness support — all in one place.
        </p>
      </section>

      <section style={styles.programHero}>
        <div>
          <p style={styles.programLabel}>MedScope Track</p>
          <h2 style={styles.programTitle}>
            Healthcare Career Orientation for SCSEP Participants
          </h2>
          <p style={styles.programText}>
            A 3-week occupational skills training pathway focused on healthcare
            career awareness, customer service, terminology, home and
            community-based healthcare, CPR/First Aid readiness, and career
            search preparation.
          </p>
        </div>

        <div style={styles.progressCard}>
          <strong>Program Progress</strong>
          <span style={styles.progressNumber}>
            {completedModules}/{activeModules}
          </span>
          <small>active modules completed</small>
        </div>
      </section>

      <section style={styles.weekGrid}>
        {["Week 1", "Week 2", "Week 3"].map((week) => (
          <div key={week} style={styles.weekCard}>
            <h2 style={styles.weekTitle}>{week}</h2>

            {healthcareModules
              .filter((module) => module.week === week)
              .map((module) => {
                const isComplete =
                  module.statusKey && completed[module.statusKey];
                const isActive = Boolean(module.studyHref);

                return (
                  <div key={`${module.week}-${module.day}`} style={styles.moduleCard}>
                    <div style={styles.moduleTop}>
                      <span style={styles.dayBadge}>{module.day}</span>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(isComplete
                            ? styles.completeBadge
                            : isActive
                            ? styles.activeBadge
                            : styles.comingSoonBadge),
                        }}
                      >
                        {isComplete
                          ? "Study Complete"
                          : isActive
                          ? "Active"
                          : "Coming Soon"}
                      </span>
                    </div>

                    <h3 style={styles.moduleTitle}>{module.title}</h3>
                    <p style={styles.moduleText}>{module.description}</p>

                    {isActive ? (
                      <div style={styles.buttonGroup}>
                        <Link href={module.studyHref || "#"} style={styles.primaryButton}>
                          Study Guide
                        </Link>

                        {isComplete ? (
                          <Link
                            href={module.assessmentHref || "#"}
                            style={styles.secondaryButton}
                          >
                            Assessment
                          </Link>
                        ) : (
                          <span style={styles.lockedButton}>
                            Complete Study First
                          </span>
                        )}
                      </div>
                    ) : (
                      <div style={styles.lockedButton}>Module Coming Soon</div>
                    )}
                  </div>
                );
              })}
          </div>
        ))}
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
  hero: {
    maxWidth: 1180,
    margin: "0 auto 28px",
  },
  kicker: {
    color: "#7db7ff",
    fontWeight: 900,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontSize: 12,
  },
  title: {
    fontSize: 52,
    fontWeight: 950,
    margin: "8px 0",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 1.7,
    color: "rgba(255,255,255,.78)",
    maxWidth: 820,
  },
  programHero: {
    maxWidth: 1180,
    margin: "0 auto 24px",
    padding: 26,
    borderRadius: 24,
    background:
      "linear-gradient(135deg, rgba(10,132,255,.22), rgba(255,255,255,.06))",
    border: "1px solid rgba(255,255,255,.15)",
    display: "grid",
    gridTemplateColumns: "1fr 220px",
    gap: 20,
    alignItems: "center",
  },
  programLabel: {
    color: "#9ed0ff",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
    margin: 0,
  },
  programTitle: {
    fontSize: 30,
    margin: "8px 0",
    fontWeight: 950,
  },
  programText: {
    color: "rgba(255,255,255,.78)",
    lineHeight: 1.65,
    margin: 0,
  },
  progressCard: {
    borderRadius: 18,
    background: "rgba(0,0,0,.35)",
    border: "1px solid rgba(255,255,255,.12)",
    padding: 18,
    display: "grid",
    gap: 6,
    textAlign: "center",
  },
  progressNumber: {
    fontSize: 38,
    fontWeight: 950,
  },
  weekGrid: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
    gap: 18,
  },
  weekCard: {
    background: "rgba(255,255,255,.055)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 24,
    padding: 18,
  },
  weekTitle: {
    margin: "0 0 14px",
    fontSize: 24,
  },
  moduleCard: {
    background: "rgba(0,0,0,.28)",
    border: "1px solid rgba(255,255,255,.10)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  moduleTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  dayBadge: {
    background: "rgba(255,255,255,.10)",
    color: "#ffffff",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
  },
  statusBadge: {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 900,
  },
  completeBadge: {
    background: "rgba(125,255,179,.16)",
    color: "#7dffb3",
  },
  activeBadge: {
    background: "rgba(125,183,255,.16)",
    color: "#9ed0ff",
  },
  comingSoonBadge: {
    background: "rgba(255,255,255,.09)",
    color: "rgba(255,255,255,.6)",
  },
  moduleTitle: {
    fontSize: 18,
    margin: "0 0 8px",
  },
  moduleText: {
    color: "rgba(255,255,255,.76)",
    lineHeight: 1.55,
    fontSize: 14,
  },
  buttonGroup: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 12,
  },
  primaryButton: {
    background: "#ffffff",
    color: "#000000",
    padding: "11px 15px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 850,
    display: "inline-block",
  },
  secondaryButton: {
    background: "#0A84FF",
    color: "#ffffff",
    padding: "11px 15px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 850,
    display: "inline-block",
  },
  lockedButton: {
    background: "rgba(255,255,255,.09)",
    color: "rgba(255,255,255,.68)",
    padding: "11px 15px",
    borderRadius: 12,
    fontWeight: 850,
    display: "inline-block",
  },
  lockCard: {
    maxWidth: 650,
    margin: "100px auto",
    padding: 30,
    borderRadius: 22,
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
  },
};
