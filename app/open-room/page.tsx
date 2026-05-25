"use client";

import Link from "next/link";

export default function OpenRoomDoorPage() {
return (
<main style={styles.page}>
<div style={styles.glow}></div>

<section style={styles.content}>
<p style={styles.kicker}>HireMinds™ Community Space</p>

<h1 style={styles.title}>
Open Room
</h1>

<p style={styles.subtitle}>
Conversations. Networking. Support. Career wins. Resources.
Click the door and enter the room.
</p>

<Link href="/open-room/live" style={styles.doorWrap}>
<div style={styles.door}>
<div style={styles.doorInner}/>
<div style={styles.knob}/>
</div>
</Link>

<p style={styles.enter}>
🚪 Tap Door To Enter
</p>
</section>
</main>
);
}

const styles: Record<string, React.CSSProperties> = {

page:{
minHeight:"100vh",
background:
"radial-gradient(circle at center, rgba(0,229,255,.16), transparent 20%), linear-gradient(180deg,#020202,#07121d)",
display:"flex",
justifyContent:"center",
alignItems:"center",
overflow:"hidden",
position:"relative"
},

glow:{
position:"absolute",
width:700,
height:700,
borderRadius:"50%",
background:"rgba(0,229,255,.10)",
filter:"blur(100px)"
},

content:{
position:"relative",
zIndex:2,
textAlign:"center",
color:"white"
},

kicker:{
color:"#10f3ff",
fontWeight:900,
letterSpacing:2,
textTransform:"uppercase"
},

title:{
fontSize:"clamp(3rem,8vw,5rem)",
margin:"8px 0"
},

subtitle:{
maxWidth:700,
lineHeight:1.6,
opacity:.8,
marginBottom:40
},

doorWrap:{
display:"inline-block",
textDecoration:"none"
},

door:{
height:340,
width:220,
background:
"linear-gradient(180deg,#2b1c10,#1a120c)",
borderRadius:"10px 10px 2px 2px",
position:"relative",
boxShadow:"0 0 80px rgba(0,229,255,.15)",
animation:"swing 3s ease-in-out infinite"
},

doorInner:{
position:"absolute",
left:20,
top:20,
right:20,
bottom:20,
border:"2px solid rgba(255,255,255,.15)"
},

knob:{
position:"absolute",
right:24,
top:"50%",
height:18,
width:18,
borderRadius:"50%",
background:"#ffd249"
},

enter:{
marginTop:25,
fontWeight:800
}

};
