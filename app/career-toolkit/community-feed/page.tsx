"use client";

import type { CSSProperties } from "react";

type VideoCard = {
title: string;
duration: string;
category: string;
style: string;
featured: boolean;
description: string;
youtubeUrl: string;
buttonLabel: string;
tags: string[];
};

const youtubeVideoCards: VideoCard[] = [
{
title: "Indeed vs LinkedIn vs Company Website",
duration: "2 min",
category: "Job Search",
style: "explainer",
featured: true,
description:
"Understand the difference between major job platforms and when applying directly may help.",
youtubeUrl: "https://www.youtube.com/watch?v=ay2o7yEnq9g",
buttonLabel: "Watch on YouTube",
tags: ["Indeed", "LinkedIn", "Company Website", "Job Boards"],
},
{
title: "Interview Prep Basics",
duration: "2 min",
category: "Interview",
style: "whiteboard",
featured: true,
description:
"Short guidance on how to prepare, what to expect, and how to answer with confidence.",
youtubeUrl: "https://www.youtube.com/watch?v=KoY59gzjnVs",
buttonLabel: "Watch on YouTube",
tags: ["Interview Prep", "Whiteboard", "Confidence"],
},
{
title: "How to Dress for an Interview",
duration: "1 min",
category: "Interview",
style: "funny-animation",
featured: true,
description:
"Simple tips on looking clean, prepared, and professional for different interview settings.",
youtubeUrl: "https://www.youtube.com/watch?v=uQMd2rjAoZI",
buttonLabel: "Watch on YouTube",
tags: ["Interview Outfit", "First Impression", "Funny"],
},
{
title: "How to Apply for a Job",
duration: "3 min",
category: "Job Search",
style: "explainer",
featured: true,
description:
"Walk through the basics of applying carefully, following directions, and checking information.",
youtubeUrl: "https://www.youtube.com/watch?v=A3BZHkRf-34",
buttonLabel: "Watch on YouTube",
tags: ["Applications", "Job Search", "Steps"],
},
{
title: "Chronological Resume Format",
duration: "3 min",
category: "Resume",
style: "explainer",
featured: true,
description:
"Overview of resume structure with extra focus on chronological format and when to use it.",
youtubeUrl: "https://www.youtube.com/watch?v=M0jocD7bKLI",
buttonLabel: "Watch on YouTube",
tags: ["Resume", "Chronological", "Format"],
},
{
title: "Funny Interview Tips",
duration: "3 min",
category: "Interview",
style: "funny-animation",
featured: false,
description:
"Animated-style interview tips that support confidence-building and practicing strong answers.",
youtubeUrl: "https://www.youtube.com/watch?v=dExbjul6R7g",
buttonLabel: "Watch on YouTube",
tags: ["Interview", "Animation", "Practice"],
},
{
title: "Resume Formats Explained",
duration: "1 min",
category: "Resume",
style: "short-explainer",
featured: false,
description:
"Quick overview of chronological, functional, and hybrid resume styles.",
youtubeUrl: "https://www.youtube.com/shorts/yo2Zoa3TRz8",
buttonLabel: "Watch on YouTube",
tags: ["Resume Formats", "Short", "Chronological"],
},
{
title: "Direct Apply vs Job Boards",
duration: "2 min",
category: "Job Search",
style: "explainer",
featured: false,
description:
"Helpful support video for understanding direct company applications versus job board submissions.",
youtubeUrl: "https://www.youtube.com/watch?v=ay2o7yEnq9g",
buttonLabel: "Watch on YouTube",
tags: ["Direct Apply", "Company Site", "Job Boards"],
},
{
title: "What Not to Wear to an Interview",
duration: "1 min",
category: "Interview",
style: "funny-short",
featured: false,
description:
"Quick visual reminder of what to avoid and how presentation affects first impressions.",
youtubeUrl: "https://www.youtube.com/watch?v=uQMd2rjAoZI",
buttonLabel: "Watch on YouTube",
tags: ["Interview Outfit", "Quick Tips", "Presentation"],
},
];

