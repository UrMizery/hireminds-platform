"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [email, setEmail] = useState("");
  const [heardAboutUs, setHeardAboutUs] = useState("");
  const [heardAboutUsOther, setHeardAboutUsOther] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const cleanFullName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanCity = city.trim();
    const cleanState = stateName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanOther = heardAboutUsOther.trim();

    /*
      IMPORTANT:
      Referral codes are no longer entered or validated on Sign Up.

      New users:
      1. Create their Career Passport / account here.
      2. Continue to /access.
      3. On /access they can:
         - enter an approved referral code for free access, OR
         - choose a paid subscription.

      Referral-code validation will be handled server-side on the access page.
      This prevents referral codes from being exposed in this client-side file.
    */

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanFullName,
          phone: cleanPhone || null,
          city: cleanCity || null,
          state_name: cleanState || null,
          referral_code: null,
          heard_about_us: heardAboutUs || null,
          heard_about_us_other: cleanOther || null,
          has_referral_access: false,
          has_paid_access: false,
          access_tier: "pending",
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      setMessage("User not created.");
      setLoading(false);
      return;
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

        /*
          Keep the historical referral_code field empty for a brand-new account
          until an approved referral code is actually accepted on /access.
        */
        referral_code: null,

        heard_about_us: heardAboutUs || null,
        heard_about_us_other: cleanOther || null,
        has_referral_access: false,
        has_paid_access: false,
        access_tier: "pending",
        subscription_status: null,
      });

    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    const { error: activityError } = await supabase
      .from("user_activity")
      .insert({
        user_id: user.id,
        full_name: cleanFullName,
        email: cleanEmail,
        referral_code: null,
        event_type: "signup",
        tool_name: null,
        page_name: "sign-up",
      });

    if (activityError) {
      console.error("Activity tracking error:", activityError);
      // Do not prevent account creation if tracking fails.
    }

    setLoading(false);

    /*
      New accounts do NOT go directly to /profile anymore.
      They must choose their HireMinds access path first.
    */
    window.location.href = "/access";
  }

  return (
    <main style={styles.page}>
      <form onSubmit={handleSignUp} style={styles.card}>
        <h1 style={styles.title}>Create Career Passport / Sign Up</h1>

        <p style={styles.introText}>
          Create your HireMinds account first. After signing up, you will choose
          how you want to access HireMinds.
        </p>

        <div style={styles.accessBox}>
          <strong style={styles.accessBoxTitle}>HireMinds Access</strong>

          <span>
            After creating your account, you can choose a paid subscription or
            use an approved referral code for no-cost access.
          </span>

          <span>
            Need a referral code? Text <strong>959-595-1595</strong> to request
            one.
          </span>
        </div>

        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={styles.input}
          required
        />

        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="State"
          value={stateName}
          onChange={(e) => setStateName(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

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

        <select
          value={heardAboutUs}
          onChange={(e) => setHeardAboutUs(e.target.value)}
          style={styles.input}
        >
          <option value="">How did you hear about us?</option>
          <option value="found_on_my_own">I found HireMinds on my own</option>
          <option value="ricannect_direct_staffing">
            RicanNECT Direct Staffing
          </option>
          <option value="job_fair">Job Fair</option>
          <option value="organization_or_program">
            Organization or Program
          </option>
          <option value="employer">Employer</option>
          <option value="friend_or_family">Friend or Family</option>
          <option value="social_media">Social Media</option>
          <option value="other">Other</option>
        </select>

        {heardAboutUs === "other" && (
          <input
            placeholder="Please tell us how you heard about us."
            value={heardAboutUsOther}
            onChange={(e) => setHeardAboutUsOther(e.target.value)}
            style={styles.input}
          />
        )}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Creating Account..." : "Create Career Passport & Continue"}
        </button>

        <p style={styles.bottomText}>
          Creating a Career Passport does not automatically activate HireMinds
          access. You will select your access option on the next screen.
        </p>

        {message ? <p style={styles.message}>{message}</p> : null}
      </form>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    backgroundColor: "#000000",
  },

  card: {
    width: "100%",
    maxWidth: "560px",
    backgroundColor: "#111111",
    padding: "32px",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(255, 255, 255, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    border: "1px solid #2a2a2a",
  },

  title: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: "4px",
  },

  introText: {
    fontSize: "14px",
    color: "#d1d5db",
    textAlign: "center",
    lineHeight: 1.6,
    margin: "0 0 4px",
  },

  accessBox: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #315c8a",
    backgroundColor: "#0c1723",
    color: "#d9e8f8",
    fontSize: "13px",
    lineHeight: 1.55,
  },

  accessBoxTitle: {
    color: "#7abaff",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #3a3a3a",
    fontSize: "15px",
    outline: "none",
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    boxSizing: "border-box",
  },

  passwordWrap: {
    position: "relative",
    width: "100%",
    boxSizing: "border-box",
  },

  passwordInput: {
    width: "100%",
    padding: "14px 72px 14px 16px",
    borderRadius: "12px",
    border: "1px solid #3a3a3a",
    fontSize: "15px",
    outline: "none",
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    boxSizing: "border-box",
  },

  passwordToggle: {
    position: "absolute",
    top: "50%",
    right: "14px",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    color: "#ffffff",
    fontWeight: 600,
    padding: 0,
    lineHeight: 1,
  },

  button: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #2a2a2a",
    backgroundColor: "#000000",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "8px",
  },

  bottomText: {
    margin: 0,
    fontSize: "12px",
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 1.5,
  },

  message: {
    marginTop: "8px",
    fontSize: "14px",
    color: "#ffffff",
    textAlign: "center",
  },
};
