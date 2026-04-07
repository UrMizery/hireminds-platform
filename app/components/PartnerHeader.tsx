"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLanguage } from "../lib/language-context";

type PartnerHeaderProps = {
loadingLogout: boolean;
onLogout: () => void;
};

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

export default function PartnerHeader({ loadingLogout, onLogout }: PartnerHeaderProps) {
const { t } = useLanguage();
const [partnersOpen, setPartnersOpen] = useState(false);
const dropdownRef = useRef<HTMLDivElement | null>(null);

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
</div>

<div style={styles.rightNav}>
<a href="/profile" style={styles.link}>
My Profile
</a>

<a href="/career-toolkit" style={styles.link}>
Career ToolKit
</a>

<a href="/partner-dashboard" style={styles.link}>
Partner Dashboard
</a>

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

<button
type="button"
onClick={onLogout}
style={styles.logoutButton}
disabled={loadingLogout}
>
{loadingLogout ? "Logging Off..." : "Log Off"}
</button>

<span style={styles.lockedLink}>{t.jobBoard} 🔒</span>
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
