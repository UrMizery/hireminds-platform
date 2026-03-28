"use client";

export default function CareerToolkitPage() {
return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.hero}>
<div style={styles.heroTextWrap}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>Career tools built to help candidates move faster.</h1>
<p style={styles.subtitle}>
Create resumes and letters, explore interview guidance, strengthen your skills,
and access practical tools designed to support job seekers in one clean space.
</p>
</div>

<div style={styles.heroPanel}>
<p style={styles.heroPanelKicker}>Available Now</p>
<div style={styles.heroStatList}>
<div style={styles.heroStatRow}>
<span style={styles.heroStatLabel}>Resume Tools</span>
<span style={styles.heroStatValue}>Live preview</span>
</div>
<div style={styles.heroStatRow}>
<span style={styles.heroStatLabel}>Career Guidance</span>
<span style={styles.heroStatValue}>Ready to use</span>
</div>
<div style={styles.heroStatRow}>
<span style={styles.heroStatLabel}>Skills Support</span>
<span style={styles.heroStatValue}>Organized by topic</span>
</div>
</div>
</div>
</section>

<section style={styles.section}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Generators</p>
<h2 style={styles.sectionTitle}>Build, match, and prepare</h2>
</div>

<div style={styles.grid}>
<div style={styles.featureCard}>
<div style={styles.featureTop}>
<h3 style={styles.featureTitle}>Job Description Analyzer</h3>
<span style={styles.liveTag}>New</span>
</div>
<p style={styles.featureText}>
Paste a job description to extract skills, qualifications, keywords, systems, and the best details to reflect in your resume and cover letter.
</p>
<a href="/career-toolkit/job-description-analyzer" style={styles.linkButton}>
Open Job Description Analyzer
</a>
</div>
<div style={styles.featureCard}>
<div style={styles.featureTop}>
<h3 style={styles.featureTitle}>Resume Generator</h3>
<span style={styles.liveTag}>Live</span>
</div>
<p style={styles.featureText}>
Build, preview, save, and print your resume with structured sections and a
clean professional layout.
</p>
<a href="/resume-builder" style={styles.linkButton}>
Open Resume Generator
</a>
</div>
<div style={styles.featureCard}>
<div style={styles.featureTop}>
<h3 style={styles.featureTitle}>Resume Match Analyzer</h3>
<span style={styles.liveTag}>New</span>
</div>
<p style={styles.featureText}>
Paste a job description and your resume text to compare overlap, missing keywords, strengths, and gaps before applying.
</p>
<a href="/career-toolkit/resume-match-analyzer" style={styles.linkButton}>
Open Resume Match Analyzer
</a>
</div>
<div style={styles.featureCard}>
<div style={styles.featureTop}>
<h3 style={styles.featureTitle}>Cover Letter Generator</h3>
<span style={styles.liveTag}>Live</span>
</div>
<p style={styles.featureText}>
Create a short professional cover letter with guided prompts, template support,
and live preview.
</p>
<a href="/career-toolkit/cover-letter-generator" style={styles.linkButton}>
Open Cover Letter Generator
</a>
</div>

<div style={styles.featureCard}>
<div style={styles.featureTop}>
<h3 style={styles.featureTitle}>Employer Follow-Up Generator</h3>
<span style={styles.liveTag}>New</span>
</div>
<p style={styles.featureText}>
Create a thank-you email after an interview or a polite follow-up email to
check on your application status.
</p>
<a href="/career-toolkit/employer-follow-up-generator" style={styles.linkButton}>
Open Follow-Up Generator
</a>
</div>

<div style={styles.featureCard}>
<div style={styles.featureTop}>
<h3 style={styles.featureTitle}>Interview Question Generator</h3>
<span style={styles.liveTag}>New</span>
</div>
<p style={styles.featureText}>
Generate general and industry-focused interview questions to help you prepare more confidently.
</p>
<a href="/career-toolkit/interview-question-generator" style={styles.linkButton}>
Open Interview Question Generator
</a>
</div>

<div style={styles.featureCard}>
<div style={styles.featureTop}>
<h3 style={styles.featureTitle}>Resume Format Guide</h3>
<span style={styles.liveTag}>Live</span>
</div>
<p style={styles.featureText}>
Learn the difference between chronological, functional, combination, and hybrid
resumes and find the format that fits you best.
</p>
<a href="/career-toolkit/resume-type-helper" style={styles.linkButton}>
Open Resume Format Guide
</a>
</div>

