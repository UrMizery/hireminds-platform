"use client";

import { useState } from "react";

export default function ResumeBuilder() {
  // ORIGINAL STATES
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [education, setEducation] = useState("");
  const [certifications, setCertifications] = useState("");
  const [workHistory, setWorkHistory] = useState<any[]>([]);

  // NEW AI STATES
  const [showAutofillPrompt, setShowAutofillPrompt] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  // AI UPLOAD FUNCTION
  const handleResumeUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/parse-resume", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    setParsedData(data);
    setShowAutofillPrompt(true);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Resume Builder</h1>

      {/* UPLOAD (ADD-ON FEATURE) */}
      <input type="file" onChange={handleResumeUpload} />

      {/* AUTOFILL PROMPT */}
      {showAutofillPrompt && (
        <div style={styles.prompt}>
          <p>Use this resume to auto-fill your new resume?</p>

          <button
            style={styles.primaryBtn}
            onClick={() => {
              setSummary(parsedData?.summary || "");
              setSkills(parsedData?.skills || []);
              setEducation(parsedData?.education || "");
              setCertifications(parsedData?.certifications || "");
              setWorkHistory(parsedData?.jobs || []);
              setShowAutofillPrompt(false);
            }}
          >
            Yes
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => setShowAutofillPrompt(false)}
          >
            No
          </button>
        </div>
      )}

      <div style={styles.container}>
        {/* LEFT SIDE FORM */}
        <div style={styles.form}>
          <label>Full Name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={styles.input}
          />

          <label>Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
          />

          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <label>Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            style={styles.input}
          />

          <label>Skills (comma separated)</label>
          <input
            value={skills.join(", ")}
            onChange={(e) =>
              setSkills(e.target.value.split(",").map((s) => s.trim()))
            }
            style={styles.input}
          />

          <label>Education</label>
          <textarea
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            style={styles.input}
          />

          <label>Certifications</label>
          <textarea
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
            style={styles.input}
          />

          <label>Work Experience</label>
          {workHistory.map((job, i) => (
            <div key={i} style={styles.jobBox}>
              <input
                placeholder="Company"
                value={job.company || ""}
                onChange={(e) => {
                  const updated = [...workHistory];
                  updated[i].company = e.target.value;
                  setWorkHistory(updated);
                }}
                style={styles.input}
              />
              <input
                placeholder="Role"
                value={job.title || ""}
                onChange={(e) => {
                  const updated = [...workHistory];
                  updated[i].title = e.target.value;
                  setWorkHistory(updated);
                }}
                style={styles.input}
              />
            </div>
          ))}
        </div>

        {/* RIGHT SIDE PREVIEW */}
        <div style={styles.preview}>
          <h2>{fullName || "Full Name"}</h2>
          <p>{phone} | {email}</p>

          <h3>Summary</h3>
          <p>{summary}</p>

          <h3>Skills</h3>
          <ul>
            {skills.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>

          <h3>Education</h3>
          <p>{education}</p>

          <h3>Certifications</h3>
          <p>{certifications}</p>

          <h3>Work Experience</h3>
          {workHistory.map((job, i) => (
            <div key={i}>
              <strong>{job.company}</strong> — {job.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  page: {
    background: "#000",
    color: "#fff",
    minHeight: "100vh",
    padding: "30px",
  },
  title: {
    fontSize: "28px",
    marginBottom: "20px",
  },
  container: {
    display: "flex",
    gap: "30px",
    marginTop: "20px",
  },
  form: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  preview: {
    flex: 1,
    background: "#111",
    padding: "20px",
    borderRadius: "10px",
  },
  input: {
    padding: "10px",
    background: "#111",
    border: "1px solid #333",
    color: "#fff",
  },
  jobBox: {
    background: "#111",
    padding: "10px",
    borderRadius: "8px",
  },
  prompt: {
    marginTop: "20px",
    background: "#111",
    padding: "15px",
    borderRadius: "10px",
  },
  primaryBtn: {
    marginRight: "10px",
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
  },
  secondaryBtn: {
    padding: "10px",
    background: "#444",
    color: "#fff",
    border: "none",
  },
};
