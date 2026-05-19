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
const [paused, setPaused] = useState(false);

const lastReported = useRef(0);

useEffect(() => {
if (localStorage.getItem(completionKey) === "true") {
setComplete(true);
setSecondsEarned(requiredSeconds);
return;
}

const saved = Number(localStorage.getItem(progressKey) || 0);
if (saved > 0) setSecondsEarned(saved);

const timer = setInterval(() => {
if (document.hidden) {
setPaused(true);
return;
}

setPaused(false);

setSecondsEarned((prev) => {
const next = Math.min(prev + 1, requiredSeconds);
localStorage.setItem(progressKey, String(next));

if (next - lastReported.current >= 30) {
lastReported.current = next;
reportTime(30);
}

if (next >= requiredSeconds) {
localStorage.setItem(completionKey, "true");
setComplete(true);
}

return next;
});
}, 1000);

return () => clearInterval(timer);
}, []);

async function reportTime(seconds: number) {
try {
await fetch("/api/async-activity", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
module,
activityType: "career_pathway_study",
secondsSpent: seconds,
}),
});
} catch {
// do not block user experience
}
}

const secondsLeft = Math.max(0, requiredSeconds - secondsEarned);
const minutes = Math.floor(secondsLeft / 30);
const seconds = secondsLeft % 30;

return (
<div style={styles.wrapper}>
<div style={styles.notice}>
<strong>Timed Study Guide:</strong>
<p>
This study guide must remain open for 30 seconds before the next guide
unlocks. Please review the content and complete the prompts before
moving forward.
</p>
</div>

<div style={styles.timerBox}>
{complete ? (
<strong>Completed ✅ Next guide unlocked</strong>
) : paused ? (
<strong>Timer Paused — return to this page to continue</strong>
) : (
<strong>
Required Time Remaining: {minutes}:
{seconds.toString().padStart(2, "0")}
</strong>
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
Progress earned: {Math.floor(secondsEarned / 30)} seconds
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
color: "#ffffff",
marginBottom: 12,
lineHeight: 1.5,
},
timerBox: {
padding: 14,
borderRadius: 14,
background: "rgba(255,255,255,.09)",
border: "1px solid rgba(255,255,255,.14)",
color: "#ffffff",
},
progressBar: {
height: 10,
width: "100%",
borderRadius: 999,
background: "rgba(255,255,255,.12)",
overflow: "hidden",
marginTop: 12,
},
progressFill: {
height: "100%",
background: "#7db7ff",
},
progressText: {
color: "rgba(255,255,255,.7)",
fontSize: 13,
},
};
