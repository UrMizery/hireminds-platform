"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OpenRoomPage() {
const router = useRouter();
const [opening, setOpening] = useState(false);

function enterRoom() {
setOpening(true);

setTimeout(() => {
router.push("/open-room/live");
}, 1100);
}

return (
<main className="page">
<section className="hero">
<div className="left">
<div className="badge">
<span /> LIVE COMMUNITY SPACE
</div>

<h1>
OPEN
<br />
<strong>ROOM</strong>
</h1>

<p>
A live interactive space for networking, support, opportunities,
career conversations, updates, resources, and random cool moments.
</p>

<div className="info">
<div>📅 Last Tuesday monthly</div>
<div>⏰ 6PM – 7PM</div>
<div>🚪 Opens 5:50PM</div>
</div>

<div className="vibe">✨ Come curious. Leave sharper.</div>
</div>

<button
onClick={enterRoom}
className={`doorArea ${opening ? "open" : ""}`}
aria-label="Enter Open Room"
>
<div className="wallGlow" />
<div className="floorLight" />

<div className="doorFrame">
<div className="lightInside" />
<div className="doorPanel">
<div className="doorInset top" />
<div className="doorInset bottom" />
<div className="doorKnob" />
</div>
</div>
</button>

<div className="right">
<h2>Ready to walk in?</h2>
<p>
Click the door to enter <span>Open Room</span>
</p>
<div className="line" />
</div>
</section>

<style jsx>{`
.page {
min-height: 100vh;
padding: 38px;
background:
radial-gradient(circle at 78% 22%, rgba(0, 229, 255, 0.12), transparent 28%),
radial-gradient(circle at 20% 90%, rgba(255, 210, 73, 0.08), transparent 32%),
linear-gradient(135deg, #020712, #06111f 50%, #02050c);
color: white;
overflow: hidden;
}

.hero {
position: relative;
min-height: calc(100vh - 76px);
border-radius: 34px;
padding: 70px 70px 50px;
display: grid;
grid-template-columns: 0.9fr 1.1fr 0.8fr;
align-items: center;
gap: 38px;
overflow: hidden;
background:
linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.012)),
#050b15;
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow:
inset 0 0 70px rgba(0, 229, 255, 0.04),
0 0 80px rgba(0, 0, 0, 0.45);
}

.hero::before {
content: "";
position: absolute;
inset: 0;
background:
linear-gradient(to bottom, transparent 76%, rgba(255, 255, 255, 0.045) 77%, transparent 78%),
linear-gradient(to right, transparent 76%, rgba(255, 255, 255, 0.035) 77%, transparent 78%);
background-size: 120px 120px;
opacity: 0.2;
pointer-events: none;
transform: perspective(900px) rotateX(58deg) translateY(170px);
transform-origin: bottom;
}

.left,
.right,
.doorArea {
position: relative;
z-index: 2;
}

.badge {
display: inline-flex;
align-items: center;
gap: 9px;
padding: 10px 16px;
border-radius: 999px;
background: rgba(255, 255, 255, 0.055);
border: 1px solid rgba(255, 255, 255, 0.14);
font-weight: 900;
font-size: 0.8rem;
}

.badge span {
width: 10px;
height: 10px;
border-radius: 999px;
background: #00e5ff;
box-shadow: 0 0 12px #00e5ff;
}

h1 {
margin: 28px 0 22px;
font-size: clamp(4.5rem, 8vw, 8.5rem);
line-height: 0.82;
letter-spacing: -0.08em;
font-weight: 950;
}

h1 strong {
color: #00dff7;
text-shadow: 0 0 28px rgba(0, 229, 255, 0.35);
}

.left p {
max-width: 520px;
font-size: 1.13rem;
line-height: 1.7;
color: rgba(255, 255, 255, 0.78);
font-weight: 650;
}

.info {
display: flex;
flex-wrap: wrap;
gap: 12px;
margin-top: 28px;
}

.info div {
padding: 14px 16px;
border-radius: 16px;
background: rgba(255, 255, 255, 0.045);
border: 1px solid rgba(255, 255, 255, 0.1);
font-weight: 850;
}

.vibe {
margin-top: 34px;
color: #ffd249;
font-weight: 900;
}

.doorArea {
width: 360px;
height: 590px;
margin: auto;
border: none;
background: transparent;
cursor: pointer;
perspective: 1600px;
}

.wallGlow {
position: absolute;
left: 50%;
top: 48%;
width: 390px;
height: 520px;
transform: translate(-50%, -50%);
background: radial-gradient(circle, rgba(255, 210, 110, 0.32), rgba(0, 229, 255, 0.08) 45%, transparent 70%);
filter: blur(30px);
opacity: 0.8;
}

.floorLight {
position: absolute;
left: 50%;
bottom: 0;
width: 170px;
height: 260px;
transform: translateX(-50%) perspective(300px) rotateX(62deg);
background: linear-gradient(180deg, rgba(255, 233, 190, 0.75), transparent);
filter: blur(12px);
opacity: 0.7;
transform-origin: top;
}

.doorFrame {
position: absolute;
left: 50%;
top: 45px;
width: 250px;
height: 430px;
transform: translateX(-50%);
background: #030711;
border: 14px solid #101722;
box-shadow:
0 0 0 2px rgba(255, 255, 255, 0.06),
0 0 45px rgba(0, 0, 0, 0.8),
inset 0 0 18px rgba(255, 255, 255, 0.05);
overflow: visible;
}

.doorFrame::before {
content: "";
position: absolute;
inset: -26px;
border: 1px solid rgba(255, 255, 255, 0.06);
box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.8);
}

.lightInside {
position: absolute;
inset: 0;
background:
radial-gradient(circle at 60% 35%, rgba(255, 255, 255, 0.98), transparent 20%),
linear-gradient(180deg, #fff6d8, #ffd68a 55%, #ffffff);
box-shadow:
0 0 70px rgba(255, 225, 150, 0.9),
inset 0 0 30px rgba(255, 255, 255, 0.9);
}

.doorPanel {
position: absolute;
left: 0;
top: 0;
width: 82%;
height: 100%;
transform-origin: left center;
transform: rotateY(-28deg);
transition: transform 0.95s ease;
background:
linear-gradient(90deg, rgba(0, 0, 0, 0.45), transparent 16%),
linear-gradient(135deg, #0b1018, #1a2431 46%, #060912);
border: 2px solid rgba(255, 255, 255, 0.12);
box-shadow:
inset -22px 0 30px rgba(0, 0, 0, 0.55),
inset 8px 0 18px rgba(255, 255, 255, 0.06),
18px 0 32px rgba(0, 0, 0, 0.52);
}

.open .doorPanel {
transform: rotateY(-72deg);
}

.doorInset {
position: absolute;
left: 42px;
right: 30px;
border: 2px solid rgba(255, 255, 255, 0.11);
box-shadow:
inset 0 0 0 12px rgba(0, 0, 0, 0.15),
inset 0 0 22px rgba(255, 255, 255, 0.05);
}

.doorInset.top {
top: 58px;
height: 145px;
}

.doorInset.bottom {
bottom: 58px;
height: 145px;
}

.doorKnob {
position: absolute;
right: 25px;
top: 50%;
width: 15px;
height: 15px;
border-radius: 999px;
background: #b98d38;
box-shadow:
0 0 12px rgba(255, 210, 73, 0.8),
inset 0 0 3px rgba(255, 255, 255, 0.7);
}

.right {
max-width: 430px;
}

.right h2 {
font-size: 1.8rem;
margin: 0 0 12px;
}

.right p {
color: rgba(255, 255, 255, 0.78);
font-size: 1.05rem;
line-height: 1.6;
}

.right span {
color: #00e5ff;
}

.line {
margin-top: 28px;
width: 85px;
height: 3px;
border-radius: 999px;
background: #00e5ff;
box-shadow: 0 0 18px rgba(0, 229, 255, 0.75);
}

@media (max-width: 1100px) {
.hero {
grid-template-columns: 1fr;
padding: 40px;
}

.doorArea {
width: 320px;
height: 520px;
}

.right {
max-width: none;
}
}
`}</style>
</main>
);
}
