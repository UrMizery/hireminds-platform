"use client";

import Image from "next/image";
import { useLanguage } from "./lib/language-context";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
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

        <div style={styles.buttonRow}>
          <a href="/sign-up" style={styles.primaryButton}>
            Create Career Passport / Sign Up
          </a>
        </div>

        {/* FLOATING HM LOGO */}
        <div style={styles.heroLogoWrap}>
          <Image
            src="/hm-logo.png"
            alt="HireMinds"
            width={420}
            height={420}
            style={styles.heroLogo}
            priority
          />
        </div>
      </section>

      {/* WHO WE ARE */}
      <section style={styles.bridgeSection}>
        <div style={styles.whoWrap}>
          <div style={styles.line} />

          <p style={styles.whoTag}>
            WHO WE ARE
          </p>

          <div style={styles.line} />
        </div>

        <h2 style={styles.sectionHeading}>
          The Bridge Between Potential and Opportunity
        </h2>

        <p style={styles.sectionText}>
          HireMinds is a workforce infrastructure platform
          that connects people, purpose, and opportunity.
          We bridge the gap between Participants,
          Justice Impact Partners, Nonprofits, and Employers
          through one unified ecosystem built for real outcomes.
        </p>

        {/* BRIDGE IMAGE */}
        <div style={styles.bridgeImageSection}>

          <Image
            src="/bridge-network.png"
            alt="HireMinds Bridge"
            width={2200}
            height={950}
            priority
            style={styles.bridgeImage}
          />

          {/* OVERLAY CONTENT */}
          <div style={styles.bridgeOverlay}>

            {/* PARTICIPANTS */}
            <div style={styles.bridgeCard}>
              <h3 style={styles.bridgeTitle}>
                Participants
              </h3>

              <p style={styles.bridgeText}>
                Build visibility, access tools,
                and prepare for meaningful
                career opportunities.
              </p>
            </div>

            {/* JUSTICE */}
            <div style={styles.bridgeCard}>
              <h3 style={styles.bridgeTitle}>
                Justice Impact
                <br />
                Partners
              </h3>

              <p style={styles.bridgeText}>
                Connect individuals to support,
                resources, and pathways that
                drive real change.
              </p>
            </div>

            {/* CENTER */}
            <div style={styles.bridgeCenter}>
              <h3 style={styles.bridgeCenterTitle}>
                HireMinds
              </h3>

              <p style={styles.bridgeCenterText}>
                One Platform.
              </p>

              <p style={styles.bridgeCenterBlue}>
                Unlimited Impact.
              </p>
            </div>

            {/* NONPROFITS */}
            <div style={styles.bridgeCard}>
              <h3 style={styles.bridgeTitle}>
                Nonprofits
              </h3>

              <p style={styles.bridgeText}>
                Coordinate support,
                program management,
                and community impact
                at scale.
              </p>
            </div>

            {/* EMPLOYERS */}
            <div style={styles.bridgeCard}>
              <h3 style={styles.bridgeTitle}>
                Employers
              </h3>

              <p style={styles.bridgeText}>
                Discover prepared talent,
                build stronger teams,
                and create lasting impact.
              </p>
            </div>

          </div>
        </div>

        {/* BOTTOM VERBIAGE */}
        <div style={styles.bottomWrap}>
          <p style={styles.bottomMain}>
            HireMinds isn’t just a platform — it’s a{" "}
            <span style={styles.bridgeWord}>
              bridge.
            </span>
          </p>

          <p style={styles.bottomSub}>
            One infrastructure. One mission. Unlimited potential.
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
      "radial-gradient(circle at top, rgba(0,82,255,.15) 0%, #000000 45%)",
    color: "#ffffff",
    padding: "0 24px 100px",
    overflow: "hidden",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, sans-serif',
  },

  hero: {
    maxWidth: "1500px",
    margin: "0 auto",
    textAlign: "center",
    paddingTop: "40px",
  },

  heroEyebrow: {
    color: "#2f8fff",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.28em",
    marginBottom: "20px",
  },

  title: {
    margin: 0,
    fontSize: "clamp(4rem,8vw,6.8rem)",
    fontWeight: 900,
    lineHeight: 0.95,
    letterSpacing: "-0.06em",
    color: "#f5f5f5",
  },

  subtitle: {
    maxWidth: "820px",
    margin: "24px auto 0",
    color: "#d7d7d7",
    lineHeight: 1.8,
    fontSize: "20px",
  },

  buttonRow: {
    display: "flex",
    justifyContent: "center",
    marginTop: "36px",
  },

  primaryButton: {
    padding: "18px 42px",
    borderRadius: "18px",
    background:
      "linear-gradient(180deg,#ffffff 0%,#d8d8e2 100%)",
    color: "#000",
    textDecoration: "none",
    fontWeight: 900,
    fontSize: "18px",
    boxShadow:
      "0 0 35px rgba(255,255,255,.18)",
  },

