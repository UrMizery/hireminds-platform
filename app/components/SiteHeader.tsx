"use client";

import { useState } from "react";
import { useLanguage } from "../lib/language-context";

export default function SiteHeader() {
  const { t } = useLanguage();

  const [partnerOpen, setPartnerOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        {/* LEFT LOGO */}
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
                <span style={styles.lockedMenuItem}>
                  {t.careerCoach} 🔒
                </span>

                <span style={styles.lockedMenuItem}>
                  {t.liveMockInterview} 🔒
                </span>

                <span style={styles.lockedMenuItem}>
                  {t.liveResumeRevision} 🔒
                </span>

                <span style={styles.lockedMenuItem}>
                  {t.consultation} 🔒
                </span>

                <span style={styles.lockedMenuItem}>
                  {t.other} 🔒
                </span>
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

        {/* RIGHT NAV */}
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
    gridTemplateColumns: "180px 1fr auto",
    alignItems: "center",
    gap: "20px",
  },

  logo: {
    color: "#f5f5f5",
    fontSize: "20px",
    fontWeight: 600,
    textDecoration: "none",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
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
    cursor: "not-allowed",
    whiteSpace: "nowrap",
  },

  dropdown: {
    position: "relative",
  },

  menu: {
    position: "absolute",
    top: 28,
    left: 0,
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
    cursor: "not-allowed",
  },
};
