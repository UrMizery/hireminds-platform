"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CustomerServiceGuide4() {
const [timeLeft, setTimeLeft] = useState(30);
const [complete, setComplete] = useState(false);

useEffect(() => {
localStorage.removeItem("cs_guide_4_complete");

const timer = setInterval(() => {
setTimeLeft((prev) => {
if (prev <= 1) {
clearInterval(timer);
localStorage.setItem("cs_guide_4_complete", "true");
setComplete(true);
return 0;
}
return prev - 1;
});
}, 1000);

return () => clearInterval(timer);
}, []);

return (
<main style={styles.page}>
<div style={styles.box}>
<p style={styles.timer}>Demo unlock in: {timeLeft}s</p>

<h1>Guide 4: De-escalation + Difficult Situations</h1>

<h3>Quick Lesson</h3>
<p>
De-escalation means calming a tense situation without arguing,
blaming, or matching the customer’s frustration.
</p>

<ul>
<li>Stay calm</li>
<li>Listen without interrupting</li>
<li>Use respectful language</li>
<li>Acknowledge the concern</li>
<li>Offer the next best step</li>
</ul>

<h3>Scenario</h3>
<p>Customer says: “This is ridiculous. Nobody here knows what they’re doing.”</p>

<p>
Best response:
<br />
A. You need to calm down.
<br />
B. That’s not true.
<br />
C. I hear your frustration. Let’s work through this together.
<br />
D. Walk away.
</p>

<div style={styles.summary}>
<strong>Correct: C</strong>
<p>✅ Correct because it stays calm, acknowledges frustration, and moves toward a solution.</p>
<p>❌ A may sound controlling and can make the person more upset.</p>
<p>❌ B argues instead of listening.</p>
<p>❌ D ignores the customer and damages trust.</p>
</div>

{complete && (
<Link href="/customer-service-demo/guide-5" style={styles.button}>
Continue →
</Link>
)}
</div>
</main>
);
}

const styles: any = {
page: { minHeight: "100vh", padding: "60px", background: "#050816", color: "white" },
box: { maxWidth: "1000px", margin: "auto" },
timer: { color: "#38bdf8", fontWeight: "bold", marginBottom: "20px" },
summary: { marginTop: "30px", padding: "20px", background: "#111827", borderRadius: "14px" },
button: {
display: "inline-block",
marginTop: "30px",
padding: "14px 24px",
background: "#0ea5e9",
borderRadius: "12px",
textDecoration: "none",
color: "white",
fontWeight: "bold",
},
};







"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CustomerServiceGuide5() {
const [timeLeft, setTimeLeft] = useState(30);
const [complete, setComplete] = useState(false);

useEffect(() => {
localStorage.removeItem("cs_guide_5_complete");

const timer = setInterval(() => {
setTimeLeft((prev) => {
if (prev <= 1) {
clearInterval(timer);
localStorage.setItem("cs_guide_5_complete", "true");
setComplete(true);
return 0;
}
return prev - 1;
});
}, 1000);

return () => clearInterval(timer);
}, []);

return (
<main style={styles.page}>
<div style={styles.box}>
<p style={styles.timer}>Demo unlock in: {timeLeft}s</p>

<h1>Guide 5: Service Recovery + Documentation</h1>

<h3>Quick Lesson</h3>
<p>
Service recovery means fixing a customer concern after something went wrong.
Documentation helps track what happened, what was done, and what follow-up is needed.
</p>

<ul>
<li>Apologize professionally</li>
<li>Fix what can be fixed</li>
<li>Explain the next step</li>
<li>Document the concern</li>
<li>Follow up when needed</li>
</ul>

<h3>Scenario</h3>
<p>A customer received the wrong paperwork and is upset.</p>

<p>
Best action:
<br />
A. Blame another department.
<br />
B. Ignore it.
<br />
C. Apologize, correct the paperwork, and document the interaction.
<br />
D. Tell them to come back another day.
</p>

<div style={styles.summary}>
<strong>Correct: C</strong>
<p>✅ Correct because it takes ownership, fixes the issue, and documents what happened.</p>
<p>❌ A shifts blame and sounds unprofessional.</p>
<p>❌ B ignores the problem.</p>
<p>❌ D delays support without solving the concern.</p>
</div>

{complete && (
<Link href="/customer-service-demo/assessment" style={styles.button}>
Start Assessment →
</Link>
)}
</div>
</main>
);
}

const styles: any = {
page: { minHeight: "100vh", padding: "60px", background: "#050816", color: "white" },
box: { maxWidth: "1000px", margin: "auto" },
timer: { color: "#38bdf8", fontWeight: "bold", marginBottom: "20px" },
summary: { marginTop: "30px", padding: "20px", background: "#111827", borderRadius: "14px" },
button: {
display: "inline-block",
marginTop: "30px",
padding: "14px 24px",
background: "#0ea5e9",
borderRadius: "12px",
textDecoration: "none",
color: "white",
fontWeight: "bold",
},
};
