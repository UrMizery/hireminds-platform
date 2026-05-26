"use client";

import Link from "next/link";
import React, { useState } from "react";

type Flyer = {
id:number;
tag:string;
title:string;
description:string;
details?:string;
likes:number;
saved:boolean;
color:"pink"|"blue"|"yellow"|"purple"|"green";
x:number;
y:number;
};

export default function LiveBulletinBoardPage(){

const [draggingId,setDraggingId]=useState<number|null>(null);

const [offset,setOffset]=useState({
x:0,
y:0
});

const [flyers,setFlyers]=useState<Flyer[]>([
{
id:1,
tag:"MONTHLY LIVE ROOM",
title:"OPEN ROOM",

description:
"Pull up for quick Q&A, mini games, career tips, shoutouts, challenges, updates, networking and random cool moments.",

details:
"Last Tuesday • 6PM–7PM • Room Opens 5:50PM • Surprise drops + community fun",

likes:24,
saved:false,
color:"pink",

x:50,
y:70
},

{
id:2,
tag:"TRAINING PREVIEW",
title:"FREE COVID-19 & Workplace Safety Awareness",

description:
"Preview pathways, practice skills and test out live assessments.",

likes:17,
saved:false,
color:"blue",

x:470,
y:90
},

{
id:3,
tag:"OPPORTUNITY",

title:"HIRING EVENT",

description:
"Multiple employers. Multiple openings. Pull up ready.",

likes:31,
saved:false,

color:"green",

x:900,
y:80
},

{
id:4,
tag:"COMMUNITY",

title:"PARTNER SPOTLIGHT",

description:
"Organizations creating visibility and opportunity.",

likes:10,

saved:false,

color:"yellow",

x:150,
y:450
},

{
id:5,

tag:"SKILL BUILDER",

title:"DIGITAL LITERACY",

description:
"Build confidence with digital tools and workforce technology.",

likes:12,

saved:false,

color:"purple",

x:760,
y:500
}

]);

function likeFlyer(id:number){

setFlyers(prev=>
prev.map(f=>
f.id===id
? {...f,likes:f.likes+1}
:f
));
}

function saveFlyer(id:number){

setFlyers(prev=>
prev.map(f=>
f.id===id
? {...f,saved:true}
:f
));
}

function removeSavedFlyer(id:number){

setFlyers(prev=>
prev.map(f=>
f.id===id
? {...f,saved:false}
:f
));
}

function deleteFlyer(id:number){

setFlyers(prev=>
prev.filter(f=>f.id!==id)
);
}

function startDrag(
e:React.MouseEvent,
flyer:Flyer
){

const target=e.target as HTMLElement;

if(target.closest("button")) return;

setDraggingId(flyer.id);

setOffset({

x:e.clientX-flyer.x,

y:e.clientY-flyer.y

});

}

function moveDrag(
e:React.MouseEvent
){

if(draggingId===null) return;

setFlyers(prev=>
prev.map(f=>
f.id===draggingId
?{
...f,

x:e.clientX-offset.x,

y:e.clientY-offset.y
}
:f
));

}

function stopDrag(){

setDraggingId(null);

}

return(

<main
className="page"

onMouseMove={moveDrag}

onMouseUp={stopDrag}

onMouseLeave={stopDrag}
>

<section className="hero">

<div>

<p className="small">
HireMinds™ Open Room
</p>

<h1>
LIVE BULLETIN BOARD
</h1>

<p className="summary">

A live wall for opportunities, updates, events, announcements and cool stuff happening around HireMinds.

</p>

</div>

<Link
href="/profile"
className="backBtn"
>

Return To My Profile

</Link>

</section>

<div className="board">

{flyers.map(flyer=>(

<div

key={flyer.id}

onMouseDown={(e)=>startDrag(e,flyer)}

className={`flyer ${flyer.color}`}

style={{
left:flyer.x,
top:flyer.y
}}

>

<div className="pin"/>

{flyer.saved&&(
<div className="saved">
⭐ SAVED
</div>
)}

<div className="tag">

{flyer.tag}

</div>

<h2>

{flyer.title}

</h2>

<p>

{flyer.description}

</p>

{flyer.details&&(

<div className="details">

{flyer.details}

</div>

)}

<div className="actions">

<button
onClick={()=>
likeFlyer(flyer.id)}
>

👍 {flyer.likes}

</button>

{!flyer.saved?

<button
onClick={()=>
saveFlyer(flyer.id)}
>

Save ⭐

</button>

:

<button
onClick={()=>
removeSavedFlyer(
flyer.id
)}
>

Unsave

</button>

}

<button
onClick={()=>
deleteFlyer(
flyer.id
)}
>

🗑 Delete

</button>

</div>

</div>

))}

</div>

<style jsx>{`

.page{

min-height:100vh;

padding:40px;

background:
radial-gradient(
circle at top left,
#ff34c81e,
transparent 30%
),

radial-gradient(
circle at right,
#31e7ff1f,
transparent 40%
),

linear-gradient(
135deg,
#090b15,
#15192a,
#090909
);

color:white;

overflow:hidden;

}

.hero{

display:flex;

justify-content:space-between;

margin-bottom:30px;

}

.small{

color:#61e7ff;

font-weight:900;

letter-spacing:3px;

}

h1{

font-size:72px;

margin:0;

}

.summary{

width:800px;

opacity:.8;

font-size:20px;

}

.backBtn{

padding:15px 25px;

border-radius:999px;

background:#ffffff12;

color:white;

text-decoration:none;

font-weight:800;

height:fit-content;

}

.board{

position:relative;

height:1200px;

border-radius:45px;

overflow:hidden;

background:

linear-gradient(
180deg,
rgba(255,255,255,.03),
rgba(255,255,255,.01)
);

box-shadow:
0 0 100px #b650ff30;

}

.flyer{

position:absolute;

width:360px;

min-height:310px;

padding:30px;

border-radius:35px;

cursor:grab;

transition:.2s;

background:
rgba(
255,255,255,.05
);

backdrop-filter:blur(14px);

border:2px solid currentColor;

box-shadow:
0 0 35px currentColor;

}

.flyer:hover{

transform:
scale(1.05)
rotate(-2deg);

}

.pin{

position:absolute;

top:-15px;

left:50%;

transform:
translateX(-50%);

width:30px;

height:30px;

border-radius:999px;

background:white;

}

.tag{

font-size:12px;

font-weight:900;

letter-spacing:2px;

}

.flyer h2{

font-size:35px;

margin:10px 0;

}

.details{

margin-top:15px;

display:inline-block;

padding:10px;

border-radius:999px;

background:#ffffff14;

font-size:12px;

}

.actions{

position:absolute;

bottom:20px;

display:flex;

gap:10px;

}

.actions button{

border:none;

padding:10px 14px;

border-radius:999px;

background:#ffffff14;

color:white;

font-weight:800;

cursor:pointer;

}

.saved{

position:absolute;

top:15px;

right:15px;

background:#fff2;

padding:8px 12px;

border-radius:999px;

font-size:12px;

font-weight:900;

}

.pink{color:#ff47df;}
.blue{color:#38dfff;}
.yellow{color:#fff053;}
.green{color:#8fff5f;}
.purple{color:#a984ff;}

`}</style>

</main>

)

}
