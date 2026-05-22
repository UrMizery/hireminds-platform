"use client";

import Link from "next/link";
import { CSSProperties, useEffect, useState } from "react";

const MEETING_LINK = "https://hire-minds.whereby.com/hireminds-open-room";

function getLastTuesday(year: number, month: number) {
  const lastDay = new Date(year, month + 1, 0);
  const day = lastDay.getDay();
  const diff = (day - 2 + 7) % 7;
  lastDay.setDate(lastDay.getDate() - diff);
  return lastDay;
}

function getNextOpenRoomDate() {
  const now = new Date();
  let openRoomDate = getLastTuesday(now.getFullYear(), now.getMonth());

  const closeTime = new Date(openRoomDate);
  closeTime.setHours(18, 15, 0, 0);

  if (now > closeTime) {
    openRoomDate = getLastTuesday(now.getFullYear(), now.getMonth() + 1);
  }

  return openRoomDate;
}

function formatCountdown(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return "Now";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return `${days} days • ${hours} hrs • ${minutes} min`;
}

export default function OpenRoomPage() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const openRoomDate = getNextOpenRoomDate();

  const roomOpens = new Date(openRoomDate);
  roomOpens.setHours(17, 50, 0, 0);

  const sessionStarts = new Date(openRoomDate);
  sessionStarts.setHours(18, 0, 0, 0);

  const doorsClose = new Date(openRoomDate);
  doorsClose.setHours(18, 15, 0, 0);

  const sessionEnds = new Date(openRoomDate);
  sessionEnds.setHours(19, 0, 0, 0);

  const canJoin = now >= roomOpens && now <= doorsClose;
  const beforeOpen = now < roomOpens;
  const afterClose = now > doorsClose && now < sessionEnds;
  const afterSession = now >= sessionEnds;

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <p style={styles.kicker}>HireMinds™</p>

        <h1 style={styles.title}>Open Room</h1>

        <p style={styles.text}>
          HireMinds™ Open Room is a monthly live discussion space where users can
          learn more about HireMinds features, ask questions, hear updates, and
          connect with the community in a relaxed setting.
        </p>

        <p style={styles.summary}>
          This is not a workshop and no registration is required. Simply log in
          to HireMinds and join the conversation. Topics may include platform
          updates, Career Passport questions, tool guidance, partner updates,
          and general Q&A.
        </p>

        <div style={styles.infoBox}>
          <p><strong>When:</strong> Last Tuesday of every month</p>
          <p><strong>Time:</strong> 6:00 PM – 7:00 PM EST</p>
          <p><strong>Room Opens:</strong> 5:50 PM EST</p>
          <p><strong>Doors Close:</strong> 6:15 PM EST</p>
        </div>

        <div style={styles.statusBox}>
          {beforeOpen && (
            <>
              <h3 style={styles.statusTitle}>Next Open Room starts in:</h3>
              <p style={styles.countdown}>{formatCountdown(roomOpens)}</p>
              <p style={styles.statusText}>
                The Join button will open at 5:50 PM EST.
              </p>
            </>
          )}

          {canJoin && (
            <>
              <h3 style={styles.statusTitle}>The room is open.</h3>
              <p style={styles.statusText}>
                You may join now. Doors close at 6:15 PM EST.
              </p>
            </>
          )}

          {afterClose && (
            <>
              <h3 style={styles.statusTitle}>Doors are now closed.</h3>
              <p style={styles.statusText}>
                The Open Room is currently in session. Join us next month.
              </p>
            </>
          )}

          {afterSession && (
            <>
              <h3 style={styles.statusTitle}>This month’s Open Room has ended.</h3>
              <p style={styles.statusText}>
                Join us again on the last Tuesday of next month.
              </p>
            </>
          )}
        </div>

        <div style={styles.buttonRow}>
          {canJoin ? (
            <a
              href={MEETING_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.button}
            >
              Join Open Room
            </a>
          ) : (
            <button style={styles.disabledButton} disabled>
              Join Open Room
            </button>
          )}

          <Link href="/profile" style={styles.backButton}>
            Back to My Profile
          </Link>
        </div>

        <p style={styles.note}>
          Entry closes 15 minutes after start time to help keep the conversation
          focused and flowing.
        </p>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#030712,#111827,#1e1b4b)",
    color: "white",
    padding: "50px 24px",
  },

  card: {
    maxWidth: "900px",
    margin: "0 auto",
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: "30px",
    padding: "36px",
  },

  kicker: {
    color: "#93c5fd",
    textTransform: "uppercase",
    letterSpacing: ".18em",
    fontWeight: 800,
  },

  title: {
    fontSize: "48px",
    margin: "0 0 14px",
  },

  text: {
    color: "#e5e7eb",
    fontSize: "18px",
    lineHeight: 1.7,
    maxWidth: "820px",
  },

  summary: {
    marginTop: "16px",
    color: "#cbd5e1",
    lineHeight: 1.8,
    fontSize: "15px",
    maxWidth: "850px",
  },

  infoBox: {
    marginTop: "26px",
    padding: "24px",
    borderRadius: "20px",
    background: "rgba(255,255,255,.08)",
    color: "#e5e7eb",
    lineHeight: 1.8,
  },

  statusBox: {
    marginTop: "22px",
    padding: "22px",
    borderRadius: "20px",
    background: "rgba(37,99,235,.16)",
    border: "1px solid rgba(147,197,253,.22)",
  },

  statusTitle: {
    margin: "0 0 8px",
    fontSize: "20px",
  },

  countdown: {
    margin: "0 0 8px",
    fontSize: "28px",
    fontWeight: 900,
    color: "#93c5fd",
  },

  statusText: {
    margin: 0,
    color: "#dbeafe",
    lineHeight: 1.6,
  },

  buttonRow: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    flexWrap: "wrap",
    marginTop: "28px",
  },

  button: {
    display: "inline-block",
    padding: "15px 24px",
    borderRadius: "999px",
    background: "#2563eb",
    color: "white",
    textDecoration: "none",
    fontWeight: 800,
  },

  disabledButton: {
    padding: "15px 24px",
    borderRadius: "999px",
    background: "rgba(255,255,255,.14)",
    color: "#9ca3af",
    border: "1px solid rgba(255,255,255,.18)",
    fontWeight: 800,
    cursor: "not-allowed",
  },

  backButton: {
    color: "#93c5fd",
    textDecoration: "none",
    fontWeight: 700,
  },

  note: {
    color: "#cbd5e1",
    marginTop: "18px",
    lineHeight: 1.6,
  },
};
