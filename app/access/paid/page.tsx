

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

type PlanKey = "monthly" | "four_month" | "annual";

type Plan = {
  key: PlanKey;
  title: string;
  price: string;
  billing: string;
  equivalent: string;
  description: string;
  badge: string;
};

const PLANS: Record<PlanKey, Plan> = {
  monthly: {
    key: "monthly",
    title: "Monthly",
    price: "$24.99",
    billing: "per month",
    equivalent: "Flexible monthly access",
    description:
      "A flexible monthly HireMinds subscription with recurring billing.",
    badge: "START HERE",
  },
  four_month: {
    key: "four_month",
    title: "4-Month",
    price: "$79.96",
    billing: "every 4 months",
    equivalent: "$19.99/mo equivalent",
    description:
      "Four months of HireMinds access billed as one recurring 4-month subscription.",
    badge: "SAVE 20%",
  },
  annual: {
    key: "annual",
    title: "Annual",
    price: "$179.88",
    billing: "per year • paid in full",
    equivalent: "$14.99/mo equivalent",
    description:
      "Twelve months of HireMinds access billed annually as one recurring yearly subscription.",
    badge: "BEST VALUE",
  },
};

function normalizePlan(value: string | null): PlanKey {
  if (value === "four_month") return "four_month";
  if (value === "annual") return "annual";
  return "monthly";
}

