"use client";

import { useState } from "react";
import { CSSProperties } from "react";
import Link from "next/link";

type BoardPost = {
id:number
title:string
content:string
type:"flyer"|"note"
likes:number
x:number
y:number
}

export default function LiveBoard(){

const [posts,setPosts]=useState<BoardPost[]>([

{
id:1,
title:"HireMinds™ Open Room",
content:"Last Tuesday of every month • 6–7PM • Room opens 5:50PM",
type:"flyer",
likes:8,
x:30,
y:30
},

{
id:2,
title:"Customer Service Demo Training",
content:"Preview customer service pathways and assessments.",
type:"flyer",
likes:4,
x:350,
y:90
},

{
id:3,
title:"Community Question",
content:"What new HireMinds feature would you like to see?",
type:"note",
likes:2,
x:650,
y:180
}

])

const [thought,setThought]=useState("")

function addPost(){

if(!thought.trim()) return

setPosts([
...posts,
{
id:Date.now(),
title:"Community Thought",
content:thought,
type:"note",
likes:0,
x:200,
y:300
}
])

setThought("")

}

function likePost(id:number){

setPosts(prev=>
prev.map(post=>
post.id===id
?{...post,likes:post.likes+1}
:post
)
)

}

function movePost(
id:number,
direction:string
){

setPosts(prev=>
prev.map(post=>{

if(post.id!==id) return post

if(direction==="up")
return {...post,y:post.y-25}

if(direction==="down")
return {...post,y:post.y+25}

if(direction==="left")
return {...post,x:post.x-25}

if(direction==="right")
return {...post,x:post.x+25}

return post

})
)

}

return(

<main style={styles.page}>

<section style={styles.hero}>

<p style={styles.kicker}>
HireMinds™ Community
</p>

<h1 style={styles.title}>
Live Bulletin Board
</h1>

<p style={styles.subtitle}>
Flyers, opportunities, discussions and community updates.
Move items around, react and share thoughts.
</p>

</section>

<section style={styles.postBox}>

<h3 style={styles.postTitle}>
Share a thought, question or feedback
</h3>

<textarea
value={thought}
onChange={(e)=>setThought(e.target.value)}
placeholder="Share a thought..."
style={styles.textarea}
/>

<button
onClick={addPost}
style={styles.postButton}
>

Post Note

</button>

</section>

<section style={styles.board}>

{posts.map(post=>(

<div
key={post.id}
style={{
...styles.post,
left:post.x,
top:post.y,
background:
post.type==="flyer"
? "#1e293b"
:"#fef3c7",
color:
post.type==="flyer"
?"white"
:"#111"
}}
>

<p style={{
fontSize:"11px",
fontWeight:700,
textTransform:"uppercase",
opacity:.7
}}>

{post.type}

</p>

<h3 style={{
marginTop:"8px"
}}>

{post.title}

</h3>

<p style={{
lineHeight:1.5
}}>

{post.content}

</p>

<div style={{
display:"flex",
gap:"6px",
flexWrap:"wrap",
marginTop:"15px"
}}>

<button
style={styles.smallBtn}
onClick={()=>likePost(post.id)}
>

👍 {post.likes}

</button>

<button
style={styles.smallBtn}
onClick={()=>movePost(post.id,"up")}
>

↑

</button>

<button
style={styles.smallBtn}
onClick={()=>movePost(post.id,"down")}
>

↓

</button>

<button
style={styles.smallBtn}
onClick={()=>movePost(post.id,"left")}
>

←

</button>

<button
style={styles.smallBtn}
onClick={()=>movePost(post.id,"right")}
>

→

</button>

</div>

</div>

))}

</section>

<Link
href="/profile"
style={styles.back}
>

Back to Profile

</Link>

</main>

)

}

const styles:Record<string,CSSProperties>={

page:{
minHeight:"100vh",
background:"linear-gradient(180deg,#050505,#111827)",
padding:"40px",
color:"white"
},

hero:{
maxWidth:"1200px",
margin:"0 auto 30px"
},

kicker:{
color:"#60a5fa",
fontWeight:800,
textTransform:"uppercase",
fontSize:"12px",
letterSpacing:"2px"
},

title:{
fontSize:"54px",
marginBottom:"10px"
},

subtitle:{
color:"#d1d5db",
lineHeight:1.8
},

postBox:{
maxWidth:"1200px",
margin:"0 auto 30px",
background:"rgba(255,255,255,.05)",
padding:"25px",
borderRadius:"25px"
},

postTitle:{
marginTop:0
},

textarea:{
width:"100%",
height:"120px",
borderRadius:"15px",
padding:"15px",
background:"#111",
color:"white",
border:"1px solid #333"
},

postButton:{
marginTop:"15px",
padding:"12px 20px",
borderRadius:"999px",
border:"none",
background:"#2563eb",
color:"white",
fontWeight:700,
cursor:"pointer"
},

board:{
position:"relative",
height:"900px",
background:"#0f172a",
borderRadius:"30px",
overflow:"hidden",
maxWidth:"1200px",
margin:"0 auto"
},

post:{
position:"absolute",
width:"260px",
padding:"20px",
borderRadius:"20px",
boxShadow:"0 15px 40px rgba(0,0,0,.35)"
},

smallBtn:{
padding:"6px 10px",
borderRadius:"999px",
border:"none",
cursor:"pointer"
},

back:{
display:"block",
maxWidth:"1200px",
margin:"30px auto",
color:"#93c5fd"
}

}
