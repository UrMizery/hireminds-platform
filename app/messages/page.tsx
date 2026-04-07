"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

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

type SupportActionType = "task" | "nudge" | "reminder";

type SupportAction = {
id: string;
type: SupportActionType;
participantKey: string;
participantName: string;
participantEmail?: string;
participantPhone?: string;
title: string;
message: string;
dueDate?: string;
status: "Open" | "Completed";
createdAt: string;
};

type MessageStatus = "draft" | "sent";

type MessageRecord = {
id: string;
participantKey: string;
participantName: string;
participantEmail?: string;
participantPhone?: string;
subject: string;
body: string;
status: MessageStatus;
source: "manual" | "support_action";
sourceActionId?: string;
createdAt: string;
updatedAt: string;
sentAt?: string;
};

type MessageTab = "drafts" | "sent" | "compose";

function formatDate(value?: string | null) {
if (!value) return "—";
const date = new Date(value);
if (Number.isNaN(date.getTime())) return value;
return date.toLocaleString();
}

function buildSupportActionSubject(action: SupportAction) {
if (action.type === "task") return `Task: ${action.title}`;
if (action.type === "reminder") return `Reminder: ${action.title}`;
return `Nudge: ${action.title}`;
}

function buildSupportActionBody(action: SupportAction) {
const lines = [
`Hi ${action.participantName || "there"},`,
"",
action.type === "task"
? "You have a new task from your HireMinds partner team."
: action.type === "reminder"
? "You have a new reminder from your HireMinds partner team."
: "You have a new nudge from your HireMinds partner team.",
"",
`Title: ${action.title}`,
];

if (action.dueDate) {
lines.push(`Due Date: ${action.dueDate}`);
}

if (action.message?.trim()) {
lines.push("", action.message.trim());
}

lines.push("", "Please review this in HireMinds.", "", "— HireMinds");
return lines.join("\n");
}

