"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type AccessMethod = "subscription" | "referral";
type PlanKey = "annual" | "four_month" | "monthly";

const PLANS: Array<{
  key: PlanKey;
  title: string;
  price: string;
  billing: string;
  equivalent: string;
  badge?: string;
}> = [
  {
    key: "annual",
    title: "Annual",
    price: "$179.88",
    billing: "per year - paid in full",
    equivalent: "$14.99/mo equivalent",
    badge: "BEST VALUE",
  },
  {
    key: "four_month",
    title: "4-Month Plan",
    price: "$79.96",
    billing: "every 4 months",
    equivalent: "$19.99/mo equivalent",
    badge: "SAVE 20%",
  },
  {
    key: "monthly",
    title: "Monthly",
    price: "$24.99",
    billing: "per month",
    equivalent: "Flexible monthly access",
    badge: "FLEXIBLE",
  },
];

export default function AccessPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] = useState(true);
  const [accessMethod, setAccessMethod] =
    useState<AccessMethod>("subscription");
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("annual");
  const [referralCode, setReferralCode] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success" | "">("");
  const [loading, setLoading] = useState(false);

  const selectedPlanDetails = useMemo(
    () => PLANS.find((plan) => plan.key === selectedPlan),
    [selectedPlan]
  );

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data.user) {
        router.replace("/signup");
        return;
      }

      setLoadingUser(false);
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function validateReferralCode(code: string) {
    const response = await fetch("/api/access/validate-referral", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referralCode: code,
        mode: "existing_user",
      }),
    });

    const raw = await response.text();

    let data: {
      ok?: boolean;
      error?: string;
      normalizedCode?: string;
      expiresAt?: string | null;
    } = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }

    if (!response.ok || !data.ok) {
      throw new Error(
        data.error ||
          "This referral code is not active or recognized. Please check the code and try again."
      );
    }

    return data;
  }

  async function handleContinue(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setMessage("");
    setMessageType("");

    try {
      setLoading(true);

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        throw new Error("Please sign in again to continue.");
      }

      const user = authData.user;

      if (accessMethod === "referral") {
        const code = referralCode.trim();

        if (!code) {
          throw new Error("Please enter your referral code.");
        }

        const referral = await validateReferralCode(code);

        const normalizedReferralCode =
          referral.normalizedCode || code.toUpperCase();

        /*
          Store only pending access details here.
          Referral access becomes active AFTER the user signs the consent form.
        */
        const { error: updateError } = await supabase
          .from("candidate_profiles")
          .update({
            subscription_referral_code: normalizedReferralCode,
            has_referral_access: false,
            has_paid_access: false,
            access_tier: "pending_referral_consent",
          })
          .eq("user_id", user.id);

        if (updateError) {
          throw new Error(updateError.message);
        }

        try {
          localStorage.setItem(
            "hireminds_pending_referral_code",
            normalizedReferralCode
          );

          if (referral.expiresAt) {
            localStorage.setItem(
              "hireminds_pending_referral_expires_at",
              referral.expiresAt
            );
          } else {
            localStorage.removeItem(
              "hireminds_pending_referral_expires_at"
            );
          }
        } catch {
          // localStorage is only a convenience for the next page.
        }

        window.location.href = "/access/consent";
        return;
      }

      if (!ageConfirmed) {
        throw new Error(
          "Please confirm that you are 18 years of age or older before continuing."
        );
      }

      /*
        Paid users do not complete the full referral consent form.
        Save their selected plan and age confirmation, then continue to payment.
      */
      const { error: paidUpdateError } = await supabase
        .from("candidate_profiles")
        .update({
          subscription_plan: selectedPlan,
          subscription_status: "pending_payment",
          subscription_18_plus_confirmed: true,
          has_paid_access: false,
          access_tier: "pending_payment",
        })
        .eq("user_id", user.id);

      if (paidUpdateError) {
        throw new Error(paidUpdateError.message);
      }

      window.location.href = `/access/paid?plan=${encodeURIComponent(
        selectedPlan
      )}`;
    } catch (error: any) {
      setMessage(
        error?.message ||
          "We could not continue your access request. Please try again."
      );
      setMessageType("error");
      setLoading(false);
    }
  }

  if (loadingUser) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingCard}>Loading HireMinds access...</div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <form onSubmit={handleContinue} style={styles.shell}>
        <section style={styles.notice}>
          <div style={styles.noticeIcon}>!</div>

          <div>
            <p style={styles.noticeEyebrow}>EXISTING ACCOUNT</p>
            <h1 style={styles.noticeTitle}>
              Your HireMinds access needs to be refreshed.
            </h1>

            <p style={styles.noticeText}>
              Your current HireMinds access is available through{" "}
              <strong>December 31, 2026</strong>. Because your account has not
              been used in more than 3 weeks, please enter an approved referral
              code or choose a subscription to continue.
            </p>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeadingWrap}>
            <p style={styles.sectionEyebrow}>CONTINUE YOUR ACCESS</p>
            <h2 style={styles.sectionTitle}>Choose Your HireMinds Access</h2>
            <p style={styles.sectionText}>
              Select a subscription or enter an approved referral code.
            </p>
          </div>

          <div style={styles.methodTabs}>
            <button
              type="button"
              onClick={() => setAccessMethod("subscription")}
              style={{
                ...styles.methodButton,
                ...(accessMethod === "subscription"
                  ? styles.methodButtonActive
                  : {}),
              }}
            >
              Subscription
            </button>

            <button
              type="button"
              onClick={() => setAccessMethod("referral")}
              style={{
                ...styles.methodButton,
                ...(accessMethod === "referral"
                  ? styles.methodButtonActive
                  : {}),
              }}
            >
              Referral Code
            </button>
          </div>

          {accessMethod === "subscription" ? (
            <>
              <div style={styles.planGrid}>
                {PLANS.map((plan) => {
                  const selected = selectedPlan === plan.key;

                  return (
                    <button
                      type="button"
                      key={plan.key}
                      onClick={() => setSelectedPlan(plan.key)}
                      style={{
                        ...styles.planCard,
                        ...(selected ? styles.planCardSelected : {}),
                      }}
                    >
                      {plan.badge ? (
                        <span style={styles.planBadge}>{plan.badge}</span>
                      ) : null}

                      <span style={styles.planTitle}>{plan.title}</span>
                      <span style={styles.planPrice}>{plan.price}</span>
                      <span style={styles.planBilling}>{plan.billing}</span>
                      <span style={styles.planEquivalent}>
                        {plan.equivalent}
                      </span>

                      <span
                        style={{
                          ...styles.selectPlanLabel,
                          ...(selected ? styles.selectPlanLabelActive : {}),
                        }}
                      >
                        {selected ? "Selected" : "Select Plan"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <label style={styles.ageBox}>
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  style={styles.checkbox}
                />

                <span>
                  I confirm that I am{" "}
                  <strong>18 years of age or older.</strong>
                </span>
              </label>

              <div style={styles.selectedSummary}>
                <span style={styles.selectedSummaryLabel}>Selected plan</span>
                <strong>
                  {selectedPlanDetails?.title} — {selectedPlanDetails?.price}
                </strong>
              </div>
            </>
          ) : (
            <div style={styles.referralPanel}>
              <div>
                <p style={styles.referralTitle}>Have a Referral Code?</p>
                <p style={styles.referralText}>
                  Enter the referral code provided to you.
                </p>
              </div>

              <label style={styles.field}>
                <span style={styles.label}>Referral Code</span>

                <input
                  placeholder="Enter Referral Code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  style={styles.input}
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>

              <div style={styles.referralHelp}>
                <strong>Need a referral code?</strong>
                <span>
                  Contact <strong>info@hireminds.app</strong>
                </span>
              </div>

              <p style={styles.referralConsentText}>
                Referral-code access requires completion of the HireMinds
                consent form before access is activated.
              </p>
            </div>
          )}
        </section>

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

        <button type="submit" style={styles.submitButton} disabled={loading}>
          {loading
            ? "Please wait..."
            : accessMethod === "subscription"
            ? "Continue to Payment"
            : "Continue to Consent"}
        </button>
      </form>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(28, 116, 224, 0.16), transparent 30%), #050608",
    color: "#ffffff",
    padding: "36px 18px 60px",
    boxSizing: "border-box",
  },

  shell: {
    width: "100%",
    maxWidth: "980px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
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

  notice: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start",
    padding: "22px",
    borderRadius: "18px",
    border: "1px solid rgba(255, 193, 7, 0.38)",
    backgroundColor: "rgba(255, 193, 7, 0.08)",
  },

  noticeIcon: {
    width: "36px",
    height: "36px",
    minWidth: "36px",
    borderRadius: "50%",
    backgroundColor: "#ffc107",
    color: "#111111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: "18px",
  },

  noticeEyebrow: {
    margin: "0 0 6px",
    color: "#f7cc62",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.13em",
  },

  noticeTitle: {
    margin: 0,
    fontSize: "26px",
    fontWeight: 900,
  },

  noticeText: {
    margin: "9px 0 0",
    color: "#f0dfb0",
    lineHeight: 1.65,
    fontSize: "14px",
  },

  card: {
    backgroundColor: "#0c0f14",
    border: "1px solid #232b36",
    borderRadius: "22px",
    padding: "28px",
    boxShadow: "0 16px 44px rgba(0, 0, 0, 0.22)",
  },

  sectionHeadingWrap: {
    marginBottom: "20px",
  },

  sectionEyebrow: {
    margin: "0 0 7px",
    color: "#6fb5ff",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.14em",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "27px",
    lineHeight: 1.2,
    fontWeight: 900,
  },

  sectionText: {
    margin: "8px 0 0",
    color: "#a8b4c3",
    lineHeight: 1.55,
    fontSize: "14px",
  },

  methodTabs: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
    marginBottom: "22px",
  },

  methodButton: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #33404e",
    backgroundColor: "#11171e",
    color: "#b9c4d0",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: "14px",
  },

  methodButtonActive: {
    border: "1px solid #1683ff",
    backgroundColor: "#10243a",
    color: "#ffffff",
  },

  planGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(225px, 1fr))",
    gap: "14px",
  },

  planCard: {
    textAlign: "left",
    minHeight: "260px",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    borderRadius: "17px",
    border: "1px solid #2c3744",
    backgroundColor: "#11161d",
    color: "#ffffff",
    cursor: "pointer",
  },

  planCardSelected: {
    border: "1px solid #1683ff",
    backgroundColor: "#0f2032",
    boxShadow: "0 12px 30px rgba(22, 131, 255, 0.12)",
  },

  planBadge: {
    alignSelf: "flex-start",
    marginBottom: "13px",
    padding: "5px 9px",
    borderRadius: "999px",
    backgroundColor: "#14283e",
    border: "1px solid #2c5b8b",
    color: "#8ac6ff",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.07em",
  },

  planTitle: {
    fontSize: "14px",
    fontWeight: 900,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },

  planPrice: {
    marginTop: "11px",
    fontSize: "32px",
    fontWeight: 900,
  },

  planBilling: {
    marginTop: "3px",
    color: "#aab6c4",
    fontSize: "12px",
  },

  planEquivalent: {
    marginTop: "9px",
    color: "#72b5ff",
    fontSize: "12px",
    fontWeight: 800,
  },

  selectPlanLabel: {
    marginTop: "auto",
    paddingTop: "18px",
    color: "#8f9cab",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
  },

  selectPlanLabelActive: {
    color: "#7fc0ff",
  },

  ageBox: {
    marginTop: "18px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "14px 15px",
    borderRadius: "12px",
    backgroundColor: "#0b1016",
    border: "1px solid #2d3946",
    color: "#dce5ee",
    fontSize: "13px",
    lineHeight: 1.5,
    cursor: "pointer",
  },

  checkbox: {
    width: "18px",
    height: "18px",
    marginTop: "1px",
  },

  selectedSummary: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    marginTop: "14px",
    padding: "13px 15px",
    borderRadius: "12px",
    backgroundColor: "#0f151d",
    border: "1px solid #273543",
    color: "#ffffff",
    fontSize: "13px",
  },

  selectedSummaryLabel: {
    color: "#8f9cab",
  },

  referralPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "22px",
    borderRadius: "16px",
    backgroundColor: "#0b1118",
    border: "1px solid #2a4664",
  },

  referralTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 900,
  },

  referralText: {
    margin: "5px 0 0",
    color: "#aab5c2",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    color: "#dfe7ef",
    fontSize: "13px",
    fontWeight: 800,
  },

  input: {
    width: "100%",
    padding: "14px 15px",
    borderRadius: "12px",
    border: "1px solid #34404e",
    backgroundColor: "#131820",
    color: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "15px",
  },

  referralHelp: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "13px 14px",
    borderRadius: "11px",
    backgroundColor: "#111922",
    border: "1px solid #263a50",
    color: "#d9e6f3",
    fontSize: "13px",
    lineHeight: 1.45,
  },

  referralConsentText: {
    margin: 0,
    color: "#93a0ae",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  message: {
    padding: "14px 16px",
    borderRadius: "12px",
    fontSize: "13px",
    lineHeight: 1.5,
    fontWeight: 700,
  },

  errorMessage: {
    border: "1px solid rgba(235, 87, 87, 0.35)",
    backgroundColor: "rgba(235, 87, 87, 0.08)",
    color: "#ffb6b6",
  },

  successMessage: {
    border: "1px solid rgba(46, 204, 113, 0.32)",
    backgroundColor: "rgba(46, 204, 113, 0.08)",
    color: "#9ce8b9",
  },

  submitButton: {
    width: "100%",
    padding: "16px 18px",
    borderRadius: "13px",
    border: "1px solid #1683ff",
    backgroundColor: "#1683ff",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 900,
    cursor: "pointer",
  },
};
