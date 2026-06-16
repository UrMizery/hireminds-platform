```tsx
'use client';

import {
  Briefcase,
  Heart,
  Handshake,
  User,
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* BACKGROUND GLOW */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(0,119,255,0.18),transparent_45%),radial-gradient(circle_at_bottom,rgba(0,80,180,0.15),transparent_40%)] pointer-events-none" />

      {/* NAVBAR */}
      <nav className="relative z-20 w-full border-b border-white/10 px-8 md:px-14 py-5 flex items-center justify-between bg-black/70 backdrop-blur-md">

        {/* LEFT */}
        <div className="text-3xl md:text-4xl font-semibold tracking-tight">
          HireMinds
        </div>

        {/* CENTER NAV */}
        <div className="hidden lg:flex items-center gap-10 text-base text-white/85">
          <a href="#" className="hover:text-blue-400 transition">
            Home
          </a>

          <a href="#" className="hover:text-blue-400 transition">
            Sign In
          </a>

          <a href="#" className="hover:text-blue-400 transition">
            Partner with HireMinds
          </a>

          <a href="#" className="hover:text-blue-400 transition">
            Contact Us
          </a>
        </div>

        {/* RIGHT */}
        <div className="hidden md:flex items-center gap-8 text-sm">

          <div className="flex items-center gap-2">
            <span className="text-white/80">
              Job Board
            </span>

            <span className="text-yellow-400 text-lg">
              🔒
            </span>
          </div>

          <a
            href="#"
            className="text-white/80 hover:text-blue-400 transition"
          >
            Employer / Partner Sign In
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-28">

        {/* TOP LABEL */}
        <p className="text-[#3ea6ff] tracking-[0.35em] uppercase text-xs md:text-sm font-semibold mb-8">
          Workforce Infrastructure Platform
        </p>

        {/* MAIN TITLE */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold leading-[0.95] tracking-tight max-w-7xl">
          Build Your Career Passport
        </h1>

        {/* SUBTEXT */}
        <p className="mt-8 text-lg md:text-2xl text-white/75 max-w-4xl leading-relaxed">
          HireMinds helps people strengthen visibility,
          organize career tools, prepare for opportunities,
          and keep momentum moving forward.
        </p>

        {/* CTA BUTTON */}
        <button className="mt-12 px-10 py-5 rounded-2xl bg-white text-black text-xl md:text-2xl font-semibold shadow-[0_0_45px_rgba(255,255,255,0.45)] hover:scale-105 transition duration-300">
          Create Career Passport / Sign Up
        </button>

        {/* LOGO */}
        <div className="relative mt-14 flex items-center justify-center">

          {/* Glow */}
          <div className="absolute w-[650px] h-[650px] rounded-full bg-blue-500/20 blur-[120px]" />

          {/* Orb */}
          <div className="absolute w-[460px] h-[460px] rounded-full border border-blue-400/20 shadow-[0_0_120px_rgba(59,130,246,0.45)]" />

          {/* HM IMAGE */}
          <img
            src="/hm-logo.png"
            alt="HireMinds"
            className="relative z-10 w-[340px] md:w-[620px] drop-shadow-[0_0_50px_rgba(59,130,246,0.9)]"
          />
        </div>

        {/* WHO WE ARE */}
        <div className="mt-10 w-full max-w-6xl">

          <div className="flex items-center justify-center gap-5 mb-8">

            <div className="h-[2px] w-24 md:w-44 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.9)]" />

            <span className="uppercase tracking-[0.35em] text-[#3ea6ff] text-sm md:text-base font-semibold">
              Who We Are
            </span>

            <div className="h-[2px] w-24 md:w-44 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.9)]" />

          </div>

          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            The Bridge Between Potential and Opportunity
          </h2>

          <p className="mt-8 text-lg md:text-2xl text-white/75 leading-relaxed max-w-5xl mx-auto">
            HireMinds is a workforce infrastructure platform that connects
            people, purpose, and opportunity. We bridge the gap between
            Participants, Justice Impact Partners, Nonprofits, and Employers
            through one unified ecosystem built for real outcomes.
          </p>
        </div>

        {/* BRIDGE SECTION */}
        <div className="relative w-full max-w-[1800px] mt-28 px-4">

          {/* MAIN BRIDGE */}
          <div className="absolute top-[110px] left-[8%] right-[8%] h-[3px] bg-gradient-to-r from-blue-500 via-fuchsia-500 to-cyan-400 blur-[1px] shadow-[0_0_35px_rgba(59,130,246,0.8)]" />

          {/* SECONDARY GLOW */}
          <div className="absolute top-[110px] left-[10%] right-[10%] h-[1px] bg-white/30 blur-sm" />

          {/* ICON GRID */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-14 items-start">

            {/* PARTICIPANTS */}
            <div className="flex flex-col items-center">

              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[3px] border-blue-500 flex items-center justify-center bg-black shadow-[0_0_45px_rgba(59,130,246,0.85)]">

                <User
                  size={62}
                  className="text-blue-400"
                  strokeWidth={1.5}
                />

              </div>

              <h3 className="mt-8 text-3xl md:text-4xl font-bold">
                Participants
              </h3>

              <p className="mt-5 text-lg text-white/70 leading-relaxed max-w-sm">
                Build visibility, access tools, and prepare
                for meaningful career opportunities.
              </p>
            </div>

            {/* JUSTICE */}
            <div className="flex flex-col items-center">

              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[3px] border-green-500 flex items-center justify-center bg-black shadow-[0_0_45px_rgba(34,197,94,0.8)]">

                <Handshake
                  size={62}
                  className="text-green-400"
                  strokeWidth={1.5}
                />

              </div>

              <h3 className="mt-8 text-3xl md:text-4xl font-bold text-center">
                Justice Impact
                <br />
                Partners
              </h3>

              <p className="mt-5 text-lg text-white/70 leading-relaxed max-w-sm">
                Connect individuals to support,
                resources, and pathways that drive real change.
              </p>
            </div>

            {/* CENTER */}
            <div className="flex flex-col items-center -mt-10">

              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-[3px] border-blue-500 flex items-center justify-center bg-black shadow-[0_0_90px_rgba(59,130,246,0.9)]">

                <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-3xl" />

                <img
                  src="/hm-logo.png"
                  alt="HM"
                  className="w-44 md:w-60 relative z-10"
                />

              </div>

              <h3 className="mt-8 text-4xl md:text-5xl font-bold">
                HireMinds
              </h3>

              <p className="text-xl md:text-2xl mt-4 leading-relaxed">
                One Platform.
                <br />

                <span className="text-blue-400">
                  Unlimited
                </span>{' '}
                Impact.
              </p>
            </div>

            {/* NONPROFITS */}
            <div className="flex flex-col items-center">

              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[3px] border-fuchsia-500 flex items-center justify-center bg-black shadow-[0_0_45px_rgba(217,70,239,0.8)]">

                <Heart
                  size={62}
                  className="text-fuchsia-400"
                  strokeWidth={1.5}
                />

              </div>

              <h3 className="mt-8 text-3xl md:text-4xl font-bold">
                Nonprofits
              </h3>

              <p className="mt-5 text-lg text-white/70 leading-relaxed max-w-sm">
                Coordinate support, program management,
                and community impact at scale.
              </p>
            </div>

            {/* EMPLOYERS */}
            <div className="flex flex-col items-center">

              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[3px] border-cyan-400 flex items-center justify-center bg-black shadow-[0_0_45px_rgba(34,211,238,0.8)]">

                <Briefcase
                  size={62}
                  className="text-cyan-300"
                  strokeWidth={1.5}
                />

              </div>

              <h3 className="mt-8 text-3xl md:text-4xl font-bold">
                Employers
              </h3>

              <p className="mt-5 text-lg text-white/70 leading-relaxed max-w-sm">
                Discover prepared talent, build stronger teams,
                and create lasting impact.
              </p>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-28 text-center">

          <h3 className="text-3xl md:text-5xl font-bold leading-tight">
            HireMinds isn’t just a platform —
            it’s a{' '}
            <span className="text-blue-400">
              bridge.
            </span>
          </h3>

          <p className="mt-6 text-xl md:text-3xl text-white/75">
            One infrastructure. One mission. Unlimited potential.
          </p>
        </div>

      </section>
    </main>
  );
}
```
