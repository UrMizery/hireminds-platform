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
          <path d="M0 22 Q720 112 1440 22 L1440 120 L0 120 Z" />
        </svg>
      </section>

      <section className="platformSection">
        <div className="platformIntro">
          <p>The all-in-one platform to</p>
          <h2>build. stand out. land.</h2>
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
                <path d="M24 5l15 6v11c0 9-6 16-15 21C15 38 9 31 9 22V11z" />
                <path d="M17 24l5 5 10-11" />
              </svg>
            </div>
            <p>
              Your Data.
              <br />
              Your Control.
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
          min-height: 520px;
          padding: 54px 24px 105px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          overflow: hidden;
          color: #ffffff;

          background:
            radial-gradient(
              circle at 8% 18%,
              rgba(19, 93, 190, 0.38),
              transparent 31%
            ),
            radial-gradient(
              circle at 91% 38%,
              rgba(10, 78, 168, 0.22),
              transparent 28%
            ),
            linear-gradient(
              135deg,
              #061629 0%,
              #020914 46%,
              #07192d 100%
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
          color: #1495ff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.25em;
        }

        .eyebrowLine {
          width: 64px;
          height: 2px;
          margin: 20px auto 25px;
          background: #1595ff;
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
          color: #0a7cff;
        }

        .heroCopy {
          margin: 26px auto 0;
          color: #eef2f7;
          font-size: 17px;
          line-height: 1.65;
          font-weight: 400;
        }

        .cta {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          min-width: 345px;
          margin-top: 30px;
          padding: 17px 32px;
          border-radius: 7px;
          color: #ffffff;
          text-decoration: none;
          font-size: 17px;
          font-weight: 700;
          background: linear-gradient(135deg, #1c7cf0, #0049ff);
          box-shadow: 0 12px 30px rgba(0, 76, 255, 0.2);
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 34px rgba(0, 88, 255, 0.28);
        }

        .wave {
          position: absolute;
          z-index: 1;
          width: 46%;
          height: 250px;
          pointer-events: none;
          opacity: 0.8;
        }

        .waveLeft {
          left: -7%;
          bottom: 55px;
        }

        .waveRight {
          right: -7%;
          bottom: 55px;
          transform: scaleX(-1);
        }

        .wave span {
          --i: 0;
          position: absolute;
          left: 0;
          top: calc(35px + var(--i) * 15px);
          width: 112%;
          height: 1px;
          transform: rotate(calc(-10deg + var(--i) * 2.2deg));
          transform-origin: left center;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(14, 106, 240, 0.2) 18%,
            rgba(15, 143, 255, 0.9) 60%,
            rgba(0, 92, 225, 0.12) 100%
          );
          box-shadow: 0 0 4px rgba(0, 126, 255, 0.22);
        }

        .smileCurve {
          position: absolute;
          left: 0;
          bottom: -1px;
          z-index: 3;
          width: 100%;
          height: 86px;
          display: block;
        }

        .smileCurve path {
          fill: #f7f9fc;
        }

        .platformSection {
          padding: 28px 32px 44px;
          background:
            radial-gradient(
              circle at 92% 75%,
              rgba(43, 117, 255, 0.08),
              transparent 28%
            ),
            linear-gradient(180deg, #f7f9fc 0%, #eef4fb 100%);
          text-align: center;
          color: #081224;
        }

        .platformIntro p {
          margin: 0;
          font-size: clamp(25px, 2vw, 34px);
          font-weight: 400;
          line-height: 1.1;
          letter-spacing: -0.025em;
        }

        .platformIntro h2 {
          margin: 2px 0 0;
          font-size: clamp(27px, 2.2vw, 36px);
          line-height: 1.1;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #165bd9;
        }

        .platformLine {
          width: 62px;
          height: 2px;
          margin: 18px auto 20px;
          background: #156de5;
        }

        .featureRow {
          width: 100%;
          max-width: 1050px;
          margin: 0 auto;
          display: grid;
          grid-template-columns:
            1fr 1px 1fr 1px 1fr 1px 1fr 1px 1fr 1fr;
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
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1262df;
        }

        .featureIcon svg {
          width: 42px;
          height: 42px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .featureItem p {
          margin: 9px 0 0;
          color: #0b1422;
          font-size: 13px;
          line-height: 1.4;
          font-weight: 700;
        }

        .divider {
          width: 1px;
          background: #ccd4df;
          margin: 2px 0;
        }

        .closingLine {
          margin: 24px 0 0;
          color: #0754d6;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.27em;
        }

        @media (max-width: 900px) {
          .hero {
            min-height: 520px;
            padding: 48px 20px 100px;
          }

          h1 {
            font-size: clamp(42px, 9vw, 60px);
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
            opacity: 0.62;
          }

          .waveLeft {
            left: -35%;
          }

          .waveRight {
            right: -35%;
          }

          .featureRow {
            grid-template-columns: repeat(2, 1fr);
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
            min-height: 500px;
            padding-top: 42px;
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
