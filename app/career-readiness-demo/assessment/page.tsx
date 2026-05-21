"use client";

import { useState } from "react";
import Link from "next/link";

const questions = [
{
question:"What should a healthcare-focused resume highlight?",
choices:[
"Random work history",
"Skills and experience related to the role",
"Favorite hobbies"
],
correct:1
},
{
question:"Why read a job description carefully?",
choices:[
"To identify keywords and expectations",
"To skip application requirements",
"To copy the entire posting"
],
correct:0
},
{
question:"Professionalism includes:",
choices:[
"Being late",
"Ignoring communication",
"Reliability and respect"
],
correct:2
},
{
question:"Interview preparation should include:",
choices:[
"Examples of strengths and experience",
"One word answers",
"No questions"
],
correct:0
},
{
question:"Transferable skills are:",
choices:[
"Skills that can apply across jobs",
"Skills from only healthcare roles",
"Skills that don't matter"
],
correct:0
}
];

export default function Assessment(){

const [answers,setAnswers]=useState<number[]>([]);
const [score,setScore]=useState<number|null>(null);

function grade(){

let correct=0;

questions.forEach((q,i)=>{
if(answers[i]===q.correct){
correct++;
}
});

const percent=Math.round(
(correct/questions.length)*100
);

setScore(percent);

}

return(

<main style={{
maxWidth:"1000px",
margin:"0 auto",
padding:"30px",
color:"white"
}}>

<h1>
Career Readiness Assessment
</h1>

<p>
Pass with 80% or higher
to unlock certificate preview.
</p>

{questions.map((q,i)=>(

<div
key={i}
style={{
padding:"20px",
borderRadius:"18px",
marginBottom:"20px",
background:
"rgba(255,255,255,.05)"
}}
>

<h3>
{i+1}. {q.question}
</h3>

{q.choices.map((choice,c)=>(

<label
key={c}
style={{
display:"block",
marginTop:"10px"
}}
>

<input
type="radio"
name={`q${i}`}
onChange={()=>{
const updated=[...answers];
updated[i]=c;
setAnswers(updated)
}}
/>

{" "}
{choice}

</label>

))}

</div>

))}

<button
onClick={grade}
style={{
padding:"12px 18px",
borderRadius:"12px"
}}
>

Submit Assessment

</button>

{score!==null&&(

<div style={{marginTop:"30px"}}>

<h2>
Score: {score}%
</h2>

{score>=80?(

<Link
href="/career-readiness-demo/certificate"
>

Continue to Certificate →

</Link>

):(

<p>
Please review the modules
and try again.
</p>

)}

</div>

)}

</main>

)

}
