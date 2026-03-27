"use client";

import { useMemo, useState } from "react";

type Choice =
| "helping_people"
| "working_with_computers"
| "organizing_information"
| "talking_to_people"
| "hands_on_work"
| "fast_paced"
| "structured_tasks"
| "detail_oriented"
| "customer_facing"
| "healthcare_interest"
| "office_environment"
| "warehouse_environment"
| "public_service_interest"
| "numbers_and_records"
| "driving"
| "community_outreach"
| "bilingual_languages"
| "hybrid_remote"
| "mechanical_aptitude"
| "cash_handling"
| "writing"
| "office_computers"
| "working_outside"
| "contract_1099"
| "independent_work"
| "team_environment"
| "sales_interest"
| "creative_problem_solving"
| "leadership_interest"
| "teaching_training";

type EducationPreference =
| "quick-start"
| "short-training"
| "certificate-ok"
| "degree-ok";

type SalaryPreference =
| "entry-level"
| "moderate"
| "higher";

type Career = {
id: string;
title: string;
medianPayLabel: string;
salaryRank: number;
educationLevel: EducationPreference;
summary: string;
fitTags: Choice[];
avoidTags?: Choice[];
whatYouNeed: string[];
whyItFits: string[];
};

const careerData: Career[] = [
{
id: "cna",
title: "Certified Nursing Assistant (CNA)",
medianPayLabel: "$39,530 median annual pay",
salaryRank: 1,
educationLevel: "short-training",
summary:
"CNAs support patients with daily care and work closely with healthcare teams.",
fitTags: [
"helping_people",
"hands_on_work",
"fast_paced",
"healthcare_interest",
"structured_tasks",
"team_environment",
],
whatYouNeed: [
"Complete a state-approved CNA training program",
"Pass any required exam or certification process in your state",
"Apply to hospitals, nursing homes, rehab centers, or home care employers",
],
whyItFits: [
"Good match for people who want meaningful hands-on work",
"Strong fit for users interested in healthcare and patient support",
],
},
{
id: "medical-assistant",
title: "Medical Assistant",
medianPayLabel: "$44,200 median annual pay",
salaryRank: 2,
educationLevel: "certificate-ok",
summary:
"Medical assistants support clinics with patient intake, documentation, scheduling, and basic clinical tasks.",
fitTags: [
"helping_people",
"talking_to_people",
"healthcare_interest",
"structured_tasks",
"detail_oriented",
"office_environment",
"office_computers",
],
whatYouNeed: [
"Look into a medical assistant certificate or diploma program",
"Build comfort with scheduling, documentation, and patient interaction",
"Check local employers for required certifications or preferred training",
],
whyItFits: [
"Strong option for people who want healthcare work without going straight into a long degree path",
"Fits users who like both people-facing and organized task-based work",
],
},
{
id: "admin-assistant",
title: "Administrative Assistant",
medianPayLabel: "$47,460 median annual pay",
salaryRank: 2,
educationLevel: "quick-start",
summary:
"Administrative assistants support office operations, scheduling, communication, and organization.",
fitTags: [
"organizing_information",
"talking_to_people",
"structured_tasks",
"detail_oriented",
"office_environment",
"office_computers",
"writing",
],
whatYouNeed: [
"Build strong scheduling, communication, and document handling skills",
"Get comfortable with email, calendars, spreadsheets, and office systems",
"Tailor your resume to support, coordination, and organization tasks",
],
whyItFits: [
"Great fit for people who like structure, order, and office-based work",
"Works well for users who want transferable experience across many industries",
],
},
{
id: "customer-service",
title: "Customer Service Representative",
medianPayLabel: "$20.59 median hourly pay",
salaryRank: 2,
educationLevel: "quick-start",
summary:
"Customer service reps solve problems, answer questions, and support customers across many industries.",
fitTags: [
"talking_to_people",
"customer_facing",
"fast_paced",
"structured_tasks",
"team_environment",
"office_computers",
],
whatYouNeed: [
"Build communication and problem-solving examples on your resume",
"Practice de-escalation and service language for interviews",
"Look for call center, retail support, healthcare support, or office service roles",
],
whyItFits: [
"Good fit for strong communicators who like helping people directly",
"A practical entry point for many users returning to work or changing fields",
],
},
{
id: "stocker-order-filler",
title: "Stocker / Order Filler",
medianPayLabel: "$37,090 median annual pay",
salaryRank: 1,
educationLevel: "quick-start",
summary:
"Stockers and order fillers help move, organize, and prepare inventory in fast-paced environments.",
fitTags: [
"hands_on_work",
"fast_paced",
"warehouse_environment",
"structured_tasks",
"team_environment",
"mechanical_aptitude",
],
whatYouNeed: [
"Highlight reliability, speed, accuracy, and physical work tolerance",
"Learn basic warehouse safety and inventory language",
"Apply to warehouse, retail, grocery, and distribution employers",
],
whyItFits: [
"Strong fit for users who prefer movement and task-based work over desk work",
"Good starting point for logistics and warehouse career growth",
],
},
{
id: "help-desk",
title: "Computer User Support Specialist / Help Desk",
medianPayLabel: "$60,340 median annual pay",
salaryRank: 3,
educationLevel: "certificate-ok",
summary:
"Help desk roles support users with troubleshooting, basic systems issues, and technical communication.",
fitTags: [
"working_with_computers",
"talking_to_people",
"detail_oriented",
"structured_tasks",
"office_environment",
"office_computers",
"hybrid_remote",
"creative_problem_solving",
],
whatYouNeed: [
"Build basic troubleshooting and customer support skills",
"Consider an entry-level IT certificate or support training path",
"Practice explaining technical issues in simple language",
],
whyItFits: [
"Good fit for people who like technology but also want to work with users",
"Strong pathway into broader IT careers over time",
],
},
{
id: "dispatcher",
title: "Public Safety Telecommunicator / Dispatcher",
medianPayLabel: "$50,730 median annual pay",
salaryRank: 3,
educationLevel: "quick-start",
summary:
"Dispatchers manage urgent communication, coordinate response, and stay calm under pressure.",
fitTags: [
"talking_to_people",
"fast_paced",
"structured_tasks",
"detail_oriented",
"public_service_interest",
"office_computers",
],
whatYouNeed: [
"Build strong communication, listening, and multi-tasking examples",
"Check local agency requirements, testing, or certifications",
"Practice staying calm and accurate in high-pressure situations",
],
whyItFits: [
"Great fit for people who can stay composed and organized under pressure",
"Strong option for users interested in public service and communication-heavy work",
],
},
{
id: "bookkeeping-clerk",
title: "Bookkeeping / Accounting Clerk",
medianPayLabel: "$49,210 median annual pay",
salaryRank: 2,
educationLevel: "certificate-ok",
summary:
"Bookkeeping and accounting clerks manage records, transactions, and financial organization.",
fitTags: [
"numbers_and_records",
"detail_oriented",
"structured_tasks",
"organizing_information",
"office_environment",
"office_computers",
"cash_handling",
],
whatYouNeed: [
"Build comfort with spreadsheets, accuracy, and recordkeeping",
"Consider bookkeeping or accounting support training",
"Highlight invoicing, data entry, reconciliation, or office finance experience",
],
whyItFits: [
"Strong fit for users who like accuracy, records, and organized desk work",
"A good path for people who prefer less customer-facing work",
],
},
{
id: "delivery-driver",
title: "Delivery Driver / Route Driver",
medianPayLabel: "$39,950 median annual pay",
salaryRank: 2,
educationLevel: "quick-start",
summary:
"Drivers manage routes, schedules, deliveries, and customer interaction while staying safe on the road.",
fitTags: [
"driving",
"independent_work",
"fast_paced",
"customer_facing",
"contract_1099",
],
whatYouNeed: [
"Keep a clean driving record where possible",
"Check license and insurance requirements for the employer or platform",
"Highlight punctuality, route familiarity, and customer service",
],
whyItFits: [
"Good fit for users who like being on the road more than sitting at a desk",
"Can fit both employee and contract-style work preferences",
],
},
{
id: "community-health-worker",
title: "Community Health Worker / Outreach Worker",
medianPayLabel: "$48,200 median annual pay",
salaryRank: 2,
educationLevel: "certificate-ok",
summary:
"Outreach workers connect communities to services, education, resources, and support.",
fitTags: [
"helping_people",
"community_outreach",
"talking_to_people",
"public_service_interest",
"bilingual_languages",
"writing",
],
whatYouNeed: [
"Build outreach, case support, advocacy, or community service experience",
"Look into local nonprofit, healthcare, or municipal roles",
"Highlight trust-building, communication, and resource coordination",
],
whyItFits: [
"Great fit for people who enjoy community-facing work and relationship building",
"Strong option for bilingual candidates and service-minded users",
],
},
{
id: "sales-rep",
title: "Sales Representative / Account Representative",
medianPayLabel: "$63,050 median annual pay",
salaryRank: 3,
educationLevel: "quick-start",
summary:
"Sales reps build relationships, explain products or services, and drive business growth.",
fitTags: [
"talking_to_people",
"customer_facing",
"sales_interest",
"leadership_interest",
"hybrid_remote",
"independent_work",
],
whatYouNeed: [
"Build confidence in communication, follow-up, and relationship management",
"Highlight client-facing, outreach, recruiting, or service experience",
"Learn how the employer measures goals, quotas, or account growth",
],
whyItFits: [
"Good fit for persuasive communicators who enjoy people and momentum",
"Often offers stronger earning potential than many entry-level roles",
],
},
{
id: "mechanic-helper",
title: "Mechanical Helper / Service Technician Trainee",
medianPayLabel: "$43,000 median annual pay",
salaryRank: 2,
educationLevel: "short-training",
summary:
"Mechanical support roles involve tools, troubleshooting, equipment, and physical problem-solving.",
fitTags: [
"hands_on_work",
"mechanical_aptitude",
"working_outside",
"structured_tasks",
"creative_problem_solving",
],
whatYouNeed: [
"Look into trade school, on-the-job training, or employer-sponsored training",
"Build comfort with tools, equipment safety, and maintenance basics",
"Highlight reliability, hands-on experience, and troubleshooting skills",
],
whyItFits: [
"Strong fit for people who like fixing, maintaining, and working with equipment",
"Good path for users who prefer practical work over desk work",
],
},
{
id: "remote-support-coordinator",
title: "Remote Support Coordinator / Virtual Operations Support",
medianPayLabel: "$48,000 median annual pay",
salaryRank: 2,
educationLevel: "quick-start",
summary:
"Remote support roles often involve scheduling, customer communication, follow-up, and digital coordination.",
fitTags: [
"hybrid_remote",
"office_computers",
"writing",
"organizing_information",
"structured_tasks",
"talking_to_people",
],
whatYouNeed: [
"Build email, scheduling, communication, and virtual office skills",
"Highlight remote tools, calendar support, documentation, and follow-up work",
"Search remote support, coordinator, admin, and client-success roles",
],
whyItFits: [
"Great fit for users who want office-style work with more flexibility",
"Good path for strong communicators who are comfortable online",
],
},
];

