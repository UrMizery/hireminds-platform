"use client";

import { useLanguage } from "./lib/language-context";

export default function HomePage() {
  const { t } = useLanguage();
  const isRTL = false;

  return (
    <main style={styles.page}>
      <section
        style={{
          ...styles.hero,
          textAlign: isRTL ? "right" : "center",
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        <p style={styles.heroEyebrow}>
          Workforce Infrastructure Platform
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
      </section>

      <section style={styles.simpleSection}>
        <p style={styles.miniTag}>
          BUILT FOR MOVEMENT
        </p>

        <h2 style={styles.sectionHeading}>
          More than a resume tool.
        </h2>

        <p style={styles.simpleText}>
          HireMinds combines career visibility,
          readiness tools, guided support,
          and workforce connection into one modern experience.
        </p>

        <div style={styles.miniGrid}>
          <div style={styles.miniCard}>
            <h3 style={styles.cardTitle}>
              Visibility
            </h3>

            <p style={styles.cardText}>
              Career Passports, resumes,
              stronger branding, and better presentation.
            </p>
          </div>

          <div style={styles.miniCard}>
            <h3 style={styles.cardTitle}>
              Readiness
            </h3>

            <p style={styles.cardText}>
              Resume help, interview prep,
              study guides, and career support tools.
            </p>
          </div>

          <div style={styles.miniCard}>
            <h3 style={styles.cardTitle}>
              Opportunity
            </h3>

            <p style={styles.cardText}>
              Workforce connection,
              partner support,
              and employer visibility.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.toolsSection}>
        <p style={styles.miniTag}>
          EXPLORE HIREMINDS
        </p>

        <div style={styles.toolGrid}>
          <div style={styles.toolPill}>
            Career Passport
          </div>

          <div style={styles.toolPill}>
            Resume Builder
          </div>

          <div style={styles.toolPill}>
            Open Room
          </div>

          <div style={styles.toolPill}>
            Career Toolkit
          </div>

          <div style={styles.toolPill}>
            Interview Preparation
          </div>

          <div style={styles.toolPill}>
            Skill Building
          </div>

          <div style={styles.toolPill}>
            Partner Support
          </div>

          <div style={styles.toolPill}>
            Career Readiness
          </div>
        </div>
      </section>

      <section style={styles.bottomStatement}>
        Built for job seekers, workforce programs,
        nonprofits, partners, and employers.
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent 20%), linear-gradient(180deg, #040404 0%, #0b0b0d 100%)",
    color: "#f5f5f5",
    padding: "32px 24px 70px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  hero: {
    maxWidth: "1100px",
    margin: "0 auto",
    paddingTop: "20px",
  },

  heroEyebrow: {
    margin: "0 0 14px",
    color: "#8ea9ff",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
  },

  title: {
    margin: "0 0 18px",
    fontSize: "clamp(3rem, 7vw, 5.6rem)",
    lineHeight: 0.95,
    fontWeight: 700,
    letterSpacing: "-0.06em",
    color: "#f5f5f5",
  },

  subtitle: {
    maxWidth: "860px",
    margin: "0 auto",
    color: "#c7c7c7",
    fontSize: "18px",
    lineHeight: 1.9,
  },

  buttonRow: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    marginTop: "30px",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 34px",
    minHeight: "52px",
    borderRadius: "18px",
    textDecoration: "none",
    background: "linear-gradient(180deg,#ececef 0%,#c9c9cf 100%)",
    color: "#09090b",
    fontWeight: 900,
    fontSize: "15px",
    letterSpacing: "0.01em",
    boxShadow: "0 10px 24px rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.18)",
  },

  simpleSection: {
    padding: "100px 0 40px",
    maxWidth: "1100px",
    margin: "0 auto",
    textAlign: "center",
  },

  miniTag: {
    fontSize: "11px",
    letterSpacing: "0.2em",
    fontWeight: 900,
    color: "#8ea9ff",
    marginBottom: "14px",
  },

  sectionHeading: {
    fontSize: "48px",
    marginBottom: "18px",
    fontWeight: 700,
    letterSpacing: "-0.05em",
  },

  simpleText: {
    maxWidth: "760px",
    margin: "0 auto",
    lineHeight: 1.9,
    color: "#c4c4c4",
    fontSize: "17px",
  },

  miniGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: "20px",
    marginTop: "50px",
  },

  miniCard: {
    padding: "30px",
    borderRadius: "22px",
    background: "linear-gradient(180deg,#121214 0%,#17181b 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  cardTitle: {
    fontSize: "24px",
    marginBottom: "12px",
    fontWeight: 700,
  },

  cardText: {
    color: "#c7c7c7",
    lineHeight: 1.8,
    fontSize: "15px",
  },

  toolsSection: {
    padding: "40px 0 90px",
    maxWidth: "1100px",
    margin: "0 auto",
    textAlign: "center",
  },

  toolGrid: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "14px",
    marginTop: "30px",
  },

  toolPill: {
    padding: "14px 22px",
    borderRadius: "999px",
    background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.08)",
    fontWeight: 800,
    fontSize: "14px",
  },

  bottomStatement: {
    paddingTop: "20px",
    textAlign: "center",
    color: "#8f8f95",
    fontSize: "15px",
    lineHeight: 1.9,
    maxWidth: "760px",
    margin: "0 auto",
  },
};
