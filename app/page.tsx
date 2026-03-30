"use client";

import { useLanguage } from "./lib/language-context";

export default function HomePage() {
const { t } = useLanguage();
const isRTL = false;

return (
<main style={styles.page}>
<section
style={{
...styles.hero,
textAlign: isRTL ? "right" : "center",
direction: isRTL ? "rtl" : "ltr",
}}
>
<p style={styles.kicker}>HIREMINDS</p>
<h1 style={styles.title}>{t.title}</h1>
<p style={styles.subtitle}>{t.subtitle}</p>

<div
style={{
...styles.buttonRow,
justifyContent: isRTL ? "flex-start" : "center",
}}
>
<a href="/sign-up" style={styles.primaryButton}>
{t.createPassport}
</a>
</div>
</section>

<section
style={{
...styles.infoSection,
textAlign: isRTL ? "right" : "center",
direction: isRTL ? "rtl" : "ltr",
}}
>
<h2 style={styles.sectionTitle}>Built for Visibility and Opportunity</h2>
<p style={styles.sectionIntro}>
HireMinds is a forward-thinking career platform designed to elevate
visibility, expand opportunity, and create stronger employment
connections.
</p>

<div
style={{
...styles.featureGrid,
direction: isRTL ? "rtl" : "ltr",
}}
>
<div style={styles.card}>
<h3 style={styles.cardTitle}>Connect With Opportunity</h3>
<p style={styles.cardText}>
Explore job opportunities, strengthen your professional presence,
and move forward with confidence.
</p>
</div>

<div style={styles.card}>
<h3 style={styles.cardTitle}>Hire With More Visibility</h3>
<p style={styles.cardText}>
Connect with candidates presenting a fuller picture of their
skills, experience, and professional potential.
</p>
</div>

<div style={styles.card}>
<h3 style={styles.cardTitle}>For Partners</h3>
<p style={styles.cardText}>
Use HireMinds as a career and hiring platform that expands access,
increases visibility, and creates stronger employment connections.
</p>
</div>
</div>
</section>

<section style={styles.statsSection}>
<div style={styles.statsRow}>
<div style={styles.statItem}>
<p style={styles.statNumber}>Visitor Counter</p>
<p style={styles.statLabel}>Tracking platform reach and visibility</p>
</div>

<div style={styles.statItem}>
<p style={styles.statNumber}>New Users</p>
<p style={styles.statLabel}>Welcoming fresh talent and opportunity</p>
</div>

<div style={styles.statItem}>
<p style={styles.statNumber}>5-Star Platform</p>
<p style={styles.statLabel}>Empowering talent, readiness, and career momentum</p>
</div>
</div>

<p style={styles.footerText}>A product of RicanNECT</p>
</section>
</main>
);
}

const styles: Record<string, React.CSSProperties> = {
page: {
minHeight: "100vh",
background:
"radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent 20%), linear-gradient(180deg, #040404 0%, #0b0b0d 100%)",
color: "#f5f5f5",
padding: "40px 24px 56px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
hero: {
maxWidth: "1100px",
margin: "0 auto 34px",
padding: "24px 12px 12px",
},
kicker: {
margin: "0 0 14px",
color: "#a3a3a3",
fontSize: "12px",
letterSpacing: "0.22em",
textTransform: "uppercase",
},
title: {
margin: "0 0 16px",
fontSize: "clamp(2.8rem, 6vw, 4.6rem)",
lineHeight: 1.02,
fontWeight: 600,
letterSpacing: "-0.05em",
color: "#f5f5f5",
},
subtitle: {
maxWidth: "760px",
margin: "0 auto",
color: "#c4c4c4",
fontSize: "17px",
lineHeight: 1.8,
},
buttonRow: {
display: "flex",
gap: "14px",
flexWrap: "wrap",
marginTop: "28px",
},
primaryButton: {
display: "inline-block",
padding: "15px 20px",
borderRadius: "18px",
textDecoration: "none",
background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
color: "#09090b",
fontWeight: 700,
},
infoSection: {
maxWidth: "1100px",
margin: "0 auto",
paddingTop: "12px",
},
sectionTitle: {
margin: "0 0 14px",
color: "#f5f5f5",
fontSize: "32px",
fontWeight: 600,
letterSpacing: "-0.03em",
},
sectionIntro: {
maxWidth: "850px",
margin: "0 auto 28px",
color: "#c4c4c4",
fontSize: "17px",
lineHeight: 1.8,
},
featureGrid: {
maxWidth: "1100px",
margin: "0 auto",
display: "grid",
gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
gap: "18px",
},
card: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px",
boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
textAlign: "inherit",
},
cardTitle: {
margin: "0 0 10px",
color: "#f5f5f5",
fontSize: "24px",
fontWeight: 600,
},
cardText: {
margin: 0,
color: "#c8c8c8",
fontSize: "15px",
lineHeight: 1.8,
},
statsSection: {
maxWidth: "1100px",
margin: "42px auto 0",
paddingTop: "24px",
borderTop: "1px solid rgba(255,255,255,0.08)",
},
statsRow: {
display: "grid",
gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
gap: "18px",
alignItems: "start",
marginBottom: "22px",
},
statItem: {
textAlign: "center",
},
statNumber: {
margin: "0 0 6px",
color: "#f5f5f5",
fontSize: "22px",
fontWeight: 600,
letterSpacing: "-0.02em",
},
statLabel: {
margin: 0,
color: "#a1a1aa",
fontSize: "14px",
lineHeight: 1.7,
},
footerText: {
margin: 0,
textAlign: "center",
color: "#8b8b93",
fontSize: "14px",
lineHeight: 1.7,
letterSpacing: "0.04em",
},
};
