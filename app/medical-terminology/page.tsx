"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

type Question = {
id: number;
section: string;
question: string;
options?: string[];
correct?: string;
type: "quiz" | "scale";
};

const ACCESS_CODE = "MED-N0NP";

const questions: Question[] = [
{
id: 1,
section: "Prefixes",
question: "What does the prefix “hyper-” mean?",
options: [
"Below normal",
"Excessive / above normal",
"Around",
"Within",
],
correct: "Excessive / above normal",
type: "quiz",
},
{
id: 2,
section: "Prefixes",
question: "What does “hypo-” mean?",
options: [
"Under / less than",
"Surgical removal",
"Inflammation",
"Fast",
],
correct: "Under / less than",
type: "quiz",
},
{
id: 3,
section: "Prefixes",
question: "What does “tachy-” mean?",
options: ["Slow", "Fast", "Bone", "Around"],
correct: "Fast",
type: "quiz",
},
{
id: 4,
section: "Prefixes",
question: "What does “brady-” mean?",
options: ["Fast", "Large", "Slow", "Skin"],
correct: "Slow",
type: "quiz",
},
{
id: 5,
section: "Prefixes",
question: "What does “peri-” mean?",
options: ["Around", "Inside", "Blood", "Kidney"],
correct: "Around",
type: "quiz",
},

{
id: 6,
section: "Root Words",
question: "Cardi/o refers to:",
options: ["Brain", "Heart", "Skin", "Kidney"],
correct: "Heart",
type: "quiz",
},
{
id: 7,
section: "Root Words",
question: "Nephr/o refers to:",
options: ["Kidney", "Bone", "Liver", "Lung"],
correct: "Kidney",
type: "quiz",
},
{
id: 8,
section: "Root Words",
question: "Derm/o refers to:",
options: ["Blood", "Skin", "Bone", "Eye"],
correct: "Skin",
type: "quiz",
},
{
id: 9,
section: "Root Words",
question: "Oste/o refers to:",
options: ["Bone", "Ear", "Nose", "Vein"],
correct: "Bone",
type: "quiz",
},
{
id: 10,
section: "Root Words",
question: "Hepat/o refers to:",
options: ["Liver", "Lung", "Joint", "Nerve"],
correct: "Liver",
type: "quiz",
},

{
id: 11,
section: "Suffixes",
question: "“-itis” means:",
options: [
"Surgical removal",
"Inflammation",
"Disease",
"Record",
],
correct: "Inflammation",
type: "quiz",
},
{
id: 12,
section: "Suffixes",
question: "“-ectomy” means:",
options: [
"To cut out / remove",
"Study of",
"Around",
"Swelling",
],
correct: "To cut out / remove",
type: "quiz",
},
{
id: 13,
section: "Suffixes",
question: "“-ology” means:",
options: ["Pain", "Condition", "Study of", "Repair"],
correct: "Study of",
type: "quiz",
},
{
id: 14,
section: "Suffixes",
question: "“-scopy” means:",
options: [
"Visual examination",
"Removal",
"Slow",
"Muscle",
],
correct: "Visual examination",
type: "quiz",
},
{
id: 15,
section: "Suffixes",
question: "“-osis” means:",
options: [
"Abnormal condition",
"Heart",
"Before",
"Gland",
],
correct: "Abnormal condition",
type: "quiz",
},

{
id: 16,
section: "Medical Meaning",
question: "Gastritis means:",
options: [
"Heart inflammation",
"Stomach inflammation",
"Skin disease",
"Kidney removal",
],
correct: "Stomach inflammation",
type: "quiz",
},
{
id: 17,
section: "Medical Meaning",
question: "Dermatology is the study of:",
options: ["Blood", "Skin", "Brain", "Liver"],
correct: "Skin",
type: "quiz",
},
{
id: 18,
section: "Medical Meaning",
question: "Nephrectomy means:",
options: [
"Kidney removal",
"Bone fracture",
"Heart surgery",
"Ear infection",
],
correct: "Kidney removal",
type: "quiz",
},
{
id: 19,
section: "Medical Meaning",
question: "Bradycardia means:",
options: [
"Fast heartbeat",
"Slow heartbeat",
"Broken bone",
"Joint pain",
],
correct: "Slow heartbeat",
type: "quiz",
},
{
id: 20,
section: "Medical Meaning",
question: "Pericarditis means:",
options: [
"Inflammation around the heart",
"Skin infection",
"Liver swelling",
"Lung disease",
],
correct: "Inflammation around the heart",
type: "quiz",
},

{
id: 21,
section: "Career Readiness",
question: "Are you comfortable working with patient information?",
type: "scale",
},
{
id: 22,
section: "Career Readiness",
question: "Do you enjoy detail-oriented work?",
type: "scale",
},
{
id: 23,
section: "Career Readiness",
question:
"Are you interested in healthcare careers that may not require direct patient care?",
type: "scale",
},
{
id: 24,
section: "Career Readiness",
question: "Can you work with deadlines and documentation?",
type: "scale",
},
{
id: 25,
section: "Career Readiness",
question:
"Are you interested in certifications like billing, coding, or medical administration?",
type: "scale",
},
];

