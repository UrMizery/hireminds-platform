"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type PlanKey = "annual" | "four_month" | "monthly";

const PLANS: Array<{
  key: PlanKey;
  title: string;
  price: string;
  billing: string;
  equivalent: string;
  badge?: string;
  details: string[];
}> = [
  {
    key: "annual",
    title: "Annual",
    price: "$179.88",
    billing: "per year - paid in full",
    equivalent: "$14.99/mo equivalent",
    badge: "BEST VALUE",
    details: [
      "12 months of access",
      "Lowest monthly equivalent",
      "Save $120 vs. monthly plan",
    ],
  },
  {
    key: "four_month",
    title: "4-Month Plan",
    price: "$79.96",
    billing: "every 4 months",
    equivalent: "$19.99/mo equivalent",
    badge: "SAVE 20%",
    details: [
      "Recurring 4-month billing",
      "Lower cost than monthly",
      "Save $60 per year vs. monthly",
    ],
  },
  {
    key: "monthly",
    title: "Monthly",
    price: "$24.99",
    billing: "per month",
    equivalent: "Flexible monthly access",
    badge: "FLEXIBLE",
    details: [
      "Automatic monthly payment",
      "No annual upfront payment",
      "Regular monthly rate",
    ],
  },
];

export default function AccessPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [showInactiveNotice, setShowInactiveNotice] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data.user) {
        router.replace("/sign-in");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      setShowInactiveNotice(params.get("reason") === "inactive");
      setLoadingUser(false);
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  const canSubmitReferral = useMemo(
    () => referralCode.trim().length > 0 && !validatingCode,
    [referralCode, validatingCode]
  );

  async function handleReferralSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    const code = referralCode.trim();

    if (!code) {
      setMessage("Enter your referral code.");
      setMessageType("error");
      return;
    }

    try {
      setValidatingCode(true);

      const response = await fetch("/api/access/validate-referral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referralCode: code,
        }),
      });

      const raw = await response.text();

      let data: {
        ok?: boolean;
        error?: string;
        next?: string;
      } = {};

      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ||
            "That referral code could not be verified. Please check the code and try again."
        );
      }

      setMessage("Referral code accepted. Continue to the HireMinds consent form.");
      setMessageType("success");

      router.push(data.next || "/access/consent");
    } catch (error: any) {
      setMessage(
        error?.message ||
          "That referral code could not be verified. Please try again."
      );
      setMessageType("error");
    } finally {
      setValidatingCode(false);
    }
  }

  function choosePlan(plan: PlanKey) {
    router.push(`/access/paid?plan=${encodeURIComponent(plan)}`);
  }

  if (loadingUser) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingCard}>Loading HireMinds access options...</div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <div style={styles.brandMark}>HM</div>

          <div>
            <p style={styles.kicker}>HireMinds Access</p>
            <h1 style={styles.title}>Choose how you want to continue.</h1>
            <p style={styles.subtitle}>
              Subscribe directly or use an approved referral code for no-cost access.
            </p>
          </div>
        </header>

        {showInactiveNotice ? (
          <section style={styles.notice}>
            <div style={styles.noticeIcon}>!</div>
            <div>
              <h2 style={styles.noticeTitle}>Your HireMinds access needs to be refreshed.</h2>
              <p style={styles.noticeText}>
                Your current HireMinds access is available through{" "}
                <strong>December 31, 2026</strong>. Because your account has not
                been used in more than 3 weeks, please enter an approved referral
                code or choose a subscription to continue.
              </p>
            </div>
          </section>
        ) : null}

        <section style={styles.referralCard}>
          <div style={styles.referralTop}>
            <div>
              <p style={styles.sectionEyebrow}>NO-COST ACCESS</p>
              <h2 style={styles.sectionTitle}>Have a Referral Code?</h2>
              <p style={styles.sectionText}>
                Approved referral-code access does not require payment.
              </p>
            </div>

            <div style={styles.freePill}>$0</div>
          </div>

          <div style={styles.requestBox}>
            <strong>Need a referral code?</strong>
            <span>
              Text <strong>959-595-1595</strong> to request one.
            </span>
          </div>

          <form onSubmit={handleReferralSubmit} style={styles.referralForm}>
            <label htmlFor="referral-code" style={styles.label}>
              Referral Code
            </label>

            <div style={styles.inputRow}>
              <input
                id="referral-code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral code"
                autoComplete="off"
                spellCheck={false}
                style={styles.input}
              />

              <button
                type="submit"
                disabled={!canSubmitReferral}
                style={{
                  ...styles.referralButton,
                  opacity: canSubmitReferral ? 1 : 0.55,
                  cursor: canSubmitReferral ? "pointer" : "not-allowed",
                }}
              >
                {validatingCode ? "Checking..." : "Apply Code"}
              </button>
            </div>
          </form>

          <p style={styles.consentNote}>
            Referral-code users must complete the HireMinds consent form before
            access is restored or activated.
          </p>

          {message ? (
            <div
              style={{
                ...styles.message,
                ...(messageType === "success"
                  ? styles.successMessage
                  : styles.errorMessage),
              }}
            >
              {message}
            </div>
          ) : null}
        </section>

        <div style={styles.orRow}>
          <span style={styles.orLine} />
          <span style={styles.orText}>OR CHOOSE A PAID PLAN</span>
          <span style={styles.orLine} />
        </div>

        <section style={styles.pricingSection}>
          <div style={styles.pricingHeading}>
            <div>
              <p style={styles.sectionEyebrow}>SUBSCRIPTION ACCESS</p>
              <h2 style={styles.sectionTitle}>HireMinds Pricing Options</h2>
            </div>

            <p style={styles.pricingIntro}>
              Longer commitments lower the effective monthly price.
            </p>
          </div>

          <div style={styles.planGrid}>
            {PLANS.map((plan) => (
              <article
                key={plan.key}
                style={{
                  ...styles.planCard,
                  ...(plan.key === "annual" ? styles.featuredPlan : {}),
                }}
              >
                {plan.badge ? <div style={styles.planBadge}>{plan.badge}</div> : null}

                <h3 style={styles.planTitle}>{plan.title}</h3>
                <div style={styles.price}>{plan.price}</div>
                <div style={styles.billing}>{plan.billing}</div>
                <div style={styles.equivalent}>{plan.equivalent}</div>

                <ul style={styles.list}>
                  {plan.details.map((detail) => (
                    <li key={detail} style={styles.listItem}>
                      {detail}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => choosePlan(plan.key)}
                  style={{
                    ...styles.planButton,
                    ...(plan.key === "annual" ? styles.featuredButton : {}),
                  }}
                >
                  Choose {plan.title}
                </button>
              </article>
            ))}
          </div>

          <div style={styles.ageNotice}>
            Paid subscribers will be required to confirm that they are{" "}
            <strong>18 years of age or older</strong> before completing payment.
            The full referral consent form is not required for paid subscriptions.
          </div>
        </section>

        <footer style={styles.footer}>
          <p style={styles.footerMain}>$24.99 → $19.99 → $14.99</p>
          <p style={styles.footerText}>Commit longer. Pay less per month.</p>
        </footer>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(23, 113, 230, 0.17), transparent 34%), #05070a",
    color: "#ffffff",
    padding: "36px 18px 60px",
    boxSizing: "border-box",
  },

  shell: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
  },

  loadingCard: {
    width: "100%",
    maxWidth: "520px",
    margin: "140px auto 0",
    padding: "26px",
    borderRadius: "18px",
    border: "1px solid #222b38",
    backgroundColor: "#0d1117",
    textAlign: "center",
    color: "#dbe7f5",
    fontWeight: 700,
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginBottom: "28px",
  },

  brandMark: {
    width: "64px",
    height: "64px",
    minWidth: "64px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #1683ff, #75b8ff)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: "23px",
    boxShadow: "0 12px 30px rgba(22, 131, 255, 0.25)",
  },

  kicker: {
    margin: "0 0 5px",
    color: "#69adff",
    fontSize: "13px",
    letterSpacing: "0.12em",
    fontWeight: 800,
    textTransform: "uppercase",
  },

  title: {
    margin: 0,
    fontSize: "clamp(30px, 5vw, 46px)",
    lineHeight: 1.06,
    fontWeight: 900,
  },

  subtitle: {
    margin: "10px 0 0",
    color: "#a9b6c7",
    fontSize: "16px",
    lineHeight: 1.6,
  },

  notice: {
    display: "flex",
    gap: "15px",
    border: "1px solid rgba(255, 193, 7, 0.38)",
    backgroundColor: "rgba(255, 193, 7, 0.08)",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "22px",
  },

  noticeIcon: {
    width: "34px",
    height: "34px",
    minWidth: "34px",
    borderRadius: "50%",
    backgroundColor: "#ffc107",
    color: "#111111",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: 900,
  },

  noticeTitle: {
    margin: "0 0 6px",
    fontSize: "18px",
  },

  noticeText: {
    margin: 0,
    color: "#f0dfb0",
    lineHeight: 1.6,
    fontSize: "14px",
  },

  referralCard: {
    border: "1px solid #1f8bff",
    background:
      "linear-gradient(180deg, rgba(24, 75, 134, 0.28), rgba(10, 14, 20, 0.98))",
    borderRadius: "22px",
    padding: "26px",
    boxShadow: "0 18px 46px rgba(0, 0, 0, 0.25)",
  },

  referralTop: {
    display: "flex",
    gap: "16px",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  sectionEyebrow: {
    margin: "0 0 6px",
    color: "#72b5ff",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.13em",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "27px",
    fontWeight: 900,
  },

  sectionText: {
    color: "#afbdd0",
    lineHeight: 1.55,
    margin: "8px 0 0",
  },

  freePill: {
    border: "1px solid rgba(114, 181, 255, 0.5)",
    borderRadius: "999px",
    padding: "9px 15px",
    color: "#a9d3ff",
    fontWeight: 900,
    backgroundColor: "rgba(20, 115, 225, 0.12)",
  },

  requestBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "20px",
    padding: "14px 16px",
    borderRadius: "14px",
    backgroundColor: "#0b1119",
    border: "1px solid #213044",
    color: "#dce8f5",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  referralForm: {
    marginTop: "18px",
  },

  label: {
    display: "block",
    fontSize: "13px",
    color: "#dce8f5",
    fontWeight: 800,
    marginBottom: "8px",
  },

  inputRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  input: {
    flex: "1 1 280px",
    minWidth: 0,
    padding: "14px 16px",
    backgroundColor: "#080b10",
    border: "1px solid #30445c",
    borderRadius: "13px",
    color: "#ffffff",
    outline: "none",
    fontSize: "15px",
  },

  referralButton: {
    padding: "14px 22px",
    borderRadius: "13px",
    border: "none",
    backgroundColor: "#1683ff",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 900,
  },

  consentNote: {
    margin: "13px 0 0",
    color: "#9eabbc",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  message: {
    marginTop: "14px",
    padding: "12px 14px",
    borderRadius: "12px",
    fontSize: "13px",
    lineHeight: 1.45,
    fontWeight: 700,
  },

  errorMessage: {
    backgroundColor: "rgba(235, 87, 87, 0.1)",
    border: "1px solid rgba(235, 87, 87, 0.32)",
    color: "#ffb6b6",
  },

  successMessage: {
    backgroundColor: "rgba(46, 204, 113, 0.08)",
    border: "1px solid rgba(46, 204, 113, 0.3)",
    color: "#9df0bf",
  },

  orRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    margin: "29px 0",
  },

  orLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#222b36",
  },

  orText: {
    color: "#7f8b9b",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.12em",
    whiteSpace: "nowrap",
  },

  pricingSection: {
    border: "1px solid #1c2631",
    backgroundColor: "rgba(10, 14, 20, 0.96)",
    borderRadius: "22px",
    padding: "26px",
  },

  pricingHeading: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    flexWrap: "wrap",
    alignItems: "flex-end",
    marginBottom: "22px",
  },

  pricingIntro: {
    margin: 0,
    maxWidth: "370px",
    color: "#9ba8b9",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  planGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(245px, 1fr))",
    gap: "16px",
  },

  planCard: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    minHeight: "390px",
    padding: "22px",
    borderRadius: "18px",
    backgroundColor: "#0c1118",
    border: "1px solid #26313e",
  },

  featuredPlan: {
    border: "1px solid #1683ff",
    boxShadow: "0 10px 35px rgba(22, 131, 255, 0.15)",
  },

  planBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#15263b",
    color: "#84c2ff",
    border: "1px solid #23466d",
    padding: "6px 9px",
    borderRadius: "999px",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.08em",
    marginBottom: "14px",
  },

  planTitle: {
    margin: 0,
    textTransform: "uppercase",
    fontSize: "14px",
    letterSpacing: "0.07em",
    color: "#d6e4f3",
  },

  price: {
    fontSize: "35px",
    fontWeight: 900,
    marginTop: "14px",
  },

  billing: {
    color: "#aab8c8",
    fontSize: "13px",
    marginTop: "3px",
  },

  equivalent: {
    color: "#6eb1ff",
    fontWeight: 800,
    marginTop: "10px",
    fontSize: "13px",
  },

  list: {
    paddingLeft: "18px",
    margin: "20px 0 24px",
    color: "#aab6c6",
    fontSize: "13px",
    lineHeight: 1.65,
  },

  listItem: {
    marginBottom: "7px",
  },

  planButton: {
    marginTop: "auto",
    padding: "13px 15px",
    borderRadius: "12px",
    border: "1px solid #334355",
    backgroundColor: "#121922",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: "13px",
  },

  featuredButton: {
    backgroundColor: "#1683ff",
    border: "1px solid #1683ff",
  },

  ageNotice: {
    marginTop: "20px",
    borderRadius: "14px",
    backgroundColor: "#080c12",
    border: "1px solid #202b37",
    padding: "14px 16px",
    color: "#97a5b5",
    fontSize: "12px",
    lineHeight: 1.55,
  },

  footer: {
    textAlign: "center",
    paddingTop: "30px",
  },

  footerMain: {
    margin: 0,
    fontWeight: 900,
    color: "#7abaff",
    fontSize: "18px",
  },

  footerText: {
    margin: "6px 0 0",
    color: "#7d8998",
    fontSize: "13px",
  },
};
