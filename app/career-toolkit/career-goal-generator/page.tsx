"use client";

import { useMemo, useState } from "react";

type ToneType = "professional" | "confident" | "simple";

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
const [tone, setTone] = useState<ToneType>("professional");

const shortStatement = useMemo(() => {
const goal = careerGoal || "my chosen career path";
const reason =
whyChosen ||
"it fits my interests, strengths, and long-term goals";
const outcome =
expectedOutcome ||
"build a stronger future and create more career stability";

if (tone === "confident") {
return `My goal is to pursue ${goal} because ${reason}. I believe this path will help me ${outcome}.`;
}

if (tone === "simple") {
return `I want to pursue ${goal} because ${reason}. My goal is to ${outcome}.`;
}

return `My career goal is to pursue ${goal} because ${reason}. I see this path as a way to ${outcome}.`;
}, [careerGoal, whyChosen, expectedOutcome, tone]);

const fullStatement = useMemo(() => {
const introGoal = careerGoal || "this career path";
const chosen =
whyChosen ||
"it matches my interests, my personal strengths, and the kind of future I want to build";
const research =
researchDone ||
"I have spent time learning about the role, its responsibilities, and what it takes to succeed in the field";
const outcome =
expectedOutcome ||
"gain stable employment, continue growing professionally, and move toward long-term career security";
const pay =
expectedPay ||
"earn a wage that supports greater financial stability";
const challenge =
barriers ||
"balancing everyday responsibilities while continuing to move forward";
const solution =
overcomeBarriers ||
"staying organized, asking for support when needed, and remaining consistent with my goals";
const support =
supportSystem ||
"the people around me who encourage me and want to see me succeed";
const timeline =
startTimeline || "as soon as I am able to take the next step";
const notes = extraNotes ? ` ${extraNotes}` : "";

if (tone === "confident") {
return `I am interested in pursuing ${introGoal} because ${chosen}. I have already researched this path and understand that ${research}. My goal is to ${outcome} and work toward ${pay}. I understand that one challenge may be ${challenge}, but I plan to address that by ${solution}. I also have support from ${support}. I am prepared to begin ${timeline} and continue moving forward with focus and commitment.${notes}`;
}

if (tone === "simple") {
return `I want to pursue ${introGoal} because ${chosen}. I have looked into this path and learned that ${research}. I hope this will help me ${outcome} and eventually ${pay}. One barrier I may face is ${challenge}, but I plan to work through that by ${solution}. I also have support from ${support}. I am ready to start ${timeline}.${notes}`;
}

return `I am interested in pursuing ${introGoal} because ${chosen}. I have taken time to research this path and understand that ${research}. My expected outcome is to ${outcome} while working toward the possibility to ${pay}. One barrier I may face is ${challenge}, but I plan to overcome that by ${solution}. I also have support from ${support}, which will help me stay focused and accountable. I am prepared to begin ${timeline} and continue building toward this goal.${notes}`;
}, [
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
tone,
]);

function handlePrint() {
window.print();
}

function handleSaveText() {
const content = `
CAREER GOAL GENERATOR

Name: ${fullName || "Not provided"}
Tone: ${tone}

SHORT STATEMENT
${shortStatement}

FULL STATEMENT
${fullStatement}
`.trim();

const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "career-goal-statement.txt";
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
URL.revokeObjectURL(url);
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
<section style={styles.heroCard}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>Career Goal Generator</h1>
<p style={styles.subtitle}>
Build a cleaner, more natural career goal statement with a short version
and a full version.
</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
<button type="button" onClick={handleSaveText} style={styles.actionButton}>
Save Statement
</button>
<button type="button" onClick={handlePrint} style={styles.actionButton}>
Print / Save PDF
</button>
</div>
</section>

<div style={styles.layout}>
<section style={styles.formCard}>
<p style={styles.sectionKicker}>Build Your Statement</p>
<h2 style={styles.sectionTitle}>Fill in the pieces</h2>

<div style={styles.fieldWrap}>
<label style={styles.label}>Tone</label>
<select
value={tone}
onChange={(e) => setTone(e.target.value as ToneType)}
style={styles.input}
>
<option value="professional">Professional</option>
<option value="confident">Confident</option>
<option value="simple">Simple</option>
</select>
</div>

<div style={styles.twoCol}>
<Field
label="Full Name (optional)"
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
placeholder="Explain why this career fits you."
/>

<TextAreaField
label="What research have you done?"
value={researchDone}
onChange={setResearchDone}
placeholder="What have you learned about the role, field, or next steps?"
/>

<div style={styles.twoCol}>
<Field
label="Expected Outcome"
value={expectedOutcome}
onChange={setExpectedOutcome}
placeholder="Stable work, growth, long-term opportunity"
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
placeholder="Transportation, childcare, finances, time, confidence, etc."
/>

<TextAreaField
label="How will you overcome them?"
value={overcomeBarriers}
onChange={setOvercomeBarriers}
placeholder="Explain how you plan to manage those challenges."
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
</section>

<aside className="print-wrap" style={styles.previewCol}>
<div style={styles.previewPaper}>
<p style={styles.previewKicker}>Live Preview</p>
<h2 style={styles.previewTitle}>Career Goal Statement</h2>

{fullName ? <p style={styles.previewName}>{fullName}</p> : null}

<div style={styles.previewBlock}>
<p style={styles.previewLabel}>Short Statement</p>
<p style={styles.previewText}>{shortStatement}</p>
</div>

<div style={styles.previewBlock}>
<p style={styles.previewLabel}>Full Statement</p>
<p style={styles.previewText}>{fullStatement}</p>
</div>
</div>
</aside>
</div>
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
gap: "24px",
},
heroCard: {
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
heroButtons: {
display: "flex",
gap: "12px",
marginTop: "16px",
flexWrap: "wrap",
},
layout: {
display: "grid",
gridTemplateColumns: "1fr 0.95fr",
gap: "24px",
alignItems: "start",
},
formCard: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px",
},
previewCol: {
position: "sticky",
top: "24px",
},
sectionKicker: {
margin: "0 0 8px",
color: "#9ca3af",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
sectionTitle: {
margin: "0 0 18px",
fontSize: "28px",
lineHeight: 1.1,
fontWeight: 700,
color: "#f5f5f5",
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
actionButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: "15px 18px",
borderRadius: "18px",
border: "1px solid #3a3a3a",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
cursor: "pointer",
},
previewPaper: {
background: "#fff",
color: "#111827",
borderRadius: "18px",
minHeight: "760px",
padding: "44px 48px",
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
margin: "0 0 14px",
fontSize: "34px",
fontWeight: 700,
color: "#111827",
},
previewName: {
margin: "0 0 20px",
fontSize: "16px",
fontWeight: 600,
color: "#374151",
},
previewBlock: {
marginBottom: "22px",
},
previewLabel: {
margin: "0 0 8px",
color: "#6b7280",
fontSize: "12px",
letterSpacing: "0.12em",
textTransform: "uppercase",
fontWeight: 700,
},
previewText: {
margin: 0,
fontSize: "18px",
lineHeight: 1.8,
color: "#111827",
whiteSpace: "pre-wrap",
wordBreak: "break-word",
},
};
