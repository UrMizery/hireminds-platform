"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CustomerServiceGuide2() {
const [timeLeft, setTimeLeft] = useState(30);
const [complete, setComplete] = useState(false);

useEffect(() => {
localStorage.removeItem("cs_guide_2_complete");

const timer = setInterval(() => {
setTimeLeft((prev) => {
if (prev <= 1) {
clearInterval(timer);

localStorage.setItem(
"cs_guide_2_complete",
"true"
);

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
<p style={styles.timer}>
Demo unlock in: {timeLeft}s
</p>

<h1>Guide 2: Active Listening Skills</h1>

<h3>Quick Lesson</h3>

<p>
Active listening means fully understanding
what a customer is saying instead of waiting
for your turn to speak.
</p>

<ul>
<li>Maintain eye contact</li>
<li>Do not interrupt</li>
<li>Ask clarifying questions</li>
<li>Repeat key concerns</li>
<li>Show empathy</li>
</ul>

<h3>Scenario</h3>

<p>
Customer says:
</p>

<p>
"I've called 3 times and nobody helped me."
</p>

<p>
Best response:
</p>

<p>
A. Okay
<br/>
B. What do you want me to do?
<br/>
C. I understand you've had a frustrating
experience. Let me help.
<br/>
D. Ignore
</p>

<div style={styles.summary}>
<strong>Correct: C</strong>

<p>
✅ Correct because it acknowledges the
concern and demonstrates active listening.
</p>

<p>
❌ A minimizes frustration
</p>

<p>
❌ B sounds dismissive
</p>

<p>
❌ D ignores the issue entirely
</p>
</div>

{complete && (
<Link
href="/customer-service-demo/guide-3"
style={styles.button}
>
Continue →
</Link>
)}
</div>
</main>
);
}

const styles:any={
page:{
minHeight:"100vh",
padding:"60px",
background:"#050816",
color:"white"
},
box:{
maxWidth:"1000px",
margin:"auto"
},
timer:{
color:"#38bdf8",
fontWeight:"bold",
marginBottom:"20px"
},
summary:{
marginTop:"30px",
padding:"20px",
background:"#111827",
borderRadius:"14px"
},
button:{
display:"inline-block",
marginTop:"30px",
padding:"14px 24px",
background:"#0ea5e9",
borderRadius:"12px",
textDecoration:"none",
color:"white",
fontWeight:"bold"
}
}
