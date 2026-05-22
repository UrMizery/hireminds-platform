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
<div className="badge">● LIVE COMMUNITY SPACE</div>

<h1>
OPEN
<br />
ROOM
</h1>

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
className={`doorArea ${opening ? "open" : ""}`}
onClick={enterRoom}
aria-label="Enter Open Room"
>
<span className="backLight" />
<span className="floorLight" />

<span className="doorFrame">
<span className="doorPanel">
<span className="doorInset top" />
<span className="doorInset bottom" />
<span className="doorHandle" />
</span>
</span>

<span className="doorText">Click the door to enter</span>
</button>

<div className="right">
<p className="ready">Ready to walk in?</p>
<p className="rightText">
Click the door and step into Open Room.
</p>

<div className="simpleList">
<span>Live Q&A</span>
<span>Job leads</span>
<span>Resource drops</span>
<span>Networking</span>
</div>
</div>
</section>

<style jsx>{`
.page {
min-height: 100vh;
padding: 40px;
background:
radial-gradient(circle at 72% 22%, rgba(0, 229, 255, 0.14), transparent 26%),
radial-gradient(circle at 48% 82%, rgba(255, 190, 80, 0.1), transparent 22%),
linear-gradient(135deg, #040811, #08111f 48%, #04060c);
color: white;
}

.lobby {
min-height: calc(100vh - 80px);
border-radius: 38px;
padding: 56px 64px;
display: grid;
grid-template-columns: 1fr 430px 0.75fr;
gap: 56px;
align-items: center;
border: 1px solid rgba(255, 255, 255, 0.1);
background:
linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02)),
rgba(4, 8, 17, 0.92);
box-shadow: 0 0 90px rgba(0, 229, 255, 0.08);
overflow: hidden;
}

.badge {
display: inline-flex;
align-items: center;
gap: 8px;
padding: 10px 15px;
border-radius: 999px;
background: rgba(0, 229, 255, 0.08);
border: 1px solid rgba(0, 229, 255, 0.28);
color: white;
font-weight: 900;
font-size: 0.85rem;
}

.badge::first-letter {
color: #10f3ff;
}

h1 {
margin: 26px 0 20px;
font-size: clamp(4.5rem, 9vw, 8rem);
line-height: 0.86;
letter-spacing: -0.07em;
}

h1 br + * {
color: #10f3ff;
}

p {
max-width: 560px;
font-size: 1.12rem;
line-height: 1.7;
color: rgba(255, 255, 255, 0.78);
font-weight: 700;
}

.info {
display: flex;
flex-wrap: wrap;
gap: 12px;
margin-top: 30px;
}

.info span {
padding: 12px 14px;
border-radius: 14px;
background: rgba(255, 255, 255, 0.055);
border: 1px solid rgba(255, 255, 255, 0.11);
font-weight: 850;
font-size: 0.9rem;
}

.vibe {
margin-top: 18px;
color: #ffd36a;
font-weight: 900;
}

.doorArea {
position: relative;
width: 430px;
height: 590px;
border: none;
background: transparent;
cursor: pointer;
perspective: 1500px;
margin: auto;
}

.backLight {
position: absolute;
left: 50%;
top: 104px;
transform: translateX(-50%);
width: 210px;
height: 370px;
border-radius: 6px;
background:
radial-gradient(circle at center, rgba(255, 255, 255, 1), rgba(255, 224, 150, 0.96) 35%, rgba(255, 189, 92, 0.48) 62%, transparent 78%);
filter: blur(2px);
opacity: 0.92;
box-shadow:
0 0 60px rgba(255, 255, 255, 0.55),
0 0 115px rgba(255, 189, 92, 0.34);
transition: opacity 0.7s ease;
}

.floorLight {
position: absolute;
left: 50%;
bottom: 30px;
transform: translateX(-50%);
width: 145px;
height: 190px;
background: linear-gradient(180deg, rgba(255, 221, 150, 0.7), transparent 84%);
clip-path: polygon(38% 0, 62% 0, 100% 100%, 0 100%);
opacity: 0.65;
filter: blur(4px);
transition: opacity 0.7s ease;
}

.doorFrame {
position: absolute;
left: 50%;
top: 68px;
transform: translateX(-50%);
width: 250px;
height: 420px;
border: 14px solid #111824;
border-bottom: 18px solid #111824;
background: rgba(0, 0, 0, 0.25);
box-shadow:
0 0 0 1px rgba(255, 255, 255, 0.08),
0 26px 55px rgba(0, 0, 0, 0.55),
inset 0 0 28px rgba(255, 255, 255, 0.08);
overflow: visible;
}

.doorPanel {
position: absolute;
top: 0;
left: 0;
width: 100%;
height: 100%;
background:
linear-gradient(100deg, #07101c 0%, #172233 45%, #0b111c 100%);
border: 1px solid rgba(255, 255, 255, 0.12);
transform-origin: left center;
transform: rotateY(-22deg);
transition: transform 1s ease;
box-shadow:
inset -26px 0 32px rgba(0, 0, 0, 0.42),
inset 10px 0 18px rgba(255, 255, 255, 0.08),
12px 0 30px rgba(0, 0, 0, 0.35);
}

.open .doorPanel {
transform: rotateY(-72deg);
}

.doorInset {
position: absolute;
left: 34px;
right: 34px;
border: 2px solid rgba(255, 255, 255, 0.1);
box-shadow:
inset 0 0 0 14px rgba(0, 0, 0, 0.08),
inset 0 0 20px rgba(255, 255, 255, 0.035);
}

.doorInset.top {
top: 56px;
height: 128px;
}

.doorInset.bottom {
bottom: 58px;
height: 150px;
}

.doorHandle {
position: absolute;
right: 28px;
top: 50%;
width: 14px;
height: 14px;
border-radius: 999px;
background: #c99a43;
box-shadow: 0 0 14px rgba(255, 211, 106, 0.65);
}

.doorText {
position: absolute;
left: 50%;
bottom: 0;
transform: translateX(-50%);
color: #10f3ff;
font-weight: 950;
letter-spacing: 0.06em;
white-space: nowrap;
text-shadow: 0 0 16px rgba(16, 243, 255, 0.62);
}

.right {
max-width: 420px;
}

.ready {
font-size: 1.8rem;
color: white;
margin: 0 0 8px;
font-weight: 950;
}

.rightText {
margin: 0 0 30px;
}

.simpleList {
display: flex;
flex-wrap: wrap;
gap: 10px;
}

.simpleList span {
padding: 11px 14px;
border-radius: 999px;
background: rgba(255, 255, 255, 0.055);
border: 1px solid rgba(255, 255, 255, 0.1);
font-weight: 850;
font-size: 0.9rem;
}

@media (max-width: 1150px) {
.lobby {
grid-template-columns: 1fr;
padding: 36px;
}

.doorArea {
width: 360px;
height: 540px;
}

.right {
max-width: 100%;
}
}
`}</style>
</main>
);
}
