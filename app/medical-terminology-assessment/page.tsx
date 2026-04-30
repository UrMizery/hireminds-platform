"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Question = {
id: number;
section: string;
question: string;
options?: string[];
correct?: string;
type: "quiz" | "scale";
};

const REQUIRED_REFERRAL_CODE = "TWP2026";

const questions: Question[] = [
{ id: 1, section: "Prefixes", question: "What does the prefix hyper- mean?", options: ["Below normal", "Excessive / above normal", "Around", "Within"], correct: "Excessive / above normal", type: "quiz" },
{ id: 2, section: "Prefixes", question: "What does hypo- mean?", options: ["Under / less than", "Surgical removal", "Inflammation", "Fast"], correct: "Under / less than", type: "quiz" },
{ id: 3, section: "Prefixes", question: "What does tachy- mean?", options: ["Slow", "Fast", "Bone", "Around"], correct: "Fast", type: "quiz" },
{ id: 4, section: "Prefixes", question: "What does brady- mean?", options: ["Fast", "Large", "Slow", "Skin"], correct: "Slow", type: "quiz" },
{ id: 5, section: "Prefixes", question: "What does peri- mean?", options: ["Around", "Inside", "Blood", "Kidney"], correct: "Around", type: "quiz" },

{ id: 6, section: "Root Words", question: "Cardi/o refers to:", options: ["Brain", "Heart", "Skin", "Kidney"], correct: "Heart", type: "quiz" },
{ id: 7, section: "Root Words", question: "Nephr/o refers to:", options: ["Kidney", "Bone", "Liver", "Lung"], correct: "Kidney", type: "quiz" },
{ id: 8, section: "Root Words", question: "Derm/o refers to:", options: ["Blood", "Skin", "Bone", "Eye"], correct: "Skin", type: "quiz" },
{ id: 9, section: "Root Words", question: "Oste/o refers to:", options: ["Bone", "Ear", "Nose", "Vein"], correct: "Bone", type: "quiz" },
{ id: 10, section: "Root Words", question: "Hepat/o refers to:", options: ["Liver", "Lung", "Joint", "Nerve"], correct: "Liver", type: "quiz" },

{ id: 11, section: "Suffixes", question: "-itis means:", options: ["Surgical removal", "Inflammation", "Disease", "Record"], correct: "Inflammation", type: "quiz" },
{ id: 12, section: "Suffixes", question: "-ectomy means:", options: ["To cut out / remove", "Study of", "Around", "Swelling"], correct: "To cut out / remove", type: "quiz" },
{ id: 13, section: "Suffixes", question: "-ology means:", options: ["Pain", "Condition", "Study of", "Repair"], correct: "Study of", type: "quiz" },
{ id: 14, section: "Suffixes", question: "-scopy means:", options: ["Visual examination", "Removal", "Slow", "Muscle"], correct: "Visual examination", type: "quiz" },
{ id: 15, section: "Suffixes", question: "-osis means:", options: ["Abnormal condition", "Heart", "Before", "Gland"], correct: "Abnormal condition", type: "quiz" },

{ id: 16, section: "Medical Term Meaning", question: "Gastritis means:", options: ["Heart inflammation", "Stomach inflammation", "Skin disease", "Kidney removal"], correct: "Stomach inflammation", type: "quiz" },
{ id: 17, section: "Medical Term Meaning", question: "Dermatology is the study of:", options: ["Blood", "Skin", "Brain", "Liver"], correct: "Skin", type: "quiz" },
{ id: 18, section: "Medical Term Meaning", question: "Nephrectomy means:", options: ["Kidney removal", "Bone fracture", "Heart surgery", "Ear infection"], correct: "Kidney removal", type: "quiz" },
{ id: 19, section: "Medical Term Meaning", question: "Bradycardia means:", options: ["Fast heartbeat", "Slow heartbeat", "Broken bone", "Joint pain"], correct: "Slow heartbeat", type: "quiz" },
{ id: 20, section: "Medical Term Meaning", question: "Pericarditis means:", options: ["Inflammation around the heart", "Skin infection", "Liver swelling", "Lung disease"], correct: "Inflammation around the heart", type: "quiz" },

{ id: 21, section: "Career Readiness", question: "Are you comfortable working with patient information?", type: "scale" },
{ id: 22, section: "Career Readiness", question: "Do you enjoy detail-oriented work?", type: "scale" },
{ id: 23, section: "Career Readiness", question: "Are you interested in healthcare careers that may not require direct patient care?", type: "scale" },
{ id: 24, section: "Career Readiness", question: "Can you work with deadlines and documentation?", type: "scale" },
{ id: 25, section: "Career Readiness", question: "Are you interested in certifications like billing, coding, or medical administration?", type: "scale" },
];

