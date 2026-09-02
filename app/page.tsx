"use client";

export default function HomePage() {
  return (
    <main className="homePage">

      {/* HERO */}
      <section className="hero">

        {/* ABSTRACT BLUE LINES */}
        <div className="wave waveLeft">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
          <div className="glowDot leftDot" />
        </div>

        <div className="wave waveRight">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
          <div className="glowDot rightDot" />
        </div>

        <div className="heroContent">
          <p className="eyebrow">
            WORKFORCE INFRASTRUCTURE PLATFORM
          </p>

          <div className="smallLine" />

          <h1>
            Infrastructure that
            <br />
            powers your <span>career.</span>
          </h1>

          <p className="heroCopy">
            All the tools you need to build, market, and manage
            <br className="desktopBreak" />
            your career — all in one intelligent platform.
          </p>

          <a href="/sign-up" className="primaryButton">
            Create Career Passport
          </a>
        </div>

        <div className="curve" />
      </section>


      {/* PLATFORM SUMMARY */}
      <section className="platformSection">

        <div className="summary">
          <h2>
            The all-in-one platform to
            <br />
            <span>build. stand out. land.</span>
          </h2>

          <div className="blueLine" />
        </div>


        {/* PLATFORM FEATURES */}
        <div className="features">

          <div className="feature">
            <div className="icon documentIcon">
              <div className="paper" />
              <div className="pen">／</div>
            </div>

            <p>
              Create
              <br />
              Standout Materials
            </p>
          </div>


          <div className="divider" />


          <div className="feature">
            <div className="icon targetIcon">
              ◎
            </div>

            <p>
              Match Your Skills
              <br />
              to the Right Roles
            </p>
          </div>


          <div className="divider" />


          <div className="feature">
            <div className="icon briefcaseIcon">
              ▣
            </div>

            <p>
              Track Your Search
              <br />
              and Applications
            </p>
          </div>


          <div className="divider" />


          <div className="feature">
            <div className="icon chartIcon">
              ▥
            </div>

            <p>
              Make Smarter
              <br />
              Career Moves
            </p>
          </div>


          <div className="divider" />


          <div className="feature">
            <div className="icon shieldIcon">
              ◇
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

        .homePage {
          width: 100%;
          min-height: 100vh;
          background: #f8fafc;
          overflow: hidden;
          font-family: Inter, Arial, Helvetica, sans-serif;
        }


        /* ================================
           HERO
        ================================= */

        .hero {
          position: relative;
          min-height: 590px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          background:
            radial-gradient(
              circle at 8% 5%,
              rgba(20, 88, 190, 0.38),
              transparent 32%
            ),
            radial-gradient(
              circle at 93% 70%,
              rgba(0, 82, 190, 0.18),
              transparent 27%
            ),
            linear-gradient(
              135deg,
              #051323 0%,
              #020914 48%,
              #071526 100%
            );

          color: white;

          padding:
            65px 30px
            120px;
        }


        .heroContent {
          position: relative;
          z-index: 5;
          text-align: center;

          width: 100%;
          max-width: 1000px;

          margin-top: -20px;
        }


        .eyebrow {
          margin: 0;

          color: #1492ff;

          font-size: 13px;
          font-weight: 700;

          letter-spacing: 0.24em;
        }


        .smallLine {
          width: 90px;
          height: 2px;

          margin:
            24px auto
            28px;

          background: #1492ff;
        }


        h1 {
          margin: 0;

          color: #f7f7f5;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-weight: 400;

          font-size:
            clamp(
              52px,
              5vw,
              78px
            );

          line-height: 1.04;

          letter-spacing: -0.035em;
        }


        h1 span {
          color: #0675f5;
        }


        .heroCopy {
          margin:
            30px auto
            0;

          color: #f0f3f7;

          font-size:
            clamp(
              17px,
              1.35vw,
              21px
            );

          font-weight: 400;

          line-height: 1.7;
        }


        .primaryButton {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          margin-top: 42px;

          min-width: 380px;

          padding:
            19px
            42px;

          border-radius: 8px;

          background:
            linear-gradient(
              135deg,
              #146ee8,
              #003cff
            );

          color: white;

          text-decoration: none;

          font-size: 20px;
          font-weight: 700;

          box-shadow:
            0 12px 30px
            rgba(0, 73, 255, 0.19);

          transition:
            transform 180ms ease,
            box-shadow 180ms ease;
        }


        .primaryButton:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 18px 35px
            rgba(0, 73, 255, 0.26);
        }


        /* ================================
           ABSTRACT WAVES
        ================================= */

        .wave {
          position: absolute;

          z-index: 1;

          width: 47%;
          height: 330px;

          pointer-events: none;

          opacity: 0.75;
        }


        .waveLeft {
          left: -11%;
          bottom: 20px;
        }


        .waveRight {
          right: -12%;
          top: 45px;

          transform:
            rotate(180deg)
            scaleY(-1);
        }


        .wave span {
          --i: 0;

          position: absolute;

          left: 0;
          top: calc(
            40px +
            (var(--i) * 11px)
          );

          width: 110%;
          height: 1px;

          transform:
            rotate(
              calc(
                -16deg +
                (var(--i) * 2.5deg)
              )
            );

          transform-origin: left center;

          background:
            linear-gradient(
              90deg,
              transparent 0%,
              rgba(0, 120, 255, .25) 10%,
              rgba(0, 145, 255, .9) 50%,
              rgba(0, 100, 255, .12) 100%
            );

          box-shadow:
            0 0 5px
            rgba(0, 130, 255, .35);
        }


        .glowDot {
          position: absolute;

          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #50b8ff;

          box-shadow:
            0 0 10px #239cff,
            0 0 24px #006eff;
        }


        .leftDot {
          left: 48%;
          top: 49%;
        }


        .rightDot {
          left: 51%;
          top: 50%;
        }


        /* ================================
           CURVED TRANSITION
        ================================= */

        .curve {
          position: absolute;

          z-index: 3;

          left: -5%;
          bottom: -66px;

          width: 110%;
          height: 115px;

          background: #f8fafc;

          border-radius:
            50% 50%
            0 0 /
            100% 100%
            0 0;
        }


        /* ================================
           LIGHT PLATFORM AREA
        ================================= */

        .platformSection {
          position: relative;

          background:
            radial-gradient(
              circle at 90% 75%,
              rgba(33, 113, 255, 0.10),
              transparent 27%
            ),
            #f8fafc;

          color: #081326;

          text-align: center;

          padding:
            80px 40px
            55px;
        }


        .summary h2 {
          margin: 0;

          font-size:
            clamp(
              28px,
              2.5vw,
              40px
            );

          line-height: 1.15;

          font-weight: 500;

          letter-spacing: -0.025em;
        }


        .summary h2 span {
          color: #145ada;

          font-weight: 700;
        }


        .blueLine {
          width: 86px;
          height: 3px;

          margin:
            24px auto
            24px;

          background: #156fea;
        }


        /* ================================
           FEATURES
        ================================= */

        .features {
          width: 100%;
          max-width: 1100px;

          margin:
            10px auto
            26px;

          display: flex;

          align-items: stretch;
          justify-content: center;
        }


        .feature {
          flex: 1;

          min-width: 0;

          padding:
            6px
            22px;

          display: flex;
          flex-direction: column;

          align-items: center;
          justify-content: flex-start;
        }


        .feature p {
          margin:
            10px 0
            0;

          font-size: 15px;
          line-height: 1.45;

          font-weight: 600;

          color: #0e1520;
        }


        .divider {
          width: 1px;

          margin:
            4px 0
            0;

          background: #ccd3dd;
        }


        /* ================================
           SIMPLE BLUE ICONS
        ================================= */

        .icon {
          width: 48px;
          height: 48px;

          display: flex;

          align-items: center;
          justify-content: center;

          color: #145bdb;

          font-size: 40px;
          font-weight: 400;

          line-height: 1;
        }


        .documentIcon {
          position: relative;
        }


        .paper {
          width: 27px;
          height: 34px;

          border:
            2px solid
            #145bdb;

          border-radius: 3px;

          position: relative;
        }


        .paper::before,
        .paper::after {
          content: "";

          position: absolute;

          left: 5px;

          height: 2px;

          background: #145bdb;
        }


        .paper::before {
          top: 9px;
          width: 15px;
        }


        .paper::after {
          top: 16px;
          width: 11px;
        }


        .pen {
          position: absolute;

          right: 4px;
          bottom: 5px;

          font-size: 23px;
          font-weight: 700;

          transform:
            rotate(-14deg);

          color: #145bdb;
        }


        .targetIcon {
          font-size: 48px;
        }


        .briefcaseIcon {
          font-size: 45px;
        }


        .chartIcon {
          font-size: 43px;
        }


        .shieldIcon {
          font-size: 48px;
        }


        /* ================================
           CLOSING LINE
        ================================= */

        .closingLine {
          margin:
            28px 0
            0;

          color: #0d53cf;

          font-size: 13px;

          font-weight: 800;

          letter-spacing: 0.25em;
        }


        /* ================================
           MOBILE
        ================================= */

        @media (
          max-width: 900px
        ) {

          .hero {
            min-height: 570px;

            padding:
              60px 22px
              110px;
          }


          .heroContent {
            margin-top: 0;
          }


          .eyebrow {
            font-size: 10px;
          }


          h1 {
            font-size:
              clamp(
                43px,
                11vw,
                61px
              );
          }


          .heroCopy {
            font-size: 16px;
          }


          .desktopBreak {
            display: none;
          }


          .primaryButton {
            min-width: 0;
            width: 100%;
            max-width: 360px;

            font-size: 18px;
          }


          .wave {
            width: 80%;
            opacity: 0.5;
          }


          .waveLeft {
            left: -35%;
          }


          .waveRight {
            right: -40%;
          }


          .platformSection {
            padding:
              65px 20px
              45px;
          }


          .features {
            flex-wrap: wrap;
            gap: 20px;
          }


          .feature {
            flex:
              1 1
              42%;

            padding: 15px 10px;
          }


          .divider {
            display: none;
          }


          .closingLine {
            font-size: 11px;

            line-height: 1.8;
          }

        }


        @media (
          max-width: 520px
        ) {

          .hero {
            min-height: 540px;
          }


          h1 {
            font-size: 43px;
          }


          .heroCopy {
            margin-top: 24px;
          }


          .primaryButton {
            margin-top: 32px;
          }


          .summary h2 {
            font-size: 28px;
          }


          .features {
            display: grid;

            grid-template-columns:
              1fr 1fr;
          }


          .feature:last-child {
            grid-column:
              1 / -1;
          }

        }

      `}</style>

    </main>
  );
}
