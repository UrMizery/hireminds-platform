"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
const router = useRouter();
const supabase = createClient();

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

setMessage("Account created successfully.");
setLoading(false);
router.push("/login");
}

return (
<main style={styles.page}>
<div style={styles.card}>
<h1 style={styles.title}>Create Your Career Passport</h1>
<p style={styles.subtitle}>
Sign up to access your tools, documents, and career resources.
</p>

<form onSubmit={handleSignUp} style={styles.form}>
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
type="email"
placeholder="Email Address"
value={email}
onChange={(e) => setEmail(e.target.value)}
style={styles.input}
required
/>

<div style={styles.passwordWrap}>
<input
type={showPassword ? "text" : "password"}
placeholder="Password"
value={password}
onChange={(e) => setPassword(e.target.value)}
style={styles.passwordInput}
required
/>
<button
type="button"
onClick={() => setShowPassword(!showPassword)}
style={styles.showButton}
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

<button type="submit" style={styles.submitButton} disabled={loading}>
{loading ? "Creating Account..." : "Create Career Passport"}
</button>

{message && <p style={styles.message}>{message}</p>}
</form>
</div>
</main>
);
}

const styles: { [key: string]: React.CSSProperties } = {
page: {
minHeight: "100vh",
display: "flex",
alignItems: "center",
justifyContent: "center",
padding: "32px 16px",
background: "#f8fafc",
},
card: {
width: "100%",
maxWidth: "520px",
background: "#ffffff",
borderRadius: "20px",
padding: "32px",
boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
},
title: {
fontSize: "30px",
fontWeight: 700,
marginBottom: "8px",
color: "#111827",
textAlign: "center",
},
subtitle: {
fontSize: "15px",
color: "#6b7280",
marginBottom: "24px",
textAlign: "center",
lineHeight: 1.5,
},
form: {
display: "flex",
flexDirection: "column",
gap: "14px",
},
input: {
width: "100%",
padding: "14px 16px",
fontSize: "15px",
borderRadius: "12px",
border: "1px solid #d1d5db",
outline: "none",
backgroundColor: "#fff",
},
helperText: {
fontSize: "13px",
color: "#6b7280",
marginTop: "-8px",
marginBottom: "12px",
lineHeight: 1.4,
},
passwordWrap: {
position: "relative",
width: "100%",
},
passwordInput: {
width: "100%",
padding: "14px 90px 14px 16px",
fontSize: "15px",
borderRadius: "12px",
border: "1px solid #d1d5db",
outline: "none",
backgroundColor: "#fff",
},
showButton: {
position: "absolute",
right: "10px",
top: "50%",
transform: "translateY(-50%)",
border: "none",
background: "transparent",
cursor: "pointer",
fontSize: "14px",
fontWeight: 600,
color: "#374151",
},
submitButton: {
width: "100%",
padding: "14px 16px",
borderRadius: "12px",
border: "none",
cursor: "pointer",
fontSize: "15px",
fontWeight: 700,
background: "#111827",
color: "#ffffff",
marginTop: "8px",
},
message: {
marginTop: "8px",
fontSize: "14px",
color: "#111827",
textAlign: "center",
},
};
