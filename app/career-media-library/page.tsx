"use client";

import Link from "next/link";
import React from "react";

const mediaSections = [
{
title: "Industry Overview Clips",
description:
"Short videos and guides that explain healthcare career areas, common entry-level roles, and what employers usually look for.",
items: [
"Healthcare career pathways overview",
"Entry-level healthcare roles",
"Front desk, patient access, and support roles",
"Clinical vs. non-clinical healthcare careers",
],
},
{
title: "Day-in-the-Life Jobs",
description:
"Explore what different healthcare jobs actually look like during a normal workday.",
items: [
"Day in the life: Patient Access Representative",
"Day in the life: Medical Administrative Assistant",
"Day in the life: Home Care Support Worker",
"Day in the life: Healthcare Customer Service",
],
},
{
title: "Interview Examples",
description:
"Review sample interview questions, strong answers, and how to speak about your new skills with confidence.",
items: [
"Tell me about yourself",
"Why healthcare?",
"How do you handle upset patients?",
"How do you stay organized?",
],
},
{
title: "Employer Expectations",
description:
"Learn what employers expect from candidates before, during, and after the hiring process.",
items: [
"Professional communication",
"Attendance and reliability",
"Documentation and attention to detail",
"Customer service in healthcare settings",
],
},
{
title: "How to Read Job Descriptions",
description:
"Learn how to break down job postings so you understand required skills, preferred skills, duties, and keywords.",
items: [
"Required vs. preferred qualifications",
"Finding keywords",
"Understanding job duties",
"Matching your experience to the posting",
],
},
{
title: "Tailoring Your Resume to Your New Skills",
description:
"Use what you learned in the Career Pathway Program to update your resume and connect your skills to healthcare roles.",
items: [
"Adding healthcare terminology",
"Highlighting customer service skills",
"Using training language professionally",
"Matching resume bullets to job descriptions",
],
},
];

export default function CareerMediaLibraryPage() {
return (
<main style={styles.main}>
<section style={styles.hero}>
<p style={styles.kicker}>Career Pathway Program</p>
<h1 style={styles.title}>Career Media Library</h1>
<p style={styles.subtitle}>
Explore short career-readiness videos and guides that help you
understand healthcare roles, employer expectations, job descriptions,
interviews, and how to connect your newly learned skills to your
resume.
</p>
</section>

<section style={styles.grid}>
{mediaSections.map((section) => (
<div key={section.title} style={styles.card}>
<h2 style={styles.cardTitle}>{section.title}</h2>
<p style={styles.description}>{section.description}</p>

<ul style={styles.list}>
{section.items.map((item) => (
<li key={item} style={styles.listItem}>
{item}
</li>
))}
</ul>

<span style={styles.comingSoon}>Media Coming Soon</span>
</div>
))}
</section>

<section style={styles.noteBox}>
<h2>How to Use This Library</h2>
<p>
Use this page between live sessions to review career examples, prepare
for interviews, understand employer expectations, and update your
resume based on the skills you are learning.
</p>
</section>

<div style={styles.actions}>
<Link href="/skillsquest" style={styles.secondaryButton}>
Back to Career Pathway Program
</Link>

<Link href="/independent-learning-lab" style={styles.primaryButton}>
Open Independent Learning
</Link>
</div>
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
cardTitle: {
margin: "0 0 10px",
fontSize: 22,
},
description: {
color: "rgba(255,255,255,.72)",
lineHeight: 1.55,
},
list: {
paddingLeft: 20,
marginTop: 14,
marginBottom: 16,
},
listItem: {
marginBottom: 8,
color: "rgba(255,255,255,.82)",
},
comingSoon: {
display: "inline-block",
marginTop: 8,
background: "rgba(255,255,255,.1)",
color: "rgba(255,255,255,.72)",
padding: "9px 12px",
borderRadius: 10,
fontWeight: 800,
fontSize: 13,
},
noteBox: {
maxWidth: 1100,
margin: "32px auto 0",
padding: 22,
borderRadius: 20,
background: "rgba(10,132,255,.10)",
border: "1px solid rgba(125,183,255,.18)",
lineHeight: 1.65,
},
actions: {
maxWidth: 1100,
margin: "24px auto 0",
display: "flex",
gap: 12,
flexWrap: "wrap",
},
primaryButton: {
background: "#0A84FF",
color: "#ffffff",
padding: "12px 16px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 900,
display: "inline-block",
},
secondaryButton: {
background: "#ffffff",
color: "#000000",
padding: "12px 16px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 900,
display: "inline-block",
},
};
