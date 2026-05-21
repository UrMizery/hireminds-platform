"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const questions = [
  {
    question: "What should a healthcare-focused resume highlight?",
    choices: [
      "Random work history",
      "Skills, training, and experience related to the role",
      "Favorite hobbies only",
    ],
    correct: 1,
  },
  {
    question: "Why should participants read a job description carefully?",
    choices: [
      "To identify keywords, requirements, and employer expectations",
      "To ignore application instructions",
      "To copy the whole posting",
    ],
    correct: 0,
  },
  {
    question: "What should a cover letter do?",
    choices: [
      "Repeat the full resume",
      "Introduce the candidate and connect their skills to the role",
      "Only say thank you",
    ],
    correct: 1,
  },
  {
    question: "Which behavior shows professionalism?",
    choices: [
      "Arriving late without notice",
      "Being reliable, respectful, and prepared",
      "Ignoring instructions",
    ],
    correct: 1,
  },
  {
    question: "What is a strong interview practice?",
    choices: [
      "Prepare examples that explain skills and experience",
      "Give one-word answers",
      "Avoid discussing strengths",
    ],
    correct: 0,
  },
];

export default function CareerReadinessAssessmentPage() {
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const [participantName, setParticipantName] = useState("Participant");
  const [resumeCompleted, setResumeCompleted] = useState(false);

  useEffect(() => {
    async function loadUserName() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const fullName =
        session?.user?.user_metadata?.full_name ||
        session?.user?.user_metadata?.fullName ||
        session?.user?.user_metadata?.name ||
        "";

      if (fullName) {
        setParticipantName(String(fullName));
      }
    }

    loadUserName();

    setResumeCompleted(
      localStorage.getItem("twp_resume_completed") === "true"
    );
  }, []);

  const answeredAll = questions.every((_, index) => answers[index] !== undefined);
  const certificateUnlocked = passed && resumeCompleted;

  function gradeAssessment() {
    let correctCount = 0;

    questions.forEach((question, index) => {
      if (answers[index] === question.correct) {
        correctCount += 1;
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);

    setScore(percent);

    if (percent >= 80) {
      setPassed(true);
      localStorage.setItem("twp_career_readiness_assessment_passed", "true");
    } else {
      setPassed(false);
      localStorage.removeItem("twp_career_readiness_assessment_passed");
    }
  }

  function markResumeCompleted() {
    localStorage.setItem("twp_resume_completed", "true");
    setResumeCompleted(true);
  }

  function resetCareerReadinessDemo() {
    [
      "twp_career_readiness_module_1",
      "twp_career_readiness_module_2",
      "twp_career_readiness_module_3",
      "twp_career_readiness_assessment_passed",
      "twp_resume_completed",
    ].forEach((key) => localStorage.removeItem(key));
  }

  function printCertificate() {
    window.print();
    resetCareerReadinessDemo();
  }

  return (
    <main style={styles.main}>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #certificate-print,
          #certificate-print * {
            visibility: visible;
          }

          #certificate-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <section style={styles.card}>
        <div className="no-print">
          <p style={styles.kicker}>TWP2026 • Career Readiness</p>

          <h1 style={styles.title}>Career Readiness Assessment</h1>

          <p style={styles.subtitle}>
            Complete the assessment with a score of 80% or higher. The
            certificate preview unlocks after the participant passes the
            assessment and confirms their resume is complete.
          </p>

          <section style={styles.resumeBox}>
            <h2 style={styles.sectionTitle}>Resume Completion Check</h2>

            <p>
              Before printing the certificate, confirm that the participant has
              completed their resume activity.
            </p>

            {resumeCompleted ? (
              <strong style={styles.passText}>Resume Completed ✅</strong>
            ) : (
              <button
                type="button"
                onClick={markResumeCompleted}
                style={styles.secondaryButton}
              >
                Mark Resume Complete
              </button>
            )}
          </section>

          <section style={styles.assessmentBox}>
            {questions.map((question, questionIndex) => (
              <div key={question.question} style={styles.questionBox}>
                <h3>
                  {questionIndex + 1}. {question.question}
                </h3>

                {question.choices.map((choice, choiceIndex) => (
                  <label key={choice} style={styles.option}>
                    <input
                      type="radio"
                      name={`question-${questionIndex}`}
                      checked={answers[questionIndex] === choiceIndex}
                      onChange={() => {
                        const updatedAnswers = [...answers];
                        updatedAnswers[questionIndex] = choiceIndex;
                        setAnswers(updatedAnswers);
                      }}
                    />
                    <span>{choice}</span>
                  </label>
                ))}
              </div>
            ))}

            <button
              type="button"
              onClick={gradeAssessment}
              disabled={!answeredAll}
              style={{
                ...styles.primaryButton,
                opacity: answeredAll ? 1 : 0.5,
                cursor: answeredAll ? "pointer" : "not-allowed",
              }}
            >
              Submit Assessment
            </button>

            {score !== null ? (
              <p style={passed ? styles.passText : styles.failText}>
                Score: {score}% — {passed ? "Passed" : "Try again"}
              </p>
            ) : null}
          </section>

          {!certificateUnlocked && score !== null && passed ? (
            <div style={styles.lockedBox}>
              Certificate preview unlocks after resume completion is marked.
            </div>
          ) : null}
        </div>

        {certificateUnlocked ? (
          <section style={styles.certificateArea}>
            <div className="no-print" style={styles.nameBox}>
              <label style={styles.nameLabel}>
                Participant Full Name for Certificate
              </label>

              <input
                value={participantName}
                onChange={(event) => setParticipantName(event.target.value)}
                style={styles.nameInput}
              />
            </div>

            <div id="certificate-print" style={styles.certificate}>
              <div style={styles.certBorder}>
                <p style={styles.certSmall}>CERTIFICATE OF COMPLETION</p>

                <h1 style={styles.certBrand}>HireMinds</h1>
                <h2 style={styles.certSite}>HireMinds.app</h2>

                <p style={styles.certText}>This certifies that</p>

                <h2 style={styles.certName}>
                  {participantName || "Participant"}
                </h2>

                <div style={styles.certLine} />

                <p style={styles.certText}>has successfully completed</p>

                <h2 style={styles.certCourse}>
                 Career Readiness Training
                </h2>

                <p style={styles.certText}>with a passing score of</p>

                <h1 style={styles.certScore}>{score}%</h1>

                <p style={styles.certText}>
                  Resume completion verified through HireMinds demo workflow.
                </p>

                <div style={styles.certFooter}>
                  <div>
                    <strong>{new Date().toLocaleDateString()}</strong>
                    <div style={styles.certFooterLine} />
                    <small>DATE COMPLETED</small>
                  </div>

                  <div>
                    <strong style={styles.signature}>HireMinds.app</strong>
                    <div style={styles.certFooterLine} />
                    <small>AUTHORIZED SIGNATURE</small>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="no-print"
              type="button"
              onClick={printCertificate}
              style={styles.primaryButton}
            >
              Print Certificate
            </button>
          </section>
        ) : null}

        <div className="no-print">
          <Link href="/career-readiness-demo" style={styles.secondaryLink}>
            Back to Career Readiness
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
    color: "#ffffff",
    padding: 24,
    fontFamily: "system-ui, Arial, sans-serif",
  },
  card: {
    maxWidth: 1100,
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
  sectionTitle: {
    fontSize: 26,
    marginBottom: 10,
  },
  resumeBox: {
    marginTop: 28,
    padding: 22,
    borderRadius: 18,
    background: "rgba(125,183,255,.10)",
    border: "1px solid rgba(125,183,255,.20)",
  },
  assessmentBox: {
    marginTop: 28,
    padding: 24,
    borderRadius: 18,
    background: "rgba(0,0,0,.35)",
    border: "1px solid rgba(255,255,255,.10)",
  },
  questionBox: {
    marginTop: 18,
    padding: 18,
    borderRadius: 16,
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.10)",
  },
  option: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  primaryButton: {
    display: "inline-block",
    marginTop: 22,
    background: "#ffffff",
    color: "#000000",
    padding: "12px 18px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 900,
    border: "none",
  },
  secondaryButton: {
    display: "inline-block",
    marginTop: 12,
    background: "rgba(255,255,255,.09)",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: 12,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,.16)",
    cursor: "pointer",
  },
  secondaryLink: {
    display: "inline-block",
    marginTop: 28,
    background: "rgba(255,255,255,.09)",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,.16)",
  },
  passText: {
    color: "#7dffb3",
    fontWeight: 900,
  },
  failText: {
    color: "#ffb3b3",
    fontWeight: 900,
  },
  lockedBox: {
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    background: "rgba(255,255,255,.08)",
    color: "rgba(255,255,255,.72)",
    fontWeight: 800,
  },
  certificateArea: {
    marginTop: 34,
  },
  nameBox: {
    marginBottom: 14,
  },
  nameLabel: {
    display: "block",
    fontWeight: 800,
    marginBottom: 8,
  },
  nameInput: {
    width: "100%",
    maxWidth: 420,
    padding: 12,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,.2)",
    background: "rgba(255,255,255,.08)",
    color: "#ffffff",
  },
  certificate: {
    background: "#ffffff",
    color: "#000000",
    padding: 28,
    marginTop: 16,
  },
  certBorder: {
    border: "4px double #000000",
    minHeight: 620,
    padding: 42,
    textAlign: "center",
  },
  certSmall: {
    letterSpacing: 6,
    fontWeight: 900,
    fontSize: 13,
  },
  certBrand: {
    fontSize: 56,
    margin: "16px 0 4px",
  },
  certSite: {
    fontSize: 20,
    margin: 0,
  },
  certText: {
    marginTop: 28,
    fontSize: 16,
  },
  certName: {
    fontSize: 34,
    margin: "10px 0",
  },
  certLine: {
    width: 170,
    height: 2,
    background: "#000000",
    margin: "0 auto",
  },
  certCourse: {
    fontSize: 26,
    marginTop: 18,
  },
  certScore: {
    fontSize: 42,
    marginTop: 8,
  },
  certFooter: {
    marginTop: 58,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
  },
  certFooterLine: {
    width: 180,
    height: 1,
    background: "#000000",
    margin: "8px auto",
  },
  signature: {
    fontSize: 22,
    fontStyle: "italic",
  },
};
