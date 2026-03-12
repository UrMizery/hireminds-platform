"use client";

import { useState } from "react";
import { useLanguage } from "../lib/language-context";

export default function SiteHeader() {
  const { t, lang } = useLanguage();
  const isRTL = lang === "ar";

  const [partnerOpen, setPartnerOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

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
          {/* LOGO */}
          <a href="/" style={styles.logo}>
            HireMinds
          </a>

          {/* CENTER NAV */}
          <div style={styles.centerNav}>
            <a href="/" style={styles.link}>
              {t.home}
            </a>

            <a href="/sign-in" style={styles.link}>
              {t.signIn}
            </a>

            <a href="/services" style={styles.link}>
              {t.services}
            </a>

            {/* SCHEDULE */}
            <div
              style={styles.dropdown}
              onMouseEnter={() => setScheduleOpen(true)}
              onMouseLeave={() => setScheduleOpen(false)}
            >
              <span style={styles.link}>{t.schedule} ▾</span>

              {scheduleOpen && (
                <div style={styles.menu}>
                  <span style={styles.lockedMenuItem}>{t.careerCoach} 🔒</span>
                  <span style={styles.lockedMenuItem}>{t.liveMockInterview} 🔒</span>
                  <span style={styles.lockedMenuItem}>{t.liveResumeRevision} 🔒</span>
                  <span style={styles.lockedMenuItem}>{t.consultation} 🔒</span>
                  <span style={styles.lockedMenuItem}>{t.other} 🔒</span>
                </div>
              )}
            </div>

            {/* PARTNER */}
            <div
              style={styles.dropdown}
              onMouseEnter={() => setPartnerOpen(true)}
              onMouseLeave={() => setPartnerOpen(false)}
            >
              <span style={styles.link}>{t.partner} ▾</span>

              {partnerOpen && (
                <div style={styles.menu}>
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

          {/* RIGHT */}
          <div style={styles.rightNav}>
            <span style={styles.lockedLink}>
              {t.jobBoard} 🔒
            </span>

            <span style={styles.lockedLink}>
              {t.employerPartnerSignIn} 🔒
            </span>
          </div>
        </div>
      </header>

      {/* FLOATING CART */}
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
    justifyContent: "center",
    alignItems: "center",
  },

  rightNav: {
    display: "flex",
    gap: "16px",
    justifyContent: "flex-end",
  },

  link: {
    color: "#d4d4d8",
    fontSize: 14,
    textDecoration: "none",
  },

  lockedLink: {
    color: "#6b7280",
    fontSize: 14,
  },

  dropdown: {
    position: "relative",
  },

  menu: {
    position: "absolute",
    top: 26,
    left: 0,
    background: "#111",
    border: "1px solid #333",
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
  },

  menuItem: {
    display: "block",
    padding: 8,
    color: "#fff",
    textDecoration: "none",
  },

  lockedMenuItem: {
    display: "block",
    padding: 8,
    color: "#888",
  },

  floatingCart: {
    position: "fixed",
    bottom: 24,
    zIndex: 200,
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#111827",
    border: "1px solid #374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    textDecoration: "none",
    color: "#fff",
  },
};
