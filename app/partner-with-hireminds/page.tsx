"use client";

import { useState } from "react";

export default function PartnerWithHireMindsPage() {
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage("");

    if (!companyName.trim() || !fullName.trim() || !email.trim() || !message.trim()) {
      setStatusMessage("Please complete the required fields before submitting.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/partner-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName,
          fullName,
          title,
          phone,
          email,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to submit inquiry.");
      }

      setStatusMessage("Inquiry sent successfully. We’ll be in touch soon.");

      setCompanyName("");
      setFullName("");
      setTitle("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (error: any) {
      setStatusMessage(error?.message || "Unable to submit inquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.heroCard}>
          <p style={styles.kicker}>HireMinds</p>
          <h1 style={styles.title}>Partner With HireMinds</h1>
          <p style={styles.subtitle}>
            Interested in partnering with HireMinds? Share a few details about your organization,
            how you’d like to collaborate, or what information you’re looking for.
          </p>

          <div style={styles.heroButtons}>
            <a href="/" style={styles.linkButton}>
              Back Home
            </a>
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Partnership Inquiry</p>
          <h2 style={styles.sectionTitle}>Tell us about your organization</h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.twoCol}>
              <Field
                label="Company Name"
                value={companyName}
                onChange={setCompanyName}
                placeholder="Organization or business name"
              />
              <Field
                label="Your Name"
                value={fullName}
                onChange={setFullName}
                placeholder="Full name"
              />
            </div>

            <div style={styles.twoCol}>
              <Field
                label="Title"
                value={title}
                onChange={setTitle}
                placeholder="Your role or title"
              />
              <Field
                label="Phone Number"
                value={phone}
                onChange={setPhone}
                placeholder="Best number to reach you"
              />
            </div>

            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              placeholder="you@company.com"
              type="email"
            />

            <TextAreaField
              label="How would you like to partner with HireMinds?"
              value={message}
              onChange={setMessage}
              placeholder="Share how you'd like to partner, what kind of support or collaboration you’re interested in, or any details you want us to know."
            />

            <div style={styles.actionRow}>
              <button type="submit" style={styles.primaryButton} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Inquiry"}
              </button>
            </div>

            {statusMessage ? <p style={styles.statusMessage}>{statusMessage}</p> : null}
          </form>
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
    background: "linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
    color: "#e7e7e7",
    padding: "32px 24px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  shell: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gap: "24px",
  },
  heroCard: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
  },
  card: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
  },
  kicker: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  sectionKicker: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  title: {
    margin: "0 0 10px",
    fontSize: "40px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  sectionTitle: {
    margin: "0 0 18px",
    fontSize: "30px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  subtitle: {
    margin: 0,
    color: "#c8c8c8",
    fontSize: "16px",
    lineHeight: 1.7,
    maxWidth: "860px",
  },
  heroButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "18px",
    flexWrap: "wrap",
  },
  linkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    padding: "12px 16px",
    borderRadius: "16px",
    border: "1px solid #3a3a3a",
    background: "#111111",
    color: "#f5f5f5",
    fontWeight: 700,
  },
  form: {
    display: "grid",
    gap: "12px",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  fieldWrap: {
    marginBottom: "4px",
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
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: "160px",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: "15px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  actionRow: {
    marginTop: "8px",
  },
  primaryButton: {
    width: "100%",
    padding: "15px 18px",
    borderRadius: "18px",
    border: "1px solid #d1d5db",
    background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
    color: "#09090b",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  statusMessage: {
    marginTop: "16px",
    color: "#e5e5e5",
    fontSize: "14px",
    lineHeight: 1.7,
  },
};

