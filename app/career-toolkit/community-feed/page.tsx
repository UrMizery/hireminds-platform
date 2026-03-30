"use client";

export const youtubeVideoCards = [
{
title: "Indeed vs LinkedIn vs Company Website",
duration: "2 min",
category: "job-search",
style: "live-backup",
featured: true,
description:
"Compare job boards with direct company applications and understand when applying on a company website may help.",
youtubeUrl: "https://www.youtube.com/watch?v=ay2o7yEnq9g",
buttonLabel: "Watch on YouTube",
tags: ["indeed", "linkedin", "company website", "job boards"],
},
{
title: "Interview Prep Basics",
duration: "2 min",
category: "interview",
style: "whiteboard",
featured: true,
description:
"Whiteboard-style interview prep video covering what to prepare, what to expect, and how to answer with confidence.",
youtubeUrl: "https://www.youtube.com/watch?v=KoY59gzjnVs",
buttonLabel: "Watch on YouTube",
tags: ["interview prep", "whiteboard", "job interview"],
},
{
title: "Funny Interview Tips",
duration: "3 min",
category: "interview",
style: "funny-animation",
featured: true,
description:
"Animated and lighthearted interview tips that still support confidence-building and practice.",
youtubeUrl: "https://www.youtube.com/watch?v=dExbjul6R7g",
buttonLabel: "Watch on YouTube",
tags: ["interview", "funny", "animation"],
},
{
title: "How to Dress for an Interview",
duration: "2 min",
category: "interview",
style: "funny-animation",
featured: true,
description:
"Funny animated-style example focused on what not to wear and how presentation affects first impressions.",
youtubeUrl: "https://www.youtube.com/watch?v=uQMd2rjAoZI",
buttonLabel: "Watch on YouTube",
tags: ["interview outfit", "what not to wear", "funny"],
},
{
title: "How to Dress for an Interview (Backup)",
duration: "6 min",
category: "interview",
style: "live-backup",
featured: false,
description:
"Backup option with clearer practical outfit guidance for different interview dress codes.",
youtubeUrl: "https://www.youtube.com/watch?v=iaQvQ6VuTSY",
buttonLabel: "Watch on YouTube",
tags: ["interview outfit", "dress code", "backup"],
},
{
title: "How to Apply for a Job",
duration: "3 min",
category: "job-search",
style: "live-backup",
featured: true,
description:
"Walk through the basics of applying carefully, following directions, and checking information before submitting.",
youtubeUrl: "https://www.youtube.com/watch?v=A3BZHkRf-34",
buttonLabel: "Watch on YouTube",
tags: ["apply for jobs", "job application", "job search"],
},
{
title: "Chronological Resume Format",
duration: "3 min",
category: "resume",
style: "live-backup",
featured: true,
description:
"Overview of resume structure with extra focus on chronological format and when to use it.",
youtubeUrl: "https://www.youtube.com/watch?v=M0jocD7bKLI",
buttonLabel: "Watch on YouTube",
tags: ["resume", "chronological", "resume format"],
},
{
title: "Resume Formats Explained",
duration: "1 min",
category: "resume",
style: "short-backup",
featured: false,
description:
"Short explainer comparing chronological, functional, and hybrid resume styles.",
youtubeUrl: "https://www.youtube.com/shorts/yo2Zoa3TRz8",
buttonLabel: "Watch on YouTube",
tags: ["resume formats", "chronological", "shorts"],
},

// extra support videos
{
title: "Should I Apply on a Company Website or Job Board?",
duration: "2 min",
category: "job-search",
style: "live-backup",
featured: false,
description:
"Helpful support video for explaining direct apply versus job board apply.",
youtubeUrl: "https://www.youtube.com/watch?v=ay2o7yEnq9g",
buttonLabel: "Watch on YouTube",
tags: ["direct apply", "company website", "job board"],
},
{
title: "What NOT to Wear to an Interview",
duration: "1 min",
category: "interview",
style: "funny-animation",
featured: false,
description:
"Quick and simple support video that works well for a short-form content card.",
youtubeUrl: "https://www.youtube.com/shorts/7Dn4kQj_kik",
buttonLabel: "Watch on YouTube",
tags: ["shorts", "interview outfit", "quick tips"],
}
];
type VideoItem = {
id: number;
title: string;
description: string;
url: string;
length?: string;
};

