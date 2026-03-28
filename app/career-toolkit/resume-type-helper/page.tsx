"use client";

import { useMemo, useState } from "react";

type ResumeType = "Chronological" | "Functional" | "Combination" | "Hybrid";

export default function ResumeTypeHelperPage() {
const [workHistoryStrength, setWorkHistoryStrength] = useState("");
const [experienceGap, setExperienceGap] = useState("");
const [careerChange, setCareerChange] = useState("");
const [recentEducation, setRecentEducation] = useState("");
const [internVolunteer, setInternVolunteer] = useState("");
const [skillsStrength, setSkillsStrength] = useState("");

const recommendation = useMemo(() => {
const stableWork = workHistoryStrength === "yes";
const hasGap = experienceGap === "yes";
const changingCareers = careerChange === "yes";
const recentSchool = recentEducation === "yes";
const internshipHelp = internVolunteer === "yes";
const strongSkills = skillsStrength === "yes";

let bestFit: ResumeType = "Chronological";
let reason =
"A chronological resume is usually the strongest choice when you have steady work history and want employers to quickly see recent experience.";
let tips: string[] = [
"Lead with your most recent role and work backward.",
"Keep dates clear and easy to scan.",
"Use bullet points that show duties, results, and tools used.",
];

if (changingCareers && strongSkills) {
bestFit = "Combination";
reason =
"A combination resume works well when you want to highlight transferable skills but still show work history. It helps connect past experience to a new direction.";
tips = [
"Start with a strong summary and a focused skills section.",
"Use your work history to support the skills you listed.",
"Match your skills section to the job description where it is truthful.",
];
} else if ((hasGap || !stableWork) && strongSkills && !changingCareers) {
bestFit = "Functional";
reason =
"A functional resume can help place more attention on skills when work history is not the strongest selling point.";
tips = [
"Group experience by skill area instead of relying only on job dates.",
"Keep work history included, even if it is shorter.",
"Use this format carefully, since many employers still prefer chronological structure.",
];
} else if ((recentSchool || internshipHelp) && strongSkills) {
bestFit = "Hybrid";
reason =
"A hybrid resume is helpful when education, internships, volunteer work, or skills deserve stronger placement near the top.";
tips = [
"Place education, internships, and practical experience where they add value quickly.",
"Use a short summary plus skills before work history if it helps your story.",
"This format is especially useful for newer job seekers with relevant training.",
];
}

return { bestFit, reason, tips };
}, [
workHistoryStrength,
experienceGap,
careerChange,
recentEducation,
internVolunteer,
skillsStrength,
]);

const resumeGuide = {
Chronological: {
description:
"Best for candidates with steady experience in the same field or closely related work. This is usually the safest and most employer-friendly format.",
strengths: [
"Easy for employers to review quickly",
"Shows growth and consistency clearly",
"Works especially well when recent jobs are relevant",
],
tricks: [
"Put your strongest and most relevant roles first with measurable bullet points.",
"If a job title sounds too generic, use stronger bullet points to show the real level of your work.",
"Lead each job with results, systems used, and important responsibilities.",
"If you have older unrelated jobs, keep those shorter and simpler.",
"Use this format whenever your recent history supports the role you want.",
],
},
Functional: {
description:
"Best for candidates who need to emphasize skills more than timeline, though it should be used carefully because some employers do not prefer it.",
strengths: [
"Helps draw attention to strengths and transferable abilities",
"Can reduce focus on uneven work history",
"Useful when skills are more important than dates",
],
tricks: [
"Organize sections by skill area such as communication, operations, customer service, or administration.",
"Do not hide work history completely. Keep at least a short work-history section.",
"Use this format only when it clearly helps your story.",
"Make sure your skill claims are backed by real examples you can discuss.",
],
},
Combination: {
description:
"Best for candidates who have relevant transferable skills and still want to show solid work history.",
strengths: [
"Balances skill emphasis with work history",
"Works well for career changers",
"Helps connect past experience to new goals",
],
tricks: [
"Open with a summary that points directly to the target role.",
"Use a skills section that mirrors the role you want, if truthful.",
"Follow your skills with work history that supports those same strengths.",
"Avoid making the top half too crowded. Keep it clean and focused.",
],
},
Hybrid: {
description:
"Best for candidates who want a flexible structure that blends education, internships, volunteer work, skills, and work history.",
strengths: [
"Good for newer candidates or people with fresh training",
"Can highlight education and practical experience together",
"Useful when volunteer or internship experience matters",
],
tricks: [
"Move education, certifications, volunteer work, or internship experience closer to the top when relevant.",
"Use this format if your nontraditional experience genuinely supports the role.",
"Keep section order intentional so employers see your strongest value first.",
"This can work well for entry-level applicants when built cleanly.",
],
},
} as const;

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>Resume Format Guide</h1>
<p style={styles.subtitle}>
Answer a few quick questions to figure out which resume style fits you best,
then review the visual examples, stronger tips, and layout guidance before
you build your resume.
</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</section>

<div style={styles.layout}>
<section style={styles.formCard}>
<p style={styles.sectionKicker}>Quick Resume Guide</p>
<h2 style={styles.sectionTitle}>Which format fits you best?</h2>

<Question
label="Do you have steady recent work history that clearly supports the job you want?"
value={workHistoryStrength}
onChange={setWorkHistoryStrength}
/>

<Question
label="Do you have major work gaps or a work history that feels inconsistent?"
value={experienceGap}
onChange={setExperienceGap}
/>

<Question
label="Are you changing careers or trying to move into a different type of role?"
value={careerChange}
onChange={setCareerChange}
/>

<Question
label="Do you have recent education, training, or certifications that should be highlighted near the top?"
value={recentEducation}
onChange={setRecentEducation}
/>

<Question
label="Do you have internships, volunteer work, externships, or unpaid experience that is relevant to the role?"
value={internVolunteer}
onChange={setInternVolunteer}
/>

<Question
label="Are your transferable skills one of the strongest parts of your background?"
value={skillsStrength}
onChange={setSkillsStrength}
/>
</section>

<aside style={styles.resultsCol}>
<div style={styles.previewPaper}>
<p style={styles.previewKicker}>Recommended Style</p>
<h2 style={styles.previewTitle}>{recommendation.bestFit}</h2>
<p style={styles.previewText}>{recommendation.reason}</p>

<div style={styles.tipBox}>
<p style={styles.tipTitle}>Start here</p>
<ul style={styles.tipList}>
{recommendation.tips.map((tip) => (
<li key={tip} style={styles.tipItem}>
{tip}
</li>
))}
</ul>
</div>
</div>
</aside>
</div>

<section style={styles.section}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Visual Examples</p>
<h2 style={styles.sectionTitle}>See what each resume type looks like</h2>
</div>

<div style={styles.gridTwo}>
<div style={styles.guideCard}>
<h3 style={styles.guideTitle}>Chronological</h3>
<ResumeMockup type="Chronological" />
<p style={styles.guideDescription}>
Best when your work history is the strongest part of your background and
should stay near the top.
</p>
</div>

<div style={styles.guideCard}>
<h3 style={styles.guideTitle}>Functional</h3>
<ResumeMockup type="Functional" />
<p style={styles.guideDescription}>
Best when your skills need more attention first and your work history is
not the main selling point.
</p>
</div>

<div style={styles.guideCard}>
<h3 style={styles.guideTitle}>Combination</h3>
<ResumeMockup type="Combination" />
<p style={styles.guideDescription}>
Best when you want to highlight strong transferable skills and still show
solid work history.
</p>
</div>

<div style={styles.guideCard}>
<h3 style={styles.guideTitle}>Hybrid</h3>
<ResumeMockup type="Hybrid" />
<p style={styles.guideDescription}>
Best when education, certifications, internship, or volunteer experience
needs stronger placement near the top.
</p>
</div>
</div>
</section>

<section style={styles.section}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Format Breakdown</p>
<h2 style={styles.sectionTitle}>Tips and tricks by resume style</h2>
</div>

<div style={styles.gridTwo}>
{(Object.keys(resumeGuide) as ResumeType[]).map((type) => (
<div key={type} style={styles.guideCard}>
<h3 style={styles.guideTitle}>{type}</h3>
<p style={styles.guideDescription}>{resumeGuide[type].description}</p>

<p style={styles.guideSubhead}>Why it works</p>
<ul style={styles.guideList}>
{resumeGuide[type].strengths.map((item) => (
<li key={item} style={styles.guideItem}>
{item}
</li>
))}
</ul>

<p style={styles.guideSubhead}>Tips and tricks</p>
<ul style={styles.guideList}>
{resumeGuide[type].tricks.map((item) => (
<li key={item} style={styles.guideItem}>
{item}
</li>
))}
</ul>
</div>
))}
</div>
</section>
</div>
</main>
);
}

