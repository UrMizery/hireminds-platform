```tsx id="hmfullbridge"
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
          Build Your Career Passport
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

        {/* MAIN LOGO */}
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

        {/* BRIDGE AREA */}
        <div style={styles.bridgeWrapper}>
          
          {/* BACKGROUND GLOW */}
          <div style={styles.bridgeGlow} />

          {/* MESH */}
          <div style={styles.bridgeMesh} />

          {/* BRIDGE WAVES */}
          <div style={styles.bridgeWave1} />
          <div style={styles.bridgeWave2} />
          <div style={styles.bridgeWave3} />
          <div style={styles.bridgeWave4} />

          {/* LEFT SUPPORT */}
          <div style={styles.leftSupportGlow} />

          {/* RIGHT SUPPORT */}
          <div style={styles.rightSupportGlow} />

          {/* CENTER HM */}
          <div style={styles.centerLogoWrap}>
            <div style={styles.centerLogoBaseGlow} />

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

          {/* NODES */}
          <div style={styles.bridgeGrid}>
            
            {/* PARTICIPANTS */}
            <div style={styles.bridgeNode}>
              <div
                style={{
                  ...styles.nodeCircle,
                  border: "2px solid #1e90ff",
                  boxShadow:
                    "0 0 45px rgba(30,144,255,.9)",
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

              <div
                style={{
                  ...styles.nodeGlowLine,
                  background:
                    "linear-gradient(to right, transparent, #1e90ff, transparent)",
                }}
              />
            </div>

            {/* JUSTICE */}
            <div style={styles.bridgeNode}>
              <div
                style={{
                  ...styles.nodeCircle,
                  border: "2px solid #58ff73",
                  boxShadow:
                    "0 0 45px rgba(88,255,115,.9)",
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
                to support,
                resources,
                and pathways that
                drive real change.
              </p>

              <div
                style={{
                  ...styles.nodeGlowLine,
                  background:
                    "linear-gradient(to right, transparent, #58ff73, transparent)",
                }}
              />
            </div>

            {/* NONPROFITS */}
            <div style={styles.bridgeNode}>
              <div
                style={{
                  ...styles.nodeCircle,
                  border: "2px solid #d65cff",
                  boxShadow:
                    "0 0 45px rgba(214,92,255,.9)",
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

              <div
                style={{
                  ...styles.nodeGlowLine,
                  background:
                    "linear-gradient(to right, transparent, #d65cff, transparent)",
                }}
              />
            </div>

            {/* EMPLOYERS */}
            <div style={styles.bridgeNode}>
              <div
                style={{
                  ...styles.nodeCircle,
                  border: "2px solid #29e0ff",
                  boxShadow:
                    "0 0 45px rgba(41,224,255,.9)",
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

              <div
                style={{
                  ...styles.nodeGlowLine,
                  background:
                    "linear-gradient(to right, transparent, #29e0ff, transparent)",
                }}
              />
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
      "radial-gradient(circle at top, rgba(0,110,255,.14), transparent 22%), #000",
    color: "#f5f5f5",
    padding: "32px 24px 100px",
    overflow: "hidden",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, sans-serif',
  },

  hero: {
    maxWidth: "1450px",
    margin: "0 auto",
    paddingTop: "20px",
  },

  heroEyebrow: {
    marginBottom: "14px",
    color: "#2f8dff",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".28em",
  },

  title: {
    margin: "0 0 18px",
    fontSize: "clamp(3.5rem,8vw,6.7rem)",
    lineHeight: ".94",
    fontWeight: 800,
    letterSpacing: "-.08em",
  },

  subtitle: {
    maxWidth: "920px",
    margin: "0 auto",
    color: "#d2d2d8",
    fontSize: "22px",
    lineHeight: 1.7,
  },

  buttonRow: {
    display: "flex",
    marginTop: "34px",
  },

  primaryButton: {
    padding: "18px 40px",
    borderRadius: "18px",
    background:
      "linear-gradient(180deg,#f3f3f6 0%,#d6d6de 100%)",
    color: "#050505",
    textDecoration: "none",
    fontWeight: 900,
    fontSize: "17px",
    border: "1px solid rgba(255,255,255,.15)",
    boxShadow:
      "0 10px 40px rgba(255,255,255,.12)",
  },

  heroLogoWrap: {
    display: "flex",
    justifyContent: "center",
    marginTop: "40px",
  },

  heroLogo: {
    width: "420px",
    maxWidth: "90%",
    objectFit: "contain",
    filter:
      "drop-shadow(0 0 35px rgba(0,132,255,.45))",
  },

  bridgeSection: {
    maxWidth: "1600px",
    margin: "0 auto",
    paddingTop: "20px",
    textAlign: "center",
  },

  bridgeHeadingWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "18px",
    marginBottom: "18px",
  },

  headingLine: {
    width: "220px",
    height: "1px",
    background:
      "linear-gradient(to right, transparent, #1e90ff, transparent)",
  },

  bridgeTag: {
    color: "#2f8dff",
    fontSize: "13px",
    fontWeight: 900,
    letterSpacing: ".24em",
  },

  bridgeTitle: {
    fontSize: "clamp(2.8rem,5vw,5rem)",
    marginBottom: "22px",
    fontWeight: 800,
    letterSpacing: "-.06em",
  },

  bridgeText: {
    maxWidth: "1100px",
    margin: "0 auto",
    color: "#d0d0d0",
    lineHeight: 1.7,
    fontSize: "24px",
  },

  bridgeWrapper: {
    position: "relative",
    marginTop: "120px",
    paddingTop: "140px",
    paddingBottom: "60px",
    overflow: "hidden",
  },

  bridgeGlow: {
    position: "absolute",
    left: "-10%",
    right: "-10%",
    top: "120px",
    height: "280px",
    background:
      "radial-gradient(circle at center, rgba(0,132,255,.22), transparent 70%)",
    filter: "blur(60px)",
    zIndex: 1,
  },

  bridgeMesh: {
    position: "absolute",
    left: "5%",
    right: "5%",
    top: "120px",
    height: "170px",
    background:
      "repeating-linear-gradient(90deg, rgba(255,255,255,.08) 0px, rgba(255,255,255,.08) 1px, transparent 1px, transparent 26px)",
    opacity: .22,
    transform:
      "perspective(1000px) rotateX(68deg)",
    zIndex: 1,
  },

  bridgeWave1: {
    position: "absolute",
    left: "-5%",
    right: "-5%",
    top: "105px",
    height: "170px",
    borderTop: "3px solid rgba(61,146,255,.95)",
    borderRadius: "50%",
    boxShadow:
      "0 0 30px rgba(61,146,255,.95)",
    zIndex: 2,
  },

  bridgeWave2: {
    position: "absolute",
    left: "-3%",
    right: "-3%",
    top: "120px",
    height: "160px",
    borderTop:
      "2px solid rgba(255,255,255,.35)",
    borderRadius: "50%",
    opacity: .7,
    zIndex: 2,
  },

  bridgeWave3: {
    position: "absolute",
    left: "2%",
    right: "2%",
    top: "150px",
    height: "120px",
    borderTop:
      "2px solid rgba(90,255,160,.7)",
    borderRadius: "50%",
    boxShadow:
      "0 0 25px rgba(90,255,160,.6)",
    opacity: .8,
    zIndex: 2,
  },

  bridgeWave4: {
    position: "absolute",
    left: "1%",
    right: "1%",
    top: "165px",
    height: "110px",
    borderTop:
      "2px solid rgba(190,90,255,.75)",
    borderRadius: "50%",
    boxShadow:
      "0 0 25px rgba(190,90,255,.55)",
    opacity: .75,
    zIndex: 2,
  },

  leftSupportGlow: {
    position: "absolute",
    left: "10%",
    top: "110px",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#2f8dff",
    boxShadow:
      "0 0 35px rgba(47,141,255,1)",
    zIndex: 4,
  },

  rightSupportGlow: {
    position: "absolute",
    right: "10%",
    top: "110px",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#2f8dff",
    boxShadow:
      "0 0 35px rgba(47,141,255,1)",
    zIndex: 4,
  },

  bridgeGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",
    gap: "20px",
    alignItems: "start",
    position: "relative",
    zIndex: 5,
  },

  bridgeNode: {
    textAlign: "center",
    paddingTop: "90px",
  },

  nodeCircle: {
    width: "120px",
    height: "120px",
    margin: "0 auto 28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "44px",
    background:
      "radial-gradient(circle at top, rgba(255,255,255,.08), rgba(255,255,255,.02))",
    backdropFilter: "blur(12px)",
  },

  nodeTitle: {
    fontSize: "28px",
    lineHeight: 1.15,
    fontWeight: 800,
    marginBottom: "18px",
  },

  nodeText: {
    color: "#d0d0d0",
    lineHeight: 1.8,
    fontSize: "18px",
    maxWidth: "320px",
    margin: "0 auto",
  },

  nodeGlowLine: {
    width: "120px",
    height: "3px",
    margin: "26px auto 0",
    borderRadius: "999px",
  },

  centerLogoWrap: {
    position: "absolute",
    left: "50%",
    top: "155px",
    transform: "translateX(-50%)",
    zIndex: 10,
    textAlign: "center",
  },

  centerLogoBaseGlow: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "-10px",
    width: "220px",
    height: "50px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(0,132,255,.5), transparent 70%)",
    filter: "blur(12px)",
  },

  centerLogo: {
    width: "240px",
    height: "240px",
    objectFit: "contain",
    filter:
      "drop-shadow(0 0 40px rgba(0,132,255,.7))",
  },

  centerLogoTitle: {
    marginTop: "10px",
    fontSize: "40px",
    fontWeight: 800,
  },

  centerLogoText: {
    color: "#d0d0d0",
    lineHeight: 1.7,
    fontSize: "22px",
  },

  footerStatement: {
    marginTop: "80px",
    textAlign: "center",
  },

  footerTitle: {
    fontSize: "34px",
    fontWeight: 700,
    marginBottom: "10px",
  },

  footerText: {
    color: "#b4b4ba",
    fontSize: "22px",
  },
};
```
