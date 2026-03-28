"use client";

import type { ReactNode } from "react";
import SiteHeader from "./components/SiteHeader";
import { LanguageProvider, useLanguage } from "./lib/language-context";
import Notes from "./components/Notes";

function LayoutContent({ children }: { children: ReactNode }) {
const { lang, setLang, t } = useLanguage();

return (
<html lang={lang} dir="ltr">
<body style={bodyStyle}>
<div style={topBarStyle}>
<div style={topBarInnerStyle}>
<label style={labelStyle}>{t.language}</label>
<select
value={lang}
onChange={(e) => setLang(e.target.value as typeof lang)}
style={selectStyle}
>
<option value="en">English</option>
<option value="es">Español</option>
<option value="hi">हिन्दी</option>
<option value="pl">Polski</option>
</select>
</div>
</div>

<SiteHeader />
{children}
<Notes />
</body>
</html>
);
}

export default function RootLayout({
children,
}: {
children: ReactNode;
}) {
return (
<LanguageProvider>
<LayoutContent>{children}</LayoutContent>
</LanguageProvider>
);
}

const bodyStyle: React.CSSProperties = {
margin: 0,
background: "#050505",
};

const topBarStyle: React.CSSProperties = {
width: "100%",
background: "#0f0f10",
borderBottom: "1px solid #222",
};

const topBarInnerStyle: React.CSSProperties = {
maxWidth: "1520px",
margin: "0 auto",
padding: "10px 24px",
display: "flex",
justifyContent: "flex-end",
alignItems: "center",
gap: "10px",
};

const labelStyle: React.CSSProperties = {
color: "#d4d4d8",
fontSize: "14px",
};

const selectStyle: React.CSSProperties = {
padding: "8px 10px",
borderRadius: "10px",
border: "1px solid #333",
background: "#161616",
color: "#f4f4f5",
};
