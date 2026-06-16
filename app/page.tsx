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

        {/* FLOATING LOGO */}
        <div style={styles.heroLogoWrap}>
          <Image
            src="/hm-logo.png"
            alt="HireMinds"
            width={380}
            height={380}
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

        {/* BRIDGE SECTION */}
        <div style={styles.bridgeWrap}>

          {/* FULL SUSPENSION BRIDGE */}
          <svg
            viewBox="0 0 1600 600"
            preserveAspectRatio="none"
            style={styles.bridgeSvg}
          >

            {/* LEFT TOWER */}
            <line
              x1="180"
              y1="170"
              x2="180"
              y2="420"
              stroke="rgba(80,180,255,.95)"
              strokeWidth="4"
            />

            {/* RIGHT TOWER */}
            <line
              x1="1420"
              y1="170"
              x2="1420"
              y2="420"
              stroke="rgba(80,180,255,.95)"
              strokeWidth="4"
            />

            {/* MAIN TOP CABLE */}
            <path
              d="
                M 180 170
                Q 800 20 1420 170
              "
              fill="none"
              stroke="rgba(80,180,255,.95)"
              strokeWidth="4"
            />

            {/* ROADWAY */}
            <path
              d="
                M 180 420
                Q 800 500 1420 420
              "
              fill="none"
              stroke="rgba(80,180,255,.95)"
              strokeWidth="5"
            />

            {/* SUSPENSION CABLES */}
            <line x1="300" y1="125" x2="300" y2="438" stroke="rgba(120,200,255,.55)" strokeWidth="1.5" />
            <line x1="420" y1="95" x2="420" y2="455" stroke="rgba(120,200,255,.55)" strokeWidth="1.5" />
            <line x1="540" y1="70" x2="540" y2="470" stroke="rgba(120,200,255,.55)" strokeWidth="1.5" />
            <line x1="660" y1="48" x2="660" y2="482" stroke="rgba(120,200,255,.55)" strokeWidth="1.5" />
            <line x1="780" y1="30" x2="780" y2="492" stroke="rgba(120,200,255,.55)" strokeWidth="1.5" />
            <line x1="900" y1="35" x2="900" y2="492" stroke="rgba(120,200,255,.55)" strokeWidth="1.5" />
            <line x1="1020" y1="52" x2="1020" y2="482" stroke="rgba(120,200,255,.55)" strokeWidth="1.5" />
            <line x1="1140" y1="75" x2="1140" y2="470" stroke="rgba(120,200,255,.55)" strokeWidth="1.5" />
            <line x1="1260" y1="105" x2="1260" y2="452" stroke="rgba(120,200,255,.55)" strokeWidth="1.5" />

            {/* GLOW LINE */}
            <path
              d="
                M 180 420
                Q 800 500 1420 420
              "
              fill="none"
              stroke="rgba(0,150,255,.45)"
              strokeWidth="16"
            />
          </svg>

          {/* PARTICIPANTS */}
          <div
            style={{
              ...styles.node,
              left: "6%",
              top: "245px",
              borderColor: "#1d8fff",
              boxShadow:
                "0 0 35px rgba(29,143,255,.95)",
            }}
          >
            <span style={styles.outlineEmoji}>◯</span>

            <span style={styles.iconInside}>
              👤
            </span>
          </div>

          {/* JUSTICE */}
          <div
            style={{
              ...styles.node,
              left: "28%",
              top: "210px",
              borderColor: "#53ff7c",
              boxShadow:
                "0 0 35px rgba(83,255,124,.95)",
            }}
          >
            <span style={styles.outlineEmoji}>◯</span>

            <span style={styles.iconInside}>
              🤝
            </span>
          </div>

          {/* CENTER HM */}
          <div style={styles.centerOrb}>
            <Image
              src="/hm-logo.png"
              alt="HireMinds"
              width={240}
              height={240}
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
              top: "210px",
              borderColor: "#d45eff",
              boxShadow:
                "0 0 35px rgba(212,94,255,.95)",
            }}
          >
            <span style={styles.outlineEmoji}>◯</span>

            <span style={styles.iconInside}>
              ♡
            </span>
          </div>

          {/* EMPLOYERS */}
          <div
            style={{
              ...styles.node,
              right: "6%",
              top: "245px",
              borderColor: "#18d8ff",
              boxShadow:
                "0 0 35px rgba(24,216,255,.95)",
            }}
          >
            <span style={styles.outlineEmoji}>◯</span>

            <span style={styles.iconInside}>
              💼
            </span>
          </div>
        </div>

        {/* INFO */}
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
    marginTop: "35px",
    display: "flex",
    justifyContent: "center",
  },

  heroLogo: {
    objectFit: "contain",
    filter:
      "drop-shadow(0 0 45px rgba(38,114,255,.65))",
  },

  bridgeSection: {
    maxWidth: "1650px",
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

  bridgeWrap: {
    position: "relative",
    width: "100%",
    height: "640px",
    marginTop: "40px",
  },

  bridgeSvg: {
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
    filter:
      "drop-shadow(0 0 25px rgba(0,140,255,.5))",
  },

  node: {
    position: "absolute",
    width: "130px",
    height: "130px",
    borderRadius: "50%",
    border: "3px solid",
    background:
      "radial-gradient(circle at top,#0a0a0a 0%,#000000 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },

  outlineEmoji: {
    position: "absolute",
    fontSize: "110px",
    opacity: 0.15,
  },

  iconInside: {
    fontSize: "52px",
    zIndex: 2,
  },

  centerOrb: {
    position: "absolute",
    left: "50%",
    top: "250px",
    transform: "translateX(-50%)",
    width: "260px",
    height: "260px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
    filter:
      "drop-shadow(0 0 65px rgba(43,120,255,.9))",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(240px,1fr))",
    gap: "26px",
    marginTop: "-70px",
    alignItems: "start",
  },

  card: {
    textAlign: "center",
  },

  cardTitle: {
    fontSize: "30px",
    fontWeight: 900,
    marginBottom: "14px",
    lineHeight: 1.1,
  },

  cardText: {
    color: "#dddddd",
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
    marginTop: "40px",
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
