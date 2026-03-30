"use client";

import type { CSSProperties } from "react";

export default function CommunityFeedPage() {
return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>Video Library 🔒</h1>
<p style={styles.subtitle}>
This section is being refreshed with more aligned, modern, and practical
HireMinds video content. The new library is coming soon.
</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</section>

<section style={styles.lockCard}>
<div style={styles.lockIconWrap}>
<span style={styles.lockIcon}>🔒</span>
</div>

<h2 style={styles.lockTitle}>Coming Soon</h2>
<p style={styles.lockText}>
The Video Library is being updated to better match HireMinds. Future
topics will include job descriptions, applying, interview prep, resume
formats, Career Passport walkthroughs, and Career ToolKit how-tos.
</p>

<div style={styles.topicGrid}>
<div style={styles.topicPill}>How to Read a Job Description</div>
<div style={styles.topicPill}>Direct Apply vs Job Boards</div>
<div style={styles.topicPill}>How to Apply</div>
<div style={styles.topicPill}>What to Wear to an Interview</div>
<div style={styles.topicPill}>Resume Formats Explained</div>
<div style={styles.topicPill}>Interviewing Tips and Prep</div>
<div style={styles.topicPill}>Career Passport Walkthrough</div>
<div style={styles.topicPill}>Career ToolKit How-Tos</div>
</div>

<span style={styles.lockedButton}>Video Library Coming Soon 🔒</span>
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
maxWidth: "1200px",
margin: "0 auto",
display: "grid",
gap: "24px",
},
heroCard: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "28px",
padding: "28px",
boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
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
fontSize: "42px",
fontWeight: 700,
color: "#f5f5f5",
letterSpacing: "-0.04em",
lineHeight: 1.04,
},
subtitle: {
margin: 0,
color: "#c8c8c8",
fontSize: "16px",
lineHeight: 1.75,
maxWidth: "820px",
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
padding: "14px 18px",
borderRadius: "18px",
border: "1px solid #3a3a3a",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
fontSize: "14px",
},
lockCard: {
background: "linear-gradient(180deg, #111111 0%, #171717 100%)",
border: "1px solid rgba(255,255,255,0.08)",
borderRadius: "32px",
padding: "40px 28px",
boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
display: "grid",
gap: "18px",
textAlign: "center",
},
lockIconWrap: {
display: "flex",
justifyContent: "center",
},
lockIcon: {
fontSize: "52px",
lineHeight: 1,
},
lockTitle: {
margin: 0,
fontSize: "34px",
lineHeight: 1.08,
fontWeight: 700,
color: "#f5f5f5",
letterSpacing: "-0.03em",
},
lockText: {
margin: "0 auto",
maxWidth: "820px",
color: "#d4d4d8",
fontSize: "16px",
lineHeight: 1.8,
},
topicGrid: {
display: "grid",
gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
gap: "12px",
marginTop: "6px",
},
topicPill: {
display: "flex",
alignItems: "center",
justifyContent: "center",
minHeight: "58px",
padding: "12px 16px",
borderRadius: "18px",
background: "rgba(255,255,255,0.04)",
border: "1px solid rgba(255,255,255,0.08)",
color: "#e5e7eb",
fontSize: "14px",
fontWeight: 600,
textAlign: "center",
},
lockedButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
width: "fit-content",
justifySelf: "center",
marginTop: "8px",
padding: "14px 18px",
borderRadius: "18px",
border: "1px solid rgba(255,255,255,0.08)",
background: "rgba(255,255,255,0.04)",
color: "#9ca3af",
fontWeight: 700,
fontSize: "14px",
},
};