export default function MedicalTerminologyAssessmentPage() {
const [ready, setReady] = useState(false);
const [studyComplete, setStudyComplete] = useState(false);
const [fullName, setFullName] = useState("");
const [email, setEmail] = useState("");
const [referralCode, setReferralCode] = useState("");
const [unlocked, setUnlocked] = useState(false);
const [answers, setAnswers] = useState<Record<number, string | number>>({});
const [submitted, setSubmitted] = useState(false);
const [reported, setReported] = useState(false);

useEffect(() => {
setStudyComplete(localStorage.getItem("medicalTerminologyStudyComplete") === "true");
const storedCode = localStorage.getItem("hireminds_referral_code") || "";
if (storedCode) setReferralCode(storedCode.toUpperCase());
setReady(true);
}, []);

const quizQuestions = questions.filter((q) => q.type === "quiz");
const scaleQuestions = questions.filter((q) => q.type === "scale");

const quizScore = useMemo(() => {
return quizQuestions.reduce(
(score, q) => (answers[q.id] === q.correct ? score + 1 : score),
0
);
}, [answers, quizQuestions]);

const readinessScore = useMemo(() => {
return scaleQuestions.reduce(
(score, q) => score + Number(answers[q.id] || 0),
0
);
}, [answers, scaleQuestions]);

const percentage = Math.round((quizScore / 20) * 100);
const passed = percentage >= 80;

const sectionBreakdown = useMemo(() => {
const sections = ["Prefixes", "Root Words", "Suffixes", "Medical Term Meaning"];

return sections.map((section) => {
const sectionQuestions = quizQuestions.filter((q) => q.section === section);
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
}, [answers, quizQuestions]);

const weakAreas = sectionBreakdown.filter((s) => s.pct < 80);

const resultTitle = useMemo(() => {
if (quizScore <= 9) return "Healthcare Explorer";
if (quizScore <= 14) return "Healthcare Ready";
if (quizScore <= 17) return "Healthcare Career Track";
return "HireMinds Medical Professional Path";
}, [quizScore]);

const recommendedPaths = useMemo(() => {
if (quizScore <= 9) {
return ["Medical Front Desk", "Patient Services Representative", "Healthcare Support Assistant"];
}
if (quizScore <= 14) {
return ["Medical Administrative Assistant", "Patient Access Representative", "Scheduling Coordinator", "Insurance Verification Assistant"];
}
if (quizScore <= 17) {
return ["Medical Billing Assistant", "Medical Coding Pathway", "Healthcare Administration", "Clinical Support Roles"];
}
return ["Medical Billing Specialist", "Medical Coding Specialist", "Revenue Cycle Support", "Patient Access Coordinator"];
}, [quizScore]);

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
module: "medical_terminology",
eventType: "assessment_submitted",
score: quizScore,
percentage,
passed,
certificateEarned: passed,
details: {
readinessScore,
sectionBreakdown,
weakAreas: weakAreas.map((w) => w.section),
answers,
},
}),
});

setReported(true);
} catch {
// reporting should not block user
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

function handleAnswer(id: number, value: string | number) {
setAnswers((prev) => ({ ...prev, [id]: value }));
}

async function submitAssessment() {
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
<h1 style={styles.title}>Complete the Study Guide First</h1>
<p style={styles.subtitle}>
You must complete the Medical Terminology Study Guide timer before starting the assessment.
</p>
<Link href="/medical-terminology-study" style={styles.primaryBtn}>Open Study Guide</Link>
<Link href="/skillsquest" style={styles.linkBtn}>Back to SkillsQuest</Link>
</section>
</main>
);
}

if (!unlocked) {
return (
<main style={styles.main}>
<section style={styles.lockCard}>
<p style={styles.kicker}>HireMinds Medical Pathway</p>
<h1 style={styles.title}>MedScope Medical Terminology Assessment</h1>
<p style={styles.subtitle}>
This assessment is available to participants with referral code TWP2026.
</p>

<input style={styles.input} placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
<input style={styles.input} placeholder="Email optional, for reporting" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
<input style={styles.input} placeholder="Referral Code" value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())} />

<button type="button" style={styles.primaryBtn} onClick={unlockAssessment}>Start Assessment</button>
<Link href="/medical-terminology-study" style={styles.linkBtn}>Study Guide</Link>
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
<div style={styles.scoreBox}><span style={styles.scoreLabel}>Participant</span><strong>{fullName}</strong></div>
<div style={styles.scoreBox}><span style={styles.scoreLabel}>Terminology Score</span><strong>{quizScore}/20</strong></div>
<div style={styles.scoreBox}><span style={styles.scoreLabel}>Certificate Score</span><strong>{percentage}%</strong></div>
<div style={styles.scoreBox}><span style={styles.scoreLabel}>Readiness Score</span><strong>{readinessScore}/25</strong></div>
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
Review: {weakAreas.map((w) => w.section).join(", ")}. Use the study guide and focus on these sections before retaking.
</p>
</>
) : (
<>
<h2 style={styles.sectionTitle}>Strong Performance</h2>
<p style={styles.resultText}>
You scored 80% or higher in every terminology section.
</p>
</>
)}

