"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

type AnalysisResult = {
topSkills: string[];
softSkills: string[];
toolsAndSystems: string[];
certifications: string[];
education: string[];
qualifications: string[];
responsibilities: string[];
keywords: string[];
resumeFocus: string[];
coverLetterFocus: string[];
importantDetails: string[];
possibleRedFlags: string[];
};

const STOP_WORDS = new Set([
"the","and","for","with","you","your","will","are","our","from","that","this","have","has","had","was","were","but","not","all","any","can","may","who","what","when","where","why","how","job","role","position","work","working","team","must","required","preferred","should","their","they","them","his","her","she","him","about","into","out","while","than","then","also","other","such","each","per","etc","able","ability","including","include","includes","make","making","more","less","well","good","high","strong","new","use","used","using","through","across","within","both","daily","ensure","support","provide","maintain","help","related","based","under","over","after","before","years","year","month","months","day","days","one","two","three","four","five","six","seven","eight","nine","ten",
]);

const SKILL_LIBRARY = [
"customer service",
"communication",
"written communication",
"verbal communication",
"data entry",
"scheduling",
"calendar management",
"documentation",
"organization",
"time management",
"problem solving",
"critical thinking",
"attention to detail",
"teamwork",
"leadership",
"multitasking",
"inventory control",
"order picking",
"packing",
"shipping",
"receiving",
"forklift",
"quality control",
"patient care",
"vital signs",
"charting",
"case management",
"sales",
"cold calling",
"account management",
"bookkeeping",
"accounts payable",
"accounts receivable",
"payroll",
"cash handling",
"de-escalation",
"troubleshooting",
"technical support",
"networking",
"project management",
"training",
"coaching",
"outreach",
"community engagement",
"bilingual",
"translation",
"interpreting",
"driving",
"route planning",
"dispatch",
"compliance",
"reporting",
"filing",
"recordkeeping",
"research",
"editing",
"writing",
"proofreading",
"social media",
"marketing",
"recruiting",
"sourcing",
"screening",
"interviewing",
];

const SOFTWARE_LIBRARY = [
"excel",
"microsoft excel",
"word",
"microsoft word",
"powerpoint",
"outlook",
"google docs",
"google sheets",
"quickbooks",
"salesforce",
"hubspot",
"adp",
"sap",
"oracle",
"workday",
"slack",
"zoom",
"teams",
"microsoft teams",
"epic",
"cerner",
"emr",
"ehr",
"ats",
"linkedin recruiter",
"indeed",
"canva",
"photoshop",
"autocad",
"jira",
"servicenow",
"zendesk",
];

const CERT_LIBRARY = [
"cna",
"bls",
"cpr",
"rn",
"lpn",
"medical assistant certification",
"cdl",
"forklift certification",
"phlebotomy",
"osha",
"servsafe",
"pmp",
"a+",
"network+",
"security+",
"licensed",
"license",
"certification",
"certificate",
];

const EDUCATION_LIBRARY = [
"high school diploma",
"ged",
"associate degree",
"bachelor",
"bachelor's degree",
"masters",
"master's degree",
"degree",
"college",
];

function normalizeText(value: string) {
return value
.replace(/\u2022/g, "\n• ")
.replace(/\r/g, "")
.trim();
}

function uniqueClean(items: string[]) {
const seen = new Set<string>();
const result: string[] = [];

for (const item of items.map((x) => x.trim()).filter(Boolean)) {
const key = item.toLowerCase();
if (!seen.has(key)) {
seen.add(key);
result.push(item);
}
}

return result;
}

function sentenceCase(value: string) {
if (!value) return value;
return value.charAt(0).toUpperCase() + value.slice(1);
}

function extractMatchingTerms(text: string, library: string[]) {
const lower = text.toLowerCase();
return uniqueClean(
library.filter((term) => {
const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
return new RegExp(`\\b${safe}\\b`, "i").test(lower);
}).map(sentenceCase)
);
}

