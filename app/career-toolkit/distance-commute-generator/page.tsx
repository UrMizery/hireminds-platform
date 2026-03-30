"use client";

import { useMemo, useState, type CSSProperties } from "react";

export default function DistanceCommuteGeneratorPage() {
const [fromLocation, setFromLocation] = useState("");
const [toLocation, setToLocation] = useState("");
const [travelMode, setTravelMode] = useState("all");
const [submitted, setSubmitted] = useState(false);

const canGenerate = fromLocation.trim().length > 1 && toLocation.trim().length > 1;

const routeTitle = useMemo(() => {
const from = fromLocation.trim() || "Starting Location";
const to = toLocation.trim() || "Destination";
return `${from} to ${to}`;
}, [fromLocation, toLocation]);

function handleGenerate() {
if (!canGenerate) return;
setSubmitted(true);
}

function handleReset() {
setFromLocation("");
setToLocation("");
setTravelMode("all");
setSubmitted(false);
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>Distance &amp; Commute Generator</h1>
<p style={styles.subtitle}>
Estimate the commute between two locations and quickly check driving,
walking, and bus-line availability before planning your next step.
</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</section>

<div style={styles.layout}>
<section style={styles.formCard}>
<p style={styles.sectionKicker}>Trip Details</p>
<h2 style={styles.sectionTitle}>Enter your route</h2>

<div style={styles.fieldWrap}>
<label style={styles.label}>Starting Location</label>
<input
value={fromLocation}
onChange={(e) => setFromLocation(e.target.value)}
placeholder="Example: Hartford, CT"
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Destination</label>
<input
value={toLocation}
onChange={(e) => setToLocation(e.target.value)}
placeholder="Example: New Haven, CT"
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>View Preference</label>
<select
value={travelMode}
onChange={(e) => setTravelMode(e.target.value)}
style={styles.input}
>
<option value="all">Show All</option>
<option value="drive">Driving Only</option>
<option value="walk">Walking Only</option>
<option value="bus">Bus Line Only</option>
</select>
</div>

<div style={styles.buttonRow}>
<button
type="button"
onClick={handleGenerate}
disabled={!canGenerate}
style={{
...styles.primaryButton,
...(!canGenerate ? styles.primaryButtonDisabled : {}),
}}
>
Generate Route
</button>

<button type="button" onClick={handleReset} style={styles.secondaryButton}>
Reset
</button>
</div>

<div style={styles.infoCard}>
<p style={styles.infoTitle}>How this tool helps</p>
<p style={styles.infoText}>
Use this tool to compare commute options before applying, budgeting,
or committing to transportation plans.
</p>
</div>
</section>

<section style={styles.resultsCard}>
<p style={styles.sectionKicker}>Route Summary</p>
<h2 style={styles.sectionTitle}>{submitted ? routeTitle : "Your route preview"}</h2>

{!submitted ? (
<div style={styles.emptyState}>
<p style={styles.emptyTitle}>No route generated yet</p>
<p style={styles.emptyText}>
Enter a starting location and destination to preview commute details.
</p>
</div>
) : (
<div style={styles.resultsWrap}>
{(travelMode === "all" || travelMode === "drive") && (
<div style={styles.resultCard}>
<div style={styles.resultTop}>
<h3 style={styles.resultTitle}>Driving</h3>
<span style={styles.resultTag}>Estimate</span>
</div>
<p style={styles.resultMetric}>Distance: —</p>
<p style={styles.resultMetric}>Drive Time: —</p>
<p style={styles.resultNote}>
Driving results will appear here once route data is connected.
</p>
</div>
)}

{(travelMode === "all" || travelMode === "walk") && (
<div style={styles.resultCard}>
<div style={styles.resultTop}>
<h3 style={styles.resultTitle}>Walking</h3>
<span style={styles.resultTag}>Estimate</span>
</div>
<p style={styles.resultMetric}>Distance: —</p>
<p style={styles.resultMetric}>Walk Time: —</p>
<p style={styles.resultNote}>
Walking results will appear here once route data is connected.
</p>
</div>
)}

{(travelMode === "all" || travelMode === "bus") && (
<div style={styles.resultCard}>
<div style={styles.resultTop}>
<h3 style={styles.resultTitle}>Bus Line Availability</h3>
<span style={styles.resultTag}>Transit</span>
</div>
<p style={styles.resultMetric}>Bus Line Available: —</p>
<p style={styles.resultNote}>
This section will show a simple yes or no once transit lookup is
connected.
</p>
</div>
)}

<div style={styles.mapCard}>
<div style={styles.resultTop}>
<h3 style={styles.resultTitle}>Route Map Preview</h3>
<span style={styles.resultTag}>Map</span>
</div>
<div style={styles.mapPlaceholder}>
<p style={styles.mapPlaceholderTitle}>Map snippet coming soon</p>
<p style={styles.mapPlaceholderText}>
A route preview can be added here once map integration is turned on.
</p>
</div>
</div>

<div style={styles.notesCard}>
<div style={styles.resultTop}>
<h3 style={styles.resultTitle}>Quick Planning Notes</h3>
<span style={styles.resultTag}>Tips</span>
</div>
<ul style={styles.notesList}>
<li style={styles.notesItem}>
Compare commute time with your expected work schedule.
</li>
<li style={styles.notesItem}>
Check whether transportation costs fit your monthly budget.
</li>
<li style={styles.notesItem}>
Think about weather, traffic, and backup transportation options.
</li>
</ul>
</div>
</div>
)}
</section>
</div>
</div>
</main>
);
}

