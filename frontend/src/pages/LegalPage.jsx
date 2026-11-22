
import React from 'react';
import {
  Navigation,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Bus,
  Train,
  Route,
  Clock3,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

const interchangePoints = [
  'Indira Nagar - Gachibowli',
  'Raidurg Metro & Bus Interchange',
  'Ameerpet Blue/Red Transfer Station',
  'KPHB Colony & Kukatpally Transit Hub',
  'Secunderabad East & Station Stand'
];

const optimizationFeatures = [
  'Pareto Multi-Objective Ranking',
  'Time-Dependent Timetable Retrieval',
  'Cross-Feed Walking Feasibility',
  'Dynamic Waiting Buffer Calculations',
  'Fare & Reliability Optimization'
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#171326] text-white">
      {/* Background decoration */}
      <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-purple-600/15 blur-[100px]" />
      <div className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-violet-500/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">

        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">

          {/* Brand section */}
          <div className="space-y-5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-purple-900/40 transition-transform group-hover:scale-105">
                <Navigation className="h-5 w-5 text-white" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold tracking-tight">
                  Transit<span className="text-violet-400">Chain</span>
                </h2>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-300/60">
                  Smart Urban Mobility
                </p>
              </div>
            </Link>

            <p className="max-w-sm text-sm leading-7 text-slate-400">
              Hyderabad's unified smart multimodal transportation platform
              connecting TGSRTC buses, HMRL metro trains, and walking
              connections with time-dependent routing.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-semibold text-emerald-300">
                GTFS Feeds Active
              </span>
            </div>
          </div>

          {/* Interchanges */}
          <div>
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                <MapPin className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Key Interchanges
              </h3>
            </div>

            <ul className="space-y-3">
              {interchangePoints.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-xs leading-5 text-slate-400 transition-colors hover:text-violet-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Optimization engine */}
          <div>
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300">
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Optimization Engine
              </h3>
            </div>

            <ul className="space-y-3">
              {optimizationFeatures.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-xs leading-5 text-slate-400 transition-colors hover:text-violet-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Platform information */}
          <div>
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Platform Compliance
              </h3>
            </div>

            <p className="text-xs leading-6 text-slate-400">
              TransitChain respects open transit standards, verified GTFS
              feeds, and authenticated transport provider handoffs.
            </p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 shrink-0 text-violet-400" />
                <span className="text-xs font-bold text-white">
                  Data Integrity
                </span>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-slate-400">
                Strict zero-fake data integrity.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Bus className="h-3.5 w-3.5 text-violet-400" />
                TGSRTC
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Train className="h-3.5 w-3.5 text-violet-400" />
                HMRL
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Route className="h-3.5 w-3.5 text-violet-400" />
                Walking
              </span>
            </div>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="my-10 h-px bg-gradient-to-r from-transparent via-violet-400/20 to-transparent" />

        {/* Bottom footer */}
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-slate-500">
            © {currentYear} TransitChain Technologies. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock3 className="h-3.5 w-3.5 text-violet-400" />
            <span>Built for Smart Hyderabad Urban Mobility</span>
            <ArrowUpRight className="h-3 w-3 text-violet-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}
