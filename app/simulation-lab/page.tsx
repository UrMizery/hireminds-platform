"use client";

import React from "react";

const simulations = [
{
title: "Patient Intake Simulation",
category: "Healthcare Operations",
description:
"Practice collecting patient information, verifying details, and communicating professionally during intake.",
scenario:
"A new patient arrives and needs to be checked in. You must gather their information while maintaining professionalism and accuracy.",
},
{
title: "Upset Patient / De-escalation",
category: "Customer Service",
description:
"Practice calming an upset patient using empathy, tone control, and service recovery techniques.",
scenario:
"A patient is frustrated about wait times. You must respond professionally and de-escalate the situation.",
},
{
title: "HIPAA Privacy Scenario",
category: "Compliance",
description:
"Identify what information can and cannot be shared while maintaining patient confidentiality.",
scenario:
"A family member asks for patient details. You must determine what can be shared appropriately.",
},
{
title: "Medication Route Recognition",
category: "Terminology",
description:
"Recognize medication routes and understand basic terminology used in healthcare settings.",
scenario:
"You are reviewing medication instructions and must identify correct administration methods.",
},
{
title: "Home Visit Safety Scenario",
category: "Safety",
description:
"Identify potential safety risks during home visits and respond appropriately.",
scenario:
"You enter a patient’s home and notice safety hazards. You must determine the correct course of action.",
},
{
title: "Healthcare Job Search Simulation",
category: "Career Readiness",
description:
"Practice reviewing job postings, identifying fit, and preparing to apply.",
scenario:
"You are searching for a healthcare role and must decide which job matches your skills and training.",
},
{
title: "Interview Response Simulation",
category: "Interview Prep",
description:
"Practice answering common healthcare interview questions with confidence and clarity.",
scenario:
"You are asked, 'Why do you want to work in healthcare?' Respond professionally and clearly.",
},
{
title: "EHR / EMR Documentation Awareness",
category: "Systems",
description:
"Understand basic documentation expectations and accuracy in digital systems.",
scenario:
"You must review and correct a patient record for accuracy and completeness.",
},
];

export default function SimulationLabPage() {
return (
<main style={styles.main}>
<section style={styles.hero}>
<p style={styles.kicker}>SkillsQuest</p>
<h1 style={styles.title}>Simulation Lab</h1>
<p style={styles.subtitle}>
Apply your knowledge through real-world scenarios. These simulations
help prepare you for workplace situations in healthcare and
customer-facing roles.
</p>
</section>

<section style={styles.grid}>
{simulations.map((sim) => (
<div key={sim.title} style={styles.card}>
<p style={styles.category}>{sim.category}</p>
<h2 style={styles.cardTitle}>{sim.title}</h2>
<p style={styles.description}>{sim.description}</p>

<div style={styles.scenarioBox}>
<strong>Scenario:</strong>
<p style={styles.scenarioText}>{sim.scenario}</p>
</div>

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
scenarioBox: {
marginTop: 14,
padding: 12,
borderRadius: 12,
background: "rgba(0,0,0,.28)",
border: "1px solid rgba(255,255,255,.1)",
},
scenarioText: {
marginTop: 6,
color: "rgba(255,255,255,.82)",
},
comingSoon: {
display: "inline-block",
marginTop: 14,
background: "rgba(255,255,255,.1)",
color: "rgba(255,255,255,.75)",
padding: "9px 12px",
borderRadius: 10,
fontWeight: 800,
fontSize: 13,
},
};
