"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type ResumePlan = "free" | "access" | "premium" | "pro";
type ResumeFont = "Times New Roman" | "Arial" | "Calibri";

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

const FREE_BULLET_LIMIT = 4;
const PAID_BULLET_LIMIT = 6;
const FREE_SKILL_LIMIT = 9;

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

function skillsColumnCount(count: number) {
if (count >= 7) return 3;
if (count >= 4) return 2;
return 1;
}

export default function ResumeBuilderPage() {
const [loadingUser, setLoadingUser] = useState(true);
const [userId, setUserId] = useState("");
const [message, setMessage] = useState("");
const [saving, setSaving] = useState(false);

const [plan, setPlan] = useState<ResumePlan>("free");
const [fontFamily, setFontFamily] = useState<ResumeFont>("Times New Roman");

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

const [experiences, setExperiences] = useState<ExperienceItem[]>([
{
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
},
]);

const [educationItems, setEducationItems] = useState<EducationItem[]>([
{
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
},
]);

const [certificateItems, setCertificateItems] = useState<CertificateItem[]>([
{
organizationName: "",
city: "",
state: "",
certificateName: "",
startMonth: "",
startYear: "",
endMonth: "",
endYear: "",
isPresent: false,
},
]);

const [volunteerItems, setVolunteerItems] = useState<VolunteerItem[]>([
{
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
},
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
.select("full_name, phone, city, state, email, linkedin_url")
.eq("user_id", currentUserId)
.maybeSingle();

if (profile) {
setFullName(profile.full_name || "");
setPhone(profile.phone || "");
setCity(profile.city || "");
setStateName(profile.state || "");
setEmail(profile.email || data.user.email || "");
setLinkedinUrl((profile as any).linkedin_url || "");
} else {
setEmail(data.user.email || "");
}

setLoadingUser(false);
}

loadUserAndProfile();
}, []);

const bulletLimit = plan === "free" ? FREE_BULLET_LIMIT : PAID_BULLET_LIMIT;

const planDetails = useMemo(() => {
if (plan === "free") {
return {
title: "Free",
text: "2 page only. 4 bullets per role. 1 live mock interview for 30 minutes. 2 free resume and 1 revision after 7 days.",
};
}
if (plan === "access") {
return {
title: "Resume Access",
text: "$19.99/month. Unlimited resume edits, 1 employer verification offered once when enrolled, and ongoing resume access.",
};
}
if (plan === "premium") {
return {
title: "Premium",
text: "$29.99/month. Includes everything in Resume Access plus premium support and included employer verifications.",
};
}
return {
title: "Premium Plus / Pro",
text: "$45.99/month. Includes everything in Premium plus CV-level support and more included verification capacity.",
};
}, [plan]);

const skills = useMemo(() => {
return skillsInput
.split(",")
.map((item) => item.trim())
.filter(Boolean)
.slice(0, FREE_SKILL_LIMIT);
}, [skillsInput]);

const activeExperiences = experiences.filter(
(item) =>
item.companyName ||
item.roleTitle ||
item.city ||
item.state ||
item.startMonth ||
item.startYear ||
item.endMonth ||
item.endYear ||
item.isPresent ||
item.bullets.some((bullet) => bullet.text)
);

const activeEducation = educationItems.filter(
(item) =>
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

const activeCertificates = certificateItems.filter(
(item) =>
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

const activeVolunteer = volunteerItems.filter(
(item) =>
item.organizationName ||
item.roleTitle ||
item.city ||
item.state ||
item.startMonth ||
item.startYear ||
item.endMonth ||
item.endYear ||
item.isPresent ||
item.bullets.some((bullet) => bullet.text)
);

function addExperience() {
setExperiences((prev) => [
...prev,
{
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
},
]);
}

function updateExperience(
index: number,
field: keyof ExperienceItem,
value: string | boolean
) {
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
if (item.bullets.length >= bulletLimit) return item;
return { ...item, bullets: [...item.bullets, { text: "" }] };
})
);
}

function addEducation() {
setEducationItems((prev) => [
...prev,
{
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
},
]);
}

function updateEducation(index: number, field: keyof EducationItem, value: string | boolean) {
setEducationItems((prev) =>
prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
);
}

