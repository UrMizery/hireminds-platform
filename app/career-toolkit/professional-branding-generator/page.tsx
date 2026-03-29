"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../../lib/supabase";

type BrandTool =
| "resume-summary"
| "professional-bio"
| "headline"
| "elevator-pitch"
| "networking-intro";

type ToneOption =
| "Professional"
| "Confident"
| "Warm"
| "Corporate"
| "Friendly"
| "Bold";

const BRAND_DRAFT_KEY = "hireminds-professional-branding-generator-v1";

export default function ProfessionalBrandingGeneratorPage() {
const [activeTool, setActiveTool] = useState<BrandTool>("resume-summary");

const [fullName, setFullName] = useState("");
const [currentTitle, setCurrentTitle] = useState("");
const [targetTitle, setTargetTitle] = useState("");
const [yearsExperience, setYearsExperience] = useState("");
const [industry, setIndustry] = useState("");
const [skills, setSkills] = useState("");
const [strengths, setStrengths] = useState("");
const [experience, setExperience] = useState("");
const [achievements, setAchievements] = useState("");
const [audience, setAudience] = useState("");
const [tone, setTone] = useState<ToneOption>("Professional");
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
setActiveTool(draft.activeTool || "resume-summary");
setFullName(draft.fullName || "");
setCurrentTitle(draft.currentTitle || "");
setTargetTitle(draft.targetTitle || "");
setYearsExperience(draft.yearsExperience || "");
setIndustry(draft.industry || "");
setSkills(draft.skills || "");
setStrengths(draft.strengths || "");
setExperience(draft.experience || "");
setAchievements(draft.achievements || "");
setAudience(draft.audience || "");
setTone(draft.tone || "Professional");
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
activeTool,
fullName,
currentTitle,
targetTitle,
yearsExperience,
industry,
skills,
strengths,
experience,
achievements,
audience,
tone,
};

window.localStorage.setItem(BRAND_DRAFT_KEY, JSON.stringify(draft));
}, [
draftLoaded,
activeTool,
fullName,
currentTitle,
targetTitle,
yearsExperience,
industry,
skills,
strengths,
experience,
achievements,
audience,
tone,
]);

const cleanSkills = useMemo(
() => skills.split(",").map((s) => s.trim()).filter(Boolean),
[skills]
);

const cleanStrengths = useMemo(
() => strengths.split(",").map((s) => s.trim()).filter(Boolean),
[strengths]
);

const cleanAchievements = useMemo(
() => achievements.split(",").map((s) => s.trim()).filter(Boolean),
[achievements]
);

const firstName = fullName.trim().split(" ")[0] || "I";
const displayName = fullName || "Your Name";
const roleName = targetTitle || currentTitle || "professional";
const yearsText = yearsExperience
? `${yearsExperience}+ years of experience`
: "professional experience";
const industryText = industry || "your field";
const skillText = cleanSkills.slice(0, 4).join(", ");
const strengthText = cleanStrengths.slice(0, 4).join(", ");
const achievementText = cleanAchievements.slice(0, 3).join(", ");

