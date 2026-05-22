"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OpenRoomLivePage() {
const router = useRouter();

const [roomLink, setRoomLink] = useState(
"https://whereby.com/hireminds-open-room"
);

return (
<main className="page">
<aside className="side">
<h2>OPEN ROOM</h2>
<p className="live">● LIVE NOW</p>

<button className="active">🏠 Room</button>
<button>💬 Chat</button>
<button>👥 People</button>
<button>📁 Resources</button>
<button>💼 Opportunities</button>
<button>⭐ Highlights</button>

<button className="exit" onClick={() => router.push("/open-room")}>
🚪 Exit Room
</button>
</aside>

<section className="main">
<p className="eyebrow">You’re inside</p>
<h1>OPEN ROOM 🎉</h1>

<p className="intro">
This is the live HireMinds™ community space for real-time support,
career conversations, networking, shoutouts, quick updates, resource
drops, job leads, and partner highlights.
</p>

<div className="joinBox">
<div>
<p className="eyebrow">Live meeting window</p>
<h2>Join the Room</h2>
<p>
The meeting link can be Zoom, Microsoft Teams, Google Meet,
Whereby, or any live room link you want to use.
</p>
</div>

<input
value={roomLink}
onChange={(e) => setRoomLink(e.target.value)}
placeholder="Paste Zoom, Teams, Google Meet, or Whereby link"
/>

<a href={roomLink} target="_blank" className="joinBtn">
🚪 Enter Live Room
</a>
</div>

<div className="cards">
<div>
<h3>🎤 What happens here?</h3>
<p>Live Q&A, career support, quick tips, and real-time updates.</p>
</div>

<div>
<h3>💼 Opportunities</h3>
<p>Job leads, hiring events, partner drops, and announcements.</p>
</div>

<div>
<h3>📁 Resources</h3>
<p>Useful links, guides, worksheets, and tools shared during room time.</p>
</div>

<div>
<h3>🔥 Community Vibes</h3>
<p>Wins, shoutouts, mini challenges, and networking moments.</p>
</div>
</div>
</section>

<section className="right">
<h2>Room Details</h2>

<div className="detail">
<strong>Schedule</strong>
<span>Last Tuesday monthly</span>
</div>

<div className="detail">
<strong>Time</strong>
<span>6:00PM – 7:00PM</span>
</div>

<div className="detail">
<strong>Doors Open</strong>
<span>5:50PM</span>
</div>

<div className="detail">
<strong>Bring</strong>
<span>Questions, wins, goals, updates, ideas, or just pull up.</span>
</div>
</section>

<style jsx>{`
.page {
min-height: 100vh;
display: grid;
grid-template-columns: 240px 1fr 360px;
gap: 24px;
padding: 28px;
background:
radial-gradient(circle at top right, rgba(0, 229, 255, 0.16), transparent 30%),
linear-gradient(135deg, #050814, #0b1220, #05060d);
color: white;
}

.side,
.main,
.right {
border-radius: 28px;
background: rgba(255, 255, 255, 0.055);
border: 1px solid rgba(255, 255, 255, 0.12);
padding: 24px;
}

.side {
display: flex;
flex-direction: column;
gap: 12px;
}

.live {
color: #3cff82;
font-weight: 900;
}

button {
padding: 13px 14px;
border-radius: 16px;
border: 1px solid rgba(255, 255, 255, 0.12);
background: rgba(255, 255, 255, 0.06);
color: white;
font-weight: 850;
text-align: left;
cursor: pointer;
}

.active {
background: rgba(0, 229, 255, 0.18);
color: #10f3ff;
}

.exit {
margin-top: auto;
color: #ff7474;
border-color: rgba(255, 116, 116, 0.35);
}

.eyebrow {
color: #10f3ff;
font-weight: 900;
text-transform: uppercase;
letter-spacing: 0.08em;
}

h1 {
font-size: clamp(3rem, 7vw, 6rem);
margin: 0;
color: #10f3ff;
}

.intro {
max-width: 780px;
line-height: 1.7;
color: rgba(255, 255, 255, 0.82);
font-size: 1.15rem;
}

.joinBox {
margin: 28px 0;
padding: 28px;
border-radius: 28px;
background:
linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(255, 210, 73, 0.08)),
rgba(255, 255, 255, 0.055);
border: 1px solid rgba(0, 229, 255, 0.2);
box-shadow: 0 0 45px rgba(0, 229, 255, 0.1);
}

.joinBox h2 {
margin: 0 0 8px;
font-size: 2rem;
}

.joinBox p {
color: rgba(255, 255, 255, 0.78);
line-height: 1.5;
}

input {
width: 100%;
margin: 14px 0;
padding: 15px;
border-radius: 999px;
border: 1px solid rgba(255, 255, 255, 0.16);
background: rgba(0, 0, 0, 0.3);
color: white;
font-weight: 800;
}

.joinBtn {
display: inline-flex;
padding: 14px 22px;
border-radius: 999px;
background: linear-gradient(135deg, #10f3ff, #ffd249);
color: #06111f;
text-decoration: none;
font-weight: 950;
}

.cards {
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 16px;
}

.cards div,
.detail {
padding: 18px;
border-radius: 20px;
background: rgba(255, 255, 255, 0.06);
border: 1px solid rgba(255, 255, 255, 0.1);
}

.cards p {
color: rgba(255, 255, 255, 0.75);
line-height: 1.5;
}

.right h2 {
color: #ffd249;
}

.detail {
display: grid;
gap: 6px;
margin-bottom: 14px;
}

.detail span {
color: rgba(255, 255, 255, 0.78);
line-height: 1.4;
}

@media (max-width: 1100px) {
.page {
grid-template-columns: 1fr;
}

.cards {
grid-template-columns: 1fr;
}
}
`}</style>
</main>
);
}
