"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import SiteHeader from "./components/SiteHeader";
import { translations, type Lang } from "./lib/translations";

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof translations.en;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within RootLayout");
  }
  return context;
}

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [lang, setLang] = useState<Lang>("en");

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: translations[lang],
    }),
    [lang]
  );

  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <body style={bodyStyle}>
        <LanguageContext.Provider value={value}>
          <div style={topBarStyle}>
            <div style={topBarInnerStyle}>
              <label style={labelStyle}>{translations[lang].language}</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                style={selectStyle}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="ar">العربية</option>
                <option value="pl">Polski</option>
              </select>
            </div>
          </div>

          <SiteHeader />
          {children}
        </LanguageContext.Provider>
      </body>
    </html>
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
  maxWidth: "1400px",
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
