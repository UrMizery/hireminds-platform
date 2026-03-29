"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function EmployerPartnerLoginPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
e.preventDefault();
setLoading(true);
setMessage("");

const { data, error } = await supabase.auth.signInWithPassword({
email,
password,
});
const { data, error } = await supabase.auth.signInWithPassword({
email,
password,
});

console.log("signIn result", { data, error });
if (error || !data.user) {
setMessage(error?.message || "Unable to sign in.");
setLoading(false);
return;
}

const { data: partnerRow, error: partnerError } = await supabase
.from("partners")
.select("account_type")
.eq("contact_email", email)
.maybeSingle();

if (partnerError) {
setMessage(partnerError.message);
setLoading(false);
return;
}

if (!partnerRow) {
setMessage("Your account does not have employer or partner access.");
setLoading(false);
return;
}

if (partnerRow.account_type === "partner") {
window.location.href = "/partner-dashboard";
return;
}

if (partnerRow.account_type === "employer") {
window.location.href = "/employer-dashboard";
return;
}

if (partnerRow.account_type === "admin") {
window.location.href = "/admin-dashboard";
return;
}

setMessage("Your account type is not recognized.");
setLoading(false);
}

return (
<main style={styles.page}>
<div style={styles.card}>
<p style={styles.kicker}>HireMinds Access</p>
<h1 style={styles.title}>Employer / Partner Sign In</h1>
<p style={styles.subtitle}>
Sign in to access your dashboard and reporting tools.
</p>

<form onSubmit={handleLogin} style={styles.form}>
<div style={styles.fieldWrap}>
<label style={styles.label}>Email</label>
<input
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
placeholder="name@email.com"
style={styles.input}
required
/>
</div>

<div style={styles.fieldWrap}>
<label style={styles.label}>Password</label>
<input
type="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
placeholder="Enter password"
style={styles.input}
required
/>
</div>

{message ? <p style={styles.message}>{message}</p> : null}

<button type="submit" style={styles.button} disabled={loading}>
{loading ? "Signing In..." : "Sign In"}
</button>
</form>
</div>
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
background: "linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
},
card: {
width: "100%",
maxWidth: "520px",
background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
border: "1px solid #262626",
borderRadius: "24px",
padding: "28px",
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
fontSize: "34px",
fontWeight: 700,
color: "#f5f5f5",
},
subtitle: {
margin: "0 0 20px",
color: "#c8c8c8",
fontSize: "15px",
lineHeight: 1.6,
},
form: {
display: "grid",
gap: "14px",
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
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "15px",
boxSizing: "border-box",
outline: "none",
},
button: {
width: "100%",
padding: "15px 18px",
borderRadius: "18px",
border: "1px solid #d1d5db",
background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
color: "#09090b",
fontSize: "15px",
fontWeight: 700,
cursor: "pointer",
marginTop: "6px",
},
message: {
margin: 0,
color: "#fca5a5",
fontSize: "14px",
lineHeight: 1.6,
},
};
