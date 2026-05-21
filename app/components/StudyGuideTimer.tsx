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
const [secondsEarned, setSecondsEarned] = useState(0);
const [complete, setComplete] = useState(false);
const intervalRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
const alreadyComplete = localStorage.getItem(completionKey) === "true";

if (alreadyComplete) {
setComplete(true);
setSecondsEarned(requiredSeconds);
return;
}

intervalRef.current = setInterval(() => {
setSecondsEarned((prev) => {
const next = prev + 1;

if (next >= requiredSeconds) {
localStorage.setItem(completionKey, "true");
setComplete(true);

if (intervalRef.current) {
clearInterval(intervalRef.current);
}

return requiredSeconds;
}

return next;
});
}, 1000);

return () => {
if (intervalRef.current) {
clearInterval(intervalRef.current);
}

const finished = localStorage.getItem(completionKey) === "true";

if (!finished) {
setSecondsEarned(0);
}
};
}, [completionKey, requiredSeconds]);

const secondsLeft = Math.max(0, requiredSeconds - secondsEarned);

return (
<div style={styles.wrapper}>
<div style={styles.notice}>
<strong>Demo Study Guide</strong>
<p>
Stay on this page for {requiredSeconds} seconds to complete this demo
guide. If you leave before it completes, the timer restarts.
</p>
</div>

<div style={styles.timerBox}>
{complete ? (
<strong>Completed ✅</strong>
) : (
<strong>Time Remaining: 0:{secondsLeft.toString().padStart(2, "0")}</strong>
)}
</div>

<div style={styles.progressBar}>
<div
style={{
...styles.progressFill,
width: `${Math.min(100, (secondsEarned / requiredSeconds) * 100)}%`,
}}
/>
</div>

<p style={styles.progressText}>
{secondsEarned}/{requiredSeconds} seconds completed
</p>
</div>
);
}

const styles: Record<string, React.CSSProperties> = {
wrapper: {
margin: "16px 0",
},
notice: {
padding: 14,
borderRadius: 14,
background: "rgba(125,183,255,.12)",
border: "1px solid rgba(125,183,255,.22)",
marginBottom: 12,
},
timerBox: {
padding: 14,
borderRadius: 14,
background: "rgba(255,255,255,.08)",
},
progressBar: {
height: 10,
background: "rgba(255,255,255,.10)",
borderRadius: 999,
overflow: "hidden",
marginTop: 12,
},
progressFill: {
height: "100%",
background: "#7db7ff",
},
progressText: {
fontSize: 13,
opacity: 0.75,
},
};
