"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../../lib/supabase";

type BrandMode = "summary" | "bio" | "bullets";
type ToneOption = "Professional" | "Warm" | "Confident" | "Friendly";
type BulletStyle =
| "Professional"
| "Corporate"
| "Customer Service"
| "Operations"
| "Healthcare"
| "Entry-Level";

const BRAND_DRAFT_KEY = "hireminds-professional-branding-generator-v3";

function toTitleCase(value: string) {
return value
.trim()
.toLowerCase()
.replace(/\b\w/g, (char) => char.toUpperCase());
}

function cleanList(value: string, limit = 4) {
return value
.split(",")
.map((s) => s.trim())
.filter(Boolean)
.slice(0, limit);
}

function enhanceSingleBullet(raw: string, style: BulletStyle, roleHint: string) {
const text = raw.trim();
if (!text) return [];

const lower = text.toLowerCase();
const roleText = roleHint.trim() || "the role";

const genericProfessional = [
`Demonstrated strong ${lower} responsibilities while maintaining professionalism, consistency, and attention to detail.`,
`Supported daily operations through ${lower}, contributing to efficiency, organization, and reliable follow-through.`,
`Applied transferable strengths through ${lower}, helping create a productive and well-supported work environment.`,
];

if (lower.includes("customer service")) {
return [
"Delivered responsive customer service while resolving questions, addressing concerns, and creating a positive experience.",
"Supported client satisfaction by communicating clearly, responding professionally, and maintaining a service-focused approach.",
"Built positive customer relationships through active listening, professionalism, and consistent support in fast-paced environments.",
style === "Corporate"
? "Strengthened client experience through professional communication, issue resolution, and relationship-focused service delivery."
: "Provided front-line support to customers while maintaining patience, professionalism, and a strong service mindset.",
];
}

if (
lower.includes("cash") ||
lower.includes("register") ||
lower.includes("money") ||
lower.includes("payments")
) {
return [
"Processed cash and payment transactions accurately while maintaining accountability and attention to detail.",
"Handled register activity, payments, and cash-balancing tasks in a fast-paced environment with a strong focus on accuracy.",
"Maintained financial responsibility through accurate payment processing, register handling, and routine cash procedures.",
style === "Operations" || style === "Corporate"
? "Supported daily financial operations by processing transactions, reconciling payments, and maintaining cash-handling standards."
: "Completed high-volume payment transactions while ensuring accuracy, efficiency, and dependable cash-handling practices.",
];
}

if (
lower.includes("care") ||
lower.includes("caregiver") ||
lower.includes("hha") ||
lower.includes("took care") ||
lower.includes("patients") ||
lower.includes("client support")
) {
return [
"Provided compassionate support while assisting with daily needs, routines, and overall well-being in a respectful and dependable manner.",
"Supported individuals with care, patience, and consistency while maintaining dignity, comfort, and attention to changing needs.",
"Delivered dependable care and support services while building trust, observing needs, and responding with professionalism.",
style === "Healthcare"
? "Provided client-centered support through attentive care, routine assistance, and dependable communication in care-focused settings."
: "Demonstrated empathy, consistency, and responsibility through hands-on support and daily care assistance.",
];
}

if (
lower.includes("schedule") ||
lower.includes("appointment") ||
lower.includes("calendar")
) {
return [
"Coordinated schedules, appointments, and time-sensitive responsibilities while maintaining organization and follow-through.",
"Managed scheduling needs efficiently, helping keep daily priorities organized and on track.",
"Supported workflow through strong calendar coordination, appointment tracking, and time-management practices.",
];
}

if (
lower.includes("clean") ||
lower.includes("cleaning") ||
lower.includes("sanitize") ||
lower.includes("sanitiz")
) {
return [
"Maintained clean, organized, and safe environments while following standards and supporting day-to-day operations.",
"Upheld cleanliness and sanitation expectations through consistent attention to detail and dependable routine execution.",
"Supported safe and orderly environments through cleaning, upkeep, and quality-focused maintenance tasks.",
];
}

if (
lower.includes("team") ||
lower.includes("trained") ||
lower.includes("supervised") ||
lower.includes("lead")
) {
return [
"Supported team success through communication, coordination, and dependable follow-through on shared responsibilities.",
"Contributed to stronger workflow and team performance through collaboration, accountability, and day-to-day support.",
"Demonstrated leadership potential by helping guide tasks, support others, and maintain productive working relationships.",
];
}

if (
lower.includes("phones") ||
lower.includes("front desk") ||
lower.includes("reception") ||
lower.includes("answered calls")
) {
return [
"Managed incoming calls and front-facing communication while maintaining professionalism and strong customer support.",
"Supported daily office or service operations by handling calls, inquiries, and first-point-of-contact responsibilities efficiently.",
"Created a positive first impression through clear communication, responsiveness, and organized front-desk support.",
];
}

if (
lower.includes("filing") ||
lower.includes("paperwork") ||
lower.includes("documents") ||
lower.includes("data entry")
) {
return [
"Maintained accurate records, paperwork, and documentation while supporting organized administrative workflows.",
"Handled data entry and document-related tasks with attention to detail, accuracy, and consistency.",
"Supported office efficiency through organized record keeping, paperwork management, and dependable administrative support.",
];
}

if (
lower.includes("multitask") ||
lower.includes("busy") ||
lower.includes("fast paced") ||
lower.includes("fast-paced")
) {
return [
"Managed multiple priorities in fast-paced environments while maintaining organization, accuracy, and professionalism.",
"Adapted quickly to changing demands and shifting priorities while supporting consistent service and workflow.",
"Demonstrated strong multitasking and time-management skills in high-volume, deadline-sensitive settings.",
];
}

if (style === "Customer Service") {
return [
`Supported positive customer experiences through ${text.toLowerCase()}, clear communication, and dependable service.`,
`Handled ${text.toLowerCase()} while maintaining professionalism, responsiveness, and a strong customer-first mindset.`,
`Delivered service-focused support through ${text.toLowerCase()} in alignment with ${roleText}.`,
];
}

if (style === "Operations") {
return [
`Supported day-to-day operations through ${text.toLowerCase()}, helping maintain workflow, consistency, and efficiency.`,
`Contributed to organized operations by managing ${text.toLowerCase()} with follow-through and attention to detail.`,
`Strengthened operational reliability through ${text.toLowerCase()} and dependable execution of daily responsibilities.`,
];
}

if (style === "Healthcare") {
return [
`Provided dependable support through ${text.toLowerCase()} while maintaining care, consistency, and professionalism.`,
`Applied patience, responsibility, and attention to detail through ${text.toLowerCase()} in support-focused environments.`,
`Helped maintain quality support and care standards through ${text.toLowerCase()} and reliable daily follow-through.`,
];
}

if (style === "Entry-Level") {
return [
`Built transferable skills through ${text.toLowerCase()}, demonstrating reliability, willingness to learn, and strong effort.`,
`Supported daily responsibilities through ${text.toLowerCase()} while building readiness for professional opportunities.`,
`Applied consistency, teamwork, and a positive work ethic through ${text.toLowerCase()} in practical settings.`,
];
}

if (style === "Corporate") {
return [
`Supported business needs through ${text.toLowerCase()}, demonstrating professionalism, organization, and dependable execution.`,
`Contributed to productivity and service quality through ${text.toLowerCase()} with strong attention to detail.`,
`Applied transferable business strengths through ${text.toLowerCase()} in support of ${roleText}.`,
];
}

return genericProfessional;
}