const choiceLabels: Record<Choice, string> = {
helping_people: "Helping people",
working_with_computers: "Working with computers",
organizing_information: "Organizing information",
talking_to_people: "Talking to people",
hands_on_work: "Hands-on work",
fast_paced: "Fast-paced environments",
structured_tasks: "Structured tasks",
detail_oriented: "Detail-oriented work",
customer_facing: "Customer-facing work",
healthcare_interest: "Healthcare settings",
office_environment: "Office environment",
warehouse_environment: "Warehouse / logistics",
public_service_interest: "Public service work",
numbers_and_records: "Numbers and records",
driving: "Driving",
community_outreach: "Community work / outreach",
bilingual_languages: "Bilingual / languages",
hybrid_remote: "Hybrid / remote",
mechanical_aptitude: "Mechanical aptitude",
cash_handling: "Cash handling",
writing: "Writing",
office_computers: "Office / computers",
working_outside: "Working outside",
contract_1099: "1099 / contract",
independent_work: "Independent work",
team_environment: "Team environment",
sales_interest: "Sales / persuasion",
creative_problem_solving: "Problem-solving",
leadership_interest: "Leadership interest",
teaching_training: "Teaching / training others",
};

function getEducationScore(
preference: EducationPreference,
careerEducation: EducationPreference
) {
const rank = {
"quick-start": 1,
"short-training": 2,
"certificate-ok": 3,
"degree-ok": 4,
};

return rank[careerEducation] <= rank[preference]
? 2
: rank[careerEducation] - rank[preference] === 1
? 1
: 0;
}