export default function MessagesPage() {
const [loading, setLoading] = useState(true);
const [loadingLogout, setLoadingLogout] = useState(false);
const [message, setMessage] = useState("");
const [partner, setPartner] = useState<PartnerRow | null>(null);
const [participants, setParticipants] = useState<ParticipantRow[]>([]);
const [supportActions, setSupportActions] = useState<SupportAction[]>([]);
const [messages, setMessages] = useState<MessageRecord[]>([]);
const [activeTab, setActiveTab] = useState<MessageTab>("drafts");
const [search, setSearch] = useState("");
const [selectedMessageId, setSelectedMessageId] = useState("");

const [composeParticipantKey, setComposeParticipantKey] = useState("");
const [composeParticipantName, setComposeParticipantName] = useState("");
const [composeParticipantEmail, setComposeParticipantEmail] = useState("");
const [composeParticipantPhone, setComposeParticipantPhone] = useState("");
const [composeSubject, setComposeSubject] = useState("");
const [composeBody, setComposeBody] = useState("");

const mountedRef = useRef(true);

const supportStorageKey = useMemo(() => {
const code = partner?.referral_code || "partner";
return `hireminds-partner-support-actions-${code}`;
}, [partner?.referral_code]);

const messagesStorageKey = useMemo(() => {
const code = partner?.referral_code || "partner";
return `hireminds-partner-messages-${code}`;
}, [partner?.referral_code]);

useEffect(() => {
mountedRef.current = true;
return () => {
mountedRef.current = false;
};
}, []);

useEffect(() => {
if (!partner?.referral_code) return;

try {
const rawSupport = window.localStorage.getItem(supportStorageKey);
if (rawSupport) {
const parsed = JSON.parse(rawSupport);
setSupportActions(Array.isArray(parsed) ? parsed : []);
} else {
setSupportActions([]);
}
} catch {
setSupportActions([]);
}

try {
const rawMessages = window.localStorage.getItem(messagesStorageKey);
if (rawMessages) {
const parsed = JSON.parse(rawMessages);
setMessages(Array.isArray(parsed) ? parsed : []);
} else {
setMessages([]);
}
} catch {
setMessages([]);
}
}, [partner?.referral_code, supportStorageKey, messagesStorageKey]);

function persistMessages(next: MessageRecord[]) {
setMessages(next);
try {
window.localStorage.setItem(messagesStorageKey, JSON.stringify(next));
} catch {
setMessage("Unable to save messages in this browser.");
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
setMessage("This account does not have partner messages access.");
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

if (!mountedRef.current) return;

setPartner(partnerRow);
setParticipants((participantRows as ParticipantRow[]) || []);
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

const participantOptions = useMemo(() => {
return uniqueParticipants.map((row) => ({
key: row.user_id || row.email || row.phone || row.id || "",
name: row.full_name || row.email || row.phone || "Participant",
email: row.email || "",
phone: row.phone || "",
}));
}, [uniqueParticipants]);

const existingSupportDraftIds = useMemo(() => {
return new Set(
messages
.filter((item) => item.source === "support_action" && item.sourceActionId)
.map((item) => item.sourceActionId as string)
);
}, [messages]);

const availableSupportDrafts = useMemo(() => {
return supportActions.filter((item) => !existingSupportDraftIds.has(item.id));
}, [supportActions, existingSupportDraftIds]);

const filteredMessages = useMemo(() => {
const q = search.trim().toLowerCase();

return messages.filter((item) => {
const matchesTab =
activeTab === "compose"
? true
: activeTab === "drafts"
? item.status === "draft"
: item.status === "sent";

const matchesSearch =
!q ||
item.participantName.toLowerCase().includes(q) ||
(item.participantEmail || "").toLowerCase().includes(q) ||
(item.participantPhone || "").toLowerCase().includes(q) ||
item.subject.toLowerCase().includes(q) ||
item.body.toLowerCase().includes(q);

return matchesTab && matchesSearch;
});
}, [messages, search, activeTab]);

const selectedMessage = useMemo(() => {
if (!selectedMessageId) return filteredMessages[0] || null;
return (
filteredMessages.find((item) => item.id === selectedMessageId) ||
filteredMessages[0] ||
null
);
}, [filteredMessages, selectedMessageId]);

useEffect(() => {
if (activeTab === "compose") return;
if (!filteredMessages.length) {
setSelectedMessageId("");
return;
}
if (!selectedMessageId || !filteredMessages.some((item) => item.id === selectedMessageId)) {
setSelectedMessageId(filteredMessages[0].id);
}
}, [filteredMessages, selectedMessageId, activeTab]);

function createDraftFromSupportAction(action: SupportAction) {
const nextDraft: MessageRecord = {
id: `msg-${Date.now()}-${action.id}`,
participantKey: action.participantKey,
participantName: action.participantName,
participantEmail: action.participantEmail,
participantPhone: action.participantPhone,
subject: buildSupportActionSubject(action),
body: buildSupportActionBody(action),
status: "draft",
source: "support_action",
sourceActionId: action.id,
createdAt: new Date().toISOString(),
updatedAt: new Date().toISOString(),
};

const next = [nextDraft, ...messages];
persistMessages(next);
setActiveTab("drafts");
setSelectedMessageId(nextDraft.id);
setMessage("Draft created from support action.");
}

function saveManualDraft() {
if (
!composeParticipantKey ||
!composeParticipantName ||
!composeSubject.trim() ||
!composeBody.trim()
) {
setMessage("Please select a participant and enter both a subject and message body.");
return;
}

const nextDraft: MessageRecord = {
id: `msg-${Date.now()}`,
participantKey: composeParticipantKey,
participantName: composeParticipantName,
participantEmail: composeParticipantEmail,
participantPhone: composeParticipantPhone,
subject: composeSubject.trim(),
body: composeBody.trim(),
status: "draft",
source: "manual",
createdAt: new Date().toISOString(),
updatedAt: new Date().toISOString(),
};

const next = [nextDraft, ...messages];
persistMessages(next);

setComposeParticipantKey("");
setComposeParticipantName("");
setComposeParticipantEmail("");
setComposeParticipantPhone("");
setComposeSubject("");
setComposeBody("");
setActiveTab("drafts");
setSelectedMessageId(nextDraft.id);
setMessage("Draft saved.");
}

function updateDraft(id: string, subject: string, body: string) {
const next = messages.map((item) =>
item.id === id
? {
...item,
subject,
body,
updatedAt: new Date().toISOString(),
}
: item
);
persistMessages(next);
setMessage("Draft updated.");
}

async function sendMessageEmail(messageRecord: MessageRecord) {
const response = await fetch("/api/send-partner-message", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
to: messageRecord.participantEmail,
participantName: messageRecord.participantName,
subject: messageRecord.subject,
body: messageRecord.body,
partnerOrganization: partner?.organization_name || "HireMinds Partner",
partnerEmail: partner?.contact_email || "",
}),
});

const result = await response.json();

if (!response.ok) {
throw new Error(result?.error || "Unable to send email.");
}

return result;
}

