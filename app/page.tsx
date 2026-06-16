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

        {/* LOGO */}
        <div style={styles.heroLogoWrap}>
          <Image
            src="/hm-logo.png"
            alt="HireMinds"
            width={420}
            height={420}
            style={styles.heroLogo}
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

        {/* BRIDGE */}
        <div style={styles.bridgeWrap}>
          <img
            src="/hm-bridge.png"
            alt="bridge"
            style={styles.bridgeImage}
          />

          {/* PARTICIPANTS */}
          <div
            style={{
              ...styles.node,
              left: "4%",
              top: "195px",
              borderColor: "#1d8fff",
              boxShadow:
                "0 0 35px rgba(29,143,255,.95)",
            }}
          >
            <span style={styles.nodeEmoji}>👤</span>
          </div>

          {/* JUSTICE */}
          <div
            style={{
              ...styles.node,
              left: "27%",
              top: "168px",
              borderColor: "#53ff7c",
              boxShadow:
                "0 0 35px rgba(83,255,124,.95)",
            }}
          >
            <span style={styles.nodeEmoji}>🤝</span>
          </div>

          {/* CENTER ORB */}
          <div style={styles.centerOrb}>
            <Image
              src="/hm-logo.png"
              alt="HireMinds"
              width={170}
              height={170}
              style={{
                objectFit: "contain",
              }}
            />
          </div>

          {/* NONPROFITS */}
          <div
            style={{
              ...styles.node,
              right: "27%",
              top: "168px",
              borderColor: "#d45eff",
              boxShadow:
                "0 0 35px rgba(212,94,255,.95)",
            }}
          >
            <span style={styles.nodeEmoji}>💜</span>
          </div>

          {/* EMPLOYERS */}
          <div
            style={{
              ...styles.node,
              right: "4%",
              top: "195px",
              borderColor: "#18d8ff",
              boxShadow:
                "0 0 35px rgba(24,216,255,.95)",
            }}
          >
            <span style={styles.nodeEmoji}>💼</span>
          </div>
        </div>

        {/* CARDS */}
        <div style={styles.cardGrid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              Participants
            </h3>

            <p style={styles.cardText}>
              Build visibility,
              access tools,
              and prepare for meaningful
              career opportunities.
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              Justice Impact
              <br />
              Partners
            </h3>

            <p style={styles.cardText}>
              Connect individuals
              to support,
              resources,
              and pathways that
              drive real change.
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              HireMinds
            </h3>

            <p style={styles.centerText}>
              One Platform.
            </p>

            <p style={styles.centerBlue}>
              Unlimited Impact.
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              Nonprofits
            </h3>

            <p style={styles.cardText}>
              Coordinate support,
              program management,
              and community impact
              at scale.
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              Employers
            </h3>

            <p style={styles.cardText}>
              Discover prepared talent,
              build stronger teams,
              and create lasting impact.
            </p>
          </div>
        </div>

        {/* BOTTOM */}
        <div style={styles.bottomWrap}>
          <p style={styles.bottomMain}>
            HireMinds isn’t just a platform — it’s a{" "}
            <span style={styles.bridgeWord}>
              bridge.
            </span>
          </p>

          <p style={styles.bottomSub}>
            One infrastructure.
            One mission.
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
      "radial-gradient(circle at top, rgba(0,82,255,.15) 0%, #000000 45%)",
    color: "#ffffff",
    padding: "0 24px 100px",
    overflow: "hidden",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, sans-serif',
  },

  hero: {
    maxWidth: "1400px",
    margin: "0 auto",
    textAlign: "center",
    paddingTop: "40px",
  },

  heroEyebrow: {
    color: "#2f8fff",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.25em",
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
    marginTop: "45px",
    display: "flex",
    justifyContent: "center",
  },

  heroLogo: {
    objectFit: "contain",
    filter:
      "drop-shadow(0 0 24px rgba(38,114,255,.45))",
  },

  bridgeSection: {
    maxWidth: "1500px",
    margin: "0 auto",
    textAlign: "center",
    marginTop: "10px",
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

  bridgeWrap: {
    position: "relative",
    marginTop: "70px",
    height: "570px",
    width: "100%",
    overflow: "hidden",
  },

  bridgeImage: {
    position: "absolute",
    width: "100%",
    left: 0,
    top: "85px",
    opacity: 1,
    pointerEvents: "none",
    filter:
      "drop-shadow(0 0 22px rgba(43,120,255,.5))",
  },

  node: {
    position: "absolute",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    border: "3px solid",
    background:
      "radial-gradient(circle at top,#101010 0%,#000000 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },

  nodeEmoji: {
    fontSize: "52px",
  },

  centerOrb: {
    position: "absolute",
    left: "50%",
    top: "220px",
    transform: "translateX(-50%)",
    width: "240px",
    height: "240px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle at top,#0f172a 0%,#020202 80%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    boxShadow:
      "0 0 95px rgba(29,143,255,.75)",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(240px,1fr))",
    gap: "28px",
    marginTop: "-40px",
    alignItems: "start",
  },

  card: {
    textAlign: "center",
  },

  cardTitle: {
    fontSize: "28px",
    fontWeight: 900,
    marginBottom: "16px",
    lineHeight: 1.15,
  },

  cardText: {
    color: "#e0e0e0",
    lineHeight: 1.8,
    fontSize: "18px",
  },

  centerText: {
    color: "#ffffff",
    fontSize: "24px",
    marginBottom: "6px",
  },

  centerBlue: {
    color: "#2f8fff",
    fontSize: "24px",
    fontWeight: 900,
  },

  bottomWrap: {
    marginTop: "50px",
    textAlign: "center",
  },

  bottomMain: {
    fontSize: "32px",
    fontWeight: 800,
    marginBottom: "12px",
  },

  bridgeWord: {
    color: "#2f8fff",
  },

  bottomSub: {
    color: "#d0d0d0",
    fontSize: "24px",
    lineHeight: 1.7,
  },
};
