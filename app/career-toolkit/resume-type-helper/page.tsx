"use client";

import { useMemo, useState } from "react";

type ResumeType = "Chronological" | "Functional" | "Combination" | "Hybrid";

export default function ResumeTypeHelperPage() {
  const [steadyWorkHistory, setSteadyWorkHistory] = useState("");
  const [careerChange, setCareerChange] = useState("");
  const [employmentGaps, setEmploymentGaps] = useState("");
  const [highlightSkillsFirst, setHighlightSkillsFirst] = useState("");

const recommendation = useMemo(() => {
  if (
    steadyWorkHistory === "yes" &&
    highlightSkillsFirst === "yes" &&
    careerChange !== "yes" &&
    employmentGaps !== "yes"
  ) {
    return {
      type: "Hybrid" as ResumeType,
      reason:
        "A hybrid resume is a strong fit when you have steady work history but also want your strongest skills and qualifications highlighted near the top.",
    };
  }

  if (careerChange === "yes" && highlightSkillsFirst === "yes") {
    return {
      type: "Combination" as ResumeType,
      reason:
        "A combination resume works well when you are changing careers and want to highlight transferable skills while still showing your work history.",
    };
  }

  if (employmentGaps === "yes" && highlightSkillsFirst === "yes") {
    return {
      type: "Functional" as ResumeType,
      reason:
        "A functional resume can help when you want to focus more on skills than on gaps in your timeline.",
    };
  }

  if (
    steadyWorkHistory === "yes" &&
    careerChange !== "yes" &&
    employmentGaps !== "yes"
  ) {
    return {
      type: "Chronological" as ResumeType,
      reason:
        "A chronological resume is best when you have a solid work history, recent relevant experience, and want employers to clearly see your timeline.",
    };
  }

  if (
    careerChange === "yes" ||
    employmentGaps === "yes" ||
    highlightSkillsFirst === "yes"
  ) {
    return {
      type: "Combination" as ResumeType,
      reason:
        "A combination resume is often a good fit when you want to balance your strongest skills with your work history.",
    };
  }

  return {
    type: "Chronological" as ResumeType,
    reason:
      "A chronological resume is the most common and employer-friendly option because it is simple and easy to follow.",
  };
}, [steadyWorkHistory, careerChange, employmentGaps, highlightSkillsFirst]);
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.heroCard}>
          <p style={styles.kicker}>Career ToolKit</p>
          <h1 style={styles.title}>Resume Type Helper</h1>
          <p style={styles.subtitle}>
            Learn the difference between chronological, functional, combination,
            and hybrid resumes. Answer a few questions to see which one may fit
            you best.
          </p>

          <div style={styles.heroButtons}>
            <a href="/career-toolkit" style={styles.linkButton}>
              Back to Career ToolKit
            </a>
          </div>
        </section>

        <section style={styles.grid}>
          <div style={styles.card}>
            <p style={styles.sectionKicker}>Questions</p>
            <h2 style={styles.sectionTitle}>Answer these 4 questions</h2>

            <QuestionBlock
              question="Do you have a steady recent work history in the same field?"
              value={steadyWorkHistory}
              onChange={setSteadyWorkHistory}
            />

            <QuestionBlock
              question="Are you changing careers or trying to pivot into a new field?"
              value={careerChange}
              onChange={setCareerChange}
            />

            <QuestionBlock
              question="Do you have employment gaps or limited direct experience?"
              value={employmentGaps}
              onChange={setEmploymentGaps}
            />

            <QuestionBlock
              question="Do you want your strongest skills shown before your job history?"
              value={highlightSkillsFirst}
              onChange={setHighlightSkillsFirst}
            />
          </div>

          <div style={styles.card}>
            <p style={styles.sectionKicker}>Recommendation</p>
            <h2 style={styles.sectionTitle}>{recommendation.type}</h2>
            <p style={styles.resultText}>{recommendation.reason}</p>

            <div style={styles.infoWrap}>
              <InfoCard
                title="Chronological Resume"
                text="Best for people with consistent work history, recent experience, and a clear job timeline."
              />
              <InfoCard
                title="Functional Resume"
                text="Best for people who want to highlight transferable skills, limited experience, or employment gaps."
              />
              <InfoCard
                title="Combination Resume"
                text="Best for people who want to highlight skills and still show a work timeline."
              />
              <InfoCard
                title="Hybrid Resume"
                text="Best for people who want a more flexible structure that blends strengths, projects, and work history."
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function QuestionBlock({
  question,
  value,
  onChange,
}: {
  question: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div style={styles.questionCard}>
      <p style={styles.questionText}>{question}</p>
      <div style={styles.answerRow}>
        <button
          type="button"
          onClick={() => onChange("yes")}
          style={{
            ...styles.answerButton,
            ...(value === "yes" ? styles.answerButtonActive : {}),
          }}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange("no")}
          style={{
            ...styles.answerButton,
            ...(value === "no" ? styles.answerButtonActive : {}),
          }}
        >
          No
        </button>
      </div>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div style={styles.infoCard}>
      <h3 style={styles.infoTitle}>{title}</h3>
      <p style={styles.infoText}>{text}</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
    color: "#e7e7e7",
    padding: "32px 24px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  shell: {
    maxWidth: "1320px",
    margin: "0 auto",
    display: "grid",
    gap: "24px",
  },
  heroCard: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    alignItems: "start",
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
    fontSize: "40px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  subtitle: {
    margin: 0,
    color: "#c8c8c8",
    fontSize: "16px",
    lineHeight: 1.7,
    maxWidth: "900px",
  },
  heroButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "18px",
    flexWrap: "wrap",
  },
  linkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    padding: "12px 16px",
    borderRadius: "16px",
    border: "1px solid #3a3a3a",
    background: "#111111",
    color: "#f5f5f5",
    fontWeight: 700,
  },
  sectionKicker: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  sectionTitle: {
    margin: "0 0 16px",
    fontSize: "30px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  questionCard: {
    background: "#101010",
    border: "1px solid #2d2d2d",
    borderRadius: "18px",
    padding: "18px",
    marginBottom: "14px",
  },
  questionText: {
    margin: "0 0 12px",
    color: "#f5f5f5",
    fontSize: "16px",
    lineHeight: 1.6,
  },
  answerRow: {
    display: "flex",
    gap: "10px",
  },
  answerButton: {
    padding: "10px 16px",
    borderRadius: "14px",
    border: "1px solid #3a3a3a",
    background: "#111111",
    color: "#f5f5f5",
    fontWeight: 600,
    cursor: "pointer",
  },
  answerButtonActive: {
    background: "#d4d4d8",
    color: "#09090b",
    border: "1px solid #d4d4d8",
  },
  resultText: {
    margin: "0 0 18px",
    color: "#c8c8c8",
    fontSize: "16px",
    lineHeight: 1.7,
  },
  infoWrap: {
    display: "grid",
    gap: "12px",
  },
  infoCard: {
    background: "#101010",
    border: "1px solid #2d2d2d",
    borderRadius: "18px",
    padding: "16px",
  },
  infoTitle: {
    margin: "0 0 8px",
    fontSize: "20px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  infoText: {
    margin: 0,
    color: "#c8c8c8",
    fontSize: "15px",
    lineHeight: 1.7,
  },
};
