"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const REQUIRED_CODE = "TWP2026";

export default function SkillsQuestPage() {
const [allowed, setAllowed] = useState(false);
const [checked, setChecked] = useState(false);
const [studyComplete, setStudyComplete] = useState(false);

useEffect(() => {
async function checkAccess() {
const {
data: { session },
} = await supabase.auth.getSession();

const user = session?.user;

const userReferralCode = String(
user?.user_metadata?.referral_code ||
user?.user_metadata?.referralCode ||
user?.user_metadata?.access_code ||
""
)
.trim()
.toUpperCase();

const completedStudy =
localStorage.getItem("medicalTerminologyStudyComplete") === "true";

setAllowed(userReferralCode === REQUIRED_CODE);
setStudyComplete(completedStudy);
setChecked(true);
}

checkAccess();
}, []);

if (!checked) {
return (
<main style={styles.main}>
<p>Loading SkillsQuest...</p>
</main>
);
}

if (!allowed) {
return (
<main style={styles.main}>
<section style={styles.lockCard}>
<h1>SkillsQuest Locked</h1>
<p>
This learning area is currently available only to approved TWP2026
participants.
</p>

<Link href="/" style={styles.button}>
Return Home
</Link>
</section>
</main>
);
}

return (
<main style={styles.main}>
<section style={styles.hero}>
<p style={styles.kicker}>HireMinds Learning Hub</p>
<h1 style={styles.title}>SkillsQuest</h1>

<p style={styles.subtitle}>
Study guides, timed assessments, certifications, and career pathways
built to help candidates grow faster and prove readiness.
</p>
</section>

<section style={styles.grid}>
<div style={styles.card}>
<h2>Medical Terminology Pathway</h2>

<p>
Review prefixes, suffixes, root words, and common healthcare terms.
Complete the required study guide before unlocking the assessment.
</p>

<div style={styles.statusBox}>
<strong>Status:</strong>{" "}
{studyComplete ? "Assessment Unlocked" : "Study Guide Required"}
</div>

<div style={styles.buttonGroup}>
<Link href="/medical-terminology-study" style={styles.primaryButton}>
Open Study Guide
</Link>

{studyComplete ? (
<Link
href="/medical-terminology-assessment"
style={styles.secondaryButton}
>
Start Assessment
</Link>
) : (
<span style={styles.lockedButton}>
Complete Study Guide First
</span>
)}
</div>
</div>

<div style={{ ...styles.card, opacity: 0.65 }}>
<h2>Customer Service Assessment</h2>
<p>Coming soon</p>
</div>

<div style={{ ...styles.card, opacity: 0.65 }}>
<h2>Interview Readiness Assessment</h2>
<p>Coming soon</p>
</div>
</section>
</main>
);
}

const styles: Record<string, React.CSSProperties> = {
main: {
minHeight: "100vh",
background:
"radial-gradient(circle at top left, rgba(0,122,255,.20), transparent 35%), linear-gradient(180deg,#050505,#101010)",
color: "#ffffff",
padding: "32px",
fontFamily: "system-ui, Arial, sans-serif",
},

hero: {
maxWidth: 1100,
margin: "0 auto 32px auto",
},

kicker: {
color: "#7db7ff",
fontWeight: 900,
letterSpacing: 1.4,
textTransform: "uppercase",
fontSize: 12,
},

title: {
fontSize: 48,
fontWeight: 900,
margin: "8px 0",
},

subtitle: {
fontSize: 16,
lineHeight: 1.7,
color: "rgba(255,255,255,.78)",
maxWidth: 760,
},

grid: {
maxWidth: 1100,
margin: "0 auto",
display: "grid",
gap: 18,
},

card: {
background: "rgba(255,255,255,.06)",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: 20,
padding: 24,
},

statusBox: {
marginTop: 18,
marginBottom: 18,
padding: 14,
borderRadius: 12,
background: "rgba(255,255,255,.08)",
},

buttonGroup: {
display: "flex",
gap: 12,
flexWrap: "wrap",
marginTop: 10,
},

primaryButton: {
background: "#ffffff",
color: "#000000",
padding: "12px 18px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 800,
},

secondaryButton: {
background: "#0A84FF",
color: "#ffffff",
padding: "12px 18px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 800,
},

lockedButton: {
background: "rgba(255,255,255,.10)",
color: "rgba(255,255,255,.70)",
padding: "12px 18px",
borderRadius: 12,
fontWeight: 800,
},

lockCard: {
maxWidth: 650,
margin: "100px auto",
padding: 30,
borderRadius: 22,
background: "rgba(255,255,255,.06)",
border: "1px solid rgba(255,255,255,.12)",
},

button: {
display: "inline-block",
marginTop: 16,
background: "#ffffff",
color: "#000000",
padding: "12px 18px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 800,
},
};
