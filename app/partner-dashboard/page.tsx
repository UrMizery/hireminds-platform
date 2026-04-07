"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

type PeriodKey = "day" | "week" | "month" | "quarter" | "fiscal";
type RangeMode = "period" | "custom";
type SupportActionType = "task" | "nudge" | "reminder";
type DashboardTab = "overview" | "live" | "history" | "tools" | "support";

type PartnerRow = {
organization_name?: string | null;
contact_name?: string | null;
contact_title?: string | null;
account_holder?: string | null;
title?: string | null;
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
phone?: string | null;
created_at?: string | null;
};

type DisplayActivityRow = ActivityRow & {
phone?: string | null;
};

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

type ParticipantOutcome = {
id: string;
participantKey: string;
participantName: string;
participantEmail?: string;
participantPhone?: string;
startedWorkingDate?: string;
company?: string;
position?: string;
workLocation?: string;
startedTrainingDate?: string;
program?: string;
trainingLocation?: string;
notes?: string;
updatedAt: string;
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
const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

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

const [historyParticipantSearch, setHistoryParticipantSearch] = useState("");
const [historyToolFilter, setHistoryToolFilter] = useState("all");
const [historyStartDate, setHistoryStartDate] = useState("");
const [historyEndDate, setHistoryEndDate] = useState("");

const [supportActions, setSupportActions] = useState<SupportAction[]>([]);
const [supportType, setSupportType] = useState<SupportActionType>("task");
const [supportParticipantKey, setSupportParticipantKey] = useState("");
const [supportParticipantName, setSupportParticipantName] = useState("");
const [supportParticipantEmail, setSupportParticipantEmail] = useState("");
const [supportParticipantPhone, setSupportParticipantPhone] = useState("");
const [supportTitle, setSupportTitle] = useState("");
const [supportMessage, setSupportMessage] = useState("");
const [supportDueDate, setSupportDueDate] = useState("");

const [participantOutcomes, setParticipantOutcomes] = useState<ParticipantOutcome[]>([]);
const [outcomeParticipantKey, setOutcomeParticipantKey] = useState("");
const [outcomeParticipantName, setOutcomeParticipantName] = useState("");
const [outcomeParticipantEmail, setOutcomeParticipantEmail] = useState("");
const [outcomeParticipantPhone, setOutcomeParticipantPhone] = useState("");
const [startedWorkingDate, setStartedWorkingDate] = useState("");
const [company, setCompany] = useState("");
const [position, setPosition] = useState("");
const [workLocation, setWorkLocation] = useState("");
const [startedTrainingDate, setStartedTrainingDate] = useState("");
const [program, setProgram] = useState("");
const [trainingLocation, setTrainingLocation] = useState("");
const [outcomeNotes, setOutcomeNotes] = useState("");

const mountedRef = useRef(true);

const supportStorageKey = useMemo(() => {
const code = partner?.referral_code || "partner";
return `hireminds-partner-support-actions-${code}`;
}, [partner?.referral_code]);

const outcomesStorageKey = useMemo(() => {
const code = partner?.referral_code || "partner";
return `hireminds-partner-outcomes-${code}`;
}, [partner?.referral_code]);

useEffect(() => {
mountedRef.current = true;
return () => {
mountedRef.current = false;
};
}, []);

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

useEffect(() => {
try {
const raw = window.localStorage.getItem(outcomesStorageKey);
if (raw) {
const parsed = JSON.parse(raw);
setParticipantOutcomes(Array.isArray(parsed) ? parsed : []);
} else {
setParticipantOutcomes([]);
}
} catch {
setParticipantOutcomes([]);
}
}, [outcomesStorageKey]);

function persistSupportActions(next: SupportAction[]) {
setSupportActions(next);
try {
window.localStorage.setItem(supportStorageKey, JSON.stringify(next));
} catch {
setMessage("Unable to save support actions in this browser.");
}
}

function persistOutcomes(next: ParticipantOutcome[]) {
setParticipantOutcomes(next);
try {
window.localStorage.setItem(outcomesStorageKey, JSON.stringify(next));
} catch {
setMessage("Unable to save participant outcomes in this browser.");
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
.select("id, user_id, full_name, email, phone, created_at")
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
const key = row.user_id || row.email || row.phone || row.id || "";
if (!key || seen.has(key)) return false;
seen.add(key);
return true;
});
}, [participants]);

