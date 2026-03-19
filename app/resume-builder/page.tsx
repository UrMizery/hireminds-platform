"use client";

import { useState } from "react";

export default function ResumeBuilder() {
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [education, setEducation] = useState("");
  const [certifications, setCertifications] = useState("");
  const [workHistory, setWorkHistory] = useState<any[]>([]);

  const [showAutofillPrompt, setShowAutofillPrompt] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

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
      <h1>Resume Builder</h1>

      {/* Upload */}
      <input type="file" onChange={handleResumeUpload} />

      {/* Autofill Prompt */}
      {showAutofillPrompt && (
        <div style={styles.prompt}>
          <p>Use this resume to auto-fill your new resume?</p>

          <button
            onClick={() => {
              setSummary(parsedData.summary || "");
              setSkills(parsedData.skills || []);
              setEducation(parsedData.education || "");
              setCertifications(parsedData.certifications || "");
              setWorkHistory(parsedData.jobs || []);
              setShowAutofillPrompt(false);
            }}
          >
            Yes
          </button>

          <button onClick={() => setShowAutofillPrompt(false)}>No</button>
        </div>
      )}

      {/* FORM */}
      <div style={styles.container}>
        <div style={styles.form}>
          <h3>Summary</h3>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            style={styles.input}
          />

          <h3>Skills (comma separated)</h3>
          <input
            value={skills.join(", ")}
            onChange={(e) =>
              setSkills(e.target.value.split(",").map((s) => s.trim()))
            }
            style={styles.input}
          />

          <h3>Education</h3>
          <textarea
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            style={styles.input}
          />

          <h3>Certifications</h3>
          <textarea
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
            style={styles.input}
          />

          <h3>Work Experience</h3>
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
              />
              <input
                placeholder="Title"
                value={job.title || ""}
                onChange={(e) => {
                  const updated = [...workHistory];
                  updated[i].title = e.target.value;
                  setWorkHistory(updated);
                }}
              />
            </div>
          ))}
        </div>

        {/* LIVE PREVIEW */}
        <div style={styles.preview}>
          <h2>Preview</h2>

          <h3>Summary</h3>
          <p>{summary}</p>

          <h3>Skills</h3>
          <ul>
            {skills.map((s, i) => (
              <li key={i}>{s}</li>
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
    padding: "20px",
    color: "white",
    background: "#0a0a0a",
    minHeight: "100vh",
  },
  prompt: {
    marginTop: "20px",
    background: "#111",
    padding: "15px",
    borderRadius: "10px",
  },
  container: {
    display: "flex",
    marginTop: "20px",
    gap: "20px",
  },
  form: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  preview: {
    flex: 1,
    background: "#111",
    padding: "20px",
    borderRadius: "10px",
  },
  input: {
    padding: "10px",
    background: "#000",
    color: "white",
    border: "1px solid #333",
  },
  jobBox: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    background: "#111",
    padding: "10px",
  },
};
