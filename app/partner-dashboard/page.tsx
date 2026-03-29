"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

type PartnerRow = {
organization_name?: string | null;
contact_email?: string | null;
referral_code?: string | null;
account_type?: string | null;
};

type ParticipantRow = {
id?: string;
user_id?: string | null;
full_name?: string | null;
email?: string | null;
referral_code?: string | null;
resume_url?: string | null;
created_at?: string | null;
};

type ActivityRow = {
id?: string;
user_id?: string | null;
full_name?: string | null;
email?: string | null;
referral_code?: string | null;
event_type?: string | null;
tool_name?: string | null;
page_name?: string | null;
created_at?: string | null;
};

function formatDate(value?: string | null) {
if (!value) return "—";
const date = new Date(value);
if (Number.isNaN(date.getTime())) return value;
return date.toLocaleString();
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
if (!rows.length) return;

const headers = Object.keys(rows[0]);
const escapeCell = (value: unknown) => {
const text = String(value ?? "");
if (text.includes(",") || text.includes('"') || text.includes("\n")) {
return `"${text.replace(/"/g, '""')}"`;
}
return text;
};

const csv = [
headers.join(","),
...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(",")),
].join("\n");

const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = filename;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
}

export default function PartnerDashboardPage() {
const [loading, setLoading] = useState(true);
const [loadingLogout, setLoadingLogout] = useState(false);
const [message, setMessage] = useState("");

const [partnerName, setPartnerName] = useState("");
const [partnerEmail, setPartnerEmail] = useState("");
const [referralCode, setReferralCode] = useState("");
const [participants, setParticipants] = useState<ParticipantRow[]>([]);
const [activity, setActivity] = useState<ActivityRow[]>([]);

async function loadDashboard() {
setLoading(true);
setMessage("");

const { data: authData, error: authError } = await supabase.auth.getUser();

if (authError || !authData.user?.email) {
window.location.href = "/employer-partner-login";
return;
}

const email = authData.user.email;

const { data: partner, error: partnerError } = await supabase
.from("partners")
.select("organization_name, contact_email, referral_code, account_type")
.eq("contact_email", email)
.maybeSingle<PartnerRow>();

if (partnerError) {
setMessage(partnerError.message);
setLoading(false);
return;
}

if (!partner || partner.account_type !== "partner" || !partner.referral_code) {
setMessage("This account does not have partner dashboard access.");
setLoading(false);
return;
}

setPartnerName(partner.organization_name || "Partner Dashboard");
setPartnerEmail(partner.contact_email || email);
setReferralCode(partner.referral_code);

const { data: participantRows, error: participantError } = await supabase
.from("candidate_profiles")
.select("id, user_id, full_name, email, referral_code, resume_url, created_at")
.eq("referral_code", partner.referral_code)
.order("created_at", { ascending: false });

if (participantError) {
setMessage(participantError.message);
setLoading(false);
return;
}

const { data: activityRows, error: activityError } = await supabase
.from("user_activity")
.select("id, user_id, full_name, email, referral_code, event_type, tool_name, page_name, created_at")
.eq("referral_code", partner.referral_code)
.order("created_at", { ascending: false })
.limit(250);

if (activityError) {
setMessage(activityError.message);
setLoading(false);
return;
}

setParticipants((participantRows as ParticipantRow[]) || []);
setActivity((activityRows as ActivityRow[]) || []);
setLoading(false);
}

useEffect(() => {
loadDashboard();
}, []);

const uniqueParticipants = useMemo(() => {
const seen = new Set<string>();
return participants.filter((row) => {
const key = row.user_id || row.email || row.id || "";
if (!key || seen.has(key)) return false;
seen.add(key);
return true;
});
}, [participants]);

const signupCount = uniqueParticipants.length;
const totalActivity = activity.length;
const toolCompletedCount = activity.filter((row) => row.event_type === "tool_completed").length;

const lastActivityByUser = useMemo(() => {
const map = new Map<string, string>();
activity.forEach((row) => {
const key = row.user_id || row.email || "";
if (!key) return;
if (!map.has(key)) {
map.set(key, row.created_at || "");
}
});
return map;
}, [activity]);

const toolUsage = useMemo(() => {
const counts = new Map<string, number>();
activity.forEach((row) => {
const key = row.tool_name || "unknown_tool";
counts.set(key, (counts.get(key) || 0) + 1);
});

return [...counts.entries()]
.map(([tool, count]) => ({ tool, count }))
.sort((a, b) => b.count - a.count)
.slice(0, 8);
}, [activity]);

const maxToolCount = toolUsage.length ? Math.max(...toolUsage.map((item) => item.count)) : 1;

const mostUsedTool = toolUsage[0]?.tool || "—";

async function handleLogout() {
setLoadingLogout(true);
await supabase.auth.signOut();
window.location.href = "/employer-partner-login";
}

function exportParticipants() {
const rows = uniqueParticipants.map((row) => ({
full_name: row.full_name || "",
email: row.email || "",
referral_code: row.referral_code || "",
resume_url: row.resume_url || "",
created_at: row.created_at || "",
last_activity: lastActivityByUser.get(row.user_id || row.email || "") || "",
}));

downloadCsv("partner-participants.csv", rows);
}

function exportActivity() {
const rows = activity.map((row) => ({
created_at: row.created_at || "",
full_name: row.full_name || "",
email: row.email || "",
referral_code: row.referral_code || "",
event_type: row.event_type || "",
tool_name: row.tool_name || "",
page_name: row.page_name || "",
}));

downloadCsv("partner-activity.csv", rows);
}

if (loading) {
return (
<main style={styles.page}>
<div style={styles.centerWrap}>Loading partner dashboard...</div>
</main>
);
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<header style={styles.header}>
<div>
<p style={styles.kicker}>Partner Dashboard</p>
<h1 style={styles.title}>{partnerName || "Partner Dashboard"}</h1>
<p style={styles.subtitle}>
Live reporting for referral code <strong>{referralCode || "—"}</strong>
</p>
<p style={styles.subtleLine}>{partnerEmail}</p>
</div>

<div style={styles.headerActions}>
<button onClick={loadDashboard} style={styles.secondaryButton} type="button">
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
</header>

{message ? <div style={styles.notice}>{message}</div> : null}

<section style={styles.summaryGrid}>
<div style={styles.summaryCard}>
<p style={styles.summaryLabel}>Total Participants</p>
<p style={styles.summaryValue}>{signupCount}</p>
</div>
<div style={styles.summaryCard}>
<p style={styles.summaryLabel}>Total Activity</p>
<p style={styles.summaryValue}>{totalActivity}</p>
</div>
<div style={styles.summaryCard}>
<p style={styles.summaryLabel}>Tool Completions</p>
<p style={styles.summaryValue}>{toolCompletedCount}</p>
</div>
<div style={styles.summaryCard}>
<p style={styles.summaryLabel}>Most Used Tool</p>
<p style={styles.summaryValueSmall}>{mostUsedTool}</p>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Usage Chart</p>
<h2 style={styles.sectionTitle}>Top tool activity</h2>
</div>
</div>

{toolUsage.length === 0 ? (
<p style={styles.emptyText}>No tracked tool usage yet for this referral code.</p>
) : (
<div style={styles.chartWrap}>
{toolUsage.map((item) => (
<div key={item.tool} style={styles.chartRow}>
<div style={styles.chartLabel}>{item.tool}</div>
<div style={styles.chartBarOuter}>
<div
style={{
...styles.chartBarInner,
width: `${Math.max((item.count / maxToolCount) * 100, 8)}%`,
}}
/>
</div>
<div style={styles.chartCount}>{item.count}</div>
</div>
))}
</div>
)}
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Participants</p>
<h2 style={styles.sectionTitle}>Assigned candidates</h2>
</div>
<button type="button" onClick={exportParticipants} style={styles.secondaryButton}>
Export CSV
</button>
</div>

{uniqueParticipants.length === 0 ? (
<p style={styles.emptyText}>No participants found for this referral code yet.</p>
) : (
<div style={styles.tableWrap}>
<table style={styles.table}>
<thead>
<tr>
<th style={styles.th}>Full Name</th>
<th style={styles.th}>Email</th>
<th style={styles.th}>Referral Code</th>
<th style={styles.th}>Resume</th>
<th style={styles.th}>Last Activity</th>
</tr>
</thead>
<tbody>
{uniqueParticipants.map((row, index) => {
const rowKey = row.user_id || row.email || row.id || `participant-${index}`;
const lastActivity = lastActivityByUser.get(row.user_id || row.email || "") || "";
return (
<tr key={rowKey}>
<td style={styles.td}>{row.full_name || "—"}</td>
<td style={styles.td}>{row.email || "—"}</td>
<td style={styles.td}>{row.referral_code || "—"}</td>
<td style={styles.td}>
{row.resume_url ? (
<div style={styles.linkStack}>
<a href={row.resume_url} target="_blank" rel="noreferrer" style={styles.tableLink}>
View
</a>
<a href={row.resume_url} download style={styles.tableLink}>
Download
</a>
</div>
) : (
"—"
)}
</td>
<td style={styles.td}>{formatDate(lastActivity)}</td>
</tr>
);
})}
</tbody>
</table>
</div>
)}
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Recent Activity</p>
<h2 style={styles.sectionTitle}>Live reporting feed</h2>
</div>
<button type="button" onClick={exportActivity} style={styles.secondaryButton}>
Export CSV
</button>
</div>

{activity.length === 0 ? (
<p style={styles.emptyText}>No activity found yet for this referral code.</p>
) : (
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
{activity.map((row, index) => {
const rowKey = row.id || `${row.user_id || row.email || "activity"}-${index}`;
return (
<tr key={rowKey}>
<td style={styles.td}>{formatDate(row.created_at)}</td>
<td style={styles.td}>{row.full_name || row.email || "—"}</td>
<td style={styles.td}>{row.event_type || "—"}</td>
<td style={styles.td}>{row.tool_name || "—"}</td>
<td style={styles.td}>{row.page_name || "—"}</td>
</tr>
);
})}
</tbody>
</table>
</div>
)}
</section>
</div>
</main>
);
}