const participantPhoneMap = useMemo(() => {
const map = new Map<string, string>();
uniqueParticipants.forEach((row) => {
const phone = row.phone || "";
if (!phone) return;
if (row.user_id) map.set(`uid:${row.user_id}`, phone);
if (row.email) map.set(`email:${row.email.toLowerCase()}`, phone);
});
return map;
}, [uniqueParticipants]);

const activityWithPhone = useMemo<DisplayActivityRow[]>(() => {
return activity.map((row) => {
const phone =
(row.user_id ? participantPhoneMap.get(`uid:${row.user_id}`) : undefined) ||
(row.email ? participantPhoneMap.get(`email:${row.email.toLowerCase()}`) : undefined) ||
null;

return {
...row,
phone,
};
});
}, [activity, participantPhoneMap]);

const periodStart = useMemo(() => getPeriodStart(period), [period]);
const usePeriodStart = useMemo(() => getPeriodStart(platformUseView), [platformUseView]);

const customStart = useMemo(
() => (customStartDate ? new Date(`${customStartDate}T00:00:00`) : null),
[customStartDate]
);
const customEnd = useMemo(
() => (customEndDate ? new Date(`${customEndDate}T23:59:59`) : null),
[customEndDate]
);

const historyStart = useMemo(
() => (historyStartDate ? new Date(`${historyStartDate}T00:00:00`) : null),
[historyStartDate]
);
const historyEnd = useMemo(
() => (historyEndDate ? new Date(`${historyEndDate}T23:59:59`) : null),
[historyEndDate]
);

const inSelectedRange = (value?: string | null) => {
const date = toDate(value);
if (!date) return false;

if (rangeMode === "custom" && customStart && customEnd) {
return date >= customStart && date <= customEnd;
}

return date >= periodStart;
};

const filteredActivity = useMemo(() => {
return activityWithPhone.filter((row) => inSelectedRange(row.created_at));
}, [activityWithPhone, rangeMode, customStart, customEnd, periodStart]);

const usesBySelectedView = useMemo(() => {
return activityWithPhone.filter((row) => {
const date = toDate(row.created_at);
return date ? date >= usePeriodStart : false;
}).length;
}, [activityWithPhone, usePeriodStart]);

const totalHireMindsUsesReference = activityWithPhone.length;

const newUsers = useMemo(() => {
const monthStart = startOfMonth();
return uniqueParticipants.filter((row) => {
const date = toDate(row.created_at);
return date ? date >= monthStart : false;
});
}, [uniqueParticipants]);

const totalParticipants = useMemo(() => uniqueParticipants.length, [uniqueParticipants]);

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

const filteredParticipantKeys = useMemo(() => {
const set = new Set<string>();
filteredParticipants.forEach((row) => {
const key = row.user_id || row.email || row.phone || row.id || "";
if (key) set.add(key);
});
return set;
}, [filteredParticipants]);

const displayActivity = useMemo(() => {
if (!participantSearch.trim()) return filteredActivity;
return filteredActivity.filter((row) => {
const key = row.user_id || row.email || row.phone || row.id || "";
return key ? filteredParticipantKeys.has(key) : false;
});
}, [filteredActivity, filteredParticipantKeys, participantSearch]);

const totalNewUsers = newUsers.length;
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

const totalActivitiesCompleted = eventTypeGroups.completions;

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

const participantLogins = useMemo(() => {
return displayActivity.filter((row) => {
const event = (row.event_type || "").toLowerCase();
return event.includes("login") || event === "signed_in";
}).length;
}, [displayActivity]);

const liveFeed = useMemo(() => displayActivity.slice(0, 100), [displayActivity]);

