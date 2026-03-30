"use client";

import { useMemo, useState, type CSSProperties } from "react";

type OpportunityType =
| "reentry"
| "career-gap"
| "stay-at-home-parent"
| "veteran"
| "no-experience"
| "recent-graduate"
| "training-program"
| "caregiver"
| "career-restart";

export default function NewOpportunitiesResumeGeneratorPage() {
const [pathType, setPathType] = useState<OpportunityType>("career-gap");
const [targetRole, setTargetRole] = useState("");
const [headlineGoal, setHeadlineGoal] = useState("");
const [experienceText, setExperienceText] = useState("");
const [strengthsText, setStrengthsText] = useState("");
const [educationText, setEducationText] = useState("");
const [summaryTone, setSummaryTone] = useState("professional");

const suggestedTitle = useMemo(() => {
const role = targetRole.trim();

if (role) return role;

switch (pathType) {
case "reentry":
return "Workforce Reentry Candidate";
case "stay-at-home-parent":
return "Organized and Dependable Professional";
case "veteran":
return "Mission-Driven Professional";
case "recent-graduate":
return "Entry-Level Candidate";
case "training-program":
return "Training Program Graduate";
case "caregiver":
return "Caregiver with Transferable Skills";
case "career-restart":
return "Career Restart Candidate";
case "no-experience":
return "Emerging Professional";
default:
return "Career-Focused Candidate";
}
}, [pathType, targetRole]);

const summaryHeading = "Professional Summary";

const generatedSummary = useMemo(() => {
const role = targetRole.trim() || "a new opportunity";
const goal = headlineGoal.trim();
const strengths = strengthsText.trim();
const education = educationText.trim();

const ending =
summaryTone === "professional"
? "Brings reliability, adaptability, and a strong willingness to learn."
: summaryTone === "bold"
? "Offers resilience, determination, and a strong drive to contribute and grow."
: "Ready to apply practical strengths and transferable skills in a meaningful role.";

switch (pathType) {
case "reentry":
return `Motivated candidate preparing to reenter the workforce and pursue ${role}. ${goal ? `${goal}. ` : ""}${strengths ? `${strengths}. ` : ""}${ending}`;
case "career-gap":
return `Dependable and adaptable professional returning to the workforce and pursuing ${role}. ${goal ? `${goal}. ` : ""}${strengths ? `${strengths}. ` : ""}${ending}`;
case "stay-at-home-parent":
return `Organized and resilient candidate pursuing ${role} after managing household, caregiving, scheduling, and daily priorities. ${goal ? `${goal}. ` : ""}${strengths ? `${strengths}. ` : ""}${ending}`;
case "veteran":
return `Mission-driven candidate pursuing ${role} with transferable strengths in responsibility, teamwork, discipline, and adaptability. ${goal ? `${goal}. ` : ""}${strengths ? `${strengths}. ` : ""}${ending}`;
case "no-experience":
return `Entry-level candidate pursuing ${role} and ready to apply transferable skills, determination, and a strong work ethic. ${goal ? `${goal}. ` : ""}${strengths ? `${strengths}. ` : ""}${ending}`;
case "recent-graduate":
return `Recent graduate pursuing ${role}${education ? ` with a background in ${education}` : ""}. ${goal ? `${goal}. ` : ""}${strengths ? `${strengths}. ` : ""}${ending}`;
case "training-program":
return `Candidate pursuing ${role}${education ? ` after completing ${education}` : ""}. ${goal ? `${goal}. ` : ""}${strengths ? `${strengths}. ` : ""}${ending}`;
case "caregiver":
return `Compassionate and dependable candidate pursuing ${role} with experience supporting others, managing responsibilities, and maintaining consistency in demanding situations. ${goal ? `${goal}. ` : ""}${strengths ? `${strengths}. ` : ""}${ending}`;
case "career-restart":
return `Determined candidate restarting a professional journey and pursuing ${role}. ${goal ? `${goal}. ` : ""}${strengths ? `${strengths}. ` : ""}${ending}`;
default:
return `Career-focused candidate pursuing ${role}. ${goal ? `${goal}. ` : ""}${strengths ? `${strengths}. ` : ""}${ending}`;
}
}, [pathType, targetRole, headlineGoal, strengthsText, educationText, summaryTone]);

const generatedBullets = useMemo(() => {
const customExperience = experienceText
.split("\n")
.map((item) => item.trim())
.filter(Boolean);

if (customExperience.length > 0) {
return customExperience.map((item) => {
if (pathType === "stay-at-home-parent") {
return `Managed ${item.toLowerCase()} while maintaining organization, consistency, and attention to daily priorities.`;
}
if (pathType === "reentry") {
return `Applied discipline, accountability, and adaptability through ${item.toLowerCase()} while preparing for a successful return to the workforce.`;
}
if (pathType === "veteran") {
return `Demonstrated responsibility, teamwork, and mission focus through ${item.toLowerCase()} in structured and high-accountability environments.`;
}
if (pathType === "recent-graduate" || pathType === "training-program") {
return `Built practical experience through ${item.toLowerCase()}, strengthening readiness for entry-level professional opportunities.`;
}
if (pathType === "caregiver") {
return `Provided dependable support through ${item.toLowerCase()}, demonstrating patience, consistency, and strong interpersonal skills.`;
}
return `Strengthened transferable skills through ${item.toLowerCase()}, demonstrating reliability, initiative, and readiness for new opportunities.`;
});
}

switch (pathType) {
case "reentry":
return [
"Demonstrated accountability, consistency, and readiness while preparing to reenter the workforce.",
"Strengthened communication, time management, and adaptability through personal and professional development efforts.",
"Prepared for employment by building a stronger foundation in responsibility, follow-through, and workplace readiness.",
"Focused on rebuilding career direction with determination, resilience, and a willingness to learn."
];
case "stay-at-home-parent":
return [
"Managed daily schedules, appointments, and competing priorities in a fast-paced home environment.",
"Coordinated routines, planning, and household responsibilities with strong organization and time management.",
"Handled budgeting, logistics, and problem-solving while maintaining consistency and dependability.",
"Built transferable skills in communication, multitasking, and adaptability through ongoing caregiving responsibilities."
];
case "veteran":
return [
"Applied discipline, teamwork, and mission focus in structured, high-responsibility environments.",
"Demonstrated reliability, adaptability, and commitment to completing responsibilities with precision.",
"Transferred leadership, accountability, and communication skills into civilian career readiness.",
"Brings a strong foundation in professionalism, resilience, and continuous improvement."
];
case "no-experience":
return [
"Built transferable strengths in reliability, communication, and willingness to learn.",
"Prepared for workforce entry by developing strong habits in follow-through, responsibility, and consistency.",
"Demonstrated motivation and readiness to contribute in entry-level professional environments.",
"Offers adaptability, a strong work ethic, and an eagerness to grow through hands-on experience."
];
case "recent-graduate":
return [
"Completed coursework, projects, and training milestones while building readiness for professional opportunities.",
"Applied communication, teamwork, and problem-solving skills through academic and practical assignments.",
"Built a foundation in organization, learning agility, and follow-through through structured education.",
"Prepared to contribute in entry-level roles with a strong willingness to learn and grow."
];
case "training-program":
return [
"Completed hands-on training and structured learning aligned with professional readiness.",
"Applied practical instruction, participation, and follow-through in a program-based environment.",
"Built confidence in transferable skills through guided learning and performance expectations.",
"Prepared to enter the workforce with determination, reliability, and job-focused training."
];
case "caregiver":
return [
"Provided dependable support while managing routines, responsibilities, and changing daily needs.",
"Demonstrated patience, empathy, communication, and consistency in caregiving-focused responsibilities.",
"Balanced multiple priorities while maintaining a supportive, organized, and reliable environment.",
"Built transferable skills in observation, responsibility, and service through ongoing care support."
];
case "career-restart":
return [
"Took active steps toward restarting a professional path with focus, determination, and purpose.",
"Strengthened readiness for new opportunities through reflection, preparation, and transferable skill building.",
"Brings resilience, adaptability, and renewed motivation to contribute in a professional setting.",
"Prepared to move forward with stronger direction, accountability, and commitment to growth."
];
default:
return [
"Built transferable strengths through life experience, responsibility, and daily problem-solving.",
"Demonstrated reliability, adaptability, and a willingness to learn in changing environments.",
"Prepared to bring strong interpersonal and organizational skills into a professional role.",
"Offers resilience, determination, and readiness for a meaningful new opportunity."
];
}
}, [experienceText, pathType]);

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>New Opportunities Resume Generator</h1>
<p style={styles.subtitle}>
Created for those rebuilding, restarting, reentering, and stepping boldly into new opportunities. Designed for people turning life experience, resilience, and determination into career-ready momentum.
</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</section>

<div style={styles.layout}>
<section style={styles.formCard}>
<p style={styles.sectionKicker}>Your Starting Point</p>
<h2 style={styles.sectionTitle}>Build stronger resume language</h2>

<div style={styles.fieldWrap}>
<label style={styles.label}>Which best describes you right now?</label>
<select
value={pathType}
onChange={(e) => setPathType(e.target.value as OpportunityType)}
style={styles.input}
>
<option value="reentry">Reentry</option>
<option value="career-gap">Career Gap</option>
<option value="stay-at-home-parent">Stay-at-Home Parent / Homemaker</option>
<option value="veteran">Veteran</option>
<option value="no-experience">Little-to-No Work Experience</option>
<option value="recent-graduate">Recent Graduate</option>
<option value="training-program">Finished Training / Certification</option>
<option value="caregiver">Caregiver</option>
<option value="career-restart">Career Restart</option>
</select>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Target Role</label>
<input
value={targetRole}
onChange={(e) => setTargetRole(e.target.value)}
placeholder="Example: Customer Service Representative"
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Goal / What are you trying to move into?</label>
<input
value={headlineGoal}
onChange={(e) => setHeadlineGoal(e.target.value)}
placeholder="Example: Seeking an entry-level role with growth opportunities"
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Strengths or qualities</label>
<textarea
value={strengthsText}
onChange={(e) => setStrengthsText(e.target.value)}
placeholder="Example: dependable, patient, organized, good with people, quick learner"
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Education / training / program details</label>
<textarea
value={educationText}
onChange={(e) => setEducationText(e.target.value)}
placeholder="Example: completed CNA training, finished workforce program, recent business graduate"
style={styles.textarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>What did you actually do? One item per line</label>
<textarea
value={experienceText}
onChange={(e) => setExperienceText(e.target.value)}
placeholder={"Examples:\nManaged household schedules\nHelped care for a family member\nCompleted training assignments\nVolunteered at community events"}
style={styles.largeTextarea}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Summary tone</label>
<select
value={summaryTone}
onChange={(e) => setSummaryTone(e.target.value)}
style={styles.input}
>
<option value="professional">Professional</option>
<option value="bold">Bold</option>
<option value="entry">Entry-Level</option>
</select>
</div>
</section>

<section style={styles.previewCard}>
<p style={styles.sectionKicker}>Live Preview</p>
<h2 style={styles.sectionTitle}>Resume Preview</h2>

<div style={styles.resumePaper}>
<h3 style={styles.resumeName}>{suggestedTitle}</h3>

<div style={styles.resumeSection}>
<p style={styles.resumeSectionHeading}>{summaryHeading}</p>
<p style={styles.resumeText}>{generatedSummary}</p>
</div>

<div style={styles.resumeSection}>
<p style={styles.resumeSectionHeading}>Suggested Resume Bullet Points</p>
<ul style={styles.bulletList}>
{generatedBullets.map((bullet, index) => (
<li key={index} style={styles.bulletItem}>
{bullet}
</li>
))}
</ul>
</div>

<div style={styles.resumeSection}>
<p style={styles.resumeSectionHeading}>Best Fit Description Focus</p>
<p style={styles.resumeText}>
This version is best for highlighting transferable strengths, resilience,
responsibility, and readiness for a new opportunity.
</p>
</div>
</div>
</section>
</div>
</div>
</main>
);
}