function addCertificate() {
setCertificateItems((prev) => [
...prev,
{
organizationName: "",
city: "",
state: "",
certificateName: "",
startMonth: "",
startYear: "",
endMonth: "",
endYear: "",
isPresent: false,
},
]);
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
setVolunteerItems((prev) => [
...prev,
{
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
},
]);
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
if (item.bullets.length >= bulletLimit) return item;
return { ...item, bullets: [...item.bullets, { text: "" }] };
})
);
}

function moveSection(index: number, direction: "up" | "down") {
setSectionOrder((prev) => moveItem(prev, index, direction));
}

async function handleSaveResume() {
setMessage("");

if (!userId) {
setMessage("You must be signed in before saving.");
return;
}

if (plan !== "free") {
setMessage("This builder is showing paid plans, but subscription checkout still needs to be wired to Stripe.");
return;
}

try {
setSaving(true);

const { data: profileData, error: profileError } = await supabase
.from("candidate_profiles")
.select("id")
.eq("user_id", userId)
.single();

if (profileError) throw profileError;

const profileId = profileData.id;

const { error: resumeError } = await supabase.from("resumes").insert({
profile_id: profileId,
title: "Free Resume",
page_limit: 1,
summary_heading: summaryHeading,
summary_text: summaryText,
skills,
education: JSON.stringify(activeEducation),
accomplishments,
volunteer_work: JSON.stringify(activeVolunteer),
section_order: sectionOrder,
});

if (resumeError) throw resumeError;

setMessage("Free resume saved successfully.");
} catch (error: any) {
setMessage(error.message || "Something went wrong while saving.");
} finally {
setSaving(false);
}
}

function handlePrint() {
if (plan !== "free") {
setMessage("Printing for paid plans should be unlocked after checkout is connected.");
return;
}
window.print();
}

if (loadingUser) {
return (
<main style={styles.page}>
<div style={styles.centerWrap}>Loading...</div>
</main>
);
}

if (!userId) {
return (
<main style={styles.page}>
<div style={styles.centerWrap}>
<div style={styles.lockedCard}>
<p style={styles.kicker}>Resume Builder</p>
<h1 style={styles.lockedTitle}>Sign in first to access this page.</h1>
<p style={styles.previewText}>
Create your Career Passport account first, then sign in and return here to build your resume.
</p>
<div style={styles.lockedButtons}>
<a href="/sign-up" style={styles.signUpButton}>
Sign Up
</a>
<a href="/sign-in" style={styles.signUpButton}>
Sign In
</a>
<a href="/profile" style={styles.signUpButtonDark}>
Profile
</a>
</div>
</div>
</div>
</main>
);
}

