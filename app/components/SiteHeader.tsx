"use client";

import { useState } from "react";

export default function SiteHeader() {
  const [partnerOpen, setPartnerOpen] = useState(false);

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <a href="/" style={styles.logo}>
          HireMinds
        </a>

        <nav style={styles.nav}>
          <a href="/" style={styles.link}>
            Home
          </a>

          <a href="/sign-in" style={styles.link}>
            Sign In
          </a>

          <a href="/services" style={styles.link}>
            Services
          </a>

          <span style={styles.lockedLink} title="Coming soon">
            Employment Opportunities 🔒
          </span>

          <span style={styles.lockedLink} title="Coming soon">
            Employer / Partner Sign In 🔒
          </span>

          <span style={styles.lockedLink} title="Coming soon">
            Schedule 1 🔒
          </span>

          <div
            style={styles.dropdown}
            onMouseEnter={() => setPartnerOpen(true)}
            onMouseLeave={() => setPartnerOpen(false)}
          >
            <span style={styles.link}>Partner with HireMinds ▾</span>

            {partnerOpen && (
              <div style={styles.menu}>
                <a href="/partner/employers" style={styles.menuItem}>
                  Employers
                </a>
                <a href="/partner/nonprofits" style={styles.menuItem}>
                  Nonprofits
                </a>
                <a href="/partner/other" style={styles.menuItem}>
                  Other
                </a>
              </div>
            )}
          </div>

          <a href="/contact" style={styles.link}>
            Contact Us
          </a>
        </nav>
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
    maxWidth: "1440px",
    margin: "0 auto",
    padding: "14px 24px",
    display: "flex",
    justifyContent: "space-between",
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
  nav: {
    display: "flex",
    gap: "18px",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
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
    right: 0,
    background: "#111",
    border: "1px solid #333",
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
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
};
