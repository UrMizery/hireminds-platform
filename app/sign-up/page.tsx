"use client";

import { useMemo, useState } from "react";
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

const INCLUDED_FEATURES = [
  "Resume Builder & Resume Optimization Tools",
  "Cover Letter Generator",
  "Job Description Analyzer",
  "Resume Match Analyzer",
  "Interview Preparation Tools",
  "Career Path & Career Goal Generators",
  "Job Search & Career Development Logs",
  "Industry Core Skills & Soft Skills Tools",
  "Career Toolkit Resources",
  "Video Library",
  "Participant Career Profile",
  "Job Board access as available",
  "New career tools and platform updates added throughout your access period",
];

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  async function validateReferralCode(code: string) {
    const response = await fetch("/api/access/validate-referral", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referralCode: code,
        mode: "signup",
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

  async function createAccount(options: {
    normalizedReferralCode?: string | null;
    referralExpiresAt?: string | null;
  }) {
    const cleanFullName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanCity = city.trim();
    const cleanState = stateName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const normalizedReferralCode =
      options.normalizedReferralCode?.trim() || null;

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanFullName,
          phone: cleanPhone || null,
          city: cleanCity || null,
          state_name: cleanState || null,

          // Historical/program referral field is preserved here when
          // a referral code is actually accepted.
          referral_code: normalizedReferralCode,

          has_referral_access: false,
          has_paid_access: false,
          access_tier: "pending",

          pending_access_method: accessMethod,
          pending_subscription_plan:
            accessMethod === "subscription" ? selectedPlan : null,
          pending_referral_code:
            accessMethod === "referral" ? normalizedReferralCode : null,
          pending_referral_expires_at:
            accessMethod === "referral"
              ? options.referralExpiresAt || null
              : null,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    const user = data.user;

    if (!user) {
      throw new Error("User not created.");
    }

    const { error: profileError } = await supabase
      .from("candidate_profiles")
      .upsert({
        user_id: user.id,
        full_name: cleanFullName,
        phone: cleanPhone || null,
        email: cleanEmail,
        city: cleanCity || null,
        state: cleanState || null,
        referral_code: normalizedReferralCode,
        has_referral_access: false,
        has_paid_access: false,
        access_tier: "pending",
        subscription_status: null,
      });

    if (profileError) {
      throw new Error(profileError.message);
    }

    const { error: activityError } = await supabase
      .from("user_activity")
      .insert({
        user_id: user.id,
        full_name: cleanFullName,
        email: cleanEmail,
        referral_code: normalizedReferralCode,
        event_type: "signup",
        tool_name: null,
        page_name: "sign-up",
      });

    if (activityError) {
      console.error("Activity tracking error:", activityError);
    }

    return user;
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setMessage("");
    setMessageType("");

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFullName) {
      setMessage("Please enter your full name.");
      setMessageType("error");
      return;
    }

    if (!cleanEmail) {
      setMessage("Please enter your email address.");
      setMessageType("error");
      return;
    }

    if (!password) {
      setMessage("Please create a password.");
      setMessageType("error");
      return;
    }

    if (accessMethod === "subscription" && !ageConfirmed) {
      setMessage(
        "Please confirm that you are 18 years of age or older before continuing."
      );
      setMessageType("error");
      return;
    }

    if (accessMethod === "referral" && !referralCode.trim()) {
      setMessage("Please enter your referral code.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      if (accessMethod === "referral") {
        /*
          Validate referral codes SERVER-SIDE.
          Do not move the active code list into this page.
        */
        const referral = await validateReferralCode(referralCode.trim());

        const normalizedReferralCode =
          referral.normalizedCode || referralCode.trim().toUpperCase();

        await createAccount({
          normalizedReferralCode,
          referralExpiresAt: referral.expiresAt || null,
        });

        /*
          Referral-code users must complete the full HireMinds consent form
          before referral access becomes active.
        */
        window.location.href = "/access/consent";
        return;
      }

      await createAccount({
        normalizedReferralCode: null,
        referralExpiresAt: null,
      });

      /*
        Paid users do NOT complete the full referral consent form.
        They already confirmed 18+ above and continue to payment.
      */
      window.location.href = `/access/paid?plan=${encodeURIComponent(
        selectedPlan
      )}`;
    } catch (error: any) {
      setMessage(
        error?.message ||
          "We could not complete your signup. Please try again."
      );
      setMessageType("error");
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <form onSubmit={handleSignUp} style={styles.shell}>
        <section style={styles.hero}>
          <p style={styles.kicker}>HireMinds</p>
          <h1 style={styles.heroTitle}>
            Build your career with the tools to move forward.
          </h1>
          <p style={styles.heroText}>
            Create your Career Passport and choose the HireMinds access option
            that works for you.
          </p>
        </section>

        <section style={styles.includedCard}>
          <div style={styles.sectionHeadingWrap}>
            <p style={styles.sectionEyebrow}>WHAT'S INCLUDED</p>
            <h2 style={styles.sectionTitle}>Your HireMinds Career Toolkit</h2>
            <p style={styles.sectionText}>
              Your access includes career-development tools designed to help you
              prepare, apply, interview, track progress, and continue building
              your professional profile.
            </p>
          </div>

          <div style={styles.featureGrid}>
            {INCLUDED_FEATURES.map((feature) => (
              <div key={feature} style={styles.featureItem}>
                <span style={styles.check}>✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeadingWrap}>
            <p style={styles.sectionEyebrow}>STEP 1</p>
            <h2 style={styles.sectionTitle}>Create Your Career Passport</h2>
          </div>

          <div style={styles.formGrid}>
            <label style={styles.field}>
              <span style={styles.label}>Full Name *</span>
              <input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={styles.input}
                required
              />
            </label>

            <label style={styles.field}>
              <span style={styles.label}>Phone Number</span>
              <input
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={styles.input}
              />
            </label>

            <label style={styles.field}>
              <span style={styles.label}>City</span>
              <input
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={styles.input}
              />
            </label>

            <label style={styles.field}>
              <span style={styles.label}>State</span>
              <input
                placeholder="State"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                style={styles.input}
              />
            </label>

            <label style={{ ...styles.field, ...styles.fullWidth }}>
              <span style={styles.label}>Email *</span>
              <input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </label>

            <label style={{ ...styles.field, ...styles.fullWidth }}>
              <span style={styles.label}>Password *</span>

              <div style={styles.passwordWrap}>
                <input
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.passwordInput}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={styles.passwordToggle}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeadingWrap}>
            <p style={styles.sectionEyebrow}>STEP 2</p>
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

                      <span style={styles.planDetails}>
                        {plan.details.map((detail) => (
                          <span key={detail} style={styles.planDetail}>
                            ✓ {detail}
                          </span>
                        ))}
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
                  I confirm that I am <strong>18 years of age or older.</strong>
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
            ? "Create Career Passport & Continue to Payment"
            : "Create Career Passport & Continue"}
        </button>

        <p style={styles.footerText}>
          By continuing, you confirm that the information you provided is
          accurate.
        </p>
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
    maxWidth: "1080px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  hero: {
    textAlign: "center",
    padding: "18px 12px 8px",
  },

  kicker: {
    margin: "0 0 8px",
    color: "#6fb5ff",
    fontSize: "13px",
    fontWeight: 900,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  },

  heroTitle: {
    margin: "0 auto",
    maxWidth: "760px",
    fontSize: "clamp(32px, 5vw, 50px)",
    lineHeight: 1.07,
    fontWeight: 900,
  },

  heroText: {
    maxWidth: "700px",
    margin: "14px auto 0",
    color: "#aeb9c8",
    fontSize: "16px",
    lineHeight: 1.65,
  },

  card: {
    backgroundColor: "#0c0f14",
    border: "1px solid #232b36",
    borderRadius: "22px",
    padding: "28px",
    boxShadow: "0 16px 44px rgba(0, 0, 0, 0.22)",
  },

  includedCard: {
    background:
      "linear-gradient(180deg, rgba(20, 82, 151, 0.24), rgba(10, 13, 18, 0.98))",
    border: "1px solid #236fbd",
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

  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(245px, 1fr))",
    gap: "11px 18px",
  },

  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    padding: "10px 12px",
    backgroundColor: "rgba(5, 8, 13, 0.55)",
    border: "1px solid rgba(86, 157, 235, 0.18)",
    borderRadius: "12px",
    color: "#dce7f3",
    fontSize: "13px",
    lineHeight: 1.45,
  },

  check: {
    color: "#72b5ff",
    fontWeight: 900,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  fullWidth: {
    gridColumn: "1 / -1",
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

  passwordWrap: {
    position: "relative",
    width: "100%",
  },

  passwordInput: {
    width: "100%",
    padding: "14px 76px 14px 15px",
    borderRadius: "12px",
    border: "1px solid #34404e",
    backgroundColor: "#131820",
    color: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "15px",
  },

  passwordToggle: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 800,
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
    minHeight: "360px",
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

  planDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginTop: "18px",
    color: "#aeb9c6",
    fontSize: "12px",
    lineHeight: 1.45,
  },

  planDetail: {
    display: "block",
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

  footerText: {
    margin: "-8px 0 0",
    textAlign: "center",
    color: "#7e8b99",
    fontSize: "11px",
    lineHeight: 1.5,
  },
};