return (
<main style={styles.page}>
<div style={styles.fontBar}>
<div style={styles.fontBarInner}>
<div>
<p style={styles.fontBarKicker}>Resume Builder</p>
<h1 style={styles.fontBarTitle}>Choose your resume font before you begin.</h1>
</div>

<div style={styles.fontControls}>
<label style={styles.fontLabel}>Resume Font</label>
<select
value={fontFamily}
onChange={(e) => setFontFamily(e.target.value as ResumeFont)}
style={styles.fontSelect}
>
<option value="Times New Roman">Times New Roman</option>
<option value="Arial">Arial</option>
<option value="Calibri">Calibri</option>
</select>
</div>
</div>
</div>

<div style={styles.shell}>
<section style={styles.leftPanel}>
<div style={styles.card}>
<div style={styles.compactTopRow}>
<div>
<p style={styles.kicker}>Plan</p>
<h2 style={styles.sectionTitle}>Choose plan</h2>
</div>

<select
value={plan}
onChange={(e) => setPlan(e.target.value as ResumePlan)}
style={styles.planSelect}
>
<option value="free">Free</option>
<option value="access">Resume Access</option>
<option value="premium">Premium</option>
<option value="pro">Premium Plus / Pro</option>
</select>
</div>

<div style={styles.planSummaryCard}>
<p style={styles.planSummaryTitle}>{planDetails.title}</p>
<p style={styles.planSummaryText}>{planDetails.text}</p>
</div>
</div>

<div style={styles.card}>
<p style={styles.kicker}>Header</p>
<h2 style={styles.sectionTitle}>Resume Header</h2>

<div style={styles.twoCol}>
<Field label="Full Name" value={fullName} onChange={setFullName} placeholder="Full Name" />
<Field label="Phone Number" value={phone} onChange={setPhone} placeholder="Phone Number" />
</div>

<div style={styles.twoCol}>
<Field label="City (optional)" value={city} onChange={setCity} placeholder="City" />
<Field label="State (optional)" value={stateName} onChange={setStateName} placeholder="State" />
</div>

<div style={styles.twoCol}>
<Field label="Email" value={email} onChange={setEmail} placeholder="Email" type="email" />
<Field label="LinkedIn (optional)" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="LinkedIn URL" />
</div>
</div>

<div style={styles.card}>
<p style={styles.kicker}>Summary</p>
<h2 style={styles.sectionTitle}>Summary + Skills</h2>

<Field
label='Summary Heading (optional, can be blank or "Summary")'
value={summaryHeading}
onChange={setSummaryHeading}
placeholder="Summary"
/>

<TextAreaField
label="Summary"
value={summaryText}
onChange={setSummaryText}
placeholder="Example: Client-focused workforce development professional with experience in talent acquisition, resume writing, employer engagement, and job readiness coaching."
/>

<Field
label="Skills (comma separated, up to 9)"
value={skillsInput}
onChange={setSkillsInput}
placeholder="Recruiting, ATS, Sourcing, Interviewing"
/>
</div>

<div style={styles.card}>
<p style={styles.kicker}>Experience</p>
<h2 style={styles.sectionTitle}>Work Experience</h2>

{experiences.map((item, index) => (
<div key={index} style={styles.subCard}>
<div style={styles.twoCol}>
<Field
label="Company"
value={item.companyName}
onChange={(value) => updateExperience(index, "companyName", value)}
placeholder="Company Name"
/>
<Field
label="Role"
value={item.roleTitle}
onChange={(value) => updateExperience(index, "roleTitle", value)}
placeholder="Role Title"
/>
</div>

<div style={styles.twoCol}>
<Field
label="City"
value={item.city}
onChange={(value) => updateExperience(index, "city", value)}
placeholder="City"
/>
<Field
label="State"
value={item.state}
onChange={(value) => updateExperience(index, "state", value)}
placeholder="State"
/>
</div>

<div style={styles.twoCol}>
<Field
label="From Month"
value={item.startMonth}
onChange={(value) => updateExperience(index, "startMonth", value)}
placeholder="Jan"
/>
<Field
label="From Year"
value={item.startYear}
onChange={(value) => updateExperience(index, "startYear", value)}
placeholder="2022"
/>
</div>

<label style={styles.checkboxRow}>
<input
type="checkbox"
checked={item.isPresent}
onChange={(e) => updateExperience(index, "isPresent", e.target.checked)}
/>
<span>I currently work here</span>
</label>

{!item.isPresent ? (
<div style={styles.twoCol}>
<Field
label="To Month"
value={item.endMonth}
onChange={(value) => updateExperience(index, "endMonth", value)}
placeholder="Mar"
/>
<Field
label="To Year"
value={item.endYear}
onChange={(value) => updateExperience(index, "endYear", value)}
placeholder="2024"
/>
</div>
) : null}

<p style={styles.helperText}>
{plan === "free"
? "Free plan allows up to 4 bullet points for each role."
: "Paid plans allow up to 6 bullet points for each role."}
</p>

{item.bullets.map((bullet, bulletIndex) => (
<Field
key={bulletIndex}
label={`Bullet ${bulletIndex + 1}`}
value={bullet.text}
onChange={(value) => updateExperienceBullet(index, bulletIndex, value)}
placeholder="Describe the work you did"
/>
))}

{item.bullets.length < bulletLimit ? (
<button type="button" style={styles.secondaryButton} onClick={() => addExperienceBullet(index)}>
+ Add Bullet
</button>
) : null}
</div>
))}

<button type="button" style={styles.secondaryButton} onClick={addExperience}>
+ Add Work Experience
</button>
</div>

<div style={styles.card}>
<p style={styles.kicker}>Education</p>
<h2 style={styles.sectionTitle}>Education (optional)</h2>

{educationItems.map((item, index) => (
<div key={index} style={styles.subCard}>
<div style={styles.twoCol}>
<Field
label="School / College"
value={item.schoolName}
onChange={(value) => updateEducation(index, "schoolName", value)}
placeholder="School / College"
/>
<Field
label="Degree / Course of Study"
value={item.degree}
onChange={(value) => updateEducation(index, "degree", value)}
placeholder="Degree / Course of Study"
/>
</div>

<div style={styles.twoCol}>
<Field
label="City"
value={item.city}
onChange={(value) => updateEducation(index, "city", value)}
placeholder="City"
/>
<Field
label="State"
value={item.state}
onChange={(value) => updateEducation(index, "state", value)}
placeholder="State"
/>
</div>

<div style={styles.twoCol}>
<Field
label="From Month"
value={item.startMonth}
onChange={(value) => updateEducation(index, "startMonth", value)}
placeholder="Sep"
/>
<Field
label="From Year"
value={item.startYear}
onChange={(value) => updateEducation(index, "startYear", value)}
placeholder="2019"
/>
</div>

<label style={styles.checkboxRow}>
<input
type="checkbox"
checked={item.isPresent}
onChange={(e) => updateEducation(index, "isPresent", e.target.checked)}
/>
<span>I currently attend here</span>
</label>

{!item.isPresent ? (
<div style={styles.twoCol}>
<Field
label="To Month"
value={item.endMonth}
onChange={(value) => updateEducation(index, "endMonth", value)}
placeholder="May"
/>
<Field
label="To Year"
value={item.endYear}
onChange={(value) => updateEducation(index, "endYear", value)}
placeholder="2023"
/>
</div>
) : null}

<Field label="GPA (optional)" value={item.gpa} onChange={(value) => updateEducation(index, "gpa", value)} placeholder="3.8" />
</div>
))}

<button type="button" style={styles.secondaryButton} onClick={addEducation}>
+ Add Education
</button>
</div>

<div style={styles.card}>
<p style={styles.kicker}>Certificates</p>
<h2 style={styles.sectionTitle}>Certifications (optional)</h2>

{certificateItems.map((item, index) => (
<div key={index} style={styles.subCard}>
<div style={styles.twoCol}>
<Field
label="Organization / Program"
value={item.organizationName}
onChange={(value) => updateCertificate(index, "organizationName", value)}
placeholder="Organization / Program"
/>
<Field
label="Certificate / Course Name"
value={item.certificateName}
onChange={(value) => updateCertificate(index, "certificateName", value)}
placeholder="Certificate / Course Name"
/>
</div>

<div style={styles.twoCol}>
<Field
label="City"
value={item.city}
onChange={(value) => updateCertificate(index, "city", value)}
placeholder="City"
/>
<Field
label="State"
value={item.state}
onChange={(value) => updateCertificate(index, "state", value)}
placeholder="State"
/>
</div>

<div style={styles.twoCol}>
<Field
label="From Month"
value={item.startMonth}
onChange={(value) => updateCertificate(index, "startMonth", value)}
placeholder="Jan"
/>
<Field
label="From Year"
value={item.startYear}
onChange={(value) => updateCertificate(index, "startYear", value)}
placeholder="2024"
/>
</div>

<label style={styles.checkboxRow}>
<input
type="checkbox"
checked={item.isPresent}
onChange={(e) => updateCertificate(index, "isPresent", e.target.checked)}
/>
<span>I am currently completing this certification</span>
</label>

{!item.isPresent ? (
<div style={styles.twoCol}>
<Field
label="To Month"
value={item.endMonth}
onChange={(value) => updateCertificate(index, "endMonth", value)}
placeholder="Mar"
/>
<Field
label="To Year"
value={item.endYear}
onChange={(value) => updateCertificate(index, "endYear", value)}
placeholder="2024"
/>
</div>
) : null}
</div>
))}

<button type="button" style={styles.secondaryButton} onClick={addCertificate}>
+ Add Certification
</button>
</div>

<div style={styles.card}>
<p style={styles.kicker}>Volunteer</p>
<h2 style={styles.sectionTitle}>Volunteer Work (optional)</h2>

{volunteerItems.map((item, index) => (
<div key={index} style={styles.subCard}>
<div style={styles.twoCol}>
<Field
label="Organization"
value={item.organizationName}
onChange={(value) => updateVolunteer(index, "organizationName", value)}
placeholder="Organization Name"
/>
<Field
label="Role"
value={item.roleTitle}
onChange={(value) => updateVolunteer(index, "roleTitle", value)}
placeholder="Role Title"
/>
</div>

<div style={styles.twoCol}>
<Field
label="City"
value={item.city}
onChange={(value) => updateVolunteer(index, "city", value)}
placeholder="City"
/>
<Field
label="State"
value={item.state}
onChange={(value) => updateVolunteer(index, "state", value)}
placeholder="State"
/>
</div>

<div style={styles.twoCol}>
<Field
label="From Month"
value={item.startMonth}
onChange={(value) => updateVolunteer(index, "startMonth", value)}
placeholder="Jan"
/>
<Field
label="From Year"
value={item.startYear}
onChange={(value) => updateVolunteer(index, "startYear", value)}
placeholder="2020"
/>
</div>

<label style={styles.checkboxRow}>
<input
type="checkbox"
checked={item.isPresent}
onChange={(e) => updateVolunteer(index, "isPresent", e.target.checked)}
/>
<span>I currently volunteer here</span>
</label>

{!item.isPresent ? (
<div style={styles.twoCol}>
<Field
label="To Month"
value={item.endMonth}
onChange={(value) => updateVolunteer(index, "endMonth", value)}
placeholder="Dec"
/>
<Field
label="To Year"
value={item.endYear}
onChange={(value) => updateVolunteer(index, "endYear", value)}
placeholder="2022"
/>
</div>
) : null}

<p style={styles.helperText}>
{plan === "free"
? "Free plan allows up to 4 bullet points for volunteer work."
: "Paid plans allow up to 6 bullet points for volunteer work."}
</p>

{item.bullets.map((bullet, bulletIndex) => (
<Field
key={bulletIndex}
label={`Bullet ${bulletIndex + 1}`}
value={bullet.text}
onChange={(value) => updateVolunteerBullet(index, bulletIndex, value)}
placeholder="Describe your volunteer work"
/>
))}

{item.bullets.length < bulletLimit ? (
<button type="button" style={styles.secondaryButton} onClick={() => addVolunteerBullet(index)}>
+ Add Bullet
</button>
) : null}
</div>
))}

<button type="button" style={styles.secondaryButton} onClick={addVolunteer}>
+ Add Volunteer Work
</button>
</div>

<div style={styles.card}>
<p style={styles.kicker}>Accomplishments</p>
<h2 style={styles.sectionTitle}>Accomplishments (optional)</h2>

<TextAreaField
label="Accomplishments"
value={accomplishments}
onChange={setAccomplishments}
placeholder="Awards, recognitions, achievements, notable wins"
/>
</div>

<div style={styles.card}>
<p style={styles.kicker}>Order</p>
<h2 style={styles.sectionTitle}>Move Resume Sections</h2>

{sectionOrder.map((section, index) => (
<div key={section} style={styles.moveRow}>
<span style={styles.moveLabel}>{section}</span>
<div style={styles.moveButtons}>
<button type="button" style={styles.smallButton} onClick={() => moveSection(index, "up")}>
Up
</button>
<button type="button" style={styles.smallButton} onClick={() => moveSection(index, "down")}>
Down
</button>
</div>
</div>
))}
</div>

<div style={styles.card}>
<div style={styles.actionRow}>
<button style={styles.primaryButton} onClick={handleSaveResume} disabled={saving}>
{saving ? "Saving..." : "Save Resume"}
</button>

<button style={styles.secondaryPrimaryButton} onClick={handlePrint}>
Print Resume
</button>
</div>

{message ? <p style={styles.message}>{message}</p> : null}
</div>
</section>

<aside style={styles.rightPanel}>
<div style={styles.previewHeader}>
<p style={styles.kicker}>Live Preview</p>
<h2 style={styles.sectionTitle}>Resume Preview</h2>
<p style={styles.previewText}>
The preview stays visible while you build and expands as you type.
</p>
</div>

<div
style={{
...styles.resumePaper,
fontFamily: fontFamily,
}}
>
<div style={styles.resumeHeader}>
<h1 style={styles.resumeName}>{fullName || "Your Name"}</h1>
<p style={styles.resumeContact}>
{phone || "Phone"}
{email ? ` • ${email}` : ""}
{city || stateName ? ` • ${[city, stateName].filter(Boolean).join(", ")}` : ""}
</p>
{linkedinUrl ? <p style={styles.resumeContact}>{linkedinUrl}</p> : null}
</div>

{sectionOrder.map((section) => {
if (section === "summary" && summaryText) {
return (
<ResumeSection key={section} title={summaryHeading || ""} hideTitle={!summaryHeading}>
<p style={styles.resumeText}>{summaryText}</p>
</ResumeSection>
);
}

if (section === "skills" && skills.length > 0) {
return (
<ResumeSection key={section} title="Skills">
<div
style={{
...styles.skillsGrid,
gridTemplateColumns: `repeat(${skillsColumnCount(skills.length)}, minmax(0, 1fr))`,
}}
>
{skills.map((skill, index) => (
<p key={index} style={styles.skillItem}>
• {skill}
</p>
))}
</div>
</ResumeSection>
);
}

if (section === "experience" && activeExperiences.length > 0) {
return (
<ResumeSection key={section} title="Work Experience">
{activeExperiences.map((item, index) => (
<div key={index} style={styles.resumeBlock}>
<div style={styles.resumeTopLine}>
<p style={styles.resumeStrong}>
{[item.companyName, [item.city, item.state].filter(Boolean).join(", ")]
.filter(Boolean)
.join(" — ")}
</p>
<p style={styles.resumeDate}>
{formatDateRange(item.startMonth, item.startYear, item.endMonth, item.endYear, item.isPresent)}
</p>
</div>
<p style={styles.resumeRole}>{item.roleTitle}</p>
{item.bullets
.filter((bullet) => bullet.text)
.map((bullet, bulletIndex) => (
<p key={bulletIndex} style={styles.resumeBullet}>
• {bullet.text}
</p>
))}
</div>
))}
</ResumeSection>
);
}

if (section === "education" && activeEducation.length > 0) {
return (
<ResumeSection key={section} title="Education">
{activeEducation.map((item, index) => (
<div key={index} style={styles.resumeBlock}>
<div style={styles.resumeTopLine}>
<p style={styles.resumeStrong}>
{[item.schoolName, [item.city, item.state].filter(Boolean).join(", ")]
.filter(Boolean)
.join(" — ")}
</p>
<p style={styles.resumeDate}>
{formatDateRange(item.startMonth, item.startYear, item.endMonth, item.endYear, item.isPresent)}
</p>
</div>
<p style={styles.resumeText}>
{item.degree}
{item.gpa ? ` GPA: ${item.gpa}` : ""}
</p>
</div>
))}
</ResumeSection>
);
}

if (section === "certifications" && activeCertificates.length > 0) {
return (
<ResumeSection key={section} title="Certifications">
{activeCertificates.map((item, index) => (
<div key={index} style={styles.resumeBlock}>
<div style={styles.resumeTopLine}>
<p style={styles.resumeStrong}>
{[item.organizationName, [item.city, item.state].filter(Boolean).join(", ")]
.filter(Boolean)
.join(" — ")}
</p>
<p style={styles.resumeDate}>
{formatDateRange(item.startMonth, item.startYear, item.endMonth, item.endYear, item.isPresent)}
</p>
</div>
<p style={styles.resumeText}>{item.certificateName}</p>
</div>
))}
</ResumeSection>
);
}

if (section === "volunteer" && activeVolunteer.length > 0) {
return (
<ResumeSection key={section} title="Volunteer Work">
{activeVolunteer.map((item, index) => (
<div key={index} style={styles.resumeBlock}>
<div style={styles.resumeTopLine}>
<p style={styles.resumeStrong}>
{[item.organizationName, [item.city, item.state].filter(Boolean).join(", ")]
.filter(Boolean)
.join(" — ")}
</p>
<p style={styles.resumeDate}>
{formatDateRange(item.startMonth, item.startYear, item.endMonth, item.endYear, item.isPresent)}
</p>
</div>
<p style={styles.resumeRole}>{item.roleTitle}</p>
{item.bullets
.filter((bullet) => bullet.text)
.map((bullet, bulletIndex) => (
<p key={bulletIndex} style={styles.resumeBullet}>
• {bullet.text}
</p>
))}
</div>
))}
</ResumeSection>
);
}

if (section === "accomplishments" && accomplishments) {
return (
<ResumeSection key={section} title="Accomplishments">
<p style={styles.resumeText}>{accomplishments}</p>
</ResumeSection>
);
}

return null;
})}
</div>
</aside>
</div>
</main>
);
}

