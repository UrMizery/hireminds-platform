"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../../lib/supabase";

type ResumeFont = "Times New Roman" | "Arial" | "Calibri";
type ResumeType = "Chronological" | "Functional" | "Combination" | "Hybrid";
type OpportunityPath =
| "veteran"
| "caregiver"
| "career-restart"
| "reentry"
| "little-no-experience";

type Bullet = { text: string };

type ExperienceItem = {
companyName: string;
city: string;
state: string;
roleTitle: string;
startMonth: string;
startYear: string;
endMonth: string;
endYear: string;
isPresent: boolean;
bullets: Bullet[];
};

type CredentialItem = {
organizationName: string;
city: string;
state: string;
credentialName: string;
details: string;
startMonth: string;
startYear: string;
endMonth: string;
endYear: string;
isPresent: boolean;
};

type VolunteerItem = {
organizationName: string;
city: string;
state: string;
roleTitle: string;
startMonth: string;
startYear: string;
endMonth: string;
endYear: string;
isPresent: boolean;
bullets: Bullet[];
};

type ResumeSectionKey =
| "summary"
| "skills"
| "experience"
| "credentials"
| "volunteer"
| "accomplishments";

const BULLET_LIMIT = 5;
const SKILL_LIMIT = 9;
const RESUME_DRAFT_STORAGE_KEY = "hireminds-new-opportunities-resume-draft-v1";

const MONTHS = [
"",
"Jan",
"Feb",
"Mar",
"Apr",
"May",
"Jun",
"Jul",
"Aug",
"Sep",
"Oct",
"Nov",
"Dec",
];

function moveItem<T>(arr: T[], index: number, direction: "up" | "down") {
const updated = [...arr];
const nextIndex = direction === "up" ? index - 1 : index + 1;
if (nextIndex < 0 || nextIndex >= arr.length) return arr;
[updated[index], updated[nextIndex]] = [updated[nextIndex], updated[index]];
return updated;
}

function formatDateRange(
startMonth: string,
startYear: string,
endMonth: string,
endYear: string,
isPresent: boolean
) {
const from = [startMonth, startYear].filter(Boolean).join(" ");
const to = isPresent ? "Present" : [endMonth, endYear].filter(Boolean).join(" ");
if (!from && !to) return "";
return `${from || "Start"} - ${to || "End"}`;
}

function splitSkillsIntoColumns(skills: string[]) {
const safeSkills = skills.slice(0, SKILL_LIMIT);
const columns = [[], [], []] as string[][];

safeSkills.forEach((skill, index) => {
columns[index % 3].push(skill);
});

return columns;
}

function detectResumeType(sectionOrder: ResumeSectionKey[]): ResumeType {
const skillsIndex = sectionOrder.indexOf("skills");
const experienceIndex = sectionOrder.indexOf("experience");
const credentialsIndex = sectionOrder.indexOf("credentials");
const volunteerIndex = sectionOrder.indexOf("volunteer");

const educationLikeNearTop =
(credentialsIndex !== -1 && credentialsIndex < experienceIndex) ||
(volunteerIndex !== -1 && volunteerIndex < experienceIndex);

const skillsVeryHigh = skillsIndex !== -1 && skillsIndex <= 1;
const experienceHigh = experienceIndex !== -1 && experienceIndex <= 2;

if (educationLikeNearTop && skillsVeryHigh) return "Hybrid";
if (skillsVeryHigh && experienceHigh) return "Combination";
if (skillsVeryHigh && experienceIndex > 2) return "Functional";
return "Chronological";
}

function hasExperienceContent(item: ExperienceItem) {
return Boolean(
item.companyName ||
item.roleTitle ||
item.city ||
item.state ||
item.startMonth ||
item.startYear ||
item.endMonth ||
item.endYear ||
item.isPresent ||
item.bullets.some((b) => b.text.trim())
);
}

function hasCredentialContent(item: CredentialItem) {
return Boolean(
item.organizationName ||
item.credentialName ||
item.details ||
item.city ||
item.state ||
item.startMonth ||
item.startYear ||
item.endMonth ||
item.endYear ||
item.isPresent
);
}

function hasVolunteerContent(item: VolunteerItem) {
return Boolean(
item.organizationName ||
item.roleTitle ||
item.city ||
item.state ||
item.startMonth ||
item.startYear ||
item.endMonth ||
item.endYear ||
item.isPresent ||
item.bullets.some((b) => b.text.trim())
);
}

function createDefaultExperience(): ExperienceItem {
return {
companyName: "",
city: "",
state: "",
roleTitle: "",
startMonth: "",
startYear: "",
endMonth: "",
endYear: "",
isPresent: false,
bullets: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
};
}

function createDefaultCredential(): CredentialItem {
return {
organizationName: "",
city: "",
state: "",
credentialName: "",
details: "",
startMonth: "",
startYear: "",
endMonth: "",
endYear: "",
isPresent: false,
};
}

function createDefaultVolunteer(): VolunteerItem {
return {
organizationName: "",
city: "",
state: "",
roleTitle: "",
startMonth: "",
startYear: "",
endMonth: "",
endYear: "",
isPresent: false,
bullets: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
};
}

function normalizeSkillLabel(value: string) {
return value
.trim()
.replace(/\s+/g, " ")
.replace(/\b\w/g, (char) => char.toUpperCase());
}

function makeSkillSuggestions(
pathType: OpportunityPath,
strengthsText: string,
supportNeedsText: string
) {
const typed = `${strengthsText}, ${supportNeedsText}`
.split(",")
.map((item) => normalizeSkillLabel(item))
.filter(Boolean);

const baseByPath: Record<OpportunityPath, string[]> = {
veteran: [
"Leadership",
"Teamwork",
"Operations Support",
"Discipline",
"Adaptability",
"Problem Solving",
"Communication",
"Accountability",
"Time Management",
],
caregiver: [
"Scheduling",
"Organization",
"Communication",
"Compassion",
"Multitasking",
"Problem Solving",
"Time Management",
"Record Keeping",
"Dependability",
],
"career-restart": [
"Adaptability",
"Communication",
"Organization",
"Problem Solving",
"Professionalism",
"Time Management",
"Teamwork",
"Dependability",
"Initiative",
],
reentry: [
"Accountability",
"Consistency",
"Adaptability",
"Communication",
"Time Management",
"Problem Solving",
"Teamwork",
"Dependability",
"Professional Growth",
],
"little-no-experience": [
"Willingness To Learn",
"Communication",
"Teamwork",
"Dependability",
"Adaptability",
"Time Management",
"Customer Service",
"Problem Solving",
"Professionalism",
],
};

const merged = [...typed, ...baseByPath[pathType]];
return Array.from(new Set(merged)).slice(0, SKILL_LIMIT);
}

