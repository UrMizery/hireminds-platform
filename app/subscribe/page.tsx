"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

type ProfileRow = {
user_id?: string | null;
full_name?: string | null;
email?: string | null;
has_referral_access?: boolean | null;
has_paid_access?: boolean | null;
access_tier?: string | null;
};

export default function SubscribePage() {
const [loading, setLoading] = useState(true);
const [loadingCheckout, setLoadingCheckout] = useState(false);
const [loadingLeave, setLoadingLeave] = useState(false);
const [message, setMessage] = useState("");
const [email, setEmail] = useState("");
const [userId, setUserId] = useState("");
const [fullName, setFullName] = useState("");

const [demoName, setDemoName] = useState("Your Name");
const [demoHeadline, setDemoHeadline] = useState("Career Passport Member");
const [demoSkillOne, setDemoSkillOne] = useState("Communication");
const [demoSkillTwo, setDemoSkillTwo] = useState("Customer Service");
const [demoBullet, setDemoBullet] = useState(
"Supported daily operations, improved organization, and contributed to a stronger customer experience."
);

const demoSkills = useMemo(
() => [demoSkillOne, demoSkillTwo].filter(Boolean),
[demoSkillOne, demoSkillTwo]
);

useEffect(() => {
let mounted = true;

async function loadPage() {
setLoading(true);
setMessage("");

const {
data: { session },
error: sessionError,
} = await supabase.auth.getSession();

if (!mounted) return;

if (sessionError || !session?.user) {
setLoading(false);
return;
}

const sessionUser = session.user;
const sessionEmail = sessionUser.email || "";
const sessionUserId = sessionUser.id;

setEmail(sessionEmail);
setUserId(sessionUserId);

const { data: profileRow, error: profileError } = await supabase
.from("candidate_profiles")
.select("user_id, full_name, email, has_referral_access, has_paid_access, access_tier")
.eq("user_id", sessionUserId)
.maybeSingle<ProfileRow>();

if (!mounted) return;

if (profileError) {
setMessage(profileError.message);
setLoading(false);
return;
}

if (profileRow?.full_name) {
setFullName(profileRow.full_name);
setDemoName(profileRow.full_name);
}

const hasFullAccess =
!!profileRow?.has_referral_access || !!profileRow?.has_paid_access;

if (hasFullAccess) {
window.location.href = "/profile";
return;
}

setLoading(false);
}

loadPage();

return () => {
mounted = false;
};
}, []);

async function handleSubscribe() {
if (!email || !userId) {
setMessage("Please sign in first to continue with payment.");
return;
}

try {
setLoadingCheckout(true);
setMessage("");

const response = await fetch("/api/create-checkout-session", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
email,
userId,
}),
});

const data = await response.json();

if (!response.ok) {
setMessage(data?.error || "Unable to start checkout.");
setLoadingCheckout(false);
return;
}

if (data?.url) {
window.location.href = data.url;
return;
}

setMessage("Checkout session could not be created.");
setLoadingCheckout(false);
} catch (error) {
console.error(error);
setMessage("Something went wrong while starting checkout.");
setLoadingCheckout(false);
}
}

async function handleLeave() {
try {
setLoadingLeave(true);
await supabase.auth.signOut();
} catch (error) {
console.error("Leave error:", error);
} finally {
window.location.href = "/";
}
}

