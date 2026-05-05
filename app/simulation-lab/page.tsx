"use client";

import React from "react";

const simulations = [
{
title: "Patient Intake Simulation",
category: "Healthcare Operations",
storageKey: "simulation_patient_intake",
description:
"Practice collecting patient information, verifying details, and communicating professionally during intake.",
scenario:
"A new patient arrives and needs to be checked in. You must gather their information while maintaining professionalism and accuracy.",
},
{
title: "Upset Patient / De-escalation",
category: "Customer Service",
storageKey: "simulation_deescalation",
description:
"Practice calming an upset patient using empathy, tone control, and service recovery techniques.",
scenario:
"A patient is frustrated about wait times. You must respond professionally and de-escalate the situation.",
},
{
title: "HIPAA Privacy Scenario",
category: "Compliance",
storageKey: "simulation_hipaa_privacy",
description:
"Identify what information can and cannot be shared while maintaining patient confidentiality.",
scenario:
"A family member asks for patient details. You must determine what can be shared appropriately.",
},
{
title: "Medication Route Recognition",
category: "Terminology",
storageKey: "simulation_medication_route",
description:
"Recognize medication routes and understand basic terminology used in healthcare settings.",
scenario:
"You are reviewing medication instructions and must identify correct administration methods.",
},
{
title: "Home Visit Safety Scenario",
category: "Safety",
storageKey: "simulation_home_visit_safety",
description:
"Identify potential safety risks during home visits and respond appropriately.",
scenario:
"You enter a patient’s home and notice safety hazards. You must determine the correct course of action.",
},
{
title: "Healthcare Job Search Simulation",
category: "Career Readiness",
storageKey: "simulation_healthcare_job_search",
description:
"Practice reviewing job postings, identifying fit, and preparing to apply.",
scenario:
"You are searching for a healthcare role and must decide which job matches your skills and training.",
},
{
title: "Interview Response Simulation",
category: "Interview Prep",
storageKey: "simulation_interview_response",
description:
"Practice answering common healthcare interview questions with confidence and clarity.",
scenario:
"You are asked, 'Why do you want to work in healthcare?' Respond professionally and clearly.",
},
{
title: "EHR / EMR Documentation Awareness",
category: "Systems",
storageKey: "simulation_ehr_emr_documentation",
description:
"Understand basic documentation expectations and accuracy in digital systems.",
scenario:
"You must review and correct a patient record for accuracy and completeness.",
},
];

function SimulationCard({
title,
category,
description,
scenario,
storageKey,
}: {
title: string;
category: string;
description: string;
scenario: string;
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

<div style={styles.scenarioBox}>
<strong>Scenario:</strong>
<p style={styles.scenarioText}>{scenario}</p>
</div>

<div style={styles.responseBox}>
<strong>Practice Task:</strong>
<p style={styles.scenarioText}>
Read the scenario and think through how you would respond in a real
workplace setting. After completing the activity with your trainer,
worksheet, or assigned practice prompt, mark this simulation complete.
</p>
</div>

<div style={styles.actions}>
{completed ? (
<button
type="button"
onClick={markIncomplete}
style={styles.secondaryButton}
>
Mark Incomplete
</button>
) : (
<button
type="button"
onClick={markComplete}
style={styles.primaryButton}
>
Mark Complete
</button>
)}
</div>
</div>
);
}

export default function SimulationLabPage() {
const [completedCount, setCompletedCount] = React.useState(0);

React.useEffect(() => {
refreshProgress();
}, []);

function refreshProgress() {
const count = simulations.filter(
(item) => localStorage.getItem(item.storageKey) === "true"
).length;

setCompletedCount(count);
}

return (
<main style={styles.main} onClick={refreshProgress}>
<section style={styles.hero}>
<p style={styles.kicker}>SkillsQuest</p>
<h1 style={styles.title}>Simulation Lab</h1>
<p style={styles.subtitle}>
Apply your knowledge through self-paced real-world scenarios. These
simulations help prepare you for workplace situations in healthcare,
customer service, documentation, safety, and job search readiness.
</p>

<div style={styles.progressBox}>
<strong>Progress</strong>
<span>
{completedCount}/{simulations.length} completed
</span>
</div>
</section>

<section style={styles.grid}>
{simulations.map((sim) => (
<SimulationCard key={sim.storageKey} {...sim} />
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
scenarioBox: {
marginTop: 14,
padding: 12,
borderRadius: 12,
background: "rgba(0,0,0,.28)",
border: "1px solid rgba(255,255,255,.1)",
},
responseBox: {
marginTop: 12,
padding: 12,
borderRadius: 12,
background: "rgba(125,183,255,.08)",
border: "1px solid rgba(125,183,255,.15)",
},
scenarioText: {
marginTop: 6,
color: "rgba(255,255,255,.82)",
lineHeight: 1.55,
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
