import Link from "next/link";

export default function MedicalTerminologyStudyPage() {
return (
<main style={styles.main}>
<section style={styles.hero}>
<p style={styles.kicker}>HireMinds Study Guide</p>
<h1 style={styles.title}>Medical Terminology Study Guide</h1>
<p style={styles.subtitle}>
Learn the basics before taking the MedScope™ Medical Terminology Assessment.
</p>

<div style={styles.buttons}>
<Link href="/medical-terminology-assessment" style={styles.primaryBtn}>
Take Assessment
</Link>
<Link href="/" style={styles.secondaryBtn}>
Home
</Link>
</div>
</section>

<section style={styles.card}>
<h2>How Medical Terms Are Built</h2>
<p>
Medical words are often made from three parts: a prefix, root word, and suffix.
</p>

<div style={styles.exampleBox}>
<strong>Example: Pericarditis</strong>
<p>
<b>peri-</b> = around<br />
<b>card</b> = heart<br />
<b>-itis</b> = inflammation
</p>
<p><b>Meaning:</b> inflammation around the heart.</p>
</div>
</section>

<section style={styles.grid}>
<StudyCard
title="Common Prefixes"
items={[
"hyper- = excessive / above normal",
"hypo- = below / under",
"tachy- = fast",
"brady- = slow",
"peri- = around",
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
]}
/>

<StudyCard
title="Practice Terms"
items={[
"gastritis = stomach inflammation",
"dermatology = study of the skin",
"nephrectomy = kidney removal",
"bradycardia = slow heartbeat",
"pericarditis = inflammation around the heart",
]}
/>
</section>

<section style={styles.card}>
<h2>Career Tip</h2>
<p>
Medical terminology is useful for medical front desk, patient access,
billing, coding, healthcare administration, medical assistant, and clinical support roles.
</p>
</section>

<section style={styles.card}>
<h2>Ready?</h2>
<p>
When you are ready, take the assessment. You will need the access code:
</p>
<div style={styles.codeBox}>MED-N0NP</div>
<p style={styles.note}>
Score 80% or higher on the terminology section to unlock a certificate of completion.
</p>
<Link href="/medical-terminology-assessment" style={styles.primaryBtn}>
Start Assessment
</Link>
</section>
</main>
);
}

function StudyCard({ title, items }: { title: string; items: string[] }) {
return (
<div style={styles.studyCard}>
<h3>{title}</h3>
<ul>
{items.map((item) => (
<li key={item} style={styles.li}>{item}</li>
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
hero: {
maxWidth: 1100,
margin: "0 auto",
padding: "34px 0",
},
kicker: {
textTransform: "uppercase",
letterSpacing: 1.5,
fontSize: 12,
color: "#7db7ff",
fontWeight: 800,
},
title: {
fontSize: 44,
margin: "8px 0",
fontWeight: 950,
},
subtitle: {
fontSize: 16,
color: "rgba(255,255,255,.78)",
maxWidth: 720,
lineHeight: 1.6,
},
buttons: {
display: "flex",
gap: 10,
flexWrap: "wrap",
marginTop: 18,
},
primaryBtn: {
display: "inline-block",
background: "#fff",
color: "#000",
padding: "12px 16px",
borderRadius: 12,
fontWeight: 900,
textDecoration: "none",
border: "none",
cursor: "pointer",
},
secondaryBtn: {
display: "inline-block",
background: "rgba(255,255,255,.09)",
color: "#fff",
padding: "12px 16px",
borderRadius: 12,
fontWeight: 800,
textDecoration: "none",
border: "1px solid rgba(255,255,255,.16)",
},
card: {
maxWidth: 1100,
margin: "0 auto 18px",
padding: 20,
borderRadius: 18,
background: "rgba(255,255,255,.07)",
border: "1px solid rgba(255,255,255,.12)",
lineHeight: 1.6,
},
exampleBox: {
marginTop: 12,
padding: 16,
borderRadius: 14,
background: "rgba(0,0,0,.35)",
border: "1px solid rgba(255,255,255,.12)",
},
grid: {
maxWidth: 1100,
margin: "0 auto 18px",
display: "grid",
gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
gap: 14,
},
studyCard: {
padding: 18,
borderRadius: 18,
background: "rgba(255,255,255,.075)",
border: "1px solid rgba(255,255,255,.12)",
},
li: {
marginBottom: 8,
color: "rgba(255,255,255,.84)",
},
codeBox: {
display: "inline-block",
padding: "10px 14px",
borderRadius: 12,
background: "#fff",
color: "#000",
fontWeight: 950,
letterSpacing: 1,
margin: "8px 0",
},
note: {
color: "rgba(255,255,255,.75)",
},
};
