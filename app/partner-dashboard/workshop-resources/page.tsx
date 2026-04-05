"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../../lib/supabase";

type PartnerRow = {
organization_name?: string | null;
contact_name?: string | null;
contact_title?: string | null;
contact_email?: string | null;
referral_code?: string | null;
account_type?: string | null;
};

function InfoBubble({
title,
text,
}: {
title: string;
text: string;
}) {
const [open, setOpen] = useState(false);

return (
<span style={styles.infoWrap}>
<button
type="button"
onClick={() => setOpen((prev) => !prev)}
style={styles.infoButton}
aria-label={`About ${title}`}
title={`About ${title}`}
>
i
</button>
{open ? (
<div style={styles.infoPopup}>
<p style={styles.infoTitle}>{title}</p>
<p style={styles.infoText}>{text}</p>
</div>
) : null}
</span>
);
}

export default function PartnerWorkshopResourcesPage() {
const [loading, setLoading] = useState(true);
const [loadingLogout, setLoadingLogout] = useState(false);
const [message, setMessage] = useState("");
const [partner, setPartner] = useState<PartnerRow | null>(null);

const mountedRef = useRef(true);

async function loadPage() {
setLoading(true);
setMessage("");

const { data: authData, error: authError } = await supabase.auth.getUser();

if (authError || !authData.user?.email) {
window.location.href = "/employer-partner-login";
return;
}

const email = authData.user.email;

const { data: partnerRow, error: partnerError } = await supabase
.from("partners")
.select("*")
.eq("contact_email", email)
.maybeSingle<PartnerRow>();

if (partnerError) {
if (mountedRef.current) {
setMessage(partnerError.message);
setLoading(false);
}
return;
}

if (!partnerRow || !partnerRow.referral_code) {
if (mountedRef.current) {
setMessage("This account does not have partner workshop resources access.");
setLoading(false);
}
return;
}

if (!mountedRef.current) return;

setPartner(partnerRow);
setLoading(false);
}

useEffect(() => {
mountedRef.current = true;
loadPage();

return () => {
mountedRef.current = false;
};
}, []);

async function handleLogout() {
try {
setLoadingLogout(true);
await supabase.auth.signOut();
} finally {
window.location.href = "/employer-partner-login";
}
}

if (loading) {
return (
<main style={styles.page}>
<div style={styles.centerWrap}>Loading workshop resources...</div>
</main>
);
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<div>
<p style={styles.kicker}>Partner Workshop Resources</p>
<h1 style={styles.title}>Workshop Resources</h1>
<p style={styles.subtitle}>
This page is your partner-ready workshop hub. Use it to access deck files,
prepare for resume workshops, and keep future printable materials in one place.
</p>
<p style={styles.subtleLine}>Organization: {partner?.organization_name || "—"}</p>
<p style={styles.subtleLine}>Referral Code: {partner?.referral_code || "—"}</p>
</div>

<div style={styles.headerActions}>
<button type="button" onClick={loadPage} style={styles.secondaryButton}>
Refresh
</button>

<button
type="button"
onClick={handleLogout}
style={styles.logoutButton}
disabled={loadingLogout}
>
{loadingLogout ? "Logging Off..." : "Log Off"}
</button>
</div>
</section>

{message ? <div style={styles.notice}>{message}</div> : null}

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>How to Use This Page</p>
<InfoBubble
title="Workshop Resources"
text="Use this page to access workshop decks, prep materials, and future printable forms for partners and facilitators."
/>
</div>
<h2 style={styles.sectionTitle}>Your workshop prep center</h2>
</div>
</div>

<div style={styles.howToGrid}>
<div style={styles.howToCard}>
<p style={styles.howToStep}>1</p>
<p style={styles.howToText}>Download or open the workshop deck before the session.</p>
</div>
<div style={styles.howToCard}>
<p style={styles.howToStep}>2</p>
<p style={styles.howToText}>Use the deck to guide participants through Career Passport and resume building.</p>
</div>
<div style={styles.howToCard}>
<p style={styles.howToStep}>3</p>
<p style={styles.howToText}>Use future forms here for attendance, planning, and follow-up.</p>
</div>
<div style={styles.howToCard}>
<p style={styles.howToStep}>4</p>
<p style={styles.howToText}>Keep all partner workshop materials in one clean place.</p>
</div>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Workshop Decks</p>
<h2 style={styles.sectionTitle}>Current downloadable files</h2>
</div>
</div>

<div style={styles.resourceGrid}>
<div style={styles.resourceCard}>
<p style={styles.resourceType}>PDF</p>
<h3 style={styles.resourceTitle}>YWCA Resume Workshop PDF</h3>
<p style={styles.resourceText}>
Best for quick viewing, printing, or sharing with workshop facilitators.
</p>
<div style={styles.resourceActions}>
<a
href="/ywca-resume-workshop.pdf"
target="_blank"
rel="noreferrer"
style={styles.resourceLink}
>
Open PDF
</a>
<a href="/ywca-resume-workshop.pdf" download style={styles.resourceLink}>
Download PDF
</a>
</div>
</div>

<div style={styles.resourceCard}>
<p style={styles.resourceType}>POWERPOINT</p>
<h3 style={styles.resourceTitle}>YWCA Resume Workshop PowerPoint</h3>
<p style={styles.resourceText}>
Best for editing, presenting live, or customizing for future partner workshops.
</p>
<div style={styles.resourceActions}>
<a href="/ywca-resume-workshop.pptx" download style={styles.resourceLink}>
Download PowerPoint
</a>
</div>
</div>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>Workshop Overview</p>
<InfoBubble
title="Workshop Overview"
text="This area explains the purpose of the workshop and helps partners stay aligned on what participants should leave with."
/>
</div>
<h2 style={styles.sectionTitle}>What this workshop should accomplish</h2>
</div>
</div>

<div style={styles.overviewGrid}>
<div style={styles.overviewCard}>
<p style={styles.overviewTitle}>Core Outcome</p>
<p style={styles.overviewText}>
Participants should leave with stronger visibility, a working Career Passport,
and a resume they can continue building or using right away.
</p>
</div>

<div style={styles.overviewCard}>
<p style={styles.overviewTitle}>Partner Goal</p>
<p style={styles.overviewText}>
Partners should be able to guide the session clearly, connect participants to tools,
and support next-step action after the workshop ends.
</p>
</div>

<div style={styles.overviewCard}>
<p style={styles.overviewTitle}>Recommended Flow</p>
<p style={styles.overviewText}>
Start with account creation or Career Passport, move into resume building,
then highlight toolkit tools that support job search and follow-up.
</p>
</div>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Recommended Materials</p>
<h2 style={styles.sectionTitle}>Items to prepare for resume workshops</h2>
</div>
</div>

<div style={styles.materialGrid}>
{[
"Workshop sign-in sheet",
"Participant action plan",
"Resume checklist",
"Career map worksheet",
"Follow-up tracker",
"Partner facilitation notes",
"Referral handout",
"Mock interview prep sheet",
].map((item) => (
<div key={item} style={styles.materialCard}>
<p style={styles.materialText}>{item}</p>
</div>
))}
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<p style={styles.sectionKicker}>Coming Soon</p>
<h2 style={styles.sectionTitle}>Future printable forms and resources</h2>
</div>
</div>

<div style={styles.materialGrid}>
{[
"Printable intake form",
"Attendance sheet",
"Facilitator checklist",
"Participant follow-up form",
"Workshop reflection sheet",
"Employer workshop interest form",
"Career planning worksheet",
"Resume review handout",
].map((item) => (
<div key={item} style={styles.comingSoonCard}>
<p style={styles.materialText}>{item}</p>
</div>
))}
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
maxWidth: "1480px",
margin: "0 auto",
display: "grid",
gap: "24px",
},
heroCard: {
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: "24px",
flexWrap: "wrap",
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "28px",
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
fontWeight: 700,
color: "#f5f5f5",
},
subtitle: {
margin: 0,
color: "#d4d4d8",
fontSize: "16px",
lineHeight: 1.8,
maxWidth: "860px",
},
subtleLine: {
margin: "6px 0 0",
color: "#a1a1aa",
fontSize: "14px",
},
headerActions: {
display: "flex",
gap: "12px",
flexWrap: "wrap",
alignItems: "center",
},
secondaryButton: {
padding: "12px 16px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.12)",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
cursor: "pointer",
},
logoutButton: {
padding: "12px 16px",
borderRadius: "16px",
border: "1px solid rgba(148,163,184,0.28)",
background: "linear-gradient(180deg, #0f244d 0%, #112b5f 100%)",
color: "#fff",
fontWeight: 700,
cursor: "pointer",
},
notice: {
background: "rgba(250,204,21,0.08)",
border: "1px solid rgba(250,204,21,0.24)",
color: "#fde68a",
borderRadius: "18px",
padding: "14px 16px",
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
titleRow: {
display: "flex",
alignItems: "center",
gap: "8px",
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
infoWrap: {
position: "relative",
display: "inline-flex",
alignItems: "center",
},
infoButton: {
width: "20px",
height: "20px",
borderRadius: "999px",
border: "1px solid rgba(255,255,255,0.18)",
background: "#111111",
color: "#f5f5f5",
fontSize: "12px",
fontWeight: 700,
cursor: "pointer",
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: 0,
},
infoPopup: {
position: "absolute",
top: "28px",
right: 0,
width: "260px",
zIndex: 10,
background: "#111111",
border: "1px solid rgba(255,255,255,0.14)",
borderRadius: "14px",
padding: "12px",
boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
},
infoTitle: {
margin: "0 0 6px",
color: "#ffffff",
fontSize: "13px",
fontWeight: 700,
},
infoText: {
margin: 0,
color: "#d4d4d8",
fontSize: "12px",
lineHeight: 1.6,
},
howToGrid: {
display: "grid",
gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
gap: "14px",
},
howToCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "18px",
background: "#101010",
},
howToStep: {
margin: "0 0 10px",
color: "#60a5fa",
fontSize: "26px",
fontWeight: 800,
},
howToText: {
margin: 0,
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.7,
},
resourceGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "16px",
},
resourceCard: {
border: "1px solid #2c2c2c",
borderRadius: "20px",
padding: "20px",
background: "#101010",
},
resourceType: {
margin: "0 0 10px",
color: "#93c5fd",
fontSize: "12px",
fontWeight: 700,
textTransform: "uppercase",
letterSpacing: "0.08em",
},
resourceTitle: {
margin: "0 0 10px",
color: "#f5f5f5",
fontSize: "22px",
fontWeight: 700,
},
resourceText: {
margin: 0,
color: "#d4d4d8",
fontSize: "14px",
lineHeight: 1.7,
},
resourceActions: {
display: "flex",
gap: "12px",
flexWrap: "wrap",
marginTop: "18px",
},
resourceLink: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: "12px 16px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.12)",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
textDecoration: "none",
},
overviewGrid: {
display: "grid",
gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
gap: "16px",
},
overviewCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "18px",
background: "#101010",
},
overviewTitle: {
margin: "0 0 10px",
color: "#93c5fd",
fontSize: "15px",
fontWeight: 700,
},
overviewText: {
margin: 0,
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.8,
},
materialGrid: {
display: "grid",
gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
gap: "14px",
},
materialCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "16px",
background: "#101010",
minHeight: "84px",
display: "flex",
alignItems: "center",
},
comingSoonCard: {
border: "1px dashed rgba(147,197,253,0.35)",
borderRadius: "18px",
padding: "16px",
background: "rgba(59,130,246,0.06)",
minHeight: "84px",
display: "flex",
alignItems: "center",
},
materialText: {
margin: 0,
color: "#f5f5f5",
fontSize: "14px",
lineHeight: 1.6,
fontWeight: 600,
},
};
