"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

type PeriodKey = "day" | "week" | "month" | "quarter" | "fiscal";
type RangeMode = "period" | "custom";
type SupportActionType = "task" | "nudge" | "reminder";

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

type SupportAction = {
id: string;
type: SupportActionType;
participantKey: string;
participantName: string;
title: string;
message: string;
dueDate?: string;
status: "Open" | "Completed";
createdAt: string;
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

const [rangeMode, setRangeMode] = useState<RangeMode>("period");
const [customStartDate, setCustomStartDate] = useState("");
const [customEndDate, setCustomEndDate] = useState("");
const [participantSearch, setParticipantSearch] = useState("");

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

const [supportActions, setSupportActions] = useState<SupportAction[]>([]);
const [supportType, setSupportType] = useState<SupportActionType>("task");
const [supportParticipantKey, setSupportParticipantKey] = useState("");
const [supportParticipantName, setSupportParticipantName] = useState("");
const [supportTitle, setSupportTitle] = useState("");
const [supportMessage, setSupportMessage] = useState("");
const [supportDueDate, setSupportDueDate] = useState("");

const mountedRef = useRef(true);

const notesStorageKey = useMemo(() => {
const code = partner?.referral_code || "partner";
return `hireminds-partner-report-generator-${code}-${period}`;
}, [partner?.referral_code, period]);

const supportStorageKey = useMemo(() => {
const code = partner?.referral_code || "partner";
return `hireminds-partner-support-actions-${code}`;
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

useEffect(() => {
try {
const raw = window.localStorage.getItem(supportStorageKey);
if (raw) {
const parsed = JSON.parse(raw);
setSupportActions(Array.isArray(parsed) ? parsed : []);
} else {
setSupportActions([]);
}
} catch {
setSupportActions([]);
}
}, [supportStorageKey]);

function persistSupportActions(next: SupportAction[]) {
setSupportActions(next);
try {
window.localStorage.setItem(supportStorageKey, JSON.stringify(next));
} catch {
setMessage("Unable to save support actions in this browser.");
}
}

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

if (!partnerRow || !partnerRow.referral_code) {
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
.limit(5000);

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

const customStart = useMemo(() => (customStartDate ? new Date(`${customStartDate}T00:00:00`) : null), [customStartDate]);
const customEnd = useMemo(() => (customEndDate ? new Date(`${customEndDate}T23:59:59`) : null), [customEndDate]);

const inSelectedRange = (value?: string | null) => {
const date = toDate(value);
if (!date) return false;

if (rangeMode === "custom" && customStart && customEnd) {
return date >= customStart && date <= customEnd;
}

return date >= periodStart;
};

const filteredActivity = useMemo(() => {
return activity.filter((row) => inSelectedRange(row.created_at));
}, [activity, rangeMode, customStart, customEnd, periodStart]);

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
if (!date) return false;
if (rangeMode === "custom" && customStart && customEnd) {
return date >= customStart && date <= customEnd;
}
return date >= periodStart;
});
}, [uniqueParticipants, rangeMode, customStart, customEnd, periodStart]);

const activeUserIds = useMemo(() => {
const set = new Set<string>();
filteredActivity.forEach((row) => {
const key = row.user_id || row.email || "";
if (key) set.add(key);
});
return set;
}, [filteredActivity]);

const activeParticipants = useMemo(() => {
return uniqueParticipants.filter((row) => {
const key = row.user_id || row.email || "";
return key ? activeUserIds.has(key) : false;
});
}, [uniqueParticipants, activeUserIds]);

const filteredParticipants = useMemo(() => {
const q = participantSearch.trim().toLowerCase();
if (!q) return activeParticipants;
return activeParticipants.filter((row) => {
const name = (row.full_name || "").toLowerCase();
const email = (row.email || "").toLowerCase();
return name.includes(q) || email.includes(q);
});
}, [activeParticipants, participantSearch]);

const filteredParticipantKeys = useMemo(() => {
const set = new Set<string>();
filteredParticipants.forEach((row) => {
const key = row.user_id || row.email || row.id || "";
if (key) set.add(key);
});
return set;
}, [filteredParticipants]);

const displayActivity = useMemo(() => {
if (!participantSearch.trim()) return filteredActivity;
return filteredActivity.filter((row) => {
const key = row.user_id || row.email || row.id || "";
return key ? filteredParticipantKeys.has(key) : false;
});
}, [filteredActivity, filteredParticipantKeys, participantSearch]);

