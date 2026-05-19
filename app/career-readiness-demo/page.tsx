"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StudyGuideTimer from "../components/StudyGuideTimer";
import { supabase } from "../lib/supabase";

const questions = [
  {
    question: "What is the purpose of a healthcare-focused resume?",
    options: [
      "To list every job without connecting it to the role",
      "To highlight skills, experience, and training that match healthcare support roles",
      "To avoid mentioning customer service",
    ],
    answer:
      "To highlight skills, experience, and training that match healthcare support roles",
  },
  {
    question: "Why should you read a job description carefully?",
    options: [
      "To identify required skills, keywords, and employer expectations",
      "To copy the whole posting into your resume",
      "To ignore the application instructions",
    ],
    answer: "To identify required skills, keywords, and employer expectations",
  },
  {
    question: "What should a cover letter do?",
    options: [
      "Repeat the entire resume",
      "Introduce you, connect your skills to the role, and show interest",
      "Only say thank you",
    ],
    answer: "Introduce you, connect your skills to the role, and show interest",
  },
  {
    question: "Which behavior shows workplace professionalism?",
    options: [
      "Arriving late without communicating",
      "Ignoring supervisor instructions",
      "Being prepared, respectful, reliable, and accountable",
    ],
    answer: "Being prepared, respectful, reliable, and accountable",
  },
  {
    question: "What is a good interview practice?",
    options: [
      "Prepare examples that explain your skills and experience",
      "Say you have no questions",
      "Avoid discussing your strengths",
    ],
    answer: "Prepare examples that explain your skills and experience",
  },
];

