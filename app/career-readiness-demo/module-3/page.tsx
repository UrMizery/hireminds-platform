"use client";

import Link from "next/link";
import StudyGuideTimer from "../../components/StudyGuideTimer";

export default function CareerReadinessModuleThreePage() {
  return (
    <main style={styles.main}>
      <section style={styles.card}>
        <p style={styles.kicker}>TWP2026 • Career Readiness • Demo Guide 3</p>

        <h1 style={styles.title}>Interview + Professionalism</h1>

        <p style={styles.subtitle}>
          This guide helps participants prepare for interviews, communicate
          strengths clearly, understand workplace expectations, and show
          professionalism in healthcare support roles.
        </p>

        <StudyGuideTimer
          module="twp_career_readiness_module_3"
          completionKey="twp_career_readiness_module_3"
          requiredSeconds={30}
        />

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Interview Readiness</h2>
          <div style={styles.box}>
            <p>
              Interviews are an opportunity to explain your experience,
              strengths, reliability, and interest in the role. Participants
              should practice answering questions with clear examples instead of
              one-word answers.
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Common Interview Questions</h2>

          <div style={styles.stack}>
            <div style={styles.box}>
              <h3 style={styles.boxTitle}>Tell me about yourself.</h3>
              <p>
                Focus on your work experience, training, strengths, and interest
                in healthcare support work.
              </p>
            </div>

            <div style={styles.box}>
              <h3 style={styles.boxTitle}>
                Why are you interested in this role?
              </h3>
              <p>
                Connect your interest to helping people, supporting safety,
                communication, customer service, and learning healthcare skills.
              </p>
            </div>

            <div style={styles.box}>
              <h3 style={styles.boxTitle}>
                How do you handle difficult situations?
              </h3>
              <p>
                Use an example that shows patience, calm communication,
                problem-solving, and asking for support when needed.
              </p>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Professionalism</h2>
          <div style={styles.box}>
            <p>
              Professionalism includes being on time, communicating clearly,
              following directions, respecting confidentiality, being prepared,
              and taking responsibility for your work.
            </p>

            <ul>
              <li>Arrive on time and prepared</li>
              <li>Communicate respectfully</li>
              <li>Ask questions when unsure</li>
              <li>Follow policies and procedures</li>
              <li>Stay calm and solution-focused</li>
            </ul>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Practice Prompt</h2>
          <div style={styles.discussionBox}>
            <p>
              Write a short answer to this question: “Why would you be a good
              fit for a healthcare support role?”
            </p>
          </div>
        </section>

        <div style={styles.buttons}>
          <Link href="/career-readiness-demo/module-2" style={styles.secondaryButton}>
            Back to Guide 2
          </Link>

          <Link href="/career-readiness-demo" style={styles.button}>
            Return to Assessment →
          </Link>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(0,122,255,.22), transparent 35%), linear-gradient(180deg,#050505,#101010)",
    color: "#fff",
    padding: 24,
    fontFamily: "system-ui, Arial, sans-serif",
  },
  card: {
    maxWidth: 1050,
    margin: "0 auto",
    padding: 30,
    background: "rgba(255,255,255,.06)",
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,.12)",
    lineHeight: 1.7,
  },
  kicker: {
    color: "#7db7ff",
    fontWeight: 900,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.3,
  },
  title: {
    fontSize: 44,
    fontWeight: 950,
    margin: "8px 0",
  },
  subtitle: {
    color: "rgba(255,255,255,.78)",
    maxWidth: 920,
    fontSize: 16,
  },
  section: {
    marginTop: 34,
  },
  sectionTitle: {
    fontSize: 28,
    marginBottom: 16,
  },
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  box: {
    padding: 26,
    borderRadius: 18,
    background: "rgba(0,0,0,.35)",
    border: "1px solid rgba(255,255,255,.10)",
  },
  boxTitle: {
    fontSize: 24,
    marginBottom: 14,
    color: "#7db7ff",
  },
  discussionBox: {
    padding: 22,
    borderRadius: 18,
    background: "rgba(125,183,255,.10)",
    border: "1px solid rgba(125,183,255,.20)",
  },
  buttons: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 28,
  },
  button: {
    display: "inline-block",
    background: "#fff",
    color: "#000",
    padding: "12px 18px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 900,
  },
  secondaryButton: {
    display: "inline-block",
    background: "rgba(255,255,255,.09)",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,.16)",
  },
};
