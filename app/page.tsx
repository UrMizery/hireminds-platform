"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./lib/language-context";
import { supabase } from "./lib/supabase";

export default function HomePage() {
const { t } = useLanguage();
const isRTL = false;

const [visitCount, setVisitCount] = useState<number | null>(null);
const [totalUsersCount, setTotalUsersCount] = useState<number | null>(null);
const [totalActivitiesCount, setTotalActivitiesCount] = useState<number | null>(null);

useEffect(() => {
async function loadHomepageStats() {
try {
const { data: statsRows, error: statsError } = await supabase
.from("public_stats")
.select("stat_key, stat_value")
.in("stat_key", ["total_visitors", "total_users", "total_activities"]);

if (statsError) {
console.error("Error fetching public stats:", statsError);
return;
}

const totalVisitors =
statsRows?.find((row) => row.stat_key === "total_visitors")?.stat_value ?? 0;

const totalUsers =
statsRows?.find((row) => row.stat_key === "total_users")?.stat_value ?? 0;

const totalActivities =
statsRows?.find((row) => row.stat_key === "total_activities")?.stat_value ?? 0;

setVisitCount(totalVisitors);
setTotalUsersCount(totalUsers);
setTotalActivitiesCount(totalActivities);
} catch (error) {
console.error("Home page stats error:", error);
}
}

loadHomepageStats();
}, []);
return (
<main style={styles.page}>
<section
style={{
...styles.hero,
textAlign: isRTL ? "right" : "center",
direction: isRTL ? "rtl" : "ltr",
}}
>
<p style={styles.heroEyebrow}>Workforce Infrastructure Platform</p>

<h1 style={styles.title}>{t.title}</h1>

<p style={styles.subtitle}>
HireMinds is built for people, partners, and workforce ecosystems that
want more than scattered tools. This is where visibility, readiness,
planning, and opportunity come together in one modern career infrastructure.
</p>

<div
style={{
...styles.buttonRow,
justifyContent: isRTL ? "flex-start" : "center",
}}
>
<a href="/sign-up" style={styles.primaryButton}>
Create Career Passport / Sign Up
</a>
</div>

<div style={styles.heroHighlightWrap}>
<div style={styles.heroHighlightCard}>
<p style={styles.heroHighlightTitle}>Built for momentum</p>
<p style={styles.heroHighlightText}>
Create your Career Passport, build a stronger resume, sharpen your
story, and keep moving with tools that work long after the workshop ends.
</p>
</div>

<div style={styles.heroHighlightCard}>
<p style={styles.heroHighlightTitle}>Built for visibility</p>
<p style={styles.heroHighlightText}>
HireMinds helps job seekers become easier to support, easier to
track, and easier to connect with the right next opportunity.
</p>
</div>

<div style={styles.heroHighlightCard}>
<p style={styles.heroHighlightTitle}>Built for infrastructure</p>
<p style={styles.heroHighlightText}>
Partners and employers gain a cleaner, more powerful way to support
progress, reporting, and workforce connection.
</p>
</div>
</div>
</section>

<section
style={{
...styles.infoSection,
textAlign: isRTL ? "right" : "center",
direction: isRTL ? "rtl" : "ltr",
}}
>
<h2 style={styles.sectionTitle}>Built for Talent, Partners, and Employers</h2>
<p style={styles.sectionIntro}>
HireMinds is designed to feel practical, elevated, and future-facing.
It gives job seekers stronger career tools, gives partners more structure
and visibility, and gives employers a stronger pathway to more prepared talent.
</p>

<div
style={{
...styles.featureGrid,
direction: isRTL ? "rtl" : "ltr",
}}
>
<div style={styles.card}>
<p style={styles.cardEyebrow}>For Job Seekers</p>
<h3 style={styles.cardTitle}>Talent Readiness</h3>
<p style={styles.cardText}>
Build resumes, strengthen personal branding, prepare for interviews,
organize next steps, and use guided tools that support stronger
career momentum from day one.
</p>
</div>

<div style={styles.card}>
<p style={styles.cardEyebrow}>For Partners</p>
<h3 style={styles.cardTitle}>Partner Infrastructure</h3>
<p style={styles.cardText}>
Support participants with practical career tools, stronger visibility,
resource alignment, and a platform designed for measurable workforce progress.
</p>
</div>

<div style={styles.card}>
<p style={styles.cardEyebrow}>For Employers</p>
<h3 style={styles.cardTitle}>Employer Visibility</h3>
<p style={styles.cardText}>
Connect with talent that is more prepared, more visible, and supported
by a system designed to strengthen readiness, follow-through, and opportunity.
</p>
</div>
</div>
</section>

<section style={styles.valueSection}>
<div style={styles.valueHeader}>
<p style={styles.valueEyebrow}>Why HireMinds</p>
<h2 style={styles.valueTitle}>A stronger experience from first step to next move</h2>
<p style={styles.valueIntro}>
The Career Toolkit is one of the most practical parts of the platform.
It gives users access to guided resume help, interview preparation,
analyzers, planning tools, and career support resources designed to
keep momentum going beyond a single session.
</p>
</div>

<div style={styles.valueGrid}>
<div style={styles.valueCard}>
<h3 style={styles.valueCardTitle}>More than a resume tool</h3>
<p style={styles.valueCardText}>
HireMinds is not just about one document. It helps users build a
stronger profile, stronger direction, and stronger next-step clarity.
</p>
</div>

<div style={styles.valueCard}>
<h3 style={styles.valueCardTitle}>A Career Toolkit with real range</h3>
<p style={styles.valueCardText}>
From resumes and cover letters to interview prep, analyzers, job logs,
budgeting, and skill-building, the Career Toolkit is built to feel useful,
dynamic, and worth coming back to.
</p>
</div>

<div style={styles.valueCard}>
<h3 style={styles.valueCardTitle}>More than a one-time workshop</h3>
<p style={styles.valueCardText}>
The experience continues after the session, giving participants tools
they can revisit, refine, and grow with over time.
</p>
</div>
</div>
</section>

<section style={styles.statsSection}>
<div style={styles.statsIntroWrap}>
<p style={styles.statsEyebrow}>Live Platform Momentum</p>
<h2 style={styles.statsTitle}>A growing platform built for real movement</h2>
<p style={styles.statsIntro}>
These numbers reflect ongoing platform reach, engagement, and user growth.
They are designed to show real momentum.
</p>
</div>

<div style={styles.statsRow}>
<div style={styles.statItem}>
<p style={styles.statNumber}>
{visitCount !== null ? visitCount.toLocaleString() : "--"}
</p>
<p style={styles.statLabel}>Total Visitors</p>
<p style={styles.statSubtext}>
A lifetime count of people exploring the HireMinds experience from launch to now.
</p>
</div>

<div style={styles.statItem}>
<p style={styles.statNumber}>
{totalUsersCount !== null ? totalUsersCount.toLocaleString() : "--"}
</p>
<p style={styles.statLabel}>Total Users</p>
<p style={styles.statSubtext}>
An expanding community building visibility, readiness, and next steps.
</p>
</div>

<div style={styles.statItem}>
<p style={styles.statNumber}>
{totalActivitiesCount !== null ? totalActivitiesCount.toLocaleString() : "--"}
</p>
<p style={styles.statLabel}>Activity Counter</p>
<p style={styles.statSubtext}>
Ongoing platform engagement across tools, actions, and career progress.
</p>
</div>
</div>

<p style={styles.platformLine}>
HireMinds is built to elevate visibility, strengthen readiness, and create
smarter career momentum through better tools, stronger branding, partner support,
and more meaningful employment connections.
</p>

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
padding: "32px 24px 56px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
hero: {
maxWidth: "1120px",
margin: "0 auto 34px",
padding: "8px 12px 8px",
},
heroEyebrow: {
margin: "0 0 12px",
color: "#a1a1aa",
fontSize: "11px",
fontWeight: 700,
letterSpacing: "0.18em",
textTransform: "uppercase",
},
title: {
margin: "0 0 14px",
fontSize: "clamp(2.2rem, 5vw, 3.7rem)",
lineHeight: 1.02,
fontWeight: 600,
letterSpacing: "-0.05em",
color: "#f5f5f5",
},
subtitle: {
maxWidth: "820px",
margin: "0 auto",
color: "#c4c4c4",
fontSize: "16px",
lineHeight: 1.85,
},
buttonRow: {
display: "flex",
gap: "14px",
flexWrap: "wrap",
marginTop: "26px",
},
primaryButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: "12px 32px",
minHeight: "46px",
borderRadius: "16px",
textDecoration: "none",
background: "linear-gradient(180deg, #ececef 0%, #c9c9cf 100%)",
color: "#09090b",
fontWeight: 900,
fontSize: "14px",
letterSpacing: "0.01em",
boxShadow: "0 10px 22px rgba(255,255,255,0.08)",
border: "1px solid rgba(255,255,255,0.18)",
},
heroHighlightWrap: {
maxWidth: "1120px",
margin: "28px auto 0",
display: "grid",
gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
gap: "18px",
},
heroHighlightCard: {
background: "linear-gradient(180deg, #111214 0%, #17181b 100%)",
border: "1px solid #23252a",
borderRadius: "24px",
padding: "22px",
boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
},
heroHighlightTitle: {
margin: "0 0 10px",
color: "#f5f5f5",
fontSize: "18px",
fontWeight: 600,
},
heroHighlightText: {
margin: 0,
color: "#c8c8c8",
fontSize: "15px",
lineHeight: 1.8,
},
infoSection: {
maxWidth: "1120px",
margin: "0 auto",
paddingTop: "8px",
},
sectionTitle: {
margin: "0 0 12px",
color: "#f5f5f5",
fontSize: "30px",
fontWeight: 600,
letterSpacing: "-0.03em",
},
sectionIntro: {
maxWidth: "860px",
margin: "0 auto 24px",
color: "#c4c4c4",
fontSize: "16px",
lineHeight: 1.8,
},
featureGrid: {
maxWidth: "1120px",
margin: "0 auto",
display: "grid",
gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
gap: "18px",
},
card: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "22px",
boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
textAlign: "inherit",
},
cardEyebrow: {
margin: "0 0 8px",
color: "#93c5fd",
fontSize: "11px",
fontWeight: 700,
letterSpacing: "0.14em",
textTransform: "uppercase",
},
cardTitle: {
margin: "0 0 10px",
color: "#f5f5f5",
fontSize: "22px",
fontWeight: 600,
},
cardText: {
margin: 0,
color: "#c8c8c8",
fontSize: "15px",
lineHeight: 1.8,
},
valueSection: {
maxWidth: "1120px",
margin: "34px auto 0",
},
valueHeader: {
textAlign: "center",
marginBottom: "18px",
},
valueEyebrow: {
margin: "0 0 8px",
color: "#9ca3af",
fontSize: "11px",
fontWeight: 700,
letterSpacing: "0.16em",
textTransform: "uppercase",
},
valueTitle: {
margin: "0 0 10px",
color: "#f5f5f5",
fontSize: "28px",
fontWeight: 600,
letterSpacing: "-0.03em",
},
valueIntro: {
margin: "0 auto",
color: "#c4c4c4",
fontSize: "15px",
lineHeight: 1.8,
maxWidth: "860px",
},
valueGrid: {
display: "grid",
gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
gap: "18px",
},
valueCard: {
background: "linear-gradient(180deg, #111214 0%, #17181b 100%)",
border: "1px solid #23252a",
borderRadius: "24px",
padding: "22px",
},
valueCardTitle: {
margin: "0 0 10px",
color: "#f5f5f5",
fontSize: "20px",
fontWeight: 600,
},
valueCardText: {
margin: 0,
color: "#c8c8c8",
fontSize: "15px",
lineHeight: 1.8,
},
statsSection: {
maxWidth: "1120px",
margin: "42px auto 0",
paddingTop: "24px",
borderTop: "1px solid rgba(255,255,255,0.08)",
},
statsIntroWrap: {
textAlign: "center",
marginBottom: "20px",
},
statsEyebrow: {
margin: "0 0 8px",
color: "#9ca3af",
fontSize: "11px",
fontWeight: 700,
letterSpacing: "0.16em",
textTransform: "uppercase",
},
statsTitle: {
margin: "0 0 10px",
color: "#f5f5f5",
fontSize: "28px",
fontWeight: 600,
letterSpacing: "-0.03em",
},
statsIntro: {
margin: "0 auto",
color: "#c4c4c4",
fontSize: "15px",
lineHeight: 1.8,
maxWidth: "860px",
},
statsRow: {
display: "grid",
gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
gap: "18px",
alignItems: "start",
marginBottom: "22px",
marginTop: "24px",
},
statItem: {
textAlign: "center",
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px 18px",
},
statNumber: {
margin: "0 0 8px",
color: "#f5f5f5",
fontSize: "30px",
fontWeight: 600,
letterSpacing: "-0.02em",
},
statLabel: {
margin: "0 0 8px",
color: "#d4d4d8",
fontSize: "15px",
lineHeight: 1.7,
fontWeight: 600,
},
statSubtext: {
margin: 0,
color: "#a1a1aa",
fontSize: "14px",
lineHeight: 1.75,
},
platformLine: {
margin: "0 0 10px",
textAlign: "center",
color: "#d4d4d8",
fontSize: "15px",
lineHeight: 1.8,
maxWidth: "920px",
marginLeft: "auto",
marginRight: "auto",
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
