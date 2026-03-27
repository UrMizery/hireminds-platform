"use client";

import { useMemo, useState } from "react";

export default function CareerGoalGeneratorPage() {
const [fullName, setFullName] = useState("");
const [careerGoal, setCareerGoal] = useState("");
const [whyChosen, setWhyChosen] = useState("");
const [researchDone, setResearchDone] = useState("");
const [expectedOutcome, setExpectedOutcome] = useState("");
const [expectedPay, setExpectedPay] = useState("");
const [barriers, setBarriers] = useState("");
const [overcomeBarriers, setOvercomeBarriers] = useState("");
const [supportSystem, setSupportSystem] = useState("");
const [startTimeline, setStartTimeline] = useState("");
const [extraNotes, setExtraNotes] = useState("");

const generatedEssay = useMemo(() => {
const name = fullName || "Your Name";
const goal = careerGoal || "this career path";
const chosen = whyChosen || "it aligns with my goals, interests, and long-term future";
const research =
researchDone ||
"I have taken time to learn about the field, the responsibilities involved, and what is needed to be successful in it";
const outcome =
expectedOutcome ||
"the opportunity to build a stable future, strengthen my skills, and grow professionally";
const pay =
expectedPay ||
"a wage that can help me become more financially stable and continue moving toward my long-term goals";
const challenge =
barriers ||
"normal life challenges that can sometimes make it harder to move forward";
const solution =
overcomeBarriers ||
"staying organized, asking for help when needed, and remaining focused on the bigger goal";
const support =
supportSystem ||
"the people around me who encourage me and want to see me succeed";
const timeline =
startTimeline || "as soon as I am able to move forward with the next step";
const notes = extraNotes ? ` ${extraNotes}` : "";

return `${fullName ? `${fullName}` : `${name}`} is interested in pursuing ${goal} because ${chosen}. ${research}. The expected outcome is ${outcome}, with the possibility of earning ${pay}. One challenge that may come up is ${challenge}, but this can be addressed by ${solution}. Support from ${support} will also play an important role in staying on track. The goal is to begin ${timeline} and continue building toward a stronger career path and a more stable future.${notes}`;
}, [
fullName,
careerGoal,
whyChosen,
researchDone,
expectedOutcome,
expectedPay,
barriers,
overcomeBarriers,
supportSystem,
startTimeline,
extraNotes,
]);

function handlePrint() {
window.print();
}

return (
<main style={styles.page}>
<style>{`
@media print {
body * {
visibility: hidden !important;
}

.print-wrap,
.print-wrap * {
visibility: visible !important;
}

.print-wrap {
position: absolute !important;
top: 0 !important;
left: 0 !important;
width: 100% !important;
background: white !important;
padding: 0 !important;
margin: 0 !important;
}
}
`}</style>

<div style={styles.shell}>
<section style={styles.leftCol}>
<div style={styles.card}>
<p style={styles.kicker}>Career Goal Generator</p>
<h1 style={styles.title}>Create a career goal statement</h1>
<p style={styles.subtitle}>
Build a clear written statement about the career path you want to pursue,
why you chose it, what you researched, and how you plan to move forward.
</p>
</div>

<div style={styles.card}>
<div style={styles.twoCol}>
<Field
label="Full Name"
value={fullName}
onChange={setFullName}
placeholder="Your name"
/>
<Field
label="Career Goal"
value={careerGoal}
onChange={setCareerGoal}
placeholder="Example: Medical Assistant"
/>
</div>

<TextAreaField
label="Why did you choose this path?"
value={whyChosen}
onChange={setWhyChosen}
placeholder="Explain why this career fits your interests, goals, or future plans."
/>

<TextAreaField
label="What research have you done?"
value={researchDone}
onChange={setResearchDone}
placeholder="What have you learned about the role, training, job outlook, or responsibilities?"
/>

<div style={styles.twoCol}>
<Field
label="Expected Outcome"
value={expectedOutcome}
onChange={setExpectedOutcome}
placeholder="Stable job, career growth, long-term opportunity"
/>
<Field
label="Expected Pay"
value={expectedPay}
onChange={setExpectedPay}
placeholder="Example: $20-$25 per hour"
/>
</div>

<TextAreaField
label="Barriers or Challenges"
value={barriers}
onChange={setBarriers}
placeholder="Transportation, childcare, time, finances, confidence, etc."
/>

<TextAreaField
label="How will you overcome those barriers?"
value={overcomeBarriers}
onChange={setOvercomeBarriers}
placeholder="Explain how you plan to manage or work through those barriers."
/>

<TextAreaField
label="Who is supporting you?"
value={supportSystem}
onChange={setSupportSystem}
placeholder="Family, friends, mentors, coaches, community, etc."
/>

<Field
label="When can you start?"
value={startTimeline}
onChange={setStartTimeline}
placeholder="As soon as possible, next month, after current obligations, etc."
/>

<TextAreaField
label="Extra Notes (optional)"
value={extraNotes}
onChange={setExtraNotes}
placeholder="Anything else you want included."
/>

<div style={styles.buttonRow}>
<button onClick={handlePrint} style={styles.primaryButton}>
Print / Save
</button>

<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</div>
</section>

<aside className="print-wrap" style={styles.rightCol}>
<div style={styles.previewPaper}>
<p style={styles.previewKicker}>Live Preview</p>
<h2 style={styles.previewTitle}>Career Goal Statement</h2>
<p style={styles.previewText}>{generatedEssay}</p>
</div>
</aside>
</div>
</main>
);
}

