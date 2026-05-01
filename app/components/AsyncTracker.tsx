"use client";

import { useEffect, useRef, useState } from "react";

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
const [secondsLeft, setSecondsLeft] = useState(requiredSeconds);
const [complete, setComplete] = useState(false);

const secondsTracked = useRef(0);
const lastReported = useRef(0);

useEffect(() => {
if (completionKey && localStorage.getItem(completionKey) === "true") {
setComplete(true);
setSecondsLeft(0);
return;
}

const timer = setInterval(() => {
if (document.hidden) return;

setSecondsLeft((prev) => {
const next = prev - 1;
secondsTracked.current += 1;

// send every 60 seconds
if (secondsTracked.current - lastReported.current >= 60) {
lastReported.current = secondsTracked.current;
reportTime(60);
}

if (next <= 0) {
clearInterval(timer);

if (completionKey) {
localStorage.setItem(completionKey, "true");
}

setComplete(true);
return 0;
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
activityType,
secondsSpent: seconds,
}),
});
} catch {}
}

const minutes = Math.floor(secondsLeft / 60);
const seconds = secondsLeft % 60;

return (
<div style={{ padding: 12, border: "1px solid #444", borderRadius: 10 }}>
{complete ? (
<strong>Completed ✅</strong>
) : (
<strong>
Time Remaining: {minutes}:{seconds.toString().padStart(2, "0")}
</strong>
)}
</div>
);
}
