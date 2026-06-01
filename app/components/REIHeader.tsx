"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Hand,
  X,
  Briefcase,
  GraduationCap,
  Wrench,
} from "lucide-react";

export default function REIHeader() {
  const [open, setOpen] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const waveInterval = setInterval(() => {
      setAnimate(true);

      setTimeout(() => {
        setAnimate(false);
      }, 2000);
    }, 12000);

    return () => clearInterval(waveInterval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, 9000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex items-center gap-2">
      {/* REI ICON */}
      <button
        onClick={() => setOpen(!open)}
        className="group relative flex items-center gap-2 rounded-full border border-blue-500/30 bg-slate-950/90 px-3 py-2 shadow-lg shadow-blue-500/20 transition hover:scale-105"
      >
        {/* Floating Glow */}
        <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl" />

        {/* REI HEAD */}
        <div
          className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-slate-100 transition-all duration-500 ${
            animate ? "animate-bounce" : "animate-float"
          }`}
        >
          {/* Eyes */}
          <div className="absolute left-2 top-4 h-2 w-2 rounded-full bg-blue-900 animate-pulse" />
          <div className="absolute right-2 top-4 h-2 w-2 rounded-full bg-blue-900 animate-pulse" />

          {/* Smile */}
          <div className="absolute bottom-3 h-1.5 w-4 rounded-full bg-blue-900" />

          {/* Cape */}
          <div className="absolute -bottom-1 left-1 h-4 w-8 rounded-b-full bg-gradient-to-r from-blue-900 to-red-950" />
        </div>

        {/* REI TEXT */}
        <div className="flex items-center gap-1">
          <span className="font-bold tracking-wide text-white">
            REI
          </span>

          {/* NOTIFICATION */}
          <span
            className={`flex items-center ${
              animate ? "animate-wave" : ""
            }`}
          >
            👋
          </span>
        </div>
      </button>

      {/* PANEL */}
      {open && (
        <div className="absolute left-0 top-16 z-50 w-80 overflow-hidden rounded-2xl border border-blue-500/20 bg-slate-950 text-white shadow-2xl shadow-blue-500/20">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <h2 className="font-bold text-blue-400">
                Hi there 👋
              </h2>

              <p className="text-xs text-slate-400">
                Here’s what’s new on HireMinds
              </p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-slate-800"
            >
              <X size={16} />
            </button>
          </div>

          {/* UPDATES */}
          <div className="space-y-3 p-4">
            <div className="flex items-start gap-3 rounded-xl bg-slate-900 p-3">
              <Briefcase className="mt-0.5 text-blue-400" size={18} />

              <div>
                <p className="text-sm font-medium">
                  New Jobs Added
                </p>

                <p className="text-xs text-slate-400">
                  Warehouse & healthcare opportunities updated.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-slate-900 p-3">
              <GraduationCap
                className="mt-0.5 text-blue-400"
                size={18}
              />

              <div>
                <p className="text-sm font-medium">
                  Workshop Reminder
                </p>

                <p className="text-xs text-slate-400">
                  Resume Workshop opens Friday at 5PM.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-slate-900 p-3">
              <Sparkles
                className="mt-0.5 text-yellow-400"
                size={18}
              />

              <div>
                <p className="text-sm font-medium">
                  New Feature
                </p>

                <p className="text-xs text-slate-400">
                  Career Toolkit has been updated.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-slate-900 p-3">
              <Wrench
                className="mt-0.5 text-blue-400"
                size={18}
              />

              <div>
                <p className="text-sm font-medium">
                  Ask REI
                </p>

                <p className="text-xs text-slate-400">
                  Ask questions about HireMinds tools, resumes,
                  interviews, spelling, wording, and more.
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-slate-800 px-4 py-3">
            <button className="w-full rounded-xl bg-blue-600 py-2 text-sm font-semibold transition hover:bg-blue-500">
              Open REI
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes wave {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(20deg);
          }
          50% {
            transform: rotate(-10deg);
          }
          75% {
            transform: rotate(20deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