function improveBulletText(
raw: string,
pathType: OpportunityPath,
roleTitle: string,
targetRole: string
) {
const text = raw.trim();
if (!text) return "";

const lower = text.toLowerCase();
const target = targetRole.trim() || roleTitle.trim() || "new opportunities";

if (lower === "customer service" || lower.includes("customer service")) {
return `Delivered responsive customer support while building trust, resolving questions, and creating a positive service experience aligned with ${target}.`;
}

if (lower.includes("cash") || lower.includes("register") || lower.includes("money")) {
return `Handled payments, register activity, and cash-balancing responsibilities with accuracy, attention to detail, and accountability in a fast-paced environment.`;
}

if (lower.includes("clean") || lower.includes("cleaning") || lower.includes("sanit")) {
return `Maintained clean, organized, and safe environments while following standards, routines, and quality expectations consistently.`;
}

if (lower.includes("care") || lower.includes("caregiving") || lower.includes("took care")) {
return `Provided dependable support and attentive care while managing routines, changing needs, and respectful communication in high-responsibility situations.`;
}

if (lower.includes("schedule") || lower.includes("appointment")) {
return `Coordinated schedules, appointments, and time-sensitive responsibilities while maintaining organization and follow-through across competing priorities.`;
}

if (lower.includes("household") || lower.includes("budget")) {
return `Managed household logistics, planning, and budgeting responsibilities while demonstrating organization, problem-solving, and consistency.`;
}

if (lower.includes("team") || lower.includes("worked with others")) {
return `Collaborated effectively with others to complete responsibilities, maintain workflow, and support shared goals in structured environments.`;
}

if (lower.includes("training") || lower.includes("course") || lower.includes("class")) {
return `Completed structured training and learning activities while building job-ready skills, consistency, and readiness for professional opportunities.`;
}

switch (pathType) {
case "veteran":
return `Applied responsibility, discipline, and teamwork through ${text.toLowerCase()}, strengthening readiness for ${target}.`;
case "caregiver":
return `Demonstrated patience, organization, and dependable follow-through through ${text.toLowerCase()}, building transferable strengths for ${target}.`;
case "career-restart":
return `Strengthened transferable professional skills through ${text.toLowerCase()}, supporting a confident return toward ${target}.`;
case "reentry":
return `Built accountability, consistency, and readiness through ${text.toLowerCase()}, reinforcing preparation for ${target}.`;
case "little-no-experience":
return `Developed practical strengths through ${text.toLowerCase()}, demonstrating reliability, willingness to learn, and readiness for ${target}.`;
default:
return text;
}
}

function createGuidedSummary(
pathType: OpportunityPath,
targetRole: string,
supportNeedsText: string,
strengthsText: string
) {
const role = targetRole.trim() || "new professional opportunities";
const strengths = strengthsText
.split(",")
.map((item) => item.trim())
.filter(Boolean)
.slice(0, 4);
const strengthsLine = strengths.length
? `Known for ${strengths.join(", ").toLowerCase()}.`
: "";

const support = supportNeedsText.trim();
const supportLine = support ? `${support}.` : "";

switch (pathType) {
case "veteran":
return `Mission-driven professional pursuing ${role} with transferable strengths in discipline, teamwork, accountability, and adaptability. ${supportLine} ${strengthsLine} Ready to contribute with professionalism, follow-through, and a strong commitment to growth.`
.replace(/\s+/g, " ")
.trim();

case "caregiver":
return `Dependable and organized candidate pursuing ${role} after building transferable strengths through caregiving, household management, scheduling, and daily problem-solving. ${supportLine} ${strengthsLine} Brings compassion, consistency, and a strong ability to manage responsibilities with care and professionalism.`
.replace(/\s+/g, " ")
.trim();

case "career-restart":
return `Adaptable professional pursuing ${role} while restarting a career path with renewed focus, resilience, and determination. ${supportLine} ${strengthsLine} Brings transferable skills, a strong work ethic, and readiness to contribute with confidence in a new chapter.`
.replace(/\s+/g, " ")
.trim();

case "reentry":
return `Motivated candidate pursuing ${role} while reentering the workforce with focus, accountability, and a commitment to forward progress. ${supportLine} ${strengthsLine} Brings resilience, readiness to learn, and a strong determination to contribute in a meaningful professional environment.`
.replace(/\s+/g, " ")
.trim();

case "little-no-experience":
return `Entry-level candidate pursuing ${role} with transferable strengths in reliability, adaptability, communication, and willingness to learn. ${supportLine} ${strengthsLine} Ready to bring energy, consistency, and career-ready momentum into a professional opportunity.`
.replace(/\s+/g, " ")
.trim();

default:
return "";
}
}