export default function ProfessionalBrandingGeneratorPage() {
const [mode, setMode] = useState<BrandMode>("summary");
const [fullName, setFullName] = useState("");
const [currentTitle, setCurrentTitle] = useState("");
const [industry, setIndustry] = useState("");
const [skills, setSkills] = useState("");
const [strengths, setStrengths] = useState("");
const [experience, setExperience] = useState("");
const [tone, setTone] = useState<ToneOption>("Professional");
const [message, setMessage] = useState("");

const [bulletInput, setBulletInput] = useState("");
const [bulletStyle, setBulletStyle] = useState<BulletStyle>("Professional");
const [bulletRoleHint, setBulletRoleHint] = useState("");

const [draftLoaded, setDraftLoaded] = useState(false);

const [userId, setUserId] = useState("");
const [referralCode, setReferralCode] = useState<string | null>(null);
const [profileEmail, setProfileEmail] = useState<string | null>(null);
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
setProfileEmail(profile?.email || data.user.email || null);

const { error: activityError } = await supabase.from("user_activity").insert({
user_id: data.user.id,
full_name: profile?.full_name || null,
email: profile?.email || data.user.email || null,
referral_code: profile?.referral_code || null,
event_type: "tool_opened",
tool_name: "professional_branding_generator",
page_name: "/career-toolkit/professional-branding-generator",
});

if (activityError) {
console.error("Professional branding generator tracking error:", activityError);
}
}

loadUserAndTrack();
}, []);

