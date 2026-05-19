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
