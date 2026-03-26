"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendReset(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/update-password`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) throw error;

      setMessage(
        "Password reset email sent. Check your inbox and follow the link to create a new password."
      );
    } catch (error: any) {
      setMessage(error?.message || "Unable to send password reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <p style={styles.kicker}>HireMinds</p>
        <h1 style={styles.title}>Reset Password</h1>
        <p style={styles.subtitle}>
          Enter your email and we’ll send you a secure link to create a new password.
        </p>

        <form onSubmit={handleSendReset} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message ? <p style={styles.message}>{message}</p> : null}

        <a href="/sign-in" style={styles.link}>
          Back to Sign In
        </a>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
    padding: "24px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    width: "100%",
    maxWidth: "520px",
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "28px",
    color: "#f5f5f5",
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
    fontWeight: 600,
  },
  subtitle: {
    margin: "0 0 20px",
    color: "#c8c8c8",
    fontSize: "15px",
    lineHeight: 1.7,
  },
  form: {
    display: "grid",
    gap: "12px",
  },
  label: {
    fontSize: "14px",
    color: "#d4d4d8",
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
  },
  button: {
    marginTop: "8px",
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
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
    lineHeight: 1.7,
    fontSize: "14px",
  },
  link: {
    display: "inline-block",
    marginTop: "18px",
    color: "#f5f5f5",
    textDecoration: "underline",
    fontSize: "14px",
  },
};
