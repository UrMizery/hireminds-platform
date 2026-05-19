"use client";

import Link from "next/link";

export default function OrientationDemoPage() {
return (
<main style={styles.main}>
<section style={styles.card}>
<p style={styles.kicker}>TWP2026 • Day 1</p>

<h1 style={styles.title}>Orientation + Platform Navigation</h1>

<p style={styles.subtitle}>
This orientation is instructor-led and introduces participants to
HireMinds, the Healthcare Career Pathway Program, expectations,
navigation, and an overview of the upcoming learning experience.
</p>

<div style={styles.banner}>
<strong>Live Instructor Session</strong>
<p>
This training is completed together in class and does not require
self-paced study guides or timed completion.
</p>
</div>

<section style={styles.section}>
<h2>What We Will Review</h2>

<div style={styles.grid}>
<div style={styles.box}>
<h3>Platform Navigation</h3>

<p>
Participants will receive a guided walkthrough of HireMinds and
become familiar with the tools, resources, and learning areas
used throughout the Healthcare Career Pathway Program.
</p>

<p>
During orientation we will review where to locate Career Pathway
content, SkillsQuest activities, assigned training, study
guides, notes, assessments, certifications, and training
progress.
</p>

<p>
Additional platform features including resume tools, interview
preparation resources, career development tools, and learning
activities will also be introduced to help participants
understand how HireMinds supports employment readiness during
and after training.
</p>
</div>

<div style={styles.box}>
<h3>Program Orientation + Expectations</h3>

<p>
Participants will review course expectations and receive a
complete overview of the Healthcare Career Pathway Program
structure.
</p>

<p>
Training schedules, participation expectations, communication
guidelines, classroom procedures, guided study materials,
assessments, demonstrations, and career preparation activities
will be reviewed.
</p>

<p>
Participants will have an opportunity to ask questions, discuss
personal goals, and understand what successful completion of the
program looks like.
</p>
</div>

<div style={styles.box}>
<h3>Healthcare Pathway Overview</h3>

<p>
Participants will be introduced to healthcare support careers,
customer service expectations, communication skills, safety
awareness, and workforce readiness.
</p>

<p>
The session will explain how the three-week pathway connects
career readiness, CPR and First Aid awareness, customer service,
medical terminology, healthcare career exploration, home and
community-based care, and job search preparation.
</p>
</div>

<div style={styles.box}>
<h3>Career Passport Overview</h3>

<p>
Participants will receive an introduction to Career Passport and
learn how HireMinds can support resume creation, career
exploration, professional branding, and long-term employment
readiness.
</p>

<p>
Participants will also learn how Career Passport connects
skills, training activities, and career preparation into one
centralized experience.
</p>
</div>
</div>
</section>

<section style={styles.section}>
<h2>Learning Objectives</h2>

<ul>
<li>Navigate the HireMinds platform</li>
<li>Understand the Healthcare Career Pathway structure</li>
<li>Review program expectations and completion steps</li>
<li>Understand where study guides and assessments are located</li>
<li>Identify how Career Passport supports employment readiness</li>
<li>Set personal goals for the training experience</li>
</ul>
</section>

<section style={styles.section}>
<h2>Class Discussion</h2>

<p>
Think about one personal or career goal you hope to accomplish
during this program. This may include gaining confidence, improving
your resume, preparing for interviews, learning healthcare
terminology, exploring healthcare careers, or becoming more prepared
for job applications.
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
color: "#fff",
padding: 24,
fontFamily: "system-ui",
},
card: {
maxWidth: 1050,
margin: "0 auto",
padding: 28,
background: "rgba(255,255,255,.06)",
borderRadius: 22,
border: "1px solid rgba(255,255,255,.12)",
lineHeight: 1.65,
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
color: "rgba(255,255,255,.75)",
maxWidth: 900,
},
banner: {
marginTop: 25,
padding: 18,
background: "rgba(10,132,255,.15)",
border: "1px solid rgba(125,183,255,.22)",
borderRadius: 16,
},
section: {
marginTop: 30,
},
grid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
gap: 15,
},
box: {
padding: 18,
borderRadius: 16,
background: "rgba(0,0,0,.3)",
border: "1px solid rgba(255,255,255,.1)",
},
button: {
display: "inline-block",
marginTop: 25,
background: "#fff",
color: "#000",
padding: "12px 18px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 900,
},
};
