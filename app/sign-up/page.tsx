"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [bio, setBio] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  async function handleSignUp() {
    setMessage("");

    if (!fullName || !email || !password) {
      setMessage("Full name, email, and password are required.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const userId = data.user?.id;

      if (!userId) {
        setMessage("Account created. Please verify your email before continuing.");
        return;
      }

      let resumeUrl = "";

      if (resumeFile) {
        const path = `${userId}/resume-${Date.now()}-${resumeFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(path, resumeFile, { upsert: true });

        if (uploadError) throw uploadError;

        const publicUrl = supabase.storage.from("resumes").getPublicUrl(path);
        resumeUrl = publicUrl.data.publicUrl;
      }

      const { error: profileError } = await supabase.from("candidate_profiles").insert({
        user_id: userId,
        full_name: fullName,
        phone,
        email,
        city,
        state: stateName,
        bio,
        resume_url: resumeUrl || null,
      });

      if (profileError) throw profileError;

      setMessage("Career Passport account created. You can now continue to build your resume.");
    } catch (err: any) {
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.heroPanel}>
          <p style={styles.eyebrow}>HIREMINDS</p>
          <h1 style={styles.title}>Create your Career Passport.</h1>
          <p style={styles.subtitle}>
            Set up your account first, then continue to the resume builder to
            create a free or premium resume.
          </p>

          <div style={styles.heroCard}>
            <p style={styles.heroCardTitle}>What happens next</p>

            <div style={styles.heroRow}>
              <span style={styles.heroValue}>1. Create your account</span>
            </div>
            <div style={styles.heroRow}>
              <span style={styles.heroValue}>2. Add your basic profile details</span>
            </div>
            <div style={styles.heroRow}>
              <span style={styles.heroValue}>3. Continue to the resume builder</span>
            </div>
          </div>
        </section>

        <section style={styles.formPanel}>
          <div style={styles.formHeader}>
            <p style={styles.formKicker}>Account Setup</p>
            <h2 style={styles.formTitle}>Career Passport Sign Up</h2>
          </div>

          <div style={styles.grid}>
            <Field
              label="Full Name"
              value={fullName}
              onChange={setFullName}
              placeholder="Ismary Szegedi"
            />
            <Field
              label="Phone Number"
              value={phone}
              onChange={setPhone}
              placeholder="(203) 555-1234"
            />
          </div>

          <div style={styles.grid}>
            <Field
              label="Email Address"
              value={email}
              onChange={setEmail}
              placeholder="name@email.com"
              type="email"
            />
            <Field
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="Create password"
              type="password"
            />
          </div>

          <div style={styles.grid}>
            <Field
              label="City"
              value={city}
              onChange={setCity}
              placeholder="Bridgeport"
            />
            <Field
              label="State"
              value={stateName}
              onChange={setStateName}
              placeholder="Connecticut"
            />
          </div>

          <Field
            label="Referred By"
            value={referredBy}
            onChange={setReferredBy}
            placeholder="Name, organization, or source"
          />

          <TextAreaField
            label="Short Bio"
            value={bio}
            onChange={setBio}
            placeholder="Write a short professional bio for your Career Passport."
          />

          <label style={styles.label}>Resume Upload (optional)</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            style={styles.input}
          />

          <button onClick={handleSignUp} disabled={loading} style={styles.button}>
            {loading ? "Creating Account..." : "Create Career Passport"}
          </button>

          {message ? <p style={styles.message}>{message}</p> : null}

          <p style={styles.footerNote}>
            Intro video, verification, and advanced profile tools can be added later
            from your Career Passport profile.
          </p>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.textarea}
      />
    </div>
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
  },
  heroValue: {
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
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
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
    letterSpacing: "0.02em",
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
  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: "15px",
    outline: "none",
    resize: "vertical",
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
};
