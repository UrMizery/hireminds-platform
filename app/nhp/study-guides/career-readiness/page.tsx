"use client";

import React from "react";

const REQUIRED_SECONDS = 60;
const COMPLETION_KEY = "nhp_career_readiness_study_complete";
const ASSESSMENT_KEY = "nhp_career_readiness_assessment_passed";

const questions = [
{
question: "What is the main purpose of career readiness?",
options: [
"To memorize job titles only",
"To prepare for workplace expectations and employment success",
"To avoid interviews",
"To only create a resume",
],
answer: "To prepare for workplace expectations and employment success",
},
{
question: "Which is an example of a strong workplace skill?",
options: ["Reliability", "Ignoring messages", "Being late", "Avoiding feedback"],
answer: "Reliability",
},
{
question: "Why should a resume be tailored to a job description?",
options: [
"So it matches the employer’s needs and keywords",
"So it looks longer",
"So it avoids mentioning skills",
"So it has fewer details",
],
answer: "So it matches the employer’s needs and keywords",
},
];

export default function NHPCareerReadinessPage() {
const [secondsLeft, setSecondsLeft] = React.useState(REQUIRED_SECONDS);
const [studyComplete, setStudyComplete] = React.useState(false);
const [selectedAnswers, setSelectedAnswers] = React.useState<Record<number, string>>({});
const [score, setScore] = React.useState<number | null>(null);
const [passed, setPassed] = React.useState(false);

React.useEffect(() => {
const savedStudy = localStorage.getItem(COMPLETION_KEY) === "true";
const savedPassed = localStorage.getItem(ASSESSMENT_KEY) === "true";

if (savedStudy) {
setStudyComplete(true);
setSecondsLeft(0);
}

if (savedPassed) {
setPassed(true);
}
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

function handleAnswer(index: number, answer: string) {
setSelectedAnswers((prev) => ({
...prev,
[index]: answer,
}));
}

function submitAssessment() {
let correct = 0;

questions.forEach((q, index) => {
if (selectedAnswers[index] === q.answer) correct += 1;
});

const percent = Math.round((correct / questions.length) * 100);
setScore(percent);

if (percent >= 80) {
localStorage.setItem(ASSESSMENT_KEY, "true");
setPassed(true);
}
}

function printCertificate() {
window.print();
}

const progressPercent =
((REQUIRED_SECONDS - secondsLeft) / REQUIRED_SECONDS) * 100;

return (
<main style={styles.main}>
<section style={styles.card}>
<p style={styles.kicker}>NHP2026 Career Pathway • Study Guide</p>
<h1 style={styles.title}>Career Readiness</h1>

<p style={styles.subtitle}>
This demo training introduces participants to the core habits, skills,
and mindset needed to prepare for employment, interviews, job search,
and workplace success.
</p>

<div style={styles.timerBox}>
<strong>
{studyComplete
? "Study Guide Complete"
: `Required Time Remaining: ${secondsLeft}s`}
</strong>

<div style={styles.progressTrack}>
<div style={{ ...styles.progressFill, width: `${progressPercent}%` }} />
</div>

<p style={styles.timerText}>
The assessment unlocks after the 1-minute study timer is complete.
</p>
</div>

<section style={styles.section}>
<h2>Purpose</h2>
<p>
Career readiness means being prepared to search for work, understand
employer expectations, communicate professionally, and show up with
the skills and habits needed to succeed on the job.
</p>
</section>

<section style={styles.section}>
<h2>What You’ll Learn</h2>
<ul>
<li>How to recognize employer expectations</li>
<li>How to connect your skills to job opportunities</li>
<li>How to prepare for interviews and workplace communication</li>
<li>How to build confidence when speaking about your experience</li>
<li>How to tailor your resume to a specific job posting</li>
</ul>
</section>

<section style={styles.section}>
<h2>Key Career Readiness Skills</h2>

<div style={styles.grid}>
<div style={styles.infoBox}>
<h3>Reliability</h3>
<p>
Employers value people who show up on time, communicate early,
follow directions, and complete tasks.
</p>
</div>

<div style={styles.infoBox}>
<h3>Communication</h3>
<p>
Strong communication includes listening, asking questions,
responding respectfully, and using professional language.
</p>
</div>

<div style={styles.infoBox}>
<h3>Problem Solving</h3>
<p>
Workplace problems happen. Career-ready employees stay calm,
think through options, and ask for help when needed.
</p>
</div>

<div style={styles.infoBox}>
<h3>Adaptability</h3>
<p>
Jobs may require learning new tools, adjusting to schedules,
and working with different people or systems.
</p>
</div>
</div>
</section>

<section style={styles.section}>
<h2>Real-World Example</h2>
<div style={styles.exampleBox}>
<p>
A participant applies for a front desk role. The job description
asks for customer service, computer skills, scheduling, and
professionalism. Instead of submitting a generic resume, the
participant updates their resume to highlight communication,
reliability, appointment scheduling, and problem-solving.
</p>
</div>
</section>

<section style={styles.section}>
<h2>Workplace Application</h2>
<p>
Career readiness applies before and after getting hired. Before the
job, it helps you apply, interview, and follow up. After the job, it
helps you stay employed, communicate with supervisors, meet
expectations, and grow into better opportunities.
</p>
</section>

<section style={styles.section}>
<h2>Mini Reflection</h2>
<div style={styles.reflectionBox}>
<p>
Think of one job you would like to apply for. What are three
skills you already have that match that job?
</p>
</div>
</section>

<section style={styles.assessmentSection}>
<h2>Apply Knowledge Assessment</h2>

{!studyComplete ? (
<p style={styles.lockedText}>
Assessment locked until the study timer is complete.
</p>
) : (
<>
<p style={styles.subtitle}>
Answer all questions. A score of 80% or higher unlocks the
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
value={option}
checked={selectedAnswers[index] === option}
onChange={() => handleAnswer(index, option)}
/>
<span>{option}</span>
</label>
))}
</div>
))}

