"use client";

import { useMemo, useState } from "react";

type IndustryType =
| "General"
| "Healthcare"
| "Warehouse / Manufacturing"
| "Customer Service"
| "Admin / Clerical"
| "Food Service / Hospitality"
| "Driving / Logistics"
| "Retail"
| "IT / Help Desk";

const questionBank: Record<
IndustryType,
{
questions: {
question: string;
whyItIsAsked: string;
howToAnswer: string;
}[];
}
> = {
General: {
questions: [
{
question: "Tell me about yourself.",
whyItIsAsked: "The employer wants a quick summary of your background and how it connects to the role.",
howToAnswer: "Give a short professional overview, mention relevant experience, and end with why you are interested in this role.",
},
{
question: "Why do you want to work here?",
whyItIsAsked: "They want to know whether you researched the company and whether your interest is genuine.",
howToAnswer: "Mention something specific about the company, the role, or the work environment and connect it to your goals.",
},
{
question: "What are your strengths?",
whyItIsAsked: "The employer wants to understand what value you would bring to the team.",
howToAnswer: "Choose 2 to 3 strengths that directly match the role and give a quick example.",
},
{
question: "Tell me about a challenge you faced and how you handled it.",
whyItIsAsked: "They want to see problem-solving, accountability, and communication skills.",
howToAnswer: "Use a simple situation, explain what happened, what you did, and what the result was.",
},
{
question: "Why should we hire you?",
whyItIsAsked: "The employer wants to hear how you see your fit for the role.",
howToAnswer: "Connect your experience, attitude, and skills to the position and explain the value you bring.",
},
],
},
Healthcare: {
questions: [
{
question: "How do you handle patient confidentiality and sensitive information?",
whyItIsAsked: "They want to know whether you understand privacy, professionalism, and trust.",
howToAnswer: "Explain that you follow policy, protect patient information, and stay professional in all situations.",
},
{
question: "How do you stay calm during stressful situations?",
whyItIsAsked: "Healthcare roles often require calm decision-making under pressure.",
howToAnswer: "Describe how you prioritize, stay focused, communicate clearly, and keep patient care at the center.",
},
{
question: "Tell me about a time you worked with a difficult patient or family member.",
whyItIsAsked: "They want to evaluate empathy, patience, and communication skills.",
howToAnswer: "Show that you stayed respectful, listened carefully, and worked toward a calm solution.",
},
{
question: "How do you make sure tasks are completed accurately?",
whyItIsAsked: "Accuracy matters in healthcare for safety and compliance.",
howToAnswer: "Talk about documentation, attention to detail, following procedures, and double-checking your work.",
},
{
question: "How do you work as part of a care team?",
whyItIsAsked: "Healthcare depends on teamwork and communication.",
howToAnswer: "Highlight communication, reliability, respect for coworkers, and focus on the patient.",
},
],
},
"Warehouse / Manufacturing": {
questions: [
{
question: "How do you make safety a priority on the job?",
whyItIsAsked: "They need to know you can follow safety standards and reduce risk.",
howToAnswer: "Explain how you follow procedures, use equipment properly, and stay aware of your surroundings.",
},
{
question: "How do you keep up in a fast-paced environment?",
whyItIsAsked: "These roles often require speed, consistency, and focus.",
howToAnswer: "Talk about staying organized, maintaining pace, and not sacrificing accuracy.",
},
{
question: "Tell me about your experience with inventory, shipping, or production work.",
whyItIsAsked: "They want to understand your direct hands-on experience.",
howToAnswer: "Share the parts of warehouse or production work you handled and what you were responsible for.",
},
{
question: "What do you do if you notice a problem with equipment or workflow?",
whyItIsAsked: "They want to see whether you report issues quickly and responsibly.",
howToAnswer: "Say that you follow procedure, report the issue, and avoid unsafe shortcuts.",
},
{
question: "How do you stay accurate while meeting productivity goals?",
whyItIsAsked: "They want both productivity and quality.",
howToAnswer: "Explain that you work efficiently but still check labels, counts, and instructions carefully.",
},
],
},
"Customer Service": {
questions: [
{
question: "How do you handle an upset customer?",
whyItIsAsked: "They want to measure patience, professionalism, and de-escalation.",
howToAnswer: "Say that you listen, stay calm, show empathy, and work toward a solution.",
},
{
question: "What does good customer service mean to you?",
whyItIsAsked: "They want to understand your service mindset.",
howToAnswer: "Talk about professionalism, communication, speed, respect, and problem-solving.",
},
{
question: "Tell me about a time you solved a customer problem.",
whyItIsAsked: "They want a real example of service and follow-through.",
howToAnswer: "Use a short example and show the result of your actions.",
},
{
question: "How do you handle multiple customers or tasks at once?",
whyItIsAsked: "Customer service often requires multitasking.",
howToAnswer: "Explain how you prioritize, stay organized, and communicate clearly.",
},
{
question: "How do you stay positive during busy or stressful shifts?",
whyItIsAsked: "They want to know if you can maintain professionalism under pressure.",
howToAnswer: "Show that you stay focused, flexible, and customer-centered.",
},
],
},
"Admin / Clerical": {
questions: [
{
question: "How do you stay organized when handling multiple tasks?",
whyItIsAsked: "Administrative roles often depend on prioritization and organization.",
howToAnswer: "Describe your system for deadlines, communication, and tracking tasks.",
},
{
question: "What office software or systems have you used?",
whyItIsAsked: "They want to know your comfort level with day-to-day office tools.",
howToAnswer: "Mention specific software, systems, and the work you completed using them.",
},
{
question: "How do you handle confidential information?",
whyItIsAsked: "Trust and discretion matter in office settings.",
howToAnswer: "Emphasize professionalism, privacy, and following company policy.",
},
{
question: "Tell me about a time you handled a scheduling or communication issue.",
whyItIsAsked: "They want to see problem-solving and attention to detail.",
howToAnswer: "Give a short example showing how you fixed the issue clearly and efficiently.",
},
{
question: "How do you make sure your work is accurate?",
whyItIsAsked: "Accuracy is essential in clerical work.",
howToAnswer: "Talk about double-checking, proofreading, and staying detail-oriented.",
},
],
},
"Food Service / Hospitality": {
questions: [
{
question: "How do you provide good service during busy shifts?",
whyItIsAsked: "They want to see whether you can stay professional and efficient.",
howToAnswer: "Explain how you stay calm, communicate clearly, and keep guests in mind.",
},
{
question: "How do you handle difficult customers or guests?",
whyItIsAsked: "These roles require patience and quick service recovery.",
howToAnswer: "Show that you stay respectful, listen, and work toward a solution.",
},
{
question: "How do you maintain cleanliness and safety standards?",
whyItIsAsked: "Cleanliness and safety are essential in food service and hospitality.",
howToAnswer: "Talk about routines, following guidelines, and staying consistent.",
},
{
question: "How do you work with a team during a rush?",
whyItIsAsked: "Teamwork matters during busy service periods.",
howToAnswer: "Highlight communication, flexibility, and helping where needed.",
},
{
question: "Tell me about a time you created a positive guest experience.",
whyItIsAsked: "They want to hear your service mindset in action.",
howToAnswer: "Use a short real example showing attentiveness and follow-through.",
},
],
},
"Driving / Logistics": {
questions: [
{
question: "How do you stay safe and on schedule while driving?",
whyItIsAsked: "They want to know you balance safety with reliability.",
howToAnswer: "Talk about planning routes, checking conditions, following laws, and staying focused.",
},
{
question: "How do you handle delays or route changes?",
whyItIsAsked: "Logistics roles often require flexibility and communication.",
howToAnswer: "Say that you stay calm, communicate quickly, and adapt without sacrificing safety.",
},
{
question: "How do you inspect or maintain your vehicle before a shift?",
whyItIsAsked: "They want to see responsibility and attention to safety.",
howToAnswer: "Explain your pre-trip checks and how you report concerns.",
},
{
question: "Tell me about a time you had to solve a delivery or transportation problem.",
whyItIsAsked: "They want a real example of responsibility and problem-solving.",
howToAnswer: "Share a short example and explain the outcome.",
},
{
question: "How do you handle customer interaction while representing a company on the road?",
whyItIsAsked: "Drivers often represent the business directly to customers.",
howToAnswer: "Emphasize professionalism, punctuality, and respectful communication.",
},
],
},
Retail: {
questions: [
{
question: "How do you help customers while also keeping up with store tasks?",
whyItIsAsked: "Retail roles often require multitasking and customer service.",
howToAnswer: "Explain how you balance service, restocking, organization, and teamwork.",
},
{
question: "How do you handle an unhappy customer?",
whyItIsAsked: "They want to see composure and service recovery.",
howToAnswer: "Show that you listen, stay calm, and work toward a practical solution.",
},
{
question: "What does good customer service look like in retail?",
whyItIsAsked: "They want to understand your service mindset.",
howToAnswer: "Talk about friendliness, product knowledge, patience, and professionalism.",
},
{
question: "How do you stay productive during a slow shift?",
whyItIsAsked: "Retail requires initiative even when traffic is low.",
howToAnswer: "Mention organizing, cleaning, restocking, and preparing for the next rush.",
},
{
question: "How do you handle cash or register accuracy?",
whyItIsAsked: "Accuracy and trust matter in retail settings.",
howToAnswer: "Talk about focus, counting carefully, and following register procedures.",
},
],
},
"IT / Help Desk": {
questions: [
{
question: "How do you troubleshoot a technical issue when the cause is not obvious?",
whyItIsAsked: "They want to see your problem-solving process.",
howToAnswer: "Explain how you gather information, test likely causes, and work step by step.",
},
{
question: "How do you explain technical issues to non-technical users?",
whyItIsAsked: "Support roles require clear communication.",
howToAnswer: "Show that you simplify information, stay patient, and confirm understanding.",
},
{
question: "Tell me about a time you solved a difficult support issue.",
whyItIsAsked: "They want a real example of troubleshooting and follow-through.",
howToAnswer: "Use a simple example showing your process and the result.",
},
{
question: "How do you prioritize multiple support requests?",
whyItIsAsked: "Help desk work often requires urgency and organization.",
howToAnswer: "Talk about impact, urgency, communication, and documentation.",
},
{
question: "How do you document issues and solutions?",
whyItIsAsked: "Documentation improves consistency and support quality.",
howToAnswer: "Explain that you record the issue, actions taken, and final solution clearly.",
},
],
},
};

