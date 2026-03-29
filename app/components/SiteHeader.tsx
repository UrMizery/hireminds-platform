"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { translations, type Lang } from "./translations";

type LanguageContextType = {
lang: Lang;
setLang: (lang: Lang) => void;
t: (typeof translations)["en"];
};

const LANGUAGE_STORAGE_KEY = "hireminds-language";

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
const [lang, setLangState] = useState<Lang>("en");

useEffect(() => {
const savedLang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as Lang | null;

if (
savedLang &&
(savedLang === "en" || savedLang === "es" || savedLang === "hi" || savedLang === "pl")
) {
setLangState(savedLang);
}
}, []);

function setLang(nextLang: Lang) {
setLangState(nextLang);
window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
}

const value = useMemo(
() => ({
lang,
setLang,
t: translations[lang],
}),
[lang]
);

return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
const context = useContext(LanguageContext);

if (!context) {
throw new Error("useLanguage must be used inside LanguageProvider");
}

return context;
}

export type Lang = "en" | "es" | "hi" | "pl";

export const translations: Record<
Lang,
{
home: string;
signIn: string;
services: string;
cart: string;
partner: string;
contact: string;
createPassport: string;
title: string;
subtitle: string;
language: string;
schedule: string;
jobBoard: string;
employerPartnerSignIn: string;
whoIs: string;
whatWeDo: string;
whatNext: string;
whoIsText: string;
whatWeDoText: string;
whatNextText: string;
careerCoach: string;
liveMockInterview: string;
liveResumeRevision: string;
consultation: string;
other: string;
employers: string;
nonprofits: string;
}
> = {
en: {
home: "Home",
signIn: "Sign In",
services: "Services",
cart: "Cart / Checkout",
partner: "Partner with HireMinds",
contact: "Contact Us",
createPassport: "Create Career Passport / Sign Up",
title: "Build Your Career Passport",
subtitle:
"Get prepared, get verified, and get hired. HireMinds helps candidates showcase their readiness beyond a traditional resume.",
language: "Language",
schedule: "Schedule 1:1",
jobBoard: "Job Board",
employerPartnerSignIn: "Employer / Partner Sign In",
whoIs: "Who is HireMinds?",
whatWeDo: "What We Do",
whatNext: "What Comes Next",
whoIsText:
"HireMinds is a workforce platform built to help candidates showcase their skills, readiness, and professional identity in a stronger way.",
whatWeDoText:
"We combine Career Passports, resumes, verification options, mock interviews, and career support services into one platform.",
whatNextText:
"Create your Career Passport, complete your profile, build your resume, and unlock support services as needed.",
careerCoach: "Career Coach",
liveMockInterview: "Live Mock Interview",
liveResumeRevision: "Live Resume Revision",
consultation: "Consultation",
other: "Other",
employers: "Employers",
nonprofits: "Nonprofits",
},

es: {
home: "Inicio",
signIn: "Iniciar sesión",
services: "Servicios",
cart: "Carrito / Pago",
partner: "Asociarse con HireMinds",
contact: "Contáctanos",
createPassport: "Crear Career Passport / Registrarse",
title: "Construye tu Career Passport",
subtitle:
"Prepárate, verifícate y consigue empleo. HireMinds ayuda a los candidatos a mostrar su preparación más allá de un currículum tradicional.",
language: "Idioma",
schedule: "Programar 1:1",
jobBoard: "Bolsa de trabajo",
employerPartnerSignIn: "Acceso para Empleadores / Socios",
whoIs: "¿Quién es HireMinds?",
whatWeDo: "Qué Hacemos",
whatNext: "Qué Sigue",
whoIsText:
"HireMinds es una plataforma laboral diseñada para ayudar a los candidatos a mostrar sus habilidades, preparación e identidad profesional con más fuerza.",
whatWeDoText:
"Combinamos Career Passports, currículums, verificación, entrevistas simuladas y servicios de apoyo profesional en una sola plataforma.",
whatNextText:
"Crea tu Career Passport, completa tu perfil, desarrolla tu currículum y desbloquea servicios de apoyo según los necesites.",
careerCoach: "Coach de Carrera",
liveMockInterview: "Entrevista Simulada en Vivo",
liveResumeRevision: "Revisión de Currículum en Vivo",
consultation: "Consulta",
other: "Otro",
employers: "Empleadores",
nonprofits: "Organizaciones sin fines de lucro",
},

hi: {
home: "होम",
signIn: "साइन इन",
services: "सेवाएं",
cart: "कार्ट / चेकआउट",
partner: "HireMinds के साथ साझेदारी करें",
contact: "संपर्क करें",
createPassport: "Career Passport बनाएँ / साइन अप करें",
title: "अपना Career Passport बनाएं",
subtitle:
"तैयार हों, सत्यापित हों, और नौकरी पाएं। HireMinds उम्मीदवारों को पारंपरिक रिज़्यूमे से आगे बढ़कर अपनी तैयारी दिखाने में मदद करता है।",
language: "भाषा",
schedule: "1:1 शेड्यूल करें",
jobBoard: "जॉब बोर्ड",
employerPartnerSignIn: "नियोक्ता / पार्टनर साइन इन",
whoIs: "HireMinds क्या है?",
whatWeDo: "हम क्या करते हैं",
whatNext: "आगे क्या है",
whoIsText:
"HireMinds एक workforce प्लेटफ़ॉर्म है जो उम्मीदवारों को अपनी skills, readiness और professional identity को अधिक मज़बूती से दिखाने में मदद करता है।",
whatWeDoText:
"हम Career Passports, resumes, verification options, mock interviews और career support services को एक ही platform में जोड़ते हैं।",
whatNextText:
"अपना Career Passport बनाएं, अपना profile पूरा करें, अपना resume तैयार करें, और ज़रूरत के अनुसार support services unlock करें।",
careerCoach: "करियर कोच",
liveMockInterview: "लाइव मॉक इंटरव्यू",
liveResumeRevision: "लाइव रिज़्यूमे रिविज़न",
consultation: "परामर्श",
other: "अन्य",
employers: "नियोक्ता",
nonprofits: "गैर-लाभकारी संस्थाएँ",
},

pl: {
home: "Strona główna",
signIn: "Zaloguj się",
services: "Usługi",
cart: "Koszyk / Płatność",
partner: "Współpraca z HireMinds",
contact: "Kontakt",
createPassport: "Utwórz Career Passport / Rejestracja",
title: "Zbuduj swój Career Passport",
subtitle:
"Przygotuj się, zweryfikuj i zdobądź pracę. HireMinds pomaga kandydatom pokazać gotowość wykraczającą poza tradycyjne CV.",
language: "Język",
schedule: "Umów 1:1",
jobBoard: "Oferty pracy",
employerPartnerSignIn: "Logowanie Pracodawca / Partner",
whoIs: "Kim jest HireMinds?",
whatWeDo: "Co Robimy",
whatNext: "Co Dalej",
whoIsText:
"HireMinds to platforma workforce stworzona po to, aby pomóc kandydatom lepiej pokazać ich umiejętności, gotowość i tożsamość zawodową.",
whatWeDoText:
"Łączymy Career Passports, CV, opcje weryfikacji, próbne rozmowy i usługi wsparcia kariery w jednej platformie.",
whatNextText:
"Utwórz swój Career Passport, uzupełnij profil, zbuduj CV i odblokuj dodatkowe usługi wsparcia.",
careerCoach: "Coach Kariery",
liveMockInterview: "Próbna Rozmowa na Żywo",
liveResumeRevision: "Korekta CV na Żywo",
consultation: "Konsultacja",
other: "Inne",
employers: "Pracodawcy",
nonprofits: "Organizacje non-profit",
},
};




—————————-
———————————————




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




—————————
———————————-
———————————-/——



"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../lib/language-context";
import { supabase } from "../lib/supabase";

export default function SiteHeader() {
const { t } = useLanguage();

const [isLoggedIn, setIsLoggedIn] = useState(false);
const [checkingAuth, setCheckingAuth] = useState(true);
const [loadingLogout, setLoadingLogout] = useState(false);

useEffect(() => {
async function checkAuth() {
const { data } = await supabase.auth.getSession();
setIsLoggedIn(Boolean(data.session));
setCheckingAuth(false);
}

checkAuth();
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
<a href="/profile" style={styles.link}>
My Profile
</a>

<a href="/career-toolkit" style={styles.link}>
Career ToolKit
</a>

<button
type="button"
onClick={() => window.dispatchEvent(new Event("toggle-notes-panel"))}
style={styles.linkButtonLike}
>
Notes
</button>

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
<span style={styles.lockedLink}>{t.employerPartnerLogIn}</span>
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

