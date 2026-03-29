"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type AccessRow = {
account_type?: string | null;
contact_email?: string | null;
};

export default function SiteHeader() {
const [isSignedIn, setIsSignedIn] = useState(false);
const [accountType, setAccountType] = useState<string>("");

useEffect(() => {
let mounted = true;

async function loadUserRole() {
const { data: authData } = await supabase.auth.getUser();

if (!mounted) return;

if (!authData.user?.email) {
setIsSignedIn(false);
setAccountType("");
return;
}

setIsSignedIn(true);

const email = authData.user.email;

const { data: accessRow } = await supabase
.from("partners")
.select("account_type, contact_email")
.eq("contact_email", email)
.maybeSingle<AccessRow>();

if (!mounted) return;

setAccountType(accessRow?.account_type || "");
}

loadUserRole();

const {
data: { subscription },
} = supabase.auth.onAuthStateChange(() => {
loadUserRole();
});

return () => {
mounted = false;
subscription.unsubscribe();
};
}, []);

const isPartner = accountType === "partner";
const isEmployer = accountType === "employer";
const isAdmin = accountType === "admin";
const isInternalAccount = isPartner || isEmployer || isAdmin;

return (
<header style={styles.header}>
<div style={styles.inner}>
<Link href="/" style={styles.brand}>
HireMinds
</Link>

<nav style={styles.nav}>
<Link href="/career-toolkit" style={styles.link}>
Career ToolKit
</Link>

{isPartner ? (
<Link href="/partner-dashboard" style={styles.link}>
Partner Dashboard
</Link>
) : null}

{isEmployer ? (
<Link href="/employer-dashboard" style={styles.link}>
Employer Dashboard
</Link>
) : null}

{isAdmin ? (
<>
<Link href="/admin-dashboard" style={styles.link}>
Admin Dashboard
</Link>
<Link href="/partner-dashboard" style={styles.link}>
Partner Dashboard
</Link>
<Link href="/employer-dashboard" style={styles.link}>
Employer Dashboard
</Link>
</>
) : null}

{isSignedIn && !isInternalAccount ? (
<Link href="/profile" style={styles.link}>
My Profile
</Link>
) : null}

{!isSignedIn ? (
<Link href="/employer-partner-login" style={styles.link}>
Employer/Partner Sign In
</Link>
) : null}
</nav>
</div>
</header>
);
}

const styles: Record<string, React.CSSProperties> = {
header: {
width: "100%",
position: "sticky",
top: 0,
zIndex: 50,
background: "rgba(10,10,12,0.92)",
backdropFilter: "blur(10px)",
borderBottom: "1px solid rgba(255,255,255,0.08)",
},
inner: {
maxWidth: "1400px",
margin: "0 auto",
padding: "14px 24px",
display: "flex",
alignItems: "center",
justifyContent: "space-between",
gap: "16px",
},
brand: {
color: "#f5f5f5",
textDecoration: "none",
fontWeight: 800,
fontSize: "18px",
},
nav: {
display: "flex",
alignItems: "center",
gap: "14px",
flexWrap: "wrap",
},
link: {
color: "#f5f5f5",
textDecoration: "none",
fontWeight: 600,
fontSize: "14px",
},
};
