"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function SignupPage() {
const [fullName, setFullName] = useState("");
const [phone, setPhone] = useState("");
const [city, setCity] = useState("");
const [stateName, setStateName] = useState("");
const [email, setEmail] = useState("");
const [heardAboutUs, setHeardAboutUs] = useState("");
const [referralCode, setReferralCode] = useState("");
const [heardAboutUsOther, setHeardAboutUsOther] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
e.preventDefault();
setLoading(true);
setMessage("");

const trimmedReferralCode = referralCode.trim();

let hasReferralAccess = false;
let accessTier: "referral" | "limited" = "limited";
let normalizedReferralCode: string | null = null;

if (trimmedReferralCode) {
const { data: referralRow, error: referralError } = await supabase
.from("referral_codes")
.select("code, is_active")
.ilike("code", trimmedReferralCode)
.eq("is_active", true)
.maybeSingle();

if (referralError) {
setMessage(referralError.message);
setLoading(false);
return;
}

if (referralRow?.code) {
hasReferralAccess = true;
accessTier = "referral";
normalizedReferralCode = referralRow.code;
} else {
hasReferralAccess = false;
accessTier = "limited";
normalizedReferralCode = trimmedReferralCode;
}
}

const { data, error } = await supabase.auth.signUp({
email,
password,
options: {
data: {
full_name: fullName,
phone: phone || null,
city: city || null,
state_name: stateName || null,
referral_code: normalizedReferralCode || null,
heard_about_us: heardAboutUs || null,
heard_about_us_other: heardAboutUsOther || null,
has_referral_access: hasReferralAccess,
has_paid_access: false,
access_tier: accessTier,
},
},
});

if (error) {
setMessage(error.message);
setLoading(false);
return;
}

const user = data.user;

if (!user) {
setMessage("User not created.");
setLoading(false);
return;
}

const { error: profileError } = await supabase
.from("candidate_profiles")
.upsert({
user_id: user.id,
full_name: fullName,
phone: phone || null,
email: email,
city: city || null,
state: stateName || null,
referral_code: normalizedReferralCode || null,
heard_about_us: heardAboutUs || null,
heard_about_us_other: heardAboutUsOther || null,
has_referral_access: hasReferralAccess,
has_paid_access: false,
access_tier: accessTier,
subscription_status: null,
});

if (profileError) {
setMessage(profileError.message);
setLoading(false);
return;
}

const { error: activityError } = await supabase.from("user_activity").insert({
user_id: user.id,
full_name: fullName,
email: email,
referral_code: normalizedReferralCode || null,
event_type: "signup",
tool_name: null,
page_name: "sign-up",
});

if (activityError) {
console.error("Activity tracking error:", activityError);
setMessage(`Activity tracking error: ${activityError.message}`);
setLoading(false);
return;
}

setLoading(false);

if (hasReferralAccess) {
window.location.href = "/profile";
return;
}

window.location.href = "/subscribe";
}

return (
<main style={styles.page}>
<form onSubmit={handleSignUp} style={styles.card}>
<h1 style={styles.title}>Create Career Passport / Sign Up</h1>

<p style={styles.introText}>
Create your HireMinds account to begin building your Career Passport,
exploring the Career Toolkit, and accessing guided career support tools.
</p>

<div style={styles.noticeBox}>
<p style={styles.noticeTitle}>Access Options</p>
<p style={styles.noticeText}>
Have a referral code? Enter it below for sponsored access. No referral
code? You can still create your account and explore HireMinds.
Full access is <strong>$24.99/month</strong>.
</p>
<p style={styles.noticeText}>
Without sponsored or paid access, you may explore tools, but saving,
printing, exporting, and finalizing premium generators, analyzers,
guides, and outputs will be locked until you upgrade.
</p>
</div>

<input
placeholder="Full Name"
value={fullName}
onChange={(e) => setFullName(e.target.value)}
style={styles.input}
required
/>

<input
placeholder="Phone Number"
value={phone}
onChange={(e) => setPhone(e.target.value)}
style={styles.input}
/>

<input
placeholder="City"
value={city}
onChange={(e) => setCity(e.target.value)}
style={styles.input}
/>

<input
placeholder="State"
value={stateName}
onChange={(e) => setStateName(e.target.value)}
style={styles.input}
/>

<input
placeholder="Email"
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
style={styles.input}
required
/>

<div style={styles.passwordWrap}>
<input
placeholder="Password"
type={showPassword ? "text" : "password"}
value={password}
onChange={(e) => setPassword(e.target.value)}
style={styles.passwordInput}
required
/>
<button
type="button"
onClick={() => setShowPassword((prev) => !prev)}
aria-label={showPassword ? "Hide password" : "Show password"}
style={styles.passwordToggle}
>
{showPassword ? "Hide" : "Show"}
</button>
</div>

<input
placeholder="Referral Code"
value={referralCode}
onChange={(e) => setReferralCode(e.target.value)}
style={styles.input}
/>

<p style={styles.helperText}>
Enter a referral code if one was provided by your organization, employer,
school, workshop, or program for sponsored access.
</p>

<select
value={heardAboutUs}
onChange={(e) => setHeardAboutUs(e.target.value)}
style={styles.input}
>
<option value="">How did you hear about us?</option>
<option value="found_on_my_own">I found HireMinds on my own</option>
<option value="ricannect_direct_staffing">RicanNECT Direct Staffing</option>
<option value="job_fair">Job Fair</option>
<option value="organization_or_program">Organization or Program</option>
<option value="employer">Employer</option>
<option value="friend_or_family">Friend or Family</option>
<option value="social_media">Social Media</option>
<option value="other">Other</option>
</select>

{heardAboutUs === "other" && (
<input
placeholder="Please tell us how you heard about us."
value={heardAboutUsOther}
onChange={(e) => setHeardAboutUsOther(e.target.value)}
style={styles.input}
/>
)}

<button type="submit" style={styles.button} disabled={loading}>
{loading ? "Creating Account..." : "Create Career Passport"}
</button>

<p style={styles.bottomText}>
Sponsored access is unlocked with a valid referral code. Full access is
also available through monthly subscription.
</p>

{message ? <p style={styles.message}>{message}</p> : null}
</form>
</main>
);
}