function Field({
label,
value,
onChange,
placeholder,
type = "text",
}: {
label: string;
value: string;
onChange: (value: string) => void;
placeholder?: string;
type?: string;
}) {
return (
<div style={styles.fieldWrap}>
<label style={styles.label}>{label}</label>
<input
type={type}
value={value}
onChange={(e) => onChange(e.target.value)}
placeholder={placeholder}
style={styles.input}
/>
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

function ResumeSection({
title,
hideTitle,
children,
}: {
title: string;
hideTitle?: boolean;
children: React.ReactNode;
}) {
return (
<section style={styles.resumeSection}>
{!hideTitle ? <h3 style={styles.resumeSectionTitle}>{title}</h3> : null}
{children}
</section>
);
}

const styles: Record<string, React.CSSProperties> = {
page: {
minHeight: "100vh",
background:
"radial-gradient(circle at top left, rgba(255,255,255,0.04), transparent 22%), linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
color: "#e7e7e7",
paddingBottom: "32px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
centerWrap: {
maxWidth: "1200px",
margin: "0 auto",
padding: "40px 24px",
},
lockedCard: {
maxWidth: "760px",
margin: "80px auto",
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "32px",
textAlign: "center",
},
lockedTitle: {
margin: "0 0 10px",
fontSize: "34px",
fontWeight: 500,
letterSpacing: "-0.03em",
},
lockedButtons: {
display: "flex",
justifyContent: "center",
gap: "12px",
flexWrap: "wrap",
marginTop: "18px",
},
signUpButton: {
display: "inline-block",
padding: "14px 18px",
borderRadius: "16px",
textDecoration: "none",
background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
color: "#09090b",
fontWeight: 700,
},
signUpButtonDark: {
display: "inline-block",
padding: "14px 18px",
borderRadius: "16px",
textDecoration: "none",
background: "#111827",
border: "1px solid #374151",
color: "#f3f4f6",
fontWeight: 700,
},
fontBar: {
width: "100%",
borderBottom: "1px solid #232323",
background: "rgba(7,7,8,0.94)",
backdropFilter: "blur(8px)",
position: "sticky",
top: 0,
zIndex: 40,
},
fontBarInner: {
maxWidth: "1480px",
margin: "0 auto",
padding: "18px 24px",
display: "flex",
justifyContent: "space-between",
alignItems: "center",
gap: "20px",
},
fontBarKicker: {
margin: "0 0 6px",
color: "#9a9a9a",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
fontBarTitle: {
margin: 0,
fontSize: "30px",
fontWeight: 500,
letterSpacing: "-0.03em",
color: "#f5f5f5",
},
fontControls: {
display: "flex",
alignItems: "center",
gap: "12px",
},
fontLabel: {
color: "#d4d4d8",
fontSize: "14px",
fontWeight: 600,
},
fontSelect: {
padding: "10px 12px",
borderRadius: "12px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "14px",
},
shell: {
maxWidth: "1480px",
margin: "0 auto",
padding: "20px 24px 0",
display: "grid",
gridTemplateColumns: "1.05fr 0.95fr",
gap: "18px",
alignItems: "start",
},
leftPanel: {
display: "grid",
gap: "16px",
},
rightPanel: {
position: "sticky",
top: "98px",
alignSelf: "start",
},
card: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "22px",
boxShadow: "0 30px 80px rgba(0,0,0,0.25)",
},
compactTopRow: {
display: "flex",
justifyContent: "space-between",
gap: "16px",
alignItems: "center",
marginBottom: "12px",
},
kicker: {
margin: "0 0 8px",
color: "#9a9a9a",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
sectionTitle: {
margin: 0,
fontSize: "28px",
fontWeight: 500,
letterSpacing: "-0.03em",
color: "#f5f5f5",
},
planSelect: {
padding: "12px 14px",
borderRadius: "14px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "14px",
minWidth: "220px",
},
planSummaryCard: {
background: "#0f172a",
border: "1px solid #273244",
borderRadius: "18px",
padding: "16px",
},
planSummaryTitle: {
margin: "0 0 8px",
color: "#f5f5f5",
fontWeight: 700,
},
planSummaryText: {
margin: 0,
color: "#cbd5e1",
lineHeight: 1.7,
fontSize: "14px",
},
fieldWrap: {
marginBottom: "12px",
},
label: {
display: "block",
marginBottom: "8px",
color: "#c9c9c9",
fontSize: "13px",
fontWeight: 500,
letterSpacing: "0.02em",
},
input: {
width: "100%",
padding: "14px 16px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "15px",
outline: "none",
boxSizing: "border-box",
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
outline: "none",
resize: "vertical",
boxSizing: "border-box",
},
twoCol: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "12px",
},
subCard: {
background: "#101010",
border: "1px solid #262626",
borderRadius: "18px",
padding: "16px",
marginBottom: "12px",
},
helperText: {
margin: "4px 0 12px",
color: "#9ca3af",
fontSize: "13px",
lineHeight: 1.6,
},
checkboxRow: {
display: "flex",
alignItems: "center",
gap: "10px",
color: "#e5e7eb",
margin: "4px 0 12px",
},
secondaryButton: {
background: "#1f2937",
color: "#e5e7eb",
border: "1px solid #374151",
borderRadius: "12px",
padding: "10px 14px",
fontWeight: 700,
cursor: "pointer",
},
moveRow: {
display: "flex",
justifyContent: "space-between",
alignItems: "center",
padding: "12px 0",
borderBottom: "1px solid #232323",
},
moveLabel: {
textTransform: "capitalize",
color: "#e5e7eb",
fontWeight: 600,
},
moveButtons: {
display: "flex",
gap: "8px",
},
smallButton: {
background: "#111827",
color: "#e5e7eb",
border: "1px solid #374151",
borderRadius: "10px",
padding: "8px 10px",
cursor: "pointer",
},
actionRow: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "12px",
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
secondaryPrimaryButton: {
width: "100%",
padding: "15px 18px",
borderRadius: "18px",
border: "1px solid #4b5563",
background: "#111827",
color: "#f3f4f6",
fontSize: "15px",
fontWeight: 700,
cursor: "pointer",
},
message: {
marginTop: "16px",
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.6,
},
previewHeader: {
marginBottom: "14px",
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "20px",
},
previewText: {
color: "#9ca3af",
fontSize: "14px",
lineHeight: 1.7,
marginTop: "8px",
},
resumePaper: {
background: "#ffffff",
minHeight: "820px",
maxHeight: "calc(100vh - 220px)",
overflowY: "auto",
padding: "32px",
borderRadius: "16px",
color: "#0f172a",
boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
},
resumeHeader: {
textAlign: "center",
marginBottom: "24px",
},
resumeName: {
margin: 0,
fontSize: "28px",
color: "#020617",
},
resumeContact: {
margin: "8px 0 0",
fontSize: "14px",
color: "#334155",
},
resumeSection: {
marginBottom: "18px",
},
resumeSectionTitle: {
textAlign: "center",
fontSize: "15px",
margin: "0 0 8px",
textTransform: "uppercase",
color: "#0f172a",
},
resumeText: {
fontSize: "14px",
lineHeight: 1.55,
margin: 0,
color: "#0f172a",
},
resumeStrong: {
margin: 0,
fontSize: "14px",
fontWeight: 900,
color: "#000000",
},
resumeRole: {
margin: "4px 0 8px",
fontSize: "14px",
fontWeight: 700,
color: "#0f172a",
},
resumeDate: {
margin: 0,
fontSize: "13px",
color: "#475569",
whiteSpace: "nowrap",
},
resumeBlock: {
marginBottom: "12px",
},
resumeTopLine: {
display: "flex",
justifyContent: "space-between",
gap: "12px",
alignItems: "baseline",
marginBottom: "4px",
},
resumeBullet: {
fontSize: "14px",
lineHeight: 1.5,
margin: "0 0 4px",
color: "#0f172a",
},
skillsGrid: {
display: "grid",
gap: "8px 18px",
},
skillItem: {
margin: 0,
fontSize: "14px",
color: "#0f172a",
},
};
