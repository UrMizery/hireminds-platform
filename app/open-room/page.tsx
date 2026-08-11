"use client";

import Link from "next/link";

export default function OpenRoomPage() {
  return (
    <main className="page">
      <section className="left">
        <p className="eyebrow">LIVE CAREER CONNECTIONS</p>

        <h1>OPEN THE DOOR</h1>

        <p className="description">
          Step into a space designed to help you connect, prepare,
          ask questions, access support, and move forward in your career.
        </p>

        <div className="note">
          <strong>One door. More ways to connect.</strong>
          <br />
          Meet with HireMinds for live career support, scheduled sessions,
          conversations, resources, and opportunities.
        </div>

        <div className="behindDoor">
          <p className="behindLabel">WHAT&apos;S BEHIND THE DOOR?</p>

          <h2>Career Connect</h2>

          <p>
            Your live connection point for career support and scheduled
            meetings. Check in for the service you need or request a meeting
            once you&apos;re inside.
          </p>

          <div className="serviceList">
            <span>📄 Resume Support</span>
            <span>💬 1:1 Career Coaching</span>
            <span>🎤 Mock Interviews</span>
            <span>💼 Job Search Assistance</span>
            <span>🤝 Live Connections</span>
            <span>✨ Scheduled Meetings</span>
          </div>

          <p className="requestNote">
            Need support? Step inside and request a meeting that fits your
            career needs.
          </p>
        </div>
      </section>

      <section className="center">
        <Link href="/open-room/live" className="doorLink">
          <div className="doorGlow" />

          <div className="door">
            <div className="brand">HireMinds</div>

            <div className="sub">
              CAREER CONNECT
            </div>

            <div className="doorHint">
              Step In
            </div>

            <div className="knob" />
          </div>
        </Link>
      </section>

      <section className="right">
        <div className="arrow">
          ←
        </div>

        <div className="enterText">
          OPEN THE DOOR

          <div className="small">
            Your next conversation, connection, resource, or opportunity
            could be on the other side.
          </div>

          <div className="insideTag">
            STEP IN • CONNECT • MOVE FORWARD
          </div>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 420px 1fr;
          align-items: center;
          gap: 60px;
          padding: 60px;

          background:
            radial-gradient(
              circle at center,
              rgba(0, 122, 255, 0.08),
              transparent 28%
            ),
            linear-gradient(
              180deg,
              #050505,
              #0b0c10,
              #121317
            );

          color: white;
          overflow: hidden;
        }

        .left {
          max-width: 560px;
        }

        .eyebrow {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.15em;
          color: #93bfff;
        }

        h1 {
          font-size: clamp(4rem, 8vw, 7rem);
          margin: 14px 0;
          line-height: 0.9;
          font-weight: 950;
        }

        .description {
          line-height: 1.8;
          opacity: 0.82;
          font-size: 1.05rem;
        }

        .note {
          margin-top: 22px;
          padding: 18px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          line-height: 1.6;
          font-weight: 700;
        }

        .behindDoor {
          margin-top: 20px;
          padding: 20px;

          border-radius: 16px;

          background:
            linear-gradient(
              135deg,
              rgba(0, 122, 255, 0.08),
              rgba(139, 220, 255, 0.025)
            ),
            rgba(255, 255, 255, 0.035);

          border: 1px solid rgba(139, 220, 255, 0.13);
        }

        .behindLabel {
          margin: 0 0 8px;
          color: #8bdcff;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.16em;
        }

        .behindDoor h2 {
          margin: 0 0 8px;
          font-size: 24px;
        }

        .behindDoor > p:not(.behindLabel) {
          margin: 0;
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.65;
          font-size: 13px;
        }

        .serviceList {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
          margin-top: 16px;
        }

        .serviceList span {
          padding: 10px 11px;
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07);
          color: rgba(255, 255, 255, 0.86);
          font-size: 11px;
          font-weight: 750;
        }

        .requestNote {
          margin-top: 15px !important;
          padding-top: 13px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          color: #b7d8ff !important;
          font-size: 12px !important;
          font-weight: 700;
        }

        .center {
          display: flex;
          justify-content: center;
        }

        .doorLink {
          position: relative;
          text-decoration: none;
        }

        .doorGlow {
          position: absolute;
          inset: -70px;
          background: rgba(0, 122, 255, 0.16);
          filter: blur(90px);
        }

        .door {
          width: 320px;
          height: 450px;

          border-radius: 10px;

          background:
            linear-gradient(
              180deg,
              #101827,
              #071018
            );

          border:
            2px solid rgba(
              122,
              214,
              255,
              0.55
            );

          box-shadow:
            0 0 25px rgba(0, 122, 255, 0.4);

          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;

          position: relative;

          transition: 0.3s;
        }

        .door:hover {
          transform: translateY(-8px);

          box-shadow:
            0 0 45px rgba(0, 122, 255, 0.6);
        }

        .brand {
          font-size: 42px;
          font-weight: 950;
          margin-bottom: 16px;
        }

        .sub {
          letter-spacing: 0.2em;
          font-size: 16px;
          color: #8bdcff;
          font-weight: 900;
        }

        .doorHint {
          margin-top: 18px;
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(139, 220, 255, 0.08);
          border: 1px solid rgba(139, 220, 255, 0.16);
          color: rgba(255, 255, 255, 0.72);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .knob {
          position: absolute;
          right: 30px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffd65f;
        }

        .right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .arrow {
          font-size: 90px;
          color: #82cfff;
        }

        .enterText {
          font-size: 1.7rem;
          font-weight: 950;
          line-height: 1.3;
          max-width: 350px;
        }

        .small {
          margin-top: 14px;
          font-size: 1rem;
          line-height: 1.7;
          font-weight: 700;
          opacity: 0.75;
        }

        .insideTag {
          display: inline-block;
          margin-top: 16px;
          padding: 9px 12px;
          border-radius: 999px;
          background: rgba(130, 207, 255, 0.08);
          border: 1px solid rgba(130, 207, 255, 0.17);
          color: #9fd7ff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        @media (max-width: 1000px) {
          .page {
            grid-template-columns: 1fr;
            text-align: center;
            overflow: auto;
          }

          .left {
            max-width: none;
          }

          .right {
            justify-content: center;
            flex-direction: column;
          }

          .arrow {
            transform: rotate(90deg);
          }

          .serviceList {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