<h2 style={styles.sectionTitle}>Correct vs. Your Answer</h2>
<div style={styles.reviewList}>
{quizQuestions.map((q) => {
const userAnswer = answers[q.id];
const isCorrect = userAnswer === q.correct;

return (
<div key={q.id} style={styles.reviewCard}>
<strong>Q{q.id}. {q.question}</strong>
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
{recommendedPaths.map((path) => <div key={path} style={styles.pathCard}>✓ {path}</div>)}
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
<h3 style={styles.certCourse}>MedScope Medical Terminology Assessment</h3>

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
You need 80% or higher on the medical terminology section to receive a certificate.
</p>
<div style={styles.retakeBox}>
<strong>Retake Suggestions:</strong>
<ul>
<li>Review your weak areas listed above.</li>
<li>Return to the study guide and focus on prefixes, roots, suffixes, or full terms as needed.</li>
<li>Retake the assessment after reviewing.</li>
</ul>
</div>
<Link href="/medical-terminology-study" style={styles.linkBtn}>Return to Study Guide</Link>
</>
)}

<button type="button" style={styles.secondaryBtn} onClick={resetAssessment}>Retake Assessment</button>
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
left: 0.25in !important;
top: 0.25in !important;
width: 10.5in !important;
height: 8in !important;
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
<h1 style={styles.title}>MedScope Medical Terminology Assessment</h1>
<p style={styles.subtitle}>
Answer all questions. Score 80% or higher on the terminology questions to unlock a certificate.
</p>
</div>
<Link href="/medical-terminology-study" style={styles.secondaryBtn}>Study Guide</Link>
</section>

<section style={styles.assessmentCard}>
{questions.map((q) => (
<div key={q.id} style={styles.questionCard}>
<div style={styles.questionTop}>
<span style={styles.badge}>{q.section}</span>
<span style={styles.questionNumber}>Question {q.id}</span>
</div>

<h3 style={styles.questionText}>{q.question}</h3>

{q.type === "quiz" && q.options ? (
<div style={styles.optionGrid}>
{q.options.map((option) => (
<button key={option} type="button" onClick={() => handleAnswer(q.id, option)}
style={{ ...styles.optionBtn, ...(answers[q.id] === option ? styles.selected : {}) }}>
{option}
</button>
))}
</div>
) : (
<div style={styles.scaleGrid}>
{[1, 2, 3, 4, 5].map((num) => (
<button key={num} type="button" onClick={() => handleAnswer(q.id, num)}
style={{ ...styles.scaleBtn, ...(answers[q.id] === num ? styles.selected : {}) }}>
{num}
</button>
))}
<div style={styles.scaleLabels}>
<span>1 = Not comfortable</span>
<span>5 = Very comfortable</span>
</div>
</div>
)}
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
main: { minHeight: "100vh", background: "radial-gradient(circle at top left, rgba(0,122,255,.25), transparent 35%), linear-gradient(180deg,#050505,#111)", color: "#fff", fontFamily: "system-ui, Arial, sans-serif", padding: 24 },
hero: { maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", flexWrap: "wrap", padding: "28px 0" },
kicker: { textTransform: "uppercase", letterSpacing: 1.5, fontSize: 12, color: "#7db7ff", fontWeight: 800, margin: 0 },
title: { fontSize: 40, lineHeight: 1.05, margin: "10px 0", fontWeight: 950 },
subtitle: { fontSize: 16, color: "rgba(255,255,255,.78)", maxWidth: 720, lineHeight: 1.6 },
lockCard: { maxWidth: 720, margin: "60px auto", padding: 28, borderRadius: 22, background: "rgba(255,255,255,.075)", border: "1px solid rgba(255,255,255,.14)" },
input: { width: "100%", padding: 14, marginBottom: 14, borderRadius: 12, border: "1px solid rgba(255,255,255,.18)", background: "rgba(0,0,0,.35)", color: "#fff", fontSize: 15 },
primaryBtn: { background: "#fff", color: "#000", padding: "13px 16px", borderRadius: 12, fontWeight: 900, textDecoration: "none", border: "none", cursor: "pointer", marginTop: 10, display: "inline-block" },
secondaryBtn: { background: "rgba(255,255,255,.09)", color: "#fff", padding: "13px 16px", borderRadius: 12, fontWeight: 800, textDecoration: "none", border: "1px solid rgba(255,255,255,.16)", cursor: "pointer", marginTop: 10, display: "inline-block" },
linkBtn: { display: "block", marginTop: 16, color: "#8cc4ff", fontWeight: 800, textDecoration: "none" },
assessmentCard: { maxWidth: 1100, margin: "0 auto", display: "grid", gap: 14 },
questionCard: { padding: 18, borderRadius: 18, background: "rgba(255,255,255,.075)", border: "1px solid rgba(255,255,255,.12)" },
questionTop: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 },
badge: { background: "rgba(125,183,255,.15)", color: "#b8dcff", padding: "6px 10px", borderRadius: 999, fontSize: 12, fontWeight: 900 },
questionNumber: { color: "rgba(255,255,255,.6)", fontSize: 12, fontWeight: 800 },
questionText: { margin: "0 0 12px", fontSize: 19 },
optionGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 },
optionBtn: { padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,.15)", background: "rgba(0,0,0,.3)", color: "#fff", cursor: "pointer", textAlign: "left", fontWeight: 700 },
selected: { background: "#fff", color: "#000", borderColor: "#fff" },
scaleGrid: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
scaleBtn: { width: 46, height: 46, borderRadius: 999, border: "1px solid rgba(255,255,255,.15)", background: "rgba(0,0,0,.3)", color: "#fff", cursor: "pointer", fontWeight: 900 },
scaleLabels: { width: "100%", display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,.55)", fontSize: 12 },
submitBtn: { padding: 15, borderRadius: 14, border: "none", background: "#fff", color: "#000", fontWeight: 950, cursor: "pointer", marginBottom: 40 },
resultCard: { maxWidth: 1100, margin: "0 auto", padding: 26, borderRadius: 22, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.13)" },
scoreGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginTop: 18 },
scoreBox: { background: "rgba(0,0,0,.32)", padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,.1)" },
scoreLabel: { display: "block", color: "rgba(255,255,255,.65)", fontSize: 13, marginBottom: 6 },
sectionTitle: { marginTop: 24 },
pathGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 10 },
pathCard: { padding: 12, borderRadius: 14, background: "rgba(125,183,255,.13)", border: "1px solid rgba(125,183,255,.20)", fontWeight: 800 },
reviewList: { display: "grid", gap: 10 },
reviewCard: { padding: 14, borderRadius: 14, background: "rgba(0,0,0,.30)", border: "1px solid rgba(255,255,255,.10)" },
reviewLine: { margin: "8px 0 0", color: "rgba(255,255,255,.82)" },
correctText: { color: "#7dffb3", fontWeight: 900 },
wrongText: { color: "#ff9d9d", fontWeight: 900 },
passText: { color: "#7dffb3", marginTop: 24 },
failText: { color: "#ff9d9d", marginTop: 24 },
resultText: { color: "rgba(255,255,255,.8)", lineHeight: 1.65 },
retakeBox: { marginTop: 12, padding: 16, borderRadius: 14, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.86)" },

certificate: {
width: "100%",
maxWidth: "980px",
aspectRatio: "11 / 8.5",
margin: "20px auto 18px",
padding: 16,
borderRadius: 18,
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
width: "360px",
maxWidth: "55%",
opacity: 0.08,
top: "50%",
left: "50%",
transform: "translate(-50%, -50%)",
zIndex: 0,
},
certSmall: { position: "relative", zIndex: 1, textTransform: "uppercase", letterSpacing: 3, fontWeight: 900, fontSize: 12, margin: 0 },
certTitle: { position: "relative", zIndex: 1, fontSize: 48, margin: "6px 0 0", fontWeight: 950 },
certWebsite: { position: "relative", zIndex: 1, margin: "0 0 18px", fontWeight: 800, letterSpacing: 1.5 },
certText: { position: "relative", zIndex: 1, fontSize: 16, margin: "6px 0", color: "#333" },
certName: { position: "relative", zIndex: 1, fontSize: 34, margin: "8px 0", borderBottom: "2px solid #111", padding: "0 28px 6px", fontWeight: 900 },
certCourse: { position: "relative", zIndex: 1, fontSize: 22, margin: "6px 0", fontWeight: 900 },
certScore: { position: "relative", zIndex: 1, fontSize: 32, margin: "4px 0", fontWeight: 950 },
certFooter: { position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginTop: 26 },
certLine: { borderBottom: "1px solid #111", minWidth: 170, paddingBottom: 5, margin: 0, fontWeight: 800 },
certLabel: { margin: "6px 0 0", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.2, color: "#444" },
scriptSignature: { fontFamily: "Brush Script MT, Segoe Script, cursive", fontSize: 30, borderBottom: "1px solid #111", minWidth: 200, paddingBottom: 4, margin: 0 },
};
