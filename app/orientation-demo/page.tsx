"use client";

import Link from "next/link";
import StudyGuideTimer from "../components/StudyGuideTimer";

export default function OrientationDemoPage() {
  return (
    <main style={styles.main}>
      <section style={styles.card}>
        <p style={styles.kicker}>TWP2026 • Day 1 Demo</p>
        <h1 style={styles.title}>Orientation + Platform Navigation</h1>

        <p style={styles.subtitle}>
          This demo introduces participants to the HireMinds training space,
          course expectations, platform navigation, healthcare career pathway
          goals, and the purpose of the pre-assessment.
        </p>

        <StudyGuideTimer
          module="twp_orientation_demo"
          completionKey="twp_orientation_demo"
          requiredSeconds={30}
        />

        <section style={styles.section}>
          <h2>Training Purpose</h2>
          <p>
            Orientation helps participants understand how the program works,
            what they will complete, how HireMinds supports learning, and how
            each training activity connects to employment preparation.
          </p>
        </section>

        <section style={styles.grid}>
          <div style={styles.box}>
            <h3>Platform Navigation</h3>
            <p>
              Participants learn where to access Career Pathway materials,
              SkillsQuest activities, notes, study guides, assessments, and
              certificates.
            </p>
          </div>

          <div style={styles.box}>
            <h3>Course Expectations</h3>
            <p>
              Participants review attendance expectations, participation,
              practice activities, respectful communication, and completion
              requirements.
            </p>
          </div>

          <div style={styles.box}>
            <h3>Healthcare Pathway Overview</h3>
            <p>
              Participants are introduced to healthcare support roles,
              customer-facing expectations, safety awareness, and career search
              preparation.
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <h2>Learning Objectives</h2>
          <ul>
            <li>Navigate the HireMinds training platform</li>
            <li>Understand the 3-week healthcare career pathway</li>
            <li>Review course expectations and completion steps</li>
            <li>Understand why pre-assessments help measure growth</li>
            <li>Identify how training connects to employment readiness</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2>Mini Reflection</h2>
          <p>
            What is one goal you want to accomplish by the end of this training?
            Think about employment, confidence, resume readiness, interview
            preparation, or learning more about healthcare career options.
          </p>
        </section>

        <Link href="/skillsquest" style={styles.button}>
          Back to Career Pathway
        </Link>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(0,122,255,.22), transparent 35%), linear-gradient(180deg,#050505,#101010)",
    color: "#ffffff",
    padding: 24,
    fontFamily: "system-ui, Arial, sans-serif",
  },
  card: {
    maxWidth: 1050,
    margin: "0 auto",
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 22,
    padding: 26,
    lineHeight: 1.65,
  },
  kicker: {
    color: "#7db7ff",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1.3,
    fontSize: 12,
  },
  title: {
    fontSize: 44,
    margin: "8px 0",
    fontWeight: 950,
  },
  subtitle: {
    color: "rgba(255,255,255,.78)",
    maxWidth: 850,
  },
  section: {
    marginTop: 24,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: 14,
    marginTop: 20,
  },
  box: {
    background: "rgba(0,0,0,.30)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 18,
    padding: 18,
  },
  button: {
    display: "inline-block",
    marginTop: 26,
    background: "#ffffff",
    color: "#000000",
    padding: "12px 16px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 900,
  },
};
