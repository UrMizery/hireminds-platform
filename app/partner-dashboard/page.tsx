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

type ParticipantRow = {
id?: string | null;
user_id?: string | null;
full_name?: string | null;
email?: string | null;
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

export default function PartnerDashboardPage() {
const [loading, setLoading] = useState(true);
const [loadingLogout, setLoadingLogout] = useState(false);
const [message, setMessage] = useState("");

const [partner, setPartner] = useState<PartnerRow | null>(null);
const [participants, setParticipants] = useState<ParticipantRow[]>([]);
const [activity, setActivity] = useState<ActivityRow[]>([]);
const [period, setPeriod] = useState<PeriodKey>("month");
const [platformUseView, setPlatformUseView] = useState<"day" | "week" | "month">("month");
const [lastUpdated, setLastUpdated] = useState<string>("");

const [workshopQ, setWorkshopQ] = useState("");
const [jobFairQ, setJobFairQ] = useState("");
const [meetingQ, setMeetingQ] = useState("");
const [hireMindsReferralQ, setHireMindsReferralQ] = useState("");
const [outsideReferralQ, setOutsideReferralQ] = useState("");
const [interviewQ, setInterviewQ] = useState("");
const [resumeSupportQ, setResumeSupportQ] = useState("");
const [analyzerSupportQ, setAnalyzerSupportQ] = useState("");
const [successStoryQ, setSuccessStoryQ] = useState("");
const [manualCandidatesServed, setManualCandidatesServed] = useState("");
const [manualNewUsers, setManualNewUsers] = useState("");
const [manualResumesCompleted, setManualResumesCompleted] = useState("");
const [manualApplicationsSubmitted, setManualApplicationsSubmitted] = useState("");
const [manualEmployerContacts, setManualEmployerContacts] = useState("");
const [manualInterviews, setManualInterviews] = useState("");
const [manualJobsLanded, setManualJobsLanded] = useState("");
const [manualHireMindsReferrals, setManualHireMindsReferrals] = useState("");
const [manualOutsideReferrals, setManualOutsideReferrals] = useState("");

const mountedRef = useRef(true);

const notesStorageKey = useMemo(() => {
const code = partner?.referral_code || "partner";
return `hireminds-partner-report-generator-${code}-${period}`;
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
setWorkshopQ(parsed.workshopQ || "");
setJobFairQ(parsed.jobFairQ || "");
setMeetingQ(parsed.meetingQ || "");
setHireMindsReferralQ(parsed.hireMindsReferralQ || "");
setOutsideReferralQ(parsed.outsideReferralQ || "");
setInterviewQ(parsed.interviewQ || "");
setResumeSupportQ(parsed.resumeSupportQ || "");
setAnalyzerSupportQ(parsed.analyzerSupportQ || "");
setSuccessStoryQ(parsed.successStoryQ || "");
setManualCandidatesServed(parsed.manualCandidatesServed || "");
setManualNewUsers(parsed.manualNewUsers || "");
setManualResumesCompleted(parsed.manualResumesCompleted || "");
setManualApplicationsSubmitted(parsed.manualApplicationsSubmitted || "");
setManualEmployerContacts(parsed.manualEmployerContacts || "");
setManualInterviews(parsed.manualInterviews || "");
setManualJobsLanded(parsed.manualJobsLanded || "");
setManualHireMindsReferrals(parsed.manualHireMindsReferrals || "");
setManualOutsideReferrals(parsed.manualOutsideReferrals || "");
} else {
setWorkshopQ("");
setJobFairQ("");
setMeetingQ("");
setHireMindsReferralQ("");
setOutsideReferralQ("");
setInterviewQ("");
setResumeSupportQ("");
setAnalyzerSupportQ("");
setSuccessStoryQ("");
setManualCandidatesServed("");
setManualNewUsers("");
setManualResumesCompleted("");
setManualApplicationsSubmitted("");
setManualEmployerContacts("");
setManualInterviews("");
setManualJobsLanded("");
setManualHireMindsReferrals("");
setManualOutsideReferrals("");
}
} catch {
setWorkshopQ("");
setJobFairQ("");
setMeetingQ("");
setHireMindsReferralQ("");
setOutsideReferralQ("");
setInterviewQ("");
setResumeSupportQ("");
setAnalyzerSupportQ("");
setSuccessStoryQ("");
setManualCandidatesServed("");
setManualNewUsers("");
setManualResumesCompleted("");
setManualApplicationsSubmitted("");
setManualEmployerContacts("");
setManualInterviews("");
setManualJobsLanded("");
setManualHireMindsReferrals("");
setManualOutsideReferrals("");
}
}, [notesStorageKey]);

