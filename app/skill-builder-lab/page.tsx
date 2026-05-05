"use client";

import React from "react";

const skillBuilders = [
{
title: "Healthcare Communication Builder",
category: "Communication",
description:
"Practice professional language, empathy, active listening, and clear responses for healthcare and customer-facing roles.",
activities: [
"Practice greeting a patient professionally",
"Rewrite a rushed response into a calm response",
"Identify empathy statements",
"Practice explaining next steps clearly",
],
},
{
title: "Medical Terminology Drills",
category: "Terminology",
description:
"Build confidence with prefixes, root words, suffixes, and common healthcare terms through short drills.",
activities: [
"Break down medical words into parts",
"Match prefixes to meanings",
"Match suffixes to conditions or procedures",
"Practice common healthcare terms",
],
},
{
title: "Customer Service Practice",
category: "Service Skills",
description:
"Strengthen service recovery, tone, patience, and professionalism when supporting patients, clients, or customers.",
activities: [
"Choose the best response to an upset customer",
"Practice de-escalation language",
"Identify professional vs. unprofessional tone",
"Create a service recovery response",
],
},
{
title: "Workplace Readiness Skills",
category: "Workplace Readiness",
description:
"Practice reliability, attendance, communication, teamwork, safety, and professional responsibility.",
activities: [
"Identify workplace expectations",
"Practice calling out professionally",
"Review safety and hygiene expectations",
"Choose appropriate workplace responses",
],
},
{
title: "Resume Skills Translation",
category: "Career Readiness",
description:
"Turn newly learned skills into resume language that matches healthcare and entry-level job postings.",
activities: [
"Translate training into resume bullets",
"Match skills to job descriptions",
"Identify transferable skills",
"Create healthcare-focused resume phrases",
],
},
{
title: "Confidence Builder",
category: "Career Confidence",
description:
"Practice talking about your strengths, training, goals, and readiness for healthcare roles.",
activities: [
"Write a short career confidence statement",
"Practice answering 'Tell me about yourself'",
"Identify strengths from past experience",
"Connect training to your next job goal",
],
},
];

export default function SkillBuilderLabPage() {
return (
<main style={styles.main}>
<section style={styles.hero}>
<p style={styles.kicker}>SkillsQuest</p>
<h1 style={styles.title}>Skill Builder Lab</h1>
<p style={styles.subtitle}>
Build and strengthen key workplace, healthcare, communication, and
career-readiness skills through short practice activities and guided
drills.
</p>
</section>

<section style={styles.grid}>
{skillBuilders.map((item) => (
<div key={item.title} style={styles.card}>
<p style={styles.category}>{item.category}</p>
<h2 style={styles.cardTitle}>{item.title}</h2>
<p style={styles.description}>{item.description}</p>

<h3 style={styles.activityTitle}>Practice Activities</h3>
<ul style={styles.list}>
{item.activities.map((activity) => (
<li key={activity} style={styles.listItem}>
{activity}
</li>
))}
</ul>

<span style={styles.comingSoon}>Coming Soon</span>
</div>
))}
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
hero: {
maxWidth: 1100,
margin: "0 auto 28px",
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
grid: {
maxWidth: 1100,
margin: "0 auto",
display: "grid",
gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
gap: 16,
},
card: {
background: "rgba(255,255,255,.06)",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: 20,
padding: 20,
},
category: {
color: "#9ed0ff",
textTransform: "uppercase",
letterSpacing: 1.2,
fontSize: 12,
fontWeight: 900,
margin: 0,
},
cardTitle: {
fontSize: 22,
margin: "8px 0 10px",
},
description: {
color: "rgba(255,255,255,.74)",
lineHeight: 1.55,
},
activityTitle: {
fontSize: 15,
marginTop: 16,
marginBottom: 8,
},
list: {
paddingLeft: 20,
marginTop: 8,
},
listItem: {
color: "rgba(255,255,255,.82)",
marginBottom: 8,
lineHeight: 1.45,
},
comingSoon: {
display: "inline-block",
marginTop: 12,
background: "rgba(255,255,255,.1)",
color: "rgba(255,255,255,.75)",
padding: "9px 12px",
borderRadius: 10,
fontWeight: 800,
fontSize: 13,
},
};