const historyFeed = useMemo(() => {
const search = historyParticipantSearch.trim().toLowerCase();

return activityWithPhone.filter((row) => {
const participant = (row.full_name || "").toLowerCase();
const email = (row.email || "").toLowerCase();
const phone = (row.phone || "").toLowerCase();
const toolName = (row.tool_name || "").toLowerCase();
const rowDate = toDate(row.created_at);

const matchesSearch =
!search ||
participant.includes(search) ||
email.includes(search) ||
phone.includes(search);

const matchesTool = historyToolFilter === "all" || toolName === historyToolFilter;

const matchesDate =
(!historyStart || (rowDate && rowDate >= historyStart)) &&
(!historyEnd || (rowDate && rowDate <= historyEnd));

return matchesSearch && matchesTool && matchesDate;
});
}, [activityWithPhone, historyParticipantSearch, historyToolFilter, historyStart, historyEnd]);

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
.sort((a, b) => b.count - a.count);
}, [trackedTools, toolCounts]);

const maxTrendCount = dailyTrend.length ? Math.max(...dailyTrend.map((d) => d.count)) : 1;
const maxToolCount = toolBreakdown.length ? Math.max(...toolBreakdown.map((d) => d.count)) : 1;

const selectedParticipantOptions = useMemo(() => {
return filteredParticipants.map((row) => ({
key: row.user_id || row.email || row.phone || row.id || "",
name: row.full_name || row.email || row.phone || "Participant",
email: row.email || "",
phone: row.phone || "",
}));
}, [filteredParticipants]);

const selectedParticipantActivity = useMemo(() => {
if (!supportParticipantKey) return [];
return activityWithPhone.filter((row) => {
const key = row.user_id || row.email || row.phone || row.id || "";
return key === supportParticipantKey;
});
}, [activityWithPhone, supportParticipantKey]);

const selectedParticipantLatestActivity = selectedParticipantActivity[0] || null;
const selectedParticipantCareerMap = selectedParticipantActivity.find(
(row) => (row.tool_name || "").toLowerCase() === "career_map"
);
const selectedParticipantJobLog = selectedParticipantActivity.find(
(row) => (row.tool_name || "").toLowerCase() === "job_log_generator"
);

const supportActionsFiltered = useMemo(() => {
const q = participantSearch.trim().toLowerCase();
if (!q) return supportActions;
return supportActions.filter((item) => {
return (
item.participantName.toLowerCase().includes(q) ||
(item.participantEmail || "").toLowerCase().includes(q) ||
(item.participantPhone || "").toLowerCase().includes(q)
);
});
}, [supportActions, participantSearch]);

const selectedOutcome = useMemo(() => {
if (!outcomeParticipantKey) return null;
return (
participantOutcomes.find((item) => item.participantKey === outcomeParticipantKey) || null
);
}, [participantOutcomes, outcomeParticipantKey]);

useEffect(() => {
if (!selectedOutcome) {
setStartedWorkingDate("");
setCompany("");
setPosition("");
setWorkLocation("");
setStartedTrainingDate("");
setProgram("");
setTrainingLocation("");
setOutcomeNotes("");
return;
}

setStartedWorkingDate(selectedOutcome.startedWorkingDate || "");
setCompany(selectedOutcome.company || "");
setPosition(selectedOutcome.position || "");
setWorkLocation(selectedOutcome.workLocation || "");
setStartedTrainingDate(selectedOutcome.startedTrainingDate || "");
setProgram(selectedOutcome.program || "");
setTrainingLocation(selectedOutcome.trainingLocation || "");
setOutcomeNotes(selectedOutcome.notes || "");
}, [selectedOutcome]);

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
participantEmail: supportParticipantEmail,
participantPhone: supportParticipantPhone,
title: supportTitle.trim(),
message: supportMessage.trim(),
dueDate: supportDueDate || undefined,
status: "Open",
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

