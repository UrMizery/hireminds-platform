"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type ResumePlan = "free" | "pro";

type Bullet = { text: string };

type ExperienceItem = {
  companyName: string;
  roleTitle: string;
  bullets: Bullet[];
};

export default function ResumeBuilderPage() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [plan, setPlan] = useState<ResumePlan>("free");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [summary, setSummary] = useState("");
  const [skillsInput, setSkillsInput] = useState("");

  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    { companyName: "", roleTitle: "", bullets: [{ text: "" }] },
  ]);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (data?.user) {
        setUserId(data.user.id);
        setEmail(data.user.email || "");
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  const skills = useMemo(() => {
    return skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [skillsInput]);

  const planDetails = useMemo(() => {
    if (plan === "free") {
      return {
        text: "Basic resume builder.",
      };
    }

    return {
      text: "$24.99/month full access.",
    };
  }, [plan]);

  function addExperience() {
    setExperiences([
      ...experiences,
      { companyName: "", roleTitle: "", bullets: [{ text: "" }] },
    ]);
  }

  function updateExperience(index: number, field: string, value: string) {
    const updated = [...experiences];
    (updated[index] as any)[field] = value;
    setExperiences(updated);
  }

  function updateBullet(index: number, bIndex: number, value: string) {
    const updated = [...experiences];
    updated[index].bullets[bIndex].text = value;
    setExperiences(updated);
  }

  function addBullet(index: number) {
    const updated = [...experiences];
    updated[index].bullets.push({ text: "" });
    setExperiences(updated);
  }

  async function handleSave() {
    if (!userId) {
      setMessage("Please sign in first.");
      return;
    }

    const { error } = await supabase.from("resumes").insert({
      user_id: userId,
      full_name: fullName,
      phone,
      email,
      summary,
      skills,
      experiences,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Resume saved!");
    }
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (!userId) {
    return <div style={{ padding: 20 }}>Please sign in</div>;
  }

  return (
    <div style={styles.page}>
      <h1>Resume Builder</h1>

      {/* PLAN */}
      <select
        value={plan}
        onChange={(e) => setPlan(e.target.value as ResumePlan)}
        style={styles.input}
      >
        <option value="free">Free</option>
        <option value="pro">Pro ($24.99)</option>
      </select>

      <p>{planDetails.text}</p>

      <div style={styles.container}>
        <div style={styles.form}>
          <input
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <textarea
            placeholder="Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Skills (comma separated)"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            style={styles.input}
          />

          <h3>Experience</h3>

          {experiences.map((exp, i) => (
            <div key={i}>
              <input
                placeholder="Company"
                value={exp.companyName}
                onChange={(e) =>
                  updateExperience(i, "companyName", e.target.value)
                }
                style={styles.input}
              />

              <input
                placeholder="Role"
                value={exp.roleTitle}
                onChange={(e) =>
                  updateExperience(i, "roleTitle", e.target.value)
                }
                style={styles.input}
              />

              {exp.bullets.map((b, j) => (
                <input
                  key={j}
                  placeholder="Bullet"
                  value={b.text}
                  onChange={(e) =>
                    updateBullet(i, j, e.target.value)
                  }
                  style={styles.input}
                />
              ))}

              <button onClick={() => addBullet(i)}>+ Bullet</button>
            </div>
          ))}

          <button onClick={addExperience}>+ Experience</button>

          <button onClick={handleSave} style={styles.button}>
            Save Resume
          </button>

          {message && <p>{message}</p>}
        </div>

        <div style={styles.preview}>
          <h2>{fullName || "Full Name"}</h2>
          <p>{phone} | {email}</p>

          <h3>Summary</h3>
          <p>{summary}</p>

          <h3>Skills</h3>
          {skills.map((s, i) => (
            <p key={i}>• {s}</p>
          ))}

          <h3>Experience</h3>
          {experiences.map((exp, i) => (
            <div key={i}>
              <strong>{exp.companyName}</strong> - {exp.roleTitle}
              {exp.bullets.map((b, j) => (
                <p key={j}>• {b.text}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  page: { background: "#000", color: "#fff", minHeight: "100vh", padding: 20 },
  container: { display: "flex", gap: 20 },
  form: { flex: 1, display: "flex", flexDirection: "column", gap: 10 },
  preview: { flex: 1, background: "#111", padding: 20 },
  input: { padding: 10, background: "#111", border: "1px solid #333", color: "#fff" },
  button: { padding: 10, background: "#2563eb", color: "#fff", border: "none" },
};
