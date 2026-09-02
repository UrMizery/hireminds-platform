"use client";

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <div className="wave waveLeft" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} style={{ ["--i" as string]: i }} />
          ))}
        </div>

        <div className="wave waveRight" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} style={{ ["--i" as string]: i }} />
          ))}
        </div>

        <div className="heroContent">
          <p className="eyebrow">WORKFORCE INFRASTRUCTURE PLATFORM</p>

          <div className="eyebrowLine" />

          <h1>
            Infrastructure that
            <br />
            powers your <span>career.</span>
          </h1>

          <p className="heroCopy">
            All the tools you need to build, market, and manage
            <br className="desktopOnly" />
            your career — all in one intelligent platform.
          </p>

          <a href="/sign-up" className="cta">
            Create Career Passport
          </a>
        </div>

        <svg
          className="smileCurve"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 20 Q720 112 1440 20 L1440 120 L0 120 Z" />
        </svg>
      </section>

      <section className="platformSection">
        <div className="platformIntro">
          <p>The all-in-one platform to</p>
          <h2>build. stand out. advance.</h2>
          <div className="platformLine" />
        </div>

        <div className="featureRow">
          <div className="featureItem">
            <div className="featureIcon">
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <rect x="11" y="7" width="24" height="31" rx="2" />
                <path d="M16 15h13" />
                <path d="M16 21h10" />
                <path d="M16 27h8" />
                <path d="M29 35l8-8 4 4-8 8-6 2z" />
              </svg>
            </div>
            <p>
              Create
              <br />
              Standout Materials
            </p>
          </div>

          <div className="divider" />

          <div className="featureItem">
            <div className="featureIcon">
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <circle cx="22" cy="24" r="15" />
                <circle cx="22" cy="24" r="9" />
                <circle cx="22" cy="24" r="3" />
                <path d="M26 20l11-11" />
                <path d="M32 9h6v6" />
              </svg>
            </div>
            <p>
              Match Your Skills
              <br />
              to the Right Roles
            </p>
          </div>

          <div className="divider" />

          <div className="featureItem">
            <div className="featureIcon">
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <rect x="8" y="15" width="32" height="23" rx="2" />
                <path d="M17 15v-5h14v5" />
                <path d="M8 24h32" />
                <rect x="21" y="22" width="6" height="5" rx="1" />
              </svg>
            </div>
            <p>
              Track Your Search
              <br />
              and Applications
            </p>
          </div>

          <div className="divider" />

          <div className="featureItem">
            <div className="featureIcon">
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <rect x="8" y="27" width="7" height="11" rx="1" />
                <rect x="20" y="19" width="7" height="19" rx="1" />
                <rect x="32" y="9" width="7" height="29" rx="1" />
              </svg>
            </div>
            <p>
              Make Smarter
              <br />
              Career Moves
            </p>
          </div>

          <div className="divider" />

          <div className="featureItem">
            <div className="featureIcon">
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <circle cx="24" cy="16" r="7" />
                <path d="M12 38c1-8 6-12 12-12s11 4 12 12" />
                <path d="M34 11l3 3 5-6" />
              </svg>
            </div>
            <p>
              Build a Stronger
              <br />
              Career Profile
            </p>
          </div>
        </div>

        <p className="closingLine">
          ONE ACCOUNT. EVERY TOOL. REAL RESULTS.
        </p>
      </section>

      <style jsx>{`
        .page {
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background: #f7f9fc;
          font-family: Arial, Helvetica, sans-serif;
        }

        .hero {
          position: relative;
          min-height: 500px;
          padding: 48px 24px 96px;

          display: flex;
          justify-content: center;
          align-items: flex-start;

          overflow: hidden;
          color: #ffffff;

          background:
            radial-gradient(
              circle at 8% 18%,
              rgba(22, 119, 255, 0.24),
              transparent 31%
            ),
            radial-gradient(
              circle at 91% 38%,
              rgba(22, 119, 255, 0.16),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #061525 0%,
              #020914 46%,
              #07182b 100%
            );
        }

        .heroContent {
          position: relative;
          z-index: 4;

          width: 100%;
          max-width: 980px;

          text-align: center;
        }

        .eyebrow {
          margin: 0;

          color: #1677ff;

          font-size: 12px;
          font-weight: 800;

          letter-spacing: 0.25em;
        }

        .eyebrowLine {
          width: 62px;
          height: 2px;

          margin: 18px auto 24px;

          background: #1677ff;
        }

        h1 {
          margin: 0;

          font-family: Georgia, "Times New Roman", serif;

          font-size: clamp(48px, 4.8vw, 72px);

          line-height: 1.04;

          font-weight: 400;

          letter-spacing: -0.035em;

          color: #f7f7f5;
        }

        h1 span {
          color: #1677ff;
        }

        .heroCopy {
          margin: 24px auto 0;

          color: #eef2f7;

          font-size: 17px;

          line-height: 1.65;

          font-weight: 400;
        }

        .cta {
          display: inline-flex;

          justify-content: center;
          align-items: center;

          min-width: 340px;

          margin-top: 28px;

          padding: 16px 30px;

          border-radius: 7px;

          color: #ffffff;

          text-decoration: none;

          font-size: 17px;
          font-weight: 700;

          background: #1677ff;

          box-shadow:
            0 10px 28px
            rgba(22, 119, 255, 0.2);

          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .cta:hover {
          transform: translateY(-2px);

          box-shadow:
            0 15px 34px
            rgba(22, 119, 255, 0.3);
        }

        .wave {
          position: absolute;

          z-index: 1;

          width: 45%;
          height: 230px;

          pointer-events: none;

          opacity: 0.72;
        }

        .waveLeft {
          left: -7%;
          bottom: 58px;
        }

        .waveRight {
          right: -7%;
          bottom: 58px;

          transform: scaleX(-1);
        }

        .wave span {
          --i: 0;

          position: absolute;

          left: 0;

          top: calc(30px + var(--i) * 14px);

          width: 112%;
          height: 1px;

          transform:
            rotate(
              calc(-9deg + var(--i) * 2.1deg)
            );

          transform-origin: left center;

          background:
            linear-gradient(
              90deg,
              transparent 0%,
              rgba(22, 119, 255, 0.14) 18%,
              rgba(22, 119, 255, 0.7) 60%,
              rgba(22, 119, 255, 0.1) 100%
            );

          box-shadow:
            0 0 4px
            rgba(22, 119, 255, 0.2);
        }

        .smileCurve {
          position: absolute;

          left: 0;
          bottom: -1px;

          z-index: 3;

          width: 100%;
          height: 82px;

          display: block;
        }

        .smileCurve path {
          fill: #f7f9fc;
        }

        .platformSection {
          margin-top: -1px;

          padding: 10px 32px 38px;

          background:
            radial-gradient(
              circle at 92% 72%,
              rgba(22, 119, 255, 0.06),
              transparent 28%
            ),
            linear-gradient(
              180deg,
              #f7f9fc 0%,
              #eef4fb 100%
            );

          text-align: center;

          color: #081224;
        }

        .platformIntro {
          margin-top: 0;
        }

        .platformIntro p {
          margin: 0;

          font-size: clamp(24px, 2vw, 32px);

          font-weight: 400;

          line-height: 1.1;

          letter-spacing: -0.025em;
        }

        .platformIntro h2 {
          margin: 2px 0 0;

          font-size: clamp(27px, 2.2vw, 35px);

          line-height: 1.1;

          font-weight: 700;

          letter-spacing: -0.03em;

          color: #1677ff;
        }

        .platformLine {
          width: 62px;
          height: 2px;

          margin: 17px auto 18px;

          background: #1677ff;
        }

        .featureRow {
          width: 100%;
          max-width: 1050px;

          margin: 0 auto;

          display: grid;

          grid-template-columns:
            1fr 1px
            1fr 1px
            1fr 1px
            1fr 1px
            1fr;

          align-items: stretch;
        }

        .featureItem {
          display: flex;

          flex-direction: column;

          align-items: center;
          justify-content: flex-start;

          padding: 0 18px;
        }

        .featureIcon {
          width: 44px;
          height: 44px;

          display: flex;

          align-items: center;
          justify-content: center;

          color: #1677ff;
        }

        .featureIcon svg {
          width: 40px;
          height: 40px;

          fill: none;

          stroke: currentColor;

          stroke-width: 2;

          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .featureItem p {
          margin: 8px 0 0;

          color: #0b1422;

          font-size: 13px;

          line-height: 1.4;

          font-weight: 700;
        }

        .divider {
          width: 1px;

          margin: 1px 0;

          background: #cbd4df;
        }

        .closingLine {
          margin: 21px 0 0;

          color: #1677ff;

          font-size: 11px;

          font-weight: 800;

          letter-spacing: 0.27em;
        }

        @media (max-width: 900px) {
          .hero {
            min-height: 500px;

            padding:
              44px 20px
              90px;
          }

          h1 {
            font-size:
              clamp(
                42px,
                9vw,
                60px
              );
          }

          .heroCopy {
            font-size: 15px;
          }

          .desktopOnly {
            display: none;
          }

          .cta {
            width: 100%;
            max-width: 340px;

            min-width: 0;

            font-size: 16px;
          }

          .wave {
            width: 72%;

            opacity: 0.55;
          }

          .waveLeft {
            left: -35%;
          }

          .waveRight {
            right: -35%;
          }

          .platformSection {
            padding-top: 4px;
          }

          .featureRow {
            grid-template-columns:
              repeat(2, 1fr);

            gap: 24px 10px;
          }

          .divider {
            display: none;
          }

          .featureItem:last-child {
            grid-column: 1 / -1;
          }

          .closingLine {
            line-height: 1.8;
          }
        }

        @media (max-width: 520px) {
          .hero {
            min-height: 480px;

            padding-top: 40px;
          }

          .eyebrow {
            font-size: 9px;
          }

          h1 {
            font-size: 41px;
          }

          .platformSection {
            padding-left: 18px;
            padding-right: 18px;
          }

          .featureRow {
            grid-template-columns: 1fr;
          }

          .featureItem:last-child {
            grid-column: auto;
          }
        }
      `}</style>
    </main>
  );
}
