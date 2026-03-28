"use client";

import { useMemo, useState } from "react";

type FeedSection = "All" | "Tips" | "Announcements";

type VideoItem = {
id: number;
title: string;
description: string;
url: string;
length: string;
};

type FeedItem = {
id: number;
type: Exclude<FeedSection, "All">;
title: string;
text: string;
time: string;
};

const featuredVideos: VideoItem[] = [
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

const initialFeedItems: FeedItem[] = [
{
id: 1,
type: "Tips",
title: "Read the full job description before applying",
text:
"Take a minute to review required skills, schedule details, certifications, and responsibilities before submitting an application. That helps you tailor your resume and avoid wasting time on jobs that are not a fit.",
time: "Posted today",
},
{
id: 2,
type: "Tips",
title: "Use stronger action words in your resume",
text:
"Instead of vague wording like 'helped customers,' try stronger language such as 'resolved customer concerns,' 'managed scheduling,' or 'maintained accurate records' when it is true to your experience.",
time: "Posted today",
},
{
id: 3,
type: "Announcements",
title: "New career tools available",
text:
"The Career ToolKit now includes the Job Description Analyzer, Resume Match Analyzer, Career Path Generator, and Budget Generator.",
time: "This week",
},
{
id: 4,
type: "Announcements",
title: "More video content will continue to be added",
text:
"Short career prep videos will be added to the Featured Career Videos section to support resumes, interviews, and job search basics.",
time: "This week",
},
];

export default function CommunityFeedPage() {
const [feedItems] = useState<FeedItem[]>(initialFeedItems);
const [activeSection, setActiveSection] = useState<FeedSection>("All");
const [search, setSearch] = useState("");

const filteredItems = useMemo(() => {
return feedItems.filter((item) => {
const matchesSection =
activeSection === "All" ? true : item.type === activeSection;

const q = search.trim().toLowerCase();
const matchesSearch = q
? [item.title, item.text, item.type].join(" ").toLowerCase().includes(q)
: true;

return matchesSection && matchesSearch;
});
}, [feedItems, activeSection, search]);

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>Career Feed</h1>
<p style={styles.subtitle}>
A clean space for featured career videos, practical tips, and important
announcements for Career Passport account holders.
</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</section>

<section style={styles.videoCard}>
<div style={styles.sectionHeader}>
<div>
<p style={styles.sectionKicker}>Pinned Section</p>
<h2 style={styles.sectionTitle}>Featured Career Videos</h2>
</div>
<span style={styles.pinnedBadge}>Fixed at top</span>
</div>

<p style={styles.sectionIntro}>
Watch short career prep videos on resumes, interviews, job applications,
and job search strategy.
</p>

<div style={styles.videoGrid}>
{featuredVideos.map((video) => (
<div key={video.id} style={styles.videoItemCard}>
<div style={styles.videoTopRow}>
<h3 style={styles.videoTitle}>{video.title}</h3>
<span style={styles.videoLength}>{video.length}</span>
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
</div>
))}
</div>
</section>

<section style={styles.feedHeaderCard}>
<div style={styles.feedHeaderTop}>
<div>
<p style={styles.sectionKicker}>Career Feed</p>
<h2 style={styles.sectionTitle}>Tips & Announcements</h2>
</div>

<input
value={search}
onChange={(e) => setSearch(e.target.value)}
placeholder="Search tips and announcements"
style={styles.searchInput}
/>
</div>

<div style={styles.feedFilters}>
{(["All", "Tips", "Announcements"] as FeedSection[]).map((section) => (
<button
key={section}
type="button"
onClick={() => setActiveSection(section)}
style={{
...styles.filterChipButton,
...(activeSection === section ? styles.filterChipButtonActive : {}),
}}
>
{section}
</button>
))}
</div>
</section>

<section style={styles.feedWrap}>
{filteredItems.map((item) => (
<article key={item.id} style={styles.postCard}>
<div style={styles.postHeader}>
<div>
<p style={styles.postMeta}>{item.time}</p>
</div>

<span style={styles.postType}>{item.type}</span>
</div>

<h3 style={styles.postTitle}>{item.title}</h3>
<p style={styles.postText}>{item.text}</p>
</article>
))}
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
maxWidth: "1320px",
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
videoCard: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px",
},
feedHeaderCard: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px",
},
feedWrap: {
display: "grid",
gap: "18px",
},
postCard: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "22px",
},
kicker: {
margin: "0 0 8px",
color: "#9a9a9a",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
sectionKicker: {
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
sectionTitle: {
margin: 0,
fontSize: "28px",
fontWeight: 600,
color: "#f5f5f5",
},
subtitle: {
margin: 0,
color: "#c8c8c8",
fontSize: "16px",
lineHeight: 1.7,
},
heroButtons: {
display: "flex",
gap: "12px",
marginTop: "18px",
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
sectionHeader: {
display: "flex",
justifyContent: "space-between",
gap: "16px",
alignItems: "flex-start",
marginBottom: "12px",
},
sectionIntro: {
margin: "0 0 18px",
color: "#c8c8c8",
fontSize: "15px",
lineHeight: 1.7,
maxWidth: "900px",
},
pinnedBadge: {
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
videoItemCard: {
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
feedHeaderTop: {
display: "flex",
justifyContent: "space-between",
gap: "16px",
alignItems: "flex-start",
flexWrap: "wrap",
marginBottom: "14px",
},
searchInput: {
width: "300px",
maxWidth: "100%",
padding: "12px 14px",
borderRadius: "14px",
border: "1px solid #2f2f2f",
background: "#0b0b0c",
color: "#f5f5f5",
fontSize: "14px",
boxSizing: "border-box",
},
feedFilters: {
display: "flex",
gap: "10px",
flexWrap: "wrap",
},
filterChipButton: {
display: "inline-flex",
alignItems: "center",
padding: "10px 14px",
borderRadius: "999px",
background: "#111827",
border: "1px solid #374151",
color: "#f3f4f6",
fontSize: "14px",
fontWeight: 600,
cursor: "pointer",
},
filterChipButtonActive: {
background: "#d4d4d8",
color: "#09090b",
border: "1px solid #d4d4d8",
},
postHeader: {
display: "flex",
justifyContent: "space-between",
gap: "14px",
alignItems: "flex-start",
marginBottom: "14px",
},
postMeta: {
margin: 0,
color: "#8f8f98",
fontSize: "13px",
},
postType: {
display: "inline-flex",
alignItems: "center",
padding: "8px 12px",
borderRadius: "999px",
background: "#111827",
border: "1px solid #374151",
color: "#f3f4f6",
fontSize: "12px",
fontWeight: 700,
whiteSpace: "nowrap",
},
postTitle: {
margin: "0 0 10px",
fontSize: "24px",
fontWeight: 600,
color: "#f5f5f5",
},
postText: {
margin: 0,
color: "#c8c8c8",
lineHeight: 1.75,
fontSize: "15px",
},
};