const totalParticipants = filteredParticipants.length;
const totalNewUsers = participantSearch.trim()
? filteredParticipants.filter((row) => newUsers.some((n) => (n.user_id || n.email || n.id) === (row.user_id || row.email || row.id))).length
: newUsers.length;

const totalActivity = displayActivity.length;

const eventTypeGroups = useMemo(() => {
const counts = {
logins: 0,
pageViews: 0,
generatorUses: 0,
completions: 0,
guides: 0,
};

displayActivity.forEach((row) => {
const event = (row.event_type || "").toLowerCase();
const tool = (row.tool_name || "").toLowerCase();
const page = (row.page_name || "").toLowerCase();

if (event.includes("login") || event === "signed_in") counts.logins += 1;
if (event.includes("page") || event === "page_view") counts.pageViews += 1;
if (event.includes("complete")) counts.completions += 1;
if (
tool.includes("guide") ||
tool.includes("video") ||
page.includes("guide") ||
page.includes("video")
) {
counts.guides += 1;
}
if (tool) counts.generatorUses += 1;
});

return counts;
}, [displayActivity]);

const totalCompletions = eventTypeGroups.completions;

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

const toolCounts = useMemo(() => {
const counts: Record<string, number> = {};
trackedTools.forEach((tool) => {
counts[tool.key] = 0;
});

displayActivity.forEach((row) => {
const tool = (row.tool_name || "").toLowerCase();
if (!tool) return;
const match = trackedTools.find((item) => item.key === tool);
if (match) counts[match.key] += 1;
});

return counts;
}, [displayActivity, trackedTools]);

const resumesCompleted =
displayActivity.filter(
(row) =>
(row.tool_name || "").toLowerCase() === "resume_generator" &&
(row.event_type || "").toLowerCase().includes("complete")
).length +
displayActivity.filter(
(row) =>
(row.tool_name || "").toLowerCase() === "guided_resume_generator" &&
(row.event_type || "").toLowerCase().includes("complete")
).length;

const jobDescriptionAnalyzerUses = toolCounts["job_description_analyzer"] || 0;
const resumeMatchAnalyzerUses = toolCounts["resume_match_analyzer"] || 0;
const jobLogUses = toolCounts["job_log_generator"] || 0;
const interviewGeneratorUses = toolCounts["interview_question_generator"] || 0;
const budgetToolUses = toolCounts["budget_generator"] || 0;
const coverLetterUses = toolCounts["cover_letter_generator"] || 0;
const videoLibraryUses = toolCounts["video_library"] || 0;
const careerMapUses = toolCounts["career_map"] || 0;

const participantLogins = useMemo(() => {
const loginEvents = displayActivity.filter((row) => {
const event = (row.event_type || "").toLowerCase();
return event.includes("login") || event === "signed_in";
});
return loginEvents.length;
}, [displayActivity]);

const participantToolUsers = useMemo(() => {
const set = new Set<string>();
displayActivity.forEach((row) => {
if (row.tool_name) {
const key = row.user_id || row.email || "";
if (key) set.add(key);
}
});
return set.size;
}, [displayActivity]);

const liveFeed = useMemo(() => displayActivity.slice(0, 100), [displayActivity]);