async function sendDraft(id: string) {
const messageToSend = messages.find((item) => item.id === id);

if (!messageToSend) {
setMessage("Message not found.");
return;
}

if (!messageToSend.participantEmail) {
setMessage("This participant does not have an email address on file.");
return;
}

try {
setMessage("Sending message...");

await sendMessageEmail(messageToSend);

const next = messages.map((item) =>
item.id === id
? {
...item,
status: "sent" as MessageStatus,
sentAt: new Date().toISOString(),
updatedAt: new Date().toISOString(),
}
: item
);

persistMessages(next);
setActiveTab("sent");
setSelectedMessageId(id);
setMessage("Message sent to candidate email.");
} catch (error) {
const errorMessage =
error instanceof Error ? error.message : "Unable to send message.";
setMessage(errorMessage);
}
}

function deleteMessage(id: string) {
const next = messages.filter((item) => item.id !== id);
persistMessages(next);
if (selectedMessageId === id) {
setSelectedMessageId("");
}
setMessage("Message deleted.");
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
<div style={styles.centerWrap}>Loading messages...</div>
</main>
);
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.headerCard}>
<div>
<p style={styles.kicker}>Partner Messages</p>
<h1 style={styles.title}>Messages</h1>
<p style={styles.subtitle}>
Organization: <strong>{partner?.organization_name || "—"}</strong>
</p>
<p style={styles.subtleLine}>Referral Code: {partner?.referral_code || "—"}</p>
<p style={styles.subtleLine}>Drafts created from support actions appear here.</p>
</div>

<div style={styles.headerActions}>
<button
type="button"
onClick={() => setActiveTab("drafts")}
style={{
...styles.tabButton,
...(activeTab === "drafts" ? styles.tabButtonActive : {}),
}}
>
Drafts
</button>

<button
type="button"
onClick={() => setActiveTab("sent")}
style={{
...styles.tabButton,
...(activeTab === "sent" ? styles.tabButtonActive : {}),
}}
>
Sent
</button>

<button
type="button"
onClick={() => setActiveTab("compose")}
style={{
...styles.tabButton,
...(activeTab === "compose" ? styles.tabButtonActive : {}),
}}
>
Compose
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
<p style={styles.sectionKicker}>Support Action Drafts</p>
<h2 style={styles.sectionTitle}>Create drafts from saved support actions</h2>
</div>
</div>

{availableSupportDrafts.length === 0 ? (
<p style={styles.emptyText}>No undrafted support actions found right now.</p>
) : (
<div style={styles.supportActionList}>
{availableSupportDrafts.map((action) => (
<div key={action.id} style={styles.supportActionCard}>
<div>
<p style={styles.supportType}>{action.type.toUpperCase()}</p>
<h3 style={styles.supportTitle}>{action.title}</h3>
<p style={styles.supportMeta}>
{action.participantName}
{action.participantEmail ? ` • ${action.participantEmail}` : ""}
{action.participantPhone ? ` • ${action.participantPhone}` : ""}
{action.dueDate ? ` • Due ${action.dueDate}` : ""}
</p>
{action.message ? (
<p style={styles.supportBody}>{action.message}</p>
) : null}
</div>

<button
type="button"
onClick={() => createDraftFromSupportAction(action)}
style={styles.secondaryButton}
>
Create Draft
</button>
</div>
))}
</div>
)}
</section>

