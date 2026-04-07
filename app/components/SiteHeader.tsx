"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useLanguage } from "../lib/language-context";
import { supabase } from "../lib/supabase";
import UserHeader from "./UserHeader";
import PartnerHeader from "./PartnerHeader";

type UserRole = "guest" | "candidate" | "partner";

function normalizeRole(rawRole: unknown): UserRole {
const normalizedRole = String(rawRole || "").toLowerCase().trim();

if (normalizedRole === "partner") return "partner";

if (
normalizedRole === "candidate" ||
normalizedRole === "career_passport" ||
normalizedRole === "career-passport" ||
normalizedRole === "user" ||
normalizedRole === "jobseeker" ||
normalizedRole === "job_seeker"
) {
return "candidate";
}

return "guest";
}

export default function SiteHeader() {
const { t } = useLanguage();

const [isLoggedIn, setIsLoggedIn] = useState(false);
const [checkingAuth, setCheckingAuth] = useState(true);
const [loadingLogout, setLoadingLogout] = useState(false);
const [role, setRole] = useState<UserRole>("guest");
const [partnerEmailMatch, setPartnerEmailMatch] = useState(false);

useEffect(() => {
let mounted = true;

async function checkPartnerEmail(email?: string | null) {
if (!email) {
if (!mounted) return;
setPartnerEmailMatch(false);
return;
}

try {
const { data } = await supabase
.from("partners")
.select("contact_email")
.ilike("contact_email", email)
.maybeSingle();

if (!mounted) return;
setPartnerEmailMatch(!!data?.contact_email);
} catch (error) {
console.error("Partner email check error:", error);
if (!mounted) return;
setPartnerEmailMatch(false);
}
}

async function checkAuth() {
const {
data: { session },
} = await supabase.auth.getSession();

const sessionUser = session?.user ?? null;

if (!mounted) return;

if (!sessionUser) {
setIsLoggedIn(false);
setRole("guest");
setPartnerEmailMatch(false);
setCheckingAuth(false);
return;
}

setIsLoggedIn(true);

const rawRole =
sessionUser.app_metadata?.role ||
sessionUser.user_metadata?.role ||
sessionUser.user_metadata?.account_type ||
"candidate";

setRole(normalizeRole(rawRole));
await checkPartnerEmail(sessionUser.email);
setCheckingAuth(false);
}

checkAuth();

const {
data: { subscription },
} = supabase.auth.onAuthStateChange(async (_event, session) => {
const sessionUser = session?.user ?? null;

if (!mounted) return;

if (!sessionUser) {
setIsLoggedIn(false);
setRole("guest");
setPartnerEmailMatch(false);
setCheckingAuth(false);
return;
}

setIsLoggedIn(true);

const rawRole =
sessionUser.app_metadata?.role ||
sessionUser.user_metadata?.role ||
sessionUser.user_metadata?.account_type ||
"candidate";

setRole(normalizeRole(rawRole));
await checkPartnerEmail(sessionUser.email);
setCheckingAuth(false);
});

return () => {
mounted = false;
subscription.unsubscribe();
};
}, []);

async function handleLogout() {
try {
setLoadingLogout(true);
await supabase.auth.signOut();
} catch {
// ignore
} finally {
window.location.href = "/";
}
}

const isPartner = role === "partner" || partnerEmailMatch;
const isCandidate = role === "candidate" && !isPartner;

if (!checkingAuth && isLoggedIn && isPartner) {
return <PartnerHeader loadingLogout={loadingLogout} onLogout={handleLogout} />;
}

if (!checkingAuth && isLoggedIn && isCandidate) {
return <UserHeader loadingLogout={loadingLogout} onLogout={handleLogout} />;
}

return (
<header style={styles.header}>
<div style={styles.inner}>
<a href="/" style={styles.logo}>
HireMinds
</a>

<div style={styles.centerNav}>
<a href="/" style={styles.link}>
{t.home}
</a>

<a href="/contact" style={styles.link}>
{t.contact}
</a>

{!checkingAuth && !isLoggedIn ? (
<a href="/sign-in" style={styles.link}>
{t.signIn}
</a>
) : null}

{!checkingAuth && !isLoggedIn ? (
<a href="/partner-with-hireminds" style={styles.link}>
{t.partner}
</a>
) : null}
</div>

<div style={styles.rightNav}>
<span style={styles.lockedLink}>{t.jobBoard} 🔒</span>

{!checkingAuth && !isLoggedIn ? (
<a href="/employer-partner-login" style={styles.link}>
{t.employerPartnerSignIn}
</a>
) : null}
</div>
</div>
</header>
);
}

const styles: Record<string, CSSProperties> = {
header: {
width: "100%",
position: "sticky",
top: 0,
zIndex: 100,
background: "rgba(5,5,5,0.95)",
backdropFilter: "blur(10px)",
borderBottom: "1px solid #1f1f1f",
},
inner: {
maxWidth: "1520px",
margin: "0 auto",
padding: "16px 24px",
display: "grid",
gridTemplateColumns: "240px 1fr auto",
alignItems: "center",
gap: "20px",
},
logo: {
color: "#f5f5f5",
fontSize: "26px",
fontWeight: 700,
textDecoration: "none",
letterSpacing: "0.2px",
},
centerNav: {
display: "flex",
gap: "22px",
alignItems: "center",
justifyContent: "center",
flexWrap: "wrap",
},
rightNav: {
display: "flex",
gap: "18px",
alignItems: "center",
justifyContent: "flex-end",
flexWrap: "wrap",
},
link: {
color: "#d4d4d8",
textDecoration: "none",
fontSize: "15px",
cursor: "pointer",
whiteSpace: "nowrap",
},
lockedLink: {
color: "#7c7c85",
fontSize: "15px",
whiteSpace: "nowrap",
},
};
