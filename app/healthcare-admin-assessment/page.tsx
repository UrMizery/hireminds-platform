"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Question = {
  id: number;
  section: string;
  question: string;
  options: string[];
  correct: string;
};

const REQUIRED_REFERRAL_CODE = "TWP2026";

const questions: Question[] = [
  {
    id: 1,
    section: "Patient Intake",
    question: "What is one of the first responsibilities during patient intake?",
    options: [
      "Verify patient information",
      "Give medical advice",
      "Diagnose symptoms",
      "Ignore appointment details",
    ],
    correct: "Verify patient information",
  },
  {
    id: 2,
    section: "Patient Intake",
    question: "Why is patient intake important?",
    options: [
      "It sets the tone for the patient experience",
      "It replaces the provider’s visit",
      "It is only for billing",
      "It does not affect patient care",
    ],
    correct: "It sets the tone for the patient experience",
  },
  {
    id: 3,
    section: "HIPAA & Privacy",
    question: "What does HIPAA protect?",
    options: [
      "Patient health information",
      "Employee lunch schedules",
      "Office decorations",
      "Public social media posts",
    ],
    correct: "Patient health information",
  },
  {
    id: 4,
    section: "HIPAA & Privacy",
    question: "When should patient information be shared?",
    options: [
      "Only with authorized individuals",
      "Anytime someone asks",
      "With anyone in the waiting room",
      "Only if the patient seems friendly",
    ],
    correct: "Only with authorized individuals",
  },
  {
    id: 5,
    section: "HIPAA & Privacy",
    question: "What should you do before discussing patient information?",
    options: [
      "Verify identity",
      "Speak louder",
      "Skip documentation",
      "Ask another patient",
    ],
    correct: "Verify identity",
  },
  {
    id: 6,
    section: "Scheduling",
    question: "What is a key responsibility when scheduling appointments?",
    options: [
      "Avoid double booking unless instructed",
      "Schedule everyone at the same time",
      "Ignore provider availability",
      "Delete appointment notes",
    ],
    correct: "Avoid double booking unless instructed",
  },
  {
    id: 7,
    section: "Scheduling",
    question: "Why is accurate scheduling important?",
    options: [
      "It impacts patient care and office workflow",
      "It only matters to the receptionist",
      "It has no effect on patients",
      "It prevents all medical emergencies",
    ],
    correct: "It impacts patient care and office workflow",
  },
  {
    id: 8,
    section: "Insurance Basics",
    question: "What is the best approach when patients have insurance questions?",
    options: [
      "Guide and clarify professionally",
      "Guess the answer",
      "Tell them it is not your problem",
      "Avoid responding",
    ],
    correct: "Guide and clarify professionally",
  },
  {
    id: 9,
    section: "Insurance Basics",
    question: "How should you respond if a patient is frustrated about coverage?",
    options: [
      "Stay calm and professional",
      "Argue with the patient",
      "Make promises about coverage",
      "Dismiss their concerns",
    ],
    correct: "Stay calm and professional",
  },
  {
    id: 10,
    section: "Professional Communication",
    question: "What matters most when communicating with patients?",
    options: [
      "Tone, clarity, and respect",
      "Rushing through information",
      "Using confusing language",
      "Avoiding eye contact",
    ],
    correct: "Tone, clarity, and respect",
  },
  {
    id: 11,
    section: "Professional Communication",
    question: "How should you handle anxious or upset patients?",
    options: [
      "Remain calm and reassuring",
      "Match their frustration",
      "Ignore them",
      "Tell them to come back later",
    ],
    correct: "Remain calm and reassuring",
  },
];

