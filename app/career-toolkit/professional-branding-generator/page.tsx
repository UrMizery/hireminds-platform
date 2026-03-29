"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../../lib/supabase";

type BrandMode = "summary" | "bio";
type ToneOption = "Professional" | "Warm" | "Confident" | "Friendly";

const BRAND_DRAFT_KEY = "hireminds-professional-branding-generator-v2";

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
setMode(draft.mode || "summary");
setFullName(draft.fullName || "");
setCurrentTitle(draft.currentTitle || "");
setIndustry(draft.industry || "");
setSkills(draft.skills || "");
setStrengths(draft.strengths || "");
setExperience(draft.experience || "");
setTone(draft.tone || "Professional");
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
};

window.localStorage.setItem(BRAND_DRAFT_KEY, JSON.stringify(draft));
}, [draftLoaded, mode, fullName, currentTitle, industry, skills, strengths, experience, tone]);

const cleanSkills = useMemo(
() => skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4),
[skills]
);

const cleanStrengths = useMemo(
() => strengths.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4),
[strengths]
);

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

const activeText = mode === "summary" ? summaryPreview : bioPreview;

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

async function handleCopy() {
await navigator.clipboard.writeText(activeText);
setMessage(`${mode === "summary" ? "Summary" : "Bio"} copied to clipboard.`);
await trackCompletion();
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
};

window.localStorage.setItem(BRAND_DRAFT_KEY, JSON.stringify(draft));
setMessage("Branding draft saved locally in this browser.");
await trackCompletion();
} catch {
setMessage("Unable to save your draft locally.");
}
}

async function handlePrint() {
window.print();
await trackCompletion();
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
<p style={styles.subtitle}>You Are Your Brand. Build It With Intention.</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</section>

<div style={styles.layout}>
<section className="hide-on-print" style={styles.formCard}>
<p style={styles.sectionKicker}>Choose Format</p>
<h2 style={styles.sectionTitle}>Build a stronger introduction</h2>

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
</div>

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
{mode === "summary" ? "Professional Summary Preview" : "Professional Bio Preview"}
</h2>

<div style={styles.previewPaper}>
<p style={styles.previewText}>{activeText}</p>
</div>

<div style={styles.sampleWrap}>
<p style={styles.sampleLabel}>How it works</p>
<p style={styles.sampleText}>
Start with the sample and watch it change as you add your information. The more
specific your title, skills, strengths, and work background are, the stronger your
result will be.
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
