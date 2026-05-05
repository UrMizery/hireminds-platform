"use client";

import React from "react";

const REQUIRED_SECONDS = 180;
const COMPLETION_KEY = "nhp_career_readiness_study_complete";
const PASSED_KEY = "nhp_career_readiness_assessment_passed";
const SCORE_KEY = "nhp_career_readiness_score";

const questions = [
  {
    question: "What is career readiness?",
    options: [
      "Only knowing how to write a resume",
      "Being prepared with the skills, habits, and communication needed for work",
      "Only applying to jobs online",
      "Avoiding interviews",
    ],
    answer:
      "Being prepared with the skills, habits, and communication needed for work",
  },
  {
    question: "Which skill is most connected to workplace reliability?",
    options: [
      "Ignoring messages",
      "Showing up on time and communicating early",
      "Waiting for someone else to solve everything",
      "Changing jobs without notice",
    ],
    answer: "Showing up on time and communicating early",
  },
  {
    question: "Why should you tailor your resume?",
    options: [
      "To match your skills to the job description",
      "To make it look random",
      "To remove important experience",
      "To avoid using keywords",
    ],
    answer: "To match your skills to the job description",
  },
  {
    question: "What should you do if you do not understand a task at work?",
    options: [
      "Guess and hope it is right",
      "Ask a respectful clarifying question",
      "Ignore it",
      "Wait until someone complains",
    ],
    answer: "Ask a respectful clarifying question",
  },
  {
    question: "Which is an example of professional follow-through?",
    options: [
      "Not responding after an interview",
      "Following up politely after applying or interviewing",
      "Missing employer calls",
      "Submitting incomplete applications",
    ],
    answer: "Following up politely after applying or interviewing",
  },
];

const topSkills = [
  {
    title: "Reliability",
    text: "Employers value people who show up on time, communicate early, and follow through on tasks.",
  },
  {
    title: "Communication",
    text: "Strong communication means listening, asking questions, using respectful language, and responding professionally.",
  },
  {
    title: "Professionalism",
    text: "Professionalism includes attitude, appearance, accountability, workplace behavior, and how you represent yourself.",
  },
  {
    title: "Resume Alignment",
    text: "A strong resume connects your experience and training to the exact skills employers are asking for.",
  },
];

const bottomSkills = [
  {
    title: "Interview Readiness",
    text: "Being interview-ready means knowing how to explain your strengths, goals, experience, and interest in the role.",
  },
  {
    title: "Problem Solving",
    text: "Career-ready workers stay calm, think through options, and know when to ask for support.",
  },
  {
    title: "Adaptability",
    text: "Workplaces change. Adaptability helps you adjust to new tasks, schedules, tools, and expectations.",
  },
  {
    title: "Growth Mindset",
    text: "A growth mindset means you are willing to learn, accept feedback, and keep improving.",
  },
];

