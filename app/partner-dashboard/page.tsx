"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

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
referral_code?: string | null;
resume_url?: string | null;
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

function formatDate(value?: string | null) {
if (!value) return "—";
const date = new Date(value);
if (Number.isNaN(date.getTime())) return value;
return date.toLocaleString();
}

function toDate(value?: string | null) {
if (!value) return null;
const date = new Date(value);
if (Number.isNaN(date.getTime())) return null;
return date;
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
const fiscalStartMonth = 6; // July 1
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

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
if (!rows || rows.length === 0) {
alert("No data available to export yet.");
return;
}

const headers = Object.keys(rows[0]);

const escapeCell = (value: unknown) => {
const text = String(value ?? "");
return `"${text.replace(/"/g, '""')}"`;
};

const csv = [
headers.join(","),
...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(",")),
].join("\n");

const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
const url = URL.createObjectURL(blob);

const link = document.createElement("a");
link.href = url;
link.download = filename;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);

URL.revokeObjectURL(url);
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

export default function PartnerDashboardPage() {
const [loading, setLoading] = useState(true);
const [loadingLogout, setLoadingLogout] = useState(false);
const [message, setMessage] = useState("");

const [partner, setPartner] = useState<PartnerRow | null>(null);
const [participants, setParticipants] = useState<ParticipantRow[]>([]);
const [activity, setActivity] = useState<ActivityRow[]>([]);
const [period, setPeriod] = useState<PeriodKey>("month");

const [workshopNotes, setWorkshopNotes] = useState("");
const [jobFairNotes, setJobFairNotes] = useState("");
const [meetingNotes, setMeetingNotes] = useState("");
const [outsideReferralNotes, setOutsideReferralNotes] = useState("");
const [hireMindsReferralNotes, setHireMindsReferralNotes] = useState("");
const [interviewNotes, setInterviewNotes] = useState("");
const [jobPlacementNotes, setJobPlacementNotes] = useState("");
const [additionalNotes, setAdditionalNotes] = useState("");

const mountedRef = useRef(true);

const notesStorageKey = useMemo(() => {
const code = partner?.referral_code || "partner";
return `hireminds-partner-notes-${code}-${period}`;
}, [partner?.referral_code, period]);

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
setWorkshopNotes(parsed.workshopNotes || "");
setJobFairNotes(parsed.jobFairNotes || "");
setMeetingNotes(parsed.meetingNotes || "");
setOutsideReferralNotes(parsed.outsideReferralNotes || "");
setHireMindsReferralNotes(parsed.hireMindsReferralNotes || "");
setInterviewNotes(parsed.interviewNotes || "");
setJobPlacementNotes(parsed.jobPlacementNotes || "");
setAdditionalNotes(parsed.additionalNotes || "");
} else {
setWorkshopNotes("");
setJobFairNotes("");
setMeetingNotes("");
setOutsideReferralNotes("");
setHireMindsReferralNotes("");
setInterviewNotes("");
setJobPlacementNotes("");
setAdditionalNotes("");
}
} catch {
setWorkshopNotes("");
setJobFairNotes("");
setMeetingNotes("");
setOutsideReferralNotes("");
setHireMindsReferralNotes("");
setInterviewNotes("");
setJobPlacementNotes("");
setAdditionalNotes("");
}
}, [notesStorageKey]);

function saveNotes() {
try {
window.localStorage.setItem(
notesStorageKey,
JSON.stringify({
workshopNotes,
jobFairNotes,
meetingNotes,
outsideReferralNotes,
hireMindsReferralNotes,
interviewNotes,
jobPlacementNotes,
additionalNotes,
})
);
setMessage("Partner reporting notes saved in this browser.");
} catch {
setMessage("Unable to save notes in this browser.");
}
}

async function loadDashboard(options?: { silent?: boolean }) {
const silent = options?.silent ?? false;

if (!silent) {
setLoading(true);
setMessage("");
}

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
if (!silent) setLoading(false);
}
return;
}

