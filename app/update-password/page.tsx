"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!password || !confirmPassword) {
      setMessage("Please complete both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setMessage("Please use at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setMessage("Password updated successfully. You can now sign in with your new password.");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage(
        error?.message ||
          "Unable to update password. Please use the reset link from your email and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <p style={styles.kicker}>HireMinds</p>
        <h1 style={styles.title}>Create New Password</h1>
        <p style={styles.subtitle}>
          Enter your new password below.
        </p>

        <form onSubmit={handleUpdatePassword} style={styles.form}>
          <label style={styles.label}>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            style={styles.input}
          />

          <label style={styles.label}>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Updating..." : "Update Password"}
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
