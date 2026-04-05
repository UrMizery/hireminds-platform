"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../../lib/supabase";

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

type CareerMapNote = {
participantKey: string;
participantName: string;
participantEmail?: string;
participantPhone?: string;
currentPosition?: string;
targetRole?: string;
targetIndustry?: string;
shortTermGoal?: string;
oneYearGoal?: string;
threeYearGoal?: string;
endGoal?: string;
strengths?: string;
barriers?: string;
actionSteps?: string;
toolkitPlan?: string;
partnerNotes?: string;
updatedAt: string;
};

type CareerMapRequest = {
id: string;
participantKey: string;
participantName: string;
participantEmail?: string;
participantPhone?: string;
message: string;
status: "Requested" | "Completed";
createdAt: string;
};

type ManualTouchpoint = {
id: string;
participantKey: string;
participantName: string;
note: string;
createdAt: string;
};

function formatDate(value?: string | null) {
if (!value) return "—";
const date = new Date(value);
if (Number.isNaN(date.getTime())) return value;
return date.toLocaleString();
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

export default function PartnerCareerMapPage() {
const [loading, setLoading] = useState(true);
const [loadingLogout, setLoadingLogout] = useState(false);
const [message, setMessage] = useState("");
const [partner, setPartner] = useState<PartnerRow | null>(null);
const [participants, setParticipants] = useState<ParticipantRow[]>([]);
const [activity, setActivity] = useState<ActivityRow[]>([]);
const [participantSearch, setParticipantSearch] = useState("");

const [selectedParticipantKey, setSelectedParticipantKey] = useState("");
const [selectedParticipantName, setSelectedParticipantName] = useState("");
const [selectedParticipantEmail, setSelectedParticipantEmail] = useState("");
const [selectedParticipantPhone, setSelectedParticipantPhone] = useState("");

const [careerMapNotes, setCareerMapNotes] = useState<CareerMapNote[]>([]);
const [careerMapRequests, setCareerMapRequests] = useState<CareerMapRequest[]>([]);
const [manualTouchpoints, setManualTouchpoints] = useState<ManualTouchpoint[]>([]);

const [currentPosition, setCurrentPosition] = useState("");
const [targetRole, setTargetRole] = useState("");
const [targetIndustry, setTargetIndustry] = useState("");
const [shortTermGoal, setShortTermGoal] = useState("");
const [oneYearGoal, setOneYearGoal] = useState("");
const [threeYearGoal, setThreeYearGoal] = useState("");
const [endGoal, setEndGoal] = useState("");
const [strengths, setStrengths] = useState("");
const [barriers, setBarriers] = useState("");
const [actionSteps, setActionSteps] = useState("");
const [toolkitPlan, setToolkitPlan] = useState("");
const [partnerNotes, setPartnerNotes] = useState("");

const [requestMessage, setRequestMessage] = useState(
"Please complete your Career Map / Career Plan in HireMinds so we can review your goals, next steps, and support needs together."
);
const [touchpointNote, setTouchpointNote] = useState("");

const mountedRef = useRef(true);

const notesStorageKey = useMemo(() => {
const code = partner?.referral_code || "partner";
return `hireminds-career-map-notes-${code}`;
}, [partner?.referral_code]);

const requestsStorageKey = useMemo(() => {
const code = partner?.referral_code || "partner";
return `hireminds-career-map-requests-${code}`;
}, [partner?.referral_code]);

const touchpointsStorageKey = useMemo(() => {
const code = partner?.referral_code || "partner";
return `hireminds-career-map-touchpoints-${code}`;
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
setCareerMapNotes(Array.isArray(parsed) ? parsed : []);
} else {
setCareerMapNotes([]);
}
} catch {
setCareerMapNotes([]);
}
}, [notesStorageKey]);

