"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../../lib/supabase";

type PartnerRow = {
organization_name?: string | null;
contact_name?: string | null;
contact_title?: string | null;
contact_email?: string | null;
referral_code?: string | null;
account_type?: string | null;
};

type ParticipantRow = {
id?: string | null;
user_id?: string | null;
full_name?: string | null;
email?: string | null;
phone?: string | null;
created_at?: string | null;
};

type ActivityRow = {
id?: string | null;
user_id?: string | null;
full_name?: string | null;
email?: string | null;
referral_code?: string | null;
event_type?: string | null;
tool_name?: string | null;
page_name?: string | null;
created_at?: string | null;
};

type CareerMapNote = {
participantKey: string;
participantName: string;
participantEmail?: string;
participantPhone?: string;
targetRole?: string;
targetIndustry?: string;
shortTermGoal?: string;
longTermGoal?: string;
actionSteps?: string;
partnerNotes?: string;
updatedAt: string;
};

function formatDate(value?: string | null) {
if (!value) return "—";
const date = new Date(value);
if (Number.isNaN(date.getTime())) return value;
return date.toLocaleString();
}

export default function PartnerCareerMapPage() {
const [loading, setLoading] = useState(true);
const [loadingLogout, setLoadingLogout] = useState(false);
const [message, setMessage] = useState("");
const [partner, setPartner] = useState<PartnerRow | null>(null);
const [participants, setParticipants] = useState<ParticipantRow[]>([]);
const [activity, setActivity] = useState<ActivityRow[]>([]);
const [participantSearch, setParticipantSearch] = useState("");

const [selectedParticipantKey, setSelectedParticipantKey] = useState("");
const [selectedParticipantName, setSelectedParticipantName] = useState("");
const [selectedParticipantEmail, setSelectedParticipantEmail] = useState("");
const [selectedParticipantPhone, setSelectedParticipantPhone] = useState("");

const [careerMapNotes, setCareerMapNotes] = useState<CareerMapNote[]>([]);
const [targetRole, setTargetRole] = useState("");
const [targetIndustry, setTargetIndustry] = useState("");
const [shortTermGoal, setShortTermGoal] = useState("");
const [longTermGoal, setLongTermGoal] = useState("");
const [actionSteps, setActionSteps] = useState("");
const [partnerNotes, setPartnerNotes] = useState("");

const mountedRef = useRef(true);

const notesStorageKey = useMemo(() => {
const code = partner?.referral_code || "partner";
return `hireminds-career-map-notes-${code}`;
}, [partner?.referral_code]);

useEffect(() => {
mountedRef.current = true;
return () => {
mountedRef.current = false;
};
}, []);

useEffect(() => {
try {
const raw = window.localStorage.getItem(notesStorageKey);
if (raw) {
const parsed = JSON.parse(raw);
setCareerMapNotes(Array.isArray(parsed) ? parsed : []);
} else {
setCareerMapNotes([]);
}
} catch {
setCareerMapNotes([]);
}
}, [notesStorageKey]);

function persistCareerMapNotes(next: CareerMapNote[]) {
setCareerMapNotes(next);
try {
window.localStorage.setItem(notesStorageKey, JSON.stringify(next));
} catch {
setMessage("Unable to save career map notes in this browser.");
}
}

async function loadPage() {
setLoading(true);
setMessage("");

const { data: authData, error: authError } = await supabase.auth.getUser();

if (authError || !authData.user?.email) {
window.location.href = "/employer-partner-login";
return;
}

const email = authData.user.email;

const { data: partnerRow, error: partnerError } = await supabase
.from("partners")
.select("*")
.eq("contact_email", email)
.maybeSingle<PartnerRow>();

if (partnerError) {
if (mountedRef.current) {
setMessage(partnerError.message);
setLoading(false);
}
return;
}

if (!partnerRow || !partnerRow.referral_code) {
if (mountedRef.current) {
setMessage("This account does not have partner career map access.");
setLoading(false);
}
return;
}

const { data: participantRows, error: participantError } = await supabase
.from("candidate_profiles")
.select("id, user_id, full_name, email, phone, created_at")
.eq("referral_code", partnerRow.referral_code)
.order("created_at", { ascending: false });

if (participantError) {
if (mountedRef.current) {
setMessage(participantError.message);
setLoading(false);
}
return;
}

const { data: activityRows, error: activityError } = await supabase
.from("user_activity")
.select("id, user_id, full_name, email, referral_code, event_type, tool_name, page_name, created_at")
.eq("referral_code", partnerRow.referral_code)
.order("created_at", { ascending: false })
.limit(5000);

if (activityError) {
if (mountedRef.current) {
setMessage(activityError.message);
setLoading(false);
}
return;
}

if (!mountedRef.current) return;

setPartner(partnerRow);
setParticipants((participantRows as ParticipantRow[]) || []);
setActivity((activityRows as ActivityRow[]) || []);
setLoading(false);
}

useEffect(() => {
loadPage();
}, []);

const uniqueParticipants = useMemo(() => {
const seen = new Set<string>();
return participants.filter((row) => {
const key = row.user_id || row.email || row.phone || row.id || "";
if (!key || seen.has(key)) return false;
seen.add(key);
return true;
});
}, [participants]);

const filteredParticipants = useMemo(() => {
const q = participantSearch.trim().toLowerCase();
if (!q) return uniqueParticipants;

return uniqueParticipants.filter((row) => {
const name = (row.full_name || "").toLowerCase();
const email = (row.email || "").toLowerCase();
const phone = (row.phone || "").toLowerCase();
return name.includes(q) || email.includes(q) || phone.includes(q);
});
}, [uniqueParticipants, participantSearch]);

const participantOptions = useMemo(() => {
return filteredParticipants.map((row) => ({
key: row.user_id || row.email || row.phone || row.id || "",
name: row.full_name || row.email || row.phone || "Participant",
email: row.email || "",
phone: row.phone || "",
}));
}, [filteredParticipants]);

const selectedParticipantCareerMapActivity = useMemo(() => {
if (!selectedParticipantKey) return [];

return activity.filter((row) => {
const rowKey = row.user_id || row.email || row.id || "";
const isParticipantMatch = rowKey === selectedParticipantKey;
const isCareerMap =
(row.tool_name || "").toLowerCase() === "career_map" ||
(row.page_name || "").toLowerCase().includes("career-map") ||
(row.page_name || "").toLowerCase().includes("career map");

return isParticipantMatch && isCareerMap;
});
}, [activity, selectedParticipantKey]);

const latestCareerMapActivity = selectedParticipantCareerMapActivity[0] || null;

const selectedParticipantNote = useMemo(() => {
if (!selectedParticipantKey) return null;
return careerMapNotes.find((item) => item.participantKey === selectedParticipantKey) || null;
}, [careerMapNotes, selectedParticipantKey]);

useEffect(() => {
if (!selectedParticipantNote) {
setTargetRole("");
setTargetIndustry("");
setShortTermGoal("");
setLongTermGoal("");
setActionSteps("");
setPartnerNotes("");
return;
}

setTargetRole(selectedParticipantNote.targetRole || "");
setTargetIndustry(selectedParticipantNote.targetIndustry || "");
setShortTermGoal(selectedParticipantNote.shortTermGoal || "");
setLongTermGoal(selectedParticipantNote.longTermGoal || "");
setActionSteps(selectedParticipantNote.actionSteps || "");
setPartnerNotes(selectedParticipantNote.partnerNotes || "");
}, [selectedParticipantNote]);

function saveCareerMapNote() {
if (!selectedParticipantKey || !selectedParticipantName) {
setMessage("Please select a participant before saving career map notes.");
return;
}

const nextNote: CareerMapNote = {
participantKey: selectedParticipantKey,
participantName: selectedParticipantName,
participantEmail: selectedParticipantEmail,
participantPhone: selectedParticipantPhone,
targetRole: targetRole.trim() || undefined,
targetIndustry: targetIndustry.trim() || undefined,
shortTermGoal: shortTermGoal.trim() || undefined,
longTermGoal: longTermGoal.trim() || undefined,
actionSteps: actionSteps.trim() || undefined,
partnerNotes: partnerNotes.trim() || undefined,
updatedAt: new Date().toISOString(),
};

const others = careerMapNotes.filter((item) => item.participantKey !== selectedParticipantKey);
persistCareerMapNotes([nextNote, ...others]);
setMessage("Career map notes saved.");
}

async function handleLogout() {
try {
setLoadingLogout(true);
await supabase.auth.signOut();
} finally {
window.location.href = "/employer-partner-login";
}
}

if (loading) {
return (
<main style={styles.page}>
<div style={styles.centerWrap}>Loading career map...</div>
</main>
);
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.headerCard}>
<div>
<p style={styles.kicker}>Partner Career Map</p>
<h1 style={styles.title}>Career Map</h1>
<p style={styles.subtitle}>
Organization: <strong>{partner?.organization_name || "—"}</strong>
</p>
<p style={styles.subtleLine}>Referral Code: {partner?.referral_code || "—"}</p>
<p style={styles.subtleLine}>
This page shows tracked Career Map activity and partner notes until a dedicated career map table is connected.
</p>
</div>

<div style={styles.headerActions}>
<button type="button" onClick={loadPage} style={styles.secondaryButton}>
Refresh
</button>

<button
type="button"
onClick={handleLogout}
style={styles.logoutButton}
disabled={loadingLogout}
>
{loadingLogout ? "Logging Off..." : "Log Off"}
</button>
</div>
</section>

{message ? <div style={styles.notice}>{message}</div> : null}

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>Participant Search</p>
<InfoBubble
title="Career Map Search"
text="Search by participant name, email, or phone number and then select the participant to review Career Map activity and partner notes."
/>
</div>
<h2 style={styles.sectionTitle}>Select participant</h2>
</div>
</div>

<div style={styles.filterGrid}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Search Participants</label>
<input
value={participantSearch}
onChange={(e) => setParticipantSearch(e.target.value)}
placeholder="Search by name, email, or phone number"
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Participant</label>
<select
value={selectedParticipantKey}
onChange={(e) => {
const key = e.target.value;
const match = participantOptions.find((item) => item.key === key);
setSelectedParticipantKey(key);
setSelectedParticipantName(match?.name || "");
setSelectedParticipantEmail(match?.email || "");
setSelectedParticipantPhone(match?.phone || "");
}}
style={styles.select}
>
<option value="">
{participantOptions.length ? "Select participant" : "No participants match current search"}
</option>
{participantOptions.map((item) => (
<option key={item.key} value={item.key}>
{item.name}
</option>
))}
</select>
</div>
</div>
</section>

{selectedParticipantKey ? (
<>
<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Participant Snapshot</p>
<h2 style={styles.sectionTitle}>Selected participant details</h2>
</div>
</div>

<div style={styles.snapshotGrid}>
<div style={styles.snapshotCard}>
<p style={styles.snapshotLabel}>Participant</p>
<p style={styles.snapshotValue}>{selectedParticipantName || "—"}</p>
</div>
<div style={styles.snapshotCard}>
<p style={styles.snapshotLabel}>Email</p>
<p style={styles.snapshotValue}>{selectedParticipantEmail || "—"}</p>
</div>
<div style={styles.snapshotCard}>
<p style={styles.snapshotLabel}>Phone</p>
<p style={styles.snapshotValue}>{selectedParticipantPhone || "—"}</p>
</div>
<div style={styles.snapshotCard}>
<p style={styles.snapshotLabel}>Latest Career Map Activity</p>
<p style={styles.snapshotValue}>
{latestCareerMapActivity
? `${latestCareerMapActivity.event_type || "—"} • ${formatDate(latestCareerMapActivity.created_at)}`
: "No Career Map activity found."}
</p>
</div>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>Partner Career Map Notes</p>
<InfoBubble
title="Partner Career Map Notes"
text="Use this section to capture partner-facing career map notes, goals, and next steps for the selected participant."
/>
</div>
<h2 style={styles.sectionTitle}>Goals and next steps</h2>
</div>
</div>

<div style={styles.noteGrid}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Target Role</label>
<input
value={targetRole}
onChange={(e) => setTargetRole(e.target.value)}
style={styles.input}
placeholder="Example: Medical Assistant"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Target Industry</label>
<input
value={targetIndustry}
onChange={(e) => setTargetIndustry(e.target.value)}
style={styles.input}
placeholder="Example: Healthcare"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Short-Term Goal</label>
<textarea
value={shortTermGoal}
onChange={(e) => setShortTermGoal(e.target.value)}
style={styles.textarea}
placeholder="Add short-term goal"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Long-Term Goal</label>
<textarea
value={longTermGoal}
onChange={(e) => setLongTermGoal(e.target.value)}
style={styles.textarea}
placeholder="Add long-term goal"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Action Steps</label>
<textarea
value={actionSteps}
onChange={(e) => setActionSteps(e.target.value)}
style={styles.textarea}
placeholder="List next steps, checkpoints, or action items"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Partner Notes</label>
<textarea
value={partnerNotes}
onChange={(e) => setPartnerNotes(e.target.value)}
style={styles.textarea}
placeholder="Add partner observations, notes, or follow-up details"
/>
</div>
</div>

<div style={styles.notesActions}>
<button type="button" onClick={saveCareerMapNote} style={styles.secondaryButton}>
Save Career Map Notes
</button>
</div>

{selectedParticipantNote ? (
<div style={styles.savedNoteCard}>
<p style={styles.savedNoteLabel}>Last Saved</p>
<p style={styles.savedNoteValue}>{formatDate(selectedParticipantNote.updatedAt)}</p>
</div>
) : null}
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Tracked Career Map Activity</p>
<h2 style={styles.sectionTitle}>Career Map history</h2>
</div>
</div>

<div style={styles.tableWrap}>
<table style={styles.table}>
<thead>
<tr>
<th style={styles.th}>Date</th>
<th style={styles.th}>Participant</th>
<th style={styles.th}>Event</th>
<th style={styles.th}>Tool</th>
<th style={styles.th}>Page</th>
</tr>
</thead>
<tbody>
{selectedParticipantCareerMapActivity.length ? (
selectedParticipantCareerMapActivity.map((row, index) => {
const rowKey = row.id || `${row.user_id || row.email || "career-map"}-${index}`;
return (
<tr key={rowKey}>
<td style={styles.td}>{formatDate(row.created_at)}</td>
<td style={styles.td}>{row.full_name || row.email || "—"}</td>
<td style={styles.td}>{row.event_type || "—"}</td>
<td style={styles.td}>{row.tool_name || "—"}</td>
<td style={styles.td}>{row.page_name || "—"}</td>
</tr>
);
})
) : (
<tr>
<td style={styles.td} colSpan={5}>
No Career Map activity found for this participant.
</td>
</tr>
)}
</tbody>
</table>
</div>
</section>
</>
) : (
<section style={styles.card}>
<p style={styles.emptyText}>Select a participant to view Career Map details.</p>
</section>
)}
</div>
</main>
);
}

