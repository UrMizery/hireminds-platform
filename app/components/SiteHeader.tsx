"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLanguage } from "../lib/language-context";
import { supabase } from "../lib/supabase";

type UserRole = "guest" | "candidate" | "partner" | "employer" | "admin";

type PartnerNavItem = {
label: string;
href: string;
};

type PartnerRow = {
contact_email?: string | null;
};

const partnerNavItems: PartnerNavItem[] = [
{ label: "Messages", href: "/messages" },
{ label: "Career Map", href: "/partner-dashboard/career-map" },
{ label: "Workshop Resources", href: "/partner-dashboard/workshop-resources" },
{ label: "Summary Generator", href: "/partner-dashboard/report-summary" },
];

function normalizeRole(rawRole: unknown): UserRole | null {
const normalized = String(rawRole || "").toLowerCase().trim();

if (!normalized) return null;
if (normalized === "admin") return "admin";
if (normalized === "partner") return "partner";
if (normalized === "employer") return "employer";

if (
normalized === "candidate" ||
normalized === "career_passport" ||
normalized === "career-passport" ||
normalized === "user" ||
normalized === "jobseeker" ||
normalized === "job_seeker"
) {
return "candidate";
}

return null;
}

export default function SiteHeader() {
const { t } = useLanguage();

const [isLoggedIn, setIsLoggedIn] = useState(false);
const [checkingAuth, setCheckingAuth] = useState(true);
const [loadingLogout, setLoadingLogout] = useState(false);
const [role, setRole] = useState<UserRole>("guest");
const [partnersOpen, setPartnersOpen] = useState(false);

const dropdownRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
let mounted = true;

async function resolveSessionUser(sessionUser: any) {
if (!mounted) return;

if (!sessionUser) {
setIsLoggedIn(false);
setRole("guest");
setCheckingAuth(false);
return;
}

setIsLoggedIn(true);

let nextRole: UserRole =
normalizeRole(sessionUser.app_metadata?.role) ||
normalizeRole(sessionUser.user_metadata?.role) ||
normalizeRole(sessionUser.user_metadata?.account_type) ||
"candidate";

const email = sessionUser.email || "";

if (email) {
try {
const { data: partnerRow } = await supabase
.from("partners")
.select("contact_email")
.eq("contact_email", email)
.maybeSingle<PartnerRow>();

if (!mounted) return;

if (partnerRow?.contact_email) {
nextRole = "partner";
}
} catch {
// keep detected/default role
}
}

if (!mounted) return;
setRole(nextRole);
setCheckingAuth(false);
}

async function init() {
const {
data: { session },
} = await supabase.auth.getSession();

await resolveSessionUser(session?.user ?? null);
}

init();

const {
data: { subscription },
} = supabase.auth.onAuthStateChange(async (_event, session) => {
await resolveSessionUser(session?.user ?? null);
});

return () => {
mounted = false;
subscription.unsubscribe();
};
}, []);

useEffect(() => {
function handleClickOutside(event: MouseEvent) {
if (!dropdownRef.current) return;
if (!dropdownRef.current.contains(event.target as Node)) {
setPartnersOpen(false);
}
}

document.addEventListener("mousedown", handleClickOutside);
return () => {
document.removeEventListener("mousedown", handleClickOutside);
};
}, []);

async function handleLogout() {
if (loadingLogout) return;

try {
setLoadingLogout(true);

await supabase.auth.signOut({ scope: "global" });

try {
window.localStorage.clear();
} catch {}

try {
window.sessionStorage.clear();
} catch {}
} catch (error) {
console.error("Logout error:", error);
} finally {
window.location.replace("/");
}
}

const isCandidate = role === "candidate";
const isPartner = role === "partner";
const isAdmin = role === "admin";
const isEmployer = role === "employer";

