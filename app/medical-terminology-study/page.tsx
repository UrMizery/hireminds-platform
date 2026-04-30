"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const REQUIRED_SECONDS = 660; // 11 minutes

export default function MedicalTerminologyStudyPage() {
const [secondsLeft, setSecondsLeft] = useState(REQUIRED_SECONDS);
const [complete, setComplete] = useState(false);
const [paused, setPaused] = useState(false);
const reportedStart = useRef(false);
const reportedComplete = useRef(false);

useEffect(() => {
const alreadyComplete =
localStorage.getItem("medicalTerminologyStudyComplete") === "true";

if (alreadyComplete) {
setComplete(true);
setSecondsLeft(0);
return;
}

if (!reportedStart.current) {
reportedStart.current = true;
reportActivity("study_started", 0);
}

function handleVisibilityChange() {
setPaused(document.hidden);
}

document.addEventListener("visibilitychange", handleVisibilityChange);

const timer = setInterval(() => {
if (document.hidden) return;

setSecondsLeft((prev) => {
if (prev <= 1) {
clearInterval(timer);
localStorage.setItem("medicalTerminologyStudyComplete", "true");
setComplete(true);

if (!reportedComplete.current) {
reportedComplete.current = true;
reportActivity("study_completed", REQUIRED_SECONDS);
}

return 0;
}

const studied = REQUIRED_SECONDS - prev + 1;

if (studied % 60 === 0) {
reportActivity("study_progress", studied);
}

return prev - 1;
});
}, 1000);

return () => {
clearInterval(timer);
document.removeEventListener("visibilitychange", handleVisibilityChange);
};
}, []);

async function reportActivity(eventType: string, studySeconds: number) {
try {
await fetch("/api/skillsquest/report", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
module: "medical_terminology",
eventType,
referralCode: localStorage.getItem("hireminds_referral_code") || "",
studySeconds,
details: {
requiredSeconds: REQUIRED_SECONDS,
page: "medical-terminology-study",
},
}),
});
} catch {
// silent fail so user experience does not break
}
}

const minutes = Math.floor(secondsLeft / 60);
const seconds = secondsLeft % 60;