function extractResponsibilities(lines: string[]) {
const hits = lines.filter((line) => {
const l = line.toLowerCase();
return (
l.startsWith("•") ||
l.startsWith("-") ||
l.includes("responsib") ||
l.includes("duties") ||
l.includes("you will") ||
l.includes("will be responsible") ||
l.includes("include:")
);
});

const cleaned = hits
.map((line) => line.replace(/^[-•]\s*/, "").trim())
.filter((line) => line.length > 20);

return uniqueClean(cleaned).slice(0, 10);
}

function extractQualifications(lines: string[]) {
const hits = lines.filter((line) => {
const l = line.toLowerCase();
return (
l.includes("qualification") ||
l.includes("requirements") ||
l.includes("required") ||
l.includes("preferred") ||
l.includes("experience in") ||
l.includes("experience with") ||
/\b\d+\+?\s+years?\b/i.test(l)
);
});

return uniqueClean(
hits
.map((line) => line.replace(/^[-•]\s*/, "").trim())
.filter((line) => line.length > 12)
).slice(0, 12);
}

function extractSalaryAndSchedule(text: string) {
const details: string[] = [];
const lower = text.toLowerCase();

const salaryMatches = text.match(
/(\$?\d{2,3}(?:,\d{3})?(?:\.\d{2})?\s?(?:-|to)\s?\$?\d{2,3}(?:,\d{3})?(?:\.\d{2})?(?:\s?(?:per hour|hourly|annually|year|yr))?|\$\d{2,3}(?:,\d{3})?(?:\.\d{2})?\s?(?:per hour|hourly|annually|year|yr))/gi
);
if (salaryMatches) {
details.push(...salaryMatches.map((x) => `Pay mentioned: ${x}`));
}

if (lower.includes("full-time")) details.push("Schedule mentioned: Full-time");
if (lower.includes("part-time")) details.push("Schedule mentioned: Part-time");
if (lower.includes("weekend")) details.push("Schedule mention: Weekend availability");
if (lower.includes("evening")) details.push("Schedule mention: Evening availability");
if (lower.includes("night shift") || lower.includes("overnight"))
details.push("Schedule mention: Overnight / night shift");
if (lower.includes("hybrid")) details.push("Work arrangement: Hybrid");
if (lower.includes("remote")) details.push("Work arrangement: Remote");
if (lower.includes("on-site") || lower.includes("onsite"))
details.push("Work arrangement: On-site");

return uniqueClean(details);
}

function extractRedFlags(text: string) {
const lower = text.toLowerCase();
const flags: string[] = [];

if (lower.includes("must lift") || lower.includes("lift up to")) {
flags.push("Physical demand mentioned");
}
if (lower.includes("background check")) {
flags.push("Background check required");
}
if (lower.includes("drug test")) {
flags.push("Drug test required");
}
if (lower.includes("weekends") || lower.includes("weekend")) {
flags.push("Weekend availability may be required");
}
if (lower.includes("overtime")) {
flags.push("Overtime may be required");
}
if (lower.includes("valid driver's license") || lower.includes("valid driver’s license")) {
flags.push("Valid driver's license required");
}
if (lower.includes("travel")) {
flags.push("Travel may be required");
}
if (lower.includes("bilingual preferred")) {
flags.push("Bilingual preferred");
}

return uniqueClean(flags);
}

function extractImportantKeywords(text: string) {
const tokens = text
.toLowerCase()
.replace(/[^a-z0-9\s/+.-]/g, " ")
.split(/\s+/)
.filter((token) => token.length > 2 && !STOP_WORDS.has(token));

const counts = new Map<string, number>();
for (const token of tokens) {
counts.set(token, (counts.get(token) || 0) + 1);
}

const sorted = [...counts.entries()]
.filter(([word, count]) => count >= 2 && !/^\d+$/.test(word))
.sort((a, b) => b[1] - a[1])
.slice(0, 15)
.map(([word]) => sentenceCase(word));

return uniqueClean(sorted);
}