function getSalaryScore(preference: SalaryPreference, salaryRank: number) {
if (preference === "entry-level") return 1;
if (preference === "moderate") return salaryRank >= 2 ? 2 : 1;
if (preference === "higher") return salaryRank >= 3 ? 2 : 0;
return 0;
}

export default function CareerPathGeneratorPage() {
const [selectedChoices, setSelectedChoices] = useState<Choice[]>([]);
const [educationPreference, setEducationPreference] =
useState<EducationPreference>("short-training");
const [salaryPreference, setSalaryPreference] =
useState<SalaryPreference>("moderate");

function toggleChoice(choice: Choice) {
setSelectedChoices((prev) =>
prev.includes(choice) ? prev.filter((item) => item !== choice) : [...prev, choice]
);
}

const matches = useMemo(() => {
return careerData
.map((career) => {
let score = 0;

career.fitTags.forEach((tag) => {
if (selectedChoices.includes(tag)) score += 3;
});

career.avoidTags?.forEach((tag) => {
if (selectedChoices.includes(tag)) score -= 1;
});

score += getEducationScore(educationPreference, career.educationLevel);
score += getSalaryScore(salaryPreference, career.salaryRank);

return { ...career, score };
})
.sort((a, b) => b.score - a.score)
.slice(0, 6);
}, [selectedChoices, educationPreference, salaryPreference]);

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.disclaimerBanner}>
<p style={styles.disclaimerTitle}>Important disclaimer</p>
<p style={styles.disclaimerText}>
This tool is for career exploration only. Salary can vary by state, industry,
employer, schedule, experience, and credentials. HireMinds does not guarantee pay,
job placement, admission into any program, certification, or employment. If a role
suggests training or school, that does not mean completion will guarantee a job.
</p>
</section>

