"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STUDY_TIME = 11 * 60;

export default function HealthcareAdminStudy() {
const [secondsLeft, setSecondsLeft] = useState(STUDY_TIME);
const [complete, setComplete] = useState(false);

useEffect(() => {
const timer = setInterval(() => {
setSecondsLeft((prev) => {
if (prev <= 1) {
clearInterval(timer);
localStorage.setItem("healthcareAdminStudyComplete", "true");
setComplete(true);
return 0;
}
return prev - 1;
});
}, 1000);

return () => clearInterval(timer);
}, []);

const minutes = Math.floor(secondsLeft / 60);
const seconds = secondsLeft % 60;

return (
<main style={styles.main}>
<h1 style={styles.title}>Healthcare Administration Basics</h1>

<p style={styles.subtitle}>
This guide prepares you for front desk, patient access, and administrative
roles in healthcare settings.
</p>

<div style={styles.timer}>
⏱ {minutes}:{seconds.toString().padStart(2, "0")}
</div>

{/* PATIENT INTAKE */}
<section style={styles.card}>
<h2>Patient Intake & First Impressions</h2>

<p>
Patient intake is the first step of the healthcare experience. This is
where patients check in, provide their information, and begin their visit.
</p>

<p>
Your role is to create a smooth, respectful, and professional experience.
Many patients may be nervous, in pain, or unsure of what to expect.
</p>

<ul>
<li>Greet patients clearly and professionally</li>
<li>Verify identity (name and date of birth)</li>
<li>Confirm appointment details</li>
<li>Collect or confirm insurance information</li>
</ul>

<p>
Accuracy is critical. Even small mistakes in spelling, date of birth,
or insurance details can lead to delays, billing issues, or patient
frustration.
</p>
</section>

{/* HIPAA */}
<section style={styles.card}>
<h2>HIPAA & Patient Privacy</h2>

<p>
HIPAA (Health Insurance Portability and Accountability Act) protects
patient health information.
</p>

<p>
In healthcare roles, you are responsible for maintaining privacy at all
times — both in person and over the phone.
</p>

<ul>
<li>Never share patient information without authorization</li>
<li>Always verify identity before discussing details</li>
<li>Avoid speaking loudly about patient information</li>
<li>Do not leave screens or documents visible</li>
</ul>

<p>
Even casual conversations can be violations. Being careful, aware, and
professional protects both the patient and the organization.
</p>
</section>

{/* SCHEDULING */}
<section style={styles.card}>
<h2>Scheduling & Office Coordination</h2>

<p>
Scheduling is a core responsibility in healthcare administration.
It affects providers, staff, and patients.
</p>

<p>
A well-managed schedule keeps the office running smoothly, while poor
scheduling can create delays and frustration.
</p>

<ul>
<li>Avoid double booking unless instructed</li>
<li>Confirm appointment times and providers</li>
<li>Communicate delays or changes clearly</li>
<li>Document cancellations or no-shows properly</li>
</ul>

<p>
Strong organization and attention to detail are essential in this role.
</p>
</section>

{/* INSURANCE */}
<section style={styles.card}>
<h2>Insurance Basics</h2>

<p>
Patients often have questions or concerns about insurance coverage.
Many do not fully understand their plans.
</p>

<p>
Your role is not to diagnose coverage but to guide patients and help
them understand next steps.
</p>

<ul>
<li>Verify insurance information before visits</li>
<li>Remain calm and professional during confusion</li>
<li>Direct patients to the appropriate department when needed</li>
</ul>

<p>
Professionalism is especially important when patients are frustrated
or confused about costs.
</p>
</section>

{/* COMMUNICATION */}
<section style={styles.card}>
<h2>Professional Communication</h2>

<p>
Communication is one of the most important skills in healthcare
administration.
</p>

<p>
Patients rely on you for clarity, direction, and reassurance.
</p>

<ul>
<li>Use clear and simple language</li>
<li>Remain calm under pressure</li>
<li>Listen actively before responding</li>
<li>Show empathy and respect</li>
</ul>

<p>
Your tone, body language, and word choice all impact how patients
experience care.
</p>
</section>

{complete ? (
<Link href="/healthcare-admin-assessment" style={styles.button}>
Start Assessment
</Link>
) : (
<div style={styles.locked}>
Complete the timer to unlock the assessment
</div>
)}
</main>
);
}

const styles = {
main: {
padding: 30,
color: "#fff",
background: "#050505",
minHeight: "100vh",
},
title: {
fontSize: 32,
marginBottom: 10,
},
subtitle: {
marginBottom: 20,
opacity: 0.8,
},
timer: {
marginBottom: 20,
fontSize: 18,
},
card: {
background: "#111",
padding: 22,
borderRadius: 12,
marginBottom: 16,
lineHeight: 1.6,
},
button: {
background: "#fff",
color: "#000",
padding: 12,
borderRadius: 10,
textDecoration: "none",
},
locked: {
opacity: 0.6,
},
};
