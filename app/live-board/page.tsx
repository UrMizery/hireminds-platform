"use client";

import Link from "next/link";
import { CSSProperties, useState } from "react";

type BoardItem = {
id: number;
title: string;
type: string;
text: string;
likes: number;
};

export default function LiveBoardPage() {
const [items, setItems] = useState<BoardItem[]>([
{
id: 1,
title: "HireMinds™ Open Room",
type: "Flyer",
text: "Last Tuesday of every month • 6–7 PM • Room opens 5:50 PM",
likes: 0,
},
{
id: 2,
title: "Workforce Opportunity",
type: "Announcement",
text: "Post hiring events, partner updates, training reminders, and community opportunities here.",
likes: 0,
},
]);

const [thought, setThought] = useState("");

function likeItem(id: number) {
setItems((prev) =>
prev.map((item) =>
item.id === id ? { ...item, likes: item.likes + 1 } : item
)
);
}

function addThought() {
if (!thought.trim()) return;

setItems((prev) => [
...prev,
{
id: Date.now(),
title: "Community Thought",
type: "Question / Feedback",
text: thought,
likes: 0,
},
]);

setThought("");
}

return (
<main style={styles.page}>
<section style={styles.header}>
<p style={styles.kicker}>HireMinds™</p>
<h1 style={styles.title}>Live Board</h1>
<p style={styles.subtitle}>
Interactive flyers, announcements, questions, reactions, and feedback.
</p>
</section>

<section style={styles.postBox}>
<h2 style={styles.postTitle}>Post a Thought, Question, or Feedback</h2>

<textarea
value={thought}
onChange={(e) => setThought(e.target.value)}
placeholder="Share a question, thought, or feedback..."
style={styles.textarea}
/>

<button onClick={addThought} style={styles.button}>
Post to Live Board
</button>
</section>

<section style={styles.grid}>
{items.map((item) => (
<article key={item.id} style={styles.card}>
<p style={styles.type}>{item.type}</p>
<h2 style={styles.cardTitle}>{item.title}</h2>
<p style={styles.cardText}>{item.text}</p>

<button onClick={() => likeItem(item.id)} style={styles.likeButton}>
👍 {item.likes}
</button>
</article>
))}
</section>

<Link href="/profile" style={styles.back}>
Back to My Profile
</Link>
</main>
);
}

const styles: Record<string, CSSProperties> = {
page: {
minHeight: "100vh",
background: "linear-gradient(135deg,#030712,#111827,#312e81)",
color: "white",
padding: "50px 24px",
},
header: {
maxWidth: "1050px",
margin: "0 auto 28px",
},
kicker: {
color: "#c084fc",
textTransform: "uppercase",
letterSpacing: ".18em",
fontWeight: 800,
},
title: {
fontSize: "48px",
margin: "0 0 12px",
},
subtitle: {
color: "#d1d5db",
fontSize: "18px",
lineHeight: 1.7,
},
postBox: {
maxWidth: "1050px",
margin: "0 auto 28px",
background: "rgba(255,255,255,.06)",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: "24px",
padding: "24px",
},
postTitle: {
marginTop: 0,
},
textarea: {
width: "100%",
minHeight: "120px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,.14)",
background: "rgba(0,0,0,.35)",
color: "white",
padding: "16px",
fontSize: "15px",
boxSizing: "border-box",
},
button: {
marginTop: "14px",
padding: "13px 20px",
borderRadius: "999px",
border: "none",
background: "#7c3aed",
color: "white",
fontWeight: 800,
cursor: "pointer",
},
grid: {
maxWidth: "1050px",
margin: "0 auto",
display: "grid",
gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
gap: "18px",
},
card: {
background: "rgba(255,255,255,.07)",
border: "1px solid rgba(255,255,255,.12)",
borderRadius: "22px",
padding: "22px",
},
type: {
color: "#f0abfc",
fontWeight: 800,
fontSize: "12px",
textTransform: "uppercase",
letterSpacing: ".12em",
},
cardTitle: {
fontSize: "22px",
},
cardText: {
color: "#e5e7eb",
lineHeight: 1.6,
},
likeButton: {
marginTop: "12px",
padding: "10px 14px",
borderRadius: "999px",
border: "1px solid rgba(255,255,255,.18)",
background: "rgba(255,255,255,.08)",
color: "white",
cursor: "pointer",
},
back: {
display: "block",
maxWidth: "1050px",
margin: "28px auto 0",
color: "#c4b5fd",
textDecoration: "none",
},
};
