"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

type AccessMethod = "subscription" | "referral";

const IMPACT_ITEMS = [
  {
    title: "Apply Smarter",
    text: "Understand the job before you apply — requirements, keywords, fit, and gaps.",
    tone: "blue",
  },
  {
    title: "Show Up Stronger",
    text: "Build better resumes, cover letters, interview responses, and professional branding.",
    tone: "dark",
  },
  {
    title: "Move With Direction",
    text: "Track your search, explore career paths, set goals, and know what to do next.",
    tone: "silver",
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

  const [referralCode, setReferralCode] = useState("");

  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [billingConfirmed, setBillingConfirmed] = useState(false);
  const [renewalConfirmed, setRenewalConfirmed] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
        code,
      }),
    });

    const raw = await response.text();

    let data: {
      valid?: boolean;
      code?: string;
      expiresAt?: string | null;
      message?: string;
    } = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }

    if (!response.ok || !data.valid) {
      throw new Error(
        data.message ||
          "This referral code is not active or available. Please check the code and try again."
      );
    }

    return data;
  }

  async function createReferralAccount(options: {
    normalizedReferralCode: string;
  }) {
    const cleanFullName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanCity = city.trim();
    const cleanState = stateName.trim();
    const cleanEmail = email.trim().toLowerCase();

    const normalizedReferralCode =
      options.normalizedReferralCode.trim();

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

          access_tier: "pending_referral_consent",
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

      referral_code: normalizedReferralCode,
      access_referral_code: normalizedReferralCode,
      access_referral_verified_at: new Date().toISOString(),

      referral_consent_accepted: false,
      referral_consent_accepted_at: null,

      has_referral_access: false,
      has_paid_access: false,

      access_tier: "pending_referral_consent",

      subscription_status: null,
      subscription_plan: null,
      subscription_provider: null,
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
      console.error(
        "Activity tracking error:",
        activityError
      );
    }

    return user;
  }

  async function handleSignUp(
    e: React.FormEvent<HTMLFormElement>
  ) {
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

    if (
      accessMethod === "referral" &&
      !password
    ) {
      setMessage("Please create a password.");
      return;
    }

    try {
      setLoading(true);

      /*
        REFERRAL ACCESS
      */

      if (accessMethod === "referral") {
        const code = referralCode.trim();

        if (!code) {
          throw new Error(
            "Please enter your referral code."
          );
        }

        const referral =
          await validateReferralCode(code);

        const normalizedReferralCode =
          referral.code ||
          code.trim().toUpperCase();

        await createReferralAccount({
          normalizedReferralCode,
        });

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
          }
        } catch {
          // Database/server validation remains authoritative.
        }

        window.location.href = "/access";
        return;
      }

      /*
        PAID ACCESS
      */

      if (!ageConfirmed) {
        throw new Error(
          "Please confirm that you are 18 years of age or older."
        );
      }

      if (!billingConfirmed) {
        throw new Error(
          "Please confirm that you understand the $2.99 introductory access charge."
        );
      }

      if (!renewalConfirmed) {
        throw new Error(
          "Please confirm that you understand the automatic $24.99 monthly renewal."
        );
      }

      if (!termsConfirmed) {
        throw new Error(
          "Please confirm that you agree to the HireMinds Terms and Privacy Policy."
        );
      }

      const checkoutResponse = await fetch(
        "/api/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan: "monthly",
            fullName: cleanFullName,
            email: cleanEmail,
            phone: phone.trim(),
            city: city.trim(),
            state: stateName.trim(),
          }),
        }
      );

      const checkoutRaw =
        await checkoutResponse.text();

      let checkoutData: {
        ok?: boolean;
        url?: string;
        error?: string;
      } = {};

      try {
        checkoutData = checkoutRaw
          ? JSON.parse(checkoutRaw)
          : {};
      } catch {
        checkoutData = {};
      }

      if (
        !checkoutResponse.ok ||
        !checkoutData.url
      ) {
        throw new Error(
          checkoutData.error ||
            "Stripe checkout could not be started. Please try again."
        );
      }

      window.location.href = checkoutData.url;
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
      <form
        onSubmit={handleSignUp}
        style={styles.shell}
      >
        {/* HERO */}

        <section style={styles.hero}>
          <div style={styles.heroBlueGlow} />
          <div style={styles.heroSilverGlow} />

          <div style={styles.heroInner}>
            <div style={styles.heroLeft}>
              <div style={styles.brandLine}>
                <span style={styles.brandDot} />

                <span style={styles.brandLabel}>
                  HIREMINDS
                </span>

                <span style={styles.brandDivider}>
                  /
                </span>

                <span style={styles.brandSub}>
                  YOUR CAREER PASSPORT
                </span>
              </div>

              <h1 style={styles.heroTitle}>
                Don&apos;t just generate a resume.
                <span style={styles.heroBlueText}>
                  {" "}
                  Build your next move.
                </span>
              </h1>

              <p style={styles.heroLead}>
                HireMinds is more than a resume
                generator and more than a job board.
                It is a career-development platform
                built to help you understand the
                opportunity, strengthen your
                application, prepare for the
                conversation, track your progress,
                and make smarter career moves.
              </p>

              <div style={styles.heroStatement}>
                <span style={styles.statementMark}>
                  HM
                </span>

                <p style={styles.statementText}>
                  <strong>
                    A generator gives you a document.
                  </strong>

                  <br />

                  HireMinds helps you understand what
                  to do with it.
                </p>
              </div>
            </div>

            <aside style={styles.heroRight}>
              <p style={styles.heroRightEyebrow}>
                THE HIREMINDS DIFFERENCE
              </p>

              <div style={styles.heroRightRow}>
                <span style={styles.heroRightNumber}>
                  01
                </span>

                <div>
                  <strong style={styles.heroRightTitle}>
                    Understand
                  </strong>

                  <p style={styles.heroRightText}>
                    Read the role. Identify what
                    matters. Know where you fit.
                  </p>
                </div>
              </div>

              <div style={styles.heroRightLine} />

              <div style={styles.heroRightRow}>
                <span style={styles.heroRightNumber}>
                  02
                </span>

                <div>
                  <strong style={styles.heroRightTitle}>
                    Position
                  </strong>

                  <p style={styles.heroRightText}>
                    Present your experience with
                    intention — not guesswork.
                  </p>
                </div>
              </div>

              <div style={styles.heroRightLine} />

              <div style={styles.heroRightRow}>
                <span style={styles.heroRightNumber}>
                  03
                </span>

                <div>
                  <strong style={styles.heroRightTitle}>
                    Move
                  </strong>

                  <p style={styles.heroRightText}>
                    Apply smarter, prepare better, and
                    keep building forward.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* VALUE */}

        <section style={styles.impactSection}>
          <div style={styles.impactHeader}>
            <div>
              <p style={styles.eyebrow}>
                HOW HIREMINDS HELPS
              </p>

              <h2 style={styles.impactHeadline}>
                More than tools. A smarter way to move.
              </h2>
            </div>

            <div style={styles.startPrice}>
              <span style={styles.startPriceLabel}>
                START FOR
              </span>

              <strong style={styles.startPriceValue}>
                $2.99
              </strong>

              <span style={styles.startPriceSub}>
                / 5 days
              </span>
            </div>
          </div>

          <div style={styles.impactGrid}>
            {IMPACT_ITEMS.map((item) => {
              const toneStyle =
                item.tone === "blue"
                  ? styles.impactBlue
                  : item.tone === "dark"
                  ? styles.impactDark
                  : styles.impactSilver;

              const textStyle =
                item.tone === "dark"
                  ? styles.impactTextLight
                  : styles.impactTextDark;

              return (
                <article
                  key={item.title}
                  style={{
                    ...styles.impactCard,
                    ...toneStyle,
                  }}
                >
                  <div style={styles.impactAccent} />

                  <h3
                    style={{
                      ...styles.impactTitle,
                      ...textStyle,
                    }}
                  >
                    {item.title}
                  </h3>

                  <p
                    style={{
                      ...styles.impactText,
                      ...textStyle,
                    }}
                  >
                    {item.text}
                  </p>
                </article>
              );
            })}
          </div>

          <div style={styles.toolRibbon}>
            <span style={styles.toolRibbonLabel}>
              ONE PLATFORM
            </span>

            <span style={styles.toolRibbonItem}>
              Resume Builder
            </span>

            <span style={styles.toolDot}>•</span>

            <span style={styles.toolRibbonItem}>
              Resume Match
            </span>

            <span style={styles.toolDot}>•</span>

            <span style={styles.toolRibbonItem}>
              Job Description Analyzer
            </span>

            <span style={styles.toolDot}>•</span>

            <span style={styles.toolRibbonItem}>
              Interview Prep
            </span>

            <span style={styles.toolDot}>•</span>

            <span style={styles.toolRibbonItem}>
              Career Goals
            </span>

            <span style={styles.toolDot}>•</span>

            <span style={styles.toolRibbonItem}>
              Job Search Tracking
            </span>
          </div>
        </section>

        {/* ACCOUNT */}

        <section style={styles.signupSection}>
          <div style={styles.signupHeader}>
            <div style={styles.signupNumber}>
              01
            </div>

            <div>
              <p style={styles.eyebrow}>
                CREATE YOUR ACCOUNT
              </p>

              <h2 style={styles.signupTitle}>
                Create Your Career Passport
              </h2>

              <p style={styles.signupText}>
                Start with your information, then
                choose Paid Access or Referral Access.
              </p>
            </div>
          </div>

          <div style={styles.formGrid}>
            <label style={styles.field}>
              <span style={styles.label}>
                Full Name *
              </span>

              <input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
                style={styles.input}
                required
              />
            </label>

            <label style={styles.field}>
              <span style={styles.label}>
                Phone Number
              </span>

              <input
                placeholder="Phone Number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                style={styles.input}
              />
            </label>

            <label style={styles.field}>
              <span style={styles.label}>
                City
              </span>

              <input
                placeholder="City"
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
                style={styles.input}
              />
            </label>

            <label style={styles.field}>
              <span style={styles.label}>
                State
              </span>

              <input
                placeholder="State"
                value={stateName}
                onChange={(e) =>
                  setStateName(e.target.value)
                }
                style={styles.input}
              />
            </label>

            <label
              style={{
                ...styles.field,
                ...styles.fullWidth,
              }}
            >
              <span style={styles.label}>
                Email *
              </span>

              <input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                style={styles.input}
                required
              />
            </label>

            {accessMethod === "referral" ? (
              <label
                style={{
                  ...styles.field,
                  ...styles.fullWidth,
                }}
              >
                <span style={styles.label}>
                  Password *
                </span>

                <div style={styles.passwordWrap}>
                  <input
                    placeholder="Password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    style={styles.passwordInput}
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    style={styles.passwordToggle}
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </label>
            ) : (
              <div
                style={{
                  ...styles.field,
                  ...styles.fullWidth,
                }}
              >
                <span style={styles.label}>
                  Password
                </span>

                <div style={styles.infoBar}>
                  You will create your HireMinds
                  password after Stripe confirms your
                  payment.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ACCESS */}

        <section style={styles.signupSection}>
          <div style={styles.signupHeader}>
            <div style={styles.signupNumberBlue}>
              02
            </div>

            <div>
              <p style={styles.eyebrow}>
                CHOOSE YOUR ACCESS
              </p>

              <h2 style={styles.signupTitle}>
                How would you like to access
                HireMinds?
              </h2>

              <p style={styles.signupText}>
                Choose Paid Access or use an active
                referral code that was provided to
                you.
              </p>
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
              Paid Access
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

          {/* PAID ACCESS */}

          {accessMethod === "subscription" ? (
            <>
              <div style={styles.paidOffer}>
                <div style={styles.paidOfferTop}>
                  <div>
                    <span style={styles.paidBadge}>
                      5-DAY INTRODUCTORY ACCESS
                    </span>

                    <h3 style={styles.paidTitle}>
                      HireMinds All Access
                    </h3>

                    <p style={styles.paidLead}>
                      Explore HireMinds and unlock
                      your career-development tools.
                    </p>
                  </div>

                  <div style={styles.paidPriceBlock}>
                    <span style={styles.paidPrice}>
                      $2.99
                    </span>

                    <span style={styles.paidPriceTerm}>
                      first 5 days
                    </span>
                  </div>
                </div>

                <div style={styles.renewalBar}>
                  <div>
                    <span
                      style={styles.renewalEyebrow}
                    >
                      AFTER YOUR FIRST 5 DAYS
                    </span>

                    <strong
                      style={styles.renewalPrice}
                    >
                      $24.99/month
                    </strong>
                  </div>

                  <span style={styles.renewalText}>
                    Automatically renews unless
                    canceled.
                  </span>
                </div>

                <div style={styles.offerPoints}>
                  <span>✓ Full HireMinds access</span>

                  <span>
                    ✓ Career-development tools
                  </span>

                  <span>
                    ✓ Cancel before renewal
                  </span>
                </div>
              </div>

              <div style={styles.ackPanel}>
                <p style={styles.ackTitle}>
                  Before continuing
                </p>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={ageConfirmed}
                    onChange={(e) =>
                      setAgeConfirmed(
                        e.target.checked
                      )
                    }
                    style={styles.checkbox}
                  />

                  <span>
                    I confirm that I am{" "}
                    <strong>
                      18 years of age or older.
                    </strong>
                  </span>
                </label>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={billingConfirmed}
                    onChange={(e) =>
                      setBillingConfirmed(
                        e.target.checked
                      )
                    }
                    style={styles.checkbox}
                  />

                  <span>
                    I understand that I will be
                    charged{" "}
                    <strong>$2.99 today</strong> for
                    my first 5 days of HireMinds
                    access.
                  </span>
                </label>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={renewalConfirmed}
                    onChange={(e) =>
                      setRenewalConfirmed(
                        e.target.checked
                      )
                    }
                    style={styles.checkbox}
                  />

                  <span>
                    I understand that unless I
                    cancel, my subscription will
                    automatically continue at{" "}
                    <strong>
                      $24.99 per month
                    </strong>{" "}
                    after my 5-day introductory
                    access period.
                  </span>
                </label>

                <label style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={termsConfirmed}
                    onChange={(e) =>
                      setTermsConfirmed(
                        e.target.checked
                      )
                    }
                    style={styles.checkbox}
                  />

                  <span>
                    I agree to the HireMinds Terms
                    and Privacy Policy.
                  </span>
                </label>

                <p style={styles.smallNote}>
                  Payment information and final
                  authorization are completed
                  securely through Stripe.
                </p>
              </div>
            </>
          ) : (
            /* REFERRAL ACCESS */

            <div style={styles.referralPanel}>
              <div style={styles.referralIntro}>
                <div style={styles.referralBadge}>
                  REFERRAL ACCESS
                </div>

                <div>
                  <h3 style={styles.referralTitle}>
                    I Have a Referral Code
                  </h3>

                  <p style={styles.referralText}>
                    Enter the active referral code
                    that was provided to you by an
                    approved program or partner.
                  </p>
                </div>
              </div>

              <div style={styles.referralAccessBox}>
                <span
                  style={styles.referralAccessLabel}
                >
                  WHAT REFERRAL ACCESS INCLUDES
                </span>

                <strong
                  style={styles.referralAccessTitle}
                >
                  One-time 30 days of unlimited
                  HireMinds access
                </strong>

                <p
                  style={styles.referralAccessText}
                >
                  Referral access is intended for
                  eligible participants who have
                  been provided an active referral
                  code. Referral access does not
                  automatically renew and does not
                  require payment.
                </p>
              </div>

              <label style={styles.field}>
                <span style={styles.label}>
                  Referral Code
                </span>

                <input
                  placeholder="Enter Referral Code"
                  value={referralCode}
                  onChange={(e) =>
                    setReferralCode(e.target.value)
                  }
                  style={styles.input}
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>

              <div style={styles.previousAccessBox}>
                <strong>
                  Previously used referral access?
                </strong>

                <span>
                  If you previously had or used
                  HireMinds referral access, this
                  option may no longer be available
                  for your account. You may choose
                  Paid Access instead.
                </span>
              </div>

              <div style={styles.expirationBox}>
                After your referral code is
                verified, you will continue to the
                HireMinds{" "}
                <strong>
                  Consent &amp; Access
                </strong>{" "}
                page before your referral access is
                activated.
              </div>

              <p style={styles.smallNote}>
                Referral eligibility and access are
                subject to verification.
              </p>
            </div>
          )}
        </section>

        {message ? (
          <div style={styles.message}>
            {message}
          </div>
        ) : null}

        <button
          type="submit"
          style={styles.submitButton}
          disabled={loading}
        >
          <span>
            {loading
              ? "Please wait..."
              : accessMethod ===
                "subscription"
              ? "Continue to Secure Payment"
              : "Create Career Passport & Continue to Consent"}
          </span>

          {!loading ? (
            <span style={styles.buttonArrow}>
              →
            </span>
          ) : null}
        </button>

        <footer style={styles.footer}>
          <div style={styles.footerBrand}>
            HIREMINDS
          </div>

          <p style={styles.footerText}>
            Your career is bigger than one
            application.
          </p>
        </footer>
      </form>
    </main>
  );
}