function buildResumeFocus(result: AnalysisResult) {
const bullets: string[] = [];

if (result.topSkills.length) {
bullets.push(`Mirror these real skills in the resume if they honestly match: ${result.topSkills.slice(0, 6).join(", ")}.`);
}
if (result.toolsAndSystems.length) {
bullets.push(`Mention tools or systems you actually used, especially: ${result.toolsAndSystems.slice(0, 5).join(", ")}.`);
}
if (result.qualifications.some((q) => /years?/i.test(q))) {
bullets.push("Call out your years of experience clearly near the top of the resume or within recent roles.");
}
if (result.responsibilities.length) {
bullets.push("Show similar responsibilities using measurable bullet points from your past jobs.");
}
if (result.certifications.length || result.education.length) {
bullets.push("Place required education, licenses, or certifications where they are easy to find.");
}

return uniqueClean(bullets).slice(0, 6);
}

function buildCoverLetterFocus(result: AnalysisResult) {
const bullets: string[] = [];

if (result.topSkills.length) {
bullets.push(`Connect your background to the role using 2 or 3 key skills such as ${result.topSkills.slice(0, 3).join(", ")}.`);
}
if (result.softSkills.length) {
bullets.push(`Reinforce relevant soft skills like ${result.softSkills.slice(0, 3).join(", ")} with a short example.`);
}
if (result.responsibilities.length) {
bullets.push("Mention that you understand the role’s day-to-day responsibilities and why they fit your experience.");
}
if (result.importantDetails.some((d) => d.toLowerCase().includes("remote") || d.toLowerCase().includes("hybrid"))) {
bullets.push("Acknowledge the work arrangement and explain why it suits your work style if true.");
}
if (result.certifications.length) {
bullets.push("Mention the certification or license that best matches the job if you already have it.");
}

return uniqueClean(bullets).slice(0, 6);
}

function analyzeJobDescription(text: string): AnalysisResult {
const normalized = normalizeText(text);
const lines = normalized.split("\n").map((line) => line.trim()).filter(Boolean);

const topSkills = extractMatchingTerms(normalized, SKILL_LIBRARY);
const toolsAndSystems = extractMatchingTerms(normalized, SOFTWARE_LIBRARY);
const certifications = extractMatchingTerms(normalized, CERT_LIBRARY);
const education = extractMatchingTerms(normalized, EDUCATION_LIBRARY);

const softSkills = uniqueClean(
[
...extractMatchingTerms(normalized, [
"communication",
"teamwork",
"leadership",
"time management",
"problem solving",
"attention to detail",
"organization",
"multitasking",
"customer service",
"critical thinking",
]),
]
);

const responsibilities = extractResponsibilities(lines);
const qualifications = extractQualifications(lines);
const keywords = extractImportantKeywords(normalized);
const importantDetails = extractSalaryAndSchedule(normalized);
const possibleRedFlags = extractRedFlags(normalized);

const base: AnalysisResult = {
topSkills,
softSkills,
toolsAndSystems,
certifications,
education,
qualifications,
responsibilities,
keywords,
resumeFocus: [],
coverLetterFocus: [],
importantDetails,
possibleRedFlags,
};

return {
...base,
resumeFocus: buildResumeFocus(base),
coverLetterFocus: buildCoverLetterFocus(base),
};
}

export default function JobDescriptionAnalyzerPage() {
const [jobTitle, setJobTitle] = useState("");
const [jobDescription, setJobDescription] = useState("");
const [analyzed, setAnalyzed] = useState(false);
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
tool_name: "job_description_analyzer",
page_name: "/career-toolkit/job-description-analyzer",
});

if (activityError) {
console.error("Job description analyzer tracking error:", activityError);
}
}