{activeTab === "compose" ? (
<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Compose</p>
<h2 style={styles.sectionTitle}>Create a new message draft</h2>
</div>
</div>

<div style={styles.composeGrid}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Participant</label>
<select
value={composeParticipantKey}
onChange={(e) => {
const key = e.target.value;
const match = participantOptions.find((item) => item.key === key);
setComposeParticipantKey(key);
setComposeParticipantName(match?.name || "");
setComposeParticipantEmail(match?.email || "");
setComposeParticipantPhone(match?.phone || "");
}}
style={styles.select}
>
<option value="">Select participant</option>
{participantOptions.map((item) => (
<option key={item.key} value={item.key}>
{item.name}
</option>
))}
</select>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Subject</label>
<input
value={composeSubject}
onChange={(e) => setComposeSubject(e.target.value)}
style={styles.input}
placeholder="Enter subject"
/>
</div>

<div style={{ ...styles.fieldWrap, gridColumn: "1 / -1" }}>
<label style={styles.label}>Message</label>
<textarea
value={composeBody}
onChange={(e) => setComposeBody(e.target.value)}
style={styles.textarea}
placeholder="Write your message"
/>
</div>
</div>

<div style={styles.notesActions}>
<button type="button" onClick={saveManualDraft} style={styles.secondaryButton}>
Save Draft
</button>
</div>
</section>
) : (
<section style={styles.messageLayout}>
<div style={styles.sidebarCard}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Search Messages</label>
<input
value={search}
onChange={(e) => setSearch(e.target.value)}
style={styles.input}
placeholder="Search by person, email, subject, or content"
/>
</div>

<div style={styles.messageList}>
{filteredMessages.length === 0 ? (
<p style={styles.emptyText}>No messages found for this view.</p>
) : (
filteredMessages.map((item) => (
<button
key={item.id}
type="button"
onClick={() => setSelectedMessageId(item.id)}
style={{
...styles.messageListCard,
...(selectedMessage?.id === item.id ? styles.messageListCardActive : {}),
}}
>
<p style={styles.messageListStatus}>{item.status.toUpperCase()}</p>
<h3 style={styles.messageListTitle}>{item.subject}</h3>
<p style={styles.messageListMeta}>{item.participantName}</p>
<p style={styles.messageListMeta}>{formatDate(item.updatedAt)}</p>
</button>
))
)}
</div>
</div>

<div style={styles.previewCard}>
{selectedMessage ? (
<MessageEditor
key={selectedMessage.id}
message={selectedMessage}
onSave={updateDraft}
onSend={sendDraft}
onDelete={deleteMessage}
/>
) : (
<p style={styles.emptyText}>Select a message to view it.</p>
)}
</div>
</section>
)}
</div>
</main>
);
}

