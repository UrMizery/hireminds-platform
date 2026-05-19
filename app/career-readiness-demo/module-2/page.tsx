"use client";

import Link from "next/link";
import StudyGuideTimer from "../../components/StudyGuideTimer";

export default function CareerReadinessModuleTwoPage() {
return (
<main style={styles.main}>
<section style={styles.card}>
<p style={styles.kicker}>TWP2026 • Career Readiness • Demo Guide 2</p>

<h1 style={styles.title}>Job Description + Cover Letter Preparation</h1>

<p style={styles.subtitle}>
This guide helps participants read healthcare job descriptions,
identify employer needs, pull out keywords, and begin connecting
their experience to a short professional cover letter.
</p>

<StudyGuideTimer
module="twp_career_readiness_module_2"
completionKey="twp_career_readiness_module_2"
requiredSeconds={30}
/>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>Reading a Healthcare Job Description</h2>
<div style={styles.box}>
<p>
A job description tells you what the employer needs. Participants
should look for duties, required skills, preferred experience,
schedule expectations, physical requirements, and keywords that
should be reflected in their resume or cover letter.
</p>
<p>
Healthcare postings may mention communication, customer service,
documentation, confidentiality, patient interaction, scheduling,
safety awareness, transportation, teamwork, and reliability.
</p>
</div>
</section>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>What to Look For</h2>

<div style={styles.stack}>
<div style={styles.box}>
<h3 style={styles.boxTitle}>Required Qualifications</h3>
<p>
These are the skills, certifications, experience, or education
the employer says are needed for the role.
</p>
</div>

<div style={styles.box}>
<h3 style={styles.boxTitle}>Preferred Qualifications</h3>
<p>
These are helpful extras. Even if a participant does not have
every preferred item, they may still be able to apply if they
meet the required qualifications.
</p>
</div>

<div style={styles.box}>
<h3 style={styles.boxTitle}>Transferable Skills</h3>
<p>
Skills from caregiving, retail, food service, volunteering,
customer service, administrative work, or life experience may
connect to healthcare support roles.
</p>
</div>

<div style={styles.box}>
<h3 style={styles.boxTitle}>Keywords</h3>
<p>
Keywords are words from the job posting that should be used
naturally in the resume or cover letter when they match the
participant’s real experience.
</p>
</div>
</div>
</section>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>Cover Letter Basics</h2>

<div style={styles.box}>
<p>
A cover letter should be short, clear, and connected to the role.
It does not need to repeat the whole resume. It should introduce
the participant, explain interest in the position, connect skills
to the employer’s needs, and close professionally.
</p>

<ul>
<li>Paragraph 1: introduce yourself and the role you want.</li>
<li>Paragraph 2: connect your skills to the job description.</li>
<li>Paragraph 3: thank the employer and show interest in next steps.</li>
</ul>
</div>
</section>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>Practice Prompt</h2>
<div style={styles.discussionBox}>
<p>
Choose one healthcare job posting. Identify three keywords from
the posting and write one sentence that connects your experience,
training, or strengths to those keywords.
</p>
</div>
</section>

<div style={styles.buttons}>
<Link href="/career-readiness-demo" style={styles.secondaryButton}>
Back to Guide 1
</Link>

<Link href="/career-readiness-demo/module-3" style={styles.button}>
Next: Guide 3 →
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