export default function NHPCareerReadinessPage() {
  const [secondsLeft, setSecondsLeft] = React.useState(REQUIRED_SECONDS);
  const [studyComplete, setStudyComplete] = React.useState(false);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [score, setScore] = React.useState<number | null>(null);
  const [passed, setPassed] = React.useState(false);
  const [participantName, setParticipantName] = React.useState("Participant");

  React.useEffect(() => {
    const savedComplete = localStorage.getItem(COMPLETION_KEY) === "true";
    const savedPassed = localStorage.getItem(PASSED_KEY) === "true";
    const savedScore = localStorage.getItem(SCORE_KEY);

    if (savedComplete) {
      setStudyComplete(true);
      setSecondsLeft(0);
    }

    if (savedPassed) setPassed(true);
    if (savedScore) setScore(Number(savedScore));
  }, []);

  React.useEffect(() => {
    if (studyComplete) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          localStorage.setItem(COMPLETION_KEY, "true");
          setStudyComplete(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [studyComplete]);

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${String(secs).padStart(2, "0")}`;
  }

  function handleAnswer(index: number, answer: string) {
    setAnswers((prev) => ({ ...prev, [index]: answer }));
  }

  function submitAssessment() {
    let correct = 0;

    questions.forEach((q, index) => {
      if (answers[index] === q.answer) correct += 1;
    });

    const percent = Math.round((correct / questions.length) * 100);
    setScore(percent);
    localStorage.setItem(SCORE_KEY, String(percent));

    if (percent >= 80) {
      setPassed(true);
      localStorage.setItem(PASSED_KEY, "true");
    } else {
      setPassed(false);
      localStorage.removeItem(PASSED_KEY);
    }
  }

  function resetDemo() {
    localStorage.removeItem(COMPLETION_KEY);
    localStorage.removeItem(PASSED_KEY);
    localStorage.removeItem(SCORE_KEY);

    setSecondsLeft(REQUIRED_SECONDS);
    setStudyComplete(false);
    setAnswers({});
    setScore(null);
    setPassed(false);
  }

  function printCertificate() {
    window.print();
  }

  const answeredAll = questions.every((_, index) => answers[index]);
  const progress =
    ((REQUIRED_SECONDS - secondsLeft) / REQUIRED_SECONDS) * 100;

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

      <section style={styles.wrapper}>
        <div className="no-print" style={styles.hero}>
          <p style={styles.kicker}>NHP2026 Career Pathway • Study Guide</p>
          <h1 style={styles.title}>Career Readiness</h1>
          <p style={styles.subtitle}>
            This training prepares participants to understand workplace
            expectations, communicate professionally, connect their skills to
            job opportunities, and move through the employment process with
            confidence.
          </p>

          <div style={styles.timerBox}>
            <div>
              <strong>
                {studyComplete
                  ? "Study Guide Complete"
                  : `Required Time Remaining: ${formatTime(secondsLeft)}`}
              </strong>
              <p style={styles.smallText}>
                Timer must reach 0:00 before the assessment unlocks. If the page
                is closed before completion, the timer will restart.
              </p>
            </div>

            <button type="button" onClick={resetDemo} style={styles.resetButton}>
              Reset Demo
            </button>
          </div>

          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
        </div>

        <section className="no-print" style={styles.contentCard}>
          <h2 style={styles.sectionTitle}>Why Career Readiness Matters</h2>
          <p style={styles.bodyText}>
            Career readiness is more than getting a job. It is the ability to
            prepare, apply, communicate, interview, and succeed once hired. Many
            participants already have valuable life experience, customer service
            skills, caregiving skills, technical skills, or leadership
            experience. This guide helps translate those strengths into language
            employers understand.
          </p>

          <p style={styles.bodyText}>
            Employers often look for reliability, professionalism,
            communication, problem solving, adaptability, and follow-through.
            These skills show that a person is ready to work, ready to learn,
            and ready to represent the organization well.
          </p>
        </section>

        <section className="no-print" style={styles.grid}>
          {topSkills.map((item) => (
            <div key={item.title} style={styles.infoCard}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </section>

        <section className="no-print" style={styles.contentCard}>
          <h2 style={styles.sectionTitle}>Real-World Example</h2>
          <p style={styles.bodyText}>
            A participant wants to apply for a front desk or customer service
            role. The job posting asks for communication, scheduling,
            professionalism, computer skills, and problem solving. Instead of
            submitting a generic resume, the participant updates their resume to
            include skills like appointment scheduling, customer communication,
            documentation, conflict resolution, and reliability.
          </p>
        </section>

        <section className="no-print" style={styles.grid}>
          {bottomSkills.map((item) => (
            <div key={item.title} style={styles.infoCard}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </section>

        <section className="no-print" style={styles.contentCard}>
          <h2 style={styles.sectionTitle}>Workplace Application</h2>
          <p style={styles.bodyText}>
            Career readiness supports every part of employment: job search,
            applications, interviews, onboarding, daily work habits, and career
            growth. Participants should practice reading job descriptions,
            identifying matching skills, preparing interview answers, and
            following up professionally.
          </p>

          <div style={styles.reflectionBox}>
            <strong>Mini Reflection:</strong>
            <p>
              Think of one job you want to apply for. What are three skills you
              already have that match that role?
            </p>
          </div>
        </section>

        <section className="no-print" style={styles.assessmentCard}>
          <h2 style={styles.sectionTitle}>Apply Knowledge Assessment</h2>

          {!studyComplete ? (
            <p style={styles.lockedText}>
              Assessment locked until the 3-minute study timer is complete.
            </p>
          ) : (
            <>
              <p style={styles.bodyText}>
                Answer all questions. A score of 80% or higher unlocks your
                certificate.
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
                        onChange={() => handleAnswer(index, option)}
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
            </>
          )}
        </section>

        {passed ? (
          <section style={styles.certificateArea}>
            <div className="no-print" style={styles.nameBox}>
              <label style={styles.nameLabel}>
                Participant Name for Certificate
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
                <h2 style={styles.certName}>{participantName || "Participant"}</h2>
                <div style={styles.certLine} />

                <p style={styles.certText}>has successfully completed</p>
                <h2 style={styles.certCourse}>NHP Career Readiness Training</h2>

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
              style={styles.primaryButton}
            >
              Print Certificate
            </button>
          </section>
        ) : null}
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(0,122,255,.20), transparent 35%), linear-gradient(180deg,#050505,#101010)",
    color: "#ffffff",
    padding: "32px",
    fontFamily: "system-ui, Arial, sans-serif",
  },
  wrapper: {
    maxWidth: 1120,
    margin: "0 auto",
  },
  hero: {
    marginBottom: 22,
  },
  kicker: {
    color: "#7db7ff",
    fontWeight: 900,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    fontSize: 12,
  },
  title: {
    fontSize: 48,
    margin: "8px 0",
    fontWeight: 950,
  },
  subtitle: {
    maxWidth: 900,
    color: "rgba(255,255,255,.76)",
    lineHeight: 1.7,
  },
  timerBox: {
    marginTop: 20,
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    background: "rgba(255,255,255,.07)",
    border: "1px solid rgba(255,255,255,.13)",
  },
  smallText: {
    margin: "6px 0 0",
    color: "rgba(255,255,255,.62)",
    fontSize: 13,
  },
  resetButton: {
    background: "rgba(255,255,255,.10)",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,.20)",
    borderRadius: 12,
    padding: "10px 13px",
    fontWeight: 800,
    cursor: "pointer",
  },
  progressTrack: {
    marginTop: 12,
    height: 10,
    background: "rgba(255,255,255,.14)",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#7db7ff",
  },
  contentCard: {
    marginTop: 18,
    padding: 22,
    borderRadius: 20,
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
  },
  sectionTitle: {
    margin: "0 0 10px",
    fontSize: 26,
  },
  bodyText: {
    color: "rgba(255,255,255,.78)",
    lineHeight: 1.7,
  },
  grid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
  },
  infoCard: {
    minHeight: 180,
    padding: 18,
    borderRadius: 18,
    background: "rgba(0,0,0,.30)",
    border: "1px solid rgba(255,255,255,.12)",
    color: "rgba(255,255,255,.82)",
    lineHeight: 1.55,
  },
  reflectionBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    background: "rgba(125,183,255,.10)",
    border: "1px solid rgba(125,183,255,.18)",
  },
  assessmentCard: {
    marginTop: 22,
    padding: 22,
    borderRadius: 20,
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
  },
  lockedText: {
    padding: 14,
    borderRadius: 14,
    background: "rgba(255,255,255,.08)",
    color: "rgba(255,255,255,.68)",
  },
  questionBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    background: "rgba(0,0,0,.30)",
    border: "1px solid rgba(255,255,255,.10)",
  },
  option: {
    display: "flex",
    gap: 10,
    marginTop: 10,
    color: "rgba(255,255,255,.82)",
  },
  primaryButton: {
    marginTop: 18,
    background: "#ffffff",
    color: "#000000",
    border: "none",
    borderRadius: 12,
    padding: "11px 15px",
    fontWeight: 900,
    cursor: "pointer",
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
    marginTop: 26,
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
