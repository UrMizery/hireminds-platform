"use client";

import Link from "next/link";
import { CSSProperties, useMemo, useState } from "react";

type Flyer = {
  id: number;
  title: string;
  tag: string;
  details: string;
  accent: string;
  glow: string;
  likes: number;
  saved: boolean;
  x: number;
  y: number;
};

export default function LiveBoardPage() {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [flyers, setFlyers] = useState<Flyer[]>([
    {
      id: 1,
      title: "Open Room",
      tag: "Monthly Q&A",
      details: "Last Tuesday • 6–7 PM • Room opens 5:50 PM",
      accent: "#ff2bd6",
      glow: "#ff2bd6",
      likes: 24,
      saved: false,
      x: 55,
      y: 60,
    },
    {
      id: 2,
      title: "Customer Service Demo",
      tag: "Training Preview",
      details: "Practice pathways, sharpen skills, and preview assessments.",
      accent: "#22d3ee",
      glow: "#22d3ee",
      likes: 16,
      saved: false,
      x: 355,
      y: 95,
    },
    {
      id: 3,
      title: "Hiring Event",
      tag: "Opportunity",
      details: "Multiple positions available. Come ready. Let’s talk.",
      accent: "#a3ff12",
      glow: "#a3ff12",
      likes: 31,
      saved: false,
      x: 660,
      y: 70,
    },
    {
      id: 4,
      title: "Partner Spotlight",
      tag: "Community",
      details: "Highlighting partners creating visibility and opportunity.",
      accent: "#facc15",
      glow: "#facc15",
      likes: 18,
      saved: false,
      x: 210,
      y: 390,
    },
    {
      id: 5,
      title: "Digital Literacy",
      tag: "Skill Builder",
      details: "Build online confidence, career readiness, and tool navigation.",
      accent: "#8b5cf6",
      glow: "#8b5cf6",
      likes: 12,
      saved: false,
      x: 520,
      y: 410,
    },
  ]);

  const savedFlyers = useMemo(
    () => flyers.filter((flyer) => flyer.saved),
    [flyers]
  );

  function startDrag(
    e: React.MouseEvent<HTMLDivElement>,
    id: number
  ) {
    const flyer = flyers.find((item) => item.id === id);
    if (!flyer) return;

    setDraggingId(id);
    setDragOffset({
      x: e.clientX - flyer.x,
      y: e.clientY - flyer.y,
    });
  }

  function dragFlyer(e: React.MouseEvent<HTMLDivElement>) {
    if (draggingId === null) return;

    setFlyers((prev) =>
      prev.map((flyer) =>
        flyer.id === draggingId
          ? {
              ...flyer,
              x: Math.max(10, Math.min(e.clientX - dragOffset.x, 850)),
              y: Math.max(10, Math.min(e.clientY - dragOffset.y, 560)),
            }
          : flyer
      )
    );
  }

  function stopDrag() {
    setDraggingId(null);
  }

  function likeFlyer(id: number) {
    setFlyers((prev) =>
      prev.map((flyer) =>
        flyer.id === id ? { ...flyer, likes: flyer.likes + 1 } : flyer
      )
    );
  }

  function saveFlyer(id: number) {
    setFlyers((prev) =>
      prev.map((flyer) =>
        flyer.id === id ? { ...flyer, saved: !flyer.saved } : flyer
      )
    );
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.kicker}>HireMinds™ Social Space</p>
        <h1 style={styles.title}>Live Bulletin Board</h1>
        <p style={styles.subtitle}>
          A vibrant space for mini flyers, updates, opportunities, reactions,
          saves, questions, and quick feedback.
        </p>

        <div style={styles.iconRow}>
          <button style={styles.iconButton}>💋 Comment</button>
          <button style={styles.iconButton}>⁉️ Question</button>
          <button style={styles.iconButton}>‼️ Feedback</button>
        </div>
      </section>

      <section
        style={styles.board}
        onMouseMove={dragFlyer}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <div style={styles.neonText}>Drag. Like. Save. Explore.</div>

        {flyers.map((flyer) => (
          <div
            key={flyer.id}
            onMouseDown={(e) => startDrag(e, flyer.id)}
            style={{
              ...styles.flyer,
              left: flyer.x,
              top: flyer.y,
              borderColor: flyer.accent,
              boxShadow: `0 0 22px ${flyer.glow}, 0 20px 50px rgba(0,0,0,.55)`,
              cursor: draggingId === flyer.id ? "grabbing" : "grab",
            }}
          >
            <div style={styles.pin} />

            <p style={{ ...styles.flyerTag, color: flyer.accent }}>
              {flyer.tag}
            </p>

            <h2 style={styles.flyerTitle}>{flyer.title}</h2>

            <p style={styles.flyerText}>{flyer.details}</p>

            <div
              style={styles.actionRow}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => likeFlyer(flyer.id)}
                style={styles.actionButton}
              >
                👍 {flyer.likes}
              </button>

              <button
                onClick={() => saveFlyer(flyer.id)}
                style={{
                  ...styles.actionButton,
                  background: flyer.saved
                    ? "rgba(250,204,21,.28)"
                    : "rgba(255,255,255,.12)",
                }}
              >
                {flyer.saved ? "Saved ★" : "Save ☆"}
              </button>
            </div>
          </div>
        ))}
      </section>

      <section style={styles.savedPanel}>
        <div>
          <p style={styles.savedKicker}>Saved Flyers</p>
          <h2 style={styles.savedTitle}>Keep what matters to you</h2>
        </div>

        <div style={styles.savedGrid}>
          {savedFlyers.length === 0 ? (
            <p style={styles.emptySaved}>
              Tap “Save” on a flyer and it will show here.
            </p>
          ) : (
            savedFlyers.map((flyer) => (
              <div key={flyer.id} style={styles.savedCard}>
                <strong>{flyer.title}</strong>
                <span>{flyer.tag}</span>
              </div>
            ))
          )}
        </div>
      </section>

      <Link href="/profile" style={styles.back}>
        ← Back to My Profile
      </Link>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 20% 10%, rgba(255,43,214,.24), transparent 25%), radial-gradient(circle at 80% 20%, rgba(34,211,238,.22), transparent 24%), linear-gradient(180deg,#050008,#0f1028 45%,#050505)",
    color: "white",
    padding: "42px 24px 60px",
    overflowX: "hidden",
  },

  hero: {
    maxWidth: "1150px",
    margin: "0 auto 26px",
  },

  kicker: {
    color: "#22d3ee",
    textTransform: "uppercase",
    letterSpacing: ".18em",
    fontWeight: 900,
    fontSize: "12px",
  },

  title: {
    margin: "0",
    fontSize: "58px",
    lineHeight: 1,
    letterSpacing: "-.04em",
    textShadow: "0 0 24px rgba(255,43,214,.75)",
  },

  subtitle: {
    color: "#e5e7eb",
    fontSize: "17px",
    lineHeight: 1.7,
    maxWidth: "760px",
  },

  iconRow: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    marginTop: "18px",
  },

  iconButton: {
    border: "1px solid rgba(255,255,255,.18)",
    background: "rgba(255,255,255,.08)",
    color: "white",
    borderRadius: "999px",
    padding: "12px 18px",
    fontWeight: 900,
    boxShadow: "0 0 18px rgba(255,43,214,.22)",
  },

  board: {
    position: "relative",
    maxWidth: "1150px",
    height: "720px",
    margin: "0 auto",
    borderRadius: "34px",
    border: "2px solid rgba(255,255,255,.16)",
    background:
      "radial-gradient(circle at 30% 30%, rgba(255,43,214,.2), transparent 28%), radial-gradient(circle at 70% 40%, rgba(34,211,238,.18), transparent 24%), linear-gradient(135deg,#171025,#101827,#1f1238)",
    boxShadow:
      "0 0 35px rgba(168,85,247,.45), inset 0 0 50px rgba(255,255,255,.04)",
    overflow: "hidden",
  },

  neonText: {
    position: "absolute",
    right: "34px",
    top: "28px",
    color: "#facc15",
    fontSize: "22px",
    fontWeight: 900,
    transform: "rotate(-4deg)",
    textShadow: "0 0 18px rgba(250,204,21,.9)",
  },

  flyer: {
    position: "absolute",
    width: "245px",
    minHeight: "220px",
    padding: "22px",
    borderRadius: "22px",
    border: "2px solid",
    background:
      "linear-gradient(145deg, rgba(15,23,42,.96), rgba(30,41,59,.88))",
    userSelect: "none",
  },

  pin: {
    position: "absolute",
    top: "-12px",
    left: "50%",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "#ff2bd6",
    boxShadow: "0 0 16px rgba(255,43,214,.9)",
  },

  flyerTag: {
    margin: "0 0 8px",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: ".16em",
    fontWeight: 900,
  },

  flyerTitle: {
    margin: "0 0 12px",
    fontSize: "28px",
    lineHeight: 1.05,
    textTransform: "uppercase",
  },

  flyerText: {
    margin: 0,
    color: "#e5e7eb",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  actionRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "20px",
  },

  actionButton: {
    border: "1px solid rgba(255,255,255,.2)",
    background: "rgba(255,255,255,.12)",
    color: "white",
    borderRadius: "999px",
    padding: "9px 13px",
    cursor: "pointer",
    fontWeight: 900,
  },

  savedPanel: {
    maxWidth: "1150px",
    margin: "24px auto 0",
    padding: "24px",
    borderRadius: "28px",
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.06)",
    display: "grid",
    gap: "16px",
  },

  savedKicker: {
    margin: 0,
    color: "#22d3ee",
    textTransform: "uppercase",
    letterSpacing: ".14em",
    fontSize: "12px",
    fontWeight: 900,
  },

  savedTitle: {
    margin: "6px 0 0",
  },

  savedGrid: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  emptySaved: {
    color: "#cbd5e1",
    margin: 0,
  },

  savedCard: {
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(0,0,0,.24)",
    borderRadius: "16px",
    padding: "14px 16px",
    display: "grid",
    gap: "4px",
    minWidth: "180px",
  },

  back: {
    display: "block",
    maxWidth: "1150px",
    margin: "28px auto 0",
    color: "#c084fc",
    textDecoration: "none",
    fontWeight: 900,
  },
};
