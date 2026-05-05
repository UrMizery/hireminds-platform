"use client";

import React, { useRef } from "react";

const REQUIRED_SECONDS = 180; // 🔥 3 minutes

const COMPLETION_KEY = "nhp_career_readiness_complete";
const ASSESSMENT_KEY = "nhp_career_readiness_passed";

export default function Page() {
const certRef = useRef<HTMLDivElement | null>(null);

const [seconds, setSeconds] = React.useState(REQUIRED_SECONDS);
const [complete, setComplete] = React.useState(false);
const [passed, setPassed] = React.useState(false);

React.useEffect(() => {
const saved = localStorage.getItem(COMPLETION_KEY) === "true";
const savedPass = localStorage.getItem(ASSESSMENT_KEY) === "true";

if (saved) {
setComplete(true);
setSeconds(0);
}

if (savedPass) setPassed(true);
}, []);

React.useEffect(() => {
if (complete) return;

const timer = setInterval(() => {
setSeconds((prev) => {
if (prev <= 1) {
clearInterval(timer);
setComplete(true);
localStorage.setItem(COMPLETION_KEY, "true");
return 0;
}
return prev - 1;
});
}, 1000);

return () => clearInterval(timer);
}, [complete]);

function passAssessment() {
setPassed(true);
localStorage.setItem(ASSESSMENT_KEY, "true");
}

function printCert() {
const printContents = certRef.current?.innerHTML;
const win = window.open("", "", "width=900,height=700");

if (!win || !printContents) return;

win.document.write(`
<html>
<head>
<title>Certificate</title>
<style>
body { font-family: Arial; margin:0; padding:40px; }
.cert {
border: 3px solid black;
padding: 40px;
text-align: center;
}
h1 { font-size: 42px; margin: 10px 0; }
.big { font-size: 28px; margin: 20px 0; }
</style>
</head>
<body>
${printContents}
</body>
</html>
`);

win.document.close();
win.print();
}

return (
<main style={styles.main}>
<div style={styles.card}>
<h1 style={styles.title}>Career Readiness</h1>

{/* TIMER */}
<div style={styles.timer}>
{complete
? "Study Guide Complete"
: `Time Remaining: ${seconds}s`}
</div>

{/* 🔥 CONTENT TOP 4 */}
<section style={styles.section}>
<h2>Purpose</h2>
<p>
Career readiness prepares individuals with the skills,
mindset, and behaviors needed to enter and succeed in
the workforce. It bridges the gap between learning and
real-world job expectations.
</p>

<h2>Employer Expectations</h2>
<p>
Employers expect reliability, communication, teamwork,
and accountability. These skills are often more important
than technical experience when starting a new role.
</p>

<h2>Professional Behavior</h2>
<p>
Being on time, dressing appropriately, and communicating
respectfully all contribute to long-term employment success.
</p>

<h2>Resume Alignment</h2>
<p>
A strong resume highlights relevant skills and aligns with
job descriptions to increase interview opportunities.
</p>
</section>

{/* 🔥 CONTENT BOTTOM 4 */}
<section style={styles.section}>
<h2>Workplace Communication</h2>
<p>
Clear communication ensures tasks are completed correctly
and builds trust with supervisors and team members.
</p>

<h2>Adaptability</h2>
<p>
The ability to adjust to new environments, schedules,
and expectations is critical in today’s workforce.
</p>

<h2>Problem Solving</h2>
<p>
Employees must be able to think through challenges and
find solutions independently or with support.
</p>

<h2>Growth Mindset</h2>
<p>
Continuous learning and openness to feedback help individuals
grow and advance in their careers.
</p>
</section>

{/* ASSESSMENT */}
{complete && !passed && (
<button style={styles.button} onClick={passAssessment}>
Pass Demo Assessment
</button>
)}

{/* CERTIFICATE */}
{passed && (
<>
<div ref={certRef} className="cert" style={styles.cert}>
<p>CERTIFICATE OF COMPLETION</p>
<h1>HireMinds</h1>
<p>This certifies that</p>

<div className="big">Participant</div>

<p>has successfully completed</p>

<h2>Career Readiness Training</h2>

<p>with a passing score of</p>

<h1>100%</h1>

<p>{new Date().toLocaleDateString()}</p>
</div>

<button style={styles.button} onClick={printCert}>
Print Certificate
</button>
</>
)}
</div>
</main>
);
}

const styles: any = {
main: {
minHeight: "100vh",
background: "#050505",
color: "#fff",
padding: 30,
},
card: {
maxWidth: 900,
margin: "auto",
},
title: {
fontSize: 40,
marginBottom: 20,
},
timer: {
marginBottom: 20,
fontWeight: "bold",
},
section: {
marginBottom: 30,
lineHeight: 1.6,
},
button: {
padding: "12px 18px",
marginTop: 20,
cursor: "pointer",
},
cert: {
background: "#fff",
color: "#000",
marginTop: 40,
padding: 40,
textAlign: "center",
border: "3px solid black",
},
};
