"use client";

import { useState } from "react";

const reasons = [
  "Technical Support",
  "Billing Issue",
  "Cancel Subscription",
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

  const isCancellation = reason === "Cancel Subscription";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage("");

    const trimmedNote = note.trim();

    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setStatusMessage(
        "Full name, phone number, and email are required."
      );
      return;
    }

    if (!reason && !trimmedNote) {
      setStatusMessage(
        "Please choose a reason or write a note."
      );
      return;
    }

    if (reason === "Other" && !trimmedNote) {
      setStatusMessage(
        "Please add a note if you selected Other."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "/api/contact-inquiry",
        {
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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to submit your message."
        );
      }

      if (isCancellation) {
        setStatusMessage(
          "Your subscription cancellation request was submitted successfully. A HireMinds team member will process your request and follow up with confirmation."
        );
      } else {
        setStatusMessage(
          "Your message was sent successfully. A HireMinds team member will follow up soon."
        );
      }

      setFullName("");
      setPhone("");
      setEmail("");
      setReason("Technical Support");
      setNote("");
    } catch (error: any) {
      setStatusMessage(
        error?.message ||
          "Unable to submit your message."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function getNotePlaceholder() {
    if (reason === "Technical Support") {
      return "Briefly describe the issue you need help with.";
    }

    if (reason === "Billing Issue") {
      return "Briefly describe your billing question or issue.";
    }

    if (reason === "Cancel Subscription") {
      return "Optional: Add any additional information about your cancellation request.";
    }

    return "Please tell us what you need help with.";
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <section style={styles.panel}>
          <p style={styles.kicker}>
            HireMinds
          </p>

          <h1 style={styles.title}>
            Contact Support
          </h1>

          <p style={styles.subtitle}>
            Need help with technical support,
            billing, subscription cancellation,
            or something else? Use the form below
            and a HireMinds team member will
            follow up.
          </p>

          <form
            onSubmit={handleSubmit}
            style={styles.form}
          >
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
              label={
                isCancellation
                  ? "Email Associated With Your HireMinds Account"
                  : "Email"
              }
              value={email}
              onChange={setEmail}
              placeholder={
                isCancellation
                  ? "Enter the email used for your subscription"
                  : "you@email.com"
              }
              type="email"
            />

            <div style={styles.fieldWrap}>
              <label style={styles.label}>
                Reason
              </label>

              <select
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setStatusMessage("");
                }}
                style={styles.input}
              >
                {reasons.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {isCancellation ? (
              <div style={styles.cancellationNotice}>
                <div style={styles.cancellationBadge}>
                  SUBSCRIPTION CANCELLATION
                </div>

                <h3 style={styles.cancellationTitle}>
                  Please submit your request before
                  your next automatic charge.
                </h3>

                <p style={styles.cancellationText}>
                  To help prevent your next automatic
                  charge, please submit this
                  cancellation request{" "}
                  <strong>
                    no later than 6:00 PM Eastern
                    Time on the day before your next
                    scheduled billing date.
                  </strong>
                </p>

                <p style={styles.cancellationText}>
                  This applies to both the{" "}
                  <strong>
                    first $24.99 charge following the
                    5-day introductory period
                  </strong>{" "}
                  and all future{" "}
                  <strong>
                    $24.99 monthly renewals.
                  </strong>
                </p>

                <p style={styles.cancellationWarning}>
                  Requests received after the 6:00 PM
                  ET cutoff may not be processed
                  before the scheduled automatic
                  charge occurs.
                </p>

                <p style={styles.cancellationFinePrint}>
                  Cancellation requests are processed
                  manually by the HireMinds team.
                  Please use the email address
                  associated with your paid HireMinds
                  account so we can locate your
                  subscription.
                </p>
              </div>
            ) : null}

            <TextAreaField
              label={
                reason === "Other"
                  ? "Note (required)"
                  : "Note"
              }
              value={note}
              onChange={setNote}
              placeholder={getNotePlaceholder()}
            />

            <button
              type="submit"
              disabled={submitting}
              style={{
                ...styles.button,
                opacity: submitting ? 0.7 : 1,
                cursor: submitting
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {submitting
                ? "Submitting..."
                : isCancellation
                ? "Submit Cancellation Request"
                : "Submit Form"}
            </button>

            {statusMessage ? (
              <p style={styles.status}>
                {statusMessage}
              </p>
            ) : null}
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
      <label style={styles.label}>
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
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
      <label style={styles.label}>
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        style={styles.textarea}
      />
    </div>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(ellipse at 14% 16%, rgba(42,121,230,0.20) 0%, rgba(10,54,112,0.10) 30%, transparent 55%), radial-gradient(ellipse at 86% 70%, rgba(25,104,214,0.18) 0%, rgba(8,43,92,0.08) 32%, transparent 58%), radial-gradient(ellipse at 52% -8%, rgba(90,162,255,0.11) 0%, transparent 40%), linear-gradient(135deg,#020812 0%,#05172a 28%,#03101f 50%,#08213d 72%,#020914 100%)",
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
    background:
      "linear-gradient(180deg, rgba(9,18,31,0.96) 0%, rgba(7,14,25,0.98) 100%)",
    border:
      "1px solid rgba(120,145,175,0.20)",
    borderRadius: "30px",
    padding: "36px",
    boxShadow:
      "0 30px 80px rgba(0,0,0,0.42)",
  },

  kicker: {
    margin: "0 0 8px",
    color: "#1677FF",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },

  title: {
    margin: "0 0 14px",
    fontSize: "42px",
    fontWeight: 600,
    color: "#ffffff",
    lineHeight: 1.1,
  },

  subtitle: {
    margin: "0 0 28px",
    color: "#c7cdd6",
    fontSize: "16px",
    lineHeight: 1.8,
    maxWidth: "700px",
  },

  form: {
    display: "grid",
    gap: "14px",
  },

  twoCol: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "14px",
  },

  fieldWrap: {
    display: "grid",
    gap: "8px",
  },

  label: {
    color: "#d7dce4",
    fontSize: "13px",
    fontWeight: 600,
  },

  input: {
    width: "100%",
    padding: "15px 16px",
    borderRadius: "18px",
    border:
      "1px solid rgba(120,145,175,0.24)",
    background: "#050b13",
    color: "#f4f7fb",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
  },

  textarea: {
    width: "100%",
    minHeight: "160px",
    padding: "15px 16px",
    borderRadius: "18px",
    border:
      "1px solid rgba(120,145,175,0.24)",
    background: "#050b13",
    color: "#f4f7fb",
    fontSize: "15px",
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none",
  },

  cancellationNotice: {
    marginTop: "2px",
    padding: "20px",
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, rgba(22,119,255,0.12), rgba(22,119,255,0.04))",
    border:
      "1px solid rgba(63,143,255,0.35)",
  },

  cancellationBadge: {
    display: "inline-block",
    marginBottom: "10px",
    color: "#6eaeff",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  },

  cancellationTitle: {
    margin: "0 0 10px",
    color: "#ffffff",
    fontSize: "18px",
    lineHeight: 1.4,
  },

  cancellationText: {
    margin: "0 0 10px",
    color: "#d8e3ef",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  cancellationWarning: {
    margin: "12px 0",
    padding: "12px 14px",
    borderRadius: "14px",
    background:
      "rgba(255,183,77,0.10)",
    border:
      "1px solid rgba(255,183,77,0.25)",
    color: "#ffe1ad",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  cancellationFinePrint: {
    margin: "8px 0 0",
    color: "#aebdcd",
    fontSize: "12px",
    lineHeight: 1.7,
  },

  button: {
    marginTop: "8px",
    width: "100%",
    padding: "16px 18px",
    borderRadius: "18px",
    border: "1px solid #1677FF",
    background: "#1677FF",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 700,
  },

  status: {
    margin: "8px 0 0",
    color: "#e5e9ef",
    fontSize: "14px",
    lineHeight: 1.7,
  },
};
