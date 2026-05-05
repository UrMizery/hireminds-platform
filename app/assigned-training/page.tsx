"use client";

import React from "react";

const assignedTrainings = [
{
title: "COVID-19 & Workplace Safety Awareness",
duration: "~1 hour",
type: "External Training",
category: "Workplace Safety & Infection Prevention",
storageKey: "assigned_covid_workplace_safety_request",
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
"How illness spreads through droplets, surfaces, close contact, and shared spaces",
"Workplace prevention strategies",
"Hand hygiene and cleaning practices",
"Staying home when sick and reporting illness appropriately",
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
}: {
title: string;
overview: string;
purpose: string;
objectives: string[];
topics: string[];
industries: string[];
duration: string;
type: string;
category: string;
storageKey: string;
}) {
const [requested, setRequested] = React.useState(false);

React.useEffect(() => {
setRequested(localStorage.getItem(storageKey) === "true");
}, [storageKey]);

function requestEnrollment() {
localStorage.setItem(storageKey, "true");
setRequested(true);
}

function cancelRequest() {
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
{objectives.map((item) => (
<li key={item} style={styles.listItem}>
{item}
</li>
))}
</ul>
</section>

<section style={styles.section}>
<h3>Key Topics Covered</h3>
<ul style={styles.list}>
{topics.map((item) => (
<li key={item} style={styles.listItem}>
{item}
</li>
))}
</ul>
</section>

<section style={styles.section}>
<h3>Workplace Application</h3>
<p style={styles.description}>
This training supports safe work practices across industries including:
</p>

<div style={styles.tagGrid}>
{industries.map((industry) => (
<span key={industry} style={styles.tag}>
{industry}
</span>
))}
</div>
</section>

<div style={styles.instructions}>
<strong>Enrollment Instructions:</strong>
<p>
Select “Request Enrollment” if you would like access to this assigned
external training. Your instructor or program team will provide access
instructions or next steps.
</p>
</div>

{requested ? (
<div style={styles.enrollmentCard}>
<strong>Enrollment Requested</strong>
<p style={styles.enrollmentText}>
Your request has been recorded. Your instructor or program team will
follow up with access instructions or next steps.
</p>

<div style={styles.actions}>
<span style={styles.requestedStatus}>Requested</span>

<button
type="button"
style={styles.secondaryButton}
onClick={cancelRequest}
>
Cancel Request
</button>
</div>
</div>
) : (
<div style={styles.actions}>
<span style={styles.pendingStatus}>Not Requested</span>

<button
type="button"
style={styles.primaryButton}
onClick={requestEnrollment}
>
Request Enrollment
</button>
</div>
)}
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
These trainings are completed outside of HireMinds and tracked here
for program coordination.
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
gap: 16,
},
card: {
background: "rgba(255,255,255,.06)",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: 20,
padding: 22,
},
cardTop: {
display: "flex",
justifyContent: "space-between",
gap: 16,
alignItems: "flex-start",
flexWrap: "wrap",
},
type: {
color: "#9ed0ff",
textTransform: "uppercase",
letterSpacing: 1.2,
fontSize: 12,
fontWeight: 900,
margin: 0,
},
cardTitle: {
fontSize: 24,
margin: "6px 0 0",
},
category: {
color: "rgba(255,255,255,.65)",
margin: "8px 0 0",
fontWeight: 700,
},
duration: {
background: "rgba(125,183,255,.15)",
color: "#9ed0ff",
padding: "6px 11px",
borderRadius: 999,
fontSize: 12,
fontWeight: 900,
whiteSpace: "nowrap",
},
section: {
marginTop: 18,
},
description: {
color: "rgba(255,255,255,.75)",
lineHeight: 1.6,
marginTop: 8,
},
list: {
paddingLeft: 20,
marginTop: 10,
},
listItem: {
color: "rgba(255,255,255,.78)",
marginBottom: 8,
lineHeight: 1.45,
},
tagGrid: {
display: "flex",
flexWrap: "wrap",
gap: 8,
marginTop: 12,
},
tag: {
background: "rgba(125,183,255,.13)",
border: "1px solid rgba(125,183,255,.20)",
color: "#b8dcff",
padding: "7px 10px",
borderRadius: 999,
fontSize: 12,
fontWeight: 800,
},
instructions: {
background: "rgba(0,0,0,.28)",
border: "1px solid rgba(255,255,255,.10)",
borderRadius: 14,
padding: 14,
marginTop: 18,
color: "rgba(255,255,255,.78)",
lineHeight: 1.55,
},
enrollmentCard: {
marginTop: 18,
padding: 16,
borderRadius: 14,
background: "rgba(125,183,255,.08)",
border: "1px solid rgba(125,183,255,.2)",
},
enrollmentText: {
marginTop: 6,
color: "rgba(255,255,255,.75)",
lineHeight: 1.5,
},
actions: {
display: "flex",
gap: 12,
alignItems: "center",
flexWrap: "wrap",
marginTop: 18,
},
requestedStatus: {
padding: "7px 11px",
borderRadius: 999,
fontSize: 12,
fontWeight: 900,
background: "rgba(125,183,255,.15)",
color: "#9ed0ff",
},
pendingStatus: {
padding: "7px 11px",
borderRadius: 999,
fontSize: 12,
fontWeight: 900,
background: "rgba(255,255,255,.08)",
color: "rgba(255,255,255,.65)",
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