export default function NewOpportunitiesResumeGeneratorPage() {
const [loadingUser, setLoadingUser] = useState(true);
const [userId, setUserId] = useState("");
const [message, setMessage] = useState("");
const [saving, setSaving] = useState(false);
const [draftLoaded, setDraftLoaded] = useState(false);
const resumePrintRef = useRef<HTMLDivElement>(null);
const openTrackedRef = useRef(false);

const [fontFamily, setFontFamily] = useState<ResumeFont>("Times New Roman");
const [fullName, setFullName] = useState("");
const [phone, setPhone] = useState("");
const [city, setCity] = useState("");
const [stateName, setStateName] = useState("");
const [email, setEmail] = useState("");
const [linkedinUrl, setLinkedinUrl] = useState("");

const [pathType, setPathType] = useState<OpportunityPath>("veteran");
const [targetRole, setTargetRole] = useState("");
const [supportNeedsText, setSupportNeedsText] = useState("");
const [strengthsText, setStrengthsText] = useState("");

const [summaryHeading, setSummaryHeading] = useState("Professional Summary");
const [summaryText, setSummaryText] = useState("");
const [skillsInput, setSkillsInput] = useState("");
const [accomplishments, setAccomplishments] = useState("");

const [experiences, setExperiences] = useState<ExperienceItem[]>([createDefaultExperience()]);
const [credentialItems, setCredentialItems] = useState<CredentialItem[]>([
createDefaultCredential(),
]);
const [volunteerItems, setVolunteerItems] = useState<VolunteerItem[]>([
createDefaultVolunteer(),
]);

const [sectionOrder, setSectionOrder] = useState<ResumeSectionKey[]>([
"summary",
"skills",
"experience",
"credentials",
"volunteer",
"accomplishments",
]);

useEffect(() => {
async function loadUserAndProfile() {
const { data, error } = await supabase.auth.getUser();

if (error || !data.user) {
setLoadingUser(false);
return;
}

const currentUserId = data.user.id;
setUserId(currentUserId);

const { data: profile } = await supabase
.from("candidate_profiles")
.select("full_name, phone, city, state, email, linkedin_url, referral_code")
.eq("user_id", currentUserId)
.maybeSingle();

if (profile) {
setFullName(profile.full_name || "");
setPhone(profile.phone || "");
setCity(profile.city || "");
setStateName(profile.state || "");
setEmail(profile.email || data.user.email || "");
setLinkedinUrl(profile.linkedin_url || "");
} else {
setEmail(data.user.email || "");
}

if (!openTrackedRef.current) {
openTrackedRef.current = true;

const { error: activityError } = await supabase.from("user_activity").insert({
user_id: currentUserId,
full_name: profile?.full_name || null,
email: profile?.email || data.user.email || null,
referral_code: profile?.referral_code || null,
event_type: "tool_opened",
tool_name: "new_opportunities_resume_generator",
page_name: "/career-toolkit/new-opportunities-resume-generator",
});

if (activityError) {
console.error("New Opportunities Resume Generator tracking error:", activityError);
}
}

setLoadingUser(false);
}

loadUserAndProfile();
}, []);

useEffect(() => {
try {
const raw = window.localStorage.getItem(RESUME_DRAFT_STORAGE_KEY);
if (raw) {
const draft = JSON.parse(raw);

setFontFamily(draft.fontFamily || "Times New Roman");
setFullName(draft.fullName || "");
setPhone(draft.phone || "");
setCity(draft.city || "");
setStateName(draft.stateName || "");
setEmail(draft.email || "");
setLinkedinUrl(draft.linkedinUrl || "");
setPathType(draft.pathType || "veteran");
setTargetRole(draft.targetRole || "");
setSupportNeedsText(draft.supportNeedsText || "");
setStrengthsText(draft.strengthsText || "");
setSummaryHeading(draft.summaryHeading || "Professional Summary");
setSummaryText(draft.summaryText || "");
setSkillsInput(draft.skillsInput || "");
setAccomplishments(draft.accomplishments || "");
setExperiences(
Array.isArray(draft.experiences) && draft.experiences.length
? draft.experiences
: [createDefaultExperience()]
);
setCredentialItems(
Array.isArray(draft.credentialItems) && draft.credentialItems.length
? draft.credentialItems
: [createDefaultCredential()]
);
setVolunteerItems(
Array.isArray(draft.volunteerItems) && draft.volunteerItems.length
? draft.volunteerItems
: [createDefaultVolunteer()]
);
setSectionOrder(
Array.isArray(draft.sectionOrder) && draft.sectionOrder.length
? draft.sectionOrder
: ["summary", "skills", "experience", "credentials", "volunteer", "accomplishments"]
);
}
} catch {
// ignore bad local draft
} finally {
setDraftLoaded(true);
}
}, []);

useEffect(() => {
if (!draftLoaded) return;

const draft = {
fontFamily,
fullName,
phone,
city,
stateName,
email,
linkedinUrl,
pathType,
targetRole,
supportNeedsText,
strengthsText,
summaryHeading,
summaryText,
skillsInput,
accomplishments,
experiences,
credentialItems,
volunteerItems,
sectionOrder,
};

window.localStorage.setItem(RESUME_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}, [
draftLoaded,
fontFamily,
fullName,
phone,
city,
stateName,
email,
linkedinUrl,
pathType,
targetRole,
supportNeedsText,
strengthsText,
summaryHeading,
summaryText,
skillsInput,
accomplishments,
experiences,
credentialItems,
volunteerItems,
sectionOrder,
]);

const suggestedSkills = useMemo(
() => makeSkillSuggestions(pathType, strengthsText, supportNeedsText),
[pathType, strengthsText, supportNeedsText]
);

const skills = useMemo(() => {
const typed = skillsInput
.split(",")
.map((item) => normalizeSkillLabel(item))
.filter(Boolean);

const merged = [...typed, ...suggestedSkills];
return Array.from(new Set(merged)).slice(0, SKILL_LIMIT);
}, [skillsInput, suggestedSkills]);

const skillColumns = useMemo(() => splitSkillsIntoColumns(skills), [skills]);
const detectedResumeType = useMemo(() => detectResumeType(sectionOrder), [sectionOrder]);

const activeExperiences = useMemo(
() =>
experiences
.filter((item) => hasExperienceContent(item))
.map((item) => ({
...item,
bullets: item.bullets
.filter((b) => b.text.trim())
.map((bullet) => ({
text: improveBulletText(
bullet.text,
pathType,
item.roleTitle,
targetRole
),
})),
})),
[experiences, pathType, targetRole]
);

const activeCredentials = useMemo(
() => credentialItems.filter((item) => hasCredentialContent(item)),
[credentialItems]
);

const activeVolunteer = useMemo(
() =>
volunteerItems
.filter((item) => hasVolunteerContent(item))
.map((item) => ({
...item,
bullets: item.bullets
.filter((b) => b.text.trim())
.map((bullet) => ({
text: improveBulletText(
bullet.text,
pathType,
item.roleTitle,
targetRole
),
})),
})),
[volunteerItems, pathType, targetRole]
);

const guidedSummary = useMemo(() => {
if (summaryText.trim()) return summaryText.trim();

return createGuidedSummary(pathType, targetRole, supportNeedsText, strengthsText);
}, [summaryText, pathType, targetRole, supportNeedsText, strengthsText]);

function handleGenerateSummary() {
const next = createGuidedSummary(pathType, targetRole, supportNeedsText, strengthsText);
setSummaryText(next);
}

function handleGenerateSkills() {
setSkillsInput(suggestedSkills.join(", "));
}

function addExperience() {
setExperiences((prev) => [...prev, createDefaultExperience()]);
}

function updateExperience(index: number, field: keyof ExperienceItem, value: string | boolean) {
setExperiences((prev) =>
prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
);
}

function updateExperienceBullet(index: number, bulletIndex: number, value: string) {
setExperiences((prev) =>
prev.map((item, i) => {
if (i !== index) return item;
const bullets = item.bullets.map((bullet, j) =>
j === bulletIndex ? { text: value } : bullet
);
return { ...item, bullets };
})
);
}

function addExperienceBullet(index: number) {
setExperiences((prev) =>
prev.map((item, i) => {
if (i !== index) return item;
if (item.bullets.length >= BULLET_LIMIT) return item;
return { ...item, bullets: [...item.bullets, { text: "" }] };
})
);
}

function addCredential() {
setCredentialItems((prev) => [...prev, createDefaultCredential()]);
}

function updateCredential(index: number, field: keyof CredentialItem, value: string | boolean) {
setCredentialItems((prev) =>
prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
);
}

function addVolunteer() {
setVolunteerItems((prev) => [...prev, createDefaultVolunteer()]);
}

function updateVolunteer(index: number, field: keyof VolunteerItem, value: string | boolean) {
setVolunteerItems((prev) =>
prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
);
}

function updateVolunteerBullet(index: number, bulletIndex: number, value: string) {
setVolunteerItems((prev) =>
prev.map((item, i) => {
if (i !== index) return item;
const bullets = item.bullets.map((bullet, j) =>
j === bulletIndex ? { text: value } : bullet
);
return { ...item, bullets };
})
);
}

function addVolunteerBullet(index: number) {
setVolunteerItems((prev) =>
prev.map((item, i) => {
if (i !== index) return item;
if (item.bullets.length >= BULLET_LIMIT) return item;
return { ...item, bullets: [...item.bullets, { text: "" }] };
})
);
}

function moveSection(index: number, direction: "up" | "down") {
setSectionOrder((prev) => moveItem(prev, index, direction));
}

async function handleSaveDraft() {
setMessage("");

try {
setSaving(true);

const draft = {
fontFamily,
fullName,
phone,
city,
stateName,
email,
linkedinUrl,
pathType,
targetRole,
supportNeedsText,
strengthsText,
summaryHeading,
summaryText,
skillsInput,
accomplishments,
experiences,
credentialItems,
volunteerItems,
sectionOrder,
};

window.localStorage.setItem(RESUME_DRAFT_STORAGE_KEY, JSON.stringify(draft));

if (userId) {
await supabase.from("user_activity").insert({
user_id: userId,
full_name: fullName || null,
email: email || null,
event_type: "draft_saved",
tool_name: "new_opportunities_resume_generator",
page_name: "/career-toolkit/new-opportunities-resume-generator",
});
}

setMessage(
"Resume draft saved locally in this browser. To place a resume on your public profile, upload your final resume from the Profile page."
);
} catch {
setMessage("Unable to save your draft locally.");
} finally {
setSaving(false);
}
}

function handlePrint() {
const resumeNode = resumePrintRef.current;

if (!resumeNode) {
setMessage("Resume preview is not ready to print yet.");
return;
}

const printWindow = window.open("", "_blank", "width=900,height=1200");

if (!printWindow) {
setMessage("Pop-up blocked. Please allow pop-ups and try again.");
return;
}

const resumeHtml = resumeNode.innerHTML;

printWindow.document.open();
printWindow.document.write(`
<!doctype html>
<html>
<head>
<title>Resume Preview</title>
<style>
@page {
size: letter;
margin: 0.5in;
}

html, body {
margin: 0;
padding: 0;
background: white;
color: #111827;
font-family: ${fontFamily}, serif;
}

body {
-webkit-print-color-adjust: exact;
print-color-adjust: exact;
}

.print-resume {
width: 100%;
max-width: 100%;
margin: 0 auto;
padding-top: 90px;
color: #111827;
}

.resumeHeader {
position: fixed;
top: 0;
left: 0;
right: 0;
background: white;
text-align: center;
padding: 0 0 8px;
}

.resumeName {
margin: 0 0 8px;
font-size: 28px;
font-weight: 700;
color: #111827;
}

.resumeContact {
margin: 0 0 6px;
font-size: 14px;
line-height: 1.5;
color: #374151;
word-break: break-word;
}

.resumeLinkedin {
margin: 0;
font-size: 14px;
line-height: 1.5;
color: #1d4ed8;
word-break: break-word;
}

.resumeSection {
margin-bottom: 20px;
break-inside: auto;
page-break-inside: auto;
}

.resumeSectionTitle {
margin: 0 0 10px;
text-align: center;
font-size: 22px;
font-weight: 700;
color: #111827;
}

.resumeParagraph {
margin: 0;
font-size: 15px;
line-height: 1.7;
color: #111827;
white-space: pre-wrap;
word-break: break-word;
}

.skillsGrid {
display: grid;
grid-template-columns: 1fr 1fr 1fr;
gap: 10px 24px;
}

.skillColumn {
min-width: 0;
}

.skillItem {
margin: 0 0 8px;
font-size: 15px;
line-height: 1.5;
color: #111827;
word-break: break-word;
}

.resumeEntry {
margin-bottom: 16px;
break-inside: avoid;
page-break-inside: avoid;
}

.resumeEntryTop {
display: flex;
justify-content: space-between;
align-items: flex-start;
gap: 16px;
margin-bottom: 6px;
}

.resumeEntryHeading {
margin: 0;
font-size: 16px;
font-weight: 700;
color: #111827;
}

.resumeEntrySubheading {
margin: 4px 0 0;
font-size: 15px;
font-weight: 600;
color: #111827;
}

.resumeEntryDates {
margin: 0;
font-size: 14px;
color: #374151;
white-space: nowrap;
}

.resumeBullet {
margin: 4px 0;
font-size: 15px;
line-height: 1.65;
color: #111827;
white-space: pre-wrap;
word-break: break-word;
}
</style>
</head>
<body>
<div class="print-resume">
${resumeHtml}
</div>
</body>
</html>
`);
printWindow.document.close();
printWindow.focus();

setTimeout(() => {
printWindow.print();
}, 300);
}

function renderResumeSection(section: ResumeSectionKey) {
switch (section) {
case "summary":
if (!guidedSummary && !summaryHeading) return null;
return (
<section className="resumeSection" style={styles.resumeSectionBlock}>
<h3 style={styles.resumeSectionTitle}>
{summaryHeading || "Professional Summary"}
</h3>
<p style={styles.resumeParagraph}>
{guidedSummary || "Add your professional summary here."}
</p>
</section>
);

case "skills":
if (!skills.length) return null;
return (
<section className="resumeSection" style={styles.resumeSectionBlock}>
<h3 style={styles.resumeSectionTitle}>SKILLS</h3>
<div className="skillsGrid" style={styles.skillsGrid}>
{skillColumns.map((column, index) => (
<div key={index} className="skillColumn" style={styles.skillColumn}>
{column.map((skill, skillIndex) => (
<p
key={`${skill}-${skillIndex}`}
className="skillItem"
style={styles.skillItem}
>
• {skill}
</p>
))}
</div>
))}
</div>
</section>
);

case "experience":
if (!activeExperiences.length) return null;
return (
<section className="resumeSection" style={styles.resumeSectionBlock}>
<h3 style={styles.resumeSectionTitle}>EXPERIENCE / TRANSFERABLE EXPERIENCE</h3>
{activeExperiences.map((item, index) => (
<div key={index} className="resumeEntry" style={styles.resumeEntry}>
<div className="resumeEntryTop" style={styles.resumeEntryTop}>
<div>
<p className="resumeEntryHeading" style={styles.resumeEntryHeading}>
{item.companyName || "Organization / Setting"}{" "}
{item.city || item.state
? `— ${[item.city, item.state].filter(Boolean).join(", ")}`
: ""}
</p>
<p className="resumeEntrySubheading" style={styles.resumeEntrySubheading}>
{item.roleTitle || "Role / Experience Title"}
</p>
</div>
<p className="resumeEntryDates" style={styles.resumeEntryDates}>
{formatDateRange(
item.startMonth,
item.startYear,
item.endMonth,
item.endYear,
item.isPresent
)}
</p>
</div>
{item.bullets.map((bullet, bulletIndex) => (
<p
key={bulletIndex}
className="resumeBullet"
style={styles.resumeBullet}
>
• {bullet.text}
</p>
))}
</div>
))}
</section>
);

case "credentials":
if (!activeCredentials.length) return null;
return (
<section className="resumeSection" style={styles.resumeSectionBlock}>
<h3 style={styles.resumeSectionTitle}>EDUCATION + CERTIFICATIONS</h3>
{activeCredentials.map((item, index) => (
<div key={index} className="resumeEntry" style={styles.resumeEntry}>
<div className="resumeEntryTop" style={styles.resumeEntryTop}>
<div>
<p className="resumeEntryHeading" style={styles.resumeEntryHeading}>
{item.organizationName || "School / Program / Organization"}{" "}
{item.city || item.state
? `— ${[item.city, item.state].filter(Boolean).join(", ")}`
: ""}
</p>
<p className="resumeEntrySubheading" style={styles.resumeEntrySubheading}>
{item.credentialName || "Credential / Degree / Training"}
{item.details ? ` | ${item.details}` : ""}
</p>
</div>
<p className="resumeEntryDates" style={styles.resumeEntryDates}>
{formatDateRange(
item.startMonth,
item.startYear,
item.endMonth,
item.endYear,
item.isPresent
)}
</p>
</div>
</div>
))}
</section>
);

case "volunteer":
if (!activeVolunteer.length) return null;
return (
<section className="resumeSection" style={styles.resumeSectionBlock}>
<h3 style={styles.resumeSectionTitle}>VOLUNTEER WORK</h3>
{activeVolunteer.map((item, index) => (
<div key={index} className="resumeEntry" style={styles.resumeEntry}>
<div className="resumeEntryTop" style={styles.resumeEntryTop}>
<div>
<p className="resumeEntryHeading" style={styles.resumeEntryHeading}>
{item.organizationName || "Organization"}{" "}
{item.city || item.state
? `— ${[item.city, item.state].filter(Boolean).join(", ")}`
: ""}
</p>
<p className="resumeEntrySubheading" style={styles.resumeEntrySubheading}>
{item.roleTitle || "Role Title"}
</p>
</div>
<p className="resumeEntryDates" style={styles.resumeEntryDates}>
{formatDateRange(
item.startMonth,
item.startYear,
item.endMonth,
item.endYear,
item.isPresent
)}
</p>
</div>
{item.bullets.map((bullet, bulletIndex) => (
<p
key={bulletIndex}
className="resumeBullet"
style={styles.resumeBullet}
>
• {bullet.text}
</p>
))}
</div>
))}
</section>
);

case "accomplishments":
if (!accomplishments.trim()) return null;
return (
<section className="resumeSection" style={styles.resumeSectionBlock}>
<h3 style={styles.resumeSectionTitle}>ACCOMPLISHMENTS</h3>
<p style={styles.resumeParagraph}>{accomplishments}</p>
</section>
);

default:
return null;
}
}

if (loadingUser) {
return (
<main style={styles.page}>
<div style={styles.centerWrap}>Loading...</div>
</main>
);
}

return (
<main style={styles.page}>
<style>{`
@media print {
@page {
margin: 0.5in;
}

html,
body {
margin: 0 !important;
padding: 0 !important;
background: white !important;
}

body * {
visibility: hidden !important;
}

.resumePrintWrap,
.resumePrintWrap * {
visibility: visible !important;
}

.resumePrintWrap {
position: static !important;
width: 100% !important;
margin: 0 !important;
padding: 0 !important;
background: white !important;
}

.topBar {
display: none !important;
}

.container {
max-width: none !important;
margin: 0 !important;
padding: 0 !important;
}

main {
min-height: auto !important;
padding: 0 !important;
margin: 0 !important;
}

.layout {
display: block !important;
}

.rightCol {
position: static !important;
top: 0 !important;
align-self: auto !important;
margin: 0 !important;
padding: 0 !important;
}

.previewCard {
display: none !important;
}

.builderShell {
display: block !important;
}

.builderLeft {
display: none !important;
}

.resumePaper {
width: 100% !important;
max-width: none !important;
min-height: auto !important;
margin: 0 !important;
padding: 0 !important;
border: none !important;
border-radius: 0 !important;
box-shadow: none !important;
background: white !important;
overflow: visible !important;
}

.resumeHeader {
break-inside: avoid !important;
page-break-inside: avoid !important;
}

.resumeSection {
break-inside: auto !important;
page-break-inside: auto !important;
}

.builderTopRow,
.siteButtons,
.flashMessage {
display: none !important;
}
}
`}</style>

<div className="container" style={styles.container}>
<div className="topBar" style={styles.topBar}>
<div>
<p style={styles.kicker}>NEW OPPORTUNITIES RESUME GENERATOR</p>
<h1 style={styles.pageTitle}>Create a fully guided resume draft.</h1>
</div>

<div style={styles.topSelectors}>
<div style={styles.topSelectGroup}>
<label style={styles.topSelectLabel}>Resume Font</label>
<select
value={fontFamily}
onChange={(e) => setFontFamily(e.target.value as ResumeFont)}
style={styles.select}
>
<option>Times New Roman</option>
<option>Arial</option>
<option>Calibri</option>
</select>
</div>
</div>
</div>

<div className="builderShell layout" style={styles.layout}>
<div className="builderLeft" style={styles.leftCol}>
<section style={styles.card}>
<p style={styles.cardKicker}>NEW OPPORTUNITIES</p>
<h2 style={styles.cardTitle}>Build a stronger resume with guidance</h2>
<p style={styles.previewHelp}>
This builder is designed for veterans, stay-at-home parents /
homemakers / caregivers, career restarts, reentry, and people building
from little to no experience. It helps strengthen wording, generate a
guided summary, and turn simple bullet points into more professional
resume language.
</p>
</section>

<section style={styles.card}>
<p style={styles.cardKicker}>PATH</p>
<h2 style={styles.cardTitle}>Choose the background that fits you best</h2>

<div style={styles.fieldWrap}>
<label style={styles.inputLabel}>
Which path best reflects your current experience?
</label>
<select
value={pathType}
onChange={(e) => setPathType(e.target.value as OpportunityPath)}
style={styles.input}
>
<option value="veteran">Veteran</option>
<option value="caregiver">
Stay-at-Home Parent / Homemaker / Caregiver
</option>
<option value="career-restart">Career Restart</option>
<option value="reentry">Reentry</option>
<option value="little-no-experience">Little to No Experience</option>
</select>
</div>

<div style={styles.fieldWrap}>
<label style={styles.inputLabel}>Target Role</label>
<input
value={targetRole}
onChange={(e) => setTargetRole(e.target.value)}
style={styles.input}
placeholder="Example: Customer Service Representative"
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.inputLabel}>What are you moving toward?</label>
<textarea
value={supportNeedsText}
onChange={(e) => setSupportNeedsText(e.target.value)}
style={styles.textarea}
placeholder="Example: Looking for a stable role with growth potential where I can use communication, organization, and reliability."
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.inputLabel}>Your strengths or qualities</label>
<textarea
value={strengthsText}
onChange={(e) => setStrengthsText(e.target.value)}
style={styles.textarea}
placeholder="Example: dependable, organized, patient, good communicator, quick learner"
/>
</div>

<div style={styles.guidanceActions}>
<button type="button" onClick={handleGenerateSummary} style={styles.smallButton}>
Generate Guided Summary
</button>
<button type="button" onClick={handleGenerateSkills} style={styles.smallButton}>
Generate Suggested Skills
</button>
</div>
</section>

<section style={styles.card}>
<p style={styles.cardKicker}>RESUME TYPE</p>
<h2 style={styles.cardTitle}>
You’re currently building a {detectedResumeType} Resume
</h2>
<p style={styles.previewHelp}>
This updates automatically based on how you move your sections around.
</p>
</section>

<section style={styles.card}>
<p style={styles.cardKicker}>HEADER</p>
<h2 style={styles.cardTitle}>Resume Header</h2>

<div style={styles.twoColForm}>
<div>
<label style={styles.inputLabel}>Full Name</label>
<input
value={fullName}
onChange={(e) => setFullName(e.target.value)}
style={styles.input}
placeholder="Full Name"
/>
</div>
<div>
<label style={styles.inputLabel}>Phone Number</label>
<input
value={phone}
onChange={(e) => setPhone(e.target.value)}
style={styles.input}
placeholder="Phone Number"
/>
</div>
<div>
<label style={styles.inputLabel}>City (optional)</label>
<input
value={city}
onChange={(e) => setCity(e.target.value)}
style={styles.input}
placeholder="City"
/>
</div>
<div>
<label style={styles.inputLabel}>State (optional)</label>
<input
value={stateName}
onChange={(e) => setStateName(e.target.value)}
style={styles.input}
placeholder="State"
/>
</div>
<div>
<label style={styles.inputLabel}>Email</label>
<input
value={email}
onChange={(e) => setEmail(e.target.value)}
style={styles.input}
placeholder="Email"
/>
</div>
<div>
<label style={styles.inputLabel}>LinkedIn (optional)</label>
<input
value={linkedinUrl}
onChange={(e) => setLinkedinUrl(e.target.value)}
style={styles.input}
placeholder="LinkedIn URL"
/>
</div>
</div>
</section>

<section style={styles.card}>
<p style={styles.cardKicker}>SUMMARY</p>
<h2 style={styles.cardTitle}>Guided Summary + Skills</h2>

<label style={styles.inputLabel}>
Summary Heading (optional, can be blank or "Professional Summary")
</label>
<input
value={summaryHeading}
onChange={(e) => setSummaryHeading(e.target.value)}
style={styles.input}
placeholder="Professional Summary"
/>

<p style={styles.helper}>
Leave this blank if you want the tool to guide the summary for you. You
can also edit the generated version after it fills in.
</p>

<label style={styles.inputLabel}>Summary</label>
<textarea
value={summaryText}
onChange={(e) => setSummaryText(e.target.value)}
style={styles.textarea}
placeholder="Example: Dependable and adaptable candidate with strong transferable skills, communication strengths, and readiness for a new opportunity."
/>

<label style={styles.inputLabel}>Skills (comma separated, up to 9)</label>
<input
value={skillsInput}
onChange={(e) => setSkillsInput(e.target.value)}
style={styles.input}
placeholder="Communication, Time Management, Dependability"
/>

<p style={styles.helper}>
Tip: if you are not sure what to enter, use the “Generate Suggested
Skills” button above.
</p>
</section>

<section style={styles.card}>
<p style={styles.cardKicker}>EXPERIENCE</p>
<h2 style={styles.cardTitle}>Experience / Transferable Experience</h2>

{experiences.map((item, index) => (
<div key={index} style={styles.sectionGroup}>
<div style={styles.twoColForm}>
<div>
<label style={styles.inputLabel}>Organization / Setting</label>
<input
value={item.companyName}
onChange={(e) =>
updateExperience(index, "companyName", e.target.value)
}
style={styles.input}
placeholder="Example: Home-Based Care, Community Program, Volunteer Setting"
/>
</div>
<div>
<label style={styles.inputLabel}>Role / Experience Title</label>
<input
value={item.roleTitle}
onChange={(e) => updateExperience(index, "roleTitle", e.target.value)}
style={styles.input}
placeholder="Example: Caregiver, Household Manager, Volunteer Support"
/>
</div>
<div>
<label style={styles.inputLabel}>City</label>
<input
value={item.city}
onChange={(e) => updateExperience(index, "city", e.target.value)}
style={styles.input}
placeholder="City"
/>
</div>
<div>
<label style={styles.inputLabel}>State</label>
<input
value={item.state}
onChange={(e) => updateExperience(index, "state", e.target.value)}
style={styles.input}
placeholder="State"
/>
</div>
<div>
<label style={styles.inputLabel}>From Month</label>
<select
value={item.startMonth}
onChange={(e) =>
updateExperience(index, "startMonth", e.target.value)
}
style={styles.input}
>
{MONTHS.map((month) => (
<option key={month} value={month}>
{month || "Select"}
</option>
))}
</select>
</div>
<div>
<label style={styles.inputLabel}>From Year</label>
<input
value={item.startYear}
onChange={(e) =>
updateExperience(index, "startYear", e.target.value)
}
style={styles.input}
placeholder="2022"
/>
</div>
</div>

<label style={styles.checkboxRow}>
<input
type="checkbox"
checked={item.isPresent}
onChange={(e) => updateExperience(index, "isPresent", e.target.checked)}
/>
<span>I currently do this</span>
</label>

{!item.isPresent && (
<div style={styles.twoColForm}>
<div>
<label style={styles.inputLabel}>To Month</label>
<select
value={item.endMonth}
onChange={(e) =>
updateExperience(index, "endMonth", e.target.value)
}
style={styles.input}
>
{MONTHS.map((month) => (
<option key={month} value={month}>
{month || "Select"}
</option>
))}
</select>
</div>
<div>
<label style={styles.inputLabel}>To Year</label>
<input
value={item.endYear}
onChange={(e) =>
updateExperience(index, "endYear", e.target.value)
}
style={styles.input}
placeholder="2024"
/>
</div>
</div>
)}

<p style={styles.helper}>
Add simple bullet points. This tool will strengthen the wording in the
live preview and printed resume. Example: customer service, scheduled
appointments, took care of family member, handled cash.
</p>

{item.bullets.map((bullet, bulletIndex) => (
<div key={bulletIndex}>
<label style={styles.inputLabel}>Bullet {bulletIndex + 1}</label>
<input
value={bullet.text}
onChange={(e) =>
updateExperienceBullet(index, bulletIndex, e.target.value)
}
style={styles.input}
placeholder="Describe what you did in simple words"
/>
{bullet.text.trim() ? (
<p style={styles.guidedPreviewText}>
Guided version:{" "}
{improveBulletText(
bullet.text,
pathType,
item.roleTitle,
targetRole
)}
</p>
) : null}
</div>
))}

<button
type="button"
onClick={() => addExperienceBullet(index)}
style={styles.smallButton}
>
+ Add Bullet
</button>
</div>
))}

<button type="button" onClick={addExperience} style={styles.smallButton}>
+ Add Experience
</button>
</section>

<section style={styles.card}>
<p style={styles.cardKicker}>EDUCATION + CERTIFICATIONS</p>
<h2 style={styles.cardTitle}>Education, training, and credentials</h2>

{credentialItems.map((item, index) => (
<div key={index} style={styles.sectionGroup}>
<div style={styles.twoColForm}>
<div>
<label style={styles.inputLabel}>School / Program / Organization</label>
<input
value={item.organizationName}
onChange={(e) =>
updateCredential(index, "organizationName", e.target.value)
}
style={styles.input}
placeholder="School, training program, certification provider"
/>
</div>
<div>
<label style={styles.inputLabel}>Credential / Degree / Certificate</label>
<input
value={item.credentialName}
onChange={(e) =>
updateCredential(index, "credentialName", e.target.value)
}
style={styles.input}
placeholder="CNA Training, GED, Certificate, Degree"
/>
</div>
<div>
<label style={styles.inputLabel}>City</label>
<input
value={item.city}
onChange={(e) => updateCredential(index, "city", e.target.value)}
style={styles.input}
placeholder="City"
/>
</div>
<div>
<label style={styles.inputLabel}>State</label>
<input
value={item.state}
onChange={(e) => updateCredential(index, "state", e.target.value)}
style={styles.input}
placeholder="State"
/>
</div>
<div>
<label style={styles.inputLabel}>From Month</label>
<select
value={item.startMonth}
onChange={(e) =>
updateCredential(index, "startMonth", e.target.value)
}
style={styles.input}
>
{MONTHS.map((month) => (
<option key={month} value={month}>
{month || "Select"}
</option>
))}
</select>
</div>
<div>
<label style={styles.inputLabel}>From Year</label>
<input
value={item.startYear}
onChange={(e) =>
updateCredential(index, "startYear", e.target.value)
}
style={styles.input}
placeholder="2022"
/>
</div>
</div>

<label style={styles.checkboxRow}>
<input
type="checkbox"
checked={item.isPresent}
onChange={(e) => updateCredential(index, "isPresent", e.target.checked)}
/>
<span>I am currently completing this</span>
</label>

{!item.isPresent && (
<div style={styles.twoColForm}>
<div>
<label style={styles.inputLabel}>To Month</label>
<select
value={item.endMonth}
onChange={(e) =>
updateCredential(index, "endMonth", e.target.value)
}
style={styles.input}
>
{MONTHS.map((month) => (
<option key={month} value={month}>
{month || "Select"}
</option>
))}
</select>
</div>
<div>
<label style={styles.inputLabel}>To Year</label>
<input
value={item.endYear}
onChange={(e) =>
updateCredential(index, "endYear", e.target.value)
}
style={styles.input}
placeholder="2024"
/>
</div>
</div>
)}

<label style={styles.inputLabel}>Extra Details (optional)</label>
<input
value={item.details}
onChange={(e) => updateCredential(index, "details", e.target.value)}
style={styles.input}
placeholder="Example: clinical practice, coursework, workforce readiness program"
/>
</div>
))}

<button type="button" onClick={addCredential} style={styles.smallButton}>
+ Add Education / Certification
</button>
</section>

<section style={styles.card}>
<p style={styles.cardKicker}>VOLUNTEER</p>
<h2 style={styles.cardTitle}>Volunteer Work</h2>

{volunteerItems.map((item, index) => (
<div key={index} style={styles.sectionGroup}>
<div style={styles.twoColForm}>
<div>
<label style={styles.inputLabel}>Organization</label>
<input
value={item.organizationName}
onChange={(e) =>
updateVolunteer(index, "organizationName", e.target.value)
}
style={styles.input}
placeholder="Organization Name"
/>
</div>
<div>
<label style={styles.inputLabel}>Role</label>
<input
value={item.roleTitle}
onChange={(e) => updateVolunteer(index, "roleTitle", e.target.value)}
style={styles.input}
placeholder="Role Title"
/>
</div>
<div>
<label style={styles.inputLabel}>City</label>
<input
value={item.city}
onChange={(e) => updateVolunteer(index, "city", e.target.value)}
style={styles.input}
placeholder="City"
/>
</div>
<div>
<label style={styles.inputLabel}>State</label>
<input
value={item.state}
onChange={(e) => updateVolunteer(index, "state", e.target.value)}
style={styles.input}
placeholder="State"
/>
</div>
<div>
<label style={styles.inputLabel}>From Month</label>
<select
value={item.startMonth}
onChange={(e) =>
updateVolunteer(index, "startMonth", e.target.value)
}
style={styles.input}
>
{MONTHS.map((month) => (
<option key={month} value={month}>
{month || "Select"}
</option>
))}
</select>
</div>
<div>
<label style={styles.inputLabel}>From Year</label>
<input
value={item.startYear}
onChange={(e) =>
updateVolunteer(index, "startYear", e.target.value)
}
style={styles.input}
placeholder="2020"
/>
</div>
</div>

<label style={styles.checkboxRow}>
<input
type="checkbox"
checked={item.isPresent}
onChange={(e) => updateVolunteer(index, "isPresent", e.target.checked)}
/>
<span>I currently volunteer here</span>
</label>

{!item.isPresent && (
<div style={styles.twoColForm}>
<div>
<label style={styles.inputLabel}>To Month</label>
<select
value={item.endMonth}
onChange={(e) =>
updateVolunteer(index, "endMonth", e.target.value)
}
style={styles.input}
>
{MONTHS.map((month) => (
<option key={month} value={month}>
{month || "Select"}
</option>
))}
</select>
</div>
<div>
<label style={styles.inputLabel}>To Year</label>
<input
value={item.endYear}
onChange={(e) =>
updateVolunteer(index, "endYear", e.target.value)
}
style={styles.input}
placeholder="2022"
/>
</div>
</div>
)}

<p style={styles.helper}>
Add simple bullets here too. This tool will strengthen the wording in
the preview.
</p>

{item.bullets.map((bullet, bulletIndex) => (
<div key={bulletIndex}>
<label style={styles.inputLabel}>Bullet {bulletIndex + 1}</label>
<input
value={bullet.text}
onChange={(e) =>
updateVolunteerBullet(index, bulletIndex, e.target.value)
}
style={styles.input}
placeholder="Describe your volunteer work"
/>
{bullet.text.trim() ? (
<p style={styles.guidedPreviewText}>
Guided version:{" "}
{improveBulletText(
bullet.text,
pathType,
item.roleTitle,
targetRole
)}
</p>
) : null}
</div>
))}

<button
type="button"
onClick={() => addVolunteerBullet(index)}
style={styles.smallButton}
>
+ Add Bullet
</button>
</div>
))}

<button type="button" onClick={addVolunteer} style={styles.smallButton}>
+ Add Volunteer Work
</button>
</section>

<section style={styles.card}>
<p style={styles.cardKicker}>ACCOMPLISHMENTS</p>
<h2 style={styles.cardTitle}>Accomplishments</h2>
<label style={styles.inputLabel}>Accomplishments</label>
<textarea
value={accomplishments}
onChange={(e) => setAccomplishments(e.target.value)}
style={styles.textarea}
placeholder="Awards, recognitions, milestones, program completions, achievements, leadership examples"
/>
</section>

<section style={styles.card}>
<p style={styles.cardKicker}>ORDER</p>
<h2 style={styles.cardTitle}>Move Resume Sections</h2>

{sectionOrder.map((section, index) => (
<div key={section} style={styles.orderRow}>
<span style={styles.orderLabel}>
{section === "summary"
? "Summary"
: section === "skills"
? "Skills"
: section === "experience"
? "Experience / Transferable Experience"
: section === "credentials"
? "Education + Certifications"
: section === "volunteer"
? "Volunteer"
: "Accomplishments"}
</span>
<div style={styles.orderButtons}>
<button
type="button"
onClick={() => moveSection(index, "up")}
style={styles.orderButton}
>
Up
</button>
<button
type="button"
onClick={() => moveSection(index, "down")}
style={styles.orderButton}
>
Down
</button>
</div>
</div>
))}
</section>

{message ? (
<div className="flashMessage" style={styles.messageBox}>
{message}
</div>
) : null}

<div className="siteButtons" style={styles.footerButtons}>
<button
type="button"
onClick={handleSaveDraft}
disabled={saving}
style={styles.saveButton}
>
{saving ? "Saving..." : "Save Draft"}
</button>
<button type="button" onClick={handlePrint} style={styles.printButton}>
Print Resume
</button>
<a href="/career-toolkit" style={styles.backButton}>
Back to Career ToolKit
</a>
</div>
</div>

<div className="resumePrintWrap rightCol" style={styles.rightCol}>
<div className="builderTopRow previewCard" style={styles.previewCard}>
<p style={styles.cardKicker}>LIVE PREVIEW</p>
<h2 style={styles.cardTitle}>Resume Preview</h2>
<p style={styles.previewHelp}>
The preview stays visible while you build and strengthens simple
summary and bullet language as you type.
</p>
<p style={styles.resumeTypePreview}>
Current layout: <strong>{detectedResumeType}</strong>
</p>
</div>

<div
ref={resumePrintRef}
className="resumePaper"
style={{
...styles.resumePaper,
fontFamily,
}}
>
<div className="resumeHeader" style={styles.resumeHeader}>
<h1 className="resumeName" style={styles.resumeName}>
{fullName || "Your Name"}
</h1>
<p className="resumeContact" style={styles.resumeContact}>
{[phone, email, [city, stateName].filter(Boolean).join(", ")]
.filter(Boolean)
.join(" • ")}
</p>
{linkedinUrl ? (
<p className="resumeLinkedin" style={styles.resumeLinkedin}>
{linkedinUrl}
</p>
) : null}
</div>

{sectionOrder.map((section) => (
<div key={section}>{renderResumeSection(section)}</div>
))}
</div>
</div>
</div>
</div>
</main>
);
}

