"use client";

const questions = [
  {
    question: "Tell me about yourself.",
    howToAnswer:
      "Keep this short, professional, and focused on your work background. Start with where you are now, mention relevant experience or strengths, and end with what you are looking for next.",
    sampleAnswer:
      "I’m a dependable professional with experience in customer service and administrative support. In my recent roles, I developed strong communication, organization, and problem-solving skills. I’m now looking for an opportunity where I can contribute to a team, continue growing, and bring value to an employer who needs someone reliable and motivated.",
  },
  {
    question: "Why do you want to work here?",
    howToAnswer:
      "Show that you researched the company. Mention something specific about the employer, the role, or the company culture, then connect it to your skills and interest.",
    sampleAnswer:
      "I’m interested in working here because your company has a strong reputation for professionalism and service. I also feel this role matches my strengths in communication, teamwork, and staying organized. I’m looking for an opportunity where I can contribute right away and continue building my experience with a company like yours.",
  },
  {
    question: "What are your strengths?",
    howToAnswer:
      "Choose 2 to 3 strengths that fit the job. Keep them relevant and back them up with simple examples or outcomes.",
    sampleAnswer:
      "My strengths are communication, adaptability, and reliability. I work well with different people, I learn quickly, and I take pride in being dependable. In previous roles, those strengths helped me support customers, stay organized during busy times, and contribute positively to the team.",
  },
  {
    question: "Tell me about a challenge you faced and how you handled it.",
    howToAnswer:
      "Use a simple Situation, Action, Result format. Briefly explain the challenge, what you did, and what happened afterward.",
    sampleAnswer:
      "In a previous role, we had a last-minute staffing issue during a busy period. I stayed calm, helped reorganize priorities, and supported the team where needed. As a result, we were able to get through the shift successfully and still provide good service. That experience taught me how important flexibility and teamwork are under pressure.",
  },
  {
    question: "Why should we hire you?",
    howToAnswer:
      "Focus on the value you bring. Mention your work ethic, attitude, transferable skills, and readiness to contribute.",
    sampleAnswer:
      "You should hire me because I bring a strong work ethic, a positive attitude, and skills that match the role. I’m dependable, willing to learn, and ready to contribute to the team. I take my responsibilities seriously, and I always try to represent my employer well.",
  },
];

const prepTips = [
  "Research the company website, services, mission, and recent updates.",
  "Review the job description and match your answers to what the employer is seeking.",
  "Prepare 2 to 3 examples from past work, school, volunteering, or life experience.",
  "Practice your answers out loud so you sound clear and confident.",
  "Dress appropriately and keep your appearance neat and professional.",
  "Arrive 10 to 15 minutes early.",
  "Bring copies of your resume.",
  "Prepare 2 to 3 questions to ask the employer.",
  "Speak clearly, stay calm, and take a moment before answering if needed.",
];

const employerQuestions = [
  "What does success look like in this role?",
  "What does a typical day look like?",
  "What are the biggest priorities in the first 30 to 60 days?",
  "How would you describe the team environment?",
  "What qualities do your strongest employees usually have?",
  "What are the next steps in the interview process?",
  "What challenges is the team currently working through?",
  "How is performance usually measured in this position?",
];

const followUpQuestions = [
  "What would you like the person in this role to accomplish first?",
  "What does training or onboarding usually look like?",
  "What do you enjoy most about working here?",
  "Is there anything else I can clarify about my experience?",
];

const etiquetteTips = [
  "Do not lead with money questions in the first interview unless the employer brings it up first.",
  "Focus first on the role, the company, the team, and what success looks like.",
  "Ask for a business card or the interviewer’s contact information so you can send a follow-up or thank-you email.",
  "Send a short thank-you message after the interview to show appreciation and continued interest.",
];

