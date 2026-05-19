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
  demoHref?: string;
};

const trainingDays: TrainingDay[] = [
  {
    week: "Week 1",
    day: "Day 1",
    title: "Orientation + Platform Navigation",
    description:
      "Welcome to HireMinds, course expectations, platform navigation, healthcare pathway overview, goals, and pre-assessment.",
    sessionPlan: "Demo Mode • 30-second accelerated unlock.",
    demoHref: "/orientation-demo",
  },
  {
    week: "Week 1",
    day: "Day 2",
    title: "Career Readiness Training",
    description:
      "Healthcare-focused resume basics, cover letter preparation, interview practice, professionalism, and workplace expectations.",
    sessionPlan: "Demo Mode • 30-second accelerated unlock.",
    demoHref: "/career-readiness-demo",
  },
  {
    week: "Week 1",
    day: "Day 3",
    title: "CPR + First Aid Awareness",
    description:
      "Emergency response awareness, choking response, adult CPR awareness, stroke and cardiac emergency recognition, and certification pathway discussion.",
    sessionPlan: "Demo Mode • 30-second accelerated unlock.",
    demoHref: "/cpr-first-aid-demo",
  },
  {
    week: "Week 2",
    day: "Day 4",
    title: "Customer Service Methodology",
    description:
      "Active listening, empathy, de-escalation, service recovery, patient interaction examples, and documentation of service interactions.",
    sessionPlan: "Demo Mode • 30-second accelerated unlock.",
    demoHref: "/customer-service-demo",
  },
  {
    week: "Week 2",
    day: "Day 5",
    title: "Introduction to Medical Terminology",
    description:
      "Common medical roots, prefixes, suffixes, and terminology relevant to home care, geriatrics, and community health settings.",
    sessionPlan:
      "5 demo study guides. Each guide unlocks after the previous one is completed. Assessment unlocks after all 5 are complete.",
    assessmentHref: "/medical-terminology-assessment",
    modules: [
      {
        title: "Demo Guide 1: How Medical Words Are Built",
        href: "/medical-terminology/module-1",
        completionKey: "medicalTerminology_module_1",
      },
      {
        title: "Demo Guide 2: Common Prefixes",
        href: "/medical-terminology/module-2",
        completionKey: "medicalTerminology_module_2",
      },
      {
        title: "Demo Guide 3: Root Words",
        href: "/medical-terminology/module-3",
        completionKey: "medicalTerminology_module_3",
      },
      {
        title: "Demo Guide 4: Common Suffixes",
        href: "/medical-terminology/module-4",
        completionKey: "medicalTerminology_module_4",
      },
      {
        title: "Demo Guide 5: Practice Terms",
        href: "/medical-terminology/module-5",
        completionKey: "medicalTerminology_module_5",
      },
    ],
  },
  {
    week: "Week 2",
    day: "Day 6",
    title: "Introduction to Healthcare Careers",
    description:
      "Entry-level healthcare roles, Community Health Workers, Direct Support Professionals, daily responsibilities, work environments, and career pathways.",
    sessionPlan: "Demo Mode • 30-second accelerated unlock.",
    demoHref: "/healthcare-careers-demo",
  },
  {
    week: "Week 3",
    day: "Day 7",
    title: "Foundations in Home & Community-Based Healthcare",
    description:
      "Home visit safety protocols, patient rights, privacy, dignity, autonomy, care-team roles, and interdisciplinary healthcare support.",
    sessionPlan: "Demo Mode • 30-second accelerated unlock.",
    demoHref: "/home-community-healthcare-demo",
  },
  {
    week: "Week 3",
    day: "Day 8",
    title: "Career Search for Healthcare Workers",
    description:
      "Healthcare-specific job boards, reputable local employers, application requirements, background checks, drug screening, and healthcare hiring readiness.",
    sessionPlan: "Demo Mode • 30-second accelerated unlock.",
    demoHref: "/healthcare-job-search-demo",
  },
  {
    week: "Week 3",
    day: "Day 9",
    title: "Career Readiness Review",
    description:
      "Healthcare-focused resume review, cover letter review, mock interview practice, terminology recap, and final employment preparation.",
    sessionPlan: "Demo Mode • 30-second accelerated unlock.",
    demoHref: "/career-readiness-review-demo",
  },
];

