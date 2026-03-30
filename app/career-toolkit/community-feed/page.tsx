"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../../lib/supabase";

type VideoCard = {
title: string;
category: string;
description: string;
youtubeUrl?: string;
locked?: boolean;
buttonLabel: string;
};

const youtubeVideoCards: VideoCard[] = [
{
title: "How to Read and Understand Job Posting",
category: "Job Search",
description:
"Learn how to break down a job posting, understand what employers are asking for, and spot the details that matter before applying.",
youtubeUrl: "https://youtu.be/IfTr8CsTnuo?si=Hgz_1n2Ra-mDIK9L",
buttonLabel: "Watch on YouTube",
},
{
title: "Job Search on Indeed & Applying",
category: "Job Search",
description:
"Walk through using Indeed more effectively and understand how to move from searching to applying with more confidence.",
youtubeUrl: "https://youtu.be/F6eAQvj_5qA?si=w62uKMLsQ5rfLVMY",
buttonLabel: "Watch on YouTube",
},
{
title: "Apply on Company Site via Indeed",
category: "Applications",
description:
"See how to move from a job board listing to the company site and understand when direct application may be the better route.",
youtubeUrl: "https://youtu.be/i-dsitWNL9k?si=HXZDTU5M1S81xPlc",
buttonLabel: "Watch on YouTube",
},
{
title: "Job Hunting with No Experience - The Catch 22",
category: "Job Search",
description:
"Explore practical perspective on job searching when you have little to no experience and how to keep moving forward.",
youtubeUrl: "https://youtu.be/xS9mHUvi9xA?si=PV7CszF9d0b8oOc0",
buttonLabel: "Watch on YouTube",
},
{
title: "Applying for a Job with a Criminal Record",
category: "Reentry",
description:
"Helpful guidance for navigating applications, confidence, and next steps when applying with a criminal record.",
youtubeUrl: "https://youtu.be/NgmqTsBi92A?si=DmxOkRwZpGXK2Xzy",
buttonLabel: "Watch on YouTube",
},
{
title: 'How to Answer the "Weakness and Strength" Question in Interviews',
category: "Interview",
description:
"Learn how to answer one of the most common interview questions with more confidence, honesty, and professionalism.",
youtubeUrl: "https://youtu.be/NQrUJBOcgJc?si=CN6LGNqxZPUI_TYv",
buttonLabel: "Watch on YouTube",
},
{
title: "Choosing the Right Resume Format",
category: "Resume",
description:
"Understand how to choose a resume format that fits your background, strengths, and the kind of opportunity you want next.",
youtubeUrl: "https://youtu.be/_qWi6vp_0t4?si=tyV-XL6tIjAJiNMw",
buttonLabel: "Watch on YouTube",
},
{
title: "How to Dress for Any Kind of Job Interview",
category: "Interview",
description:
"Get practical interview outfit guidance that helps you look prepared, polished, and appropriate for different work settings.",
youtubeUrl: "https://youtu.be/UbcLJjxIpyU?si=prft2ECQV7VCdQzT",
buttonLabel: "Watch on YouTube",
},
{
title: "How to Use LinkedIn",
category: "Career Tools",
description:
"Learn how LinkedIn can support visibility, networking, and job search efforts as part of your professional presence.",
youtubeUrl: "https://youtu.be/UCkgBTmAb9E?si=lgOyPysh8mh6Wmo7",
buttonLabel: "Watch on YouTube",
},
{
title: "O*NET",
category: "Career Exploration",
description:
"Explore how O*NET can help you research careers, job duties, skills, and pathways when planning your next move.",
youtubeUrl: "https://youtu.be/7Jk94AQ8c3o?si=3UAtMG0qrGcRlLtP",
buttonLabel: "Watch on YouTube",
},
{
title: "Never Say These 5 Things in Any Interview",
category: "Interview",
description:
"Avoid common interview mistakes by learning what not to say and how to present yourself more effectively.",
youtubeUrl: "https://youtu.be/wIjK-6Do6lg?si=ZR8gSmfuoa98PIx1",
buttonLabel: "Watch on YouTube",
},
{
title: "Intro to HireMinds — A Product of RicanNECT 🔒",
category: "Coming Soon",
description:
"A guided introduction to HireMinds, RicanNECT, and the workforce infrastructure behind the platform. This feature is coming soon.",
locked: true,
buttonLabel: "Coming Soon 🔒",
},
];

