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

const introName = fullName || "Your Name";
const baseTitle = targetTitle || currentTitle || "professional";
const yearsText = yearsExperience ? `${yearsExperience}+ years of experience` : "experience";
const industryText = industry || "your field";
const topSkills = cleanSkills.slice(0, 3).join(", ");
const topStrengths = cleanStrengths.slice(0, 3).join(", ");
const topAchievements = cleanAchievements.slice(0, 2).join(", ");

const outputs = useMemo(() => {
const summary1 = `${baseTitle} with ${yearsText} in ${industryText}. Brings strengths in ${topSkills || "communication, organization, and problem-solving"}, with a track record of ${topAchievements || "supporting team goals and delivering strong results"}.`;
const summary2 = `${tone} ${baseTitle} known for ${topStrengths || "strong communication, adaptability, and professionalism"}. Experienced in ${industryText} and skilled at ${topSkills || "supporting operations, building relationships, and staying organized"} while contributing to business goals.`;
const summary3 = `${baseTitle} offering ${yearsText}, hands-on experience in ${industryText}, and the ability to add value through ${topSkills || "customer service, coordination, and follow-through"}. Recognized for ${topStrengths || "reliability, efficiency, and a positive attitude"}.`;

const bioShort = `${introName} is a ${tone.toLowerCase()} ${baseTitle} with ${yearsText} in ${industryText}.`;
const bioMedium = `${introName} is a ${baseTitle} with ${yearsText} in ${industryText}. Known for ${topStrengths || "professionalism, strong communication, and adaptability"}, ${introName.split(" ")[0]} brings experience in ${topSkills || "operations, customer service, and team support"} and a commitment to delivering meaningful results.`;
const bioLong = `${introName} is a ${baseTitle} with ${yearsText} in ${industryText}. With experience that includes ${experience || "supporting teams, serving clients, and driving day-to-day success"}, ${introName.split(" ")[0]} is recognized for ${topStrengths || "clear communication, leadership, and dependability"}. Core strengths include ${topSkills || "relationship-building, organization, and problem-solving"}, with accomplishments such as ${topAchievements || "improving processes and contributing to strong outcomes"}.`;

const headline1 = `${targetTitle || currentTitle || "Professional"} | ${topSkills || "Communication | Organization | Problem Solving"}`;
const headline2 = `${targetTitle || currentTitle || "Professional"} in ${industryText} | ${topStrengths || "Reliable | Adaptable | Detail-Oriented"}`;
const headline3 = `${targetTitle || currentTitle || "Professional"} | ${yearsExperience ? `${yearsExperience}+ Years Experience` : "Experienced"} | ${topSkills || "Client Support | Operations | Teamwork"}`;

const elevator1 = `Hi, I’m ${introName}. I’m a ${baseTitle} with ${yearsText} in ${industryText}, and I specialize in ${topSkills || "keeping work organized, supporting people, and getting results"}.`;
const elevator2 = `I bring a ${tone.toLowerCase()} approach to my work, with strengths in ${topStrengths || "communication, adaptability, and follow-through"}. I’m especially interested in opportunities where I can contribute through ${topSkills || "service, coordination, and team support"}.`;
const elevator3 = `One thing that stands out about my background is ${topAchievements || "my ability to add value quickly and contribute in a meaningful way"}.`;

const networking1 = `Hi, my name is ${introName}. I’m a ${baseTitle} with ${yearsText} in ${industryText}.`;
const networking2 = `My background includes ${experience || "supporting teams, serving clients, and helping organizations meet their goals"}, and my strengths include ${topStrengths || "communication, organization, and professionalism"}.`;
const networking3 = `I’m currently interested in connecting with professionals and opportunities related to ${targetTitle || currentTitle || "my next role"}. It’s great to connect with you.`;

return {
summary: [summary1, summary2, summary3],
bio: [bioShort, bioMedium, bioLong],
headline: [headline1, headline2, headline3],
elevator: [elevator1, elevator2, elevator3],
networking: [networking1, networking2, networking3],
};
}, [
achievements,
audience,
baseTitle,
cleanAchievements,
cleanSkills,
cleanStrengths,
experience,
fullName,
industry,
industryText,
introName,
targetTitle,
currentTitle,
tone,
topAchievements,
topSkills,
topStrengths,
yearsExperience,
yearsText,
]);

async function copyText(text: string) {
await navigator.clipboard.writeText(text);

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
console.error("Professional branding copy tracking error:", activityError);
}
}

function renderOutputCards(items: string[]) {
return (
<div style={styles.outputGrid}>
{items.map((item, index) => (
<div key={`${item}-${index}`} style={styles.outputCard}>
<p style={styles.outputText}>{item}</p>
<button type="button" onClick={() => copyText(item)} style={styles.smallButton}>
Copy
</button>
</div>
))}
</div>
);
}

return (
<main style={styles.page}>
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
<section style={styles.formCard}>
<p style={styles.sectionKicker}>Branding Tools</p>
<h2 style={styles.sectionTitle}>Choose what you want to create</h2>

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
<Field label="Your Full Name" value={fullName} onChange={setFullName} placeholder="Your full name" />
<Field label="Current Title" value={currentTitle} onChange={setCurrentTitle} placeholder="Current title" />
<Field label="Target Title" value={targetTitle} onChange={setTargetTitle} placeholder="Target role" />
<Field label="Years of Experience" value={yearsExperience} onChange={setYearsExperience} placeholder="Example: 5" />
<Field label="Industry" value={industry} onChange={setIndustry} placeholder="Healthcare, Admin, Recruiting" />
<SelectField label="Tone" value={tone} onChange={(v) => setTone(v as ToneOption)} options={["Professional", "Confident", "Warm", "Corporate", "Friendly", "Bold"]} />
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
</section>

<section style={styles.previewCard}>
<p style={styles.sectionKicker}>Generated Content</p>
<h2 style={styles.sectionTitle}>
{activeTool === "resume-summary"
? "Resume Summary Options"
: activeTool === "professional-bio"
? "Professional Bio Options"
: activeTool === "headline"
? "Headline Options"
: activeTool === "elevator-pitch"
? "Elevator Pitch Options"
: "Networking Introduction Options"}
</h2>

{activeTool === "resume-summary" && renderOutputCards(outputs.summary)}
{activeTool === "professional-bio" && renderOutputCards(outputs.bio)}
{activeTool === "headline" && renderOutputCards(outputs.headline)}
{activeTool === "elevator-pitch" && renderOutputCards(outputs.elevator)}
{activeTool === "networking-intro" && renderOutputCards(outputs.networking)}
</section>
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
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px",
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
outputGrid: {
display: "grid",
gap: "14px",
},
outputCard: {
border: "1px solid #2d2d2d",
borderRadius: "18px",
background: "#101010",
padding: "18px",
},
outputText: {
margin: "0 0 14px",
color: "#e5e7eb",
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
