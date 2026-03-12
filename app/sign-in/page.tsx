"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

      if (error) throw error;

      window.location.href = "/profile";
    } catch (err: any) {
      setMessage(err.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.heroPanel}>
          <p style={styles.eyebrow}>HIREMINDS</p>
          <h1 style={styles.title}>Sign in to continue.</h1>
          <p style={styles.subtitle}>
            Access your Career Passport, update your profile, and continue to the
            resume builder when you're ready.
          </p>

          <div style={styles.heroCard}>
            <p style={styles.heroCardTitle}>After sign in</p>
            <div style={styles.heroRow}>Go to your private profile</div>
            <div style={styles.heroRow}>Upload photo and intro video</div>
            <div style={styles.heroRow}>Build your resume</div>
          </div>
        </section>

        <section style={styles.formPanel}>
          <div style={styles.formHeader}>
            <p style={styles.formKicker}>Account Access</p>
            <h2 style={styles.formTitle}>Sign In</h2>
          </div>

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

          {message ? <p style={styles.message}>{message}</p> : null}

          <p style={styles.footerNote}>
            Need an account? <a href="/sign-up" style={styles.link}>Create your Career Passport</a>
          </p>
        </section>
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
  shell: {
    maxWidth: "1240px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    alignItems: "start",
  },
  heroPanel: {
    background: "linear-gradient(180deg, #111111 0%, #151515 100%)",
    border: "1px solid #232323",
    borderRadius: "28px",
    padding: "28px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
  },
  eyebrow: {
    margin: "0 0 12px",
    color: "#a3a3a3",
    letterSpacing: "0.28em",
    fontSize: "12px",
    fontWeight: 600,
  },
  title: {
    margin: "0 0 14px",
    fontSize: "42px",
    lineHeight: 1.02,
    fontWeight: 500,
    letterSpacing: "-0.04em",
    color: "#f5f5f5",
  },
  subtitle: {
    margin: 0,
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#b3b3b3",
    maxWidth: "520px",
  },
  heroCard: {
    marginTop: "24px",
    padding: "18px",
    borderRadius: "22px",
    border: "1px solid #2d2d2d",
    background: "rgba(255,255,255,0.02)",
  },
  heroCardTitle: {
    margin: "0 0 14px",
    color: "#f5f5f5",
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  heroRow: {
    padding: "12px 0",
    borderBottom: "1px solid #222",
    color: "#ececec",
    fontSize: "14px",
  },
  formPanel: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "28px",
    padding: "30px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
  },
  formHeader: {
    marginBottom: "20px",
  },
  formKicker: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  formTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 500,
    letterSpacing: "-0.03em",
    color: "#f5f5f5",
  },
  fieldWrap: {
    marginBottom: "14px",
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
    marginTop: "10px",
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
  footerNote: {
    marginTop: "18px",
    color: "#8f8f8f",
    fontSize: "13px",
    lineHeight: 1.7,
  },
  link: {
    color: "#e5e5e5",
  },
};
