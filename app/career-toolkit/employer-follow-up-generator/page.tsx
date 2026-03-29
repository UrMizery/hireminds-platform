"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

type TemplateType =
| "thank-you"
| "follow-up-status"
| "withdraw-application"
| "accept-job-offer"
| "decline-job-offer"
| "request-interview-reschedule"
| "request-raise"
| "request-promotion"
| "request-pto"
| "request-extended-leave"
| "resignation-letter"
| "farewell-message"
| "new-position-introduction"
| "confidential-hr-concern"
| "report-workplace-incident";

const LETTER_DRAFT_KEY = "hireminds-house-of-letters-draft-v1";

export default function HouseOfLettersPage() {
const [template, setTemplate] = useState<TemplateType>("thank-you");
const [createdDate, setCreatedDate] = useState("");
const [effectiveDate, setEffectiveDate] = useState("");
const [candidateName, setCandidateName] = useState("");
const [employerName, setEmployerName] = useState("");
const [companyName, setCompanyName] = useState("");
const [jobTitle, setJobTitle] = useState("");
const [interviewDate, setInterviewDate] = useState("");
const [customNote, setCustomNote] = useState("");
const [message, setMessage] = useState("");
const [draftLoaded, setDraftLoaded] = useState(false);

const [userId, setUserId] = useState("");
const [referralCode, setReferralCode] = useState<string | null>(null);
const openTrackedRef = useRef(false);

useEffect(() => {
async function loadUserAndTrack() {
const { data, error } = await supabase.auth.getUser();

if (error || !data.user || openTrackedRef.current) return;

openTrackedRef.current = true;
setUserId(data.user.id);

const { data: profile } = await supabase
.from("candidate_profiles")
.select("full_name, email, referral_code")
.eq("user_id", data.user.id)
.maybeSingle();

setReferralCode(profile?.referral_code || null);

const { error: activityError } = await supabase
.from("user_activity")
.insert({
user_id: data.user.id,
full_name: profile?.full_name || null,
email: profile?.email || data.user.email || null,
referral_code: profile?.referral_code || null,
event_type: "tool_opened",
tool_name: "house_of_letters",
page_name: "/career-toolkit/house-of-letters",
});

if (activityError) {
console.error("House of Letters tracking error:", activityError);
}
}

loadUserAndTrack();
}, []);

useEffect(() => {
try {
const raw = window.localStorage.getItem(LETTER_DRAFT_KEY);
if (raw) {
const draft = JSON.parse(raw);
setTemplate(draft.template || "thank-you");
setCreatedDate(draft.createdDate || "");
setEffectiveDate(draft.effectiveDate || "");
setCandidateName(draft.candidateName || "");
setEmployerName(draft.employerName || "");
setCompanyName(draft.companyName || "");
setJobTitle(draft.jobTitle || "");
setInterviewDate(draft.interviewDate || "");
setCustomNote(draft.customNote || "");
}
} catch {
// ignore bad draft
} finally {
setDraftLoaded(true);
}
}, []);

useEffect(() => {
if (!draftLoaded) return;

const draft = {
template,
createdDate,
effectiveDate,
candidateName,
employerName,
companyName,
jobTitle,
interviewDate,
customNote,
};

window.localStorage.setItem(LETTER_DRAFT_KEY, JSON.stringify(draft));
}, [
draftLoaded,
template,
createdDate,
effectiveDate,
candidateName,
employerName,
companyName,
jobTitle,
interviewDate,
customNote,
]);

const subjectLine = useMemo(() => {
switch (template) {
case "thank-you":
return `Thank You - ${jobTitle || "Interview"}${companyName ? ` - ${companyName}` : ""}`;
case "follow-up-status":
return `Follow-Up on ${jobTitle || "Application"}${companyName ? ` - ${companyName}` : ""}`;
case "withdraw-application":
return `Withdrawal of Application${jobTitle ? ` - ${jobTitle}` : ""}`;
case "accept-job-offer":
return `Acceptance of Job Offer${jobTitle ? ` - ${jobTitle}` : ""}`;
case "decline-job-offer":
return `Declining Job Offer${jobTitle ? ` - ${jobTitle}` : ""}`;
case "request-interview-reschedule":
return `Request to Reschedule Interview${jobTitle ? ` - ${jobTitle}` : ""}`;
case "request-raise":
return "Request for Compensation Review";
case "request-promotion":
return "Request for Promotion Consideration";
case "request-pto":
return "Request for PTO";
case "request-extended-leave":
return "Request for Extended Leave / FMLA";
case "resignation-letter":
return "Resignation Letter";
case "farewell-message":
return "Farewell and Thank You";
case "new-position-introduction":
return "Introduction - Excited to Join the Team";
case "confidential-hr-concern":
return "Confidential HR Concern";
case "report-workplace-incident":
return "Report of Workplace Incident";
default:
return "Professional Letter";
}
}, [template, jobTitle, companyName]);

const bodyText = useMemo(() => {
const greetingName = employerName || "Hiring Manager";
const senderName = candidateName || "Your Name";
const roleText = jobTitle || "the position";
const companyText = companyName || "your company";
const dateText = interviewDate || "our recent conversation";
const createdText = createdDate || "today";
const effectiveText = effectiveDate || "the requested date";

switch (template) {
case "thank-you":
return `Dear ${greetingName},

Thank you for taking the time to speak with me regarding ${roleText} at ${companyText}. I appreciate the opportunity to learn more about the role and your team.

I enjoyed our conversation on ${dateText} and remain very interested in the opportunity. Our discussion confirmed my excitement about the role, and I would be grateful for the chance to contribute to your team.

${customNote ? `${customNote}\n\n` : ""}Thank you again for your time and consideration. I look forward to hearing from you.

Sincerely,
${senderName}`;

case "follow-up-status":
return `Dear ${greetingName},

I hope you are doing well. I wanted to follow up regarding ${roleText} at ${companyText} and see whether there have been any updates on the hiring process.

I remain very interested in the opportunity and appreciate the time you and your team have taken to review my application. I enjoyed speaking with you on ${dateText} and would be glad to provide any additional information if needed.

${customNote ? `${customNote}\n\n` : ""}Thank you again for your time and consideration. I look forward to hearing from you.

Sincerely,
${senderName}`;

case "withdraw-application":
return `Dear ${greetingName},

Thank you for considering me for ${roleText} at ${companyText}. After careful consideration, I would like to respectfully withdraw my application from consideration at this time.

${customNote ? `${customNote}\n\n` : ""}I appreciate the time and consideration extended to me and wish you continued success in filling the position.

Sincerely,
${senderName}`;

case "accept-job-offer":
return `Dear ${greetingName},

Thank you for offering me the opportunity to join ${companyText} as ${roleText}. I am pleased to formally accept the offer.

${customNote ? `${customNote}\n\n` : ""}I appreciate the confidence you and your team have placed in me, and I look forward to contributing to the organization.

Sincerely,
${senderName}`;

case "decline-job-offer":
return `Dear ${greetingName},

Thank you very much for offering me the opportunity to join ${companyText} as ${roleText}. After careful consideration, I have decided to respectfully decline the offer at this time.

${customNote ? `${customNote}\n\n` : ""}I sincerely appreciate your time, consideration, and the opportunity to learn more about your team.

Sincerely,
${senderName}`;

case "request-interview-reschedule":
return `Dear ${greetingName},

Thank you for the opportunity to interview for ${roleText} at ${companyText}. I am very interested in the position and appreciate your time.

I am writing to respectfully ask whether it would be possible to reschedule the interview.

${customNote ? `${customNote}\n\n` : ""}Thank you for your understanding and flexibility. I remain very interested in the opportunity and look forward to speaking with you.

Sincerely,
${senderName}`;

case "request-raise":
return `Dear ${greetingName},

I hope you are doing well. I am writing to respectfully request a conversation regarding my compensation and the possibility of a salary increase.

Over time, I have continued to contribute to my role and support the goals of ${companyText}. I would appreciate the opportunity to discuss my performance, responsibilities, and compensation in more detail.

${customNote ? `${customNote}\n\n` : ""}Thank you for your time and consideration. I would be grateful for the opportunity to speak with you further.

Sincerely,
${senderName}`;

case "request-promotion":
return `Dear ${greetingName},

I hope you are doing well. I am writing to express my interest in being considered for a promotion opportunity within ${companyText}.

I value my role and the experience I have gained, and I would appreciate the opportunity to discuss my growth, contributions, and readiness for additional responsibility.

${customNote ? `${customNote}\n\n` : ""}Thank you for your time and consideration. I would welcome the opportunity to speak with you further.

Sincerely,
${senderName}`;

case "request-pto":
return `Dear ${greetingName},

I am writing to respectfully request paid time off beginning on ${effectiveText}.

${customNote ? `${customNote}\n\n` : ""}Please let me know whether this request can be approved or if any additional information is needed.

Thank you for your time and consideration.

Sincerely,
${senderName}`;

case "request-extended-leave":
return `Dear ${greetingName},

I am writing to formally request extended leave beginning on ${effectiveText}. This request may include leave under applicable policies such as FMLA, if appropriate.

${customNote ? `${customNote}\n\n` : ""}Please let me know what documentation or next steps are needed to support this request.

Thank you for your time and consideration.

Sincerely,
${senderName}`;

case "resignation-letter":
return `Dear ${greetingName},

Please accept this letter as formal notice of my resignation from my position${jobTitle ? ` as ${jobTitle}` : ""} at ${companyText}, effective ${effectiveText}.

${customNote ? `${customNote}\n\n` : ""}I appreciate the opportunity to have been part of the organization and thank you for the experience and support provided during my time here.

Sincerely,
${senderName}`;

case "farewell-message":
return `Dear Team,

As I prepare to move on from ${companyText}, I wanted to take a moment to thank everyone for the support, collaboration, and experiences shared during my time here.

${customNote ? `${customNote}\n\n` : ""}I truly appreciate the time we worked together and wish everyone continued success in the future.

Warm regards,
${senderName}`;

case "new-position-introduction":
return `Dear Team,

My name is ${senderName}, and I am excited to introduce myself as I begin my new position${jobTitle ? ` as ${jobTitle}` : ""}${companyText ? ` at ${companyText}` : ""}.

${customNote ? `${customNote}\n\n` : ""}I look forward to working with everyone, learning from the team, and contributing in a positive and professional way.

Best regards,
${senderName}`;

case "confidential-hr-concern":
return `Dear ${greetingName},

I am writing on ${createdText} to raise a confidential workplace concern and respectfully request that this matter be handled with discretion.

${customNote ? `${customNote}\n\n` : ""}I would appreciate the opportunity to discuss this matter further and understand the next appropriate steps.

Sincerely,
${senderName}`;

case "report-workplace-incident":
return `Dear ${greetingName},

I am writing on ${createdText} to formally document and report a workplace incident.

${customNote ? `${customNote}\n\n` : ""}I am sharing this information so the matter is documented appropriately and can be reviewed according to company policy.

Sincerely,
${senderName}`;

default:
return "";
}
}, [
template,
employerName,
candidateName,
jobTitle,
companyName,
interviewDate,
createdDate,
effectiveDate,
customNote,
]);

async function handleSaveDraft() {
try {
const draft = {
template,
createdDate,
effectiveDate,
candidateName,
employerName,
companyName,
jobTitle,
interviewDate,
customNote,
};

window.localStorage.setItem(LETTER_DRAFT_KEY, JSON.stringify(draft));

if (userId) {
const { error: activityError } = await supabase
.from("user_activity")
.insert({
user_id: userId,
full_name: null,
email: null,
referral_code: referralCode,
event_type: "tool_completed",
tool_name: "house_of_letters",
page_name: "/career-toolkit/house-of-letters",
});

if (activityError) {
console.error("House of Letters save tracking error:", activityError);
}
}

setMessage("Letter draft saved locally in this browser.");
} catch {
setMessage("Unable to save your draft locally.");
}
}

function handlePrint() {
window.print();
}

return (
<main style={styles.page}>
<style>{`
@media print {
body * {
visibility: hidden !important;
}

.print-wrap,
.print-wrap * {
visibility: visible !important;
}

.print-wrap {
position: absolute !important;
top: 0 !important;
left: 0 !important;
width: 100% !important;
background: white !important;
padding: 24px !important;
margin: 0 !important;
}

.hide-on-print {
display: none !important;
}
}
`}</style>

<div style={styles.shell}>
<section style={styles.heroCard}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>The House of Letters</h1>
<p style={styles.subtitle}>
From thank-you notes to resignation letters, create the words that move your career forward.
</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</section>

<div style={styles.layout}>
<section className="hide-on-print" style={styles.formCard}>
<p style={styles.sectionKicker}>Template</p>
<h2 style={styles.sectionTitle}>Choose your letter type</h2>

<div style={styles.templateGrid}>
{TEMPLATES.map((item) => (
<button
key={item.value}
type="button"
onClick={() => setTemplate(item.value)}
style={{
...styles.templateButton,
...(template === item.value ? styles.templateButtonActive : {}),
}}
>
{item.label}
</button>
))}
</div>

<div style={styles.formGrid}>
<Field
label="Date Created / Sent"
value={createdDate}
onChange={setCreatedDate}
placeholder="March 28, 2026"
/>
<Field
label="Effective Date (if needed)"
value={effectiveDate}
onChange={setEffectiveDate}
placeholder="April 15, 2026"
/>
<Field
label="Your Name"
value={candidateName}
onChange={setCandidateName}
placeholder="Your full name"
/>
<Field
label="Employer / Manager / HR Name"
value={employerName}
onChange={setEmployerName}
placeholder="Hiring manager, HR, supervisor"
/>
<Field
label="Company Name"
value={companyName}
onChange={setCompanyName}
placeholder="Company name"
/>
<Field
label="Job Title / Role"
value={jobTitle}
onChange={setJobTitle}
placeholder="Job title or current role"
/>
<Field
label="Interview Date / Reference"
value={interviewDate}
onChange={setInterviewDate}
placeholder="Example: March 25 or our recent conversation"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Extra Details / Custom Note</label>
<textarea
value={customNote}
onChange={(e) => setCustomNote(e.target.value)}
placeholder="Add details, context, request information, incident notes, or a personalized message here."
style={styles.textarea}
/>
</div>

{message ? <p style={styles.message}>{message}</p> : null}

<div style={styles.actionRow}>
<button type="button" onClick={handleSaveDraft} style={styles.primaryButton}>
Save Draft
</button>

<button type="button" onClick={handlePrint} style={styles.secondaryButton}>
Print / Save
</button>
</div>
</section>

<section className="print-wrap" style={styles.previewCard}>
<p style={styles.sectionKicker}>Live Preview</p>
<h2 style={styles.sectionTitle}>Letter Preview</h2>

<div style={styles.previewBlock}>
<p style={styles.previewLabel}>Subject</p>
<p style={styles.subjectLine}>{subjectLine}</p>

<p style={styles.previewLabel}>Message</p>
<div style={styles.bodyBox}>
{bodyText.split("\n").map((line, index) => (
<p key={index} style={styles.previewText}>
{line || "\u00A0"}
</p>
))}
</div>
</div>
</section>
</div>
</div>
</main>
);
}

