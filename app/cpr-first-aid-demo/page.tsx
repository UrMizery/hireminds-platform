"use client";

import Link from "next/link";

const freeResources = [
{
title: "American Red Cross First Aid Steps",
href: "https://www.redcross.org/take-a-class/first-aid/performing-first-aid/first-aid-steps",
note: "Free first aid awareness steps and emergency response guidance.",
},
{
title: "American Heart Association CPR Information",
href: "https://cpr.heart.org/en/resources/what-is-cpr",
note: "Introductory CPR information and emergency response education.",
},
{
title: "MedlinePlus Health Topics",
href: "https://medlineplus.gov/healthtopics.html",
note: "Free health topics from the U.S. National Library of Medicine.",
},
{
title: "CDC Health Topics",
href: "https://www.cdc.gov/health-topics.html",
note: "Public health, safety, disease, and emergency preparedness topics.",
},
{
title: "Google Health",
href: "https://health.google/",
note: "Consumer health information and healthcare technology resources.",
},
];

export default function CPRFirstAidDemoPage() {
return (
<main style={styles.main}>
<section style={styles.card}>
<p style={styles.kicker}>TWP2026 • Day 3</p>
<h1 style={styles.title}>CPR + First Aid Awareness</h1>

<p style={styles.subtitle}>
This trainer-led session introduces participants to emergency
awareness, basic first aid concepts, CPR awareness, choking response,
and common medical emergency recognition. HireMinds does not issue CPR
or First Aid certification; certification should come from an approved
training provider.
</p>

<div style={styles.banner}>
<strong>Trainer-Led / External Certification Support</strong>
<p>
This page supports class discussion and awareness only. Participants
should complete CPR and First Aid certification through a qualified
instructor or approved provider when certification is required.
</p>
</div>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>Why This Matters</h2>
<div style={styles.box}>
<p>
Healthcare support workers, community health workers, direct
support professionals, front desk staff, home care workers, and
customer-facing team members may be the first people to notice when
someone needs help. Even when a role is not clinical, emergency
awareness can help workers respond calmly, notify the right
people, and follow workplace procedures.
</p>
<p>
This session helps participants understand the importance of
staying calm, observing the scene, calling for help, following
employer policy, and never performing techniques beyond their
level of training.
</p>
</div>
</section>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>Emergency Awareness Topics</h2>

<div style={styles.stack}>
<div style={styles.box}>
<h3 style={styles.boxTitle}>Scene Safety</h3>
<p>
Before helping, workers should look for obvious hazards such as
traffic, electrical risks, fire, violence, unsafe surfaces,
chemicals, or anything that could put them or others in danger.
</p>
</div>

<div style={styles.box}>
<h3 style={styles.boxTitle}>Calling for Help</h3>
<p>
Participants review when to notify a supervisor, when to call
emergency services, and why clear communication matters during
emergencies.
</p>
</div>

<div style={styles.box}>
<h3 style={styles.boxTitle}>CPR Awareness</h3>
<p>
CPR stands for cardiopulmonary resuscitation. It is an emergency
lifesaving procedure used when someone’s heart stops beating.
Formal CPR practice and certification should be completed
through approved instruction.
</p>
</div>

<div style={styles.box}>
<h3 style={styles.boxTitle}>Choking Awareness</h3>
<p>
Participants discuss common warning signs of choking, the
importance of acting quickly, and why they should follow
approved training procedures.
</p>
</div>

<div style={styles.box}>
<h3 style={styles.boxTitle}>Stroke Warning Signs</h3>
<p>
A common awareness tool is FAST: Face drooping, Arm weakness,
Speech difficulty, and Time to call emergency services.
</p>
</div>

<div style={styles.box}>
<h3 style={styles.boxTitle}>Workplace Response</h3>
<p>
Workers should follow their employer’s emergency action plan,
document incidents as required, and communicate professionally
with supervisors or emergency responders.
</p>
</div>
</div>
</section>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>Common Workplace Emergencies</h2>
<div style={styles.listCard}>
<ul>
<li>Falls, slips, or trips</li>
<li>Choking or breathing difficulty</li>
<li>Chest pain or cardiac emergency awareness</li>
<li>Stroke warning signs</li>
<li>Bleeding incidents</li>
<li>Allergic reactions</li>
<li>Heat-related illness</li>
<li>Dizziness, fainting, or unresponsiveness</li>
<li>Burns or minor injuries</li>
<li>Confusion, panic, or distress</li>
</ul>
</div>
</section>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>Trusted Free Learning Resources</h2>

<div style={styles.stack}>
{freeResources.map((resource) => (
<a
key={resource.href}
href={resource.href}
target="_blank"
rel="noopener noreferrer"
style={styles.resourceCard}
>
<h3 style={styles.boxTitle}>{resource.title}</h3>
<p>{resource.note}</p>
<span style={styles.resourceLink}>Open Resource →</span>
</a>
))}
</div>

<p style={styles.sourceNote}>
These resources include official or widely recognized health and
safety education sources, including Red Cross first aid steps,
American Heart Association CPR information, MedlinePlus, CDC health
topics, and Google Health. [oai_citation:0‡American Red Cross](https://www.redcross.org/take-a-class/first-aid/performing-first-aid/first-aid-steps?srsltid=AfmBOopzbZIqy59mCvY7lyZ67UFjshZZPQh88p1iFK6YJT8Sj7Jdq662&utm_source=chatgpt.com)
</p>
</section>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>Class Discussion Activity</h2>
<div style={styles.discussionBox}>
<p>
A participant at a community event becomes dizzy and appears
confused. What should you do first? Who should you notify? What
information should you communicate clearly?
</p>
</div>
</section>

<Link href="/skillsquest" style={styles.button}>
Back to Career Pathway
</Link>
</section>
</main>
);
}

const styles: Record<string, React.CSSProperties> = {
main: {
minHeight: "100vh",
background:
"radial-gradient(circle at top left, rgba(0,122,255,.22), transparent 35%), linear-gradient(180deg,#050505,#101010)",
color: "#fff",
padding: 24,
fontFamily: "system-ui, Arial, sans-serif",
},
card: {
maxWidth: 1050,
margin: "0 auto",
padding: 30,
background: "rgba(255,255,255,.06)",
borderRadius: 22,
border: "1px solid rgba(255,255,255,.12)",
lineHeight: 1.7,
},
kicker: {
color: "#7db7ff",
fontWeight: 900,
fontSize: 12,
textTransform: "uppercase",
letterSpacing: 1.3,
},
title: {
fontSize: 44,
fontWeight: 950,
margin: "8px 0",
},
subtitle: {
color: "rgba(255,255,255,.78)",
maxWidth: 920,
fontSize: 16,
},
banner: {
marginTop: 25,
padding: 20,
background: "rgba(10,132,255,.15)",
border: "1px solid rgba(125,183,255,.22)",
borderRadius: 16,
},
section: {
marginTop: 34,
},
sectionTitle: {
fontSize: 28,
marginBottom: 16,
},
stack: {
display: "flex",
flexDirection: "column",
gap: 18,
},
box: {
padding: 26,
borderRadius: 18,
background: "rgba(0,0,0,.35)",
border: "1px solid rgba(255,255,255,.10)",
},
boxTitle: {
fontSize: 24,
marginBottom: 14,
color: "#7db7ff",
},
listCard: {
padding: 22,
borderRadius: 18,
background: "rgba(0,0,0,.28)",
border: "1px solid rgba(255,255,255,.10)",
},
resourceCard: {
display: "block",
padding: 24,
borderRadius: 18,
background: "rgba(0,0,0,.35)",
border: "1px solid rgba(255,255,255,.10)",
color: "#fff",
textDecoration: "none",
},
resourceLink: {
color: "#9ed0ff",
fontWeight: 900,
},
sourceNote: {
color: "rgba(255,255,255,.62)",
fontSize: 13,
marginTop: 14,
},
discussionBox: {
padding: 22,
borderRadius: 18,
background: "rgba(125,183,255,.10)",
border: "1px solid rgba(125,183,255,.20)",
},
button: {
display: "inline-block",
marginTop: 28,
background: "#fff",
color: "#000",
padding: "12px 18px",
borderRadius: 12,
textDecoration: "none",
fontWeight: 900,
},
};