useEffect(() => {
try {
const raw = window.localStorage.getItem(BRAND_DRAFT_KEY);
if (raw) {
const draft = JSON.parse(raw);
setMode(draft.mode || "summary");
setFullName(draft.fullName || "");
setCurrentTitle(draft.currentTitle || "");
setIndustry(draft.industry || "");
setSkills(draft.skills || "");
setStrengths(draft.strengths || "");
setExperience(draft.experience || "");
setTone(draft.tone || "Professional");
setBulletInput(draft.bulletInput || "");
setBulletStyle(draft.bulletStyle || "Professional");
setBulletRoleHint(draft.bulletRoleHint || "");
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
mode,
fullName,
currentTitle,
industry,
skills,
strengths,
experience,
tone,
bulletInput,
bulletStyle,
bulletRoleHint,
};

window.localStorage.setItem(BRAND_DRAFT_KEY, JSON.stringify(draft));
}, [
draftLoaded,
mode,
fullName,
currentTitle,
industry,
skills,
strengths,
experience,
tone,
bulletInput,
bulletStyle,
bulletRoleHint,
]);

const cleanSkills = useMemo(() => cleanList(skills), [skills]);
const cleanStrengths = useMemo(() => cleanList(strengths), [strengths]);

const firstName = fullName.trim().split(" ")[0] || "This professional";
const displayName = fullName || "Your Name";
const roleText = currentTitle || "professional";
const industryText = industry || "their field";

const toneLead =
tone === "Warm"
? "approachable and people-focused"
: tone === "Confident"
? "results-driven and confident"
: tone === "Friendly"
? "friendly and dependable"
: "professional and dependable";

const skillPhrase =
cleanSkills.length > 0
? cleanSkills.join(", ")
: "communication, organization, and relationship-building";

const strengthPhrase =
cleanStrengths.length > 0
? cleanStrengths.join(", ")
: "professionalism, adaptability, and follow-through";

const experiencePhrase =
experience.trim() ||
"supporting teams, working with people, and helping day-to-day operations run effectively";

const summaryPreview = useMemo(() => {
return `${roleText} with experience in ${industryText}. Known for ${strengthPhrase} and strengths in ${skillPhrase}. Brings a ${toneLead} approach to the work and a background in ${experiencePhrase}.`;
}, [roleText, industryText, strengthPhrase, skillPhrase, toneLead, experiencePhrase]);

const bioPreview = useMemo(() => {
return `${displayName} is a ${roleText} with experience in ${industryText}. ${firstName} is known for ${strengthPhrase} and for bringing strength in ${skillPhrase}. With a background in ${experiencePhrase}, ${firstName} takes a ${toneLead} approach to creating value and building strong working relationships.`;
}, [
displayName,
firstName,
roleText,
industryText,
strengthPhrase,
skillPhrase,
experiencePhrase,
toneLead,
]);

const enhancedBullets = useMemo(() => {
const lines = bulletInput
.split("\n")
.map((line) => line.trim())
.filter(Boolean);

if (!lines.length) return [];

return lines.flatMap((line) => enhanceSingleBullet(line, bulletStyle, bulletRoleHint));
}, [bulletInput, bulletStyle, bulletRoleHint]);

const activeText = mode === "summary" ? summaryPreview : bioPreview;

async function trackCompletion(actionLabel?: string) {
if (!userId) return;

const { error: activityError } = await supabase.from("user_activity").insert({
user_id: userId,
full_name: fullName || null,
email: profileEmail,
referral_code: referralCode,
event_type: "tool_completed",
tool_name:
mode === "bullets"
? "professional_branding_generator_bullet_enhancer"
: "professional_branding_generator",
page_name: "/career-toolkit/professional-branding-generator",
action_label: actionLabel || null,
});

if (activityError) {
console.error("Professional branding completion tracking error:", activityError);
}
}

async function handleCopy() {
if (mode === "bullets") {
const text = enhancedBullets.map((item) => `• ${item}`).join("\n");
await navigator.clipboard.writeText(text);
setMessage("Enhanced bullet points copied to clipboard.");
await trackCompletion("copy_bullets");
return;
}

await navigator.clipboard.writeText(activeText);
setMessage(`${mode === "summary" ? "Summary" : "Bio"} copied to clipboard.`);
await trackCompletion(mode === "summary" ? "copy_summary" : "copy_bio");
}

async function handleSaveDraft() {
try {
const draft = {
mode,
fullName,
currentTitle,
industry,
skills,
strengths,
experience,
tone,
bulletInput,
bulletStyle,
bulletRoleHint,
};

window.localStorage.setItem(BRAND_DRAFT_KEY, JSON.stringify(draft));
setMessage("Branding draft saved locally in this browser.");
await trackCompletion("save_draft");
} catch {
setMessage("Unable to save your draft locally.");
}
}

async function handlePrint() {
window.print();
await trackCompletion(mode === "bullets" ? "print_bullets" : "print_branding");
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
<h1 style={styles.title}>Professional Branding Generator</h1>
<p style={styles.subtitle}>
You Are Your Brand. Build It With Intention.
</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</section>

<div style={styles.layout}>
<section className="hide-on-print" style={styles.formCard}>
<p style={styles.sectionKicker}>Choose Format</p>
<h2 style={styles.sectionTitle}>Build stronger professional language</h2>

<div style={styles.tabRow}>
<button
type="button"
onClick={() => setMode("summary")}
style={{
...styles.tabButton,
...(mode === "summary" ? styles.tabButtonActive : {}),
}}
>
Professional Summary
</button>
<button
type="button"
onClick={() => setMode("bio")}
style={{
...styles.tabButton,
...(mode === "bio" ? styles.tabButtonActive : {}),
}}
>
Professional Bio
</button>
<button
type="button"
onClick={() => setMode("bullets")}
style={{
...styles.tabButton,
...(mode === "bullets" ? styles.tabButtonActive : {}),
}}
>
Resume Bullet Enhancer
</button>
</div>

{mode !== "bullets" ? (
<>
<div style={styles.formGrid}>
<Field
label="Full Name"
value={fullName}
onChange={setFullName}
placeholder="Your full name"
/>
<Field
label="Current Title"
value={currentTitle}
onChange={setCurrentTitle}
placeholder="Recruiter, Admin Assistant, Case Manager"
/>
<Field
label="Industry / Field"
value={industry}
onChange={setIndustry}
placeholder="Healthcare, Staffing, Workforce Development"
/>
<SelectField
label="Tone"
value={tone}
onChange={(value) => setTone(value as ToneOption)}
options={["Professional", "Warm", "Confident", "Friendly"]}
/>
</div>

<TextAreaField
label="Top Skills"
value={skills}
onChange={setSkills}
placeholder="Comma separated: recruiting, communication, scheduling, client support"
/>

<TextAreaField
label="Strengths"
value={strengths}
onChange={setStrengths}
placeholder="Comma separated: dependable, organized, adaptable, strong communicator"
/>

<TextAreaField
label="Work Background / Experience"
value={experience}
onChange={setExperience}
placeholder="Briefly describe who you are, what you do, or the type of work you have done."
/>
</>
) : (
<>
<div style={styles.formGrid}>
<Field
label="Target Role (optional)"
value={bulletRoleHint}
onChange={setBulletRoleHint}
placeholder="Customer Service Rep, Caregiver, Admin Assistant"
/>
<SelectField
label="Enhancer Style"
value={bulletStyle}
onChange={(value) => setBulletStyle(value as BulletStyle)}
options={[
"Professional",
"Corporate",
"Customer Service",
"Operations",
"Healthcare",
"Entry-Level",
]}
/>
</div>

<TextAreaField
label="Paste simple job duties or bullet ideas"
value={bulletInput}
onChange={setBulletInput}
placeholder={
"Add one per line, for example:\ncustomer service\nhandled cash\ntook care of people\nscheduled appointments\nanswered phones"
}
/>

<div style={styles.helperBox}>
<p style={styles.helperTitle}>How to use it</p>
<p style={styles.helperText}>
Type basic duties in simple language and this tool will turn them
into stronger, more articulate, resume-ready bullet points.
</p>
</div>
</>
)}

{message ? <p style={styles.message}>{message}</p> : null}

<div style={styles.buttonRow}>
<button type="button" onClick={handleSaveDraft} style={styles.primaryButton}>
Save Draft
</button>
<button type="button" onClick={handlePrint} style={styles.secondaryButton}>
Print / Save
</button>
<button type="button" onClick={handleCopy} style={styles.secondaryButton}>
Copy
</button>
</div>
</section>

<aside className="print-wrap" style={styles.previewCard}>
<p style={styles.sectionKicker}>Live Preview</p>
<h2 style={styles.previewTitle}>
{mode === "summary"
? "Professional Summary Preview"
: mode === "bio"
? "Professional Bio Preview"
: "Enhanced Resume Bullet Points"}
</h2>

<div style={styles.previewPaper}>
{mode !== "bullets" ? (
<p style={styles.previewText}>{activeText}</p>
) : enhancedBullets.length ? (
<div style={styles.bulletPreviewWrap}>
{enhancedBullets.map((item, index) => (
<p key={`${item}-${index}`} style={styles.previewBullet}>
• {item}
</p>
))}
</div>
) : (
<p style={styles.previewText}>
Add simple bullet ideas on the left to see enhanced resume bullet
points here.
</p>
)}
</div>

<div style={styles.sampleWrap}>
<p style={styles.sampleLabel}>
{mode === "bullets" ? "Branding add-on" : "How it works"}
</p>
<p style={styles.sampleText}>
{mode === "bullets"
? "This bullet enhancer lives inside the Professional Branding Generator so you can strengthen summaries, bios, and resume language in one place."
: "Start with the sample and watch it change as you add your information. The more specific your title, skills, strengths, and work background are, the stronger your result will be."}
</p>
</div>
</aside>
</div>
</div>
</main>
);
}

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

