"use client";

import React from "react";

const skillBuilders = [
{
title: "Healthcare Communication Builder",
category: "Communication",
storageKey: "skill_builder_healthcare_communication",
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
storageKey: "skill_builder_medical_terminology",
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
storageKey: "skill_builder_customer_service",
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
storageKey: "skill_builder_workplace_readiness",
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
storageKey: "skill_builder_resume_translation",
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
storageKey: "skill_builder_confidence",
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

function SkillBuilderCard({
title,
category,
description,
activities,
storageKey,
}: {
title: string;
category: string;
description: string;
activities: string[];
storageKey: string;
}) {
const [completed, setCompleted] = React.useState(false);

React.useEffect(() => {
setCompleted(localStorage.getItem(storageKey) === "true");
}, [storageKey]);

function markComplete() {
localStorage.setItem(storageKey, "true");
setCompleted(true);
}

function markIncomplete() {
localStorage.removeItem(storageKey);
setCompleted(false);
}

return (
<div style={styles.card}>
<div style={styles.cardTop}>
<div>
<p style={styles.category}>{category}</p>
<h2 style={styles.cardTitle}>{title}</h2>
</div>

<span
style={{
...styles.statusBadge,
background: completed
? "rgba(125,255,179,.15)"
: "rgba(255,255,255,.08)",
color: completed ? "#7dffb3" : "rgba(255,255,255,.65)",
}}
>
{completed ? "Completed" : "Not Completed"}
</span>
</div>

<p style={styles.description}>{description}</p>

<h3 style={styles.activityTitle}>Practice Activities</h3>
<ul style={styles.list}>
{activities.map((activity) => (
<li key={activity} style={styles.listItem}>
{activity}
</li>
))}
</ul>

<div style={styles.actions}>
{completed ? (
<button type="button" onClick={markIncomplete} style={styles.secondaryButton}>
Mark Incomplete
</button>
) : (
<button type="button" onClick={markComplete} style={styles.primaryButton}>
Mark Complete
</button>
)}
</div>
</div>
);
}

export default function SkillBuilderLabPage() {
const [completedCount, setCompletedCount] = React.useState(0);

React.useEffect(() => {
const count = skillBuilders.filter(
(item) => localStorage.getItem(item.storageKey) === "true"
).length;

setCompletedCount(count);
}, []);

function refreshProgress() {
const count = skillBuilders.filter(
(item) => localStorage.getItem(item.storageKey) === "true"
).length;

setCompletedCount(count);
}

return (
<main style={styles.main} onClick={refreshProgress}>
<section style={styles.hero}>
<p style={styles.kicker}>SkillsQuest</p>
<h1 style={styles.title}>Skill Builder Lab</h1>
<p style={styles.subtitle}>
Build and strengthen key workplace, healthcare, communication, and
career-readiness skills through short practice activities and guided drills.
</p>

<div style={styles.progressBox}>
<strong>Progress</strong>
<span>{completedCount}/{skillBuilders.length} completed</span>
</div>
</section>

<section style={styles.grid}>
{skillBuilders.map((item) => (
<SkillBuilderCard key={item.storageKey} {...item} />
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
progressBox: {
marginTop: 18,
display: "flex",
gap: 12,
flexWrap: "wrap",
alignItems: "center",
width: "fit-content",
padding: "12px 14px",
borderRadius: 14,
background: "rgba(255,255,255,.07)",
border: "1px solid rgba(255,255,255,.12)",
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
cardTop: {
display: "flex",
justifyContent: "space-between",
gap: 12,
alignItems: "flex-start",
flexWrap: "wrap",
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
statusBadge: {
padding: "7px 10px",
borderRadius: 999,
fontSize: 12,
fontWeight: 900,
whiteSpace: "nowrap",
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
actions: {
marginTop: 16,
},
primaryButton: {
background: "#ffffff",
color: "#000000",
border: "none",
borderRadius: 12,
padding: "10px 14px",
fontWeight: 900,
cursor: "pointer",
},
secondaryButton: {
background: "rgba(255,255,255,.09)",
color: "#ffffff",
border: "1px solid rgba(255,255,255,.14)",
borderRadius: 12,
padding: "10px 14px",
fontWeight: 900,
cursor: "pointer",
},
};
