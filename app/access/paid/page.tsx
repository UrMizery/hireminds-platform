"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

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

  const [selectedPlan, setSelectedPlan] =
    useState<PlanKey>(planFromUrl);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [startingCheckout, setStartingCheckout] =
    useState(false);

  const [message, setMessage] = useState("");

  const plan = useMemo(
    () => PLANS[selectedPlan],
    [selectedPlan]
  );

  function choosePlan(nextPlan: PlanKey) {
    if (startingCheckout) return;

    setSelectedPlan(nextPlan);
    setMessage("");
  }

  async function handleStripeCheckout() {
    if (startingCheckout) return;

    try {
      setStartingCheckout(true);
      setMessage("");

      if (!fullName.trim()) {
        throw new Error("Please enter your full name.");
      }

      if (
        !email.trim() ||
        !email.includes("@")
      ) {
        throw new Error("Please enter a valid email address.");
      }

      const response = await fetch(
        "/api/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan: selectedPlan,
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            city: city.trim(),
            state: state.trim(),
          }),
        }
      );

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
                <span style={styles.brandSub}>
                  SUBSCRIPTION CHECKOUT
                </span>
              </div>

              <h1 style={styles.heroTitle}>
                Your next move starts
                <span style={styles.heroBlue}>
                  {" "}
                  with access.
                </span>
              </h1>

              <p style={styles.heroText}>
                Choose your HireMinds subscription, enter your
                information, and continue securely to Stripe.
                Your HireMinds account is created only after
                payment is confirmed.
              </p>
            </div>

            <aside style={styles.securityCard}>
              <p style={styles.securityEyebrow}>
                SECURE CHECKOUT
              </p>

              <h2 style={styles.securityTitle}>
                Payment handled by Stripe
              </h2>

              <p style={styles.securityText}>
                HireMinds does not create or activate a paid
                account until Stripe confirms your payment.
              </p>

              <div style={styles.securityDivider} />

              <div style={styles.securityRow}>
                <span style={styles.securityCheck}>✓</span>
                <span>Secure hosted payment</span>
              </div>

              <div style={styles.securityRow}>
                <span style={styles.securityCheck}>✓</span>
                <span>Payment verified before account creation</span>
              </div>

              <div style={styles.securityRow}>
                <span style={styles.securityCheck}>✓</span>
                <span>No paid account before payment confirmation</span>
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
                <h2 style={styles.sectionTitle}>
                  Choose your subscription
                </h2>
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
                      ...(active
                        ? styles.planCardActive
                        : {}),
                    }}
                  >
                    <div style={styles.planTop}>
                      <span style={styles.planName}>
                        {item.title}
                      </span>

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

                    <strong style={styles.planPrice}>
                      {item.price}
                    </strong>

                    <span style={styles.planBilling}>
                      {item.billing}
                    </span>

                    <span style={styles.planEquivalent}>
                      {item.equivalent}
                    </span>

                    <span
                      style={{
                        ...styles.planStatus,
                        ...(active
                          ? styles.planStatusActive
                          : {}),
                      }}
                    >
                      {active
                        ? "✓ Selected"
                        : "Select plan"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={styles.formSection}>
              <div style={styles.sectionHeader}>
                <div style={styles.sectionNumber}>02</div>

                <div>
                  <p style={styles.eyebrow}>
                    YOUR INFORMATION
                  </p>

                  <h2 style={styles.sectionTitle}>
                    Enter your details
                  </h2>
                </div>
              </div>

              <div style={styles.formGrid}>
                <input
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  placeholder="Full name"
                  style={styles.input}
                />

                <input
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Email address"
                  type="email"
                  style={styles.input}
                />

                <input
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="Phone"
                  style={styles.input}
                />

                <input
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                  placeholder="City"
                  style={styles.input}
                />

                <input
                  value={state}
                  onChange={(e) =>
                    setState(e.target.value)
                  }
                  placeholder="State"
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          <aside style={styles.summaryCard}>
            <div style={styles.summaryTop}>
              <p style={styles.summaryEyebrow}>
                ORDER SUMMARY
              </p>

              <span style={styles.summaryBadge}>
                {plan.badge}
              </span>
            </div>

            <h2 style={styles.summaryPlan}>
              {plan.title}
            </h2>

            <div style={styles.priceLine}>
              <strong style={styles.summaryPrice}>
                {plan.price}
              </strong>

              <span style={styles.summaryBilling}>
                {plan.billing}
              </span>
            </div>

            <p style={styles.summaryEquivalent}>
              {plan.equivalent}
            </p>

            <div style={styles.summaryDivider} />

            <p style={styles.summaryDescription}>
              {plan.description}
            </p>

            <div style={styles.paymentNotice}>
              <strong style={styles.paymentNoticeTitle}>
                Payment comes first.
              </strong>

              <span style={styles.paymentNoticeText}>
                Your HireMinds account will not be created until
                Stripe confirms your payment.
              </span>
            </div>

            {message ? (
              <div style={styles.message}>
                {message}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleStripeCheckout}
              disabled={startingCheckout}
              style={{
                ...styles.checkoutButton,
                ...(startingCheckout
                  ? styles.checkoutButtonDisabled
                  : {}),
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
              You will review and authorize the final payment
              details on Stripe&apos;s secure checkout page.
            </p>
          </aside>
        </section>
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
            <div style={styles.loadingLogo}>
              HIREMINDS
            </div>

            <h1 style={styles.loadingTitle}>
              Preparing checkout
            </h1>
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
    gridTemplateColumns:
      "minmax(0,1.45fr) minmax(290px,0.7fr)",
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
    margin: 0,
    color: "#0d1117",
    fontSize: "clamp(40px,6vw,64px)",
    lineHeight: 0.99,
    fontWeight: 950,
  },

  heroBlue: {
    color: "#176fae",
  },

  heroText: {
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
  },

  securityEyebrow: {
    margin: 0,
    color: "#79bde8",
    fontSize: "9px",
    fontWeight: 950,
  },

  securityTitle: {
    margin: "9px 0 8px",
    color: "#ffffff",
    fontSize: "22px",
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
    marginTop: "10px",
    color: "#d7dde2",
    fontSize: "11px",
  },

  securityCheck: {
    color: "#76bbe7",
    fontWeight: 950,
  },

  checkoutGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0,1.48fr) minmax(310px,0.72fr)",
    gap: "20px",
    alignItems: "start",
  },

  planSection: {
    padding: "31px",
    borderRadius: "26px",
    backgroundColor: "#ffffff",
    border: "1px solid #cfd5da",
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
    borderRadius: "13px",
    background:
      "linear-gradient(145deg, #176fae 0%, #258bc8 100%)",
    color: "#ffffff",
    fontWeight: 950,
  },

  eyebrow: {
    margin: "1px 0 6px",
    color: "#176fae",
    fontSize: "9px",
    fontWeight: 950,
  },

  sectionTitle: {
    margin: 0,
    color: "#111820",
    fontSize: "28px",
    fontWeight: 950,
  },

  planGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(190px,1fr))",
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
  },

  planTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    alignItems: "center",
  },

  planName: {
    fontSize: "11px",
    fontWeight: 950,
    textTransform: "uppercase",
  },

  planBadge: {
    padding: "5px 7px",
    borderRadius: "999px",
    backgroundColor: "#111820",
    color: "#ffffff",
    fontSize: "8px",
    fontWeight: 950,
  },

  planBadgeBlue: {
    background:
      "linear-gradient(90deg,#176fae 0%,#2588c7 100%)",
  },

  planPrice: {
    marginTop: "23px",
    fontSize: "30px",
    fontWeight: 950,
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
  },

  planStatusActive: {
    color: "#176fae",
  },

  formSection: {
    marginTop: "34px",
    paddingTop: "30px",
    borderTop: "1px solid #d6dde3",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "12px",
  },

  input: {
    width: "100%",
    padding: "14px 15px",
    borderRadius: "12px",
    border: "1px solid #c7d0d8",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  summaryCard: {
    position: "sticky",
    top: "20px",
    padding: "27px",
    borderRadius: "25px",
    background:
      "linear-gradient(145deg,#111820 0%,#202b35 62%,#174d70 125%)",
    color: "#ffffff",
  },

  summaryTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryEyebrow: {
    margin: 0,
    color: "#79bde8",
    fontSize: "9px",
    fontWeight: 950,
  },

  summaryBadge: {
    padding: "5px 8px",
    borderRadius: "999px",
    backgroundColor: "rgba(121,189,232,0.14)",
    color: "#9bd2f3",
    fontSize: "8px",
    fontWeight: 950,
  },

  summaryPlan: {
    margin: "18px 0 0",
    fontSize: "28px",
    fontWeight: 950,
  },

  priceLine: {
    display: "flex",
    alignItems: "baseline",
    gap: "7px",
    marginTop: "7px",
  },

  summaryPrice: {
    fontSize: "36px",
    fontWeight: 950,
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

  paymentNotice: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginTop: "15px",
    padding: "13px 14px",
    borderRadius: "13px",
    backgroundColor: "rgba(118,187,231,0.08)",
  },

  paymentNoticeTitle: {
    color: "#ffffff",
    fontSize: "11px",
  },

  paymentNoticeText: {
    color: "#bfcbd3",
    fontSize: "10px",
  },

  message: {
    marginTop: "15px",
    padding: "12px 13px",
    borderRadius: "11px",
    backgroundColor: "#fff0f0",
    color: "#8c2f2f",
    fontSize: "11px",
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
  },

  checkoutButtonDisabled: {
    opacity: 0.62,
    cursor: "default",
  },

  arrow: {
    fontSize: "18px",
  },

  checkoutFinePrint: {
    margin: "11px 0 0",
    color: "#9fadb8",
    fontSize: "9px",
    textAlign: "center",
  },
};
