"use client";

import { useState } from "react";

export default function PartnerWithHireMindsPage() {
const [companyName, setCompanyName] = useState("");
const [fullName, setFullName] = useState("");
const [title, setTitle] = useState("");
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");
const [message, setMessage] = useState("");
const [statusMessage, setStatusMessage] = useState("");
const [submitting, setSubmitting] = useState(false);

async function handleSubmit(e: React.FormEvent) {
e.preventDefault();
setStatusMessage("");

if (!companyName.trim() || !fullName.trim() || !email.trim() || !message.trim()) {
setStatusMessage("Please complete the required fields before submitting.");
return;
}

try {
setSubmitting(true);

const response = await fetch("/api/partner-inquiry", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
companyName,
fullName,
title,
phone,
email,
message,
}),
});

const data = await response.json();

if (!response.ok) {
throw new Error(data?.error || "Unable to submit inquiry.");
}

setStatusMessage("Inquiry sent successfully. We’ll be in touch soon.");

setCompanyName("");
setFullName("");
setTitle("");
setPhone("");
setEmail("");
setMessage("");
} catch (error: any) {
setStatusMessage(error?.message || "Unable to submit inquiry.");
} finally {
setSubmitting(false);
}
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<p style={styles.kicker}>HireMinds for Partners</p>
<h1 style={styles.title}>
A smarter way to extend workforce support, track engagement, and strengthen outcomes
</h1>
<p style={styles.subtitle}>
HireMinds is a workforce infrastructure platform designed to help partners support participants in a more practical,
flexible, and measurable way. From guided resume creation to interview preparation, online support, workshops, and
reporting visibility, HireMinds helps organizations deliver a stronger experience without adding more strain to staff.
</p>

<div style={styles.heroButtons}>
<a href="/" style={styles.linkButton}>
Back Home
</a>
<a href="/sign-up" style={styles.secondaryActionButton}>
Tour HireMinds
</a>
</div>
</section>

<section style={styles.infoGrid}>
<div style={styles.infoCard}>
<p style={styles.sectionKicker}>Who HireMinds supports</p>
<h2 style={styles.sectionTitle}>Built for organizations helping people move forward</h2>
<ul style={styles.list}>
<li>Workforce development organizations</li>
<li>Nonprofits and community-based programs</li>
<li>Reentry and justice-impacted programs</li>
<li>Veteran-serving organizations</li>
<li>Schools, colleges, and training providers</li>
<li>Career coaches, case managers, and program staff</li>
<li>Programs running services in one or multiple locations</li>
</ul>
</div>

<div style={styles.infoCard}>
<p style={styles.sectionKicker}>Why partners choose HireMinds</p>
<h2 style={styles.sectionTitle}>More visibility. More structure. More support.</h2>
<ul style={styles.list}>
<li>Live dashboard access or monthly participant usage reports</li>
<li>Practical tools participants can use beyond office hours</li>
<li>Guided AI prompts that help users create professional resumes</li>
<li>Less waiting for appointments just to get started</li>
<li>Online support plus optional workshop support</li>
<li>Stronger structure for referrals, follow-up, and reporting</li>
<li>Optional project manager support for reporting needs</li>
</ul>
</div>
</section>

<section style={styles.infoCard}>
<p style={styles.sectionKicker}>What makes HireMinds different</p>
<h2 style={styles.sectionTitle}>More than a resume builder. More than a workshop handout.</h2>
<p style={styles.paragraph}>
HireMinds is built to help participants take action without needing to wait for a scheduled appointment just to create a
resume or begin preparing for the next step. Through guided tools and structured prompts, participants can start building
their professional presence on their own time while still feeling supported throughout the process.
</p>
<p style={styles.paragraph}>
This is especially powerful for individuals who benefit from step-by-step guidance, including justice-impacted
individuals, veterans, stay-at-home parents returning to work, and others navigating barriers, transitions, or a need
for stronger confidence in the hiring process.
</p>
<p style={styles.paragraph}>
Rather than staring at a blank page, users are guided through professional resume creation with AI-supported prompts that
help them organize their experience, highlight transferable skills, and build stronger materials with more confidence.
HireMinds also helps participants prepare for interviews by encouraging better self-presentation, stronger storytelling,
and more intentional readiness before applying or meeting with employers.
</p>
</section>

