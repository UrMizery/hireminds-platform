"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

type MatchResult = {
matchScore: number;
matchedSkills: string[];
missingSkills: string[];
matchedTools: string[];
missingTools: string[];
matchedCertifications: string[];
missingCertifications: string[];
matchedKeywords: string[];
missingKeywords: string[];
resumeStrengths: string[];
resumeGaps: string[];
resumeSuggestions: string[];
coverLetterSuggestions: string[];
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

function normalizeText(value: string) {
return value.replace(/\u2022/g, "\n• ").replace(/\r/g, "").trim();
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

return uniqueClean(
[...counts.entries()]
.filter(([word, count]) => count >= 2 && !/^\d+$/.test(word))
.sort((a, b) => b[1] - a[1])
.slice(0, 20)
.map(([word]) => sentenceCase(word))
);
}

function getIntersection(a: string[], b: string[]) {
const bSet = new Set(b.map((x) => x.toLowerCase()));
return a.filter((item) => bSet.has(item.toLowerCase()));
}

function getDifference(a: string[], b: string[]) {
const bSet = new Set(b.map((x) => x.toLowerCase()));
return a.filter((item) => !bSet.has(item.toLowerCase()));
}

function buildMatchResult(jobDescription: string, resumeText: string): MatchResult {
const normalizedJob = normalizeText(jobDescription);
const normalizedResume = normalizeText(resumeText);

const jobSkills = extractMatchingTerms(normalizedJob, SKILL_LIBRARY);
const resumeSkills = extractMatchingTerms(normalizedResume, SKILL_LIBRARY);

const jobTools = extractMatchingTerms(normalizedJob, SOFTWARE_LIBRARY);
const resumeTools = extractMatchingTerms(normalizedResume, SOFTWARE_LIBRARY);

const jobCerts = extractMatchingTerms(normalizedJob, CERT_LIBRARY);
const resumeCerts = extractMatchingTerms(normalizedResume, CERT_LIBRARY);

const jobKeywords = extractImportantKeywords(normalizedJob);
const resumeKeywords = extractImportantKeywords(normalizedResume);

const matchedSkills = getIntersection(jobSkills, resumeSkills);
const missingSkills = getDifference(jobSkills, resumeSkills);

const matchedTools = getIntersection(jobTools, resumeTools);
const missingTools = getDifference(jobTools, resumeTools);

const matchedCertifications = getIntersection(jobCerts, resumeCerts);
const missingCertifications = getDifference(jobCerts, resumeCerts);

const matchedKeywords = getIntersection(jobKeywords, resumeKeywords);
const missingKeywords = getDifference(jobKeywords, resumeKeywords).slice(0, 12);

const totalWanted =
jobSkills.length +
jobTools.length +
jobCerts.length +
Math.min(jobKeywords.length, 12);

const totalMatched =
matchedSkills.length +
matchedTools.length +
matchedCertifications.length +
Math.min(matchedKeywords.length, 12);

const rawScore = totalWanted > 0 ? Math.round((totalMatched / totalWanted) * 100) : 0;
const matchScore = Math.max(8, Math.min(rawScore, 98));

const resumeStrengths = uniqueClean([
matchedSkills.length
? `Your resume already reflects matching skills such as ${matchedSkills.slice(0, 5).join(", ")}.`
: "",
matchedTools.length
? `You already mention relevant tools or systems like ${matchedTools.slice(0, 4).join(", ")}.`
: "",
matchedCertifications.length
? `You appear to match certification or license language such as ${matchedCertifications.slice(0, 3).join(", ")}.`
: "",
matchedKeywords.length
? `Your resume already includes important keywords from the posting.`
: "",
]).filter(Boolean);

const resumeGaps = uniqueClean([
missingSkills.length
? `Important skills missing from the resume text include ${missingSkills.slice(0, 5).join(", ")}.`
: "",
missingTools.length
? `Relevant tools or systems not clearly shown include ${missingTools.slice(0, 4).join(", ")}.`
: "",
missingCertifications.length
? `Certification or license terms not clearly reflected include ${missingCertifications.slice(0, 4).join(", ")}.`
: "",
missingKeywords.length
? `Several job-description keywords are not appearing in the resume text.`
: "",
]).filter(Boolean);

const resumeSuggestions = uniqueClean([
missingSkills.length
? `Add real experience tied to these skills if they honestly apply: ${missingSkills.slice(0, 5).join(", ")}.`
: "",
missingTools.length
? `Mention specific systems or software you actually used, especially ${missingTools.slice(0, 4).join(", ")}.`
: "",
missingKeywords.length
? `Mirror job-description wording more closely where truthful, especially for top keywords and task language.`
: "",
`Use measurable bullet points that show similar duties, results, and responsibilities.`,
`Do not add anything that is not true or cannot be supported in an interview.`,
]).filter(Boolean);

const coverLetterSuggestions = uniqueClean([
matchedSkills.length
? `Lead with your strongest overlap, such as ${matchedSkills.slice(0, 3).join(", ")}.`
: "",
missingSkills.length
? `Address how your related experience connects to missing areas like ${missingSkills.slice(0, 3).join(", ")} if applicable.`
: "",
matchedTools.length
? `Mention your experience with tools or systems like ${matchedTools.slice(0, 3).join(", ")}.`
: "",
`Explain why the role fits your background and interest in a direct, specific way.`,
]).filter(Boolean);

return {
matchScore,
matchedSkills,
missingSkills,
matchedTools,
missingTools,
matchedCertifications,
missingCertifications,
matchedKeywords,
missingKeywords,
resumeStrengths,
resumeGaps,
resumeSuggestions,
coverLetterSuggestions,
};
}

export default function ResumeMatchAnalyzerPage() {
const [jobTitle, setJobTitle] = useState("");
const [jobDescription, setJobDescription] = useState("");
const [resumeText, setResumeText] = useState("");
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
tool_name: "resume_match_analyzer",
page_name: "/career-toolkit/resume-match-analyzer",
});

