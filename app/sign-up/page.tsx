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
    title: "4-Month",
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
  },
];

const TOOL_GROUPS = [
  {
    title: "Build",
    text: "Resume Builder, Resume Optimization, Cover Letters & Professional Branding",
  },
  {
    title: "Match",
    text: "Job Description Analyzer, Resume Match Analyzer & Industry Skills",
  },
  {
    title: "Prepare",
    text: "Interview Preparation, Career Goals, Career Paths & Soft Skills",
  },
  {
    title: "Track",
    text: "Job Search Logs, Career Development Logs, Notes & Career Profile",
  },
  {
    title: "Learn",
    text: "Career Toolkit Resources, Video Library & Guided Career Activities",
  },
  {
    title: "Explore",
    text: "Job Board access as available, new opportunities & platform updates",
  },
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
  const [billingConfirmed, setBillingConfirmed] = useState(false);
  const [renewalConfirmed, setRenewalConfirmed] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  const [referralExpirationConfirmed, setReferralExpirationConfirmed] =
    useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedPlanDetails = useMemo(
    () => PLANS.find((plan) => plan.key === selectedPlan),
    [selectedPlan]
  );

  function clearMessage() {
    setMessage("");
  }

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
          referral_code: normalizedReferralCode,
          has_referral_access: false,
          has_paid_access: false,
          access_tier:
            accessMethod === "referral"
              ? "pending_referral_consent"
              : "pending_payment",
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

    const profilePayload: Record<string, any> = {
      user_id: user.id,
      full_name: cleanFullName,
      phone: cleanPhone || null,
      email: cleanEmail,
      city: cleanCity || null,
      state: cleanState || null,

      /*
        referral_code remains the historical/program attribution field.
        access_referral_code is the current access authorization code.
      */
      referral_code: normalizedReferralCode,
      access_referral_code:
        accessMethod === "referral" ? normalizedReferralCode : null,
      access_referral_verified_at:
        accessMethod === "referral" ? new Date().toISOString() : null,

      referral_consent_accepted: false,
      referral_consent_accepted_at: null,

      has_referral_access: false,
      has_paid_access: false,

      access_tier:
        accessMethod === "referral"
          ? "pending_referral_consent"
          : "pending_payment",

      subscription_status:
        accessMethod === "subscription" ? "pending_payment" : null,

      subscription_plan:
        accessMethod === "subscription" ? selectedPlan : null,

      subscription_provider:
        accessMethod === "subscription" ? "square" : null,

      paid_age_18_confirmed_at:
        accessMethod === "subscription"
          ? new Date().toISOString()
          : null,
    };

    const { error: profileError } = await supabase
      .from("candidate_profiles")
      .upsert(profilePayload);

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

    clearMessage();

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFullName) {
      setMessage("Please enter your full name.");
      return;
    }

    if (!cleanEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setMessage("Please create a password.");
      return;
    }

    try {
      setLoading(true);

      if (accessMethod === "referral") {
        const code = referralCode.trim();

        if (!code) {
          throw new Error("Please enter your referral code.");
        }

        if (!referralExpirationConfirmed) {
          throw new Error(
            "Please confirm that you understand referral access is available through December 31, 2026."
          );
        }

        const referral = await validateReferralCode(code);

        const normalizedReferralCode =
          referral.normalizedCode || code.toUpperCase();

        await createAccount({
          normalizedReferralCode,
        });

        try {
          localStorage.setItem(
            "hireminds_pending_referral_code",
            normalizedReferralCode
          );
          localStorage.setItem(
            "hireminds_referral_expiration_confirmed",
            "true"
          );
          localStorage.setItem(
            "hireminds_pending_referral_expires_at",
            referral.expiresAt || "2026-12-31T23:59:59-05:00"
          );
        } catch {
          // Database/server validation remains authoritative.
        }

        window.location.href = "/access/consent";
        return;
      }

      if (!ageConfirmed) {
        throw new Error(
          "Please confirm that you are 18 years of age or older."
        );
      }

      if (!billingConfirmed) {
        throw new Error(
          "Please confirm that you understand the price and billing frequency of your selected subscription."
        );
      }

      if (!renewalConfirmed) {
        throw new Error(
          "Please confirm that you understand the recurring billing terms."
        );
      }

      if (!termsConfirmed) {
        throw new Error(
          "Please confirm that you agree to the HireMinds Terms and Privacy Policy."
        );
      }

      await createAccount({
        normalizedReferralCode: null,
      });

      try {
        localStorage.setItem(
          "hireminds_pending_subscription_plan",
          selectedPlan
        );
        localStorage.setItem(
          "hireminds_paid_billing_acknowledged",
          "true"
        );
        localStorage.setItem(
          "hireminds_paid_renewal_acknowledged",
          "true"
        );
        localStorage.setItem(
          "hireminds_terms_acknowledged",
          "true"
        );
      } catch {
        // Checkout should rely on authenticated server/database state.
      }

      window.location.href = `/access/paid?plan=${encodeURIComponent(
        selectedPlan
      )}`;
    } catch (error: any) {
      setMessage(
        error?.message ||
          "We could not complete your signup. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <form onSubmit={handleSignUp} style={styles.shell}>
        <section style={styles.hero}>
          <div style={styles.brandPill}>HIREMINDS</div>

          <h1 style={styles.heroTitle}>
            Your career tools, all in one place.
          </h1>

          <p style={styles.heroText}>
            Build stronger applications, prepare for interviews, organize your
            job search, and keep developing your career from one Career
            Passport.
          </p>
        </section>

        <section style={styles.toolsSection}>
          <div style={styles.centerHeading}>
            <p style={styles.eyebrow}>WHAT'S INCLUDED</p>
            <h2 style={styles.toolsTitle}>One platform. Your next move.</h2>
          </div>

          <div style={styles.toolGrid}>
            {TOOL_GROUPS.map((group) => (
              <div key={group.title} style={styles.toolCard}>
                <div style={styles.toolIcon}>{group.title.charAt(0)}</div>

                <div>
                  <h3 style={styles.toolTitle}>{group.title}</h3>
                  <p style={styles.toolText}>{group.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeading}>
            <span style={styles.stepBadge}>1</span>

            <div>
              <p style={styles.eyebrow}>CREATE YOUR ACCOUNT</p>
              <h2 style={styles.sectionTitle}>Create Your Career Passport</h2>
            </div>
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
                  style={styles.passwordToggle}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeading}>
            <span style={styles.stepBadge}>2</span>

            <div>
              <p style={styles.eyebrow}>CHOOSE YOUR ACCESS</p>
              <h2 style={styles.sectionTitle}>How will you use HireMinds?</h2>
            </div>
          </div>

          <div style={styles.methodTabs}>
            <button
              type="button"
              onClick={() => {
                clearMessage();
                setAccessMethod("subscription");
              }}
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
              onClick={() => {
                clearMessage();
                setAccessMethod("referral");
              }}
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
                      onClick={() => {
                        clearMessage();
                        setSelectedPlan(plan.key);
                      }}
                      style={{
                        ...styles.planCard,
                        ...(selected ? styles.planCardSelected : {}),
                      }}
                    >
                      {plan.badge ? (
                        <span style={styles.planBadge}>{plan.badge}</span>
                      ) : (
                        <span style={styles.planBadgePlaceholder} />
                      )}

                      <span style={styles.planTitle}>{plan.title}</span>
                      <span style={styles.planPrice}>{plan.price}</span>
                      <span style={styles.planBilling}>{plan.billing}</span>
                      <span style={styles.planEquivalent}>
                        {plan.equivalent}
                      </span>

                      <span
                        style={{
                          ...styles.planSelect,
                          ...(selected ? styles.planSelectActive : {}),
                        }}
                      >
                        {selected ? "Selected" : "Select"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div style={styles.selectedSummary}>
                <span>Selected plan</span>
                <strong>
                  {selectedPlanDetails?.title} — {selectedPlanDetails?.price}
                </strong>
              </div>

              <div style={styles.ackPanel}>
                <p style={styles.ackTitle}>Before continuing</p>

                <label style={styles.checkboxRow}>
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

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={billingConfirmed}
                    onChange={(e) => setBillingConfirmed(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>
                    I understand the price and billing frequency of the
                    subscription plan I selected.
                  </span>
                </label>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={renewalConfirmed}
                    onChange={(e) => setRenewalConfirmed(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>
                    I understand that my subscription will renew according to
                    the selected billing cycle unless canceled according to the
                    applicable cancellation terms.
                  </span>
                </label>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={termsConfirmed}
                    onChange={(e) => setTermsConfirmed(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>
                    I agree to the HireMinds Terms and Privacy Policy.
                  </span>
                </label>

                <p style={styles.smallNote}>
                  Final payment details and authorization are completed during
                  checkout.
                </p>
              </div>
            </>
          ) : (
            <div style={styles.referralPanel}>
              <div>
                <h3 style={styles.referralTitle}>Have a Referral Code?</h3>
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

              <label style={styles.expirationBox}>
                <input
                  type="checkbox"
                  checked={referralExpirationConfirmed}
                  onChange={(e) =>
                    setReferralExpirationConfirmed(e.target.checked)
                  }
                  style={styles.checkbox}
                />

                <span>
                  I understand that my HireMinds referral access is available
                  through <strong>December 31, 2026.</strong>
                </span>
              </label>

              <p style={styles.smallNote}>
                After your referral code is accepted, you will complete the
                HireMinds consent form before access is activated.
              </p>
            </div>
          )}
        </section>

        {message ? <div style={styles.message}>{message}</div> : null}

        <button type="submit" style={styles.submitButton} disabled={loading}>
          {loading
            ? "Please wait..."
            : accessMethod === "subscription"
            ? "Create Career Passport & Continue to Payment"
            : "Create Career Passport & Continue to Consent"}
        </button>

        <p style={styles.footer}>
          HireMinds • Career tools designed to help you move forward with
          clarity and confidence.
        </p>
      </form>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f7fbff 0%, #ffffff 35%, #f7faff 100%)",
    color: "#162033",
    padding: "34px 18px 60px",
    boxSizing: "border-box",
  },

  shell: {
    width: "100%",
    maxWidth: "1040px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  hero: {
    textAlign: "center",
    padding: "32px 18px 18px",
  },

  brandPill: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "999px",
    backgroundColor: "#e7f3ff",
    color: "#176bb5",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.14em",
  },

  heroTitle: {
    margin: "16px auto 0",
    maxWidth: "760px",
    fontSize: "clamp(36px, 6vw, 58px)",
    lineHeight: 1.04,
    color: "#13213a",
    fontWeight: 900,
    letterSpacing: "-0.035em",
  },

  heroText: {
    maxWidth: "700px",
    margin: "16px auto 0",
    color: "#607086",
    fontSize: "16px",
    lineHeight: 1.7,
  },

  toolsSection: {
    padding: "26px",
    borderRadius: "24px",
    backgroundColor: "#ffffff",
    border: "1px solid #e3ebf5",
    boxShadow: "0 16px 45px rgba(42, 88, 130, 0.08)",
  },

  centerHeading: {
    textAlign: "center",
    marginBottom: "20px",
  },

  eyebrow: {
    margin: "0 0 6px",
    color: "#2673b8",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.13em",
  },

  toolsTitle: {
    margin: 0,
    color: "#152238",
    fontSize: "28px",
    fontWeight: 900,
  },

  toolGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "12px",
  },

  toolCard: {
    display: "flex",
    gap: "13px",
    alignItems: "flex-start",
    padding: "16px",
    borderRadius: "16px",
    backgroundColor: "#f8fbff",
    border: "1px solid #e5edf7",
  },

  toolIcon: {
    width: "35px",
    height: "35px",
    minWidth: "35px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "11px",
    backgroundColor: "#dcefff",
    color: "#176bb5",
    fontWeight: 900,
  },

  toolTitle: {
    margin: "0 0 4px",
    color: "#17253a",
    fontSize: "14px",
    fontWeight: 900,
  },

  toolText: {
    margin: 0,
    color: "#6c7b8f",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  card: {
    padding: "28px",
    borderRadius: "24px",
    backgroundColor: "#ffffff",
    border: "1px solid #e3eaf3",
    boxShadow: "0 16px 45px rgba(42, 88, 130, 0.08)",
  },

  sectionHeading: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "22px",
  },

  stepBadge: {
    width: "38px",
    height: "38px",
    minWidth: "38px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e5f3ff",
    color: "#1b70b7",
    fontSize: "15px",
    fontWeight: 900,
  },

  sectionTitle: {
    margin: 0,
    color: "#17253a",
    fontSize: "26px",
    fontWeight: 900,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "15px",
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
    color: "#34465d",
    fontSize: "12px",
    fontWeight: 800,
  },

  input: {
    width: "100%",
    padding: "14px 15px",
    borderRadius: "12px",
    border: "1px solid #ccd9e6",
    backgroundColor: "#fbfdff",
    color: "#19283c",
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
    padding: "14px 75px 14px 15px",
    borderRadius: "12px",
    border: "1px solid #ccd9e6",
    backgroundColor: "#fbfdff",
    color: "#19283c",
    outline: "none",
    boxSizing: "border-box",
    fontSize: "15px",
  },

  passwordToggle: {
    position: "absolute",
    top: "50%",
    right: "14px",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    color: "#1c6fae",
    cursor: "pointer",
    fontWeight: 800,
  },

  methodTabs: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px",
    marginBottom: "20px",
  },

  methodButton: {
    padding: "14px",
    borderRadius: "13px",
    border: "1px solid #d4dfeb",
    backgroundColor: "#f8fbff",
    color: "#5b6a7c",
    fontWeight: 900,
    cursor: "pointer",
  },

  methodButtonActive: {
    border: "1px solid #2b7fc4",
    backgroundColor: "#e8f4ff",
    color: "#176bb5",
  },

  planGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "13px",
  },

  planCard: {
    minHeight: "230px",
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    padding: "19px",
    borderRadius: "18px",
    border: "1px solid #dbe5ef",
    backgroundColor: "#ffffff",
    color: "#19283c",
    cursor: "pointer",
  },

  planCardSelected: {
    border: "2px solid #2b7fc4",
    backgroundColor: "#f2f9ff",
    boxShadow: "0 10px 30px rgba(43, 127, 196, 0.12)",
  },

  planBadge: {
    alignSelf: "flex-start",
    padding: "5px 9px",
    borderRadius: "999px",
    backgroundColor: "#e4f2ff",
    color: "#176bb5",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.05em",
  },

  planBadgePlaceholder: {
    height: "22px",
  },

  planTitle: {
    marginTop: "15px",
    fontSize: "13px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },

  planPrice: {
    marginTop: "7px",
    fontSize: "31px",
    fontWeight: 900,
    color: "#14223a",
  },

  planBilling: {
    marginTop: "3px",
    color: "#718095",
    fontSize: "12px",
  },

  planEquivalent: {
    marginTop: "8px",
    color: "#2572b3",
    fontSize: "12px",
    fontWeight: 800,
  },

  planSelect: {
    marginTop: "auto",
    paddingTop: "17px",
    color: "#8693a2",
    fontSize: "11px",
    fontWeight: 900,
    textTransform: "uppercase",
  },

  planSelectActive: {
    color: "#1d73b8",
  },

  selectedSummary: {
    marginTop: "14px",
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    flexWrap: "wrap",
    padding: "13px 15px",
    borderRadius: "12px",
    backgroundColor: "#f7faff",
    border: "1px solid #dee8f1",
    color: "#283950",
    fontSize: "13px",
  },

  ackPanel: {
    marginTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "11px",
    padding: "18px",
    borderRadius: "15px",
    backgroundColor: "#f9fbfd",
    border: "1px solid #dfe8f1",
  },

  ackTitle: {
    margin: "0 0 2px",
    color: "#22344a",
    fontSize: "14px",
    fontWeight: 900,
  },

  checkboxRow: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    color: "#4c5d72",
    fontSize: "13px",
    lineHeight: 1.5,
    cursor: "pointer",
  },

  checkbox: {
    width: "18px",
    height: "18px",
    minWidth: "18px",
    marginTop: "1px",
  },

  smallNote: {
    margin: "2px 0 0",
    color: "#7f8d9d",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  referralPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "22px",
    borderRadius: "17px",
    backgroundColor: "#f7fbff",
    border: "1px solid #d8e8f6",
  },

  referralTitle: {
    margin: 0,
    color: "#18304a",
    fontSize: "20px",
    fontWeight: 900,
  },

  referralText: {
    margin: "5px 0 0",
    color: "#6c7b8c",
    fontSize: "13px",
  },

  referralHelp: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "13px 14px",
    borderRadius: "12px",
    backgroundColor: "#edf7ff",
    border: "1px solid #d2e8fa",
    color: "#37546e",
    fontSize: "13px",
  },

  expirationBox: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    padding: "14px 15px",
    borderRadius: "12px",
    backgroundColor: "#fff9e9",
    border: "1px solid #f0d98f",
    color: "#6b5927",
    fontSize: "13px",
    lineHeight: 1.5,
    cursor: "pointer",
  },

  message: {
    padding: "14px 16px",
    borderRadius: "12px",
    backgroundColor: "#fff1f1",
    border: "1px solid #efc6c6",
    color: "#a13d3d",
    fontSize: "13px",
    fontWeight: 800,
  },

  submitButton: {
    width: "100%",
    padding: "16px 18px",
    borderRadius: "14px",
    border: "none",
    backgroundColor: "#1f79bd",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(31, 121, 189, 0.18)",
  },

  footer: {
    margin: "-6px 0 0",
    textAlign: "center",
    color: "#8a97a7",
    fontSize: "11px",
  },
};
