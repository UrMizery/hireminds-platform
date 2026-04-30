"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const REQUIRED_CODE = "TWP2026";

type Session = {
week: string;
day: string;
title: string;
duration: string;
description: string;
studyHref?: string;
assessmentHref?: string;
statusKey?: string;
};

const sessions: Session[] = [
// WEEK 1
{
week: "Week 1",
day: "Day 1",
title: "Orientation",
duration: "2 hr session",
description:
"Program overview, expectations, HireMinds walkthrough, and career goal setting.",
},
{
week: "Week 1",
day: "Day 2",
title: "Introduction to Healthcare Careers",
duration: "2 hr session",
description:
"Explore healthcare roles, environments, and entry-level opportunities.",
},
{
week: "Week 1",
day: "Day 3",
title: "Customer Service Foundations",
duration: "2 hr session",
description:
"Learn professionalism, patient interaction basics, and service expectations.",
},

// WEEK 2
{
week: "Week 2",
day: "Day 4",
title: "Customer Service Methodology",
duration: "2 hr session",
description:
"Deep dive into communication, active listening, and service scenarios.",
},
{
week: "Week 2",
day: "Day 5",
title: "Medical Terminology",
duration: "2 hr session",
description:
"Prefixes, suffixes, root words, and real healthcare language usage.",
studyHref: "/medical-terminology-study",
assessmentHref: "/medical-terminology-assessment",
statusKey: "medicalTerminologyStudyComplete",
},
{
week: "Week 2",
day: "Day 6",
title: "Home & Community-Based Healthcare",
duration: "2 hr session",
description:
"Patient intake, HIPAA, scheduling, insurance, and communication workflows.",
studyHref: "/healthcare-admin-study",
assessmentHref: "/healthcare-admin-assessment",
statusKey: "healthcareAdminStudyComplete",
},

// WEEK 3
{
week: "Week 3",
day: "Day 7",
title: "CPR & First Aid",
duration: "2 hr session",
description:
"Training overview and preparation for certification (external).",
},
{
week: "Week 3",
day: "Day 8",
title: "Healthcare Job Search",
duration: "2 hr session",
description:
"Job search strategies, reading job descriptions, and tracking applications.",
},
{
week: "Week 3",
day: "Day 9",
title: "Resume + Interview Prep",
duration: "2 hr session",
description:
"Use HireMinds tools to build resumes and practice interviews.",
},
];

export default function SkillsQuestPage() {
const [allowed, setAllowed] = useState(false);
const [checked, setChecked] = useState(false);
const [completed, setCompleted] = useState<Record<string, boolean>>({});

useEffect(() => {
async function checkAccess() {
const {
data: { session },
} = await supabase.auth.getSession();

const user = session?.user;

const userReferralCode = String(
user?.user_metadata?.referral_code ||
user?.user_metadata?.referralCode ||
user?.user_metadata?.access_code ||
""
)
.toUpperCase()
.trim();

const completionMap: Record<string, boolean> = {};

sessions.forEach((s) => {
if (s.statusKey) {
completionMap[s.statusKey] =
localStorage.getItem(s.statusKey) === "true";
}
});

setAllowed(userReferralCode === REQUIRED_CODE);
setCompleted(completionMap);
setChecked(true);
}

checkAccess();
}, []);

if (!checked) {
return <main style={styles.main}>Loading...</main>;
}

if (!allowed) {
return (
<main style={styles.main}>
<h1>SkillsQuest Locked</h1>
</main>
);
}

const activeCount = sessions.filter((s) => s.studyHref).length;
const completeCount = sessions.filter(
(s) => s.statusKey && completed[s.statusKey]
).length;

return (
<main style={styles.main}>
<h1 style={styles.title}>SkillsQuest</h1>

<p style={styles.subtitle}>
Healthcare Career Orientation • 3 Weeks • 9 Sessions • 18 Hours
</p>

<div style={styles.progress}>
Progress: {completeCount}/{activeCount} active sessions completed
</div>

<div style={styles.grid}>
{sessions.map((s) => {
const isComplete = s.statusKey && completed[s.statusKey];
const isActive = !!s.studyHref;

return (
<div key={s.day} style={styles.card}>
<div style={styles.top}>
<span>{s.week}</span>
<span>{s.day}</span>
</div>

<h3>{s.title}</h3>
<p>{s.description}</p>

<small>{s.duration}</small>

<div style={styles.status}>
{isComplete
? "Completed"
: isActive
? "Active Session"
: "Trainer Led"}
</div>

{isActive ? (
<div style={styles.buttons}>
<Link href={s.studyHref!} style={styles.primary}>
Study
</Link>

{isComplete ? (
<Link href={s.assessmentHref!} style={styles.secondary}>
Assessment
</Link>
) : (
<span style={styles.locked}>Complete Study First</span>
)}
</div>
) : (
<div style={styles.locked}>Trainer Led Session</div>
)}
</div>
);
})}
</div>
</main>
);
}

const styles: any = {
main: { padding: 30, background: "#050505", color: "#fff" },
title: { fontSize: 40 },
subtitle: { opacity: 0.8, marginBottom: 20 },
progress: { marginBottom: 20 },
grid: { display: "grid", gap: 16 },
card: {
background: "#111",
padding: 20,
borderRadius: 12,
},
top: { display: "flex", justifyContent: "space-between" },
status: { marginTop: 10, fontWeight: "bold" },
buttons: { marginTop: 10, display: "flex", gap: 10 },
primary: { background: "#fff", color: "#000", padding: 8 },
secondary: { background: "#0A84FF", color: "#fff", padding: 8 },
locked: { opacity: 0.6 },
};
