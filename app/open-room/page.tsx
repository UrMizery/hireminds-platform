"use client";

import Link from "next/link";

export default function OpenRoomLivePage() {
return (
<main style={styles.page}>
<section style={styles.card}>
<p style={styles.kicker}>HireMinds Open Room</p>

<h1 style={styles.title}>Open Room Live</h1>

<p style={styles.subtitle}>
Join the HireMinds Open Room for live support, workforce conversations,
resume help, career guidance, and guided tool exploration.
</p>

<div style={styles.liveBox}>
<h2 style={styles.sectionTitle}>LIVE NOW</h2>

<p>
Use this space to connect during scheduled open-room hours. This can
be used for resume questions, Career Passport support, workshop
follow-up, and general HireMinds navigation.
</p>

<a
href="https://hire-minds.whereby.com/hireminds-open-room"
target="_blank"
rel="noopener noreferrer"
style={styles.primaryButton}
>
Enter Open Room
</a>
</div>

<div style={styles.infoGrid}>
<div style={styles.infoCard}>
<h3>What You Can Ask About</h3>
<p>
Resume updates, Career Passport setup, job search tools, interview
prep, follow-up letters, and how to use HireMinds features.
</p>
</div>

<div style={styles.infoCard}>
<h3>Before You Join</h3>
<p>
Have your questions ready. If you are working on a resume or job
application, open the page or document you want support with.
</p>
</div>

<div style={styles.infoCard}>
<h3>Open Room Reminder</h3>
<p>
The Open Room is for guidance and support. Private or sensitive
information should only be shared when appropriate.
</p>
</div>
</div>

<Link href="/" style={styles.secondaryButton}>
Back Home
</Link>
</section>
</main>
);
}

const styles: Record<string, React.CSSProperties> = {
page: {
minHeight: "100vh",
padding: "32px",
background:
"radial-gradient(circle at top left, rgba(0,122,255,.22), transparent 35%), linear-gradient(180deg,#050505,#101010)",
color: "#ffffff",
fontFamily: "system-ui, Arial, sans-serif",
},
card: {
maxWidth: 1100,
margin: "0 auto",
padding: 30,
borderRadius: 24,
background: "rgba(255,255,255,.06)",
border: "1px solid rgba(255,255,255,.12)",
},
kicker: {
color: "#7db7ff",
fontWeight: 900,
fontSize: 12,
textTransform: "uppercase",
letterSpacing: 1.3,
},
title: {
fontSize: 48,
fontWeight: 950,
margin: "8px 0",
},
subtitle: {
maxWidth: 850,
color: "rgba(255,255,255,.78)",
lineHeight: 1.7,
fontSize: 16,
},
liveBox: {
marginTop: 28,
padding: 26,
borderRadius: 20,
background: "rgba(10,132,255,.15)",
border: "1px solid rgba(125,183,255,.25)",
},
sectionTitle: {
margin: "0 0 10px",
fontSize: 28,
},
primaryButton: {
display: "inline-block",
marginTop: 18,
padding: "12px 18px",
borderRadius: 12,
background: "#0A84FF",
color: "#ffffff",
textDecoration: "none",
fontWeight: 900,
},
secondaryButton: {
display: "inline-block",
marginTop: 24,
padding: "12px 18px",
borderRadius: 12,
background: "rgba(255,255,255,.09)",
color: "#ffffff",
textDecoration: "none",
fontWeight: 900,
border: "1px solid rgba(255,255,255,.16)",
},
infoGrid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
gap: 16,
marginTop: 24,
},
infoCard: {
padding: 20,
borderRadius: 18,
background: "rgba(0,0,0,.30)",
border: "1px solid rgba(255,255,255,.10)",
lineHeight: 1.6,
},
};
