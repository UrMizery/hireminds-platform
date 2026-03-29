"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function SignUpPage() {
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

async function handleSignUp(e: React.FormEvent) {
e.preventDefault();
setLoading(true);
setMessage("");

const { data, error } = await supabase.auth.signUp({
email,
password,
options: {
data: {
full_name: fullName,
phone,
city,
state_name: stateName,
referral_code: referralCode,
heard_about_us: heardAboutUs,
heard_about_us_other: heardAboutUsOther,
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
phone: phone,
email: email,
city: city,
state: stateName,
referral_code: referralCode,
heard_about_us: heardAboutUs,
heard_about_us_other: heardAboutUsOther,
});

if (profileError) {
setMessage(profileError.message);
setLoading(false);
return;
}

setMessage("Account created successfully!");
setLoading(false);

window.location.href = "/profile";
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
/>

<div style={styles.passwordWrap}>
<input
placeholder="Password"
type={showPassword ? "text" : "password"}
value={password}
onChange={(e) => setPassword(e.target.value)}
style={styles.passwordInput}
/>

<button
type="button"
onClick={() => setShowPassword((prev) => !prev)}
aria-label={showPassword ? "Hide password" : "Show password"}
style={styles.passwordToggle}
>
{showPassword ? (
<svg
xmlns="http://www.w3.org/2000/svg"
width="20"
height="20"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round"
>
<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.69-1.94 1.79-3.68 3.19-5.1" />
<path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.83 11.83 0 0 1-4.29 5.94" />
<path d="M1 1l22 22" />
<path d="M10.58 10.58a2 2 0 1 0 2.83 2.83" />
</svg>
) : (
<svg
xmlns="http://www.w3.org/2000/svg"
width="20"
height="20"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round"
>
<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
<circle cx="12" cy="12" r="3" />
</svg>
)}
</button>
</div>

<input
placeholder="Referral Code (Optional)"
value={referralCode}
onChange={(e) => setReferralCode(e.target.value)}
style={styles.input}
/>

<p style={styles.helperText}>
Enter a code if one was provided by your organization, employer, school, or program.
</p>

<select
value={heardAboutUs}
onChange={(e) => setHeardAboutUs(e.target.value)}
style={styles.input}
>
<option value="">How did you hear about us? (Optional)</option>
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
)}<button type="submit" style={styles.button} disabled={loading}>
{loading ? "Creating..." : "Create Account"}
</button>

{message && <p style={styles.message}>{message}</p>}
</form>
</main>
);
}

const styles: Record<string, React.CSSProperties> = {
page: {
minHeight: "100vh",
display: "flex",
justifyContent: "center",
alignItems: "center",
background: "#0a0a0a",
padding: "24px",
},
card: {
background: "#111",
padding: "30px",
borderRadius: "20px",
width: "100%",
maxWidth: "420px",
display: "flex",
flexDirection: "column",
gap: "12px",
},
title: {
color: "#fff",
marginBottom: "10px",
},
input: {
padding: "12px",
borderRadius: "10px",
border: "1px solid #333",
background: "#000",
color: "#fff",
width: "100%",
boxSizing: "border-box",
},
passwordWrap: {
position: "relative",
width: "100%",
},
helperText: {
fontSize: "13px",
color: "#6b7280",
marginTop: "-8px",
marginBottom: "12px",
lineHeight: 1.4,
},
passwordInput: {
padding: "12px 44px 12px 12px",
borderRadius: "10px",
border: "1px solid #333",
background: "#000",
color: "#fff",
width: "100%",
boxSizing: "border-box",
},
passwordToggle: {
position: "absolute",
right: "12px",
top: "50%",
transform: "translateY(-50%)",
border: "none",
background: "transparent",
color: "#d4d4d8",
padding: 0,
display: "inline-flex",
alignItems: "center",
justifyContent: "center",
cursor: "pointer",
},
button: {
padding: "12px",
borderRadius: "10px",
border: "none",
background: "#2563eb",
color: "#fff",
fontWeight: "bold",
cursor: "pointer",
},
message: {
color: "#ccc",
marginTop: "10px",
},
};
