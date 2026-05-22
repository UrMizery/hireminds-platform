"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OpenRoomLobbyPage() {
const router = useRouter();
const [opening, setOpening] = useState(false);

function enterRoom() {
setOpening(true);
setTimeout(() => {
router.push("/open-room/live");
}, 1200);
}

return (
<main className="page">
<section className="lobby">
<div className="left">
<div className="badge">🔴 LIVE COMMUNITY SPACE</div>

<h1>OPEN ROOM</h1>

<p>
A live interactive space for networking, support, opportunities,
career conversations, updates, resources, and random cool moments.
</p>

<div className="info">
<span>📅 Last Tuesday monthly</span>
<span>⏰ 6PM–7PM</span>
<span>🚪 Opens 5:50PM</span>
</div>

<div className="vibe">✨ Come curious. Leave sharper.</div>
</div>

<button
className={`doorWrap ${opening ? "open" : ""}`}
onClick={enterRoom}
aria-label="Enter Open Room"
>
<span className="doorLight" />

<span className="doorFrame">
<span className="door doorLeft">
<span className="panelLines" />
<span className="knob leftKnob" />
</span>

<span className="door doorRight">
<span className="panelLines" />
<span className="knob rightKnob" />
</span>
</span>

<span className="enterText">ENTER OPEN ROOM</span>
</button>

<div className="right">
<h2>What happens inside?</h2>

<div className="list">
<span>🎤 Live Q&A</span>
<span>💼 Job leads</span>
<span>📁 Resource drops</span>
<span>🤝 Networking</span>
<span>🔥 Shoutouts</span>
<span>🎯 Mini challenges</span>
<span>🌟 Partner highlights</span>
<span>📢 HireMinds updates</span>
</div>

<h2>Who should join?</h2>

<div className="list smallList">
<span>Participants</span>
<span>Partners</span>
<span>Employers</span>
<span>Community</span>
</div>
</div>
</section>

<style jsx>{`
.page {
min-height: 100vh;
padding: 40px;
background:
radial-gradient(circle at 80% 20%, rgba(0, 229, 255, 0.16), transparent 30%),
radial-gradient(circle at 30% 90%, rgba(255, 210, 73, 0.12), transparent 28%),
linear-gradient(135deg, #050814, #0b1220, #05060d);
color: white;
}

.lobby {
min-height: calc(100vh - 80px);
border-radius: 38px;
padding: 48px;
display: grid;
grid-template-columns: 1fr 390px 1fr;
gap: 42px;
align-items: center;
border: 1px solid rgba(255, 255, 255, 0.12);
background: rgba(255, 255, 255, 0.045);
box-shadow: 0 0 90px rgba(0, 229, 255, 0.12);
overflow: hidden;
}

.badge {
display: inline-block;
padding: 10px 15px;
border-radius: 999px;
background: rgba(255, 255, 255, 0.07);
border: 1px solid rgba(255, 255, 255, 0.14);
font-weight: 900;
}

h1 {
margin: 24px 0;
font-size: clamp(4rem, 9vw, 8rem);
line-height: 0.82;
letter-spacing: -0.07em;
}

p {
max-width: 560px;
font-size: 1.25rem;
line-height: 1.6;
color: rgba(255, 255, 255, 0.8);
font-weight: 700;
}

.info {
display: flex;
flex-wrap: wrap;
gap: 12px;
margin-top: 28px;
}

.info span,
.list span,
.vibe {
padding: 12px 14px;
border-radius: 18px;
background: rgba(255, 255, 255, 0.07);
border: 1px solid rgba(255, 255, 255, 0.12);
font-weight: 850;
}

.vibe {
display: inline-block;
margin-top: 18px;
color: #ffd249;
}

.doorWrap {
position: relative;
width: 350px;
height: 470px;
border: none;
background: transparent;
cursor: pointer;
perspective: 1300px;
margin: auto;
}

.doorLight {
position: absolute;
left: 50%;
top: 42px;
transform: translateX(-50%);
width: 250px;
height: 360px;
background:
radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 1), rgba(255, 210, 73, 0.9) 26%, rgba(0, 229, 255, 0.28) 58%, transparent 76%);
filter: blur(4px);
opacity: 0.95;
box-shadow:
0 0 80px rgba(255, 255, 255, 0.75),
0 0 130px rgba(255, 210, 73, 0.5);
}

.doorFrame {
position: absolute;
left: 50%;
top: 20px;
transform: translateX(-50%);
width: 300px;
height: 390px;
border: 10px solid #202836;
border-bottom: none;
background: rgba(0, 0, 0, 0.2);
box-shadow:
0 0 35px rgba(0, 0, 0, 0.6),
inset 0 0 35px rgba(255, 255, 255, 0.08);
overflow: visible;
}

.door {
position: absolute;
top: 0;
width: 50%;
height: 100%;
background:
linear-gradient(135deg, #151b25, #38404b 48%, #111722);
border: 2px solid rgba(255, 255, 255, 0.22);
box-shadow:
inset 0 0 24px rgba(255, 255, 255, 0.08),
0 0 22px rgba(0, 0, 0, 0.45);
transition: transform 1s ease;
transform-style: preserve-3d;
}

.doorLeft {
left: 0;
transform-origin: left center;
}

.doorRight {
right: 0;
transform-origin: right center;
}

.open .doorLeft {
transform: rotateY(-72deg);
}

.open .doorRight {
transform: rotateY(72deg);
}

.panelLines {
position: absolute;
inset: 45px 25px;
border: 2px solid rgba(255, 255, 255, 0.13);
box-shadow:
inset 0 0 0 18px rgba(0, 0, 0, 0.08),
inset 0 0 0 42px rgba(255, 255, 255, 0.04);
}

.knob {
position: absolute;
top: 52%;
width: 12px;
height: 12px;
border-radius: 999px;
background: #111;
border: 2px solid #ffd249;
box-shadow: 0 0 12px rgba(255, 210, 73, 0.9);
}

.leftKnob {
right: 12px;
}

.rightKnob {
left: 12px;
}

.enterText {
position: absolute;
left: 50%;
bottom: 8px;
transform: translateX(-50%);
color: #10f3ff;
font-weight: 950;
letter-spacing: 0.08em;
text-shadow: 0 0 18px rgba(16, 243, 255, 0.85);
white-space: nowrap;
}

.right h2 {
color: #ffd249;
text-transform: uppercase;
font-size: 1rem;
margin: 0 0 14px;
}

.right h2:nth-of-type(2) {
margin-top: 28px;
}

.list {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 12px;
}

.smallList span {
text-align: center;
}

@media (max-width: 1100px) {
.lobby {
grid-template-columns: 1fr;
}

.doorWrap {
width: 320px;
}
}
`}</style>
</main>
);
}
