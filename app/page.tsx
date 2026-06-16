'use client';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      {/* NAVBAR */}
      <nav className="w-full border-b border-white/10 px-10 py-5 flex items-center justify-between bg-black relative z-20">

        <div className="text-4xl font-semibold tracking-tight">
          HireMinds
        </div>

        <div className="hidden md:flex items-center gap-12 text-lg">

          <a href="#" className="hover:text-blue-400 transition">
            Home
          </a>

          <a href="#" className="hover:text-blue-400 transition">
            Sign In
          </a>

          <a href="#" className="hover:text-blue-400 transition">
            Partner
          </a>

          <a href="#" className="hover:text-blue-400 transition">
            with HireMinds
          </a>

          <a href="#" className="hover:text-blue-400 transition">
            Contact Us
          </a>
        </div>

        <div className="flex items-center gap-10 text-lg">

          <div className="flex items-center gap-2">
            <span>Job Board</span>
            <span className="text-yellow-400">🔒</span>
          </div>

          <a href="#" className="hover:text-blue-400 transition">
            Employer / Partner Sign In
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex flex-col items-center text-center px-6 pt-14 pb-32 overflow-hidden">

        {/* BACKGROUND GLOW */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.18),transparent_65%)] pointer-events-none" />

        {/* TOP LABEL */}
        <p className="text-[#1E90FF] tracking-[0.35em] uppercase text-sm font-semibold mb-6 relative z-10">
          Workforce Infrastructure Platform
        </p>

        {/* MAIN TITLE */}
        <h1 className="text-6xl md:text-8xl font-extrabold leading-none tracking-tight max-w-7xl relative z-10">
          Build Your Career Passport
        </h1>

        {/* SUBTEXT */}
        <p className="mt-8 text-2xl text-white/80 max-w-4xl leading-relaxed relative z-10">
          HireMinds helps people strengthen visibility, organize career tools,
          prepare for opportunities, and keep momentum moving forward.
        </p>

        {/* BUTTON */}
        <button className="mt-12 px-12 py-5 rounded-2xl bg-white text-black text-2xl font-semibold shadow-[0_0_35px_rgba(255,255,255,0.4)] hover:scale-105 transition relative z-10">
          Create Career Passport / Sign Up
        </button>

        {/* LOGO */}
        <div className="mt-16 relative z-10 flex flex-col items-center">

          <div className="absolute w-[650px] h-[650px] rounded-full bg-blue-500/10 blur-[120px]" />

          <img
            src="/hm-logo.png.jpeg"
            alt="HireMinds"
            className="w-[380px] md:w-[620px] drop-shadow-[0_0_55px_rgba(59,130,246,0.9)]"
          />
        </div>

        {/* WHO WE ARE */}
        <div className="mt-8 w-full max-w-6xl relative z-10">

          <div className="flex items-center justify-center gap-6 mb-8">

            <div className="h-[2px] w-52 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />

            <span className="uppercase tracking-[0.35em] text-[#1E90FF] font-semibold text-lg">
              Who We Are
            </span>

            <div className="h-[2px] w-52 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
          </div>

          <h2 className="text-5xl md:text-6xl font-bold">
            The Bridge Between Potential and Opportunity
          </h2>

          <p className="mt-8 text-2xl text-white/80 leading-relaxed max-w-5xl mx-auto">
            HireMinds is a workforce infrastructure platform that connects
            people, purpose, and opportunity. We bridge the gap between
            Participants, Justice Impact Partners, Nonprofits, and Employers
            through one unified ecosystem built for real outcomes.
          </p>
        </div>

        {/* BRIDGE SECTION */}
        <div className="relative w-full max-w-[1800px] mt-24 h-[520px]">

          {/* GLOWING BRIDGE */}
          <svg
            className="absolute top-[80px] left-0 w-full h-[220px]"
            viewBox="0 0 1600 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 140 C200 40, 400 220, 800 110 C1200 0, 1400 200, 1600 90"
              stroke="url(#paint0_linear)"
              strokeWidth="3"
              fill="none"
              opacity="0.9"
            />

            <path
              d="M0 145 C200 45, 400 225, 800 115 C1200 5, 1400 205, 1600 95"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
              fill="none"
            />

            <defs>
              <linearGradient id="paint0_linear" x1="0" y1="0" x2="1600" y2="0">
                <stop stopColor="#1D4ED8" />
                <stop offset="0.5" stopColor="#A855F7" />
                <stop offset="1" stopColor="#22D3EE" />
              </linearGradient>
            </defs>
          </svg>

          {/* ICON GRID */}
          <div className="absolute top-0 left-0 w-full grid grid-cols-1 md:grid-cols-5 gap-8 items-start z-10">

            {/* PARTICIPANTS */}
            <div className="flex flex-col items-center mt-24">

              <div className="w-36 h-36 rounded-full border-4 border-blue-500 flex items-center justify-center bg-black shadow-[0_0_45px_rgba(59,130,246,0.9)]">
                <span className="text-6xl">👤</span>
              </div>

              <h3 className="mt-8 text-4xl font-bold">
                Participants
              </h3>

              <p className="mt-5 text-xl text-white/75 leading-relaxed max-w-sm">
                Build visibility, access tools, and prepare for meaningful
                career opportunities.
              </p>

              <div className="mt-8 w-32 h-[3px] bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)]" />
            </div>

            {/* JUSTICE */}
            <div className="flex flex-col items-center mt-16">

              <div className="w-36 h-36 rounded-full border-4 border-green-500 flex items-center justify-center bg-black shadow-[0_0_45px_rgba(34,197,94,0.9)]">
                <span className="text-6xl">🤝</span>
              </div>

              <h3 className="mt-8 text-4xl font-bold text-center">
                Justice Impact
                <br />
                Partners
              </h3>

              <p className="mt-5 text-xl text-white/75 leading-relaxed max-w-sm">
                Connect individuals to support, resources, and pathways that
                drive real change.
              </p>

              <div className="mt-8 w-32 h-[3px] bg-green-500 shadow-[0_0_20px_rgba(34,197,94,1)]" />
            </div>

            {/* CENTER */}
            <div className="flex flex-col items-center">

              <div className="relative w-72 h-72 rounded-full border-4 border-blue-500 bg-black flex items-center justify-center shadow-[0_0_80px_rgba(59,130,246,0.9)]">

                <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-3xl" />

                <img
                  src="/hm-logo.png.jpeg"
                  alt="HM"
                  className="w-44 relative z-10"
                />
              </div>

              <h3 className="mt-8 text-5xl font-bold">
                HireMinds
              </h3>

              <p className="text-2xl mt-3">
                One Platform.
                <br />
                <span className="text-blue-400">Unlimited</span> Impact.
              </p>
            </div>

            {/* NONPROFITS */}
            <div className="flex flex-col items-center mt-16">

              <div className="w-36 h-36 rounded-full border-4 border-fuchsia-500 flex items-center justify-center bg-black shadow-[0_0_45px_rgba(217,70,239,0.9)]">
                <span className="text-6xl">💜</span>
              </div>

              <h3 className="mt-8 text-4xl font-bold">
                Nonprofits
              </h3>

              <p className="mt-5 text-xl text-white/75 leading-relaxed max-w-sm">
                Coordinate support, program management, and community impact at
                scale.
              </p>

              <div className="mt-8 w-32 h-[3px] bg-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,1)]" />
            </div>

            {/* EMPLOYERS */}
            <div className="flex flex-col items-center mt-24">

              <div className="w-36 h-36 rounded-full border-4 border-cyan-400 flex items-center justify-center bg-black shadow-[0_0_45px_rgba(34,211,238,0.9)]">
                <span className="text-6xl">💼</span>
              </div>

              <h3 className="mt-8 text-4xl font-bold">
                Employers
              </h3>

              <p className="mt-5 text-xl text-white/75 leading-relaxed max-w-sm">
                Discover prepared talent, build stronger teams, and create
                lasting impact.
              </p>

              <div className="mt-8 w-32 h-[3px] bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)]" />
            </div>
          </div>
        </div>

        {/* FOOTER TEXT */}
        <div className="mt-20 text-center relative z-10">

          <h3 className="text-4xl md:text-5xl font-bold">
            HireMinds isn’t just a platform — it’s a{' '}
            <span className="text-blue-400">bridge.</span>
          </h3>

          <p className="mt-5 text-3xl text-white/80">
            One infrastructure. One mission. Unlimited potential.
          </p>
        </div>
      </section>
    </main>
  );
}