export default function HealthcareAdminAssessmentPage() {
  const [ready, setReady] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    setStudyComplete(localStorage.getItem("healthcareAdminStudyComplete") === "true");
    const storedCode = localStorage.getItem("hireminds_referral_code") || "";
    if (storedCode) setReferralCode(storedCode.toUpperCase());
    setReady(true);
  }, []);

  const score = useMemo(() => {
    return questions.reduce(
      (total, q) => (answers[q.id] === q.correct ? total + 1 : total),
      0
    );
  }, [answers]);

  const percentage = Math.round((score / questions.length) * 100);
  const passed = percentage >= 80;

  const sectionBreakdown = useMemo(() => {
    const sections = Array.from(new Set(questions.map((q) => q.section)));

    return sections.map((section) => {
      const sectionQuestions = questions.filter((q) => q.section === section);
      const correct = sectionQuestions.reduce(
        (count, q) => (answers[q.id] === q.correct ? count + 1 : count),
        0
      );
      const total = sectionQuestions.length;
      const pct = Math.round((correct / total) * 100);

      return {
        section,
        correct,
        total,
        pct,
        status: pct >= 80 ? "Strong" : pct >= 60 ? "Review" : "Focus Area",
      };
    });
  }, [answers]);

  const weakAreas = sectionBreakdown.filter((s) => s.pct < 80);

  const resultTitle = useMemo(() => {
    if (score <= 4) return "Healthcare Admin Explorer";
    if (score <= 7) return "Healthcare Admin Ready";
    if (score <= 9) return "Healthcare Admin Career Track";
    return "HireMinds Healthcare Admin Path";
  }, [score]);

  const recommendedPaths = useMemo(() => {
    if (score <= 4) {
      return ["Healthcare Front Desk Trainee", "Patient Services Support", "Administrative Support"];
    }
    if (score <= 7) {
      return ["Medical Front Desk", "Patient Intake Assistant", "Scheduling Assistant"];
    }
    if (score <= 9) {
      return ["Patient Access Representative", "Medical Administrative Assistant", "Insurance Verification Assistant"];
    }
    return ["Patient Access Coordinator", "Healthcare Administrative Specialist", "Medical Office Coordinator"];
  }, [score]);

  async function reportResults() {
    if (reported) return;

    try {
      await fetch("/api/skillsquest/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          referralCode,
          module: "healthcare_admin_basics",
          eventType: "assessment_submitted",
          score,
          percentage,
          passed,
          certificateEarned: passed,
          details: {
            sectionBreakdown,
            weakAreas: weakAreas.map((w) => w.section),
            answers,
          },
        }),
      });

      setReported(true);
    } catch {
      // reporting should not block the participant
    }
  }

  function unlockAssessment() {
    if (!fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (referralCode.trim().toUpperCase() !== REQUIRED_REFERRAL_CODE) {
      alert("This assessment is only available to approved TWP2026 referral participants.");
      return;
    }

    setUnlocked(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleAnswer(id: number, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function submitAssessment() {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      reportResults();
    }, 200);
  }

  function resetAssessment() {
    setAnswers({});
    setSubmitted(false);
    setReported(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function printCertificate() {
    window.print();
  }

  if (!ready) {
    return <main style={styles.main}>Loading...</main>;
  }

  if (!studyComplete) {
    return (
      <main style={styles.main}>
        <section style={styles.lockCard}>
          <p style={styles.kicker}>Study Guide Required</p>
          <h1 style={styles.title}>Complete the Healthcare Admin Study Guide First</h1>
          <p style={styles.subtitle}>
            You must complete the Healthcare Admin Basics study guide timer before starting the assessment.
          </p>
          <Link href="/healthcare-admin-study" style={styles.primaryBtn}>
            Open Study Guide
          </Link>
          <Link href="/skillsquest" style={styles.linkBtn}>
            Back to SkillsQuest
          </Link>
        </section>
      </main>
    );
  }

  if (!unlocked) {
    return (
      <main style={styles.main}>
        <section style={styles.lockCard}>
          <p style={styles.kicker}>HireMinds Healthcare Pathway</p>
          <h1 style={styles.title}>Healthcare Admin Basics Assessment</h1>
          <p style={styles.subtitle}>
            This assessment is available to participants with referral code TWP2026.
          </p>

          <input
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Email optional, for reporting"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Referral Code"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          />

          <button type="button" style={styles.primaryBtn} onClick={unlockAssessment}>
            Start Assessment
          </button>

          <Link href="/healthcare-admin-study" style={styles.linkBtn}>
            Study Guide
          </Link>
        </section>
      </main>
    );
  }

  if (submitted) {
    return (
      <main style={styles.main}>
        <section style={styles.resultCard}>
          <p style={styles.kicker}>Assessment Results</p>
          <h1 style={styles.title}>{resultTitle}</h1>

          <div style={styles.scoreGrid}>
            <div style={styles.scoreBox}>
              <span style={styles.scoreLabel}>Participant</span>
              <strong>{fullName}</strong>
            </div>
            <div style={styles.scoreBox}>
              <span style={styles.scoreLabel}>Score</span>
              <strong>
                {score}/{questions.length}
              </strong>
            </div>
            <div style={styles.scoreBox}>
              <span style={styles.scoreLabel}>Certificate Score</span>
              <strong>{percentage}%</strong>
            </div>
          </div>

          <h2 style={styles.sectionTitle}>Section Breakdown</h2>
          <div style={styles.pathGrid}>
            {sectionBreakdown.map((s) => (
              <div key={s.section} style={styles.pathCard}>
                <strong>{s.section}</strong>
                <br />
                {s.correct}/{s.total} correct — {s.pct}%
                <br />
                <span>{s.status}</span>
              </div>
            ))}
          </div>

          {weakAreas.length ? (
            <>
              <h2 style={styles.sectionTitle}>Focus Areas</h2>
              <p style={styles.resultText}>
                Review: {weakAreas.map((w) => w.section).join(", ")}. Return to the study guide and focus on these sections before retaking.
              </p>
            </>
          ) : (
            <>
              <h2 style={styles.sectionTitle}>Strong Performance</h2>
              <p style={styles.resultText}>
                You scored 80% or higher in every Healthcare Admin section.
              </p>
            </>
          )}

          <h2 style={styles.sectionTitle}>Correct vs. Your Answer</h2>
          <div style={styles.reviewList}>
            {questions.map((q) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correct;

              return (
                <div key={q.id} style={styles.reviewCard}>
                  <strong>
                    Q{q.id}. {q.question}
                  </strong>
                  <p style={styles.reviewLine}>
                    Your Answer:{" "}
                    <span style={isCorrect ? styles.correctText : styles.wrongText}>
                      {String(userAnswer || "No answer")} {isCorrect ? "✓" : "✗"}
                    </span>
                  </p>
                  {!isCorrect ? (
                    <p style={styles.reviewLine}>
                      Correct Answer: <span style={styles.correctText}>{q.correct}</span>
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <h2 style={styles.sectionTitle}>Recommended Career Paths</h2>
          <div style={styles.pathGrid}>
            {recommendedPaths.map((path) => (
              <div key={path} style={styles.pathCard}>
                ✓ {path}
              </div>
            ))}
          </div>

          {passed ? (
            <>
              <h2 style={styles.passText}>Certificate of Completion Unlocked</h2>

              <div style={styles.certificate} className="certificate-print">
                <div style={styles.certBorder}>
                  <img src="/hireminds-logo.png" alt="HireMinds Logo" style={styles.certWatermark} />

                  <p style={styles.certSmall}>Certificate of Completion</p>
                  <h1 style={styles.certTitle}>HireMinds</h1>
                  <p style={styles.certWebsite}>HireMinds.app</p>

                  <p style={styles.certText}>This certifies that</p>
                  <h2 style={styles.certName}>{fullName.trim() || "Participant"}</h2>

                  <p style={styles.certText}>has successfully completed</p>
                  <h3 style={styles.certCourse}>Healthcare Admin Basics Assessment</h3>

                  <p style={styles.certText}>with a passing score of</p>
                  <h2 style={styles.certScore}>{percentage}%</h2>

                  <div style={styles.certFooter}>
                    <div>
                      <p style={styles.certLine}>{new Date().toLocaleDateString()}</p>
                      <p style={styles.certLabel}>Date Completed</p>
                    </div>

                    <div>
                      <p style={styles.scriptSignature}>HireMinds.app</p>
                      <p style={styles.certLabel}>Authorized Signature</p>
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" style={styles.primaryBtn} onClick={printCertificate}>
                Print Certificate / Save as PDF
              </button>
            </>
          ) : (
            <>
              <h2 style={styles.failText}>Certificate Not Unlocked</h2>
              <p style={styles.resultText}>
                You need 80% or higher to receive a certificate.
              </p>
              <div style={styles.retakeBox}>
                <strong>Retake Suggestions:</strong>
                <ul>
                  <li>Review your weak areas listed above.</li>
                  <li>Return to the Healthcare Admin Basics study guide.</li>
                  <li>Retake the assessment after reviewing.</li>
                </ul>
              </div>
              <Link href="/healthcare-admin-study" style={styles.linkBtn}>
                Return to Study Guide
              </Link>
            </>
          )}

          <button type="button" style={styles.secondaryBtn} onClick={resetAssessment}>
            Retake Assessment
          </button>
        </section>

        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden !important;
            }

            .certificate-print,
            .certificate-print * {
              visibility: visible !important;
            }

            .certificate-print {
              position: fixed !important;
              left: 0.5in !important;
              top: 0.5in !important;
              width: 10in !important;
              height: 7.5in !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              overflow: hidden !important;
              background: #f7f7f4 !important;
            }

            @page {
              size: letter landscape;
              margin: 0;
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <div>
          <p style={styles.kicker}>HireMinds Assessment</p>
          <h1 style={styles.title}>Healthcare Admin Basics Assessment</h1>
          <p style={styles.subtitle}>
            Answer all questions. Score 80% or higher to unlock a certificate.
          </p>
        </div>

        <Link href="/healthcare-admin-study" style={styles.secondaryBtn}>
          Study Guide
        </Link>
      </section>

      <section style={styles.assessmentCard}>
        {questions.map((q) => (
          <div key={q.id} style={styles.questionCard}>
            <div style={styles.questionTop}>
              <span style={styles.badge}>{q.section}</span>
              <span style={styles.questionNumber}>Question {q.id}</span>
            </div>

            <h3 style={styles.questionText}>{q.question}</h3>

            <div style={styles.optionGrid}>
              {q.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswer(q.id, option)}
                  style={{
                    ...styles.optionBtn,
                    ...(answers[q.id] === option ? styles.selected : {}),
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button type="button" style={styles.submitBtn} onClick={submitAssessment}>
          Submit Assessment
        </button>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(0,122,255,.25), transparent 35%), linear-gradient(180deg,#050505,#111)",
    color: "#fff",
    fontFamily: "system-ui, Arial, sans-serif",
    padding: 24,
  },
  hero: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
    flexWrap: "wrap",
    padding: "28px 0",
  },
  kicker: {
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontSize: 12,
    color: "#7db7ff",
    fontWeight: 800,
    margin: 0,
  },
  title: {
    fontSize: 40,
    lineHeight: 1.05,
    margin: "10px 0",
    fontWeight: 950,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,.78)",
    maxWidth: 720,
    lineHeight: 1.6,
  },
  lockCard: {
    maxWidth: 720,
    margin: "60px auto",
    padding: 28,
    borderRadius: 22,
    background: "rgba(255,255,255,.075)",
    border: "1px solid rgba(255,255,255,.14)",
  },
  input: {
    width: "100%",
    padding: 14,
    marginBottom: 14,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.18)",
    background: "rgba(0,0,0,.35)",
    color: "#fff",
    fontSize: 15,
  },
  primaryBtn: {
    background: "#fff",
    color: "#000",
    padding: "13px 16px",
    borderRadius: 12,
    fontWeight: 900,
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    marginTop: 10,
    display: "inline-block",
  },
  secondaryBtn: {
    background: "rgba(255,255,255,.09)",
    color: "#fff",
    padding: "13px 16px",
    borderRadius: 12,
    fontWeight: 800,
    textDecoration: "none",
    border: "1px solid rgba(255,255,255,.16)",
    cursor: "pointer",
    marginTop: 10,
    display: "inline-block",
  },
  linkBtn: {
    display: "block",
    marginTop: 16,
    color: "#8cc4ff",
    fontWeight: 800,
    textDecoration: "none",
  },
  assessmentCard: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gap: 14,
  },
  questionCard: {
    padding: 18,
    borderRadius: 18,
    background: "rgba(255,255,255,.075)",
    border: "1px solid rgba(255,255,255,.12)",
  },
  questionTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  badge: {
    background: "rgba(125,183,255,.15)",
    color: "#b8dcff",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
  },
  questionNumber: {
    color: "rgba(255,255,255,.6)",
    fontSize: 12,
    fontWeight: 800,
  },
  questionText: {
    margin: "0 0 12px",
    fontSize: 19,
  },
  optionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 10,
  },
  optionBtn: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.15)",
    background: "rgba(0,0,0,.3)",
    color: "#fff",
    cursor: "pointer",
    textAlign: "left",
    fontWeight: 700,
  },
  selected: {
    background: "#fff",
    color: "#000",
    borderColor: "#fff",
  },
  submitBtn: {
    padding: 15,
    borderRadius: 14,
    border: "none",
    background: "#fff",
    color: "#000",
    fontWeight: 950,
    cursor: "pointer",
    marginBottom: 40,
  },
  resultCard: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: 26,
    borderRadius: 22,
    background: "rgba(255,255,255,.08)",
    border: "1px solid rgba(255,255,255,.13)",
  },
  scoreGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
    gap: 12,
    marginTop: 18,
  },
  scoreBox: {
    background: "rgba(0,0,0,.32)",
    padding: 16,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,.1)",
  },
  scoreLabel: {
    display: "block",
    color: "rgba(255,255,255,.65)",
    fontSize: 13,
    marginBottom: 6,
  },
  sectionTitle: {
    marginTop: 24,
  },
  pathGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
    gap: 10,
  },
  pathCard: {
    padding: 12,
    borderRadius: 14,
    background: "rgba(125,183,255,.13)",
    border: "1px solid rgba(125,183,255,.20)",
    fontWeight: 800,
  },
  reviewList: {
    display: "grid",
    gap: 10,
  },
  reviewCard: {
    padding: 14,
    borderRadius: 14,
    background: "rgba(0,0,0,.30)",
    border: "1px solid rgba(255,255,255,.10)",
  },
  reviewLine: {
    margin: "8px 0 0",
    color: "rgba(255,255,255,.82)",
  },
  correctText: {
    color: "#7dffb3",
    fontWeight: 900,
  },
  wrongText: {
    color: "#ff9d9d",
    fontWeight: 900,
  },
  passText: {
    color: "#7dffb3",
    marginTop: 24,
  },
  failText: {
    color: "#ff9d9d",
    marginTop: 24,
  },
  resultText: {
    color: "rgba(255,255,255,.8)",
    lineHeight: 1.65,
  },
  retakeBox: {
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    background: "rgba(255,255,255,.07)",
    border: "1px solid rgba(255,255,255,.12)",
    color: "rgba(255,255,255,.86)",
  },
  certificate: {
    width: "100%",
    maxWidth: "820px",
    aspectRatio: "11 / 8.5",
    margin: "20px auto 18px",
    padding: 12,
    borderRadius: 16,
    background: "#f7f7f4",
    color: "#000",
    textAlign: "center",
    boxShadow: "0 18px 50px rgba(0,0,0,.35)",
    boxSizing: "border-box",
  },
  certBorder: {
    position: "relative",
    width: "100%",
    height: "100%",
    border: "6px double #111",
    padding: 28,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  certWatermark: {
    position: "absolute",
    width: "330px",
    maxWidth: "50%",
    opacity: 0.08,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 0,
  },
  certSmall: {
    position: "relative",
    zIndex: 1,
    textTransform: "uppercase",
    letterSpacing: 3,
    fontWeight: 900,
    fontSize: 12,
    margin: 0,
  },
  certTitle: {
    position: "relative",
    zIndex: 1,
    fontSize: 44,
    margin: "4px 0 0",
    fontWeight: 950,
  },
  certWebsite: {
    position: "relative",
    zIndex: 1,
    margin: "0 0 14px",
    fontWeight: 800,
    letterSpacing: 1.5,
  },
  certText: {
    position: "relative",
    zIndex: 1,
    fontSize: 15,
    margin: "5px 0",
    color: "#333",
  },
  certName: {
    position: "relative",
    zIndex: 1,
    fontSize: 30,
    margin: "6px 0",
    borderBottom: "2px solid #111",
    padding: "0 24px 5px",
    fontWeight: 900,
  },
  certCourse: {
    position: "relative",
    zIndex: 1,
    fontSize: 20,
    margin: "5px 0",
    fontWeight: 900,
  },
  certScore: {
    position: "relative",
    zIndex: 1,
    fontSize: 28,
    margin: "3px 0",
    fontWeight: 950,
  },
  certFooter: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 24,
    marginTop: 20,
  },
  certLine: {
    borderBottom: "1px solid #111",
    minWidth: 150,
    paddingBottom: 5,
    margin: 0,
    fontWeight: 800,
  },
  certLabel: {
    margin: "6px 0 0",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#444",
  },
  scriptSignature: {
    fontFamily: "Brush Script MT, Segoe Script, cursive",
    fontSize: 28,
    borderBottom: "1px solid #111",
    minWidth: 180,
    paddingBottom: 4,
    margin: 0,
  },
};