export default function MedicalAssessmentPage() {
const [fullName, setFullName] = useState("");
const [enteredCode, setEnteredCode] = useState("");
const [unlocked, setUnlocked] = useState(false);
const [submitted, setSubmitted] = useState(false);
const [answers, setAnswers] = useState<Record<number, string | number>>({});

const quizQuestions = questions.filter((q) => q.type === "quiz");
const scaleQuestions = questions.filter((q) => q.type === "scale");

const quizScore = useMemo(() => {
return quizQuestions.reduce((score, q) => {
return answers[q.id] === q.correct ? score + 1 : score;
}, 0);
}, [answers]);

const readinessScore = useMemo(() => {
return scaleQuestions.reduce((score, q) => {
return score + Number(answers[q.id] || 0);
}, 0);
}, [answers]);

const percentage = Math.round((quizScore / 20) * 100);
const passed = percentage >= 80;

function handleUnlock() {
if (!fullName.trim()) {
alert("Please enter your full name.");
return;
}

if (enteredCode.trim().toUpperCase() !== ACCESS_CODE) {
alert("Invalid access code.");
return;
}

setUnlocked(true);
}

function handleAnswer(id: number, value: string | number) {
setAnswers((prev) => ({
...prev,
[id]: value,
}));
}

function handleSubmit() {
if (Object.keys(answers).length < questions.length) {
alert("Please answer all questions.");
return;
}

setSubmitted(true);
window.scrollTo({ top: 0, behavior: "smooth" });
}

function printCertificate() {
window.print();
}

if (!unlocked) {
return (
<main style={styles.main}>
<section style={styles.lockCard}>
<h1 style={styles.title}>Medical Terminology Assessment</h1>
<p style={styles.subtitle}>
Enter your name and workshop access code to begin.
</p>

<input
style={styles.input}
placeholder="Full Name"
value={fullName}
onChange={(e) => setFullName(e.target.value)}
/>

<input
style={styles.input}
placeholder="Access Code"
value={enteredCode}
onChange={(e) => setEnteredCode(e.target.value)}
/>

<button style={styles.primaryBtn} onClick={handleUnlock}>
Start Assessment
</button>

<Link href="/medical-terminology-study" style={styles.linkBtn}>
Study Guide First
</Link>
</section>
</main>
);
}

if (submitted) {
return (
<main style={styles.main}>
<section style={styles.resultCard}>
<h1 style={styles.title}>Assessment Results</h1>

<p>
<strong>Participant:</strong> {fullName}
</p>

<p>
<strong>Medical Terminology Score:</strong> {quizScore}/20
</p>

<p>
<strong>Career Readiness Score:</strong> {readinessScore}/25
</p>

<p>
<strong>Passing Score:</strong> {percentage}%
</p>

{passed ? (
<>
<h2 style={{ color: "#7dffb3" }}>
Certificate of Completion Unlocked
</h2>

<div style={styles.certificate}>
<h2>HireMinds Certificate of Completion</h2>
<p>This certifies that</p>
<h1>{fullName}</h1>
<p>
has successfully completed the Medical Terminology Assessment
</p>
<p>Score: {percentage}%</p>
</div>

<button
style={styles.primaryBtn}
onClick={printCertificate}
>
Print Certificate
</button>
</>
) : (
<>
<h2 style={{ color: "#ff9d9d" }}>
Certificate Not Unlocked
</h2>
<p>
You need 80% or higher to receive a certificate.
</p>
<Link href="/medical-terminology-study" style={styles.linkBtn}>
Return to Study Guide
</Link>
</>
)}
</section>
</main>
);
}

return (
<main style={styles.main}>
<section style={styles.assessmentWrap}>
<h1 style={styles.title}>MedScope™ Assessment</h1>

{questions.map((q) => (
<div key={q.id} style={styles.questionCard}>
<h3>{q.id}. {q.question}</h3>

{q.type === "quiz" ? (
<div style={styles.optionWrap}>
{q.options?.map((option) => (
<button
key={option}
style={{
...styles.optionBtn,
...(answers[q.id] === option
? styles.selected
: {}),
}}
onClick={() => handleAnswer(q.id, option)}
>
{option}
</button>
))}
</div>
) : (
<div style={styles.optionWrap}>
{[1, 2, 3, 4, 5].map((n) => (
<button
key={n}
style={{
...styles.optionBtn,
...(answers[q.id] === n
? styles.selected
: {}),
}}
onClick={() => handleAnswer(q.id, n)}
>
{n}
</button>
))}
</div>
)}
</div>
))}

<button style={styles.primaryBtn} onClick={handleSubmit}>
Submit Assessment
</button>
</section>
</main>
);
}

