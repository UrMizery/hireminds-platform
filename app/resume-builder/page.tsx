"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

/* ================= TYPES ================= */

type ResumePlan = "free" | "access" | "premium" | "pro";
type ResumeFont = "Times New Roman" | "Arial" | "Calibri";

type Bullet = { text: string };

type ExperienceItem = {
  companyName: string;
  city: string;
  state: string;
  roleTitle: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isPresent: boolean;
  bullets: Bullet[];
};

type EducationItem = {
  schoolName: string;
  city: string;
  state: string;
  degree: string;
  gpa: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isPresent: boolean;
};

type ResumeSectionKey =
  | "summary"
  | "skills"
  | "experience"
  | "education";

/* ================= HELPERS ================= */

const FREE_BULLET_LIMIT = 4;

function formatDateRange(
  startMonth: string,
  startYear: string,
  endMonth: string,
  endYear: string,
  isPresent: boolean
) {
  const from = [startMonth, startYear].filter(Boolean).join(" ");
  const to = isPresent
    ? "Present"
    : [endMonth, endYear].filter(Boolean).join(" ");
  return `${from} - ${to}`;
}

/* ================= COMPONENT ================= */

export default function ResumeBuilderPage() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [userId, setUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [fontFamily, setFontFamily] =
    useState<ResumeFont>("Times New Roman");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [summaryText, setSummaryText] = useState("");
  const [skillsInput, setSkillsInput] = useState("");

  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      companyName: "",
      city: "",
      state: "",
      roleTitle: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      isPresent: false,
      bullets: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
    },
  ]);

  const [educationItems, setEducationItems] =
    useState<EducationItem[]>([]);

  /* ================= LOAD USER ================= */

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setLoadingUser(false);
        return;
      }

      setUserId(data.user.id);
      setEmail(data.user.email || "");
      setLoadingUser(false);
    }

    loadUser();
  }, []);

  /* ================= DERIVED ================= */

  const skills = useMemo(() => {
    return skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 9);
  }, [skillsInput]);

  /* ================= SAVE ================= */

  async function handleSaveResume() {
    setMessage("");

    if (!userId) return;

    try {
      setSaving(true);

      const { data: profile } = await supabase
        .from("candidate_profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      const { data: resume } = await supabase
        .from("resumes")
        .insert({
          profile_id: profile.id,
          title: "Free Resume",
          summary_text: summaryText,
          skills,
        })
        .select()
        .single();

      await supabase
        .from("candidate_profiles")
        .update({ resume_id: resume.id })
        .eq("id", profile.id);

      setMessage("Saved successfully");
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  /* ================= UI ================= */

  if (loadingUser) return <div>Loading...</div>;

  return (
    <main style={styles.page}>
      {/* PRINT CSS */}
      <style>
        {`
        @media print {
          body * { visibility: hidden; }
          .resumePaper, .resumePaper * { visibility: visible; }
          .resumePaper { position: absolute; top: 0; left: 0; width: 100%; }
        }
      `}
      </style>

      <div style={styles.shell}>
        {/* LEFT */}
        <section style={styles.left}>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
          />

          <textarea
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            placeholder="Summary"
          />

          <input
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="Skills (comma separated)"
          />

          <button onClick={handleSaveResume}>
            {saving ? "Saving..." : "Save"}
          </button>

          <button onClick={handlePrint}>Print</button>

          <p>{message}</p>
        </section>

        {/* RIGHT */}
        <aside style={styles.right}>
          <div
            className="resumePaper"
            style={{ ...styles.resume, fontFamily }}
          >
            <h1>{fullName || "Your Name"}</h1>
            <p>{email}</p>
            <p>{phone}</p>

            {summaryText && <p>{summaryText}</p>}

            {skills.map((s, i) => (
              <p key={i}>• {s}</p>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}

/* ================= STYLES ================= */

const styles: any = {
  page: {
    padding: 20,
    background: "#0f0f10",
    color: "#fff",
  },
  shell: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  left: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  right: {},
  resume: {
    background: "#fff",
    color: "#000",
    padding: 30,
    minHeight: "1122px",
  },
};
