"use client";

import type { ReactNode } from "react";

type FeatureProps = {
  icon: ReactNode;
  children: ReactNode;
};

function Feature({ icon, children }: FeatureProps) {
  return (
    <div className="feature">
      <div className="featureIcon">{icon}</div>
      <div className="featureText">{children}</div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="page">
      {/* HERO */}
      <section className="hero">
        {/* LEFT ABSTRACT WAVE */}
        <svg
          className="wave waveLeft"
          viewBox="0 0 760 420"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="leftStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0058d8" stopOpacity="0" />
              <stop offset="45%" stopColor="#087dff" stopOpacity=".45" />
              <stop offset="64%" stopColor="#1499ff" stopOpacity=".95" />
              <stop offset="100%" stopColor="#0e59d8" stopOpacity=".08" />
            </linearGradient>

            <filter id="leftGlow">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path d="M-40 90 C160 85 265 260 760 335" />
          <path d="M-40 120 C170 110 275 260 760 320" />
          <path d="M-40 150 C180 135 285 260 760 305" />
          <path d="M-40 180 C190 160 295 260 760 290" />
          <path d="M-40 210 C200 185 305 260 760 275" />
          <path d="M-40 240 C210 210 315 260 760 260" />
          <path d="M-40 270 C220 235 325 260 760 245" />
          <path d="M-40 300 C230 260 335 260 760 230" />

          <circle
            cx="315"
            cy="255"
            r="4"
            fill="#58baff"
            filter="url(#leftGlow)"
          />
        </svg>

        {/* RIGHT ABSTRACT WAVE */}
        <svg
          className="wave waveRight"
          viewBox="0 0 760 420"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="rightStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0e59d8" stopOpacity=".08" />
              <stop offset="36%" stopColor="#1499ff" stopOpacity=".95" />
              <stop offset="58%" stopColor="#087dff" stopOpacity=".45" />
              <stop offset="100%" stopColor="#0058d8" stopOpacity="0" />
            </linearGradient>

            <filter id="rightGlow">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path d="M0 335 C495 260 600 85 800 90" />
          <path d="M0 320 C485 260 590 110 800 120" />
          <path d="M0 305 C475 260 580 135 800 150" />
          <path d="M0 290 C465 260 570 160 800 180" />
          <path d="M0 275 C455 260 560 185 800 210" />
          <path d="M0 260 C445 260 550 210 800 240" />
          <path d="M0 245 C435 260 540 235 800 270" />
          <path d="M0 230 C425 260 530 260 800 300" />

          <circle
            cx="445"
            cy="255"
            r="4"
            fill="#58baff"
            filter="url(#rightGlow)"
          />
        </svg>

        <div className="heroContent">
          <div className="eyebrow">
            WORKFORCE INFRASTRUCTURE PLATFORM
          </div>

          <div className="eyebrowLine" />

          <h1>
            Infrastructure that
            <br />
            powers your <span>career.</span>
          </h1>

          <p className="heroDescription">
            All the tools you need to build, market, and manage
            <br className="desktopOnly" />
            your career — all in one intelligent platform.
          </p>

          <a href="/sign-up" className="cta">
            Create Career Passport
          </a>
        </div>

        {/* SMILE CURVE */}
        <svg
          className="heroCurve"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,20 Q720,115 1440,20 L1440,120 L0,120 Z"
            fill="#f8fafc"
          />
        </svg>
      </section>

      {/* LIGHT SECTION */}
      <section className="platform">
        <div className="platformHeading">
          <div>The all-in-one platform to</div>

          <strong>build. stand out. land.</strong>

          <span className="headingLine" />
        </div>

        <div className="features">
          <Feature
            icon={
              <svg viewBox="0 0 48 48">
                <rect x="10" y="6" width="25" height="32" rx="2" />
                <path d="M16 14h13M16 20h10M16 26h7" />
                <path d="M29 34l8-8 4 4-8 8-6 2z" />
              </svg>
            }
          >
            Create
            <br />
            Standout Materials
          </Feature>

          <span className="divider" />

          <Feature
            icon={
              <svg viewBox="0 0 48 48">
                <circle cx="23" cy="24" r="15" />
                <circle cx="23" cy="24" r="9" />
                <circle cx="23" cy="24" r="3" />
                <path d="M26 21l12-12M33 9h7v7" />
              </svg>
            }
          >
            Match Your Skills
            <br />
            to the Right Roles
          </Feature>

          <span className="divider" />

          <Feature
            icon={
              <svg viewBox="0 0 48 48">
                <rect x="8" y="14" width="32" height="24" rx="2" />
                <path d="M17 14v-4h14v4M8 23h32" />
                <path d="M21 21h6v5h-6z" />
              </svg>
            }
          >
            Track Your Search
            <br />
            and Applications
          </Feature>

          <span className="divider" />

          <Feature
            icon={
              <svg viewBox="0 0 48 48">
                <path d="M8 38V27h7v11z" />
                <path d="M20 38V19h7v19z" />
                <path d="M32 38V9h7v29z" />
              </svg>
            }
          >
            Make Smarter
            <br />
            Career Moves
          </Feature>

          <span className="divider" />

          <Feature
            icon={
              <svg viewBox="0 0 48 48">
                <path d="M24 5l15 6v11c0 9-6 16-15 21C15 38 9 31 9 22V11z" />
                <path d="M17 24l5 5 10-11" />
              </svg>
            }
          >
            Your Data.
            <br />
            Your Control.
          </Feature>
        </div>

        <div className="closing">
          ONE ACCOUNT. EVERY TOOL. REAL RESULTS.
        </div>
      </section>

      <style jsx>{`
        .page {
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background: #f8fafc;
          font-family: Arial, Helvetica, sans-serif;
        }

        /* HERO */

        .hero {
          position: relative;
          min-height: 620px;

          display: flex;
          align-items: flex-start;
          justify-content: center;

          padding: 55px 24px 130px;

          overflow: hidden;

          background:
            radial-gradient(
              ellipse at 7% 12%,
              rgba(16, 91, 184, 0.42) 0%,
              rgba(8, 49, 103, 0.18) 27%,
              transparent 47%
            ),
            radial-gradient(
              ellipse at 94% 45%,
              rgba(11, 73, 160, 0.28) 0%,
              transparent 39%
            ),
            radial-gradient(
              circle at 50% 40%,
              rgba(2, 22, 49, 0.25),
              transparent 38%
            ),
            linear-gradient(
              135deg,
              #07182c 0%,
              #020914 44%,
              #07172a 100%
            );
        }

        .heroContent {
          position: relative;
          z-index: 4;

          width: 100%;
          max-width: 1050px;

          text-align: center;
        }

        .eyebrow {
          margin-top: 4px;

          font-size: 13px;
          font-weight: 700;

          color: #1599ff;

          letter-spacing: 0.24em;
        }

        .eyebrowLine {
          width: 64px;
          height: 2px;

          margin: 22px auto 28px;

          background: #189cff;
        }

        h1 {
          margin: 0;

          font-family: Georgia, "Times New Roman", serif;

          font-size: clamp(52px, 5vw, 78px);

          font-weight: 400;
          line-height: 1.04;

          letter-spacing: -0.035em;

          color: #f8f8f6;
        }

        h1 span {
          color: #087cff;
        }

        .heroDescription {
          margin: 30px auto 0;

          font-size: 19px;
          line-height: 1.7;

          color: #f1f4f8;

          font-weight: 400;
        }

        .cta {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          min-width: 390px;

          margin-top: 36px;

          padding: 19px 36px;

          border-radius: 7px;

          text-decoration: none;

          color: #ffffff;

          font-size: 20px;
          font-weight: 700;

          background:
            linear-gradient(
              135deg,
              #1678ef 0%,
              #0049ff 100%
            );

          box-shadow:
            0 12px 34px rgba(0, 79, 255, 0.2);

          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .cta:hover {
          transform: translateY(-2px);

          box-shadow:
            0 16px 40px rgba(0, 95, 255, 0.3);
        }

        /* ABSTRACT WAVES */

        .wave {
          position: absolute;

          z-index: 1;

          width: 50%;
          height: 420px;

          pointer-events: none;
        }

        .wave path {
          fill: none;
          stroke-width: 1.1;
        }

        .waveLeft {
          left: -7%;
          bottom: 20px;
        }

        .waveLeft path {
          stroke: url(#leftStroke);
        }

        .waveRight {
          right: -7%;
          bottom: 20px;
        }

        .waveRight path {
          stroke: url(#rightStroke);
        }

        /* SMILE CURVE */

        .heroCurve {
          position: absolute;

          z-index: 3;

          left: 0;
          bottom: -1px;

          width: 100%;
          height: 96px;

          display: block;
        }

        /* LIGHT PLATFORM AREA */

        .platform {
          position: relative;

          margin-top: -1px;

          padding: 34px 32px 54px;

          text-align: center;

          color: #071020;

          background:
            radial-gradient(
              circle at 92% 72%,
              rgba(60, 128, 255, 0.1),
              transparent 27%
            ),
            linear-gradient(
              180deg,
              #f8fafc 0%,
              #eef4fc 100%
            );
        }

        .platformHeading {
          font-size: clamp(29px, 2.4vw, 38px);

          line-height: 1.15;

          font-weight: 400;

          letter-spacing: -0.025em;
        }

        .platformHeading strong {
          display: block;

          margin-top: 2px;

          color: #155bd8;

          font-weight: 700;
        }

        .headingLine {
          display: block;

          width: 62px;
          height: 2px;

          margin: 21px auto 20px;

          background: #146fe8;
        }

        /* FEATURES */

        .features {
          width: 100%;
          max-width: 1100px;

          margin: 0 auto;

          display: flex;

          justify-content: center;
          align-items: stretch;
        }

        .feature {
          flex: 1;

          display: flex;

          flex-direction: column;

          align-items: center;

          padding: 0 22px;
        }

        .featureIcon {
          width: 54px;
          height: 54px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #0d63e8;
        }

        .featureIcon svg {
          width: 45px;
          height: 45px;

          fill: none;

          stroke: currentColor;

          stroke-width: 2.2;

          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .featureText {
          margin-top: 8px;

          font-size: 14px;

          line-height: 1.45;

          font-weight: 700;

          color: #0b1320;
        }

        .divider {
          width: 1px;

          background: #cbd3df;

          margin: 4px 0 0;
        }

        .closing {
          margin-top: 28px;

          color: #0754d9;

          font-size: 12px;

          font-weight: 800;

          letter-spacing: 0.28em;
        }

        /* TABLET */

        @media (max-width: 900px) {
          .hero {
            min-height: 580px;

            padding:
              50px 20px
              120px;
          }

          h1 {
            font-size: clamp(43px, 10vw, 62px);
          }

          .heroDescription {
            font-size: 16px;
          }

          .desktopOnly {
            display: none;
          }

          .cta {
            min-width: 0;

            width: 100%;
            max-width: 360px;

            font-size: 18px;
          }

          .wave {
            width: 77%;
            opacity: 0.75;
          }

          .waveLeft {
            left: -37%;
          }

          .waveRight {
            right: -37%;
          }

          .features {
            display: grid;

            grid-template-columns: repeat(2, 1fr);

            gap: 30px 10px;
          }

          .divider {
            display: none;
          }

          .feature:last-child {
            grid-column: 1 / -1;
          }

          .closing {
            line-height: 1.8;
          }
        }

        /* MOBILE */

        @media (max-width: 520px) {
          .hero {
            min-height: 560px;

            padding-top: 44px;
          }

          .eyebrow {
            font-size: 10px;
          }

          h1 {
            font-size: 43px;
          }

          .platform {
            padding-left: 18px;
            padding-right: 18px;
          }

          .features {
            grid-template-columns: 1fr;
          }

          .feature:last-child {
            grid-column: auto;
          }
        }
      `}</style>
    </main>
  );
}
