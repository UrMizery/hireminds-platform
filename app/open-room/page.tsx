"use client";

import Link from "next/link";

export default function OpenRoomPage() {
return (
<main className="page">
<section className="left">
<p className="eyebrow">LIVE COMMUNITY SPACE</p>

<h1>OPEN ROOM</h1>

<p className="description">
A live space for Q&A, networking, resource drops, job leads, quick
updates, and community connections.
</p>

<p className="note">
This is not a workshop — it is an open room for real-time
conversation and support.
</p>

<div className="details">
<span>Last Tuesday monthly</span>
<span>6:00PM–7:00PM</span>
<span>Door closes 6:15PM</span>
</div>
</section>

<section className="center">
<Link href="/open-room/live" className="doorLink">
<div className="doorGlow" />
<div className="door">
<div className="doorBrand">HireMinds</div>
<div className="doorText">OPEN ROOM</div>
<div className="knob" />
</div>
</Link>
</section>

<section className="right">
<div className="arrow">←</div>
<p className="enterText">Enter the room. Bring the question, the win, or the next move.</p>
</section>

<style jsx>{`
.page {
min-height: 100vh;
display: grid;
grid-template-columns: 1fr 360px 1fr;
align-items: center;
gap: 50px;
padding: 60px;
background:
radial-gradient(circle at center, rgba(0, 190, 255, 0.16), transparent 32%),
linear-gradient(135deg, #111318, #1a1d22, #0b0c0f);
color: white;
overflow: hidden;
}

.eyebrow {
color: #9edcff;
font-weight: 900;
letter-spacing: 0.12em;
font-size: 13px;
text-transform: uppercase;
}

h1 {
font-size: clamp(4rem, 8vw, 7rem);
line-height: 0.9;
margin: 12px 0;
font-weight: 950;
letter-spacing: -0.06em;
}

.description {
max-width: 500px;
line-height: 1.7;
color: rgba(255, 255, 255, 0.82);
font-size: 1.05rem;
}

.note {
max-width: 500px;
margin-top: 18px;
padding: 14px 16px;
border-left: 3px solid #9edcff;
background: rgba(255, 255, 255, 0.055);
color: rgba(255, 255, 255, 0.82);
border-radius: 12px;
line-height: 1.5;
font-weight: 750;
}

.details {
display: flex;
flex-wrap: wrap;
gap: 10px;
margin-top: 24px;
}

.details span {
padding: 10px 14px;
border-radius: 999px;
background: rgba(255, 255, 255, 0.08);
border: 1px solid rgba(255, 255, 255, 0.12);
font-size: 13px;
font-weight: 850;
}

.center {
display: flex;
justify-content: center;
align-items: center;
}

.doorLink {
position: relative;
display: block;
text-decoration: none;
}

.doorGlow {
position: absolute;
inset: -45px;
background: rgba(0, 213, 255, 0.42);
filter: blur(65px);
border-radius: 34px;
}

.door {
position: relative;
width: 285px;
height: 380px;
border-radius: 22px;
background:
linear-gradient(145deg, #182431, #0e151d 55%, #070b10);
border: 2px solid rgba(141, 234, 255, 0.72);
box-shadow:
0 0 25px rgba(0, 213, 255, 0.45),
inset 0 0 40px rgba(255, 255, 255, 0.035);
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.door:hover {
transform: translateY(-6px) scale(1.02);
box-shadow:
0 0 40px rgba(0, 213, 255, 0.72),
inset 0 0 40px rgba(255, 255, 255, 0.05);
}

.doorBrand {
font-size: 32px;
font-weight: 950;
letter-spacing: -0.04em;
color: white;
margin-bottom: 18px;
}

.doorText {
color: #9edcff;
font-size: 17px;
font-weight: 950;
letter-spacing: 0.14em;
}

.knob {
position: absolute;
right: 28px;
width: 14px;
height: 14px;
border-radius: 50%;
background: #f7d774;
box-shadow: 0 0 15px rgba(247, 215, 116, 0.9);
}

.right {
display: flex;
align-items: center;
gap: 18px;
}

.arrow {
font-size: 95px;
color: #9edcff;
line-height: 1;
text-shadow: 0 0 30px rgba(0, 213, 255, 0.45);
}

.enterText {
max-width: 360px;
font-size: 1.45rem;
line-height: 1.35;
font-weight: 900;
color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 1000px) {
.page {
grid-template-columns: 1fr;
text-align: center;
padding: 40px 22px;
}

.description,
.note {
margin-left: auto;
margin-right: auto;
}

.details {
justify-content: center;
}

.right {
justify-content: center;
flex-direction: column;
}

.arrow {
transform: rotate(90deg);
}
}
`}</style>
</main>
);
}
