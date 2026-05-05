"use client";

import React from "react";

const assignedTrainings = [
{
title: "COVID-19 & Workplace Safety Awareness",
duration: "~1 hour",
type: "External Training",
category: "Workplace Safety & Infection Prevention",
storageKey: "assigned_covid_request",
overview:
"This assigned training provides foundational knowledge on COVID-19 and general respiratory illness prevention in workplace environments. Participants will learn how illnesses spread, how to reduce risk, and how to follow workplace safety expectations across different industries.",
purpose:
"This training is designed to prepare participants for real-world work environments where safety, hygiene, and professional responsibility are critical.",
objectives: [
"Define COVID-19 and understand its role within broader respiratory illnesses",
"Identify common symptoms and recognize when to report illness",
"Explain how viruses spread in workplace environments",
"Apply basic infection prevention practices in daily work activities",
"Understand employer and employee responsibilities related to workplace safety",
"Demonstrate awareness of hygiene, sanitation, and exposure prevention",
"Respond appropriately to workplace safety concerns or emergencies",
],
topics: [
"Introduction to COVID-19 and respiratory illness",
"Symptoms, exposure, and risk awareness",
"How illness spreads through droplets, surfaces, and close contact",
"Workplace prevention strategies",
"Hand hygiene and cleaning practices",
"Staying home when sick and reporting illness",
"Employer expectations and workplace safety policies",
"Emergency preparedness basics",
"Communication and reporting procedures",
],
industries: [
"Healthcare",
"Food Service",
"Manufacturing",
"Warehousing & Distribution",
"Retail & Customer Service",
"Personal Care and Cosmetology",
],
},
];

function AssignedTrainingCard({
title,
overview,
purpose,
objectives,
topics,
industries,
duration,
type,
category,
storageKey,
}: any) {
const [requested, setRequested] = React.useState(false);

React.useEffect(() => {
setRequested(localStorage.getItem(storageKey) === "true");
}, [storageKey]);

function handleRequest() {
localStorage.setItem(storageKey, "true");
setRequested(true);
}

function resetRequest() {
localStorage.removeItem(storageKey);
setRequested(false);
}

return (
<div style={styles.card}>
<div style={styles.cardTop}>
<div>
<p style={styles.type}>{type}</p>
<h2 style={styles.cardTitle}>{title}</h2>
<p style={styles.category}>{category}</p>
</div>

<span style={styles.duration}>{duration}</span>
</div>

<section style={styles.section}>
<h3>Overview</h3>
<p style={styles.description}>{overview}</p>
<p style={styles.description}>{purpose}</p>
</section>

<section style={styles.section}>
<h3>Learning Objectives</h3>
<ul style={styles.list}>
{objectives.map((item: string) => (
<li key={item} style={styles.listItem}>
{item}
</li>
))}
</ul>
</section>

<section style={styles.section}>
<h3>Key Topics Covered</h3>
<ul style={styles.list}>
{topics.map((item: string) => (
<li key={item} style={styles.listItem}>
{item}
</li>
))}
</ul>
</section>

<section style={styles.section}>
<h3>Workplace Application</h3>
<div style={styles.tagGrid}>
{industries.map((industry: string) => (
<span key={industry} style={styles.tag}>
{industry}
</span>
))}
</div>
</section>

<div style={styles.instructions}>
<strong>How This Works:</strong>
<p>
Click “Request Enrollment” to let your instructor know you are ready to
take this training. You will receive instructions or access from your
program.
</p>
</div>

<div style={styles.actions}>
<span
style={{
...styles.status,
background: requested
? "rgba(125,183,255,.15)"
: "rgba(255,255,255,.08)",
color: requested ? "#9ed0ff" : "rgba(255,255,255,.65)",
}}
>
{requested ? "Requested" : "Not Requested"}
</span>

{requested ? (
<button
type="button"
style={styles.secondaryButton}
onClick={resetRequest}
>
Cancel Request
</button>
) : (
<button
type="button"
style={styles.primaryButton}
onClick={handleRequest}
>
Request Enrollment
</button>
)}
</div>
</div>
);
}

export default function AssignedTrainingPage() {
return (
<main style={styles.main}>
<section style={styles.hero}>
<p style={styles.kicker}>Career Pathway Program</p>
<h1 style={styles.title}>Assigned Training</h1>
<p style={styles.subtitle}>
Request access to external trainings assigned by your instructor.
</p>
</section>

<section style={styles.grid}>
{assignedTrainings.map((training) => (
<AssignedTrainingCard key={training.storageKey} {...training} />
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
hero: { maxWidth: 1100, margin: "0 auto 28px" },
kicker: { color: "#7db7ff", fontWeight: 900, fontSize: 12 },
title: { fontSize: 46, fontWeight: 950 },
subtitle: { color: "rgba(255,255,255,.76)" },
grid: { maxWidth: 1100, margin: "0 auto", display: "grid", gap: 16 },
card: {
background: "rgba(255,255,255,.06)",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: 20,
padding: 22,
},
cardTop: { display: "flex", justifyContent: "space-between" },
type: { color: "#9ed0ff", fontWeight: 900 },
cardTitle: { fontSize: 24 },
category: { color: "rgba(255,255,255,.6)" },
duration: { color: "#9ed0ff" },
section: { marginTop: 18 },
description: { color: "rgba(255,255,255,.75)" },
list: { paddingLeft: 20 },
listItem: { marginBottom: 6 },
tagGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
tag: {
background: "rgba(125,183,255,.13)",
padding: "6px 10px",
borderRadius: 999,
},
instructions: {
marginTop: 18,
background: "rgba(0,0,0,.28)",
padding: 12,
borderRadius: 10,
},
actions: { display: "flex", gap: 12, marginTop: 18 },
status: { padding: "6px 10px", borderRadius: 999 },
primaryButton: {
background: "#fff",
color: "#000",
padding: "8px 12px",
borderRadius: 10,
cursor: "pointer",
},
secondaryButton: {
background: "rgba(255,255,255,.1)",
color: "#fff",
padding: "8px 12px",
borderRadius: 10,
cursor: "pointer",
},
};
