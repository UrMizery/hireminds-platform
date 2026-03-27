"use client";

import { useMemo, useState } from "react";

type TemplateType = "thank-you" | "follow-up";

export default function EmployerFollowUpGeneratorPage() {
const [template, setTemplate] = useState<TemplateType>("thank-you");
const [candidateName, setCandidateName] = useState("");
const [employerName, setEmployerName] = useState("");
const [companyName, setCompanyName] = useState("");
const [jobTitle, setJobTitle] = useState("");
const [interviewDate, setInterviewDate] = useState("");
const [customNote, setCustomNote] = useState("");

const subjectLine = useMemo(() => {
if (template === "thank-you") {
return `Thank You - ${jobTitle || "Interview"}${companyName ? ` - ${companyName}` : ""}`;
}
return `Follow-Up on ${jobTitle || "Application"}${companyName ? ` - ${companyName}` : ""}`;
}, [template, jobTitle, companyName]);

const emailBody = useMemo(() => {
const greetingName = employerName || "Hiring Manager";
const senderName = candidateName || "Your Name";
const roleText = jobTitle || "the position";
const companyText = companyName || "your company";
const dateText = interviewDate || "our recent interview";

if (template === "thank-you") {
return `Dear ${greetingName},

Thank you for taking the time to speak with me regarding ${roleText} at ${companyText}. I appreciate the opportunity to learn more about the role and your team.

I enjoyed our conversation on ${dateText} and remain very interested in the opportunity. Our discussion confirmed my excitement about the role, and I would be grateful for the chance to contribute to your team.

${customNote ? `${customNote}\n\n` : ""}Thank you again for your time and consideration. I look forward to hearing from you.

Sincerely,
${senderName}`;
}

return `Dear ${greetingName},

I hope you are doing well. I wanted to follow up regarding ${roleText} at ${companyText} and see whether there have been any updates on the hiring process.

I remain very interested in the opportunity and appreciate the time you and your team have taken to review my application. I enjoyed speaking with you on ${dateText} and would be glad to provide any additional information if needed.

${customNote ? `${customNote}\n\n` : ""}Thank you again for your time and consideration. I look forward to hearing from you.

Sincerely,
${senderName}`;
}, [template, employerName, candidateName, jobTitle, companyName, interviewDate, customNote]);

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>Employer Follow-Up Generator</h1>
<p style={styles.subtitle}>
Create a professional thank-you email after an interview or a polite follow-up
email to check on your application status.
</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</section>

<div style={styles.layout}>
<section style={styles.formCard}>
<p style={styles.sectionKicker}>Template</p>
<h2 style={styles.sectionTitle}>Choose your email type</h2>

<div style={styles.templateRow}>
<button
type="button"
onClick={() => setTemplate("thank-you")}
style={{
...styles.templateButton,
...(template === "thank-you" ? styles.templateButtonActive : {}),
}}
>
Thank-You After Interview
</button>

<button
type="button"
onClick={() => setTemplate("follow-up")}
style={{
...styles.templateButton,
...(template === "follow-up" ? styles.templateButtonActive : {}),
}}
>
Follow-Up on Status
</button>
</div>

<div style={styles.formGrid}>
<Field
label="Your Name"
value={candidateName}
onChange={setCandidateName}
placeholder="Your full name"
/>
<Field
label="Employer / Interviewer Name"
value={employerName}
onChange={setEmployerName}
placeholder="Hiring manager or interviewer"
/>
<Field
label="Company Name"
value={companyName}
onChange={setCompanyName}
placeholder="Company name"
/>
<Field
label="Job Title"
value={jobTitle}
onChange={setJobTitle}
placeholder="Job title"
/>
<Field
label="Interview Date or Reference"
value={interviewDate}
onChange={setInterviewDate}
placeholder="Example: March 25 or our recent interview"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Extra Note (optional)</label>
<textarea
value={customNote}
onChange={(e) => setCustomNote(e.target.value)}
placeholder="Add a short personalized note if you'd like."
style={styles.textarea}
/>
</div>
</section>

<section style={styles.previewCard}>
<p style={styles.sectionKicker}>Live Preview</p>
<h2 style={styles.sectionTitle}>Email Preview</h2>

<div style={styles.previewBlock}>
<p style={styles.previewLabel}>Subject</p>
<p style={styles.subjectLine}>{subjectLine}</p>

<p style={styles.previewLabel}>Message</p>
<div style={styles.bodyBox}>
{emailBody.split("\n").map((line, index) => (
<p key={index} style={styles.previewText}>
{line || "\u00A0"}
</p>
))}
</div>
</div>
</section>
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

const styles: Record<string, React.CSSProperties> = {
page: {
minHeight: "100vh",
background:
"radial-gradient(circle at top, rgba(59,130,246,0.12) 0%, rgba(5,5,5,1) 34%, rgba(13,13,15,1) 100%)",
color: "#e7e7e7",
padding: "32px 24px 56px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
shell: {
maxWidth: "1320px",
margin: "0 auto",
display: "grid",
gap: "24px",
},
heroCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "32px",
padding: "32px",
boxShadow: "0 30px 80px rgba(0,0,0,0.32)",
},
kicker: {
margin: "0 0 8px",
color: "#a1a1aa",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
title: {
margin: "0 0 12px",
fontSize: "42px",
lineHeight: 1.08,
letterSpacing: "-0.04em",
fontWeight: 700,
color: "#f5f5f5",
},
subtitle: {
margin: 0,
color: "#d4d4d8",
fontSize: "16px",
lineHeight: 1.75,
maxWidth: "820px",
},
heroButtons: {
display: "flex",
gap: "12px",
marginTop: "18px",
flexWrap: "wrap",
},
linkButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
textDecoration: "none",
padding: "12px 16px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.14)",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
fontSize: "14px",
},
layout: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "20px",
alignItems: "start",
},
formCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "28px",
padding: "24px",
boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
},
previewCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "28px",
padding: "24px",
boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
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
templateRow: {
display: "flex",
gap: "12px",
flexWrap: "wrap",
marginBottom: "20px",
},
templateButton: {
padding: "12px 14px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.12)",
background: "rgba(255,255,255,0.04)",
color: "#f5f5f5",
fontWeight: 700,
fontSize: "14px",
cursor: "pointer",
},
templateButtonActive: {
background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
color: "#09090b",
border: "1px solid #d1d5db",
},
formGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "14px",
},
fieldWrap: {
display: "grid",
gap: "8px",
marginBottom: "14px",
},
label: {
color: "#d4d4d8",
fontSize: "13px",
fontWeight: 600,
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
outline: "none",
},
textarea: {
width: "100%",
minHeight: "120px",
padding: "14px 16px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "15px",
resize: "vertical",
boxSizing: "border-box",
outline: "none",
},
previewBlock: {
display: "grid",
gap: "12px",
},
previewLabel: {
margin: 0,
color: "#9ca3af",
fontSize: "12px",
letterSpacing: "0.14em",
textTransform: "uppercase",
},
subjectLine: {
margin: 0,
color: "#f5f5f5",
fontSize: "16px",
fontWeight: 700,
lineHeight: 1.6,
},
bodyBox: {
background: "#101010",
border: "1px solid #2d2d2d",
borderRadius: "20px",
padding: "18px",
},
previewText: {
margin: "0 0 10px",
color: "#e5e7eb",
fontSize: "15px",
lineHeight: 1.8,
whiteSpace: "pre-wrap",
},
};
