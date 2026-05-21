"use client";

import Link from "next/link";
import { CSSProperties } from "react";

export default function ConnectExplore() {
return (
<section style={styles.wrap}>
<div style={styles.header}>
<p style={styles.kicker}>Connect & eXplore</p>
<h2 style={styles.title}>HireMinds™ Live</h2>
<p style={styles.subtitle}>
Jump into live support, schedule 1:1 guidance, or explore the interactive Live Board.
</p>
</div>

<div style={styles.grid}>
<Link href="/open-room" style={styles.card}>
<div style={styles.icon}>💬</div>
<h3 style={styles.cardTitle}>Open Room</h3>
<p style={styles.cardText}>
Monthly HireMinds recap and Q&A. Last Tuesday of every month from 6:00–7:00 PM.
</p>
<span style={styles.linkText}>Enter Open Room →</span>
</Link>

<Link href="/schedule-1-1" style={styles.card}>
<div style={styles.icon}>📅</div>
<h3 style={styles.cardTitle}>Schedule 1:1</h3>
<p style={styles.cardText}>
Book resume support, HireMinds questions, partner demos, or career guidance.
</p>
<span style={styles.linkText}>Schedule Support →</span>
</Link>

<Link href="/live-board" style={styles.card}>
<div style={styles.icon}>📌</div>
<h3 style={styles.cardTitle}>Live Board</h3>
<p style={styles.cardText}>
View flyers, react with thumbs up, move items, and post thoughts or questions.
</p>
<span style={styles.linkText}>Open Live Board →</span>
</Link>
</div>
</section>
);
}

const styles: Record<string, CSSProperties> = {
wrap: {
background: "rgba(255,255,255,0.035)",
border: "1px solid rgba(255,255,255,0.08)",
boxShadow: "0 18px 60px rgba(0,0,0,0.22)",
backdropFilter: "blur(14px)",
borderRadius: "30px",
padding: "28px",
display: "grid",
gap: "24px",
},

header: {
maxWidth: "850px",
},

kicker: {
margin: "0 0 8px",
color: "#60a5fa",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
fontWeight: 800,
},

title: {
margin: "0 0 10px",
fontSize: "34px",
fontWeight: 800,
color: "#f5f5f5",
letterSpacing: "-0.03em",
},

subtitle: {
margin: 0,
color: "#d4d4d8",
fontSize: "15px",
lineHeight: 1.7,
},

grid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
gap: "16px",
},

card: {
background: "rgba(255,255,255,0.045)",
border: "1px solid rgba(255,255,255,0.09)",
borderRadius: "22px",
padding: "22px",
color: "#f5f5f5",
textDecoration: "none",
minHeight: "190px",
},

icon: {
fontSize: "28px",
marginBottom: "12px",
},

cardTitle: {
margin: "0 0 10px",
fontSize: "20px",
fontWeight: 800,
},

cardText: {
margin: "0 0 18px",
color: "#b8b8bd",
fontSize: "14px",
lineHeight: 1.6,
},

linkText: {
color: "#93c5fd",
fontSize: "13px",
fontWeight: 800,
},
};