export default function InterviewQuestionsPage() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.heroCard}>
          <p style={styles.kicker}>Career ToolKit</p>
          <h1 style={styles.title}>Interview Questions + Prep</h1>
          <p style={styles.subtitle}>
            Review common employer interview questions, learn how to answer
            them, and prepare with simple tips that help you feel more
            confident.
          </p>

          <div style={styles.heroButtons}>
            <a href="/career-toolkit" style={styles.linkButton}>
              Back to Career ToolKit
            </a>
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Section 1</p>
          <h2 style={styles.sectionTitle}>5 Main Interview Questions Employers Ask</h2>

          <div style={styles.questionList}>
            {questions.map((item, index) => (
              <div key={item.question} style={styles.questionCard}>
                <div style={styles.questionNumber}>{index + 1}</div>
                <div>
                  <h3 style={styles.questionTitle}>{item.question}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Section 2</p>
          <h2 style={styles.sectionTitle}>How to Answer Each One</h2>

          <div style={styles.answerWrap}>
            {questions.map((item) => (
              <article key={item.question} style={styles.answerCard}>
                <h3 style={styles.answerTitle}>{item.question}</h3>

                <div style={styles.answerBlock}>
                  <p style={styles.answerLabel}>How to answer:</p>
                  <p style={styles.answerText}>{item.howToAnswer}</p>
                </div>

                <div style={styles.answerBlock}>
                  <p style={styles.answerLabel}>Strong sample answer:</p>
                  <p style={styles.answerText}>{item.sampleAnswer}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Section 3</p>
          <h2 style={styles.sectionTitle}>Tips to Prepare Before the Interview</h2>

          <div style={styles.tipGrid}>
            {prepTips.map((tip) => (
              <div key={tip} style={styles.tipCard}>
                {tip}
              </div>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Section 4</p>
          <h2 style={styles.sectionTitle}>Questions You Can Ask the Employer</h2>
          <p style={styles.subtitleText}>
            Having questions prepared shows interest, confidence, and professionalism.
          </p>
          <p style={styles.subtitleText}>
            Rule of thumb: prepare at least 3 questions and aim to ask 2 to 4 thoughtful questions during the interview if time allows.
          </p>

          <div style={styles.tipGrid}>
            {employerQuestions.map((question) => (
              <div key={question} style={styles.tipCard}>
                {question}
              </div>
            ))}
          </div>

          <div style={styles.followUpWrap}>
            <h3 style={styles.followUpTitle}>Strong Follow-Up Questions</h3>
            <div style={styles.tipGrid}>
              {followUpQuestions.map((question) => (
                <div key={question} style={styles.tipCard}>
                  {question}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Section 5</p>
          <h2 style={styles.sectionTitle}>Interview Etiquette Tips</h2>

          <div style={styles.tipGrid}>
            {etiquetteTips.map((tip) => (
              <div key={tip} style={styles.tipCard}>
                {tip}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
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
  questionList: {
    display: "grid",
    gap: "12px",
  },
  questionCard: {
    display: "grid",
    gridTemplateColumns: "56px 1fr",
    gap: "14px",
    alignItems: "center",
    background: "#101010",
    border: "1px solid #2d2d2d",
    borderRadius: "18px",
    padding: "16px",
  },
  questionNumber: {
    width: "40px",
    height: "40px",
    borderRadius: "999px",
    background: "#111827",
    border: "1px solid #374151",
    color: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "16px",
  },
  questionTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 600,
    color: "#f5f5f5",
    lineHeight: 1.5,
  },
  answerWrap: {
    display: "grid",
    gap: "16px",
  },
  answerCard: {
    background: "#101010",
    border: "1px solid #2d2d2d",
    borderRadius: "18px",
    padding: "20px",
  },
  answerTitle: {
    margin: "0 0 14px",
    fontSize: "22px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  answerBlock: {
    marginBottom: "14px",
  },
  answerLabel: {
    margin: "0 0 6px",
    color: "#f5f5f5",
    fontSize: "15px",
    fontWeight: 700,
  },
  answerText: {
    margin: 0,
    color: "#c8c8c8",
    fontSize: "15px",
    lineHeight: 1.75,
  },
  subtitleText: {
    margin: "0 0 16px",
    color: "#c8c8c8",
    fontSize: "15px",
    lineHeight: 1.7,
  },
  tipGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "12px",
  },
  tipCard: {
    background: "#101010",
    border: "1px solid #2d2d2d",
    borderRadius: "18px",
    padding: "16px",
    color: "#f5f5f5",
    fontSize: "15px",
    lineHeight: 1.7,
  },
  followUpWrap: {
    marginTop: "20px",
  },
  followUpTitle: {
    margin: "0 0 14px",
    fontSize: "22px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
};