function SelectField({
label,
value,
onChange,
options,
}: {
label: string;
value: string;
onChange: (value: string) => void;
options: string[];
}) {
return (
<div style={styles.fieldWrap}>
<label style={styles.label}>{label}</label>
<select value={value} onChange={(e) => onChange(e.target.value)} style={styles.input}>
{options.map((option) => (
<option key={option}>{option}</option>
))}
</select>
</div>
);
}

function TextAreaField({
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
<textarea
value={value}
onChange={(e) => onChange(e.target.value)}
placeholder={placeholder}
style={styles.textarea}
/>
</div>
);
}

const styles: Record<string, CSSProperties> = {
page: {
minHeight: "100vh",
background: "linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
color: "#e7e7e7",
padding: "32px 24px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
shell: {
maxWidth: "1400px",
margin: "0 auto",
display: "grid",
gap: "24px",
},
heroCard: {
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
fontWeight: 600,
color: "#f5f5f5",
},
subtitle: {
margin: 0,
color: "#c8c8c8",
fontSize: "16px",
lineHeight: 1.7,
},
heroButtons: {
display: "flex",
gap: "12px",
marginTop: "16px",
flexWrap: "wrap",
},
linkButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
textDecoration: "none",
padding: "15px 18px",
borderRadius: "18px",
border: "1px solid #3a3a3a",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
},
layout: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "24px",
alignItems: "start",
},
formCard: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px",
},
previewCard: {
background: "#ffffff",
color: "#111827",
borderRadius: "24px",
padding: "24px",
position: "sticky",
top: "24px",
boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
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
previewTitle: {
margin: "0 0 18px",
fontSize: "28px",
lineHeight: 1.1,
fontWeight: 700,
color: "#111827",
},
tabRow: {
display: "grid",
gridTemplateColumns: "1fr 1fr 1fr",
gap: "12px",
marginBottom: "20px",
},
tabButton: {
padding: "12px 14px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.12)",
background: "rgba(255,255,255,0.04)",
color: "#f5f5f5",
fontWeight: 700,
fontSize: "14px",
cursor: "pointer",
},
tabButtonActive: {
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
minHeight: "110px",
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
helperBox: {
border: "1px solid rgba(255,255,255,0.08)",
borderRadius: "18px",
padding: "16px",
background: "rgba(255,255,255,0.03)",
marginTop: "6px",
},
helperTitle: {
margin: "0 0 8px",
color: "#f5f5f5",
fontSize: "14px",
fontWeight: 700,
},
helperText: {
margin: 0,
color: "#d4d4d8",
fontSize: "14px",
lineHeight: 1.7,
},
message: {
margin: "8px 0 0",
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.6,
},
buttonRow: {
display: "grid",
gridTemplateColumns: "1fr 1fr 1fr",
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
previewPaper: {
background: "#f9fafb",
border: "1px solid #d1d5db",
borderRadius: "18px",
padding: "20px",
marginBottom: "18px",
},
previewText: {
margin: 0,
color: "#111827",
fontSize: "16px",
lineHeight: 1.9,
whiteSpace: "pre-wrap",
},
bulletPreviewWrap: {
display: "grid",
gap: "10px",
},
previewBullet: {
margin: 0,
color: "#111827",
fontSize: "15px",
lineHeight: 1.8,
},
sampleWrap: {
border: "1px solid #e5e7eb",
borderRadius: "18px",
padding: "18px",
background: "#ffffff",
},
sampleLabel: {
margin: "0 0 8px",
color: "#6b7280",
fontSize: "12px",
letterSpacing: "0.14em",
textTransform: "uppercase",
},
sampleText: {
margin: 0,
color: "#374151",
fontSize: "14px",
lineHeight: 1.7,
},
};