const showMyProfile = isLoggedIn && (isCandidate || isPartner || isAdmin);
const showCareerToolkit = isLoggedIn && (isCandidate || isAdmin);
const showPartnerDashboard = isLoggedIn && (isPartner || isAdmin);
const showPartnerTools = isLoggedIn && (isPartner || isAdmin);
const showNotes = isLoggedIn && (isCandidate || isPartner || isAdmin);

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

{!isLoggedIn ? (
<a href="/partner-with-hireminds" style={styles.link}>
{t.partner}
</a>
) : null}

<a href="/contact" style={styles.link}>
{t.contact}
</a>
</div>

<div style={styles.rightNav}>
{isLoggedIn ? (
<>
{showMyProfile ? (
<a href="/profile" style={styles.link}>
My Profile
</a>
) : null}

{showCareerToolkit ? (
<a href="/career-toolkit" style={styles.link}>
Career ToolKit
</a>
) : null}

{showPartnerDashboard ? (
<a href="/partner-dashboard" style={styles.link}>
Partner Dashboard
</a>
) : null}

{showPartnerTools ? (
<div style={styles.dropdownWrap} ref={dropdownRef}>
<button
type="button"
onClick={() => setPartnersOpen((prev) => !prev)}
style={styles.dropdownTrigger}
aria-haspopup="menu"
aria-expanded={partnersOpen}
>
Tools
<span
style={{
...styles.dropdownChevron,
transform: partnersOpen ? "rotate(180deg)" : "rotate(0deg)",
}}
>
▼
</span>
</button>

{partnersOpen ? (
<div style={styles.dropdownMenu}>
{partnerNavItems.map((item) => (
<a
key={item.href}
href={item.href}
style={styles.dropdownItem}
onClick={() => setPartnersOpen(false)}
>
{item.label}
</a>
))}
</div>
) : null}
</div>
) : null}

{isEmployer ? (
<a href="/employer-dashboard" style={styles.link}>
Employer Dashboard
</a>
) : null}

{showNotes ? (
<button
type="button"
onClick={() => window.dispatchEvent(new Event("toggle-notes-panel"))}
style={styles.notesButtonLike}
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
notesButtonLike: {
border: "1px solid #a1a1aa",
background: "#ffffff",
color: "#111111",
fontSize: "15px",
fontWeight: 700,
cursor: "pointer",
whiteSpace: "nowrap",
borderRadius: "999px",
padding: "8px 22px",
appearance: "none",
WebkitAppearance: "none",
boxShadow: "0 0 0 1px rgba(255,255,255,0.15) inset",
},
dropdownWrap: {
position: "relative",
display: "inline-flex",
alignItems: "center",
},
dropdownTrigger: {
border: "none",
background: "transparent",
color: "#d4d4d8",
fontSize: "15px",
cursor: "pointer",
padding: 0,
whiteSpace: "nowrap",
display: "inline-flex",
alignItems: "center",
gap: "6px",
appearance: "none",
WebkitAppearance: "none",
},
dropdownChevron: {
fontSize: "10px",
transition: "transform 0.2s ease",
display: "inline-block",
},
dropdownMenu: {
position: "absolute",
top: "calc(100% + 10px)",
right: 0,
minWidth: "240px",
background: "#111111",
border: "1px solid #2a2a2d",
borderRadius: "14px",
boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
padding: "8px",
zIndex: 200,
display: "grid",
gap: "4px",
},
dropdownItem: {
color: "#e4e4e7",
textDecoration: "none",
fontSize: "15px",
padding: "10px 12px",
borderRadius: "10px",
whiteSpace: "nowrap",
background: "transparent",
},
lockedLink: {
color: "#7c7c85",
fontSize: "15px",
whiteSpace: "nowrap",
},
logoutButton: {
background: "transparent",
border: "1px solid #3f3f46",
color: "#d4d4d8",
fontSize: "15px",
cursor: "pointer",
whiteSpace: "nowrap",
borderRadius: "10px",
padding: "8px 12px",
},
};