heroLogoWrap: {
  marginTop: "18px",
  marginBottom: "-20px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  animation: "float 5s ease-in-out infinite",
},

heroLogo: {
  width: "430px",
  height: "auto",
  objectFit: "contain",
  background: "transparent",
  border: "none",
  boxShadow: "none",
  filter:
    "drop-shadow(0 0 60px rgba(38,114,255,.65))",
},

  bridgeSection: {
    maxWidth: "1700px",
    margin: "0 auto",
    textAlign: "center",
    marginTop: "-10px",
  },

  whoWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "20px",
  },

  line: {
    width: "220px",
    height: "1px",
    background:
      "linear-gradient(90deg,transparent,#2f8fff,transparent)",
  },

  whoTag: {
    color: "#2f8fff",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.28em",
  },

  sectionHeading: {
    fontSize: "clamp(2.7rem,5vw,4.5rem)",
    fontWeight: 900,
    marginBottom: "20px",
    lineHeight: 1.05,
  },

  sectionText: {
    maxWidth: "1050px",
    margin: "0 auto",
    color: "#d7d7d7",
    fontSize: "24px",
    lineHeight: 1.65,
  },

  bridgeImageSection: {
    position: "relative",
    width: "100%",
    maxWidth: "1800px",
    margin: "70px auto 0",
    overflow: "visible",
  },

bridgeImage: {
  width: "100%",
  height: "auto",
  display: "block",
  objectFit: "contain",
  marginLeft: "auto",
  marginRight: "auto",
  filter:
    "drop-shadow(0 0 45px rgba(0,120,255,.25))",
},

 bridgeOverlay: {
  position: "absolute",
  bottom: "5%",
  left: "50%",
  transform: "translateX(-50%)",
  width: "94%",
  display: "grid",
  gridTemplateColumns:
    "1fr 1fr 1.15fr 1fr 1fr",
  alignItems: "end",
},

bridgeCard: {
  textAlign: "center",
  padding: "0 16px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
},

  bridgeTitle: {
    fontSize: "clamp(22px,2vw,48px)",
    fontWeight: 900,
    lineHeight: 1.1,
    marginBottom: "16px",
  },

  bridgeText: {
    fontSize: "clamp(13px,1vw,24px)",
    lineHeight: 1.7,
    color: "#f1f1f1",
  },

bridgeCenter: {
  textAlign: "center",
  transform: "translateY(-22px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
},

bridgeCenterTitle: {
  fontSize: "clamp(28px,2vw,52px)",
  fontWeight: 900,
  marginBottom: "14px",
  lineHeight: 1,
  textAlign: "center",
},

  bridgeCenterText: {
    fontSize: "clamp(18px,1.4vw,34px)",
    marginBottom: "8px",
  },

  bridgeCenterBlue: {
    fontSize: "clamp(20px,1.5vw,36px)",
    fontWeight: 900,
    color: "#1f8fff",
  },

  bottomWrap: {
    marginTop: "20px",
    textAlign: "center",
  },

  bottomMain: {
    fontSize: "38px",
    fontWeight: 900,
    marginBottom: "10px",
  },

  bridgeWord: {
    color: "#2f8fff",
  },

  bottomSub: {
    color: "#d0d0d0",
    fontSize: "28px",
    lineHeight: 1.7,
    marginBottom: "40px",
  },
};
