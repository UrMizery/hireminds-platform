"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "./lib/language-context";
import { supabase } from "./lib/supabase";

export default function HomePage() {
const { t } = useLanguage();
const isRTL = false;

const [visitCount, setVisitCount] = useState<number | null>(null);

useEffect(() => {
async function trackHomeVisit() {
try {
const sessionKey = "hireminds-home-visit-counted";
const alreadyCounted = sessionStorage.getItem(sessionKey);

if (!alreadyCounted) {
const { data: currentRow, error: readError } = await supabase
.from("page_visits")
.select("visit_count")
.eq("page_key", "home")
.single();

if (readError) {
console.error("Error reading home page visit count:", readError);
} else {
const currentCount = currentRow?.visit_count ?? 0;

const { error: updateError } = await supabase
.from("page_visits")
.update({
visit_count: currentCount + 1,
updated_at: new Date().toISOString(),
})
.eq("page_key", "home");

if (updateError) {
console.error("Error updating home page visit count:", updateError);
} else {
sessionStorage.setItem(sessionKey, "true");
}
}
}

const { data: latestRow, error: latestError } = await supabase
.from("page_visits")
.select("visit_count")
.eq("page_key", "home")
.single();

if (latestError) {
console.error("Error fetching latest home page visit count:", latestError);
} else {
setVisitCount(latestRow?.visit_count ?? 0);
}
} catch (error) {
console.error("Home page visitor counter error:", error);
}
}

trackHomeVisit();
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
<p style={styles.statNumber}>
{visitCount !== null ? visitCount.toLocaleString() : "--"}
</p>
<p style={styles.statLabel}>Visitors</p>
</div>

<div style={styles.statItem}>
<p style={styles.statNumber}>New Users</p>
<p style={styles.statLabel}>
Fresh talent discovering new opportunities
</p>
</div>

<div style={styles.statItem}>
<p style={styles.statNumber}>Active Users</p>
<p style={styles.statLabel}>
Signed up and building career momentum
</p>
</div>
</div>

<p style={styles.platformLine}>
5-Star Platform built to elevate visibility, strengthen readiness, and
empower talent through smarter career tools, stronger branding, and
more meaningful employment connections.
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
padding: "40px 24px 56px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
hero: {
maxWidth: "1100px",
margin: "0 auto 34px",
padding: "24px 12px 12px",
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