function Field({
label,
value,
onChange,
placeholder,
}: {
label: string;
value: string;
onChange: (value: string) => void;
placeholder?: string;
}) {
return (
<div style={styles.fieldWrap}>
<label style={styles.label}>{label}</label>
<input
value={value}
onChange={(e) => onChange(e.target.value)}
placeholder={placeholder}
style={styles.input}
/>
</div>
);
}

function TextAreaField({
label,
value,
onChange,
placeholder,
}: {
label: string;
value: string;
onChange: (value: string) => void;
placeholder?: string;
}) {
return (
<div style={styles.fieldWrap}>
<label style={styles.label}>{label}</label>
<textarea
value={value}
onChange={(e) => onChange(e.target.value)}
placeholder={placeholder}
style={styles.textarea}
/>
</div>
);
}

const styles: Record<string, React.CSSProperties> = {
page: {
minHeight: "100vh",
background: "linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
color: "#e7e7e7",
padding: "32px 24px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
shell: {
maxWidth: "1400px",
margin: "0 auto",
display: "grid",
gridTemplateColumns: "1fr 0.95fr",
gap: "24px",
alignItems: "start",
},
leftCol: {
display: "grid",
gap: "20px",
},
rightCol: {
position: "sticky",
top: "24px",
},
card: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px",
},
kicker: {
margin: "0 0 8px",
color: "#9a9a9a",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
title: {
margin: "0 0 10px",
fontSize: "38px",
fontWeight: 600,
color: "#f5f5f5",
},
subtitle: {
margin: 0,
color: "#c8c8c8",
fontSize: "16px",
lineHeight: 1.7,
},
twoCol: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "12px",
},
fieldWrap: {
marginBottom: "12px",
},
label: {
display: "block",
marginBottom: "8px",
color: "#c9c9c9",
fontSize: "13px",
fontWeight: 500,
},
input: {
width: "100%",
padding: "14px 16px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "15px",
boxSizing: "border-box",
marginBottom: "12px",
},
textarea: {
width: "100%",
minHeight: "110px",
padding: "14px 16px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "15px",
resize: "vertical",
boxSizing: "border-box",
},
buttonRow: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "12px",
marginTop: "16px",
},
primaryButton: {
width: "100%",
padding: "15px 18px",
borderRadius: "18px",
border: "1px solid #d1d5db",
background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
color: "#09090b",
fontSize: "15px",
fontWeight: 700,
cursor: "pointer",
},
linkButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
textDecoration: "none",
padding: "15px 18px",
borderRadius: "18px",
border: "1px solid #3a3a3a",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
},
previewPaper: {
background: "#fff",
color: "#111827",
borderRadius: "18px",
minHeight: "700px",
padding: "48px 52px",
boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
},
previewKicker: {
margin: "0 0 8px",
color: "#6b7280",
fontSize: "12px",
letterSpacing: "0.14em",
textTransform: "uppercase",
},
previewTitle: {
margin: "0 0 18px",
fontSize: "30px",
fontWeight: 700,
color: "#111827",
},
previewText: {
margin: 0,
fontSize: "18px",
lineHeight: 1.8,
whiteSpace: "pre-wrap",
wordBreak: "break-word",
},
};
