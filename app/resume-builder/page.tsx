"use client";

import { useMemo, useState } from "react";

/* =========================
   TRANSLATIONS
========================= */

const T: any = {
  en: {
    summary: "Summary",
    skills: "Skills",
    experience: "Work Experience",
    education: "Education",
    certifications: "Certifications",
  },
  es: {
    summary: "Resumen",
    skills: "Habilidades",
    experience: "Experiencia",
    education: "Educación",
    certifications: "Certificaciones",
  },
  hi: {
    summary: "सारांश",
    skills: "कौशल",
    experience: "अनुभव",
    education: "शिक्षा",
    certifications: "प्रमाणपत्र",
  },
  pl: {
    summary: "Podsumowanie",
    skills: "Umiejętności",
    experience: "Doświadczenie",
    education: "Edukacja",
    certifications: "Certyfikaty",
  },
};

/* ========================= */

const BULLET_LIMIT = 4;
const SKILL_LIMIT = 9;

export default function ResumeBuilder() {
  const [lang, setLang] = useState("en");
  const t = T[lang];

  const [font, setFont] = useState("Times New Roman");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [summaryTitle, setSummaryTitle] = useState("Summary");
  const [summary, setSummary] = useState("");

  const [skillsInput, setSkillsInput] = useState("");

  const skills = useMemo(() => {
    return skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, SKILL_LIMIT);
  }, [skillsInput]);

  const [experience, setExperience] = useState([
    {
      company: "",
      role: "",
      city: "",
      state: "",
      start: "",
      end: "",
      bullets: ["", "", "", ""],
    },
  ]);

  const [education, setEducation] = useState([
    {
      school: "",
      degree: "",
      city: "",
      state: "",
      start: "",
      end: "",
    },
  ]);

  /* =========================
     HANDLERS
  ========================= */

  function updateExperience(i: number, field: string, value: any) {
    const copy = [...experience];
    (copy[i] as any)[field] = value;
    setExperience(copy);
  }

  function updateBullet(i: number, j: number, value: string) {
    const copy = [...experience];
    copy[i].bullets[j] = value;
    setExperience(copy);
  }

  function addBullet(i: number) {
    const copy = [...experience];
    if (copy[i].bullets.length < BULLET_LIMIT) {
      copy[i].bullets.push("");
      setExperience(copy);
    }
  }

  /* =========================
     UI
  ========================= */

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#000", color: "#fff" }}>
      
      {/* LEFT */}
      <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
        <h2>Resume Builder</h2>

        {/* LANGUAGE */}
        <select onChange={(e) => setLang(e.target.value)}>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="hi">India</option>
          <option value="pl">Polish</option>
        </select>

        {/* FONT */}
        <select onChange={(e) => setFont(e.target.value)}>
          <option>Times New Roman</option>
          <option>Arial</option>
          <option>Calibri</option>
        </select>

        {/* HEADER */}
        <input placeholder="Full Name" onChange={(e) => setFullName(e.target.value)} />
        <input placeholder="Phone" onChange={(e) => setPhone(e.target.value)} />
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="LinkedIn" onChange={(e) => setLinkedin(e.target.value)} />
        <input placeholder="City" onChange={(e) => setCity(e.target.value)} />
        <input placeholder="State" onChange={(e) => setState(e.target.value)} />

        {/* SUMMARY */}
        <input
          value={summaryTitle}
          onChange={(e) => setSummaryTitle(e.target.value)}
        />
        <textarea onChange={(e) => setSummary(e.target.value)} />

        {/* SKILLS */}
        <input
          placeholder="Skills (comma separated max 9)"
          onChange={(e) => setSkillsInput(e.target.value)}
        />

        {/* EXPERIENCE */}
        <h3>{t.experience}</h3>
        {experience.map((exp, i) => (
          <div key={i}>
            <input placeholder="Company" onChange={(e)=>updateExperience(i,"company",e.target.value)} />
            <input placeholder="Role" onChange={(e)=>updateExperience(i,"role",e.target.value)} />

            {exp.bullets.map((b, j) => (
              <input key={j} placeholder={`Bullet ${j+1}`} onChange={(e)=>updateBullet(i,j,e.target.value)} />
            ))}

            {exp.bullets.length < BULLET_LIMIT && (
              <button onClick={() => addBullet(i)}>+ Add Bullet</button>
            )}
          </div>
        ))}

        {/* EDUCATION */}
        <h3>{t.education}</h3>
        {education.map((edu, i) => (
          <div key={i}>
            <input placeholder="School" />
            <input placeholder="Degree" />
          </div>
        ))}
      </div>

      {/* RIGHT PREVIEW */}
      <div style={{
        flex: 1,
        padding: 30,
        background: "#fff",
        color: "#000",
        fontFamily: font,
        overflowY: "auto"
      }}>
        
        {/* HEADER */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontWeight: "bold" }}>{fullName || "Full Name"}</h1>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{phone}</span>
            <span>{email} | {linkedin}</span>
            <span>{city}, {state}</span>
          </div>
        </div>

        {/* SUMMARY */}
        <h2 style={{ textAlign: "center", fontWeight: "bold" }}>{summaryTitle}</h2>
        <p>{summary}</p>

        {/* SKILLS */}
        <h2 style={{ textAlign: "center", fontWeight: "bold" }}>{t.skills}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {skills.map((s, i) => (
            <div key={i}>• {s}</div>
          ))}
        </div>

        {/* EXPERIENCE */}
        <h2 style={{ textAlign: "center", fontWeight: "bold" }}>{t.experience}</h2>
        {experience.map((exp, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{exp.company}</strong>
              <span>{exp.start} - {exp.end}</span>
            </div>
            <p>{exp.role}</p>
            {exp.bullets.map((b, j) => b && <p key={j}>• {b}</p>)}
          </div>
        ))}

        {/* EDUCATION */}
        <h2 style={{ textAlign: "center", fontWeight: "bold" }}>{t.education}</h2>
        {education.map((edu, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{edu.school}</strong>
              <span>{edu.start} - {edu.end}</span>
            </div>
            <p>{edu.degree}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