const generated = useMemo(() => {
const summaryOptions = [
`${roleName} with ${yearsText} in ${industryText}. Brings strengths in ${skillText || "communication, organization, and problem-solving"}, with a consistent ability to support teams, build relationships, and deliver results.`,
`${tone} ${roleName} known for ${strengthText || "professionalism, adaptability, and strong communication"}. Offers hands-on experience in ${industryText} and the ability to contribute through ${skillText || "operations, customer support, and teamwork"}.`,
`${roleName} offering ${yearsText}, a background in ${industryText}, and a strong focus on ${skillText || "service, coordination, and follow-through"}. Recognized for ${strengthText || "dependability, efficiency, and a positive attitude"}.`,
];

const bioOptions = [
`${displayName} is a ${tone.toLowerCase()} ${roleName} with ${yearsText} in ${industryText}.`,
`${displayName} is a ${roleName} with ${yearsText} in ${industryText}. Known for ${strengthText || "strong communication, professionalism, and adaptability"}, ${firstName} brings experience in ${skillText || "operations, client support, and team collaboration"} and a commitment to meaningful results.`,
`${displayName} is a ${roleName} with ${yearsText} in ${industryText}. With experience that includes ${experience || "supporting teams, working with clients, and contributing to day-to-day success"}, ${firstName} is recognized for ${strengthText || "clear communication, reliability, and leadership"}. Key strengths include ${skillText || "relationship-building, organization, and problem-solving"}${achievementText ? `, with accomplishments such as ${achievementText}` : ""}.`,
];

const headlineOptions = [
`${roleName} | ${skillText || "Communication | Organization | Problem Solving"}`,
`${roleName} in ${industryText} | ${strengthText || "Reliable | Adaptable | Detail-Oriented"}`,
`${roleName} | ${yearsExperience ? `${yearsExperience}+ Years Experience` : "Experienced"} | ${skillText || "Client Support | Operations | Teamwork"}`,
];

const elevatorOptions = [
`Hi, I’m ${displayName}. I’m a ${roleName} with ${yearsText} in ${industryText}.`,
`My background includes ${experience || "supporting teams, serving clients, and helping organizations stay organized and effective"}, and I bring strengths in ${strengthText || "communication, adaptability, and professionalism"}.`,
`I’m especially interested in opportunities where I can contribute through ${skillText || "service, coordination, and team support"}${achievementText ? `, with results such as ${achievementText}` : ""}.`,
];

const networkingOptions = [
`Hi, my name is ${displayName}. I’m a ${roleName} with ${yearsText} in ${industryText}.`,
`My experience includes ${experience || "working with people, supporting day-to-day operations, and helping teams reach their goals"}, and my strengths include ${strengthText || "communication, organization, and professionalism"}.`,
`I’m interested in connecting with professionals and opportunities related to ${targetTitle || currentTitle || "my next role"}${audience ? `, especially within ${audience}` : ""}. It’s great to connect with you.`,
];

return {
"resume-summary": summaryOptions,
"professional-bio": bioOptions,
headline: headlineOptions,
"elevator-pitch": elevatorOptions,
"networking-intro": networkingOptions,
};
}, [
displayName,
roleName,
yearsText,
industryText,
skillText,
strengthText,
tone,
firstName,
experience,
achievementText,
yearsExperience,
targetTitle,
currentTitle,
audience,
]);

const currentOutputs = generated[activeTool];
const previewText = currentOutputs.join("\n\n");

async function trackCompletion() {
if (!userId) return;

const { error: activityError } = await supabase
.from("user_activity")
.insert({
user_id: userId,
full_name: fullName || null,
email: null,
referral_code: referralCode,
event_type: "tool_completed",
tool_name: "professional_branding_generator",
page_name: "/career-toolkit/professional-branding-generator",
});

if (activityError) {
console.error("Professional branding completion tracking error:", activityError);
}
}

async function handleCopy(text: string) {
await navigator.clipboard.writeText(text);
setMessage("Copied to clipboard.");
await trackCompletion();
}

async function handleSaveDraft() {
try {
const draft = {
activeTool,
fullName,
currentTitle,
targetTitle,
yearsExperience,
industry,
skills,
strengths,
experience,
achievements,
audience,
tone,
};

window.localStorage.setItem(BRAND_DRAFT_KEY, JSON.stringify(draft));
setMessage("Professional branding draft saved locally in this browser.");
await trackCompletion();
} catch {
setMessage("Unable to save your draft locally.");
}
}

async function handlePrint() {
window.print();
await trackCompletion();
}

const previewTitle =
activeTool === "resume-summary"
? "Resume Summary Preview"
: activeTool === "professional-bio"
? "Professional Bio Preview"
: activeTool === "headline"
? "Headline Preview"
: activeTool === "elevator-pitch"
? "Elevator Pitch Preview"
: "Networking Intro Preview";

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
<p style={styles.subtitle}>You Are Your Brand. Build It With Intention.</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</section>

<div style={styles.layout}>
<section className="hide-on-print" style={styles.formCard}>
<p style={styles.sectionKicker}>Branding Tools</p>
<h2 style={styles.sectionTitle}>Create polished written branding content</h2>