function toggleSupportActionStatus(id: string) {
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

function saveParticipantOutcome() {
if (!outcomeParticipantKey || !outcomeParticipantName) {
setMessage("Please select a participant before saving outcomes.");
return;
}

const nextRecord: ParticipantOutcome = {
id: selectedOutcome?.id || `outcome-${Date.now()}`,
participantKey: outcomeParticipantKey,
participantName: outcomeParticipantName,
participantEmail: outcomeParticipantEmail,
participantPhone: outcomeParticipantPhone,
startedWorkingDate: startedWorkingDate || undefined,
company: company.trim() || undefined,
position: position.trim() || undefined,
workLocation: workLocation.trim() || undefined,
startedTrainingDate: startedTrainingDate || undefined,
program: program.trim() || undefined,
trainingLocation: trainingLocation.trim() || undefined,
notes: outcomeNotes.trim() || undefined,
updatedAt: new Date().toISOString(),
};

const others = participantOutcomes.filter((item) => item.participantKey !== outcomeParticipantKey);
persistOutcomes([nextRecord, ...others]);
setMessage("Participant outcome saved.");
}

function printFeed(rows: DisplayActivityRow[], title: string) {
const printWindow = window.open("", "_blank", "width=1100,height=1400");
if (!printWindow) {
alert("Pop-up blocked. Please allow pop-ups and try again.");
return;
}

const html = `
<!doctype html>
<html>
<head>
<title>${title}</title>
<style>
body { font-family: Arial, sans-serif; padding: 32px; color: #111827; line-height: 1.6; }
h1 { margin: 0 0 8px; font-size: 28px; }
p { margin: 0 0 8px; }
table { width: 100%; border-collapse: collapse; margin-top: 18px; }
th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
th { background: #f3f4f6; }
</style>
</head>
<body>
<h1>${title}</h1>
<p><strong>Organization:</strong> ${partner?.organization_name || "—"}</p>
<p><strong>Referral Code:</strong> ${partner?.referral_code || "—"}</p>
<p><strong>Reporting Window:</strong> ${
rangeMode === "custom" && customStartDate && customEndDate
? `${customStartDate} to ${customEndDate}`
: periodLabel(period)
}</p>

<table>
<thead>
<tr>
<th>Date</th>
<th>Participant</th>
<th>Email</th>
<th>Phone</th>
<th>Tool</th>
<th>Event</th>
<th>Page</th>
</tr>
</thead>
<tbody>
${
rows.length
? rows
.map(
(row) => `
<tr>
<td>${formatDate(row.created_at)}</td>
<td>${row.full_name || "—"}</td>
<td>${row.email || "—"}</td>
<td>${row.phone || "—"}</td>
<td>${row.tool_name || "—"}</td>
<td>${row.event_type || "—"}</td>
<td>${row.page_name || "—"}</td>
</tr>`
)
.join("")
: `<tr><td colspan="7">No activity found.</td></tr>`
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
<h1 style={styles.title}>{partner?.organization_name || "Partner"} Live Reporting</h1>
<p style={styles.subtitle}>
Account Holder: <strong>{partner?.account_holder || partner?.contact_name || "—"}</strong>
</p>
<p style={styles.subtleLine}>Title: {partner?.title || partner?.contact_title || "—"}</p>
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
<p style={styles.sectionKicker}>Dashboard Navigation</p>
<h2 style={styles.sectionTitle}>Overview and reporting sections</h2>
</div>
</div>

<div style={styles.tabRow}>
{[
{ key: "overview", label: "Overview" },
{ key: "live", label: "Live Feed" },
{ key: "history", label: "Past Activity" },
{ key: "tools", label: "Tool Monitoring" },
{ key: "support", label: "Support Actions" },
].map((tab) => (
<button
key={tab.key}
type="button"
onClick={() => setActiveTab(tab.key as DashboardTab)}
style={{
...styles.tabButton,
...(activeTab === tab.key ? styles.tabButtonActive : {}),
}}
>
{tab.label}
</button>
))}
</div>
</section>

{activeTab !== "history" ? (
<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>Participant Filters</p>
<InfoBubble
title="Participant Filters"
text="Search participants tied to this referral code by name, email, or phone number. Total Participants is the lifetime referral-code count and does not reset."
/>
</div>
<h2 style={styles.sectionTitle}>Participant lookup</h2>
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
</div>
</section>
) : null}
{activeTab === "overview" ? (
<>
<section style={styles.summaryGrid}>
<div style={styles.metricCardBlue}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Total Participants</p>
</div>
<p style={styles.summaryValue}>{totalParticipants}</p>
</div>

<div style={styles.metricCardGreen}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>New Users</p>
</div>
<p style={styles.summaryValue}>{totalNewUsers}</p>
</div>

<div style={styles.metricCardNeutral}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Total Activities Completed</p>
</div>
<p style={styles.summaryValue}>{totalActivitiesCompleted}</p>
</div>

<div style={styles.metricCardGreen}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Login Events</p>
</div>
<p style={styles.summaryValue}>{participantLogins}</p>
</div>

<div style={styles.metricCardPurple}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>HireMinds Total Uses</p>
</div>
<p style={styles.summaryValue}>{totalHireMindsUsesReference}</p>
</div>

<div style={styles.metricCardAmber}>
<div style={styles.metricTop}>
<p style={styles.summaryLabel}>Page Views</p>
</div>
<p style={styles.summaryValue}>{eventTypeGroups.pageViews}</p>
</div>
</section>

<section style={styles.graphGrid}>
<div style={styles.cardInset}>
<div style={styles.titleRow}>
<div>
<p style={styles.sectionKicker}>Trend View</p>
<h2 style={styles.sectionTitle}>Activity over time</h2>
</div>
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

<div style={styles.cardInset}>
<div style={styles.titleRow}>
<div>
<p style={styles.sectionKicker}>Total Activity</p>
<h2 style={styles.sectionTitle}>Selected period view</h2>
</div>
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
<p style={styles.referenceLabel}>Last updated</p>
<p style={styles.referenceValueSmall}>{lastUpdated || "—"}</p>
</div>
</div>
</div>
</section>
</>
) : null}

{activeTab === "live" ? (
<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>Current Activity</p>
<InfoBubble
title="Live Reporting Feed"
text="This stream shows the most recent tracked participant activity for this partner referral code and selected reporting range."
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
<button
type="button"
onClick={() => printFeed(liveFeed.slice(0, 100), "Live Reporting Feed")}
style={styles.secondaryButton}
>
Print Feed
</button>
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
<th style={styles.th}>Email</th>
<th style={styles.th}>Phone</th>
<th style={styles.th}>Tool</th>
<th style={styles.th}>Event</th>
<th style={styles.th}>Page</th>
</tr>
</thead>
<tbody>
{liveFeed.map((row, index) => {
const rowKey = row.id || `${row.user_id || row.email || row.phone || "activity"}-${index}`;
return (
<tr key={rowKey}>
<td style={styles.td}>{formatDate(row.created_at)}</td>
<td style={styles.td}>{row.full_name || "—"}</td>
<td style={styles.td}>{row.email || "—"}</td>
<td style={styles.td}>{row.phone || "—"}</td>
<td style={styles.td}>{row.tool_name || "—"}</td>
<td style={styles.td}>{row.event_type || "—"}</td>
<td style={styles.td}>{row.page_name || "—"}</td>
</tr>
);
})}
</tbody>
</table>
</div>
)}
</section>
) : null}

{activeTab === "history" ? (
<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Past Activities</p>
<h2 style={styles.sectionTitle}>Historical activity reference</h2>
</div>

<div style={styles.sectionActions}>
<button
type="button"
onClick={() => printFeed(historyFeed, "Past Activity Feed")}
style={styles.secondaryButton}
>
Print Feed
</button>
</div>
</div>

<div style={styles.historyFilterGrid}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Search by Name, Email, or Phone</label>
<input
value={historyParticipantSearch}
onChange={(e) => setHistoryParticipantSearch(e.target.value)}
placeholder="Search by name, email, or phone number"
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Tool Filter</label>
<select
value={historyToolFilter}
onChange={(e) => setHistoryToolFilter(e.target.value)}
style={styles.select}
>
<option value="all">All Tools</option>
{trackedTools.map((tool) => (
<option key={tool.key} value={tool.key}>
{tool.label}
</option>
))}
</select>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Start Date</label>
<input
type="date"
value={historyStartDate}
onChange={(e) => setHistoryStartDate(e.target.value)}
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>End Date</label>
<input
type="date"
value={historyEndDate}
onChange={(e) => setHistoryEndDate(e.target.value)}
style={styles.input}
/>
</div>
</div>

<div style={styles.liveFeedWrap}>
<table style={styles.table}>
<thead>
<tr>
<th style={styles.th}>Date</th>
<th style={styles.th}>Participant</th>
<th style={styles.th}>Email</th>
<th style={styles.th}>Phone</th>
<th style={styles.th}>Tool</th>
<th style={styles.th}>Event</th>
<th style={styles.th}>Page</th>
</tr>
</thead>
<tbody>
{historyFeed.length ? (
historyFeed.map((row, index) => {
const rowKey = row.id || `${row.user_id || row.email || row.phone || "history"}-${index}`;
return (
<tr key={rowKey}>
<td style={styles.td}>{formatDate(row.created_at)}</td>
<td style={styles.td}>{row.full_name || "—"}</td>
<td style={styles.td}>{row.email || "—"}</td>
<td style={styles.td}>{row.phone || "—"}</td>
<td style={styles.td}>{row.tool_name || "—"}</td>
<td style={styles.td}>{row.event_type || "—"}</td>
<td style={styles.td}>{row.page_name || "—"}</td>
</tr>
);
})
) : (
<tr>
<td style={styles.td} colSpan={7}>
No historical activity matched the current filters.
</td>
</tr>
)}
</tbody>
</table>
</div>
</section>
) : null}

{activeTab === "tools" ? (
<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Tool Monitoring</p>
<h2 style={styles.sectionTitle}>All tracked tools</h2>
</div>
</div>

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
width: `${maxToolCount === 0 ? 8 : Math.max((item.count / maxToolCount) * 100, 8)}%`,
}}
/>
</div>
<div style={styles.horizontalCount}>{item.count}</div>
</div>
);
})}
</div>

<div style={styles.toolGrid}>
{toolBreakdown.map((item) => (
<div key={item.key} style={styles.toolCard}>
<p style={styles.toolCardLabel}>{item.label}</p>
<p style={styles.toolCardValue}>{item.count}</p>
</div>
))}
</div>
</section>
) : null}

{activeTab === "support" ? (
<>
<section style={styles.card}>
<div style={styles.sectionTop}>
<div style={styles.titleRow}>
<div>
<p style={styles.sectionKicker}>Partner Support</p>
<h2 style={styles.sectionTitle}>Assign tasks, nudges, and reminders</h2>
</div>
<InfoBubble
title="Partner Support"
text="Use this section to save partner follow-up actions for participants attached to this referral code. In this version, support actions are stored in the current browser until a dedicated database table is added."
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
setSupportParticipantEmail(match?.email || "");
setSupportParticipantPhone(match?.phone || "");
}}
style={styles.select}
>
<option value="">
{selectedParticipantOptions.length
? "Select participant"
: "No participants match current filter"}
</option>
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

{supportParticipantKey ? (
<div style={styles.selectedParticipantCard}>
<div style={styles.selectedParticipantGrid}>
<div style={styles.selectedParticipantItem}>
<p style={styles.selectedParticipantLabel}>Selected Participant</p>
<p style={styles.selectedParticipantValue}>{supportParticipantName || "—"}</p>
</div>
<div style={styles.selectedParticipantItem}>
<p style={styles.selectedParticipantLabel}>Email</p>
<p style={styles.selectedParticipantValue}>{supportParticipantEmail || "—"}</p>
</div>
<div style={styles.selectedParticipantItem}>
<p style={styles.selectedParticipantLabel}>Phone</p>
<p style={styles.selectedParticipantValue}>{supportParticipantPhone || "—"}</p>
</div>
<div style={styles.selectedParticipantItem}>
<p style={styles.selectedParticipantLabel}>Latest Activity</p>
<p style={styles.selectedParticipantValue}>
{selectedParticipantLatestActivity
? `${selectedParticipantLatestActivity.tool_name || "—"} • ${selectedParticipantLatestActivity.event_type || "—"} • ${formatDate(selectedParticipantLatestActivity.created_at)}`
: "No tracked activity yet."}
</p>
</div>
<div style={styles.selectedParticipantItem}>
<p style={styles.selectedParticipantLabel}>Latest Career Map Activity</p>
<p style={styles.selectedParticipantValue}>
{selectedParticipantCareerMap
? `${selectedParticipantCareerMap.event_type || "—"} • ${formatDate(selectedParticipantCareerMap.created_at)}`
: "No Career Map activity found."}
</p>
</div>
<div style={styles.selectedParticipantItem}>
<p style={styles.selectedParticipantLabel}>Latest Job Log Activity</p>
<p style={styles.selectedParticipantValue}>
{selectedParticipantJobLog
? `${selectedParticipantJobLog.event_type || "—"} • ${formatDate(selectedParticipantJobLog.created_at)}`
: "No Job Log activity found."}
</p>
</div>
</div>
</div>
) : null}

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
{item.participantName}
{item.participantEmail ? ` • ${item.participantEmail}` : ""}
{item.participantPhone ? ` • ${item.participantPhone}` : ""}
{" • "}Created {formatDate(item.createdAt)} • Due{" "}
{item.dueDate ? formatShortDate(item.dueDate) : "—"}
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
<p style={styles.sectionKicker}>Participant Outcomes</p>
<h2 style={styles.sectionTitle}>Employment and training outcomes</h2>
</div>
<InfoBubble
title="Participant Outcomes"
text="Track when a participant starts work, school, or training. This is stored in the current browser for this partner account until a dedicated database table is added."
/>
</div>
</div>

<div style={styles.manualStatsGrid}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Participant</label>
<select
value={outcomeParticipantKey}
onChange={(e) => {
const key = e.target.value;
const match = selectedParticipantOptions.find((item) => item.key === key);
setOutcomeParticipantKey(key);
setOutcomeParticipantName(match?.name || "");
setOutcomeParticipantEmail(match?.email || "");
setOutcomeParticipantPhone(match?.phone || "");
}}
style={styles.select}
>
<option value="">
{selectedParticipantOptions.length
? "Select participant"
: "No participants match current filter"}
</option>
{selectedParticipantOptions.map((item) => (
<option key={item.key} value={item.key}>
{item.name}
</option>
))}
</select>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Started Working Date</label>
<input
type="date"
value={startedWorkingDate}
onChange={(e) => setStartedWorkingDate(e.target.value)}
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Company</label>
<input
value={company}
onChange={(e) => setCompany(e.target.value)}
style={styles.input}
placeholder="Employer or company name"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Position</label>
<input
value={position}
onChange={(e) => setPosition(e.target.value)}
style={styles.input}
placeholder="Job title or role"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Work Location</label>
<input
value={workLocation}
onChange={(e) => setWorkLocation(e.target.value)}
style={styles.input}
placeholder="City, state, site, or employer location"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Started School / Training Date</label>
<input
type="date"
value={startedTrainingDate}
onChange={(e) => setStartedTrainingDate(e.target.value)}
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Program / School / Training</label>
<input
value={program}
onChange={(e) => setProgram(e.target.value)}
style={styles.input}
placeholder="Program, school, course, or credential"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Training Location</label>
<input
value={trainingLocation}
onChange={(e) => setTrainingLocation(e.target.value)}
style={styles.input}
placeholder="Provider, campus, city, or site"
/>
</div>

<div style={{ ...styles.fieldWrap, gridColumn: "1 / -1" }}>
<label style={styles.label}>Notes</label>
<textarea
value={outcomeNotes}
onChange={(e) => setOutcomeNotes(e.target.value)}
style={styles.textarea}
placeholder="Add any employment, school, or training notes here."
/>
</div>
</div>

<div style={styles.notesActions}>
<button type="button" onClick={saveParticipantOutcome} style={styles.secondaryButton}>
Save Participant Outcome
</button>
</div>

{selectedOutcome ? (
<div style={styles.outcomePreviewCard}>
<div style={styles.outcomePreviewGrid}>
<div style={styles.outcomePreviewItem}>
<p style={styles.outcomePreviewLabel}>Participant</p>
<p style={styles.outcomePreviewValue}>{selectedOutcome.participantName || "—"}</p>
</div>
<div style={styles.outcomePreviewItem}>
<p style={styles.outcomePreviewLabel}>Employment</p>
<p style={styles.outcomePreviewValue}>
{selectedOutcome.startedWorkingDate || selectedOutcome.company || selectedOutcome.position
? `${selectedOutcome.startedWorkingDate || "—"} • ${selectedOutcome.company || "—"} • ${selectedOutcome.position || "—"}`
: "No employment outcome saved."}
</p>
</div>
<div style={styles.outcomePreviewItem}>
<p style={styles.outcomePreviewLabel}>Training / School</p>
<p style={styles.outcomePreviewValue}>
{selectedOutcome.startedTrainingDate || selectedOutcome.program
? `${selectedOutcome.startedTrainingDate || "—"} • ${selectedOutcome.program || "—"}`
: "No school or training outcome saved."}
</p>
</div>
<div style={styles.outcomePreviewItem}>
<p style={styles.outcomePreviewLabel}>Last Updated</p>
<p style={styles.outcomePreviewValue}>{formatDate(selectedOutcome.updatedAt)}</p>
</div>
</div>
</div>
) : null}
</section>
</>
) : null}
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
cardInset: {
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
historyFilterGrid: {
display: "grid",
gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
gap: "16px",
marginBottom: "18px",
},
tabRow: {
display: "flex",
gap: "10px",
flexWrap: "wrap",
},
tabButton: {
padding: "10px 14px",
borderRadius: "999px",
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
minWidth: "160px",
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
referenceValueSmall: {
margin: 0,
color: "#eff6ff",
fontSize: "16px",
fontWeight: 700,
lineHeight: 1.2,
},
liveFeedWrap: {
maxHeight: "480px",
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
toolGrid: {
marginTop: "22px",
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
toolCardLabel: {
margin: "0 0 8px",
color: "#d4d4d8",
fontSize: "13px",
},
toolCardValue: {
margin: 0,
color: "#fff",
fontSize: "28px",
fontWeight: 700,
},
manualStatsGrid: {
marginTop: "16px",
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
selectedParticipantCard: {
marginTop: "18px",
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "18px",
background: "#101010",
},
selectedParticipantGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr 1fr",
gap: "14px",
},
selectedParticipantItem: {
border: "1px solid #242424",
borderRadius: "16px",
padding: "14px",
background: "#0d0d0f",
},
selectedParticipantLabel: {
margin: "0 0 8px",
color: "#93c5fd",
fontSize: "12px",
fontWeight: 700,
textTransform: "uppercase",
letterSpacing: "0.06em",
},
selectedParticipantValue: {
margin: 0,
color: "#f5f5f5",
fontSize: "14px",
lineHeight: 1.6,
},
outcomePreviewCard: {
marginTop: "18px",
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "18px",
background: "#101010",
},
outcomePreviewGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr 1fr 1fr",
gap: "14px",
},
outcomePreviewItem: {
border: "1px solid #242424",
borderRadius: "16px",
padding: "14px",
background: "#0d0d0f",
},
outcomePreviewLabel: {
margin: "0 0 8px",
color: "#93c5fd",
fontSize: "12px",
fontWeight: 700,
textTransform: "uppercase",
letterSpacing: "0.06em",
},
outcomePreviewValue: {
margin: 0,
color: "#f5f5f5",
fontSize: "14px",
lineHeight: 1.6,
},
};
