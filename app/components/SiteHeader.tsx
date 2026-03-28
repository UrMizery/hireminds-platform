"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "../lib/language-context";
import { supabase } from "../lib/supabase";

export default function SiteHeader() {
  const { t, lang } = useLanguage();
  const pathname = usePathname();
  const isRTL = lang === "ar";

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
      <div
        style={{
          ...styles.inner,
          direction: isRTL ? "rtl" : "ltr",
          gridTemplateColumns: isRTL ? "auto 1fr 220px" : "220px 1fr auto",
        }}
      >
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
            Partner With HireMinds
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
              
              <a href="/career-toolkit" style={styles.navLink}>
               Career ToolKit
              </a>
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
          <span style={styles.lockedLink}>{t.employerPartnerSignIn} 🔒</span>
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
