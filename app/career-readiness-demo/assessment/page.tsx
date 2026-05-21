"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const questions = [
{
question:"What should a healthcare-focused resume highlight?",
choices:[
"Random work history",
"Skills, training, and experience related to the role",
"Favorite hobbies only"
],
correct:1
},

{
question:"Why should participants read a job description carefully?",
choices:[
"To identify keywords, requirements, and employer expectations",
"To ignore application instructions",
"To copy the whole posting"
],
correct:0
},

{
question:"What should a cover letter do?",
choices:[
"Repeat the full resume",
"Introduce the candidate and connect skills to the role",
"Only say thank you"
],
correct:1
},

{
question:"Which behavior shows professionalism?",
choices:[
"Arriving late without notice",
"Being reliable, respectful, and prepared",
"Ignoring instructions"
],
correct:1
},

{
question:"What is a strong interview practice?",
choices:[
"Prepare examples that explain skills and experience",
"Give one-word answers",
"Avoid discussing strengths"
],
correct:0
}

];
