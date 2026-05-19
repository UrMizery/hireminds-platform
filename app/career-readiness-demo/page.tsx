"use client";

import Link from "next/link";
import StudyGuideTimer from "../components/StudyGuideTimer";

export default function CareerReadinessDemoPage() {
return (
<main style={styles.main}>
<section style={styles.card}>
<p style={styles.kicker}>TWP2026 • Day 2 Demo</p>
<h1 style={styles.title}>Career Readiness Training</h1>

<p style={styles.subtitle}>
This demo prepares participants to connect their healthcare training
to resumes, cover letters, interview answers, professionalism, and
workplace expectations.
</p>

<StudyGuideTimer
module="twp_career_readiness_demo"
completionKey="twp_career_readiness_demo"
requiredSeconds={30}
/>

<section style={styles.section}>
<h2>Training Purpose</h2>
<p>
Career readiness helps participants understand how to present
themselves professionally, explain their skills, prepare for
employment conversations, and connect their experience to healthcare
support roles.
</p>
</section>

<section style={styles.grid}>
<div style={styles.box}>
<h3>Healthcare Resume Basics</h3>
<p>
Participants learn how to highlight transferable skills,
healthcare training, customer service, reliability, communication,
and workplace readiness.
</p>
</div>

<div style={styles.box}>
<h3>Cover Letter Preparation</h3>
<p>
Participants review how to introduce themselves, explain interest
in healthcare roles, and connect their background to employer
needs.
</p>
</div>

<div style={styles.box}>
<h3>Interview Preparation</h3>
<p>
Participants practice answering common interview questions using
clear examples, confidence, and professional language.
</p>
</div>
</section>

<section style={styles.section}>
<h2>Learning Objectives</h2>
<ul>
<li>Identify skills that belong on a healthcare-focused resume</li>
<li>Understand how to tailor a resume to a job description</li>
<li>Practice explaining strengths during an interview</li>
<li>Recognize professional behaviors employers value</li>
<li>Connect training activities to employment readiness</li>
</ul>
</section>

<section style={styles.section}>
<h2>Workplace Application</h2>
<p>
Participants should be able to review a job posting, identify
matching skills, update resume language, prepare a short interview
response, and explain why they are interested in healthcare support
work.
</p>
</section>

<section style={styles.section}>
<h2>Mini Reflection</h2>
<p>
What are three skills you already have that could support a
healthcare employer? Think about communication, patience,
dependability, caregiving, customer service, or problem-solving.
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
