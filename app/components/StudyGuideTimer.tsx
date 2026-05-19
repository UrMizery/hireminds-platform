"use client";

import { useEffect, useRef, useState } from "react";

export default function StudyGuideTimer({
module,
completionKey,
requiredSeconds = 30,
}: {
module: string;
completionKey: string;
requiredSeconds?: number;
}) {
const progressKey = `${module}_study_progress_seconds`;

const [secondsEarned, setSecondsEarned] = useState(0);
const [complete, setComplete] = useState(false);

const lastReported = useRef(0);

useEffect(() => {
const handleVisibility = () => {
if (document.hidden) {
resetDemoTimer();
}
};

window.addEventListener("beforeunload", resetDemoTimer);
document.addEventListener(
"visibilitychange",
handleVisibility
);

const timer = setInterval(() => {
setSecondsEarned((prev) => {
const next = prev + 1;

if (next >= requiredSeconds) {
localStorage.setItem(
completionKey,
"true"
);

setComplete(true);

return requiredSeconds;
}

return next;
});
}, 1000);

return () => {
clearInterval(timer);

window.removeEventListener(
"beforeunload",
resetDemoTimer
);

document.removeEventListener(
"visibilitychange",
handleVisibility
);
};
}, []);

function resetDemoTimer() {
localStorage.removeItem(completionKey);
localStorage.removeItem(progressKey);

setSecondsEarned(0);
setComplete(false);

lastReported.current = 0;
}

const secondsLeft = Math.max(
0,
requiredSeconds - secondsEarned
);

const displayTime = `0:${secondsLeft
.toString()
.padStart(2, "0")}`;

return (
<div style={styles.wrapper}>
<div style={styles.notice}>
<strong>Demo Study Guide</strong>

<p>
For demo purposes, leaving this page
or switching tabs resets the timer.
</p>
</div>

<div style={styles.timerBox}>
{complete ? (
<strong>
Completed ✅ Next guide unlocked
</strong>
) : (
<strong>
Time Remaining:
{" "}
{displayTime}
</strong>
)}
</div>

<div style={styles.progressBar}>
<div
style={{
...styles.progressFill,
width: `${
(secondsEarned /
requiredSeconds) *
100
}%`,
}}
/>
</div>

<p style={styles.progressText}>
{secondsEarned}/{requiredSeconds}
{" "}
seconds completed
</p>
</div>
);
}

const styles: Record<
string,
React.CSSProperties
> = {
wrapper:{
margin:"16px 0"
},

notice:{
padding:14,
borderRadius:14,
background:
"rgba(125,183,255,.12)",
border:
"1px solid rgba(125,183,255,.22)",
marginBottom:12
},

timerBox:{
padding:14,
borderRadius:14,
background:
"rgba(255,255,255,.08)"
},

progressBar:{
height:10,
background:
"rgba(255,255,255,.10)",
borderRadius:999,
overflow:"hidden",
marginTop:12
},

progressFill:{
height:"100%",
background:"#7db7ff"
},

progressText:{
fontSize:13,
opacity:.75
}
};
