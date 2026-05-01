"use client";

import { useEffect, useRef, useState } from "react";

type Checkpoint = {
minute: number;
penaltyType: "warning" | "restart" | "pushback";
pushbackSeconds?: number;
};

const CHECKPOINTS: Checkpoint[] = [
{ minute: 15, penaltyType: "warning" },
{ minute: 30, penaltyType: "restart" },
{ minute: 45, penaltyType: "pushback", pushbackSeconds: 15 * 60 },
{ minute: 60, penaltyType: "pushback", pushbackSeconds: 20 * 60 },
{ minute: 90, penaltyType: "pushback", pushbackSeconds: 30 * 60 },
];

const SAMPLE_CHECKPOINT_TASKS = [
"Type one thing you learned so far.",
"Write one workplace example from this module.",
"Summarize this section in one sentence.",
"Name one skill this module connects to.",
"Write one question you would ask the trainer.",
];

export default function AsyncTracker({
module,
activityType,
completionKey,
requiredSeconds = 660,
}: {
module: string;
activityType: string;
completionKey?: string;
requiredSeconds?: number;
}) {
const progressKey = `${module}_progress_seconds`;

const [secondsEarned, setSecondsEarned] = useState(0);
const [complete, setComplete] = useState(false);
const [paused, setPaused] = useState(false);

const [checkpointOpen, setCheckpointOpen] = useState(false);
const [checkpointMinute, setCheckpointMinute] = useState<number | null>(null);
const [checkpointTask, setCheckpointTask] = useState("");
const [checkpointResponse, setCheckpointResponse] = useState("");
const [checkpointDeadline, setCheckpointDeadline] = useState(0);

const lastReported = useRef(0);
const triggeredCheckpoints = useRef<Record<number, boolean>>({});

useEffect(() => {
if (completionKey && localStorage.getItem(completionKey) === "true") {
setComplete(true);
setSecondsEarned(requiredSeconds);
return;
}

const saved = Number(localStorage.getItem(progressKey) || 0);
if (saved > 0) {
setSecondsEarned(saved);
}

const timer = setInterval(() => {
if (document.hidden || checkpointOpen) {
setPaused(true);
return;
}

setPaused(false);

setSecondsEarned((prev) => {
const next = Math.min(prev + 1, requiredSeconds);

localStorage.setItem(progressKey, String(next));

if (next - lastReported.current >= 60) {
lastReported.current = next;
reportTime(60);
}

const checkpoint = CHECKPOINTS.find(
(cp) =>
next >= cp.minute * 60 &&
!triggeredCheckpoints.current[cp.minute] &&
cp.minute * 60 <= requiredSeconds
);

if (checkpoint) {
triggeredCheckpoints.current[checkpoint.minute] = true;
openCheckpoint(checkpoint.minute);
}

if (next >= requiredSeconds) {
if (completionKey) {
localStorage.setItem(completionKey, "true");
}
setComplete(true);
}

return next;
});
}, 1000);

return () => clearInterval(timer);
}, [checkpointOpen]);

useEffect(() => {
if (!checkpointOpen) return;

const countdown = setInterval(() => {
if (Date.now() > checkpointDeadline) {
clearInterval(countdown);
handleMissedCheckpoint();
}
}, 1000);

return () => clearInterval(countdown);
}, [checkpointOpen, checkpointDeadline, checkpointMinute, secondsEarned]);

function openCheckpoint(minute: number) {
const task =
SAMPLE_CHECKPOINT_TASKS[
Math.floor(Math.random() * SAMPLE_CHECKPOINT_TASKS.length)
];

setCheckpointMinute(minute);
setCheckpointTask(task);
setCheckpointResponse("");
setCheckpointDeadline(Date.now() + 4 * 60 * 1000);
setCheckpointOpen(true);
setPaused(true);
}

function handleCheckpointSubmit() {
if (!checkpointResponse.trim()) {
alert("Please answer the checkpoint before continuing.");
return;
}

reportTime(0, {
event: "checkpoint_answered",
checkpointMinute,
response: checkpointResponse,
});

setCheckpointOpen(false);
setCheckpointMinute(null);
setCheckpointTask("");
setCheckpointResponse("");
setPaused(false);
}

function handleMissedCheckpoint() {
if (!checkpointMinute) return;

const checkpoint = CHECKPOINTS.find((cp) => cp.minute === checkpointMinute);
if (!checkpoint) return;

let newProgress = secondsEarned;

if (checkpoint.penaltyType === "warning") {
alert(
"Warning: Future missed checkpoints may reduce your recorded study progress."
);
}

if (checkpoint.penaltyType === "restart") {
newProgress = 0;
alert("Checkpoint missed. Your module progress has restarted.");
}

if (checkpoint.penaltyType === "pushback") {
newProgress = Math.max(
0,
secondsEarned - (checkpoint.pushbackSeconds || 0)
);
alert("Checkpoint missed. Your study progress has been reduced.");
}

localStorage.setItem(progressKey, String(newProgress));
setSecondsEarned(newProgress);

reportTime(0, {
event: "checkpoint_missed",
checkpointMinute,
penaltyType: checkpoint.penaltyType,
newProgress,
});

setCheckpointOpen(false);
setCheckpointMinute(null);
setCheckpointTask("");
setCheckpointResponse("");
setPaused(false);
}

async function reportTime(seconds: number, details: any = {}) {
try {
await fetch("/api/async-activity", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
module,
activityType,
secondsSpent: seconds,
details,
}),
});
} catch {
// tracking failure should not break participant experience
}
}