const weekDetails = {
  "Week 1": {
    title: "Healthcare Foundations",
    description:
      "Participants begin with orientation, platform navigation, career readiness, CPR/First Aid awareness, and foundational workforce preparation.",
  },
  "Week 2": {
    title: "Communication + Healthcare Knowledge",
    description:
      "Participants strengthen communication skills, customer service methodology, medical terminology, and awareness of entry-level healthcare career pathways.",
  },
  "Week 3": {
    title: "Community Healthcare + Employment Preparation",
    description:
      "Participants explore home and community-based healthcare, healthcare job search strategies, and final career readiness preparation.",
  },
};

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
        user?.app_metadata?.referral_code ||
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

  function isModuleUnlocked(day: TrainingDay, index: number) {
    if (!day.modules) return false;
    if (index === 0) return true;

    const previousModule = day.modules[index - 1];
    return completedMap[previousModule.completionKey] === true;
  }

  if (!checked) {
    return <main style={styles.main}>Loading Career Pathway...</main>;
  }

  if (!allowed) {
    return (
      <main style={styles.main}>
        <section style={styles.lockCard}>
          <p style={styles.kicker}>Restricted Learning Area</p>
          <h1 style={styles.title}>Career Pathway Locked</h1>
          <p style={styles.subtitle}>
            This learning area is currently available only to approved TWP2026
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
        <p style={styles.kicker}>TWP2026 Career Pathway</p>
        <h1 style={styles.title}>3-Week Career Pathway Program</h1>
        <p style={styles.subtitle}>
          This instructor-led healthcare careers orientation supports
          participants as they build healthcare awareness, workplace readiness,
          customer service skills, medical terminology knowledge, and employment
          preparation through live training, guided demo study guides,
          assessments, and certificate-based completion.
        </p>

        <div style={styles.overviewGrid}>
          <div style={styles.overviewCard}>
            <strong>3 Weeks</strong>
            <span>Healthcare careers orientation</span>
          </div>
          <div style={styles.overviewCard}>
            <strong>9 Sessions</strong>
            <span>Tuesday, Wednesday, Thursday</span>
          </div>
          <div style={styles.overviewCard}>
            <strong>9:00 AM - 11:00 AM</strong>
            <span>Instructor-led training</span>
          </div>
          <div style={styles.overviewCard}>
            <strong>
              {completedDays}/{activeDays}
            </strong>
            <span>assessment-based days complete</span>
          </div>
        </div>
      </section>

      <section style={styles.programNote}>
        <p style={styles.noteLabel}>Program Focus</p>
        <h2 style={styles.noteTitle}>
          Healthcare Careers Orientation + Employment Readiness
        </h2>
        <p style={styles.noteText}>
          This pathway is aligned to the updated Healthcare Careers Orientation
          Training Syllabus. Participants move through orientation, career
          readiness, CPR and First Aid awareness, customer service methodology,
          medical terminology, healthcare career exploration, home and
          community-based healthcare foundations, healthcare job search, and
          final career readiness review.
        </p>
      </section>

      <section style={styles.weekStack}>
        {["Week 1", "Week 2", "Week 3"].map((week) => {
          const info = weekDetails[week as keyof typeof weekDetails];

          return (
            <div key={week} style={styles.weekCard}>
              <div style={styles.weekHeader}>
                <p style={styles.weekLabel}>{week}</p>
                <h2 style={styles.weekTitle}>{info.title}</h2>
                <p style={styles.weekDescription}>{info.description}</p>
              </div>

              <div style={styles.guideGrid}>
                {trainingDays
                  .filter((day) => day.week === week)
                  .map((day) => {
                    const hasModules = Boolean(day.modules?.length);
                    const dayComplete = isDayComplete(day);
                    const count = completedCount(day);
                    const total = day.modules?.length || 0;

                    return (
                      <div key={`${day.week}-${day.day}`} style={styles.guideCard}>
                        <div>
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
                                ? `${count}/${total} Demo Guides Complete`
                                : "Demo Mode • 30 Sec"}
                            </span>
                          </div>

                          <h3 style={styles.guideTitle}>{day.title}</h3>
                          <p style={styles.guideText}>{day.description}</p>
                          <p style={styles.sessionPlan}>{day.sessionPlan}</p>

                          {hasModules ? (
                            <div style={styles.studyList}>
                              {day.modules?.map((module, index) => {
                                const moduleComplete =
                                  completedMap[module.completionKey];
                                const unlocked = isModuleUnlocked(day, index);

                                if (!unlocked) {
                                  return (
                                    <div
                                      key={module.completionKey}
                                      style={styles.studyModuleLocked}
                                    >
                                      <span>{module.title}</span>
                                      <strong>Locked</strong>
                                    </div>
                                  );
                                }

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
                          ) : null}
                        </div>

                        <div style={styles.buttonGroup}>
                          {hasModules ? (
                            dayComplete ? (
                              <Link
                                href={day.assessmentHref || "#"}
                                style={styles.secondaryButton}
                              >
                                Start Assessment
                              </Link>
                            ) : (
                              <span style={styles.lockedButton}>
                                Assessment Locked
                              </span>
                            )
                          ) : day.demoHref ? (
                            <Link href={day.demoHref} style={styles.secondaryButton}>
                              Demo →
                            </Link>
                          ) : (
                            <span style={styles.lockedButton}>
                              Demo Training Card
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
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
    margin: "0 auto 30px",
  },
  kicker: {
    color: "#7db7ff",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1.3,
    fontSize: 12,
  },
  title: {
    fontSize: 48,
    fontWeight: 950,
    margin: "8px 0",
  },
  subtitle: {
    color: "rgba(255,255,255,.76)",
    lineHeight: 1.7,
    maxWidth: 980,
    fontSize: 16,
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 14,
    marginTop: 22,
    maxWidth: 1050,
  },
  overviewCard: {
    display: "grid",
    gap: 6,
    padding: 18,
    borderRadius: 18,
    background: "rgba(255,255,255,.07)",
    border: "1px solid rgba(255,255,255,.12)",
  },
  programNote: {
    maxWidth: 1180,
    margin: "0 auto 24px",
    padding: 22,
    borderRadius: 22,
    background:
      "linear-gradient(135deg, rgba(10,132,255,.18), rgba(255,255,255,.055))",
    border: "1px solid rgba(125,183,255,.18)",
  },
  noteLabel: {
    color: "#9ed0ff",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
    margin: 0,
  },
  noteTitle: {
    fontSize: 28,
    margin: "8px 0",
  },
  noteText: {
    color: "rgba(255,255,255,.76)",
    lineHeight: 1.7,
    maxWidth: 980,
  },
  weekStack: {
    maxWidth: 1180,
    margin: "0 auto",
    display: "grid",
    gap: 22,
  },
  weekCard: {
    padding: 22,
    borderRadius: 24,
    background: "rgba(255,255,255,.055)",
    border: "1px solid rgba(255,255,255,.12)",
  },
  weekHeader: {
    marginBottom: 18,
  },
  weekLabel: {
    color: "#9ed0ff",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
    margin: 0,
  },
  weekTitle: {
    fontSize: 28,
    margin: "6px 0",
  },
  weekDescription: {
    color: "rgba(255,255,255,.72)",
    lineHeight: 1.6,
    maxWidth: 940,
  },
  guideGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,minmax(0,1fr))",
    gap: 16,
  },
  guideCard: {
    minHeight: 300,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    background: "rgba(0,0,0,.30)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 18,
    padding: 20,
    color: "#ffffff",
  },
  moduleTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
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
    whiteSpace: "nowrap",
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
  guideTitle: {
    fontSize: 22,
    margin: "0 0 10px",
  },
  guideText: {
    color: "rgba(255,255,255,.76)",
    lineHeight: 1.6,
    marginBottom: 12,
  },
  sessionPlan: {
    color: "rgba(255,255,255,.58)",
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
  studyModuleLocked: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 12,
    padding: "10px 12px",
    color: "rgba(255,255,255,.45)",
    fontSize: 13,
  },
  buttonGroup: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 16,
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
