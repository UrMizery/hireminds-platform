"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignIn() {
    setMessage("");

    if (!email || !password) {
      setMessage("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      window.location.href = "/profile";
    } catch (error: any) {
      setMessage(error?.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <p style={styles.kicker}>HIREMINDS</p>

          <h1 style={styles.title}>Sign in to your account.</h1>

          <p style={styles.subtitle}>
            Access your Career Passport, update your profile, and continue to the
            resume builder.
          </p>

          <div style={styles.fieldWrap}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
              style={styles.input}
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
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={styles.passwordToggle}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.69-1.94 1.79-3.68 3.19-5.1" />
                    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.83 11.83 0 0 1-4.29 5.94" />
                    <path d="M1 1l22 22" />
                    <path d="M10.58 10.58a2 2 0 1 0 2.83 2.83" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            onClick={handleSignIn}
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <a href="/reset-password" style={styles.forgotLink}>
            Forgot Password?
          </a>

          {message ? <p style={styles.message}>{message}</p> : null}

          <p style={styles.footerText}>
            Need an account?{" "}
            <a href="/sign-up" style={styles.link}>
              Create your Career Passport
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(ellipse at 14% 16%, rgba(42,121,230,0.20) 0%, rgba(10,54,112,0.10) 30%, transparent 55%), radial-gradient(ellipse at 86% 70%, rgba(25,104,214,0.18) 0%, rgba(8,43,92,0.08) 32%, transparent 58%), radial-gradient(ellipse at 52% -8%, rgba(90,162,255,0.11) 0%, transparent 40%), linear-gradient(135deg,#020812 0%,#05172a 28%,#03101f 50%,#08213d 72%,#020914 100%)",
    color: "#e7e7e7",
    padding: "32px 24px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  wrapper: {
    maxWidth: "680px",
    margin: "80px auto",
  },

  card: {
    background:
      "linear-gradient(180deg, rgba(9,18,31,0.96) 0%, rgba(7,14,25,0.98) 100%)",
    border: "1px solid rgba(120,145,175,0.20)",
    borderRadius: "28px",
    padding: "32px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.42)",
  },

  kicker: {
    margin: "0 0 10px",
    color: "#1677FF",
    fontSize: "12px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
  },

  title: {
    margin: "0 0 12px",
    fontSize: "40px",
    lineHeight: 1.05,
    fontWeight: 500,
    letterSpacing: "-0.04em",
    color: "#ffffff",
  },

  subtitle: {
    margin: "0 0 24px",
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#c7cdd6",
  },

  fieldWrap: {
    marginBottom: "16px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#d7dce4",
    fontSize: "13px",
    fontWeight: 500,
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(120,145,175,0.24)",
    background: "#050b13",
    color: "#f4f7fb",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },

  passwordWrap: {
    position: "relative",
    width: "100%",
  },

  passwordInput: {
    width: "100%",
    padding: "14px 48px 14px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(120,145,175,0.24)",
    background: "#050b13",
    color: "#f4f7fb",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },

  passwordToggle: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    color: "#aeb8c6",
    padding: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  button: {
    width: "100%",
    marginTop: "8px",
    padding: "15px 18px",
    borderRadius: "18px",
    border: "1px solid #1677FF",
    background: "#1677FF",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },

  forgotLink: {
    display: "inline-block",
    marginTop: "14px",
    color: "#1677FF",
    textDecoration: "underline",
    fontSize: "14px",
  },

  message: {
    marginTop: "16px",
    color: "#e5e9ef",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  footerText: {
    marginTop: "20px",
    color: "#9ba6b5",
    fontSize: "14px",
  },

  link: {
    color: "#1677FF",
    textDecoration: "underline",
  },
};