<section style={styles.infoGrid}>
<div style={styles.infoCard}>
<p style={styles.sectionKicker}>Career Toolkit access</p>
<h2 style={styles.sectionTitle}>Participants can build, learn, and prepare from anywhere</h2>
<p style={styles.paragraph}>
HireMinds includes a growing Career Toolkit designed to support real-world career readiness. Depending on access level,
tools may include guided resume support, cover letter help, interview preparation, notes, job-readiness guidance, and
more.
</p>
<p style={styles.paragraph}>
Upcoming features include assessments, an expanded video library, deeper guided support, future employer partnership
features, and an internal job board designed to create stronger connections between job seekers and opportunity.
</p>
<p style={styles.paragraph}>
Interested in seeing the experience for yourself? Sign up to tour HireMinds using referral code <strong>DEMO</strong>.
</p>
<div style={styles.heroButtons}>
<a href="/sign-up" style={styles.primaryTourButton}>
Sign Up to Tour HireMinds and explore the experience your participants will navigate
</a>
</div>
</div>

<div style={styles.infoCard}>
<p style={styles.sectionKicker}>Workshops and implementation</p>
<h2 style={styles.sectionTitle}>We help make the experience possible</h2>
<p style={styles.paragraph}>
HireMinds can support weekly or monthly workshops at one location or across multiple locations, depending on your
organization’s needs.
</p>
<p style={styles.paragraph}>
No computer? No laptop? No problem. As part of the partnership package, support can include Chromebooks, flash drives,
and the supplies needed to help create a smoother, more accessible experience for participants.
</p>
<p style={styles.paragraph}>
The goal is simple: remove friction, make it easier for participants to engage, and help partners deliver a more
complete workforce-readiness experience with less stress and more consistency.
</p>
</div>
</section>

<section style={styles.infoCard}>
<p style={styles.sectionKicker}>Reporting and visibility</p>
<h2 style={styles.sectionTitle}>See what your participants are using and how they are engaging</h2>
<p style={styles.paragraph}>
One of the strongest benefits of partnering with HireMinds is visibility. Partners can gain access to a live dashboard or
monthly usage reports showing how participants are engaging with the platform, what tools they are using, and where there
may be opportunities for stronger follow-up or support. Dashboard access can also support workshop visibility by tying
participant activity back to presentations, guided sessions, and implementation efforts.
</p>
<p style={styles.paragraph}>
For organizations that prefer a more hands-off reporting experience, HireMinds can also include a designated project
manager to help monitor usage, organize reporting, and provide structured updates on your behalf.
</p>
<p style={styles.paragraph}>
This creates a stronger bridge between participant activity, workshop delivery, staff visibility, and program outcomes without
requiring your team to manually piece everything together.
</p>
</section>

<section style={styles.infoCard}>
<p style={styles.sectionKicker}>Workshop outcomes</p>
<h2 style={styles.sectionTitle}>What participants can accomplish by the end of a session</h2>

<p style={styles.paragraph}>
HireMinds is designed to make every session practical, guided, and outcome-driven. By the end of a resume or career-readiness
session, participants are not just exposed to information — they are actively building tools they can leave with and continue
using after the workshop ends.
</p>

<p style={styles.paragraph}>
Depending on the session format, participants will practice how to navigate the platform, build their materials, and use
HireMinds more independently moving forward. Partners can also benefit from dashboard visibility that includes workshop-related
activity and presentation support as part of the broader implementation experience.
</p>

<ul style={styles.list}>
<li>Create a Career Passport account and sign in</li>
<li>Complete core profile information</li>
<li>Build a resume using HireMinds</li>
<li>Understand how to use generators for job-search tasks</li>
<li>Identify soft skills and industry core skills to strengthen applications</li>
<li>Navigate the homepage and profile editor</li>
<li>Use interview question and follow-up tools</li>
<li>Save skills and goals that support target roles</li>
<li>Use the job log and budget tools for planning</li>
<li>Find community support and next-step resources</li>
</ul>

