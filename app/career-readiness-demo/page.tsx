"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CareerReadinessHubPage() {
const [guide1Done, setGuide1Done] = useState(false);
const [guide2Done, setGuide2Done] = useState(false);
const [guide3Done, setGuide3Done] = useState(false);

useEffect(() => {
setGuide1Done(
localStorage.getItem(
"twp_career_readiness_module_1"
) === "true"
);

setGuide2Done(
localStorage.getItem(
"twp_career_readiness_module_2"
) === "true"
);

setGuide3Done(
localStorage.getItem(
"twp_career_readiness_module_3"
) === "true"
);
}, []);

return (
<main style={styles.main}>
<section style={styles.card}>
<p style={styles.kicker}>
TWP2026 • Day 2 Demo
</p>

<h1 style={styles.title}>
Career Readiness Training
</h1>

<p style={styles.subtitle}>
Participants move through
guided demo study guides,
activities,
healthcare career preparation,
scenarios,
and knowledge checks before
completing the final assessment.
</p>

<section style={styles.section}>
<h2 style={styles.sectionTitle}>
Career Readiness Path
</h2>

<div style={styles.stack}>

<Link
href="/career-readiness-demo/module-1"
style={{
...styles.moduleCard,
...(guide1Done
? styles.completeCard
: {})
}}
>
<div>
<h3 style={styles.guideTitle}>
Demo Guide 1
</h3>

<p>
Healthcare Resume Basics
</p>
</div>

<strong>
{guide1Done
? "Done"
: "Start"}
</strong>

</Link>

{guide1Done ? (

<Link
href="/career-readiness-demo/module-2"
style={{
...styles.moduleCard,
...(guide2Done
? styles.completeCard
: {})
}}
>

<div>
<h3 style={styles.guideTitle}>
Demo Guide 2
</h3>

<p>
Job Description +
Cover Letter
</p>
</div>

<strong>
{guide2Done
? "Done"
: "Start"}
</strong>

</Link>

) : (

<div style={styles.lockedCard}>
Complete Guide 1
to unlock
</div>

)}

{guide2Done ? (

<Link
href="/career-readiness-demo/module-3"
style={{
...styles.moduleCard,
...(guide3Done
? styles.completeCard
: {})
}}
>

<div>
<h3 style={styles.guideTitle}>
Demo Guide 3
</h3>

<p>
Interview +
Professionalism
</p>
</div>

<strong>
{guide3Done
? "Done"
: "Start"}
</strong>

</Link>

) : (

<div style={styles.lockedCard}>
Complete Guide 2
to unlock
</div>

)}

{guide3Done ? (

<Link
href="/career-readiness-demo/assessment"
style={styles.assessmentCard}
>

<div>

<h3 style={styles.guideTitle}>
Apply Knowledge
Assessment
</h3>

<p>
Score 80%+
to unlock
certificate preview
</p>

</div>

<strong>
Start
</strong>

</Link>

) : (

<div style={styles.lockedCard}>
Complete all guides
first
</div>

)}

</div>
</section>

<Link
href="/skillsquest"
style={styles.button}
>
Back to Career Pathway
</Link>

</section>
</main>
);
}

const styles:any={

main:{
minHeight:"100vh",
padding:"30px",
background:
"linear-gradient(180deg,#050505,#101010)",
color:"white"
},

card:{
maxWidth:"1100px",
margin:"0 auto",
padding:"30px",
borderRadius:"22px",
background:
"rgba(255,255,255,.06)"
},

kicker:{
color:"#7db7ff",
fontWeight:900
},

title:{
fontSize:"42px"
},

subtitle:{
opacity:.8
},

section:{
marginTop:"35px"
},

sectionTitle:{
fontSize:"28px"
},

stack:{
display:"flex",
flexDirection:"column",
gap:"18px"
},

moduleCard:{
display:"flex",
justifyContent:"space-between",
padding:"25px",
borderRadius:"18px",
background:
"rgba(0,0,0,.35)",
color:"white",
textDecoration:"none"
},

assessmentCard:{
display:"flex",
justifyContent:"space-between",
padding:"25px",
borderRadius:"18px",
background:
"rgba(10,132,255,.15)",
color:"white",
textDecoration:"none"
},

completeCard:{
background:
"rgba(125,255,179,.15)"
},

lockedCard:{
padding:"25px",
borderRadius:"18px",
background:
"rgba(255,255,255,.05)",
opacity:.6
},

guideTitle:{
color:"#7db7ff"
},

button:{
display:"inline-block",
marginTop:"30px",
background:"white",
color:"black",
padding:"12px 18px",
borderRadius:"12px",
textDecoration:"none",
fontWeight:900
}

}
