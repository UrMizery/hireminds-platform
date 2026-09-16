"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

type AccessMethod = "subscription" | "referral";

const VALUE_ITEMS = [
  {
    number: "01",
    title: "Understand the Opportunity",
    text: "Break down job descriptions, identify keywords, understand requirements, and know where you fit before you apply.",
  },
  {
    number: "02",
    title: "Build a Stronger Application",
    text: "Create stronger resumes, cover letters, professional messaging, and application materials with more intention.",
  },
  {
    number: "03",
    title: "Move With Direction",
    text: "Prepare for interviews, track your search, explore career paths, set goals, and know what your next move should be.",
  },
];

const TOOL_ITEMS = [
  "Resume Builder",
  "Resume Match",
  "JD Analyzer",
  "Cover Letters",
  "Interview Prep",
  "Career Goals",
  "Career Paths",
  "Job Search Tracking",
];

export default function SignupPage() {
  const [accessMethod, setAccessMethod] =
    useState<AccessMethod | null>(null);

  const [referralCode, setReferralCode] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [introConfirmed, setIntroConfirmed] = useState(false);
  const [renewalConfirmed, setRenewalConfirmed] = useState(false);
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function clearMessage() {
    setMessage("");
  }

  function chooseAccess(method: AccessMethod) {
    clearMessage();
    setAccessMethod(method);
  }

  async function validateReferralCode(code: string) {
    const response = await fetch(
      "/api/access/validate-referral",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
      }
    );

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

  async function createReferralAccount({
    normalizedReferralCode,
    firstName: submittedFirstName,
    lastName: submittedLastName,
    phone: submittedPhone,
    city: submittedCity,
    stateName: submittedStateName,
    email: submittedEmail,
    password: submittedPassword,
  }: {
    normalizedReferralCode: string;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    stateName: string;
    email: string;
    password: string;
  }) {
    const cleanFirstName = submittedFirstName.trim();
    const cleanLastName = submittedLastName.trim();
    const fullName =
      `${cleanFirstName} ${cleanLastName}`.trim();

    const cleanPhone = submittedPhone.trim();
    const cleanCity = submittedCity.trim();
    const cleanState = submittedStateName.trim();
    const cleanEmail = submittedEmail.trim().toLowerCase();

    const { data, error } =
      await supabase.auth.signUp({
        email: cleanEmail,
        password: submittedPassword,
        options: {
          data: {
            first_name: cleanFirstName,
            last_name: cleanLastName,
            full_name: fullName,

            phone: cleanPhone || null,
            city: cleanCity || null,
            state_name: cleanState || null,

            referral_code:
              normalizedReferralCode,

            has_referral_access: false,
            has_paid_access: false,

            access_tier:
              "pending_referral_consent",
          },
        },
      });

    if (error) {
      const authMessage = String(
        error.message || ""
      ).toLowerCase();

      if (
        authMessage.includes("already registered") ||
        authMessage.includes("already been registered") ||
        authMessage.includes("user already")
      ) {
        throw new Error(
          "An account already exists with this email. Please sign in or use Forgot Password."
        );
      }

      throw new Error(error.message);
    }

    const user = data.user;

    if (!user) {
      throw new Error(
        "Your account could not be created."
      );
    }

    const profilePayload: Record<
      string,
      any
    > = {
      user_id: user.id,

      full_name: fullName,

      phone: cleanPhone || null,
      email: cleanEmail,
      city: cleanCity || null,
      state: cleanState || null,

      referral_code:
        normalizedReferralCode,

      access_referral_code:
        normalizedReferralCode,

      access_referral_verified_at:
        new Date().toISOString(),

      referral_consent_accepted: false,
      referral_consent_accepted_at: null,

      has_referral_access: false,
      has_paid_access: false,

      access_tier:
        "pending_referral_consent",

      subscription_status: null,
      subscription_plan: null,
      subscription_provider: null,
    };

    const { error: profileError } =
      await supabase
        .from("candidate_profiles")
        .insert(profilePayload);

    if (profileError) {
      // The Auth account was created successfully, but the
      // profile failed. Sign the person back out so HireMinds
      // does not look like the registration completed.
      await supabase.auth.signOut();

      throw new Error(
        `Your login was created, but your HireMinds profile could not be completed: ${profileError.message}`
      );
    }

    const { error: activityError } =
      await supabase
        .from("user_activity")
        .insert({
          user_id: user.id,

          full_name: fullName,
          email: cleanEmail,

          referral_code:
            normalizedReferralCode,

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

    if (!accessMethod) {
      setMessage(
        "Please choose Paid Subscription or Referral Code."
      );
      return;
    }

    /*
      Read the actual values from the submitted form.

      This prevents browser autofill from showing a value in an input
      while React state still thinks the field is empty.
    */
    const formData = new FormData(e.currentTarget);

    const cleanFirstName = String(
      formData.get("firstName") ?? firstName
    ).trim();

    const cleanLastName = String(
      formData.get("lastName") ?? lastName
    ).trim();

    const cleanPhone = String(
      formData.get("phone") ?? phone
    ).trim();

    const cleanCity = String(
      formData.get("city") ?? city
    ).trim();

    const cleanState = String(
      formData.get("stateName") ?? stateName
    ).trim();

    const cleanEmail = String(
      formData.get("email") ?? email
    )
      .trim()
      .toLowerCase();

    const cleanReferralCode = String(
      formData.get("referralCode") ?? referralCode
    ).trim();

    const submittedPassword = String(
      formData.get("password") ?? password
    );

    const fullName =
      `${cleanFirstName} ${cleanLastName}`.trim();

    // Keep the controlled inputs synchronized with what was actually submitted.
    setFirstName(cleanFirstName);
    setLastName(cleanLastName);
    setPhone(cleanPhone);
    setCity(cleanCity);
    setStateName(cleanState);
    setEmail(cleanEmail);

    if (accessMethod === "referral") {
      setReferralCode(cleanReferralCode.toUpperCase());
    }

    if (!cleanFirstName) {
      setMessage(
        "Please enter your first name."
      );
      return;
    }

    if (!cleanLastName) {
      setMessage(
        "Please enter your last name."
      );
      return;
    }

    if (
      !cleanEmail ||
      !cleanEmail.includes("@")
    ) {
      setMessage(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setLoading(true);

      /*
        ==========================
        REFERRAL ACCESS
        ==========================
      */

      if (
        accessMethod === "referral"
      ) {
        const code =
          cleanReferralCode.toUpperCase();

        if (!code) {
          throw new Error(
            "Please enter your referral code."
          );
        }

        if (!submittedPassword) {
          throw new Error(
            "Please create a password for your HireMinds account."
          );
        }

        if (submittedPassword.length < 6) {
          throw new Error(
            "Your password must contain at least 6 characters."
          );
        }

        const referral =
          await validateReferralCode(
            code
          );

        const normalizedReferralCode =
          referral.code ||
          code;

        await createReferralAccount({
          normalizedReferralCode,
          firstName: cleanFirstName,
          lastName: cleanLastName,
          phone: cleanPhone,
          city: cleanCity,
          stateName: cleanState,
          email: cleanEmail,
          password: submittedPassword,
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
          // Server/database remains authoritative.
        }

        window.location.href =
          "/access";

        return;
      }

      /*
        ==========================
        PAID SUBSCRIPTION
        ==========================
      */

      if (!ageConfirmed) {
        throw new Error(
          "Please confirm that you are 18 years of age or older."
        );
      }

      if (!introConfirmed) {
        throw new Error(
          "Please confirm that you understand the $2.99 introductory charge."
        );
      }

      if (!renewalConfirmed) {
        throw new Error(
          "Please confirm that you understand the automatic $24.99 monthly renewal."
        );
      }

      if (!termsConfirmed) {
        throw new Error(
          "Please agree to the HireMinds Terms and Privacy Policy."
        );
      }

      const checkoutResponse =
        await fetch(
          "/api/stripe/create-checkout-session",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              plan: "monthly",

              fullName,
              firstName:
                cleanFirstName,
              lastName:
                cleanLastName,

              email: cleanEmail,

              phone:
                cleanPhone,

              city:
                cleanCity,

              state:
                cleanState,
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
        checkoutData =
          checkoutRaw
            ? JSON.parse(
                checkoutRaw
              )
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

      window.location.href =
        checkoutData.url;
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
        autoComplete="on"
      >
        {/* ================================
            HERO
        ================================= */}

        <section style={styles.hero}>
          <div
            style={styles.heroGlowOne}
          />
          <div
            style={styles.heroGlowTwo}
          />

          <div style={styles.heroGrid}>
            <div style={styles.heroContent}>
              <div style={styles.brandRow}>
                <span
                  style={styles.brandMark}
                >
                  HM
                </span>

                <div>
                  <div
                    style={styles.brandName}
                  >
                    HIREMINDS
                  </div>

                  <div
                    style={
                      styles.brandDescriptor
                    }
                  >
                    YOUR CAREER PASSPORT
                  </div>
                </div>
              </div>

              <p
                style={styles.heroEyebrow}
              >
                CAREER DEVELOPMENT +
                JOB SEARCH INTELLIGENCE
              </p>

              <h1
                style={styles.heroTitle}
              >
                Stop guessing.
                <br />

                <span
                  style={
                    styles.heroAccent
                  }
                >
                  Build your next move.
                </span>
              </h1>

              <p
                style={styles.heroText}
              >
                HireMinds helps you
                understand the job,
                position your experience,
                strengthen your
                application, prepare for
                interviews, and move
                through your career with
                more direction.
              </p>

              <div
                style={
                  styles.heroMiniGrid
                }
              >
                <div
                  style={
                    styles.heroMiniItem
                  }
                >
                  <strong>Analyze</strong>
                  <span>
                    Know what the job is
                    really asking for.
                  </span>
                </div>

                <div
                  style={
                    styles.heroMiniItem
                  }
                >
                  <strong>Position</strong>
                  <span>
                    Show your experience
                    with intention.
                  </span>
                </div>

                <div
                  style={
                    styles.heroMiniItem
                  }
                >
                  <strong>Move</strong>
                  <span>
                    Turn preparation into
                    action.
                  </span>
                </div>
              </div>
            </div>

            <aside
              style={styles.heroOffer}
            >
              <span
                style={
                  styles.offerEyebrow
                }
              >
                HIREMINDS ALL ACCESS
              </span>

              <div
                style={
                  styles.offerPriceRow
                }
              >
                <span
                  style={
                    styles.offerPrice
                  }
                >
                  $2.99
                </span>
              </div>

              <span
                style={styles.offerTerm}
              >
                YOUR FIRST 5 DAYS
              </span>

              <div
                style={
                  styles.offerDivider
                }
              />

              <span
                style={
                  styles.offerThenLabel
                }
              >
                THEN
              </span>

              <strong
                style={
                  styles.offerRenewal
                }
              >
                $24.99/month
              </strong>

              <p
                style={styles.offerText}
              >
                Automatically renews
                monthly after your first
                5 days unless canceled.
              </p>

              <div
                style={
                  styles.offerHighlight
                }
              >
                Full access.
              </div>
            </aside>
          </div>
        </section>

        {/* ================================
            STRONGER VALUE SECTION
        ================================= */}

        <section
          style={styles.valueSection}
        >
          <div
            style={styles.valueTop}
          >
            <div>
              <p
                style={
                  styles.sectionEyebrow
                }
              >
                WHY HIREMINDS
              </p>

              <h2
                style={
                  styles.sectionHeadline
                }
              >
                More than tools.
                <br />
                <span
                  style={
                    styles.sectionAccent
                  }
                >
                  A smarter way to move.
                </span>
              </h2>
            </div>

            <p
              style={
                styles.sectionIntro
              }
            >
              A resume is only one piece
              of the process. HireMinds
              helps you understand,
              prepare, apply, track and
              keep moving forward.
            </p>
          </div>

          <div
            style={styles.valueGrid}
          >
            {VALUE_ITEMS.map(
              (item, index) => {
                const dark =
                  index === 1;

                return (
                  <article
                    key={item.number}
                    style={{
                      ...styles.valueCard,

                      ...(dark
                        ? styles.valueCardDark
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.valueNumber,

                        ...(dark
                          ? styles.valueNumberDark
                          : {}),
                      }}
                    >
                      {item.number}
                    </span>

                    <h3
                      style={{
                        ...styles.valueTitle,

                        ...(dark
                          ? styles.valueTextLight
                          : {}),
                      }}
                    >
                      {item.title}
                    </h3>

                    <p
                      style={{
                        ...styles.valueText,

                        ...(dark
                          ? styles.valueTextLightMuted
                          : {}),
                      }}
                    >
                      {item.text}
                    </p>
                  </article>
                );
              }
            )}
          </div>

          <div
            style={styles.toolBand}
          >
            <span
              style={
                styles.toolBandLabel
              }
            >
              ONE PLATFORM
            </span>

            <div
              style={
                styles.toolBandItems
              }
            >
              {TOOL_ITEMS.map(
                (tool) => (
                  <span
                    key={tool}
                    style={
                      styles.toolChip
                    }
                  >
                    {tool}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        {/* ================================
            STEP 1 ACCESS FIRST
        ================================= */}

        <section
          style={styles.sectionCard}
        >
          <div
            style={styles.stepHeader}
          >
            <div
              style={styles.stepNumber}
            >
              01
            </div>

            <div>
              <p
                style={
                  styles.sectionEyebrow
                }
              >
                CHOOSE YOUR ACCESS
              </p>

              <h2
                style={styles.stepTitle}
              >
                How will you access
                HireMinds?
              </h2>

              <p
                style={styles.stepText}
              >
                Choose the option that
                applies to you before
                creating your Career
                Passport.
              </p>
            </div>
          </div>

          <div
            style={
              styles.accessChoiceGrid
            }
          >
            {/* PAID */}

            <button
              type="button"
              onClick={() =>
                chooseAccess(
                  "subscription"
                )
              }
              style={{
                ...styles.accessCard,

                ...(accessMethod ===
                "subscription"
                  ? styles.accessCardSelected
                  : {}),
              }}
            >
              <div
                style={
                  styles.accessCardTop
                }
              >
                <span
                  style={
                    styles.accessCardLabel
                  }
                >
                  PAID SUBSCRIPTION
                </span>

                {accessMethod ===
                "subscription" ? (
                  <span
                    style={
                      styles.selectedPill
                    }
                  >
                    ✓ SELECTED
                  </span>
                ) : null}
              </div>

              <div
                style={
                  styles.accessPriceRow
                }
              >
                <strong
                  style={
                    styles.accessPrice
                  }
                >
                  $2.99
                </strong>

                <span
                  style={
                    styles.accessPriceDetail
                  }
                >
                  first 5 days
                </span>
              </div>

              <div
                style={
                  styles.accessRenewal
                }
              >
                Then{" "}
                <strong>
                  $24.99/month
                </strong>
              </div>

              <p
                style={
                  styles.accessDescription
                }
              >
                Full HireMinds access.
                Automatically renews
                monthly after your
                introductory period
                unless canceled.
              </p>

              <span
                style={
                  styles.accessSelectText
                }
              >
                Choose Paid Access →
              </span>
            </button>

            {/* REFERRAL */}

            <button
              type="button"
              onClick={() =>
                chooseAccess(
                  "referral"
                )
              }
              style={{
                ...styles.accessCard,

                ...(accessMethod ===
                "referral"
                  ? styles.accessCardSelected
                  : {}),
              }}
            >
              <div
                style={
                  styles.accessCardTop
                }
              >
                <span
                  style={
                    styles.accessCardLabel
                  }
                >
                  REFERRAL ACCESS
                </span>

                {accessMethod ===
                "referral" ? (
                  <span
                    style={
                      styles.selectedPill
                    }
                  >
                    ✓ SELECTED
                  </span>
                ) : null}
              </div>

              <div
                style={
                  styles.referralBigTitle
                }
              >
                I Have a Referral Code
              </div>

              <div
                style={
                  styles.accessRenewal
                }
              >
                Complimentary{" "}
                <strong>
                  3 weeks (21 days)
                  of access
                </strong>
              </div>

              <p
                style={
                  styles.accessDescription
                }
              >
                Each user is eligible
                for one complimentary
                referral access period
                only. An active code
                must be provided by an
                approved program or
                partner.
              </p>

              <span
                style={
                  styles.accessSelectText
                }
              >
                Use Referral Code →
              </span>
            </button>
          </div>

          {accessMethod ===
          "referral" ? (
            <div
              style={
                styles.referralCodeArea
              }
            >
              <div>
                <span
                  style={
                    styles.fieldLabel
                  }
                >
                  REFERRAL CODE
                </span>

                <p
                  style={
                    styles.referralCodeHelp
                  }
                >
                  Enter the active code
                  that was provided to
                  you.
                </p>
              </div>

              <input
                id="hm-referral-code"
                name="referralCode"
                placeholder="Enter Referral Code"
                value={referralCode}
                onChange={(e) => {
                  setReferralCode(
                    e.target.value.toUpperCase()
                  );
                  clearMessage();
                }}
                style={
                  styles.referralInput
                }
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                inputMode="text"
                data-lpignore="true"
                data-1p-ignore="true"
                aria-label="Referral Code"
              />

              <div
                style={
                  styles.previousReferralNote
                }
              >
                <strong>
                  Previously used
                  referral access?
                </strong>

                <span>
                  Each user may receive
                  complimentary referral
                  access one time only.
                  If you previously used
                  your complimentary
                  referral access, Paid
                  Access remains
                  available.
                </span>
              </div>
            </div>
          ) : null}
        </section>

        {/* ================================
            STEP 2 INFO
        ================================= */}

        {accessMethod ? (
          <section
            style={styles.sectionCard}
          >
            <div
              style={styles.stepHeader}
            >
              <div
                style={
                  styles.stepNumberBlue
                }
              >
                02
              </div>

              <div>
                <p
                  style={
                    styles.sectionEyebrow
                  }
                >
                  CREATE YOUR CAREER
                  PASSPORT
                </p>

                <h2
                  style={
                    styles.stepTitle
                  }
                >
                  Tell us who you are.
                </h2>

                <p
                  style={
                    styles.stepText
                  }
                >
                  Enter your basic
                  information to
                  continue with the
                  access option you
                  selected.
                </p>
              </div>
            </div>

            <div
              style={styles.formGrid}
            >
              <label
                style={styles.field}
              >
                <span
                  style={
                    styles.fieldLabel
                  }
                >
                  First Name *
                </span>

                <input
                  id="firstName"
                  name="firstName"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(
                      e.target.value
                    );
                    clearMessage();
                  }}
                  style={styles.input}
                  autoComplete="given-name"
                  required
                />
              </label>

              <label
                style={styles.field}
              >
                <span
                  style={
                    styles.fieldLabel
                  }
                >
                  Last Name *
                </span>

                <input
                  id="lastName"
                  name="lastName"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(
                      e.target.value
                    );
                    clearMessage();
                  }}
                  style={styles.input}
                  autoComplete="family-name"
                  required
                />
              </label>

              <label
                style={styles.field}
              >
                <span
                  style={
                    styles.fieldLabel
                  }
                >
                  Email Address *
                </span>

                <input
                  id="email"
                  name="email"
                  placeholder="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(
                      e.target.value
                    );
                    clearMessage();
                  }}
                  style={styles.input}
                  autoComplete="email"
                  required
                />
              </label>

              <label
                style={styles.field}
              >
                <span
                  style={
                    styles.fieldLabel
                  }
                >
                  Phone Number
                </span>

                <input
                  id="phone"
                  name="phone"
                  placeholder="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(
                      e.target.value
                    );
                    clearMessage();
                  }}
                  style={styles.input}
                  autoComplete="tel"
                />
              </label>

              <label
                style={styles.field}
              >
                <span
                  style={
                    styles.fieldLabel
                  }
                >
                  City
                </span>

                <input
                  id="city"
                  name="city"
                  placeholder="City"
                  value={city}
                  onChange={(e) => {
                    setCity(
                      e.target.value
                    );
                    clearMessage();
                  }}
                  style={styles.input}
                  autoComplete="address-level2"
                />
              </label>

              <label
                style={styles.field}
              >
                <span
                  style={
                    styles.fieldLabel
                  }
                >
                  State
                </span>

                <input
                  id="stateName"
                  name="stateName"
                  placeholder="State"
                  value={stateName}
                  onChange={(e) => {
                    setStateName(
                      e.target.value
                    );
                    clearMessage();
                  }}
                  style={styles.input}
                  autoComplete="address-level1"
                />
              </label>

              {accessMethod ===
              "referral" ? (
                <label
                  style={{
                    ...styles.field,
                    ...styles.fullWidth,
                  }}
                >
                  <span
                    style={
                      styles.fieldLabel
                    }
                  >
                    Create Password *
                  </span>

                  <div
                    style={
                      styles.passwordWrap
                    }
                  >
                    <input
                      id="password"
                      name="password"
                      placeholder="Create a password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) => {
                        setPassword(
                          e.target.value
                        );
                        clearMessage();
                      }}
                      style={
                        styles.passwordInput
                      }
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) =>
                            !prev
                        )
                      }
                      style={
                        styles.passwordToggle
                      }
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>

                  <span
                    style={
                      styles.passwordNote
                    }
                  >
                    This password is for
                    signing back into
                    your HireMinds
                    account after
                    activation.
                  </span>
                </label>
              ) : (
                <div
                  style={{
                    ...styles.fullWidth,
                    ...styles.paymentPasswordNotice,
                  }}
                >
                  <strong>
                    Password comes
                    after payment.
                  </strong>

                  <span>
                    Paid subscribers
                    will create their
                    HireMinds password
                    after Stripe
                    confirms the $2.99
                    payment.
                  </span>
                </div>
              )}
            </div>
          </section>
        ) : null}

        {/* ================================
            STEP 3 CONFIRM
        ================================= */}

        {accessMethod ===
        "subscription" ? (
          <section
            style={styles.sectionCard}
          >
            <div
              style={styles.stepHeader}
            >
              <div
                style={styles.stepNumber}
              >
                03
              </div>

              <div>
                <p
                  style={
                    styles.sectionEyebrow
                  }
                >
                  CONFIRM & CONTINUE
                </p>

                <h2
                  style={
                    styles.stepTitle
                  }
                >
                  Know exactly what
                  you&apos;re signing
                  up for.
                </h2>
              </div>
            </div>

            <div
              style={
                styles.billingSummary
              }
            >
              <div>
                <span
                  style={
                    styles.billingSmall
                  }
                >
                  TODAY
                </span>

                <strong
                  style={
                    styles.billingBig
                  }
                >
                  $2.99
                </strong>

                <span
                  style={
                    styles.billingDescription
                  }
                >
                  First 5 days
                </span>
              </div>

              <div
                style={
                  styles.billingArrow
                }
              >
                →
              </div>

              <div>
                <span
                  style={
                    styles.billingSmall
                  }
                >
                  AFTER 5 DAYS
                </span>

                <strong
                  style={
                    styles.billingBig
                  }
                >
                  $24.99
                </strong>

                <span
                  style={
                    styles.billingDescription
                  }
                >
                  Per month until
                  canceled
                </span>
              </div>
            </div>

            <div
              style={styles.ackPanel}
            >
              <label
                style={
                  styles.checkboxRow
                }
              >
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
                    18 years of age or
                    older.
                  </strong>
                </span>
              </label>

              <label
                style={
                  styles.checkboxRow
                }
              >
                <input
                  type="checkbox"
                  checked={
                    introConfirmed
                  }
                  onChange={(e) =>
                    setIntroConfirmed(
                      e.target.checked
                    )
                  }
                  style={styles.checkbox}
                />

                <span>
                  I understand that I
                  will be charged{" "}
                  <strong>
                    $2.99 today
                  </strong>{" "}
                  for my first 5 days of
                  HireMinds access.
                </span>
              </label>

              <label
                style={
                  styles.checkboxRow
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
                  style={styles.checkbox}
                />

                <span>
                  I understand that
                  unless canceled, my
                  subscription will
                  automatically renew at{" "}
                  <strong>
                    $24.99 per month
                  </strong>{" "}
                  after the 5-day
                  introductory period.
                </span>
              </label>

              <label
                style={
                  styles.checkboxRow
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
                  style={styles.checkbox}
                />

                <span>
                  I agree to the
                  HireMinds Terms and
                  Privacy Policy.
                </span>
              </label>
            </div>
          </section>
        ) : null}

        {accessMethod ===
        "referral" ? (
          <section
            style={styles.sectionCard}
          >
            <div
              style={styles.stepHeader}
            >
              <div
                style={styles.stepNumber}
              >
                03
              </div>

              <div>
                <p
                  style={
                    styles.sectionEyebrow
                  }
                >
                  VERIFY & CONTINUE
                </p>

                <h2
                  style={
                    styles.stepTitle
                  }
                >
                  Confirm your referral
                  access.
                </h2>

                <p
                  style={
                    styles.stepText
                  }
                >
                  Your referral code
                  will be verified
                  before you continue to
                  the Consent & Access
                  page.
                </p>
              </div>
            </div>

            <div
              style={
                styles.referralSummary
              }
            >
              <div>
                <span
                  style={
                    styles.referralSummaryLabel
                  }
                >
                  REFERRAL ACCESS
                </span>

                <strong
                  style={
                    styles.referralSummaryTitle
                  }
                >
                  One-time complimentary
                  3-week access
                </strong>
              </div>

              <p
                style={
                  styles.referralSummaryText
                }
              >
                Includes 21 days of
                HireMinds access. Each
                user receives one
                complimentary referral
                period only. It does not
                automatically renew and
                does not require payment.
              </p>
            </div>
          </section>
        ) : null}

        {/* ERROR */}

        {message ? (
          <div
            style={styles.message}
          >
            {message}
          </div>
        ) : null}

        {/* SUBMIT */}

        {accessMethod ? (
          <button
            type="submit"
            style={
              styles.submitButton
            }
            disabled={loading}
          >
            <span>
              {loading
                ? "Please wait..."
                : accessMethod ===
                    "subscription"
                ? "Continue to Secure Payment"
                : "Create Career Passport & Continue"}
            </span>

            {!loading ? (
              <span
                style={
                  styles.buttonArrow
                }
              >
                →
              </span>
            ) : null}
          </button>
        ) : null}

        <footer
          style={styles.footer}
        >
          <div
            style={styles.footerBrand}
          >
            HIREMINDS
          </div>

          <p
            style={styles.footerText}
          >
            Your career is bigger than
            one application.
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
      "linear-gradient(180deg, #eef2f5 0%, #ffffff 40%, #edf2f6 100%)",

    color: "#111820",

    padding:
      "28px 18px 60px",

    boxSizing: "border-box",

    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
  },

  shell: {
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",

    display: "flex",
    flexDirection: "column",

    gap: "22px",
  },

  /* HERO */

  hero: {
    position: "relative",
    overflow: "hidden",

    borderRadius: "32px",

    background:
      "linear-gradient(135deg, #0d151d 0%, #13222e 55%, #115b88 130%)",

    border:
      "1px solid rgba(255,255,255,0.08)",

    boxShadow:
      "0 24px 65px rgba(9, 22, 34, 0.22)",
  },

  heroGlowOne: {
    position: "absolute",

    width: "540px",
    height: "540px",

    borderRadius: "50%",

    right: "-180px",
    top: "-260px",

    background:
      "radial-gradient(circle, rgba(37, 144, 207, 0.38) 0%, rgba(37, 144, 207, 0) 68%)",

    pointerEvents: "none",
  },

  heroGlowTwo: {
    position: "absolute",

    width: "420px",
    height: "420px",

    borderRadius: "50%",

    left: "-200px",
    bottom: "-230px",

    background:
      "radial-gradient(circle, rgba(150, 173, 190, 0.18) 0%, rgba(150, 173, 190, 0) 70%)",

    pointerEvents: "none",
  },

  heroGrid: {
    position: "relative",
    zIndex: 1,

    display: "grid",

    gridTemplateColumns:
      "minmax(0, 1.45fr) minmax(300px, 0.55fr)",

    gap: "38px",

    padding: "52px",

    alignItems: "stretch",
  },

  heroContent: {
    display: "flex",
    flexDirection: "column",

    justifyContent: "center",
  },

  brandRow: {
    display: "flex",
    alignItems: "center",

    gap: "12px",

    marginBottom: "34px",
  },

  brandMark: {
    width: "47px",
    height: "47px",

    display: "flex",

    alignItems: "center",
    justifyContent: "center",

    borderRadius: "14px",

    backgroundColor: "#ffffff",

    color: "#0f6092",

    fontSize: "13px",
    fontWeight: 950,

    boxShadow:
      "0 10px 28px rgba(0,0,0,0.18)",
  },

  brandName: {
    color: "#ffffff",

    fontSize: "13px",

    fontWeight: 950,

    letterSpacing: "0.16em",
  },

  brandDescriptor: {
    color: "#7fbde2",

    marginTop: "4px",

    fontSize: "9px",

    fontWeight: 850,

    letterSpacing: "0.13em",
  },

  heroEyebrow: {
    margin: "0 0 13px",

    color: "#79bde8",

    fontSize: "10px",

    fontWeight: 950,

    letterSpacing: "0.16em",
  },

  heroTitle: {
    margin: 0,

    color: "#ffffff",

    maxWidth: "780px",

    fontSize:
      "clamp(46px, 7vw, 78px)",

    lineHeight: 0.95,

    fontWeight: 950,

    letterSpacing: "-0.055em",
  },

  heroAccent: {
    color: "#5fb3e5",
  },

  heroText: {
    maxWidth: "720px",

    margin: "25px 0 0",

    color: "#c9d4dc",

    fontSize: "17px",

    lineHeight: 1.72,

    fontWeight: 500,
  },

  heroMiniGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(150px, 1fr))",

    gap: "10px",

    marginTop: "28px",
  },

  heroMiniItem: {
    display: "flex",
    flexDirection: "column",

    gap: "6px",

    padding:
      "14px 15px",

    borderRadius: "14px",

    backgroundColor:
      "rgba(255,255,255,0.06)",

    border:
      "1px solid rgba(255,255,255,0.08)",

    color: "#ffffff",

    fontSize: "12px",
  },

  heroOffer: {
    display: "flex",
    flexDirection: "column",

    justifyContent: "center",

    padding: "29px",

    borderRadius: "25px",

    background:
      "linear-gradient(160deg, #ffffff 0%, #e9f3fa 100%)",

    boxShadow:
      "0 20px 45px rgba(0,0,0,0.20)",
  },

  offerEyebrow: {
    color: "#176fae",

    fontSize: "9px",

    fontWeight: 950,

    letterSpacing: "0.14em",
  },

  offerPriceRow: {
    marginTop: "17px",
  },

  offerPrice: {
    color: "#111820",

    fontSize: "57px",

    lineHeight: 0.95,

    fontWeight: 950,

    letterSpacing: "-0.055em",
  },

  offerTerm: {
    marginTop: "7px",

    color: "#537080",

    fontSize: "11px",

    fontWeight: 900,

    letterSpacing: "0.05em",
  },

  offerDivider: {
    height: "1px",

    backgroundColor: "#c5d4dd",

    margin: "22px 0",
  },

  offerThenLabel: {
    color: "#74838e",

    fontSize: "9px",

    fontWeight: 950,

    letterSpacing: "0.11em",
  },

  offerRenewal: {
    marginTop: "4px",

    color: "#111820",

    fontSize: "24px",

    fontWeight: 950,
  },

  offerText: {
    margin: "8px 0 0",

    color: "#5f6d78",

    fontSize: "12px",

    lineHeight: 1.55,
  },

  offerHighlight: {
    marginTop: "18px",

    padding:
      "11px 12px",

    borderRadius: "11px",

    backgroundColor: "#111820",

    color: "#ffffff",

    textAlign: "center",

    fontSize: "10px",

    fontWeight: 900,

    letterSpacing: "0.04em",
  },

  /* VALUE */

  valueSection: {
    padding: "38px",

    borderRadius: "30px",

    backgroundColor: "#ffffff",

    border: "1px solid #cfd7de",

    boxShadow:
      "0 18px 48px rgba(19, 37, 52, 0.08)",
  },

  valueTop: {
    display: "flex",

    justifyContent: "space-between",
    alignItems: "flex-end",

    gap: "30px",

    flexWrap: "wrap",

    marginBottom: "27px",
  },

  sectionEyebrow: {
    margin: "0 0 8px",

    color: "#1671ad",

    fontSize: "10px",

    fontWeight: 950,

    letterSpacing: "0.16em",
  },

  sectionHeadline: {
    margin: 0,

    color: "#101820",

    fontSize:
      "clamp(35px, 5vw, 55px)",

    lineHeight: 1,

    fontWeight: 950,

    letterSpacing: "-0.045em",
  },

  sectionAccent: {
    color: "#176fae",
  },

  sectionIntro: {
    maxWidth: "400px",

    margin: 0,

    color: "#5d6974",

    fontSize: "14px",

    lineHeight: 1.7,
  },

  valueGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",

    gap: "14px",
  },

  valueCard: {
    minHeight: "180px",

    display: "flex",
    flexDirection: "column",

    padding: "24px",

    borderRadius: "20px",

    background:
      "linear-gradient(145deg, #eef6fb 0%, #ffffff 100%)",

    border:
      "1px solid #d2e0e9",

    boxShadow:
      "0 10px 24px rgba(20, 46, 65, 0.06)",
  },

  valueCardDark: {
    background:
      "linear-gradient(145deg, #111820 0%, #19354a 100%)",

    border:
      "1px solid #1e4a68",

    boxShadow:
      "0 16px 32px rgba(14, 35, 50, 0.19)",
  },

  valueNumber: {
    color: "#176fae",

    fontSize: "11px",

    fontWeight: 950,

    letterSpacing: "0.13em",
  },

  valueNumberDark: {
    color: "#67b8e9",
  },

  valueTitle: {
    margin: "28px 0 0",

    color: "#111820",

    fontSize: "20px",

    lineHeight: 1.12,

    fontWeight: 950,

    letterSpacing: "-0.02em",
  },

  valueText: {
    margin: "10px 0 0",

    color: "#55636e",

    fontSize: "12px",

    lineHeight: 1.65,
  },

  valueTextLight: {
    color: "#ffffff",
  },

  valueTextLightMuted: {
    color: "#c8d4dc",
  },

  toolBand: {
    display: "flex",

    alignItems: "center",

    gap: "18px",

    flexWrap: "wrap",

    marginTop: "18px",

    padding:
      "15px 17px",

    borderRadius: "15px",

    backgroundColor: "#111820",
  },

  toolBandLabel: {
    color: "#6db8e5",

    fontSize: "9px",

    fontWeight: 950,

    letterSpacing: "0.14em",

    whiteSpace: "nowrap",
  },

  toolBandItems: {
    display: "flex",

    gap: "8px",

    flexWrap: "wrap",
  },

  toolChip: {
    padding: "6px 9px",

    borderRadius: "999px",

    backgroundColor:
      "rgba(255,255,255,0.07)",

    border:
      "1px solid rgba(255,255,255,0.08)",

    color: "#e1e8ed",

    fontSize: "10px",

    fontWeight: 750,
  },

  /* SECTIONS */

  sectionCard: {
    padding: "34px",

    borderRadius: "27px",

    backgroundColor: "#ffffff",

    border: "1px solid #cfd7de",

    boxShadow:
      "0 14px 38px rgba(19, 37, 52, 0.065)",
  },

  stepHeader: {
    display: "flex",

    gap: "15px",

    alignItems: "flex-start",

    marginBottom: "27px",
  },

  stepNumber: {
    width: "46px",
    height: "46px",

    minWidth: "46px",

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
    width: "46px",
    height: "46px",

    minWidth: "46px",

    display: "flex",

    alignItems: "center",
    justifyContent: "center",

    borderRadius: "14px",

    background:
      "linear-gradient(145deg, #176fae 0%, #258bc8 100%)",

    color: "#ffffff",

    fontSize: "11px",

    fontWeight: 950,

    boxShadow:
      "0 8px 20px rgba(23, 111, 174, 0.20)",
  },

  stepTitle: {
    margin: 0,

    color: "#111820",

    fontSize:
      "clamp(28px, 4vw, 38px)",

    lineHeight: 1.05,

    fontWeight: 950,

    letterSpacing: "-0.035em",
  },

  stepText: {
    margin: "8px 0 0",

    color: "#68747f",

    fontSize: "13px",

    lineHeight: 1.55,
  },

  /* ACCESS CARDS */

  accessChoiceGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",

    gap: "14px",
  },

  accessCard: {
    minHeight: "275px",

    display: "flex",
    flexDirection: "column",

    textAlign: "left",

    padding: "24px",

    borderRadius: "20px",

    border:
      "1px solid #c7d0d8",

    background:
      "linear-gradient(145deg, #ffffff 0%, #f0f4f7 100%)",

    color: "#111820",

    cursor: "pointer",

    transition:
      "all 0.2s ease",
  },

  accessCardSelected: {
    border:
      "2px solid #176fae",

    background:
      "linear-gradient(145deg, #ffffff 0%, #e7f4fc 100%)",

    boxShadow:
      "0 16px 34px rgba(23, 111, 174, 0.17)",
  },

  accessCardTop: {
    display: "flex",

    justifyContent: "space-between",

    gap: "10px",

    alignItems: "center",
  },

  accessCardLabel: {
    color: "#176fae",

    fontSize: "10px",

    fontWeight: 950,

    letterSpacing: "0.12em",
  },

  selectedPill: {
    padding: "5px 8px",

    borderRadius: "999px",

    backgroundColor: "#176fae",

    color: "#ffffff",

    fontSize: "8px",

    fontWeight: 950,

    letterSpacing: "0.06em",
  },

  accessPriceRow: {
    display: "flex",

    alignItems: "baseline",

    gap: "9px",

    marginTop: "30px",
  },

  accessPrice: {
    color: "#111820",

    fontSize: "48px",

    lineHeight: 1,

    fontWeight: 950,

    letterSpacing: "-0.055em",
  },

  accessPriceDetail: {
    color: "#687680",

    fontSize: "12px",

    fontWeight: 800,
  },

  accessRenewal: {
    marginTop: "8px",

    color: "#3d4a55",

    fontSize: "14px",
  },

  accessDescription: {
    margin: "14px 0 0",

    maxWidth: "450px",

    color: "#65727d",

    fontSize: "12px",

    lineHeight: 1.6,
  },

  accessSelectText: {
    marginTop: "auto",

    paddingTop: "22px",

    color: "#176fae",

    fontSize: "11px",

    fontWeight: 950,
  },

  referralBigTitle: {
    marginTop: "33px",

    color: "#111820",

    fontSize: "26px",

    lineHeight: 1.05,

    fontWeight: 950,

    letterSpacing: "-0.025em",
  },

  referralCodeArea: {
    marginTop: "18px",

    display: "grid",

    gap: "12px",

    padding: "21px",

    borderRadius: "17px",

    background:
      "linear-gradient(145deg, #eff6fa 0%, #e6f0f6 100%)",

    border:
      "1px solid #c5d8e5",
  },

  referralCodeHelp: {
    margin: "4px 0 0",

    color: "#667580",

    fontSize: "12px",
  },

  referralInput: {
    width: "100%",

    padding:
      "15px 16px",

    borderRadius: "12px",

    border:
      "1px solid #9db9cb",

    backgroundColor: "#ffffff",

    color: "#111820",

    outline: "none",

    boxSizing: "border-box",

    fontSize: "16px",

    fontWeight: 850,

    letterSpacing: "0.04em",
  },

  previousReferralNote: {
    display: "flex",

    flexDirection: "column",

    gap: "4px",

    padding:
      "13px 14px",

    borderRadius: "11px",

    backgroundColor: "#ffffff",

    border:
      "1px solid #d1dbe2",

    color: "#4e5c67",

    fontSize: "11px",

    lineHeight: 1.5,
  },

  /* FORM */

  formGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",

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

  fieldLabel: {
    color: "#293640",

    fontSize: "11px",

    fontWeight: 900,

    letterSpacing: "0.03em",
  },

  input: {
    width: "100%",

    padding:
      "14px 15px",

    borderRadius: "12px",

    border:
      "1px solid #b8c5ce",

    backgroundColor: "#f7f9fa",

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

    padding:
      "14px 80px 14px 15px",

    borderRadius: "12px",

    border:
      "1px solid #b8c5ce",

    backgroundColor: "#f7f9fa",

    color: "#111820",

    outline: "none",

    boxSizing: "border-box",

    fontSize: "15px",
  },

  passwordToggle: {
    position: "absolute",

    top: "50%",
    right: "14px",

    transform:
      "translateY(-50%)",

    border: "none",

    background: "transparent",

    color: "#176fae",

    cursor: "pointer",

    fontWeight: 900,
  },

  passwordNote: {
    color: "#74818b",

    fontSize: "10px",

    lineHeight: 1.5,
  },

  paymentPasswordNotice: {
    display: "flex",

    flexDirection: "column",

    gap: "5px",

    padding: "15px",

    borderRadius: "12px",

    background:
      "linear-gradient(90deg, #e8edf1 0%, #e5f1f8 100%)",

    border:
      "1px solid #c9d7df",

    color: "#42515d",

    fontSize: "12px",
  },

  /* BILLING */

  billingSummary: {
    display: "grid",

    gridTemplateColumns:
      "1fr auto 1fr",

    gap: "18px",

    alignItems: "center",

    padding: "22px",

    borderRadius: "18px",

    background:
      "linear-gradient(135deg, #111820 0%, #193c54 100%)",
  },

  billingSmall: {
    display: "block",

    color: "#78bce6",

    fontSize: "9px",

    fontWeight: 950,

    letterSpacing: "0.12em",
  },

  billingBig: {
    display: "block",

    marginTop: "6px",

    color: "#ffffff",

    fontSize: "32px",

    fontWeight: 950,

    letterSpacing: "-0.04em",
  },

  billingDescription: {
    display: "block",

    marginTop: "3px",

    color: "#c8d4dc",

    fontSize: "11px",
  },

  billingArrow: {
    color: "#6db8e5",

    fontSize: "25px",
  },

  ackPanel: {
    marginTop: "15px",

    display: "flex",

    flexDirection: "column",

    gap: "12px",

    padding: "19px",

    borderRadius: "15px",

    backgroundColor: "#f3f6f8",

    border: "1px solid #cfd8df",
  },

  checkboxRow: {
    display: "flex",

    gap: "10px",

    alignItems: "flex-start",

    color: "#404d57",

    fontSize: "12px",

    lineHeight: 1.55,

    cursor: "pointer",
  },

  checkbox: {
    width: "18px",
    height: "18px",

    minWidth: "18px",

    marginTop: "1px",

    accentColor: "#176fae",
  },

  /* REFERRAL SUMMARY */

  referralSummary: {
    display: "flex",

    justifyContent: "space-between",

    gap: "25px",

    flexWrap: "wrap",

    padding: "20px",

    borderRadius: "16px",

    background:
      "linear-gradient(145deg, #edf6fb 0%, #ffffff 100%)",

    border:
      "1px solid #c6dce9",
  },

  referralSummaryLabel: {
    display: "block",

    color: "#176fae",

    fontSize: "9px",

    fontWeight: 950,

    letterSpacing: "0.12em",

    marginBottom: "6px",
  },

  referralSummaryTitle: {
    color: "#111820",

    fontSize: "18px",

    fontWeight: 950,
  },

  referralSummaryText: {
    maxWidth: "420px",

    margin: 0,

    color: "#65727d",

    fontSize: "12px",

    lineHeight: 1.55,
  },

  /* ERROR */

  message: {
    padding: "14px 16px",

    borderRadius: "12px",

    backgroundColor: "#fff0f0",

    border:
      "1px solid #daa8a8",

    color: "#8c2f2f",

    fontSize: "13px",

    fontWeight: 850,
  },

  /* BUTTON */

  submitButton: {
    width: "100%",

    display: "flex",

    justifyContent: "center",
    alignItems: "center",

    gap: "14px",

    padding:
      "18px 22px",

    borderRadius: "16px",

    border:
      "1px solid #0b5d93",

    background:
      "linear-gradient(90deg, #111820 0%, #176fae 55%, #2588c7 100%)",

    color: "#ffffff",

    fontSize: "15px",

    fontWeight: 950,

    cursor: "pointer",

    boxShadow:
      "0 14px 32px rgba(23, 111, 174, 0.25)",
  },

  buttonArrow: {
    fontSize: "20px",

    fontWeight: 400,
  },

  footer: {
    textAlign: "center",

    padding:
      "18px 12px 3px",
  },

  footerBrand: {
    color: "#111820",

    fontSize: "10px",

    fontWeight: 950,

    letterSpacing: "0.16em",
  },

  footerText: {
    margin: "6px 0 0",

    color: "#72808a",

    fontSize: "11px",
  },
};