const styles: Record<string, React.CSSProperties> = {
main: {
minHeight: "100vh",
background: "#0a0a0a",
color: "#fff",
padding: 24,
fontFamily: "Arial",
},
title: {
fontSize: 38,
fontWeight: 900,
marginBottom: 10,
},
subtitle: {
opacity: 0.8,
marginBottom: 20,
},
lockCard: {
maxWidth: 700,
margin: "0 auto",
padding: 30,
borderRadius: 20,
background: "#111",
border: "1px solid rgba(255,255,255,.1)",
},
input: {
width: "100%",
padding: 14,
marginBottom: 14,
borderRadius: 12,
border: "1px solid rgba(255,255,255,.15)",
background: "#1a1a1a",
color: "#fff",
},
primaryBtn: {
background: "#fff",
color: "#000",
padding: "14px 18px",
borderRadius: 12,
fontWeight: 900,
border: "none",
cursor: "pointer",
marginTop: 10,
},
linkBtn: {
display: "block",
marginTop: 16,
color: "#8cc4ff",
fontWeight: 800,
textDecoration: "none",
},
assessmentWrap: {
maxWidth: 1100,
margin: "0 auto",
},
questionCard: {
padding: 20,
borderRadius: 18,
background: "#111",
marginBottom: 14,
border: "1px solid rgba(255,255,255,.08)",
},
optionWrap: {
display: "grid",
gap: 10,
marginTop: 14,
},
optionBtn: {
padding: 12,
borderRadius: 12,
border: "1px solid rgba(255,255,255,.15)",
background: "#1a1a1a",
color: "#fff",
cursor: "pointer",
textAlign: "left",
},
selected: {
background: "#fff",
color: "#000",
fontWeight: 800,
},
resultCard: {
maxWidth: 900,
margin: "0 auto",
padding: 30,
borderRadius: 20,
background: "#111",
},
certificate: {
marginTop: 24,
padding: 30,
borderRadius: 18,
background: "#fff",
color: "#000",
textAlign: "center",
},
};
