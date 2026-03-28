"use client";

import { useEffect, useMemo, useState } from "react";

const NOTES_STORAGE_KEY = "hireminds-notes";
const NOTES_OPEN_KEY = "hireminds-notes-open";
const NOTES_MINIMIZED_KEY = "hireminds-notes-minimized";
const NOTES_EXPANDED_KEY = "hireminds-notes-expanded";

export default function Notes() {
const [isOpen, setIsOpen] = useState(false);
const [isMinimized, setIsMinimized] = useState(false);
const [isExpanded, setIsExpanded] = useState(false);
const [notes, setNotes] = useState("");
const [statusMessage, setStatusMessage] = useState("");

useEffect(() => {
const savedNotes = window.localStorage.getItem(NOTES_STORAGE_KEY);
const savedOpen = window.localStorage.getItem(NOTES_OPEN_KEY);
const savedMinimized = window.localStorage.getItem(NOTES_MINIMIZED_KEY);
const savedExpanded = window.localStorage.getItem(NOTES_EXPANDED_KEY);

if (savedNotes) setNotes(savedNotes);
if (savedOpen === "true") setIsOpen(true);
if (savedMinimized === "true") setIsMinimized(true);
if (savedExpanded === "true") setIsExpanded(true);
}, []);

useEffect(() => {
window.localStorage.setItem(NOTES_STORAGE_KEY, notes);
}, [notes]);

useEffect(() => {
window.localStorage.setItem(NOTES_OPEN_KEY, String(isOpen));
}, [isOpen]);

useEffect(() => {
window.localStorage.setItem(NOTES_MINIMIZED_KEY, String(isMinimized));
}, [isMinimized]);
  
useEffect(() => {
window.localStorage.setItem(NOTES_EXPANDED_KEY, String(isExpanded));
}, [isExpanded]);
  
useEffect(() => {
function handleToggle() {
if (!isOpen) {
setIsOpen(true);
setIsMinimized(false);
return;
}
setIsMinimized((prev) => !prev);
}

function handleOpen() {
setIsOpen(true);
setIsMinimized(false);
}

window.addEventListener("toggle-notes-panel", handleToggle);
window.addEventListener("open-notes-panel", handleOpen);

return () => {
window.removeEventListener("toggle-notes-panel", handleToggle);
window.removeEventListener("open-notes-panel", handleOpen);
};
}, [isOpen]);

const wordCount = useMemo(() => {
return notes.trim() ? notes.trim().split(/\s+/).length : 0;
}, [notes]);

function flashStatus(text: string) {
setStatusMessage(text);
window.setTimeout(() => setStatusMessage(""), 1500);
}

function handleSave() {
window.localStorage.setItem(NOTES_STORAGE_KEY, notes);
flashStatus("Saved");
}

async function handleCopy() {
try {
await navigator.clipboard.writeText(notes);
flashStatus("Copied");
} catch {
flashStatus("Copy failed");
}
}

function handlePrint() {
const printWindow = window.open("", "_blank", "width=900,height=1200");
if (!printWindow) return;

const safeNotes = notes
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/\n/g, "<br />");

printWindow.document.open();
printWindow.document.write(`
<!doctype html>
<html>
<head>
<title>Notes</title>
<style>
@page {
size: letter;
margin: 0.75in;
}
body {
font-family: Arial, Helvetica, sans-serif;
color: #111827;
margin: 0;
padding: 0;
}
h1 {
margin: 0 0 12px;
font-size: 24px;
}
.meta {
margin: 0 0 18px;
color: #6b7280;
font-size: 13px;
}
.notes {
font-size: 15px;
line-height: 1.75;
word-break: break-word;
}
</style>
</head>
<body>
<h1>Notes</h1>
<p class="meta">Saved from HireMinds</p>
<div class="notes">${safeNotes || "No notes added."}</div>
</body>
</html>
`);
printWindow.document.close();
printWindow.focus();
window.setTimeout(() => {
printWindow.print();
}, 250);
}

function handleMinimize() {
setIsOpen(true);
setIsMinimized(true);
}

function handleExpandToggle() {
setIsExpanded((prev) => !prev);
setIsMinimized(false);
setIsOpen(true);
}
  
function handleClose() {
setIsOpen(false);
setIsMinimized(false);
}

if (!isOpen) return null;

