"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AssessmentItem = {
title: string;
description: string;
href: string;
reviewHref: string;
unlockKeys: string[];
scoreKey: string;
attemptsKey: string;
totalAttemptsKey: string;
lockKey: string;
};

const assessments: AssessmentItem[] = [
{
title: "Medical Terminology Assessment",
description:
"Unlocked after all 5 Medical Terminology study guides are completed.",
href: "/medical-terminology-assessment",
reviewHref: "/medical-terminology-assessment",
unlockKeys: [
"medicalTerminology_module_1",
"medicalTerminology_module_2",
"medicalTerminology_module_3",
"medicalTerminology_module_4",
"medicalTerminology_module_5",
],
scoreKey: "medterm_score",
attemptsKey: "medterm_attempts_today",
totalAttemptsKey: "medterm_total_attempts",
lockKey: "medterm_lock_until",
},
{
title: "Healthcare Admin Assessment",
description:
"Unlocked after all 5 Home & Community-Based Healthcare study guides are completed.",
href: "/healthcare-admin-assessment",
reviewHref: "/healthcare-admin-assessment",
unlockKeys: [
"healthcareAdmin_module_1",
"healthcareAdmin_module_2",
"healthcareAdmin_module_3",
"healthcareAdmin_module_4",
"healthcareAdmin_module_5",
],
scoreKey: "healthadmin_score",
attemptsKey: "healthadmin_attempts_today",
totalAttemptsKey: "healthadmin_total_attempts",
lockKey: "healthadmin_lock_until",
},
];

export default function AppliedLearningLabPage() {
const [ready, setReady] = useState(false);
const [stateMap, setStateMap] = useState<Record<string, any>>({});

useEffect(() => {
const now = Date.now();
const map: Record<string, any> = {};

assessments.forEach((assessment) => {
const unlocked = assessment.unlockKeys.every(
(key) => localStorage.getItem(key) === "true"
);

const scoreRaw = localStorage.getItem(assessment.scoreKey);
const score = scoreRaw ? Number(scoreRaw) : null;

const attemptsToday = Number(
localStorage.getItem(assessment.attemptsKey) || 0
);

const totalAttempts = Number(
localStorage.getItem(assessment.totalAttemptsKey) || 0
);

const lockUntil = Number(localStorage.getItem(assessment.lockKey) || 0);
const lockedUntil = lockUntil && now < lockUntil ? lockUntil : null;

map[assessment.title] = {
unlocked,
score,
attemptsToday,
totalAttempts,
lockedUntil,
passed: score !== null && score >= 80,
};
});

setStateMap(map);
setReady(true);
}, []);

if (!ready) {
return <main style={styles.main}>Loading Applied Learning Lab...</main>;
}

return (
<main style={styles.main}>
<section style={styles.hero}>
<p style={styles.kicker}>SkillsQuest</p>
<h1 style={styles.title}>Applied Learning Lab</h1>
<p style={styles.subtitle}>
Track assessment status, attempts, scores, lockouts, review access,
and certificates.
</p>
</section>

<section style={styles.grid}>
{assessments.map((assessment) => {
const item = stateMap[assessment.title];
const lockedUntilText = item.lockedUntil
? new Date(item.lockedUntil).toLocaleString()
: null;

return (
<div key={assessment.title} style={styles.card}>
<div style={styles.cardTop}>
<h2 style={styles.cardTitle}>{assessment.title}</h2>

<span
style={{
...styles.statusBadge,
...(item.lockedUntil
? styles.lockedBadge
: item.passed
? styles.passBadge
: item.unlocked
? styles.unlockedBadge
: styles.lockedBadge),
}}
>
{item.lockedUntil
? "24-Hour Lockout"
: item.passed
? "Passed"
: item.unlocked
? "Unlocked"
: "Locked"}
</span>
</div>

<p style={styles.text}>{assessment.description}</p>

<div style={styles.stats}>
<div>
<strong>Score</strong>
<span>{item.score !== null ? `${item.score}%` : "Not taken"}</span>
</div>

<div>
<strong>Attempts Today</strong>
<span>{item.attemptsToday}/2</span>
</div>

<div>
<strong>Total Failed Attempts</strong>
<span>{item.totalAttempts}/4</span>
</div>
</div>

{lockedUntilText ? (
<p style={styles.warning}>
Locked until: {lockedUntilText}
</p>
) : null}

<div style={styles.actions}>
{item.lockedUntil ? (
<span style={styles.disabledButton}>
Locked for 24 Hours
</span>
) : item.unlocked ? (
<Link href={assessment.href} style={styles.primaryButton}>
{item.score !== null ? "Retake / Review" : "Start Assessment"}
</Link>
) : (
<span style={styles.disabledButton}>
Complete all study guides first
</span>
)}

{item.score !== null ? (
<Link href={assessment.reviewHref} style={styles.secondaryButton}>
Review Results
</Link>
) : null}
</div>
</div>
);
})}
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
letterSpacing: 1.4,
textTransform: "uppercase",
fontSize: 12,
},
title: {
fontSize: 46,
fontWeight: 950,
margin: "8px 0",
},
subtitle: {
color: "rgba(255,255,255,.75)",
lineHeight: 1.6,
maxWidth: 760,
},
grid: {
maxWidth: 1100,
margin: "0 auto",
display: "grid",
gap: 18,
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
gap: 12,
alignItems: "center",
flexWrap: "wrap",
},
cardTitle: {
margin: 0,
fontSize: 22,
},
text: {
color: "rgba(255,255,255,.72)",
lineHeight: 1.55,
},
statusBadge: {
padding: "7px 11px",
borderRadius: 999,
fontSize: 12,
fontWeight: 900,
},
unlockedBadge: {
background: "rgba(125,183,255,.16)",
color: "#9ed0ff",
},
passBadge: {
background: "rgba(125,255,179,.16)",
color: "#7dffb3",
},
lockedBadge: {
background: "rgba(255,255,255,.09)",
color: "rgba(255,255,255,.65)",
},
stats: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
gap: 12,
marginTop: 16,
},
warning: {
color: "#ffcf7d",
fontWeight: 800,
marginTop: 16,
},
actions: {
display: "flex",
gap: 10,
flexWrap: "wrap",
marginTop: 18,
},
primaryButton: {
background: "#0A84FF",
color: "#fff",
padding: "11px 15px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 900,
},
secondaryButton: {
background: "#fff",
color: "#000",
padding: "11px 15px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 900,
},
disabledButton: {
background: "rgba(255,255,255,.09)",
color: "rgba(255,255,255,.55)",
padding: "11px 15px",
borderRadius: 12,
fontWeight: 900,
},
};
