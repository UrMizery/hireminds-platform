"use client";

import React from "react";

const studyGuides = [
{
title: "Career Readiness",
description:
"Learn the core skills, behaviors, and expectations needed to prepare for employment and workplace success.",
href: "/nhp/study-guides/career-readiness",
},
{
title: "Customer Service",
description:
"Understand how to communicate with customers, handle challenges, and represent a company professionally.",
href: "#",
},
{
title: "Digital Literacy",
description:
"Build confidence using computers, email, online applications, and workplace technology.",
href: "#",
},
{
title: "Healthcare Support Basics",
description:
"Introduction to healthcare roles, environments, and expectations in patient-facing positions.",
href: "#",
},
{
title: "Workplace Communication",
description:
"Learn how to communicate clearly with supervisors, coworkers, and customers.",
href: "#",
},
{
title: "Medical & Medication Vocabulary",
description:
"Understand common healthcare terms, roles, and basic medication-related language.",
href: "#",
},
];

export default function NHPStudyGuidesPage() {
return (
<main style={styles.main}>
<section style={styles.hero}>
<p style={styles.kicker}>NHP2026 Career Pathway</p>
<h1 style={styles.title}>Study Guides</h1>
<p style={styles.subtitle}>
Complete short, structured trainings designed to prepare you for real
jobs. Each guide includes key concepts, workplace examples, and an
assessment to earn a certificate.
</p>
</section>

<section style={styles.grid}>
{studyGuides.map((guide) => (
<a key={guide.title} href={guide.href} style={styles.card}>
<h2 style={styles.cardTitle}>{guide.title}</h2>
<p style={styles.cardText}>{guide.description}</p>

<span style={styles.cardLink}>
{guide.href === "#" ? "Coming Soon" : "Start Training →"}
</span>
</a>
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
gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
gap: 18,
},
card: {
background: "rgba(255,255,255,.06)",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: 18,
padding: 20,
textDecoration: "none",
color: "#ffffff",
transition: "all .2s ease",
},
cardTitle: {
fontSize: 22,
marginBottom: 10,
},
cardText: {
color: "rgba(255,255,255,.75)",
lineHeight: 1.6,
marginBottom: 16,
},
cardLink: {
fontWeight: 900,
color: "#7db7ff",
},
};
