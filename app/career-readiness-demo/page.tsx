"use client";

import Link from "next/link";
import StudyGuideTimer from "../components/StudyGuideTimer";

const studyGuides = [
{
title: "Study Guide 1: Healthcare-Focused Resume Basics",
text:
"Participants learn how to build a resume that highlights customer service, safety awareness, communication, reliability, and transferable experience that connects to healthcare support roles.",
bullets: [
"Identify transferable skills",
"Highlight healthcare-related training",
"Use clear job-ready language",
"Connect experience to employer needs",
],
},
{
title: "Study Guide 2: Reading a Healthcare Job Description",
text:
"Participants practice reading job descriptions to identify required skills, preferred qualifications, schedule expectations, and keywords that should be reflected in a resume.",
bullets: [
"Locate required qualifications",
"Identify soft skills",
"Find industry keywords",
"Understand application requirements",
],
},
{
title: "Study Guide 3: Cover Letter Preparation",
text:
"Participants learn how to write a short, professional cover letter that explains interest in healthcare support work and connects their strengths to the role.",
bullets: [
"Introduce yourself professionally",
"Explain interest in the role",
"Connect skills to employer needs",
"Close with confidence",
],
},
{
title: "Study Guide 4: Interview Readiness",
text:
"Participants prepare for common healthcare interview questions and practice speaking clearly about experience, reliability, communication, and interest in serving others.",
bullets: [
"Practice common interview answers",
"Use examples from past experience",
"Explain strengths clearly",
"Prepare questions for the employer",
],
},
{
title: "Study Guide 5: Professionalism + Workplace Expectations",
text:
"Participants review employer expectations including attendance, communication, respectful behavior, confidentiality, accountability, and how to handle challenges professionally.",
bullets: [
"Show up prepared",
"Communicate early",
"Ask respectful questions",
"Follow workplace expectations",
],
},
{
title: "Study Guide 6: Career Readiness Review",
text:
"Participants connect resume preparation, interview practice, cover letters, and professionalism into one employment readiness plan.",
bullets: [
"Review resume strengths",
"Identify next steps",
"Prepare for applications",
"Set employment goals",
],
},
];

export default function CareerReadinessDemoPage() {
return (
<main style={styles.main}>
<section style={styles.card}>
<p style={styles.kicker}>TWP2026 • Day 2 Demo</p>

<h1 style={styles.title}>Career Readiness Training</h1>

<p style={styles.subtitle}>
This training helps participants prepare for healthcare employment by
connecting their skills, experience, training, and career goals to
resumes, cover letters, interviews, and workplace expectations.
</p>

<StudyGuideTimer
module="twp_career_readiness_demo"
completionKey="twp_career_readiness_demo"
requiredSeconds={30}
/>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>Training Purpose</h2>
<div style={styles.contentBox}>
<p>
Career readiness is more than applying for a job. It is the
process of preparing participants to understand what employers are
looking for, how to explain their strengths, how to present
themselves professionally, and how to move through the employment
process with confidence.
</p>
<p>
In healthcare support roles, employers often look for reliability,
communication, patience, safety awareness, professionalism,
customer service, and the ability to follow instructions. This
training helps participants recognize those strengths and connect
them to real job opportunities.
</p>
</div>
</section>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>Demo Study Guides</h2>

<div style={styles.guideStack}>
{studyGuides.map((guide) => (
<div key={guide.title} style={styles.guideCard}>
<h3 style={styles.guideTitle}>{guide.title}</h3>
<p style={styles.guideText}>{guide.text}</p>

<ul style={styles.list}>
{guide.bullets.map((bullet) => (
<li key={bullet}>{bullet}</li>
))}
</ul>
</div>
))}
</div>
</section>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>Healthcare Resume Focus</h2>
<div style={styles.contentBox}>
<p>
A healthcare-focused resume should show that the participant is
prepared to work with people, follow expectations, communicate
clearly, and support a safe and respectful environment.
</p>

<p>
Examples of resume language may include customer service,
appointment scheduling, documentation support, patient
communication, confidentiality awareness, safety awareness,
problem-solving, teamwork, and dependability.
</p>
</div>
</section>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>Interview Practice Prompts</h2>
<div style={styles.contentBox}>
<ul>
<li>Tell me about yourself.</li>
<li>Why are you interested in healthcare support work?</li>
<li>How do you handle an upset customer, patient, or family member?</li>
<li>Tell me about a time you had to be dependable.</li>
<li>How do you stay professional under pressure?</li>
</ul>
</div>
</section>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>Class Activity</h2>
<div style={styles.discussionBox}>
<p>
Choose one healthcare job posting. Identify three skills the
employer is asking for, then write one sentence explaining how
your experience or training connects to those skills.
</p>
</div>
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
guideTitle: {
color: "#7db7ff",
fontSize: 24,
marginBottom: 12,
},
guideText: {
color: "rgba(255,255,255,.82)",
},
list: {
marginTop: 12,
},
discussionBox: {
padding: 22,
borderRadius: 18,
background: "rgba(125,183,255,.10)",
border: "1px solid rgba(125,183,255,.20)",
},
button: {
display: "inline-block",
marginTop: 28,
background: "#fff",
color: "#000",
padding: "12px 18px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 900,
},
};