<div style={styles.tabGrid}>
{[
["resume-summary", "Resume Summary"],
["professional-bio", "Professional Bio"],
["headline", "Headline"],
["elevator-pitch", "Elevator Pitch"],
["networking-intro", "Networking Intro"],
].map(([value, label]) => (
<button
key={value}
type="button"
onClick={() => setActiveTool(value as BrandTool)}
style={{
...styles.tabButton,
...(activeTool === value ? styles.tabButtonActive : {}),
}}
>
{label}
</button>
))}
</div>

<div style={styles.formGrid}>
<Field
label="Your Full Name"
value={fullName}
onChange={setFullName}
placeholder="Your full name"
/>
<Field
label="Current Title"
value={currentTitle}
onChange={setCurrentTitle}
placeholder="Current title"
/>
<Field
label="Target Title"
value={targetTitle}
onChange={setTargetTitle}
placeholder="Target role"
/>
<Field
label="Years of Experience"
value={yearsExperience}
onChange={setYearsExperience}
placeholder="Example: 5"
/>
<Field
label="Industry"
value={industry}
onChange={setIndustry}
placeholder="Healthcare, Admin, Recruiting"
/>
<SelectField
label="Tone"
value={tone}
onChange={(v) => setTone(v as ToneOption)}
options={[
"Professional",
"Confident",
"Warm",
"Corporate",
"Friendly",
"Bold",
]}
/>
</div>

<TextAreaField
label="Top Skills"
value={skills}
onChange={setSkills}
placeholder="Comma separated: customer service, scheduling, recruiting"
/>

<TextAreaField
label="Strengths"
value={strengths}
onChange={setStrengths}
placeholder="Comma separated: dependable, organized, detail-oriented"
/>

<TextAreaField
label="Experience / Background"
value={experience}
onChange={setExperience}
placeholder="Briefly describe your work background"
/>

<TextAreaField
label="Achievements"
value={achievements}
onChange={setAchievements}
placeholder="Comma separated: improved workflow, supported 100+ clients, increased placement rate"
/>

<Field
label="Audience (optional)"
value={audience}
onChange={setAudience}
placeholder="Recruiters, employers, LinkedIn network"
/>

{message ? <p style={styles.message}>{message}</p> : null}

<div style={styles.buttonRow}>
<button type="button" onClick={handleSaveDraft} style={styles.primaryButton}>
Save Draft
</button>
<button type="button" onClick={handlePrint} style={styles.secondaryButton}>
Print / Save
</button>
</div>
</section>

<aside className="print-wrap" style={styles.previewCard}>
<p style={styles.sectionKicker}>Live Preview</p>
<h2 style={styles.sectionTitle}>{previewTitle}</h2>

<div style={styles.previewBox}>
{previewText.split("\n").map((line, index) => (
<p key={index} style={styles.previewText}>
{line || "\u00A0"}
</p>
))}
</div>

<div style={styles.outputGrid}>
{currentOutputs.map((item, index) => (
<div key={`${item}-${index}`} style={styles.outputCard}>
<p style={styles.outputText}>{item}</p>
<button
type="button"
onClick={() => handleCopy(item)}
style={styles.smallButton}
>
Copy
</button>
</div>
))}
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
maxWidth: "1440px",
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
gridTemplateColumns: "0.95fr 1.05fr",
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
color: "inherit",
},
tabGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
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
textAlign: "left",
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
minHeight: "100px",
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
margin: "8px 0 0",
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.6,
},
buttonRow: {
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
previewBox: {
border: "1px solid #d1d5db",
borderRadius: "18px",
padding: "18px",
background: "#f9fafb",
marginBottom: "18px",
},
previewText: {
margin: "0 0 12px",
color: "#111827",
fontSize: "15px",
lineHeight: 1.8,
whiteSpace: "pre-wrap",
},
outputGrid: {
display: "grid",
gap: "14px",
},
outputCard: {
border: "1px solid #d1d5db",
borderRadius: "18px",
background: "#ffffff",
padding: "18px",
},
outputText: {
margin: "0 0 14px",
color: "#111827",
fontSize: "15px",
lineHeight: 1.8,
whiteSpace: "pre-wrap",
},
smallButton: {
padding: "10px 14px",
borderRadius: "14px",
border: "1px solid rgba(148,163,184,0.28)",
background: "linear-gradient(180deg, #0f244d 0%, #112b5f 100%)",
color: "#fff",
fontSize: "14px",
fontWeight: 700,
cursor: "pointer",
},
};