<div style={styles.featureCard}>
<div style={styles.featureTop}>
<h3 style={styles.featureTitle}>Job Log Generator</h3>
<span style={styles.liveTag}>New</span>
</div>
  
  
<p style={styles.featureText}>
Track where you applied, dates, contacts, interview updates, and follow-up activity
in one organized place.
</p>
<a href="/career-toolkit/job-log-generator" style={styles.linkButton}>
Open Job Log Generator
</a>
</div>
</div>
  <div style={styles.featureCard}>
<div style={styles.featureTop}>
<h3 style={styles.featureTitle}>Career Path Generator</h3>
<span style={styles.liveTag}>New</span>
</div>
<p style={styles.featureText}>
Explore career paths based on the work you enjoy, the environment you prefer, and how quickly you want to get started.
</p>
<a href="/career-toolkit/career-path-generator" style={styles.linkButton}>
Open Career Path Generator
</a>
</div>
  <div style={styles.featureCard}>
<div style={styles.featureTop}>
<h3 style={styles.featureTitle}>Budget Generator</h3>
<span style={styles.liveTag}>New</span>
</div>
<p style={styles.featureText}>
Build a simple monthly budget to understand your income, expenses, and what may be left over each month.
</p>
<a href="/career-toolkit/budget-generator" style={styles.linkButton}>
Open Budget Generator
</a>
</div>
  <div style={styles.featureCard}>
<div style={styles.featureTop}>
<h3 style={styles.featureTitle}>Career Goal Generator</h3>
<span style={styles.liveTag}>New</span>
</div>
<p style={styles.featureText}>
Create a clear written statement about your career goal, your research, your expected outcome, and your next steps.
</p>
<a href="/career-toolkit/career-goal-generator" style={styles.linkButton}>
Open Career Goal Generator
</a>
</div>
</section>

<section style={styles.section}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Skills</p>
<h2 style={styles.sectionTitle}>Strengthen your foundation</h2>
</div>

<div style={styles.gridTwo}>
<div style={styles.featureCard}>
<div style={styles.featureTop}>
<h3 style={styles.featureTitle}>Soft Skills</h3>
<span style={styles.liveTag}>Live</span>
</div>
<p style={styles.featureText}>
Review soft skills employers look for, including communication, teamwork,
adaptability, time management, and problem solving.
</p>
<a href="/career-toolkit/soft-skills" style={styles.linkButton}>
Open Soft Skills
</a>
</div>

<div style={styles.featureCard}>
<div style={styles.featureTop}>
<h3 style={styles.featureTitle}>Industry Core Skills</h3>
<span style={styles.liveTag}>Live</span>
</div>
<p style={styles.featureText}>
Explore core skills by industry, including healthcare, warehouse,
manufacturing, hospitality, admin, retail, logistics, IT, trades, and more.
</p>
<a href="/career-toolkit/industry-core-skills" style={styles.linkButton}>
Open Industry Core Skills
</a>
</div>
</div>
</section>

<section style={styles.supportSection}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Career Support</p>
<h2 style={styles.sectionTitle}>Guidance, community, and preparation</h2>
</div>

<div style={styles.supportList}>
<a href="/career-toolkit/interview-questions" style={styles.supportRow}>
<div>
<h3 style={styles.supportTitle}>Interview Questions</h3>
<p style={styles.supportText}>
Review common employer questions, strong sample answers, prep tips, and smart
questions to ask during and after an interview.
</p>
</div>
<span style={styles.supportArrow}>↗</span>
</a>

<a href="/career-toolkit/community-feed" style={styles.supportRow}>
<div>
<h3 style={styles.supportTitle}>HireMinds Community Feed</h3>
<p style={styles.supportText}>
Browse announcements, questions, opportunities, and community support in one
shared space.
</p>
</div>
<span style={styles.supportArrow}>↗</span>
</a>

<a href="/career-toolkit/job-search-tips" style={styles.supportRow}>
<div>
<h3 style={styles.supportTitle}>Job Search Tips</h3>
<p style={styles.supportText}>
Learn how to read a job description, pull the right skills from it, and use those
details in your resume and cover letter more effectively.
</p>
</div>
<span style={styles.supportArrow}>↗</span>
</a>
</div>
</section>

<section style={styles.lockedSection}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Coming Soon</p>
<h2 style={styles.sectionTitle}>Locked features</h2>
<p style={styles.lockedSubtitle}>
These features are planned for future release and are not active yet.
</p>
</div>

<div style={styles.lockedGrid}>
<div style={styles.lockedCard}>
<h3 style={styles.lockedTitle}>Schedule 1:1 🔒</h3>
<p style={styles.lockedText}>
Career coaching, interview prep, and personalized support.
</p>
</div>

