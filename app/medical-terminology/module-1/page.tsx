"use client";

import Link from "next/link";
import AsyncTracker from "../../components/AsyncTracker";

export default function MedicalTerminologyModuleOne() {
return (
<main style={styles.main}>
<section style={styles.card}>
<p style={styles.kicker}>Medical Terminology • Study Guide 1</p>
<h1>How Medical Words Are Built</h1>

<AsyncTracker
module="medicalTerminology_module_1"
activityType="study"
completionKey="medicalTerminology_module_1"
requiredSeconds={660}
/>

<div style={styles.notice}>
<strong>Timed Study Guide</strong>
<p>
This guide must stay open for 11 minutes before Study Guide 2
unlocks. Review the content, complete the practice prompts, and
return to SkillsQuest once the timer is complete.
</p>
</div>

<h2>What You Are Learning</h2>
<p>
Medical terms are often built from smaller word parts. When you learn
how those parts work, longer medical words become easier to understand.
</p>

<h2>The Three Main Word Parts</h2>

<div style={styles.box}>
<h3>Prefix</h3>
<p>
A prefix appears at the beginning of a word. It changes or adds to
the meaning of the word.
</p>
<p>
Example: <strong>peri-</strong> means around.
</p>
</div>

<div style={styles.box}>
<h3>Root Word</h3>
<p>
The root word gives the main meaning of the term. It often points to
a body part, organ, or system.
</p>
<p>
Example: <strong>cardi</strong> means heart.
</p>
</div>

<div style={styles.box}>
<h3>Suffix</h3>
<p>
A suffix appears at the end of a word. It often describes a
condition, procedure, process, or disease.
</p>
<p>
Example: <strong>-itis</strong> means inflammation.
</p>
</div>

<h2>Example Breakdown</h2>

<div style={styles.exampleBox}>
<h3>Pericarditis</h3>
<p>
<strong>peri-</strong> = around
</p>
<p>
<strong>cardi</strong> = heart
</p>
<p>
<strong>-itis</strong> = inflammation
</p>
<p>
<strong>Meaning:</strong> inflammation around the heart.
</p>
</div>

<h2>Why This Matters in Healthcare</h2>
<p>
Healthcare workers may see medical terms in schedules, care notes,
discharge paperwork, job descriptions, referrals, and patient
instructions. Understanding basic word parts helps you recognize
meaning faster and communicate more confidently.
</p>

<h2>Practice Prompts</h2>
<ul>
<li>What does the suffix <strong>-itis</strong> mean?</li>
<li>What body part does <strong>cardi</strong> refer to?</li>
<li>Break down the word <strong>arthritis</strong>.</li>
<li>Why is learning word parts useful in healthcare settings?</li>
</ul>

<Link href="/skillsquest" style={styles.button}>
Back to SkillsQuest
</Link>
</section>
</main>
);
}

const styles: Record<string, React.CSSProperties> = {
main: {
minHeight: "100vh",
background: "#050505",
color: "#fff",
padding: 24,
fontFamily: "system-ui, Arial, sans-serif",
},
card: {
maxWidth: 920,
margin: "0 auto",
background: "#111",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: 18,
padding: 24,
lineHeight: 1.7,
},
kicker: {
color: "#7db7ff",
fontWeight: 900,
textTransform: "uppercase",
letterSpacing: 1.3,
fontSize: 12,
},
notice: {
background: "rgba(125,183,255,.12)",
border: "1px solid rgba(125,183,255,.22)",
padding: 16,
borderRadius: 14,
margin: "18px 0",
},
box: {
background: "rgba(255,255,255,.06)",
border: "1px solid rgba(255,255,255,.1)",
borderRadius: 14,
padding: 16,
marginBottom: 12,
},
exampleBox: {
background: "rgba(0,0,0,.35)",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: 14,
padding: 16,
marginBottom: 16,
},
button: {
display: "inline-block",
marginTop: 20,
background: "#fff",
color: "#000",
padding: "12px 16px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 900,
},
};
