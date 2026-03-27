"use client";

import { useMemo, useRef, useState } from "react";

type JobLogItem = {
company: string;
jobTitle: string;
websiteOrAddress: string;
contactName: string;
contactPhone: string;
disposition: string;
outcome: string;
quickNote: string;
};

function createEmptyLog(): JobLogItem {
return {
company: "",
jobTitle: "",
websiteOrAddress: "",
contactName: "",
contactPhone: "",
disposition: "No response yet",
outcome: "",
quickNote: "",
};
}

const dispositionOptions = [
"No response yet",
"Applied",
"Follow-up sent",
"Interested",
"Interview requested",
"Interview completed",
"Not interested",
"Ghosted / no reply",
"Position closed",
];

export default function JobLogGeneratorPage() {
const [applicantName, setApplicantName] = useState("");
const [weekStart, setWeekStart] = useState("");
const [weekEnd, setWeekEnd] = useState("");
const [entries, setEntries] = useState<JobLogItem[]>(Array.from({ length: 8 }, () => createEmptyLog()));
const [message, setMessage] = useState("");
const printRef = useRef<HTMLDivElement>(null);

const filledEntries = useMemo(() => {
return entries.filter(
(item) =>
item.company ||
item.jobTitle ||
item.websiteOrAddress ||
item.contactName ||
item.contactPhone ||
item.disposition !== "No response yet" ||
item.outcome ||
item.quickNote
);
}, [entries]);

const topEntries = entries.slice(0, 4);
const bottomEntries = entries.slice(4, 8);

function updateEntry(index: number, field: keyof JobLogItem, value: string) {
setEntries((prev) =>
prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
);
}

function handlePrint() {
const printNode = printRef.current;

if (!printNode) {
setMessage("Job log preview is not ready yet.");
return;
}

const printWindow = window.open("", "_blank", "width=1400,height=900");

if (!printWindow) {
setMessage("Pop-up blocked. Please allow pop-ups and try again.");
return;
}

const content = printNode.innerHTML;

printWindow.document.open();
printWindow.document.write(`
<!doctype html>
<html>
<head>
<title>${applicantName || "Applicant"} Job Log</title>
<style>
@page {
size: letter landscape;
margin: 0.45in;
}

html, body {
margin: 0;
padding: 0;
background: white;
color: #111827;
font-family: Arial, Helvetica, sans-serif;
}

body {
-webkit-print-color-adjust: exact;
print-color-adjust: exact;
}

.printWrap {
width: 100%;
}

.printHeader {
margin-bottom: 14px;
padding-bottom: 10px;
border-bottom: 2px solid #d1d5db;
}

.printTitle {
margin: 0 0 4px;
font-size: 26px;
font-weight: 700;
color: #111827;
}

.printSub {
margin: 0;
font-size: 13px;
color: #4b5563;
line-height: 1.55;
}

.printGrid {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 12px;
}

.printEntry {
border: 1px solid #d1d5db;
border-radius: 12px;
padding: 12px;
break-inside: avoid;
page-break-inside: avoid;
}

.printEntryTop {
margin-bottom: 8px;
}

.printRole {
margin: 0 0 3px;
font-size: 17px;
font-weight: 700;
color: #111827;
}

.printCompany {
margin: 0;
font-size: 14px;
color: #374151;
}

.printMeta {
margin: 0 0 4px;
font-size: 12.5px;
line-height: 1.55;
color: #111827;
word-break: break-word;
}

.printLabel {
margin: 8px 0 4px;
font-size: 11px;
font-weight: 700;
letter-spacing: 0.08em;
text-transform: uppercase;
color: #6b7280;
}

.printNote {
margin: 0;
font-size: 12.5px;
line-height: 1.6;
color: #111827;
white-space: pre-wrap;
}
</style>
</head>
<body>
<div class="printWrap">
${content}
</div>
</body>
</html>
`);
printWindow.document.close();
printWindow.focus();

setTimeout(() => {
printWindow.print();
}, 300);
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<div style={styles.heroTop}>
<div>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>Job Log Generator</h1>
<p style={styles.subtitle}>
Track company, position, website or address, contact person, phone number,
disposition, outcome, and your quick research note in one clean weekly log.
</p>
</div>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
<button type="button" onClick={handlePrint} style={styles.printButton}>
Print Job Log
</button>
</div>
</div>

<div style={styles.metaGrid}>
<Field
label="Applicant Name"
value={applicantName}
onChange={setApplicantName}
placeholder="Your full name"
/>
<Field
label="Week Beginning"
value={weekStart}
onChange={setWeekStart}
placeholder="MM/DD/YYYY"
/>
<Field
label="Week Ending"
value={weekEnd}
onChange={setWeekEnd}
placeholder="MM/DD/YYYY"
/>
</div>
</section>

{message ? <div style={styles.messageBox}>{message}</div> : null}

<section style={styles.entriesSection}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Top Entries</p>
<h2 style={styles.sectionTitle}>Applications 1-4</h2>
</div>

<div style={styles.entryGrid}>
{topEntries.map((entry, cardIndex) => {
const realIndex = cardIndex;
return (
<EntryCard
key={realIndex}
entry={entry}
index={realIndex}
updateEntry={updateEntry}
/>
);
})}
</div>
</section>

<section style={styles.previewSection}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Live Preview</p>
<h2 style={styles.sectionTitle}>Weekly job log</h2>
</div>

<div style={styles.previewCard}>
{filledEntries.length ? (
<div style={styles.previewWrap}>
<div style={styles.previewHeader}>
<h2 style={styles.previewMainTitle}>
{applicantName || "Applicant Name"} - Weekly Job Log
</h2>
<p style={styles.previewSubTitle}>
Week Beginning: {weekStart || "—"} | Week Ending: {weekEnd || "—"}
</p>
</div>

<div style={styles.previewGrid}>
{filledEntries.map((entry, index) => (
<div key={index} style={styles.previewEntry}>
<div style={styles.previewEntryTop}>
<h3 style={styles.previewRole}>
{entry.company || "Company"} - {entry.jobTitle || "Position"}
</h3>
</div>

<p style={styles.metaItem}>
<strong>Disposition:</strong> {entry.disposition || "—"}
</p>
<p style={styles.metaItem}>
<strong>Website / Address:</strong> {entry.websiteOrAddress || "—"}
</p>
<p style={styles.metaItem}>
<strong>Contact Person:</strong> {entry.contactName || "—"}
</p>
<p style={styles.metaItem}>
<strong>Phone:</strong> {entry.contactPhone || "—"}
</p>
<p style={styles.metaItem}>
<strong>Outcome:</strong> {entry.outcome || "—"}
</p>

{entry.quickNote ? (
<div style={styles.notesBox}>
<p style={styles.notesLabel}>
Quick note: why this job / what you researched
</p>
<p style={styles.notesText}>{entry.quickNote}</p>
</div>
) : null}
</div>
))}
</div>
</div>
) : (
<div style={styles.emptyState}>
Start filling in your applications above and your live weekly log will appear here.
</div>
)}
</div>
</section>

<section style={styles.entriesSection}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Bottom Entries</p>
<h2 style={styles.sectionTitle}>Applications 5-8</h2>
</div>

<div style={styles.entryGrid}>
{bottomEntries.map((entry, cardIndex) => {
const realIndex = cardIndex + 4;
return (
<EntryCard
key={realIndex}
entry={entry}
index={realIndex}
updateEntry={updateEntry}
/>
);
})}
</div>
</section>

<div ref={printRef} style={styles.hiddenPrintWrap}>
<div className="printHeader">
<h1 className="printTitle">
{applicantName || "Applicant Name"} - Weekly Job Log
</h1>
<p className="printSub">
Week Beginning: {weekStart || "—"} | Week Ending: {weekEnd || "—"}
</p>
</div>

{filledEntries.length ? (
<div className="printGrid">
{filledEntries.map((entry, index) => (
<div key={index} className="printEntry">
<div className="printEntryTop">
<h2 className="printRole">
{entry.company || "Company"} - {entry.jobTitle || "Position"}
</h2>
<p className="printCompany">
{entry.disposition || "No response yet"}
</p>
</div>

<p className="printMeta">
<strong>Website / Address:</strong> {entry.websiteOrAddress || "—"}
</p>
<p className="printMeta">
<strong>Contact Person:</strong> {entry.contactName || "—"}
</p>
<p className="printMeta">
<strong>Phone:</strong> {entry.contactPhone || "—"}
</p>
<p className="printMeta">
<strong>Outcome:</strong> {entry.outcome || "—"}
</p>

{entry.quickNote ? (
<>
<p className="printLabel">Quick note: why this job / what you researched</p>
<p className="printNote">{entry.quickNote}</p>
</>
) : null}
</div>
))}
</div>
) : (
<div className="printEntry">
<p className="printMeta">No job log entries added yet.</p>
</div>
)}
</div>
</div>
</main>
);
}