<div style={styles.lockedCard}>
<h3 style={styles.lockedTitle}>Employer Verification 🔒</h3>
<p style={styles.lockedText}>
Employer-confirmed work history verification will be available here later.
</p>
</div>

<div style={styles.lockedCard}>
<h3 style={styles.lockedTitle}>Live Mock Interview 🔒</h3>
<p style={styles.lockedText}>
Practice interview sessions with live guidance and feedback.
</p>
</div>

<div style={styles.lockedCard}>
<h3 style={styles.lockedTitle}>Resume Revision 🔒</h3>
<p style={styles.lockedText}>
Premium resume support and detailed revision assistance.
</p>
</div>
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
maxWidth: "1360px",
margin: "0 auto",
display: "grid",
gap: "26px",
},
hero: {
display: "grid",
gridTemplateColumns: "1.45fr 0.8fr",
gap: "22px",
alignItems: "stretch",
},
heroTextWrap: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "32px",
padding: "34px",
boxShadow: "0 30px 80px rgba(0,0,0,0.32)",
},
heroPanel: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "32px",
padding: "28px",
boxShadow: "0 30px 80px rgba(0,0,0,0.32)",
display: "flex",
flexDirection: "column",
justifyContent: "center",
},
kicker: {
margin: "0 0 10px",
color: "#a1a1aa",
fontSize: "12px",
letterSpacing: "0.2em",
textTransform: "uppercase",
},
title: {
margin: "0 0 14px",
fontSize: "46px",
lineHeight: 1.04,
letterSpacing: "-0.04em",
fontWeight: 700,
color: "#f5f5f5",
maxWidth: "760px",
},
subtitle: {
margin: 0,
color: "#d4d4d8",
fontSize: "16px",
lineHeight: 1.8,
maxWidth: "760px",
},
heroPanelKicker: {
margin: "0 0 18px",
color: "#d4d4d8",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
heroStatList: {
display: "grid",
gap: "14px",
},
heroStatRow: {
display: "flex",
justifyContent: "space-between",
gap: "12px",
alignItems: "center",
padding: "14px 0",
borderBottom: "1px solid rgba(255,255,255,0.08)",
},
heroStatLabel: {
color: "#a1a1aa",
fontSize: "14px",
},
heroStatValue: {
color: "#f5f5f5",
fontSize: "14px",
fontWeight: 700,
textAlign: "right",
},
section: {
display: "grid",
gap: "16px",
},
supportSection: {
display: "grid",
gap: "16px",
},
lockedSection: {
display: "grid",
gap: "16px",
marginTop: "8px",
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
lockedSubtitle: {
margin: "4px 0 0",
color: "#a1a1aa",
fontSize: "15px",
lineHeight: 1.7,
},
grid: {
display: "grid",
gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
gap: "18px",
},
gridTwo: {
display: "grid",
gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
gap: "18px",
},
featureCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "28px",
padding: "24px",
boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
display: "grid",
gap: "14px",
},
featureTop: {
display: "flex",
justifyContent: "space-between",
gap: "12px",
alignItems: "flex-start",
},
featureTitle: {
margin: 0,
fontSize: "24px",
lineHeight: 1.15,
fontWeight: 700,
color: "#f5f5f5",
},
featureText: {
margin: 0,
color: "#d4d4d8",
fontSize: "15px",
lineHeight: 1.75,
},
liveTag: {
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
supportList: {
display: "grid",
gap: "12px",
},
supportRow: {
display: "flex",
justifyContent: "space-between",
gap: "18px",
alignItems: "center",
textDecoration: "none",
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "24px",
padding: "22px 24px",
boxShadow: "0 18px 50px rgba(0,0,0,0.24)",
},
supportTitle: {
margin: "0 0 8px",
fontSize: "22px",
lineHeight: 1.15,
fontWeight: 700,
color: "#f5f5f5",
},
supportText: {
margin: 0,
color: "#d4d4d8",
fontSize: "15px",
lineHeight: 1.75,
maxWidth: "900px",
},
supportArrow: {
color: "#f5f5f5",
fontSize: "24px",
lineHeight: 1,
flexShrink: 0,
},
lockedGrid: {
display: "grid",
gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
gap: "16px",
},
lockedCard: {
background: "rgba(255,255,255,0.03)",
border: "1px solid rgba(255,255,255,0.06)",
borderRadius: "24px",
padding: "22px",
},
lockedTitle: {
margin: "0 0 10px",
fontSize: "22px",
lineHeight: 1.15,
fontWeight: 700,
color: "#e5e7eb",
},
lockedText: {
margin: 0,
color: "#a1a1aa",
fontSize: "15px",
lineHeight: 1.7,
},
};
