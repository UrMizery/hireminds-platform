"use client";

import { useState } from "react";

type PasswordFieldProps = {
label: string;
value: string;
onChange: (value: string) => void;
placeholder?: string;
name?: string;
};

export default function PasswordField({
label,
value,
onChange,
placeholder = "Password",
name,
}: PasswordFieldProps) {
const [showPassword, setShowPassword] = useState(false);

return (
<div style={styles.fieldWrap}>
<label style={styles.label}>{label}</label>

<div style={styles.passwordWrap}>
<input
type={showPassword ? "text" : "password"}
value={value}
name={name}
onChange={(e) => onChange(e.target.value)}
placeholder={placeholder}
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
</div>
);
}

const styles: Record<string, React.CSSProperties> = {
fieldWrap: {
width: "100%",
marginBottom: "12px",
},
label: {
display: "block",
marginBottom: "8px",
color: "#c9c9c9",
fontSize: "13px",
fontWeight: 500,
},
passwordWrap: {
position: "relative",
width: "100%",
},
passwordInput: {
width: "100%",
padding: "14px 48px 14px 16px",
borderRadius: "16px",
border: "1px solid #313131",
background: "#0f0f10",
color: "#f4f4f5",
fontSize: "15px",
boxSizing: "border-box",
outline: "none",
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
};