const styles: { [key: string]: React.CSSProperties } = {
page: {
minHeight: "100vh",
display: "flex",
justifyContent: "center",
alignItems: "center",
padding: "24px",
backgroundColor: "#000000",
},
card: {
width: "100%",
maxWidth: "560px",
backgroundColor: "#111111",
padding: "32px",
borderRadius: "20px",
boxShadow: "0 10px 30px rgba(255, 255, 255, 0.08)",
display: "flex",
flexDirection: "column",
gap: "14px",
border: "1px solid #2a2a2a",
},
title: {
fontSize: "28px",
fontWeight: 700,
color: "#ffffff",
textAlign: "center",
marginBottom: "4px",
},
introText: {
fontSize: "14px",
color: "#d1d5db",
textAlign: "center",
lineHeight: 1.6,
margin: "0 0 4px",
},
noticeBox: {
background: "linear-gradient(180deg, #161616 0%, #1b1b1b 100%)",
border: "1px solid #2f2f2f",
borderRadius: "16px",
padding: "16px",
display: "grid",
gap: "8px",
},
noticeTitle: {
margin: 0,
fontSize: "14px",
fontWeight: 700,
color: "#ffffff",
},
noticeText: {
margin: 0,
fontSize: "13px",
color: "#d1d5db",
lineHeight: 1.6,
},
input: {
width: "100%",
padding: "14px 16px",
borderRadius: "12px",
border: "1px solid #3a3a3a",
fontSize: "15px",
outline: "none",
backgroundColor: "#1a1a1a",
color: "#ffffff",
boxSizing: "border-box",
},
helperText: {
fontSize: "13px",
color: "#d1d5db",
marginTop: "-8px",
marginBottom: "4px",
lineHeight: 1.5,
},
passwordWrap: {
position: "relative",
width: "100%",
boxSizing: "border-box",
},
passwordInput: {
width: "100%",
padding: "14px 72px 14px 16px",
borderRadius: "12px",
border: "1px solid #3a3a3a",
fontSize: "15px",
outline: "none",
backgroundColor: "#1a1a1a",
color: "#ffffff",
boxSizing: "border-box",
},
passwordToggle: {
position: "absolute",
top: "50%",
right: "14px",
transform: "translateY(-50%)",
background: "none",
border: "none",
cursor: "pointer",
fontSize: "14px",
color: "#ffffff",
fontWeight: 600,
padding: 0,
lineHeight: 1,
},
button: {
width: "100%",
padding: "14px 16px",
borderRadius: "12px",
border: "1px solid #2a2a2a",
backgroundColor: "#000000",
color: "#ffffff",
fontSize: "15px",
fontWeight: 700,
cursor: "pointer",
marginTop: "8px",
},
bottomText: {
margin: 0,
fontSize: "12px",
color: "#9ca3af",
textAlign: "center",
lineHeight: 1.5,
},
message: {
marginTop: "8px",
fontSize: "14px",
color: "#ffffff",
textAlign: "center",
},
};