if (!partnerRow || partnerRow.account_type !== "partner" || !partnerRow.referral_code) {
if (mountedRef.current) {
setMessage("This account does not have partner dashboard access.");
if (!silent) setLoading(false);
}
return;
}

const { data: participantRows, error: participantError } = await supabase
.from("candidate_profiles")
.select("id, user_id, full_name, email, phone, referral_code, resume_url, created_at")
.eq("referral_code", partnerRow.referral_code)
.order("created_at", { ascending: false });

if (participantError) {
if (mountedRef.current) {
setMessage(participantError.message);
if (!silent) setLoading(false);
}
return;
}

const { data: activityRows, error: activityError } = await supabase
.from("user_activity")
.select("id, user_id, full_name, email, referral_code, event_type, tool_name, page_name, created_at")
.eq("referral_code", partnerRow.referral_code)
.order("created_at", { ascending: false })
.limit(1000);

if (activityError) {
if (mountedRef.current) {
setMessage(activityError.message);
if (!silent) setLoading(false);
}
return;
}

if (!mountedRef.current) return;

setPartner(partnerRow);
setParticipants((participantRows as ParticipantRow[]) || []);
setActivity((activityRows as ActivityRow[]) || []);
if (!silent) setLoading(false);
}

useEffect(() => {
loadDashboard();
}, []);