const styles: Record<string, CSSProperties> = {
page: {
minHeight: "100vh",
background:
"radial-gradient(circle at top left, rgba(59,130,246,0.09), transparent 22%), linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
color: "#e7e7e7",
padding: "32px 24px 56px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
centerWrap: {
minHeight: "70vh",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontSize: "18px",
},
shell: {
maxWidth: "1480px",
margin: "0 auto",
display: "grid",
gap: "24px",
},
headerCard: {
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: "18px",
flexWrap: "wrap",
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
fontWeight: 700,
color: "#f5f5f5",
},
subtitle: {
margin: 0,
color: "#d4d4d8",
fontSize: "16px",
lineHeight: 1.7,
},
subtleLine: {
margin: "6px 0 0",
color: "#a1a1aa",
fontSize: "14px",
},
headerActions: {
display: "flex",
gap: "12px",
flexWrap: "wrap",
alignItems: "center",
},
secondaryButton: {
padding: "12px 16px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.12)",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
cursor: "pointer",
},
logoutButton: {
padding: "12px 16px",
borderRadius: "16px",
border: "1px solid rgba(148,163,184,0.28)",
background: "linear-gradient(180deg, #0f244d 0%, #112b5f 100%)",
color: "#fff",
fontWeight: 700,
cursor: "pointer",
},
notice: {
background: "rgba(250,204,21,0.08)",
border: "1px solid rgba(250,204,21,0.24)",
color: "#fde68a",
borderRadius: "18px",
padding: "14px 16px",
fontSize: "14px",
lineHeight: 1.6,
},
card: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px",
},
sectionTop: {
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: "16px",
flexWrap: "wrap",
marginBottom: "18px",
},
titleRow: {
display: "flex",
alignItems: "center",
gap: "8px",
},
sectionKicker: {
margin: "0 0 8px",
color: "#9ca3af",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
sectionTitle: {
margin: 0,
fontSize: "28px",
lineHeight: 1.1,
fontWeight: 700,
color: "#f5f5f5",
},
infoWrap: {
position: "relative",
display: "inline-flex",
alignItems: "center",
},
infoButton: {
width: "20px",
height: "20px",
borderRadius: "999px",
border: "1px solid rgba(255,255,255,0.18)",
background: "#111111",
color: "#f5f5f5",
fontSize: "12px",
fontWeight: 700,
cursor: "pointer",
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: 0,
},
infoPopup: {
position: "absolute",
top: "28px",
right: 0,
width: "260px",
zIndex: 10,
background: "#111111",
border: "1px solid rgba(255,255,255,0.14)",
borderRadius: "14px",
padding: "12px",
boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
},
infoTitle: {
margin: "0 0 6px",
color: "#ffffff",
fontSize: "13px",
fontWeight: 700,
},
infoText: {
margin: 0,
color: "#d4d4d8",
fontSize: "12px",
lineHeight: 1.6,
},
filterGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "16px",
},
fieldWrap: {
display: "grid",
gap: "8px",
},
label: {
color: "#d4d4d8",
fontSize: "13px",
fontWeight: 600,
lineHeight: 1.5,
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
select: {
padding: "12px 14px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "14px",
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
snapshotGrid: {
display: "grid",
gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
gap: "14px",
},
snapshotCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "16px",
background: "#101010",
},
snapshotLabel: {
margin: "0 0 8px",
color: "#93c5fd",
fontSize: "12px",
fontWeight: 700,
textTransform: "uppercase",
letterSpacing: "0.06em",
},
snapshotValue: {
margin: 0,
color: "#f5f5f5",
fontSize: "14px",
lineHeight: 1.6,
},
noteGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "16px",
},
notesActions: {
marginTop: "16px",
},
savedNoteCard: {
marginTop: "18px",
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "16px",
background: "#101010",
display: "inline-block",
},
savedNoteLabel: {
margin: "0 0 8px",
color: "#93c5fd",
fontSize: "12px",
fontWeight: 700,
textTransform: "uppercase",
letterSpacing: "0.06em",
},
savedNoteValue: {
margin: 0,
color: "#f5f5f5",
fontSize: "14px",
},
tableWrap: {
maxHeight: "520px",
overflow: "auto",
borderRadius: "18px",
border: "1px solid #2b2b2e",
},
table: {
width: "100%",
borderCollapse: "collapse",
},
th: {
textAlign: "left",
padding: "12px 10px",
borderBottom: "1px solid #2c2c2c",
color: "#a1a1aa",
fontSize: "13px",
fontWeight: 700,
background: "#121214",
position: "sticky",
top: 0,
zIndex: 1,
},
td: {
padding: "12px 10px",
borderBottom: "1px solid #232323",
color: "#f1f5f9",
fontSize: "14px",
verticalAlign: "top",
background: "#171719",
},
emptyText: {
margin: 0,
color: "#c8c8c8",
fontSize: "15px",
lineHeight: 1.7,
},
};