const dailyTrend = useMemo(() => {
const bucket = new Map<string, number>();
displayActivity.forEach((row) => {
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
.slice(-12);
}, [displayActivity]);

const toolBreakdown = useMemo(() => {
return trackedTools
.map((tool) => ({
label: tool.label,
key: tool.key,
count: toolCounts[tool.key] || 0,
}))
.filter((item) => item.count > 0)
.sort((a, b) => b.count - a.count);
}, [trackedTools, toolCounts]);

const topToolsText = useMemo(() => {
if (toolBreakdown.length === 0) return "No tracked tool activity was recorded during the selected reporting window.";
return toolBreakdown
.slice(0, 5)
.map((item) => `${item.label} (${item.count})`)
.join(", ");
}, [toolBreakdown]);

const maxTrendCount = dailyTrend.length ? Math.max(...dailyTrend.map((d) => d.count)) : 1;
const maxToolCount = toolBreakdown.length ? Math.max(...toolBreakdown.map((d) => d.count)) : 1;

const supportActionsFiltered = useMemo(() => {
const q = participantSearch.trim().toLowerCase();
if (!q) return supportActions;
return supportActions.filter((item) => item.participantName.toLowerCase().includes(q));
}, [supportActions, participantSearch]);

const selectedParticipantOptions = filteredParticipants.map((row) => ({
key: row.user_id || row.email || row.id || "",
name: row.full_name || row.email || "Participant",
}));

const supportOpenCount = supportActions.filter((item) => item.status === "Open").length;

const summaryText = useMemo(() => {
const manualStats: string[] = [];
if (manualCandidatesServed.trim()) manualStats.push(`Candidates served reported outside the platform: ${manualCandidatesServed.trim()}.`);
if (manualNewUsers.trim()) manualStats.push(`Additional new users reported outside the platform: ${manualNewUsers.trim()}.`);
if (manualResumesCompleted.trim()) manualStats.push(`Additional resumes completed outside tracked platform events: ${manualResumesCompleted.trim()}.`);
if (manualApplicationsSubmitted.trim()) manualStats.push(`Applications submitted outside tracked platform events: ${manualApplicationsSubmitted.trim()}.`);
if (manualEmployerContacts.trim()) manualStats.push(`Employer contacts reported for this period: ${manualEmployerContacts.trim()}.`);
if (manualInterviews.trim()) manualStats.push(`Interviews reported for this period: ${manualInterviews.trim()}.`);
if (manualJobsLanded.trim()) manualStats.push(`Jobs landed reported for this period: ${manualJobsLanded.trim()}.`);
if (manualHireMindsReferrals.trim()) manualStats.push(`Additional HireMinds referrals reported: ${manualHireMindsReferrals.trim()}.`);
if (manualOutsideReferrals.trim()) manualStats.push(`Additional outside referrals reported: ${manualOutsideReferrals.trim()}.`);

const narrative: string[] = [];
if (workshopQ.trim()) narrative.push(`Workshops and trainings: ${workshopQ.trim()}.`);
if (jobFairQ.trim()) narrative.push(`Job fairs and hiring events: ${jobFairQ.trim()}.`);
if (meetingQ.trim()) narrative.push(`Participant meetings and touch points: ${meetingQ.trim()}.`);
if (hireMindsReferralQ.trim()) narrative.push(`HireMinds referrals: ${hireMindsReferralQ.trim()}.`);
if (outsideReferralQ.trim()) narrative.push(`Outside referrals: ${outsideReferralQ.trim()}.`);
if (interviewQ.trim()) narrative.push(`Interview activity and interview support: ${interviewQ.trim()}.`);
if (resumeSupportQ.trim()) narrative.push(`Resume support and document development notes: ${resumeSupportQ.trim()}.`);
if (analyzerSupportQ.trim()) narrative.push(`Analyzer support and job-matching notes: ${analyzerSupportQ.trim()}.`);
if (successStoryQ.trim()) narrative.push(`Additional outcomes, success stories, or implementation notes: ${successStoryQ.trim()}.`);

const rangeText =
rangeMode === "custom" && customStart && customEnd
? `${formatShortDate(customStartDate)} through ${formatShortDate(customEndDate)}`
: periodLabel(period);

return [
`Reporting Summary (${rangeText}): HireMinds recorded ${totalActivity} tracked activity events across ${totalParticipants} active participant${totalParticipants === 1 ? "" : "s"} associated with referral code ${partner?.referral_code || "—"}. Dashboard totals in this view exclude inactive users and focus on participants who demonstrated measurable platform engagement during the selected reporting window.`,
`User engagement remained anchored in core workforce preparation activity, including ${participantLogins} platform login${participantLogins === 1 ? "" : "s"}, ${eventTypeGroups.pageViews} tracked page view${eventTypeGroups.pageViews === 1 ? "" : "s"}, ${eventTypeGroups.generatorUses} recorded tool interaction${eventTypeGroups.generatorUses === 1 ? "" : "s"}, and ${totalCompletions} completed action${totalCompletions === 1 ? "" : "s"}. ${participantToolUsers} participant${participantToolUsers === 1 ? "" : "s"} actively used at least one tracked HireMinds tool during this reporting period.`,
`The strongest tool activity during this period came from: ${topToolsText}. Resume-focused activity remained a key area of engagement, with ${resumesCompleted} completed resume action${resumesCompleted === 1 ? "" : "s"}, ${coverLetterUses} cover letter tool use${coverLetterUses === 1 ? "" : "s"}, ${interviewGeneratorUses} interview preparation tool use${interviewGeneratorUses === 1 ? "" : "s"}, ${jobDescriptionAnalyzerUses} Job Description Analyzer use${jobDescriptionAnalyzerUses === 1 ? "" : "s"}, and ${resumeMatchAnalyzerUses} Resume Match Analyzer use${resumeMatchAnalyzerUses === 1 ? "" : "s"}.`,
`Additional workforce readiness and planning activity included ${jobLogUses} Job Log Generator use${jobLogUses === 1 ? "" : "s"}, ${budgetToolUses} Budget Generator use${budgetToolUses === 1 ? "" : "s"}, ${videoLibraryUses} Video Library engagement event${videoLibraryUses === 1 ? "" : "s"}, and ${careerMapUses} Career Map-related event${careerMapUses === 1 ? "" : "s"}. This reporting view can support nonprofit, state, municipal, and grant-funded program documentation by emphasizing active participation, documented service interaction, and measurable completion behavior.`,
supportOpenCount > 0
? `Partner support remained active during this period, with ${supportOpenCount} open assigned support item${supportOpenCount === 1 ? "" : "s"} currently saved in the dashboard across tasks, nudges, and reminders.`
: `No open partner support items are currently saved in the dashboard for this reporting period.`,
...manualStats,
...narrative,
].join(" ");
}, [
rangeMode,
customStart,
customEnd,
customStartDate,
customEndDate,
period,
partner?.referral_code,
totalActivity,
totalParticipants,
participantLogins,
eventTypeGroups.pageViews,
eventTypeGroups.generatorUses,
totalCompletions,
participantToolUsers,
topToolsText,
resumesCompleted,
coverLetterUses,
interviewGeneratorUses,
jobDescriptionAnalyzerUses,
resumeMatchAnalyzerUses,
jobLogUses,
budgetToolUses,
videoLibraryUses,
careerMapUses,
supportOpenCount,
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

function addSupportAction() {
if (!supportParticipantKey || !supportParticipantName || !supportTitle.trim()) {
setMessage("Please select a participant and enter a title before saving.");
return;
}

const next: SupportAction[] = [
{
id: `sa-${Date.now()}`,
type: supportType,
participantKey: supportParticipantKey,
participantName: supportParticipantName,
title: supportTitle.trim(),
message: supportMessage.trim(),
dueDate: supportDueDate || undefined,
status: "Open" as SupportAction["status"],
createdAt: new Date().toISOString(),
},
...supportActions,
];

persistSupportActions(next);
setSupportTitle("");
setSupportMessage("");
setSupportDueDate("");
setMessage("Support action saved.");
}

unction toggleSupportActionStatus(id: string) {
const next: SupportAction[] = supportActions.map((item) => {
if (item.id !== id) return item;

const nextStatus: SupportAction["status"] =
item.status === "Open" ? "Completed" : "Open";

return {
...item,
status: nextStatus,
};
});

persistSupportActions(next);
}

function deleteSupportAction(id: string) {
const next = supportActions.filter((item) => item.id !== id);
persistSupportActions(next);
}

function exportSummaryReport() {
const reportText = `
PARTNER REPORT
Organization: ${partner?.organization_name || "—"}
Contact Name: ${partner?.contact_name || "—"}
Contact Title: ${partner?.contact_title || "—"}
Contact Email: ${partner?.contact_email || "—"}
Referral Code: ${partner?.referral_code || "—"}
Reporting Period: ${rangeMode === "custom" && customStartDate && customEndDate ? `${customStartDate} to ${customEndDate}` : periodLabel(period)}

ACTIVE PARTICIPANT TOTAL
${totalParticipants}

TRACKED ACTIVITY TOTAL
${totalActivity}

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
h2 { margin: 24px 0 8px; font-size: 18px; }
p { margin: 0 0 10px; }
.meta { margin-bottom: 18px; }
.summary { margin-top: 24px; white-space: pre-wrap; }
ul { padding-left: 20px; }
</style>
</head>
<body>
<h1>${partner?.organization_name || "Partner"} Summary Report</h1>
<div class="meta">
<p><strong>Contact Name:</strong> ${partner?.contact_name || "—"}</p>
<p><strong>Contact Title:</strong> ${partner?.contact_title || "—"}</p>
<p><strong>Contact Email:</strong> ${partner?.contact_email || "—"}</p>
<p><strong>Referral Code:</strong> ${partner?.referral_code || "—"}</p>
<p><strong>Reporting Period:</strong> ${rangeMode === "custom" && customStartDate && customEndDate ? `${customStartDate} to ${customEndDate}` : periodLabel(period)}</p>
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

function printDashboardSnapshot() {
const printWindow = window.open("", "_blank", "width=1100,height=1400");
if (!printWindow) {
alert("Pop-up blocked. Please allow pop-ups and try again.");
return;
}

const topToolsHtml = toolBreakdown
.slice(0, 10)
.map((item) => `<li>${item.label}: ${item.count}</li>`)
.join("");

const html = `
<!doctype html>
<html>
<head>
<title>Partner Dashboard Snapshot</title>
<style>
body { font-family: Arial, sans-serif; padding: 32px; color: #111827; line-height: 1.6; }
h1 { margin: 0 0 8px; font-size: 30px; }
h2 { margin: 24px 0 8px; font-size: 18px; }
.grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px; margin-top: 16px; }
.card { border: 1px solid #d1d5db; border-radius: 14px; padding: 14px; }
table { width: 100%; border-collapse: collapse; margin-top: 14px; }
th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
th { background: #f3f4f6; }
ul { padding-left: 20px; }
</style>
</head>
<body>
<h1>${partner?.organization_name || "Partner"} Dashboard Snapshot</h1>
<p><strong>Referral Code:</strong> ${partner?.referral_code || "—"}</p>
<p><strong>Reporting Window:</strong> ${rangeMode === "custom" && customStartDate && customEndDate ? `${customStartDate} to ${customEndDate}` : periodLabel(period)}</p>

<div class="grid">
<div class="card"><strong>Active Participants</strong><br/>${totalParticipants}</div>
<div class="card"><strong>New Active Users</strong><br/>${totalNewUsers}</div>
<div class="card"><strong>Total Activity</strong><br/>${totalActivity}</div>
<div class="card"><strong>Total Completions</strong><br/>${totalCompletions}</div>
<div class="card"><strong>Logins</strong><br/>${participantLogins}</div>
<div class="card"><strong>Tool Users</strong><br/>${participantToolUsers}</div>
</div>

<h2>Top Tool Usage</h2>
<ul>${topToolsHtml || "<li>No tracked tools in this period.</li>"}</ul>

<h2>Summary</h2>
<p>${summaryText}</p>

<h2>Recent Activity</h2>
<table>
<thead>
<tr>
<th>Date</th>
<th>Participant</th>
<th>Event</th>
<th>Tool</th>
<th>Page</th>
</tr>
</thead>
<tbody>
${
liveFeed.length
? liveFeed
.slice(0, 40)
.map(
(row) => `
<tr>
<td>${formatDate(row.created_at)}</td>
<td>${row.full_name || row.email || "—"}</td>
<td>${row.event_type || "—"}</td>
<td>${row.tool_name || "—"}</td>
<td>${row.page_name || "—"}</td>
</tr>
`
)
.join("")
: `<tr><td colspan="5">No activity found for the selected range.</td></tr>`
}
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

<button
type="button"
onClick={() => setRangeMode(rangeMode === "period" ? "custom" : "period")}
style={styles.secondaryButton}
>
{rangeMode === "period" ? "Use Custom Date Range" : "Use Standard Reporting Period"}
</button>

<button type="button" onClick={() => loadDashboard()} style={styles.secondaryButton}>
Refresh
</button>

<button type="button" onClick={printDashboardSnapshot} style={styles.secondaryButton}>
Print Dashboard
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

{rangeMode === "custom" ? (
<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Reference Range</p>
<h2 style={styles.sectionTitle}>Past data and custom reporting window</h2>
</div>
</div>

<div style={styles.filterGrid}>
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

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Partner Resources</p>
<h2 style={styles.sectionTitle}>Workshop Presentation</h2>
</div>
</div>

<div style={styles.presentationCard}>
<h3 style={styles.presentationTitle}>YWCA Resume Workshop Presentation</h3>
<p style={styles.presentationText}>
View or download the HireMinds workshop presentation created for YWCA,
including training flow, Career Passport setup, resume guidance,
analyzers, workshop support content, and materials that can be used if
your organization is facilitating a HireMinds workshop.
</p>

<div style={styles.presentationActions}>
<a
href="/ywca-resume-workshop.pdf"
target="_blank"
rel="noreferrer"
style={styles.secondaryButtonLink}
>
View PDF
</a>

<a
href="/ywca-resume-workshop.pptx"
download
style={styles.secondaryButtonLink}
>
Download PowerPoint
</a>
</div>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>Participant Filters</p>
<InfoBubble
title="Participant Filters"
text="Filter active participants and related activity by participant name or email. Inactive users are excluded from primary dashboard totals."
/>
</div>
<h2 style={styles.sectionTitle}>Participant lookup</h2>
</div>
</div>

<div style={styles.filterGrid}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Search Active Participants</label>
<input
value={participantSearch}
onChange={(e) => setParticipantSearch(e.target.value)}
placeholder="Search by name or email"
style={styles.input}
/>
</div>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>Current Activity</p>
<InfoBubble
title="Live Reporting Feed"
text="This stream shows the most recent tracked participant activity for this partner referral code and selected reporting range. It refreshes automatically every 15 seconds."
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
<p style={styles.emptyText}>No activity found yet for this reporting range.</p>
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
<p style={styles.summaryLabel}>Active Participants</p>
<InfoBubble
title="Active Participants"
text="Unique active participants tied to this partner referral code and selected reporting range. Inactive users are excluded from these totals."
/>
</div>
<p style={styles.summaryValue}>{totalParticipants}</p>
</div>

<div style={styles.metricCardGreen}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>New Active Users</p>
<InfoBubble
title="New Active Users"
text="Participants whose signup date falls inside the selected reporting range and who also show tracked activity."
/>
</div>
<p style={styles.summaryValue}>{totalNewUsers}</p>
</div>

<div style={styles.metricCardPurple}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Total Activity</p>
<InfoBubble
title="Total Activity"
text="All tracked activity events for active participants during the selected reporting range."
/>
</div>
<p style={styles.summaryValue}>{totalActivity}</p>
</div>

<div style={styles.metricCardNeutral}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Total Completions</p>
<InfoBubble
title="Total Completions"
text="Counts all tracked completed actions across HireMinds tools and generators."
/>
</div>
<p style={styles.summaryValue}>{totalCompletions}</p>
</div>

<div style={styles.metricCardGreen}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Login Events</p>
<InfoBubble
title="Login Events"
text="Counts tracked login events for active participants."
/>
</div>
<p style={styles.summaryValue}>{participantLogins}</p>
</div>

<div style={styles.metricCardAmber}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Tool Users</p>
<InfoBubble
title="Tool Users"
text="Unique active participants who used at least one tracked HireMinds tool during the selected range."
/>
</div>
<p style={styles.summaryValue}>{participantToolUsers}</p>
</div>

<div style={styles.metricCardBlue}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Resumes Completed</p>
<InfoBubble
title="Resumes Completed"
text="Tracked completed actions in the Resume Generator and Guided Resume Generator."
/>
</div>
<p style={styles.summaryValue}>{resumesCompleted}</p>
</div>

<div style={styles.metricCardPurple}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Job Description Analyzer Uses</p>
<InfoBubble
title="Job Description Analyzer Uses"
text="All tracked uses of the Job Description Analyzer during the selected reporting range."
/>
</div>
<p style={styles.summaryValue}>{jobDescriptionAnalyzerUses}</p>
</div>

<div style={styles.metricCardPurple}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Resume Match Analyzer Uses</p>
<InfoBubble
title="Resume Match Analyzer Uses"
text="All tracked uses of the Resume Match Analyzer during the selected reporting range."
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
text="Shows how many tracked events occurred across the selected reporting range."
/>
</div>

{dailyTrend.length === 0 ? (
<p style={styles.emptyText}>No trend data yet for this reporting range.</p>
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
text="Shows tracked use across current generators, analyzers, planning tools, guides, and newer HireMinds tools."
/>
</div>

{toolBreakdown.length === 0 ? (
<p style={styles.emptyText}>No tracked tool usage yet for this reporting range.</p>
) : (
<div style={styles.horizontalChart}>
{toolBreakdown.slice(0, 12).map((item, index) => {
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
<p style={styles.sectionKicker}>Partner Support</p>
<h2 style={styles.sectionTitle}>Assign tasks, nudges, and reminders</h2>
</div>
<InfoBubble
title="Partner Support"
text="Use this section to save partner follow-up actions for active participants. In this version, support actions are stored in the current browser until a dedicated database table is added."
/>
</div>
</div>

<div style={styles.manualStatsGrid}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Action Type</label>
<select
value={supportType}
onChange={(e) => setSupportType(e.target.value as SupportActionType)}
style={styles.select}
>
<option value="task">Assign Task</option>
<option value="nudge">Send Nudge</option>
<option value="reminder">Set Reminder</option>
</select>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Participant</label>
<select
value={supportParticipantKey}
onChange={(e) => {
const key = e.target.value;
const match = selectedParticipantOptions.find((item) => item.key === key);
setSupportParticipantKey(key);
setSupportParticipantName(match?.name || "");
}}
style={styles.select}
>
<option value="">Select participant</option>
{selectedParticipantOptions.map((item) => (
<option key={item.key} value={item.key}>
{item.name}
</option>
))}
</select>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Due Date (Optional)</label>
<input
type="date"
value={supportDueDate}
onChange={(e) => setSupportDueDate(e.target.value)}
style={styles.input}
/>
</div>

<div style={{ ...styles.fieldWrap, gridColumn: "1 / span 2" }}>
<label style={styles.label}>Title</label>
<input
value={supportTitle}
onChange={(e) => setSupportTitle(e.target.value)}
style={styles.input}
placeholder="Example: Complete weekly job log"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Message / Instructions</label>
<textarea
value={supportMessage}
onChange={(e) => setSupportMessage(e.target.value)}
style={styles.textarea}
placeholder="Add details, encouragement, or next steps."
/>
</div>
</div>

<div style={styles.notesActions}>
<button type="button" onClick={addSupportAction} style={styles.secondaryButton}>
Save Support Action
</button>
</div>

<div style={{ marginTop: "20px" }}>
{supportActionsFiltered.length === 0 ? (
<p style={styles.emptyText}>No saved support actions yet.</p>
) : (
<div style={styles.supportList}>
{supportActionsFiltered.map((item) => (
<div key={item.id} style={styles.supportCard}>
<div style={styles.supportCardTop}>
<div>
<p style={styles.supportType}>{item.type.toUpperCase()}</p>
<h3 style={styles.supportTitle}>{item.title}</h3>
<p style={styles.supportMeta}>
{item.participantName} • Created {formatDate(item.createdAt)} • Due {item.dueDate ? formatShortDate(item.dueDate) : "—"}
</p>
</div>
<span style={item.status === "Open" ? styles.statusOpen : styles.statusDone}>
{item.status}
</span>
</div>

{item.message ? <p style={styles.supportMessage}>{item.message}</p> : null}

<div style={styles.supportActionsRow}>
<button
type="button"
onClick={() => toggleSupportActionStatus(item.id)}
style={styles.secondaryButton}
>
{item.status === "Open" ? "Mark Completed" : "Reopen"}
</button>
<button
type="button"
onClick={() => deleteSupportAction(item.id)}
style={styles.secondaryButton}
>
Delete
</button>
</div>
</div>
))}
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
text="Use tracked HireMinds metrics plus manual outcomes to prepare richer programmatic, nonprofit, state, municipal, and grant-ready summaries."
/>
</div>
<div style={styles.sectionActions}>
<button type="button" onClick={saveQuestions} style={styles.secondaryButton}>
Save / Update Responses
</button>
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
text="Enter counts tracked outside the platform here. These values are included in the generated report summary."
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
<label style={styles.label}>Were any outside referrals made?</label>
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
presentationCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "18px",
background: "#101010",
},
presentationTitle: {
margin: "0 0 10px",
color: "#f5f5f5",
fontSize: "20px",
fontWeight: 700,
},
presentationText: {
margin: "0 0 16px",
color: "#d4d4d8",
fontSize: "15px",
lineHeight: 1.75,
},
presentationActions: {
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
filterGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "16px",
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
graphGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "24px",
},
verticalChart: {
height: "280px",
display: "grid",
gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
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
background: "linear-gradient(180deg, #60a5fa 0%, #2563eb 70%, #1d4ed8 100%)",
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
gridTemplateColumns: "190px 1fr 42px",
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
supportList: {
display: "grid",
gap: "14px",
},
supportCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "16px",
background: "#101010",
},
supportCardTop: {
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: "16px",
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
supportMessage: {
margin: "14px 0 0",
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.7,
},
supportActionsRow: {
display: "flex",
gap: "10px",
flexWrap: "wrap",
marginTop: "14px",
},
statusOpen: {
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
statusDone: {
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
};
