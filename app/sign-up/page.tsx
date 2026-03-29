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

const { data, error } = await supabase.auth.signUp({
email,
password,
options: {
data: {
full_name: fullName,
phone: phone || null,
city: city || null,
state_name: stateName || null,
referral_code: referralCode || null,
heard_about_us: heardAboutUs || null,
heard_about_us_other: heardAboutUsOther || null,
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
referral_code: referralCode || null,
heard_about_us: heardAboutUs || null,
heard_about_us_other: heardAboutUsOther || null,
});

if (profileError) {
setMessage(profileError.message);
setLoading(false);
return;
}

const { error: activityError } = await supabase
.from("user_activity")
.insert({
user_id: user.id,
full_name: fullName,
email: email,
referral_code: referralCode || null,
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
window.location.href = "/";
}

return (
<main style={styles.page}>
<form onSubmit={handleSignUp} style={styles.card}>
<h1 style={styles.title}>Create Career Passport / Sign Up</h1>

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
placeholder="Referral Code (Optional)"
value={referralCode}
onChange={(e) => setReferralCode(e.target.value)}
style={styles.input}
/>

<p style={styles.helperText}>
Enter a code if one was provided by your organization, employer,
school, or program.
</p>

<select
value={heardAboutUs}
onChange={(e) => setHeardAboutUs(e.target.value)}
style={styles.input}
>
<option value="">How did you hear about us? (Optional)</option>
<option value="found_on_my_own">I found HireMinds on my own</option>
<option value="ricannect_direct_staffing">
RicanNECT Direct Staffing
</option>
<option value="job_fair">Job Fair</option>
<option value="organization_or_program">
Organization or Program
</option>
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
maxWidth: "520px",
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
marginBottom: "8px",
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
lineHeight: 1.4,
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
message: {
marginTop: "8px",
fontSize: "14px",
color: "#ffffff",
textAlign: "center",
},
};