function EntryCard({
entry,
index,
updateEntry,
}: {
entry: JobLogItem;
index: number;
updateEntry: (index: number, field: keyof JobLogItem, value: string) => void;
}) {
return (
<div style={styles.entryCard}>
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
label="Position"
value={entry.jobTitle}
onChange={(value) => updateEntry(index, "jobTitle", value)}
placeholder="Job title"
/>
<Field
label="Website or Address"
value={entry.websiteOrAddress}
onChange={(value) => updateEntry(index, "websiteOrAddress", value)}
placeholder="Website or address"
/>
<Field
label="Contact Person"
value={entry.contactName}
onChange={(value) => updateEntry(index, "contactName", value)}
placeholder="Recruiter or hiring manager"
/>
<Field
label="Phone Number"
value={entry.contactPhone}
onChange={(value) => updateEntry(index, "contactPhone", value)}
placeholder="Phone number if available"
/>

<div style={styles.fieldWrap}>
<label style={styles.label}>Disposition</label>
<select
value={entry.disposition}
onChange={(e) => updateEntry(index, "disposition", e.target.value)}
style={styles.input}
>
{dispositionOptions.map((option) => (
<option key={`${option}-${index}`} value={option}>
{option}
</option>
))}
</select>
</div>

<Field
label="Outcome"
value={entry.outcome}
onChange={(value) => updateEntry(index, "outcome", value)}
placeholder="Interview, no response, rejected, next step, etc."
/>

<div style={styles.fieldWrapFull}>
<label style={styles.label}>
Quick note: why this job / what you researched
</label>
<textarea
value={entry.quickNote}
onChange={(e) => updateEntry(index, "quickNote", e.target.value)}
placeholder="Why you applied, what stood out, what you learned about the employer, or any reminder for follow-up."
style={styles.textarea}
/>
</div>
</div>
</div>
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
maxWidth: "1440px",
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
display: "grid",
gap: "20px",
},
heroTop: {
display: "flex",
justifyContent: "space-between",
gap: "20px",
alignItems: "flex-start",
flexWrap: "wrap",
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
maxWidth: "900px",
},
heroButtons: {
display: "flex",
gap: "12px",
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
printButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: "12px 16px",
borderRadius: "16px",
border: "1px solid #d1d5db",
background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
color: "#09090b",
fontWeight: 700,
fontSize: "14px",
cursor: "pointer",
},
metaGrid: {
display: "grid",
gridTemplateColumns: "1.2fr 1fr 1fr",
gap: "14px",
},
messageBox: {
background: "rgba(59,130,246,0.12)",
border: "1px solid rgba(59,130,246,0.28)",
color: "#dbeafe",
borderRadius: "18px",
padding: "14px 16px",
fontSize: "15px",
},
entriesSection: {
display: "grid",
gap: "16px",
},
previewSection: {
display: "grid",
gap: "16px",
},
sectionHeader: {
display: "grid",
gap: "6px",
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
entryGrid: {
display: "grid",
gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
gap: "16px",
},
entryCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "24px",
padding: "18px",
boxShadow: "0 22px 60px rgba(0,0,0,0.26)",
display: "grid",
gap: "14px",
},
entryHeader: {
marginBottom: "2px",
},
entryTitle: {
margin: 0,
fontSize: "18px",
fontWeight: 700,
color: "#f5f5f5",
},
formGrid: {
display: "grid",
gridTemplateColumns: "1fr",
gap: "12px",
},
fieldWrap: {
display: "grid",
gap: "8px",
},
fieldWrapFull: {
display: "grid",
gap: "8px",
},
label: {
color: "#d4d4d8",
fontSize: "13px",
fontWeight: 600,
},
input: {
width: "100%",
padding: "13px 14px",
borderRadius: "14px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "14px",
boxSizing: "border-box",
outline: "none",
},
textarea: {
width: "100%",
minHeight: "88px",
padding: "13px 14px",
borderRadius: "14px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "14px",
resize: "vertical",
boxSizing: "border-box",
outline: "none",
},
previewCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "28px",
padding: "24px",
boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
},
previewWrap: {
display: "grid",
gap: "16px",
},
previewHeader: {
paddingBottom: "14px",
borderBottom: "1px solid rgba(255,255,255,0.08)",
},
previewMainTitle: {
margin: "0 0 6px",
fontSize: "28px",
lineHeight: 1.1,
fontWeight: 700,
color: "#f5f5f5",
},
previewSubTitle: {
margin: 0,
color: "#d4d4d8",
fontSize: "15px",
lineHeight: 1.7,
},
previewGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "16px",
},
previewEntry: {
background: "#101010",
border: "1px solid #2d2d2d",
borderRadius: "18px",
padding: "16px",
display: "grid",
gap: "8px",
},
previewEntryTop: {
marginBottom: "4px",
},
previewRole: {
margin: 0,
fontSize: "19px",
lineHeight: 1.2,
fontWeight: 700,
color: "#f5f5f5",
},
metaItem: {
margin: 0,
color: "#d4d4d8",
fontSize: "14px",
lineHeight: 1.65,
},
notesBox: {
marginTop: "6px",
background: "rgba(255,255,255,0.03)",
border: "1px solid rgba(255,255,255,0.06)",
borderRadius: "14px",
padding: "12px",
},
notesLabel: {
margin: "0 0 8px",
color: "#9ca3af",
fontSize: "11px",
letterSpacing: "0.12em",
textTransform: "uppercase",
},
notesText: {
margin: 0,
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.7,
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
hiddenPrintWrap: {
position: "absolute",
left: "-99999px",
top: 0,
width: "1200px",
background: "#fff",
color: "#111827",
padding: 0,
},
};
