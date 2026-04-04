"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type ParticipantRow = {
id?: string | null;
user_id?: string | null;
full_name?: string | null;
email?: string | null;
phone?: string | null;
city?: string | null;
state?: string | null;
bio?: string | null;
headline?: string | null;
linkedin_url?: string | null;
referral_code?: string | null;
created_at?: string | null;
};

type ActivityRow = {
id?: string | null;
user_id?: string | null;
full_name?: string | null;
email?: string | null;
event_type?: string | null;
tool_name?: string | null;
page_name?: string | null;
created_at?: string | null;
};

type MessageRow = {
id?: string | null;
sender_name?: string | null;
sender_role?: string | null;
subject?: string | null;
body?: string | null;
message_type?: string | null;
is_read?: boolean | null;
created_at?: string | null;
};

function formatDate(value?: string | null) {
if (!value) return "—";
const date = new Date(value);
if (Number.isNaN(date.getTime())) return value;
return date.toLocaleString();
}

function formatShortDate(value?: string | null) {
if (!value) return "—";
const date = new Date(value);
if (Number.isNaN(date.getTime())) return value;
return date.toLocaleDateString();
}

export default function PartnerParticipantDetailPage() {
const params = useParams();
const participantId = String(params?.id || "");

const [loading, setLoading] = useState(true);
const [message, setMessage] = useState("");
const [participant, setParticipant] = useState<ParticipantRow | null>(null);
const [activity, setActivity] = useState<ActivityRow[]>([]);
const [messages, setMessages] = useState<MessageRow[]>([]);

useEffect(() => {
let mounted = true;

async function loadParticipantPage() {
setLoading(true);
setMessage("");

const { data: authData, error: authError } = await supabase.auth.getUser();

if (authError || !authData.user?.email) {
window.location.href = "/employer-partner-login";
return;
}

const partnerEmail = authData.user.email;

const { data: partnerRow, error: partnerError } = await supabase
.from("partners")
.select("referral_code")
.eq("contact_email", partnerEmail)
.maybeSingle<{ referral_code?: string | null }>();

if (!mounted) return;

if (partnerError || !partnerRow?.referral_code) {
setMessage("Unable to verify partner access for this participant.");
setLoading(false);
return;
}

const { data: participantRow, error: participantError } = await supabase
.from("candidate_profiles")
.select(
"id, user_id, full_name, email, phone, city, state, bio, headline, linkedin_url, referral_code, created_at"
)
.eq("id", participantId)
.eq("referral_code", partnerRow.referral_code)
.maybeSingle<ParticipantRow>();

if (!mounted) return;

if (participantError || !participantRow) {
setMessage("Participant not found or not available under this referral code.");
setLoading(false);
return;
}

setParticipant(participantRow);

const participantUserId = participantRow.user_id || "";
const participantEmail = participantRow.email || "";

let nextActivity: ActivityRow[] = [];
let nextMessages: MessageRow[] = [];

if (participantUserId || participantEmail) {
const activityFilters = [
participantUserId ? `user_id.eq.${participantUserId}` : "",
participantEmail ? `email.eq.${participantEmail}` : "",
]
.filter(Boolean)
.join(",");

const { data: activityRows } = await supabase
.from("user_activity")
.select("id, user_id, full_name, email, event_type, tool_name, page_name, created_at")
.or(activityFilters)
.eq("referral_code", partnerRow.referral_code)
.order("created_at", { ascending: false })
.limit(200);

nextActivity = (activityRows as ActivityRow[]) || [];

const messageFilters = [
participantUserId ? `recipient_user_id.eq.${participantUserId}` : "",
participantEmail ? `recipient_email.eq.${participantEmail}` : "",
]
.filter(Boolean)
.join(",");

const { data: messageRows } = await supabase
.from("messages")
.select("id, sender_name, sender_role, subject, body, message_type, is_read, created_at")
.or(messageFilters)
.order("created_at", { ascending: false })
.limit(100);

nextMessages = (messageRows as MessageRow[]) || [];
}

if (!mounted) return;

setActivity(nextActivity);
setMessages(nextMessages);
setLoading(false);
}

if (participantId) {
loadParticipantPage();
} else {
setMessage("No participant selected.");
setLoading(false);
}

return () => {
mounted = false;
};
}, [participantId]);

const totalActivity = activity.length;

const toolBreakdown = useMemo(() => {
const counts = new Map<string, number>();

activity.forEach((row) => {
const key = row.tool_name || "other";
counts.set(key, (counts.get(key) || 0) + 1);
});

return [...counts.entries()]
.map(([tool, count]) => ({ tool, count }))
.sort((a, b) => b.count - a.count);
}, [activity]);

const latestCareerMapActivity = useMemo(() => {
return (
activity.find((row) => (row.tool_name || "").toLowerCase() === "career_map") || null
);
}, [activity]);

const latestJobLogActivity = useMemo(() => {
return (
activity.find((row) => (row.tool_name || "").toLowerCase() === "job_log_generator") || null
);
}, [activity]);

if (loading) {
return (
<main style={styles.page}>
<div style={styles.centerWrap}>Loading participant details...</div>
</main>
);
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.headerCard}>
<div>
<p style={styles.kicker}>Participant Support View</p>
<h1 style={styles.title}>{participant?.full_name || "Participant"}</h1>
<p style={styles.subtitle}>
Review participant details, recent activity, inbox history, and progress signals.
</p>
<p style={styles.subtleLine}>Email: {participant?.email || "—"}</p>
<p style={styles.subtleLine}>Phone: {participant?.phone || "—"}</p>
<p style={styles.subtleLine}>
Location: {[participant?.city, participant?.state].filter(Boolean).join(", ") || "—"}
</p>
<p style={styles.subtleLine}>Referral Code: {participant?.referral_code || "—"}</p>
<p style={styles.subtleLine}>Joined: {formatShortDate(participant?.created_at)}</p>
</div>

<div style={styles.actionWrap}>
<a href="/partner-dashboard" style={styles.secondaryButtonLink}>
Back to Dashboard
</a>
<a href="/messages" style={styles.secondaryButtonLink}>
Open Messages
</a>
</div>
</section>

{message ? <div style={styles.notice}>{message}</div> : null}

<section style={styles.gridThree}>
<div style={styles.metricCardBlue}>
<p style={styles.summaryLabel}>Total Activity</p>
<p style={styles.summaryValue}>{totalActivity}</p>
</div>

<div style={styles.metricCardGreen}>
<p style={styles.summaryLabel}>Inbox Messages</p>
<p style={styles.summaryValue}>{messages.length}</p>
</div>

<div style={styles.metricCardPurple}>
<p style={styles.summaryLabel}>Top Tool Count</p>
<p style={styles.summaryValue}>{toolBreakdown[0]?.count || 0}</p>
</div>
</section>

<section style={styles.gridTwo}>
<div style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Profile Snapshot</p>
<h2 style={styles.sectionTitle}>Participant details</h2>
</div>
</div>

<div style={styles.detailGrid}>
<div style={styles.detailItem}>
<p style={styles.detailLabel}>Headline</p>
<p style={styles.detailValue}>{participant?.headline || "—"}</p>
</div>

<div style={styles.detailItem}>
<p style={styles.detailLabel}>LinkedIn</p>
<p style={styles.detailValue}>{participant?.linkedin_url || "—"}</p>
</div>

<div style={{ ...styles.detailItem, gridColumn: "1 / -1" }}>
<p style={styles.detailLabel}>Bio</p>
<p style={styles.detailValue}>{participant?.bio || "—"}</p>
</div>
</div>
</div>

<div style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Career Planning</p>
<h2 style={styles.sectionTitle}>Career Map / IEP preview</h2>
</div>
</div>

<div style={styles.previewBlock}>
<p style={styles.previewLabel}>Latest Career Map activity</p>
<p style={styles.previewValue}>
{latestCareerMapActivity
? `${latestCareerMapActivity.event_type || "activity"} • ${formatDate(
latestCareerMapActivity.created_at
)}`
: "No Career Map activity found yet."}
</p>
</div>

<div style={styles.previewBlock}>
<p style={styles.previewLabel}>Latest Job Log activity</p>
<p style={styles.previewValue}>
{latestJobLogActivity
? `${latestJobLogActivity.event_type || "activity"} • ${formatDate(
latestJobLogActivity.created_at
)}`
: "No Job Log activity found yet."}
</p>
</div>
</div>
</section>

<section style={styles.gridTwo}>
<div style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Recent Platform Activity</p>
<h2 style={styles.sectionTitle}>Activity timeline</h2>
</div>
</div>

{activity.length === 0 ? (
<p style={styles.emptyText}>No activity has been tracked yet for this participant.</p>
) : (
<div style={styles.tableWrap}>
<table style={styles.table}>
<thead>
<tr>
<th style={styles.th}>Date</th>
<th style={styles.th}>Tool</th>
<th style={styles.th}>Event</th>
<th style={styles.th}>Page</th>
</tr>
</thead>
<tbody>
{activity.slice(0, 25).map((row, index) => (
<tr key={row.id || `${row.created_at}-${index}`}>
<td style={styles.td}>{formatDate(row.created_at)}</td>
<td style={styles.td}>{row.tool_name || "—"}</td>
<td style={styles.td}>{row.event_type || "—"}</td>
<td style={styles.td}>{row.page_name || "—"}</td>
</tr>
))}
</tbody>
</table>
</div>
)}
</div>

<div style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Message History</p>
<h2 style={styles.sectionTitle}>Inbox history</h2>
</div>
</div>

{messages.length === 0 ? (
<p style={styles.emptyText}>No messages have been saved for this participant yet.</p>
) : (
<div style={styles.messageList}>
{messages.slice(0, 12).map((row, index) => (
<article key={row.id || `${row.created_at}-${index}`} style={styles.messageCard}>
<div style={styles.messageTop}>
<div>
<p style={styles.messageType}>{row.message_type || "message"}</p>
<h3 style={styles.messageSubject}>{row.subject || "No subject"}</h3>
<p style={styles.messageMeta}>
From {row.sender_name || row.sender_role || "HireMinds"} •{" "}
{formatDate(row.created_at)}
</p>
</div>

<span style={row.is_read ? styles.readBadge : styles.unreadBadge}>
{row.is_read ? "Read" : "Unread"}
</span>
</div>

<p style={styles.messageBody}>{row.body || "No message content."}</p>
</article>
))}
</div>
)}
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Tool Monitoring</p>
<h2 style={styles.sectionTitle}>Tool usage breakdown</h2>
</div>
</div>

{toolBreakdown.length === 0 ? (
<p style={styles.emptyText}>No tracked tool usage yet.</p>
) : (
<div style={styles.toolGrid}>
{toolBreakdown.map((item) => (
<div key={item.tool} style={styles.toolCard}>
<p style={styles.toolLabel}>{item.tool}</p>
<p style={styles.toolValue}>{item.count}</p>
</div>
))}
</div>
)}
</section>
</div>
</main>
);
}