const styles: Record<string, CSSProperties> = {
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
gridTemplateColumns: "0.9fr 1.1fr",
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
display: "grid",
gap: "14px",
},
resultsCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "28px",
padding: "24px",
boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
display: "grid",
gap: "16px",
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
fieldWrap: {
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
padding: "14px 16px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "15px",
boxSizing: "border-box",
outline: "none",
},
buttonRow: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "12px",
marginTop: "6px",
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
primaryButtonDisabled: {
opacity: 0.45,
cursor: "not-allowed",
},
secondaryButton: {
width: "100%",
padding: "15px 18px",
borderRadius: "18px",
border: "1px solid rgba(148,163,184,0.28)",
background: "linear-gradient(180deg, #0f244d 0%, #112b5f 100%)",
color: "#fff",
fontSize: "15px",
fontWeight: 700,
cursor: "pointer",
},
infoCard: {
marginTop: "8px",
background: "rgba(255,255,255,0.04)",
border: "1px solid rgba(255,255,255,0.08)",
borderRadius: "20px",
padding: "18px",
},
infoTitle: {
margin: "0 0 8px",
color: "#f5f5f5",
fontSize: "15px",
fontWeight: 700,
},
infoText: {
margin: 0,
color: "#d4d4d8",
fontSize: "14px",
lineHeight: 1.7,
},
emptyState: {
background: "rgba(255,255,255,0.03)",
border: "1px solid rgba(255,255,255,0.06)",
borderRadius: "22px",
padding: "24px",
},
emptyTitle: {
margin: "0 0 8px",
color: "#f5f5f5",
fontSize: "18px",
fontWeight: 700,
},
emptyText: {
margin: 0,
color: "#a1a1aa",
fontSize: "15px",
lineHeight: 1.75,
},
resultsWrap: {
display: "grid",
gap: "16px",
},
resultCard: {
background: "rgba(255,255,255,0.03)",
border: "1px solid rgba(255,255,255,0.06)",
borderRadius: "22px",
padding: "20px",
display: "grid",
gap: "10px",
},
mapCard: {
background: "rgba(255,255,255,0.03)",
border: "1px solid rgba(255,255,255,0.06)",
borderRadius: "22px",
padding: "20px",
display: "grid",
gap: "14px",
},
notesCard: {
background: "rgba(255,255,255,0.03)",
border: "1px solid rgba(255,255,255,0.06)",
borderRadius: "22px",
padding: "20px",
display: "grid",
gap: "14px",
},
resultTop: {
display: "flex",
justifyContent: "space-between",
gap: "12px",
alignItems: "center",
},
resultTitle: {
margin: 0,
color: "#f5f5f5",
fontSize: "20px",
fontWeight: 700,
},
resultTag: {
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
resultMetric: {
margin: 0,
color: "#f5f5f5",
fontSize: "16px",
lineHeight: 1.6,
fontWeight: 600,
},
resultNote: {
margin: 0,
color: "#a1a1aa",
fontSize: "14px",
lineHeight: 1.75,
},
mapPlaceholder: {
minHeight: "220px",
borderRadius: "18px",
border: "1px dashed rgba(255,255,255,0.14)",
background:
"linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
display: "flex",
flexDirection: "column",
justifyContent: "center",
alignItems: "center",
padding: "24px",
textAlign: "center",
},
mapPlaceholderTitle: {
margin: "0 0 8px",
color: "#f5f5f5",
fontSize: "18px",
fontWeight: 700,
},
mapPlaceholderText: {
margin: 0,
color: "#a1a1aa",
fontSize: "14px",
lineHeight: 1.7,
maxWidth: "420px",
},
notesList: {
margin: 0,
paddingLeft: "18px",
},
notesItem: {
marginBottom: "8px",
color: "#d4d4d8",
fontSize: "14px",
lineHeight: 1.7,
},
};
