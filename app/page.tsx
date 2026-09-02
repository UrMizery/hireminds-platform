"use client";

import { useEffect, useState } from "react";

const heroWords = [
  "career.",
  "growth.",
  "next move.",
  "potential.",
];

const platformWords = [
  "build.",
  "stand out.",
  "advance.",
];

const closingWords = [
  "BUILD.",
  "MATCH.",
  "ANALYZE.",
  "ADVANCE.",
];

export default function HomePage() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [platformIndex, setPlatformIndex] = useState(0);
  const [closingIndex, setClosingIndex] = useState(0);

  useEffect(() => {
    const heroTimer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroWords.length);
    }, 2200);

    const platformTimer = window.setInterval(() => {
      setPlatformIndex((prev) => (prev + 1) % platformWords.length);
    }, 1850);

    const closingTimer = window.setInterval(() => {
      setClosingIndex((prev) => (prev + 1) % closingWords.length);
    }, 1600);

    return () => {
      window.clearInterval(heroTimer);
      window.clearInterval(platformTimer);
      window.clearInterval(closingTimer);
    };
  }, []);

  return (
    <main className="page">
      <section className="hero">
        <div className="heroGlow glowOne" />
        <div className="heroGlow glowTwo" />
        <div className="heroGlow glowThree" />

        <div className="heroContent">
          <p className="eyebrow">WORKFORCE INFRASTRUCTURE PLATFORM</p>

          <div className="eyebrowLine" />

          <h1>
            Infrastructure that
            <br />
            powers your{" "}
            <span key={heroIndex} className="changingWord">
              {heroWords[heroIndex]}
            </span>
          </h1>

          <p className="heroCopy">
            All the tools you need to build, market, and manage
            <br className="desktopOnly" />
            your career — all in one intelligent platform.
          </p>

          <div className="heroActions">
            <a href="/sign-up" className="cta">
              <span>Create Career Passport</span>
            </a>

            <a href="/explore" className="exploreLink">
              Explore HireMinds
              <span className="arrow">→</span>
            </a>
          </div>

          <div className="heroMicro">
            <span>BUILD</span>
            <i />
            <span>ANALYZE</span>
            <i />
            <span>OPTIMIZE</span>
            <i />
            <span>ADVANCE</span>
          </div>
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

          <div className="platformChangingWrap">
            <h2
              key={platformIndex}
              className="platformChangingWord"
            >
              {platformWords[platformIndex]}
            </h2>
          </div>

          <div className="platformLine" />
        </div>

        <div className="featureRow">
          <FeatureItem
            delay="0s"
            icon={
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <rect
                  x="11"
                  y="7"
                  width="24"
                  height="31"
                  rx="2"
                />
                <path d="M16 15h13" />
                <path d="M16 21h10" />
                <path d="M16 27h8" />
                <path d="M29 35l8-8 4 4-8 8-6 2z" />
              </svg>
            }
          >
            Create
            <br />
            Standout Materials
          </FeatureItem>

          <div className="divider" />

          <FeatureItem
            delay=".15s"
            icon={
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <circle cx="22" cy="24" r="15" />
                <circle cx="22" cy="24" r="9" />
                <circle cx="22" cy="24" r="3" />
                <path d="M26 20l11-11" />
                <path d="M32 9h6v6" />
              </svg>
            }
          >
            Match Your Skills
            <br />
            to the Right Roles
          </FeatureItem>

          <div className="divider" />

          <FeatureItem
            delay=".3s"
            icon={
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <rect
                  x="8"
                  y="15"
                  width="32"
                  height="23"
                  rx="2"
                />
                <path d="M17 15v-5h14v5" />
                <path d="M8 24h32" />
                <rect
                  x="21"
                  y="22"
                  width="6"
                  height="5"
                  rx="1"
                />
              </svg>
            }
          >
            Track Your Search
            <br />
            and Applications
          </FeatureItem>

          <div className="divider" />

          <FeatureItem
            delay=".45s"
            icon={
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <rect
                  x="8"
                  y="27"
                  width="7"
                  height="11"
                  rx="1"
                />
                <rect
                  x="20"
                  y="19"
                  width="7"
                  height="19"
                  rx="1"
                />
                <rect
                  x="32"
                  y="9"
                  width="7"
                  height="29"
                  rx="1"
                />
              </svg>
            }
          >
            Make Smarter
            <br />
            Career Moves
          </FeatureItem>

          <div className="divider" />

          <FeatureItem
            delay=".6s"
            icon={
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <circle cx="24" cy="16" r="7" />
                <path d="M12 38c1-8 6-12 12-12s11 4 12 12" />
                <path d="M34 11l3 3 5-6" />
              </svg>
            }
          >
            Build a Stronger
            <br />
            Career Profile
          </FeatureItem>
        </div>

        <div className="closingWrap">
          <span
            key={closingIndex}
            className="closingChanging"
          >
            {closingWords[closingIndex]}
          </span>

          <span className="closingStatic">
            ONE ACCOUNT. EVERY TOOL. REAL RESULTS.
          </span>
        </div>
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
          padding: 48px 24px 102px;

          display: flex;
          justify-content: center;
          align-items: flex-start;

          overflow: hidden;

          color: #ffffff;

          background:
            radial-gradient(
              ellipse at 14% 16%,
              rgba(42, 121, 230, 0.2) 0%,
              rgba(10, 54, 112, 0.1) 30%,
              transparent 55%
            ),
            radial-gradient(
              ellipse at 86% 70%,
              rgba(25, 104, 214, 0.18) 0%,
              rgba(8, 43, 92, 0.08) 32%,
              transparent 58%
            ),
            radial-gradient(
              ellipse at 52% -8%,
              rgba(90, 162, 255, 0.11) 0%,
              transparent 40%
            ),
            linear-gradient(
              135deg,
              #020812 0%,
              #05172a 28%,
              #03101f 50%,
              #08213d 72%,
              #020914 100%
            );
        }

        .hero::before {
          content: "";
          position: absolute;
          inset: -34%;
          z-index: 0;
          pointer-events: none;

          background:
            radial-gradient(
              ellipse at 27% 48%,
              transparent 0%,
              transparent 34%,
              rgba(24, 108, 224, 0.11) 40%,
              rgba(72, 150, 255, 0.05) 44%,
              transparent 52%
            ),
            radial-gradient(
              ellipse at 72% 56%,
              transparent 0%,
              transparent 36%,
              rgba(14, 88, 190, 0.12) 42%,
              rgba(74, 155, 255, 0.05) 46%,
              transparent 54%
            ),
            radial-gradient(
              ellipse at 52% 28%,
              transparent 0%,
              transparent 42%,
              rgba(97, 166, 255, 0.055) 48%,
              transparent 56%
            );

          transform: rotate(-7deg) scale(1.15);
          filter: blur(20px);

          animation:
            backgroundDrift
            15s ease-in-out infinite alternate;
        }

        .hero::after {
          content: "";
          position: absolute;
          top: -24%;
          left: 13%;
          width: 74%;
          height: 58%;
          z-index: 0;
          pointer-events: none;

          background:
            radial-gradient(
              ellipse at center,
              rgba(125, 188, 255, 0.1) 0%,
              rgba(48, 128, 225, 0.045) 36%,
              transparent 72%
            );

          filter: blur(30px);
          transform: rotate(-5deg);

          animation:
            upperGlow
            12s ease-in-out infinite alternate;
        }

        .heroGlow {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(100px);
          z-index: 1;
        }

        .glowOne {
          width: 340px;
          height: 340px;
          top: -170px;
          left: 8%;
          background: rgba(22, 119, 255, 0.11);

          animation:
            glowMoveOne
            11s ease-in-out infinite alternate;
        }

        .glowTwo {
          width: 420px;
          height: 420px;
          right: 4%;
          bottom: -220px;
          background: rgba(22, 119, 255, 0.1);

          animation:
            glowMoveTwo
            13s ease-in-out infinite alternate;
        }

        .glowThree {
          width: 260px;
          height: 260px;
          left: 47%;
          top: 22%;
          background: rgba(92, 156, 255, 0.055);

          animation:
            glowPulse
            7s ease-in-out infinite;
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

          box-shadow:
            0 0 20px
            rgba(22, 119, 255, 0.42);
        }

        h1 {
          margin: 0;
          min-height: 150px;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size:
            clamp(
              48px,
              4.8vw,
              72px
            );

          line-height: 1.04;
          font-weight: 400;
          letter-spacing: -0.035em;
          color: #f7f7f5;
        }

        .changingWord {
          display: inline-block;
          color: #1677ff;

          animation:
            wordReveal
            2.2s ease-in-out;
        }

        .heroCopy {
          margin: 24px auto 0;
          color: #eef2f7;
          font-size: 17px;
          line-height: 1.65;
          font-weight: 400;
        }

        .heroActions {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .cta {
          position: relative;
          display: inline-flex;
          justify-content: center;
          align-items: center;

          min-width: 340px;

          margin-top: 28px;
          padding: 16px 30px;

          border-radius: 7px;
          overflow: hidden;

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

        .cta::before {
          content: "";
          position: absolute;
          top: -40%;
          left: -35%;
          width: 24%;
          height: 180%;
          transform: rotate(18deg);

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.32),
              transparent
            );

          animation:
            buttonShine
            4.8s ease-in-out infinite;
        }

        .cta span {
          position: relative;
          z-index: 2;
        }

        .cta:hover {
          transform: translateY(-2px);

          box-shadow:
            0 16px 38px
            rgba(22, 119, 255, 0.32);
        }

        .exploreLink {
          margin-top: 28px;
          display: inline-flex;
          align-items: center;
          gap: 9px;

          color: #dce7f3;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;

          transition: color 0.2s ease;
        }

        .exploreLink:hover {
          color: #ffffff;
        }

        .arrow {
          color: #1677ff;
          font-size: 18px;

          transition:
            transform 0.2s ease;
        }

        .exploreLink:hover .arrow {
          transform: translateX(4px);
        }

        .heroMicro {
          margin-top: 34px;

          display: flex;
          justify-content: center;
          align-items: center;

          gap: 13px;

          color: rgba(221, 231, 241, 0.55);

          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.18em;
        }

        .heroMicro i {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #1677ff;

          box-shadow:
            0 0 10px
            rgba(22, 119, 255, 0.75);
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
          padding: 8px 32px 42px;

          background:
            radial-gradient(
              circle at 91% 75%,
              rgba(22, 119, 255, 0.055),
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

          font-size:
            clamp(
              24px,
              2vw,
              32px
            );

          font-weight: 400;
          line-height: 1.1;
          letter-spacing: -0.025em;
        }

        .platformChangingWrap {
          min-height: 43px;

          display: flex;
          justify-content: center;
          align-items: center;
        }

        .platformChangingWord {
          margin: 2px 0 0;

          font-size:
            clamp(
              27px,
              2.2vw,
              35px
            );

          line-height: 1.1;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #1677ff;

          animation:
            platformReveal
            1.85s ease-in-out;
        }

        .platformLine {
          width: 62px;
          height: 2px;
          margin: 17px auto 20px;
          background: #1677ff;

          box-shadow:
            0 0 16px
            rgba(22, 119, 255, 0.22);
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
          position: relative;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;

          padding: 4px 18px 8px;

          transition:
            transform 0.25s ease;
        }

        .featureItem:hover {
          transform: translateY(-5px);
        }

        .featureIcon {
          width: 44px;
          height: 44px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #1677ff;

          animation:
            iconFloat
            5s ease-in-out infinite;

          animation-delay:
            var(--delay);
        }

        /*
          IMPORTANT:
          FeatureItem is a child component, so these SVG rules
          need :global() in styled-jsx. This keeps the icons
          blue outlines instead of black filled shapes.
        */

        .featureIcon :global(svg) {
          width: 40px;
          height: 40px;

          fill: none !important;
          stroke: #1677ff !important;

          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;

          filter:
            drop-shadow(
              0 4px 9px
              rgba(22, 119, 255, 0.12)
            );
        }

        .featureIcon :global(svg *) {
          fill: none !important;
          stroke: #1677ff !important;
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

          background:
            linear-gradient(
              180deg,
              transparent,
              #cbd4df,
              transparent
            );
        }

        .closingWrap {
          min-height: 50px;
          margin-top: 23px;

          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;

          gap: 7px;
        }

        .closingChanging {
          color: #081224;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 17px;
          font-weight: 500;

          animation:
            closingReveal
            1.6s ease-in-out;
        }

        .closingStatic {
          color: #1677ff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.27em;
        }

        @keyframes wordReveal {
          0% {
            opacity: 0;
            transform: translateY(10px);
            filter: blur(4px);
          }

          18% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }

          80% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }

          100% {
            opacity: 0;
            transform: translateY(-8px);
            filter: blur(3px);
          }
        }

        @keyframes platformReveal {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }

          22% {
            opacity: 1;
            transform: translateY(0);
          }

          82% {
            opacity: 1;
            transform: translateY(0);
          }

          100% {
            opacity: 0;
            transform: translateY(-7px);
          }
        }

        @keyframes closingReveal {
          0% {
            opacity: 0;
            letter-spacing: 0.12em;
            transform: translateY(5px);
          }

          25% {
            opacity: 1;
            letter-spacing: 0.03em;
            transform: translateY(0);
          }

          80% {
            opacity: 1;
            transform: translateY(0);
          }

          100% {
            opacity: 0;
            transform: translateY(-4px);
          }
        }

        @keyframes buttonShine {
          0%,
          55% {
            left: -35%;
          }

          76% {
            left: 120%;
          }

          100% {
            left: 120%;
          }
        }

        @keyframes iconFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes backgroundDrift {
          0% {
            transform:
              rotate(-7deg)
              scale(1.15)
              translate3d(0, 0, 0);
          }

          100% {
            transform:
              rotate(-5deg)
              scale(1.2)
              translate3d(2%, -1%, 0);
          }
        }

        @keyframes upperGlow {
          from {
            opacity: 0.7;

            transform:
              rotate(-5deg)
              translateX(-2%);
          }

          to {
            opacity: 1;

            transform:
              rotate(-3deg)
              translateX(3%);
          }
        }

        @keyframes glowMoveOne {
          from {
            transform:
              translate3d(-15px, 0, 0);
          }

          to {
            transform:
              translate3d(55px, 22px, 0);
          }
        }

        @keyframes glowMoveTwo {
          from {
            transform:
              translate3d(0, 0, 0);
          }

          to {
            transform:
              translate3d(-70px, -18px, 0);
          }
        }

        @keyframes glowPulse {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(0.94);
          }

          50% {
            opacity: 0.8;
            transform: scale(1.08);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation: none !important;
            transition: none !important;
          }
        }

        @media (max-width: 900px) {
          .hero {
            min-height: 510px;
            padding: 44px 20px 94px;
          }

          h1 {
            min-height: 130px;

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

          .heroActions {
            gap: 5px;
            flex-direction: column;
          }

          .exploreLink {
            margin-top: 17px;
          }

          .heroMicro {
            margin-top: 27px;
            gap: 9px;
            font-size: 8px;
            letter-spacing: 0.12em;
          }

          .platformSection {
            padding-top: 4px;
          }

          .featureRow {
            grid-template-columns:
              repeat(2, 1fr);

            gap:
              24px 10px;
          }

          .divider {
            display: none;
          }

          .featureItem:last-child {
            grid-column:
              1 / -1;
          }

          .closingStatic {
            line-height: 1.8;
          }
        }

        @media (max-width: 520px) {
          .hero {
            min-height: 500px;
            padding-top: 40px;
          }

          .eyebrow {
            font-size: 9px;
          }

          h1 {
            min-height: 121px;
            font-size: 41px;
          }

          .heroMicro {
            flex-wrap: wrap;
            max-width: 300px;
            margin-left: auto;
            margin-right: auto;
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

function FeatureItem({
  icon,
  children,
  delay,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  delay: string;
}) {
  return (
    <div
      className="featureItem"
      style={
        {
          "--delay": delay,
        } as React.CSSProperties
      }
    >
      <div className="featureIcon">
        {icon}
      </div>

      <p>{children}</p>
    </div>
  );
}
