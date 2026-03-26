"use client";

import { useMemo, useState, type CSSProperties } from "react";

export default function CoverLetterGeneratorPage() {
  const [fontFamily, setFontFamily] = useState("Times New Roman");
  const [todayDate, setTodayDate] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [openingLine, setOpeningLine] = useState("");
  const [experienceLine, setExperienceLine] = useState("");
  const [valueLine, setValueLine] = useState("");
  const [closingLine, setClosingLine] = useState("");
  const [signatureName, setSignatureName] = useState("");

  const signatureFont = useMemo(() => {
    if (fontFamily === "Calibri") return "cursive";
    if (fontFamily === "Arial") return "cursive";
    return "cursive";
  }, [fontFamily]);

  function handlePrint() {
    window.print();
  }

  return (
    <main style={styles.page}>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          .print-wrap,
          .print-wrap * {
            visibility: visible !important;
          }

          .print-wrap {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <div style={styles.shell}>
        <section style={styles.leftCol}>
          <div style={styles.card}>
            <p style={styles.kicker}>Cover Letter Generator</p>
            <h1 style={styles.title}>Create a cover letter</h1>
            <p style={styles.subtitle}>
              Use the guided fields below. Keep it short, clear, and professional.
            </p>
          </div>

          <div style={styles.card}>
            <label style={styles.label}>Cover Letter Font</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              style={styles.input}
            >
              <option>Times New Roman</option>
              <option>Arial</option>
              <option>Calibri</option>
            </select>

            <div style={styles.twoCol}>
              <Field label="Date" value={todayDate} onChange={setTodayDate} placeholder="March 25, 2026" />
              <Field label="Your Full Name" value={fullName} onChange={setFullName} placeholder="Your Name" />
            </div>

            <div style={styles.twoCol}>
              <Field label="Phone Number" value={phone} onChange={setPhone} placeholder="475-777-7777" />
              <Field label="Email" value={email} onChange={setEmail} placeholder="you@email.com" />
            </div>

            <div style={styles.twoCol}>
              <Field label="Employer / Contact Name" value={employerName} onChange={setEmployerName} placeholder="Employer Name" />
              <Field label="Hiring Manager (optional)" value={hiringManager} onChange={setHiringManager} placeholder="Mr. Smith" />
            </div>

            <div style={styles.twoCol}>
              <Field label="Job Title" value={jobTitle} onChange={setJobTitle} placeholder="Customer Service Representative" />
              <Field label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Company Name" />
            </div>

            <TextAreaField
              label="Opening Paragraph"
              value={openingLine}
              onChange={setOpeningLine}
              placeholder="I am writing to express my interest in the [Job Title] position at [Company Name]."
            />

            <TextAreaField
              label="Experience / Fit"
              value={experienceLine}
              onChange={setExperienceLine}
              placeholder="I bring strong communication, organization, and customer service skills, along with experience working in fast-paced environments."
            />

            <TextAreaField
              label="Value / Why You"
              value={valueLine}
              onChange={setValueLine}
              placeholder="I am confident that my professionalism, adaptability, and willingness to learn would make me a strong addition to your team."
            />

            <TextAreaField
              label="Closing Paragraph"
              value={closingLine}
              onChange={setClosingLine}
              placeholder="Thank you for your time and consideration. I look forward to the opportunity to discuss how I can contribute to your team."
            />

            <Field
              label="Signature Name"
              value={signatureName}
              onChange={setSignatureName}
              placeholder="Your Name"
            />

            <div style={styles.buttonRow}>
              <button onClick={handlePrint} style={styles.primaryButton}>
                Print / Save
              </button>

              <a href="/career-toolkit" style={styles.linkButton}>
                Back to Career ToolKit
              </a>
            </div>
          </div>
        </section>

        <aside className="print-wrap" style={styles.rightCol}>
          <div
            style={{
              ...styles.previewPaper,
              fontFamily,
            }}
          >
            <p style={styles.letterText}>{todayDate || "March 25, 2026"}</p>

            <div style={styles.letterBlock}>
              <p style={styles.letterText}>{employerName || "Employer Name"}</p>
              {hiringManager ? <p style={styles.letterText}>{hiringManager}</p> : null}
              {companyName ? <p style={styles.letterText}>{companyName}</p> : null}
            </div>

            <div style={styles.letterBlock}>
              <p style={styles.letterText}>
                Dear {hiringManager || employerName || "Hiring Manager"},
              </p>
            </div>

            <div style={styles.letterBlock}>
              <p style={styles.letterText}>
                {openingLine ||
                  "I am writing to express my interest in the position with your company. I am excited about the opportunity to contribute my skills and professionalism to your team."}
              </p>
            </div>

            <div style={styles.letterBlock}>
              <p style={styles.letterText}>
                {experienceLine ||
                  "I bring strong communication, teamwork, organization, and customer service skills, along with the ability to adapt quickly and work well in fast-paced environments."}
              </p>
            </div>

            <div style={styles.letterBlock}>
              <p style={styles.letterText}>
                {valueLine ||
                  "I am confident that my positive attitude, work ethic, and willingness to learn would make me a valuable addition to your team."}
              </p>
            </div>

            <div style={styles.letterBlock}>
              <p style={styles.letterText}>
                {closingLine ||
                  "Thank you for your time and consideration. I look forward to the opportunity to speak with you further about how I can contribute to your organization."}
              </p>
            </div>

            <div style={styles.letterBlock}>
              <p style={styles.letterText}>Sincerely,</p>
            </div>

            <div style={styles.signatureBlock}>
              <p
                style={{
                  ...styles.signature,
                  fontFamily: signatureFont,
                }}
              >
                {signatureName || fullName || "Your Name"}
              </p>
              <p style={styles.letterText}>{fullName || "Your Name"}</p>
              <p style={styles.letterText}>
                {[phone, email].filter(Boolean).join(" • ") || "Phone • Email"}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Field({
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
      <input
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

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
    color: "#e7e7e7",
    padding: "32px 24px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  shell: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 0.95fr",
    gap: "24px",
    alignItems: "start",
  },
  leftCol: {
    display: "grid",
    gap: "20px",
  },
  rightCol: {
    position: "sticky",
    top: "24px",
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
  title: {
    margin: "0 0 10px",
    fontSize: "38px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  subtitle: {
    margin: 0,
    color: "#c8c8c8",
    fontSize: "16px",
    lineHeight: 1.7,
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  fieldWrap: {
    marginBottom: "12px",
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
    marginBottom: "12px",
  },
  textarea: {
    width: "100%",
    minHeight: "110px",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: "15px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  buttonRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "16px",
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
  linkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    padding: "15px 18px",
    borderRadius: "18px",
    border: "1px solid #3a3a3a",
    background: "#111111",
    color: "#f5f5f5",
    fontWeight: 700,
  },
  previewPaper: {
    background: "#fff",
    color: "#111827",
    borderRadius: "18px",
    minHeight: "1000px",
    padding: "56px 64px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
  },
  letterBlock: {
    marginBottom: "24px",
  },
  letterText: {
    margin: 0,
    fontSize: "18px",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  signatureBlock: {
    marginTop: "36px",
  },
  signature: {
    margin: "0 0 6px",
    fontSize: "32px",
    lineHeight: 1.2,
  },
};
