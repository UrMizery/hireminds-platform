"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type ResumePlan = "free" | "pro";

const FREE_BULLET_LIMIT = 4;
const FREE_SKILL_LIMIT = 9;

export default function ResumeBuilderPage() {
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");

  const [summaryText, setSummaryText] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [message, setMessage] = useState("");

  const [language, setLanguage] = useState("en");

  const [experiences, setExperiences] = useState([
    {
      companyName: "",
      roleTitle: "",
      bullets: ["", "", "", ""],
    },
  ]);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
        setEmail(data.user.email || "");
      }
    }
    loadUser();
  }, []);

  const skills = useMemo(() => {
    return skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, FREE_SKILL_LIMIT);
  }, [skillsInput]);

  async function handleSaveResume() {
    if (!userId) return;

    const { data: profile } = await supabase
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!profile) return;

    // SAVE RESUME
    await supabase.from("resumes").insert({
      profile_id: profile.id,
      summary_text: summaryText,
      skills,
    });

    // 🔥 ALSO UPDATE PROFILE (THIS IS WHAT YOU WANTED)
    await supabase
      .from("candidate_profiles")
      .update({
        resume_summary: summaryText,
        resume_skills: skills,
      })
      .eq("id", profile.id);

    setMessage("Saved & added to your public profile");
  }

  return (
    <main style={styles.page}>
      <h1>Resume Builder</h1>

      {/* LANGUAGE */}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={styles.input}
      >
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="pl">Polish</option>
        <option value="hi">Hindi</option>
      </select>

      {/* HEADER */}
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

      {/* SUMMARY */}
      <textarea
        placeholder="Summary"
        value={summaryText}
        onChange={(e) => setSummaryText(e.target.value)}
        style={styles.textarea}
      />

      {/* SKILLS */}
      <input
        placeholder="Skills (comma separated, max 9)"
        value={skillsInput}
        onChange={(e) => setSkillsInput(e.target.value)}
        style={styles.input}
      />

      {/* EXPERIENCE */}
      {experiences.map((exp, i) => (
        <div key={i}>
          <input
            placeholder="Company"
            value={exp.companyName}
            onChange={(e) => {
              const updated = [...experiences];
              updated[i].companyName = e.target.value;
              setExperiences(updated);
            }}
            style={styles.input}
          />

          <input
            placeholder="Role"
            value={exp.roleTitle}
            onChange={(e) => {
              const updated = [...experiences];
              updated[i].roleTitle = e.target.value;
              setExperiences(updated);
            }}
            style={styles.input}
          />

          {exp.bullets.map((b, bi) => (
            <input
              key={bi}
              placeholder={`Bullet ${bi + 1}`}
              value={b}
              onChange={(e) => {
                const updated = [...experiences];
                updated[i].bullets[bi] = e.target.value;
                setExperiences(updated);
              }}
              style={styles.input}
            />
          ))}
        </div>
      ))}

      {/* SAVE */}
      <button onClick={handleSaveResume} style={styles.button}>
        Save Resume
      </button>

      {message && <p>{message}</p>}

      {/* LIVE PREVIEW (AUTO EXPANDS) */}
      <div style={styles.preview}>
        <h2>{fullName || "Your Name"}</h2>
        <p>{summaryText}</p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
          }}
        >
          {skills.map((s, i) => (
            <p key={i}>• {s}</p>
          ))}
        </div>

        {experiences.map((exp, i) => (
          <div key={i}>
            <h3>{exp.companyName}</h3>
            <p>{exp.roleTitle}</p>
            {exp.bullets.map(
              (b, bi) => b && <p key={bi}>• {b}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

const styles: any = {
  page: {
    padding: "30px",
    background: "#000",
    color: "#fff",
    minHeight: "100vh",
  },
  input: {
    display: "block",
    marginBottom: "10px",
    padding: "10px",
    width: "100%",
    background: "#111",
    color: "#fff",
  },
  textarea: {
    display: "block",
    marginBottom: "10px",
    padding: "10px",
    width: "100%",
    height: "100px",
    background: "#111",
    color: "#fff",
  },
  button: {
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
  },
  preview: {
    marginTop: "30px",
    background: "#fff",
    color: "#000",
    padding: "20px",
  },
};
