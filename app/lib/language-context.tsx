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
