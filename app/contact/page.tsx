"use client";

import { useState } from "react";

const reasons = [
  "Technical Support",
  "Billing Issue",
  "Sign Up for Workshop",
  "Other",
];

export default function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("Technical Support");
  const [note, setNote] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage("");

    const trimmedNote = note.trim();

    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setStatusMessage("Full name, phone number, and email are required.");
      return;
    }

    if (!reason && !trimmedNote) {
      setStatusMessage("Please choose a reason or write a note.");
      return;
    }

    if (reason === "Other" && !trimmedNote) {
      setStatusMessage("Please add a note if you selected Other.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/contact-inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          reason,
          note: trimmedNote,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to submit your message.");
      }

      setStatusMessage("Your message was sent successfully. A HireMinds team member will follow up soon.");
      setFullName("");
      setPhone("");
      setEmail("");
      setReason("Technical Support");
      setNote("");
    } catch (error: any) {
      setStatusMessage(error?.message || "Unable to submit your message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <section style={styles.panel}>
          <p style={styles.kicker}>HireMinds</p>
          <h1 style={styles.title}>Contact Support</h1>
          <p style={styles.subtitle}>
            Need help with technical support, billing, workshop sign-up, or something else?
            Contact a HireMinds team member at{" "}
            <a href="mailto:info@hireminds.app" style={styles.inlineLink}>
              info@hireminds.app
            </a>
            {" "}or use the form below.
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.twoCol}>
              <Field
                label="Full Name"
                value={fullName}
                onChange={setFullName}
                placeholder="Your full name"
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
              placeholder="you@email.com"
              type="email"
            />

            <div style={styles.fieldWrap}>
              <label style={styles.label}>Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={styles.input}
              >
                {reasons.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <TextAreaField
              label={reason === "Other" ? "Note (required)" : "Note"}
              value={note}
              onChange={setNote}
              placeholder={
                reason === "Technical Support"
                  ? "Briefly describe the issue you need help with."
                  : reason === "Billing Issue"
                  ? "Briefly describe your billing question or issue."
                  : reason === "Sign Up for Workshop"
                  ? "Tell us which workshop you are interested in."
                  : "Please tell us what you need help with."
              }
            />

            <button type="submit" disabled={submitting} style={styles.button}>
              {submitting ? "Submitting..." : "Submit Form"}
            </button>

            {statusMessage ? <p style={styles.status}>{statusMessage}</p> : null}
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
    background:
      "radial-gradient(circle at top, rgba(37,99,235,0.16) 0%, rgba(5,5,5,1) 38%, rgba(13,13,15,1) 100%)",
    color: "#e7e7e7",
    padding: "48px 24px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  wrap: {
    width: "100%",
    maxWidth: "860px",
  },
  panel: {
    background: "linear-gradient(180deg, rgba(20,20,20,0.96) 0%, rgba(24,24,24,0.98) 100%)",
    border: "1px solid #262626",
    borderRadius: "30px",
    padding: "36px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
  },
  kicker: {
    margin: "0 0 8px",
    color: "#a1a1aa",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  title: {
    margin: "0 0 14px",
    fontSize: "42px",
    fontWeight: 600,
    color: "#f5f5f5",
    lineHeight: 1.1,
  },
  subtitle: {
    margin: "0 0 28px",
    color: "#d4d4d8",
    fontSize: "16px",
    lineHeight: 1.8,
    maxWidth: "700px",
  },
  inlineLink: {
    color: "#f5f5f5",
    textDecoration: "underline",
  },
  form: {
    display: "grid",
    gap: "14px",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
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
    padding: "15px 16px",
    borderRadius: "18px",
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
  },
  textarea: {
    width: "100%",
    minHeight: "160px",
    padding: "15px 16px",
    borderRadius: "18px",
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: "15px",
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none",
  },
  button: {
    marginTop: "8px",
    width: "100%",
    padding: "16px 18px",
    borderRadius: "18px",
    border: "1px solid #d1d5db",
    background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
    color: "#09090b",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  status: {
    margin: "8px 0 0",
    color: "#e5e5e5",
    fontSize: "14px",
    lineHeight: 1.7,
  },
};
