"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const guides = [
{
day: "Guide 1",
title: "Customer Service Foundations",
description: "Learn what strong customer service means in healthcare and workforce settings.",
path: "/customer-service-demo/guide-1",
key: "cs_guide_1_complete",
},
{
day: "Guide 2",
title: "Active Listening",
description: "Practice listening skills, clarifying questions, and respectful responses.",
path: "/customer-service-demo/guide-2",
key: "cs_guide_2_complete",
},
{
day: "Guide 3",
title: "Empathy + Emotional Intelligence",
description: "Understand how tone, patience, and emotional awareness build trust.",
path: "/customer-service-demo/guide-3",
key: "cs_guide_3_complete",
},
{
day: "Guide 4",
title: "De-escalation",
description: "Learn how to respond calmly when customers are upset or frustrated.",
path: "/customer-service-demo/guide-4",
key: "cs_guide_4_complete",
},
{
day: "Guide 5",
title: "Service Recovery + Documentation",
description: "Fix concerns professionally and document customer interactions correctly.",
path: "/customer-service-demo/guide-5",
key: "cs_guide_5_complete",
},
];

export default function CustomerServiceDemoHub() {
const [completed, setCompleted] = useState<Record<string, boolean>>({});

useEffect(() => {
const status: Record<string, boolean> = {};
guides.forEach((guide) => {
status[guide.key] = localStorage.getItem(guide.key) === "true";
});
setCompleted(status);
}, []);

const isUnlocked = (index: number) => {
if (index === 0) return true;
return completed[guides[index - 1].key];
};

const allComplete = guides.every((guide) => completed[guide.key]);

return (
<main style={styles.page}>
<section style={styles.hero}>
<p style={styles.kicker}>Day 4 • Demo Mode</p>
<h1 style={styles.title}>Customer Service Methodology</h1>
<p style={styles.subtitle}>
Active listening, empathy, de-escalation, service recovery, patient interaction examples,
and documentation of service interactions.
</p>
<p style={styles.note}>
Demo Mode • Each study guide uses a 30-second timer. Assessment unlocks after all 5 guides are complete.
</p>
</section>

<section style={styles.grid}>
{guides.map((guide, index) => {
const unlocked = isUnlocked(index);
const done = completed[guide.key];

return (
<div key={guide.key} style={done ? styles.cardDone : styles.card}>
<p style={styles.badge}>{guide.day}</p>
<h2 style={styles.cardTitle}>{guide.title}</h2>
<p style={styles.cardText}>{guide.description}</p>

{unlocked ? (
<Link href={guide.path} style={done ? styles.doneButton : styles.button}>
{done ? "Review Guide →" : "Start Demo →"}
</Link>
) : (
<button style={styles.lockedButton} disabled>
Locked
</button>
)}
</div>
);
})}
</section>

<section style={styles.assessmentBox}>
<h2 style={styles.assessmentTitle}>Customer Service Assessment</h2>
<p style={styles.cardText}>
Complete all 5 demo study guides to unlock the assessment. Score 80% or better to preview the certificate.
</p>

{allComplete ? (
<Link href="/customer-service-demo/assessment" style={styles.button}>
Start Assessment →
</Link>
) : (
<button style={styles.lockedButton} disabled>
Assessment Locked
</button>
)}
</section>
</main>
);
}

const styles: Record<string, React.CSSProperties> = {
page: {
minHeight: "100vh",
background: "linear-gradient(135deg, #050505, #111827, #020617)",
color: "white",
padding: "48px 6%",
fontFamily: "Arial, sans-serif",
},
hero: {
maxWidth: "1100px",
marginBottom: "32px",
},
kicker: {
color: "#38bdf8",
fontWeight: 800,
letterSpacing: "0.08em",
textTransform: "uppercase",
},
title: {
fontSize: "clamp(2.4rem, 6vw, 5rem)",
margin: "10px 0",
lineHeight: 1,
},
subtitle: {
fontSize: "1.2rem",
maxWidth: "950px",
color: "#d1d5db",
lineHeight: 1.7,
},
note: {
marginTop: "20px",
color: "#bae6fd",
fontWeight: 700,
},
grid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
gap: "22px",
},
card: {
border: "1px solid rgba(255,255,255,0.15)",
borderRadius: "24px",
padding: "28px",
background: "rgba(255,255,255,0.05)",
minHeight: "300px",
},
cardDone: {
border: "1px solid rgba(34,197,94,0.8)",
borderRadius: "24px",
padding: "28px",
background: "rgba(22,101,52,0.25)",
minHeight: "300px",
},
badge: {
display: "inline-block",
background: "rgba(255,255,255,0.12)",
padding: "8px 14px",
borderRadius: "999px",
fontWeight: 800,
},
cardTitle: {
fontSize: "1.6rem",
marginTop: "16px",
},
cardText: {
color: "#d1d5db",
lineHeight: 1.6,
},
button: {
display: "inline-block",
marginTop: "22px",
background: "#0ea5e9",
color: "white",
padding: "13px 22px",
borderRadius: "14px",
textDecoration: "none",
fontWeight: 800,
},
doneButton: {
display: "inline-block",
marginTop: "22px",
background: "#22c55e",
color: "white",
padding: "13px 22px",
borderRadius: "14px",
textDecoration: "none",
fontWeight: 800,
},
lockedButton: {
marginTop: "22px",
background: "#374151",
color: "#9ca3af",
padding: "13px 22px",
borderRadius: "14px",
border: "none",
fontWeight: 800,
},
assessmentBox: {
marginTop: "30px",
padding: "32px",
borderRadius: "24px",
border: "1px solid rgba(56,189,248,0.45)",
background: "rgba(14,165,233,0.08)",
},
assessmentTitle: {
fontSize: "2rem",
},
};
