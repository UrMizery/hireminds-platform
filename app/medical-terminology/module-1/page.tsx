"use client";

import Link from "next/link";
import AsyncTracker from "../../components/AsyncTracker";

export default function MedicalTerminologyModuleOne() {
return (
<main style={styles.main}>
<section style={styles.card}>
<p style={styles.kicker}>Medical Terminology • Module 1</p>
<h1>How Medical Words Are Built</h1>

<AsyncTracker
module="medicalTerminology_module_1"
activityType="study"
completionKey="medicalTerminology_module_1"
requiredSeconds={660}
/>

<p>
Medical terms are often built from word parts. Once you understand
those parts, you can break down unfamiliar words more easily.
</p>

<h2>Three Common Word Parts</h2>
<p>
<strong>Prefix:</strong> appears at the beginning of a word and changes
the meaning.
</p>
<p>
<strong>Root word:</strong> gives the main meaning of the term.
</p>
<p>
<strong>Suffix:</strong> appears at the end and often describes a
condition, procedure, or process.
</p>

<h2>Example</h2>
<p>
<strong>Pericarditis</strong>
</p>
<p>
peri- = around<br />
cardi = heart<br />
-itis = inflammation
</p>
<p>
Meaning: inflammation around the heart.
</p>

<h2>Why This Matters</h2>
<p>
Healthcare workers often see medical words in schedules, care notes,
referrals, discharge papers, and job descriptions. Learning word parts
helps you understand the meaning faster.
</p>

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
maxWidth: 900,
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