const styles: {
  [key: string]: React.CSSProperties;
} = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #e7ebef 0%, #f4f6f8 18%, #ffffff 52%, #e7edf2 100%)",
    color: "#11151b",
    padding: "28px 18px 60px",
    boxSizing: "border-box",
  },

  shell: {
    width: "100%",
    maxWidth: "1120px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "30px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd2d9",
    boxShadow:
      "0 18px 50px rgba(16, 29, 43, 0.11)",
  },

  heroBlueGlow: {
    position: "absolute",
    width: "430px",
    height: "430px",
    right: "-170px",
    top: "-180px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(29, 126, 191, 0.22) 0%, rgba(29, 126, 191, 0.06) 48%, rgba(29, 126, 191, 0) 72%)",
    pointerEvents: "none",
  },

  heroSilverGlow: {
    position: "absolute",
    width: "380px",
    height: "380px",
    left: "-160px",
    bottom: "-205px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(149, 156, 165, 0.22) 0%, rgba(149, 156, 165, 0.05) 55%, rgba(149, 156, 165, 0) 74%)",
    pointerEvents: "none",
  },

  heroInner: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1.45fr) minmax(300px, 0.75fr)",
    gap: "40px",
    alignItems: "stretch",
    padding: "52px",
  },

  heroLeft: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  brandLine: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    marginBottom: "22px",
    flexWrap: "wrap",
  },

  brandDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#1c79b7",
    boxShadow:
      "0 0 0 5px rgba(28, 121, 183, 0.10)",
  },

  brandLabel: {
    color: "#111820",
    fontSize: "12px",
    fontWeight: 950,
    letterSpacing: "0.14em",
  },

  brandDivider: {
    color: "#a4acb4",
    fontSize: "11px",
  },

  brandSub: {
    color: "#68737f",
    fontSize: "10px",
    fontWeight: 850,
    letterSpacing: "0.12em",
  },

  heroTitle: {
    margin: 0,
    maxWidth: "760px",
    color: "#0d1117",
    fontSize: "clamp(43px, 6.7vw, 70px)",
    lineHeight: 0.98,
    fontWeight: 950,
    letterSpacing: "-0.052em",
  },

  heroBlueText: {
    color: "#176fae",
  },

  heroLead: {
    maxWidth: "760px",
    margin: "23px 0 0",
    color: "#4f5a66",
    fontSize: "17px",
    lineHeight: 1.72,
    fontWeight: 500,
  },

  heroStatement: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginTop: "28px",
    padding: "17px 18px",
    maxWidth: "680px",
    borderRadius: "16px",
    background:
      "linear-gradient(90deg, #edf1f4 0%, #e5eef5 100%)",
    borderLeft: "4px solid #176fae",
  },

  statementMark: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "44px",
    height: "44px",
    minWidth: "44px",
    borderRadius: "12px",
    backgroundColor: "#111820",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: 950,
    letterSpacing: "0.05em",
  },

  statementText: {
    margin: 0,
    color: "#29323b",
    fontSize: "14px",
    lineHeight: 1.55,
  },

  heroRight: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "30px",
    borderRadius: "22px",
    background:
      "linear-gradient(145deg, #111820 0%, #202a34 55%, #174d70 100%)",
    boxShadow:
      "0 18px 40px rgba(12, 20, 28, 0.22)",
  },

  heroRightEyebrow: {
    margin: "0 0 24px",
    color: "#79bde8",
    fontSize: "10px",
    fontWeight: 950,
    letterSpacing: "0.16em",
  },

  heroRightRow: {
    display: "grid",
    gridTemplateColumns: "35px 1fr",
    gap: "12px",
  },

  heroRightNumber: {
    color: "#72b4df",
    fontSize: "11px",
    fontWeight: 900,
    paddingTop: "2px",
  },

  heroRightTitle: {
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 900,
  },

  heroRightText: {
    margin: "5px 0 0",
    color: "#c2cad1",
    fontSize: "12px",
    lineHeight: 1.55,
  },

  heroRightLine: {
    height: "1px",
    backgroundColor: "#40505c",
    margin: "19px 0",
  },

  impactSection: {
    padding: "34px",
    borderRadius: "28px",
    background:
      "linear-gradient(135deg, #ffffff 0%, #f7f9fb 58%, #eef3f7 100%)",
    border: "1px solid #ccd4db",
    boxShadow:
      "0 14px 40px rgba(22, 33, 44, 0.07)",
  },

  impactHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "24px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },

  eyebrow: {
    margin: "0 0 7px",
    color: "#176fae",
    fontSize: "10px",
    fontWeight: 950,
    letterSpacing: "0.16em",
  },

  impactHeadline: {
    margin: 0,
    color: "#111820",
    fontSize: "clamp(30px, 4vw, 46px)",
    lineHeight: 1.04,
    fontWeight: 950,
    letterSpacing: "-0.04em",
  },

  startPrice: {
    display: "flex",
    alignItems: "baseline",
    gap: "5px",
    padding: "15px 18px",
    borderRadius: "16px",
    backgroundColor: "#111820",
    boxShadow:
      "0 12px 26px rgba(17, 24, 32, 0.14)",
  },

  startPriceLabel: {
    color: "#7eb9df",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.12em",
    marginRight: "4px",
  },

  startPriceValue: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: 950,
    letterSpacing: "-0.03em",
  },

  startPriceSub: {
    color: "#c2ccd5",
    fontSize: "11px",
  },

  impactGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "14px",
  },

  impactCard: {
    position: "relative",
    overflow: "hidden",
    minHeight: "175px",
    padding: "24px",
    borderRadius: "20px",
    border:
      "1px solid rgba(120, 130, 140, 0.20)",
    boxShadow:
      "0 12px 26px rgba(24, 42, 58, 0.08)",
  },

  impactBlue: {
    background:
      "linear-gradient(145deg, #dbeefb 0%, #f6fbff 72%)",
  },

  impactDark: {
    background:
      "linear-gradient(145deg, #111820 0%, #1d2a35 64%, #176fae 150%)",
  },

  impactSilver: {
    background:
      "linear-gradient(145deg, #e2e5e8 0%, #f8f9fa 72%)",
  },

  impactAccent: {
    width: "38px",
    height: "5px",
    borderRadius: "999px",
    backgroundColor: "#176fae",
    marginBottom: "28px",
  },

  impactTitle: {
    margin: 0,
    fontSize: "21px",
    lineHeight: 1.1,
    fontWeight: 950,
    letterSpacing: "-0.02em",
  },

  impactText: {
    margin: "11px 0 0",
    fontSize: "13px",
    lineHeight: 1.65,
  },

  impactTextLight: {
    color: "#ffffff",
  },

  impactTextDark: {
    color: "#25313c",
  },

  toolRibbon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "20px",
    padding: "14px 16px",
    borderRadius: "14px",
    backgroundColor: "#e7edf2",
    border: "1px solid #d0d8df",
  },

  toolRibbonLabel: {
    color: "#176fae",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.12em",
    marginRight: "4px",
  },

  toolRibbonItem: {
    color: "#2e3944",
    fontSize: "11px",
    fontWeight: 850,
  },

  toolDot: {
    color: "#7c8a96",
    fontSize: "10px",
  },

  signupSection: {
    padding: "34px",
    borderRadius: "26px",
    backgroundColor: "#ffffff",
    border: "1px solid #cfd5da",
    boxShadow:
      "0 14px 40px rgba(21, 32, 43, 0.06)",
  },

  signupHeader: {
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
    marginBottom: "27px",
  },

  signupNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "45px",
    height: "45px",
    minWidth: "45px",
    borderRadius: "14px",
    backgroundColor: "#111820",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: 950,
  },

  signupNumberBlue: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "45px",
    height: "45px",
    minWidth: "45px",
    borderRadius: "14px",
    background:
      "linear-gradient(145deg, #176fae 0%, #258bc8 100%)",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: 950,
  },

  signupTitle: {
    margin: 0,
    color: "#111820",
    fontSize: "29px",
    lineHeight: 1.1,
    fontWeight: 950,
    letterSpacing: "-0.025em",
  },

  signupText: {
    margin: "7px 0 0",
    color: "#68737d",
    fontSize: "13px",
    lineHeight: 1.55,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
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
    color: "#2b3540",
    fontSize: "12px",
    fontWeight: 850,
  },

  input: {
    width: "100%",
    padding: "14px 15px",
    borderRadius: "12px",
    border: "1px solid #b9c4cd",
    backgroundColor: "#f8f9fa",
    color: "#111820",
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
    border: "1px solid #b9c4cd",
    backgroundColor: "#f8f9fa",
    color: "#111820",
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
    color: "#176fae",
    cursor: "pointer",
    fontWeight: 900,
  },

  infoBar: {
    padding: "14px 16px",
    borderRadius: "12px",
    background:
      "linear-gradient(90deg, #e9edf0 0%, #e6f0f7 100%)",
    border: "1px solid #cbd6de",
    color: "#36434e",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  methodTabs: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "6px",
    marginBottom: "23px",
    padding: "5px",
    borderRadius: "14px",
    background:
      "linear-gradient(90deg, #e2e6e9 0%, #e8eef3 100%)",
    border: "1px solid #cbd3d9",
  },

  methodButton: {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid transparent",
    backgroundColor: "transparent",
    color: "#5c6770",
    fontWeight: 900,
    cursor: "pointer",
  },

  methodButtonActive: {
    backgroundColor: "#ffffff",
    border: "1px solid #176fae",
    color: "#176fae",
    boxShadow:
      "0 5px 14px rgba(23, 111, 174, 0.10)",
  },

  paidOffer: {
    padding: "26px",
    borderRadius: "20px",
    background:
      "linear-gradient(145deg, #101820 0%, #172b3a 65%, #176fae 140%)",
    boxShadow:
      "0 16px 36px rgba(15, 29, 41, 0.18)",
  },

  paidOfferTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "24px",
    flexWrap: "wrap",
  },

  paidBadge: {
    display: "inline-flex",
    padding: "7px 10px",
    borderRadius: "999px",
    backgroundColor:
      "rgba(114, 180, 223, 0.14)",
    border:
      "1px solid rgba(114, 180, 223, 0.35)",
    color: "#8dccf2",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.10em",
  },

  paidTitle: {
    margin: "15px 0 0",
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: 950,
    letterSpacing: "-0.025em",
  },

  paidLead: {
    margin: "7px 0 0",
    color: "#c9d3db",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  paidPriceBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },

  paidPrice: {
    color: "#ffffff",
    fontSize: "50px",
    lineHeight: 1,
    fontWeight: 950,
    letterSpacing: "-0.05em",
  },

  paidPriceTerm: {
    marginTop: "5px",
    color: "#8dccf2",
    fontSize: "12px",
    fontWeight: 850,
  },

  renewalBar: {
    marginTop: "24px",
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    alignItems: "center",
    flexWrap: "wrap",
    padding: "16px 18px",
    borderRadius: "14px",
    backgroundColor:
      "rgba(255, 255, 255, 0.08)",
    border:
      "1px solid rgba(255, 255, 255, 0.11)",
  },

  renewalEyebrow: {
    display: "block",
    color: "#8dccf2",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.11em",
    marginBottom: "4px",
  },

  renewalPrice: {
    color: "#ffffff",
    fontSize: "21px",
    fontWeight: 950,
  },

  renewalText: {
    color: "#d5dde3",
    fontSize: "12px",
  },

  offerPoints: {
    display: "flex",
    flexWrap: "wrap",
    gap: "18px",
    marginTop: "18px",
    color: "#e6edf2",
    fontSize: "11px",
    fontWeight: 750,
  },

  ackPanel: {
    marginTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "19px",
    borderRadius: "15px",
    background:
      "linear-gradient(180deg, #f5f7f8 0%, #edf1f4 100%)",
    border: "1px solid #cbd2d8",
  },

  ackTitle: {
    margin: "0 0 2px",
    color: "#111820",
    fontSize: "14px",
    fontWeight: 950,
  },

  checkboxRow: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    color: "#404b55",
    fontSize: "13px",
    lineHeight: 1.5,
    cursor: "pointer",
  },

  checkbox: {
    width: "18px",
    height: "18px",
    minWidth: "18px",
    marginTop: "1px",
    accentColor: "#176fae",
  },

  smallNote: {
    margin: "2px 0 0",
    color: "#747f89",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  referralPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "17px",
    padding: "24px",
    borderRadius: "18px",
    background:
      "linear-gradient(145deg, #f7f9fa 0%, #e8f1f7 100%)",
    border: "1px solid #c7d2da",
  },

  referralIntro: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  referralBadge: {
    padding: "7px 9px",
    borderRadius: "9px",
    background:
      "linear-gradient(90deg, #111820 0%, #176fae 140%)",
    color: "#ffffff",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.08em",
    whiteSpace: "nowrap",
  },

  referralTitle: {
    margin: 0,
    color: "#111820",
    fontSize: "20px",
    fontWeight: 950,
  },

  referralText: {
    margin: "4px 0 0",
    color: "#66717b",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  referralAccessBox: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    padding: "17px",
    borderRadius: "14px",
    backgroundColor: "#ffffff",
    border: "1px solid #bfd1df",
  },

  referralAccessLabel: {
    color: "#176fae",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.10em",
  },

  referralAccessTitle: {
    color: "#111820",
    fontSize: "16px",
    fontWeight: 950,
  },

  referralAccessText: {
    margin: 0,
    color: "#5c6872",
    fontSize: "12px",
    lineHeight: 1.55,
  },

  previousAccessBox: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    padding: "14px 15px",
    borderRadius: "12px",
    backgroundColor: "#e7edf2",
    border: "1px solid #cbd5dc",
    color: "#44515c",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  expirationBox: {
    padding: "14px 15px",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    border: "1px solid #c7ced4",
    color: "#3e4852",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  message: {
    padding: "14px 16px",
    borderRadius: "12px",
    backgroundColor: "#fff0f0",
    border: "1px solid #daa8a8",
    color: "#8c2f2f",
    fontSize: "13px",
    fontWeight: 850,
  },

  submitButton: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "14px",
    padding: "17px 20px",
    borderRadius: "15px",
    border: "1px solid #0c5d95",
    background:
      "linear-gradient(90deg, #111820 0%, #176fae 45%, #2588c7 100%)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow:
      "0 12px 28px rgba(23, 111, 174, 0.24)",
  },

  buttonArrow: {
    fontSize: "20px",
    fontWeight: 400,
  },

  footer: {
    textAlign: "center",
    padding: "17px 12px 2px",
  },

  footerBrand: {
    color: "#111820",
    fontSize: "10px",
    fontWeight: 950,
    letterSpacing: "0.15em",
  },

  footerText: {
    margin: "6px 0 0",
    color: "#727c85",
    fontSize: "11px",
  },
};
