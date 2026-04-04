"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

type MessageType = "message" | "task" | "nudge" | "reminder";

type MessageRow = {
id?: string | null;
sender_user_id?: string | null;
sender_name?: string | null;
sender_role?: string | null;
recipient_user_id?: string | null;
recipient_email?: string | null;
recipient_name?: string | null;
referral_code?: string | null;
subject?: string | null;
body?: string | null;
message_type?: string | null;
related_tool?: string | null;
is_read?: boolean | null;
created_at?: string | null;
};

function formatDate(value?: string | null) {
if (!value) return "—";
const date = new Date(value);
if (Number.isNaN(date.getTime())) return value;
return date.toLocaleString();
}

export default function MessagesPage() {
const [loading, setLoading] = useState(true);
const [message, setMessage] = useState("");
const [userId, setUserId] = useState("");
const [userEmail, setUserEmail] = useState("");
const [rows, setRows] = useState<MessageRow[]>([]);
const [activeFilter, setActiveFilter] = useState<"all" | "unread" | MessageType>("all");

useEffect(() => {
let mounted = true;

async function loadMessages() {
setLoading(true);
setMessage("");

const { data: authData, error: authError } = await supabase.auth.getUser();

if (authError || !authData.user) {
window.location.href = "/sign-in";
return;
}

const nextUserId = authData.user.id || "";
const nextEmail = authData.user.email || "";

if (!mounted) return;

setUserId(nextUserId);
setUserEmail(nextEmail);

const filters = [
nextUserId ? `recipient_user_id.eq.${nextUserId}` : "",
nextEmail ? `recipient_email.eq.${nextEmail}` : "",
]
.filter(Boolean)
.join(",");

const { data, error } = await supabase
.from("messages")
.select(
"id, sender_user_id, sender_name, sender_role, recipient_user_id, recipient_email, recipient_name, referral_code, subject, body, message_type, related_tool, is_read, created_at"
)
.or(filters)
.order("created_at", { ascending: false });

if (!mounted) return;

if (error) {
setMessage(
"Messages page is ready, but the messages table is not connected yet. Once the Supabase table is created, messages will appear here."
);
setRows([]);
setLoading(false);
return;
}

setRows((data as MessageRow[]) || []);
setLoading(false);
}

loadMessages();

const interval = setInterval(() => {
loadMessages();
}, 15000);

return () => {
mounted = false;
clearInterval(interval);
};
}, []);

async function markAsRead(id?: string | null) {
if (!id) return;

const previous = rows;
setRows((current) =>
current.map((item) => (item.id === id ? { ...item, is_read: true } : item))
);

const { error } = await supabase
.from("messages")
.update({ is_read: true })
.eq("id", id);

if (error) {
setRows(previous);
setMessage("Unable to update this message yet.");
}
}

const filteredRows = useMemo(() => {
if (activeFilter === "all") return rows;
if (activeFilter === "unread") return rows.filter((item) => !item.is_read);
return rows.filter((item) => (item.message_type || "").toLowerCase() === activeFilter);
}, [rows, activeFilter]);

const unreadCount = useMemo(() => rows.filter((item) => !item.is_read).length, [rows]);

if (loading) {
return (
<main style={styles.page}>
<div style={styles.centerWrap}>Loading messages...</div>
</main>
);
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<div>
<p style={styles.kicker}>HireMinds Inbox</p>
<h1 style={styles.title}>Messages</h1>
<p style={styles.subtitle}>
View messages, tasks, nudges, and reminders sent through HireMinds.
</p>
<p style={styles.subtleLine}>Signed in as: {userEmail || userId || "—"}</p>
</div>

<div style={styles.heroStats}>
<div style={styles.statCard}>
<p style={styles.statLabel}>Total Messages</p>
<p style={styles.statValue}>{rows.length}</p>
</div>

<div style={styles.statCard}>
<p style={styles.statLabel}>Unread</p>
<p style={styles.statValue}>{unreadCount}</p>
</div>
</div>
</section>

{message ? <div style={styles.notice}>{message}</div> : null}

<section style={styles.card}>
<div style={styles.filterRow}>
{[
{ key: "all", label: "All" },
{ key: "unread", label: "Unread" },
{ key: "message", label: "Messages" },
{ key: "task", label: "Tasks" },
{ key: "nudge", label: "Nudges" },
{ key: "reminder", label: "Reminders" },
].map((item) => (
<button
key={item.key}
type="button"
onClick={() => setActiveFilter(item.key as typeof activeFilter)}
style={{
...styles.filterButton,
...(activeFilter === item.key ? styles.filterButtonActive : {}),
}}
>
{item.label}
</button>
))}
</div>
</section>

<section style={styles.card}>
{filteredRows.length === 0 ? (
<div style={styles.emptyWrap}>
<p style={styles.emptyTitle}>No messages yet</p>
<p style={styles.emptyText}>
When a partner sends a message, task, nudge, or reminder, it will appear here.
</p>
</div>
) : (
<div style={styles.messageList}>
{filteredRows.map((row) => {
const type = (row.message_type || "message").toLowerCase();
const unread = !row.is_read;

return (
<article
key={row.id || `${row.subject}-${row.created_at}`}
style={{
...styles.messageCard,
...(unread ? styles.messageCardUnread : {}),
}}
>
<div style={styles.messageTop}>
<div style={styles.messageTopLeft}>
<div style={styles.badgeRow}>
<span style={styles.typeBadge}>{type}</span>
{unread ? <span style={styles.unreadBadge}>Unread</span> : null}
</div>

<h2 style={styles.messageSubject}>{row.subject || "No subject"}</h2>

<p style={styles.messageMeta}>
From: {row.sender_name || row.sender_role || "HireMinds"} • {formatDate(row.created_at)}
</p>
</div>

{unread ? (
<button
type="button"
onClick={() => markAsRead(row.id)}
style={styles.readButton}
>
Mark Read
</button>
) : null}
</div>

<p style={styles.messageBody}>{row.body || "No message content."}</p>

{row.related_tool ? (
<p style={styles.relatedTool}>Related Tool: {row.related_tool}</p>
) : null}
</article>
);
})}
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
maxWidth: "1100px",
margin: "0 auto",
display: "grid",
gap: "24px",
},
heroCard: {
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
heroStats: {
display: "flex",
gap: "14px",
flexWrap: "wrap",
},
statCard: {
minWidth: "150px",
borderRadius: "18px",
padding: "16px",
border: "1px solid #2c2c2c",
background: "#101010",
},
statLabel: {
margin: "0 0 8px",
color: "#a1a1aa",
fontSize: "13px",
},
statValue: {
margin: 0,
color: "#ffffff",
fontSize: "28px",
fontWeight: 700,
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
filterRow: {
display: "flex",
gap: "10px",
flexWrap: "wrap",
},
filterButton: {
padding: "10px 14px",
borderRadius: "999px",
border: "1px solid rgba(255,255,255,0.12)",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
cursor: "pointer",
},
filterButtonActive: {
background: "#f5f5f5",
color: "#111111",
},
emptyWrap: {
padding: "24px 4px",
},
emptyTitle: {
margin: "0 0 10px",
color: "#fff",
fontSize: "22px",
fontWeight: 700,
},
emptyText: {
margin: 0,
color: "#c8c8c8",
fontSize: "15px",
lineHeight: 1.7,
},
messageList: {
display: "grid",
gap: "16px",
},
messageCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "18px",
background: "#101010",
},
messageCardUnread: {
border: "1px solid rgba(59,130,246,0.45)",
boxShadow: "0 0 0 1px rgba(59,130,246,0.12) inset",
},
messageTop: {
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: "16px",
flexWrap: "wrap",
},
messageTopLeft: {
display: "grid",
gap: "8px",
},
badgeRow: {
display: "flex",
gap: "8px",
flexWrap: "wrap",
},
typeBadge: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: "6px 10px",
borderRadius: "999px",
fontSize: "12px",
fontWeight: 700,
color: "#dbeafe",
background: "rgba(59,130,246,0.14)",
border: "1px solid rgba(59,130,246,0.26)",
textTransform: "capitalize",
},
unreadBadge: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: "6px 10px",
borderRadius: "999px",
fontSize: "12px",
fontWeight: 700,
color: "#bbf7d0",
background: "rgba(34,197,94,0.12)",
border: "1px solid rgba(34,197,94,0.22)",
},
messageSubject: {
margin: 0,
color: "#fff",
fontSize: "22px",
fontWeight: 700,
},
messageMeta: {
margin: 0,
color: "#a1a1aa",
fontSize: "13px",
},
readButton: {
padding: "10px 14px",
borderRadius: "12px",
border: "1px solid rgba(255,255,255,0.12)",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
cursor: "pointer",
},
messageBody: {
margin: "14px 0 0",
color: "#e5e7eb",
fontSize: "15px",
lineHeight: 1.8,
},
relatedTool: {
margin: "14px 0 0",
color: "#93c5fd",
fontSize: "13px",
fontWeight: 600,
},
};
