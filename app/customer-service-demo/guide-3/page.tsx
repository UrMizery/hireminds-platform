"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CustomerServiceGuide3() {
const [timeLeft, setTimeLeft] = useState(30);
const [complete, setComplete] = useState(false);

useEffect(() => {
localStorage.removeItem("cs_guide_3_complete");

const timer = setInterval(() => {
setTimeLeft((prev) => {
if (prev <= 1) {
clearInterval(timer);
localStorage.setItem("cs_guide_3_complete", "true");
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

<h1>Guide 3: Empathy + Emotional Intelligence</h1>

<h3>Quick Lesson</h3>

<p>
Empathy means understanding how someone may feel and responding with
patience, respect, and care. Emotional intelligence means staying aware
of your own tone, body language, and reactions while helping others.
</p>

<ul>
<li>Use calm and respectful language</li>
<li>Validate the customer’s concern</li>
<li>Avoid sounding rushed or annoyed</li>
<li>Stay professional even when the customer is emotional</li>
<li>Focus on support, not blame</li>
</ul>

<h3>Scenario</h3>

<p>Customer says:</p>

<p>"I’m nervous because nobody explained what happens next."</p>

<p>Best response:</p>

<p>
A. You’ll be fine.
<br />
B. That’s not my department.
<br />
C. I understand why you feel nervous. Let me explain the next steps.
<br />
D. Please wait over there.
</p>

<div style={styles.summary}>
<strong>Correct: C</strong>

<p>
✅ Correct because it validates the customer’s feelings and gives
helpful next-step support.
</p>

<p>❌ A minimizes the concern instead of addressing it.</p>
<p>❌ B shifts responsibility and may make the customer feel dismissed.</p>
<p>❌ D gives direction without empathy or explanation.</p>
</div>

{complete && (
<Link href="/customer-service-demo/guide-4" style={styles.button}>
Continue →
</Link>
)}
</div>
</main>
);
}

const styles: any = {
page: {
minHeight: "100vh",
padding: "60px",
background: "#050816",
color: "white",
},
box: {
maxWidth: "1000px",
margin: "auto",
},
timer: {
color: "#38bdf8",
fontWeight: "bold",
marginBottom: "20px",
},
summary: {
marginTop: "30px",
padding: "20px",
background: "#111827",
borderRadius: "14px",
},
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
