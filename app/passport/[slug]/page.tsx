import type { CSSProperties } from "react";
import { supabase } from "../../lib/supabase";

type PassportPageProps = {
params: {
slug: string;
};
};

export default async function PassportPublicPage({ params }: PassportPageProps) {
const { data: profile } = await supabase
.from("candidate_profiles")
.select("*")
.eq("passport_slug", params.slug)
.maybeSingle();

const fullName = profile?.full_name || "Candidate Name";
const headline = profile?.headline || "Professional Headline";
const cityState =
[profile?.city, profile?.state].filter(Boolean).join(", ") || "Location not provided";

const bio =
profile?.bio || "This candidate has not added a public bio yet.";

const photoUrl = profile?.photo_url || "";
const resumeUrl = profile?.resume_url || "";
const linkedinUrl = profile?.linkedin_url || "";
const phone = profile?.phone || "";
const email = profile?.email || "";

const hasResume = Boolean(resumeUrl);
const hasLinkedIn = Boolean(linkedinUrl);
const hasPhone = Boolean(phone);
const hasEmail = Boolean(email);

return (
<main style={styles.page}>
<div style={styles.wrapper}>
<section style={styles.hero}>
<div style={styles.heroLeft}>
{photoUrl ? (
<img src={photoUrl} alt={fullName} style={styles.photo} />
) : (
<div style={styles.photoPlaceholder}>No Photo</div>
)}
</div>

<div style={styles.heroRight}>
<p style={styles.kicker}>Career Passport</p>
<h1 style={styles.name}>{fullName}</h1>
<p style={styles.headline}>{headline}</p>
<p style={styles.meta}>{cityState}</p>

<div style={styles.contactRow}>
{hasPhone ? <span style={styles.contactPill}>{phone}</span> : null}
{hasEmail ? <span style={styles.contactPill}>{email}</span> : null}
</div>

<div style={styles.linkRow}>
{hasLinkedIn ? (
<a href={linkedinUrl} style={styles.ghostButton} target="_blank" rel="noreferrer">
LinkedIn
</a>
) : null}

{hasResume ? (
<a href={resumeUrl} style={styles.primaryButton} target="_blank" rel="noreferrer">
Open Uploaded Resume
</a>
) : (
<span style={styles.disabledButton}>Resume Not Available</span>
)}
</div>

<div style={styles.notice}>
This Career Passport gives employers and partners a professional snapshot of
the candidate’s saved profile details and uploaded resume.
</div>
</div>
</section>

<div style={styles.layout}>
<section style={styles.mainCol}>
<div style={styles.card}>
<p style={styles.sectionKicker}>About</p>
<h2 style={styles.sectionTitle}>Profile Bio</h2>
<p style={styles.bodyText}>{bio}</p>
</div>

<div style={styles.card}>
<p style={styles.sectionKicker}>Profile Details</p>
<h2 style={styles.sectionTitle}>Candidate Information</h2>

<div style={styles.infoGrid}>
<div style={styles.infoItem}>
<span style={styles.infoLabel}>Full Name</span>
<span style={styles.infoValue}>{fullName}</span>
</div>

<div style={styles.infoItem}>
<span style={styles.infoLabel}>Headline</span>
<span style={styles.infoValue}>{headline}</span>
</div>

<div style={styles.infoItem}>
<span style={styles.infoLabel}>Location</span>
<span style={styles.infoValue}>{cityState}</span>
</div>

<div style={styles.infoItem}>
<span style={styles.infoLabel}>Phone</span>
<span style={styles.infoValue}>{hasPhone ? phone : "Not provided"}</span>
</div>

<div style={styles.infoItem}>
<span style={styles.infoLabel}>Email</span>
<span style={styles.infoValue}>{hasEmail ? email : "Not provided"}</span>
</div>

<div style={styles.infoItem}>
<span style={styles.infoLabel}>LinkedIn</span>
<span style={styles.infoValue}>
{hasLinkedIn ? (
<a
href={linkedinUrl}
target="_blank"
rel="noreferrer"
style={styles.inlineLink}
>
View LinkedIn
</a>
) : (
"Not provided"
)}
</span>
</div>
</div>
</div>

<div id="resume-section" style={styles.card}>
<p style={styles.sectionKicker}>Resume</p>
<h2 style={styles.sectionTitle}>Uploaded Resume</h2>
<p style={styles.bodyText}>
{hasResume
? "Open the uploaded resume to review the candidate’s latest document."
: "This candidate has not uploaded a resume yet."}
</p>

{hasResume ? (
<a href={resumeUrl} style={styles.primaryButton} target="_blank" rel="noreferrer">
Open Uploaded Resume
</a>
) : (
<span style={styles.disabledButton}>Resume Not Available</span>
)}
</div>
</section>

<aside style={styles.sideCol}>
<div style={styles.sideCard}>
<p style={styles.sectionKicker}>Employer Snapshot</p>
<h2 style={styles.sectionTitle}>Quick View</h2>

<div style={styles.sideItem}>
<span style={styles.sideLabel}>Candidate</span>
<span style={styles.sideValue}>{fullName}</span>
</div>

<div style={styles.sideItem}>
<span style={styles.sideLabel}>Headline</span>
<span style={styles.sideValue}>{headline}</span>
</div>

<div style={styles.sideItem}>
<span style={styles.sideLabel}>Location</span>
<span style={styles.sideValue}>{cityState}</span>
</div>

<div style={styles.sideItem}>
<span style={styles.sideLabel}>Phone</span>
<span style={styles.sideValue}>{hasPhone ? phone : "Not provided"}</span>
</div>

<div style={styles.sideItem}>
<span style={styles.sideLabel}>Email</span>
<span style={styles.sideValue}>{hasEmail ? email : "Not provided"}</span>
</div>

<div style={styles.sideItem}>
<span style={styles.sideLabel}>LinkedIn</span>
<span style={styles.sideValue}>{hasLinkedIn ? "Available" : "Not provided"}</span>
</div>

<div style={styles.sideItem}>
<span style={styles.sideLabel}>Resume</span>
<span style={styles.sideValue}>{hasResume ? "Available" : "Not available"}</span>
</div>
</div>
</aside>
</div>
</div>
</main>
);
}

