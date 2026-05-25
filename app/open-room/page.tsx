"use client";

import Link from "next/link";

export default function OpenRoomPage() {
return (
<main className="page">
<section className="left">

<div className="badge">
🔴 LIVE COMMUNITY SPACE
</div>

<h1>OPEN ROOM</h1>

<p className="description">
A live interactive space for networking, support,
open career conversations, updates, resources,
and random cool moments.
</p>

<div className="details">
<span>🗓 Last Tuesday monthly</span>
<span>⏰ 6PM–7PM</span>
<span>🚪 Doors close 6:15PM</span>
</div>

</section>


<section className="center">

<Link href="/open-room/live" className="doorLink">

<div className="glow"></div>

<div className="door">

<div className="doorText">
ENTER
<br />
OPEN ROOM
</div>

<div className="knob"></div>

</div>

</Link>

</section>


<section className="right">

<h3>WHAT HAPPENS INSIDE?</h3>

<div className="item">🎤 Live Q&A</div>
<div className="item">📁 Resource drops</div>
<div className="item">🔥 Shoutouts</div>
<div className="item">⭐ Partner highlights</div>
<div className="item">💼 Job leads</div>
<div className="item">🤝 Networking</div>
<div className="item">🎉 Wins + updates</div>
<div className="item">🧠 Mini challenges</div>

</section>

<style jsx>{`
.page{
min-height:100vh;
display:grid;
grid-template-columns:1fr 320px 1fr;
align-items:center;
padding:40px;
background:
radial-gradient(circle at center,
rgba(0,229,255,.14),
transparent 25%),
linear-gradient(
180deg,
#1c1d20,
#151618,
#111214
);
color:white;
overflow:hidden;
}

.left{
padding-right:40px;
}

.badge{
display:inline-block;
padding:8px 14px;
border-radius:999px;
background:rgba(255,255,255,.08);
font-size:12px;
font-weight:900;
margin-bottom:18px;
}

h1{
font-size:74px;
margin:0;
font-weight:950;
}

.description{
opacity:.78;
line-height:1.7;
max-width:430px;
}

.details{
display:flex;
gap:10px;
flex-wrap:wrap;
margin-top:25px;
}

.details span{
background:rgba(255,255,255,.08);
padding:10px 14px;
border-radius:999px;
font-size:13px;
}

.center{
display:flex;
justify-content:center;
position:relative;
}

.doorLink{
text-decoration:none;
position:relative;
}

.glow{
position:absolute;
width:250px;
height:250px;
border-radius:50%;
background:#4ff8ff;
filter:blur(80px);
opacity:.8;
top:50%;
left:50%;
transform:
translate(-50%,-50%);
}

.door{
position:relative;
width:170px;
height:250px;
border-radius:
100px 100px 8px 8px;
background:
linear-gradient(
180deg,
#223645,
#162733
);

border:2px solid
rgba(95,247,255,.7);

box-shadow:
0 0 25px rgba(95,247,255,.8),
0 0 60px rgba(95,247,255,.4);

display:flex;
justify-content:center;
align-items:center;

animation:
swing 4s ease-in-out infinite;
}

.doorText{
color:#8bf8ff;
font-size:15px;
font-weight:900;
text-align:center;
line-height:1.5;
}

.knob{
position:absolute;
right:18px;
width:10px;
height:10px;
border-radius:50%;
background:#ffd54d;
}

.right h3{
color:#ffd54d;
font-size:16px;
margin-bottom:15px;
}

.item{
margin-bottom:10px;
padding:12px;
border-radius:14px;
background:
rgba(255,255,255,.06);
border:
1px solid rgba(255,255,255,.1);
}

@keyframes swing{
0%{
transform:rotate(-2deg)
}

50%{
transform:rotate(2deg)
}

100%{
transform:rotate(-2deg)
}
}

@media(max-width:1000px){

.page{
grid-template-columns:1fr;
gap:50px;
text-align:center;
}

.left{
padding:0;
}

.description{
margin:auto;
}

.details{
justify-content:center;
}

}
`}</style>
</main>
);
}