function Question({
label,
value,
onChange,
}: {
label: string;
value: string;
onChange: (value: string) => void;
}) {
return (
<div style={styles.questionWrap}>
<p style={styles.questionLabel}>{label}</p>
<div style={styles.answerRow}>
<button
type="button"
onClick={() => onChange("yes")}
style={{
...styles.answerButton,
...(value === "yes" ? styles.answerButtonActive : {}),
}}
>
Yes
</button>
<button
type="button"
onClick={() => onChange("no")}
style={{
...styles.answerButton,
...(value === "no" ? styles.answerButtonActive : {}),
}}
>
No
</button>
</div>
</div>
);
}

function ResumeMockup({ type }: { type: ResumeType }) {
const blocks =
type === "Chronological"
? ["Header", "Summary", "Skills", "Experience", "Education"]
: type === "Functional"
? ["Header", "Summary", "Skills", "Skill Categories", "Work History"]
: type === "Combination"
? ["Header", "Summary", "Skills", "Experience", "Education"]
: ["Header", "Summary", "Skills", "Education/Certs", "Experience"];

return (
<div style={styles.mockupPaper}>
{blocks.map((block, index) => (
<div
key={`${type}-${block}-${index}`}
style={{
...styles.mockupBlock,
...(block === "Experience" || block === "Work History"
? styles.mockupLongBlock
: {}),
...(block === "Skills" || block === "Skill Categories"
? styles.mockupAccentBlock
: {}),
...(block === "Education/Certs" ? styles.mockupSecondaryBlock : {}),
}}
>
<span style={styles.mockupLabel}>{block}</span>
</div>
))}
</div>
);
}

