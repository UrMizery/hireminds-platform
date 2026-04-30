"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const REQUIRED_CODE = "TWP2026";

type StudyModule = {
  title: string;
  href: string;
  completionKey: string;
};

type TrainingDay = {
  week: string;
  day: string;
  title: string;
  description: string;
  sessionPlan: string;
  modules?: StudyModule[];
  assessmentHref?: string;
};

const trainingDays: TrainingDay[] = [
  {
    week: "Week 1",
    day: "Day 1",
    title: "Orientation",
    description:
      "Program overview, expectations, HireMinds walkthrough, and career goals.",
    sessionPlan: "2-hour trainer-led session.",
  },
  {
    week: "Week 1",
    day: "Day 2",
    title: "Introduction to Healthcare Careers",
    description:
      "Explore healthcare roles, work environments, entry-level pathways, and career options.",
    sessionPlan: "2-hour trainer-led session.",
  },
  {
    week: "Week 1",
    day: "Day 3",
    title: "Foundations in Customer Service",
    description:
      "Professionalism, patient-facing expectations, and customer service basics.",
    sessionPlan: "2-hour trainer-led session.",
  },
  {
    week: "Week 2",
    day: "Day 4",
    title: "Customer Service Methodology",
    description:
      "Communication, active listening, empathy, and service response skills.",
    sessionPlan: "2-hour trainer-led session.",
  },
  {
    week: "Week 2",
    day: "Day 5",
    title: "Medical Terminology",
    description:
      "Learn medical word parts, prefixes, root words, suffixes, and practice terms.",
    sessionPlan:
      "2-hour session: trainer explanation, guided examples, timed study modules, practice, and assessment.",
    assessmentHref: "/medical-terminology-assessment",
    modules: [
      {
        title: "Module 1: How Medical Words Are Built",
        href: "/medical-terminology/module-1",
        completionKey: "medicalTerminology_module_1",
      },
      {
        title: "Module 2: Common Prefixes",
        href: "/medical-terminology/module-2",
        completionKey: "medicalTerminology_module_2",
      },
      {
        title: "Module 3: Root Words",
        href: "/medical-terminology/module-3",
        completionKey: "medicalTerminology_module_3",
      },
      {
        title: "Module 4: Common Suffixes",
        href: "/medical-terminology/module-4",
        completionKey: "medicalTerminology_module_4",
      },
      {
        title: "Module 5: Practice Terms",
        href: "/medical-terminology/module-5",
        completionKey: "medicalTerminology_module_5",
      },
    ],
  },
  {
    week: "Week 2",
    day: "Day 6",
    title: "Home & Community-Based Healthcare",
    description:
      "Learn patient intake, HIPAA/privacy, scheduling, insurance basics, and professional communication.",
    sessionPlan:
      "2-hour session: trainer demo, guided discussion, timed study modules, practice, and assessment.",
    assessmentHref: "/healthcare-admin-assessment",
    modules: [
      {
        title: "Module 1: Patient Intake",
        href: "/healthcare-admin/module-1",
        completionKey: "healthcareAdmin_module_1",
      },
      {
        title: "Module 2: HIPAA & Privacy",
        href: "/healthcare-admin/module-2",
        completionKey: "healthcareAdmin_module_2",
      },
      {
        title: "Module 3: Scheduling & Coordination",
        href: "/healthcare-admin/module-3",
        completionKey: "healthcareAdmin_module_3",
      },
      {
        title: "Module 4: Insurance Basics",
        href: "/healthcare-admin/module-4",
        completionKey: "healthcareAdmin_module_4",
      },
      {
        title: "Module 5: Professional Communication",
        href: "/healthcare-admin/module-5",
        completionKey: "healthcareAdmin_module_5",
      },
    ],
  },
  {
    week: "Week 3",
    day: "Day 7",
    title: "CPR and First Aid",
    description:
      "Understand the importance of CPR/First Aid and prepare for external certification.",
    sessionPlan: "2-hour trainer-led session plus external certification.",
  },
  {
    week: "Week 3",
    day: "Day 8",
    title: "Career Search for Healthcare Workers",
    description:
      "Learn how to identify healthcare jobs, read job descriptions, and track applications.",
    sessionPlan: "2-hour trainer-led session using HireMinds tools.",
  },
  {
    week: "Week 3",
    day: "Day 9",
    title: "Resume, Cover Letters and Interview Prep",
    description:
      "Use HireMinds tools to build resumes, create letters, and prepare for interviews.",
    sessionPlan: "2-hour trainer-led session using the Career ToolKit.",
  },
];