function PaidAccessContent() {
  const searchParams = useSearchParams();

  const planFromUrl = normalizePlan(searchParams.get("plan"));

  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(planFromUrl);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loadingPage, setLoadingPage] = useState(true);
  const [startingCheckout, setStartingCheckout] = useState(false);
  const [message, setMessage] = useState("");

  const plan = useMemo(() => PLANS[selectedPlan], [selectedPlan]);

  useEffect(() => {
    let mounted = true;

    async function loadAccount() {
      try {
        setLoadingPage(true);
        setMessage("");

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(sessionError.message);
        }

        const user = session?.user;

        if (!user) {
          if (!mounted) return;

          setMessage(
            "Your account session could not be found. Please sign in to continue to payment."
          );
          setLoadingPage(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("candidate_profiles")
          .select(
            "full_name, email, access_tier, subscription_status, subscription_plan, has_paid_access"
          )
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) {
          throw new Error(profileError.message);
        }

        if (!mounted) return;

        setFullName(profile?.full_name || user.user_metadata?.full_name || "");
        setEmail(profile?.email || user.email || "");

        if (
          profile?.subscription_plan === "monthly" ||
          profile?.subscription_plan === "four_month" ||
          profile?.subscription_plan === "annual"
        ) {
          setSelectedPlan(profile.subscription_plan);
        } else {
          setSelectedPlan(planFromUrl);
        }

        /*
          If Stripe has already activated paid access, there is no reason
          to keep the member on the payment page.
        */
        if (
          profile?.has_paid_access === true &&
          profile?.subscription_status === "active"
        ) {
          window.location.replace("/profile");
          return;
        }

        /*
          Paid accounts should remain pending until Stripe confirms payment.
        */
        if (
          profile?.access_tier !== "pending_payment" ||
          profile?.subscription_status !== "pending_payment"
        ) {
          const { error: pendingError } = await supabase
            .from("candidate_profiles")
            .update({
              access_tier: "pending_payment",
              subscription_status: "pending_payment",
              subscription_plan: planFromUrl,
              subscription_provider: "stripe",
              has_paid_access: false,
            })
            .eq("user_id", user.id);

          if (pendingError) {
            throw new Error(pendingError.message);
          }
        }
      } catch (error: any) {
        if (!mounted) return;

        setMessage(
          error?.message ||
            "We could not load your payment information. Please try again."
        );
      } finally {
        if (mounted) {
          setLoadingPage(false);
        }
      }
    }

    loadAccount();

    return () => {
      mounted = false;
    };
  }, [planFromUrl]);

  async function choosePlan(nextPlan: PlanKey) {
    if (startingCheckout) return;

    setSelectedPlan(nextPlan);
    setMessage("");

    try {
      localStorage.setItem("hireminds_pending_subscription_plan", nextPlan);
    } catch {
      // Local storage is only a convenience.
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) return;

    const { error } = await supabase
      .from("candidate_profiles")
      .update({
        subscription_plan: nextPlan,
        subscription_provider: "stripe",
        subscription_status: "pending_payment",
        access_tier: "pending_payment",
        has_paid_access: false,
      })
      .eq("user_id", user.id);

    if (error) {
      setMessage(error.message);
    }
  }

  async function handleStripeCheckout() {
    if (startingCheckout) return;

    try {
      setStartingCheckout(true);
      setMessage("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(sessionError.message);
      }

      const user = session?.user;

      if (!user) {
        throw new Error(
          "Please sign in again before continuing to Stripe checkout."
        );
      }

      /*
        Keep database access locked before leaving HireMinds.
        Stripe/webhook confirmation will activate paid access later.
      */
      const { error: profileError } = await supabase
        .from("candidate_profiles")
        .update({
          subscription_plan: selectedPlan,
          subscription_provider: "stripe",
          subscription_status: "pending_payment",
          access_tier: "pending_payment",
          has_paid_access: false,
        })
        .eq("user_id", user.id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: selectedPlan,
        }),
      });

      const raw = await response.text();

      let data: {
        url?: string;
        error?: string;
      } = {};

      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }

      if (!response.ok || !data.url) {
        throw new Error(
          data.error ||
            "Stripe checkout could not be started. Please try again."
        );
      }

      window.location.href = data.url;
    } catch (error: any) {
      setMessage(
        error?.message ||
          "Stripe checkout could not be started. Please try again."
      );
      setStartingCheckout(false);
    }
  }

  if (loadingPage) {
    return (
      <main style={styles.page}>
        <section style={styles.loadingCard}>
          <div style={styles.loadingLogo}>HIREMINDS</div>
          <h1 style={styles.loadingTitle}>Preparing your checkout</h1>
          <p style={styles.loadingText}>
            We&apos;re loading your selected HireMinds subscription.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.hero}>
          <div style={styles.heroGlow} />

          <div style={styles.heroContent}>
            <div>
              <div style={styles.brandLine}>
                <span style={styles.brandDot} />
                <span style={styles.brand}>HIREMINDS</span>
                <span style={styles.brandSlash}>/</span>
                <span style={styles.brandSub}>SUBSCRIPTION CHECKOUT</span>
              </div>

              <h1 style={styles.heroTitle}>
                Your next move starts
                <span style={styles.heroBlue}> with access.</span>
              </h1>

              <p style={styles.heroText}>
                Choose your HireMinds subscription, review your selection, and
                continue securely to Stripe to complete payment.
              </p>
            </div>

            <aside style={styles.securityCard}>
              <p style={styles.securityEyebrow}>SECURE CHECKOUT</p>
              <h2 style={styles.securityTitle}>Payment handled by Stripe</h2>
              <p style={styles.securityText}>
                HireMinds does not activate paid access until Stripe confirms
                your subscription.
              </p>

              <div style={styles.securityDivider} />

              <div style={styles.securityRow}>
                <span style={styles.securityCheck}>✓</span>
                <span>Secure hosted payment</span>
              </div>

              <div style={styles.securityRow}>
                <span style={styles.securityCheck}>✓</span>
                <span>Subscription status verified before access</span>
              </div>

              <div style={styles.securityRow}>
                <span style={styles.securityCheck}>✓</span>
                <span>No paid access before payment confirmation</span>
              </div>
            </aside>
          </div>
        </section>

        <section style={styles.checkoutGrid}>
          <div style={styles.planSection}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>01</div>

              <div>
                <p style={styles.eyebrow}>YOUR PLAN</p>
                <h2 style={styles.sectionTitle}>Choose your subscription</h2>
              </div>
            </div>

            <div style={styles.planGrid}>
              {(Object.keys(PLANS) as PlanKey[]).map((key) => {
                const item = PLANS[key];
                const active = selectedPlan === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => choosePlan(key)}
                    disabled={startingCheckout}
                    style={{
                      ...styles.planCard,
                      ...(active ? styles.planCardActive : {}),
                    }}
                  >
                    <div style={styles.planTop}>
                      <span style={styles.planName}>{item.title}</span>
                      <span
                        style={{
                          ...styles.planBadge,
                          ...(key === "monthly"
                            ? styles.planBadgeBlue
                            : {}),
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <strong style={styles.planPrice}>{item.price}</strong>
                    <span style={styles.planBilling}>{item.billing}</span>
                    <span style={styles.planEquivalent}>
                      {item.equivalent}
                    </span>

                    <span
                      style={{
                        ...styles.planStatus,
                        ...(active ? styles.planStatusActive : {}),
                      }}
                    >
                      {active ? "✓ Selected" : "Select plan"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <aside style={styles.summaryCard}>
            <div style={styles.summaryTop}>
              <p style={styles.summaryEyebrow}>ORDER SUMMARY</p>
              <span style={styles.summaryBadge}>{plan.badge}</span>
            </div>

            <h2 style={styles.summaryPlan}>{plan.title}</h2>

            <div style={styles.priceLine}>
              <strong style={styles.summaryPrice}>{plan.price}</strong>
              <span style={styles.summaryBilling}>{plan.billing}</span>
            </div>

            <p style={styles.summaryEquivalent}>{plan.equivalent}</p>

            <div style={styles.summaryDivider} />

            <p style={styles.summaryDescription}>{plan.description}</p>

            <div style={styles.accountBox}>
              <p style={styles.accountLabel}>ACCOUNT</p>
              {fullName ? (
                <strong style={styles.accountName}>{fullName}</strong>
              ) : null}
              <span style={styles.accountEmail}>{email || "Signed in"}</span>
            </div>

            <div style={styles.paymentNotice}>
              <strong style={styles.paymentNoticeTitle}>
                Payment is the final activation step.
              </strong>
              <span style={styles.paymentNoticeText}>
                Your HireMinds account remains pending until Stripe confirms
                your subscription.
              </span>
            </div>

            {message ? <div style={styles.message}>{message}</div> : null}

            <button
              type="button"
              onClick={handleStripeCheckout}
              disabled={startingCheckout}
              style={{
                ...styles.checkoutButton,
                ...(startingCheckout ? styles.checkoutButtonDisabled : {}),
              }}
            >
              <span>
                {startingCheckout
                  ? "Opening Stripe..."
                  : `Continue to Stripe — ${plan.price}`}
              </span>

              {!startingCheckout ? (
                <span style={styles.arrow}>→</span>
              ) : null}
            </button>

            <p style={styles.checkoutFinePrint}>
              You will review and authorize the final payment details on
              Stripe&apos;s secure checkout page.
            </p>
          </aside>
        </section>

        <section style={styles.bottomNotice}>
          <div style={styles.bottomMark}>HM</div>

          <div>
            <strong style={styles.bottomTitle}>
              Your account stays protected during checkout.
            </strong>
            <p style={styles.bottomText}>
              Closing this page or leaving Stripe before completing payment
              will not activate paid HireMinds access. You can return and
              finish checkout later.
            </p>
          </div>
        </section>

        <footer style={styles.footer}>
          <strong style={styles.footerBrand}>HIREMINDS</strong>
          <span style={styles.footerText}>
            Career development. Built for your next move.
          </span>
        </footer>
      </div>
    </main>
  );
}

export default function PaidAccessPage() {
  return (
    <Suspense
      fallback={
        <main style={styles.page}>
          <section style={styles.loadingCard}>
            <div style={styles.loadingLogo}>HIREMINDS</div>
            <h1 style={styles.loadingTitle}>Preparing your checkout</h1>
            <p style={styles.loadingText}>
              We&apos;re loading your selected HireMinds subscription.
            </p>
          </section>
        </main>
      }
    >
      <PaidAccessContent />
    </Suspense>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "28px 18px 55px",
    boxSizing: "border-box",
    background:
      "linear-gradient(180deg, #e7ebef 0%, #f4f6f8 18%, #ffffff 52%, #e7edf2 100%)",
    color: "#111820",
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
    width: "calc(100% - 36px)",
    maxWidth: "520px",
    margin: "80px auto",
    padding: "36px",
    boxSizing: "border-box",
    borderRadius: "24px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd2d9",
    boxShadow: "0 18px 50px rgba(16,29,43,0.12)",
    textAlign: "center",
  },

  loadingLogo: {
    color: "#176fae",
    fontSize: "10px",
    fontWeight: 950,
    letterSpacing: "0.16em",
  },

  loadingTitle: {
    margin: "14px 0 8px",
    color: "#111820",
    fontSize: "30px",
    fontWeight: 950,
    letterSpacing: "-0.03em",
  },

  loadingText: {
    margin: 0,
    color: "#68737d",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: "30px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd2d9",
    boxShadow: "0 18px 50px rgba(16,29,43,0.11)",
  },

  heroGlow: {
    position: "absolute",
    width: "480px",
    height: "480px",
    right: "-190px",
    top: "-210px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(29,126,191,0.23) 0%, rgba(29,126,191,0.06) 48%, rgba(29,126,191,0) 72%)",
    pointerEvents: "none",
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "minmax(0,1.45fr) minmax(290px,0.7fr)",
    gap: "34px",
    alignItems: "center",
    padding: "48px",
  },

  brandLine: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    flexWrap: "wrap",
    marginBottom: "19px",
  },

  brandDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#176fae",
    boxShadow: "0 0 0 5px rgba(23,111,174,0.10)",
  },

  brand: {
    color: "#111820",
    fontSize: "11px",
    fontWeight: 950,
    letterSpacing: "0.14em",
  },

  brandSlash: {
    color: "#9ba5ae",
    fontSize: "11px",
  },

  brandSub: {
    color: "#68737d",
    fontSize: "10px",
    fontWeight: 850,
    letterSpacing: "0.12em",
  },

  heroTitle: {
    maxWidth: "720px",
    margin: 0,
    color: "#0d1117",
    fontSize: "clamp(40px,6vw,64px)",
    lineHeight: 0.99,
    fontWeight: 950,
    letterSpacing: "-0.05em",
  },

  heroBlue: {
    color: "#176fae",
  },

  heroText: {
    maxWidth: "700px",
    margin: "20px 0 0",
    color: "#53606b",
    fontSize: "16px",
    lineHeight: 1.68,
  },

  securityCard: {
    padding: "27px",
    borderRadius: "22px",
    background:
      "linear-gradient(145deg, #111820 0%, #202a34 60%, #174d70 120%)",
    boxShadow: "0 18px 40px rgba(12,20,28,0.20)",
  },

  securityEyebrow: {
    margin: 0,
    color: "#79bde8",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.15em",
  },

  securityTitle: {
    margin: "9px 0 8px",
    color: "#ffffff",
    fontSize: "22px",
    lineHeight: 1.08,
    fontWeight: 950,
  },

  securityText: {
    margin: 0,
    color: "#c4ccd3",
    fontSize: "12px",
    lineHeight: 1.58,
  },

  securityDivider: {
    height: "1px",
    margin: "19px 0",
    backgroundColor: "#40505c",
  },

  securityRow: {
    display: "flex",
    gap: "9px",
    alignItems: "flex-start",
    marginTop: "10px",
    color: "#d7dde2",
    fontSize: "11px",
    lineHeight: 1.45,
  },

  securityCheck: {
    color: "#76bbe7",
    fontWeight: 950,
  },

  checkoutGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0,1.48fr) minmax(310px,0.72fr)",
    gap: "20px",
    alignItems: "start",
  },

  planSection: {
    padding: "31px",
    borderRadius: "26px",
    backgroundColor: "#ffffff",
    border: "1px solid #cfd5da",
    boxShadow: "0 14px 40px rgba(21,32,43,0.06)",
  },

  sectionHeader: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "23px",
  },

  sectionNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "44px",
    height: "44px",
    minWidth: "44px",
    borderRadius: "13px",
    background:
      "linear-gradient(145deg, #176fae 0%, #258bc8 100%)",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: 950,
  },

  eyebrow: {
    margin: "1px 0 6px",
    color: "#176fae",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.15em",
  },

  sectionTitle: {
    margin: 0,
    color: "#111820",
    fontSize: "28px",
    fontWeight: 950,
    letterSpacing: "-0.03em",
  },

  planGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
    gap: "12px",
  },

  planCard: {
    minHeight: "220px",
    display: "flex",
    flexDirection: "column",
    padding: "18px",
    textAlign: "left",
    borderRadius: "17px",
    border: "1px solid #c7cdd3",
    background:
      "linear-gradient(180deg,#ffffff 0%,#f0f3f5 100%)",
    color: "#111820",
    cursor: "pointer",
  },

  planCardActive: {
    border: "2px solid #176fae",
    background:
      "linear-gradient(180deg,#ffffff 0%,#eaf5fc 100%)",
    boxShadow: "0 13px 28px rgba(23,111,174,0.15)",
  },

  planTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    alignItems: "center",
  },

  planName: {
    color: "#111820",
    fontSize: "11px",
    fontWeight: 950,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  planBadge: {
    padding: "5px 7px",
    borderRadius: "999px",
    backgroundColor: "#111820",
    color: "#ffffff",
    fontSize: "8px",
    fontWeight: 950,
    letterSpacing: "0.05em",
  },

  planBadgeBlue: {
    background:
      "linear-gradient(90deg,#176fae 0%,#2588c7 100%)",
  },

  planPrice: {
    marginTop: "23px",
    color: "#111820",
    fontSize: "30px",
    fontWeight: 950,
    letterSpacing: "-0.03em",
  },

  planBilling: {
    marginTop: "2px",
    color: "#6e7983",
    fontSize: "11px",
  },

  planEquivalent: {
    marginTop: "7px",
    color: "#176fae",
    fontSize: "11px",
    fontWeight: 850,
  },

  planStatus: {
    marginTop: "auto",
    paddingTop: "18px",
    color: "#78828c",
    fontSize: "9px",
    fontWeight: 950,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  planStatusActive: {
    color: "#176fae",
  },

  summaryCard: {
    position: "sticky",
    top: "20px",
    padding: "27px",
    borderRadius: "25px",
    background:
      "linear-gradient(145deg,#111820 0%,#202b35 62%,#174d70 125%)",
    color: "#ffffff",
    boxShadow: "0 18px 46px rgba(12,20,28,0.20)",
  },

  summaryTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
  },

  summaryEyebrow: {
    margin: 0,
    color: "#79bde8",
    fontSize: "9px",
    fontWeight: 950,
    letterSpacing: "0.14em",
  },

  summaryBadge: {
    padding: "5px 8px",
    borderRadius: "999px",
    backgroundColor: "rgba(121,189,232,0.14)",
    color: "#9bd2f3",
    border: "1px solid rgba(121,189,232,0.24)",
    fontSize: "8px",
    fontWeight: 950,
  },

  summaryPlan: {
    margin: "18px 0 0",
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: 950,
    letterSpacing: "-0.03em",
  },

  priceLine: {
    display: "flex",
    alignItems: "baseline",
    gap: "7px",
    marginTop: "7px",
  },

  summaryPrice: {
    color: "#ffffff",
    fontSize: "36px",
    fontWeight: 950,
    letterSpacing: "-0.04em",
  },

  summaryBilling: {
    color: "#b9c5ce",
    fontSize: "11px",
  },

  summaryEquivalent: {
    margin: "6px 0 0",
    color: "#83c5ec",
    fontSize: "11px",
    fontWeight: 850,
  },

  summaryDivider: {
    height: "1px",
    margin: "20px 0",
    backgroundColor: "#40505c",
  },

  summaryDescription: {
    margin: 0,
    color: "#c4cdd4",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  accountBox: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    marginTop: "18px",
    padding: "13px 14px",
    borderRadius: "13px",
    backgroundColor: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.09)",
  },

  accountLabel: {
    margin: 0,
    color: "#78bde8",
    fontSize: "8px",
    fontWeight: 950,
    letterSpacing: "0.12em",
  },

  accountName: {
    marginTop: "3px",
    color: "#ffffff",
    fontSize: "12px",
  },

  accountEmail: {
    color: "#bfc9d0",
    fontSize: "11px",
  },

  paymentNotice: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginTop: "15px",
    padding: "13px 14px",
    borderRadius: "13px",
    backgroundColor: "rgba(118,187,231,0.08)",
    border: "1px solid rgba(118,187,231,0.18)",
  },

  paymentNoticeTitle: {
    color: "#ffffff",
    fontSize: "11px",
  },

  paymentNoticeText: {
    color: "#bfcbd3",
    fontSize: "10px",
    lineHeight: 1.5,
  },

  message: {
    marginTop: "15px",
    padding: "12px 13px",
    borderRadius: "11px",
    backgroundColor: "#fff0f0",
    border: "1px solid #dba6a6",
    color: "#8c2f2f",
    fontSize: "11px",
    lineHeight: 1.5,
    fontWeight: 800,
  },

  checkoutButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: "18px",
    padding: "15px 16px",
    borderRadius: "13px",
    border: "1px solid #529fce",
    background:
      "linear-gradient(90deg,#176fae 0%,#258bc8 100%)",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 950,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(23,111,174,0.26)",
  },

  checkoutButtonDisabled: {
    opacity: 0.62,
    cursor: "default",
  },

  arrow: {
    fontSize: "18px",
    fontWeight: 400,
  },

  checkoutFinePrint: {
    margin: "11px 0 0",
    color: "#9fadb8",
    fontSize: "9px",
    lineHeight: 1.5,
    textAlign: "center",
  },

  bottomNotice: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
    padding: "20px 22px",
    borderRadius: "20px",
    background:
      "linear-gradient(90deg,#eef2f5 0%,#e7f1f7 100%)",
    border: "1px solid #c9d4dc",
  },

  bottomMark: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "42px",
    height: "42px",
    minWidth: "42px",
    borderRadius: "12px",
    backgroundColor: "#111820",
    color: "#ffffff",
    fontSize: "10px",
    fontWeight: 950,
  },

  bottomTitle: {
    color: "#111820",
    fontSize: "13px",
  },

  bottomText: {
    margin: "5px 0 0",
    color: "#65717b",
    fontSize: "11px",
    lineHeight: 1.55,
  },

  footer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "9px",
    flexWrap: "wrap",
    padding: "11px",
    color: "#75808a",
    fontSize: "10px",
  },

  footerBrand: {
    color: "#111820",
    letterSpacing: "0.13em",
    fontWeight: 950,
  },

  footerText: {
    color: "#7b858e",
  },
};