const TEMPLATES: { value: TemplateType; label: string }[] = [
{ value: "thank-you", label: "Thank-You After Interview" },
{ value: "follow-up-status", label: "Follow-Up on Status" },
{ value: "withdraw-application", label: "Withdraw Application" },
{ value: "accept-job-offer", label: "Accept Job Offer" },
{ value: "decline-job-offer", label: "Decline Job Offer" },
{ value: "request-interview-reschedule", label: "Request Interview Reschedule" },
{ value: "request-raise", label: "Request a Raise" },
{ value: "request-promotion", label: "Request a Promotion" },
{ value: "request-pto", label: "Request PTO" },
{ value: "request-extended-leave", label: "Request Extended Leave / FMLA" },
{ value: "resignation-letter", label: "Resignation Letter" },
{ value: "farewell-message", label: "Farewell / Goodbye Message" },
{ value: "new-position-introduction", label: "Accepted New Position - Introduction" },
{ value: "confidential-hr-concern", label: "Confidential HR Concern" },
{ value: "report-workplace-incident", label: "Report Workplace Incident" },
];

function Field({
label,
value,
onChange,
placeholder,
}: {
label: string;
value: string;
onChange: (value: string) => void;
placeholder?: string;
}) {
return (
<div style={styles.fieldWrap}>
<label style={styles.label}>{label}</label>
<input
value={value}
onChange={(e) => onChange(e.target.value)}
placeholder={placeholder}
style={styles.input}
/>
</div>
);
}

