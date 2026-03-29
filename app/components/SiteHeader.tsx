"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../lib/language-context";
import { supabase } from "../lib/supabase";

type UserRole = "guest" | "candidate" | "partner" | "employer" | "admin";

export default function SiteHeader() {
const { t } = useLanguage();

const [isLoggedIn, setIsLoggedIn] = useState(false);
const [checkingAuth, setCheckingAuth] = useState(true);
const [loadingLogout, setLoadingLogout] = useState(false);
const [role, setRole] = useState<UserRole>("guest");

useEffect(() => {
let mounted = true;

async function checkAuth() {
const { data } = await supabase.auth.getSession();
const sessionUser = data.session?.user ?? null;

if (!mounted) return;

if (!sessionUser) {
setIsLoggedIn(false);
setRole("guest");
setCheckingAuth(false);
return;
}

setIsLoggedIn(true);

const rawRole =
sessionUser.app_metadata?.role ||
sessionUser.user_metadata?.role ||
sessionUser.user_metadata?.account_type ||
"";

const normalizedRole = String(rawRole).toLowerCase().trim();

if (normalizedRole === "admin") {
setRole("admin");
} else if (normalizedRole === "partner") {
setRole("partner");
} else if (normalizedRole === "employer") {
setRole("employer");
} else if (
normalizedRole === "candidate" ||
normalizedRole === "career_passport" ||
normalizedRole === "career-passport"
) {
setRole("candidate");
} else {
setRole("candidate");
}

setCheckingAuth(false);
}

checkAuth();

const {
data: { subscription },
} = supabase.auth.onAuthStateChange((_event, session) => {
const sessionUser = session?.user ?? null;

if (!mounted) return;

if (!sessionUser) {
setIsLoggedIn(false);
setRole("guest");
setCheckingAuth(false);
return;
}

setIsLoggedIn(true);

const rawRole =
sessionUser.app_metadata?.role ||
sessionUser.user_metadata?.role ||
sessionUser.user_metadata?.account_type ||
"";

const normalizedRole = String(rawRole).toLowerCase().trim();

if (normalizedRole === "admin") {
setRole("admin");
} else if (normalizedRole === "partner") {
setRole("partner");
} else if (normalizedRole === "employer") {
setRole("employer");
} else if (
normalizedRole === "candidate" ||
normalizedRole === "career_passport" ||
normalizedRole === "career-passport"
) {
setRole("candidate");
} else {
setRole("candidate");
}

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
window.location.href = "/";
} finally {
setLoadingLogout(false);
}
}

const isAdmin = role === "admin";
const isPartner = role === "partner";
const isEmployer = role === "employer";
const isCandidate = role === "candidate";

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

{!checkingAuth && !isLoggedIn ? (
<a href="/sign-in" style={styles.link}>
{t.signIn}
</a>
) : null}

<a href="/partner-with-hireminds" style={styles.link}>
{t.partner}
</a>

<a href="/contact" style={styles.link}>
{t.contact}
</a>
</div>

<div style={styles.rightNav}>
{isLoggedIn ? (
<>
{isCandidate || isAdmin ? (
<a href="/profile" style={styles.link}>
My Profile
</a>
) : null}

{isPartner ? (
<a href="/partner-dashboard" style={styles.link}>
Partner Dashboard
</a>
) : null}

{isEmployer ? (
<a href="/employer-dashboard" style={styles.link}>
Employer Dashboard
</a>
) : null}

{isAdmin ? (
<a href="/admin-dashboard" style={styles.link}>
Admin Dashboard
</a>
) : null}

{isCandidate || isPartner || isAdmin ? (
<a href="/career-toolkit" style={styles.link}>
Career ToolKit
</a>
) : null}

{isCandidate || isPartner || isAdmin ? (
<button
type="button"
onClick={() => window.dispatchEvent(new Event("toggle-notes-panel"))}
style={styles.linkButtonLike}
>
Notes
</button>
) : null}

<button
type="button"
onClick={handleLogout}
style={styles.logoutButton}
disabled={loadingLogout}
>
{loadingLogout ? "Logging Off..." : "Log Off"}
</button>
</>
) : null}

<span style={styles.lockedLink}>{t.jobBoard} 🔒</span>

{!isLoggedIn ? (
<a href="/employer-partner-log-in" style={styles.link}>
{t.employerPartnerSignIn}
</a>
) : null}
</div>
</div>
</header>
);
}

const styles: Record<string, React.CSSProperties> = {
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
padding: "14px 24px",
display: "grid",
gridTemplateColumns: "220px 1fr auto",
alignItems: "center",
gap: "20px",
},
logo: {
color: "#f5f5f5",
fontSize: "20px",
fontWeight: 600,
textDecoration: "none",
},
centerNav: {
display: "flex",
gap: "20px",
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
fontSize: "14px",
cursor: "pointer",
whiteSpace: "nowrap",
},
linkButtonLike: {
border: "none",
background: "transparent",
color: "#d4d4d8",
textDecoration: "none",
fontSize: "14px",
fontWeight: 700,
cursor: "pointer",
padding: 0,
whiteSpace: "nowrap",
appearance: "none",
WebkitAppearance: "none",
},
lockedLink: {
color: "#7c7c85",
fontSize: "14px",
whiteSpace: "nowrap",
},
logoutButton: {
background: "transparent",
border: "1px solid #3f3f46",
color: "#d4d4d8",
fontSize: "14px",
cursor: "pointer",
whiteSpace: "nowrap",
borderRadius: "10px",
padding: "8px 12px",
},
};