useEffect(() => {
const interval = setInterval(() => {
loadDashboard({ silent: true });
}, 15000);

return () => clearInterval(interval);
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

const periodStart = useMemo(() => getPeriodStart(period), [period]);

const filteredActivity = useMemo(() => {
return activity.filter((row) => {
const date = toDate(row.created_at);
return date ? date >= periodStart : false;
});
}, [activity, periodStart]);

const newUsers = useMemo(() => {
return uniqueParticipants.filter((row) => {
const date = toDate(row.created_at);
return date ? date >= periodStart : false;
});
}, [uniqueParticipants, periodStart]);

const activeUserIds = useMemo(() => {
const set = new Set<string>();
filteredActivity.forEach((row) => {
const key = row.user_id || row.email || "";
if (key) set.add(key);
});
return set;
}, [filteredActivity]);

const activeUsersCount = activeUserIds.size;
const inactiveUsersCount = Math.max(uniqueParticipants.length - activeUsersCount, 0);

const totalParticipants = uniqueParticipants.length;
const totalNewUsers = newUsers.length;
const totalActivity = filteredActivity.length;
const totalCompletions = filteredActivity.filter((row) => row.event_type === "tool_completed").length;
const totalLogins = filteredActivity.filter((row) => row.event_type === "login").length;
const totalPlatformUses = filteredActivity.length;

const resumesCompleted = filteredActivity.filter(
(row) => row.tool_name === "resume_generator" && row.event_type === "tool_completed"
).length;

const applicationsSubmitted = filteredActivity.filter(
(row) => row.event_type === "job_applied"
).length;

const employerContacts = filteredActivity.filter(
(row) => row.event_type === "employer_contacted_candidate"
).length;

const interviewsLanded = filteredActivity.filter(
(row) => row.event_type === "interview_landed"
).length;

const jobsLanded = filteredActivity.filter(
(row) => row.event_type === "job_landed"
).length;

const liveFeed = useMemo(() => filteredActivity.slice(0, 50), [filteredActivity]);

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

const usageReport = useMemo(() => {
return uniqueParticipants.map((participant) => {
const key = participant.user_id || participant.email || "";
const personActivity = filteredActivity.filter((row) => {
const rowKey = row.user_id || row.email || "";
return rowKey === key;
});

const loginCount = personActivity.filter((row) => row.event_type === "login").length;
const toolsUsed = [
...new Set(personActivity.map((row) => row.tool_name || "").filter(Boolean)),
];

return {
full_name: participant.full_name || "",
email: participant.email || "",
phone: participant.phone || "",
login_count: loginCount,
tools_used: toolsUsed.join(", "),
total_activity: personActivity.length,
last_activity: lastActivityByUser.get(key) || "",
};
});
}, [uniqueParticipants, filteredActivity, lastActivityByUser]);

const summaryText = useMemo(() => {
const notes: string[] = [];

if (workshopNotes.trim()) notes.push(`Workshops/Trainings: ${workshopNotes.trim()}`);
if (jobFairNotes.trim()) notes.push(`Job Fairs/Hiring Events: ${jobFairNotes.trim()}`);
if (meetingNotes.trim()) notes.push(`One-on-One Meetings: ${meetingNotes.trim()}`);
if (hireMindsReferralNotes.trim()) notes.push(`HireMinds Tool Referrals: ${hireMindsReferralNotes.trim()}`);
if (outsideReferralNotes.trim()) notes.push(`Outside Referrals: ${outsideReferralNotes.trim()}`);
if (interviewNotes.trim()) notes.push(`Interview Notes: ${interviewNotes.trim()}`);
if (jobPlacementNotes.trim()) notes.push(`Job Placement Notes: ${jobPlacementNotes.trim()}`);
if (additionalNotes.trim()) notes.push(`Additional Notes: ${additionalNotes.trim()}`);

return [
`${periodLabel(period)}, HireMinds supported ${totalParticipants} participant${totalParticipants === 1 ? "" : "s"} tied to referral code ${partner?.referral_code || "—"}.`,
`${totalNewUsers} new user${totalNewUsers === 1 ? "" : "s"} entered the platform during this reporting period.`,
`The platform was used ${totalPlatformUses} time${totalPlatformUses === 1 ? "" : "s"} during this period, including repeat use by the same participant on the same day.`,
`${activeUsersCount} active user${activeUsersCount === 1 ? "" : "s"} generated ${totalActivity} tracked activity event${totalActivity === 1 ? "" : "s"} and ${totalCompletions} completion${totalCompletions === 1 ? "" : "s"}.`,
`Participants completed ${resumesCompleted} resume action${resumesCompleted === 1 ? "" : "s"}, submitted ${applicationsSubmitted} application${applicationsSubmitted === 1 ? "" : "s"}, ${employerContacts} participant${employerContacts === 1 ? " was" : "s were"} marked as contacted by employers, ${interviewsLanded} interview${interviewsLanded === 1 ? "" : "s"} were recorded, and ${jobsLanded} job placement${jobsLanded === 1 ? "" : "s"} were recorded.`,
inactiveUsersCount > 0
? `${inactiveUsersCount} assigned participant${inactiveUsersCount === 1 ? "" : "s"} had no tracked activity during this period.`
: `All assigned participants showed activity during this period.`,
...notes,
].join(" ");
}, [
period,
totalParticipants,
totalNewUsers,
totalPlatformUses,
activeUsersCount,
totalActivity,
totalCompletions,
resumesCompleted,
applicationsSubmitted,
employerContacts,
interviewsLanded,
jobsLanded,
inactiveUsersCount,
partner?.referral_code,
workshopNotes,
jobFairNotes,
meetingNotes,
hireMindsReferralNotes,
outsideReferralNotes,
interviewNotes,
jobPlacementNotes,
additionalNotes,
]);

async function handleLogout() {
setLoadingLogout(true);
await supabase.auth.signOut();
window.location.href = "/employer-partner-login";
}

function exportParticipants() {
const rows = uniqueParticipants.map((row) => ({
full_name: row.full_name || "",
email: row.email || "",
phone: row.phone || "",
referral_code: row.referral_code || "",
resume_url: row.resume_url || "",
created_at: row.created_at || "",
last_activity: lastActivityByUser.get(row.user_id || row.email || "") || "",
}));

downloadCsv(`partner-participants-${period}.csv`, rows);
}

function exportActivity() {
const rows = liveFeed.map((row) => ({
created_at: row.created_at || "",
full_name: row.full_name || "",
email: row.email || "",
referral_code: row.referral_code || "",
event_type: row.event_type || "",
tool_name: row.tool_name || "",
page_name: row.page_name || "",
}));

downloadCsv(`partner-live-feed-${period}.csv`, rows);
}

function exportUsageReport() {
const rows = usageReport.map((row) => ({
full_name: row.full_name || "",
email: row.email || "",
phone: row.phone || "",
login_count: row.login_count || 0,
tools_used: row.tools_used || "",
total_activity: row.total_activity || 0,
last_activity: row.last_activity || "",
}));

downloadCsv(`partner-usage-report-${period}.csv`, rows);
}

function exportSummaryReport() {
const reportText = `
PARTNER REPORT
Organization: ${partner?.organization_name || "—"}
Contact Name: ${partner?.contact_name || "—"}
Contact Title: ${partner?.contact_title || "—"}
Contact Email: ${partner?.contact_email || "—"}
Referral Code: ${partner?.referral_code || "—"}
Reporting Period: ${periodLabel(period)}

SUMMARY
${summaryText}
`.trim();

downloadText(`partner-summary-report-${period}.txt`, reportText);
}

function printSummaryReport() {
const printWindow = window.open("", "_blank", "width=900,height=1200");
if (!printWindow) {
alert("Pop-up blocked. Please allow pop-ups and try again.");
return;
}

const html = `
<!doctype html>
<html>
<head>
<title>Partner Summary Report</title>
<style>
body {
font-family: Arial, sans-serif;
padding: 40px;
color: #111827;
line-height: 1.7;
}
h1 {
margin: 0 0 12px;
font-size: 28px;
}
p {
margin: 0 0 10px;
}
.meta {
margin-bottom: 18px;
}
.summary {
margin-top: 24px;
white-space: pre-wrap;
}
</style>
</head>
<body>
<h1>${partner?.organization_name || "Partner"} Summary Report</h1>
<div class="meta">
<p><strong>Contact Name:</strong> ${partner?.contact_name || "—"}</p>
<p><strong>Contact Title:</strong> ${partner?.contact_title || "—"}</p>
<p><strong>Contact Email:</strong> ${partner?.contact_email || "—"}</p>
<p><strong>Referral Code:</strong> ${partner?.referral_code || "—"}</p>
<p><strong>Reporting Period:</strong> ${periodLabel(period)}</p>
</div>
<div class="summary">${summaryText}</div>
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
<div style={styles.centerWrap}>Loading partner dashboard...</div>
</main>
);
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.headerCard}>
<div>
<p style={styles.kicker}>Partner Reporting</p>
<h1 style={styles.title}>
{partner?.organization_name || "Partner"} Live Reporting
</h1>
<p style={styles.subtitle}>
Account Holder: <strong>{partner?.contact_name || "—"}</strong>
</p>
<p style={styles.subtleLine}>Title: {partner?.contact_title || "—"}</p>
<p style={styles.subtleLine}>Email: {partner?.contact_email || "—"}</p>
<p style={styles.subtleLine}>Referral Code: {partner?.referral_code || "—"}</p>
</div>

<div style={styles.headerActions}>
<select
value={period}
onChange={(e) => setPeriod(e.target.value as PeriodKey)}
style={styles.select}
>
<option value="day">Per Day</option>
<option value="week">Per Week</option>
<option value="month">Per Month</option>
<option value="quarter">Per Quarter</option>
<option value="fiscal">Fiscal Year</option>
</select>

<button type="button" onClick={() => loadDashboard()} style={styles.secondaryButton}>
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
<p style={styles.sectionKicker}>Current Activity</p>
<h2 style={styles.sectionTitle}>Live reporting feed</h2>
</div>
<div style={styles.sectionActions}>
<div style={styles.usageChip}>
<span style={styles.usageChipLabel}>{periodLabel(period)} Platform Uses</span>
<span style={styles.usageChipValue}>{totalPlatformUses}</span>
</div>
<button type="button" onClick={exportActivity} style={styles.secondaryButton}>
Export CSV
</button>
</div>
</div>

{liveFeed.length === 0 ? (
<p style={styles.emptyText}>No activity found yet for this reporting period.</p>
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
{liveFeed.map((row, index) => {
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

<section style={styles.summaryGrid}>
<div style={styles.summaryCard}>
<p style={styles.summaryLabel}>Total Participants</p>
<p style={styles.summaryValue}>{totalParticipants}</p>
</div>
<div style={styles.summaryCard}>
<p style={styles.summaryLabel}>Total New Users</p>
<p style={styles.summaryValue}>{totalNewUsers}</p>
</div>
<div style={styles.summaryCard}>
<p style={styles.summaryLabel}>Total Activity</p>
<p style={styles.summaryValue}>{totalActivity}</p>
</div>
<div style={styles.summaryCard}>
<p style={styles.summaryLabel}>Total Completions</p>
<p style={styles.summaryValue}>{totalCompletions}</p>
</div>
<div style={styles.summaryCard}>
<p style={styles.summaryLabel}>Active Users</p>
<p style={styles.summaryValue}>{activeUsersCount}</p>
</div>
<div style={styles.summaryCard}>
<p style={styles.summaryLabel}>Inactive Users</p>
<p style={styles.summaryValue}>{inactiveUsersCount}</p>
</div>
<div style={styles.summaryCard}>
<p style={styles.summaryLabel}>Interviews Landed</p>
<p style={styles.summaryValue}>{interviewsLanded}</p>
</div>
<div style={styles.summaryCard}>
<p style={styles.summaryLabel}>Jobs Landed</p>
<p style={styles.summaryValue}>{jobsLanded}</p>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Participants</p>
<h2 style={styles.sectionTitle}>Assigned participants</h2>
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
<th style={styles.th}>Phone</th>
<th style={styles.th}>Referral Code</th>
<th style={styles.th}>Resume</th>
<th style={styles.th}>Last Activity</th>
</tr>
</thead>
<tbody>
{uniqueParticipants.map((row, index) => {
const rowKey = row.user_id || row.email || row.id || `participant-${index}`;
const lastActivity =
lastActivityByUser.get(row.user_id || row.email || "") || "";
return (
<tr key={rowKey}>
<td style={styles.td}>{row.full_name || "—"}</td>
<td style={styles.td}>{row.email || "—"}</td>
<td style={styles.td}>{row.phone || "—"}</td>
<td style={styles.td}>{row.referral_code || "—"}</td>
<td style={styles.td}>
{row.resume_url ? (
<div style={styles.linkStack}>
<a
href={row.resume_url}
target="_blank"
rel="noreferrer"
style={styles.tableLink}
>
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
<p style={styles.sectionKicker}>Usage Report</p>
<h2 style={styles.sectionTitle}>Participant usage report</h2>
</div>
<button type="button" onClick={exportUsageReport} style={styles.secondaryButton}>
Export CSV
</button>
</div>

{usageReport.length === 0 ? (
<p style={styles.emptyText}>No usage data available for this reporting period.</p>
) : (
<div style={styles.tableWrap}>
<table style={styles.table}>
<thead>
<tr>
<th style={styles.th}>Full Name</th>
<th style={styles.th}>Email</th>
<th style={styles.th}>Phone</th>
<th style={styles.th}>Times Logged In</th>
<th style={styles.th}>Tools Used</th>
<th style={styles.th}>Total Activity</th>
<th style={styles.th}>Last Activity</th>
</tr>
</thead>
<tbody>
{usageReport.map((row, index) => (
<tr key={`${row.email || row.full_name || "usage"}-${index}`}>
<td style={styles.td}>{row.full_name || "—"}</td>
<td style={styles.td}>{row.email || "—"}</td>
<td style={styles.td}>{row.phone || "—"}</td>
<td style={styles.td}>{row.login_count}</td>
<td style={styles.td}>{row.tools_used || "—"}</td>
<td style={styles.td}>{row.total_activity}</td>
<td style={styles.td}>{formatDate(row.last_activity)}</td>
</tr>
))}
</tbody>
</table>
</div>
)}
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Grant-Friendly Summary</p>
<h2 style={styles.sectionTitle}>Reporting summary</h2>
</div>
<div style={styles.sectionActions}>
<button type="button" onClick={exportSummaryReport} style={styles.secondaryButton}>
Save Report
</button>
<button type="button" onClick={printSummaryReport} style={styles.secondaryButton}>
Print Report
</button>
</div>
</div>

<div style={styles.summaryTextBox}>
<p style={styles.summaryParagraph}>{summaryText}</p>
</div>

<div style={styles.notesGrid}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Workshops / Trainings</label>
<textarea
value={workshopNotes}
onChange={(e) => setWorkshopNotes(e.target.value)}
placeholder="Add workshop attendance, trainings, or group sessions."
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Job Fairs / Hiring Events</label>
<textarea
value={jobFairNotes}
onChange={(e) => setJobFairNotes(e.target.value)}
placeholder="Add job fairs or hiring events attended."
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Participant Meetings</label>
<textarea
value={meetingNotes}
onChange={(e) => setMeetingNotes(e.target.value)}
placeholder="Add one-on-one meetings, check-ins, or support sessions."
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>HireMinds Tool Referrals</label>
<textarea
value={hireMindsReferralNotes}
onChange={(e) => setHireMindsReferralNotes(e.target.value)}
placeholder="Add any referrals made to HireMinds tools or platform resources."
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Outside Referrals</label>
<textarea
value={outsideReferralNotes}
onChange={(e) => setOutsideReferralNotes(e.target.value)}
placeholder="Add any outside referrals or community resource referrals."
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Interview Notes</label>
<textarea
value={interviewNotes}
onChange={(e) => setInterviewNotes(e.target.value)}
placeholder="Add interview outcomes, interview prep, or interview support notes."
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Job Placement Notes</label>
<textarea
value={jobPlacementNotes}
onChange={(e) => setJobPlacementNotes(e.target.value)}
placeholder="Add job placement outcomes or employment notes."
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Additional Partner Notes</label>
<textarea
value={additionalNotes}
onChange={(e) => setAdditionalNotes(e.target.value)}
placeholder="Add any extra narrative or outcome notes for your report."
style={styles.textarea}
/>
</div>
</div>

<div style={styles.notesActions}>
<button type="button" onClick={saveNotes} style={styles.secondaryButton}>
Save Notes
</button>
</div>
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
maxWidth: "1440px",
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
sectionActions: {
display: "flex",
gap: "12px",
flexWrap: "wrap",
alignItems: "center",
},
select: {
padding: "12px 14px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "14px",
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
usageChip: {
display: "flex",
flexDirection: "column",
justifyContent: "center",
minWidth: "190px",
padding: "12px 16px",
borderRadius: "18px",
border: "1px solid rgba(255,255,255,0.12)",
background: "#111111",
},
usageChipLabel: {
color: "#a1a1aa",
fontSize: "12px",
marginBottom: "6px",
letterSpacing: "0.06em",
textTransform: "uppercase",
},
usageChipValue: {
color: "#ffffff",
fontSize: "28px",
fontWeight: 700,
lineHeight: 1,
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
summaryTextBox: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "18px",
background: "#101010",
marginBottom: "18px",
},
summaryParagraph: {
margin: 0,
color: "#e5e7eb",
fontSize: "15px",
lineHeight: 1.9,
},
notesGrid: {
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
notesActions: {
marginTop: "16px",
},
};
