"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

function slugify(value: string) {
return value
.toLowerCase()
.trim()
.replace(/[^a-z0-9\s-]/g, "")
.replace(/\s+/g, "-")
.replace(/-+/g, "-");
}

export default function ProfilePage() {
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [message, setMessage] = useState("");

const [userId, setUserId] = useState("");
const [profileId, setProfileId] = useState("");

const [fullName, setFullName] = useState("");
const [phone, setPhone] = useState("");
const [email, setEmail] = useState("");
const [city, setCity] = useState("");
const [stateName, setStateName] = useState("");
const [bio, setBio] = useState("");
const [headline, setHeadline] = useState("");
const [linkedinUrl, setLinkedinUrl] = useState("");
const [passportSlug, setPassportSlug] = useState("");

const [photoFile, setPhotoFile] = useState<File | null>(null);
const [videoFile, setVideoFile] = useState<File | null>(null);
const [resumeFile, setResumeFile] = useState<File | null>(null);

const [photoUrl, setPhotoUrl] = useState("");
const [videoUrl, setVideoUrl] = useState("");
const [resumeUrl, setResumeUrl] = useState("");

const [requestVerification, setRequestVerification] = useState(false);

const publicPassportUrl = useMemo(() => {
return passportSlug ? `/passport/${passportSlug}` : "";
}, [passportSlug]);

useEffect(() => {
async function loadProfile() {
const { data: authData, error: authError } = await supabase.auth.getUser();

if (authError || !authData.user) {
window.location.href = "/sign-in";
return;
}

const currentUserId = authData.user.id;
setUserId(currentUserId);

const { data: profile, error: profileError } = await supabase
.from("candidate_profiles")
.select("*")
.eq("user_id", currentUserId)
.maybeSingle();

if (profileError) {
setMessage(profileError.message);
setLoading(false);
return;
}

if (!profile) {
setEmail(authData.user.email || "");
setLoading(false);
return;
}

setProfileId(profile.id || "");
setFullName(profile.full_name || "");
setPhone(profile.phone || "");
setEmail(profile.email || authData.user.email || "");
setCity(profile.city || "");
setStateName(profile.state || "");
setBio(profile.bio || "");
setHeadline(profile.headline || "");
setLinkedinUrl(profile.linkedin_url || "");
setPassportSlug(profile.passport_slug || "");
setResumeUrl(profile.resume_url || "");
setVideoUrl(profile.intro_video_url || "");
setPhotoUrl(profile.photo_url || "");
setLoading(false);
}

loadProfile();
}, []);

async function uploadFile(bucket: string, file: File, folder: string) {
const fileExt = file.name.split(".").pop() || "file";
const filePath = `${folder}/${Date.now()}.${fileExt}`;

const { error: uploadError } = await supabase.storage
.from(bucket)
.upload(filePath, file, { upsert: true });

if (uploadError) {
throw uploadError;
}

const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
return data.publicUrl;
}

async function handleSaveProfile() {
setMessage("");

if (!userId) {
setMessage("You must be signed in.");
return;
}

try {
setSaving(true);

const finalSlug = passportSlug || slugify(fullName || "career-passport");

let nextPhotoUrl = photoUrl;
let nextVideoUrl = videoUrl;
let nextResumeUrl = resumeUrl;

if (photoFile) {
nextPhotoUrl = await uploadFile("profile-photos", photoFile, `${userId}/photo`);
}

if (videoFile) {
nextVideoUrl = await uploadFile("profile-videos", videoFile, `${userId}/video`);
}

if (resumeFile) {
nextResumeUrl = await uploadFile("resumes", resumeFile, `${userId}/resume`);
}

const payload = {
user_id: userId,
full_name: fullName,
phone,
email,
city,
state: stateName,
bio,
headline,
linkedin_url: linkedinUrl,
passport_slug: finalSlug,
resume_url: nextResumeUrl || null,
intro_video_url: nextVideoUrl || null,
photo_url: nextPhotoUrl || null,
};

if (profileId) {
const { error } = await supabase
.from("candidate_profiles")
.update(payload)
.eq("id", profileId);

if (error) throw error;
} else {
const { data, error } = await supabase
.from("candidate_profiles")
.insert(payload)
.select()
.single();

if (error) throw error;
setProfileId(data.id);
}

setPhotoUrl(nextPhotoUrl);
setVideoUrl(nextVideoUrl);
setResumeUrl(nextResumeUrl);
setPassportSlug(finalSlug);

setMessage("Profile saved successfully.");
} catch (err: any) {
setMessage(err.message || "Unable to save profile.");
} finally {
setSaving(false);
}
}

async function handleSignOut() {
await supabase.auth.signOut();
window.location.href = "/sign-in";
}

if (loading) {
return (
<main style={styles.page}>
<div style={styles.centerWrap}>Loading...</div>
</main>
);
}

return (
<main style={styles.page}>
<div style={styles.shell}>
<section style={styles.mainColumn}>
<div style={styles.heroCard}>
<div style={styles.heroTop}>
<div>
<p style={styles.kicker}>Career Passport</p>
<h1 style={styles.title}>Your private profile editor</h1>
<p style={styles.subtitle}>
Update your public-facing Career Passport details, manage your profile assets,
and control how your information appears to employers.
</p>
</div>

<button onClick={handleSignOut} style={styles.secondaryButton}>
Sign Out
</button>
</div>

<div style={styles.noticeBox}>
<p style={styles.noticeTitle}>Privacy Notice</p>
<p style={styles.noticeText}>
Your information is stored securely and is not sold or shared for marketing purposes.
</p>
</div>
</div>

<div style={styles.profileLayout}>
<section style={styles.profileCard}>
<div style={styles.profileMediaColumn}>
{photoUrl ? (
<img src={photoUrl} alt="Profile" style={styles.avatar} />
) : (
<div style={styles.avatarPlaceholder}>No Photo</div>
)}

<div style={styles.uploadBlock}>
<label style={styles.label}>Profile Photo</label>
<input
type="file"
accept="image/*"
onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
style={styles.input}
/>
</div>
</div>

<div style={styles.profileInfoColumn}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Profile Details</p>
<h2 style={styles.sectionTitle}>Basic Information</h2>
</div>

<div style={styles.twoCol}>
<Field label="Full Name" value={fullName} onChange={setFullName} />
<Field label="Phone" value={phone} onChange={setPhone} />
</div>

<div style={styles.twoCol}>
<Field label="Email" value={email} onChange={setEmail} type="email" />
<Field label="LinkedIn" value={linkedinUrl} onChange={setLinkedinUrl} />
</div>

<div style={styles.twoCol}>
<Field label="City" value={city} onChange={setCity} />
<Field label="State" value={stateName} onChange={setStateName} />
</div>

<Field
label="Professional Headline"
value={headline}
onChange={setHeadline}
placeholder="Example: Recruiter | Workforce Development | Employer Relations"
/>

<TextAreaField
label="Short Bio"
value={bio}
onChange={setBio}
placeholder="Write a short professional bio."
/>
</div>
</section>

<section style={styles.assetCard}>
<div style={styles.sectionHeader}>
<p style={styles.sectionKicker}>Uploads</p>
<h2 style={styles.sectionTitle}>Media + Resume</h2>
</div>

<div style={styles.assetGrid}>
<div style={styles.assetPanel}>
<p style={styles.assetTitle}>Intro Video</p>
<p style={styles.assetText}>
Upload your intro video here. This feature is still being finalized, so display behavior may not be fully consistent yet.
</p>
<input
type="file"
accept="video/*"
onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
style={styles.input}
/>
{videoUrl ? (
<a href={videoUrl} target="_blank" rel="noreferrer" style={styles.assetLink}>
View current video
</a>
) : (
<p style={styles.assetMuted}>No video uploaded yet.</p>
)}
</div>

<div style={styles.assetPanel}>
<p style={styles.assetTitle}>Resume Upload</p>
<p style={styles.assetText}>
Upload your resume here. This feature is also still being finalized, so public display may not always update as expected yet.
</p>
<input
type="file"
accept=".pdf,.doc,.docx"
onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
style={styles.input}
/>
{resumeUrl ? (
<a href={resumeUrl} target="_blank" rel="noreferrer" style={styles.assetLink}>
View current resume
</a>
) : (
<p style={styles.assetMuted}>No resume uploaded yet.</p>
)}
</div>
</div>

<label style={styles.checkboxRow}>
<input
type="checkbox"
checked={requestVerification}
onChange={(e) => setRequestVerification(e.target.checked)}
/>
<span>Request employer verification</span>
</label>

<div style={styles.bottomActions}>
<button onClick={handleSaveProfile} disabled={saving} style={styles.primaryButton}>
{saving ? "Saving..." : "Save Profile"}
</button>

<a href="/career-toolkit" style={styles.linkButton}>
Career ToolKit
</a>
</div>

{message ? <p style={styles.message}>{message}</p> : null}
</section>
</div>
</section>

<aside style={styles.sideColumn}>
<div style={styles.previewCard}>
<p style={styles.kicker}>Profile Preview</p>
<h2 style={styles.sectionTitle}>Career Passport Snapshot</h2>

<div style={styles.previewTopBlock}>
<h3 style={styles.previewName}>{fullName || "Your Name"}</h3>
<p style={styles.previewLine}>{headline || "Professional Headline"}</p>
<p style={styles.previewLine}>
{[city, stateName].filter(Boolean).join(", ") || "City, State"}
</p>
<p style={styles.previewLine}>{email || "email@example.com"}</p>
</div>

{publicPassportUrl ? (
<a href={publicPassportUrl} style={styles.publicLink}>
View public passport
</a>
) : null}
</div>

<div style={styles.sideInfoCard}>
<p style={styles.sectionKicker}>Status</p>
<h3 style={styles.sideInfoTitle}>Current Uploads</h3>

<div style={styles.sideInfoRow}>
<span style={styles.sideInfoLabel}>Photo</span>
<span style={styles.sideInfoValue}>{photoUrl ? "Uploaded" : "Not uploaded"}</span>
</div>

<div style={styles.sideInfoRow}>
<span style={styles.sideInfoLabel}>Intro Video</span>
<span style={styles.sideInfoValue}>{videoUrl ? "Uploaded" : "Not uploaded"}</span>
</div>

<div style={styles.sideInfoRow}>
<span style={styles.sideInfoLabel}>Resume</span>
<span style={styles.sideInfoValue}>{resumeUrl ? "Uploaded" : "Not uploaded"}</span>
</div>
</div>
</aside>
</div>
</main>
);
}

