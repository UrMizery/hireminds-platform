"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const REQUIRED_CODE = "TWP2026";

type LabItem = {
title: string;
hours: string;
description: string;
href?: string;
status: "active" | "coming-soon";
};

const learningTracks: LabItem[] = [
{
title: "Medical Terminology Lab",
hours: "3 hrs",
description:
"Timed study guides, word-part practice, terminology reinforcement, and assessment preparation.",
href: "/independent-learning-lab/medical-terminology",
status: "coming-soon",
},
{
title: "Medication Terminology Lab",
hours: "3 hrs",
description:
"Medication vocabulary, routes of administration, six rights awareness, and safety language.",
href: "/independent-learning-lab/medication-terminology",
status: "coming-soon",
},
{
title: "Home & Community Healthcare Lab",
hours: "3 hrs",
description:
"Patient rights, privacy, dignity, autonomy, safety protocols, and care-team awareness.",
href: "/independent-learning-lab/home-community-healthcare",
status: "coming-soon",
},
{
title: "Customer Service + Active Listening Lab",
hours: "4 hrs",
description:
"Active listening, empathy, tone, de-escalation, service recovery, and healthcare communication.",
href: "/independent-learning-lab/customer-service",
status: "coming-soon",
},
{
title: "Digital Healthcare Systems Lab",
hours: "2 hrs",
description:
"EHR / EMR basics, patient portals, documentation workflows, reminders, e-prescriptions, scanning, and system navigation awareness.",
href: "/independent-learning-lab/ehr-emr-basics",
status: "coming-soon",
},
{
title: "Workplace Simulation Lab",
hours: "4 hrs",
description:
"Patient intake, upset patient response, HIPAA privacy, home visit safety, medication route recognition, and job search scenarios.",
href: "/independent-learning-lab/simulations",
status: "coming-soon",
},
{
title: "Career Tools Lab",
hours: "2 hrs",
description:
"Resume builder, cover letter practice, interview prep, job search, and job log activity.",
href: "/independent-learning-lab/career-tools",
status: "coming-soon",
},
{
title: "Final Knowledge Review",
hours: "1 hr",
description:
"Mixed review covering terminology, customer service, healthcare readiness, workplace scenarios, and career preparation.",
href: "/independent-learning-lab/final-review",
status: "coming-soon",
},
];

const simulations = [
"Patient Intake Simulation",
"Upset Patient / De-escalation Simulation",
"HIPAA Privacy Scenario",
"Medication Route Recognition",
"Home Visit Safety Scenario",
"EHR / EMR Documentation Awareness",
"Healthcare Job Search Simulation",
"Interview Response Simulation",
];

