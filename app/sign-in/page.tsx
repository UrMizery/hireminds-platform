"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={styles.input}
            />
          </div>

          <button onClick={handleSignIn} disabled={loading} style={styles.button}>
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <a href="/reset-password" style={{ color: "#f5f5f5", textDecoration: "underline", fontSize: "14px" }}>
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
      "radial-gradient(circle at top left, rgba(255,255,255,0.04), transparent 22%), linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
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
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "28px",
    padding: "32px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
  },
  kicker: {
    margin: "0 0 10px",
    color: "#9a9a9a",
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
    color: "#f5f5f5",
  },
  subtitle: {
    margin: "0 0 24px",
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#b3b3b3",
  },
  fieldWrap: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#c9c9c9",
    fontSize: "13px",
    fontWeight: 500,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    marginTop: "8px",
    padding: "15px 18px",
    borderRadius: "18px",
    border: "1px solid #d1d5db",
    background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
    color: "#09090b",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  message: {
    marginTop: "16px",
    color: "#e5e5e5",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  footerText: {
    marginTop: "20px",
    color: "#8f8f8f",
    fontSize: "14px",
  },
  link: {
    color: "#f5f5f5",
    textDecoration: "underline",
  },
};
