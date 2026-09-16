"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type CheckoutMode =
  | "loading"
  | "referral"
  | "subscription"
  | "error";

type PlanKey =
  | "monthly"
  | "four_month"
  | "annual";

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

const CONSENT_VERSION =
  "HM-REFERRAL-2026-09-30DAY-SIMPLIFIED";

function createThirtyDayExpiration() {
  const expiration = new Date();

  expiration.setDate(
    expiration.getDate() + 30
  );

  return expiration.toISOString();
}

export default function AccessPage() {
  const [mode, setMode] =
    useState<CheckoutMode>("loading");

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [referralCode, setReferralCode] =
    useState("");

  const [
    selectedPlan,
    setSelectedPlan,
  ] =
    useState<PlanKey>("monthly");

  /*
    REFERRAL CONSENT

    One final acknowledgment instead of
    multiple small acknowledgment boxes.
  */

  const [
    finalConsentAccepted,
    setFinalConsentAccepted,
  ] = useState(false);

  /*
    SUBSCRIPTION ACKNOWLEDGMENTS

    Kept for the existing subscription
    side of this page.
  */

  const [
    ageConfirmed,
    setAgeConfirmed,
  ] = useState(false);

  const [
    billingConfirmed,
    setBillingConfirmed,
  ] = useState(false);

  const [
    renewalConfirmed,
    setRenewalConfirmed,
  ] = useState(false);

  const [
    termsConfirmed,
    setTermsConfirmed,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const selectedPlanDetails =
    useMemo(
      () =>
        PLANS.find(
          (plan) =>
            plan.key === selectedPlan
        ),

      [selectedPlan]
    );

  /*
    ==========================================
    LOAD ACCESS INFORMATION
    ==========================================
  */

  useEffect(() => {
    let mounted = true;

    async function loadCheckout() {
      try {
        let pendingReferralCode =
          "";

        let pendingPlan:
          | PlanKey
          | "" = "";

        try {
          pendingReferralCode =
            localStorage.getItem(
              "hireminds_pending_referral_code"
            ) || "";

          const savedPlan =
            localStorage.getItem(
              "hireminds_pending_subscription_plan"
            ) || "";

          if (
            savedPlan === "monthly" ||
            savedPlan ===
              "four_month" ||
            savedPlan === "annual"
          ) {
            pendingPlan =
              savedPlan;
          }
        } catch {
          // Continue with account lookup.
        }

        if (!mounted) return;

        if (
          pendingReferralCode
        ) {
          setReferralCode(
            pendingReferralCode
          );

          setMode("referral");
        } else if (pendingPlan) {
          setSelectedPlan(
            pendingPlan
          );

          setMode(
            "subscription"
          );
        }

        const {
          data: authData,
        } =
          await supabase.auth.getUser();

        if (!mounted) return;

        if (!authData.user) {
          if (
            pendingReferralCode ||
            pendingPlan
          ) {
            return;
          }

          setMessage(
            "Please begin from the HireMinds signup page or sign in to continue."
          );

          setMode("error");

          return;
        }

        const user =
          authData.user;

        const {
          data: profile,
          error: profileError,
        } =
          await supabase
            .from(
              "candidate_profiles"
            )
            .select(
              "full_name,email,phone,access_tier,access_referral_code,subscription_plan,subscription_status,referral_consent_accepted"
            )
            .eq(
              "user_id",
              user.id
            )
            .maybeSingle();

        if (!mounted) return;

        if (profileError) {
          throw new Error(
            profileError.message
          );
        }

        const safeName =
          profile?.full_name ||
          user.user_metadata
            ?.full_name ||
          "";

        setFullName(
          safeName
        );

        setEmail(
          profile?.email ||
            user.email ||
            ""
        );

        setPhone(
          profile?.phone || ""
        );

        if (
          profile?.access_referral_code
        ) {
          setReferralCode(
            profile
              .access_referral_code
          );
        }

        const profilePlan =
          profile?.subscription_plan as
            | PlanKey
            | null;

        if (
          profilePlan ===
            "monthly" ||
          profilePlan ===
            "four_month" ||
          profilePlan ===
            "annual"
        ) {
          setSelectedPlan(
            profilePlan
          );
        }

        /*
          REFERRAL ACCESS
        */

        if (
          profile?.access_tier ===
            "pending_referral_consent" ||
          (!!profile
            ?.access_referral_code &&
            profile
              ?.referral_consent_accepted ===
              false)
        ) {
          setMode("referral");

          return;
        }

        /*
          SUBSCRIPTION ACCESS
        */

        if (
          profile?.access_tier ===
            "pending_payment" ||
          profile
            ?.subscription_status ===
            "pending_payment" ||
          !!profile
            ?.subscription_plan
        ) {
          setMode(
            "subscription"
          );

          return;
        }

        if (
          pendingReferralCode
        ) {
          setMode("referral");

          return;
        }

        setMode(
          "subscription"
        );
      } catch (error: any) {
        if (!mounted) return;

        try {
          const pendingReferralCode =
            localStorage.getItem(
              "hireminds_pending_referral_code"
            ) || "";

          if (
            pendingReferralCode
          ) {
            setReferralCode(
              pendingReferralCode
            );

            setMode(
              "referral"
            );

            return;
          }
        } catch {
          // Continue to error.
        }

        setMessage(
          error?.message ||
            "We could not load your HireMinds access details. Please try again."
        );

        setMode("error");
      }
    }

    loadCheckout();

    return () => {
      mounted = false;
    };
  }, []);

  /*
    ==========================================
    COMPLETE REFERRAL ACCESS
    ==========================================
  */

  async function handleReferralCheckout() {
    if (loading) return;

    setMessage("");

    if (
      !finalConsentAccepted
    ) {
      setMessage(
        "Please review the agreement and confirm that you understand and agree before continuing."
      );

      return;
    }

    try {
      setLoading(true);

      const {
        data: authData,
        error: authError,
      } =
        await supabase.auth.getUser();

      if (
        authError ||
        !authData.user
      ) {
        throw new Error(
          "Please sign in again to complete your referral access."
        );
      }

      const now =
        new Date().toISOString();

      const expiresAt =
        createThirtyDayExpiration();

      const {
        error: updateError,
      } =
        await supabase
          .from(
            "candidate_profiles"
          )
          .update({
            referral_consent_accepted:
              true,

            referral_consent_accepted_at:
              now,

            referral_consent_version:
              CONSENT_VERSION,

            has_referral_access:
              true,

            has_paid_access:
              false,

            access_tier:
              "referral",

            existing_access_expires_at:
              expiresAt,

            access_reauthorized_at:
              now,
          })
          .eq(
            "user_id",
            authData.user.id
          );

      if (updateError) {
        throw new Error(
          updateError.message
        );
      }

      const {
        error: activityError,
      } =
        await supabase
          .from(
            "user_activity"
          )
          .insert({
            user_id:
              authData.user.id,

            full_name:
              fullName || null,

            email:
              email ||
              authData.user.email ||
              null,

            referral_code:
              referralCode ||
              null,

            event_type:
              "referral_access_completed",

            tool_name: null,

            page_name:
              "access",
          });

      if (
        activityError
      ) {
        console.error(
          "Activity tracking error:",
          activityError
        );
      }

      try {
        localStorage.removeItem(
          "hireminds_pending_referral_code"
        );

        localStorage.removeItem(
          "hireminds_pending_referral_expires_at"
        );
      } catch {
        // Supabase remains authoritative.
      }

      window.location.href =
        "/profile";
    } catch (error: any) {
      setMessage(
        error?.message ||
          "We could not activate your referral access. Please try again."
      );

      setLoading(false);
    }
  }

  /*
    ==========================================
    EXISTING SUBSCRIPTION FLOW
    ==========================================
  */

  async function handleSubscriptionCheckout() {
    if (loading) return;

    setMessage("");

    if (!ageConfirmed) {
      setMessage(
        "Please confirm that you are 18 years of age or older."
      );

      return;
    }

    if (
      !billingConfirmed
    ) {
      setMessage(
        "Please confirm that you understand the price and billing frequency of your selected plan."
      );

      return;
    }

    if (
      !renewalConfirmed
    ) {
      setMessage(
        "Please confirm that you understand the recurring billing terms."
      );

      return;
    }

    if (
      !termsConfirmed
    ) {
      setMessage(
        "Please confirm that you agree to the HireMinds Terms and Privacy Policy."
      );

      return;
    }

    try {
      setLoading(true);

      const {
        data: authData,
        error: authError,
      } =
        await supabase.auth.getUser();

      if (
        authError ||
        !authData.user
      ) {
        throw new Error(
          "Please sign in again to continue to payment."
        );
      }

      const {
        error: updateError,
      } =
        await supabase
          .from(
            "candidate_profiles"
          )
          .update({
            subscription_plan:
              selectedPlan,

            subscription_provider:
              "square",

            subscription_status:
              "pending_payment",

            paid_age_18_confirmed_at:
              new Date().toISOString(),

            has_paid_access:
              false,

            access_tier:
              "pending_payment",
          })
          .eq(
            "user_id",
            authData.user.id
          );

      if (updateError) {
        throw new Error(
          updateError.message
        );
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

        localStorage.setItem(
          "hireminds_terms_acknowledged",
          "true"
        );
      } catch {
        // Convenience only.
      }

      window.location.href =
        `/access/paid?plan=${encodeURIComponent(
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

  /*
    ==========================================
    LOADING
    ==========================================
  */

  if (mode === "loading") {
    return (
      <main style={styles.page}>
        <div
          style={
            styles.loadingCard
          }
        >
          <span
            style={
              styles.loadingDot
            }
          />

          <div>
            <strong
              style={
                styles.loadingTitle
              }
            >
              HireMinds
            </strong>

            <p
              style={
                styles.loadingText
              }
            >
              Loading your access
              details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
    ==========================================
    ERROR
    ==========================================
  */

  if (mode === "error") {
    return (
      <main style={styles.page}>
        <div
          style={
            styles.errorCard
          }
        >
          <div
            style={
              styles.errorIcon
            }
          >
            !
          </div>

          <p
            style={
              styles.eyebrow
            }
          >
            HIREMINDS
          </p>

          <h1
            style={
              styles.errorTitle
            }
          >
            We need your account
            first.
          </h1>

          <p
            style={
              styles.errorText
            }
          >
            {message}
          </p>

          <a
            href="/login"
            style={
              styles.primaryLink
            }
          >
            Sign In
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        {/* ============================
            HERO
        ============================ */}

        <section
          style={styles.hero}
        >
          <div
            style={
              styles.heroGlow
            }
          />

          <div
            style={
              styles.heroCopy
            }
          >
            <div
              style={
                styles.brandLine
              }
            >
              <span
                style={
                  styles.brandDot
                }
              />

              <span
                style={
                  styles.brand
                }
              >
                HIREMINDS
              </span>

              <span
                style={
                  styles.brandSlash
                }
              >
                /
              </span>

              <span
                style={
                  styles.brandSub
                }
              >
                ACCESS
              </span>
            </div>

            <h1
              style={
                styles.heroTitle
              }
            >
              {mode === "referral"
                ? "Activate your Career Passport."
                : "Confirm your HireMinds access."}
            </h1>

            <p
              style={
                styles.heroText
              }
            >
              {mode === "referral"
                ? "Your referral code has been verified. Review the short agreement below and activate your 30 days of HireMinds access."
                : "Review your subscription details and continue to payment."}
            </p>
          </div>

          <aside
            style={
              styles.heroStatus
            }
          >
            <span
              style={
                styles.statusLabel
              }
            >
              ACCESS TYPE
            </span>

            <strong
              style={
                styles.statusValue
              }
            >
              {mode === "referral"
                ? "Referral"
                : "Subscription"}
            </strong>

            <div
              style={
                styles.statusLine
              }
            />

            {mode ===
            "referral" ? (
              <>
                <span
                  style={
                    styles.statusLabel
                  }
                >
                  REFERRAL CODE
                </span>

                <strong
                  style={
                    styles.statusValueSmall
                  }
                >
                  {referralCode ||
                    "Verified"}
                </strong>

                <div
                  style={
                    styles.statusLine
                  }
                />

                <span
                  style={
                    styles.statusLabel
                  }
                >
                  ACCESS PERIOD
                </span>

                <strong
                  style={
                    styles.statusValueSmall
                  }
                >
                  30 Days
                </strong>
              </>
            ) : (
              <>
                <span
                  style={
                    styles.statusLabel
                  }
                >
                  STARTING AT
                </span>

                <strong
                  style={
                    styles.statusValueSmall
                  }
                >
                  $24.99 / month
                </strong>

                <div
                  style={
                    styles.statusLine
                  }
                />

                <span
                  style={
                    styles.statusLabel
                  }
                >
                  PAYMENT
                </span>

                <strong
                  style={
                    styles.statusValueSmall
                  }
                >
                  Secure Checkout
                </strong>
              </>
            )}
          </aside>
        </section>

        {/* ============================
            REFERRAL
        ============================ */}

        {mode === "referral" ? (
          <>
            <section
              style={
                styles.agreementSection
              }
            >
              <div
                style={
                  styles.agreementHeader
                }
              >
                <p
                  style={
                    styles.eyebrow
                  }
                >
                  REFERRAL ACCESS
                </p>

                <h2
                  style={
                    styles.sectionTitle
                  }
                >
                  Before you enter
                  HireMinds
                </h2>

                <p
                  style={
                    styles.sectionIntro
                  }
                >
                  A quick review of
                  your account,
                  privacy, and Career
                  Passport access.
                </p>
              </div>

              {/* IDENTITY */}

              <div
                style={
                  styles.identityBar
                }
              >
                <div
                  style={
                    styles.identityItem
                  }
                >
                  <span
                    style={
                      styles.identityLabel
                    }
                  >
                    Participant
                  </span>

                  <strong
                    style={
                      styles.identityValue
                    }
                  >
                    {fullName ||
                      "HireMinds User"}
                  </strong>
                </div>

                <div
                  style={
                    styles.identityItem
                  }
                >
                  <span
                    style={
                      styles.identityLabel
                    }
                  >
                    Email
                  </span>

                  <strong
                    style={
                      styles.identityValue
                    }
                  >
                    {email ||
                      "Account Email"}
                  </strong>
                </div>

                {phone ? (
                  <div
                    style={
                      styles.identityItem
                    }
                  >
                    <span
                      style={
                        styles.identityLabel
                      }
                    >
                      Phone
                    </span>

                    <strong
                      style={
                        styles.identityValue
                      }
                    >
                      {phone}
                    </strong>
                  </div>
                ) : null}
              </div>

              {/* CONTINUOUS AGREEMENT */}

              <div
                style={
                  styles.agreementContent
                }
              >
                <div
                  style={
                    styles.agreementBlock
                  }
                >
                  <div
                    style={
                      styles.agreementLabel
                    }
                  >
                    ELIGIBILITY &
                    INDEPENDENCE
                  </div>

                  <div
                    style={
                      styles.agreementCopy
                    }
                  >
                    <h3
                      style={
                        styles.agreementTitle
                      }
                    >
                      Your account and
                      referral
                    </h3>

                    <p
                      style={
                        styles.agreementText
                      }
                    >
                      I confirm that I
                      am 18 years of
                      age or older and
                      that the
                      information I
                      provide is
                      accurate. I
                      understand that
                      HireMinds is an
                      optional,
                      independent
                      digital platform
                      and is separate
                      from the
                      organization that
                      referred me.
                    </p>

                    <p
                      style={
                        styles.agreementText
                      }
                    >
                      My choice to use
                      HireMinds does
                      not affect my
                      eligibility for
                      or access to
                      services
                      provided by the
                      referring
                      organization.
                    </p>
                  </div>
                </div>

                <div
                  style={
                    styles.agreementDivider
                  }
                />

                <div
                  style={
                    styles.agreementBlock
                  }
                >
                  <div
                    style={
                      styles.agreementLabel
                    }
                  >
                    PRIVACY &
                    PROFESSIONAL USE
                  </div>

                  <div
                    style={
                      styles.agreementCopy
                    }
                  >
                    <h3
                      style={
                        styles.agreementTitle
                      }
                    >
                      Your information
                      and account
                    </h3>

                    <p
                      style={
                        styles.agreementText
                      }
                    >
                      HireMinds uses
                      my information
                      to provide
                      platform and
                      career services
                      and does not
                      sell or rent my
                      personal
                      information for
                      advertising. I
                      am responsible
                      for protecting
                      my login
                      information and
                      for using
                      HireMinds
                      respectfully
                      and
                      professionally.
                    </p>
                  </div>
                </div>

                <div
                  style={
                    styles.agreementDivider
                  }
                />

                <div
                  style={
                    styles.agreementBlock
                  }
                >
                  <div
                    style={
                      styles.agreementLabel
                    }
                  >
                    EMPLOYER
                    VISIBILITY
                  </div>

                  <div
                    style={
                      styles.agreementCopy
                    }
                  >
                    <h3
                      style={
                        styles.agreementTitle
                      }
                    >
                      Your Career
                      Passport can
                      help employers
                      find you
                    </h3>

                    <p
                      style={
                        styles.agreementText
                      }
                    >
                      Employers and
                      approved
                      workforce
                      partners may
                      view information
                      I choose to
                      include in my
                      HireMinds Career
                      Passport,
                      including my
                      name, resume,
                      city/state,
                      phone, email,
                      LinkedIn, and
                      profile photo
                      if I upload one.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACCESS NOTICE */}

              <div
                style={
                  styles.accessNotice
                }
              >
                <span
                  style={
                    styles.accessNoticeLabel
                  }
                >
                  30-DAY REFERRAL
                  ACCESS
                </span>

                <p
                  style={
                    styles.accessNoticeText
                  }
                >
                  Your referral
                  provides{" "}
                  <strong>
                    30 days of
                    HireMinds access
                  </strong>{" "}
                  beginning when you
                  activate it. It
                  does not
                  automatically renew
                  and does not
                  require payment.
                </p>
              </div>

              {/* ONE FINAL CHECKBOX */}

              <label
                style={
                  styles.finalAgreement
                }
              >
                <input
                  type="checkbox"
                  checked={
                    finalConsentAccepted
                  }
                  onChange={(e) =>
                    setFinalConsentAccepted(
                      e.target.checked
                    )
                  }
                  style={
                    styles.checkboxLarge
                  }
                />

                <div>
                  <strong
                    style={
                      styles.finalAgreementTitle
                    }
                  >
                    I have read,
                    understand, and
                    agree.
                  </strong>

                  <p
                    style={
                      styles.finalAgreementText
                    }
                  >
                    I voluntarily
                    choose to use
                    HireMinds and
                    agree to the
                    HireMinds
                    Platform Consent
                    & Registration
                    Agreement.
                  </p>
                </div>
              </label>
            </section>

            {message ? (
              <div
                style={
                  styles.message
                }
              >
                {message}
              </div>
            ) : null}

            <button
              type="button"
              onClick={
                handleReferralCheckout
              }
              disabled={loading}
              style={
                styles.submitButton
              }
            >
              <span>
                {loading
                  ? "Activating Access..."
                  : "Activate Referral Access & Enter HireMinds"}
              </span>

              {!loading ? (
                <span
                  style={
                    styles.arrow
                  }
                >
                  →
                </span>
              ) : null}
            </button>
          </>
        ) : (
          <>
            {/* ============================
                SUBSCRIPTION
            ============================ */}

            <section
              style={
                styles.section
              }
            >
              <div
                style={
                  styles.simpleHeader
                }
              >
                <p
                  style={
                    styles.eyebrow
                  }
                >
                  SUBSCRIPTION
                </p>

                <h2
                  style={
                    styles.sectionTitle
                  }
                >
                  Choose your
                  HireMinds plan
                </h2>

                <p
                  style={
                    styles.sectionIntro
                  }
                >
                  Select the access
                  option that works
                  for you.
                </p>
              </div>

              <div
                style={
                  styles.planGrid
                }
              >
                {PLANS.map(
                  (plan) => {
                    const selected =
                      selectedPlan ===
                      plan.key;

                    return (
                      <button
                        key={
                          plan.key
                        }
                        type="button"
                        onClick={() => {
                          setMessage(
                            ""
                          );

                          setSelectedPlan(
                            plan.key
                          );
                        }}
                        style={{
                          ...styles.planCard,

                          ...(selected
                            ? styles.planCardSelected
                            : {}),
                        }}
                      >
                        <div
                          style={
                            styles.planTop
                          }
                        >
                          <span
                            style={
                              styles.planTitle
                            }
                          >
                            {
                              plan.title
                            }
                          </span>

                          {plan.badge ? (
                            <span
                              style={{
                                ...styles.planBadge,

                                ...(plan.key ===
                                "monthly"
                                  ? styles.planBadgeBlue
                                  : {}),
                              }}
                            >
                              {
                                plan.badge
                              }
                            </span>
                          ) : null}
                        </div>

                        <strong
                          style={
                            styles.planPrice
                          }
                        >
                          {
                            plan.price
                          }
                        </strong>

                        <span
                          style={
                            styles.planBilling
                          }
                        >
                          {
                            plan.billing
                          }
                        </span>

                        <span
                          style={
                            styles.planEquivalent
                          }
                        >
                          {
                            plan.equivalent
                          }
                        </span>

                        <span
                          style={{
                            ...styles.planSelect,

                            ...(selected
                              ? styles.planSelectActive
                              : {}),
                          }}
                        >
                          {selected
                            ? "✓ SELECTED"
                            : "SELECT PLAN"}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              <div
                style={
                  styles.selectedPlanBar
                }
              >
                <span
                  style={
                    styles.selectedPlanLabel
                  }
                >
                  YOUR PLAN
                </span>

                <strong
                  style={
                    styles.selectedPlanValue
                  }
                >
                  {
                    selectedPlanDetails?.title
                  }{" "}
                  —{" "}
                  {
                    selectedPlanDetails?.price
                  }
                </strong>
              </div>
            </section>

            <section
              style={
                styles.section
              }
            >
              <div
                style={
                  styles.simpleHeader
                }
              >
                <p
                  style={
                    styles.eyebrow
                  }
                >
                  CONFIRM
                </p>

                <h2
                  style={
                    styles.sectionTitle
                  }
                >
                  Confirm before
                  payment
                </h2>
              </div>

              <div
                style={
                  styles.ackList
                }
              >
                <label
                  style={
                    styles.ackRow
                  }
                >
                  <input
                    type="checkbox"
                    checked={
                      ageConfirmed
                    }
                    onChange={(e) =>
                      setAgeConfirmed(
                        e.target.checked
                      )
                    }
                    style={
                      styles.checkbox
                    }
                  />

                  <span>
                    I confirm that I
                    am{" "}
                    <strong>
                      18 years of age
                      or older.
                    </strong>
                  </span>
                </label>

                <label
                  style={
                    styles.ackRow
                  }
                >
                  <input
                    type="checkbox"
                    checked={
                      billingConfirmed
                    }
                    onChange={(e) =>
                      setBillingConfirmed(
                        e.target.checked
                      )
                    }
                    style={
                      styles.checkbox
                    }
                  />

                  <span>
                    I understand the
                    subscription price
                    and billing
                    frequency for the
                    plan I selected.
                  </span>
                </label>

                <label
                  style={
                    styles.ackRow
                  }
                >
                  <input
                    type="checkbox"
                    checked={
                      renewalConfirmed
                    }
                    onChange={(e) =>
                      setRenewalConfirmed(
                        e.target.checked
                      )
                    }
                    style={
                      styles.checkbox
                    }
                  />

                  <span>
                    I understand that
                    recurring plans
                    continue billing
                    according to the
                    selected billing
                    cycle unless
                    canceled.
                  </span>
                </label>

                <label
                  style={
                    styles.ackRow
                  }
                >
                  <input
                    type="checkbox"
                    checked={
                      termsConfirmed
                    }
                    onChange={(e) =>
                      setTermsConfirmed(
                        e.target.checked
                      )
                    }
                    style={
                      styles.checkbox
                    }
                  />

                  <span>
                    I agree to the{" "}
                    <strong>
                      HireMinds Terms
                      and Privacy
                      Policy.
                    </strong>
                  </span>
                </label>
              </div>
            </section>

            {message ? (
              <div
                style={
                  styles.message
                }
              >
                {message}
              </div>
            ) : null}

            <button
              type="button"
              onClick={
                handleSubscriptionCheckout
              }
              disabled={loading}
              style={
                styles.submitButton
              }
            >
              <span>
                {loading
                  ? "Preparing Payment..."
                  : "Continue to Secure Payment"}
              </span>

              {!loading ? (
                <span
                  style={
                    styles.arrow
                  }
                >
                  →
                </span>
              ) : null}
            </button>
          </>
        )}

        <footer
          style={styles.footer}
        >
          <strong
            style={
              styles.footerBrand
            }
          >
            HIREMINDS
          </strong>

          <span
            style={
              styles.footerText
            }
          >
            Your career is bigger
            than one application.
          </span>
        </footer>
      </div>
    </main>
  );
}

const styles: {
  [key: string]:
    React.CSSProperties;
} = {
  page: {
    minHeight: "100vh",

    padding:
      "28px 18px 60px",

    boxSizing: "border-box",

    color: "#111820",

    background:
      "linear-gradient(180deg, #e9eef2 0%, #f7f9fa 32%, #ffffff 67%, #e9eef2 100%)",
  },

  shell: {
    width: "100%",

    maxWidth: "1120px",

    margin: "0 auto",

    display: "flex",

    flexDirection:
      "column",

    gap: "22px",
  },

  /*
    LOADING
  */

  loadingCard: {
    width: "100%",

    maxWidth: "560px",

    margin:
      "130px auto 0",

    display: "flex",

    alignItems:
      "center",

    gap: "15px",

    padding: "24px",

    borderRadius:
      "22px",

    backgroundColor:
      "#ffffff",

    border:
      "1px solid #cbd3d9",

    boxShadow:
      "0 18px 46px rgba(20, 34, 47, 0.10)",
  },

  loadingDot: {
    width: "18px",

    height: "18px",

    minWidth: "18px",

    borderRadius:
      "50%",

    backgroundColor:
      "#176fae",

    boxShadow:
      "0 0 0 7px rgba(23, 111, 174, 0.12)",
  },

  loadingTitle: {
    color: "#111820",

    fontSize: "16px",
  },

  loadingText: {
    margin:
      "4px 0 0",

    color: "#68737d",

    fontSize: "13px",
  },

  /*
    ERROR
  */

  errorCard: {
    width: "100%",

    maxWidth: "600px",

    margin:
      "100px auto 0",

    padding: "36px",

    borderRadius:
      "26px",

    backgroundColor:
      "#ffffff",

    border:
      "1px solid #cbd3d9",

    boxShadow:
      "0 18px 46px rgba(20, 34, 47, 0.11)",

    textAlign:
      "center",
  },

  errorIcon: {
    width: "48px",

    height: "48px",

    margin:
      "0 auto 18px",

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    borderRadius:
      "15px",

    backgroundColor:
      "#111820",

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
    margin:
      "12px auto 22px",

    maxWidth: "460px",

    color: "#65717c",

    fontSize: "14px",

    lineHeight: 1.65,
  },

  primaryLink: {
    display:
      "inline-block",

    padding:
      "13px 22px",

    borderRadius:
      "12px",

    background:
      "linear-gradient(90deg, #111820 0%, #176fae 70%, #2588c7 100%)",

    color: "#ffffff",

    textDecoration:
      "none",

    fontWeight: 900,
  },

  /*
    HERO
  */

  hero: {
    position:
      "relative",

    overflow:
      "hidden",

    display: "grid",

    gridTemplateColumns:
      "minmax(0, 1.5fr) minmax(270px, 0.55fr)",

    gap: "30px",

    alignItems:
      "stretch",

    padding: "42px",

    borderRadius:
      "30px",

    backgroundColor:
      "#ffffff",

    border:
      "1px solid #cbd3d9",

    boxShadow:
      "0 18px 48px rgba(20, 34, 47, 0.10)",
  },

  heroGlow: {
    position:
      "absolute",

    width: "430px",

    height: "430px",

    top: "-230px",

    right: "80px",

    borderRadius:
      "50%",

    background:
      "radial-gradient(circle, rgba(36, 139, 202, 0.20) 0%, rgba(36, 139, 202, 0.05) 50%, rgba(36, 139, 202, 0) 72%)",

    pointerEvents:
      "none",
  },

  heroCopy: {
    position:
      "relative",

    zIndex: 1,

    display: "flex",

    flexDirection:
      "column",

    justifyContent:
      "center",
  },

  brandLine: {
    display: "flex",

    alignItems:
      "center",

    gap: "8px",

    marginBottom:
      "18px",

    flexWrap: "wrap",
  },

  brandDot: {
    width: "10px",

    height: "10px",

    borderRadius:
      "50%",

    backgroundColor:
      "#176fae",

    boxShadow:
      "0 0 0 5px rgba(23, 111, 174, 0.10)",
  },

  brand: {
    color: "#111820",

    fontSize: "11px",

    fontWeight: 950,

    letterSpacing:
      "0.14em",
  },

  brandSlash: {
    color: "#9ca6af",

    fontSize: "11px",
  },

  brandSub: {
    color: "#66727c",

    fontSize: "10px",

    fontWeight: 900,

    letterSpacing:
      "0.12em",
  },

  heroTitle: {
    margin: 0,

    maxWidth:
      "760px",

    color: "#10161d",

    fontSize:
      "clamp(38px, 5.6vw, 62px)",

    lineHeight: 1,

    fontWeight: 950,

    letterSpacing:
      "-0.05em",
  },

  heroText: {
    maxWidth:
      "720px",

    margin:
      "20px 0 0",

    color: "#58636e",

    fontSize: "15px",

    lineHeight: 1.7,
  },

  heroStatus: {
    position:
      "relative",

    zIndex: 1,

    display: "flex",

    flexDirection:
      "column",

    justifyContent:
      "center",

    padding: "26px",

    borderRadius:
      "22px",

    background:
      "linear-gradient(145deg, #111820 0%, #202b35 62%, #174f73 125%)",

    boxShadow:
      "0 16px 34px rgba(16, 24, 32, 0.19)",
  },

  statusLabel: {
    color: "#78b8e1",

    fontSize: "9px",

    fontWeight: 950,

    letterSpacing:
      "0.15em",
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

    margin:
      "18px 0",

    backgroundColor:
      "#40505c",
  },

  /*
    REFERRAL AGREEMENT
  */

  agreementSection: {
    padding:
      "38px 42px",

    borderRadius:
      "28px",

    backgroundColor:
      "#ffffff",

    border:
      "1px solid #cbd3d9",

    boxShadow:
      "0 15px 42px rgba(20, 34, 47, 0.07)",
  },

  agreementHeader: {
    maxWidth:
      "760px",

    marginBottom:
      "28px",
  },

  eyebrow: {
    margin:
      "0 0 7px",

    color: "#176fae",

    fontSize: "10px",

    fontWeight: 950,

    letterSpacing:
      "0.16em",
  },

  sectionTitle: {
    margin: 0,

    color: "#111820",

    fontSize:
      "clamp(29px, 4vw, 40px)",

    lineHeight: 1.05,

    fontWeight: 950,

    letterSpacing:
      "-0.035em",
  },

  sectionIntro: {
    margin:
      "10px 0 0",

    color: "#68737d",

    fontSize: "14px",

    lineHeight: 1.65,
  },

  identityBar: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(190px, 1fr))",

    gap: "12px",

    padding:
      "18px 0",

    marginBottom:
      "8px",

    borderTop:
      "1px solid #d9e0e5",

    borderBottom:
      "1px solid #d9e0e5",
  },

  identityItem: {
    display: "flex",

    flexDirection:
      "column",

    gap: "5px",

    paddingRight:
      "15px",
  },

  identityLabel: {
    color: "#74808a",

    fontSize: "9px",

    fontWeight: 950,

    letterSpacing:
      "0.12em",

    textTransform:
      "uppercase",
  },

  identityValue: {
    color: "#222b34",

    fontSize: "13px",

    overflowWrap:
      "anywhere",
  },

  agreementContent: {
    marginTop: "8px",
  },

  agreementBlock: {
    display: "grid",

    gridTemplateColumns:
      "minmax(150px, 210px) minmax(0, 1fr)",

    gap: "34px",

    padding:
      "28px 0",
  },

  agreementLabel: {
    color: "#176fae",

    fontSize: "9px",

    fontWeight: 950,

    letterSpacing:
      "0.13em",

    lineHeight: 1.6,
  },

  agreementCopy: {
    maxWidth:
      "720px",
  },

  agreementTitle: {
    margin: 0,

    color: "#172029",

    fontSize: "19px",

    lineHeight: 1.2,

    fontWeight: 950,
  },

  agreementText: {
    margin:
      "9px 0 0",

    color: "#56626c",

    fontSize: "13px",

    lineHeight: 1.7,
  },

  agreementDivider: {
    height: "1px",

    backgroundColor:
      "#dde3e7",
  },

  accessNotice: {
    marginTop: "16px",

    padding:
      "5px 0 5px 19px",

    borderLeft:
      "4px solid #176fae",
  },

  accessNoticeLabel: {
    color: "#176fae",

    fontSize: "9px",

    fontWeight: 950,

    letterSpacing:
      "0.14em",
  },

  accessNoticeText: {
    margin:
      "7px 0 0",

    color: "#46535d",

    fontSize: "13px",

    lineHeight: 1.65,
  },

  finalAgreement: {
    marginTop:
      "30px",

    display: "flex",

    alignItems:
      "flex-start",

    gap: "13px",

    paddingTop:
      "25px",

    borderTop:
      "1px solid #cfd7dd",

    color: "#111820",

    cursor: "pointer",
  },

  finalAgreementTitle: {
    display: "block",

    fontSize: "15px",

    fontWeight: 950,
  },

  finalAgreementText: {
    margin:
      "5px 0 0",

    color: "#64717b",

    fontSize: "12px",

    lineHeight: 1.55,
  },

  checkbox: {
    width: "18px",

    height: "18px",

    minWidth: "18px",

    marginTop: "1px",

    accentColor:
      "#176fae",
  },

  checkboxLarge: {
    width: "21px",

    height: "21px",

    minWidth: "21px",

    marginTop: "1px",

    accentColor:
      "#176fae",
  },

  /*
    SUBSCRIPTION
  */

  section: {
    padding: "34px",

    borderRadius:
      "26px",

    backgroundColor:
      "#ffffff",

    border:
      "1px solid #cbd3d9",

    boxShadow:
      "0 14px 40px rgba(20, 34, 47, 0.06)",
  },

  simpleHeader: {
    marginBottom:
      "26px",
  },

  planGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(225px, 1fr))",

    gap: "14px",
  },

  planCard: {
    minHeight:
      "225px",

    display: "flex",

    flexDirection:
      "column",

    textAlign:
      "left",

    padding: "20px",

    borderRadius:
      "18px",

    border:
      "1px solid #c7cdd3",

    background:
      "linear-gradient(180deg, #ffffff 0%, #f0f3f5 100%)",

    color: "#111820",

    cursor: "pointer",
  },

  planCardSelected: {
    border:
      "2px solid #176fae",

    background:
      "linear-gradient(180deg, #ffffff 0%, #eaf5fc 100%)",

    boxShadow:
      "0 13px 30px rgba(23, 111, 174, 0.16)",
  },

  planTop: {
    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    gap: "10px",
  },

  planBadge: {
    padding:
      "5px 8px",

    borderRadius:
      "999px",

    backgroundColor:
      "#111820",

    color: "#ffffff",

    fontSize: "9px",

    fontWeight: 950,

    letterSpacing:
      "0.06em",
  },

  planBadgeBlue: {
    background:
      "linear-gradient(90deg, #176fae 0%, #2588c7 100%)",
  },

  planTitle: {
    color: "#111820",

    fontSize: "12px",

    fontWeight: 950,

    textTransform:
      "uppercase",

    letterSpacing:
      "0.09em",
  },

  planPrice: {
    marginTop:
      "25px",

    color: "#111820",

    fontSize: "34px",

    fontWeight: 950,

    letterSpacing:
      "-0.03em",
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

    paddingTop:
      "18px",

    color: "#78828c",

    fontSize: "10px",

    fontWeight: 950,

    textTransform:
      "uppercase",

    letterSpacing:
      "0.06em",
  },

  planSelectActive: {
    color: "#176fae",
  },

  selectedPlanBar: {
    marginTop: "15px",

    display: "flex",

    justifyContent:
      "space-between",

    gap: "14px",

    flexWrap: "wrap",

    padding:
      "14px 16px",

    borderRadius:
      "12px",

    background:
      "linear-gradient(90deg, #e9edf0 0%, #e6f0f7 100%)",

    border:
      "1px solid #cbd6de",
  },

  selectedPlanLabel: {
    color: "#68737d",

    fontSize: "9px",

    fontWeight: 950,

    letterSpacing:
      "0.12em",
  },

  selectedPlanValue: {
    color: "#151c23",

    fontSize: "13px",
  },

  ackList: {
    display: "flex",

    flexDirection:
      "column",

    gap: "0",

    borderTop:
      "1px solid #dce2e6",
  },

  ackRow: {
    display: "flex",

    alignItems:
      "flex-start",

    gap: "11px",

    padding:
      "17px 2px",

    borderBottom:
      "1px solid #dce2e6",

    color: "#45515c",

    fontSize: "13px",

    lineHeight: 1.6,

    cursor: "pointer",
  },

  /*
    MESSAGE + BUTTON
  */

  message: {
    padding:
      "14px 16px",

    borderRadius:
      "13px",

    backgroundColor:
      "#fff0f0",

    border:
      "1px solid #d9a8a8",

    color: "#8a2e2e",

    fontSize: "13px",

    fontWeight: 850,
  },

  submitButton: {
    width: "100%",

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap: "14px",

    padding:
      "18px 22px",

    borderRadius:
      "15px",

    border:
      "1px solid #0c5d95",

    background:
      "linear-gradient(90deg, #111820 0%, #176fae 45%, #2588c7 100%)",

    color: "#ffffff",

    fontSize: "15px",

    fontWeight: 950,

    cursor: "pointer",

    boxShadow:
      "0 12px 28px rgba(23, 111, 174, 0.24)",
  },

  arrow: {
    fontSize: "20px",

    fontWeight: 400,
  },

  /*
    FOOTER
  */

  footer: {
    display: "flex",

    justifyContent:
      "center",

    gap: "8px",

    flexWrap: "wrap",

    padding:
      "15px 10px 0",

    textAlign:
      "center",
  },

  footerBrand: {
    color: "#111820",

    fontSize: "9px",

    fontWeight: 950,

    letterSpacing:
      "0.14em",
  },

  footerText: {
    color: "#747e87",

    fontSize: "10px",
  },
};