const styles: Record<string, CSSProperties> = {
page: {
minHeight: "100vh",
background:
"radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent 20%), linear-gradient(180deg, #040404 0%, #0b0b0d 100%)",
color: "#f5f5f5",
padding: "32px 24px 56px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
wrapper: {
maxWidth: "1440px",
margin: "0 auto",
},
hero: {
display: "grid",
gridTemplateColumns: "200px 1fr",
gap: "28px",
alignItems: "center",
background:
"linear-gradient(135deg, rgba(20,20,20,0.96) 0%, rgba(12,12,14,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "32px",
padding: "34px",
boxShadow: "0 30px 90px rgba(0,0,0,0.35)",
marginBottom: "28px",
backdropFilter: "blur(8px)",
},
heroLeft: {},
heroRight: {},
photo: {
width: "220px",
height: "220px",
borderRadius: "22px",
objectFit: "cover",
border: "1px solid #2e2e2e",
},
photoPlaceholder: {
width: "220px",
height: "220px",
borderRadius: "22px",
display: "flex",
alignItems: "center",
justifyContent: "center",
background: "#111827",
color: "#cbd5e1",
border: "1px solid #2e2e2e",
},
kicker: {
margin: "0 0 10px",
color: "#a3a3a3",
fontSize: "12px",
letterSpacing: "0.22em",
textTransform: "uppercase",
},
name: {
margin: "0 0 10px",
fontSize: "48px",
lineHeight: 1.02,
fontWeight: 500,
letterSpacing: "-0.04em",
color: "#f5f5f5",
},
headline: {
margin: "0 0 10px",
color: "#e5e7eb",
fontSize: "20px",
lineHeight: 1.4,
},
meta: {
margin: "0 0 18px",
color: "#a1a1aa",
fontSize: "15px",
},
contactRow: {
display: "flex",
gap: "10px",
flexWrap: "wrap",
marginBottom: "16px",
},
contactPill: {
padding: "10px 12px",
borderRadius: "999px",
background: "rgba(255,255,255,0.04)",
border: "1px solid rgba(255,255,255,0.08)",
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.4,
},
linkRow: {
display: "flex",
gap: "12px",
flexWrap: "wrap",
marginBottom: "16px",
},
primaryButton: {
background: "linear-gradient(180deg, #f5f5f5 0%, #d4d4d8 100%)",
color: "#09090b",
border: "none",
borderRadius: "16px",
padding: "12px 16px",
fontSize: "15px",
fontWeight: 700,
textDecoration: "none",
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
},
ghostButton: {
background: "transparent",
color: "#fff",
border: "1px solid rgba(255,255,255,0.18)",
borderRadius: "16px",
padding: "12px 16px",
fontSize: "15px",
fontWeight: 700,
textDecoration: "none",
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
},
disabledButton: {
background: "rgba(255,255,255,0.04)",
color: "#a1a1aa",
border: "1px solid rgba(255,255,255,0.1)",
borderRadius: "16px",
padding: "12px 16px",
fontSize: "15px",
fontWeight: 700,
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
},
notice: {
background: "rgba(255,255,255,0.04)",
border: "1px solid rgba(255,255,255,0.08)",
borderRadius: "18px",
padding: "14px 16px",
color: "#d4d4d8",
fontSize: "15px",
lineHeight: 1.6,
},
layout: {
display: "grid",
gridTemplateColumns: "minmax(0, 1fr) 360px",
gap: "24px",
alignItems: "start",
},
mainCol: {},
sideCol: {},
card: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(12,12,14,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.06)",
borderRadius: "30px",
padding: "28px",
boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
marginBottom: "22px",
backdropFilter: "blur(8px)",
},
sideCard: {
background: "linear-gradient(180deg, #111111 0%, #171717 100%)",
border: "1px solid #232323",
borderRadius: "28px",
padding: "24px",
boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
position: "sticky",
top: "24px",
},
sectionKicker: {
margin: "0 0 10px",
color: "#a3a3a3",
fontSize: "12px",
letterSpacing: "0.22em",
textTransform: "uppercase",
},
sectionTitle: {
margin: "0 0 12px",
color: "#fafafa",
fontSize: "28px",
lineHeight: 1.1,
fontWeight: 700,
},
bodyText: {
margin: "0 0 16px",
color: "#e5e7eb",
fontSize: "16px",
lineHeight: 1.7,
whiteSpace: "pre-wrap",
wordBreak: "break-word",
},
infoGrid: {
display: "grid",
gap: "14px",
},
infoItem: {
display: "grid",
gap: "6px",
paddingBottom: "12px",
borderBottom: "1px solid rgba(255,255,255,0.08)",
},
infoLabel: {
color: "#a1a1aa",
fontSize: "13px",
textTransform: "uppercase",
letterSpacing: "0.08em",
},
infoValue: {
color: "#fafafa",
fontSize: "15px",
lineHeight: 1.6,
},
inlineLink: {
color: "#f5f5f5",
textDecoration: "underline",
},
sideItem: {
display: "flex",
justifyContent: "space-between",
gap: "12px",
padding: "12px 0",
borderBottom: "1px solid rgba(255,255,255,0.08)",
},
sideLabel: {
color: "#a1a1aa",
fontSize: "14px",
},
sideValue: {
color: "#fafafa",
fontSize: "14px",
fontWeight: 600,
textAlign: "right",
},
};