export default function CommunityFeedPage() {
const [userId, setUserId] = useState("");
const [fullName, setFullName] = useState<string | null>(null);
const [email, setEmail] = useState<string | null>(null);
const [referralCode, setReferralCode] = useState<string | null>(null);
const openTrackedRef = useRef(false);

useEffect(() => {
async function loadUserAndTrack() {
const { data, error } = await supabase.auth.getUser();
if (error || !data.user || openTrackedRef.current) return;

openTrackedRef.current = true;
setUserId(data.user.id);

const { data: profile } = await supabase
.from("candidate_profiles")
.select("full_name, email, referral_code")
.eq("user_id", data.user.id)
.maybeSingle();

setFullName(profile?.full_name || null);
setEmail(profile?.email || data.user.email || null);
setReferralCode(profile?.referral_code || null);

const { error: activityError } = await supabase.from("user_activity").insert({
user_id: data.user.id,
full_name: profile?.full_name || null,
email: profile?.email || data.user.email || null,
referral_code: profile?.referral_code || null,
event_type: "tool_opened",
tool_name: "video_library",
page_name: "/career-toolkit/community-feed",
});

if (activityError) {
console.error("Video library tracking error:", activityError);
}
}

loadUserAndTrack();
}, []);

async function handleVideoClick(video: VideoCard) {
try {
if (userId && !video.locked) {
const { error: activityError } = await supabase.from("user_activity").insert({
user_id: userId,
full_name: fullName,
email,
referral_code: referralCode,
event_type: "tool_completed",
tool_name: "video_library",
page_name: "/career-toolkit/community-feed",
action_label: `video_opened:${video.title}`,
});

if (activityError) {
console.error("Video click tracking error:", activityError);
}
}
} catch (error) {
console.error("Video click tracking failed:", error);
}
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.heroCard}>
<p style={styles.kicker}>Career ToolKit</p>
<h1 style={styles.title}>Video Library</h1>
<p style={styles.subtitle}>
Explore practical video support around job searching, applying, resume
formats, interview preparation, LinkedIn, O*NET, and career readiness
topics that help users move forward with more confidence.
</p>

<div style={styles.heroButtons}>
<a href="/career-toolkit" style={styles.linkButton}>
Back to Career ToolKit
</a>
</div>
</section>

<section style={styles.grid}>
{youtubeVideoCards.map((video) => (
<article
key={`${video.title}-${video.youtubeUrl ?? "locked"}`}
style={{
...styles.card,
...(video.locked ? styles.lockedCard : {}),
}}
>
<div style={styles.cardBody}>
<p
style={{
...styles.categoryLabel,
...(video.locked ? styles.lockedCategoryLabel : {}),
}}
>
{video.category}
</p>

<h2 style={styles.cardTitle}>{video.title}</h2>
<p style={styles.cardDescription}>{video.description}</p>
</div>

{video.locked ? (
<span style={styles.lockedButton}>{video.buttonLabel}</span>
) : (
<a
href={video.youtubeUrl}
target="_blank"
rel="noreferrer"
style={styles.button}
onClick={() => handleVideoClick(video)}
>
{video.buttonLabel}
</a>
)}
</article>
))}
</section>
</div>
</main>
);
}

const styles: Record<string, CSSProperties> = {
page: {
minHeight: "100vh",
background:
"radial-gradient(circle at top, rgba(59,130,246,0.08) 0%, rgba(5,5,5,1) 32%, rgba(13,13,15,1) 100%)",
color: "#f5f5f5",
padding: "32px 20px 64px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
shell: {
width: "100%",
maxWidth: "1280px",
margin: "0 auto",
display: "grid",
gap: "24px",
},
heroCard: {
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "28px",
padding: "28px",
boxShadow: "0 24px 60px rgba(0,0,0,0.22)",
},
kicker: {
margin: "0 0 8px",
color: "#9a9a9a",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
title: {
margin: "0 0 10px",
fontSize: "42px",
fontWeight: 700,
color: "#f5f5f5",
lineHeight: 1.04,
letterSpacing: "-0.04em",
},
subtitle: {
margin: 0,
color: "#c8c8c8",
fontSize: "16px",
lineHeight: 1.75,
maxWidth: "900px",
},
heroButtons: {
display: "flex",
gap: "12px",
marginTop: "18px",
flexWrap: "wrap",
},
linkButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
textDecoration: "none",
padding: "14px 18px",
borderRadius: "18px",
border: "1px solid #3a3a3a",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
fontSize: "14px",
},
grid: {
display: "grid",
gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
gap: "18px",
alignItems: "stretch",
},
card: {
display: "flex",
flexDirection: "column",
minHeight: "250px",
padding: "18px",
borderRadius: "24px",
background: "linear-gradient(180deg, #111111 0%, #171717 100%)",
border: "1px solid rgba(255,255,255,0.08)",
boxShadow: "0 18px 40px rgba(0,0,0,0.2)",
boxSizing: "border-box",
overflow: "hidden",
},
lockedCard: {
background: "linear-gradient(180deg, #101010 0%, #151515 100%)",
},
cardBody: {
display: "grid",
gap: "10px",
marginBottom: "16px",
},
categoryLabel: {
margin: 0,
color: "#9ca3af",
fontSize: "12px",
fontWeight: 700,
letterSpacing: "0.08em",
textTransform: "uppercase",
},
lockedCategoryLabel: {
color: "#a1a1aa",
},
cardTitle: {
margin: 0,
fontSize: "22px",
fontWeight: 800,
lineHeight: 1.06,
letterSpacing: "-0.03em",
color: "#fafafa",
},
cardDescription: {
margin: 0,
fontSize: "15px",
lineHeight: 1.65,
color: "#d4d4d8",
},
button: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
marginTop: "auto",
width: "100%",
maxWidth: "100%",
minHeight: "46px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.12)",
background: "#0d0d0d",
color: "#ffffff",
fontSize: "14px",
fontWeight: 700,
textDecoration: "none",
textAlign: "center",
padding: "12px 14px",
boxSizing: "border-box",
},
lockedButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
marginTop: "auto",
width: "100%",
maxWidth: "100%",
minHeight: "46px",
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.08)",
background: "rgba(255,255,255,0.04)",
color: "#9ca3af",
fontSize: "14px",
fontWeight: 700,
textAlign: "center",
padding: "12px 14px",
boxSizing: "border-box",
},
};
