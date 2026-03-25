"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "../lib/language-context";
import { supabase } from "../lib/supabase";

export default function SiteHeader() {
  const { t, lang } = useLanguage();
  const pathname = usePathname();
  const isRTL = lang === "ar";

  const [partnerOpen, setPartnerOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
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
  
  const hideFloatingCart =
    pathname === "/resume-builder" ||
    pathname === "/profile" ||
    pathname === "/cart";

  return (
    <>
      <header style={styles.header}>
        <div
          style={{
            ...styles.inner,
            direction: isRTL ? "rtl" : "ltr",
            gridTemplateColumns: isRTL ? "auto 1fr 180px" : "180px 1fr auto",
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

            <a href="/services" style={styles.link}>
              {t.services}
            </a>

            <div
              style={styles.dropdown}
              onMouseEnter={() => setScheduleOpen(true)}
              onMouseLeave={() => setScheduleOpen(false)}
            >
              <span style={styles.link}>{t.schedule} ▾</span>

              {scheduleOpen && (
                <div
                  style={{
                    ...styles.menu,
                    left: isRTL ? "auto" : 0,
                    right: isRTL ? 0 : "auto",
                    textAlign: isRTL ? "right" : "left",
                  }}
                >
                  <span style={styles.lockedMenuItem}>{t.careerCoach} 🔒</span>
                  <span style={styles.lockedMenuItem}>{t.liveMockInterview} 🔒</span>
                  <span style={styles.lockedMenuItem}>{t.liveResumeRevision} 🔒</span>
                  <span style={styles.lockedMenuItem}>{t.consultation} 🔒</span>
                  <span style={styles.lockedMenuItem}>{t.other} 🔒</span>
                </div>
              )}
            </div>

            <div
              style={styles.dropdown}
              onMouseEnter={() => setPartnerOpen(true)}
              onMouseLeave={() => setPartnerOpen(false)}
            >
              <span style={styles.link}>{t.partner} ▾</span>

              {partnerOpen && (
                <div
                  style={{
                    ...styles.menu,
                    left: isRTL ? "auto" : 0,
                    right: isRTL ? 0 : "auto",
                    textAlign: isRTL ? "right" : "left",
                  }}
                >
                  <a href="/partner/employers" style={styles.menuItem}>
                    {t.employers}
                  </a>
                  <a href="/partner/nonprofits" style={styles.menuItem}>
                    {t.nonprofits}
                  </a>
                  <a href="/partner/other" style={styles.menuItem}>
                    {t.other}
                  </a>
                </div>
              )}
            </div>

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

      {!hideFloatingCart ? (
        <a
          href="/cart"
          style={{
            ...styles.floatingCart,
            right: isRTL ? "auto" : "24px",
            left: isRTL ? "24px" : "auto",
          }}
        >
          🛒
        </a>
      ) : null}
    </>
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
  dropdown: {
    position: "relative",
  },
  menu: {
    position: "absolute",
    top: 28,
    background: "#111",
    border: "1px solid #333",
    borderRadius: 12,
    padding: 8,
    minWidth: 220,
    boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
  },
  menuItem: {
    display: "block",
    padding: "10px 12px",
    color: "#f4f4f5",
    textDecoration: "none",
    fontSize: 14,
    borderRadius: 8,
  },
  lockedMenuItem: {
    display: "block",
    padding: "10px 12px",
    color: "#7c7c85",
    fontSize: 14,
    borderRadius: 8,
  },
  floatingCart: {
    position: "fixed",
    bottom: "24px",
    zIndex: 120,
    width: "54px",
    height: "54px",
    borderRadius: "999px",
    background: "#111827",
    border: "1px solid #374151",
    color: "#f3f4f6",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
    fontSize: "24px",
  },
};
