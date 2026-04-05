"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../lib/language-context";
import { supabase } from "../lib/supabase";
import { getUserAccess, type UserAccessRole } from "../lib/get-user-access";

type PartnerNavItem = {
  label: string;
  href: string;
};

const partnerNavItems: PartnerNavItem[] = [
  { label: "Messages", href: "/messages" },
  { label: "Career Map", href: "/partner-dashboard/career-map" },
  { label: "Reports", href: "/partner-dashboard/reports" },
  { label: "Job Logs", href: "/partner-dashboard/job-logs" },
  { label: "Activity", href: "/partner-dashboard/activity" },
  { label: "Workshop Resources", href: "/partner-dashboard/workshop-resources" },
  { label: "Summary Generator", href: "/partner-dashboard/report-summary" },
];

export default function SiteHeader() {
  const { t } = useLanguage();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [role, setRole] = useState<UserAccessRole>("guest");
  const [isPartner, setIsPartner] = useState(false);
  const [partnersOpen, setPartnersOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function syncAccess() {
      const access = await getUserAccess();

      if (!mounted) return;

      setIsLoggedIn(access.isLoggedIn);
      setRole(access.role);
      setIsPartner(access.isPartner);
      setCheckingAuth(false);
    }

    syncAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      const access = await getUserAccess();

      if (!mounted) return;

      setIsLoggedIn(access.isLoggedIn);
      setRole(access.role);
      setIsPartner(access.isPartner);
      setCheckingAuth(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setPartnersOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    try {
      setLoadingLogout(true);
      await supabase.auth.signOut();
    } finally {
      window.location.href = "/";
    }
  }

  const isAdmin = role === "admin";
  const isEmployer = role === "employer";
  const isCandidate = role === "candidate";

  const showPartnerNav = isLoggedIn && isPartner;

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
              {isCandidate || isAdmin ? (
                <a href="/profile" style={styles.link}>
                  My Profile
                </a>
              ) : null}

              {showPartnerNav ? (
                <>
                  <a href="/partner-dashboard" style={styles.link}>
                    Partner Dashboard
                  </a>

                  <div style={styles.dropdownWrap} ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setPartnersOpen((prev) => !prev)}
                      style={styles.dropdownTrigger}
                      aria-haspopup="menu"
                      aria-expanded={partnersOpen}
                    >
                      Tools
                      <span
                        style={{
                          ...styles.dropdownChevron,
                          transform: partnersOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      >
                        ▼
                      </span>
                    </button>

                    {partnersOpen ? (
                      <div style={styles.dropdownMenu}>
                        {partnerNavItems.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            style={styles.dropdownItem}
                            onClick={() => setPartnersOpen(false)}
                          >
                            {item.label}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </>
              ) : null}

              {isEmployer ? (
                <a href="/employer-dashboard" style={styles.link}>
                  Employer Dashboard
                </a>
              ) : null}

              {isAdmin ? (
                <a href="/admin-dashboard" style={styles.link}>
                  Admin Dashboard
                </a>
              ) : null}

              {isCandidate || showPartnerNav || isAdmin ? (
                <a href="/career-toolkit" style={styles.link}>
                  Career ToolKit
                </a>
              ) : null}

              {isCandidate || showPartnerNav || isAdmin ? (
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event("toggle-notes-panel"))}
                  style={styles.notesButtonLike}
                >
                  Notes
                </button>
              ) : null}

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

          {!isLoggedIn ? (
            <a href="/employer-partner-login" style={styles.link}>
              {t.employerPartnerSignIn}
            </a>
          ) : null}
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
    padding: "16px 24px",
    display: "grid",
    gridTemplateColumns: "240px 1fr auto",
    alignItems: "center",
    gap: "20px",
  },
  logo: {
    color: "#f5f5f5",
    fontSize: "26px",
    fontWeight: 700,
    textDecoration: "none",
    letterSpacing: "0.2px",
  },
  centerNav: {
    display: "flex",
    gap: "22px",
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
    fontSize: "15px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  notesButtonLike: {
    border: "1px solid #a1a1aa",
    background: "#ffffff",
    color: "#111111",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
    borderRadius: "999px",
    padding: "8px 22px",
    appearance: "none",
    WebkitAppearance: "none",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.15) inset",
  },
  dropdownWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
  },
  dropdownTrigger: {
    border: "none",
    background: "transparent",
    color: "#d4d4d8",
    fontSize: "15px",
    cursor: "pointer",
    padding: 0,
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    appearance: "none",
    WebkitAppearance: "none",
  },
  dropdownChevron: {
    fontSize: "10px",
    transition: "transform 0.2s ease",
    display: "inline-block",
  },
  dropdownMenu: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    minWidth: "240px",
    background: "#111111",
    border: "1px solid #2a2a2d",
    borderRadius: "14px",
    boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
    padding: "8px",
    zIndex: 200,
    display: "grid",
    gap: "4px",
  },
  dropdownItem: {
    color: "#e4e4e7",
    textDecoration: "none",
    fontSize: "15px",
    padding: "10px 12px",
    borderRadius: "10px",
    whiteSpace: "nowrap",
    background: "transparent",
  },
  lockedLink: {
    color: "#7c7c85",
    fontSize: "15px",
    whiteSpace: "nowrap",
  },
  logoutButton: {
    background: "transparent",
    border: "1px solid #3f3f46",
    color: "#d4d4d8",
    fontSize: "15px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    borderRadius: "10px",
    padding: "8px 12px",
  },
};
