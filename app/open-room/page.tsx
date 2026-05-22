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
}, 900);
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
</div>

<button
className={`door ${opening ? "open" : ""}`}
onClick={enterRoom}
aria-label="Enter Open Room"
>
<span className="light" />
<span className="panel">
<span className="knob" />
<strong>ENTER<br />OPEN ROOM</strong>
</span>
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
</div>
</section>

<style jsx>{`
.page {
min-height: 100vh;
padding: 40px;
background:
radial-gradient(circle at 80% 20%, rgba(0, 229, 255, .18), transparent 30%),
radial-gradient(circle at 30% 90%, rgba(255, 210, 73, .12), transparent 28%),
linear-gradient(135deg, #050814, #0b1220, #05060d);
color: white;
}

.lobby {
min-height: calc(100vh - 80px);
border-radius: 38px;
padding: 48px;
display: grid;
grid-template-columns: 1fr 330px 1fr;
gap: 42px;
align-items: center;
border: 1px solid rgba(255,255,255,.12);
background: rgba(255,255,255,.045);
box-shadow: 0 0 90px rgba(0,229,255,.12);
}

.badge {
display: inline-block;
padding: 10px 15px;
border-radius: 999px;
background: rgba(255,255,255,.07);
border: 1px solid rgba(255,255,255,.14);
font-weight: 900;
}

h1 {
margin: 24px 0;
font-size: clamp(4rem, 9vw, 8rem);
line-height: .82;
letter-spacing: -.07em;
}

p {
max-width: 560px;
font-size: 1.25rem;
line-height: 1.6;
color: rgba(255,255,255,.8);
font-weight: 700;
}

.info {
display: flex;
flex-wrap: wrap;
gap: 12px;
margin-top: 28px;
}

.info span,
.list span {
padding: 12px 14px;
border-radius: 18px;
background: rgba(255,255,255,.07);
border: 1px solid rgba(255,255,255,.12);
font-weight: 850;
}

.door {
height: 430px;
width: 280px;
border: none;
background: transparent;
position: relative;
cursor: pointer;
perspective: 900px;
}

.light {
position: absolute;
inset: -24px;
border-radius: 40px;
background: linear-gradient(135deg, #10f3ff, #ffd249);
filter: blur(35px);
opacity: .45;
}

.panel {
position: absolute;
inset: 0;
border-radius: 120px 120px 14px 14px;
background:
linear-gradient(145deg, #07111f, #101b2e);
border: 3px solid rgba(16,243,255,.8);
box-shadow:
inset 0 0 35px rgba(16,243,255,.18),
0 0 35px rgba(16,243,255,.28);
transform-origin: left center;
transition: transform .85s ease;
display: flex;
align-items: center;
justify-content: center;
color: #10f3ff;
font-size: 1.35rem;
text-shadow: 0 0 18px rgba(16,243,255,.7);
}

.door.open .panel {
transform: rotateY(-78deg);
}

.knob {
position: absolute;
right: 34px;
top: 52%;
width: 17px;
height: 17px;
border-radius: 999px;
background: #ffd249;
box-shadow: 0 0 18px #ffd249;
}

.right h2 {
color: #ffd249;
text-transform: uppercase;
}

.list {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 12px;
}

@media(max-width: 1000px) {
.lobby {
grid-template-columns: 1fr;
}
}
`}</style>
</main>
);
}