const styles: Record<string, CSSProperties> = {
page: {
minHeight: "100vh",
background:
"radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent 20%), linear-gradient(180deg, #040404 0%, #0b0b0d 100%)",
color: "#f5f5f5",
padding: "24px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
container: {
maxWidth: "1380px",
margin: "0 auto",
},
centerWrap: {
minHeight: "70vh",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontSize: "18px",
color: "#e5e7eb",
},
topBar: {
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: "20px",
marginBottom: "20px",
flexWrap: "wrap",
},
topSelectors: {
display: "flex",
gap: "16px",
flexWrap: "wrap",
},
topSelectGroup: {
display: "flex",
flexDirection: "column",
gap: "8px",
minWidth: "180px",
},
topSelectLabel: {
fontSize: "13px",
color: "#d1d5db",
fontWeight: 600,
},
kicker: {
margin: "0 0 8px",
color: "#c4b5fd",
fontSize: "12px",
letterSpacing: "0.22em",
textTransform: "uppercase",
},
pageTitle: {
margin: 0,
fontSize: "44px",
lineHeight: 1.06,
letterSpacing: "-0.04em",
fontWeight: 700,
color: "#fafafa",
maxWidth: "820px",
},
layout: {
display: "grid",
gridTemplateColumns: "minmax(0, 1fr) 520px",
gap: "24px",
alignItems: "start",
},
leftCol: {
minWidth: 0,
},
rightCol: {
position: "sticky",
top: "20px",
alignSelf: "start",
},
card: {
background: "linear-gradient(180deg, #111111 0%, #171717 100%)",
border: "1px solid #262626",
borderRadius: "28px",
padding: "20px",
boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
marginBottom: "18px",
},
previewCard: {
background: "linear-gradient(180deg, #111111 0%, #171717 100%)",
border: "1px solid #262626",
borderRadius: "28px",
padding: "20px",
boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
marginBottom: "18px",
},
cardKicker: {
margin: "0 0 8px",
color: "#d4d4d8",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
cardTitle: {
margin: "0 0 10px",
fontSize: "28px",
lineHeight: 1.1,
color: "#fafafa",
fontWeight: 700,
},
previewHelp: {
margin: 0,
color: "#d4d4d8",
fontSize: "15px",
lineHeight: 1.5,
},
resumeTypePreview: {
margin: "12px 0 0",
color: "#e5e7eb",
fontSize: "15px",
lineHeight: 1.6,
},
select: {
background: "#0b0f19",
color: "#fff",
border: "1px solid rgba(255,255,255,0.18)",
borderRadius: "16px",
padding: "12px 14px",
fontSize: "15px",
},
twoColForm: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "14px 16px",
},
inputLabel: {
display: "block",
margin: "0 0 6px",
fontSize: "15px",
color: "#f5f5f5",
fontWeight: 600,
},
input: {
width: "100%",
background: "#05070c",
color: "#fff",
border: "1px solid #2f3541",
borderRadius: "18px",
padding: "14px 16px",
fontSize: "16px",
outline: "none",
boxSizing: "border-box",
},
textarea: {
width: "100%",
minHeight: "110px",
resize: "vertical",
background: "#05070c",
color: "#fff",
border: "1px solid #2f3541",
borderRadius: "18px",
padding: "14px 16px",
fontSize: "16px",
outline: "none",
boxSizing: "border-box",
marginBottom: "14px",
},
helper: {
margin: "10px 0 12px",
color: "#cbd5e1",
fontSize: "14px",
lineHeight: 1.65,
},
checkboxRow: {
display: "flex",
alignItems: "center",
gap: "10px",
margin: "12px 0",
color: "#f5f5f5",
fontSize: "15px",
},
sectionGroup: {
border: "1px solid rgba(255,255,255,0.08)",
borderRadius: "22px",
padding: "16px",
marginBottom: "14px",
},
smallButton: {
marginTop: "12px",
background: "linear-gradient(180deg, #5b84c7 0%, #456aa8 100%)",
color: "#fff",
border: "1px solid rgba(255,255,255,0.16)",
borderRadius: "14px",
padding: "10px 14px",
fontSize: "15px",
fontWeight: 600,
cursor: "pointer",
},
guidanceActions: {
display: "flex",
flexWrap: "wrap",
gap: "12px",
marginTop: "6px",
},
guidedPreviewText: {
margin: "8px 0 0",
color: "#cbd5e1",
fontSize: "14px",
lineHeight: 1.65,
},
orderRow: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
gap: "12px",
padding: "12px 0",
borderBottom: "1px solid rgba(255,255,255,0.08)",
},
orderLabel: {
fontSize: "18px",
color: "#f8fafc",
fontWeight: 600,
},
orderButtons: {
display: "flex",
gap: "8px",
},
orderButton: {
background: "#0f244d",
color: "#fff",
border: "1px solid rgba(148,163,184,0.35)",
borderRadius: "12px",
padding: "8px 12px",
fontSize: "14px",
cursor: "pointer",
},
footerButtons: {
display: "grid",
gridTemplateColumns: "1fr 1fr 1fr",
gap: "12px",
marginTop: "12px",
marginBottom: "32px",
},
saveButton: {
background: "linear-gradient(180deg, #f5f5f5 0%, #d4d4d8 100%)",
color: "#09090b",
border: "none",
borderRadius: "18px",
padding: "16px",
fontSize: "20px",
fontWeight: 700,
cursor: "pointer",
},
printButton: {
background: "linear-gradient(180deg, #0f244d 0%, #112b5f 100%)",
color: "#fff",
border: "1px solid rgba(148,163,184,0.28)",
borderRadius: "18px",
padding: "16px",
fontSize: "20px",
fontWeight: 700,
cursor: "pointer",
},
backButton: {
background: "transparent",
color: "#fff",
border: "1px solid rgba(148,163,184,0.28)",
borderRadius: "18px",
padding: "16px",
fontSize: "20px",
fontWeight: 700,
textAlign: "center",
textDecoration: "none",
display: "flex",
alignItems: "center",
justifyContent: "center",
},
messageBox: {
background: "rgba(59,130,246,0.12)",
border: "1px solid rgba(59,130,246,0.28)",
color: "#dbeafe",
borderRadius: "18px",
padding: "14px 16px",
marginBottom: "16px",
fontSize: "15px",
},
resumePaper: {
width: "100%",
minHeight: "1120px",
height: "auto",
overflow: "visible",
background: "#fff",
borderRadius: "18px",
border: "1px solid #e5e7eb",
boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
padding: "34px 32px 42px",
color: "#111827",
boxSizing: "border-box",
},
resumeHeader: {
textAlign: "center",
marginBottom: "20px",
paddingBottom: "8px",
},
resumeName: {
margin: "0 0 8px",
fontSize: "28px",
fontWeight: 700,
color: "#111827",
},
resumeContact: {
margin: "0 0 6px",
fontSize: "14px",
lineHeight: 1.5,
color: "#374151",
wordBreak: "break-word",
},
resumeLinkedin: {
margin: 0,
fontSize: "14px",
lineHeight: 1.5,
color: "#1d4ed8",
wordBreak: "break-word",
},
resumeSectionBlock: {
marginBottom: "20px",
},
resumeSectionTitle: {
margin: "0 0 10px",
textAlign: "center",
fontSize: "22px",
fontWeight: 700,
color: "#111827",
},
resumeParagraph: {
margin: 0,
fontSize: "15px",
lineHeight: 1.7,
color: "#111827",
whiteSpace: "pre-wrap",
wordBreak: "break-word",
},
skillsGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr 1fr",
gap: "10px 24px",
},
skillColumn: {
minWidth: 0,
},
skillItem: {
margin: "0 0 8px",
fontSize: "15px",
lineHeight: 1.5,
color: "#111827",
wordBreak: "break-word",
},
resumeEntry: {
marginBottom: "16px",
},
resumeEntryTop: {
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: "16px",
marginBottom: "6px",
},
resumeEntryHeading: {
margin: 0,
fontSize: "16px",
fontWeight: 700,
color: "#111827",
},
resumeEntrySubheading: {
margin: "4px 0 0",
fontSize: "15px",
fontWeight: 600,
color: "#111827",
},
resumeEntryDates: {
margin: 0,
fontSize: "14px",
color: "#374151",
whiteSpace: "nowrap",
},
resumeBullet: {
margin: "4px 0",
fontSize: "15px",
lineHeight: 1.65,
color: "#111827",
whiteSpace: "pre-wrap",
wordBreak: "break-word",
},
};
