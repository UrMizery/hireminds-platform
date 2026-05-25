"use client";

import Link from "next/link";

export default function OpenRoomPage() {
return (
<main className="page">
<section className="left">
<p className="eyebrow">LIVE COMMUNITY SPACE</p>

<h1>OPEN ROOM</h1>

<p className="description">
Live Q&A, networking, resource drops, updates, and community
conversations.
</p>

<div className="note">
This is not a workshop.
<br />
Pull up, ask questions, network, hear updates, and connect.
</div>

<div className="details">
<span>🗓 Last Tuesday Monthly</span>
<span>⏰ 6:00PM–7:00PM</span>
<span>🚪 Doors close 6:15PM</span>
</div>
</section>

<section className="center">
<Link href="/open-room/live" className="doorLink">
<div className="doorGlow" />

<div className="door">
<div className="brand">HireMinds</div>

<div className="sub">
OPEN ROOM
</div>

<div className="knob" />
</div>
</Link>
</section>

<section className="right">
<div className="arrow">
←
</div>

<div className="enterText">
ENTER OPEN ROOM

<div className="small">
Step in for live questions,
connections, resources,
and conversation.
</div>
</div>
</section>

<style jsx>{`

.page{
min-height:100vh;
display:grid;
grid-template-columns:1fr 420px 1fr;
align-items:center;
gap:60px;
padding:60px;

background:
radial-gradient(
circle at center,
rgba(0,122,255,.08),
transparent 28%
),
linear-gradient(
180deg,
#050505,
#0b0c10,
#121317
);

color:white;
overflow:hidden;
}

.left{
max-width:520px;
}

.eyebrow{
font-size:12px;
font-weight:900;
letter-spacing:.15em;
color:#93bfff;
}

h1{
font-size:clamp(4rem,8vw,7rem);
margin:14px 0;
line-height:.9;
font-weight:950;
}

.description{
line-height:1.8;
opacity:.82;
font-size:1.05rem;
}

.note{
margin-top:22px;
padding:18px;
background:
rgba(255,255,255,.05);

border:
1px solid rgba(255,255,255,.08);

border-radius:14px;

line-height:1.6;
font-weight:700;
}

.details{
display:flex;
flex-wrap:wrap;
gap:12px;
margin-top:25px;
}

.details span{
padding:12px 14px;
background:
rgba(255,255,255,.06);

border:
1px solid rgba(255,255,255,.08);

border-radius:999px;

font-size:13px;
font-weight:800;
}

.center{
display:flex;
justify-content:center;
}

.doorLink{
position:relative;
text-decoration:none;
}

.doorGlow{
position:absolute;
inset:-70px;
background:
rgba(0,122,255,.16);

filter:blur(90px);
}

.door{

width:320px;
height:450px;

border-radius:10px;

background:
linear-gradient(
180deg,
#101827,
#071018
);

border:
2px solid rgba(
122,
214,
255,
.55
);

box-shadow:
0 0 25px rgba(0,122,255,.4);

display:flex;
justify-content:center;
align-items:center;
flex-direction:column;

position:relative;

transition:.3s;
}

.door:hover{

transform:
translateY(-8px);

box-shadow:
0 0 45px rgba(0,122,255,.6);

}

.brand{
font-size:42px;
font-weight:950;
margin-bottom:16px;
}

.sub{
letter-spacing:.2em;
font-size:16px;
color:#8bdcff;
font-weight:900;
}

.knob{
position:absolute;
right:30px;
width:14px;
height:14px;
border-radius:50%;
background:#ffd65f;
}

.right{
display:flex;
align-items:center;
gap:20px;
}

.arrow{
font-size:90px;
color:#82cfff;
}

.enterText{
font-size:1.7rem;
font-weight:950;
line-height:1.3;
max-width:330px;
}

.small{
margin-top:14px;
font-size:1rem;
line-height:1.7;
font-weight:700;
opacity:.75;
}

@media(max-width:1000px){

.page{
grid-template-columns:1fr;
text-align:center;
}

.left{
max-width:none;
}

.right{
justify-content:center;
flex-direction:column;
}

.arrow{
transform:rotate(90deg);
}

.details{
justify-content:center;
}

}

`}</style>

</main>
);
}