return (
<main style={styles.main}>
<section style={styles.hero}>
<p style={styles.kicker}>HireMinds Study Guide</p>
<h1 style={styles.title}>Medical Terminology Study Guide</h1>
<p style={styles.subtitle}>
Complete the required 11-minute study guide before starting the assessment.
The timer pauses if you leave this page.
</p>

<div style={styles.timerBox}>
{complete ? (
<strong>Assessment Unlocked ✅</strong>
) : paused ? (
<strong>Timer Paused — return to this page to continue</strong>
) : (
<strong>
Required Study Time Remaining: {minutes}:{seconds.toString().padStart(2, "0")}
</strong>
)}
</div>

<div style={styles.buttons}>
<Link href="/skillsquest" style={styles.secondaryBtn}>
Back to SkillsQuest
</Link>

{complete ? (
<Link href="/medical-terminology-assessment" style={styles.primaryBtn}>
Start Assessment
</Link>
) : (
<span style={styles.lockedBtn}>Keep Studying to Unlock Assessment</span>
)}
</div>
</section>

<Section title="How Medical Terms Are Built">
Medical terms are usually built from a prefix, root word, and suffix. The prefix comes first, the root gives the main meaning, and the suffix explains the condition, procedure, or action.
</Section>

<Section title="Example: Pericarditis">
peri- means around. cardi/o means heart. -itis means inflammation. Pericarditis means inflammation around the heart.
</Section>

<section style={styles.grid}>
<StudyCard
title="Common Prefixes"
items={[
"hyper- = excessive / above normal",
"hypo- = below / under",
"tachy- = fast",
"brady- = slow",
"peri- = around",
"intra- = within",
"sub- = under",
"pre- = before",
"post- = after",
"a- / an- = without or absence of",
]}
/>

<StudyCard
title="Common Root Words"
items={[
"cardi/o = heart",
"nephr/o = kidney",
"derm/o = skin",
"oste/o = bone",
"hepat/o = liver",
"gastr/o = stomach",
"pulmon/o = lung",
"neur/o = nerve",
"hemat/o = blood",
"arthr/o = joint",
]}
/>

<StudyCard
title="Common Suffixes"
items={[
"-itis = inflammation",
"-ectomy = surgical removal",
"-ology = study of",
"-scopy = visual examination",
"-osis = abnormal condition",
"-algia = pain",
"-emia = blood condition",
"-plasty = surgical repair",
"-gram = record or image",
"-graphy = process of recording",
]}
/>

<StudyCard
title="Practice Terms"
items={[
"gastritis = stomach inflammation",
"dermatology = study of the skin",
"nephrectomy = kidney removal",
"bradycardia = slow heartbeat",
"tachycardia = fast heartbeat",
"osteoporosis = abnormal bone condition",
"hepatitis = liver inflammation",
"arthralgia = joint pain",
"hematology = study of blood",
"pulmonary = related to the lungs",
]}
/>
</section>

<Section title="Why This Matters in Healthcare Jobs">
Medical terminology is useful in medical front desk, patient access, billing, coding, healthcare administration, medical assisting, insurance verification, and clinical support roles. Understanding terms helps candidates communicate clearly, document accurately, and feel more confident in interviews.
</Section>

<Section title="Quick Practice Thinking">
If you see hypoglycemia, break it down: hypo means low, glyc means sugar, and -emia means blood condition. That means low blood sugar. If you see dermatology, derm means skin and -ology means study of. That means study of the skin.
</Section>

<Section title="Final Tip">
You do not need to memorize every medical word. The goal is to learn how to break words apart and understand the meaning from the pieces.
</Section>

<section style={styles.card}>
{complete ? (
<Link href="/medical-terminology-assessment" style={styles.primaryBtn}>
Start Assessment
</Link>
) : (
<p>Stay on this page until the 11-minute timer completes.</p>
)}
</section>
</main>
);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
return (
<section style={styles.card}>
<h2>{title}</h2>
<p style={styles.text}>{children}</p>
</section>
);
}

function StudyCard({ title, items }: { title: string; items: string[] }) {
return (
<div style={styles.studyCard}>
<h3>{title}</h3>
<ul>
{items.map((item) => (
<li key={item} style={styles.li}>
{item}
</li>
))}
</ul>
</div>
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
hero: { maxWidth: 1100, margin: "0 auto", padding: "34px 0" },
kicker: { textTransform: "uppercase", letterSpacing: 1.5, fontSize: 12, color: "#7db7ff", fontWeight: 800 },
title: { fontSize: 44, margin: "8px 0", fontWeight: 950 },
subtitle: { fontSize: 16, color: "rgba(255,255,255,.78)", maxWidth: 760, lineHeight: 1.6 },
timerBox: { marginTop: 18, padding: 14, borderRadius: 14, background: "rgba(255,255,255,.09)", border: "1px solid rgba(255,255,255,.14)", maxWidth: 520 },
buttons: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 },
primaryBtn: { display: "inline-block", background: "#fff", color: "#000", padding: "12px 16px", borderRadius: 12, fontWeight: 900, textDecoration: "none" },
secondaryBtn: { display: "inline-block", background: "rgba(255,255,255,.09)", color: "#fff", padding: "12px 16px", borderRadius: 12, fontWeight: 800, textDecoration: "none", border: "1px solid rgba(255,255,255,.16)" },
lockedBtn: { display: "inline-block", background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.65)", padding: "12px 16px", borderRadius: 12, fontWeight: 800 },
card: { maxWidth: 1100, margin: "0 auto 18px", padding: 20, borderRadius: 18, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", lineHeight: 1.6 },
text: { color: "rgba(255,255,255,.84)", lineHeight: 1.7 },
grid: { maxWidth: 1100, margin: "0 auto 18px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 },
studyCard: { padding: 18, borderRadius: 18, background: "rgba(255,255,255,.075)", border: "1px solid rgba(255,255,255,.12)" },
li: { marginBottom: 8, color: "rgba(255,255,255,.84)" },
};
