"use client";

import Link from "next/link";
import { CSSProperties } from "react";

const MEETING_LINK = "PASTE_YOUR_TEAMS_OR_WHEREBY_LINK_HERE";

export default function OpenRoomPage() {
return (
<main style={styles.page}>
<section style={styles.card}>
<p style={styles.kicker}>HireMinds™</p>
<h1 style={styles.title}>Open Room</h1>

<p style={styles.text}>
Monthly HireMinds recap and Q&A. No registration required.
</p>

<div style={styles.infoBox}>
<p><strong>When:</strong> Last Tuesday of every month</p>
<p><strong>Time:</strong> 6:00 PM – 7:00 PM EST</p>
<p><strong>Room Opens:</strong> 5:50 PM EST</p>
<p><strong>Doors Close:</strong> 6:15 PM EST</p>
</div>

<a href={MEETING_LINK} target="_blank" rel="noopener noreferrer" style={styles.button}>
Join Open Room
</a>

  
<Link href="/profile" style={styles.back}>
Back to My Profile
</Link>
</section>
</main>
);
}

const styles: Record<string, CSSProperties> = {
page: {
minHeight: "100vh",
background: "linear-gradient(135deg,#030712,#111827,#1e1b4b)",
color: "white",
padding: "50px 24px",
},
card: {
maxWidth: "850px",
margin: "0 auto",
background: "rgba(255,255,255,.06)",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: "30px",
padding: "34px",
},
kicker: {
color: "#93c5fd",
textTransform: "uppercase",
letterSpacing: ".18em",
fontWeight: 800,
},
title: {
fontSize: "48px",
margin: "0 0 14px",
},
text: {
color: "#d1d5db",
fontSize: "18px",
lineHeight: 1.7,
},
infoBox: {
marginTop: "24px",
padding: "22px",
borderRadius: "20px",
background: "rgba(255,255,255,.07)",
color: "#e5e7eb",
lineHeight: 1.8,
},
button: {
display: "inline-block",
marginTop: "26px",
padding: "15px 24px",
borderRadius: "999px",
background: "#2563eb",
color: "white",
textDecoration: "none",
fontWeight: 800,
},
note: {
color: "#cbd5e1",
marginTop: "16px",
},
back: {
display: "inline-block",
marginTop: "24px",
color: "#93c5fd",
textDecoration: "none",
},
};