if (activityError) {
console.error("Resume match analyzer tracking error:", activityError);
}
}

loadUserAndTrack();
}, []);

const result = useMemo(() => {
if (!jobDescription.trim() || !resumeText.trim()) return null;
return buildMatchResult(jobDescription, resumeText);
}, [jobDescription, resumeText]);

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
tool_name: "resume_match_analyzer",
page_name: "/career-toolkit/resume-match-analyzer",
});

if (activityError) {
console.error("Resume match analyze tracking error:", activityError);
}
}

function handlePrint() {
window.print();
}

function handleSaveText() {
if (!result) return;

const content = `
RESUME MATCH ANALYZER
${jobTitle ? `Job Title: ${jobTitle}` : ""}

MATCH SCORE
${result.matchScore}%

MATCHED SKILLS
${result.matchedSkills.join("\n") || "None detected"}

MISSING SKILLS
${result.missingSkills.join("\n") || "None detected"}

MATCHED TOOLS / SYSTEMS
${result.matchedTools.join("\n") || "None detected"}

MISSING TOOLS / SYSTEMS
${result.missingTools.join("\n") || "None detected"}

MATCHED CERTIFICATIONS
${result.matchedCertifications.join("\n") || "None detected"}

MISSING CERTIFICATIONS
${result.missingCertifications.join("\n") || "None detected"}

MATCHED KEYWORDS
${result.matchedKeywords.join("\n") || "None detected"}

MISSING KEYWORDS
${result.missingKeywords.join("\n") || "None detected"}

RESUME STRENGTHS
${result.resumeStrengths.join("\n") || "None detected"}

RESUME GAPS
${result.resumeGaps.join("\n") || "None detected"}

RESUME SUGGESTIONS
${result.resumeSuggestions.join("\n") || "None detected"}

COVER LETTER SUGGESTIONS
${result.coverLetterSuggestions.join("\n") || "None detected"}

IMPORTANT:
Only add skills, keywords, tools, and qualifications that honestly match your real experience.
`.trim();

const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "resume-match-analysis.txt";
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
<h1 style={styles.title}>Resume Match Analyzer</h1>
<p style={styles.subtitle}>
Paste the job description and your current resume text to see overlap, gaps,
keyword matches, and what to strengthen before applying.
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
This tool is meant to help tailor a resume more effectively. Only include skills,
systems, keywords, and qualifications that honestly match your real background.
</div>

<div style={styles.layout}>
<section style={styles.formCard}>
<p style={styles.sectionKicker}>Compare Documents</p>
<h2 style={styles.sectionTitle}>Resume vs job description</h2>

<div style={styles.fieldWrap}>
<label style={styles.label}>Job Title (optional)</label>
<input
value={jobTitle}
onChange={(e) => setJobTitle(e.target.value)}
placeholder="Example: Dispatcher, Customer Service Rep, CNA"
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Paste Job Description</label>
<textarea
value={jobDescription}
onChange={(e) => setJobDescription(e.target.value)}
placeholder="Paste the full job description here."
style={styles.textareaLarge}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Paste Resume Text</label>
<textarea
value={resumeText}
onChange={(e) => setResumeText(e.target.value)}
placeholder="Paste your current resume text here."
style={styles.textareaLarge}
/>
</div>

<button type="button" onClick={handleAnalyze} style={styles.primaryButton}>
Analyze Resume Match
</button>
</section>

<section className="print-wrap" style={styles.resultsCol}>
<div style={styles.previewPaper}>
<p style={styles.previewKicker}>ATS-Style Match Preview</p>
<h2 style={styles.previewTitle}>
{jobTitle || "Resume Match Analysis"}
</h2>

{!result || !analyzed ? (
<p style={styles.emptyText}>
Paste both the job description and resume text, then click Analyze Resume Match.
</p>
) : (
<>
<div style={styles.scoreCard}>
<p style={styles.scoreLabel}>Estimated Match Score</p>
<p style={styles.scoreValue}>{result.matchScore}%</p>
</div>

<div style={styles.resultsGrid}>
<ResultSection title="Matched Skills" items={result.matchedSkills} />
<ResultSection title="Missing Skills" items={result.missingSkills} />
<ResultSection title="Matched Tools / Systems" items={result.matchedTools} />
<ResultSection title="Missing Tools / Systems" items={result.missingTools} />
<ResultSection title="Matched Certifications" items={result.matchedCertifications} />
<ResultSection title="Missing Certifications" items={result.missingCertifications} />
<ResultSection title="Matched Keywords" items={result.matchedKeywords} />
<ResultSection title="Missing Keywords" items={result.missingKeywords} />
<ResultSection title="Resume Strengths" items={result.resumeStrengths} />
<ResultSection title="Resume Gaps" items={result.resumeGaps} />
<ResultSection title="Resume Suggestions" items={result.resumeSuggestions} />
<ResultSection title="Cover Letter Suggestions" items={result.coverLetterSuggestions} />
</div>
</>
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
maxWidth: "1460px",
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
textareaLarge: {
width: "100%",
minHeight: "240px",
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
scoreCard: {
border: "1px solid #d1d5db",
borderRadius: "16px",
padding: "16px",
background: "#f9fafb",
marginBottom: "16px",
},
scoreLabel: {
margin: "0 0 6px",
color: "#374151",
fontSize: "14px",
fontWeight: 700,
},
scoreValue: {
margin: 0,
color: "#111827",
fontSize: "34px",
fontWeight: 700,
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