export default function IndependentLearningLabPage() {
const [allowed, setAllowed] = useState(false);
const [checked, setChecked] = useState(false);

useEffect(() => {
async function checkAccess() {
const {
data: { session },
} = await supabase.auth.getSession();

const user = session?.user;

const userReferralCode = String(
user?.user_metadata?.referral_code ||
user?.user_metadata?.referralCode ||
user?.user_metadata?.access_code ||
""
)
.trim()
.toUpperCase();

setAllowed(userReferralCode === REQUIRED_CODE);
setChecked(true);
}

checkAccess();
}, []);

if (!checked) {
return <main style={styles.main}>Loading Independent Learning Lab...</main>;
}

if (!allowed) {
return (
<main style={styles.main}>
<section style={styles.lockCard}>
<p style={styles.kicker}>Restricted Learning Area</p>
<h1 style={styles.title}>Independent Learning Lab Locked</h1>
<p style={styles.subtitle}>
This learning area is currently available only to approved participants.
</p>
<Link href="/" style={styles.primaryButton}>
Return Home
</Link>
</section>
</main>
);
}

return (
<main style={styles.main}>
<section style={styles.hero}>
<p style={styles.kicker}>SkillsQuest</p>
<h1 style={styles.title}>Independent Learning Lab</h1>
<p style={styles.subtitle}>
A 22-hour self-paced training lab with timed study guides, active-learning
checkpoints, simulations, readings, hands-on tasks, and assessments.
</p>
</section>

<section style={styles.summaryGrid}>
<div style={styles.summaryCard}>
<h3>22 Hours</h3>
<p>Timed self-paced learning</p>
</div>

<div style={styles.summaryCard}>
<h3>Active Checks</h3>
<p>Mini questions and tasks to confirm active study</p>
</div>

<div style={styles.summaryCard}>
<h3>Simulations</h3>
<p>Healthcare workplace practice scenarios</p>
</div>

<div style={styles.summaryCard}>
<h3>Assessments</h3>
<p>Unlocked after required study time is completed</p>
</div>
</section>

<section style={styles.noticeBox}>
<p style={styles.programLabel}>Active Learning Rules</p>
<h2 style={styles.sectionTitle}>Timed + Tracked Self-Paced Learning</h2>
<p style={styles.bodyText}>
Each self-paced study guide is timed and saves progress if the participant
logs off. Random checkpoint questions or tasks appear at 15, 30, 45, 60,
and 90 minutes. The 15-minute checkpoint is a warning only. Missed
checkpoints after that may reduce recorded progress.
</p>
</section>

<section style={styles.gridSection}>
<p style={styles.programLabel}>22-Hour Learning Menu</p>
<h2 style={styles.sectionTitle}>Training Labs</h2>

<div style={styles.grid}>
{learningTracks.map((track) => (
<div key={track.title} style={styles.card}>
<div style={styles.cardTop}>
<h3 style={styles.cardTitle}>{track.title}</h3>
<span style={styles.hourBadge}>{track.hours}</span>
</div>

<p style={styles.cardText}>{track.description}</p>

{track.status === "active" && track.href ? (
<Link href={track.href} style={styles.primaryButton}>
Open Lab
</Link>
) : (
<span style={styles.disabledButton}>Coming Soon</span>
)}
</div>
))}
</div>
</section>

<section style={styles.simulationSection}>
<p style={styles.programLabel}>Practice Lab</p>
<h2 style={styles.sectionTitle}>Workplace Simulations</h2>
<p style={styles.bodyText}>
Simulations help participants apply what they learned before entering
healthcare workplace settings.
</p>

<div style={styles.simGrid}>
{simulations.map((simulation) => (
<div key={simulation} style={styles.simCard}>
<h3>{simulation}</h3>
<p>
Scenario-based activity with timed participation, response practice,
and assessment review.
</p>
<span style={styles.disabledButton}>Coming Soon</span>
</div>
))}
</div>
</section>

<section style={styles.bottomActions}>
<Link href="/skillsquest" style={styles.secondaryButton}>
Back to Career Pathway Program
</Link>

<Link href="/applied-learning-lab" style={styles.primaryButton}>
Open Applied Learning Lab
</Link>
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
maxWidth: 1180,
margin: "0 auto 28px",
},
kicker: {
color: "#7db7ff",
fontWeight: 900,
letterSpacing: 1.4,
textTransform: "uppercase",
fontSize: 12,
},
title: {
fontSize: 52,
fontWeight: 950,
margin: "8px 0",
},
subtitle: {
fontSize: 16,
lineHeight: 1.7,
color: "rgba(255,255,255,.78)",
maxWidth: 900,
},
summaryGrid: {
maxWidth: 1180,
margin: "0 auto 24px",
display: "grid",
gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
gap: 14,
},
summaryCard: {
background: "rgba(255,255,255,.065)",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: 20,
padding: 20,
},
noticeBox: {
maxWidth: 1180,
margin: "0 auto 24px",
padding: 24,
borderRadius: 24,
background:
"linear-gradient(135deg, rgba(10,132,255,.18), rgba(255,255,255,.055))",
border: "1px solid rgba(255,255,255,.14)",
},
programLabel: {
color: "#9ed0ff",
fontWeight: 900,
textTransform: "uppercase",
letterSpacing: 1.2,
fontSize: 12,
margin: 0,
},
sectionTitle: {
fontSize: 30,
margin: "8px 0 10px",
fontWeight: 950,
},
bodyText: {
color: "rgba(255,255,255,.78)",
lineHeight: 1.65,
maxWidth: 900,
},
gridSection: {
maxWidth: 1180,
margin: "0 auto 24px",
},
grid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
gap: 16,
marginTop: 16,
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
},
cardTitle: {
margin: 0,
fontSize: 20,
},
hourBadge: {
background: "rgba(125,183,255,.16)",
color: "#9ed0ff",
padding: "6px 10px",
borderRadius: 999,
fontSize: 12,
fontWeight: 900,
whiteSpace: "nowrap",
},
cardText: {
color: "rgba(255,255,255,.72)",
lineHeight: 1.55,
marginTop: 12,
},
simulationSection: {
maxWidth: 1180,
margin: "24px auto 0",
padding: 24,
borderRadius: 24,
background: "rgba(10,132,255,.08)",
border: "1px solid rgba(125,183,255,.16)",
},
simGrid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
gap: 16,
marginTop: 16,
},
simCard: {
background: "rgba(0,0,0,.28)",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: 16,
padding: 18,
},
primaryButton: {
background: "#0A84FF",
color: "#fff",
padding: "11px 15px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 900,
display: "inline-block",
marginTop: 12,
},
secondaryButton: {
background: "#ffffff",
color: "#000000",
padding: "11px 15px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 900,
display: "inline-block",
marginTop: 12,
},
disabledButton: {
background: "rgba(255,255,255,.09)",
color: "rgba(255,255,255,.55)",
padding: "11px 15px",
borderRadius: 12,
fontWeight: 900,
display: "inline-block",
marginTop: 12,
},
bottomActions: {
maxWidth: 1180,
margin: "28px auto 0",
display: "flex",
gap: 12,
flexWrap: "wrap",
},
lockCard: {
maxWidth: 650,
margin: "100px auto",
padding: 30,
borderRadius: 22,
background: "rgba(255,255,255,.06)",
border: "1px solid rgba(255,255,255,.12)",
},
};
