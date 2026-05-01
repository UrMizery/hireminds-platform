"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

type Module = {
title: string;
description: string;
href: string;
completionKey: string;
minutes: number;
};

const modules: Module[] = [
{
title: "Study Guide 1: Medical Word Building",
description:
"Learn how prefixes, roots, and suffixes work together to form medical terms.",
href: "/independent-learning-lab/medical-terminology/module-1",
completionKey: "ind_medterm_module_1",
minutes: 11,
},
{
title: "Study Guide 2: Common Prefixes",
description:
"Study common beginning word parts used in healthcare language.",
href: "/independent-learning-lab/medical-terminology/module-2",
completionKey: "ind_medterm_module_2",
minutes: 11,
},
{
title: "Study Guide 3: Root Words",
description:
"Practice common roots related to body parts, organs, and systems.",
href: "/independent-learning-lab/medical-terminology/module-3",
completionKey: "ind_medterm_module_3",
minutes: 11,
},
{
title: "Study Guide 4: Common Suffixes",
description:
"Learn endings that describe conditions, procedures, and diagnoses.",
href: "/independent-learning-lab/medical-terminology/module-4",
completionKey: "ind_medterm_module_4",
minutes: 11,
},
{
title: "Study Guide 5: Practice Terms",
description:
"Apply what you learned by breaking down common healthcare terms.",
href: "/independent-learning-lab/medical-terminology/module-5",
completionKey: "ind_medterm_module_5",
minutes: 11,
},
];

export default function IndependentMedicalTerminologyLab() {
const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
const [ready, setReady] = useState(false);

useEffect(() => {
const map: Record<string, boolean> = {};

modules.forEach((module) => {
map[module.completionKey] =
localStorage.getItem(module.completionKey) === "true";
});

setCompletedMap(map);
setReady(true);
}, []);

function isUnlocked(index: number) {
if (index === 0) return true;
const previous = modules[index - 1];
return completedMap[previous.completionKey] === true;
}

const completedCount = modules.filter(
(module) => completedMap[module.completionKey]
).length;

const assessmentUnlocked = completedCount === modules.length;

if (!ready) {
return <main style={styles.main}>Loading Medical Terminology Lab...</main>;
}

return (
<main style={styles.main}>
<section style={styles.hero}>
<p style={styles.kicker}>Independent Learning Lab</p>
<h1 style={styles.title}>Medical Terminology Lab</h1>
<p style={styles.subtitle}>
Complete all 5 timed study guides in order. Each guide is 11 minutes.
The assessment unlocks after all study guides are completed.
</p>
</section>

<section style={styles.progressCard}>
<strong>Progress</strong>
<span style={styles.progressNumber}>{completedCount}/5</span>
<p>study guides completed</p>
</section>

<section style={styles.notice}>
<h2>Active Learning Rules</h2>
<p>
Study guides must be completed in order. Your progress saves if you
leave and return. Assessments unlock only after the required timed
study guides are complete.
</p>
</section>

<section style={styles.grid}>
{modules.map((module, index) => {
const unlocked = isUnlocked(index);
const complete = completedMap[module.completionKey];

return (
<div
key={module.completionKey}
style={{
...styles.card,
...(complete ? styles.completeCard : {}),
...(!unlocked ? styles.lockedCard : {}),
}}
>
<div style={styles.cardTop}>
<h2 style={styles.cardTitle}>{module.title}</h2>
<span style={styles.badge}>
{complete ? "Complete" : unlocked ? "Unlocked" : "Locked"}
</span>
</div>

<p style={styles.cardText}>{module.description}</p>
<p style={styles.timeText}>Required time: {module.minutes} minutes</p>

{unlocked ? (
<Link href={module.href} style={styles.primaryButton}>
{complete ? "Review Study Guide" : "Start Study Guide"}
</Link>
) : (
<span style={styles.disabledButton}>
Complete the previous study guide first
</span>
)}
</div>
);
})}
</section>

<section style={styles.assessmentBox}>
<h2>Medical Terminology Assessment</h2>
<p>
Passing score: 80%. The assessment unlocks after all 5 study guides
are completed.
</p>

{assessmentUnlocked ? (
<Link
href="/independent-learning-lab/medical-terminology/assessment"
style={styles.assessmentButton}
>
Start Assessment
</Link>
) : (
<span style={styles.disabledButton}>
Assessment locked until all 5 study guides are complete
</span>
)}
</section>

<section style={styles.bottomActions}>
<Link href="/independent-learning-lab" style={styles.secondaryButton}>
Back to Independent Learning Lab
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
maxWidth: 1100,
margin: "0 auto 24px",
},
kicker: {
color: "#7db7ff",
fontWeight: 900,
letterSpacing: 1.4,
textTransform: "uppercase",
fontSize: 12,
},
title: {
fontSize: 48,
fontWeight: 950,
margin: "8px 0",
},
subtitle: {
color: "rgba(255,255,255,.75)",
lineHeight: 1.65,
maxWidth: 850,
},
progressCard: {
maxWidth: 1100,
margin: "0 auto 18px",
padding: 20,
borderRadius: 20,
background: "rgba(255,255,255,.06)",
border: "1px solid rgba(255,255,255,.12)",
display: "grid",
gap: 4,
},
progressNumber: {
fontSize: 36,
fontWeight: 950,
},
notice: {
maxWidth: 1100,
margin: "0 auto 18px",
padding: 20,
borderRadius: 20,
background: "rgba(10,132,255,.10)",
border: "1px solid rgba(125,183,255,.18)",
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
padding: 20,
},
completeCard: {
background: "rgba(125,255,179,.10)",
border: "1px solid rgba(125,255,179,.22)",
},
lockedCard: {
opacity: 0.55,
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
fontSize: 21,
},
badge: {
background: "rgba(255,255,255,.10)",
color: "#ffffff",
padding: "7px 11px",
borderRadius: 999,
fontSize: 12,
fontWeight: 900,
},
cardText: {
color: "rgba(255,255,255,.75)",
lineHeight: 1.55,
},
timeText: {
color: "#9ed0ff",
fontWeight: 800,
},
primaryButton: {
background: "#0A84FF",
color: "#fff",
padding: "11px 15px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 900,
display: "inline-block",
marginTop: 10,
},
secondaryButton: {
background: "#ffffff",
color: "#000000",
padding: "11px 15px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 900,
display: "inline-block",
marginTop: 10,
},
disabledButton: {
background: "rgba(255,255,255,.09)",
color: "rgba(255,255,255,.62)",
padding: "11px 15px",
borderRadius: 12,
fontWeight: 900,
display: "inline-block",
marginTop: 10,
},
assessmentBox: {
maxWidth: 1100,
margin: "24px auto 0",
padding: 22,
borderRadius: 22,
background: "rgba(255,255,255,.06)",
border: "1px solid rgba(255,255,255,.12)",
},
assessmentButton: {
background: "#7dffb3",
color: "#000",
padding: "11px 15px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 950,
display: "inline-block",
marginTop: 10,
},
bottomActions: {
maxWidth: 1100,
margin: "24px auto 0",
display: "flex",
gap: 12,
flexWrap: "wrap",
},
};
