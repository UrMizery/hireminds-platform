"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../../lib/supabase";

type PeriodKey = "day" | "week" | "month" | "quarter" | "fiscal";

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

function toDate(value?: string | null) {
if (!value) return null;
const date = new Date(value);
if (Number.isNaN(date.getTime())) return null;
return date;
}

function formatDate(value?: string | null) {
if (!value) return "—";
const date = new Date(value);
if (Number.isNaN(date.getTime())) return value;
return date.toLocaleString();
}

function startOfToday() {
const now = new Date();
return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfWeek() {
const now = new Date();
const day = now.getDay();
const diff = day === 0 ? 6 : day - 1;
const start = new Date(now);
start.setDate(now.getDate() - diff);
start.setHours(0, 0, 0, 0);
return start;
}

function startOfMonth() {
const now = new Date();
return new Date(now.getFullYear(), now.getMonth(), 1);
}

function startOfQuarter() {
const now = new Date();
const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
return new Date(now.getFullYear(), quarterStartMonth, 1);
}

function startOfFiscalYear() {
const now = new Date();
const fiscalStartMonth = 6;
const year = now.getMonth() >= fiscalStartMonth ? now.getFullYear() : now.getFullYear() - 1;
return new Date(year, fiscalStartMonth, 1);
}

function getPeriodStart(period: PeriodKey) {
switch (period) {
case "day":
return startOfToday();
case "week":
return startOfWeek();
case "month":
return startOfMonth();
case "quarter":
return startOfQuarter();
case "fiscal":
return startOfFiscalYear();
default:
return startOfMonth();
}
}

function periodLabel(period: PeriodKey) {
switch (period) {
case "day":
return "Today";
case "week":
return "This Week";
case "month":
return "This Month";
case "quarter":
return "This Quarter";
case "fiscal":
return "Fiscal Year";
default:
return "This Month";
}
}

function downloadText(filename: string, text: string) {
const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
const url = window.URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.setAttribute("download", filename);
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
window.URL.revokeObjectURL(url);
}

function InfoBubble({
title,
text,
}: {
title: string;
text: string;
}) {
const [open, setOpen] = useState(false);

return (
<span style={styles.infoWrap}>
<button
type="button"
onClick={() => setOpen((prev) => !prev)}
style={styles.infoButton}
aria-label={`About ${title}`}
title={`About ${title}`}
>
i
</button>
{open ? (
<div style={styles.infoPopup}>
<p style={styles.infoTitle}>{title}</p>
<p style={styles.infoText}>{text}</p>
</div>
) : null}
</span>
);
}

export default function PartnerReportsPage() {
const [loading, setLoading] = useState(true);
const [loadingLogout, setLoadingLogout] = useState(false);
const [message, setMessage] = useState("");
const [partner, setPartner] = useState<PartnerRow | null>(null);
const [participants, setParticipants] = useState<ParticipantRow[]>([]);
const [activity, setActivity] = useState<ActivityRow[]>([]);
const [period, setPeriod] = useState<PeriodKey>("month");
const [customMode, setCustomMode] = useState(false);
const [customStartDate, setCustomStartDate] = useState("");
const [customEndDate, setCustomEndDate] = useState("");

const mountedRef = useRef(true);

useEffect(() => {
mountedRef.current = true;
return () => {
mountedRef.current = false;
};
}, []);

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
setMessage("This account does not have partner reports access.");
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

const customStart = useMemo(
() => (customStartDate ? new Date(`${customStartDate}T00:00:00`) : null),
[customStartDate]
);
const customEnd = useMemo(
() => (customEndDate ? new Date(`${customEndDate}T23:59:59`) : null),
[customEndDate]
);

const rangeStart = useMemo(() => {
if (customMode && customStart && customEnd) return customStart;
return getPeriodStart(period);
}, [customMode, customStart, customEnd, period]);

const filteredActivity = useMemo(() => {
return activity.filter((row) => {
const date = toDate(row.created_at);
if (!date) return false;

if (customMode && customStart && customEnd) {
return date >= customStart && date <= customEnd;
}

return date >= rangeStart;
});
}, [activity, customMode, customStart, customEnd, rangeStart]);

const currentMonthStart = useMemo(() => startOfMonth(), []);
const totalParticipants = uniqueParticipants.length;
const totalNewUsers = useMemo(() => {
return uniqueParticipants.filter((row) => {
const date = toDate(row.created_at);
return date ? date >= currentMonthStart : false;
}).length;
}, [uniqueParticipants, currentMonthStart]);

const eventGroups = useMemo(() => {
const counts = {
logins: 0,
pageViews: 0,
completions: 0,
generatorUses: 0,
};

filteredActivity.forEach((row) => {
const event = (row.event_type || "").toLowerCase();
const tool = (row.tool_name || "").toLowerCase();

if (event.includes("login") || event === "signed_in") counts.logins += 1;
if (event.includes("page") || event === "page_view") counts.pageViews += 1;
if (event.includes("complete")) counts.completions += 1;
if (tool) counts.generatorUses += 1;
});

return counts;
}, [filteredActivity]);

const trackedTools = useMemo(
() => [
{ key: "career_passport", label: "Career Passport" },
{ key: "career_map", label: "Career Map" },
{ key: "resume_generator", label: "Resume Generator" },
{ key: "guided_resume_generator", label: "Guided Resume Generator" },
{ key: "cover_letter_generator", label: "Cover Letter Generator" },
{ key: "house_of_letters", label: "House of Letters" },
{ key: "follow_up_generator", label: "Follow-Up Generator" },
{ key: "interview_question_generator", label: "Interview Question Generator" },
{ key: "job_description_analyzer", label: "Job Description Analyzer" },
{ key: "resume_match_analyzer", label: "Resume Match Analyzer" },
{ key: "job_log_generator", label: "Job Log Generator" },
{ key: "budget_generator", label: "Budget Generator" },
{ key: "industry_core_skills", label: "Industry Core Skills" },
{ key: "soft_skills", label: "Soft Skills" },
{ key: "professional_branding_generator", label: "Professional Branding Generator" },
{ key: "video_library", label: "Video Library" },
{ key: "resume_format_guide", label: "Resume Format Guide" },
{ key: "notes_tool", label: "Notes Tool" },
],
[]
);

const toolBreakdown = useMemo(() => {
return trackedTools
.map((tool) => ({
label: tool.label,
key: tool.key,
count: filteredActivity.filter((row) => (row.tool_name || "").toLowerCase() === tool.key).length,
}))
.sort((a, b) => b.count - a.count);
}, [trackedTools, filteredActivity]);

const topRecentActivity = useMemo(() => filteredActivity.slice(0, 25), [filteredActivity]);

const rangeLabel = useMemo(() => {
if (customMode && customStartDate && customEndDate) {
return `${customStartDate} to ${customEndDate}`;
}
return periodLabel(period);
}, [customMode, customStartDate, customEndDate, period]);

function buildReportText() {
const topTools = toolBreakdown
.filter((item) => item.count > 0)
.slice(0, 8)
.map((item) => `${item.label}: ${item.count}`)
.join("\n");

const recentLines = topRecentActivity
.slice(0, 20)
.map(
(row) =>
`${formatDate(row.created_at)} | ${row.full_name || row.email || "—"} | ${row.tool_name || "—"} | ${row.event_type || "—"} | ${row.page_name || "—"}`
)
.join("\n");

return `
PARTNER REPORT SNAPSHOT

Organization: ${partner?.organization_name || "—"}
Contact Name: ${partner?.contact_name || "—"}
Contact Title: ${partner?.contact_title || "—"}
Contact Email: ${partner?.contact_email || "—"}
Referral Code: ${partner?.referral_code || "—"}
Reporting Window: ${rangeLabel}

CORE METRICS
Total Participants: ${totalParticipants}
New Users This Month: ${totalNewUsers}
Tracked Activity in Window: ${filteredActivity.length}
Login Events: ${eventGroups.logins}
Page Views: ${eventGroups.pageViews}
Tool Uses: ${eventGroups.generatorUses}
Completed Actions: ${eventGroups.completions}

TOP TOOLS
${topTools || "No tracked tool activity in this window."}

RECENT ACTIVITY
${recentLines || "No recent activity in this window."}
`.trim();
}

function exportReport() {
downloadText(`partner-report-${partner?.referral_code || "report"}.txt`, buildReportText());
}

function printReport() {
const printWindow = window.open("", "_blank", "width=1100,height=1400");
if (!printWindow) {
alert("Pop-up blocked. Please allow pop-ups and try again.");
return;
}

const toolRows = toolBreakdown
.filter((item) => item.count > 0)
.map(
(item) => `
<tr>
<td>${item.label}</td>
<td>${item.count}</td>
</tr>`
)
.join("");

const activityRows = topRecentActivity
.slice(0, 30)
.map(
(row) => `
<tr>
<td>${formatDate(row.created_at)}</td>
<td>${row.full_name || "—"}</td>
<td>${row.email || "—"}</td>
<td>${row.tool_name || "—"}</td>
<td>${row.event_type || "—"}</td>
<td>${row.page_name || "—"}</td>
</tr>`
)
.join("");

const html = `
<!doctype html>
<html>
<head>
<title>Partner Reports</title>
<style>
body { font-family: Arial, sans-serif; padding: 32px; color: #111827; line-height: 1.6; }
h1 { margin: 0 0 8px; font-size: 30px; }
h2 { margin: 24px 0 8px; font-size: 18px; }
p { margin: 0 0 8px; }
.grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; margin-top: 16px; }
.card { border: 1px solid #d1d5db; border-radius: 14px; padding: 14px; }
table { width: 100%; border-collapse: collapse; margin-top: 14px; }
th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
th { background: #f3f4f6; }
</style>
</head>
<body>
<h1>${partner?.organization_name || "Partner"} Reports</h1>
<p><strong>Referral Code:</strong> ${partner?.referral_code || "—"}</p>
<p><strong>Reporting Window:</strong> ${rangeLabel}</p>

<div class="grid">
<div class="card"><strong>Total Participants</strong><br/>${totalParticipants}</div>
<div class="card"><strong>New Users This Month</strong><br/>${totalNewUsers}</div>
<div class="card"><strong>Tracked Activity</strong><br/>${filteredActivity.length}</div>
<div class="card"><strong>Login Events</strong><br/>${eventGroups.logins}</div>
<div class="card"><strong>Page Views</strong><br/>${eventGroups.pageViews}</div>
<div class="card"><strong>Completed Actions</strong><br/>${eventGroups.completions}</div>
</div>

<h2>Tool Breakdown</h2>
<table>
<thead>
<tr><th>Tool</th><th>Count</th></tr>
</thead>
<tbody>
${toolRows || `<tr><td colspan="2">No tool activity found.</td></tr>`}
</tbody>
</table>

<h2>Recent Activity</h2>
<table>
<thead>
<tr>
<th>Date</th>
<th>Participant</th>
<th>Email</th>
<th>Tool</th>
<th>Event</th>
<th>Page</th>
</tr>
</thead>
<tbody>
${activityRows || `<tr><td colspan="6">No activity found.</td></tr>`}
</tbody>
</table>
</body>
</html>
`;

printWindow.document.open();
printWindow.document.write(html);
printWindow.document.close();
printWindow.focus();
printWindow.print();
}

if (loading) {
return (
<main style={styles.page}>
<div style={styles.centerWrap}>Loading reports...</div>
</main>
);
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.headerCard}>
<div>
<p style={styles.kicker}>Partner Reports</p>
<h1 style={styles.title}>Reports</h1>
<p style={styles.subtitle}>
Organization: <strong>{partner?.organization_name || "—"}</strong>
</p>
<p style={styles.subtleLine}>Referral Code: {partner?.referral_code || "—"}</p>
<p style={styles.subtleLine}>Contact: {partner?.contact_name || "—"}</p>
</div>

<div style={styles.headerActions}>
<select
value={period}
onChange={(e) => setPeriod(e.target.value as PeriodKey)}
style={styles.select}
disabled={customMode}
>
<option value="day">Per Day</option>
<option value="week">Per Week</option>
<option value="month">Per Month</option>
<option value="quarter">Per Quarter</option>
<option value="fiscal">Fiscal Year</option>
</select>

<button
type="button"
onClick={() => setCustomMode((prev) => !prev)}
style={styles.secondaryButton}
>
{customMode ? "Use Standard Reporting Period" : "Use Custom Date Range"}
</button>

<button type="button" onClick={loadPage} style={styles.secondaryButton}>
Refresh
</button>

<button type="button" onClick={exportReport} style={styles.secondaryButton}>
Save Report
</button>

<button type="button" onClick={printReport} style={styles.secondaryButton}>
Print Report
</button>

<a href="/partner-dashboard/report-summary" style={styles.secondaryButtonLink}>
Summary Generator
</a>

<button
type="button"
onClick={async () => {
setLoadingLogout(true);
await supabase.auth.signOut();
window.location.href = "/employer-partner-login";
}}
style={styles.logoutButton}
disabled={loadingLogout}
>
{loadingLogout ? "Logging Off..." : "Log Off"}
</button>
</div>
</section>

{message ? <div style={styles.notice}>{message}</div> : null}

{customMode ? (
<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>Custom Window</p>
<InfoBubble
title="Custom Reporting Window"
text="Use a fixed start and end date when you need a report outside the standard daily, weekly, monthly, quarterly, or fiscal periods."
/>
</div>
<h2 style={styles.sectionTitle}>Custom date range</h2>
</div>
</div>

<div style={styles.grid2}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Start Date</label>
<input
type="date"
value={customStartDate}
onChange={(e) => setCustomStartDate(e.target.value)}
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>End Date</label>
<input
type="date"
value={customEndDate}
onChange={(e) => setCustomEndDate(e.target.value)}
style={styles.input}
/>
</div>
</div>
</section>
) : null}

<section style={styles.metricsGrid}>
<div style={styles.metricCardBlue}>
<p style={styles.metricLabel}>Total Participants</p>
<p style={styles.metricValue}>{totalParticipants}</p>
</div>

<div style={styles.metricCardGreen}>
<p style={styles.metricLabel}>New Users</p>
<p style={styles.metricValue}>{totalNewUsers}</p>
</div>

<div style={styles.metricCardPurple}>
<p style={styles.metricLabel}>Tracked Activity</p>
<p style={styles.metricValue}>{filteredActivity.length}</p>
</div>

<div style={styles.metricCardNeutral}>
<p style={styles.metricLabel}>Completions</p>
<p style={styles.metricValue}>{eventGroups.completions}</p>
</div>

<div style={styles.metricCardGreen}>
<p style={styles.metricLabel}>Login Events</p>
<p style={styles.metricValue}>{eventGroups.logins}</p>
</div>

<div style={styles.metricCardAmber}>
<p style={styles.metricLabel}>Page Views</p>
<p style={styles.metricValue}>{eventGroups.pageViews}</p>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>Tool Breakdown</p>
<InfoBubble
title="Tool Breakdown"
text="This shows tracked use across core HireMinds tools for the selected reporting window."
/>
</div>
<h2 style={styles.sectionTitle}>Tracked tools by use</h2>
</div>
</div>

{toolBreakdown.filter((item) => item.count > 0).length === 0 ? (
<p style={styles.emptyText}>No tracked tool activity was recorded for this reporting window.</p>
) : (
<div style={styles.toolGrid}>
{toolBreakdown
.filter((item) => item.count > 0)
.map((item) => (
<div key={item.key} style={styles.toolCard}>
<p style={styles.toolLabel}>{item.label}</p>
<p style={styles.toolValue}>{item.count}</p>
</div>
))}
</div>
)}
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>Recent Activity</p>
<InfoBubble
title="Recent Activity"
text="This table shows the most recent activity records inside the selected reporting window."
/>
</div>
<h2 style={styles.sectionTitle}>Recent report activity</h2>
</div>
</div>

<div style={styles.tableWrap}>
<table style={styles.table}>
<thead>
<tr>
<th style={styles.th}>Date</th>
<th style={styles.th}>Participant</th>
<th style={styles.th}>Email</th>
<th style={styles.th}>Tool</th>
<th style={styles.th}>Event</th>
<th style={styles.th}>Page</th>
</tr>
</thead>
<tbody>
{topRecentActivity.length ? (
topRecentActivity.map((row, index) => {
const key = row.id || `${row.user_id || row.email || "activity"}-${index}`;
return (
<tr key={key}>
<td style={styles.td}>{formatDate(row.created_at)}</td>
<td style={styles.td}>{row.full_name || "—"}</td>
<td style={styles.td}>{row.email || "—"}</td>
<td style={styles.td}>{row.tool_name || "—"}</td>
<td style={styles.td}>{row.event_type || "—"}</td>
<td style={styles.td}>{row.page_name || "—"}</td>
</tr>
);
})
) : (
<tr>
<td style={styles.td} colSpan={6}>
No activity found for the selected reporting window.
</td>
</tr>
)}
</tbody>
</table>
</div>
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
select: {
padding: "12px 14px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "14px",
},
secondaryButton: {
padding: "12px 16px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.12)",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
cursor: "pointer",
textDecoration: "none",
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
},
secondaryButtonLink: {
padding: "12px 16px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.12)",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
cursor: "pointer",
textDecoration: "none",
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
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
grid2: {
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
metricsGrid: {
display: "grid",
gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
gap: "16px",
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
metricCardAmber: {
...baseMetricCard,
background: "linear-gradient(180deg, rgba(217,119,6,0.22) 0%, rgba(20,20,24,1) 100%)",
},
metricCardNeutral: {
...baseMetricCard,
background: "linear-gradient(180deg, rgba(115,115,115,0.22) 0%, rgba(20,20,24,1) 100%)",
},
metricLabel: {
margin: "0 0 10px",
color: "#d4d4d8",
fontSize: "13px",
},
metricValue: {
margin: 0,
color: "#ffffff",
fontSize: "34px",
fontWeight: 700,
lineHeight: 1,
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
color: "#ffffff",
fontSize: "28px",
fontWeight: 700,
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