const baseMetricCard: CSSProperties = {
borderRadius: "22px",
padding: "20px",
border: "1px solid rgba(255,255,255,0.08)",
boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
};

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
maxWidth: "1380px",
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
actionWrap: {
display: "flex",
gap: "12px",
flexWrap: "wrap",
},
secondaryButtonLink: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: "12px 16px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.12)",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
cursor: "pointer",
textDecoration: "none",
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
gridThree: {
display: "grid",
gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
gap: "16px",
},
gridTwo: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "24px",
},
metricCardBlue: {
...baseMetricCard,
background: "linear-gradient(180deg, rgba(30,64,175,0.24) 0%, rgba(20,20,24,1) 100%)",
},
metricCardGreen: {
...baseMetricCard,
background: "linear-gradient(180deg, rgba(22,163,74,0.22) 0%, rgba(20,20,24,1) 100%)",
},
metricCardPurple: {
...baseMetricCard,
background: "linear-gradient(180deg, rgba(126,34,206,0.22) 0%, rgba(20,20,24,1) 100%)",
},
summaryLabel: {
margin: "0 0 10px",
color: "#d4d4d8",
fontSize: "13px",
},
summaryValue: {
margin: 0,
color: "#ffffff",
fontSize: "34px",
fontWeight: 700,
lineHeight: 1,
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
detailGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "16px",
},
detailItem: {
display: "grid",
gap: "8px",
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "16px",
background: "#101010",
},
detailLabel: {
margin: 0,
color: "#a1a1aa",
fontSize: "13px",
fontWeight: 600,
},
detailValue: {
margin: 0,
color: "#f4f4f5",
fontSize: "15px",
lineHeight: 1.7,
},
previewBlock: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "16px",
background: "#101010",
marginBottom: "14px",
},
previewLabel: {
margin: "0 0 8px",
color: "#93c5fd",
fontSize: "13px",
fontWeight: 700,
},
previewValue: {
margin: 0,
color: "#e5e7eb",
fontSize: "15px",
lineHeight: 1.7,
},
emptyText: {
margin: 0,
color: "#c8c8c8",
fontSize: "15px",
lineHeight: 1.7,
},
tableWrap: {
maxHeight: "460px",
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
messageList: {
display: "grid",
gap: "14px",
},
messageCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "16px",
background: "#101010",
},
messageTop: {
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: "16px",
flexWrap: "wrap",
},
messageType: {
margin: "0 0 6px",
color: "#93c5fd",
fontSize: "11px",
letterSpacing: "0.14em",
textTransform: "uppercase",
},
messageSubject: {
margin: "0 0 8px",
color: "#f5f5f5",
fontSize: "18px",
fontWeight: 700,
},
messageMeta: {
margin: 0,
color: "#a1a1aa",
fontSize: "13px",
},
messageBody: {
margin: "14px 0 0",
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.7,
},
unreadBadge: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: "8px 12px",
borderRadius: "999px",
fontSize: "12px",
fontWeight: 700,
color: "#bbf7d0",
background: "rgba(34,197,94,0.12)",
border: "1px solid rgba(34,197,94,0.24)",
},
readBadge: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: "8px 12px",
borderRadius: "999px",
fontSize: "12px",
fontWeight: 700,
color: "#e5e7eb",
background: "rgba(115,115,115,0.16)",
border: "1px solid rgba(255,255,255,0.12)",
},
toolGrid: {
display: "grid",
gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
gap: "14px",
},
toolCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "14px",
background: "#101010",
},
toolLabel: {
margin: "0 0 8px",
color: "#d4d4d8",
fontSize: "13px",
},
toolValue: {
margin: 0,
color: "#fff",
fontSize: "28px",
fontWeight: 700,
},
};
