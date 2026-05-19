"use client";

import Link from "next/link";
import StudyGuideTimer from "../../components/StudyGuideTimer";

export default function CareerReadinessModuleOnePage() {
return (
<main style={styles.main}>
<section style={styles.card}>
<p style={styles.kicker}>TWP2026 • Career Readiness • Demo Guide 1</p>

<h1 style={styles.title}>Healthcare-Focused Resume Basics</h1>

<p style={styles.subtitle}>
This guide helps participants understand how to build a resume that
connects their experience, strengths, training, and transferable skills
to healthcare support roles.
</p>

<StudyGuideTimer
module="twp_career_readiness_module_1"
completionKey="twp_career_readiness_module_1"
requiredSeconds={30}
/>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>Why the Resume Matters</h2>
<div style={styles.box}>
<p>
A resume is often the first impression an employer sees. For
healthcare support roles, the resume should show that the
participant can communicate professionally, follow instructions,
support safety, work with people, and show reliability.
</p>
<p>
The goal is not to list everything a person has ever done. The
goal is to highlight the experience and skills that connect to the
job they want.
</p>
</div>
</section>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>What to Include</h2>

<div style={styles.stack}>
<div style={styles.box}>
<h3 style={styles.boxTitle}>Contact Information</h3>
<p>
Full name, phone number, professional email, city/state, and
optional LinkedIn or Career Passport link.
</p>
</div>

<div style={styles.box}>
<h3 style={styles.boxTitle}>Professional Summary</h3>
<p>
A short introduction that explains the participant’s strengths,
target role, and workplace value.
</p>
</div>

<div style={styles.box}>
<h3 style={styles.boxTitle}>Skills Section</h3>
<p>
Include skills such as customer service, communication,
documentation, scheduling, teamwork, problem-solving, safety
awareness, and reliability.
</p>
</div>

<div style={styles.box}>
<h3 style={styles.boxTitle}>Experience</h3>
<p>
Work, volunteer, caregiving, training, internship, community,
or life experience can all show transferable skills.
</p>
</div>
</div>
</section>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>Healthcare Resume Language</h2>
<div style={styles.box}>
<ul>
<li>Communicated professionally with customers or clients</li>
<li>Maintained confidentiality and followed instructions</li>
<li>Supported scheduling, documentation, or front desk tasks</li>
<li>Demonstrated patience, empathy, and problem-solving</li>
<li>Worked as part of a team in fast-paced environments</li>
<li>Handled questions, concerns, or service needs respectfully</li>
</ul>
</div>
</section>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>Practice Prompt</h2>
<div style={styles.discussionBox}>
<p>
Write down three skills you already have that could support a
healthcare employer. Then write one sentence showing how you used
one of those skills in a real situation.
</p>
</div>
</section>

<div style={styles.buttons}>
<Link href="/career-readiness-demo" style={styles.secondaryButton}>
Back to Career Readiness
</Link>

<Link href="/career-readiness-demo/module-2" style={styles.button}>
Next: Guide 2 →
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
maxWidth: 1050,
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
stack: {
display: "flex",
flexDirection: "column",
gap: 18,
},
box: {
padding: 26,
borderRadius: 18,
background: "rgba(0,0,0,.35)",
border: "1px solid rgba(255,255,255,.10)",
},
boxTitle: {
fontSize: 24,
marginBottom: 14,
color: "#7db7ff",
},
discussionBox: {
padding: 22,
borderRadius: 18,
background: "rgba(125,183,255,.10)",
border: "1px solid rgba(125,183,255,.20)",
},
buttons: {
display: "flex",
gap: 12,
flexWrap: "wrap",
marginTop: 28,
},
button: {
display: "inline-block",
background: "#fff",
color: "#000",
padding: "12px 18px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 900,
},
secondaryButton: {
display: "inline-block",
background: "rgba(255,255,255,.09)",
color: "#fff",
padding: "12px 18px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 900,
border: "1px solid rgba(255,255,255,.16)",
},
};