loadUserAndTrack();
}, []);

const result = useMemo(() => {
if (!jobDescription.trim()) {
return null;
}
return analyzeJobDescription(jobDescription);
}, [jobDescription]);

async function handleAnalyze() {
setAnalyzed(true);

if (!userId) return;

const { error: activityError } = await supabase
.from("user_activity")
.insert({
user_id: userId,
full_name: null,
email: null,
referral_code: referralCode,
event_type: "tool_completed",
tool_name: "job_description_analyzer",
page_name: "/career-toolkit/job-description-analyzer",
});

if (activityError) {
console.error("Job description analyze tracking error:", activityError);
}
}

function handlePrint() {
window.print();
}

function handleSaveText() {
if (!result) return;

const content = `
JOB DESCRIPTION ANALYZER
${jobTitle ? `Job Title: ${jobTitle}` : ""}

TOP SKILLS
${result.topSkills.join("\n") || "None detected"}

SOFT SKILLS
${result.softSkills.join("\n") || "None detected"}

TOOLS AND SYSTEMS
${result.toolsAndSystems.join("\n") || "None detected"}

CERTIFICATIONS / LICENSES
${result.certifications.join("\n") || "None detected"}

EDUCATION
${result.education.join("\n") || "None detected"}

KEY QUALIFICATIONS
${result.qualifications.join("\n") || "None detected"}

RESPONSIBILITIES
${result.responsibilities.join("\n") || "None detected"}

IMPORTANT KEYWORDS
${result.keywords.join("\n") || "None detected"}

WHAT TO HIGHLIGHT IN THE RESUME
${result.resumeFocus.join("\n") || "None detected"}

WHAT TO MENTION IN THE COVER LETTER
${result.coverLetterFocus.join("\n") || "None detected"}

IMPORTANT DETAILS
${result.importantDetails.join("\n") || "None detected"}

POSSIBLE RED FLAGS / NOTES
${result.possibleRedFlags.join("\n") || "None detected"}

IMPORTANT:
Only include skills, qualifications, and keywords that honestly match your real experience.
`.trim();

const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "job-description-analysis.txt";
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
URL.revokeObjectURL(url);
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
padding: 0 !important;
margin: 0 !important;
}
}
`}</style>

<div style={styles.shell}>
<section style={styles.heroCard}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>Job Description Analyzer</h1>
<p style={styles.subtitle}>
Paste a job description and extract the main skills, qualifications, systems, keywords,
responsibilities, and the best information to reflect in a resume and cover letter.
</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
<button type="button" onClick={handleSaveText} style={styles.actionButton}>
Save Analysis
</button>
<button type="button" onClick={handlePrint} style={styles.actionButton}>
Print / Save PDF
</button>
</div>
</section>

<div style={styles.noticeBox}>
Only include skills, qualifications, and keywords that honestly match your real experience.
This tool should help you tailor, not exaggerate.
</div>

<div style={styles.layout}>
<section style={styles.formCard}>
<p style={styles.sectionKicker}>Paste Job Description</p>
<h2 style={styles.sectionTitle}>Analyze the posting</h2>

<div style={styles.fieldWrap}>
<label style={styles.label}>Job Title (optional)</label>
<input
value={jobTitle}
onChange={(e) => setJobTitle(e.target.value)}
placeholder="Example: Medical Assistant, Dispatcher, Customer Service Rep"
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Full Job Description</label>
<textarea
value={jobDescription}
onChange={(e) => setJobDescription(e.target.value)}
placeholder="Paste the full job description here."
style={styles.textarea}
/>
</div>

<button type="button" onClick={handleAnalyze} style={styles.primaryButton}>
Analyze Job Description
</button>
</section>

<section className="print-wrap" style={styles.resultsCol}>
<div style={styles.previewPaper}>
<p style={styles.previewKicker}>Live Analysis</p>
<h2 style={styles.previewTitle}>
{jobTitle || "Job Description Analysis"}
</h2>

{!result || !analyzed ? (
<p style={styles.emptyText}>
Paste a job description and click Analyze Job Description.
</p>
) : (
<div style={styles.resultsGrid}>
<ResultSection title="Top Skills to Include" items={result.topSkills} />
<ResultSection title="Soft Skills" items={result.softSkills} />
<ResultSection title="Tools / Systems" items={result.toolsAndSystems} />
<ResultSection title="Certifications / Licenses" items={result.certifications} />
<ResultSection title="Education Mentioned" items={result.education} />
<ResultSection title="Key Qualifications" items={result.qualifications} />
<ResultSection title="Main Responsibilities" items={result.responsibilities} />
<ResultSection title="Important Keywords" items={result.keywords} />
<ResultSection title="What to Highlight in the Resume" items={result.resumeFocus} />
<ResultSection title="What to Mention in the Cover Letter" items={result.coverLetterFocus} />
<ResultSection title="Important Details" items={result.importantDetails} />
<ResultSection title="Possible Red Flags / Notes" items={result.possibleRedFlags} />
</div>
)}
</div>
</section>
</div>
</div>
</main>
);
}

function ResultSection({ title, items }: { title: string; items: string[] }) {
return (
<div style={styles.resultCard}>
<p style={styles.resultTitle}>{title}</p>
{items.length ? (
<ul style={styles.resultList}>
{items.map((item) => (
<li key={`${title}-${item}`} style={styles.resultItem}>
{item}
</li>
))}
</ul>
) : (
<p style={styles.resultEmpty}>Nothing clear detected yet.</p>
)}
</div>
);
}

const styles: Record<string, React.CSSProperties> = {
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
maxWidth: "980px",
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
actionButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: "15px 18px",
borderRadius: "18px",
border: "1px solid #3a3a3a",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
cursor: "pointer",
},
noticeBox: {
background: "rgba(255,255,255,0.04)",
border: "1px solid rgba(255,255,255,0.08)",
borderRadius: "18px",
padding: "14px 16px",
color: "#d4d4d8",
fontSize: "14px",
lineHeight: 1.7,
},
layout: {
display: "grid",
gridTemplateColumns: "0.9fr 1.1fr",
gap: "24px",
alignItems: "start",
},
formCard: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px",
},
resultsCol: {
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
marginBottom: "14px",
},
label: {
display: "block",
marginBottom: "8px",
color: "#c9c9c9",
fontSize: "13px",
fontWeight: 500,
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
},
textarea: {
width: "100%",
minHeight: "360px",
padding: "14px 16px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "15px",
resize: "vertical",
boxSizing: "border-box",
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
previewPaper: {
background: "#fff",
color: "#111827",
borderRadius: "18px",
minHeight: "760px",
padding: "34px 36px",
boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
},
previewKicker: {
margin: "0 0 8px",
color: "#6b7280",
fontSize: "12px",
letterSpacing: "0.14em",
textTransform: "uppercase",
},
previewTitle: {
margin: "0 0 18px",
fontSize: "30px",
fontWeight: 700,
color: "#111827",
},
emptyText: {
margin: 0,
color: "#4b5563",
fontSize: "15px",
lineHeight: 1.7,
},
resultsGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "14px",
},
resultCard: {
border: "1px solid #d1d5db",
borderRadius: "16px",
padding: "14px",
background: "#ffffff",
},
resultTitle: {
margin: "0 0 10px",
color: "#111827",
fontSize: "14px",
fontWeight: 700,
},
resultList: {
margin: 0,
paddingLeft: "18px",
},
resultItem: {
marginBottom: "6px",
color: "#1f2937",
fontSize: "14px",
lineHeight: 1.6,
},
resultEmpty: {
margin: 0,
color: "#6b7280",
fontSize: "14px",
lineHeight: 1.6,
},
};