if (loading) {
return (
<main style={styles.page}>
<div style={styles.centerWrap}>Loading subscription page...</div>
</main>
);
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<div style={styles.heroTextWrap}>
<p style={styles.kicker}>Unlock Full HireMinds Access</p>
<h1 style={styles.title}>Complete your subscription to continue</h1>
<p style={styles.subtitle}>
Build your Career Passport, unlock the Career Toolkit, save your work,
and access the full HireMinds experience designed to support stronger
visibility, readiness, and career momentum.
</p>

<div style={styles.priceWrap}>
<p style={styles.priceLabel}>Full Access</p>
<p style={styles.priceValue}>$24.99/month</p>
<p style={styles.priceSubtext}>
Sponsored access is available with a valid referral code. A subscription
unlocks full platform access without one.
</p>
</div>

<div style={styles.heroActionRow}>
<button
type="button"
onClick={handleSubscribe}
style={styles.primaryButton}
disabled={loadingCheckout}
>
{loadingCheckout ? "Redirecting to Checkout..." : "Subscribe Now"}
</button>

<button
type="button"
onClick={handleLeave}
style={styles.secondaryButton}
disabled={loadingLeave}
>
{loadingLeave ? "Leaving..." : "Leave"}
</button>
</div>

<p style={styles.actionSupportText}>
Complete your subscription to unlock full HireMinds access, or leave if
you are not ready to continue.
</p>

{message ? <p style={styles.message}>{message}</p> : null}
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>What Full Access Includes</p>
<h2 style={styles.sectionTitle}>A stronger experience from first step to next move</h2>
</div>
</div>

<div style={styles.featureGrid}>
<div style={styles.featureCard}>
<h3 style={styles.featureTitle}>Career Passport</h3>
<p style={styles.featureText}>
Create and manage your Career Passport, strengthen your visibility,
and keep your career materials organized in one place.
</p>
</div>

<div style={styles.featureCard}>
<h3 style={styles.featureTitle}>Career Toolkit</h3>
<p style={styles.featureText}>
Access resume generators, cover letter tools, interview prep,
analyzers, guides, and practical resources built to help you move forward.
</p>
</div>

<div style={styles.featureCard}>
<h3 style={styles.featureTitle}>Save, Print, and Export</h3>
<p style={styles.featureText}>
Save your work, print and download outputs, and finalize premium tools
and guided resources across the platform.
</p>
</div>

<div style={styles.featureCard}>
<h3 style={styles.featureTitle}>Notes and Progress</h3>
<p style={styles.featureText}>
Track ideas, save notes, and continue building over time with a workspace
designed to support momentum and follow-through.
</p>
</div>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>A Glimpse of HireMinds</p>
<h2 style={styles.sectionTitle}>Preview a sample resume experience</h2>
<p style={styles.sectionIntro}>
Explore a mini preview of the resume experience and see how HireMinds
helps transform information into a cleaner, stronger presentation.
Full access unlocks the ability to save, print, and use the complete tool experience.
</p>
</div>
</div>

<div style={styles.previewGrid}>
<div style={styles.previewControls}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Name</label>
<input
value={demoName}
onChange={(e) => setDemoName(e.target.value)}
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Headline</label>
<input
value={demoHeadline}
onChange={(e) => setDemoHeadline(e.target.value)}
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Skill 1</label>
<input
value={demoSkillOne}
onChange={(e) => setDemoSkillOne(e.target.value)}
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Skill 2</label>
<input
value={demoSkillTwo}
onChange={(e) => setDemoSkillTwo(e.target.value)}
style={styles.input}
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Sample Experience Bullet</label>
<textarea
value={demoBullet}
onChange={(e) => setDemoBullet(e.target.value)}
style={styles.textarea}
/>
</div>

<div style={styles.lockedBox}>
<p style={styles.lockedTitle}>Preview Only</p>
<p style={styles.lockedText}>
Saving, printing, exporting, and full generator access are locked until
your subscription is active.
</p>
</div>
</div>

<div style={styles.resumePreview}>
<div style={styles.resumeSheet}>
<p style={styles.resumeName}>{demoName || "Your Name"}</p>
<p style={styles.resumeHeadline}>{demoHeadline || "Career Passport Member"}</p>

<div style={styles.resumeSection}>
<p style={styles.resumeSectionTitle}>Skills</p>
<div style={styles.skillList}>
{demoSkills.length ? (
demoSkills.map((skill) => (
<span key={skill} style={styles.skillPill}>
{skill}
</span>
))
) : (
<span style={styles.skillPill}>Add a skill</span>
)}
</div>
</div>

<div style={styles.resumeSection}>
<p style={styles.resumeSectionTitle}>Experience</p>
<p style={styles.resumeBullet}>• {demoBullet || "Add a sample bullet."}</p>
</div>
</div>
</div>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>More Is Coming</p>
<h2 style={styles.sectionTitle}>Future-forward access as HireMinds grows</h2>
</div>
</div>

<div style={styles.futureGrid}>
<div style={styles.futureCard}>
<h3 style={styles.futureTitle}>Upcoming Job Board</h3>
<p style={styles.futureText}>
Gain access to future job board features as they roll out, creating stronger
pathways to opportunities and employer visibility.
</p>
</div>

<div style={styles.futureCard}>
<h3 style={styles.futureTitle}>Workshops and Guided Access</h3>
<p style={styles.futureText}>
Access HireMinds workshop experiences and future learning opportunities
designed to strengthen confidence, preparation, and career readiness.
</p>
</div>

<div style={styles.futureCard}>
<h3 style={styles.futureTitle}>Expanding Tools and Resources</h3>
<p style={styles.futureText}>
New generators, guides, and planning tools will continue to be added as the
platform grows and the toolkit expands.
</p>
</div>
</div>
</section>
</div>
</main>
);
}