const styles: Record<string, React.CSSProperties> = {
page: {
minHeight: "100vh",
background: "linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
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
gridTemplateColumns: "1fr 0.9fr",
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
resultsCol: {
position: "sticky",
top: "24px",
},
previewPaper: {
background: "#fff",
color: "#111827",
borderRadius: "18px",
minHeight: "360px",
padding: "34px 36px",
boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
},
section: {
display: "grid",
gap: "16px",
},
sectionHeader: {
display: "grid",
gap: "6px",
},
sectionKicker: {
margin: 0,
color: "#9ca3af",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
sectionTitle: {
margin: 0,
fontSize: "30px",
lineHeight: 1.1,
fontWeight: 700,
color: "#f5f5f5",
},
questionWrap: {
padding: "16px 0",
borderBottom: "1px solid rgba(255,255,255,0.08)",
},
questionLabel: {
margin: "0 0 12px",
color: "#f5f5f5",
fontSize: "15px",
lineHeight: 1.7,
},
answerRow: {
display: "flex",
gap: "10px",
},
answerButton: {
padding: "10px 16px",
borderRadius: "999px",
background: "#101010",
border: "1px solid #2f2f2f",
color: "#f3f4f6",
fontSize: "14px",
fontWeight: 600,
cursor: "pointer",
},
answerButtonActive: {
background: "#d4d4d8",
color: "#09090b",
border: "1px solid #d4d4d8",
},
previewKicker: {
margin: "0 0 8px",
color: "#6b7280",
fontSize: "12px",
letterSpacing: "0.14em",
textTransform: "uppercase",
},
previewTitle: {
margin: "0 0 14px",
fontSize: "34px",
fontWeight: 700,
color: "#111827",
},
previewText: {
margin: "0 0 20px",
fontSize: "17px",
lineHeight: 1.8,
color: "#111827",
},
tipBox: {
border: "1px solid #d1d5db",
borderRadius: "16px",
padding: "16px",
background: "#f9fafb",
},
tipTitle: {
margin: "0 0 10px",
fontSize: "15px",
fontWeight: 700,
color: "#111827",
},
tipList: {
margin: 0,
paddingLeft: "18px",
},
tipItem: {
marginBottom: "8px",
color: "#1f2937",
fontSize: "14px",
lineHeight: 1.65,
},
gridTwo: {
display: "grid",
gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
gap: "18px",
},
guideCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "26px",
padding: "22px",
boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
},
guideTitle: {
margin: "0 0 10px",
fontSize: "24px",
lineHeight: 1.2,
fontWeight: 700,
color: "#f5f5f5",
},
guideDescription: {
margin: "0 0 16px",
color: "#d4d4d8",
fontSize: "15px",
lineHeight: 1.75,
},
guideSubhead: {
margin: "0 0 8px",
color: "#f5f5f5",
fontSize: "14px",
fontWeight: 700,
letterSpacing: "0.02em",
},
guideList: {
margin: "0 0 14px",
paddingLeft: "18px",
},
guideItem: {
marginBottom: "8px",
color: "#d4d4d8",
fontSize: "14px",
lineHeight: 1.7,
},
mockupPaper: {
background: "#ffffff",
borderRadius: "16px",
padding: "14px",
border: "1px solid rgba(255,255,255,0.08)",
marginBottom: "16px",
display: "grid",
gap: "8px",
},
mockupBlock: {
height: "34px",
borderRadius: "10px",
background: "#e5e7eb",
display: "flex",
alignItems: "center",
padding: "0 12px",
},
mockupLongBlock: {
height: "68px",
},
mockupAccentBlock: {
background: "#dbeafe",
},
mockupSecondaryBlock: {
background: "#ede9fe",
},
mockupLabel: {
color: "#111827",
fontSize: "12px",
fontWeight: 700,
letterSpacing: "0.02em",
},
};
