"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STUDY_TIME = 11 * 60; // 11 minutes

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

<div style={styles.timer}>
⏱ {minutes}:{seconds.toString().padStart(2, "0")}
</div>

<section style={styles.card}>
<h2>Patient Intake</h2>
<p>
The first interaction a patient has sets the tone. You are responsible
for greeting, verifying information, and ensuring the patient feels
comfortable and respected.
</p>
</section>

<section style={styles.card}>
<h2>HIPAA Basics</h2>
<p>
Patient information is private. Never share personal health
information. Always verify identity before discussing anything.
</p>
</section>

<section style={styles.card}>
<h2>Scheduling</h2>
<p>
Accuracy matters. Double booking, missed appointments, and poor
communication can impact patient care.
</p>
</section>

<section style={styles.card}>
<h2>Insurance Basics</h2>
<p>
Patients may not understand coverage. Your role is to guide, clarify,
and remain professional even when situations are stressful.
</p>
</section>

<section style={styles.card}>
<h2>Professional Communication</h2>
<p>
Stay calm, respectful, and clear. Patients may be anxious — your tone
matters just as much as your words.
</p>
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
title: { fontSize: 32, marginBottom: 20 },
timer: { marginBottom: 20, fontSize: 18 },
card: {
background: "#111",
padding: 20,
borderRadius: 12,
marginBottom: 16,
},
button: {
background: "#fff",
color: "#000",
padding: 12,
borderRadius: 10,
textDecoration: "none",
display: "inline-block",
},
locked: { opacity: 0.6 },
};
