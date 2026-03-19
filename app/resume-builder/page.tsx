"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type ResumePlan = "free" | "pro";

type Bullet = { text: string };

type ExperienceItem = {
companyName: string;
roleTitle: string;
bullets: Bullet[];
};

export default function ResumeBuilderPage() {
const [userId, setUserId] = useState("");
const [loading, setLoading] = useState(true);
const [message, setMessage] = useState("");

const [plan, setPlan] = useState<ResumePlan>("free");

const [fullName, setFullName] = useState("");
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");
const [summary, setSummary] = useState("");
const [skillsInput, setSkillsInput] = useState("");

const [experiences, setExperiences] = useState<ExperienceItem[]>([
{ companyName: "", roleTitle: "", bullets: [{ text: "" }] },
]);

// LOAD USER
useEffect(() => {
async function loadUser() {
const { data } = await supabase.auth.getUser();

if (data?.user) {
setUserId(data.user.id);
setEmail(data.user.email || "");
}

setLoading(false);
}

loadUser();
}, []);

// SKILLS
const skills = useMemo(() => {
return skillsInput
.split(",")
.map((s) => s.trim())
.filter(Boolean);
}, [skillsInput]);

// PLAN DETAILS
const planDetails = useMemo(() => {
if (plan === "free") {
return {
title: "Free",
text: "Basic resume builder with limited features.",
};
}

return {
title: "Pro",
text: "$24.99/month. Full access to all features.",
};
}, [plan]);

// EXPERIENCE FUNCTIONS
function addExperience() {
setExperiences([
...experiences,
{ companyName: "", roleTitle: "", bullets: [{ text: "" }] },
]);
}

function updateExperience(index: number, field: string, value: string) {
const updated = [...experiences];
(updated[index] as any)[field] = value;
setExperiences(updated);
}

function updateBullet(index: number, bIndex: number, value: string) {
const updated = [...experiences];
updated[index].bullets[bIndex].text = value;
setExperiences(updated);
}

function addBullet(index: number) {
const updated = [...experiences];
updated[index].bullets.push({ text: "" });
setExperiences(updated);
}

// SAVE
async function handleSave() {
if (!userId) {
setMessage("Please sign in first.");
return;
}

const { error } = await supabase.from("resumes").insert({
user_id: userId,
full_name: fullName,
phone,
email,
summary,
skills,
experiences,
});

if (error) {
setMessage(error.message);
} else {
setMessage("Resume saved!");
}
}

// STATES
if (loading) {
return <div style={styles.page}>Loading...</div>;
}

if (!userId) {
return (
<div style={styles.page}>
<h2>Please sign in</h2>
</div>
);
}

return (
<div style={styles.page}>
<h1>Resume Builder</h1>

{/* PLAN */}
<select
value={plan}
onChange={(e) => setPlan(e.target.value as ResumePlan)}
style={styles.input}
>
<option value="free">Free</option>
<option value="pro">Pro ($24.99)</option>
</select>

<p>{planDetails.text}</p>

<div style={styles.container}>
{/* LEFT SIDE */}
{/* RIGHT SIDE PREVIEW */}