function MessageEditor({
message,
onSave,
onSend,
onDelete,
}: {
message: MessageRecord;
onSave: (id: string, subject: string, body: string) => void;
onSend: (id: string) => void;
onDelete: (id: string) => void;
}) {
const [subject, setSubject] = useState(message.subject);
const [body, setBody] = useState(message.body);

useEffect(() => {
setSubject(message.subject);
setBody(message.body);
}, [message.id, message.subject, message.body]);

return (
<div style={styles.previewInner}>
<div style={styles.previewTop}>
<div>
<p style={styles.previewType}>
{message.source === "support_action" ? "FROM SUPPORT ACTION" : "MANUAL DRAFT"}
</p>
<h2 style={styles.previewTitle}>{message.participantName}</h2>
<p style={styles.previewMeta}>
{message.participantEmail || "—"}
{message.participantPhone ? ` • ${message.participantPhone}` : ""}
</p>
<p style={styles.previewMeta}>
Created {formatDate(message.createdAt)}
{message.sentAt ? ` • Sent ${formatDate(message.sentAt)}` : ""}
</p>
</div>

<div style={styles.previewActions}>
{message.status === "draft" ? (
<>
<button
type="button"
onClick={() => onSave(message.id, subject.trim(), body.trim())}
style={styles.secondaryButton}
>
Save Changes
</button>
<button
type="button"
onClick={() => onSend(message.id)}
style={styles.secondaryButton}
>
Send
</button>
</>
) : null}

<button
type="button"
onClick={() => onDelete(message.id)}
style={styles.secondaryButton}
>
Delete
</button>
</div>
</div>

<div style={styles.composeGrid}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Subject</label>
<input
value={subject}
onChange={(e) => setSubject(e.target.value)}
style={styles.input}
disabled={message.status === "sent"}
/>
</div>

<div style={{ ...styles.fieldWrap, gridColumn: "1 / -1" }}>
<label style={styles.label}>Message</label>
<textarea
value={body}
onChange={(e) => setBody(e.target.value)}
style={styles.textareaLarge}
disabled={message.status === "sent"}
/>
</div>
</div>
</div>
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
tabButton: {
padding: "12px 16px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.12)",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
cursor: "pointer",
},
tabButtonActive: {
background: "#f5f5f5",
color: "#111111",
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
supportActionList: {
display: "grid",
gap: "14px",
},
supportActionCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "16px",
background: "#101010",
display: "flex",
justifyContent: "space-between",
gap: "16px",
alignItems: "flex-start",
flexWrap: "wrap",
},
supportType: {
margin: "0 0 6px",
color: "#93c5fd",
fontSize: "11px",
letterSpacing: "0.14em",
textTransform: "uppercase",
},
supportTitle: {
margin: "0 0 8px",
color: "#f5f5f5",
fontSize: "18px",
fontWeight: 700,
},
supportMeta: {
margin: 0,
color: "#a1a1aa",
fontSize: "13px",
},
supportBody: {
margin: "12px 0 0",
color: "#e5e7eb",
fontSize: "14px",
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
composeGrid: {
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
select: {
padding: "12px 14px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "14px",
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
minHeight: "140px",
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
textareaLarge: {
width: "100%",
minHeight: "260px",
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
notesActions: {
marginTop: "16px",
},
messageLayout: {
display: "grid",
gridTemplateColumns: "360px 1fr",
gap: "24px",
},
sidebarCard: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px",
display: "grid",
gap: "18px",
alignSelf: "start",
},
messageList: {
display: "grid",
gap: "12px",
maxHeight: "720px",
overflow: "auto",
},
messageListCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "14px",
background: "#101010",
textAlign: "left",
cursor: "pointer",
},
messageListCardActive: {
border: "1px solid rgba(147,197,253,0.45)",
background: "rgba(59,130,246,0.09)",
},
messageListStatus: {
margin: "0 0 6px",
color: "#93c5fd",
fontSize: "11px",
letterSpacing: "0.14em",
textTransform: "uppercase",
},
messageListTitle: {
margin: "0 0 8px",
color: "#f5f5f5",
fontSize: "16px",
fontWeight: 700,
lineHeight: 1.4,
},
messageListMeta: {
margin: "4px 0 0",
color: "#a1a1aa",
fontSize: "13px",
lineHeight: 1.5,
},
previewCard: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px",
minHeight: "400px",
},
previewInner: {
display: "grid",
gap: "18px",
},
previewTop: {
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: "16px",
flexWrap: "wrap",
},
previewType: {
margin: "0 0 6px",
color: "#93c5fd",
fontSize: "11px",
letterSpacing: "0.14em",
textTransform: "uppercase",
},
previewTitle: {
margin: "0 0 8px",
color: "#f5f5f5",
fontSize: "26px",
fontWeight: 700,
},
previewMeta: {
margin: "4px 0 0",
color: "#a1a1aa",
fontSize: "14px",
lineHeight: 1.6,
},
previewActions: {
display: "flex",
gap: "10px",
flexWrap: "wrap",
},
emptyText: {
margin: 0,
color: "#c8c8c8",
fontSize: "15px",
lineHeight: 1.7,
},
};