<button
type="button"
style={styles.primaryButton}
onClick={submitAssessment}
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
<section style={styles.certificate}>
<p style={styles.kicker}>Certificate Unlocked</p>
<h2>Certificate of Completion</h2>
<p>
Awarded for completing the <strong>Career Readiness</strong>{" "}
training through HireMinds.
</p>
<p>Date: {new Date().toLocaleDateString()}</p>

<button type="button" style={styles.primaryButton} onClick={printCertificate}>
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
card: {
maxWidth: 1050,
margin: "0 auto",
background: "rgba(255,255,255,.06)",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: 22,
padding: 26,
},
kicker: {
color: "#7db7ff",
fontWeight: 900,
textTransform: "uppercase",
letterSpacing: 1.3,
fontSize: 12,
},
title: {
fontSize: 46,
fontWeight: 950,
margin: "8px 0",
},
subtitle: {
color: "rgba(255,255,255,.76)",
lineHeight: 1.7,
maxWidth: 850,
},
timerBox: {
marginTop: 20,
padding: 16,
borderRadius: 16,
background: "rgba(0,0,0,.3)",
border: "1px solid rgba(255,255,255,.12)",
},
progressTrack: {
width: "100%",
height: 10,
background: "rgba(255,255,255,.15)",
borderRadius: 999,
overflow: "hidden",
marginTop: 12,
},
progressFill: {
height: "100%",
background: "#7db7ff",
},
timerText: {
color: "rgba(255,255,255,.65)",
fontSize: 13,
},
section: {
marginTop: 28,
lineHeight: 1.65,
},
grid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
gap: 14,
marginTop: 14,
},
infoBox: {
padding: 16,
borderRadius: 16,
background: "rgba(0,0,0,.25)",
border: "1px solid rgba(255,255,255,.10)",
},
exampleBox: {
padding: 16,
borderRadius: 16,
background: "rgba(125,183,255,.10)",
border: "1px solid rgba(125,183,255,.18)",
},
reflectionBox: {
padding: 16,
borderRadius: 16,
background: "rgba(255,255,255,.08)",
border: "1px solid rgba(255,255,255,.12)",
},
assessmentSection: {
marginTop: 34,
paddingTop: 22,
borderTop: "1px solid rgba(255,255,255,.12)",
},
lockedText: {
color: "rgba(255,255,255,.6)",
background: "rgba(255,255,255,.08)",
padding: 14,
borderRadius: 12,
},
questionBox: {
marginTop: 18,
padding: 16,
borderRadius: 16,
background: "rgba(0,0,0,.28)",
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
certificate: {
marginTop: 34,
padding: 22,
borderRadius: 18,
background: "rgba(125,255,179,.10)",
border: "1px solid rgba(125,255,179,.20)",
},
};
