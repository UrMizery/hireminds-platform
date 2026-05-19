"use client";

import React from "react";

const featuredVideos = [
{
title: "Career Media Video 1",
description:
"Watch this career-readiness video to support your learning, preparation, and next steps in the Career Pathway Program.",
embedUrl:
"https://drive.google.com/file/d/13pLE5JH_eILwQKsugMnZNXpatmGdEMv-/preview",
},
{
title: "Career Media Video 2",
description:
"Continue building your confidence with this additional career-readiness video designed to help you understand expectations, skills, and opportunities.",
embedUrl:
"https://drive.google.com/file/d/186TOWldMIuzmPGJOoHrMTROyh5omF13t/preview",
},
];

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
Explore career-readiness videos and guides that help you understand
healthcare roles, employer expectations, job descriptions, interviews,
and how to connect your newly learned skills to your resume.
</p>
</section>

<section style={styles.videoSection}>
{featuredVideos.map((video) => (
<article key={video.title} style={styles.videoCard}>
<div style={styles.videoFrame}>
<iframe
src={video.embedUrl}
width="100%"
height="100%"
allow="autoplay"
style={styles.iframe}
/>
</div>

<div style={styles.videoContent}>
<p style={styles.videoKicker}>Featured Video</p>
<h2 style={styles.videoTitle}>{video.title}</h2>
<p style={styles.videoDescription}>{video.description}</p>
<span style={styles.videoBadge}>Available Now</span>
</div>
</article>
))}
</section>

<section style={styles.sectionIntro}>
<p style={styles.kicker}>More Career Media</p>
<h2 style={styles.sectionTitle}>Coming Soon to the Library</h2>
<p style={styles.sectionText}>
These upcoming sections will organize career media by topic so users
can easily review healthcare pathways, interviews, job descriptions,
resumes, and employer expectations.
</p>
</section>

<section style={styles.topicList}>
{mediaSections.map((section) => (
<article key={section.title} style={styles.topicCard}>
<div style={styles.topicHeader}>
<div>
<h2 style={styles.cardTitle}>{section.title}</h2>
<p style={styles.description}>{section.description}</p>
</div>

<span style={styles.comingSoon}>Media Coming Soon</span>
</div>

<ul style={styles.list}>
{section.items.map((item) => (
<li key={item} style={styles.listItem}>
{item}
</li>
))}
</ul>
</article>
))}
</section>
</main>
);
}

const styles: Record<string, React.CSSProperties> = {
main: {
minHeight: "100vh",
background:
"radial-gradient(circle at top left, rgba(0,122,255,.22), transparent 35%), radial-gradient(circle at bottom right, rgba(125,183,255,.10), transparent 30%), linear-gradient(180deg,#050505,#101010)",
color: "#ffffff",
padding: "40px 28px 70px",
fontFamily: "system-ui, Arial, sans-serif",
},
hero: {
maxWidth: 1250,
margin: "0 auto 34px",
padding: "28px 0",
},
kicker: {
color: "#7db7ff",
fontWeight: 900,
textTransform: "uppercase",
letterSpacing: 1.3,
fontSize: 12,
margin: "0 0 10px",
},
title: {
fontSize: "clamp(42px, 6vw, 76px)",
lineHeight: 1,
fontWeight: 950,
margin: "0 0 18px",
},
subtitle: {
color: "rgba(255,255,255,.78)",
lineHeight: 1.8,
maxWidth: 1050,
fontSize: 18,
margin: 0,
},
videoSection: {
maxWidth: 1250,
margin: "0 auto 55px",
display: "flex",
flexDirection: "column",
gap: 36,
},
videoCard: {
width: "100%",
background: "rgba(255,255,255,.065)",
border: "1px solid rgba(125,183,255,.25)",
borderRadius: 30,
overflow: "hidden",
boxShadow: "0 24px 70px rgba(0,0,0,.40)",
},
videoFrame: {
width: "100%",
height: 620,
background: "#000",
},
iframe: {
border: 0,
display: "block",
},
videoContent: {
padding: "32px 40px 36px",
},
videoKicker: {
color: "#7db7ff",
fontWeight: 900,
textTransform: "uppercase",
letterSpacing: 1.2,
fontSize: 12,
margin: "0 0 10px",
},
videoTitle: {
fontSize: "clamp(30px, 4vw, 46px)",
lineHeight: 1.08,
fontWeight: 950,
margin: "0 0 14px",
},
videoDescription: {
color: "rgba(255,255,255,.76)",
lineHeight: 1.8,
fontSize: 18,
maxWidth: 1050,
margin: 0,
},
videoBadge: {
display: "inline-block",
marginTop: 22,
background: "rgba(0,122,255,.17)",
color: "#b8dcff",
border: "1px solid rgba(125,183,255,.34)",
padding: "11px 15px",
borderRadius: 14,
fontWeight: 900,
fontSize: 13,
},
sectionIntro: {
maxWidth: 1250,
margin: "0 auto 22px",
paddingTop: 10,
},
sectionTitle: {
fontSize: "clamp(30px, 4vw, 48px)",
fontWeight: 950,
margin: "0 0 12px",
},
sectionText: {
color: "rgba(255,255,255,.74)",
lineHeight: 1.75,
maxWidth: 1000,
fontSize: 17,
margin: 0,
},
topicList: {
maxWidth: 1250,
margin: "0 auto",
display: "flex",
flexDirection: "column",
gap: 18,
},
topicCard: {
width: "100%",
background: "rgba(255,255,255,.055)",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: 24,
padding: "28px 32px",
},
topicHeader: {
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: 24,
},
cardTitle: {
margin: "0 0 10px",
fontSize: 28,
fontWeight: 950,
},
description: {
color: "rgba(255,255,255,.72)",
lineHeight: 1.65,
fontSize: 16,
maxWidth: 850,
margin: 0,
},
list: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
gap: "10px 18px",
paddingLeft: 20,
marginTop: 22,
marginBottom: 0,
},
listItem: {
color: "rgba(255,255,255,.84)",
lineHeight: 1.5,
},
comingSoon: {
flexShrink: 0,
display: "inline-block",
background: "rgba(255,255,255,.1)",
color: "rgba(255,255,255,.76)",
padding: "10px 14px",
borderRadius: 13,
fontWeight: 900,
fontSize: 13,
whiteSpace: "nowrap",
},
};