const secondsLeft = Math.max(0, requiredSeconds - secondsEarned);
const minutes = Math.floor(secondsLeft / 60);
const seconds = secondsLeft % 60;

return (
<div style={styles.wrapper}>
<div style={styles.notice}>
<strong>Active Learning Notice:</strong>
<p>
This self-paced module includes timed checkpoints at 15, 30, 45, 60,
and 90 minutes. The 15-minute checkpoint is a warning only. Missed
checkpoints after that may reduce your recorded progress.
</p>
</div>

<div style={styles.timerBox}>
{complete ? (
<strong>Completed ✅</strong>
) : paused ? (
<strong>Paused — complete the checkpoint or return to the page.</strong>
) : (
<strong>
Required Time Remaining: {minutes}:{seconds.toString().padStart(2, "0")}
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
Progress earned: {Math.floor(secondsEarned / 60)} minutes
</p>

{checkpointOpen ? (
<div style={styles.overlay}>
<div style={styles.modal}>
<p style={styles.kicker}>Active Learning Checkpoint</p>
<h2>{checkpointMinute}-Minute Checkpoint</h2>

<p>{checkpointTask}</p>

<textarea
value={checkpointResponse}
onChange={(e) => setCheckpointResponse(e.target.value)}
placeholder="Type your response here..."
style={styles.textarea}
/>

<button
type="button"
onClick={handleCheckpointSubmit}
style={styles.button}
>
Submit Checkpoint
</button>

<p style={styles.smallText}>
You have 4 minutes to complete this checkpoint.
</p>
</div>
</div>
) : null}
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
overlay: {
position: "fixed",
inset: 0,
background: "rgba(0,0,0,.78)",
display: "flex",
alignItems: "center",
justifyContent: "center",
zIndex: 9999,
padding: 20,
},
modal: {
width: "100%",
maxWidth: 560,
background: "#111",
border: "1px solid rgba(255,255,255,.18)",
borderRadius: 20,
padding: 24,
color: "#fff",
},
kicker: {
color: "#7db7ff",
fontWeight: 900,
textTransform: "uppercase",
letterSpacing: 1.2,
fontSize: 12,
},
textarea: {
width: "100%",
minHeight: 120,
borderRadius: 12,
border: "1px solid rgba(255,255,255,.18)",
background: "rgba(0,0,0,.35)",
color: "#fff",
padding: 12,
marginTop: 12,
boxSizing: "border-box",
},
button: {
marginTop: 14,
background: "#fff",
color: "#000",
border: "none",
borderRadius: 12,
padding: "12px 16px",
fontWeight: 900,
cursor: "pointer",
},
smallText: {
color: "rgba(255,255,255,.65)",
fontSize: 12,
marginTop: 10,
},
};
