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
const [entries, setEntries] = useState<JobLogItem[]>(
Array.from({ length: 8 }, () => createEmptyLog())
);
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
margin: 0.35in;
}

html, body {
margin: 0;
padding: 0;
background: white;
color: #111827;
font-family: Arial, Helvetica, sans-serif;
}

.sheet {
width: 100%;
}

.sheetHeader {
margin-bottom: 10px;
text-align: center;
}

.sheetTitle {
margin: 0 0 6px;
font-size: 26px;
font-weight: 700;
color: #0f172a;
letter-spacing: 0.02em;
}

.sheetMeta {
display: flex;
justify-content: space-between;
gap: 16px;
margin-bottom: 10px;
font-size: 12px;
color: #334155;
}

.metaBox {
border: 1px solid #64748b;
padding: 6px 8px;
flex: 1;
}

table {
width: 100%;
border-collapse: collapse;
table-layout: fixed;
}

th, td {
border: 1px solid #64748b;
padding: 6px 6px;
vertical-align: top;
font-size: 11px;
line-height: 1.35;
word-wrap: break-word;
}

th {
background: #f3f4f6;
color: #111827;
font-weight: 700;
text-align: left;
}

td {
min-height: 48px;
}

.small {
font-size: 10px;
}
</style>
</head>
<body>
<div class="sheet">
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
Track your weekly applications using a printable worksheet-style log with
company, position, disposition, contact details, outcome, and research notes.
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
<h2 style={styles.sectionTitle}>Job application record</h2>
</div>

<div style={styles.previewCard}>
<div style={styles.sheetWrap}>
<div style={styles.sheetHeader}>
<h2 style={styles.sheetTitle}>JOB APPLICATION RECORD</h2>
</div>

<div style={styles.sheetMetaRow}>
<div style={styles.sheetMetaBox}>
<strong>Applicant Name:</strong> {applicantName || "—"}
</div>
<div style={styles.sheetMetaBox}>
<strong>Week Beginning:</strong> {weekStart || "—"}
</div>
<div style={styles.sheetMetaBox}>
<strong>Week Ending:</strong> {weekEnd || "—"}
</div>
</div>

<div style={styles.tableWrap}>
<table style={styles.table}>
<thead>
<tr>
<th style={{ ...styles.th, width: "13%" }}>Company</th>
<th style={{ ...styles.th, width: "12%" }}>Position</th>
<th style={{ ...styles.th, width: "14%" }}>Website / Address</th>
<th style={{ ...styles.th, width: "12%" }}>Contact Person</th>
<th style={{ ...styles.th, width: "10%" }}>Phone Number</th>
<th style={{ ...styles.th, width: "12%" }}>Disposition</th>
<th style={{ ...styles.th, width: "10%" }}>Outcome</th>
<th style={{ ...styles.th, width: "17%" }}>
Quick Note: Why This Job / What You Researched
</th>
</tr>
</thead>
<tbody>
{(filledEntries.length ? filledEntries : entries).map((entry, index) => (
<tr key={index}>
<td style={styles.td}>{entry.company || ""}</td>
<td style={styles.td}>{entry.jobTitle || ""}</td>
<td style={styles.td}>{entry.websiteOrAddress || ""}</td>
<td style={styles.td}>{entry.contactName || ""}</td>
<td style={styles.td}>{entry.contactPhone || ""}</td>
<td style={styles.td}>{entry.disposition !== "No response yet" ? entry.disposition : ""}</td>
<td style={styles.td}>{entry.outcome || ""}</td>
<td style={styles.td}>{entry.quickNote || ""}</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
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
<div className="sheetHeader">
<h1 className="sheetTitle">JOB APPLICATION RECORD</h1>
</div>

<div className="sheetMeta">
<div className="metaBox"><strong>Applicant Name:</strong> {applicantName || "—"}</div>
<div className="metaBox"><strong>Week Beginning:</strong> {weekStart || "—"}</div>
<div className="metaBox"><strong>Week Ending:</strong> {weekEnd || "—"}</div>
</div>

<table>
<thead>
<tr>
<th>Company</th>
<th>Position</th>
<th>Website / Address</th>
<th>Contact Person</th>
<th>Phone Number</th>
<th>Disposition</th>
<th>Outcome</th>
<th>Quick Note: Why This Job / What You Researched</th>
</tr>
</thead>
<tbody>
{(filledEntries.length ? filledEntries : entries).map((entry, index) => (
<tr key={index}>
<td>{entry.company || ""}</td>
<td>{entry.jobTitle || ""}</td>
<td>{entry.websiteOrAddress || ""}</td>
<td>{entry.contactName || ""}</td>
<td>{entry.contactPhone || ""}</td>
<td>{entry.disposition !== "No response yet" ? entry.disposition : ""}</td>
<td>{entry.outcome || ""}</td>
<td>{entry.quickNote || ""}</td>
</tr>
))}
</tbody>
</table>
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
background: "#f8fafc",
border: "1px solid #cbd5e1",
borderRadius: "18px",
padding: "22px",
boxShadow: "0 16px 50px rgba(0,0,0,0.18)",
},
sheetWrap: {
color: "#111827",
},
sheetHeader: {
textAlign: "center",
marginBottom: "12px",
},
sheetTitle: {
margin: 0,
fontSize: "28px",
fontWeight: 700,
letterSpacing: "0.03em",
color: "#0f172a",
},
sheetMetaRow: {
display: "grid",
gridTemplateColumns: "1.2fr 1fr 1fr",
gap: "8px",
marginBottom: "12px",
},
sheetMetaBox: {
border: "1px solid #64748b",
padding: "8px 10px",
fontSize: "12px",
lineHeight: 1.45,
background: "#ffffff",
},
tableWrap: {
overflowX: "auto",
},
table: {
width: "100%",
borderCollapse: "collapse",
tableLayout: "fixed",
background: "#ffffff",
},
th: {
border: "1px solid #64748b",
padding: "8px 6px",
fontSize: "11px",
fontWeight: 700,
textAlign: "left",
background: "#f3f4f6",
color: "#111827",
lineHeight: 1.35,
verticalAlign: "top",
},
td: {
border: "1px solid #94a3b8",
padding: "8px 6px",
fontSize: "11px",
lineHeight: 1.45,
color: "#111827",
verticalAlign: "top",
height: "56px",
wordBreak: "break-word",
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