<section style={styles.heroCard}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>Career Path Generator</h1>
<p style={styles.subtitle}>
Choose what fits your interests, work style, and pay goals. Then explore career
paths that may align with what you like and how you prefer to work.
</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</section>

<section style={styles.topChooser}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Choose What Fits You</p>
<h2 style={styles.sectionTitle}>Interests, skills, and work preferences</h2>
</div>

<div style={styles.prefGrid}>
<div style={styles.fieldWrap}>
<label style={styles.label}>How quickly do you want to start?</label>
<select
value={educationPreference}
onChange={(e) =>
setEducationPreference(e.target.value as EducationPreference)
}
style={styles.input}
>
<option value="quick-start">Quick start / little training</option>
<option value="short-training">Short training okay</option>
<option value="certificate-ok">Certificate okay</option>
<option value="degree-ok">Degree path okay</option>
</select>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Pay priority</label>
<select
value={salaryPreference}
onChange={(e) =>
setSalaryPreference(e.target.value as SalaryPreference)
}
style={styles.input}
>
<option value="entry-level">Entry-level okay</option>
<option value="moderate">Moderate pay preferred</option>
<option value="higher">Higher pay preferred</option>
</select>
</div>
</div>

<div style={styles.horizontalChoiceWrap}>
{(Object.keys(choiceLabels) as Choice[]).map((choice) => {
const selected = selectedChoices.includes(choice);
return (
<button
key={choice}
type="button"
onClick={() => toggleChoice(choice)}
style={{
...styles.choiceButton,
...(selected ? styles.choiceButtonActive : {}),
}}
>
{choiceLabels[choice]}
</button>
);
})}
</div>
</section>

