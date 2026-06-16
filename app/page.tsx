"use client";

import { useLanguage } from "./lib/language-context";

export default function HomePage() {
  const { t } = useLanguage();
  const isRTL = false;

  return (
    <main style={styles.page}>
      {/* HERO */}
      <section
        style={{
          ...styles.hero,
          textAlign: isRTL ? "right" : "center",
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        <p style={styles.heroEyebrow}>
          WORKFORCE INFRASTRUCTURE PLATFORM
        </p>

        <h1 style={styles.title}>
          {t.title}
        </h1>

        <p style={styles.subtitle}>
          HireMinds helps people strengthen visibility,
          organize career tools, prepare for opportunities,
          and keep momentum moving forward.
        </p>

        <div
          style={{
            ...styles.buttonRow,
            justifyContent: isRTL ? "flex-start" : "center",
          }}
        >
          <a href="/sign-up" style={styles.primaryButton}>
            Create Career Passport / Sign Up
          </a>
        </div>

        {/* LOGO */}
        <div style={styles.heroLogoWrap}>
          <img
            src="/hm-logo.png"
            alt="HireMinds"
            style={styles.heroLogo}
          />
        </div>
      </section>

      {/* WHO WE ARE */}
      <section style={styles.bridgeSection}>
        <div style={styles.bridgeHeadingWrap}>
          <div style={styles.headingLine} />

          <p style={styles.bridgeTag}>
            WHO WE ARE
          </p>

          <div style={styles.headingLine} />
        </div>

        <h2 style={styles.bridgeTitle}>
          The Bridge Between Potential and Opportunity
        </h2>

        <p style={styles.bridgeText}>
          HireMinds is a workforce infrastructure platform
          that connects people, purpose, and opportunity.
          We bridge the gap between Participants,
          Justice Impact Partners, Nonprofits,
          and Employers through one unified ecosystem
          built for real outcomes.
        </p>

        {/* BRIDGE */}
        <div style={styles.bridgeWrapper}>
          
          {/* BRIDGE GLOW */}
          <div style={styles.bridgeGlow} />

          {/* BRIDGE LINES */}
          <div style={styles.bridgeArc} />
          <div style={styles.bridgeArc2} />

          {/* CENTER HM */}
          <div style={styles.centerLogoWrap}>
            <div style={styles.centerLogoGlow} />

            <img
              src="/hm-logo.png"
              alt="HireMinds"
              style={styles.centerLogo}
            />

            <h3 style={styles.centerLogoTitle}>
              HireMinds
            </h3>

            <p style={styles.centerLogoText}>
              One Platform.
              <br />
              Unlimited Impact.
            </p>
          </div>

          {/* LEFT */}
          <div style={styles.bridgeGrid}>
            
            {/* PARTICIPANTS */}
            <div style={styles.bridgeNode}>
              <div
                style={{
                  ...styles.nodeCircle,
                  border: "2px solid #2b8cff",
                  boxShadow:
                    "0 0 35px rgba(43,140,255,.7)",
                }}
              >
                👤
              </div>

              <h3 style={styles.nodeTitle}>
                Participants
              </h3>

              <p style={styles.nodeText}>
                Build visibility,
                access tools,
                and prepare for meaningful
                career opportunities.
              </p>
            </div>

            {/* JUSTICE */}
            <div style={styles.bridgeNode}>
              <div
                style={{
                  ...styles.nodeCircle,
                  border: "2px solid #58ff73",
                  boxShadow:
                    "0 0 35px rgba(88,255,115,.7)",
                }}
              >
                🤝
              </div>

              <h3 style={styles.nodeTitle}>
                Justice Impact
                <br />
                Partners
              </h3>

              <p style={styles.nodeText}>
                Connect individuals
                to support, resources,
                and pathways that
                drive real change.
              </p>
            </div>

            {/* NONPROFITS */}
            <div style={styles.bridgeNode}>
              <div
                style={{
                  ...styles.nodeCircle,
                  border: "2px solid #d15cff",
                  boxShadow:
                    "0 0 35px rgba(209,92,255,.7)",
                }}
              >
                💜
              </div>

              <h3 style={styles.nodeTitle}>
                Nonprofits
              </h3>

              <p style={styles.nodeText}>
                Coordinate support,
                program management,
                and community impact
                at scale.
              </p>
            </div>

            {/* EMPLOYERS */}
            <div style={styles.bridgeNode}>
              <div
                style={{
                  ...styles.nodeCircle,
                  border: "2px solid #32e0ff",
                  boxShadow:
                    "0 0 35px rgba(50,224,255,.7)",
                }}
              >
                💼
              </div>

              <h3 style={styles.nodeTitle}>
                Employers
              </h3>

              <p style={styles.nodeText}>
                Discover prepared talent,
                build stronger teams,
                and create lasting impact.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={styles.footerStatement}>
          <p style={styles.footerTitle}>
            HireMinds isn’t just a platform — it’s a bridge.
          </p>

          <p style={styles.footerText}>
            One infrastructure. One mission.
            Unlimited potential.
          </p>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(0,110,255,.12), transparent 25%), #020202",
    color: "#f5f5f5",
    padding: "30px 24px 100px",
    overflow: "hidden",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, sans-serif',
  },

  hero: {
    maxWidth: "1300px",
    margin: "0 auto",
    paddingTop: "20px",
  },

  heroEyebrow: {
    marginBottom: "14px",
    color: "#2f8dff",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".25em",
  },

  title: {
    margin: "0 0 22px",
    fontSize: "clamp(3rem,7vw,6rem)",
    lineHeight: ".95",
    fontWeight: 800,
    letterSpacing: "-.07em",
  },

  subtitle: {
    maxWidth: "900px",
    margin: "0 auto",
    color: "#c9c9cf",
    fontSize: "20px",
    lineHeight: 1.8,
  },

  buttonRow: {
    display: "flex",
    marginTop: "35px",
  },

  primaryButton: {
    padding: "16px 38px",
    borderRadius: "18px",
    background:
      "linear-gradient(180deg,#f3f3f6 0%,#cfcfd6 100%)",
    color: "#050505",
    textDecoration: "none",
    fontWeight: 900,
    fontSize: "16px",
    border: "1px solid rgba(255,255,255,.15)",
    boxShadow:
      "0 10px 35px rgba(255,255,255,.12)",
  },

  heroLogoWrap: {
    display: "flex",
    justifyContent: "center",
    marginTop: "45px",
  },

  heroLogo: {
    width: "340px",
    maxWidth: "90%",
    objectFit: "contain",
    filter:
      "drop-shadow(0 0 35px rgba(0,132,255,.45))",
  },

  bridgeSection: {
    maxWidth: "1500px",
    margin: "0 auto",
    paddingTop: "40px",
    textAlign: "center",
  },

  bridgeHeadingWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "18px",
    marginBottom: "20px",
  },

  headingLine: {
    width: "140px",
    height: "1px",
    background:
      "linear-gradient(to right, transparent, #1f7cff, transparent)",
  },

  bridgeTag: {
    color: "#2f8dff",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: ".22em",
  },

  bridgeTitle: {
    fontSize: "clamp(2.5rem,5vw,4.5rem)",
    marginBottom: "24px",
    fontWeight: 800,
    letterSpacing: "-.06em",
  },

  bridgeText: {
    maxWidth: "980px",
    margin: "0 auto",
    color: "#d0d0d0",
    lineHeight: 1.7,
    fontSize: "22px",
  },

  bridgeWrapper: {
    position: "relative",
    marginTop: "80px",
    paddingTop: "100px",
    paddingBottom: "40px",
  },

  bridgeGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at center, rgba(0,132,255,.12), transparent 55%)",
    filter: "blur(40px)",
  },

  bridgeArc: {
    position: "absolute",
    left: "5%",
    right: "5%",
    top: "80px",
    height: "180px",
    borderTop:
      "3px solid rgba(74,144,255,.95)",
    borderRadius: "50% 50% 0 0",
    boxShadow:
      "0 0 25px rgba(74,144,255,.8)",
    opacity: 0.9,
  },

  bridgeArc2: {
    position: "absolute",
    left: "7%",
    right: "7%",
    top: "105px",
    height: "140px",
    borderTop:
      "1px solid rgba(255,255,255,.45)",
    borderRadius: "50% 50% 0 0",
    opacity: 0.4,
  },

  bridgeGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(240px,1fr))",
    gap: "20px",
    alignItems: "start",
    position: "relative",
    zIndex: 2,
  },

  bridgeNode: {
    textAlign: "center",
    paddingTop: "80px",
  },

  nodeCircle: {
    width: "110px",
    height: "110px",
    margin: "0 auto 24px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
    background:
      "radial-gradient(circle at top, rgba(255,255,255,.08), rgba(255,255,255,.02))",
    backdropFilter: "blur(12px)",
  },

  nodeTitle: {
    fontSize: "34px",
    lineHeight: 1.1,
    fontWeight: 800,
    marginBottom: "16px",
  },

  nodeText: {
    color: "#c9c9cf",
    lineHeight: 1.9,
    fontSize: "18px",
    maxWidth: "320px",
    margin: "0 auto",
  },

  centerLogoWrap: {
    position: "absolute",
    left: "50%",
    top: "120px",
    transform: "translateX(-50%)",
    zIndex: 5,
    textAlign: "center",
  },

  centerLogoGlow: {
    position: "absolute",
    inset: "-20px",
    background:
      "radial-gradient(circle, rgba(0,132,255,.25), transparent 70%)",
    filter: "blur(20px)",
  },

  centerLogo: {
    width: "220px",
    height: "220px",
    objectFit: "contain",
    position: "relative",
    zIndex: 2,
    filter:
      "drop-shadow(0 0 35px rgba(0,132,255,.65))",
  },

  centerLogoTitle: {
    marginTop: "10px",
    fontSize: "42px",
    fontWeight: 800,
  },

  centerLogoText: {
    color: "#d0d0d0",
    lineHeight: 1.7,
    fontSize: "20px",
  },

  footerStatement: {
    marginTop: "120px",
    textAlign: "center",
  },

  footerTitle: {
    fontSize: "34px",
    fontWeight: 700,
    marginBottom: "12px",
  },

  footerText: {
    color: "#b4b4ba",
    fontSize: "22px",
  },
};
