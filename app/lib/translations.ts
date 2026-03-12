export type Lang = "en" | "es" | "ar" | "pl";

export const translations: Record<
  Lang,
  {
    home: string;
    signIn: string;
    services: string;
    partner: string;
    contact: string;
    createPassport: string;
    title: string;
    subtitle: string;
    language: string;
    schedule: string;
    jobBoard: string;
  }
> = {
  en: {
    home: "Home",
    signIn: "Sign In",
    services: "Services",
    partner: "Partner with HireMinds",
    contact: "Contact Us",
    createPassport: "Create Career Passport / Sign Up",
    title: "Build Your Career Passport",
    subtitle:
      "Get prepared, get verified, and get hired. HireMinds helps candidates showcase their readiness beyond a traditional resume.",
    language: "Language",
    schedule: "Schedule 1:1",
    jobBoard: "Job Board",
  },

  es: {
    home: "Inicio",
    signIn: "Iniciar sesión",
    services: "Servicios",
    partner: "Asociarse con HireMinds",
    contact: "Contáctanos",
    createPassport: "Crear Career Passport / Registrarse",
    title: "Construye tu Career Passport",
    subtitle:
      "Prepárate, verifícate y consigue empleo. HireMinds ayuda a los candidatos a mostrar su preparación.",
    language: "Idioma",
    schedule: "Programar 1:1",
    jobBoard: "Bolsa de trabajo",
  },

  ar: {
    home: "الرئيسية",
    signIn: "تسجيل الدخول",
    services: "الخدمات",
    partner: "الشراكة مع HireMinds",
    contact: "اتصل بنا",
    createPassport: "إنشاء Career Passport / تسجيل",
    title: "أنشئ Career Passport الخاص بك",
    subtitle:
      "استعد، تحقق، واحصل على وظيفة. تساعد HireMinds المرشحين على عرض جاهزيتهم.",
    language: "اللغة",
    schedule: "حجز 1:1",
    jobBoard: "الوظائف",
  },

  pl: {
    home: "Strona główna",
    signIn: "Zaloguj się",
    services: "Usługi",
    partner: "Współpraca z HireMinds",
    contact: "Kontakt",
    createPassport: "Utwórz Career Passport / Rejestracja",
    title: "Zbuduj swój Career Passport",
    subtitle:
      "Przygotuj się, zweryfikuj i zdobądź pracę. HireMinds pomaga kandydatom pokazać gotowość.",
    language: "Język",
    schedule: "Umów 1:1",
    jobBoard: "Oferty pracy",
  },
};
