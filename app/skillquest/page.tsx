"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

const REQUIRED_CODE = "TWP2026";

export default function SkillQuestPage() {
const [allowed, setAllowed] = useState(false);
const [checked, setChecked] = useState(false);

useEffect(() => {
const code =
localStorage.getItem("hireminds_referral_code") ||
localStorage.getItem("referral_code") ||
"";

setAllowed(code.toUpperCase() === REQUIRED_CODE);
setChecked(true);
}, []);

if (!checked) {
return <main style={styles.main}>Checking access...</main>;
}

if (!allowed) {
return (
<main style={styles.main}>
<section style={styles.lockCard}>
<h1>SkillQuest Locked</h1>
<p>
This learning area is currently available only to approved participants.
</p>
<Link href="/" style={styles.btn}>Return Home</Link>
</section>
</main>
);
}

return (
<main style={styles.main}>
<section style={styles.hero}>
<p style={styles.kicker}>HireMinds Learning Hub</p>
<h1 style={styles.title}>SkillQuest</h1>
<p style={styles.subtitle}>
Study guides, assessments, certificates, and career-readiness tools in one place.
</p>
</section>

<section style={styles.grid}>
<Card
title="Medical Terminology Study Guide"
text="Review prefixes, root words, suffixes, and practice terms before taking the assessment."
href="/medical-terminology-study"
/>

<Card
title="MedScope Medical Terminology Assessment"
text="Take the assessment and unlock a certificate if you score 80% or higher."
href="/medical-terminology-assessment"
/>

<Card
title="More Assessments Coming Soon"
text="Future assessments can include customer service, interviewing, workplace communication, and resume readiness."
href="#"
disabled
/>
</section>
</main>
);
}

function Card({
title,
text,
href,
disabled,
}: {
title: string;
text: string;
href: string;
disabled?: boolean;
}) {
if (disabled) {
return (
<div style={{ ...styles.card, opacity: 0.6 }}>
<h2>{title}</h2>
<p>{text}</p>
<span style={styles.disabledBtn}>Coming Soon</span>
</div>
);
}

return (
<Link href={href} style={styles.card}>
<h2>{title}</h2>
<p>{text}</p>
<span style={styles.cardBtn}>Open</span>
</Link>
);
}

const styles: Record<string, React.CSSProperties> = {
main: {
minHeight: "100vh",
background:
"radial-gradient(circle at top left, rgba(0,122,255,.25), transparent 35%), linear-gradient(180deg,#050505,#111)",
color: "#fff",
fontFamily: "system-ui, Arial, sans-serif",
padding: 24,
},
hero: {
maxWidth: 1100,
margin: "0 auto",
padding: "36px 0",
},
kicker: {
color: "#7db7ff",
fontWeight: 900,
textTransform: "uppercase",
letterSpacing: 1.4,
fontSize: 12,
},
title: {
fontSize: 48,
margin: "8px 0",
fontWeight: 950,
},
subtitle: {
color: "rgba(255,255,255,.78)",
fontSize: 16,
maxWidth: 720,
lineHeight: 1.6,
},
grid: {
maxWidth: 1100,
margin: "0 auto",
display: "grid",
gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
gap: 16,
},
card: {
display: "block",
color: "#fff",
textDecoration: "none",
padding: 22,
borderRadius: 20,
background: "rgba(255,255,255,.075)",
border: "1px solid rgba(255,255,255,.14)",
},
cardBtn: {
display: "inline-block",
marginTop: 12,
background: "#fff",
color: "#000",
padding: "10px 14px",
borderRadius: 12,
fontWeight: 900,
},
disabledBtn: {
display: "inline-block",
marginTop: 12,
background: "rgba(255,255,255,.12)",
color: "#fff",
padding: "10px 14px",
borderRadius: 12,
fontWeight: 900,
},
lockCard: {
maxWidth: 650,
margin: "80px auto",
padding: 28,
borderRadius: 22,
background: "rgba(255,255,255,.075)",
border: "1px solid rgba(255,255,255,.14)",
},
btn: {
display: "inline-block",
marginTop: 12,
background: "#fff",
color: "#000",
padding: "12px 16px",
borderRadius: 12,
fontWeight: 900,
textDecoration: "none",
},
};
