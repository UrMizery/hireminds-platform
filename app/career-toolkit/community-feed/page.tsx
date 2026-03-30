"use client";

import type { CSSProperties } from "react";

type VideoCard = {
title: string;
duration: string;
description: string;
youtubeUrl: string;
topic: string;
};

const youtubeVideoCards: VideoCard[] = [
{
title: "How to Read a Job Description",
duration: "2 min",
topic: "Job Search",
description:
"Learn how to spot requirements, skills, keywords, and what matters most before applying.",
youtubeUrl: "https://www.youtube.com/watch?v=KoY59gzjnVs",
},
{
title: "Direct Apply vs Job Boards",
duration: "2 min",
topic: "Job Search",
description:
"Understand when to apply on a company website and when a job board may still be useful.",
youtubeUrl: "https://www.youtube.com/watch?v=ay2o7yEnq9g",
},
{
title: "How to Apply for a Job",
duration: "3 min",
topic: "Applications",
description:
"Follow the right steps before submitting your application and avoid common mistakes.",
youtubeUrl: "https://www.youtube.com/watch?v=A3BZHkRf-34",
},
{
title: "What to Wear to an Interview",
duration: "1 min",
topic: "Interview",
description:
"Simple guidance on looking clean, prepared, and professional for interview settings.",
youtubeUrl: "https://www.youtube.com/watch?v=uQMd2rjAoZI",
},
{
title: "Resume Formats Explained",
duration: "2 min",
topic: "Resume",
description:
"Learn the difference between chronological, functional, combination, and hybrid resumes.",
youtubeUrl: "https://www.youtube.com/watch?v=M0jocD7bKLI",
},
{
title: "Interviewing Tips and Prep",
duration: "2 min",
topic: "Interview",
description:
"Build confidence with practical interview prep, common questions, and stronger answers.",
youtubeUrl: "https://www.youtube.com/watch?v=dExbjul6R7g",
},
{
title: "Career Passport Walkthrough",
duration: "2 min",
topic: "Platform",
description:
"See how to set up and use your Career Passport inside HireMinds step by step.",
youtubeUrl: "https://www.youtube.com/watch?v=A3BZHkRf-34",
},
{
title: "Career ToolKit How-Tos",
duration: "2 min",
topic: "Platform",
description:
"Learn how to use the generators and tools inside HireMinds with more confidence.",
youtubeUrl: "https://www.youtube.com/watch?v=KoY59gzjnVs",
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
Explore practical video support focused on job searching, applying,
interviewing, resume formats, and how to use HireMinds with confidence.
</p>
</section>

<section style={styles.grid}>
{youtubeVideoCards.map((video) => (
<article key={`${video.title}-${video.youtubeUrl}`} style={styles.card}>
<div style={styles.thumbnail}>
<span style={styles.topicBadge}>{video.topic}</span>
<span style={styles.durationBadge}>{video.duration}</span>
</div>

<div style={styles.cardBody}>
<h2 style={styles.cardTitle}>{video.title}</h2>
<p style={styles.cardDescription}>{video.description}</p>
</div>

<a
href={video.youtubeUrl}
target="_blank"
rel="noreferrer"
style={styles.button}
>
Watch Video
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
"radial-gradient(circle at top, rgba(59,130,246,0.08) 0%, rgba(5,5,5,1) 32%, rgba(13,13,15,1) 100%)",
color: "#f5f5f5",
padding: "32px 20px 64px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
shell: {
width: "100%",
maxWidth: "1280px",
margin: "0 auto",
},
headerSection: {
marginBottom: "28px",
},
kicker: {
margin: 0,
marginBottom: "10px",
fontSize: "12px",
fontWeight: 700,
letterSpacing: "0.16em",
textTransform: "uppercase",
color: "#9ca3af",
},
title: {
margin: 0,
fontSize: "clamp(2.2rem, 4vw, 3.4rem)",
fontWeight: 800,
lineHeight: 1.02,
letterSpacing: "-0.04em",
color: "#fafafa",
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
gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
gap: "20px",
alignItems: "stretch",
},
card: {
display: "flex",
flexDirection: "column",
minHeight: "320px",
padding: "16px",
borderRadius: "26px",
background: "linear-gradient(180deg, #111111 0%, #171717 100%)",
border: "1px solid rgba(255,255,255,0.08)",
boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
},
thumbnail: {
minHeight: "120px",
borderRadius: "20px",
border: "1px solid rgba(255,255,255,0.08)",
background:
"linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
padding: "14px",
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
marginBottom: "16px",
},
topicBadge: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: "8px 10px",
borderRadius: "999px",
background: "rgba(59,130,246,0.12)",
border: "1px solid rgba(59,130,246,0.24)",
color: "#dbeafe",
fontSize: "12px",
fontWeight: 700,
},
durationBadge: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: "8px 10px",
borderRadius: "999px",
background: "rgba(255,255,255,0.05)",
border: "1px solid rgba(255,255,255,0.1)",
color: "#d4d4d8",
fontSize: "12px",
fontWeight: 700,
},
cardBody: {
display: "grid",
gap: "10px",
marginBottom: "18px",
},
cardTitle: {
margin: 0,
fontSize: "28px",
fontWeight: 800,
lineHeight: 1.04,
letterSpacing: "-0.03em",
color: "#fafafa",
},
cardDescription: {
margin: 0,
fontSize: "15px",
lineHeight: 1.7,
color: "#d4d4d8",
},
button: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
marginTop: "auto",
width: "100%",
minHeight: "56px",
borderRadius: "18px",
border: "1px solid rgba(255,255,255,0.14)",
background: "#0d0d0d",
color: "#ffffff",
fontSize: "15px",
fontWeight: 700,
textDecoration: "none",
textAlign: "center",
padding: "14px 16px",
},
};