return (
<div
style={{
...styles.panel,
...(isExpanded ? styles.panelExpanded : {}),
...(isMinimized ? styles.panelMinimized : {}),
}}
>
<div style={styles.header}>
<div>
<p style={styles.kicker}>HireMinds</p>
<h2 style={styles.title}>Notes</h2>
</div>

<div style={styles.iconRow}>
<button
type="button"
onClick={handlePrint}
style={styles.iconButton}
aria-label="Print notes"
title="Print"
>
🖨️
</button>
<button
type="button"
onClick={handleSave}
style={styles.iconButton}
aria-label="Save notes"
title="Save"
>
💾
</button>
<button
type="button"
onClick={handleCopy}
style={styles.iconButton}
aria-label="Copy notes"
title="Copy"
>
📋
</button>

<button
type="button"
onClick={handleExpandToggle}
style={styles.iconButton}
aria-label={isExpanded ? "Shrink notes" : "Expand notes"}
title={isExpanded ? "Shrink" : "Expand"}
>
{isExpanded ? "⤡" : "⤢"}
</button>
  
<button
type="button"
onClick={handleMinimize}
style={styles.iconButton}
aria-label="Minimize notes"
title="Minimize"
>
−
</button>
<button
type="button"
onClick={handleClose}
style={styles.iconButton}
aria-label="Close notes"
title="Close"
>
×
</button>
</div>
</div>

{!isMinimized ? (
<>
<textarea
value={notes}
onChange={(e) => setNotes(e.target.value)}
placeholder="Write notes while reviewing jobs, resumes, interview prep, videos, or anything else..."
style={{
...styles.textarea,
minHeight: isExpanded ? "320px" : "180px",
}}
/>

<div style={styles.footer}>
<span style={styles.metaText}>{wordCount} words</span>
<span style={styles.metaText}>{statusMessage || "Autosaves"}</span>
</div>
</>
) : (
<div style={styles.minimizedBar}>
<span style={styles.metaText}>{wordCount} words</span>
<button
type="button"
onClick={() => setIsMinimized(false)}
style={styles.restoreButton}
>
Open Notes
</button>
</div>
)}
</div>
);
}

const styles: Record<string, React.CSSProperties> = {
panel: {
position: "fixed",
right: "20px",
bottom: "20px",
width: "340px",
maxWidth: "calc(100vw - 24px)",
zIndex: 1200,
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "20px",
boxShadow: "0 24px 60px rgba(0,0,0,0.34)",
padding: "14px",
},
panelExpanded: {
width: "560px",
maxWidth: "calc(100vw - 24px)",
},
panelExpanded: {
width: "560px",
maxWidth: "calc(100vw - 24px)",
},
panelMinimized: {
width: "260px",
paddingBottom: "12px",
},
header: {
display: "flex",
justifyContent: "space-between",
gap: "12px",
alignItems: "flex-start",
marginBottom: "10px",
},
kicker: {
margin: "0 0 4px",
color: "#9ca3af",
fontSize: "10px",
letterSpacing: "0.16em",
textTransform: "uppercase",
},
title: {
margin: 0,
color: "#f5f5f5",
fontSize: "20px",
fontWeight: 700,
},
iconRow: {
display: "flex",
gap: "6px",
alignItems: "center",
flexWrap: "wrap",
},
iconButton: {
width: "30px",
height: "30px",
borderRadius: "10px",
border: "1px solid #303030",
background: "#101010",
color: "#f5f5f5",
cursor: "pointer",
fontSize: "14px",
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: 0,
},
textarea: {
width: "100%",
minHeight: "180px",
resize: "vertical",
background: "#0f0f10",
color: "#f4f4f5",
border: "1px solid #313131",
borderRadius: "14px",
padding: "12px 14px",
fontSize: "14px",
lineHeight: 1.6,
boxSizing: "border-box",
outline: "none",
},
footer: {
display: "flex",
justifyContent: "space-between",
gap: "10px",
alignItems: "center",
marginTop: "10px",
},
minimizedBar: {
display: "flex",
justifyContent: "space-between",
gap: "10px",
alignItems: "center",
paddingTop: "4px",
},
restoreButton: {
border: "1px solid #3a3a3a",
background: "#111111",
color: "#f5f5f5",
borderRadius: "12px",
padding: "8px 10px",
fontSize: "12px",
fontWeight: 700,
cursor: "pointer",
},
metaText: {
color: "#a1a1aa",
fontSize: "12px",
},
};
