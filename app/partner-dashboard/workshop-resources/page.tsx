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

type ResourceItem = {
type: string;
title: string;
description: string;
href: string;
isReady: boolean;
openInNewTab?: boolean;
};

export default function PartnerWorkshopResourcesPage() {
const [loading, setLoading] = useState(true);
const [loadingLogout, setLoadingLogout] = useState(false);
const [message, setMessage] = useState("");
const [partner, setPartner] = useState<PartnerRow | null>(null);

const mountedRef = useRef(true);

const resources: ResourceItem[] = [
{
type: "PDF",
title: "YWCA Resume Workshop PDF",
description:
"Best for quick viewing, printing, or sharing with workshop facilitators.",
href: "/ywca-resume-workshop.pdf",
isReady: true,
openInNewTab: true,
},
{
type: "POWERPOINT",
title: "YWCA Resume Workshop PowerPoint",
description:
"Best for editing, presenting live, or customizing for future partner workshops.",
href: "/ywca-resume-workshop.pptx",
isReady: true,
},
{
type: "PRINTABLE PDF",
title: "HireMinds Password Reminder Strips",
description:
"Printable cut-apart reminder strips for participants to write down their HireMinds login details and tools they want to explore.",
href: "/hireminds_password_sheet_printable%202.pdf",
isReady: true,
openInNewTab: true,
},
{
type: "PRINTABLE PDF",
title: "HireMinds Referral Access Strips",
description:
"Printable referral strips with the YWCA code, website, email, and QR for workshop participants to take with them.",
href: "/hireminds_referral_strips_ywca_printable%202.pdf",
isReady: true,
openInNewTab: true,
},
{
type: "PRINTABLE PDF",
title: "Attendance Sheet",
description:
"Printable sign-in form for workshop attendance, contact details, date, and organization.",
href: "/attendance-sheet.pdf",
isReady: false,
openInNewTab: true,
},
{
type: "PRINTABLE PDF",
title: "Resume Review Handout",
description:
"Printable worksheet that helps participants organize experience, skills, education, and accomplishments in the right order.",
href: "/resume-review-handout.pdf",
isReady: false,
openInNewTab: true,
},
{
type: "PRINTABLE PDF",
title: "Workshop Reflection Sheet",
description:
"Printable reflection form for takeaways, confidence, next steps, and support still needed after the session.",
href: "/workshop-reflection-sheet.pdf",
isReady: false,
openInNewTab: true,
},
];

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
<h1 style={styles.title}>Partner Workshop Resources</h1>
<p style={styles.subtitle}>
This is your workshop command center for partner delivery. Use it to guide
preparation, access the main workshop deck, organize print materials, and
create a cleaner, more confident experience for participants from start to finish.
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
title="How to Use This Page"
text="Use this page to prep your session, review key talking points, access decks, and keep all workshop materials in one place."
/>
</div>
<h2 style={styles.sectionTitle}>How to use this page</h2>
</div>
</div>

<div style={styles.howToGrid}>
<div style={styles.howToCard}>
<p style={styles.howToStep}>1</p>
<p style={styles.howToText}>
Start here before the workshop so everything you need is in one place.
</p>
</div>
<div style={styles.howToCard}>
<p style={styles.howToStep}>2</p>
<p style={styles.howToText}>
Use the deck to guide the session and reinforce what participants should complete before they leave.
</p>
</div>
<div style={styles.howToCard}>
<p style={styles.howToStep}>3</p>
<p style={styles.howToText}>
Print materials ahead of time so participants have structure, reminders, and take-home resources.
</p>
</div>
<div style={styles.howToCard}>
<p style={styles.howToStep}>4</p>
<p style={styles.howToText}>
Keep this page as your go-to partner prep space for future workshops tools.
</p>
</div>
</div>

<div style={styles.talkingPointsWrap}>
<p style={styles.talkingPointsTitle}>Suggested talking points</p>
<div style={styles.talkingPointsGrid}>
<div style={styles.talkingPointCard}>
<p style={styles.talkingPointText}>
“Today we’re going to build visibility, confidence, and practical next steps.”
</p>
</div>
<div style={styles.talkingPointCard}>
<p style={styles.talkingPointText}>
“The goal is not just to talk about career goals, but to leave with something usable.”
</p>
</div>
<div style={styles.talkingPointCard}>
<p style={styles.talkingPointText}>
“HireMinds gives you tools you can continue using after this workshop ends.”
</p>
</div>
<div style={styles.talkingPointCard}>
<p style={styles.talkingPointText}>
“Your Career Passport and resume can keep growing with you as your goals evolve.”
</p>
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
text="This section defines the intended outcomes and expectations so partners can run the workshop with clarity and consistency."
/>
</div>
<h2 style={styles.sectionTitle}>Outcomes and expectations</h2>
</div>
</div>

<div style={styles.overviewGrid}>
<div style={styles.overviewCard}>
<p style={styles.overviewTitle}>What participants should leave with</p>
<p style={styles.overviewText}>
Participants should leave with stronger visibility, a working Career Passport,
clearer direction, and resume progress they can build on immediately.
</p>
</div>

<div style={styles.overviewCard}>
<p style={styles.overviewTitle}>What partners should guide</p>
<p style={styles.overviewText}>
Partners should guide participants through setup, encourage completion of core sections,
and connect participants to the right HireMinds tools for next steps.
</p>
</div>

<div style={styles.overviewCard}>
<p style={styles.overviewTitle}>What success looks like</p>
<p style={styles.overviewText}>
A strong session ends with participants feeling more prepared, more organized,
and more confident about what to do after the workshop.
</p>
</div>
</div>
</section>

<section style={styles.card}>
<div style={styles.sectionTop}>
<div>
<div style={styles.titleRow}>
<p style={styles.sectionKicker}>Workshop Decks, Materials & Printables</p>
<InfoBubble
title="Workshop Decks, Materials & Printables"
text="This is the full workshop resource cluster, including live files and placeholder paths for files that will be created next."
/>
</div>
<h2 style={styles.sectionTitle}>All workshop decks, materials and printable materials</h2>
</div>
</div>

<div style={styles.resourceGrid}>
{resources.map((item) => (
<div
key={item.title}
style={item.isReady ? styles.resourceCard : styles.resourceCardPending}
>
<p style={styles.resourceType}>{item.type}</p>
<h3 style={styles.resourceTitle}>{item.title}</h3>
<p style={styles.resourceText}>{item.description}</p>

<div style={styles.pathWrap}>
<p style={styles.pathLabel}>File path</p>
<code style={styles.pathCode}>{item.href}</code>
</div>

<div style={styles.resourceActions}>
{item.isReady ? (
<>
{item.openInNewTab ? (
<a
href={item.href}
target="_blank"
rel="noreferrer"
style={styles.resourceLink}
>
Open File
</a>
) : null}
<a href={item.href} download style={styles.resourceLink}>
Download File
</a>
</>
) : (
<span style={styles.comingSoonBadge}>Create this file next</span>
)}
</div>
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
talkingPointsWrap: {
marginTop: "22px",
},
talkingPointsTitle: {
margin: "0 0 12px",
color: "#ffffff",
fontSize: "18px",
fontWeight: 700,
},
talkingPointsGrid: {
display: "grid",
gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
gap: "14px",
},
talkingPointCard: {
border: "1px solid #2c2c2c",
borderRadius: "18px",
padding: "16px",
background: "rgba(59,130,246,0.08)",
},
talkingPointText: {
margin: 0,
color: "#e5e7eb",
fontSize: "14px",
lineHeight: 1.7,
fontWeight: 600,
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
resourceGrid: {
display: "grid",
gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
gap: "16px",
},
resourceCard: {
border: "1px solid #2c2c2c",
borderRadius: "20px",
padding: "20px",
background: "#101010",
},
resourceCardPending: {
border: "1px dashed rgba(147,197,253,0.35)",
borderRadius: "20px",
padding: "20px",
background: "rgba(59,130,246,0.06)",
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
pathWrap: {
marginTop: "16px",
display: "grid",
gap: "6px",
},
pathLabel: {
margin: 0,
color: "#93c5fd",
fontSize: "12px",
fontWeight: 700,
textTransform: "uppercase",
letterSpacing: "0.06em",
},
pathCode: {
display: "block",
padding: "10px 12px",
borderRadius: "12px",
background: "#0b0b0c",
border: "1px solid #2c2c2c",
color: "#e5e7eb",
fontSize: "13px",
whiteSpace: "pre-wrap",
wordBreak: "break-all",
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
comingSoonBadge: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
padding: "12px 16px",
borderRadius: "16px",
border: "1px dashed rgba(147,197,253,0.35)",
background: "rgba(59,130,246,0.06)",
color: "#bfdbfe",
fontWeight: 700,
},
};
