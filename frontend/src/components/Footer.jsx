
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Navigation,
  Globe2,
  Route,
  Clock,
  ShieldCheck,
  Bus,
  Train,
  Footprints,
  ArrowUpRight,
  Sparkles,
  MapPin,
  ChevronRight,
} from 'lucide-react';

export default function Footer() {
  const { darkMode } = useTheme();

  const headingClass = darkMode ? 'text-white' : 'text-[#241638]';
  const textClass = darkMode ? 'text-slate-400' : 'text-slate-600';
  const mutedClass = darkMode ? 'text-slate-500' : 'text-slate-500';

  const footerLinks = [
    { label: 'Plan your journey', to: '/search' },
    { label: 'My bookings', to: '/bookings' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Nearby places', to: '/places' },
  ];

  return (
    <footer
      className={`relative overflow-hidden border-t ${
        darkMode
          ? 'bg-[#171326] border-white/10'
          : 'bg-white/65 border-violet-100'
      }`}
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute -top-36 -left-24 w-80 h-80 rounded-full blur-3xl ${
            darkMode ? 'bg-violet-700/10' : 'bg-violet-300/20'
          }`}
        />
        <div
          className={`absolute -bottom-40 right-0 w-96 h-96 rounded-full blur-3xl ${
            darkMode ? 'bg-indigo-700/10' : 'bg-indigo-300/20'
          }`}
        />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-10 pt-14 pb-8">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-5">

            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 shadow-lg shadow-violet-500/25 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                <Navigation className="w-6 h-6" />
              </div>

              <div>
                <h2 className={`text-2xl font-extrabold tracking-tight ${headingClass}`}>
                  Transit<span className="text-violet-500">Chain</span>
                </h2>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-violet-500 mt-0.5">
                  Multimodal mobility
                </p>
              </div>
            </Link>

            <p className={`text-sm leading-7 max-w-md ${textClass}`}>
              A multimodal transportation platform designed to connect people,
              transit networks, and cities worldwide. Discover efficient
              journeys combining public transport, walking corridors, and
              connected mobility options.
            </p>

            <div
              className={`inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl border backdrop-blur-xl ${
                darkMode
                  ? 'bg-emerald-400/5 border-emerald-400/15 text-emerald-300'
                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-700'
              }`}
            >
              <Globe2 className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold">
                Built for connected multimodal transit
              </span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Mobility Options */}
          <div>
            <h3 className={`text-xs font-extrabold uppercase tracking-[0.15em] mb-6 ${headingClass}`}>
              Mobility options
            </h3>

            <ul className="space-y-4">
              <li className={`flex items-center gap-3 text-sm ${textClass}`}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-sky-500/10">
                  <Bus className="w-4 h-4 text-sky-500" />
                </span>
                City bus networks
              </li>

              <li className={`flex items-center gap-3 text-sm ${textClass}`}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-rose-500/10">
                  <Train className="w-4 h-4 text-rose-500" />
                </span>
                Metro and rail lines
              </li>

              <li className={`flex items-center gap-3 text-sm ${textClass}`}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/10">
                  <Footprints className="w-4 h-4 text-emerald-500" />
                </span>
                Walking connections
              </li>

              <li className={`flex items-center gap-3 text-sm ${textClass}`}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-violet-500/10">
                  <Route className="w-4 h-4 text-violet-500" />
                </span>
                Multimodal itineraries
              </li>
            </ul>
          </div>

          {/* Journey Planning */}
          <div>
            <h3 className={`text-xs font-extrabold uppercase tracking-[0.15em] mb-6 ${headingClass}`}>
              Journey planning
            </h3>

            <ul className={`space-y-4 text-sm ${textClass}`}>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                Multi-objective route optimization
              </li>

              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                Real-time schedule coordination
              </li>

              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                Transfer and waiting analysis
              </li>

              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                Fare and distance evaluation
              </li>

              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                Walking strain minimization
              </li>
            </ul>
          </div>

          {/* Standards and Links */}
          <div>
            <h3 className={`text-xs font-extrabold uppercase tracking-[0.15em] mb-6 ${headingClass}`}>
              Standards and terms
            </h3>

            <p className={`text-sm leading-6 mb-5 ${textClass}`}>
              Compliant with standardized GTFS transit data and official
              transport authority provider protocols.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className={`text-xs font-semibold ${textClass}`}>
                  Verified provider schedules
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-violet-500 shrink-0" />
                <span className={`text-xs font-semibold ${textClass}`}>
                  Timetable-aware suggestions
                </span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-sky-500 shrink-0" />
                <span className={`text-xs font-semibold ${textClass}`}>
                  Connected city mobility
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6 text-xs">
              <a
                href="#privacy"
                className="text-violet-500 hover:text-violet-700 transition-colors font-semibold"
              >
                Privacy policy
              </a>

              <a
                href="#terms"
                className="text-violet-500 hover:text-violet-700 transition-colors font-semibold"
              >
                Terms of service
              </a>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div
          className={`mt-12 p-5 rounded-2xl border backdrop-blur-xl ${
            darkMode
              ? 'bg-white/[0.035] border-white/10'
              : 'bg-white/60 border-violet-100'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <p className={`text-sm font-extrabold ${headingClass}`}>
                Explore TransitChain
              </p>
              <p className={`text-xs mt-1 ${mutedClass}`}>
                Your connected journey starts here.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {footerLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 hover:-translate-y-0.5 ${
                    darkMode
                      ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-violet-500/15 hover:text-violet-200'
                      : 'bg-white/80 border-violet-100 text-slate-600 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200'
                  }`}
                >
                  {item.label}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div
          className={`mt-8 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${
            darkMode ? 'border-white/10' : 'border-violet-100'
          }`}
        >
          <p className={`text-xs text-center md:text-left ${mutedClass}`}>
            © {new Date().getFullYear()} TransitChain. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            <span className={`text-xs ${mutedClass}`}>
              Connecting journeys. Simplifying mobility.
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-violet-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
