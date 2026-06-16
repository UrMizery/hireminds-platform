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
          Build Your Career Passport
        </h1>

        <p style={styles.subtitle}>
          HireMinds helps people strengthen visibility,
          organize career tools, prepare for opportunities,
          and keep momentum moving forward.
        </p>

        <a href="/sign-up" style={styles.primaryButton}>
          Create Career Passport / Sign Up
        </a>

        <div style={styles.logoWrap}>
          <Image
            src="/hm-logo.png"
            alt="HireMinds"
            width={420}
            height={420}
            style={styles.logoImage}
          />
        </div>
      </section>

      {/* WHO WE ARE */}
      <section style={styles.bridgeSection}>
        <div style={styles.headingRow}>
          <div style={styles.line} />
          <p style={styles.sectionTag}>WHO WE ARE</p>
          <div style={styles.line} />
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
        <div style={styles.bridgeWrap}>
          <div style={styles.bridgeGlow} />

          <svg
            viewBox="0 0 1400 340"
            style={styles.bridgeSvg}
          >
            <defs>
              <linearGradient
                id="bridgeGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#1d8fff" />
                <stop offset="30%" stopColor="#5aff75" />
                <stop offset="50%" stopColor="#6ca8ff" />
                <stop offset="70%" stopColor="#d45eff" />
                <stop offset="100%" stopColor="#18d8ff" />
              </linearGradient>
            </defs>

            <path
              d="M0 200 C180 40 320 320 520 180 S880 120 1400 200"
              stroke="url(#bridgeGradient)"
              strokeWidth="3"
              fill="none"
              opacity="0.95"
            />

            <path
              d="M0 220 C180 60 320 340 520 200 S880 140 1400 220"
              stroke="url(#bridgeGradient)"
              strokeWidth="1"
              fill="none"
              opacity="0.45"
            />

            <path
              d="M0 180 C180 20 320 300 520 160 S880 100 1400 180"
              stroke="url(#bridgeGradient)"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
            />
          </svg>

          {/* PARTICIPANTS */}
          <div
            style={{
              ...styles.node,
              left: "4%",
              top: "120px",
              borderColor: "#1d8fff",
              boxShadow:
                "0 0 35px rgba(29,143,255,.7)",
            }}
          >
            👤
          </div>

          {/* JUSTICE */}
          <div
            style={{
              ...styles.node,
              left: "30%",
              top: "95px",
              borderColor: "#53ff7c",
              boxShadow:
                "0 0 35px rgba(83,255,124,.7)",
            }}
          >
            🤝
          </div>

          {/* CENTER LOGO */}
          <div style={styles.centerOrb}>
            <Image
              src="/hm-logo.png"
              alt="HireMinds"
              width={160}
              height={160}
              style={{
                objectFit: "contain",
              }}
            />
          </div>

          {/* NONPROFITS */}
          <div
            style={{
              ...styles.node,
              right: "28%",
              top: "105px",
              borderColor: "#d45eff",
              boxShadow:
                "0 0 35px rgba(212,94,255,.7)",
            }}
          >
            💜
          </div>

          {/* EMPLOYERS */}
          <div
            style={{
              ...styles.node,
              right: "3%",
              top: "120px",
              borderColor: "#18d8ff",
              boxShadow:
                "0 0 35px rgba(24,216,255,.7)",
            }}
          >
            💼
          </div>
        </div>

        {/* LABELS */}
        <div style={styles.cardGrid}>
          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>
              Participants
            </h3>

            <p style={styles.cardText}>
              Build visibility, access tools,
              and prepare for meaningful
              career opportunities.
            </p>
          </div>

          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>
              Justice Impact Partners
            </h3>

            <p style={styles.cardText}>
              Connect individuals to support,
              resources, and pathways
              that drive real change.
            </p>
          </div>

          <div style={styles.infoCardCenter}>
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

          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>
              Nonprofits
            </h3>

            <p style={styles.cardText}>
              Coordinate support,
              program management,
              and community impact at scale.
            </p>
          </div>

          <div style={styles.infoCard}>
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

        <div style={styles.bottomText}>
          HireMinds isn’t just a platform —
          it’s a bridge.
          <br />
          One infrastructure. One mission.
          Unlimited potential.
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(0,102,255,.12), transparent 20%), #020202",
    color: "#ffffff",
    padding: "30px 20px 80px",
    overflow: "hidden",
    fontFamily:
      'Inter, sans-serif',
  },

  hero: {
    textAlign: "center",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  heroEyebrow: {
    color: "#2f8fff",
    letterSpacing: ".25em",
    fontSize: "12px",
    fontWeight: 800,
    marginBottom: "20px",
  },

  title: {
    fontSize: "clamp(3.5rem,8vw,6.5rem)",
    lineHeight: ".95",
    fontWeight: 900,
    marginBottom: "24px",
    letterSpacing: "-0.06em",
  },

  subtitle: {
    maxWidth: "860px",
    margin: "0 auto",
    color: "#d3d3d3",
    lineHeight: "1.8",
    fontSize: "22px",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "36px",
    padding: "18px 42px",
    borderRadius: "18px",
    background:
      "linear-gradient(180deg,#ffffff 0%,#d9d9e4 100%)",
    color: "#050505",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: "18px",
    boxShadow:
      "0 10px 40px rgba(255,255,255,.2)",
  },

  logoWrap: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "center",
  },

  logoImage: {
    objectFit: "contain",
  },

  bridgeSection: {
    maxWidth: "1500px",
    margin: "0 auto",
    paddingTop: "40px",
    textAlign: "center",
  },

  headingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "20px",
  },

  line: {
    width: "140px",
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, #2f8fff, transparent)",
  },

  sectionTag: {
    color: "#2f8fff",
    fontWeight: 800,
    letterSpacing: ".22em",
    fontSize: "12px",
  },

  bridgeTitle: {
    fontSize: "clamp(3rem,6vw,5rem)",
    fontWeight: 900,
    letterSpacing: "-0.05em",
    marginBottom: "24px",
  },

  bridgeText: {
    maxWidth: "980px",
    margin: "0 auto",
    color: "#d5d5d5",
    lineHeight: "1.7",
    fontSize: "24px",
  },

  bridgeWrap: {
    position: "relative",
    marginTop: "60px",
    height: "340px",
  },

  bridgeGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at center, rgba(29,143,255,.16), transparent 70%)",
    filter: "blur(40px)",
  },

  bridgeSvg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    inset: 0,
  },

  node: {
    position: "absolute",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    border: "3px solid",
    background: "#090909",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "42px",
    zIndex: 5,
  },

  centerOrb: {
    position: "absolute",
    left: "50%",
    top: "135px",
    transform: "translateX(-50%)",
    width: "220px",
    height: "220px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle at top, #111827 0%, #050505 80%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "0 0 70px rgba(29,143,255,.55)",
    zIndex: 10,
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(240px,1fr))",
    gap: "20px",
    marginTop: "20px",
    alignItems: "start",
  },

  infoCard: {
    textAlign: "center",
    padding: "10px",
  },

  infoCardCenter: {
    textAlign: "center",
    padding: "10px",
  },

  cardTitle: {
    fontSize: "28px",
    fontWeight: 900,
    marginBottom: "14px",
  },

  cardText: {
    color: "#d5d5d5",
    lineHeight: "1.7",
    fontSize: "18px",
  },

  centerText: {
    color: "#ffffff",
    fontSize: "22px",
    marginBottom: "6px",
  },

  centerBlue: {
    color: "#2f8fff",
    fontSize: "22px",
    fontWeight: 800,
  },

  bottomText: {
    marginTop: "60px",
    color: "#d0d0d0",
    lineHeight: "1.8",
    fontSize: "24px",
    textAlign: "center",
  },
};
