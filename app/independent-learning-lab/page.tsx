"use client";

import Link from "next/link";
import React from "react";

const learningTracks = [
{
title: "Medical Terminology Lab",
hours: "3 hrs",
description:
"Timed study guides, word-part practice, terminology reinforcement, and assessment preparation.",
},
{
title: "Medication Terminology Lab",
hours: "3 hrs",
description:
"Medication vocabulary, routes of administration, six rights awareness, and safety language.",
},
{
title: "Home & Community Healthcare Lab",
hours: "3 hrs",
description:
"Patient rights, privacy, dignity, autonomy, safety protocols, and care-team awareness.",
},
{
title: "Customer Service + Active Listening Lab",
hours: "4 hrs",
description:
"Active listening, empathy, tone, de-escalation, service recovery, and healthcare communication.",
},
{
title: "Digital Healthcare Systems Lab",
hours: "2 hrs",
description:
"EHR/EMR basics, patient portals, documentation workflows, reminders, e-prescriptions, scanning, and system navigation awareness.",
},
{
title: "Career Tools Lab",
hours: "2 hrs",
description:
"Resume builder, cover letter practice, interview prep, job search, and job log activity.",
},
{
title: "Final Knowledge Review",
hours: "1 hr",
description:
"Mixed review covering terminology, customer service, healthcare readiness, workplace scenarios, and career preparation.",
},
];

export default function IndependentLearningLabPage() {
return (
<main style={styles.main}>
<section style={styles.hero}>
<p style={styles.kicker}>22-Hour Learning Menu</p>
<h1 style={styles.title}>Training Labs</h1>
<p style={styles.subtitle}>
Self-paced learning activities completed outside of live sessions.
These labs support your SkillsQuest training and must be completed by
the end of Day 8.
</p>
</section>

<section style={styles.grid}>
{learningTracks.map((track) => (
<div key={track.title} style={styles.card}>
<div style={styles.cardTop}>
<h3>{track.title}</h3>
<span style={styles.hours}>{track.hours}</span>
</div>

<p style={styles.description}>{track.description}</p>

<span style={styles.comingSoon}>Coming Soon</span>
</div>
))}
</section>

<section style={styles.noteBox}>
<h2>Completion Requirement</h2>
<p>
All 22 hours of Independent Learning Labs must be completed by the end
of Day 8. You may complete these activities on non-class days or at your
own pace between sessions.
</p>
</section>

<Link href="/skillsquest" style={styles.button}>
Back to SkillsQuest
</Link>
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
fontSize: 42,
fontWeight: 950,
margin: "6px 0",
},
subtitle: {
color: "rgba(255,255,255,.75)",
lineHeight: 1.6,
maxWidth: 800,
},
grid: {
maxWidth: 1100,
margin: "0 auto",
display: "grid",
gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
gap: 16,
},
card: {
background: "rgba(255,255,255,.06)",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: 18,
padding: 18,
},
cardTop: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
marginBottom: 10,
},
hours: {
background: "rgba(125,183,255,.15)",
color: "#9ed0ff",
padding: "4px 10px",
borderRadius: 999,
fontSize: 12,
fontWeight: 900,
},
description: {
color: "rgba(255,255,255,.75)",
fontSize: 14,
lineHeight: 1.5,
},
comingSoon: {
display: "inline-block",
marginTop: 14,
background: "rgba(255,255,255,.1)",
padding: "8px 12px",
borderRadius: 10,
fontWeight: 700,
fontSize: 13,
},
noteBox: {
maxWidth: 900,
margin: "40px auto",
padding: 20,
borderRadius: 16,
background: "rgba(0,0,0,.35)",
border: "1px solid rgba(255,255,255,.12)",
},
button: {
display: "block",
width: "fit-content",
margin: "20px auto",
background: "#ffffff",
color: "#000",
padding: "12px 18px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 900,
},
};
