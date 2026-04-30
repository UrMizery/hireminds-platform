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
<h1 style={styles.title}>Healthcare Admin Basics</h1>

<p style={styles.subtitle}>
You are preparing for roles like Patient Access Rep, Front Desk, and Medical Admin.
</p>

<div style={styles.timer}>
⏱ {minutes}:{seconds.toString().padStart(2, "0")}
</div>

{/* PATIENT INTAKE */}
<section style={styles.card}>
<h2>Patient Intake (Real Workflow)</h2>

<p>
You are the first point of contact. Your job is to:
</p>

<ul>
<li>Greet the patient professionally</li>
<li>Verify name, DOB, insurance</li>
<li>Confirm appointment details</li>
</ul>

<p><strong>What to say:</strong></p>
<p style={styles.example}>
“Hi, welcome in. Can I verify your name and date of birth?”
</p>

<p><strong>What NOT to say:</strong></p>
<p style={styles.bad}>
“What’s your info?” (too vague, unprofessional)
</p>
</section>

{/* HIPAA */}
<section style={styles.card}>
<h2>HIPAA (Privacy Basics)</h2>

<p>
You cannot share patient information unless authorized.
</p>

<ul>
<li>Never discuss patient info out loud</li>
<li>Always verify identity first</li>
<li>Do not leave screens visible</li>
</ul>

<p style={styles.scenario}>
Scenario: Someone calls asking about a patient.
<br />
✅ Correct: “I need to verify authorization before sharing information.”
</p>
</section>

{/* SCHEDULING */}
<section style={styles.card}>
<h2>Scheduling</h2>

<p>
Mistakes here affect the entire office.
</p>

<ul>
<li>Avoid double booking</li>
<li>Confirm time + provider</li>
<li>Communicate delays clearly</li>
</ul>

<p style={styles.scenario}>
Scenario: Doctor is running late.
<br />
✅ “There’s a delay of about 15 minutes, thank you for your patience.”
</p>
</section>

{/* INSURANCE */}
<section style={styles.card}>
<h2>Insurance Basics</h2>

<p>
Patients are often confused or frustrated.
</p>

<ul>
<li>Verify insurance before visit</li>
<li>Do not guess coverage</li>
<li>Stay calm under pressure</li>
</ul>

<p style={styles.bad}>
❌ “That’s not covered, not my problem”
</p>

<p style={styles.example}>
✅ “Let me help check that for you and guide you through it.”
</p>
</section>

{/* COMMUNICATION */}
<section style={styles.card}>
<h2>Professional Communication</h2>

<ul>
<li>Stay calm</li>
<li>Use clear language</li>
<li>Be respectful at all times</li>
</ul>

<p style={styles.scenario}>
Scenario: Patient is upset.
<br />
✅ “I understand this is frustrating, let me help resolve it.”
</p>
</section>

{/* QUICK CHECK */}
<section style={styles.card}>
<h2>Quick Check</h2>

<p>What should you do before discussing patient info?</p>
<p style={styles.answer}>✔ Verify identity</p>
</section>

{complete ? (
<Link href="/healthcare-admin-assessment" style={styles.button}>
Start Assessment
</Link>
) : (
<div style={styles.locked}>Complete timer to unlock assessment</div>
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
title: { fontSize: 32, marginBottom: 10 },
subtitle: { marginBottom: 20, opacity: 0.8 },
timer: { marginBottom: 20, fontSize: 18 },
card: {
background: "#111",
padding: 20,
borderRadius: 12,
marginBottom: 16,
},
example: { color: "#7dffb3" },
bad: { color: "#ff9d9d" },
scenario: { marginTop: 10, fontStyle: "italic" },
answer: { color: "#7dffb3", fontWeight: "bold" },
button: {
background: "#fff",
color: "#000",
padding: 12,
borderRadius: 10,
textDecoration: "none",
},
locked: { opacity: 0.6 },
};
