'use client';

import { Briefcase, Heart, Handshake, User } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* NAVBAR */}
      <nav className="w-full border-b border-white/10 px-10 py-5 flex items-center justify-between bg-black">
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
      <section className="relative flex flex-col items-center text-center px-6 pt-14 pb-32">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.25),transparent_60%)] pointer-events-none" />

        <p className="text-[#1E90FF] tracking-[0.35em] uppercase text-sm font-semibold mb-6">
          Workforce Infrastructure Platform
        </p>

        <h1 className="text-6xl md:text-8xl font-extrabold leading-none tracking-tight max-w-7xl">
          Build Your Career Passport
        </h1>

        <p className="mt-8 text-2xl text-white/80 max-w-4xl leading-relaxed">
          HireMinds helps people strengthen visibility, organize career tools,
          prepare for opportunities, and keep momentum moving forward.
        </p>

        {/* BUTTON */}
        <button className="mt-12 px-12 py-5 rounded-2xl bg-white text-black text-2xl font-semibold shadow-[0_0_35px_rgba(255,255,255,0.4)] hover:scale-105 transition">
          Create Career Passport / Sign Up
        </button>

        {/* LOGO */}
        <div className="mt-20 relative">
          <div className="absolute -inset-10 bg-blue-500/20 blur-3xl rounded-full" />

          <div className="relative text-center">
            <div className="text-[12rem] md:text-[18rem] font-black leading-none bg-gradient-to-b from-white via-gray-300 to-blue-500 bg-clip-text text-transparent tracking-tight">
              HM
            </div>

            <div className="absolute right-0 bottom-10 w-10 h-10 rounded-full bg-blue-400 blur-sm shadow-[0_0_40px_15px_rgba(59,130,246,0.9)]" />

            <div className="text-5xl md:text-6xl tracking-[0.4em] font-semibold mt-2">
              HIRE
              <span className="text-blue-500">MINDS</span>
            </div>
          </div>
        </div>

        {/* WHO WE ARE */}
        <div className="mt-20 w-full max-w-6xl">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="h-[2px] w-52 bg-blue-500" />

            <span className="uppercase tracking-[0.35em] text-[#1E90FF] font-semibold text-lg">
              Who We Are
            </span>

            <div className="h-[2px] w-52 bg-blue-500" />
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

        {/* CONNECTION WAVE */}
        <div className="relative w-full max-w-[1800px] mt-24">
          {/* glowing line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 blur-sm" />

          {/* ICON SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-start relative z-10">
            {/* Participants */}
            <div className="flex flex-col items-center">
              <div className="w-36 h-36 rounded-full border-4 border-blue-500 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.8)]">
                <User size={60} className="text-blue-400" />
              </div>

              <h3 className="mt-8 text-4xl font-bold">Participants</h3>

              <p className="mt-5 text-xl text-white/75 leading-relaxed max-w-sm">
                Build visibility, access tools, and prepare for meaningful
                career opportunities.
              </p>

              <div className="mt-8 w-32 h-[3px] bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)]" />
            </div>

            {/* Justice Impact */}
            <div className="flex flex-col items-center">
              <div className="w-36 h-36 rounded-full border-4 border-green-500 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.8)]">
                <Handshake size={60} className="text-green-400" />
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
            <div className="flex flex-col items-center -mt-10">
              <div className="relative w-72 h-72 rounded-full border-4 border-blue-500 bg-black flex items-center justify-center shadow-[0_0_70px_rgba(59,130,246,0.8)]">
                <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-2xl" />

                <div className="text-[7rem] font-black bg-gradient-to-b from-white via-gray-300 to-blue-500 bg-clip-text text-transparent">
                  HM
                </div>
              </div>

              <h3 className="mt-8 text-5xl font-bold">HireMinds</h3>

              <p className="text-2xl mt-3">
                One Platform.
                <br />
                <span className="text-blue-400">Unlimited</span> Impact.
              </p>
            </div>

            {/* Nonprofits */}
            <div className="flex flex-col items-center">
              <div className="w-36 h-36 rounded-full border-4 border-fuchsia-500 flex items-center justify-center shadow-[0_0_40px_rgba(217,70,239,0.8)]">
                <Heart size={60} className="text-fuchsia-400" />
              </div>

              <h3 className="mt-8 text-4xl font-bold">Nonprofits</h3>

              <p className="mt-5 text-xl text-white/75 leading-relaxed max-w-sm">
                Coordinate support, program management, and community impact at
                scale.
              </p>

              <div className="mt-8 w-32 h-[3px] bg-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,1)]" />
            </div>

            {/* Employers */}
            <div className="flex flex-col items-center">
              <div className="w-36 h-36 rounded-full border-4 border-cyan-400 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.8)]">
                <Briefcase size={60} className="text-cyan-300" />
              </div>

              <h3 className="mt-8 text-4xl font-bold">Employers</h3>

              <p className="mt-5 text-xl text-white/75 leading-relaxed max-w-sm">
                Discover prepared talent, build stronger teams, and create
                lasting impact.
              </p>

              <div className="mt-8 w-32 h-[3px] bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)]" />
            </div>
          </div>
        </div>

        {/* FOOTER TEXT */}
        <div className="mt-24 text-center">
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
