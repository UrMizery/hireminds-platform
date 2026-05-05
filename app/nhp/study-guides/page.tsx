"use client";

import React from "react";

const weeks = [
{
week: "Week 1",
theme: "Entry-Level Workforce Foundation",
description:
"Start with the core skills every participant needs before moving into industry-specific pathways.",
guides: [
{
title: "Career Readiness",
description:
"Build job search confidence, understand employer expectations, and prepare for applications, interviews, and workplace success.",
href: "/nhp/study-guides/career-readiness",
status: "Start Training →",
},
{
title: "Customer Service",
description:
"Learn how to communicate professionally, handle customer concerns, use empathy, and represent an organization with confidence.",
href: "/nhp/study-guides/customer-service",
status: "Start Training →",
},
{
title: "Digital Literacy",
description:
"Practice computer basics, email communication, online applications, workplace technology, and digital professionalism.",
href: "/nhp/study-guides/digital-literacy",
status: "Start Training →",
},
],
},
{
week: "Week 2",
theme: "Workplace Communication + Industry Awareness",
description:
"Participants begin connecting foundational skills to real work environments, team expectations, and industry pathways.",
guides: [
{
title: "Workplace Communication",
description:
"Learn how to communicate with supervisors, coworkers, customers, and clients in a respectful and effective way.",
href: "#",
status: "Coming Soon",
},
{
title: "Healthcare Support Basics",
description:
"Explore healthcare support roles, patient-facing expectations, privacy awareness, safety, and service standards.",
href: "#",
status: "Coming Soon",
},
{
title: "Security & Professional Readiness",
description:
"Prepare for security, guard card pathways, professional conduct, observation skills, and safety responsibility.",
href: "#",
status: "Coming Soon",
},
],
},
{
week: "Week 3",
theme: "Industry Pathways + Next-Step Preparation",
description:
"Participants explore industry-specific training options and prepare to apply their skills to job opportunities.",
guides: [
{
title: "Food Safety / ServSafe Awareness",
description:
"Understand basic food safety expectations, sanitation, hygiene, and why ServSafe may be required for certain roles.",
href: "#",
status: "Coming Soon",
},
{
title: "Green Jobs & Clean Energy Awareness",
description:
"Explore entry-level green job pathways, clean energy priorities, sustainability, and workforce opportunities.",
href: "#",
status: "Coming Soon",
},
{
title: "Job Search, Resume & Interview Prep",
description:
"Apply your training to job descriptions, resume updates, interview answers, and next-step employment planning.",
href: "#",
status: "Coming Soon",
},
],
},
];

export default function NHPStudyGuidesPage() {
return (
<main style={styles.main}>
<section style={styles.hero}>
<p style={styles.kicker}>NHP2026 Career Pathway</p>
<h1 style={styles.title}>3-Week Study Guides</h1>
<p style={styles.subtitle}>
This learning path is organized into three weeks of structured,
self-paced study guides. Each week builds from entry-level workforce
readiness into industry awareness, applied workplace skills, and
next-step employment preparation.
</p>

<div style={styles.overviewGrid}>
<div style={styles.overviewCard}>
<strong>3 Weeks</strong>
<span>Structured training path</span>
</div>
<div style={styles.overviewCard}>
<strong>9 Study Guides</strong>
<span>Three guides per week</span>
</div>
<div style={styles.overviewCard}>
<strong>Assessments</strong>
<span>Knowledge checks + certificates</span>
</div>
</div>
</section>

<section style={styles.weekStack}>
{weeks.map((week) => (
<div key={week.week} style={styles.weekCard}>
<div style={styles.weekHeader}>
<p style={styles.weekLabel}>{week.week}</p>
<h2 style={styles.weekTitle}>{week.theme}</h2>
<p style={styles.weekDescription}>{week.description}</p>
</div>

<div style={styles.guideGrid}>
{week.guides.map((guide) => (
<a
key={guide.title}
href={guide.href}
style={{
...styles.guideCard,
cursor: guide.href === "#" ? "default" : "pointer",
}}
>
<h3 style={styles.guideTitle}>{guide.title}</h3>
<p style={styles.guideText}>{guide.description}</p>
<span style={styles.guideLink}>{guide.status}</span>
</a>
))}
</div>
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
maxWidth: 1180,
margin: "0 auto 30px",
},
kicker: {
color: "#7db7ff",
fontWeight: 900,
textTransform: "uppercase",
letterSpacing: 1.3,
fontSize: 12,
},
title: {
fontSize: 48,
fontWeight: 950,
margin: "8px 0",
},
subtitle: {
color: "rgba(255,255,255,.76)",
lineHeight: 1.7,
maxWidth: 920,
fontSize: 16,
},
overviewGrid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
gap: 14,
marginTop: 22,
maxWidth: 900,
},
overviewCard: {
display: "grid",
gap: 6,
padding: 18,
borderRadius: 18,
background: "rgba(255,255,255,.07)",
border: "1px solid rgba(255,255,255,.12)",
},
weekStack: {
maxWidth: 1180,
margin: "0 auto",
display: "grid",
gap: 22,
},
weekCard: {
padding: 22,
borderRadius: 24,
background: "rgba(255,255,255,.055)",
border: "1px solid rgba(255,255,255,.12)",
},
weekHeader: {
marginBottom: 18,
},
weekLabel: {
color: "#9ed0ff",
fontWeight: 900,
textTransform: "uppercase",
letterSpacing: 1.2,
fontSize: 12,
margin: 0,
},
weekTitle: {
fontSize: 28,
margin: "6px 0",
},
weekDescription: {
color: "rgba(255,255,255,.72)",
lineHeight: 1.6,
maxWidth: 850,
},
guideGrid: {
display: "grid",
gridTemplateColumns: "repeat(3,minmax(0,1fr))",
gap: 16,
},
guideCard: {
minHeight: 230,
display: "flex",
flexDirection: "column",
justifyContent: "space-between",
background: "rgba(0,0,0,.30)",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: 18,
padding: 20,
textDecoration: "none",
color: "#ffffff",
},
guideTitle: {
fontSize: 22,
margin: "0 0 10px",
},
guideText: {
color: "rgba(255,255,255,.76)",
lineHeight: 1.6,
marginBottom: 18,
},
guideLink: {
color: "#9ed0ff",
fontWeight: 900,
},
};