const styles: Record<string, CSSProperties> = {
page: {
minHeight: "100vh",
background: "linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
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
maxWidth: "1400px",
margin: "0 auto",
display: "grid",
gap: "24px",
},
header: {
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
margin: "8px 0 0",
color: "#a1a1aa",
fontSize: "14px",
},
headerActions: {
display: "flex",
gap: "12px",
flexWrap: "wrap",
},
summaryGrid: {
display: "grid",
gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
gap: "16px",
},
summaryCard: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "22px",
padding: "20px",
},
summaryLabel: {
margin: "0 0 10px",
color: "#a1a1aa",
fontSize: "13px",
},
summaryValue: {
margin: 0,
color: "#ffffff",
fontSize: "34px",
fontWeight: 700,
},
summaryValueSmall: {
margin: 0,
color: "#ffffff",
fontSize: "22px",
fontWeight: 700,
lineHeight: 1.4,
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
notice: {
background: "rgba(250,204,21,0.08)",
border: "1px solid rgba(250,204,21,0.24)",
color: "#fde68a",
borderRadius: "18px",
padding: "14px 16px",
fontSize: "14px",
lineHeight: 1.6,
},
emptyText: {
margin: 0,
color: "#c8c8c8",
fontSize: "15px",
lineHeight: 1.7,
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
chartWrap: {
display: "grid",
gap: "12px",
},
chartRow: {
display: "grid",
gridTemplateColumns: "220px 1fr 50px",
gap: "12px",
alignItems: "center",
},
chartLabel: {
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.4,
wordBreak: "break-word",
},
chartBarOuter: {
width: "100%",
height: "14px",
borderRadius: "999px",
background: "#0f0f10",
overflow: "hidden",
border: "1px solid #2f2f2f",
},
chartBarInner: {
height: "100%",
borderRadius: "999px",
background: "linear-gradient(90deg, #d4d4d8 0%, #7c7c83 100%)",
},
chartCount: {
color: "#f5f5f5",
fontSize: "14px",
fontWeight: 700,
textAlign: "right",
},
tableWrap: {
overflowX: "auto",
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
},
td: {
padding: "12px 10px",
borderBottom: "1px solid #232323",
color: "#f1f5f9",
fontSize: "14px",
verticalAlign: "top",
},
tableLink: {
color: "#dbeafe",
textDecoration: "none",
fontWeight: 600,
},
linkStack: {
display: "flex",
flexDirection: "column",
gap: "6px",
},
};
