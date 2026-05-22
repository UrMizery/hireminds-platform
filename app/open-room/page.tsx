"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OpenRoomPage() {
  const router = useRouter();
  const [opening,setOpening]=useState(false);

  function enterRoom(){

    setOpening(true);

    setTimeout(()=>{

      router.push("/open-room/live");

    },1200)

  }

  return(

<main className="page">

<section className="hero">

<div className="glow one"/>
<div className="glow two"/>
<div className="glow three"/>

<div className="left">

<div className="liveBadge">

🔴 LIVE COMMUNITY SPACE

</div>

<h1>

OPEN
ROOM

</h1>

<p className="sub">

A live interactive space for networking, support,
career conversations, opportunities, quick help,
resource drops and random cool moments.

</p>

<div className="quickInfo">

<span>📅 Last Tuesday monthly</span>

<span>⏰ 6PM–7PM</span>

<span>🚪 Opens 5:50PM</span>

</div>

<div className="vibe">

✨ Come curious. Leave sharper.

</div>

</div>

<div className="center">

<button
onClick={enterRoom}
className={`door ${opening?"open":""}`}
>

<div className="doorGlow"/>

<div className="doorPanel">

<div className="knob"/>

<div className="doorText">

ENTER
OPEN ROOM

</div>

</div>

</button>

</div>

<div className="right">

<h2>

WHAT HAPPENS INSIDE?

</h2>

<div className="chips">

<span>🎤 Live Q&A</span>

<span>💼 Job leads</span>

<span>📁 Resource drops</span>

<span>🔥 Shoutouts</span>

<span>🎯 Challenges</span>

<span>🤝 Networking</span>

<span>📢 Updates</span>

<span>⭐ Opportunities</span>

</div>

<h2>

WHO SHOULD JOIN?

</h2>

<div className="chips">

<span>Participants</span>

<span>Partners</span>

<span>Employers</span>

<span>Community</span>

</div>

</div>

</section>

<style jsx>{`

.page{

min-height:100vh;

padding:35px;

background:

radial-gradient(
circle at top right,
rgba(0,229,255,.14),
transparent 30%
),

radial-gradient(
circle at bottom left,
rgba(255,210,73,.10),
transparent 30%
),

linear-gradient(
135deg,
#040913,
#0a1322,
#06070d
);

overflow:hidden;

color:white;

}

.hero{

position:relative;

display:grid;

grid-template-columns:
1fr 340px 1fr;

gap:45px;

padding:55px;

border-radius:40px;

background:
rgba(255,255,255,.04);

border:
1px solid rgba(255,255,255,.09);

box-shadow:
0 0 80px rgba(0,229,255,.08);

min-height:90vh;

align-items:center;

overflow:hidden;

}

.glow{

position:absolute;

border-radius:999px;

filter:blur(90px);

opacity:.3;

}

.one{

background:#00e5ff;

width:300px;

height:300px;

top:-120px;

right:15%;

}

.two{

background:#ffd249;

width:250px;

height:250px;

bottom:-120px;

left:10%;

}

.three{

background:#0056ff;

width:180px;

height:180px;

top:50%;

left:40%;

opacity:.15;

}

.liveBadge{

display:inline-flex;

padding:10px 16px;

border-radius:999px;

background:#ffffff08;

border:
1px solid rgba(255,255,255,.1);

font-weight:900;

margin-bottom:25px;

}

h1{

font-size:110px;

line-height:.82;

margin:0;

letter-spacing:-6px;

}

.sub{

font-size:20px;

line-height:1.8;

opacity:.85;

max-width:600px;

}

.quickInfo{

display:flex;

flex-wrap:wrap;

gap:10px;

margin-top:30px;

}

.quickInfo span{

padding:12px 16px;

border-radius:999px;

background:
rgba(255,255,255,.06);

font-weight:800;

font-size:13px;

}

.vibe{

margin-top:20px;

padding:16px;

border-radius:20px;

background:
rgba(0,229,255,.08);

display:inline-block;

font-weight:800;

}

.center{

display:flex;

justify-content:center;

}

.door{

width:260px;

height:420px;

background:transparent;

border:none;

cursor:pointer;

position:relative;

perspective:1200px;

}

.doorGlow{

position:absolute;

inset:-25px;

border-radius:40px;

background:
linear-gradient(
135deg,
#00e5ff,
#ffd249
);

filter:blur(40px);

opacity:.45;

}

.doorPanel{

position:absolute;

inset:0;

border-radius:
120px
120px
18px
18px;

background:

linear-gradient(
135deg,
#06111f,
#10203a
);

border:
3px solid #00e5ff;

box-shadow:

0 0 40px
rgba(0,229,255,.3),

inset 0 0 40px
rgba(0,229,255,.15);

transform-origin:
right center;

transition:
1s;

display:flex;

justify-content:center;

align-items:center;

}

.door.open .doorPanel{

transform:
perspective(1000px)
rotateY(78deg);

}

.knob{

position:absolute;

left:30px;

width:15px;

height:15px;

border-radius:999px;

background:#ffd249;

top:50%;

box-shadow:
0 0 18px #ffd249;

}

.doorText{

font-size:30px;

font-weight:900;

text-align:center;

color:#00e5ff;

line-height:1.3;

}

.right h2{

font-size:18px;

margin-bottom:15px;

color:#ffd249;

}

.chips{

display:flex;

gap:10px;

flex-wrap:wrap;

margin-bottom:25px;

}

.chips span{

padding:11px 14px;

border-radius:18px;

background:
rgba(255,255,255,.06);

font-size:13px;

font-weight:800;

}

@media(max-width:1100px){

.hero{

grid-template-columns:1fr;

}

h1{

font-size:70px;

}

.center{

order:-1;

}

}

`}</style>

</main>

)

}