export default function CommunityFeedPage() {
return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.headerSection}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>Video Library</h1>
<p style={styles.subtitle}>
Explore short videos that support job searching, interviewing,
resume building, and workplace readiness. Animated, whiteboard, and
simple explainer content is featured where possible.
</p>
</section>

<section style={styles.grid}>
{youtubeVideoCards.map((video) => (
<article key={`${video.title}-${video.youtubeUrl}`} style={styles.card}>
<div style={styles.cardTopRow}>
<h2 style={styles.cardTitle}>{video.title}</h2>
<span style={styles.duration}>{video.duration}</span>
</div>

<p style={styles.cardDescription}>{video.description}</p>

<div style={styles.tagWrap}>
{video.tags.map((tag) => (
<span key={`${video.title}-${tag}`} style={styles.tag}>
{tag}
</span>
))}
</div>

<a
href={video.youtubeUrl}
target="_blank"
rel="noreferrer"
style={styles.button}
>
{video.buttonLabel}
</a>
</article>
))}
</section>
</div>
</main>
);
}

const styles: Record<string, CSSProperties> = {
page: {
minHeight: "100vh",
background:
"linear-gradient(180deg, #0a0a0a 0%, #111111 45%, #151515 100%)",
color: "#f5f5f5",
padding: "32px 16px 64px",
},
shell: {
width: "100%",
maxWidth: "1200px",
margin: "0 auto",
},
headerSection: {
marginBottom: "32px",
},
kicker: {
margin: 0,
marginBottom: "10px",
fontSize: "0.85rem",
fontWeight: 700,
letterSpacing: "0.14em",
textTransform: "uppercase",
color: "#9ca3af",
},
title: {
margin: 0,
fontSize: "clamp(2rem, 4vw, 3.2rem)",
fontWeight: 800,
lineHeight: 1.05,
letterSpacing: "-0.03em",
},
subtitle: {
marginTop: "14px",
marginBottom: 0,
maxWidth: "760px",
fontSize: "1rem",
lineHeight: 1.7,
color: "#c7c7c7",
},
grid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
gap: "22px",
alignItems: "stretch",
},
card: {
display: "flex",
flexDirection: "column",
justifyContent: "space-between",
minHeight: "420px",
padding: "24px",
borderRadius: "28px",
background: "#050505",
border: "1px solid rgba(255,255,255,0.12)",
boxShadow: "0 0 0 1px rgba(255,255,255,0.02) inset",
},
cardTopRow: {
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: "12px",
},
cardTitle: {
margin: 0,
fontSize: "2rem",
fontWeight: 750,
lineHeight: 1.08,
letterSpacing: "-0.03em",
color: "#fafafa",
},
duration: {
flexShrink: 0,
fontSize: "0.95rem",
color: "#a1a1aa",
fontWeight: 500,
paddingTop: "4px",
},
cardDescription: {
marginTop: "26px",
marginBottom: "20px",
fontSize: "1rem",
lineHeight: 1.75,
color: "#d4d4d8",
},
tagWrap: {
display: "flex",
flexWrap: "wrap",
gap: "8px",
marginBottom: "24px",
},
tag: {
display: "inline-flex",
alignItems: "center",
padding: "8px 12px",
borderRadius: "999px",
background: "rgba(255,255,255,0.05)",
border: "1px solid rgba(255,255,255,0.1)",
fontSize: "0.8rem",
color: "#d4d4d8",
},
button: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
minHeight: "88px",
width: "100%",
marginTop: "auto",
borderRadius: "28px",
border: "1px solid rgba(255,255,255,0.14)",
background: "#090909",
color: "#ffffff",
fontSize: "1.05rem",
fontWeight: 700,
textDecoration: "none",
textAlign: "center",
lineHeight: 1.3,
padding: "20px",
},
};
