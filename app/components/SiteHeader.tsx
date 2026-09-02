"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../lib/supabase";

type UserRole = "guest" | "candidate" | "partner" | "employer" | "admin";

type NavItem = {
  label: string;
  href: string;
};

const partnerNavItems: NavItem[] = [
  { label: "Messages", href: "/messages" },
  { label: "Career Map", href: "/partner-dashboard/career-map" },
  { label: "Workshop Resources", href: "/partner-dashboard/workshop-resources" },
  { label: "Summary Generator", href: "/partner-dashboard/report-summary" },
];

const careerPathwayNavItems: NavItem[] = [
  { label: "Career Pathway Program", href: "/skillsquest" },
  { label: "Independent Learning", href: "/independent-learning-lab" },
  { label: "Career Media Library", href: "/career-media-library" },
  { label: "Assigned Training", href: "/assigned-training" },
];

const skillsQuestNavItems: NavItem[] = [
  { label: "Skill Builder Lab", href: "/skill-builder-lab" },
  { label: "Apply Knowledge Lab", href: "/applied-learning-lab" },
  { label: "Simulation Lab", href: "/simulation-lab" },
];

function normalizeRole(rawRole: unknown): UserRole {
  const normalizedRole = String(rawRole || "").toLowerCase().trim();

  if (normalizedRole === "admin" || normalizedRole === "super_admin") {
    return "admin";
  }

  if (normalizedRole === "partner") return "partner";
  if (normalizedRole === "employer") return "employer";

  if (
    normalizedRole === "candidate" ||
    normalizedRole === "career_passport" ||
    normalizedRole === "career-passport" ||
    normalizedRole === "user" ||
    normalizedRole === "jobseeker" ||
    normalizedRole === "job_seeker"
  ) {
    return "candidate";
  }

  return "guest";
}

