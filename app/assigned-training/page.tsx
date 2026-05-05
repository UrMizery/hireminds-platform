"use client";

import React from "react";

const assignedTrainings = [
{
title: "COVID-19 & Workplace Safety Awareness",
duration: "~1 hour",
type: "External Training",
storageKey: "assigned_covid_workplace_safety_completed",
description:
"Covers COVID-19 awareness, workplace safety, infection prevention, and emergency preparedness. Participants learn how illness spreads, how to help prevent transmission, and what employers expect in maintaining a safe work environment.",
},
];

function AssignedTrainingCard({
title,
description,
duration,
type,
storageKey,
}: {
title: string;
description: string;
duration: string;
type: string;
storageKey: string;
}) {
const [completed, setCompleted] = React.useState(false);

React.useEffect(() => {
setCompleted(localStorage.getItem(storageKey) === "true");
}, [storageKey]);

function markCompleted() {
localStorage.setItem(storageKey, "true");
setCompleted(true);
}

function resetCompleted() {
localStorage.removeItem(storageKey);
setCompleted(false);
}

return (
<div style={styles.card}>
<div style={styles.cardTop}>
<div>
<p style={styles.type}>{type}</p>
<h2 style={styles.cardTitle}>{title}</h2>
</div>

<span style={styles.duration}>{duration}</span>
</div>

<p style={styles.description}>{description}</p>

<div style={styles.instructions}>
<strong>Instructions:</strong>
<p>
Complete this training using the external link or assignment provided
by your instructor. Return to HireMinds and mark it completed after
finishing.
</p>
</div>

<div style={styles.actions}>
<span
style={{
...styles.status,
background: completed
? "rgba(125,255,179,.15)"
: "rgba(255,255,255,.08)",
color: completed ? "#7dffb3" : "rgba(255,255,255,.65)",
}}
>
{completed ? "Completed" : "Pending"}
</span>

{completed ? (
<button type="button" style={styles.secondaryButton} onClick={resetCompleted}>
Mark Pending
</button>
) : (
<button type="button" style={styles.primaryButton} onClick={markCompleted}>
Mark Completed
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
Track external trainings assigned by your instructor. These trainings
are completed outside of HireMinds and marked here for progress
tracking.
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
duration: {
background: "rgba(125,183,255,.15)",
color: "#9ed0ff",
padding: "6px 11px",
borderRadius: 999,
fontSize: 12,
fontWeight: 900,
whiteSpace: "nowrap",
},
description: {
color: "rgba(255,255,255,.75)",
lineHeight: 1.6,
marginTop: 14,
},
instructions: {
background: "rgba(0,0,0,.28)",
border: "1px solid rgba(255,255,255,.10)",
borderRadius: 14,
padding: 14,
marginTop: 16,
color: "rgba(255,255,255,.78)",
lineHeight: 1.55,
},
actions: {
display: "flex",
gap: 12,
alignItems: "center",
flexWrap: "wrap",
marginTop: 18,
},
status: {
padding: "7px 11px",
borderRadius: 999,
fontSize: 12,
fontWeight: 900,
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
