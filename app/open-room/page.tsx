"use client";

export default function OpenRoomPage() {
return (
<>
<section className="openRoomHero">

<div className="openGlow"/>

<div className="openContent">

<div className="liveBadge">
🔴 LIVE COMMUNITY SPACE
</div>

<h1>
OPEN ROOM
</h1>

<p className="sub">
HireMinds™ Open Room is a live interactive space built for
networking, community conversations, opportunities, support,
career discussions, quick help, and random cool moments.
</p>

<div className="statsRow">

<div className="statCard">
<h3>📅 Schedule</h3>
<p>Last Tuesday every month</p>
</div>

<div className="statCard">
<h3>⏰ Time</h3>
<p>6:00PM–7:00PM</p>
</div>

<div className="statCard">
<h3>🚪 Opens</h3>
<p>5:50PM</p>
</div>

<div className="statCard">
<h3>🎉 Vibe</h3>
<p>Come curious. Leave sharper.</p>
</div>

</div>

<div className="openGrid">

<div className="roomCard">
<h2>🎤 Inside Open Room</h2>

<ul>
<li>Live Q&A</li>
<li>Career support</li>
<li>Mini games + challenges</li>
<li>Community shoutouts</li>
<li>Partner spotlights</li>
<li>Job leads + hiring updates</li>
<li>Networking</li>
<li>Surprise drops</li>
<li>Resource sharing</li>
<li>HireMinds updates</li>
</ul>
</div>

<div className="roomCard">
<h2>🌟 Who Should Join?</h2>

<ul>
<li>Participants</li>
<li>Partners</li>
<li>Employers</li>
<li>Community Members</li>
<li>Future Professionals</li>
</ul>
</div>

<div className="roomCard">
<h2>👜 Bring:</h2>

<ul>
<li>Questions</li>
<li>Wins</li>
<li>Goals</li>
<li>Ideas</li>
<li>Updates</li>
<li>Or just pull up and vibe</li>
</ul>
</div>

</div>

</div>

</section>

<style jsx>{`

.openRoomHero{
position:relative;
overflow:hidden;
padding:60px;
border-radius:45px;
background:
linear-gradient(
135deg,
rgba(19,20,38,.95),
rgba(10,11,22,.98)
);

border:1px solid rgba(255,255,255,.08);

box-shadow:
0 0 90px rgba(255,0,204,.15);

min-height:100vh;

color:white;
}

.openGlow{

position:absolute;

width:700px;

height:700px;

background:#ff3ad9;

filter:blur(200px);

opacity:.15;

top:-250px;

right:-150px;

}

.liveBadge{

display:inline-flex;

padding:10px 18px;

border-radius:999px;

background:#ff006624;

border:1px solid #ff006660;

font-weight:900;

margin-bottom:20px;

}

h1{

font-size:90px;

margin:0;

line-height:.9;

}

.sub{

max-width:950px;

font-size:22px;

opacity:.85;

line-height:1.6;

margin:25px 0;

}

.statsRow{

display:grid;

grid-template-columns:
repeat(4,1fr);

gap:18px;

margin:40px 0;

}

.statCard{

padding:20px;

border-radius:24px;

background:
rgba(255,255,255,.06);

backdrop-filter:blur(20px);

}

.openGrid{

display:grid;

grid-template-columns:
repeat(3,1fr);

gap:25px;

margin-top:35px;

}

.roomCard{

padding:30px;

border-radius:28px;

background:
rgba(255,255,255,.05);

border:
1px solid rgba(255,255,255,.08);

}

.roomCard ul{

line-height:2;

}

@media(max-width:1000px){

.statsRow,
.openGrid{

grid-template-columns:1fr;

}

h1{

font-size:58px;

}

}

`}</style>
</>
);
}
