"use client";

import { useMemo, useState } from "react";

type JobLogItem = {
company: string;
jobTitle: string;
dateApplied: string;
applicationSource: string;
contactName: string;
contactEmail: string;
status: string;
notes: string;
followUpDate: string;
};

function createEmptyLog(): JobLogItem {
return {
company: "",
jobTitle: "",
dateApplied: "",
applicationSource: "",
contactName: "",
contactEmail: "",
status: "Applied",
notes: "",
followUpDate: "",
};
}

const statusOptions = [
"Applied",
"Follow-Up Needed",
"Interview Scheduled",
"Interview Completed",
"Waiting for Update",
"Offer Received",
"Not Selected",
];

export default function JobLogGeneratorPage() {
const [entries, setEntries] = useState<JobLogItem[]>([
createEmptyLog(),
createEmptyLog(),
createEmptyLog(),
]);

const filledEntries = useMemo(() => {
return entries.filter(
(item) =>
item.company ||
item.jobTitle ||
item.dateApplied ||
item.applicationSource ||
item.contactName ||
item.contactEmail ||
item.notes ||
item.followUpDate
);
}, [entries]);

function updateEntry(index: number, field: keyof JobLogItem, value: string) {
setEntries((prev) =>
prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
);
}

function addEntry() {
setEntries((prev) => [...prev, createEmptyLog()]);
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>Job Log Generator</h1>
<p style={styles.subtitle}>
Track where you applied, who you spoke with, your current status,
interview updates, and when to follow up.
</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</section>

<div style={styles.layout}>
<section style={styles.formCard}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Job Tracker</p>
<h2 style={styles.sectionTitle}>Add your applications</h2>
</div>

{entries.map((entry, index) => (
<div key={index} style={styles.entryCard}>
<div style={styles.entryHeader}>
<h3 style={styles.entryTitle}>Application {index + 1}</h3>
</div>

<div style={styles.formGrid}>
<Field
label="Company"
value={entry.company}
onChange={(value) => updateEntry(index, "company", value)}
placeholder="Company name"
/>
<Field
label="Job Title"
value={entry.jobTitle}
onChange={(value) => updateEntry(index, "jobTitle", value)}
placeholder="Job title"
/>
<Field
label="Date Applied"
value={entry.dateApplied}
onChange={(value) => updateEntry(index, "dateApplied", value)}
placeholder="MM/DD/YYYY"
/>
<Field
label="Where You Applied"
value={entry.applicationSource}
onChange={(value) => updateEntry(index, "applicationSource", value)}
placeholder="Indeed, LinkedIn, company website, etc."
/>
<Field
label="Contact Name"
value={entry.contactName}
onChange={(value) => updateEntry(index, "contactName", value)}
placeholder="Recruiter or hiring manager"
/>
<Field
label="Contact Email"
value={entry.contactEmail}
onChange={(value) => updateEntry(index, "contactEmail", value)}
placeholder="Email address"
/>

<div style={styles.fieldWrap}>
<label style={styles.label}>Status</label>
<select
value={entry.status}
onChange={(e) => updateEntry(index, "status", e.target.value)}
style={styles.input}
>
{statusOptions.map((option) => (
<option key={`${option}-${index}`} value={option}>
{option}
</option>
))}
</select>
</div>

<Field
label="Follow-Up Date"
value={entry.followUpDate}
onChange={(value) => updateEntry(index, "followUpDate", value)}
placeholder="MM/DD/YYYY"
/>

<div style={styles.fieldWrapFull}>
<label style={styles.label}>Notes</label>
<textarea
value={entry.notes}
onChange={(e) => updateEntry(index, "notes", e.target.value)}
placeholder="Add interview notes, reminders, next steps, or details about the job."
style={styles.textarea}
/>
</div>
</div>
</div>
))}

<button type="button" onClick={addEntry} style={styles.addButton}>
+ Add Another Job
</button>
</section>

<section style={styles.previewCard}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Live Preview</p>
<h2 style={styles.sectionTitle}>Job application log</h2>
</div>

{filledEntries.length ? (
<div style={styles.previewList}>
{filledEntries.map((entry, index) => (
<div key={index} style={styles.previewRow}>
<div style={styles.previewTop}>
<div>
<h3 style={styles.previewTitle}>
{entry.jobTitle || "Job Title"}
</h3>
<p style={styles.previewCompany}>
{entry.company || "Company Name"}
</p>
</div>
<span style={styles.statusPill}>{entry.status}</span>
</div>

<div style={styles.previewMeta}>
<p style={styles.metaItem}>
<strong>Applied:</strong> {entry.dateApplied || "—"}
</p>
<p style={styles.metaItem}>
<strong>Source:</strong> {entry.applicationSource || "—"}
</p>
<p style={styles.metaItem}>
<strong>Contact:</strong> {entry.contactName || "—"}
</p>
<p style={styles.metaItem}>
<strong>Email:</strong> {entry.contactEmail || "—"}
</p>
<p style={styles.metaItem}>
<strong>Follow-Up:</strong> {entry.followUpDate || "—"}
</p>
</div>

{entry.notes ? (
<div style={styles.notesBox}>
<p style={styles.notesLabel}>Notes</p>
<p style={styles.notesText}>{entry.notes}</p>
</div>
) : null}
</div>
))}
</div>
) : (
<div style={styles.emptyState}>
Start adding your job applications and your tracker will appear here.
</div>
)}
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
maxWidth: "1360px",
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
maxWidth: "860px",
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
gridTemplateColumns: "1.1fr 0.9fr",
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
sectionHeader: {
display: "grid",
gap: "6px",
marginBottom: "16px",
},
sectionKicker: {
margin: 0,
color: "#9ca3af",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
sectionTitle: {
margin: 0,
fontSize: "30px",
lineHeight: 1.1,
fontWeight: 700,
color: "#f5f5f5",
},
entryCard: {
background: "#101010",
border: "1px solid #2d2d2d",
borderRadius: "22px",
padding: "18px",
marginBottom: "16px",
},
entryHeader: {
marginBottom: "14px",
},
entryTitle: {
margin: 0,
fontSize: "20px",
fontWeight: 700,
color: "#f5f5f5",
},
formGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "14px",
},
fieldWrap: {
display: "grid",
gap: "8px",
},
fieldWrapFull: {
display: "grid",
gap: "8px",
gridColumn: "1 / -1",
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
minHeight: "110px",
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
addButton: {
marginTop: "8px",
background: "#111111",
color: "#f5f5f5",
border: "1px solid rgba(255,255,255,0.14)",
borderRadius: "16px",
padding: "12px 16px",
fontSize: "14px",
fontWeight: 700,
cursor: "pointer",
},
previewList: {
display: "grid",
gap: "14px",
},
previewRow: {
background: "#101010",
border: "1px solid #2d2d2d",
borderRadius: "20px",
padding: "18px",
display: "grid",
gap: "12px",
},
previewTop: {
display: "flex",
justifyContent: "space-between",
gap: "12px",
alignItems: "flex-start",
},
previewTitle: {
margin: "0 0 4px",
fontSize: "20px",
lineHeight: 1.15,
fontWeight: 700,
color: "#f5f5f5",
},
previewCompany: {
margin: 0,
color: "#d4d4d8",
fontSize: "15px",
lineHeight: 1.6,
},
statusPill: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
whiteSpace: "nowrap",
padding: "8px 10px",
borderRadius: "999px",
background: "rgba(59,130,246,0.12)",
border: "1px solid rgba(59,130,246,0.26)",
color: "#dbeafe",
fontSize: "12px",
fontWeight: 700,
},
previewMeta: {
display: "grid",
gap: "6px",
},
metaItem: {
margin: 0,
color: "#d4d4d8",
fontSize: "14px",
lineHeight: 1.7,
},
notesBox: {
background: "rgba(255,255,255,0.03)",
border: "1px solid rgba(255,255,255,0.06)",
borderRadius: "16px",
padding: "14px",
},
notesLabel: {
margin: "0 0 8px",
color: "#9ca3af",
fontSize: "12px",
letterSpacing: "0.14em",
textTransform: "uppercase",
},
notesText: {
margin: 0,
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.75,
whiteSpace: "pre-wrap",
},
emptyState: {
background: "#101010",
border: "1px solid #2d2d2d",
borderRadius: "20px",
padding: "20px",
color: "#d4d4d8",
fontSize: "15px",
lineHeight: 1.7,
},
};