export default function SkillsQuestPage() {
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

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

      const map: Record<string, boolean> = {};

      trainingDays.forEach((day) => {
        day.modules?.forEach((module) => {
          map[module.completionKey] =
            localStorage.getItem(module.completionKey) === "true";
        });
      });

      setAllowed(userReferralCode === REQUIRED_CODE);
      setCompletedMap(map);
      setChecked(true);
    }

    checkAccess();
  }, []);

  function isDayComplete(day: TrainingDay) {
    if (!day.modules || day.modules.length === 0) return false;
    return day.modules.every((module) => completedMap[module.completionKey]);
  }

  function completedCount(day: TrainingDay) {
    if (!day.modules) return 0;
    return day.modules.filter((module) => completedMap[module.completionKey])
      .length;
  }

  if (!checked) {
    return <main style={styles.main}>Loading SkillsQuest...</main>;
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

  const activeDays = trainingDays.filter((day) => day.modules?.length).length;
  const completedDays = trainingDays.filter((day) => isDayComplete(day)).length;

  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <p style={styles.kicker}>HireMinds Learning Hub</p>
        <h1 style={styles.title}>SkillsQuest</h1>
        <p style={styles.subtitle}>
          Healthcare Career Orientation • 3 Weeks • 9 Sessions • 18 Training
          Hours
        </p>
      </section>

      <section style={styles.programHero}>
        <div>
          <p style={styles.programLabel}>MedScope Track</p>
          <h2 style={styles.programTitle}>
            Healthcare Career Orientation for SCSEP Participants
          </h2>
          <p style={styles.programText}>
            A trainer-led healthcare readiness pathway with timed study modules,
            guided demonstrations, practice activities, assessments, and
            certificates.
          </p>
        </div>

        <div style={styles.progressCard}>
          <strong>Program Progress</strong>
          <span style={styles.progressNumber}>
            {completedDays}/{activeDays}
          </span>
          <small>active training days completed</small>
        </div>
      </section>

      <section style={styles.weekGrid}>
        {["Week 1", "Week 2", "Week 3"].map((week) => (
          <div key={week} style={styles.weekCard}>
            <h2 style={styles.weekTitle}>{week}</h2>

            {trainingDays
              .filter((day) => day.week === week)
              .map((day) => {
                const hasModules = Boolean(day.modules?.length);
                const dayComplete = isDayComplete(day);
                const count = completedCount(day);
                const total = day.modules?.length || 0;

                return (
                  <div key={`${day.week}-${day.day}`} style={styles.moduleCard}>
                    <div style={styles.moduleTop}>
                      <span style={styles.dayBadge}>{day.day}</span>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(dayComplete
                            ? styles.completeBadge
                            : hasModules
                            ? styles.activeBadge
                            : styles.trainerBadge),
                        }}
                      >
                        {dayComplete
                          ? "Assessment Unlocked"
                          : hasModules
                          ? `${count}/${total} Modules Complete`
                          : "Trainer Led"}
                      </span>
                    </div>

                    <h3 style={styles.moduleTitle}>{day.title}</h3>
                    <p style={styles.moduleText}>{day.description}</p>
                    <p style={styles.sessionPlan}>{day.sessionPlan}</p>

                    {hasModules ? (
                      <>
                        <div style={styles.studyList}>
                          {day.modules?.map((module) => {
                            const moduleComplete =
                              completedMap[module.completionKey];

                            return (
                              <Link
                                key={module.completionKey}
                                href={module.href}
                                style={{
                                  ...styles.studyModule,
                                  ...(moduleComplete
                                    ? styles.studyModuleComplete
                                    : {}),
                                }}
                              >
                                <span>{module.title}</span>
                                <strong>
                                  {moduleComplete ? "Done" : "Start"}
                                </strong>
                              </Link>
                            );
                          })}
                        </div>

                        <div style={styles.buttonGroup}>
                          {dayComplete ? (
                            <Link
                              href={day.assessmentHref || "#"}
                              style={styles.secondaryButton}
                            >
                              Start Assessment
                            </Link>
                          ) : (
                            <span style={styles.lockedButton}>
                              Assessment Locked Until All Modules Are Complete
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <span style={styles.lockedButton}>
                        Trainer-Led Session
                      </span>
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
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
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
  trainerBadge: {
    background: "rgba(255,255,255,.09)",
    color: "rgba(255,255,255,.65)",
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
  sessionPlan: {
    color: "rgba(255,255,255,.55)",
    fontSize: 13,
    lineHeight: 1.5,
    marginTop: 8,
  },
  studyList: {
    display: "grid",
    gap: 8,
    marginTop: 14,
  },
  studyModule: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    background: "rgba(255,255,255,.08)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 12,
    padding: "10px 12px",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: 13,
  },
  studyModuleComplete: {
    background: "rgba(125,255,179,.13)",
    border: "1px solid rgba(125,255,179,.25)",
  },
  buttonGroup: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 12,
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
  lockCard: {
    maxWidth: 650,
    margin: "100px auto",
    padding: 30,
    borderRadius: 22,
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
  },
};