const styles: Record<string, React.CSSProperties> = {
page: {
minHeight: "100vh",
background:
"radial-gradient(circle at top, rgba(59,130,246,0.12) 0%, rgba(5,5,5,1) 34%, rgba(13,13,15,1) 100%)",
color: "#e7e7e7",
padding: "32px 24px 56px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
shell: {
maxWidth: "1320px",
margin: "0 auto",
display: "grid",
gap: "24px",
},
heroCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "32px",
padding: "32px",
boxShadow: "0 30px 80px rgba(0,0,0,0.32)",
},
kicker: {
margin: "0 0 8px",
color: "#a1a1aa",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
title: {
margin: "0 0 12px",
fontSize: "42px",
lineHeight: 1.08,
letterSpacing: "-0.04em",
fontWeight: 700,
color: "#f5f5f5",
},
subtitle: {
margin: 0,
color: "#d4d4d8",
fontSize: "16px",
lineHeight: 1.75,
maxWidth: "860px",
},
heroButtons: {
display: "flex",
gap: "12px",
marginTop: "18px",
flexWrap: "wrap",
},
linkButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
textDecoration: "none",
padding: "12px 16px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.14)",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
fontSize: "14px",
},
layout: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "20px",
alignItems: "start",
},
formCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "28px",
padding: "24px",
boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
},
previewCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "28px",
padding: "24px",
boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
position: "sticky",
top: "24px",
},
sectionKicker: {
margin: "0 0 8px",
color: "#9ca3af",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
sectionTitle: {
margin: "0 0 18px",
fontSize: "28px",
lineHeight: 1.1,
fontWeight: 700,
color: "#f5f5f5",
},
templateGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "12px",
marginBottom: "20px",
},
templateButton: {
padding: "12px 14px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.12)",
background: "rgba(255,255,255,0.04)",
color: "#f5f5f5",
fontWeight: 700,
fontSize: "14px",
cursor: "pointer",
textAlign: "left",
},
templateButtonActive: {
background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
color: "#09090b",
border: "1px solid #d1d5db",
},
formGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "14px",
},
fieldWrap: {
display: "grid",
gap: "8px",
marginBottom: "14px",
},
label: {
color: "#d4d4d8",
fontSize: "13px",
fontWeight: 600,
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
message: {
margin: "4px 0 0",
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.6,
},
actionRow: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "12px",
marginTop: "16px",
},
primaryButton: {
width: "100%",
padding: "15px 18px",
borderRadius: "18px",
border: "1px solid #d1d5db",
background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
color: "#09090b",
fontSize: "15px",
fontWeight: 700,
cursor: "pointer",
},
secondaryButton: {
width: "100%",
padding: "15px 18px",
borderRadius: "18px",
border: "1px solid rgba(148,163,184,0.28)",
background: "linear-gradient(180deg, #0f244d 0%, #112b5f 100%)",
color: "#fff",
fontSize: "15px",
fontWeight: 700,
cursor: "pointer",
},
previewBlock: {
display: "grid",
gap: "12px",
},
previewLabel: {
margin: 0,
color: "#9ca3af",
fontSize: "12px",
letterSpacing: "0.14em",
textTransform: "uppercase",
},
subjectLine: {
margin: 0,
color: "#f5f5f5",
fontSize: "16px",
fontWeight: 700,
lineHeight: 1.6,
},
bodyBox: {
background: "#101010",
border: "1px solid #2d2d2d",
borderRadius: "20px",
padding: "18px",
},
previewText: {
margin: "0 0 10px",
color: "#e5e7eb",
fontSize: "15px",
lineHeight: 1.8,
whiteSpace: "pre-wrap",
},
};
