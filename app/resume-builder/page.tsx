"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

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

type CertificateItem = {
  organizationName: string;
  city: string;
  state: string;
  certificateName: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isPresent: boolean;
};

type VolunteerItem = {
  organizationName: string;
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

type ResumeSectionKey =
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "certifications"
  | "volunteer"
  | "accomplishments";

const FREE_BULLET_LIMIT = 4;
const PAID_BULLET_LIMIT = 6;
const FREE_SKILL_LIMIT = 9;

function moveItem<T>(arr: T[], index: number, direction: "up" | "down") {
  const updated = [...arr];
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (nextIndex < 0 || nextIndex >= arr.length) return arr;
  [updated[index], updated[nextIndex]] = [
    updated[nextIndex],
    updated[index],
  ];
  return updated;
}

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

  if (!from && !to) return "";

  // ✅ FIXED
  return `${from || "Start"} - ${to || "End"}`;
}

function skillsColumnCount(count: number) {
  if (count >= 7) return 3;
  if (count >= 4) return 2;
  return 1;
}

export default function ResumeBuilderPage() {
  const [plan, setPlan] = useState<ResumePlan>("free");
  const [skillsInput, setSkillsInput] = useState("");

  const skills = useMemo(() => {
    return skillsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, FREE_SKILL_LIMIT);
  }, [skillsInput]);

  return (
    <main style={{ padding: 40 }}>
      <h1>Resume Builder</h1>

      {/* PLAN */}
      <select
        value={plan}
        onChange={(e) => setPlan(e.target.value as ResumePlan)}
      >
        <option value="free">Free</option>
        <option value="access">Resume Access</option>
        <option value="premium">Premium</option>
        <option value="pro">Pro</option>
      </select>

      {/* SKILLS */}
      <input
        value={skillsInput}
        onChange={(e) => setSkillsInput(e.target.value)}
        placeholder="Skills"
      />

      {/* PREVIEW */}
      <div>
        {skills.map((skill, i) => (
          <p key={i}>• {skill}</p>
        ))}
      </div>

      {/* GRID FIX */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${skillsColumnCount(
            skills.length
          )}, 1fr)`,
        }}
      ></div>

      {/* BULLET FIX */}
      <label>{`Bullet ${1}`}</label>

      {/* GPA FIX */}
      <p>{`GPA: 3.5`}</p>
    </main>
  );
}
