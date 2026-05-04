"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "../lib/language-context";
import { supabase } from "../lib/supabase";

type UserRole = "guest" | "candidate" | "partner" | "employer" | "admin";

type PartnerNavItem = {
label: string;
href: string;
};

const partnerNavItems: PartnerNavItem[] = [
{ label: "Messages", href: "/messages" },
{ label: "Career Map", href: "/partner-dashboard/career-map" },
{ label: "Workshop Resources", href: "/partner-dashboard/workshop-resources" },
{ label: "Summary Generator", href: "/partner-dashboard/report-summary" },
];

function normalizeRole(rawRole: unknown): UserRole {
const normalizedRole = String(rawRole || "").toLowerCase().trim();

if (normalizedRole === "admin") return "admin";
if (normalizedRole === "partner") return "partner";
if (normalizedRole === "employer") return "employer";

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
const pathname = usePathname();

const [isLoggedIn, setIsLoggedIn] = useState(false);
const [checkingAuth, setCheckingAuth] = useState(true);
const [loadingLogout, setLoadingLogout] = useState(false);
const [role, setRole] = useState<UserRole>("guest");
const [partnersOpen, setPartnersOpen] = useState(false);
const [skillsOpen, setSkillsOpen] = useState(false);
const [referralCode, setReferralCode] = useState("");

const dropdownRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
let mounted = true;

async function checkAuth() {
const {
data: { session },
} = await supabase.auth.getSession();

const sessionUser = session?.user ?? null;

if (!mounted) return;

if (!sessionUser) {
setIsLoggedIn(false);
setRole("guest");
setReferralCode("");
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

const userReferralCode =
sessionUser.user_metadata?.referral_code ||
sessionUser.user_metadata?.referralCode ||
sessionUser.user_metadata?.access_code ||
"";

setReferralCode(String(userReferralCode).trim().toUpperCase());

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
setReferralCode("");
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

const userReferralCode =
sessionUser.user_metadata?.referral_code ||
sessionUser.user_metadata?.referralCode ||
sessionUser.user_metadata?.access_code ||
"";

setReferralCode(String(userReferralCode).trim().toUpperCase());

setCheckingAuth(false);
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
setSkillsOpen(false);
}
}

document.addEventListener("mousedown", handleClickOutside);
return () => {
document.removeEventListener("mousedown", handleClickOutside);
};
}, []);

async function handleLogout() {
try {
setLoadingLogout(true);
localStorage.removeItem("hireminds_referral_code");
await supabase.auth.signOut();
} catch {
} finally {
window.location.href = "/";
}
}

const isCandidate = role === "candidate";
const isPartner = role === "partner";
const isAdmin = role === "admin";
const isEmployer = role === "employer";

const showMyProfile =
isLoggedIn && (isCandidate || isPartner || isAdmin);

const showCareerToolkit =
isLoggedIn && (isCandidate || isPartner || isAdmin);

const showSkillsQuest =
isLoggedIn &&
isCandidate &&
referralCode === "TWP2026";

return (
<header style={styles.header}>
<div style={styles.inner}>
<a href="/" style={styles.logo}>
HireMinds
</a>

<div style={styles.centerNav}>
<a href="/" style={styles.link}>{t.home}</a>
{!checkingAuth && !isLoggedIn && (
<a href="/sign-in" style={styles.link}>{t.signIn}</a>
)}
<a href="/contact" style={styles.link}>{t.contact}</a>
</div>

<div style={styles.rightNav}>
{isLoggedIn && (
<>
{showMyProfile && (
<a href="/profile" style={styles.link}>My Profile</a>
)}

{showCareerToolkit && (
<a href="/career-toolkit" style={styles.link}>Career ToolKit</a>
)}

{showSkillsQuest && (
<div style={styles.dropdownWrap} ref={dropdownRef}>
<button
type="button"
onClick={() => setSkillsOpen((prev) => !prev)}
style={styles.dropdownTrigger}
>
SkillsQuest ▼
</button>

{skillsOpen && (
<div style={styles.dropdownMenu}>
<a href="/skillsquest" style={styles.dropdownItem}>
Career Pathway Program
</a>
<a href="/independent-learning-lab" style={styles.dropdownItem}>
Independent Learning Lab
</a>
<a href="/applied-learning-lab" style={styles.dropdownItem}>
Applied Learning Lab
</a>
</div>
)}
</div>
)}

<button onClick={handleLogout} style={styles.logoutButton}>
Log Off
</button>
</>
)}
</div>
</div>
</header>
);
}

const styles: Record<string, CSSProperties> = {
header: { width: "100%", background: "#050505", borderBottom: "1px solid #1f1f1f" },
inner: { display: "flex", justifyContent: "space-between", padding: "16px" },
logo: { color: "#fff", fontSize: "22px", textDecoration: "none" },
centerNav: { display: "flex", gap: "20px" },
rightNav: { display: "flex", gap: "16px", alignItems: "center" },
link: { color: "#d4d4d8", textDecoration: "none" },
dropdownWrap: { position: "relative" },
dropdownTrigger: { background: "transparent", color: "#d4d4d8", border: "none" },
dropdownMenu: {
position: "absolute",
top: "100%",
right: 0,
background: "#111",
padding: "10px",
borderRadius: "10px"
},
dropdownItem: { display: "block", padding: "8px", color: "#fff", textDecoration: "none" },
logoutButton: { background: "transparent", color: "#fff", border: "1px solid #444" }
};