useEffect(() => {
try {
const raw = window.localStorage.getItem(requestsStorageKey);
if (raw) {
const parsed = JSON.parse(raw);
setCareerMapRequests(Array.isArray(parsed) ? parsed : []);
} else {
setCareerMapRequests([]);
}
} catch {
setCareerMapRequests([]);
}
}, [requestsStorageKey]);

useEffect(() => {
try {
const raw = window.localStorage.getItem(touchpointsStorageKey);
if (raw) {
const parsed = JSON.parse(raw);
setManualTouchpoints(Array.isArray(parsed) ? parsed : []);
} else {
setManualTouchpoints([]);
}
} catch {
setManualTouchpoints([]);
}
}, [touchpointsStorageKey]);

function persistCareerMapNotes(next: CareerMapNote[]) {
setCareerMapNotes(next);
try {
window.localStorage.setItem(notesStorageKey, JSON.stringify(next));
} catch {
setMessage("Unable to save career map notes in this browser.");
}
}

function persistRequests(next: CareerMapRequest[]) {
setCareerMapRequests(next);
try {
window.localStorage.setItem(requestsStorageKey, JSON.stringify(next));
} catch {
setMessage("Unable to save requests in this browser.");
}
}

function persistTouchpoints(next: ManualTouchpoint[]) {
setManualTouchpoints(next);
try {
window.localStorage.setItem(touchpointsStorageKey, JSON.stringify(next));
} catch {
setMessage("Unable to save touchpoints in this browser.");
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
setMessage("This account does not have partner career map access.");
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

const participantOptions = useMemo(() => {
return filteredParticipants.map((row) => ({
key: row.user_id || row.email || row.phone || row.id || "",
name: row.full_name || row.email || row.phone || "Participant",
email: row.email || "",
phone: row.phone || "",
}));
}, [filteredParticipants]);

const selectedParticipantActivity = useMemo(() => {
if (!selectedParticipantKey) return [];

return activity.filter((row) => {
const rowKey = row.user_id || row.email || row.id || "";
return rowKey === selectedParticipantKey;
});
}, [activity, selectedParticipantKey]);

const selectedParticipantCareerMapActivity = useMemo(() => {
return selectedParticipantActivity.filter((row) => {
const toolName = (row.tool_name || "").toLowerCase();
const pageName = (row.page_name || "").toLowerCase();

return (
toolName === "career_map" ||
pageName.includes("career-map") ||
pageName.includes("career map")
);
});
}, [selectedParticipantActivity]);

const latestCareerMapActivity = selectedParticipantCareerMapActivity[0] || null;

const selectedParticipantNote = useMemo(() => {
if (!selectedParticipantKey) return null;
return careerMapNotes.find((item) => item.participantKey === selectedParticipantKey) || null;
}, [careerMapNotes, selectedParticipantKey]);

const selectedParticipantRequests = useMemo(() => {
if (!selectedParticipantKey) return [];
return careerMapRequests.filter((item) => item.participantKey === selectedParticipantKey);
}, [careerMapRequests, selectedParticipantKey]);

const selectedParticipantManualTouchpoints = useMemo(() => {
if (!selectedParticipantKey) return [];
return manualTouchpoints.filter((item) => item.participantKey === selectedParticipantKey);
}, [manualTouchpoints, selectedParticipantKey]);

const trackedTouchpoints = useMemo(() => {
return selectedParticipantActivity.slice(0, 8);
}, [selectedParticipantActivity]);

const toolkitSuggestions = useMemo(
() => [
"Career Passport",
"Resume Generator",
"Guided Resume Generator",
"Cover Letter Generator",
"Interview Question Generator",
"Job Description Analyzer",
"Resume Match Analyzer",
"Industry Core Skills",
"Soft Skills",
"Job Log Generator",
"Budget Generator",
"Video Library",
],
[]
);

useEffect(() => {
if (!selectedParticipantNote) {
setCurrentPosition("");
setTargetRole("");
setTargetIndustry("");
setShortTermGoal("");
setOneYearGoal("");
setThreeYearGoal("");
setEndGoal("");
setStrengths("");
setBarriers("");
setActionSteps("");
setToolkitPlan("");
setPartnerNotes("");
return;
}

setCurrentPosition(selectedParticipantNote.currentPosition || "");
setTargetRole(selectedParticipantNote.targetRole || "");
setTargetIndustry(selectedParticipantNote.targetIndustry || "");
setShortTermGoal(selectedParticipantNote.shortTermGoal || "");
setOneYearGoal(selectedParticipantNote.oneYearGoal || "");
setThreeYearGoal(selectedParticipantNote.threeYearGoal || "");
setEndGoal(selectedParticipantNote.endGoal || "");
setStrengths(selectedParticipantNote.strengths || "");
setBarriers(selectedParticipantNote.barriers || "");
setActionSteps(selectedParticipantNote.actionSteps || "");
setToolkitPlan(selectedParticipantNote.toolkitPlan || "");
setPartnerNotes(selectedParticipantNote.partnerNotes || "");
}, [selectedParticipantNote]);

function saveCareerMapNote() {
if (!selectedParticipantKey || !selectedParticipantName) {
setMessage("Please select a participant before saving the career map.");
return;
}

const nextNote: CareerMapNote = {
participantKey: selectedParticipantKey,
participantName: selectedParticipantName,
participantEmail: selectedParticipantEmail,
participantPhone: selectedParticipantPhone,
currentPosition: currentPosition.trim() || undefined,
targetRole: targetRole.trim() || undefined,
targetIndustry: targetIndustry.trim() || undefined,
shortTermGoal: shortTermGoal.trim() || undefined,
oneYearGoal: oneYearGoal.trim() || undefined,
threeYearGoal: threeYearGoal.trim() || undefined,
endGoal: endGoal.trim() || undefined,
strengths: strengths.trim() || undefined,
barriers: barriers.trim() || undefined,
actionSteps: actionSteps.trim() || undefined,
toolkitPlan: toolkitPlan.trim() || undefined,
partnerNotes: partnerNotes.trim() || undefined,
updatedAt: new Date().toISOString(),
};

const others = careerMapNotes.filter((item) => item.participantKey !== selectedParticipantKey);
persistCareerMapNotes([nextNote, ...others]);
setMessage("Career map saved.");
}

function sendCareerMapRequest() {
if (!selectedParticipantKey || !selectedParticipantName) {
setMessage("Please select a participant before sending a request.");
return;
}

const nextRequest: CareerMapRequest = {
id: `cmr-${Date.now()}`,
participantKey: selectedParticipantKey,
participantName: selectedParticipantName,
participantEmail: selectedParticipantEmail,
participantPhone: selectedParticipantPhone,
message: requestMessage.trim() || "Please complete your Career Map / Career Plan in HireMinds.",
status: "Requested",
createdAt: new Date().toISOString(),
};

persistRequests([nextRequest, ...careerMapRequests]);
setMessage("Career map request saved.");
}

function addTouchpoint() {
if (!selectedParticipantKey || !selectedParticipantName || !touchpointNote.trim()) {
setMessage("Please select a participant and enter a touchpoint note.");
return;
}

const nextTouchpoint: ManualTouchpoint = {
id: `tp-${Date.now()}`,
participantKey: selectedParticipantKey,
participantName: selectedParticipantName,
note: touchpointNote.trim(),
createdAt: new Date().toISOString(),
};

persistTouchpoints([nextTouchpoint, ...manualTouchpoints]);
setTouchpointNote("");
setMessage("Touchpoint saved.");
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
<div style={styles.centerWrap}>Loading career map...</div>
</main>
);
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<div style={styles.heroTextWrap}>
<p style={styles.kicker}>Partner Career Planning</p>
<h1 style={styles.title}>Career Map & Career Plan</h1>
<p style={styles.subtitle}>
This page is designed like an intake + planning center. Partners can review touchpoints,
request that participants complete their own career plan, build a roadmap together, and connect the plan to HireMinds tools like resumes, interview prep, analyzers, and more.
</p>
<p style={styles.subtleLine}>Organization: {partner?.organization_name || "—"}</p>
<p style={styles.subtleLine}>Referral Code: {partner?.referral_code || "—"}</p>
</div>

<div style={styles.heroImageWrap}>
<img
src="/career-lightbulb.png"
alt="Career planning"
style={styles.heroImage}
/>
</div>
</section>

{message ? <div style={styles.notice}>{message}</div> : null}

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>How to Use This Page</p>
<InfoBubble
title="Career Map Page"
text="Use this page to select a participant, review activity and touchpoints, request they complete their own career plan, and build a roadmap using HireMinds tools."
/>
</div>
<h2 style={styles.sectionTitle}>Career map intake + planning workflow</h2>
</div>
</div>

<div style={styles.howToGrid}>
<div style={styles.howToCard}>
<p style={styles.howToStep}>1</p>
<p style={styles.howToText}>Select a participant and review their snapshot.</p>
</div>
<div style={styles.howToCard}>
<p style={styles.howToStep}>2</p>
<p style={styles.howToText}>Check touchpoints, activity, and previous planning notes.</p>
</div>
<div style={styles.howToCard}>
<p style={styles.howToStep}>3</p>
<p style={styles.howToText}>Request that they complete their own career map/plan in HireMinds.</p>
</div>
<div style={styles.howToCard}>
<p style={styles.howToStep}>4</p>
<p style={styles.howToText}>Build the roadmap together and connect it to toolkit resources.</p>
</div>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>Participant Search</p>
<InfoBubble
title="Participant Search"
text="Search by participant name, email, or phone number and then select the participant to review and build the career plan."
/>
</div>
<h2 style={styles.sectionTitle}>Select participant</h2>
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

<div style={styles.fieldWrap}>
<label style={styles.label}>Participant</label>
<select
value={selectedParticipantKey}
onChange={(e) => {
const key = e.target.value;
const match = participantOptions.find((item) => item.key === key);
setSelectedParticipantKey(key);
setSelectedParticipantName(match?.name || "");
setSelectedParticipantEmail(match?.email || "");
setSelectedParticipantPhone(match?.phone || "");
}}
style={styles.select}
>
<option value="">
{participantOptions.length ? "Select participant" : "No participants match current search"}
</option>
{participantOptions.map((item) => (
<option key={item.key} value={item.key}>
{item.name}
</option>
))}
</select>
</div>
</div>
</section>

{selectedParticipantKey ? (
<>
<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Participant Snapshot</p>
<h2 style={styles.sectionTitle}>Selected participant details</h2>
</div>
</div>

<div style={styles.snapshotGrid}>
<div style={styles.snapshotCard}>
<p style={styles.snapshotLabel}>Participant</p>
<p style={styles.snapshotValue}>{selectedParticipantName || "—"}</p>
</div>
<div style={styles.snapshotCard}>
<p style={styles.snapshotLabel}>Email</p>
<p style={styles.snapshotValue}>{selectedParticipantEmail || "—"}</p>
</div>
<div style={styles.snapshotCard}>
<p style={styles.snapshotLabel}>Phone</p>
<p style={styles.snapshotValue}>{selectedParticipantPhone || "—"}</p>
</div>
<div style={styles.snapshotCard}>
<p style={styles.snapshotLabel}>Latest Career Map Activity</p>
<p style={styles.snapshotValue}>
{latestCareerMapActivity
? `${latestCareerMapActivity.event_type || "—"} • ${formatDate(latestCareerMapActivity.created_at)}`
: "No Career Map activity found."}
</p>
</div>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Participant Request</p>
<h2 style={styles.sectionTitle}>Request participant to complete the career map</h2>
</div>
</div>

<div style={styles.requestGrid}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Request Message</label>
<textarea
value={requestMessage}
onChange={(e) => setRequestMessage(e.target.value)}
style={styles.textarea}
/>
</div>
</div>

<div style={styles.notesActions}>
<button type="button" onClick={sendCareerMapRequest} style={styles.secondaryButton}>
Save Career Map Request
</button>
</div>

<div style={styles.subSection}>
<p style={styles.subSectionTitle}>Request History</p>
{selectedParticipantRequests.length ? (
<div style={styles.requestList}>
{selectedParticipantRequests.map((item) => (
<div key={item.id} style={styles.requestCard}>
<p style={styles.requestMeta}>
{item.status} • {formatDate(item.createdAt)}
</p>
<p style={styles.requestBody}>{item.message}</p>
</div>
))}
</div>
) : (
<p style={styles.emptyText}>No saved requests yet.</p>
)}
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Career Roadmap</p>
<h2 style={styles.sectionTitle}>Build the plan visually</h2>
</div>
</div>

<div style={styles.roadmapWrap}>
<div style={styles.roadmapStep}>
<span style={styles.roadmapStepLabel}>Current Position</span>
<span style={styles.roadmapStepValue}>{currentPosition || "Not set"}</span>
</div>
<div style={styles.roadmapArrow}>→</div>
<div style={styles.roadmapStep}>
<span style={styles.roadmapStepLabel}>Short-Term</span>
<span style={styles.roadmapStepValue}>{shortTermGoal || "Not set"}</span>
</div>
<div style={styles.roadmapArrow}>→</div>
<div style={styles.roadmapStep}>
<span style={styles.roadmapStepLabel}>1-Year</span>
<span style={styles.roadmapStepValue}>{oneYearGoal || "Not set"}</span>
</div>
<div style={styles.roadmapArrow}>→</div>
<div style={styles.roadmapStep}>
<span style={styles.roadmapStepLabel}>3-Year</span>
<span style={styles.roadmapStepValue}>{threeYearGoal || "Not set"}</span>
</div>
<div style={styles.roadmapArrow}>→</div>
<div style={styles.roadmapStep}>
<span style={styles.roadmapStepLabel}>End Goal</span>
<span style={styles.roadmapStepValue}>{endGoal || "Not set"}</span>
</div>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>Career Plan Builder</p>
<InfoBubble
title="Career Plan Builder"
text="Use this section to build a plan with the participant. Connect goals to resumes, interview prep, analyzers, skills, and other HireMinds tools."
/>
</div>
<h2 style={styles.sectionTitle}>Build the plan</h2>
</div>
</div>

<div style={styles.noteGrid}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Current Position</label>
<input
value={currentPosition}
onChange={(e) => setCurrentPosition(e.target.value)}
style={styles.input}
placeholder="Example: Warehouse Associate"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Target Role</label>
<input
value={targetRole}
onChange={(e) => setTargetRole(e.target.value)}
style={styles.input}
placeholder="Example: Medical Assistant"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Target Industry</label>
<input
value={targetIndustry}
onChange={(e) => setTargetIndustry(e.target.value)}
style={styles.input}
placeholder="Example: Healthcare"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Short-Term Goal</label>
<textarea
value={shortTermGoal}
onChange={(e) => setShortTermGoal(e.target.value)}
style={styles.textarea}
placeholder="What should happen first?"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>1-Year Goal</label>
<textarea
value={oneYearGoal}
onChange={(e) => setOneYearGoal(e.target.value)}
style={styles.textarea}
placeholder="What should be true within 1 year?"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>3-Year Goal</label>
<textarea
value={threeYearGoal}
onChange={(e) => setThreeYearGoal(e.target.value)}
style={styles.textarea}
placeholder="What should be true within 3 years?"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>End Goal</label>
<textarea
value={endGoal}
onChange={(e) => setEndGoal(e.target.value)}
style={styles.textarea}
placeholder="What is the big end goal?"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Strengths</label>
<textarea
value={strengths}
onChange={(e) => setStrengths(e.target.value)}
style={styles.textarea}
placeholder="What strengths can help this participant move forward?"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Barriers / Challenges</label>
<textarea
value={barriers}
onChange={(e) => setBarriers(e.target.value)}
style={styles.textarea}
placeholder="What may slow down progress?"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Action Steps</label>
<textarea
value={actionSteps}
onChange={(e) => setActionSteps(e.target.value)}
style={styles.textarea}
placeholder="List next steps, checkpoints, or tasks"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>HireMinds Toolkit Plan</label>
<textarea
value={toolkitPlan}
onChange={(e) => setToolkitPlan(e.target.value)}
style={styles.textarea}
placeholder="Which HireMinds tools should this participant use as part of the plan?"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Partner Notes</label>
<textarea
value={partnerNotes}
onChange={(e) => setPartnerNotes(e.target.value)}
style={styles.textarea}
placeholder="Add observations, follow-up details, and planning notes"
/>
</div>
</div>

<div style={styles.notesActions}>
<button type="button" onClick={saveCareerMapNote} style={styles.secondaryButton}>
Save Career Map
</button>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Toolkit Support</p>
<h2 style={styles.sectionTitle}>HireMinds tools that can support the plan</h2>
</div>
</div>

<div style={styles.toolkitGrid}>
{toolkitSuggestions.map((tool) => (
<div key={tool} style={styles.toolkitCard}>
<p style={styles.toolkitCardText}>{tool}</p>
</div>
))}
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Touchpoints</p>
<h2 style={styles.sectionTitle}>Partner interaction history</h2>
</div>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Add Manual Touchpoint</label>
<textarea
value={touchpointNote}
onChange={(e) => setTouchpointNote(e.target.value)}
style={styles.textarea}
placeholder="Example: Reviewed resume goals, discussed healthcare pathway, assigned follow-up for certifications."
/>
</div>

<div style={styles.notesActions}>
<button type="button" onClick={addTouchpoint} style={styles.secondaryButton}>
Save Touchpoint
</button>
</div>

<div style={styles.touchpointGrid}>
<div style={styles.touchpointColumn}>
<p style={styles.subSectionTitle}>Tracked Activity Touchpoints</p>
{trackedTouchpoints.length ? (
trackedTouchpoints.map((row, index) => {
const key = row.id || `${row.user_id || row.email || "tracked"}-${index}`;
return (
<div key={key} style={styles.touchpointCard}>
<p style={styles.touchpointMeta}>{formatDate(row.created_at)}</p>
<p style={styles.touchpointBody}>
{(row.tool_name || "Activity")} • {(row.event_type || "—")} • {(row.page_name || "—")}
</p>
</div>
);
})
) : (
<p style={styles.emptyText}>No tracked touchpoints found.</p>
)}
</div>

<div style={styles.touchpointColumn}>
<p style={styles.subSectionTitle}>Manual Partner Touchpoints</p>
{selectedParticipantManualTouchpoints.length ? (
selectedParticipantManualTouchpoints.map((item) => (
<div key={item.id} style={styles.touchpointCard}>
<p style={styles.touchpointMeta}>{formatDate(item.createdAt)}</p>
<p style={styles.touchpointBody}>{item.note}</p>
</div>
))
) : (
<p style={styles.emptyText}>No manual touchpoints saved yet.</p>
)}
</div>
</div>
</section>
</>
) : (
<section style={styles.card}>
<p style={styles.emptyText}>
Select a participant to open their Career Map intake, roadmap, touchpoints, and toolkit planning area.
</p>
</section>
)}
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
maxWidth: "1480px",
margin: "0 auto",
display: "grid",
gap: "24px",
},
heroCard: {
display: "grid",
gridTemplateColumns: "1.4fr 0.8fr",
gap: "24px",
alignItems: "center",
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "28px",
},
heroTextWrap: {
display: "grid",
gap: "8px",
},
heroImageWrap: {
display: "flex",
justifyContent: "center",
alignItems: "center",
},
heroImage: {
width: "100%",
maxWidth: "420px",
maxHeight: "240px",
objectFit: "contain",
borderRadius: "18px",
border: "1px solid #2c2c2c",
background: "#ffffff",
padding: "10px",
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
lineHeight: 1.8,
},
subtleLine: {
margin: "4px 0 0",
color: "#a1a1aa",
fontSize: "14px",
},
headerActions: {
display: "flex",
gap: "12px",
flexWrap: "wrap",
alignItems: "center",
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
lineHeight: 1.15,
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
howToGrid: {
display: "grid",
gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
gap: "14px",
},
howToCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "18px",
background: "#101010",
},
howToStep: {
margin: "0 0 10px",
color: "#60a5fa",
fontSize: "26px",
fontWeight: 800,
},
howToText: {
margin: 0,
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.7,
},
filterGrid: {
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
select: {
padding: "12px 14px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "14px",
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
snapshotGrid: {
display: "grid",
gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
gap: "14px",
},
snapshotCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "16px",
background: "#101010",
},
snapshotLabel: {
margin: "0 0 8px",
color: "#93c5fd",
fontSize: "12px",
fontWeight: 700,
textTransform: "uppercase",
letterSpacing: "0.06em",
},
snapshotValue: {
margin: 0,
color: "#f5f5f5",
fontSize: "14px",
lineHeight: 1.6,
},
requestGrid: {
display: "grid",
gridTemplateColumns: "1fr",
gap: "16px",
},
notesActions: {
marginTop: "16px",
},
subSection: {
marginTop: "22px",
},
subSectionTitle: {
margin: "0 0 12px",
color: "#ffffff",
fontSize: "18px",
fontWeight: 700,
},
requestList: {
display: "grid",
gap: "12px",
},
requestCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "16px",
background: "#101010",
},
requestMeta: {
margin: "0 0 8px",
color: "#93c5fd",
fontSize: "13px",
fontWeight: 700,
},
requestBody: {
margin: 0,
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.7,
},
roadmapWrap: {
display: "grid",
gridTemplateColumns: "repeat(9, minmax(0, 1fr))",
gap: "10px",
alignItems: "center",
},
roadmapStep: {
minHeight: "110px",
border: "1px solid #2c2c2c",
borderRadius: "20px",
padding: "16px",
background: "linear-gradient(180deg, rgba(59,130,246,0.14) 0%, #101010 100%)",
display: "flex",
flexDirection: "column",
justifyContent: "center",
},
roadmapStepLabel: {
color: "#93c5fd",
fontSize: "12px",
fontWeight: 700,
textTransform: "uppercase",
letterSpacing: "0.06em",
marginBottom: "8px",
},
roadmapStepValue: {
color: "#f5f5f5",
fontSize: "14px",
lineHeight: 1.6,
},
roadmapArrow: {
color: "#60a5fa",
fontSize: "28px",
fontWeight: 800,
textAlign: "center",
},
noteGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "16px",
},
toolkitGrid: {
display: "grid",
gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
gap: "14px",
},
toolkitCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "16px",
background: "#101010",
minHeight: "90px",
display: "flex",
alignItems: "center",
justifyContent: "center",
textAlign: "center",
},
toolkitCardText: {
margin: 0,
color: "#f5f5f5",
fontSize: "15px",
fontWeight: 700,
lineHeight: 1.5,
},
touchpointGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "18px",
marginTop: "20px",
},
touchpointColumn: {
display: "grid",
gap: "12px",
alignContent: "start",
},
touchpointCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "16px",
background: "#101010",
},
touchpointMeta: {
margin: "0 0 8px",
color: "#93c5fd",
fontSize: "13px",
fontWeight: 700,
},
touchpointBody: {
margin: 0,
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.7,
},
emptyText: {
margin: 0,
color: "#c8c8c8",
fontSize: "15px",
lineHeight: 1.7,
},
};
