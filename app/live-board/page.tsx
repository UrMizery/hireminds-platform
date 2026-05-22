"use client";

import Link from "next/link";
import { useState } from "react";

type Flyer = {
id: number;
tag: string;
title: string;
description: string;
details?: string;
likes: number;
saved: boolean;
color: "pink" | "blue" | "yellow" | "purple" | "green";
x: number;
y: number;
};

export default function LiveBulletinBoardPage() {
const [draggingId, setDraggingId] = useState<number | null>(null);
const [offset, setOffset] = useState({ x: 0, y: 0 });

const [flyers, setFlyers] = useState<Flyer[]>([
{
id: 1,
tag: "MONTHLY LIVE ROOM",
title: "OPEN ROOM",
description:
"Pull up for quick Q&A, career tips, live support, mini challenges, shoutouts, and real-time HireMinds updates. Come curious. Leave sharper.",
details: "Last Tuesday • 6–7 PM • Room opens 5:50 PM",
likes: 24,
saved: false,
color: "pink",
x: 60,
y: 60,
},
{
id: 2,
tag: "TRAINING PREVIEW",
title: "CUSTOMER SERVICE",
description: "Practice pathways, sharpen skills, and preview assessments.",
likes: 17,
saved: false,
color: "blue",
x: 430,
y: 100,
},
{
id: 3,
tag: "OPPORTUNITY",
title: "HIRING EVENT",
description: "Multiple positions available. Come ready. Let’s talk.",
likes: 31,
saved: false,
color: "green",
x: 820,
y: 80,
},
{
id: 4,
tag: "COMMUNITY",
title: "PARTNER SPOTLIGHT",
description: "Highlighting partners creating visibility and opportunity.",
likes: 10,
saved: false,
color: "yellow",
x: 150,
y: 440,
},
{
id: 5,
tag: "SKILL BUILDER",
title: "DIGITAL LITERACY",
description: "Build online confidence, career readiness, and tool navigation.",
likes: 12,
saved: false,
color: "purple",
x: 720,
y: 470,
},
]);

function likeFlyer(id: number) {
setFlyers((prev) =>
prev.map((flyer) =>
flyer.id === id ? { ...flyer, likes: flyer.likes + 1 } : flyer
)
);
}

function saveFlyer(id: number) {
setFlyers((prev) =>
prev.map((flyer) =>
flyer.id === id ? { ...flyer, saved: true } : flyer
)
);
}

function removeSavedFlyer(id: number) {
setFlyers((prev) =>
prev.map((flyer) =>
flyer.id === id ? { ...flyer, saved: false } : flyer
)
);
}

function startDrag(
e: React.MouseEvent<HTMLElement>,
flyer: Flyer
) {
const target = e.target as HTMLElement;

if (target.closest("button")) return;

setDraggingId(flyer.id);
setOffset({
x: e.clientX - flyer.x,
y: e.clientY - flyer.y,
});
}

function onDragMove(e: React.MouseEvent<HTMLElement>) {
if (draggingId === null) return;

setFlyers((prev) =>
prev.map((flyer) =>
flyer.id === draggingId
? {
...flyer,
x: Math.max(10, e.clientX - offset.x),
y: Math.max(10, e.clientY - offset.y),
}
: flyer
)
);
}

function stopDrag() {
setDraggingId(null);
}

return (
<main
className="page"
onMouseMove={onDragMove}
onMouseUp={stopDrag}
onMouseLeave={stopDrag}
>
<section className="hero">
<div>
<p className="eyebrow">HireMinds™ Open Room</p>
<h1>Live Bulletin Board</h1>
<p className="summary">
A vibrant interactive wall for mini flyers, updates, opportunities,
likes, saves, quick reactions, and board drops.
</p>
</div>

<Link href="/profile" className="profileLink">
← Back to My Profile
</Link>
</section>

<section className="boardWrap">
<div className="boardHeader">
<p>Drag. Like. Save. Explore.</p>
</div>

<div className="bulletinWall">
{flyers.map((flyer) => (
<article
key={flyer.id}
onMouseDown={(e) => startDrag(e, flyer)}
className={`flyerCard ${flyer.color} ${
flyer.saved ? "isSaved" : ""
} ${draggingId === flyer.id ? "dragging" : ""}`}
style={{
left: `${flyer.x}px`,
top: `${flyer.y}px`,
}}
>
<div className="pin" />

{flyer.saved && <div className="savedBadge">Saved ⭐</div>}

<p className="flyerTag">{flyer.tag}</p>
<h2>{flyer.title}</h2>
<p className="flyerDescription">{flyer.description}</p>

{flyer.details && (
<p className="flyerDetails">{flyer.details}</p>
)}

<div className="flyerActions">
<button onClick={() => likeFlyer(flyer.id)}>
👍 {flyer.likes}
</button>

{!flyer.saved ? (
<button onClick={() => saveFlyer(flyer.id)}>Save ⭐</button>
) : (
<button onClick={() => removeSavedFlyer(flyer.id)}>
🗑 Remove
</button>
)}
</div>
</article>
))}
</div>
</section>

<style jsx>{`
.page {
min-height: 100vh;
width: 100%;
padding: 38px 4vw 60px;
background:
radial-gradient(circle at top left, rgba(255, 0, 214, 0.22), transparent 35%),
radial-gradient(circle at top right, rgba(0, 229, 255, 0.18), transparent 30%),
linear-gradient(135deg, #12091f, #10131f 45%, #090b13);
color: white;
user-select: none;
}

.hero {
max-width: 1700px;
margin: 0 auto 26px;
display: flex;
justify-content: space-between;
gap: 24px;
align-items: flex-end;
}

.eyebrow {
margin: 0 0 8px;
color: #60f7ff;
font-size: 0.8rem;
font-weight: 900;
letter-spacing: 0.14em;
text-transform: uppercase;
}

h1 {
margin: 0;
font-size: clamp(3rem, 6vw, 6.8rem);
line-height: 0.92;
font-weight: 950;
letter-spacing: -0.06em;
}

.summary {
max-width: 950px;
margin: 20px 0 0;
font-size: 1.2rem;
color: rgba(255, 255, 255, 0.78);
font-weight: 700;
}

.profileLink {
color: white;
text-decoration: none;
border: 1px solid rgba(255, 255, 255, 0.18);
border-radius: 999px;
padding: 13px 18px;
background: rgba(255, 255, 255, 0.07);
font-weight: 900;
white-space: nowrap;
}

.boardWrap {
max-width: 1700px;
margin: 0 auto;
border-radius: 44px;
padding: 26px;
background:
linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)),
rgba(10, 12, 23, 0.92);
border: 1px solid rgba(255, 255, 255, 0.13);
box-shadow:
0 0 90px rgba(157, 73, 255, 0.22),
inset 0 0 60px rgba(255, 255, 255, 0.04);
}

.boardHeader {
display: flex;
justify-content: flex-end;
align-items: center;
padding: 0 12px 22px;
font-size: 1.4rem;
font-weight: 950;
color: #f7ff38;
}

.boardHeader p {
margin: 0;
}

.bulletinWall {
min-height: 95vh;
border-radius: 36px;
position: relative;
overflow: hidden;
background:
radial-gradient(circle at 20% 20%, rgba(255, 49, 214, 0.16), transparent 34%),
radial-gradient(circle at 80% 70%, rgba(49, 231, 255, 0.13), transparent 34%),
linear-gradient(135deg, rgba(25, 28, 44, 0.96), rgba(13, 17, 32, 0.98));
}

.flyerCard {
width: 350px;
min-height: 330px;
padding: 34px 30px 26px;
border-radius: 30px;
position: absolute;
cursor: grab;
backdrop-filter: blur(14px);
transition: transform 0.2s ease, box-shadow 0.2s ease;
border: 2px solid currentColor;
background: rgba(255, 255, 255, 0.055);
box-shadow:
0 0 28px currentColor,
inset 0 0 28px rgba(255, 255, 255, 0.05);
}

.flyerCard:hover {
transform: scale(1.035) rotate(-1deg);
z-index: 5;
}

.flyerCard.dragging {
cursor: grabbing;
transform: scale(1.06) rotate(1deg);
z-index: 20;
}

.pink {
color: #ff4fe0;
}

.blue {
color: #35e7ff;
}

.yellow {
color: #ffe946;
}

.purple {
color: #9c7cff;
}

.green {
color: #b7ff2a;
}

.pin {
position: absolute;
top: -16px;
left: 50%;
transform: translateX(-50%);
width: 30px;
height: 30px;
border-radius: 999px;
background: #ff5dec;
box-shadow: 0 0 25px #ff5dec;
}

.savedBadge {
position: absolute;
top: 18px;
right: 18px;
padding: 8px 12px;
border-radius: 999px;
background: rgba(255, 255, 255, 0.14);
color: white;
font-size: 0.75rem;
font-weight: 950;
}

.flyerTag {
margin: 0 0 14px;
font-size: 0.82rem;
font-weight: 950;
letter-spacing: 0.18em;
text-transform: uppercase;
}

.flyerCard h2 {
margin: 0;
color: white;
font-size: 2.15rem;
line-height: 0.95;
font-weight: 950;
letter-spacing: -0.04em;
text-transform: uppercase;
}

.flyerDescription {
margin: 20px 0 16px;
color: rgba(255, 255, 255, 0.82);
font-size: 0.98rem;
line-height: 1.45;
font-weight: 750;
}

.flyerDetails {
margin: 0 0 70px;
color: white;
font-size: 0.82rem;
font-weight: 950;
background: rgba(255, 79, 224, 0.16);
border: 1px solid rgba(255, 79, 224, 0.45);
border-radius: 999px;
padding: 9px 12px;
display: inline-block;
}

.flyerActions {
display: flex;
flex-wrap: wrap;
gap: 10px;
position: absolute;
left: 28px;
right: 28px;
bottom: 24px;
}

.flyerActions button {
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 999px;
padding: 10px 14px;
background: rgba(255, 255, 255, 0.12);
color: white;
font-weight: 950;
cursor: pointer;
}

.isSaved {
background:
linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05)),
rgba(255, 255, 255, 0.04);
}

@media (max-width: 900px) {
.hero {
flex-direction: column;
align-items: flex-start;
}

.bulletinWall {
min-height: 110vh;
}

.flyerCard {
width: 300px;
}
}
`}</style>
</main>
);
}
