"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const REQUIRED_CODE = "TWP2026";

export default function SkillsQuestPage() {
const [allowed, setAllowed] = useState(false);
const [checked, setChecked] = useState(false);

const [medicalStudyComplete, setMedicalStudyComplete] = useState(false);
const [healthcareStudyComplete, setHealthcareStudyComplete] = useState(false);

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

setAllowed(userReferralCode === REQUIRED_CODE);

setMedicalStudyComplete(
localStorage.getItem("medicalTerminologyStudyComplete") === "true"
);

setHealthcareStudyComplete(
localStorage.getItem("healthcareAdminStudyComplete") === "true"
);

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
This learning area is only available to approved participants.
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
Complete study guides, unlock assessments, earn certificates, and
prepare for real job opportunities.
</p>
</section>

<section style={styles.grid}>
{/* MEDICAL TERMINOLOGY */}
<div style={styles.card}>
<h2>Medical Terminology</h2>

<p>
Learn prefixes, suffixes, root words, and medical terms used in
healthcare settings.
</p>

<div style={styles.statusBox}>
<strong>Status:</strong>{" "}
{medicalStudyComplete
? "Assessment Unlocked"
: "Study Guide Required"}
</div>

<div style={styles.buttonGroup}>
<Link href="/medical-terminology-study" style={styles.primaryButton}>
Study Guide
</Link>

{medicalStudyComplete ? (
<Link
href="/medical-terminology-assessment"
style={styles.secondaryButton}
>
Start Assessment
</Link>
) : (
<span style={styles.lockedButton}>
Complete Study First
</span>
)}
</div>
</div>

{/* HEALTHCARE ADMIN BASICS */}
<div style={styles.card}>
<h2>Healthcare Admin Basics</h2>

<p>
Learn patient intake, scheduling, HIPAA basics, insurance, and
professional communication in healthcare environments.
</p>

<div style={styles.statusBox}>
<strong>Status:</strong>{" "}
{healthcareStudyComplete
? "Assessment Unlocked"
: "Study Guide Required"}
</div>

<div style={styles.buttonGroup}>
<Link href="/healthcare-admin-study" style={styles.primaryButton}>
Study Guide
</Link>

{healthcareStudyComplete ? (
<Link
href="/healthcare-admin-assessment"
style={styles.secondaryButton}
>
Start Assessment
</Link>
) : (
<span style={styles.lockedButton}>
Complete Study First
</span>
)}
</div>
</div>

{/* COMING SOON */}
<div style={{ ...styles.card, opacity: 0.6 }}>
<h2>Customer Service Excellence</h2>
<p>Coming soon</p>
</div>

<div style={{ ...styles.card, opacity: 0.6 }}>
<h2>Interview Readiness</h2>
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
