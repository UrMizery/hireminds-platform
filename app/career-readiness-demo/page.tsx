"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const guides = [
{
title: "Demo Guide 1: Healthcare Resume Basics",
href: "/career-readiness-demo/module-1",
completionKey: "twp_career_readiness_module_1",
},
{
title: "Demo Guide 2: Job Description + Cover Letter",
href: "/career-readiness-demo/module-2",
completionKey: "twp_career_readiness_module_2",
},
{
title: "Demo Guide 3: Interview + Professionalism",
href: "/career-readiness-demo/module-3",
completionKey: "twp_career_readiness_module_3",
},
];

export default function CareerReadinessHubPage() {
const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

useEffect(() => {
const map: Record<string, boolean> = {};
guides.forEach((guide) => {
map[guide.completionKey] =
localStorage.getItem(guide.completionKey) === "true";
});
setCompletedMap(map);
}, []);

function isUnlocked(index: number) {
if (index === 0) return true;
return completedMap[guides[index - 1].completionKey] === true;
}

const allComplete = guides.every(
(guide) => completedMap[guide.completionKey] === true
);

return (
<main style={styles.main}>
<section style={styles.card}>
<p style={styles.kicker}>TWP2026 • Day 2</p>

<h1 style={styles.title}>Career Readiness Training</h1>

<p style={styles.subtitle}>
Participants complete three demo study guides before unlocking the
Career Readiness assessment. Each guide must be completed in order.
After passing the assessment with 80% or higher, a certificate preview
will appear for printing.
</p>

<div style={styles.studyList}>
{guides.map((guide, index) => {
const complete = completedMap[guide.completionKey];
const unlocked = isUnlocked(index);

if (!unlocked) {
return (
<div key={guide.completionKey} style={styles.studyModuleLocked}>
<span>{guide.title}</span>
<strong>Locked</strong>
</div>
);
}

return (
<Link
key={guide.completionKey}
href={guide.href}
style={{
...styles.studyModule,
...(complete ? styles.studyModuleComplete : {}),
}}
>
<span>{guide.title}</span>
<strong>{complete ? "Done" : "Start"}</strong>
</Link>
);
})}
</div>

<div style={styles.buttonGroup}>
{allComplete ? (
<Link
href="/career-readiness-demo/assessment"
style={styles.secondaryButton}
>
Start Assessment
</Link>
) : (
<span style={styles.lockedButton}>Assessment Locked</span>
)}

<Link href="/skillsquest" style={styles.backButton}>
Back to Career Pathway
</Link>
</div>
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
card: {
maxWidth: 650,
margin: "0 auto",
padding: 26,
borderRadius: 22,
background: "rgba(255,255,255,.06)",
border: "1px solid rgba(255,255,255,.12)",
},
kicker: {
color: "#7db7ff",
fontWeight: 900,
textTransform: "uppercase",
letterSpacing: 1.3,
fontSize: 12,
},
title: {
fontSize: 38,
fontWeight: 950,
margin: "8px 0",
},
subtitle: {
color: "rgba(255,255,255,.76)",
lineHeight: 1.6,
fontSize: 15,
},
studyList: {
display: "grid",
gap: 10,
marginTop: 22,
},
studyModule: {
display: "flex",
justifyContent: "space-between",
gap: 12,
alignItems: "center",
background: "rgba(255,255,255,.08)",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: 12,
padding: "12px 14px",
color: "#ffffff",
textDecoration: "none",
fontSize: 14,
},
studyModuleComplete: {
background: "rgba(125,255,179,.13)",
border: "1px solid rgba(125,255,179,.25)",
},
studyModuleLocked: {
display: "flex",
justifyContent: "space-between",
gap: 12,
alignItems: "center",
background: "rgba(255,255,255,.04)",
border: "1px solid rgba(255,255,255,.08)",
borderRadius: 12,
padding: "12px 14px",
color: "rgba(255,255,255,.45)",
fontSize: 14,
},
buttonGroup: {
display: "flex",
gap: 12,
flexWrap: "wrap",
marginTop: 22,
},
secondaryButton: {
background: "#0A84FF",
color: "#ffffff",
padding: "12px 16px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 850,
display: "inline-block",
},
lockedButton: {
background: "rgba(255,255,255,.09)",
color: "rgba(255,255,255,.68)",
padding: "12px 16px",
borderRadius: 12,
fontWeight: 850,
display: "inline-block",
},
backButton: {
background: "rgba(255,255,255,.09)",
color: "#ffffff",
padding: "12px 16px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 850,
border: "1px solid rgba(255,255,255,.16)",
},
};
