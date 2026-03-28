"use client";

import { useEffect, useState } from "react";
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

const [photoFile, setPhotoFile] = useState<File | null>(null);
const [resumeFile, setResumeFile] = useState<File | null>(null);

const [photoUrl, setPhotoUrl] = useState("");
const [resumeUrl, setResumeUrl] = useState("");

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
setResumeUrl(profile.resume_url || "");
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

if (uploadError) throw uploadError;

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

const finalSlug = slugify(fullName || "career-passport");

let nextPhotoUrl = photoUrl;
let nextResumeUrl = resumeUrl;

if (photoFile) {
nextPhotoUrl = await uploadFile("profile-photos", photoFile, `${userId}/photo`);
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
resume_url: nextResumeUrl || null,
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
setResumeUrl(nextResumeUrl);

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
<section style={styles.hero}>
<div style={styles.heroLeft}>
<p style={styles.kicker}>Career Passport</p>
<h1 style={styles.title}>Your private profile editor</h1>
<p style={styles.subtitle}>
Update the details that appear on your Career Passport, upload your resume,
and keep your saved profile information current.
</p>
</div>

<div style={styles.heroRight}>
<button onClick={handleSignOut} style={styles.secondaryButton}>
Sign Out
</button>
</div>
</section>

<section style={styles.profileStrip}>
<div style={styles.profileStripLeft}>
{photoUrl ? (
<img src={photoUrl} alt="Profile" style={styles.avatar} />
) : (
<div style={styles.avatarPlaceholder}>No Photo</div>
)}

<div style={styles.photoUploadWrap}>
<label style={styles.label}>Profile Photo</label>
<input
type="file"
accept="image/*"
onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
style={styles.input}
/>
</div>
</div>

<div style={styles.profileStripRight}>
<h2 style={styles.namePreview}>{fullName || "Your Name"}</h2>
<p style={styles.headlinePreview}>{headline || "Professional Headline"}</p>
<p style={styles.metaPreview}>
{[city, stateName].filter(Boolean).join(", ") || "City, State"}
</p>
<p style={styles.metaPreview}>{email || "email@example.com"}</p>

</div>
</section>

<section style={styles.formFlow}>
<div style={styles.flowIntro}>
<p style={styles.sectionKicker}>Profile Details</p>
<h2 style={styles.sectionTitle}>Basic Information</h2>
</div>

<div style={styles.formGrid}>
<Field label="Full Name" value={fullName} onChange={setFullName} />
<Field label="Phone" value={phone} onChange={setPhone} />
<Field label="Email" value={email} onChange={setEmail} type="email" />
<Field label="LinkedIn" value={linkedinUrl} onChange={setLinkedinUrl} />
<Field label="City" value={city} onChange={setCity} />
<Field label="State" value={stateName} onChange={setStateName} />
</div>

<div style={styles.singleField}>
<Field
label="Professional Headline"
value={headline}
onChange={setHeadline}
placeholder="Example: Recruiter | Workforce Development | Employer Relations"
/>
</div>

<div style={styles.singleField}>
<TextAreaField
label="Short Bio"
value={bio}
onChange={setBio}
placeholder="Write a short professional bio."
/>
</div>
</section>

<section style={styles.assetFlow}>
<div style={styles.flowIntro}>
<p style={styles.sectionKicker}>Resume</p>
<h2 style={styles.sectionTitle}>Uploaded Resume</h2>
<p style={styles.flowText}>
Your uploaded resume is the file that will appear on your public Career Passport
for approved partners and employers.
</p>
</div>

<div style={styles.assetSingle}>
<div style={styles.assetFloat}>
<p style={styles.assetTitle}>Resume Upload</p>
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
</section>

<section style={styles.noticeFloat}>
<p style={styles.noticeTitle}>Public Profile Note</p>
<p style={styles.noticeText}>
Your photo, headline, location, LinkedIn, uploaded resume, and other saved
profile details can appear on your Career Passport once saved.
</p>
</section>

<section style={styles.noticeFloat}>
<p style={styles.noticeTitle}>Privacy Notice</p>
<p style={styles.noticeText}>
Your information is stored securely and is not sold or shared for marketing
purposes.
</p>
</section>

<section style={styles.bottomDock}>
<button onClick={handleSaveProfile} disabled={saving} style={styles.primaryButton}>
{saving ? "Saving..." : "Save Profile"}
</button>

<a href="/career-toolkit" style={styles.linkButton}>
Career ToolKit
</a>
</section>

{message ? <p style={styles.message}>{message}</p> : null}
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

const glass = {
background: "rgba(255,255,255,0.035)",
border: "1px solid rgba(255,255,255,0.06)",
boxShadow: "0 18px 60px rgba(0,0,0,0.22)",
backdropFilter: "blur(14px)",
} as React.CSSProperties;

const styles: Record<string, React.CSSProperties> = {
page: {
minHeight: "100vh",
background:
"radial-gradient(circle at top left, rgba(59,130,246,0.12) 0%, transparent 20%), radial-gradient(circle at top right, rgba(255,255,255,0.05) 0%, transparent 18%), linear-gradient(180deg, #040404 0%, #0b0b0d 100%)",
color: "#e7e7e7",
padding: "34px 24px 64px",
fontFamily:
'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
},
centerWrap: {
maxWidth: "1200px",
margin: "0 auto",
padding: "40px 24px",
},
shell: {
maxWidth: "1320px",
margin: "0 auto",
display: "grid",
gap: "24px",
},
hero: {
display: "flex",
justifyContent: "space-between",
gap: "24px",
alignItems: "flex-start",
flexWrap: "wrap",
},
heroLeft: {
maxWidth: "860px",
},
heroRight: {
display: "flex",
alignItems: "flex-start",
},
kicker: {
margin: "0 0 8px",
color: "#9ca3af",
fontSize: "12px",
letterSpacing: "0.18em",
textTransform: "uppercase",
},
title: {
margin: "0 0 12px",
fontSize: "46px",
fontWeight: 700,
lineHeight: 1.02,
letterSpacing: "-0.04em",
color: "#f5f5f5",
},
subtitle: {
margin: 0,
color: "#d4d4d8",
fontSize: "16px",
lineHeight: 1.85,
maxWidth: "780px",
},
profileStrip: {
...glass,
borderRadius: "34px",
padding: "26px",
display: "grid",
gridTemplateColumns: "220px 1fr",
gap: "26px",
alignItems: "center",
},
profileStripLeft: {
display: "grid",
gap: "14px",
},
profileStripRight: {
minWidth: 0,
},
avatar: {
width: "200px",
height: "200px",
borderRadius: "26px",
objectFit: "cover",
border: "1px solid rgba(255,255,255,0.08)",
},
avatarPlaceholder: {
width: "200px",
height: "200px",
borderRadius: "26px",
display: "flex",
alignItems: "center",
justifyContent: "center",
background: "rgba(255,255,255,0.04)",
color: "#cbd5e1",
border: "1px solid rgba(255,255,255,0.08)",
},
photoUploadWrap: {
display: "grid",
gap: "8px",
},
namePreview: {
margin: "0 0 10px",
fontSize: "34px",
lineHeight: 1.08,
fontWeight: 700,
color: "#f5f5f5",
},
headlinePreview: {
margin: "0 0 8px",
fontSize: "18px",
lineHeight: 1.6,
color: "#e5e7eb",
},
metaPreview: {
margin: "0 0 6px",
color: "#bdbdbd",
lineHeight: 1.6,
fontSize: "15px",
},
publicLink: {
display: "inline-block",
marginTop: "12px",
color: "#f5f5f5",
textDecoration: "underline",
},
formFlow: {
display: "grid",
gap: "16px",
},
assetFlow: {
display: "grid",
gap: "16px",
},
flowIntro: {
display: "grid",
gap: "6px",
},
flowText: {
margin: 0,
color: "#a1a1aa",
fontSize: "15px",
lineHeight: 1.75,
maxWidth: "920px",
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
fontSize: "30px",
fontWeight: 700,
lineHeight: 1.08,
color: "#f5f5f5",
},
formGrid: {
display: "grid",
gridTemplateColumns: "1fr 1fr 1fr",
gap: "14px",
},
singleField: {
maxWidth: "100%",
},
assetSingle: {
display: "grid",
gridTemplateColumns: "1fr",
gap: "16px",
},
assetFloat: {
...glass,
borderRadius: "26px",
padding: "20px",
},
assetTitle: {
margin: "0 0 10px",
fontSize: "20px",
fontWeight: 700,
color: "#f5f5f5",
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
color: "#9ca3af",
fontSize: "14px",
},
fieldWrap: {
display: "grid",
gap: "8px",
},
label: {
color: "#d4d4d8",
fontSize: "13px",
fontWeight: 600,
},
input: {
width: "100%",
padding: "14px 16px",
borderRadius: "18px",
border: "1px solid rgba(255,255,255,0.08)",
background: "rgba(255,255,255,0.035)",
color: "#f4f4f5",
fontSize: "15px",
boxSizing: "border-box",
outline: "none",
backdropFilter: "blur(10px)",
},
textarea: {
width: "100%",
minHeight: "130px",
padding: "14px 16px",
borderRadius: "20px",
border: "1px solid rgba(255,255,255,0.08)",
background: "rgba(255,255,255,0.035)",
color: "#f4f4f5",
fontSize: "15px",
resize: "vertical",
boxSizing: "border-box",
outline: "none",
backdropFilter: "blur(10px)",
},
noticeFloat: {
...glass,
borderRadius: "24px",
padding: "18px 20px",
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
bottomDock: {
display: "grid",
gridTemplateColumns: "1fr 1fr",
gap: "12px",
maxWidth: "520px",
marginTop: "4px",
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
borderRadius: "16px",
border: "1px solid rgba(255,255,255,0.12)",
background: "rgba(255,255,255,0.04)",
color: "#f5f5f5",
fontWeight: 700,
cursor: "pointer",
backdropFilter: "blur(10px)",
},
linkButton: {
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
textDecoration: "none",
padding: "15px 18px",
borderRadius: "18px",
border: "1px solid rgba(255,255,255,0.12)",
background: "rgba(255,255,255,0.04)",
color: "#f5f5f5",
fontWeight: 700,
backdropFilter: "blur(10px)",
},
message: {
marginTop: "2px",
color: "#e5e5e5",
fontSize: "14px",
lineHeight: 1.6,
},
};