export default function CareerReadinessDemoPage() {
  const [guide1Done, setGuide1Done] = useState(false);
  const [guide2Done, setGuide2Done] = useState(false);
  const [guide3Done, setGuide3Done] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const [participantName, setParticipantName] = useState("Participant");

  useEffect(() => {
    setGuide1Done(localStorage.getItem("twp_career_readiness_demo") === "true");
    setGuide2Done(
      localStorage.getItem("twp_career_readiness_module_2") === "true"
    );
    setGuide3Done(
      localStorage.getItem("twp_career_readiness_module_3") === "true"
    );

    async function loadName() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const fullName =
        session?.user?.user_metadata?.full_name ||
        session?.user?.user_metadata?.fullName ||
        session?.user?.user_metadata?.name ||
        "";

      if (fullName) setParticipantName(String(fullName));
    }

    loadName();
  }, []);

  const assessmentUnlocked = guide1Done && guide2Done && guide3Done;
  const answeredAll = questions.every((_, index) => answers[index]);

  function submitAssessment() {
    let correct = 0;

    questions.forEach((q, index) => {
      if (answers[index] === q.answer) correct += 1;
    });

    const percent = Math.round((correct / questions.length) * 100);
    setScore(percent);

    if (percent >= 80) {
      setPassed(true);
    } else {
      setPassed(false);
    }
  }

  function printCertificate() {
    window.print();
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
          <p style={styles.kicker}>TWP2026 • Day 2 Demo</p>

          <h1 style={styles.title}>Career Readiness Training</h1>

          <p style={styles.subtitle}>
            This training helps participants prepare for healthcare employment by
            connecting their skills, experience, training, and career goals to
            resumes, cover letters, interviews, and workplace expectations.
          </p>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Demo Guide 1</h2>

            <div style={styles.guideCard}>
              <h3 style={styles.guideTitle}>
                Healthcare-Focused Resume Basics
              </h3>

              <p style={styles.guideText}>
                Participants learn how to build a resume that highlights
                customer service, safety awareness, communication, reliability,
                and transferable experience that connects to healthcare support
                roles.
              </p>

              <StudyGuideTimer
                module="twp_career_readiness_demo"
                completionKey="twp_career_readiness_demo"
                requiredSeconds={30}
              />
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Career Readiness Study Guides</h2>

            <div style={styles.guideStack}>
              <div
                style={{
                  ...styles.moduleCard,
                  ...(guide1Done ? styles.completeCard : {}),
                }}
              >
                <div>
                  <h3 style={styles.guideTitle}>
                    Demo Guide 1: Healthcare Resume Basics
                  </h3>
                  <p>
                    Build resume language around healthcare readiness,
                    communication, reliability, customer service, and
                    transferable skills.
                  </p>
                </div>
                <strong>{guide1Done ? "Done" : "In Progress"}</strong>
              </div>

              {guide1Done ? (
                <Link
                  href="/career-readiness-demo/module-2"
                  style={{
                    ...styles.moduleCard,
                    ...(guide2Done ? styles.completeCard : {}),
                  }}
                >
                  <div>
                    <h3 style={styles.guideTitle}>
                      Demo Guide 2: Job Description + Cover Letter
                    </h3>
                    <p>
                      Learn how to read healthcare job postings, identify
                      keywords, and prepare a short cover letter.
                    </p>
                  </div>
                  <strong>{guide2Done ? "Done" : "Start"}</strong>
                </Link>
              ) : (
                <div style={styles.lockedCard}>
                  <div>
                    <h3 style={styles.guideTitle}>
                      Demo Guide 2: Job Description + Cover Letter
                    </h3>
                    <p>Complete Guide 1 to unlock this guide.</p>
                  </div>
                  <strong>Locked</strong>
                </div>
              )}

              {guide2Done ? (
                <Link
                  href="/career-readiness-demo/module-3"
                  style={{
                    ...styles.moduleCard,
                    ...(guide3Done ? styles.completeCard : {}),
                  }}
                >
                  <div>
                    <h3 style={styles.guideTitle}>
                      Demo Guide 3: Interview + Professionalism
                    </h3>
                    <p>
                      Practice interview readiness, professional communication,
                      workplace expectations, and follow-through.
                    </p>
                  </div>
                  <strong>{guide3Done ? "Done" : "Start"}</strong>
                </Link>
              ) : (
                <div style={styles.lockedCard}>
                  <div>
                    <h3 style={styles.guideTitle}>
                      Demo Guide 3: Interview + Professionalism
                    </h3>
                    <p>Complete Guide 2 to unlock this guide.</p>
                  </div>
                  <strong>Locked</strong>
                </div>
              )}
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Apply Knowledge Assessment</h2>

            {!assessmentUnlocked ? (
              <div style={styles.lockedAssessment}>
                Complete all 3 demo guides to unlock the assessment.
              </div>
            ) : (
              <div style={styles.contentBox}>
                <p>
                  Answer all questions. A score of 80% or higher unlocks the
                  certificate preview.
                </p>

                {questions.map((q, index) => (
                  <div key={q.question} style={styles.questionBox}>
                    <h3>
                      {index + 1}. {q.question}
                    </h3>

                    {q.options.map((option) => (
                      <label key={option} style={styles.option}>
                        <input
                          type="radio"
                          name={`question-${index}`}
                          checked={answers[index] === option}
                          onChange={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [index]: option,
                            }))
                          }
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={submitAssessment}
                  disabled={!answeredAll}
                  style={{
                    ...styles.button,
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
              </div>
            )}
          </section>
        </div>

        {passed ? (
          <section style={styles.certificateArea}>
            <div className="no-print" style={styles.nameBox}>
              <label style={styles.nameLabel}>
                Participant Full Name for Certificate
              </label>
              <input
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
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
                  TWP Career Readiness Training
                </h2>

                <p style={styles.certText}>with a passing score of</p>
                <h1 style={styles.certScore}>{score}%</h1>

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
              style={styles.button}
            >
              Print Certificate
            </button>
          </section>
        ) : null}

        <div className="no-print">
          <Link href="/skillsquest" style={styles.secondaryButton}>
            Back to Career Pathway
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
  section: {
    marginTop: 34,
  },
  sectionTitle: {
    fontSize: 28,
    marginBottom: 16,
  },
  contentBox: {
    padding: 24,
    borderRadius: 18,
    background: "rgba(0,0,0,.35)",
    border: "1px solid rgba(255,255,255,.10)",
  },
  guideStack: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  guideCard: {
    padding: 24,
    borderRadius: 18,
    background: "rgba(0,0,0,.35)",
    border: "1px solid rgba(255,255,255,.10)",
  },
  moduleCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    padding: 24,
    borderRadius: 18,
    background: "rgba(0,0,0,.35)",
    border: "1px solid rgba(255,255,255,.10)",
    color: "#fff",
    textDecoration: "none",
  },
  completeCard: {
    background: "rgba(125,255,179,.13)",
    border: "1px solid rgba(125,255,179,.25)",
  },
  lockedCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    padding: 24,
    borderRadius: 18,
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.08)",
    color: "rgba(255,255,255,.45)",
  },
  lockedAssessment: {
    padding: 20,
    borderRadius: 16,
    background: "rgba(255,255,255,.08)",
    color: "rgba(255,255,255,.68)",
    fontWeight: 800,
  },
  guideTitle: {
    color: "#7db7ff",
    fontSize: 24,
    marginBottom: 12,
  },
  guideText: {
    color: "rgba(255,255,255,.82)",
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
  button: {
    display: "inline-block",
    marginTop: 22,
    background: "#fff",
    color: "#000",
    padding: "12px 18px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 900,
    border: "none",
  },
  secondaryButton: {
    display: "inline-block",
    marginTop: 28,
    background: "rgba(255,255,255,.09)",
    color: "#fff",
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
    color: "#fff",
  },
  certificate: {
    background: "#ffffff",
    color: "#000000",
    padding: 28,
    marginTop: 16,
  },
  certBorder: {
    border: "4px double #000",
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
    background: "#000",
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
    background: "#000",
    margin: "8px auto",
  },
  signature: {
    fontSize: 22,
    fontStyle: "italic",
  },
};