const styles: Record<string, CSSProperties> = {
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
maxWidth: "1360px",
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
maxWidth: "900px",
},
heroButtons: {
display: "flex",
gap: "12px",
marginTop: "18px",
flexWrap: "wrap",
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
minHeight: "90px",
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
largeTextarea: {
width: "100%",
minHeight: "160px",
padding: "14px 16px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "15px",
resize: "vertical",
boxSizing: "border-box",
outline: "none",
whiteSpace: "pre-wrap",
},
linkButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
width: "fit-content",
textDecoration: "none",
padding: "12px 15px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.14)",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
fontSize: "14px",
},
resumePaper: {
background: "#ffffff",
color: "#111827",
borderRadius: "18px",
padding: "28px",
minHeight: "780px",
boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
},
resumeName: {
margin: "0 0 20px",
fontSize: "28px",
fontWeight: 700,
color: "#111827",
},
resumeSection: {
marginBottom: "22px",
},
resumeSectionHeading: {
margin: "0 0 10px",
fontSize: "16px",
fontWeight: 700,
color: "#111827",
textTransform: "uppercase",
letterSpacing: "0.04em",
},
resumeText: {
margin: 0,
fontSize: "15px",
lineHeight: 1.75,
color: "#111827",
whiteSpace: "pre-wrap",
},
bulletList: {
margin: 0,
paddingLeft: "18px",
},
bulletItem: {
marginBottom: "10px",
color: "#111827",
fontSize: "15px",
lineHeight: 1.7,
},
};
