"use client";

import { useEffect, useState } from "react";

export default function StudyGuideTimer({
module,
completionKey,
requiredSeconds = 30,
}: {
module: string;
completionKey: string;
requiredSeconds?: number;
}) {
const [seconds, setSeconds] = useState(0);
const [completed, setCompleted] = useState(false);

useEffect(() => {
const alreadyComplete =
localStorage.getItem(completionKey) === "true";

if (alreadyComplete) {
setCompleted(true);
setSeconds(requiredSeconds);
return;
}

const timer = setInterval(() => {
setSeconds((prev) => {
const next = prev + 1;

if (next >= requiredSeconds) {
localStorage.setItem(
completionKey,
"true"
);

setCompleted(true);

clearInterval(timer);

return requiredSeconds;
}

return next;
});
}, 1000);

return () => {
clearInterval(timer);

const finished =
localStorage.getItem(
completionKey
) === "true";

if (!finished) {
localStorage.removeItem(
completionKey
);
}
};
}, [completionKey, requiredSeconds]);

const remaining =
requiredSeconds - seconds;

return (
<div style={styles.wrapper}>
<div style={styles.notice}>
<strong>
Demo Study Guide
</strong>

<p>
Leaving before completion
resets progress.
</p>
</div>

<div style={styles.timerBox}>
{completed ? (
<strong>
Completed ✅
</strong>
) : (
<strong>
Time Remaining:
{" "}
0:
{String(
Math.max(0, remaining)
).padStart(2, "0")}
</strong>
)}
</div>

<div style={styles.bar}>
<div
style={{
...styles.fill,
width: `${
(seconds /
requiredSeconds) *
100
}%`,
}}
/>
</div>

<p style={styles.small}>
{seconds}/
{requiredSeconds}
{" "}
sec
</p>
</div>
);
}

const styles: Record<
string,
React.CSSProperties
> = {
wrapper:{
marginTop:20
},

notice:{
padding:14,
borderRadius:12,
background:
"rgba(125,183,255,.12)"
},

timerBox:{
marginTop:10,
padding:15,
borderRadius:12,
background:
"rgba(255,255,255,.06)"
},

bar:{
height:10,
borderRadius:999,
overflow:"hidden",
background:
"rgba(255,255,255,.08)",
marginTop:10
},

fill:{
height:"100%",
background:"#7db7ff"
},

small:{
opacity:.7,
fontSize:12
}
};
