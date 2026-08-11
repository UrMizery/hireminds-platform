"use client";

import React from "react";

export default function CareerMediaLibraryPage() {
  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <p style={styles.kicker}>HIREMINDS™ CAREER MEDIA</p>

        <h1 style={styles.title}>Career Media Library</h1>

        <p style={styles.subtitle}>
          Helpful career content, resources, and media designed to support
          learning, preparation, professional growth, and your next move.
        </p>

        <div style={styles.comingSoonBox}>
          <span style={styles.badge}>COMING SOON</span>

          <h2 style={styles.boxTitle}>Something new is being built.</h2>

          <p style={styles.boxText}>
            The HireMinds Career Media Library is growing. New career-focused
            content and resources will be added here to help you learn,
            prepare, explore, and move forward with confidence.
          </p>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(0,122,255,.18), transparent 35%), linear-gradient(180deg,#050505,#101010)",
    color: "#ffffff",
    padding: "40px 28px 70px",
    fontFamily: "system-ui, Arial, sans-serif",
  },

  hero: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "80px 0",
  },

  kicker: {
    color: "#7db7ff",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    fontSize: 12,
    margin: "0 0 14px",
  },

  title: {
    fontSize: "clamp(44px, 7vw, 76px)",
    lineHeight: 1,
    fontWeight: 950,
    margin: "0 0 20px",
  },

  subtitle: {
    color: "rgba(255,255,255,.75)",
    lineHeight: 1.8,
    maxWidth: 780,
    fontSize: 18,
    margin: 0,
  },

  comingSoonBox: {
    marginTop: 50,
    maxWidth: 850,
    padding: "36px",
    borderRadius: 24,
    background: "rgba(255,255,255,.055)",
    border: "1px solid rgba(255,255,255,.11)",
  },

  badge: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(125,183,255,.12)",
    border: "1px solid rgba(125,183,255,.22)",
    color: "#9ecaff",
    fontWeight: 900,
    fontSize: 11,
    letterSpacing: 1.2,
  },

  boxTitle: {
    fontSize: "clamp(28px, 4vw, 40px)",
    fontWeight: 950,
    margin: "20px 0 12px",
  },

  boxText: {
    color: "rgba(255,255,255,.72)",
    fontSize: 17,
    lineHeight: 1.8,
    maxWidth: 720,
    margin: 0,
  },
};
