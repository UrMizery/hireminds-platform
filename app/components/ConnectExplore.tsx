"use client";

import Link from "next/link";
import { CSSProperties } from "react";

export default function ConnectExplore() {
return (
<section style={styles.wrap}>
<div style={styles.header}>
<p style={styles.kicker}>Connect & eXplore</p>
<h2 style={styles.title}>HireMinds Live</h2>
<p style={styles.subtitle}>
Join the monthly Open Room or explore the interactive Live Board.
</p>
</div>

<div style={styles.grid}>
<Link href="/open-room" style={styles.card}>
<div style={styles.icon}>💬</div>
<h3 style={styles.cardTitle}>Open Room</h3>
<p style={styles.cardText}>
Monthly recap and Q&A. Last Tuesday • 6–7 PM. Room opens 5:50 PM.
</p>
<span style={styles.linkText}>Enter →</span>
</Link>

<Link href="/live-board" style={styles.card}>
<div style={styles.icon}>📌</div>
<h3 style={styles.cardTitle}>Live Board</h3>
<p style={styles.cardText}>
Interactive flyers, reactions, feedback, questions, and discussion.
</p>
<span style={styles.linkText}>Open →</span>
</Link>
</div>
</section>
);
}

const styles: Record<string, CSSProperties> = {
wrap: {
background: "rgba(255,255,255,.035)",
border: "1px solid rgba(255,255,255,.08)",
boxShadow: "0 18px 60px rgba(0,0,0,.22)",
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
letterSpacing: ".18em",
textTransform: "uppercase",
fontWeight: 800,
},

title: {
margin: "0 0 10px",
fontSize: "34px",
fontWeight: 800,
color: "#f5f5f5",
},

subtitle: {
margin: 0,
color: "#d4d4d8",
fontSize: "15px",
lineHeight: 1.7,
},

grid: {
display: "grid",
gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
gap: "16px",
},

card: {
background: "rgba(255,255,255,.045)",
border: "1px solid rgba(255,255,255,.09)",
borderRadius: "22px",
padding: "22px",
color: "#f5f5f5",
textDecoration: "none",
},

icon: {
fontSize: "28px",
},

cardTitle: {
fontSize: "20px",
},

cardText: {
color: "#b8b8bd",
lineHeight: 1.6,
},

linkText: {
color: "#93c5fd",
fontWeight: 700,
},
};