<p style={styles.paragraph}>
The goal is for participants to leave with more than motivation. They leave with progress, clearer direction, stronger materials,
and a better understanding of how to keep building on their own.
</p>
</section>

<section style={styles.card}>
<p style={styles.sectionKicker}>Partnership Inquiry</p>
<h2 style={styles.sectionTitle}>Tell us about your organization</h2>
<p style={styles.formIntro}>
Ready to explore what HireMinds can look like for your organization? Share a few details below and let us know how you’d
like to partner, what type of population you serve, or what kind of support, workshops, reporting, or implementation you
are looking for.
</p>

<form onSubmit={handleSubmit} style={styles.form}>
<div style={styles.twoCol}>
<Field
label="Company Name"
value={companyName}
onChange={setCompanyName}
placeholder="Organization or business name"
/>
<Field
label="Your Name"
value={fullName}
onChange={setFullName}
placeholder="Full name"
/>
</div>

<div style={styles.twoCol}>
<Field
label="Title"
value={title}
onChange={setTitle}
placeholder="Your role or title"
/>
<Field
label="Phone Number"
value={phone}
onChange={setPhone}
placeholder="Best number to reach you"
/>
</div>

<Field
label="Email"
value={email}
onChange={setEmail}
placeholder="you@company.com"
type="email"
/>

<TextAreaField
label="How would you like to partner with HireMinds?"
value={message}
onChange={setMessage}
placeholder="Share how you'd like to partner, what populations you serve, whether you’re interested in dashboard access or monthly reports, workshop support, multi-location implementation, or any details you want us to know."
/>

<div style={styles.actionRow}>
<button type="submit" style={styles.primaryButton} disabled={submitting}>
{submitting ? "Submitting..." : "Submit Inquiry"}
</button>
</div>

{statusMessage ? <p style={styles.statusMessage}>{statusMessage}</p> : null}
</form>
</section>
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
maxWidth: "1100px",
margin: "0 auto",
display: "grid",
gap: "24px",
},
heroCard: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "28px",
},
infoGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "24px",
},
infoCard: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px",
},
card: {
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
sectionKicker: {
margin: "0 0 8px",
color: "#9a9a9a",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
title: {
margin: "0 0 12px",
fontSize: "40px",
fontWeight: 600,
color: "#f5f5f5",
lineHeight: 1.15,
},
sectionTitle: {
margin: "0 0 18px",
fontSize: "30px",
fontWeight: 600,
color: "#f5f5f5",
lineHeight: 1.2,
},
subtitle: {
margin: 0,
color: "#c8c8c8",
fontSize: "16px",
lineHeight: 1.8,
maxWidth: "920px",
},
paragraph: {
margin: "0 0 16px",
color: "#c8c8c8",
fontSize: "16px",
lineHeight: 1.8,
},
list: {
margin: 0,
paddingLeft: "20px",
color: "#c8c8c8",
lineHeight: 1.9,
},
heroButtons: {
display: "flex",
gap: "12px",
marginTop: "20px",
flexWrap: "wrap",
},
linkButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
textDecoration: "none",
padding: "12px 16px",
borderRadius: "16px",
border: "1px solid #3a3a3a",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
},
secondaryActionButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
textDecoration: "none",
padding: "12px 16px",
borderRadius: "16px",
border: "1px solid #3a3a3a",
background: "#171717",
color: "#f5f5f5",
fontWeight: 700,
},
primaryTourButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
textDecoration: "none",
padding: "12px 18px",
borderRadius: "16px",
border: "1px solid #d1d5db",
background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
color: "#09090b",
fontWeight: 700,
},
formIntro: {
margin: "0 0 18px",
color: "#c8c8c8",
fontSize: "16px",
lineHeight: 1.7,
},
form: {
display: "grid",
gap: "12px",
},
twoCol: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "12px",
},
fieldWrap: {
marginBottom: "4px",
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
minHeight: "160px",
padding: "14px 16px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "15px",
resize: "vertical",
boxSizing: "border-box",
},
actionRow: {
marginTop: "8px",
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
statusMessage: {
marginTop: "16px",
color: "#e5e5e5",
fontSize: "14px",
lineHeight: 1.7,
},
};
