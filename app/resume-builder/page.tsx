"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

type ResumeFont = "Times New Roman" | "Arial" | "Calibri";
type ResumeLanguage = "English" | "Spanish" | "Hindi" | "Polish";
type ResumeType = "Chronological" | "Functional" | "Combination" | "Hybrid";

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

type EducationItem = {
schoolName: string;
city: string;
state: string;
degree: string;
gpa: string;
startMonth: string;
startYear: string;
endMonth: string;
endYear: string;
isPresent: boolean;
};

type CertificateItem = {
organizationName: string;
city: string;
state: string;
certificateName: string;
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
| "education"
| "certifications"
| "volunteer"
| "accomplishments";

const BULLET_LIMIT = 5;
const SKILL_LIMIT = 9;
const RESUME_DRAFT_STORAGE_KEY = "hireminds-resume-draft-v1";

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

const RESUME_FORMAT_ORDERS: Record<ResumeType, ResumeSectionKey[]> = {
Chronological: ["summary", "experience", "education", "certifications", "skills", "volunteer", "accomplishments"],
Functional: ["summary", "skills", "accomplishments", "experience", "education", "certifications", "volunteer"],
Combination: ["summary", "skills", "experience", "education", "certifications", "volunteer", "accomplishments"],
Hybrid: ["summary", "skills", "education", "certifications", "experience", "volunteer", "accomplishments"],
};

const RESUME_FORMAT_HELP: Record<ResumeType, string> = {
Chronological: "Puts work history first and emphasizes a clear timeline. Best when your recent experience directly supports the role you want next.",
Functional: "Leads with skills and accomplishments while moving work history lower. Best for career changes, gaps, re-entry, or limited directly related experience.",
Combination: "Leads with a strong summary and skills, then gives full weight to work history. Best when both skills and experience are important.",
Hybrid: "Summary first, followed by skills, education and/or certifications, then experience and volunteer work. A balanced format for showing both preparation and experience.",
};

const TRANSLATIONS: Record<
ResumeLanguage,
{
pageKicker: string;
pageTitle: string;
font: string;
language: string;
livePreview: string;
previewHelp: string;
header: string;
summary: string;
summaryAndSkills: string;
skills: string;
experience: string;
education: string;
certifications: string;
volunteer: string;
accomplishments: string;
saveDraft: string;
printResume: string;
moveSections: string;
currentlyWorkHere: string;
currentlyAttendHere: string;
currentlyCompletingCert: string;
currentlyVolunteerHere: string;
present: string;
backToProfile: string;
}
> = {
English: {
pageKicker: "RESUME GENERATOR",
pageTitle: "Create and save your resume draft.",
font: "Resume Font",
language: "Language",
livePreview: "Resume Preview",
previewHelp: "Live resume preview — it stays visible while you work.",
header: "Resume Header",
summary: "Summary",
summaryAndSkills: "Summary + Skills",
skills: "Skills",
experience: "Work Experience",
education: "Education (optional)",
certifications: "Certifications (optional)",
volunteer: "Volunteer Work (optional)",
accomplishments: "Accomplishments (optional)",
saveDraft: "Save Draft",
printResume: "Print Resume",
moveSections: "Move Resume Sections",
currentlyWorkHere: "I currently work here",
currentlyAttendHere: "I currently attend here",
currentlyCompletingCert: "I am currently completing this certification",
currentlyVolunteerHere: "I currently volunteer here",
present: "Present",
backToProfile: "Back to Profile",
},
Spanish: {
pageKicker: "GENERADOR DE CURRÍCULUM",
pageTitle: "Crea y guarda tu borrador de currículum.",
font: "Fuente del currículum",
language: "Idioma",
livePreview: "Vista previa del currículum",
previewHelp:
"La vista previa permanece visible mientras escribes y se expande a medida que agregas contenido.",
header: "Encabezado del currículum",
summary: "Resumen",
summaryAndSkills: "Resumen + Habilidades",
skills: "Habilidades",
experience: "Experiencia laboral",
education: "Educación (opcional)",
certifications: "Certificaciones (opcional)",
volunteer: "Trabajo voluntario (opcional)",
accomplishments: "Logros (opcional)",
saveDraft: "Guardar borrador",
printResume: "Imprimir currículum",
moveSections: "Mover secciones del currículum",
currentlyWorkHere: "Actualmente trabajo aquí",
currentlyAttendHere: "Actualmente estudio aquí",
currentlyCompletingCert: "Actualmente estoy completando esta certificación",
currentlyVolunteerHere: "Actualmente hago voluntariado aquí",
present: "Actualidad",
backToProfile: "Volver al perfil",
},
Hindi: {
pageKicker: "रिज़्यूमे जनरेटर",
pageTitle: "अपना रिज़्यूमे ड्राफ्ट बनाएं और सेव करें।",
font: "रिज़्यूमे फ़ॉन्ट",
language: "भाषा",
livePreview: "रिज़्यूमे पूर्वावलोकन",
previewHelp:
"जब आप बनाते हैं तो पूर्वावलोकन दिखाई देता रहता है और टाइप करते समय बढ़ता जाता है।",
header: "रिज़्यूमे हेडर",
summary: "सारांश",
summaryAndSkills: "सारांश + कौशल",
skills: "कौशल",
experience: "कार्य अनुभव",
education: "शिक्षा (वैकल्पिक)",
certifications: "प्रमाणपत्र (वैकल्पिक)",
volunteer: "स्वयंसेवी कार्य (वैकल्पिक)",
accomplishments: "उपलब्धियाँ (वैकल्पिक)",
saveDraft: "ड्राफ्ट सहेजें",
printResume: "रिज़्यूमे प्रिंट करें",
moveSections: "रिज़्यूमे सेक्शन बदलें",
currentlyWorkHere: "मैं वर्तमान में यहाँ काम करता/करती हूँ",
currentlyAttendHere: "मैं वर्तमान में यहाँ पढ़ता/पढ़ती हूँ",
currentlyCompletingCert: "मैं वर्तमान में यह प्रमाणपत्र पूरा कर रहा/रही हूँ",
currentlyVolunteerHere: "मैं वर्तमान में यहाँ स्वयंसेवा करता/करती हूँ",
present: "वर्तमान",
backToProfile: "प्रोफ़ाइल पर वापस जाएँ",
},
Polish: {
pageKicker: "GENERATOR CV",
pageTitle: "Utwórz i zapisz szkic CV.",
font: "Czcionka CV",
language: "Język",
livePreview: "Podgląd CV",
previewHelp:
"Podgląd pozostaje widoczny podczas tworzenia i rozszerza się w miarę pisania.",
header: "Nagłówek CV",
summary: "Podsumowanie",
summaryAndSkills: "Podsumowanie + Umiejętności",
skills: "Umiejętności",
experience: "Doświadczenie zawodowe",
education: "Wykształcenie (opcjonalnie)",
certifications: "Certyfikaty (opcjonalnie)",
volunteer: "Wolontariat (opcjonalnie)",
accomplishments: "Osiągnięcia (opcjonalnie)",
saveDraft: "Zapisz szkic",
printResume: "Drukuj CV",
moveSections: "Przenieś sekcje CV",
currentlyWorkHere: "Obecnie tu pracuję",
currentlyAttendHere: "Obecnie tu się uczę",
currentlyCompletingCert: "Obecnie kończę ten certyfikat",
currentlyVolunteerHere: "Obecnie jestem tu wolontariuszem",
present: "Obecnie",
backToProfile: "Wróć do profilu",
},
};

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
isPresent: boolean,
presentLabel: string
) {
const from = [startMonth, startYear].filter(Boolean).join(" ");
const to = isPresent ? presentLabel : [endMonth, endYear].filter(Boolean).join(" ");
if (from && to) return `${from} - ${to}`;
if (from) return from;
if (to) return to;
return "";
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
const educationIndex = sectionOrder.indexOf("education");
const certificationsIndex = sectionOrder.indexOf("certifications");
const volunteerIndex = sectionOrder.indexOf("volunteer");

const educationLikeNearTop =
(educationIndex !== -1 && educationIndex < experienceIndex) ||
(certificationsIndex !== -1 && certificationsIndex < experienceIndex) ||
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

function hasEducationContent(item: EducationItem) {
return Boolean(
item.schoolName ||
item.degree ||
item.city ||
item.state ||
item.gpa ||
item.startMonth ||
item.startYear ||
item.endMonth ||
item.endYear ||
item.isPresent
);
}

function hasCertificateContent(item: CertificateItem) {
return Boolean(
item.organizationName ||
item.certificateName ||
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



function getPrintFormatCss(type: ResumeType) {
  return `
    .resumeHeader { text-align:center; margin-bottom:14px; padding-bottom:0; border:0 !important; }
    .resumeSectionTitle { text-align:center; border:0 !important; background:transparent !important; padding:0 !important; margin:0 0 8px; font-size:11pt; letter-spacing:.04em; }
    .skillsGrid { grid-template-columns:1fr 1fr 1fr; }
    .resumeEntryTop { border:0 !important; padding-bottom:0 !important; }
    .resumeEntrySubheading { font-style:normal; font-weight:600; }
  `;
}

type ResumeFormatVisuals = {
  paper: CSSProperties;
  header: CSSProperties;
  name: CSSProperties;
  contact: CSSProperties;
  linkedIn: CSSProperties;
  professionalTitle: CSSProperties;
  sectionBlock: CSSProperties;
  sectionTitle: CSSProperties;
  skillsGrid: CSSProperties;
  entryTop: CSSProperties;
  entryHeading: CSSProperties;
  entrySubheading: CSSProperties;
};

function getResumeFormatVisuals(type: ResumeType): ResumeFormatVisuals {
  return {
    paper: {},
    header: { textAlign: "center", border: "none", paddingBottom: 0, marginBottom: "14px" },
    name: { fontSize: "20pt", letterSpacing: "0" },
    contact: { textAlign: "center" },
    linkedIn: { textAlign: "center" },
    professionalTitle: { textAlign: "center", fontSize: "10.5pt", fontWeight: 700, margin: "2px 0 6px", color: "#111827" },
    sectionBlock: { marginBottom: "16px" },
    sectionTitle: { textAlign: "center", border: "none", background: "transparent", padding: 0, marginBottom: "8px", fontSize: "11pt", letterSpacing: "0.04em" },
    skillsGrid: { gridTemplateColumns: "1fr 1fr 1fr" },
    entryTop: {},
    entryHeading: { fontWeight: 700 },
    entrySubheading: { fontWeight: 600, fontStyle: "normal" },
  };
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

function createDefaultEducation(): EducationItem {
return {
schoolName: "",
city: "",
state: "",
degree: "",
gpa: "",
startMonth: "",
startYear: "",
endMonth: "",
endYear: "",
isPresent: false,
};
}

function createDefaultCertificate(): CertificateItem {
return {
organizationName: "",
city: "",
state: "",
certificateName: "",
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

export default function ResumeBuilderPage() {
const [loadingUser, setLoadingUser] = useState(true);
const [userId, setUserId] = useState("");
const [message, setMessage] = useState("");
const [saving, setSaving] = useState(false);
const [parsingResume, setParsingResume] = useState(false);
const [importMessage, setImportMessage] = useState("");
const [importError, setImportError] = useState(false);
const [draftLoaded, setDraftLoaded] = useState(false);
const resumePrintRef = useRef<HTMLDivElement>(null);
const openTrackedRef = useRef(false);

const [fontFamily, setFontFamily] = useState<ResumeFont>("Times New Roman");
const [language, setLanguage] = useState<ResumeLanguage>("English");
const [resumeType, setResumeType] = useState<ResumeType>("Hybrid");
const [targetJobTitle, setTargetJobTitle] = useState("");
const [aiLoadingKey, setAiLoadingKey] = useState("");
const [summarySuggestions, setSummarySuggestions] = useState<string[]>([]);
const [roleIdeas, setRoleIdeas] = useState<Record<number, string[]>>({});
const [bulletIdeas, setBulletIdeas] = useState<Record<number, string[]>>({});

const [fullName, setFullName] = useState("");
const [phone, setPhone] = useState("");
const [city, setCity] = useState("");
const [stateName, setStateName] = useState("");
const [email, setEmail] = useState("");
const [linkedinUrl, setLinkedinUrl] = useState("");

const [summaryHeading, setSummaryHeading] = useState("Summary");
const [summaryText, setSummaryText] = useState("");
const [skillsInput, setSkillsInput] = useState("");
const [accomplishments, setAccomplishments] = useState("");

const [experiences, setExperiences] = useState<ExperienceItem[]>([createDefaultExperience()]);
const [educationItems, setEducationItems] = useState<EducationItem[]>([createDefaultEducation()]);
const [certificateItems, setCertificateItems] = useState<CertificateItem[]>([
createDefaultCertificate(),
]);
const [volunteerItems, setVolunteerItems] = useState<VolunteerItem[]>([
createDefaultVolunteer(),
]);

const [sectionOrder, setSectionOrder] = useState<ResumeSectionKey[]>([
"summary",
"skills",
"experience",
"education",
"certifications",
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

const { error: activityError } = await supabase
.from("user_activity")
.insert({
user_id: currentUserId,
full_name: profile?.full_name || null,
email: profile?.email || data.user.email || null,
referral_code: profile?.referral_code || null,
event_type: "tool_opened",
tool_name: "resume_generator",
page_name: "/career-toolkit/resume-generator",
});

if (activityError) {
console.error("Resume generator tracking error:", activityError);
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
setLanguage(draft.language || "English");
setResumeType(draft.resumeType || "Hybrid");
setTargetJobTitle(draft.targetJobTitle || "");
setFullName(draft.fullName || "");
setPhone(draft.phone || "");
setCity(draft.city || "");
setStateName(draft.stateName || "");
setEmail(draft.email || "");
setLinkedinUrl(draft.linkedinUrl || "");
setSummaryHeading(draft.summaryHeading || "Summary");
setSummaryText(draft.summaryText || "");
setSkillsInput(draft.skillsInput || "");
setAccomplishments(draft.accomplishments || "");
setExperiences(
Array.isArray(draft.experiences) && draft.experiences.length
? draft.experiences
: [createDefaultExperience()]
);
setEducationItems(
Array.isArray(draft.educationItems) && draft.educationItems.length
? draft.educationItems
: [createDefaultEducation()]
);
setCertificateItems(
Array.isArray(draft.certificateItems) && draft.certificateItems.length
? draft.certificateItems
: [createDefaultCertificate()]
);
setVolunteerItems(
Array.isArray(draft.volunteerItems) && draft.volunteerItems.length
? draft.volunteerItems
: [createDefaultVolunteer()]
);
const loadedType: ResumeType = draft.resumeType || "Hybrid";
setResumeType(loadedType);
// Always use the selected format's canonical order so an older saved
// custom order cannot make the format dropdown appear broken.
setSectionOrder([...RESUME_FORMAT_ORDERS[loadedType]]);
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
language,
resumeType,
targetJobTitle,
fullName,
phone,
city,
stateName,
email,
linkedinUrl,
summaryHeading,
summaryText,
skillsInput,
accomplishments,
experiences,
educationItems,
certificateItems,
volunteerItems,
sectionOrder,
};

window.localStorage.setItem(RESUME_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}, [
draftLoaded,
fontFamily,
language,
resumeType,
targetJobTitle,
fullName,
phone,
city,
stateName,
email,
linkedinUrl,
summaryHeading,
summaryText,
skillsInput,
accomplishments,
experiences,
educationItems,
certificateItems,
volunteerItems,
sectionOrder,
]);

const ui = TRANSLATIONS[language];
const formatVisuals = useMemo(() => getResumeFormatVisuals(resumeType), [resumeType]);

const skills = useMemo(() => {
return skillsInput
.split(",")
.map((item) => item.trim())
.filter(Boolean)
.slice(0, SKILL_LIMIT);
}, [skillsInput]);

const skillColumns = useMemo(() => splitSkillsIntoColumns(skills), [skills]);
const activeExperiences = useMemo(
() => experiences.filter((item) => hasExperienceContent(item)),
[experiences]
);

const activeEducation = useMemo(
() => educationItems.filter((item) => hasEducationContent(item)),
[educationItems]
);

const activeCertificates = useMemo(
() => certificateItems.filter((item) => hasCertificateContent(item)),
[certificateItems]
);

const activeVolunteer = useMemo(
() => volunteerItems.filter((item) => hasVolunteerContent(item)),
[volunteerItems]
);

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


function addEducation() {
setEducationItems((prev) => [...prev, createDefaultEducation()]);
}

function updateEducation(index: number, field: keyof EducationItem, value: string | boolean) {
setEducationItems((prev) =>
prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
);
}

function addCertificate() {
setCertificateItems((prev) => [...prev, createDefaultCertificate()]);
}

function updateCertificate(
index: number,
field: keyof CertificateItem,
value: string | boolean
) {
setCertificateItems((prev) =>
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

function applyResumeType(nextType: ResumeType) {
setResumeType(nextType);
setSectionOrder([...RESUME_FORMAT_ORDERS[nextType]]);
}

async function handleResumeUpload(file: File | null) {
if (!file) return;

const hasCurrentContent = Boolean(
fullName.trim() || phone.trim() || email.trim() || summaryText.trim() || skillsInput.trim() ||
experiences.some(hasExperienceContent) || educationItems.some(hasEducationContent) ||
certificateItems.some(hasCertificateContent) || volunteerItems.some(hasVolunteerContent)
);

if (hasCurrentContent) {
const shouldReplace = window.confirm(
"Importing this resume will replace the information currently in the builder. Continue?"
);
if (!shouldReplace) return;
}

setMessage("");
setImportMessage(`Uploading ${file.name}...`);
setImportError(false);
setParsingResume(true);

const controller = new AbortController();
const timeoutId = window.setTimeout(() => controller.abort(), 55000);

try {
const formData = new FormData();
formData.append("file", file);
setImportMessage("Reading and organizing your resume...");
const response = await fetch("/api/resume-parse", {
method: "POST",
body: formData,
signal: controller.signal,
});
const raw = await response.text();
let data: any = {};
try { data = raw ? JSON.parse(raw) : {}; } catch { data = {}; }
if (!response.ok) throw new Error(data?.error || "Unable to import this resume.");

const parsed = data?.parsedResume || {};
setFullName(parsed.fullName || "");
setPhone(parsed.phone || "");
setEmail(parsed.email || "");
setCity(parsed.city || "");
setStateName(parsed.stateName || "");
setLinkedinUrl(parsed.linkedinUrl || "");
setSummaryText(parsed.summaryText || "");
setSkillsInput(Array.isArray(parsed.skills) ? parsed.skills.slice(0, SKILL_LIMIT).join(", ") : "");
setAccomplishments(parsed.accomplishments || "");

setExperiences(Array.isArray(parsed.experiences) && parsed.experiences.length
? parsed.experiences.map((item: any) => ({ ...createDefaultExperience(), ...item, bullets: Array.isArray(item.bullets) && item.bullets.length ? item.bullets.slice(0, BULLET_LIMIT).map((b: any) => ({ text: typeof b === "string" ? b : b?.text || "" })) : [{ text: "" }, { text: "" }, { text: "" }, { text: "" }] }))
: [createDefaultExperience()]);
setEducationItems(Array.isArray(parsed.educationItems) && parsed.educationItems.length
? parsed.educationItems.map((item: any) => ({ ...createDefaultEducation(), ...item }))
: [createDefaultEducation()]);
setCertificateItems(Array.isArray(parsed.certificateItems) && parsed.certificateItems.length
? parsed.certificateItems.map((item: any) => ({ ...createDefaultCertificate(), ...item }))
: [createDefaultCertificate()]);
setVolunteerItems(Array.isArray(parsed.volunteerItems) && parsed.volunteerItems.length
? parsed.volunteerItems.map((item: any) => ({ ...createDefaultVolunteer(), ...item, bullets: Array.isArray(item.bullets) && item.bullets.length ? item.bullets.slice(0, BULLET_LIMIT).map((b: any) => ({ text: typeof b === "string" ? b : b?.text || "" })) : [{ text: "" }, { text: "" }, { text: "" }, { text: "" }] }))
: [createDefaultVolunteer()]);

setImportMessage("Resume imported successfully. Review the information below and make any changes you want.");
setImportError(false);
setMessage("");
} catch (error) {
const errorText =
error instanceof DOMException && error.name === "AbortError"
? "Resume import timed out. Please try again with a text-based PDF or DOCX file."
: error instanceof Error
? error.message
: "Unable to import this resume.";
setImportMessage(errorText);
setImportError(true);
setMessage("");
} finally {
window.clearTimeout(timeoutId);
setParsingResume(false);
}
}

async function callResumeAi(action: string, payload: Record<string, unknown>) {
const response = await fetch("/api/resume-builder-ai", {
method: "POST",
headers: { "Content-Type": "application/json" },
cache: "no-store",
body: JSON.stringify({ action, ...payload }),
});

const raw = await response.text();

let data: any = {};
try {
data = raw ? JSON.parse(raw) : {};
} catch {
data = {};
}

if (!response.ok) {
const detail =
data?.error ||
data?.message ||
(raw && !raw.startsWith("<") ? raw : "") ||
`Resume AI request failed (${response.status}).`;

throw new Error(detail);
}

if (!raw) {
throw new Error("Resume AI returned an empty response.");
}

return data;
}

async function generateSummaryIdeas() {
setMessage("");
setAiLoadingKey("summary");
try {
const data = await callResumeAi("generateSummaryIdeas", {
targetJobTitle,
skills,
experiences: experiences.map((item) => ({ roleTitle: item.roleTitle, companyName: item.companyName, bullets: item.bullets.map((b) => b.text).filter(Boolean) })),
});
setSummarySuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
} catch (error) {
setMessage(error instanceof Error ? error.message : "Unable to generate summary ideas.");
} finally { setAiLoadingKey(""); }
}

async function generateRoleIdeas(index: number) {
const roleTitle = experiences[index]?.roleTitle?.trim();
if (!roleTitle) { setMessage("Enter a job title first so AI can give you role-specific ideas."); return; }
setMessage("");
setAiLoadingKey(`role-${index}`);
try {
const data = await callResumeAi("getRolePrompts", { roleTitle });
setRoleIdeas((prev) => ({ ...prev, [index]: Array.isArray(data.prompts) ? data.prompts : [] }));
} catch (error) {
setMessage(error instanceof Error ? error.message : "Unable to generate role ideas.");
} finally { setAiLoadingKey(""); }
}

async function generateBulletIdeas(index: number) {
const item = experiences[index];
if (!item?.roleTitle?.trim()) { setMessage("Enter the job title first so AI can suggest relevant bullet ideas."); return; }
setMessage("");
setAiLoadingKey(`bullets-${index}`);
try {
const data = await callResumeAi("generateBulletIdeas", { roleTitle: item.roleTitle, companyName: item.companyName, existingBullets: item.bullets.map((b) => b.text).filter(Boolean), targetJobTitle });
setBulletIdeas((prev) => ({ ...prev, [index]: Array.isArray(data.suggestions) ? data.suggestions : [] }));
} catch (error) {
setMessage(error instanceof Error ? error.message : "Unable to generate bullet ideas.");
} finally { setAiLoadingKey(""); }
}

async function strengthenBullet(index: number, bulletIndex: number) {
const item = experiences[index];
const current = item?.bullets?.[bulletIndex]?.text?.trim();
if (!current) { setMessage("Write a bullet first, then use Strengthen Bullet."); return; }
setMessage("");
setAiLoadingKey(`strengthen-${index}-${bulletIndex}`);
try {
const data = await callResumeAi("strengthenBullet", { roleTitle: item.roleTitle, currentBullet: current, targetJobTitle });
if (data.suggestion) updateExperienceBullet(index, bulletIndex, data.suggestion);
} catch (error) {
setMessage(error instanceof Error ? error.message : "Unable to strengthen this bullet.");
} finally { setAiLoadingKey(""); }
}

async function handleSaveDraft() {
setMessage("");

try {
setSaving(true);

const draft = {
fontFamily,
language,
resumeType,
targetJobTitle,
fullName,
phone,
city,
stateName,
email,
linkedinUrl,
summaryHeading,
summaryText,
skillsInput,
accomplishments,
experiences,
educationItems,
certificateItems,
volunteerItems,
sectionOrder,
};

window.localStorage.setItem(RESUME_DRAFT_STORAGE_KEY, JSON.stringify(draft));
setMessage(
"Resume draft saved locally in this browser. To place a resume on your public profile, upload the final resume from your Profile page."
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
margin: 0.48in 0.55in 0.5in;
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

${getPrintFormatCss(resumeType)}

.print-resume {
width: 100%;
max-width: 100%;
margin: 0 auto;
padding-top: 0;
color: #111827;
}

.resumeHeader {
position: static;
background: white;
margin: 0;
padding: 0 0 8px;
break-inside: avoid;
page-break-inside: avoid;
}

.resumeName {
margin: 0 0 8px;
font-size: 20pt;
font-weight: 700;
color: #111827;
}

.resumeProfessionalTitle {
margin: 2px 0 6px;
font-size: 10.5pt;
line-height: 1.25;
font-weight: 700;
color: #111827;
}

.resumeContact {
margin: 0 0 6px;
font-size: 10.5pt;
line-height: 1.35;
color: #374151;
word-break: break-word;
}

.resumeLinkedin {
margin: 0;
font-size: 10.5pt;
line-height: 1.35;
color: #1d4ed8;
word-break: break-word;
}

.resumeSection {
margin-bottom: 11px;
break-inside: auto;
page-break-inside: auto;
}

.resumeSectionTitle {
margin: 0 0 10px;
text-align: center;
font-size: 12pt;
font-weight: 700;
color: #111827;
}

.resumeParagraph {
margin: 0;
font-size: 10pt;
line-height: 1.24;
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
font-size: 11pt;
line-height: 1.35;
color: #111827;
word-break: break-word;
}

.resumeEntry {
margin-bottom: 9px;
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
font-size: 11pt;
font-weight: 700;
color: #111827;
}

.resumeEntrySubheading {
margin: 4px 0 0;
font-size: 11pt;
font-weight: 600;
color: #111827;
}

.resumeEntryDates {
margin: 0;
font-size: 10.5pt;
color: #374151;
white-space: nowrap;
}

.resumeBullet {
margin: 2px 0;
font-size: 10pt;
line-height: 1.24;
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
if (!summaryText && !summaryHeading) return null;
return (
<section className="resumeSection" style={{ ...styles.resumeSectionBlock, ...formatVisuals.sectionBlock }}>
<h3 style={{ ...styles.resumeSectionTitle, ...formatVisuals.sectionTitle }}>{summaryHeading.trim() && summaryHeading.trim().toLowerCase() !== "summary" ? summaryHeading : ui.summary}</h3>
<p style={{ ...styles.resumeParagraph, ...styles.editableResumeText }} contentEditable suppressContentEditableWarning onBlur={(e) => setSummaryText(e.currentTarget.textContent?.trim() || "")}>{summaryText || "Click here to add your professional summary."}</p>
</section>
);

case "skills":
if (!skills.length) return null;
return (
<section className="resumeSection" style={{ ...styles.resumeSectionBlock, ...formatVisuals.sectionBlock }}>
<h3 style={{ ...styles.resumeSectionTitle, ...formatVisuals.sectionTitle }}>{ui.skills}</h3>
<div className="skillsGrid" style={{ ...styles.skillsGrid, ...formatVisuals.skillsGrid }}>
{skillColumns.map((column, index) => (
<div key={index} className="skillColumn" style={styles.skillColumn}>
{column.map((skill, skillIndex) => (
<p key={`${skill}-${skillIndex}`} className="skillItem" style={styles.skillItem}>
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
<section className="resumeSection" style={{ ...styles.resumeSectionBlock, ...formatVisuals.sectionBlock }}>
<h3 style={{ ...styles.resumeSectionTitle, ...formatVisuals.sectionTitle }}>{ui.experience.replace(" (optional)", "")}</h3>
{activeExperiences.map((item, index) => (
<div key={index} className="resumeEntry" style={styles.resumeEntry}>
<div className="resumeEntryTop" style={{ ...styles.resumeEntryTop, ...formatVisuals.entryTop }}>
<div>
<p className="resumeEntryHeading" style={{ ...styles.resumeEntryHeading, ...formatVisuals.entryHeading }}>
{item.companyName || "Company"}{" "}
{item.city || item.state
? `— ${[item.city, item.state].filter(Boolean).join(", ")}`
: ""}
</p>
<p className="resumeEntrySubheading" style={{ ...styles.resumeEntrySubheading, ...formatVisuals.entrySubheading, ...styles.editableResumeText }} contentEditable suppressContentEditableWarning onBlur={(e) => { const originalIndex = experiences.indexOf(item); if (originalIndex >= 0) updateExperience(originalIndex, "roleTitle", e.currentTarget.textContent?.trim() || ""); }}>{item.roleTitle || "Role Title"}</p>
</div>
<p className="resumeEntryDates" style={styles.resumeEntryDates}>
{formatDateRange(
item.startMonth,
item.startYear,
item.endMonth,
item.endYear,
item.isPresent,
ui.present
)}
</p>
</div>
{item.bullets
.filter((b) => b.text.trim())
.map((bullet, bulletIndex) => (
<p key={bulletIndex} className="resumeBullet" style={{ ...styles.resumeBullet, ...styles.editableResumeText }} contentEditable suppressContentEditableWarning onBlur={(e) => { const originalIndex = experiences.indexOf(item); if (originalIndex >= 0) updateExperienceBullet(originalIndex, bulletIndex, (e.currentTarget.textContent || "").replace(/^•\s*/, "").trim()); }}>• {bullet.text}</p>
))}
</div>
))}
</section>
);

case "education":
if (!activeEducation.length) return null;
return (
<section className="resumeSection" style={{ ...styles.resumeSectionBlock, ...formatVisuals.sectionBlock }}>
<h3 style={{ ...styles.resumeSectionTitle, ...formatVisuals.sectionTitle }}>{ui.education.replace(" (optional)", "").replace(" (opcional)", "").replace(" (वैकल्पिक)", "").replace(" (opcjonalnie)", "")}</h3>
{activeEducation.map((item, index) => (
<div key={index} className="resumeEntry" style={styles.resumeEntry}>
<div className="resumeEntryTop" style={{ ...styles.resumeEntryTop, ...formatVisuals.entryTop }}>
<div>
<p className="resumeEntryHeading" style={{ ...styles.resumeEntryHeading, ...formatVisuals.entryHeading }}>
{item.schoolName || "School"}{" "}
{item.city || item.state
? `— ${[item.city, item.state].filter(Boolean).join(", ")}`
: ""}
</p>
<p className="resumeEntrySubheading" style={{ ...styles.resumeEntrySubheading, ...formatVisuals.entrySubheading }}>
{item.degree || "Degree"}
{item.gpa ? ` | GPA: ${item.gpa}` : ""}
</p>
</div>
<p className="resumeEntryDates" style={styles.resumeEntryDates}>
{formatDateRange(
item.startMonth,
item.startYear,
item.endMonth,
item.endYear,
item.isPresent,
ui.present
)}
</p>
</div>
</div>
))}
</section>
);

case "certifications":
if (!activeCertificates.length) return null;
return (
<section className="resumeSection" style={{ ...styles.resumeSectionBlock, ...formatVisuals.sectionBlock }}>
<h3 style={{ ...styles.resumeSectionTitle, ...formatVisuals.sectionTitle }}>{ui.certifications.replace(" (optional)", "").replace(" (opcional)", "").replace(" (वैकल्पिक)", "").replace(" (opcjonalnie)", "")}</h3>
{activeCertificates.map((item, index) => (
<div key={index} className="resumeEntry" style={styles.resumeEntry}>
<div className="resumeEntryTop" style={{ ...styles.resumeEntryTop, ...formatVisuals.entryTop }}>
<div>
<p className="resumeEntryHeading" style={{ ...styles.resumeEntryHeading, ...formatVisuals.entryHeading }}>
{item.organizationName || "Organization"}{" "}
{item.city || item.state
? `— ${[item.city, item.state].filter(Boolean).join(", ")}`
: ""}
</p>
<p className="resumeEntrySubheading" style={{ ...styles.resumeEntrySubheading, ...formatVisuals.entrySubheading }}>
{item.certificateName || "Certificate / Course Name"}
</p>
</div>
<p className="resumeEntryDates" style={styles.resumeEntryDates}>
{formatDateRange(
item.startMonth,
item.startYear,
item.endMonth,
item.endYear,
item.isPresent,
ui.present
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
<section className="resumeSection" style={{ ...styles.resumeSectionBlock, ...formatVisuals.sectionBlock }}>
<h3 style={{ ...styles.resumeSectionTitle, ...formatVisuals.sectionTitle }}>{ui.volunteer.replace(" (optional)", "").replace(" (opcional)", "").replace(" (वैकल्पिक)", "").replace(" (opcjonalnie)", "")}</h3>
{activeVolunteer.map((item, index) => (
<div key={index} className="resumeEntry" style={styles.resumeEntry}>
<div className="resumeEntryTop" style={{ ...styles.resumeEntryTop, ...formatVisuals.entryTop }}>
<div>
<p className="resumeEntryHeading" style={{ ...styles.resumeEntryHeading, ...formatVisuals.entryHeading }}>
{item.organizationName || "Organization"}{" "}
{item.city || item.state
? `— ${[item.city, item.state].filter(Boolean).join(", ")}`
: ""}
</p>
<p className="resumeEntrySubheading" style={{ ...styles.resumeEntrySubheading, ...formatVisuals.entrySubheading }}>
{item.roleTitle || "Role Title"}
</p>
</div>
<p className="resumeEntryDates" style={styles.resumeEntryDates}>
{formatDateRange(
item.startMonth,
item.startYear,
item.endMonth,
item.endYear,
item.isPresent,
ui.present
)}
</p>
</div>
{item.bullets
.filter((b) => b.text.trim())
.map((bullet, bulletIndex) => (
<p key={bulletIndex} className="resumeBullet" style={styles.resumeBullet}>
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
<section className="resumeSection" style={{ ...styles.resumeSectionBlock, ...formatVisuals.sectionBlock }}>
<h3 style={{ ...styles.resumeSectionTitle, ...formatVisuals.sectionTitle }}>{ui.accomplishments.replace(" (optional)", "").replace(" (opcional)", "").replace(" (वैकल्पिक)", "").replace(" (opcjonalnie)", "")}</h3>
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
size: letter;
margin: 0.48in 0.55in 0.5in;
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
position: static !important;
background: white !important;
margin: 0 !important;
padding: 0 0 8px !important;
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

@media (max-width: 1050px) {
.layout {
grid-template-columns: 1fr !important;
}
.rightCol {
position: static !important;
max-height: none !important;
overflow: visible !important;
padding-right: 0 !important;
}
}

@media (max-width: 680px) {
.twoColForm {
grid-template-columns: 1fr !important;
}
.pageTitle {
font-size: 34px !important;
}
.footerButtons {
grid-template-columns: 1fr !important;
}
}
`}</style>

<div className="container" style={styles.container}>
<div className="topBar" style={styles.topBar}>
<div>
<p style={styles.kicker}>{ui.pageKicker}</p>
<h1 style={styles.pageTitle}>{ui.pageTitle}</h1>
</div>

<div style={styles.topSelectors}>
<div style={styles.topSelectGroup}>
<label style={styles.topSelectLabel}>{ui.language}</label>
<select
value={language}
onChange={(e) => setLanguage(e.target.value as ResumeLanguage)}
style={styles.select}
>
<option>English</option>
<option>Spanish</option>
<option>Hindi</option>
<option>Polish</option>
</select>
<span style={styles.selectorHint}>Controls the generator labels and resume section headings.</span>
</div>

<div style={styles.topSelectGroup}>
<label style={styles.topSelectLabel}>{ui.font}</label>
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
<p style={styles.cardKicker}>RESUME GENERATOR</p>
<h2 style={styles.cardTitle}>Create your resume</h2>
<p style={styles.previewHelp}>Start from scratch or import an existing resume. Your information stays editable and updates the live preview as you work.</p>
<div style={styles.importRow}>
<div>
<strong style={styles.importTitle}>Already have a resume?</strong>
<p style={styles.importText}>Upload a PDF or DOCX and HireMinds will use it to fill the builder. Review the imported information before using your final resume.</p>
</div>
<label style={{ ...styles.uploadButton, opacity: parsingResume ? 0.65 : 1 }}>
{parsingResume ? "Reading Resume..." : "Upload Resume"}
<input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" disabled={parsingResume} onChange={(e) => { const file = e.target.files?.[0] || null; void handleResumeUpload(file); e.currentTarget.value = ""; }} style={{ display: "none" }} />
</label>
</div>
{importMessage ? (
<div
role="status"
aria-live="polite"
style={{
marginTop: "12px",
padding: "11px 13px",
borderRadius: "10px",
border: `1px solid ${importError ? "#ef4444" : "#2f81f7"}`,
background: importError ? "rgba(239,68,68,.08)" : "rgba(47,129,247,.08)",
color: importError ? "#b91c1c" : "#dbeafe",
fontSize: "13px",
fontWeight: 700,
lineHeight: 1.45,
}}
>
{parsingResume ? "⏳ " : importError ? "⚠️ " : "✓ "}
{importMessage}
</div>
) : null}
</section>
<section style={styles.card}>
<p style={styles.cardKicker}>RESUME FORMAT</p>
<h2 style={styles.cardTitle}>Choose your resume format</h2>
<p style={styles.previewHelp}>Select a format and the live resume automatically changes its section order and visual structure.</p>
<div style={styles.formatPickerRow}>
<div style={{ flex: 1, minWidth: "240px" }}>
<label style={styles.inputLabel}>Resume Format</label>
<select value={resumeType} onChange={(e) => applyResumeType(e.target.value as ResumeType)} style={styles.input}>
<option value="Hybrid">Hybrid</option>
<option value="Functional">Functional</option>
<option value="Chronological">Chronological</option>
<option value="Combination">Combination</option>
</select>
</div>
<div style={styles.formatHelpBox}><strong>{resumeType}:</strong> {RESUME_FORMAT_HELP[resumeType]}</div>
</div>
</section>
<section style={styles.card}>
<p style={styles.cardKicker}>HEADER</p>
<h2 style={styles.cardTitle}>{ui.header}</h2>

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
<h2 style={styles.cardTitle}>{ui.summaryAndSkills}</h2>

<label style={styles.inputLabel}>Target Job Title / Role</label>
<input value={targetJobTitle} onChange={(e) => setTargetJobTitle(e.target.value)} style={styles.input} placeholder="Example: Administrative Assistant" />
<p style={styles.helper}>This helps AI give job-title-specific summary and bullet ideas.</p>

<label style={styles.inputLabel}>
Summary Heading (optional, can be blank or "Summary")
</label>
<input
value={summaryHeading}
onChange={(e) => setSummaryHeading(e.target.value)}
style={styles.input}
placeholder="Summary"
/>

<label style={styles.inputLabel}>Summary</label>
<textarea
value={summaryText}
onChange={(e) => setSummaryText(e.target.value)}
style={styles.textarea}
placeholder="Example: Client-focused workforce development professional with experience in talent acquisition, resume writing, employer engagement, and job readiness coaching."
/>
<div style={styles.aiActionRow}>
<button type="button" onClick={generateSummaryIdeas} style={styles.aiButton} disabled={aiLoadingKey === "summary"}>{aiLoadingKey === "summary" ? "Writing ideas..." : "✨ AI Summary Ideas"}</button>
<span style={styles.aiSafetyText}>AI should only use the experience and skills you entered.</span>
</div>
{summarySuggestions.length > 0 ? <div style={styles.aiSuggestionBox}>
<p style={styles.aiSuggestionTitle}>Choose a summary idea:</p>
{summarySuggestions.map((suggestion, suggestionIndex) => <button key={suggestionIndex} type="button" onClick={() => setSummaryText(suggestion)} style={styles.aiSuggestionButton}><span>{suggestion}</span><strong>Use this</strong></button>)}
</div> : null}

<label style={styles.inputLabel}>Skills (comma separated, up to 9)</label>
<input
value={skillsInput}
onChange={(e) => setSkillsInput(e.target.value)}
style={styles.input}
placeholder="Recruiting, ATS, Sourcing, Interviewing"
/>
</section>

<section style={styles.card}>
<p style={styles.cardKicker}>EXPERIENCE</p>
<h2 style={styles.cardTitle}>{ui.experience}</h2>

{experiences.map((item, index) => (
<div key={index} style={styles.sectionGroup}>
<div style={styles.twoColForm}>
<div>
<label style={styles.inputLabel}>Company</label>
<input
value={item.companyName}
onChange={(e) => updateExperience(index, "companyName", e.target.value)}
style={styles.input}
placeholder="Company Name"
/>
</div>
<div>
<label style={styles.inputLabel}>Role</label>
<input
value={item.roleTitle}
onChange={(e) => updateExperience(index, "roleTitle", e.target.value)}
style={styles.input}
placeholder="Role Title"
/>
<button type="button" onClick={() => generateRoleIdeas(index)} style={styles.inlineAiButton} disabled={aiLoadingKey === `role-${index}`}>{aiLoadingKey === `role-${index}` ? "Thinking..." : "✨ Ideas for this role"}</button>
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
onChange={(e) => updateExperience(index, "startMonth", e.target.value)}
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
onChange={(e) => updateExperience(index, "startYear", e.target.value)}
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
<span>{ui.currentlyWorkHere}</span>
</label>

{!item.isPresent && (
<div style={styles.twoColForm}>
<div>
<label style={styles.inputLabel}>To Month</label>
<select
value={item.endMonth}
onChange={(e) => updateExperience(index, "endMonth", e.target.value)}
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
onChange={(e) => updateExperience(index, "endYear", e.target.value)}
style={styles.input}
placeholder="2024"
/>
</div>
</div>
)}

{roleIdeas[index]?.length ? <div style={styles.rolePromptBox}>
<p style={styles.aiSuggestionTitle}>Think about whether you did any of these:</p>
{roleIdeas[index].map((idea, ideaIndex) => <p key={ideaIndex} style={styles.rolePromptItem}>• {idea}</p>)}
<p style={styles.aiSafetyText}>Memory prompts only—add only responsibilities you actually performed.</p>
</div> : null}
<p style={styles.helper}>You can add up to 5 bullet points per role.</p>
<div style={styles.aiActionRow}><button type="button" onClick={() => generateBulletIdeas(index)} style={styles.aiButton} disabled={aiLoadingKey === `bullets-${index}`}>{aiLoadingKey === `bullets-${index}` ? "Creating ideas..." : "✨ AI Bullet Ideas"}</button></div>
{bulletIdeas[index]?.length ? <div style={styles.aiSuggestionBox}>
<p style={styles.aiSuggestionTitle}>Bullet ideas for {item.roleTitle || "this role"}:</p>
{bulletIdeas[index].map((suggestion, suggestionIndex) => <button key={suggestionIndex} type="button" onClick={() => { const emptyIndex = item.bullets.findIndex((b) => !b.text.trim()); if (emptyIndex >= 0) updateExperienceBullet(index, emptyIndex, suggestion); else if (item.bullets.length < BULLET_LIMIT) setExperiences((prev) => prev.map((experience, i) => i === index ? { ...experience, bullets: [...experience.bullets, { text: suggestion }] } : experience)); }} style={styles.aiSuggestionButton}><span>{suggestion}</span><strong>Add bullet</strong></button>)}
</div> : null}

{item.bullets.map((bullet, bulletIndex) => (
<div key={bulletIndex}>
<label style={styles.inputLabel}>Bullet {bulletIndex + 1}</label>
<input
value={bullet.text}
onChange={(e) =>
updateExperienceBullet(index, bulletIndex, e.target.value)
}
style={styles.input}
placeholder="Describe the work you did"
/>
<button type="button" onClick={() => strengthenBullet(index, bulletIndex)} style={styles.inlineAiButton} disabled={aiLoadingKey === `strengthen-${index}-${bulletIndex}`}>{aiLoadingKey === `strengthen-${index}-${bulletIndex}` ? "Strengthening..." : "✨ Strengthen Bullet"}</button>
</div>
))}

</div>
))}

<button type="button" onClick={addExperience} style={styles.smallButton}>
+ Add Work Experience
</button>
</section>

<section style={styles.card}>
<p style={styles.cardKicker}>EDUCATION</p>
<h2 style={styles.cardTitle}>{ui.education}</h2>

{educationItems.map((item, index) => (
<div key={index} style={styles.sectionGroup}>
<div style={styles.twoColForm}>
<div>
<label style={styles.inputLabel}>School / College</label>
<input
value={item.schoolName}
onChange={(e) => updateEducation(index, "schoolName", e.target.value)}
style={styles.input}
placeholder="School / College"
/>
</div>
<div>
<label style={styles.inputLabel}>Degree / Course of Study</label>
<input
value={item.degree}
onChange={(e) => updateEducation(index, "degree", e.target.value)}
style={styles.input}
placeholder="Degree / Course of Study"
/>
</div>
<div>
<label style={styles.inputLabel}>City</label>
<input
value={item.city}
onChange={(e) => updateEducation(index, "city", e.target.value)}
style={styles.input}
placeholder="City"
/>
</div>
<div>
<label style={styles.inputLabel}>State</label>
<input
value={item.state}
onChange={(e) => updateEducation(index, "state", e.target.value)}
style={styles.input}
placeholder="State"
/>
</div>
<div>
<label style={styles.inputLabel}>From Month</label>
<select
value={item.startMonth}
onChange={(e) => updateEducation(index, "startMonth", e.target.value)}
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
onChange={(e) => updateEducation(index, "startYear", e.target.value)}
style={styles.input}
placeholder="2019"
/>
</div>
</div>

<label style={styles.checkboxRow}>
<input
type="checkbox"
checked={item.isPresent}
onChange={(e) => updateEducation(index, "isPresent", e.target.checked)}
/>
<span>{ui.currentlyAttendHere}</span>
</label>

{!item.isPresent && (
<div style={styles.twoColForm}>
<div>
<label style={styles.inputLabel}>To Month</label>
<select
value={item.endMonth}
onChange={(e) => updateEducation(index, "endMonth", e.target.value)}
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
onChange={(e) => updateEducation(index, "endYear", e.target.value)}
style={styles.input}
placeholder="2023"
/>
</div>
</div>
)}

<label style={styles.inputLabel}>GPA (optional)</label>
<input
value={item.gpa}
onChange={(e) => updateEducation(index, "gpa", e.target.value)}
style={styles.input}
placeholder="3.8"
/>
</div>
))}

<button type="button" onClick={addEducation} style={styles.smallButton}>
+ Add Education
</button>
</section>

<section style={styles.card}>
<p style={styles.cardKicker}>CERTIFICATES</p>
<h2 style={styles.cardTitle}>{ui.certifications}</h2>

{certificateItems.map((item, index) => (
<div key={index} style={styles.sectionGroup}>
<div style={styles.twoColForm}>
<div>
<label style={styles.inputLabel}>Organization / Program</label>
<input
value={item.organizationName}
onChange={(e) =>
updateCertificate(index, "organizationName", e.target.value)
}
style={styles.input}
placeholder="Organization / Program"
/>
</div>
<div>
<label style={styles.inputLabel}>Certificate / Course Name</label>
<input
value={item.certificateName}
onChange={(e) =>
updateCertificate(index, "certificateName", e.target.value)
}
style={styles.input}
placeholder="Certificate / Course Name"
/>
</div>
<div>
<label style={styles.inputLabel}>City</label>
<input
value={item.city}
onChange={(e) => updateCertificate(index, "city", e.target.value)}
style={styles.input}
placeholder="City"
/>
</div>
<div>
<label style={styles.inputLabel}>State</label>
<input
value={item.state}
onChange={(e) => updateCertificate(index, "state", e.target.value)}
style={styles.input}
placeholder="State"
/>
</div>
<div>
<label style={styles.inputLabel}>From Month</label>
<select
value={item.startMonth}
onChange={(e) => updateCertificate(index, "startMonth", e.target.value)}
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
onChange={(e) => updateCertificate(index, "startYear", e.target.value)}
style={styles.input}
placeholder="2024"
/>
</div>
</div>

<label style={styles.checkboxRow}>
<input
type="checkbox"
checked={item.isPresent}
onChange={(e) => updateCertificate(index, "isPresent", e.target.checked)}
/>
<span>{ui.currentlyCompletingCert}</span>
</label>

{!item.isPresent && (
<div style={styles.twoColForm}>
<div>
<label style={styles.inputLabel}>To Month</label>
<select
value={item.endMonth}
onChange={(e) => updateCertificate(index, "endMonth", e.target.value)}
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
onChange={(e) => updateCertificate(index, "endYear", e.target.value)}
style={styles.input}
placeholder="2024"
/>
</div>
</div>
)}
</div>
))}

<button type="button" onClick={addCertificate} style={styles.smallButton}>
+ Add Certification
</button>
</section>

<section style={styles.card}>
<p style={styles.cardKicker}>VOLUNTEER</p>
<h2 style={styles.cardTitle}>{ui.volunteer}</h2>

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
onChange={(e) => updateVolunteer(index, "startMonth", e.target.value)}
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
onChange={(e) => updateVolunteer(index, "startYear", e.target.value)}
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
<span>{ui.currentlyVolunteerHere}</span>
</label>

{!item.isPresent && (
<div style={styles.twoColForm}>
<div>
<label style={styles.inputLabel}>To Month</label>
<select
value={item.endMonth}
onChange={(e) => updateVolunteer(index, "endMonth", e.target.value)}
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
onChange={(e) => updateVolunteer(index, "endYear", e.target.value)}
style={styles.input}
placeholder="2022"
/>
</div>
</div>
)}

<p style={styles.helper}>You can add up to 5 bullet points for volunteer work.</p>

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
<h2 style={styles.cardTitle}>{ui.accomplishments}</h2>
<label style={styles.inputLabel}>Accomplishments</label>
<textarea
value={accomplishments}
onChange={(e) => setAccomplishments(e.target.value)}
style={styles.textarea}
placeholder="Awards, recognitions, achievements, notable wins"
/>
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
{saving ? "Saving..." : ui.saveDraft}
</button>
<button type="button" onClick={handlePrint} style={styles.printButton}>
{ui.printResume}
</button>
<a href="/profile" style={styles.backButton}>
{ui.backToProfile}
</a>
</div>
</div>

<div className="resumePrintWrap rightCol" style={styles.rightCol}>
<div className="builderTopRow previewCard" style={styles.previewCard}>
<p style={styles.cardKicker}>LIVE PREVIEW</p>
<h2 style={styles.cardTitle}>{ui.livePreview}</h2>
<p style={styles.previewHelp}>{ui.previewHelp}</p>
<p style={styles.resumeTypePreview}>
  Current format: <strong>{resumeType}</strong> • Click directly into the white resume to edit visible text.
</p>
</div>

<div
ref={resumePrintRef}
className="resumePaper"
style={{
...styles.resumePaper,
...formatVisuals.paper,
fontFamily,
}}
>
<div className="resumeHeader" style={{ ...styles.resumeHeader, ...formatVisuals.header }}>
<h1 className="resumeName" style={{ ...styles.resumeName, ...formatVisuals.name, ...styles.editableResumeText }} contentEditable suppressContentEditableWarning onBlur={(e) => setFullName(e.currentTarget.textContent?.trim() || "")}>{fullName || "Your Name"}</h1>
<p className="resumeContact" style={{ ...styles.resumeContact, ...formatVisuals.contact }}>
{[phone, email, [city, stateName].filter(Boolean).join(", ")]
.filter(Boolean)
.join(" • ")}
</p>
{linkedinUrl ? (
<p className="resumeLinkedin" style={{ ...styles.resumeLinkedin, ...formatVisuals.linkedIn, ...styles.editableResumeText }} contentEditable suppressContentEditableWarning onBlur={(e) => setLinkedinUrl(e.currentTarget.textContent?.trim() || "")}>{linkedinUrl}</p>
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
"radial-gradient(ellipse at 12% 8%, rgba(22,119,255,0.12) 0%, transparent 34%), linear-gradient(180deg, #030812 0%, #07111f 52%, #030812 100%)",
color: "#f5f7fb",
padding: "28px 24px 56px",
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
importRow: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
gap: "20px",
marginTop: "18px",
paddingTop: "18px",
borderTop: "1px solid rgba(148,163,184,0.18)",
flexWrap: "wrap",
},
importTitle: { color: "#ffffff", fontSize: "15px" },
importText: { margin: "5px 0 0", color: "#9aa9bc", fontSize: "13px", lineHeight: 1.55, maxWidth: "620px" },
uploadButton: {
display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: "42px", padding: "0 18px",
borderRadius: "8px", background: "#1677FF", color: "#ffffff", fontSize: "13px", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap",
},
topBar: {
display: "flex",
justifyContent: "space-between",
alignItems: "flex-end",
gap: "24px",
marginBottom: "28px",
paddingBottom: "20px",
borderBottom: "1px solid rgba(148,163,184,0.18)",
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
gap: "7px",
minWidth: "190px",
},
topSelectLabel: {
fontSize: "12px",
color: "#c9d4e2",
fontWeight: 700,
},
selectorHint: {
maxWidth: "220px",
color: "#7f8fa3",
fontSize: "10px",
lineHeight: 1.35,
},
kicker: {
margin: "0 0 8px",
color: "#1677FF",
fontSize: "11px",
fontWeight: 800,
letterSpacing: "0.18em",
textTransform: "uppercase",
},
pageTitle: {
margin: 0,
fontSize: "clamp(34px, 4vw, 48px)",
lineHeight: 1.04,
letterSpacing: "-0.045em",
fontWeight: 760,
color: "#ffffff",
maxWidth: "760px",
},
layout: {
display: "grid",
gridTemplateColumns: "minmax(380px, 0.82fr) minmax(0, 1.18fr)",
gap: "34px",
alignItems: "start",
},
leftCol: {
minWidth: 0,
},
rightCol: {
position: "sticky",
top: "10px",
alignSelf: "start",
maxHeight: "calc(100vh - 20px)",
overflowY: "auto",
paddingRight: "4px",
},
card: {
background: "transparent",
border: "none",
borderBottom: "1px solid rgba(148,163,184,0.16)",
borderRadius: 0,
padding: "24px 0 30px",
boxShadow: "none",
marginBottom: 0,
},
previewCard: {
background: "rgba(7,17,31,0.78)",
border: "1px solid rgba(148,163,184,0.16)",
borderRadius: "12px",
padding: "12px 14px",
boxShadow: "0 12px 34px rgba(0,0,0,0.16)",
marginBottom: "12px",
backdropFilter: "blur(12px)",
},
cardKicker: {
margin: "0 0 7px",
color: "#1677FF",
fontSize: "10px",
fontWeight: 850,
letterSpacing: "0.16em",
textTransform: "uppercase",
},
cardTitle: {
margin: "0 0 12px",
fontSize: "23px",
lineHeight: 1.15,
color: "#ffffff",
fontWeight: 750,
letterSpacing: "-0.02em",
},
previewHelp: {
margin: 0,
color: "#d4d4d8",
fontSize: "11pt",
lineHeight: 1.35,
},
resumeTypePreview: {
margin: "12px 0 0",
color: "#e5e7eb",
fontSize: "15px",
lineHeight: 1.6,
},
select: {
background: "rgba(4,10,20,0.72)",
color: "#fff",
border: "1px solid rgba(148,163,184,0.30)",
borderRadius: "8px",
padding: "10px 12px",
fontSize: "14px",
outline: "none",
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
background: "rgba(3,8,18,0.56)",
color: "#fff",
border: "1px solid rgba(148,163,184,0.28)",
borderRadius: "8px",
padding: "11px 12px",
fontSize: "15px",
outline: "none",
boxSizing: "border-box",
},
textarea: {
width: "100%",
minHeight: "110px",
resize: "vertical",
background: "rgba(3,8,18,0.56)",
color: "#fff",
border: "1px solid rgba(148,163,184,0.28)",
borderRadius: "8px",
padding: "11px 12px",
fontSize: "15px",
outline: "none",
boxSizing: "border-box",
marginBottom: "14px",
},
helper: {
margin: "10px 0 12px",
color: "#cbd5e1",
fontSize: "14px",
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
border: "none",
borderTop: "1px solid rgba(148,163,184,0.14)",
borderRadius: 0,
padding: "20px 0 4px",
marginTop: "18px",
marginBottom: "12px",
},
smallButton: {
marginTop: "12px",
background: "transparent",
color: "#8FC1FF",
border: "1px solid rgba(22,119,255,0.42)",
borderRadius: "8px",
padding: "9px 12px",
fontSize: "13px",
fontWeight: 750,
cursor: "pointer",
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
background: "#f8fafc",
color: "#08111f",
border: "1px solid #f8fafc",
borderRadius: "9px",
padding: "13px",
fontSize: "15px",
fontWeight: 800,
cursor: "pointer",
},
printButton: {
background: "#1677FF",
color: "#fff",
border: "1px solid #1677FF",
borderRadius: "9px",
padding: "13px",
fontSize: "15px",
fontWeight: 800,
cursor: "pointer",
},
backButton: {
background: "transparent",
color: "#dbe7f5",
border: "1px solid rgba(148,163,184,0.30)",
borderRadius: "9px",
padding: "13px",
fontSize: "15px",
fontWeight: 750,
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
width: "8.5in",
maxWidth: "100%",
minHeight: "11in",
height: "auto",
overflow: "visible",
background: "#fff",
borderRadius: "6px",
border: "1px solid #dfe5ec",
boxShadow: "0 18px 54px rgba(0,0,0,0.26)",
padding: "0.5in",
color: "#111827",
boxSizing: "border-box",
},
resumeHeader: {
textAlign: "center",
marginBottom: "14px",
paddingBottom: 0,
},
resumeName: {
margin: "0 0 8px",
fontSize: "20pt",
fontWeight: 700,
color: "#111827",
},
resumeProfessionalTitle: {
margin: "2px 0 6px",
fontSize: "10.5pt",
lineHeight: 1.25,
fontWeight: 700,
color: "#111827",
},
resumeContact: {
margin: "0 0 6px",
fontSize: "10.5pt",
lineHeight: 1.35,
color: "#374151",
wordBreak: "break-word",
},
resumeLinkedin: {
margin: 0,
fontSize: "10.5pt",
lineHeight: 1.35,
color: "#1d4ed8",
wordBreak: "break-word",
},
resumeSectionBlock: {
marginBottom: "16px",
},
resumeSectionTitle: {
margin: "0 0 8px",
textAlign: "center",
fontSize: "11pt",
fontWeight: 700,
letterSpacing: "0.04em",
color: "#111827",
},
resumeParagraph: {
margin: 0,
fontSize: "11pt",
lineHeight: 1.35,
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
margin: "0 0 6px",
fontSize: "10.5pt",
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
fontSize: "11pt",
fontWeight: 700,
color: "#111827",
},
resumeEntrySubheading: {
margin: "3px 0 0",
fontSize: "10.5pt",
fontWeight: 600,
color: "#111827",
},
resumeEntryDates: {
margin: 0,
fontSize: "10.5pt",
color: "#374151",
whiteSpace: "nowrap",
},
resumeBullet: {
margin: "4px 0",
fontSize: "11pt",
lineHeight: 1.35,
color: "#111827",
whiteSpace: "pre-wrap",
wordBreak: "break-word",
},
formatPickerRow: {
display: "flex",
alignItems: "stretch",
gap: "14px",
flexWrap: "wrap",
marginTop: "16px",
},
formatHelpBox: {
flex: "1 1 320px",
borderLeft: "2px solid #1677FF",
background: "transparent",
borderRadius: 0,
padding: "4px 0 4px 14px",
color: "#dbe7f5",
fontSize: "13px",
lineHeight: 1.55,
},
aiActionRow: {
display: "flex",
alignItems: "center",
gap: "10px",
flexWrap: "wrap",
margin: "10px 0 14px",
},
aiButton: {
background: "rgba(22,119,255,0.12)",
color: "#dcecff",
border: "1px solid rgba(22,119,255,0.34)",
borderRadius: "8px",
padding: "9px 11px",
fontSize: "12px",
fontWeight: 800,
cursor: "pointer",
},
inlineAiButton: {
marginTop: "7px",
background: "transparent",
color: "#8FC1FF",
border: "none",
borderBottom: "1px solid rgba(22,119,255,0.35)",
borderRadius: 0,
padding: "6px 0",
fontSize: "12px",
fontWeight: 750,
cursor: "pointer",
},
aiSafetyText: { color: "#8fa0b5", fontSize: "12px", lineHeight: 1.45 },
aiSuggestionBox: { margin: "10px 0 16px", borderTop: "1px solid rgba(22,119,255,0.22)", borderBottom: "1px solid rgba(22,119,255,0.16)", background: "transparent", borderRadius: 0, padding: "12px 0", display: "grid", gap: "8px" },
aiSuggestionTitle: { margin: 0, color: "#e5eef9", fontSize: "13px", fontWeight: 850 },
aiSuggestionButton: { width: "100%", display: "flex", justifyContent: "space-between", gap: "14px", textAlign: "left", background: "rgba(3,8,18,0.42)", color: "#f3f4f6", border: "1px solid rgba(148,163,184,0.14)", borderRadius: "8px", padding: "10px 11px", fontSize: "12px", lineHeight: 1.5, cursor: "pointer" },
rolePromptBox: { margin: "10px 0 14px", borderLeft: "2px solid rgba(22,119,255,0.55)", background: "transparent", borderRadius: 0, padding: "8px 0 8px 12px" },
rolePromptItem: { margin: "5px 0", color: "#d1d5db", fontSize: "12px", lineHeight: 1.45 },
editableResumeText: { outline: "none", borderRadius: "3px", cursor: "text" },

};