export default function InterviewQuestionGeneratorPage() {
const [industry, setIndustry] = useState<IndustryType>("General");
const [jobTitle, setJobTitle] = useState("");
const [candidateStrength, setCandidateStrength] = useState("");

const selectedQuestions = useMemo(() => {
return questionBank[industry].questions;
}, [industry]);

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>Interview Question Generator</h1>
<p style={styles.subtitle}>
Explore general and industry-specific interview questions, understand what the employer is really asking,
and review simple guidance on how to answer with confidence.
</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</section>

<section style={styles.formCard}>
<p style={styles.sectionKicker}>Generator Setup</p>
<h2 style={styles.sectionTitle}>Choose your focus</h2>

<div style={styles.formGrid}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Industry</label>
<select
value={industry}
onChange={(e) => setIndustry(e.target.value as IndustryType)}
style={styles.input}
>
{Object.keys(questionBank).map((item) => (
<option key={item} value={item}>
{item}
</option>
))}
</select>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Job Title (optional)</label>
<input
value={jobTitle}
onChange={(e) => setJobTitle(e.target.value)}
placeholder="Example: CNA, Warehouse Associate, Help Desk Analyst"
style={styles.input}
/>
</div>

<div style={styles.fieldWrapFull}>
<label style={styles.label}>Top Strength to Highlight (optional)</label>
<input
value={candidateStrength}
onChange={(e) => setCandidateStrength(e.target.value)}
placeholder="Example: communication, reliability, technical troubleshooting"
style={styles.input}
/>
</div>
</div>
</section>

<section style={styles.resultsSection}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Generated Questions</p>
<h2 style={styles.sectionTitle}>
{industry} interview questions{jobTitle ? ` for ${jobTitle}` : ""}
</h2>
</div>

<div style={styles.questionGrid}>
{selectedQuestions.map((item, index) => (
<div key={index} style={styles.questionCard}>
<p style={styles.questionNumber}>Question {index + 1}</p>
<h3 style={styles.questionTitle}>{item.question}</h3>

<div style={styles.answerBlock}>
<p style={styles.answerLabel}>What the employer is really asking</p>
<p style={styles.answerText}>{item.whyItIsAsked}</p>
</div>

<div style={styles.answerBlock}>
<p style={styles.answerLabel}>How to answer</p>
<p style={styles.answerText}>{item.howToAnswer}</p>
</div>

{candidateStrength ? (
<div style={styles.answerBlock}>
<p style={styles.answerLabel}>Tip for your answer</p>
<p style={styles.answerText}>
Try connecting your answer back to your strength in {candidateStrength}.
</p>
</div>
) : null}
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
maxWidth: "1320px",
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
maxWidth: "860px",
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
formCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "28px",
padding: "24px",
boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
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
formGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "14px",
marginTop: "18px",
},
fieldWrap: {
display: "grid",
gap: "8px",
},
fieldWrapFull: {
display: "grid",
gap: "8px",
gridColumn: "1 / -1",
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
resultsSection: {
display: "grid",
gap: "18px",
},
questionGrid: {
display: "grid",
gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
gap: "18px",
},
questionCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "26px",
padding: "22px",
boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
display: "grid",
gap: "14px",
},
questionNumber: {
margin: 0,
color: "#9ca3af",
fontSize: "12px",
letterSpacing: "0.14em",
textTransform: "uppercase",
},
questionTitle: {
margin: 0,
fontSize: "24px",
lineHeight: 1.2,
fontWeight: 700,
color: "#f5f5f5",
},
answerBlock: {
display: "grid",
gap: "6px",
},
answerLabel: {
margin: 0,
color: "#cbd5e1",
fontSize: "13px",
fontWeight: 700,
},
answerText: {
margin: 0,
color: "#d4d4d8",
fontSize: "15px",
lineHeight: 1.75,
},
};