const videos: VideoItem[] = [
{
id: 1,
title: "Interview Prep Basics",
description:
"Short guidance on how to prepare, what to expect, and how to answer with confidence.",
url: "https://www.youtube.com/",
length: "2 min",
},
{
id: 2,
title: "How to Dress for an Interview",
description:
"Simple tips on looking clean, prepared, and professional for different interview settings.",
url: "https://www.youtube.com/",
length: "1 min",
},
{
id: 3,
title: "How to Apply for a Job",
description:
"Walk through the basics of applying carefully, following directions, and checking your information.",
url: "https://www.youtube.com/",
length: "3 min",
},
{
id: 4,
title: "Chronological Resume Format",
description:
"Overview of resume structure with extra focus on chronological format and when to use it.",
url: "https://www.youtube.com/",
length: "3 min",
},
{
id: 5,
title: "Indeed vs LinkedIn vs Company Website",
description:
"Understand the difference between major job platforms and when applying directly may help.",
url: "https://www.youtube.com/",
length: "2 min",
},
];

export default function CommunityFeedPage() {
return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>Vid Feed Library</h1>
<p style={styles.subtitle}>
Watch short career prep videos on resumes, interviews, job applications,
job search strategy, and professional presentation.
</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</section>

<section style={styles.videoSection}>
<div style={styles.sectionHeader}>
<div>
<p style={styles.sectionKicker}>Video Links</p>
<h2 style={styles.sectionTitle}>Open on YouTube</h2>
</div>
<span style={styles.badge}>Career Passport Only</span>
</div>

<p style={styles.sectionIntro}>
Select any video below to open it in YouTube. Replace the sample links
with your own video links anytime.
</p>

<div style={styles.videoGrid}>
{videos.map((video) => (
<article key={video.id} style={styles.videoCard}>
<div style={styles.videoTopRow}>
<h3 style={styles.videoTitle}>{video.title}</h3>
{video.length ? (
<span style={styles.videoLength}>{video.length}</span>
) : null}
</div>

<p style={styles.videoDescription}>{video.description}</p>

<a
href={video.url}
target="_blank"
rel="noreferrer"
style={styles.videoLinkButton}
>
Watch on YouTube
</a>
</article>
))}
</div>
</section>
</div>
</main>
);
}

const styles: Record<string, React.CSSProperties> = {
page: {
minHeight: "100vh",
background: "linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
color: "#e7e7e7",
padding: "32px 24px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
shell: {
maxWidth: "1280px",
margin: "0 auto",
display: "grid",
gap: "24px",
},
heroCard: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px",
},
kicker: {
margin: "0 0 8px",
color: "#9a9a9a",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
title: {
margin: "0 0 10px",
fontSize: "38px",
fontWeight: 600,
color: "#f5f5f5",
},
subtitle: {
margin: 0,
color: "#c8c8c8",
fontSize: "16px",
lineHeight: 1.7,
maxWidth: "900px",
},
heroButtons: {
display: "flex",
gap: "12px",
marginTop: "18px",
flexWrap: "wrap",
},
linkButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
textDecoration: "none",
padding: "12px 16px",
borderRadius: "16px",
border: "1px solid #3a3a3a",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
},
videoSection: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px",
},
sectionHeader: {
display: "flex",
justifyContent: "space-between",
gap: "16px",
alignItems: "flex-start",
marginBottom: "10px",
flexWrap: "wrap",
},
sectionKicker: {
margin: "0 0 8px",
color: "#9a9a9a",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
sectionTitle: {
margin: 0,
fontSize: "28px",
fontWeight: 600,
color: "#f5f5f5",
},
sectionIntro: {
margin: "0 0 20px",
color: "#c8c8c8",
fontSize: "15px",
lineHeight: 1.7,
},
badge: {
display: "inline-flex",
alignItems: "center",
padding: "8px 12px",
borderRadius: "999px",
background: "#111827",
border: "1px solid #374151",
color: "#f3f4f6",
fontSize: "13px",
fontWeight: 700,
whiteSpace: "nowrap",
},
videoGrid: {
display: "grid",
gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
gap: "16px",
},
videoCard: {
background: "#101010",
border: "1px solid #2d2d2d",
borderRadius: "20px",
padding: "18px",
display: "grid",
gap: "12px",
},
videoTopRow: {
display: "flex",
justifyContent: "space-between",
gap: "12px",
alignItems: "flex-start",
},
videoTitle: {
margin: 0,
color: "#f5f5f5",
fontSize: "20px",
fontWeight: 600,
lineHeight: 1.3,
},
videoLength: {
color: "#a1a1aa",
fontSize: "13px",
whiteSpace: "nowrap",
},
videoDescription: {
margin: 0,
color: "#c8c8c8",
fontSize: "14px",
lineHeight: 1.7,
},
videoLinkButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
width: "fit-content",
textDecoration: "none",
padding: "11px 14px",
borderRadius: "14px",
border: "1px solid #3a3a3a",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
fontSize: "14px",
},
};
