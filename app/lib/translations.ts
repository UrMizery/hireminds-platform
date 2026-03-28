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
