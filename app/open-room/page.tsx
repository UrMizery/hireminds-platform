"use client";

import { useState } from "react";

export default function OpenRoomPage() {
  const [doorOpen, setDoorOpen] = useState(false);

  return (
    <main className="page">
      <section className={`roomHero ${doorOpen ? "entered" : ""}`}>
        <div className="blob pink" />
        <div className="blob blue" />
        <div className="blob yellow" />

        <div className="heroText">
          <div className="liveBadge">🔴 LIVE COMMUNITY SPACE</div>

          <h1>OPEN ROOM</h1>

          <p className="sub">
            A colorful HireMinds™ hangout for live Q&A, career support,
            community shoutouts, quick updates, mini challenges, resource
            drops, job leads, networking, and random cool moments.
          </p>

          <div className="quickInfo">
            <span>📅 Last Tuesday monthly</span>
            <span>⏰ 6PM–7PM</span>
            <span>🚪 Opens 5:50PM</span>
            <span>🎉 Come curious. Leave sharper.</span>
          </div>
        </div>

        <button
          className={`doorButton ${doorOpen ? "open" : ""}`}
          onClick={() => setDoorOpen(true)}
          aria-label="Enter Open Room"
        >
          <span className="doorGlow" />
          <span className="doorPanel">
            <span className="doorKnob" />
            <span className="doorText">
              {doorOpen ? "ENTERING..." : "ENTER ROOM"}
            </span>
          </span>
        </button>

        {doorOpen && (
          <section className="insideRoom">
            <h2>You’re inside Open Room 🎉</h2>
            <p>
              Drop in for questions, wins, goals, updates, ideas, networking,
              support, job leads, partner highlights, mini challenges, and real
              HireMinds updates.
            </p>
          </section>
        )}

        <div className="miniCards">
          <div>🎤 Live Q&A</div>
          <div>💼 Job Leads</div>
          <div>🔥 Shoutouts</div>
          <div>🎯 Mini Challenges</div>
          <div>🤝 Networking</div>
          <div>📁 Resource Drops</div>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 40px;
          background:
            radial-gradient(circle at 10% 20%, rgba(255, 0, 214, 0.28), transparent 28%),
            radial-gradient(circle at 90% 15%, rgba(0, 229, 255, 0.24), transparent 30%),
            radial-gradient(circle at 60% 90%, rgba(255, 234, 0, 0.16), transparent 28%),
            linear-gradient(135deg, #090816, #14172b, #070811);
          color: white;
          overflow-x: hidden;
        }

        .roomHero {
          position: relative;
          overflow: hidden;
          min-height: calc(100vh - 80px);
          border-radius: 42px;
          padding: 54px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)),
            rgba(10, 12, 24, 0.88);
          box-shadow: 0 0 95px rgba(255, 0, 214, 0.18);
        }

        .blob {
          position: absolute;
          border-radius: 999px;
          filter: blur(70px);
          opacity: 0.35;
          pointer-events: none;
        }

        .blob.pink {
          width: 280px;
          height: 280px;
          background: #ff35d1;
          top: -80px;
          right: 20%;
        }

        .blob.blue {
          width: 260px;
          height: 260px;
          background: #31e7ff;
          bottom: 90px;
          right: -50px;
        }

        .blob.yellow {
          width: 220px;
          height: 220px;
          background: #fff048;
          bottom: -60px;
          left: 18%;
        }

        .heroText {
          position: relative;
          z-index: 2;
          max-width: 980px;
        }

        .liveBadge {
          display: inline-flex;
          padding: 10px 18px;
          border-radius: 999px;
          background: rgba(255, 0, 102, 0.16);
          border: 1px solid rgba(255, 0, 102, 0.45);
          font-weight: 950;
          letter-spacing: 0.08em;
        }

        h1 {
          font-size: clamp(4rem, 9vw, 9rem);
          line-height: 0.85;
          margin: 26px 0 20px;
          letter-spacing: -0.08em;
          text-shadow:
            0 0 24px rgba(255, 71, 223, 0.55),
            0 0 38px rgba(49, 231, 255, 0.35);
        }

        .sub {
          font-size: 1.25rem;
          line-height: 1.7;
          max-width: 900px;
          color: rgba(255, 255, 255, 0.82);
          font-weight: 700;
        }

        .quickInfo {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 26px;
        }

        .quickInfo span,
        .miniCards div {
          padding: 11px 15px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.09);
          border: 1px solid rgba(255, 255, 255, 0.13);
          font-weight: 900;
          backdrop-filter: blur(14px);
        }

        .doorButton {
          position: absolute;
          right: 90px;
          top: 190px;
          width: 190px;
          height: 285px;
          border: none;
          background: transparent;
          cursor: pointer;
          perspective: 900px;
          z-index: 4;
        }

        .doorGlow {
          position: absolute;
          inset: -28px;
          border-radius: 35px;
          background: linear-gradient(135deg, #ff47df, #38dfff, #fff048);
          filter: blur(35px);
          opacity: 0.55;
        }

        .doorPanel {
          position: absolute;
          inset: 0;
          border-radius: 22px 22px 8px 8px;
          background:
            linear-gradient(135deg, rgba(255, 71, 223, 0.95), rgba(56, 223, 255, 0.95)),
            #111;
          border: 3px solid rgba(255, 255, 255, 0.8);
          box-shadow:
            inset 0 0 30px rgba(255, 255, 255, 0.22),
            0 0 30px rgba(56, 223, 255, 0.5);
          transform-origin: left center;
          transition: transform 0.9s ease;
        }

        .doorButton.open .doorPanel {
          transform: rotateY(-72deg);
        }

        .doorKnob {
          position: absolute;
          right: 24px;
          top: 48%;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #fff048;
          box-shadow: 0 0 15px #fff048;
        }

        .doorText {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 34px;
          text-align: center;
          font-weight: 950;
          font-size: 0.95rem;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
        }

        .insideRoom {
          position: relative;
          z-index: 3;
          max-width: 680px;
          margin-top: 55px;
          padding: 24px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.09);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 0 45px rgba(56, 223, 255, 0.22);
        }

        .insideRoom h2 {
          margin: 0 0 10px;
          font-size: 2rem;
        }

        .insideRoom p {
          margin: 0;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.82);
          font-weight: 750;
        }

        .miniCards {
          position: relative;
          z-index: 2;
          display: flex;
          flex-wrap: wrap;
          gap: 13px;
          margin-top: 58px;
          max-width: 900px;
        }

        @media (max-width: 1050px) {
          .doorButton {
            position: relative;
            right: auto;
            top: auto;
            margin: 40px 0 0;
          }

          .roomHero {
            padding: 34px;
          }
        }
      `}</style>
    </main>
  );
}