<section style={styles.resultsSection}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Paths to Explore</p>
<h2 style={styles.sectionTitle}>Career matches based on your choices</h2>
</div>

<div style={styles.resultList}>
{matches.map((career) => (
<div key={career.id} style={styles.resultCard}>
<div style={styles.resultTop}>
<div>
<h3 style={styles.resultTitle}>{career.title}</h3>
<p style={styles.resultPay}>{career.medianPayLabel}</p>
</div>
<span style={styles.matchTag}>Match</span>
</div>

<p style={styles.resultSummary}>{career.summary}</p>

<div style={styles.resultBlock}>
<p style={styles.blockLabel}>Why this may fit</p>
{career.whyItFits.map((item) => (
<p key={item} style={styles.blockText}>
• {item}
</p>
))}
</div>

<div style={styles.resultBlock}>
<p style={styles.blockLabel}>What you may need next</p>
{career.whatYouNeed.map((item) => (
<p key={item} style={styles.blockText}>
• {item}
</p>
))}
</div>
</div>
))}
</div>
</section>
</div>
</main>
);
}

const styles: Record<string, React.CSSProperties> = {
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
maxWidth: "1380px",
margin: "0 auto",
display: "grid",
gap: "20px",
},
disclaimerBanner: {
background: "rgba(255,255,255,0.04)",
border: "1px solid rgba(255,255,255,0.08)",
borderRadius: "22px",
padding: "18px 20px",
},
disclaimerTitle: {
margin: "0 0 8px",
fontSize: "14px",
fontWeight: 700,
color: "#f5f5f5",
},
disclaimerText: {
margin: 0,
color: "#d4d4d8",
fontSize: "14px",
lineHeight: 1.75,
},
heroCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "28px",
padding: "28px",
boxShadow: "0 24px 70px rgba(0,0,0,0.28)",
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
maxWidth: "920px",
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
topChooser: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "28px",
padding: "24px",
boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
display: "grid",
gap: "18px",
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
prefGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "14px",
},
fieldWrap: {
display: "grid",
gap: "8px",
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
horizontalChoiceWrap: {
display: "flex",
gap: "10px",
flexWrap: "wrap",
alignItems: "center",
},
choiceButton: {
padding: "12px 14px",
borderRadius: "999px",
border: "1px solid rgba(255,255,255,0.12)",
background: "rgba(255,255,255,0.04)",
color: "#f5f5f5",
fontWeight: 700,
fontSize: "14px",
cursor: "pointer",
whiteSpace: "nowrap",
},
choiceButtonActive: {
background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
color: "#09090b",
border: "1px solid #d1d5db",
},
resultsSection: {
display: "grid",
gap: "18px",
},
resultList: {
display: "grid",
gap: "16px",
},
resultCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "22px",
padding: "20px",
display: "grid",
gap: "12px",
boxShadow: "0 22px 60px rgba(0,0,0,0.24)",
},
resultTop: {
display: "flex",
justifyContent: "space-between",
gap: "12px",
alignItems: "flex-start",
},
resultTitle: {
margin: "0 0 4px",
fontSize: "24px",
lineHeight: 1.15,
fontWeight: 700,
color: "#f5f5f5",
},
resultPay: {
margin: 0,
color: "#d4d4d8",
fontSize: "14px",
fontWeight: 600,
},
matchTag: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
whiteSpace: "nowrap",
padding: "8px 10px",
borderRadius: "999px",
background: "rgba(59,130,246,0.12)",
border: "1px solid rgba(59,130,246,0.26)",
color: "#dbeafe",
fontSize: "12px",
fontWeight: 700,
},
resultSummary: {
margin: 0,
color: "#d4d4d8",
fontSize: "15px",
lineHeight: 1.75,
},
resultBlock: {
display: "grid",
gap: "6px",
},
blockLabel: {
margin: 0,
color: "#cbd5e1",
fontSize: "13px",
fontWeight: 700,
},
blockText: {
margin: 0,
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.75,
},
};