export default function SiteHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [role, setRole] = useState<UserRole>("guest");
  const [partnersOpen, setPartnersOpen] = useState(false);
  const [careerPathwayOpen, setCareerPathwayOpen] = useState(false);
  const [skillsQuestOpen, setSkillsQuestOpen] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  const partnerDropdownRef = useRef<HTMLDivElement | null>(null);
  const careerPathwayDropdownRef = useRef<HTMLDivElement | null>(null);
  const skillsQuestDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    async function resolveAccess(sessionUser: any) {
      if (!sessionUser) {
        return {
          role: "guest" as UserRole,
          referralCode: "",
        };
      }

      const email = String(sessionUser.email || "").trim().toLowerCase();

      const [partnerResult, candidateByUserResult] = await Promise.all([
        email
          ? supabase
              .from("partners")
              .select("account_type, referral_code, contact_email")
              .eq("contact_email", email)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null } as any),

        supabase
          .from("candidate_profiles")
          .select("user_id, email, referral_code")
          .eq("user_id", sessionUser.id)
          .maybeSingle(),
      ]);

      if (partnerResult.error) {
        console.error("Header partner access check failed:", partnerResult.error);
      }

      if (candidateByUserResult.error) {
        console.error(
          "Header candidate access check failed:",
          candidateByUserResult.error
        );
      }

      const partnerRow = partnerResult.data as
        | {
            account_type?: string | null;
            referral_code?: string | null;
            contact_email?: string | null;
          }
        | null;

      const candidateRow = candidateByUserResult.data as
        | {
            user_id?: string | null;
            email?: string | null;
            referral_code?: string | null;
          }
        | null;

      let resolvedRole: UserRole = "guest";

      if (partnerRow?.account_type) {
        resolvedRole = normalizeRole(partnerRow.account_type);
      } else if (candidateRow) {
        resolvedRole = "candidate";
      } else {
        const metadataRole =
          sessionUser.app_metadata?.role ||
          sessionUser.user_metadata?.role ||
          sessionUser.user_metadata?.account_type ||
          "";

        const normalizedMetadataRole = normalizeRole(metadataRole);

        if (normalizedMetadataRole === "employer") {
          resolvedRole = "employer";
        }
      }

      const metadataReferralCode =
        sessionUser.app_metadata?.referral_code ||
        sessionUser.user_metadata?.referral_code ||
        sessionUser.user_metadata?.referralCode ||
        sessionUser.user_metadata?.access_code ||
        "";

      const resolvedReferralCode =
        partnerRow?.referral_code ||
        candidateRow?.referral_code ||
        metadataReferralCode ||
        "";

      return {
        role: resolvedRole,
        referralCode: String(resolvedReferralCode).trim().toUpperCase(),
      };
    }

    async function applySession(session: any) {
      const sessionUser = session?.user ?? null;

      if (!mounted) return;

      if (!sessionUser) {
        setIsLoggedIn(false);
        setRole("guest");
        setReferralCode("");
        setCheckingAuth(false);
        return;
      }

      setCheckingAuth(true);

      const access = await resolveAccess(sessionUser);

      if (!mounted) return;

      setIsLoggedIn(true);
      setRole(access.role);
      setReferralCode(access.referralCode);
      setCheckingAuth(false);
    }

    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await applySession(session);
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        partnerDropdownRef.current &&
        !partnerDropdownRef.current.contains(target)
      ) {
        setPartnersOpen(false);
      }

      if (
        careerPathwayDropdownRef.current &&
        !careerPathwayDropdownRef.current.contains(target)
      ) {
        setCareerPathwayOpen(false);
      }

      if (
        skillsQuestDropdownRef.current &&
        !skillsQuestDropdownRef.current.contains(target)
      ) {
        setSkillsQuestOpen(false);
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
      localStorage.removeItem("hireminds_referral_code");
      await supabase.auth.signOut();
    } catch {
      // ignore
    } finally {
      window.location.href = "/";
    }
  }

  const isCandidate = role === "candidate";
  const isPartner = role === "partner";
  const isAdmin = role === "admin";
  const isEmployer = role === "employer";

  const hasCareerPathwayAccess = isAdmin;

  const activeCareerPathwayNavItems = careerPathwayNavItems;
  const activeSkillsQuestNavItems = skillsQuestNavItems;

  const showMyProfile =
    isLoggedIn && (isCandidate || isPartner || isAdmin);

  const showCareerToolkit =
    isLoggedIn && (isCandidate || isPartner || isAdmin);

  const showCareerPathway =
    isLoggedIn &&
    (isCandidate || isPartner || isAdmin) &&
    hasCareerPathwayAccess;

  const showSkillsQuest =
    isLoggedIn &&
    (isCandidate || isPartner || isAdmin) &&
    hasCareerPathwayAccess;

  const showPartnerDashboard =
    isLoggedIn && (isPartner || isAdmin);

  const showPartnerTools =
    isLoggedIn && (isPartner || isAdmin);

  const showNotes =
    isLoggedIn && (isCandidate || isPartner || isAdmin);

  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <div style={styles.logoWrap}>
          <a href="/" style={styles.logo}>
            HireMinds
          </a>
        </div>

        <div style={styles.centerNav}>
          <a href="/" style={styles.link}>
            Home
          </a>

          <a href="/explore" style={styles.link}>
            Explore
          </a>

          {!checkingAuth && !isLoggedIn ? (
            <a href="/sign-in" style={styles.link}>
              Sign In
            </a>
          ) : null}

          <a href="/contact" style={styles.link}>
            Contact
          </a>
        </div>

        <div style={styles.rightNav}>
          {isLoggedIn ? (
            <>
              {showMyProfile ? (
                <a href="/profile" style={styles.link}>
                  My Profile
                </a>
              ) : null}

              {showCareerToolkit ? (
                <a href="/career-toolkit" style={styles.link}>
                  Career ToolKit
                </a>
              ) : null}

              {showCareerPathway ? (
                <div style={styles.dropdownWrap} ref={careerPathwayDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setCareerPathwayOpen((prev) => !prev)}
                    style={styles.dropdownTrigger}
                    aria-haspopup="menu"
                    aria-expanded={careerPathwayOpen}
                  >
                    Career Pathway
                    <span
                      style={{
                        ...styles.dropdownChevron,
                        transform: careerPathwayOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {careerPathwayOpen ? (
                    <div style={styles.dropdownMenu}>
                      {activeCareerPathwayNavItems.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          style={styles.dropdownItem}
                          onClick={() => setCareerPathwayOpen(false)}
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {showSkillsQuest ? (
                <div style={styles.dropdownWrap} ref={skillsQuestDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setSkillsQuestOpen((prev) => !prev)}
                    style={styles.dropdownTrigger}
                    aria-haspopup="menu"
                    aria-expanded={skillsQuestOpen}
                  >
                    SkillsQuest
                    <span
                      style={{
                        ...styles.dropdownChevron,
                        transform: skillsQuestOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {skillsQuestOpen ? (
                    <div style={styles.dropdownMenu}>
                      {activeSkillsQuestNavItems.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          style={styles.dropdownItem}
                          onClick={() => setSkillsQuestOpen(false)}
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {showPartnerDashboard ? (
                <a href="/partner-dashboard" style={styles.link}>
                  Partner Dashboard
                </a>
              ) : null}

              {showPartnerTools ? (
                <div style={styles.dropdownWrap} ref={partnerDropdownRef}>
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
                        transform: partnersOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
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
              ) : null}

              {isEmployer ? (
                <a href="/employer-dashboard" style={styles.link}>
                  Employer Dashboard
                </a>
              ) : null}

              {showNotes ? (
                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(new Event("toggle-notes-panel"))
                  }
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

          {!checkingAuth && !isLoggedIn ? (
            <a href="/employer-partner-login" style={styles.link}>
              Employer/Partner Sign In
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}

const styles: Record<string, CSSProperties> = {
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
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    gap: "20px",
  },

  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
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
