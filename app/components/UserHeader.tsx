"use client";

import type { CSSProperties } from "react";
import { useLanguage } from "../lib/language-context";

type UserHeaderProps = {
loadingLogout: boolean;
onLogout: () => void;
};

export default function UserHeader({ loadingLogout, onLogout }: UserHeaderProps) {
const { t } = useLanguage();

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

<button
type="button"
onClick={() => window.dispatchEvent(new Event("toggle-notes-panel"))}
style={styles.notesButtonLike}
>
Notes
</button>

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