const styles: Record<string, CSSProperties> = {
page: {
minHeight: "100vh",
background:
"radial-gradient(circle at top left, rgba(59,130,246,0.09), transparent 22%), linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
color: "#e7e7e7",
padding: "32px 24px 56px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
centerWrap: {
minHeight: "70vh",
display: "flex",
alignItems: "center",
justifyContent: "center",
fontSize: "18px",
},
shell: {
maxWidth: "1320px",
margin: "0 auto",
display: "grid",
gap: "24px",
},
heroCard: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "30px",
},
heroTextWrap: {
display: "grid",
gap: "14px",
},
kicker: {
margin: 0,
color: "#9ca3af",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
title: {
margin: 0,
fontSize: "40px",
fontWeight: 700,
lineHeight: 1.08,
color: "#ffffff",
},
subtitle: {
margin: 0,
maxWidth: "900px",
fontSize: "16px",
lineHeight: 1.8,
color: "#d4d4d8",
},
priceWrap: {
display: "grid",
gap: "4px",
marginTop: "6px",
},
priceLabel: {
margin: 0,
color: "#93c5fd",
fontSize: "13px",
fontWeight: 700,
textTransform: "uppercase",
letterSpacing: "0.08em",
},
priceValue: {
margin: 0,
color: "#ffffff",
fontSize: "34px",
fontWeight: 800,
},
priceSubtext: {
margin: 0,
color: "#cbd5e1",
fontSize: "14px",
lineHeight: 1.7,
maxWidth: "840px",
},
heroActionRow: {
display: "flex",
gap: "14px",
flexWrap: "wrap",
marginTop: "10px",
},
primaryButton: {
padding: "14px 18px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.15)",
background: "#ffffff",
color: "#111111",
fontWeight: 800,
fontSize: "15px",
cursor: "pointer",
},
secondaryButton: {
padding: "14px 18px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.12)",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
fontSize: "15px",
cursor: "pointer",
},
actionSupportText: {
margin: 0,
color: "#cbd5e1",
fontSize: "13px",
lineHeight: 1.7,
},
message: {
margin: 0,
color: "#fca5a5",
fontSize: "14px",
lineHeight: 1.6,
},
card: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "24px",
},
sectionTop: {
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: "16px",
flexWrap: "wrap",
marginBottom: "18px",
},
sectionKicker: {
margin: "0 0 8px",
color: "#9ca3af",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
sectionTitle: {
margin: 0,
fontSize: "28px",
lineHeight: 1.15,
fontWeight: 700,
color: "#f5f5f5",
},
sectionIntro: {
margin: "10px 0 0",
color: "#d4d4d8",
fontSize: "15px",
lineHeight: 1.8,
maxWidth: "940px",
},
featureGrid: {
display: "grid",
gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
gap: "16px",
},
featureCard: {
border: "1px solid #2c2c2c",
borderRadius: "20px",
padding: "18px",
background: "#101010",
},
featureTitle: {
margin: "0 0 10px",
color: "#ffffff",
fontSize: "18px",
fontWeight: 700,
},
featureText: {
margin: 0,
color: "#d4d4d8",
fontSize: "14px",
lineHeight: 1.8,
},
previewGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "18px",
alignItems: "start",
},
previewControls: {
display: "grid",
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
borderRadius: "14px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "15px",
boxSizing: "border-box",
outline: "none",
},
textarea: {
width: "100%",
minHeight: "120px",
padding: "14px 16px",
borderRadius: "14px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "15px",
resize: "vertical",
boxSizing: "border-box",
outline: "none",
},
lockedBox: {
border: "1px dashed rgba(147,197,253,0.35)",
borderRadius: "18px",
padding: "16px",
background: "rgba(59,130,246,0.06)",
},
lockedTitle: {
margin: "0 0 8px",
color: "#bfdbfe",
fontSize: "14px",
fontWeight: 700,
},
lockedText: {
margin: 0,
color: "#dbeafe",
fontSize: "14px",
lineHeight: 1.7,
},
resumePreview: {
display: "flex",
justifyContent: "center",
},
resumeSheet: {
width: "100%",
maxWidth: "520px",
minHeight: "520px",
background: "#ffffff",
color: "#111111",
borderRadius: "18px",
padding: "28px",
boxSizing: "border-box",
boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
},
resumeName: {
margin: "0 0 6px",
fontSize: "26px",
fontWeight: 800,
},
resumeHeadline: {
margin: "0 0 18px",
fontSize: "14px",
color: "#444444",
},
resumeSection: {
marginBottom: "18px",
},
resumeSectionTitle: {
margin: "0 0 10px",
fontSize: "13px",
fontWeight: 800,
textTransform: "uppercase",
letterSpacing: "0.08em",
color: "#1d4ed8",
},
skillList: {
display: "flex",
gap: "8px",
flexWrap: "wrap",
},
skillPill: {
display: "inline-flex",
alignItems: "center",
padding: "8px 10px",
borderRadius: "999px",
background: "#eff6ff",
color: "#1d4ed8",
fontSize: "12px",
fontWeight: 700,
},
resumeBullet: {
margin: 0,
fontSize: "14px",
lineHeight: 1.8,
color: "#222222",
},
futureGrid: {
display: "grid",
gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
gap: "16px",
},
futureCard: {
border: "1px solid #2c2c2c",
borderRadius: "20px",
padding: "18px",
background: "#101010",
},
futureTitle: {
margin: "0 0 10px",
color: "#ffffff",
fontSize: "18px",
fontWeight: 700,
},
futureText: {
margin: 0,
color: "#d4d4d8",
fontSize: "14px",
lineHeight: 1.8,
},
};
