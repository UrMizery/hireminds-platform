"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type CheckoutMode = "loading" | "referral" | "subscription" | "error";
type PlanKey = "monthly" | "four_month" | "annual";

const PLANS: Array<{
  key: PlanKey;
  title: string;
  price: string;
  billing: string;
  equivalent: string;
  badge?: string;
}> = [
  {
    key: "monthly",
    title: "Monthly",
    price: "$24.99",
    billing: "per month",
    equivalent: "Flexible monthly access",
    badge: "START HERE",
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
    key: "annual",
    title: "Annual",
    price: "$179.88",
    billing: "per year • paid in full",
    equivalent: "$14.99/mo equivalent",
    badge: "BEST VALUE",
  },
];

const CONSENT_VERSION = "HM-REFERRAL-2026-09";
const REFERRAL_EXPIRES_AT = "2026-12-31T23:59:59-05:00";

export default function AccessPage() {
  const [mode, setMode] = useState<CheckoutMode>("loading");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [referralCode, setReferralCode] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("monthly");

  const [eligibilityAccepted, setEligibilityAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [communityAccepted, setCommunityAccepted] = useState(false);
  const [employerVisibilityAccepted, setEmployerVisibilityAccepted] =
    useState(false);
  const [referralExpirationAccepted, setReferralExpirationAccepted] =
    useState(false);
  const [finalConsentAccepted, setFinalConsentAccepted] = useState(false);

  const [contactAuthorized, setContactAuthorized] = useState(false);
  const [futureEventsAuthorized, setFutureEventsAuthorized] = useState(false);
  const [mediaChoice, setMediaChoice] = useState<"yes" | "no" | "">("");

  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [billingConfirmed, setBillingConfirmed] = useState(false);
  const [renewalConfirmed, setRenewalConfirmed] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedPlanDetails = useMemo(
    () => PLANS.find((plan) => plan.key === selectedPlan),
    [selectedPlan]
  );

  useEffect(() => {
    let mounted = true;

    async function loadCheckout() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (!mounted) return;

        if (authError || !authData.user) {
          setMessage(
            "Please sign in to your HireMinds account before continuing checkout."
          );
          setMode("error");
          return;
        }

        const user = authData.user;

        const { data: profile, error: profileError } = await supabase
          .from("candidate_profiles")
          .select(
            "full_name,email,phone,access_tier,access_referral_code,subscription_plan,subscription_status,referral_consent_accepted"
          )
          .eq("user_id", user.id)
          .maybeSingle();

        if (!mounted) return;

        if (profileError) {
          throw new Error(profileError.message);
        }

        const safeName =
          profile?.full_name ||
          user.user_metadata?.full_name ||
          "";

        setFullName(safeName);
        setEmail(profile?.email || user.email || "");
        setPhone(profile?.phone || "");
        setReferralCode(profile?.access_referral_code || "");

        const profilePlan = profile?.subscription_plan as PlanKey | null;

        if (
          profilePlan === "monthly" ||
          profilePlan === "four_month" ||
          profilePlan === "annual"
        ) {
          setSelectedPlan(profilePlan);
        }

        /*
          NEW REFERRAL SIGNUP:
          Signup already validated the referral code and saved
          access_tier = pending_referral_consent.
          Do NOT ask for the referral code again.
        */
        if (
          profile?.access_tier === "pending_referral_consent" ||
          (!!profile?.access_referral_code &&
            profile?.referral_consent_accepted === false)
        ) {
          setMode("referral");
          return;
        }

        /*
          PAID SIGNUP / SUBSCRIPTION CHECKOUT:
          Signup saved the selected plan as pending_payment.
        */
        if (
          profile?.access_tier === "pending_payment" ||
          profile?.subscription_status === "pending_payment" ||
          !!profile?.subscription_plan
        ) {
          setMode("subscription");
          return;
        }

        /*
          Fallback for an authenticated account that lands here without
          a pending checkout state. Keep the user in the subscription
          checkout instead of exposing duplicate referral questions.
        */
        setMode("subscription");
      } catch (error: any) {
        if (!mounted) return;

        setMessage(
          error?.message ||
            "We could not load your HireMinds checkout. Please try again."
        );
        setMode("error");
      }
    }

    loadCheckout();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleReferralCheckout() {
    if (loading) return;

    setMessage("");

    if (!eligibilityAccepted) {
      setMessage("Please complete the Eligibility acknowledgment.");
      return;
    }

    if (!privacyAccepted) {
      setMessage("Please complete the Privacy & Security acknowledgment.");
      return;
    }

    if (!communityAccepted) {
      setMessage(
        "Please complete the Professional Community Standards acknowledgment."
      );
      return;
    }

    if (!employerVisibilityAccepted) {
      setMessage("Please complete the Employer Visibility acknowledgment.");
      return;
    }

    if (!referralExpirationAccepted) {
      setMessage(
        "Please acknowledge that referral access is available through December 31, 2026."
      );
      return;
    }

    if (!finalConsentAccepted) {
      setMessage(
        "Please confirm that you have read and agree to the HireMinds Platform Consent & Registration Agreement."
      );
      return;
    }

    try {
      setLoading(true);

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        throw new Error("Please sign in again to complete checkout.");
      }

      const now = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("candidate_profiles")
        .update({
          referral_consent_accepted: true,
          referral_consent_accepted_at: now,
          referral_consent_version: CONSENT_VERSION,

          has_referral_access: true,
          has_paid_access: false,
          access_tier: "referral",

          existing_access_expires_at: REFERRAL_EXPIRES_AT,
          access_reauthorized_at: now,
        })
        .eq("user_id", authData.user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      const { error: activityError } = await supabase
        .from("user_activity")
        .insert({
          user_id: authData.user.id,
          full_name: fullName || null,
          email: email || authData.user.email || null,
          referral_code: referralCode || null,
          event_type: "referral_checkout_completed",
          tool_name: null,
          page_name: "access-checkout",
        });

      if (activityError) {
        console.error("Activity tracking error:", activityError);
      }

      try {
        localStorage.removeItem("hireminds_pending_referral_code");
        localStorage.removeItem("hireminds_referral_expiration_confirmed");
        localStorage.removeItem("hireminds_pending_referral_expires_at");

        localStorage.setItem(
          "hireminds_referral_contact_authorized",
          String(contactAuthorized)
        );
        localStorage.setItem(
          "hireminds_referral_future_events_authorized",
          String(futureEventsAuthorized)
        );
        localStorage.setItem(
          "hireminds_referral_media_choice",
          mediaChoice || "not_selected"
        );
      } catch {
        // Convenience only. Access state is stored in Supabase.
      }

      window.location.href = "/profile";
    } catch (error: any) {
      setMessage(
        error?.message ||
          "We could not complete your referral checkout. Please try again."
      );
      setLoading(false);
    }
  }

  async function handleSubscriptionCheckout() {
    if (loading) return;

    setMessage("");

    if (!ageConfirmed) {
      setMessage("Please confirm that you are 18 years of age or older.");
      return;
    }

    if (!billingConfirmed) {
      setMessage(
        "Please confirm that you understand the price and billing frequency of your selected plan."
      );
      return;
    }

    if (!renewalConfirmed) {
      setMessage(
        "Please confirm that you understand the recurring billing terms."
      );
      return;
    }

    if (!termsConfirmed) {
      setMessage(
        "Please confirm that you agree to the HireMinds Terms and Privacy Policy."
      );
      return;
    }

    try {
      setLoading(true);

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        throw new Error("Please sign in again to continue to payment.");
      }

      const { error: updateError } = await supabase
        .from("candidate_profiles")
        .update({
          subscription_plan: selectedPlan,
          subscription_provider: "square",
          subscription_status: "pending_payment",
          paid_age_18_confirmed_at: new Date().toISOString(),

          has_paid_access: false,
          access_tier: "pending_payment",
        })
        .eq("user_id", authData.user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

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
        localStorage.setItem("hireminds_terms_acknowledged", "true");
      } catch {
        // Convenience only.
      }

      /*
        This is the dedicated payment step.
        Your Square checkout page/API can use the selected plan from
        candidate_profiles and the ?plan= query string.
      */
      window.location.href = `/access/paid?plan=${encodeURIComponent(
        selectedPlan
      )}`;
    } catch (error: any) {
      setMessage(
        error?.message ||
          "We could not continue to payment. Please try again."
      );
      setLoading(false);
    }
  }

  if (mode === "loading") {
    return (
      <main style={styles.page}>
        <div style={styles.loadingCard}>
          <span style={styles.loadingDot} />
          <div>
            <strong style={styles.loadingTitle}>HireMinds Checkout</strong>
            <p style={styles.loadingText}>Loading your access details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (mode === "error") {
    return (
      <main style={styles.page}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>!</div>
          <p style={styles.eyebrow}>HIREMINDS CHECKOUT</p>
          <h1 style={styles.errorTitle}>We need your account first.</h1>
          <p style={styles.errorText}>{message}</p>

          <a href="/login" style={styles.primaryLink}>
            Sign In
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.hero}>
          <div style={styles.heroGlow} />

          <div style={styles.heroCopy}>
            <div style={styles.brandLine}>
              <span style={styles.brandDot} />
              <span style={styles.brand}>HIREMINDS</span>
              <span style={styles.brandSlash}>/</span>
              <span style={styles.brandSub}>CHECKOUT</span>
            </div>

            <h1 style={styles.heroTitle}>
              One last step.
              <span style={styles.blueText}> Then your Career Passport is ready.</span>
            </h1>

            <p style={styles.heroText}>
              {mode === "referral"
                ? "Your referral code has already been verified. Review the HireMinds consent agreement below and complete your referral checkout."
                : "Review your HireMinds subscription, confirm your checkout acknowledgments, and continue to secure payment."}
            </p>
          </div>

          <aside style={styles.heroStatus}>
            <span style={styles.statusLabel}>ACCESS TYPE</span>
            <strong style={styles.statusValue}>
              {mode === "referral" ? "Referral" : "Subscription"}
            </strong>

            <div style={styles.statusLine} />

            {mode === "referral" ? (
              <>
                <span style={styles.statusLabel}>REFERRAL CODE</span>
                <strong style={styles.statusValueSmall}>
                  {referralCode || "Verified"}
                </strong>

                <div style={styles.statusLine} />

                <span style={styles.statusLabel}>ACCESS THROUGH</span>
                <strong style={styles.statusValueSmall}>12.31.2026</strong>
              </>
            ) : (
              <>
                <span style={styles.statusLabel}>STARTING AT</span>
                <strong style={styles.statusValueSmall}>$24.99 / month</strong>

                <div style={styles.statusLine} />

                <span style={styles.statusLabel}>PAYMENT</span>
                <strong style={styles.statusValueSmall}>Secure Checkout</strong>
              </>
            )}
          </aside>
        </section>

        {mode === "referral" ? (
          <>
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.stepNumber}>01</div>

                <div>
                  <p style={styles.eyebrow}>REFERRAL CHECKOUT</p>
                  <h2 style={styles.sectionTitle}>
                    HireMinds Platform Consent & Registration Agreement
                  </h2>
                  <p style={styles.sectionIntro}>
                    Review each section and check the required acknowledgments.
                    Your referral access is not activated until checkout is
                    completed.
                  </p>
                </div>
              </div>

              <div style={styles.identityBar}>
                <div style={styles.identityItem}>
                  <span style={styles.identityLabel}>Participant</span>
                  <strong style={styles.identityValue}>
                    {fullName || "HireMinds User"}
                  </strong>
                </div>

                <div style={styles.identityItem}>
                  <span style={styles.identityLabel}>Email</span>
                  <strong style={styles.identityValue}>
                    {email || "Account Email"}
                  </strong>
                </div>

                {phone ? (
                  <div style={styles.identityItem}>
                    <span style={styles.identityLabel}>Phone</span>
                    <strong style={styles.identityValue}>{phone}</strong>
                  </div>
                ) : null}
              </div>

              <div style={styles.consentGrid}>
                <div style={styles.consentCardBlue}>
                  <p style={styles.consentKicker}>ELIGIBILITY</p>
                  <h3 style={styles.consentTitle}>Your account information</h3>
                  <p style={styles.consentText}>
                    I confirm that I am 18 years of age or older and that the
                    information I provide to HireMinds is accurate to the best
                    of my knowledge.
                  </p>

                  <label style={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={eligibilityAccepted}
                      onChange={(e) =>
                        setEligibilityAccepted(e.target.checked)
                      }
                      style={styles.checkbox}
                    />
                    <span>I acknowledge and agree.</span>
                  </label>
                </div>

                <div style={styles.consentCardSilver}>
                  <p style={styles.consentKicker}>PRIVACY & SECURITY</p>
                  <h3 style={styles.consentTitle}>
                    How your information is handled
                  </h3>
                  <p style={styles.consentText}>
                    I understand that HireMinds uses secure systems and
                    reasonable security practices, does not sell or rent my
                    personal information for marketing or advertising, uses my
                    information to provide HireMinds services and career
                    resources, and that I am responsible for protecting my
                    account credentials.
                  </p>

                  <label style={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span>I acknowledge and agree.</span>
                  </label>
                </div>

                <div style={styles.consentCardDark}>
                  <p style={styles.consentKickerLight}>COMMUNITY STANDARDS</p>
                  <h3 style={styles.consentTitleLight}>
                    Keep HireMinds professional
                  </h3>
                  <p style={styles.consentTextLight}>
                    I agree to conduct myself respectfully and professionally
                    when using HireMinds networking, workshops, career events,
                    employer connections, workforce partner activities, and
                    other community features. Harassment, discrimination,
                    offensive language, or disruptive behavior may result in
                    suspension or termination of access.
                  </p>

                  <label style={styles.checkRowLight}>
                    <input
                      type="checkbox"
                      checked={communityAccepted}
                      onChange={(e) => setCommunityAccepted(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span>I acknowledge and agree.</span>
                  </label>
                </div>

                <div style={styles.consentCardWhite}>
                  <p style={styles.consentKicker}>EMPLOYER VISIBILITY</p>
                  <h3 style={styles.consentTitle}>
                    Your Career Passport can help employers find you
                  </h3>
                  <p style={styles.consentText}>
                    I understand that employers and approved workforce partners
                    may view information I choose to include in my HireMinds
                    profile for employment and recruiting purposes, including
                    my name, resume, city/state, phone, email, LinkedIn profile,
                    and profile photo if I upload one.
                  </p>

                  <label style={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={employerVisibilityAccepted}
                      onChange={(e) =>
                        setEmployerVisibilityAccepted(e.target.checked)
                      }
                      style={styles.checkbox}
                    />
                    <span>I acknowledge and agree.</span>
                  </label>
                </div>
              </div>
            </section>

            <section style={styles.expirationSection}>
              <div style={styles.expirationDateBlock}>
                <span style={styles.expirationSmall}>REFERRAL ACCESS</span>
                <strong style={styles.expirationDate}>12.31.2026</strong>
              </div>

              <div style={styles.expirationCopy}>
                <p style={styles.expirationEyebrow}>IMPORTANT ACCESS NOTICE</p>
                <h2 style={styles.expirationTitle}>
                  Your referral access ends December 31, 2026.
                </h2>

                <p style={styles.expirationText}>
                  If you would like to continue using HireMinds after December
                  31, 2026, you will need to subscribe to a paid HireMinds
                  plan.
                </p>

                <label style={styles.expirationCheck}>
                  <input
                    type="checkbox"
                    checked={referralExpirationAccepted}
                    onChange={(e) =>
                      setReferralExpirationAccepted(e.target.checked)
                    }
                    style={styles.checkbox}
                  />

                  <span>
                    <strong>I understand.</strong> My referral access is
                    available through December 31, 2026. Access after that date
                    requires a HireMinds subscription.
                  </span>
                </label>
              </div>
            </section>

            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.stepNumberBlue}>02</div>

                <div>
                  <p style={styles.eyebrow}>YOUR PREFERENCES</p>
                  <h2 style={styles.sectionTitle}>Optional authorizations</h2>
                  <p style={styles.sectionIntro}>
                    These choices are optional and do not affect your referral
                    access.
                  </p>
                </div>
              </div>

              <div style={styles.optionalGrid}>
                <label style={styles.optionalCard}>
                  <input
                    type="checkbox"
                    checked={contactAuthorized}
                    onChange={(e) => setContactAuthorized(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>
                    I authorize HireMinds to contact me regarding my account,
                    career resources, platform updates, and important service
                    notifications.
                  </span>
                </label>

                <label style={styles.optionalCard}>
                  <input
                    type="checkbox"
                    checked={futureEventsAuthorized}
                    onChange={(e) =>
                      setFutureEventsAuthorized(e.target.checked)
                    }
                    style={styles.checkbox}
                  />
                  <span>
                    I would like to receive information about future HireMinds
                    workshops, job fairs, networking opportunities, hiring
                    events, and workforce-development programs.
                  </span>
                </label>
              </div>

              <div style={styles.mediaPanel}>
                <div>
                  <p style={styles.mediaTitle}>
                    Photo, Video & Testimonial Release
                  </p>
                  <p style={styles.mediaText}>
                    Choosing NO will not affect your participation or access.
                  </p>
                </div>

                <div style={styles.mediaChoices}>
                  <button
                    type="button"
                    onClick={() => setMediaChoice("yes")}
                    style={{
                      ...styles.choiceButton,
                      ...(mediaChoice === "yes"
                        ? styles.choiceButtonActive
                        : {}),
                    }}
                  >
                    YES — I authorize use
                  </button>

                  <button
                    type="button"
                    onClick={() => setMediaChoice("no")}
                    style={{
                      ...styles.choiceButton,
                      ...(mediaChoice === "no"
                        ? styles.choiceButtonActive
                        : {}),
                    }}
                  >
                    NO — I do not authorize
                  </button>
                </div>
              </div>
            </section>

            <section style={styles.finalConsent}>
              <div style={styles.finalConsentMark}>✓</div>

              <div style={styles.finalConsentBody}>
                <p style={styles.finalConsentEyebrow}>FINAL ACKNOWLEDGMENT</p>
                <h2 style={styles.finalConsentTitle}>
                  Complete your referral checkout.
                </h2>

                <p style={styles.finalConsentText}>
                  By checking below, I acknowledge that I have read and
                  understand the HireMinds Platform Consent & Registration
                  Agreement and voluntarily choose to use HireMinds.
                </p>

                <label style={styles.finalCheckRow}>
                  <input
                    type="checkbox"
                    checked={finalConsentAccepted}
                    onChange={(e) =>
                      setFinalConsentAccepted(e.target.checked)
                    }
                    style={styles.checkboxLarge}
                  />

                  <span>
                    <strong>I have read, understand, and agree.</strong>
                  </span>
                </label>
              </div>
            </section>

            {message ? <div style={styles.message}>{message}</div> : null}

            <button
              type="button"
              onClick={handleReferralCheckout}
              disabled={loading}
              style={styles.submitButton}
            >
              <span>
                {loading
                  ? "Completing Checkout..."
                  : "Complete Referral Checkout & Enter HireMinds"}
              </span>
              {!loading ? <span style={styles.arrow}>→</span> : null}
            </button>
          </>
        ) : (
          <>
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.stepNumber}>01</div>

                <div>
                  <p style={styles.eyebrow}>SUBSCRIPTION CHECKOUT</p>
                  <h2 style={styles.sectionTitle}>Choose your HireMinds plan</h2>
                  <p style={styles.sectionIntro}>
                    Start monthly or save with a longer billing cycle.
                  </p>
                </div>
              </div>

              <div style={styles.planGrid}>
                {PLANS.map((plan) => {
                  const selected = selectedPlan === plan.key;

                  return (
                    <button
                      key={plan.key}
                      type="button"
                      onClick={() => {
                        setMessage("");
                        setSelectedPlan(plan.key);
                      }}
                      style={{
                        ...styles.planCard,
                        ...(selected ? styles.planCardSelected : {}),
                      }}
                    >
                      <div style={styles.planTop}>
                        <span style={styles.planTitle}>{plan.title}</span>

                        {plan.badge ? (
                          <span
                            style={{
                              ...styles.planBadge,
                              ...(plan.key === "monthly"
                                ? styles.planBadgeBlue
                                : {}),
                            }}
                          >
                            {plan.badge}
                          </span>
                        ) : null}
                      </div>

                      <strong style={styles.planPrice}>{plan.price}</strong>
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
                        {selected ? "✓ SELECTED" : "SELECT PLAN"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div style={styles.selectedPlanBar}>
                <span style={styles.selectedPlanLabel}>YOUR PLAN</span>
                <strong style={styles.selectedPlanValue}>
                  {selectedPlanDetails?.title} — {selectedPlanDetails?.price}
                </strong>
              </div>
            </section>

            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <div style={styles.stepNumberBlue}>02</div>

                <div>
                  <p style={styles.eyebrow}>CHECKOUT ACKNOWLEDGMENTS</p>
                  <h2 style={styles.sectionTitle}>
                    Confirm before payment
                  </h2>
                </div>
              </div>

              <div style={styles.ackGrid}>
                <label style={styles.ackCard}>
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

                <label style={styles.ackCard}>
                  <input
                    type="checkbox"
                    checked={billingConfirmed}
                    onChange={(e) => setBillingConfirmed(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>
                    I understand the subscription price and billing frequency
                    for the plan I selected.
                  </span>
                </label>

                <label style={styles.ackCard}>
                  <input
                    type="checkbox"
                    checked={renewalConfirmed}
                    onChange={(e) => setRenewalConfirmed(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>
                    I understand that recurring plans will continue to bill
                    according to the selected billing cycle unless canceled
                    according to the applicable cancellation terms.
                  </span>
                </label>

                <label style={styles.ackCard}>
                  <input
                    type="checkbox"
                    checked={termsConfirmed}
                    onChange={(e) => setTermsConfirmed(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <span>
                    I agree to the <strong>HireMinds Terms and Privacy Policy.</strong>
                  </span>
                </label>
              </div>
            </section>

            <section style={styles.paymentPreview}>
              <div>
                <p style={styles.paymentEyebrow}>NEXT STEP</p>
                <h2 style={styles.paymentTitle}>Secure payment</h2>
                <p style={styles.paymentText}>
                  Continue to the HireMinds payment page to complete your
                  subscription checkout.
                </p>
              </div>

              <div style={styles.paymentAmount}>
                <span style={styles.paymentAmountLabel}>DUE AT CHECKOUT</span>
                <strong style={styles.paymentAmountValue}>
                  {selectedPlanDetails?.price}
                </strong>
              </div>
            </section>

            {message ? <div style={styles.message}>{message}</div> : null}

            <button
              type="button"
              onClick={handleSubscriptionCheckout}
              disabled={loading}
              style={styles.submitButton}
            >
              <span>
                {loading
                  ? "Preparing Payment..."
                  : "Continue to Secure Payment"}
              </span>
              {!loading ? <span style={styles.arrow}>→</span> : null}
            </button>
          </>
        )}

        <footer style={styles.footer}>
          <strong style={styles.footerBrand}>HIREMINDS</strong>
          <span style={styles.footerText}>
            Your career is bigger than one application.
          </span>
        </footer>
      </div>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    padding: "28px 18px 60px",
    boxSizing: "border-box",
    color: "#111820",
    background:
      "linear-gradient(180deg, #e6ebef 0%, #f5f7f9 18%, #ffffff 52%, #e7edf2 100%)",
  },

  shell: {
    width: "100%",
    maxWidth: "1120px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },

  loadingCard: {
    width: "100%",
    maxWidth: "560px",
    margin: "130px auto 0",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "24px",
    borderRadius: "22px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd3d9",
    boxShadow: "0 18px 46px rgba(20, 34, 47, 0.10)",
  },

  loadingDot: {
    width: "18px",
    height: "18px",
    minWidth: "18px",
    borderRadius: "50%",
    backgroundColor: "#176fae",
    boxShadow: "0 0 0 7px rgba(23, 111, 174, 0.12)",
  },

  loadingTitle: {
    color: "#111820",
    fontSize: "16px",
  },

  loadingText: {
    margin: "4px 0 0",
    color: "#68737d",
    fontSize: "13px",
  },

  errorCard: {
    width: "100%",
    maxWidth: "600px",
    margin: "100px auto 0",
    padding: "36px",
    borderRadius: "26px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd3d9",
    boxShadow: "0 18px 46px rgba(20, 34, 47, 0.11)",
    textAlign: "center",
  },

  errorIcon: {
    width: "48px",
    height: "48px",
    margin: "0 auto 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "15px",
    backgroundColor: "#111820",
    color: "#ffffff",
    fontWeight: 950,
  },

  errorTitle: {
    margin: 0,
    color: "#111820",
    fontSize: "30px",
    fontWeight: 950,
  },

  errorText: {
    margin: "12px auto 22px",
    maxWidth: "460px",
    color: "#65717c",
    fontSize: "14px",
    lineHeight: 1.65,
  },

  primaryLink: {
    display: "inline-block",
    padding: "13px 22px",
    borderRadius: "12px",
    background:
      "linear-gradient(90deg, #111820 0%, #176fae 70%, #2588c7 100%)",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 900,
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.5fr) minmax(270px, 0.55fr)",
    gap: "30px",
    alignItems: "stretch",
    padding: "42px",
    borderRadius: "30px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd3d9",
    boxShadow: "0 18px 48px rgba(20, 34, 47, 0.10)",
  },

  heroGlow: {
    position: "absolute",
    width: "430px",
    height: "430px",
    top: "-230px",
    right: "80px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(36, 139, 202, 0.20) 0%, rgba(36, 139, 202, 0.05) 50%, rgba(36, 139, 202, 0) 72%)",
    pointerEvents: "none",
  },

  heroCopy: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  brandLine: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },

  brandDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#176fae",
    boxShadow: "0 0 0 5px rgba(23, 111, 174, 0.10)",
  },

  brand: {
    color: "#111820",
    fontSize: "11px",
    fontWeight: 950,
    letterSpacing: "0.14em",
  },

  brandSlash: {
    color: "#9ca6af",
    fontSize: "11px",
  },

  brandSub: {
    color: "#66727c",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: "0.12em",
  },

  heroTitle: {
    margin: 0,
    maxWidth: "760px",
    color: "#10161d",
    fontSize: "clamp(38px, 5.6vw, 62px)",
    lineHeight: 1,
    fontWeight: 950,
    letterSpacing: "-0.05em",
  },

  blueText: {
    color: "#176fae",
  },

  heroText: {
    maxWidth: "720px",
    margin: "20px 0 0",
    color: "#58636e",
    fontSize: "15px",
    lineHeight: 1.7,
  },

  heroStatus: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "26px",
    borderRadius: "22px",
    background:
      "linear-gradient(145deg, #111820 0%, #202b35 62%, #174f73 125%)",
    boxShadow: "0 16px 34px rgba(16, 24, 32, 0.19)",
  },

  statusLabel: {
    color: "#78b8e1",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.15em",
  },

  statusValue: {
    marginTop: "5px",
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: 950,
  },

  statusValueSmall: {
    marginTop: "5px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 900,
  },

  statusLine: {
    height: "1px",
    margin: "18px 0",
    backgroundColor: "#40505c",
  },

  section: {
    padding: "34px",
    borderRadius: "26px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd3d9",
    boxShadow: "0 14px 40px rgba(20, 34, 47, 0.06)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "26px",
  },

  stepNumber: {
    width: "45px",
    height: "45px",
    minWidth: "45px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
    backgroundColor: "#111820",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: 950,
  },

  stepNumberBlue: {
    width: "45px",
    height: "45px",
    minWidth: "45px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
    background:
      "linear-gradient(145deg, #176fae 0%, #2588c7 100%)",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: 950,
    boxShadow: "0 8px 18px rgba(23, 111, 174, 0.18)",
  },

  eyebrow: {
    margin: "0 0 6px",
    color: "#176fae",
    fontSize: "10px",
    fontWeight: 950,
    letterSpacing: "0.16em",
  },

  sectionTitle: {
    margin: 0,
    color: "#111820",
    fontSize: "29px",
    lineHeight: 1.08,
    fontWeight: 950,
    letterSpacing: "-0.03em",
  },

  sectionIntro: {
    margin: "8px 0 0",
    color: "#68737d",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  identityBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "10px",
    marginBottom: "20px",
    padding: "14px",
    borderRadius: "16px",
    background:
      "linear-gradient(90deg, #e4e8eb 0%, #edf3f7 100%)",
    border: "1px solid #cbd4dc",
  },

  identityItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "7px 9px",
  },

  identityLabel: {
    color: "#74808a",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },

  identityValue: {
    color: "#222b34",
    fontSize: "12px",
    overflowWrap: "anywhere",
  },

  consentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "14px",
  },

  consentCardBlue: {
    minHeight: "235px",
    display: "flex",
    flexDirection: "column",
    padding: "23px",
    borderRadius: "20px",
    background:
      "linear-gradient(145deg, #dceefa 0%, #f8fcff 74%)",
    border: "1px solid #bfd9e9",
  },

  consentCardSilver: {
    minHeight: "235px",
    display: "flex",
    flexDirection: "column",
    padding: "23px",
    borderRadius: "20px",
    background:
      "linear-gradient(145deg, #e1e5e8 0%, #f9fafb 74%)",
    border: "1px solid #cfd5da",
  },

  consentCardDark: {
    minHeight: "235px",
    display: "flex",
    flexDirection: "column",
    padding: "23px",
    borderRadius: "20px",
    background:
      "linear-gradient(145deg, #111820 0%, #202a34 66%, #175a84 145%)",
    border: "1px solid #1d2c39",
    boxShadow: "0 12px 26px rgba(17, 24, 32, 0.14)",
  },

  consentCardWhite: {
    minHeight: "235px",
    display: "flex",
    flexDirection: "column",
    padding: "23px",
    borderRadius: "20px",
    backgroundColor: "#ffffff",
    border: "1px solid #c7d0d7",
    boxShadow: "0 10px 26px rgba(20, 34, 47, 0.06)",
  },

  consentKicker: {
    margin: "0 0 9px",
    color: "#176fae",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.14em",
  },

  consentKickerLight: {
    margin: "0 0 9px",
    color: "#7abce6",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.14em",
  },

  consentTitle: {
    margin: 0,
    color: "#172029",
    fontSize: "18px",
    lineHeight: 1.18,
    fontWeight: 950,
  },

  consentTitleLight: {
    margin: 0,
    color: "#ffffff",
    fontSize: "18px",
    lineHeight: 1.18,
    fontWeight: 950,
  },

  consentText: {
    margin: "11px 0 18px",
    color: "#56626c",
    fontSize: "12px",
    lineHeight: 1.65,
  },

  consentTextLight: {
    margin: "11px 0 18px",
    color: "#c5ced6",
    fontSize: "12px",
    lineHeight: 1.65,
  },

  checkRow: {
    marginTop: "auto",
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    color: "#26313a",
    fontSize: "12px",
    fontWeight: 850,
    cursor: "pointer",
  },

  checkRowLight: {
    marginTop: "auto",
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 850,
    cursor: "pointer",
  },

  checkbox: {
    width: "18px",
    height: "18px",
    minWidth: "18px",
    marginTop: "1px",
    accentColor: "#176fae",
  },

  checkboxLarge: {
    width: "21px",
    height: "21px",
    minWidth: "21px",
    marginTop: "1px",
    accentColor: "#176fae",
  },

  expirationSection: {
    display: "grid",
    gridTemplateColumns: "250px minmax(0, 1fr)",
    overflow: "hidden",
    borderRadius: "26px",
    backgroundColor: "#ffffff",
    border: "1px solid #c8d1d8",
    boxShadow: "0 14px 40px rgba(20, 34, 47, 0.07)",
  },

  expirationDateBlock: {
    minHeight: "250px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "28px",
    background:
      "linear-gradient(145deg, #176fae 0%, #2588c7 60%, #111820 145%)",
  },

  expirationSmall: {
    color: "#dceffc",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.16em",
  },

  expirationDate: {
    marginTop: "8px",
    color: "#ffffff",
    fontSize: "34px",
    fontWeight: 950,
    letterSpacing: "-0.04em",
  },

  expirationCopy: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "32px",
  },

  expirationEyebrow: {
    margin: "0 0 6px",
    color: "#176fae",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.14em",
  },

  expirationTitle: {
    margin: 0,
    color: "#111820",
    fontSize: "27px",
    lineHeight: 1.12,
    fontWeight: 950,
    letterSpacing: "-0.03em",
  },

  expirationText: {
    margin: "11px 0 17px",
    color: "#606b75",
    fontSize: "13px",
    lineHeight: 1.65,
  },

  expirationCheck: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "14px 15px",
    borderRadius: "13px",
    background:
      "linear-gradient(90deg, #e8eef2 0%, #e5f0f7 100%)",
    border: "1px solid #c5d4df",
    color: "#35424c",
    fontSize: "12px",
    lineHeight: 1.55,
    cursor: "pointer",
  },

  optionalGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "12px",
  },

  optionalCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "17px",
    borderRadius: "15px",
    background:
      "linear-gradient(145deg, #f7f9fa 0%, #eaf1f6 100%)",
    border: "1px solid #ccd6de",
    color: "#46525d",
    fontSize: "12px",
    lineHeight: 1.6,
    cursor: "pointer",
  },

  mediaPanel: {
    marginTop: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
    flexWrap: "wrap",
    padding: "18px",
    borderRadius: "16px",
    backgroundColor: "#eef1f3",
    border: "1px solid #ccd3d8",
  },

  mediaTitle: {
    margin: 0,
    color: "#111820",
    fontSize: "14px",
    fontWeight: 950,
  },

  mediaText: {
    margin: "5px 0 0",
    color: "#6d7881",
    fontSize: "11px",
  },

  mediaChoices: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  choiceButton: {
    padding: "11px 13px",
    borderRadius: "11px",
    border: "1px solid #bcc7cf",
    backgroundColor: "#ffffff",
    color: "#4a5660",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 900,
  },

  choiceButtonActive: {
    border: "1px solid #176fae",
    backgroundColor: "#deedf7",
    color: "#115c90",
  },

  finalConsent: {
    display: "flex",
    alignItems: "flex-start",
    gap: "18px",
    padding: "28px",
    borderRadius: "24px",
    background:
      "linear-gradient(145deg, #111820 0%, #202b35 68%, #176fae 155%)",
    boxShadow: "0 16px 38px rgba(17, 24, 32, 0.18)",
  },

  finalConsentMark: {
    width: "48px",
    height: "48px",
    minWidth: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "15px",
    backgroundColor: "#ffffff",
    color: "#176fae",
    fontSize: "20px",
    fontWeight: 950,
  },

  finalConsentBody: {
    flex: 1,
  },

  finalConsentEyebrow: {
    margin: "0 0 6px",
    color: "#7dbfe7",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.14em",
  },

  finalConsentTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "26px",
    fontWeight: 950,
    letterSpacing: "-0.02em",
  },

  finalConsentText: {
    margin: "9px 0 16px",
    color: "#c5ced6",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  finalCheckRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    color: "#ffffff",
    fontSize: "13px",
    cursor: "pointer",
  },

  planGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(225px, 1fr))",
    gap: "14px",
  },

  planCard: {
    minHeight: "225px",
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    padding: "20px",
    borderRadius: "18px",
    border: "1px solid #c7cdd3",
    background:
      "linear-gradient(180deg, #ffffff 0%, #f0f3f5 100%)",
    color: "#111820",
    cursor: "pointer",
  },

  planCardSelected: {
    border: "2px solid #176fae",
    background:
      "linear-gradient(180deg, #ffffff 0%, #eaf5fc 100%)",
    boxShadow: "0 13px 30px rgba(23, 111, 174, 0.16)",
  },

  planTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  planBadge: {
    padding: "5px 8px",
    borderRadius: "999px",
    backgroundColor: "#111820",
    color: "#ffffff",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.06em",
  },

  planBadgeBlue: {
    background:
      "linear-gradient(90deg, #176fae 0%, #2588c7 100%)",
  },

  planTitle: {
    color: "#111820",
    fontSize: "12px",
    fontWeight: 950,
    textTransform: "uppercase",
    letterSpacing: "0.09em",
  },

  planPrice: {
    marginTop: "25px",
    color: "#111820",
    fontSize: "34px",
    fontWeight: 950,
    letterSpacing: "-0.03em",
  },

  planBilling: {
    marginTop: "3px",
    color: "#707a83",
    fontSize: "12px",
  },

  planEquivalent: {
    marginTop: "8px",
    color: "#176fae",
    fontSize: "12px",
    fontWeight: 850,
  },

  planSelect: {
    marginTop: "auto",
    paddingTop: "18px",
    color: "#78828c",
    fontSize: "10px",
    fontWeight: 950,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  planSelectActive: {
    color: "#176fae",
  },

  selectedPlanBar: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    flexWrap: "wrap",
    padding: "14px 16px",
    borderRadius: "12px",
    background:
      "linear-gradient(90deg, #e9edf0 0%, #e6f0f7 100%)",
    border: "1px solid #cbd6de",
  },

  selectedPlanLabel: {
    color: "#68737d",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.12em",
  },

  selectedPlanValue: {
    color: "#151c23",
    fontSize: "13px",
  },

  ackGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "12px",
  },

  ackCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "17px",
    borderRadius: "15px",
    background:
      "linear-gradient(145deg, #f7f9fa 0%, #eaf1f6 100%)",
    border: "1px solid #ccd6de",
    color: "#45515c",
    fontSize: "12px",
    lineHeight: 1.6,
    cursor: "pointer",
  },

  paymentPreview: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "22px",
    flexWrap: "wrap",
    padding: "28px",
    borderRadius: "24px",
    background:
      "linear-gradient(145deg, #111820 0%, #202a34 68%, #176fae 150%)",
    boxShadow: "0 16px 38px rgba(17, 24, 32, 0.18)",
  },

  paymentEyebrow: {
    margin: "0 0 6px",
    color: "#7dbfe7",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.14em",
  },

  paymentTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "27px",
    fontWeight: 950,
  },

  paymentText: {
    margin: "8px 0 0",
    maxWidth: "600px",
    color: "#c3ccd4",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  paymentAmount: {
    minWidth: "170px",
    padding: "16px 18px",
    borderRadius: "16px",
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
  },

  paymentAmountLabel: {
    display: "block",
    color: "#83c0e8",
    fontSize: "8px",
    fontWeight: 950,
    letterSpacing: "0.13em",
  },

  paymentAmountValue: {
    display: "block",
    marginTop: "5px",
    color: "#ffffff",
    fontSize: "25px",
    fontWeight: 950,
  },

  message: {
    padding: "14px 16px",
    borderRadius: "13px",
    backgroundColor: "#fff0f0",
    border: "1px solid #d9a8a8",
    color: "#8a2e2e",
    fontSize: "13px",
    fontWeight: 850,
  },

  submitButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    boxShadow: "0 12px 28px rgba(23, 111, 174, 0.24)",
  },

  arrow: {
    fontSize: "20px",
    fontWeight: 400,
  },

  footer: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
    padding: "15px 10px 0",
    textAlign: "center",
  },

  footerBrand: {
    color: "#111820",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.14em",
  },

  footerText: {
    color: "#747e87",
    fontSize: "10px",
  },
};
