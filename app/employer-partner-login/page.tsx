"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function EmployerPartnerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showContactLink, setShowContactLink] = useState(false);

  async function denyAccess(messageText: string) {
    await supabase.auth.signOut();

    localStorage.removeItem("hireminds_referral_code");

    setMessage(messageText);
    setShowContactLink(true);
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setShowContactLink(false);

    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user) {
      setMessage(error?.message || "Unable to sign in.");
      setLoading(false);
      return;
    }

    const { data: partnerRow, error: partnerError } = await supabase
      .from("partners")
      .select("account_type, contact_email")
      .eq("contact_email", normalizedEmail)
      .maybeSingle();

    if (partnerError) {
      await denyAccess(
        "We could not verify your employer or partner access. Please contact HireMinds."
      );
      return;
    }

    if (!partnerRow) {
      await denyAccess(
        "Your account does not have employer or partner access."
      );
      return;
    }

    const accountType = String(partnerRow.account_type || "")
      .trim()
      .toLowerCase();

    if (accountType === "partner") {
      window.location.href = "/partner-dashboard";
      return;
    }

    if (accountType === "super_admin") {
      window.location.href = "/partner-dashboard";
      return;
    }

    if (accountType === "employer") {
      window.location.href = "/employer-dashboard";
      return;
    }

    if (accountType === "admin") {
      window.location.href = "/admin-dashboard";
      return;
    }

    await denyAccess(
      "Your account type is not recognized. Please contact HireMinds."
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <p style={styles.kicker}>HireMinds Access</p>

        <h1 style={styles.title}>Employer / Partner Sign In</h1>

        <p style={styles.subtitle}>
          Sign in to access your dashboard and reporting tools.
        </p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
              style={styles.input}
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.fieldWrap}>
            <label style={styles.label}>Password</label>

            <div style={styles.passwordWrap}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={styles.passwordInput}
                required
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={styles.eyeButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {message ? (
            <div style={styles.messageWrap}>
              <p style={styles.message}>{message}</p>

              {showContactLink ? (
                <p style={styles.contactText}>
                  If you believe you should have access,{" "}
                  <a href="/contact" style={styles.contactLink}>
                    contact HireMinds
                  </a>
                  .
                </p>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
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
    background: "linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
  },

  card: {
    width: "100%",
    maxWidth: "520px",
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "28px",
  },

  kicker: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },

  title: {
    margin: "0 0 10px",
    fontSize: "34px",
    fontWeight: 700,
    color: "#f5f5f5",
  },

  subtitle: {
    margin: "0 0 20px",
    color: "#c8c8c8",
    fontSize: "15px",
    lineHeight: 1.6,
  },

  form: {
    display: "grid",
    gap: "14px",
  },

  fieldWrap: {
    display: "grid",
    gap: "8px",
  },

  label: {
    color: "#d4d4d8",
    fontSize: "13px",
    fontWeight: 600,
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
  },

  passwordWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  passwordInput: {
    width: "100%",
    padding: "14px 46px 14px 16px",
    borderRadius: "16px",
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
  },

  eyeButton: {
    position: "absolute",
    right: "14px",
    border: "none",
    background: "transparent",
    color: "#d4d4d8",
    fontSize: "18px",
    cursor: "pointer",
    padding: 0,
    lineHeight: 1,
  },

  button: {
    width: "100%",
    padding: "15px 18px",
    borderRadius: "18px",
    border: "1px solid #d1d5db",
    background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
    color: "#09090b",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "6px",
  },

  buttonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  messageWrap: {
    display: "grid",
    gap: "6px",
  },

  message: {
    margin: 0,
    color: "#fca5a5",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  contactText: {
    margin: 0,
    color: "#d4d4d8",
    fontSize: "13px",
    lineHeight: 1.6,
  },

  contactLink: {
    color: "#1677ff",
    fontWeight: 700,
    textDecoration: "none",
  },
};