function Field({
label,
value,
onChange,
placeholder,
type = "text",
}: {
label: string;
value: string;
onChange: (value: string) => void;
placeholder?: string;
type?: string;
}) {
return (
<div style={styles.fieldWrap}>
<label style={styles.label}>{label}</label>
<input
type={type}
value={value}
onChange={(e) => onChange(e.target.value)}
placeholder={placeholder}
style={styles.input}
/>
</div>
);
}

function TextAreaField({
label,
value,
onChange,
placeholder,
}: {
label: string;
value: string;
onChange: (value: string) => void;
placeholder?: string;
}) {
return (
<div style={styles.fieldWrap}>
<label style={styles.label}>{label}</label>
<textarea
value={value}
onChange={(e) => onChange(e.target.value)}
placeholder={placeholder}
style={styles.textarea}
/>
</div>
);
}

const styles: Record<string, React.CSSProperties> = {
page: {
minHeight: "100vh",
background:
"radial-gradient(circle at top, rgba(59,130,246,0.1) 0%, rgba(5,5,5,1) 36%, rgba(13,13,15,1) 100%)",
color: "#e7e7e7",
padding: "32px 24px 56px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
centerWrap: {
maxWidth: "1200px",
margin: "0 auto",
padding: "40px 24px",
},
shell: {
maxWidth: "1440px",
margin: "0 auto",
display: "grid",
gridTemplateColumns: "1.2fr 0.75fr",
gap: "24px",
alignItems: "start",
},
mainColumn: {
display: "grid",
gap: "20px",
},
sideColumn: {
display: "grid",
gap: "20px",
position: "sticky",
top: "24px",
},
heroCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "30px",
padding: "28px",
boxShadow: "0 28px 80px rgba(0,0,0,0.28)",
},
heroTop: {
display: "flex",
justifyContent: "space-between",
gap: "18px",
alignItems: "flex-start",
flexWrap: "wrap",
},
kicker: {
margin: "0 0 8px",
color: "#9ca3af",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
title: {
margin: "0 0 10px",
fontSize: "40px",
fontWeight: 700,
lineHeight: 1.04,
letterSpacing: "-0.04em",
color: "#f5f5f5",
},
subtitle: {
margin: 0,
color: "#d4d4d8",
fontSize: "16px",
lineHeight: 1.75,
maxWidth: "820px",
},
sectionHeader: {
display: "grid",
gap: "6px",
marginBottom: "16px",
},
sectionKicker: {
margin: 0,
color: "#9ca3af",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
sectionTitle: {
margin: 0,
fontSize: "28px",
fontWeight: 700,
lineHeight: 1.1,
color: "#f5f5f5",
},
noticeBox: {
marginTop: "20px",
padding: "16px 18px",
borderRadius: "18px",
border: "1px solid rgba(255,255,255,0.08)",
background: "rgba(255,255,255,0.03)",
},
noticeTitle: {
margin: "0 0 8px",
color: "#f3f4f6",
fontWeight: 700,
fontSize: "14px",
},
noticeText: {
margin: 0,
color: "#b8b8b8",
fontSize: "14px",
lineHeight: 1.7,
},
profileLayout: {
display: "grid",
gap: "20px",
},
profileCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "30px",
padding: "24px",
boxShadow: "0 24px 70px rgba(0,0,0,0.24)",
display: "grid",
gridTemplateColumns: "220px 1fr",
gap: "24px",
alignItems: "start",
},
profileMediaColumn: {
display: "grid",
gap: "14px",
},
profileInfoColumn: {
minWidth: 0,
},
assetCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "30px",
padding: "24px",
boxShadow: "0 24px 70px rgba(0,0,0,0.24)",
},
assetGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "16px",
},
assetPanel: {
background: "rgba(255,255,255,0.03)",
border: "1px solid rgba(255,255,255,0.06)",
borderRadius: "22px",
padding: "18px",
},
assetTitle: {
margin: "0 0 8px",
fontSize: "18px",
fontWeight: 700,
color: "#f5f5f5",
},
assetText: {
margin: "0 0 14px",
color: "#cfcfcf",
fontSize: "14px",
lineHeight: 1.7,
},
assetLink: {
display: "inline-block",
marginTop: "8px",
color: "#f5f5f5",
textDecoration: "underline",
fontSize: "14px",
},
assetMuted: {
margin: "8px 0 0",
color: "#a1a1aa",
fontSize: "14px",
lineHeight: 1.6,
},
twoCol: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "14px",
},
fieldWrap: {
marginBottom: "12px",
},
label: {
display: "block",
marginBottom: "8px",
color: "#d4d4d8",
fontSize: "13px",
fontWeight: 600,
},
input: {
width: "100%",
padding: "14px 16px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "15px",
boxSizing: "border-box",
outline: "none",
},
textarea: {
width: "100%",
minHeight: "120px",
padding: "14px 16px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "15px",
resize: "vertical",
boxSizing: "border-box",
outline: "none",
},
uploadBlock: {
display: "grid",
gap: "8px",
},
checkboxRow: {
display: "flex",
alignItems: "center",
gap: "10px",
color: "#e5e7eb",
margin: "18px 0 16px",
},
bottomActions: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "12px",
marginTop: "8px",
},
primaryButton: {
width: "100%",
padding: "15px 18px",
borderRadius: "18px",
border: "1px solid #d1d5db",
background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
color: "#09090b",
fontSize: "15px",
fontWeight: 700,
cursor: "pointer",
},
secondaryButton: {
padding: "12px 16px",
borderRadius: "14px",
border: "1px solid rgba(255,255,255,0.14)",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
cursor: "pointer",
},
linkButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
textDecoration: "none",
padding: "15px 18px",
borderRadius: "18px",
border: "1px solid rgba(255,255,255,0.14)",
background: "#111111",
color: "#f5f5f5",
fontWeight: 700,
},
message: {
marginTop: "16px",
color: "#e5e5e5",
fontSize: "14px",
lineHeight: 1.6,
},
avatar: {
width: "200px",
height: "200px",
borderRadius: "22px",
objectFit: "cover",
border: "1px solid #2e2e2e",
},
avatarPlaceholder: {
width: "200px",
height: "200px",
borderRadius: "22px",
display: "flex",
alignItems: "center",
justifyContent: "center",
background: "#111827",
color: "#cbd5e1",
border: "1px solid #2e2e2e",
},
previewCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "30px",
padding: "24px",
boxShadow: "0 24px 70px rgba(0,0,0,0.24)",
},
previewTopBlock: {
marginBottom: "18px",
},
previewName: {
margin: "0 0 8px",
fontSize: "28px",
fontWeight: 700,
color: "#f5f5f5",
lineHeight: 1.12,
},
previewLine: {
margin: "0 0 8px",
color: "#c8c8c8",
lineHeight: 1.6,
fontSize: "15px",
},
publicLink: {
display: "inline-block",
marginTop: "8px",
color: "#f5f5f5",
textDecoration: "underline",
},
sideInfoCard: {
background:
"linear-gradient(135deg, rgba(19,19,21,0.96) 0%, rgba(10,10,12,0.98) 100%)",
border: "1px solid rgba(255,255,255,0.07)",
borderRadius: "30px",
padding: "24px",
boxShadow: "0 24px 70px rgba(0,0,0,0.24)",
},
sideInfoTitle: {
margin: "0 0 14px",
fontSize: "22px",
fontWeight: 700,
color: "#f5f5f5",
},
sideInfoRow: {
display: "flex",
justifyContent: "space-between",
gap: "12px",
alignItems: "center",
padding: "12px 0",
borderBottom: "1px solid rgba(255,255,255,0.08)",
},
sideInfoLabel: {
color: "#a1a1aa",
fontSize: "14px",
},
sideInfoValue: {
color: "#f5f5f5",
fontSize: "14px",
fontWeight: 700,
textAlign: "right",
},
};
