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

export default function PartnerReportSummaryPage() {
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

const storageKey = useMemo(() => {
const code = partner?.referral_code || "partner";
const rangeKey =
customMode && customStartDate && customEndDate
? `custom-${customStartDate}-${customEndDate}`
: period;
return `hireminds-summary-generator-${code}-${rangeKey}`;
}, [partner?.referral_code, period, customMode, customStartDate, customEndDate]);

useEffect(() => {
mountedRef.current = true;
return () => {
mountedRef.current = false;
};
}, []);

useEffect(() => {
try {
const raw = window.localStorage.getItem(storageKey);
if (!raw) {
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
return;
}

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
} catch {
setMessage("Unable to load saved summary inputs from this browser.");
}
}, [storageKey]);

function saveInputs() {
try {
window.localStorage.setItem(
storageKey,
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
setMessage("Summary inputs saved in this browser.");
} catch {
setMessage("Unable to save summary inputs in this browser.");
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
setMessage("This account does not have partner summary access.");
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

const totalParticipants = uniqueParticipants.length;

const totalNewUsers = useMemo(() => {
const monthStart = startOfMonth();
return uniqueParticipants.filter((row) => {
const date = toDate(row.created_at);
return date ? date >= monthStart : false;
}).length;
}, [uniqueParticipants]);

const totalActivity = filteredActivity.length;

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
.filter((item) => item.count > 0)
.sort((a, b) => b.count - a.count);
}, [trackedTools, filteredActivity]);

const topToolsText = useMemo(() => {
if (toolBreakdown.length === 0) {
return "No tracked tool activity was recorded during the selected reporting window.";
}
return toolBreakdown
.slice(0, 6)
.map((item) => `${item.label} (${item.count})`)
.join(", ");
}, [toolBreakdown]);

const rangeLabel = useMemo(() => {
if (customMode && customStartDate && customEndDate) {
return `${customStartDate} to ${customEndDate}`;
}
return periodLabel(period);
}, [customMode, customStartDate, customEndDate, period]);

const summaryText = useMemo(() => {
const manualStats: string[] = [];
if (manualCandidatesServed.trim()) manualStats.push(`Candidates served reported outside the platform: ${manualCandidatesServed.trim()}.`);
if (manualNewUsers.trim()) manualStats.push(`Additional new users reported outside tracked system signups: ${manualNewUsers.trim()}.`);
if (manualResumesCompleted.trim()) manualStats.push(`Additional resumes completed outside tracked platform completion events: ${manualResumesCompleted.trim()}.`);
if (manualApplicationsSubmitted.trim()) manualStats.push(`Applications submitted reported outside tracked platform activity: ${manualApplicationsSubmitted.trim()}.`);
if (manualEmployerContacts.trim()) manualStats.push(`Employer contacts recorded for this reporting period: ${manualEmployerContacts.trim()}.`);
if (manualInterviews.trim()) manualStats.push(`Interviews or interview supports reported during this reporting period: ${manualInterviews.trim()}.`);
if (manualJobsLanded.trim()) manualStats.push(`Jobs landed reported during this reporting period: ${manualJobsLanded.trim()}.`);
if (manualHireMindsReferrals.trim()) manualStats.push(`Additional HireMinds referrals reported outside tracked system events: ${manualHireMindsReferrals.trim()}.`);
if (manualOutsideReferrals.trim()) manualStats.push(`Additional outside referrals reported during this reporting period: ${manualOutsideReferrals.trim()}.`);

const narrative: string[] = [];
if (workshopQ.trim()) narrative.push(`Workshops and trainings: ${workshopQ.trim()}.`);
if (jobFairQ.trim()) narrative.push(`Job fairs and hiring events: ${jobFairQ.trim()}.`);
if (meetingQ.trim()) narrative.push(`Participant meetings, check-ins, and touch points: ${meetingQ.trim()}.`);
if (hireMindsReferralQ.trim()) narrative.push(`HireMinds-specific referrals and internal handoffs: ${hireMindsReferralQ.trim()}.`);
if (outsideReferralQ.trim()) narrative.push(`Outside referrals and external service connections: ${outsideReferralQ.trim()}.`);
if (interviewQ.trim()) narrative.push(`Interview activity and interview support notes: ${interviewQ.trim()}.`);
if (resumeSupportQ.trim()) narrative.push(`Resume support and document-development notes: ${resumeSupportQ.trim()}.`);
if (analyzerSupportQ.trim()) narrative.push(`Analyzer and job-matching support notes: ${analyzerSupportQ.trim()}.`);
if (successStoryQ.trim()) narrative.push(`Additional outcomes, success stories, implementation notes, or program observations: ${successStoryQ.trim()}.`);

return [
`Reporting Summary (${rangeLabel}): HireMinds recorded ${totalActivity} tracked activity event${totalActivity === 1 ? "" : "s"} tied to referral code ${partner?.referral_code || "—"}. The current partner roster includes ${totalParticipants} total participant${totalParticipants === 1 ? "" : "s"}, with ${totalNewUsers} new user${totalNewUsers === 1 ? "" : "s"} added during the current month.`,
`Within the selected reporting window, participant engagement included ${eventGroups.logins} login event${eventGroups.logins === 1 ? "" : "s"}, ${eventGroups.pageViews} tracked page view${eventGroups.pageViews === 1 ? "" : "s"}, ${eventGroups.generatorUses} tracked tool interaction${eventGroups.generatorUses === 1 ? "" : "s"}, and ${eventGroups.completions} completed action${eventGroups.completions === 1 ? "" : "s"}.`,
`The strongest areas of measured platform use during this reporting window were: ${topToolsText}. This can support nonprofit, workforce, grant, state, municipal, or program-performance reporting by documenting active engagement, service utilization, and measurable completion behavior through the HireMinds platform.`,
...manualStats,
...narrative,
].join(" ");
}, [
rangeLabel,
totalActivity,
partner?.referral_code,
totalParticipants,
totalNewUsers,
eventGroups.logins,
eventGroups.pageViews,
eventGroups.generatorUses,
eventGroups.completions,
topToolsText,
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

function exportSummaryReport() {
const reportText = `
PARTNER REPORT SUMMARY

Organization: ${partner?.organization_name || "—"}
Contact Name: ${partner?.contact_name || "—"}
Contact Title: ${partner?.contact_title || "—"}
Contact Email: ${partner?.contact_email || "—"}
Referral Code: ${partner?.referral_code || "—"}
Reporting Window: ${rangeLabel}

METRICS
Total Participants: ${totalParticipants}
New Users This Month: ${totalNewUsers}
Tracked Activity in Window: ${totalActivity}
Logins in Window: ${eventGroups.logins}
Page Views in Window: ${eventGroups.pageViews}
Tool Uses in Window: ${eventGroups.generatorUses}
Completions in Window: ${eventGroups.completions}

SUMMARY
${summaryText}
`.trim();

downloadText(`partner-summary-report-${partner?.referral_code || "report"}.txt`, reportText);
}

function printSummaryReport() {
const printWindow = window.open("", "_blank", "width=1000,height=1300");
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
h2 { margin: 22px 0 10px; font-size: 18px; }
p { margin: 0 0 10px; }
.meta { margin-bottom: 18px; }
.metric-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 18px 0; }
.metric { border: 1px solid #d1d5db; border-radius: 12px; padding: 12px; }
.summary { margin-top: 18px; white-space: pre-wrap; }
</style>
</head>
<body>
<h1>${partner?.organization_name || "Partner"} Summary Report</h1>
<div class="meta">
<p><strong>Contact Name:</strong> ${partner?.contact_name || "—"}</p>
<p><strong>Contact Title:</strong> ${partner?.contact_title || "—"}</p>
<p><strong>Contact Email:</strong> ${partner?.contact_email || "—"}</p>
<p><strong>Referral Code:</strong> ${partner?.referral_code || "—"}</p>
<p><strong>Reporting Window:</strong> ${rangeLabel}</p>
</div>

<h2>Metrics Snapshot</h2>
<div class="metric-grid">
<div class="metric"><strong>Total Participants</strong><br/>${totalParticipants}</div>
<div class="metric"><strong>New Users This Month</strong><br/>${totalNewUsers}</div>
<div class="metric"><strong>Tracked Activity</strong><br/>${totalActivity}</div>
<div class="metric"><strong>Completions</strong><br/>${eventGroups.completions}</div>
<div class="metric"><strong>Login Events</strong><br/>${eventGroups.logins}</div>
<div class="metric"><strong>Page Views</strong><br/>${eventGroups.pageViews}</div>
</div>

<h2>Summary</h2>
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
<div style={styles.centerWrap}>Loading summary generator...</div>
</main>
);
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.headerCard}>
<div>
<p style={styles.kicker}>Partner Reports</p>
<h1 style={styles.title}>Summary Generator</h1>
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

<button type="button" onClick={saveInputs} style={styles.secondaryButton}>
Save Inputs
</button>

<button type="button" onClick={exportSummaryReport} style={styles.secondaryButton}>
Save Report
</button>

<button type="button" onClick={printSummaryReport} style={styles.secondaryButton}>
Print Report
</button>

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
text="Use a fixed start and end date if you need to prepare a report outside the standard daily, weekly, monthly, quarterly, or fiscal reporting periods."
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
<p style={styles.metricValue}>{totalActivity}</p>
</div>

<div style={styles.metricCardNeutral}>
<p style={styles.metricLabel}>Completions</p>
<p style={styles.metricValue}>{eventGroups.completions}</p>
</div>

<div style={styles.metricCardGreen}>
<p style={styles.metricLabel}>Logins</p>
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
<p style={styles.sectionKicker}>Generated Narrative</p>
<InfoBubble
title="Generated Narrative"
text="This narrative blends tracked HireMinds platform metrics with your manual outcomes and qualitative notes so you can prepare stronger partner, nonprofit, grant, municipal, or state reports."
/>
</div>
<h2 style={styles.sectionTitle}>Report summary preview</h2>
</div>
</div>

<div style={styles.summaryBox}>
<p style={styles.summaryText}>{summaryText}</p>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>Manual Outcome Counts</p>
<InfoBubble
title="Manual Outcome Counts"
text="Use these fields for outcomes tracked outside the platform. These values are added into the final summary language."
/>
</div>
<h2 style={styles.sectionTitle}>Manual counts</h2>
</div>
</div>

<div style={styles.grid3}>
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
<label style={styles.label}>Interviews</label>
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
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>Narrative Inputs</p>
<InfoBubble
title="Narrative Inputs"
text="Use these fields to add human context that numbers alone do not capture, including workshop delivery, referrals, meetings, interview supports, and success stories."
/>
</div>
<h2 style={styles.sectionTitle}>Program notes and narrative details</h2>
</div>
</div>

<div style={styles.grid2}>
<div style={styles.fieldWrap}>
<label style={styles.label}>How many workshops or trainings were held?</label>
<textarea
value={workshopQ}
onChange={(e) => setWorkshopQ(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>How many job fairs or hiring events were attended?</label>
<textarea
value={jobFairQ}
onChange={(e) => setJobFairQ(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>How many one-on-one meetings took place with participants?</label>
<textarea
value={meetingQ}
onChange={(e) => setMeetingQ(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Were any participants referred to HireMinds tools or services?</label>
<textarea
value={hireMindsReferralQ}
onChange={(e) => setHireMindsReferralQ(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Were any outside referrals made?</label>
<textarea
value={outsideReferralQ}
onChange={(e) => setOutsideReferralQ(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>How many participants landed interviews or received interview support?</label>
<textarea
value={interviewQ}
onChange={(e) => setInterviewQ(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>What resume-related support or outcomes should be included?</label>
<textarea
value={resumeSupportQ}
onChange={(e) => setResumeSupportQ(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>What analyzer-related support or outcomes should be included?</label>
<textarea
value={analyzerSupportQ}
onChange={(e) => setAnalyzerSupportQ(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={{ ...styles.fieldWrap, gridColumn: "1 / -1" }}>
<label style={styles.label}>What additional outcomes, success stories, or narrative should be included?</label>
<textarea
value={successStoryQ}
onChange={(e) => setSuccessStoryQ(e.target.value)}
style={styles.textareaLarge}
/>
</div>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Tracked Tool Snapshot</p>
<h2 style={styles.sectionTitle}>Most-used tracked tools in this window</h2>
</div>
</div>

{toolBreakdown.length === 0 ? (
<p style={styles.emptyText}>No tracked tools were recorded for the selected reporting window.</p>
) : (
<div style={styles.toolGrid}>
{toolBreakdown.map((item) => (
<div key={item.key} style={styles.toolCard}>
<p style={styles.toolLabel}>{item.label}</p>
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
summaryBox: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "18px",
background: "#101010",
},
summaryText: {
margin: 0,
color: "#e5e7eb",
fontSize: "15px",
lineHeight: 1.9,
},
grid2: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "16px",
},
grid3: {
display: "grid",
gridTemplateColumns: "1fr 1fr 1fr",
gap: "14px",
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
minHeight: "150px",
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
emptyText: {
margin: 0,
color: "#c8c8c8",
fontSize: "15px",
lineHeight: 1.7,
},
};
