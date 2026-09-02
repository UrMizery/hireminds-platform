"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const PLACEHOLDER_REFERRAL_CODES = [
  "PATHWAY2026",
  "SKILLSQUEST2026",
];

const modules = [
  {
    title: "Module 1: Resume Basics",
    description:
      "Healthcare-focused resume basics, transferable skills, and job-ready resume language.",
    href: "/career-readiness-demo/module-1",
    completionKey: "twp_career_readiness_module_1",
  },
  {
    title: "Module 2: Job Description + Cover Letter",
    description:
      "Read healthcare job postings, identify keywords, and prepare a short professional cover letter.",
    href: "/career-readiness-demo/module-2",
    completionKey: "twp_career_readiness_module_2",
  },
  {
    title: "Module 3: Interview + Professionalism",
    description:
      "Practice interview readiness, professional communication, workplace expectations, and follow-through.",
    href: "/career-readiness-demo/module-3",
    completionKey: "twp_career_readiness_module_3",
  },
];

export default function CareerReadinessHubPage() {
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user?.email) {
        setAllowed(false);
        setChecked(true);
        return;
      }

      const normalizedEmail = user.email.trim().toLowerCase();

      const [partnerResult, candidateResult] = await Promise.all([
        supabase
          .from("partners")
          .select("account_type, contact_email")
          .eq("contact_email", normalizedEmail)
          .maybeSingle(),

        supabase
          .from("candidate_profiles")
          .select("referral_code")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (partnerResult.error) {
        console.error(
          "Career Readiness partner access check failed:",
          partnerResult.error
        );
      }

      if (candidateResult.error) {
        console.error(
          "Career Readiness candidate access check failed:",
          candidateResult.error
        );
      }

      const accountType = String(
        partnerResult.data?.account_type || ""
      )
        .trim()
        .toLowerCase();

      const isSuperAdmin = accountType === "super_admin";

      const userReferralCode = String(
        candidateResult.data?.referral_code ||
          user.app_metadata?.referral_code ||
          user.user_metadata?.referral_code ||
          user.user_metadata?.referralCode ||
          user.user_metadata?.access_code ||
          ""
      )
        .trim()
        .toUpperCase();

      setAllowed(
        isSuperAdmin ||
          PLACEHOLDER_REFERRAL_CODES.includes(userReferralCode)
      );

      setChecked(true);
    }

    checkAccess();
  }, []);

  useEffect(() => {
    if (!allowed) return;

    const refreshCompletion = () => {
      const map: Record<string, boolean> = {};

      modules.forEach((module) => {
        map[module.completionKey] =
          localStorage.getItem(module.completionKey) === "true";
      });

      setCompletedMap(map);
    };

    refreshCompletion();

    window.addEventListener("focus", refreshCompletion);

    return () => {
      window.removeEventListener("focus", refreshCompletion);
    };
  }, [allowed]);

  function isUnlocked(index: number) {
    if (index === 0) return true;

    return completedMap[modules[index - 1].completionKey] === true;
  }

  const allComplete = modules.every(
    (module) => completedMap[module.completionKey] === true
  );

  if (!checked) {
    return (
      <main style={styles.main}>
        Loading Career Readiness...
      </main>
    );
  }

  if (!allowed) {
    return (
      <main style={styles.main}>
        <section style={styles.lockCard}>
          <p style={styles.kicker}>
            Restricted Learning Area
          </p>

          <h1 style={styles.title}>
            Career Readiness Locked
          </h1>

          <p style={styles.subtitle}>
            This training area is currently available only to approved
            Career Pathway and SkillsQuest participants.
          </p>

          <Link href="/" style={styles.lockButton}>
            Return Home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <section style={styles.card}>
        <p style={styles.kicker}>
          Career Pathway • Day 2
        </p>

        <h1 style={styles.title}>
          Career Readiness Training
        </h1>

        <p style={styles.subtitle}>
          Complete each Career Readiness module in order. Each module includes
          a 30-second demo study guide. After all three modules are complete,
          the final Career Readiness assessment unlocks.
        </p>

        <div style={styles.moduleList}>
          {modules.map((module, index) => {
            const complete = completedMap[module.completionKey];
            const unlocked = isUnlocked(index);

            if (!unlocked) {
              return (
                <div
                  key={module.completionKey}
                  style={styles.lockedModule}
                >
                  <div>
                    <h3 style={styles.moduleTitle}>
                      {module.title}
                    </h3>

                    <p style={styles.moduleText}>
                      {module.description}
                    </p>
                  </div>

                  <strong>
                    Locked
                  </strong>
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
                  <h3 style={styles.moduleTitle}>
                    {module.title}
                  </h3>

                  <p style={styles.moduleText}>
                    {module.description}
                  </p>
                </div>

                <strong>
                  {complete ? "Done" : "Start"}
                </strong>
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
            <span style={styles.lockedButton}>
              Final Assessment Locked
            </span>
          )}

          <Link
            href="/skillsquest"
            style={styles.secondaryButton}
          >
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

  lockedButton: {
    background: "rgba(255,255,255,.09)",
    color: "rgba(255,255,255,.68)",
    padding: "12px 16px",
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

  lockButton: {
    display: "inline-block",
    marginTop: 18,
    background: "#ffffff",
    color: "#000000",
    padding: "12px 18px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 900,
  },
};