function saveQuestions() {
try {
window.localStorage.setItem(
notesStorageKey,
JSON.stringify({
workshopQ,
jobFairQ,
meetingQ,
hireMindsReferralQ,
outsideReferralQ,
interviewQ,
resumeSupportQ,
analyzerSupportQ,
successStoryQ,
manualCandidatesServed,
manualNewUsers,
manualResumesCompleted,
manualApplicationsSubmitted,
manualEmployerContacts,
manualInterviews,
manualJobsLanded,
manualHireMindsReferrals,
manualOutsideReferrals,
})
);
setMessage("Report responses saved in this browser.");
} catch {
setMessage("Unable to save report responses in this browser.");
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
.select("id, user_id, full_name, email, created_at")
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
setLastUpdated(new Date().toLocaleTimeString());
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
const usePeriodStart = useMemo(() => getPeriodStart(platformUseView), [platformUseView]);

const filteredActivity = useMemo(() => {
return activity.filter((row) => {
const date = toDate(row.created_at);
return date ? date >= periodStart : false;
});
}, [activity, periodStart]);

const usesBySelectedView = useMemo(() => {
return activity.filter((row) => {
const date = toDate(row.created_at);
return date ? date >= usePeriodStart : false;
}).length;
}, [activity, usePeriodStart]);

const totalHireMindsUsesReference = activity.length;

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

const resumesCompleted = filteredActivity.filter(
(row) => row.tool_name === "resume_generator" && row.event_type === "tool_completed"
).length;

const jobDescriptionAnalyzerUses = filteredActivity.filter(
(row) => row.tool_name === "job_description_analyzer"
).length;

const resumeMatchAnalyzerUses = filteredActivity.filter(
(row) => row.tool_name === "resume_match_analyzer"
).length;

const liveFeed = useMemo(() => filteredActivity.slice(0, 50), [filteredActivity]);

const dailyTrend = useMemo(() => {
const bucket = new Map<string, number>();
filteredActivity.forEach((row) => {
const date = toDate(row.created_at);
if (!date) return;
const key = `${date.getMonth() + 1}/${date.getDate()}`;
bucket.set(key, (bucket.get(key) || 0) + 1);
});

return [...bucket.entries()]
.map(([label, count]) => ({ label, count }))
.sort((a, b) => {
const [am, ad] = a.label.split("/").map(Number);
const [bm, bd] = b.label.split("/").map(Number);
return am === bm ? ad - bd : am - bm;
})
.slice(-10);
}, [filteredActivity]);

const toolBreakdown = useMemo(() => {
const trackedTools = [
"resume_generator",
"cover_letter_generator",
"house_of_letters",
"professional_branding_generator",
"job_description_analyzer",
"resume_match_analyzer",
];

const prettyName: Record<string, string> = {
resume_generator: "Resume Generator",
cover_letter_generator: "Cover Letter Generator",
house_of_letters: "House of Letters",
professional_branding_generator: "Branding Generator",
job_description_analyzer: "Job Description Analyzer",
resume_match_analyzer: "Resume Match Analyzer",
};

return trackedTools
.map((tool) => ({
label: prettyName[tool],
count: filteredActivity.filter((row) => row.tool_name === tool).length,
}))
.filter((item) => item.count > 0);
}, [filteredActivity]);

const maxTrendCount = dailyTrend.length ? Math.max(...dailyTrend.map((d) => d.count)) : 1;
const maxToolCount = toolBreakdown.length ? Math.max(...toolBreakdown.map((d) => d.count)) : 1;

const summaryText = useMemo(() => {
const answers: string[] = [];

if (workshopQ.trim()) answers.push(`Workshops/Trainings: ${workshopQ.trim()}`);
if (jobFairQ.trim()) answers.push(`Job Fairs/Hiring Events: ${jobFairQ.trim()}`);
if (meetingQ.trim()) answers.push(`Participant Meetings: ${meetingQ.trim()}`);
if (hireMindsReferralQ.trim()) answers.push(`HireMinds Referrals: ${hireMindsReferralQ.trim()}`);
if (outsideReferralQ.trim()) answers.push(`Outside Referrals: ${outsideReferralQ.trim()}`);
if (interviewQ.trim()) answers.push(`Interview Outcomes: ${interviewQ.trim()}`);
if (resumeSupportQ.trim()) answers.push(`Resume Support Notes: ${resumeSupportQ.trim()}`);
if (analyzerSupportQ.trim()) answers.push(`Analyzer Support Notes: ${analyzerSupportQ.trim()}`);
if (successStoryQ.trim()) answers.push(`Success Stories / Additional Outcomes: ${successStoryQ.trim()}`);

const manualStats: string[] = [];
if (manualCandidatesServed.trim()) manualStats.push(`Manual Candidates Served: ${manualCandidatesServed.trim()}`);
if (manualNewUsers.trim()) manualStats.push(`Manual New Users: ${manualNewUsers.trim()}`);
if (manualResumesCompleted.trim()) manualStats.push(`Manual Resumes Completed: ${manualResumesCompleted.trim()}`);
if (manualApplicationsSubmitted.trim()) manualStats.push(`Manual Applications Submitted: ${manualApplicationsSubmitted.trim()}`);
if (manualEmployerContacts.trim()) manualStats.push(`Manual Employer Contacts: ${manualEmployerContacts.trim()}`);
if (manualInterviews.trim()) manualStats.push(`Manual Interviews: ${manualInterviews.trim()}`);
if (manualJobsLanded.trim()) manualStats.push(`Manual Jobs Landed: ${manualJobsLanded.trim()}`);
if (manualHireMindsReferrals.trim()) manualStats.push(`Manual HireMinds Referrals: ${manualHireMindsReferrals.trim()}`);
if (manualOutsideReferrals.trim()) manualStats.push(`Manual Outside Referrals: ${manualOutsideReferrals.trim()}`);

return [
`${periodLabel(period)}, HireMinds supported ${totalParticipants} participant${totalParticipants === 1 ? "" : "s"} tied to referral code ${partner?.referral_code || "—"}.`,
`${totalNewUsers} new user${totalNewUsers === 1 ? "" : "s"} entered the platform during this reporting period.`,
`${activeUsersCount} active user${activeUsersCount === 1 ? "" : "s"} generated ${totalActivity} tracked activity event${totalActivity === 1 ? "" : "s"}.`,
`Tracked completions totaled ${totalCompletions}. This counter reflects completed actions across tracked HireMinds generators and tools.`,
`Users completed ${resumesCompleted} resumes, used the Job Description Analyzer ${jobDescriptionAnalyzerUses} time${jobDescriptionAnalyzerUses === 1 ? "" : "s"}, and used the Resume Match Analyzer ${resumeMatchAnalyzerUses} time${resumeMatchAnalyzerUses === 1 ? "" : "s"}.`,
inactiveUsersCount > 0
? `${inactiveUsersCount} assigned participant${inactiveUsersCount === 1 ? "" : "s"} had no tracked activity during this reporting period.`
: `All assigned participants showed activity during this reporting period.`,
...manualStats,
...answers,
].join(" ");
}, [
period,
totalParticipants,
totalNewUsers,
activeUsersCount,
totalActivity,
totalCompletions,
resumesCompleted,
jobDescriptionAnalyzerUses,
resumeMatchAnalyzerUses,
inactiveUsersCount,
partner?.referral_code,
workshopQ,
jobFairQ,
meetingQ,
hireMindsReferralQ,
outsideReferralQ,
interviewQ,
resumeSupportQ,
analyzerSupportQ,
successStoryQ,
manualCandidatesServed,
manualNewUsers,
manualResumesCompleted,
manualApplicationsSubmitted,
manualEmployerContacts,
manualInterviews,
manualJobsLanded,
manualHireMindsReferrals,
manualOutsideReferrals,
]);

async function handleLogout() {
setLoadingLogout(true);
await supabase.auth.signOut();
window.location.href = "/employer-partner-login";
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
body { font-family: Arial, sans-serif; padding: 40px; color: #111827; line-height: 1.7; }
h1 { margin: 0 0 12px; font-size: 28px; }
p { margin: 0 0 10px; }
.meta { margin-bottom: 18px; }
.summary { margin-top: 24px; white-space: pre-wrap; }
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
<style>{`
@keyframes pulseDot {
0% { opacity: 0.35; transform: scale(0.95); }
50% { opacity: 1; transform: scale(1.08); }
100% { opacity: 0.35; transform: scale(0.95); }
}
@keyframes riseIn {
from { transform: scaleY(0.2); opacity: 0.45; }
to { transform: scaleY(1); opacity: 1; }
}
@keyframes slideGlow {
0% { background-position: 0% 50%; }
100% { background-position: 100% 50%; }
}
`}</style>

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
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>Current Activity</p>
<InfoBubble
title="Live Reporting Feed"
text="This stream shows the most recent tracked participant activity for this partner referral code. It refreshes automatically every 15 seconds."
/>
</div>
<h2 style={styles.sectionTitle}>Live reporting feed</h2>
<div style={styles.liveMetaRow}>
<span style={styles.liveBadge}>
<span style={styles.liveDot} />
Live
</span>
<span style={styles.lastUpdated}>Last updated: {lastUpdated || "—"}</span>
</div>
</div>

<div style={styles.sectionActions}>
<div style={styles.usagePanel}>
<div style={styles.usagePanelTop}>
<span style={styles.usageChipLabel}>Platform Uses</span>
<InfoBubble
title="Platform Uses"
text="Counts tracked activity events. This can include repeat uses by the same participant."
/>
</div>

<div style={styles.toggleRow}>
{(["day", "week", "month"] as const).map((key) => (
<button
key={key}
type="button"
onClick={() => setPlatformUseView(key)}
style={{
...styles.toggleButton,
...(platformUseView === key ? styles.toggleButtonActive : {}),
}}
>
{key === "day" ? "Daily" : key === "week" ? "Weekly" : "Monthly"}
</button>
))}
</div>

<div style={styles.usageValues}>
<div>
<p style={styles.usageValue}>{usesBySelectedView}</p>
<p style={styles.usageSubValue}>{periodLabel(platformUseView)}</p>
</div>
<div style={styles.referenceBox}>
<p style={styles.referenceLabel}>HireMinds Total</p>
<p style={styles.referenceValue}>{totalHireMindsUsesReference}</p>
</div>
</div>
</div>
</div>
</div>

{liveFeed.length === 0 ? (
<p style={styles.emptyText}>No activity found yet for this reporting period.</p>
) : (
<div style={styles.liveFeedWrap}>
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
<div style={styles.metricCardBlue}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Total Participants</p>
<InfoBubble
title="Total Participants"
text="Unique participants tied to this partner referral code."
/>
</div>
<p style={styles.summaryValue}>{totalParticipants}</p>
</div>

<div style={styles.metricCardGreen}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Total New Users</p>
<InfoBubble
title="Total New Users"
text="Participants whose signup date falls inside the selected reporting period."
/>
</div>
<p style={styles.summaryValue}>{totalNewUsers}</p>
</div>

<div style={styles.metricCardPurple}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Total Activity</p>
<InfoBubble
title="Total Activity"
text="All tracked events for this partner during the selected reporting period."
/>
</div>
<p style={styles.summaryValue}>{totalActivity}</p>
</div>

<div style={styles.metricCardNeutral}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Total Completions</p>
<InfoBubble
title="Total Completions"
text="Counts all tracked completed actions across HireMinds generators and tools."
/>
</div>
<p style={styles.summaryValue}>{totalCompletions}</p>
<p style={styles.metricFootnote}>
Counts all tracked completed tasks on generators and tools.
</p>
</div>

<div style={styles.metricCardGreen}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Active Users</p>
<InfoBubble
title="Active Users"
text="Assigned participants with activity during the selected reporting period."
/>
</div>
<p style={styles.summaryValue}>{activeUsersCount}</p>
</div>

<div style={styles.metricCardAmber}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Inactive Users</p>
<InfoBubble
title="Inactive Users"
text="Assigned participants with no tracked activity during the selected reporting period."
/>
</div>
<p style={styles.summaryValue}>{inactiveUsersCount}</p>
</div>

<div style={styles.metricCardBlue}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Resumes Completed</p>
<InfoBubble
title="Resumes Completed"
text="Tracked completed actions in the Resume Generator."
/>
</div>
<p style={styles.summaryValue}>{resumesCompleted}</p>
</div>

<div style={styles.metricCardPurple}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Job Description Analyzer Uses</p>
<InfoBubble
title="Job Description Analyzer Uses"
text="All tracked uses of the Job Description Analyzer during the selected reporting period."
/>
</div>
<p style={styles.summaryValue}>{jobDescriptionAnalyzerUses}</p>
</div>

<div style={styles.metricCardPurple}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Resume Match Analyzer Uses</p>
<InfoBubble
title="Resume Match Analyzer Uses"
text="All tracked uses of the Resume Match Analyzer during the selected reporting period."
/>
</div>
<p style={styles.summaryValue}>{resumeMatchAnalyzerUses}</p>
</div>
</section>

<section style={styles.graphGrid}>
<div style={styles.card}>
<div style={styles.titleRow}>
<div>
<p style={styles.sectionKicker}>Trend View</p>
<h2 style={styles.sectionTitle}>Activity over time</h2>
</div>
<InfoBubble
title="Activity Over Time"
text="Shows how many tracked events occurred across the selected reporting period."
/>
</div>

{dailyTrend.length === 0 ? (
<p style={styles.emptyText}>No trend data yet for this reporting period.</p>
) : (
<div style={styles.verticalChart}>
{dailyTrend.map((item) => (
<div key={item.label} style={styles.verticalBarCol}>
<div style={styles.verticalBarOuter}>
<div
style={{
...styles.verticalBarInnerBlue,
height: `${Math.max((item.count / maxTrendCount) * 100, 6)}%`,
}}
/>
</div>
<span style={styles.verticalBarCount}>{item.count}</span>
<span style={styles.verticalBarLabel}>{item.label}</span>
</div>
))}
</div>
)}
</div>

<div style={styles.card}>
<div style={styles.titleRow}>
<div>
<p style={styles.sectionKicker}>Tool Breakdown</p>
<h2 style={styles.sectionTitle}>Tracked tool usage</h2>
</div>
<InfoBubble
title="Tracked Tool Usage"
text="Shows the most-used HireMinds tools for this partner during the selected reporting period."
/>
</div>

{toolBreakdown.length === 0 ? (
<p style={styles.emptyText}>No tracked tool usage yet for this reporting period.</p>
) : (
<div style={styles.horizontalChart}>
{toolBreakdown.map((item, index) => {
const colors = [
styles.horizontalBarBlue,
styles.horizontalBarGreen,
styles.horizontalBarPurple,
styles.horizontalBarAmber,
styles.horizontalBarTeal,
styles.horizontalBarPink,
];
return (
<div key={item.label} style={styles.horizontalRow}>
<div style={styles.horizontalLabel}>{item.label}</div>
<div style={styles.horizontalOuter}>
<div
style={{
...colors[index % colors.length],
width: `${Math.max((item.count / maxToolCount) * 100, 8)}%`,
}}
/>
</div>
<div style={styles.horizontalCount}>{item.count}</div>
</div>
);
})}
</div>
)}
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div style={styles.titleRow}>
<div>
<p style={styles.sectionKicker}>Report Builder</p>
<h2 style={styles.sectionTitle}>Report Summary Generator</h2>
</div>
<InfoBubble
title="Report Summary Generator"
text="Use the tracked HireMinds numbers plus your own manually entered outcomes to prepare grant-ready summaries and reporting language."
/>
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

<div style={styles.manualStatsCard}>
<div style={styles.titleRow}>
<p style={styles.manualStatsTitle}>Manual Outcome Counts</p>
<InfoBubble
title="Manual Outcome Counts"
text="Enter any counts you track outside the platform here. These values will be included in the generated report summary."
/>
</div>

<div style={styles.manualStatsGrid}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Candidates Served</label>
<input
value={manualCandidatesServed}
onChange={(e) => setManualCandidatesServed(e.target.value)}
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>New Users</label>
<input
value={manualNewUsers}
onChange={(e) => setManualNewUsers(e.target.value)}
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Resumes Completed</label>
<input
value={manualResumesCompleted}
onChange={(e) => setManualResumesCompleted(e.target.value)}
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Applications Submitted</label>
<input
value={manualApplicationsSubmitted}
onChange={(e) => setManualApplicationsSubmitted(e.target.value)}
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Employer Contacts</label>
<input
value={manualEmployerContacts}
onChange={(e) => setManualEmployerContacts(e.target.value)}
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Interviews Landed</label>
<input
value={manualInterviews}
onChange={(e) => setManualInterviews(e.target.value)}
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Jobs Landed</label>
<input
value={manualJobsLanded}
onChange={(e) => setManualJobsLanded(e.target.value)}
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>HireMinds Referrals</label>
<input
value={manualHireMindsReferrals}
onChange={(e) => setManualHireMindsReferrals(e.target.value)}
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Outside Referrals</label>
<input
value={manualOutsideReferrals}
onChange={(e) => setManualOutsideReferrals(e.target.value)}
style={styles.input}
/>
</div>
</div>
</div>

<div style={styles.notesGrid}>
<div style={styles.fieldWrap}>
<label style={styles.label}>
How many workshops or trainings were held during this reporting period?
</label>
<textarea
value={workshopQ}
onChange={(e) => setWorkshopQ(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>
How many job fairs or hiring events were attended?
</label>
<textarea
value={jobFairQ}
onChange={(e) => setJobFairQ(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>
How many one-on-one meetings took place with participants?
</label>
<textarea
value={meetingQ}
onChange={(e) => setMeetingQ(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>
Were any participants referred to HireMinds tools or services?
</label>
<textarea
value={hireMindsReferralQ}
onChange={(e) => setHireMindsReferralQ(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>
Were any outside referrals made?
</label>
<textarea
value={outsideReferralQ}
onChange={(e) => setOutsideReferralQ(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>
How many participants landed interviews or received interview support?
</label>
<textarea
value={interviewQ}
onChange={(e) => setInterviewQ(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>
What resume-related support or outcomes should be included?
</label>
<textarea
value={resumeSupportQ}
onChange={(e) => setResumeSupportQ(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>
What analyzer-related support or outcomes should be included?
</label>
<textarea
value={analyzerSupportQ}
onChange={(e) => setAnalyzerSupportQ(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={{ ...styles.fieldWrap, gridColumn: "1 / -1" }}>
<label style={styles.label}>
What additional outcomes, success stories, or narrative should be included?
</label>
<textarea
value={successStoryQ}
onChange={(e) => setSuccessStoryQ(e.target.value)}
style={styles.textareaLarge}
/>
</div>
</div>

<div style={styles.notesActions}>
<button type="button" onClick={saveQuestions} style={styles.secondaryButton}>
Save Responses
</button>
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
liveMetaRow: {
display: "flex",
alignItems: "center",
gap: "12px",
marginTop: "10px",
flexWrap: "wrap",
},
liveBadge: {
display: "inline-flex",
alignItems: "center",
gap: "8px",
padding: "8px 12px",
borderRadius: "999px",
background: "rgba(34,197,94,0.12)",
color: "#bbf7d0",
border: "1px solid rgba(34,197,94,0.22)",
fontSize: "13px",
fontWeight: 700,
},
liveDot: {
width: "10px",
height: "10px",
borderRadius: "999px",
background: "#22c55e",
display: "inline-block",
animation: "pulseDot 1.8s infinite ease-in-out",
},
lastUpdated: {
color: "#a1a1aa",
fontSize: "13px",
},
usagePanel: {
minWidth: "320px",
maxWidth: "420px",
padding: "16px",
borderRadius: "20px",
border: "1px solid rgba(255,255,255,0.08)",
background: "linear-gradient(135deg, rgba(22,22,25,0.96) 0%, rgba(11,11,12,0.98) 100%)",
},
usagePanelTop: {
display: "flex",
alignItems: "center",
gap: "8px",
marginBottom: "10px",
},
usageChipLabel: {
color: "#a1a1aa",
fontSize: "12px",
letterSpacing: "0.08em",
textTransform: "uppercase",
},
toggleRow: {
display: "flex",
gap: "8px",
marginBottom: "14px",
flexWrap: "wrap",
},
toggleButton: {
padding: "8px 12px",
borderRadius: "999px",
border: "1px solid rgba(255,255,255,0.1)",
background: "#0f0f10",
color: "#d4d4d8",
fontSize: "13px",
fontWeight: 700,
cursor: "pointer",
},
toggleButtonActive: {
background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
color: "#09090b",
border: "1px solid #d1d5db",
},
usageValues: {
display: "flex",
justifyContent: "space-between",
gap: "14px",
alignItems: "stretch",
},
usageValue: {
margin: "0 0 4px",
color: "#ffffff",
fontSize: "34px",
fontWeight: 700,
lineHeight: 1,
},
usageSubValue: {
margin: 0,
color: "#a1a1aa",
fontSize: "13px",
},
referenceBox: {
minWidth: "120px",
padding: "10px 12px",
borderRadius: "16px",
background: "rgba(59,130,246,0.09)",
border: "1px solid rgba(59,130,246,0.22)",
alignSelf: "flex-start",
},
referenceLabel: {
margin: "0 0 6px",
color: "#93c5fd",
fontSize: "12px",
textTransform: "uppercase",
letterSpacing: "0.06em",
},
referenceValue: {
margin: 0,
color: "#eff6ff",
fontSize: "22px",
fontWeight: 700,
lineHeight: 1,
},
liveFeedWrap: {
maxHeight: "420px",
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
summaryGrid: {
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
metricTop: {
display: "flex",
alignItems: "center",
gap: "8px",
marginBottom: "10px",
},
summaryLabel: {
margin: 0,
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
metricFootnote: {
margin: "10px 0 0",
color: "#c4c4c7",
fontSize: "12px",
lineHeight: 1.5,
},
graphGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "24px",
},
verticalChart: {
height: "280px",
display: "grid",
gridTemplateColumns: "repeat(10, minmax(0, 1fr))",
gap: "10px",
alignItems: "end",
marginTop: "16px",
},
verticalBarCol: {
display: "flex",
flexDirection: "column",
alignItems: "center",
gap: "8px",
minWidth: 0,
},
verticalBarOuter: {
height: "200px",
width: "100%",
borderRadius: "18px",
background: "#0f0f10",
border: "1px solid #2a2a2d",
display: "flex",
alignItems: "flex-end",
overflow: "hidden",
},
verticalBarInnerBlue: {
width: "100%",
borderRadius: "16px 16px 0 0",
background:
"linear-gradient(180deg, #60a5fa 0%, #2563eb 70%, #1d4ed8 100%)",
transformOrigin: "bottom",
animation: "riseIn 700ms ease-out",
},
verticalBarCount: {
color: "#e5e7eb",
fontSize: "12px",
fontWeight: 700,
},
verticalBarLabel: {
color: "#a1a1aa",
fontSize: "12px",
textAlign: "center",
},
horizontalChart: {
display: "grid",
gap: "14px",
marginTop: "16px",
},
horizontalRow: {
display: "grid",
gridTemplateColumns: "180px 1fr 42px",
gap: "12px",
alignItems: "center",
},
horizontalLabel: {
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.4,
},
horizontalOuter: {
height: "16px",
width: "100%",
borderRadius: "999px",
background: "#0f0f10",
border: "1px solid #2a2a2d",
overflow: "hidden",
},
horizontalBarBlue: {
height: "100%",
borderRadius: "999px",
background: "linear-gradient(90deg, #60a5fa, #2563eb, #60a5fa)",
backgroundSize: "200% 200%",
animation: "slideGlow 2.8s linear infinite",
},
horizontalBarGreen: {
height: "100%",
borderRadius: "999px",
background: "linear-gradient(90deg, #4ade80, #16a34a, #4ade80)",
backgroundSize: "200% 200%",
animation: "slideGlow 2.8s linear infinite",
},
horizontalBarPurple: {
height: "100%",
borderRadius: "999px",
background: "linear-gradient(90deg, #c084fc, #7e22ce, #c084fc)",
backgroundSize: "200% 200%",
animation: "slideGlow 2.8s linear infinite",
},
horizontalBarAmber: {
height: "100%",
borderRadius: "999px",
background: "linear-gradient(90deg, #fbbf24, #d97706, #fbbf24)",
backgroundSize: "200% 200%",
animation: "slideGlow 2.8s linear infinite",
},
horizontalBarTeal: {
height: "100%",
borderRadius: "999px",
background: "linear-gradient(90deg, #5eead4, #0f766e, #5eead4)",
backgroundSize: "200% 200%",
animation: "slideGlow 2.8s linear infinite",
},
horizontalBarPink: {
height: "100%",
borderRadius: "999px",
background: "linear-gradient(90deg, #f9a8d4, #db2777, #f9a8d4)",
backgroundSize: "200% 200%",
animation: "slideGlow 2.8s linear infinite",
},
horizontalCount: {
color: "#ffffff",
fontSize: "14px",
fontWeight: 700,
textAlign: "right",
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
manualStatsCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "18px",
background: "#101010",
marginBottom: "18px",
},
manualStatsTitle: {
margin: 0,
color: "#f5f5f5",
fontSize: "16px",
fontWeight: 700,
},
manualStatsGrid: {
marginTop: "16px",
display: "grid",
gridTemplateColumns: "1fr 1fr 1fr",
gap: "14px",
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
textareaLarge: {
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
notesActions: {
marginTop: "16px",
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
};
