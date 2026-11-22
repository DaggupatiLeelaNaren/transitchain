
import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Navigation,
  Ticket,
  Compass,
  MessageSquare,
  ShieldAlert,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function Navbar({ onOpenChat }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinkClass = ({ isActive }) =>
    `group inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'text-violet-700 bg-violet-100/80 shadow-sm'
        : darkMode
          ? 'text-slate-300 hover:text-white hover:bg-white/10'
          : 'text-slate-600 hover:text-violet-700 hover:bg-violet-50'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
      isActive
        ? 'bg-violet-100 text-violet-800'
        : darkMode
          ? 'text-slate-200 hover:bg-white/10'
          : 'text-slate-700 hover:bg-violet-50 hover:text-violet-700'
    }`;

  const themeButtonClass = darkMode
    ? 'border-white/10 bg-white/10 text-amber-300 hover:bg-white/15'
    : 'border-violet-200/70 bg-white/70 text-violet-700 hover:bg-violet-100';

  const panelClass = darkMode
    ? 'bg-[#171326]/95 border-white/10'
    : 'bg-white/90 border-violet-100/80';

  return (
    <nav
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-2xl transition-colors duration-300 ${
        darkMode
          ? 'bg-[#171326]/85 border-white/10 shadow-[0_8px_35px_rgba(0,0,0,0.2)]'
          : 'bg-white/75 border-violet-100/80 shadow-[0_8px_35px_rgba(76,29,149,0.07)]'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[76px] flex items-center justify-between gap-4">

          {/* Brand */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 shrink-0 group"
          >
            <div className="relative w-11 h-11 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 shadow-lg shadow-violet-500/25 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Navigation className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-fuchsia-300 border-2 border-white" />
            </div>

            <div className="leading-tight">
              <span
                className={`block text-xl font-extrabold tracking-tight ${
                  darkMode ? 'text-white' : 'text-[#241638]'
                }`}
              >
                Transit<span className="text-violet-600">Chain</span>
              </span>
              <span
                className={`block text-[10px] font-bold tracking-[0.16em] uppercase mt-1 ${
                  darkMode ? 'text-violet-300' : 'text-violet-600'
                }`}
              >
                Multimodal mobility
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">

            <NavLink to="/search" className={navLinkClass}>
              <Compass className="w-4 h-4 text-violet-500" />
              <span>Plan journey</span>
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink to="/bookings" className={navLinkClass}>
                  <Ticket className="w-4 h-4 text-emerald-500" />
                  <span>My bookings</span>
                </NavLink>

                <NavLink to="/dashboard" className={navLinkClass}>
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink to="/profile" className={navLinkClass}>
                  <User className="w-4 h-4 text-sky-500" />
                  <span>My profile</span>
                </NavLink>
              </>
            )}

            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-amber-100 text-amber-800'
                      : darkMode
                        ? 'text-amber-300 hover:bg-amber-400/10'
                        : 'text-amber-700 hover:bg-amber-50'
                  }`
                }
              >
                <ShieldAlert className="w-4 h-4" />
                Admin
              </NavLink>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 ${themeButtonClass}`}
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {darkMode ? 'Light' : 'Dark'}
            </button>

            {/* Assistant */}
            {onOpenChat && (
              <button
                type="button"
                onClick={onOpenChat}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 hover:-translate-y-0.5 transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                Assistant
              </button>
            )}

            {/* User Account */}
            {isAuthenticated ? (
              <div
                className={`flex items-center gap-3 pl-4 ml-1 border-l ${
                  darkMode ? 'border-white/15' : 'border-violet-200'
                }`}
              >
                <div className="text-right max-w-[120px]">
                  <p
                    className={`text-xs font-extrabold truncate ${
                      darkMode ? 'text-white' : 'text-[#241638]'
                    }`}
                  >
                    {user?.name || 'Passenger'}
                  </p>
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-wide mt-0.5 ${
                      darkMode ? 'text-violet-300' : 'text-violet-600'
                    }`}
                  >
                    {user?.role || 'Passenger'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  aria-label="Logout"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    darkMode
                      ? 'bg-white/10 text-slate-200 hover:bg-red-500/20 hover:text-red-300'
                      : 'bg-violet-100 text-violet-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-3 border-l border-violet-200">
                <Link
                  to="/login"
                  className={`px-3 py-2 text-sm font-bold transition-colors ${
                    darkMode
                      ? 'text-slate-200 hover:text-white'
                      : 'text-slate-600 hover:text-violet-700'
                  }`}
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 hover:-translate-y-0.5 transition-all"
                >
                  Get started
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${themeButtonClass}`}
              aria-label="Toggle theme"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {onOpenChat && (
              <button
                type="button"
                onClick={onOpenChat}
                className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center"
                aria-label="Open assistant"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                darkMode
                  ? 'text-white bg-white/10 hover:bg-white/15'
                  : 'text-violet-800 bg-violet-100 hover:bg-violet-200'
              }`}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-t backdrop-blur-2xl ${panelClass}`}>
          <div className="max-w-[1440px] mx-auto px-4 py-5 space-y-2">

            <NavLink
              to="/search"
              onClick={closeMobileMenu}
              className={mobileLinkClass}
            >
              <Compass className="w-5 h-5 text-violet-500" />
              Plan journey
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink
                  to="/bookings"
                  onClick={closeMobileMenu}
                  className={mobileLinkClass}
                >
                  <Ticket className="w-5 h-5 text-emerald-500" />
                  My bookings
                </NavLink>

                <NavLink
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className={mobileLinkClass}
                >
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  Dashboard
                </NavLink>

                <NavLink
                  to="/profile"
                  onClick={closeMobileMenu}
                  className={mobileLinkClass}
                >
                  <User className="w-5 h-5 text-sky-500" />
                  My profile
                </NavLink>
              </>
            )}

            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={closeMobileMenu}
                className={mobileLinkClass}
              >
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Admin portal
              </NavLink>
            )}

            <div
              className={`my-3 border-t ${
                darkMode ? 'border-white/10' : 'border-violet-100'
              }`}
            />

            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="px-4 py-2">
                  <p
                    className={`text-sm font-bold ${
                      darkMode ? 'text-white' : 'text-[#241638]'
                    }`}
                  >
                    {user?.name || 'Passenger'}
                  </p>
                  <p className="text-xs text-violet-500 mt-1">
                    {user?.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className={`text-center px-4 py-3 rounded-xl border text-sm font-bold ${
                    darkMode
                      ? 'border-white/15 text-white'
                      : 'border-violet-200 text-violet-700'
                  }`}
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="text-center px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
