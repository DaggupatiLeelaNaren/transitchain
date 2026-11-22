
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  userService,
  bookingService,
  journeyService
} from '../services/api';

import {
  User,
  Heart,
  Ticket,
  Clock,
  Compass,
  Settings,
  ShieldCheck,
  ArrowRight,
  Trash2,
  Check,
  Bus,
  Train,
  Footprints,
  MapPin,
  Route,
  SlidersHorizontal,
  History,
  Sparkles,
  CalendarDays,
  RefreshCw
} from 'lucide-react';

const transportModes = [
  { value: 'bus', label: 'Bus', icon: Bus },
  { value: 'metro', label: 'Metro', icon: Train },
  { value: 'walk', label: 'Walking', icon: Footprints }
];

const formatDate = (value) => {
  if (!value) return 'Date unavailable';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState({
    preferredModes: ['bus', 'metro', 'walk'],
    maxWalkingDistanceMeters: 2000,
    maxTransfers: 3,
    optimizationPreference: 'balanced'
  });

  const [favorites, setFavorites] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingPref, setSavingPref] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchDashboardData = async () => {
      try {
        const [prefRes, favRes, bookRes, histRes] = await Promise.all([
          userService.getPreferences(),
          userService.getFavorites(),
          bookingService.getAll(),
          journeyService.getHistory()
        ]);

        if (!active) return;

        if (prefRes.data?.data) {
          setPreferences(prev => ({
            ...prev,
            ...prefRes.data.data,
            preferredModes:
              prefRes.data.data.preferredModes || prev.preferredModes
          }));
        }

        if (favRes.data?.data) {
          setFavorites(favRes.data.data);
        }

        if (bookRes.data?.data) {
          setRecentBookings(bookRes.data.data.slice(0, 3));
        }

        if (histRes.data?.data) {
          setHistory(histRes.data.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      active = false;
    };
  }, []);

  const handleSavePreferences = async (e) => {
    e.preventDefault();

    setSavingPref(true);
    setSaveSuccess(false);

    try {
      await userService.updatePreferences(preferences);
      setSaveSuccess(true);

      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSavingPref(false);
    }
  };

  const toggleMode = (mode) => {
    setPreferences(prev => {
      const selected = prev.preferredModes || [];

      const updated = selected.includes(mode)
        ? selected.filter(item => item !== mode)
        : [...selected, mode];

      return {
        ...prev,
        preferredModes: updated
      };
    });
  };

  const handleDeleteFavorite = async (id) => {
    try {
      await userService.deleteFavorite(id);

      setFavorites(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      console.error('Unable to delete favorite:', err);
    }
  };

  const handleLaunchFavorite = (fav) => {
    const query = new URLSearchParams({
      origin: fav.origin?.name || '',
      destination: fav.destination?.name || '',
      modes: (fav.modes || preferences.preferredModes || [
        'bus',
        'metro',
        'walk'
      ]).join(',')
    }).toString();

    navigate(`/search?${query}`);
  };

  const getHistoryTitle = (item) => {
    return (
      item.title ||
      item.routeShortName ||
      item.origin?.name && item.destination?.name
        ? `${item.origin?.name || 'Origin'} → ${item.destination?.name || 'Destination'}`
        : 'Previous journey'
    );
  };

  if (loading) {
    return (
      <div className="tc-page min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-violet-100 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-violet-700 animate-spin" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="tc-page min-h-screen py-8 sm:py-10 px-4 sm:px-6">
      <div className="tc-container max-w-7xl mx-auto space-y-8">

        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#241342] via-[#4C1D95] to-[#6D28D9] p-6 sm:p-9 text-white shadow-2xl shadow-violet-950/15">
          <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 w-72 h-72 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-7">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl flex items-center justify-center text-2xl sm:text-3xl font-extrabold shadow-xl">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-violet-200">
                    Your Travel Space
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
                    <ShieldCheck className="w-3 h-3" />
                    {user?.role === 'admin' ? 'Administrator' : 'Verified Passenger'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Welcome back, {user?.name || 'Traveller'}!
                </h1>

                <p className="text-sm text-violet-200 mt-2 break-all">
                  {user?.email}
                </p>
              </div>
            </div>

            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-violet-800 font-bold text-sm shadow-xl hover:bg-violet-50 hover:-translate-y-0.5 transition-all"
            >
              <Compass className="w-4 h-4" />
              Plan New Journey
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/15">
            {[
              { label: 'Saved Corridors', value: favorites.length, icon: Heart },
              { label: 'Recent Bookings', value: recentBookings.length, icon: Ticket },
              { label: 'Journey History', value: history.length, icon: History },
              { label: 'Travel Modes', value: preferences.preferredModes?.length || 0, icon: Route }
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/[0.08] backdrop-blur-md p-3 sm:p-4"
              >
                <div className="flex items-center gap-2 text-violet-200">
                  <stat.icon className="w-4 h-4" />
                  <span className="text-[10px] sm:text-xs font-medium">
                    {stat.label}
                  </span>
                </div>
                <p className="text-2xl font-extrabold mt-2 tabular-nums">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Saved Corridors */}
            <section className="tc-glass rounded-3xl p-5 sm:p-6 border border-white/70 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">Saved Corridors</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your frequently travelled routes
                    </p>
                  </div>
                </div>

                <span className="tc-pill text-xs">
                  {favorites.length} saved
                </span>
              </div>

              {favorites.length === 0 ? (
                <div className="py-9 text-center rounded-2xl bg-violet-50/60 border border-dashed border-violet-200">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-white flex items-center justify-center shadow-sm">
                    <Heart className="w-6 h-6 text-violet-400" />
                  </div>
                  <p className="font-semibold text-slate-700 mt-3">
                    No saved journeys yet
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Save a journey from your search results to find it here.
                  </p>
                  <Link
                    to="/search"
                    className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-violet-700 hover:text-violet-900"
                  >
                    Explore journeys <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {favorites.map((fav) => (
                    <div
                      key={fav._id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-violet-100 bg-white/70 p-4 hover:border-violet-300 hover:shadow-md hover:shadow-violet-100/60 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => handleLaunchFavorite(fav)}
                        className="flex items-center gap-3 min-w-0 text-left"
                      >
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-violet-100 flex items-center justify-center">
                          <Route className="w-5 h-5 text-violet-700" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-800 group-hover:text-violet-700 transition-colors truncate">
                            {fav.title || 'Saved Journey'}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 truncate">
                            {fav.origin?.name || 'Origin'} → {fav.destination?.name || 'Destination'}
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center gap-2 sm:shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLaunchFavorite(fav)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-violet-50 text-violet-700 border border-violet-100 text-xs font-bold hover:bg-violet-100 transition-colors"
                        >
                          Find Times
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteFavorite(fav._id)}
                          aria-label="Delete saved journey"
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Bookings */}
            <section className="tc-glass rounded-3xl p-5 sm:p-6 border border-white/70 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">Recent Bookings</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your latest ticket activity
                    </p>
                  </div>
                </div>

                <Link
                  to="/bookings"
                  className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 hover:text-violet-900"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentBookings.length === 0 ? (
                <div className="py-8 text-center rounded-2xl bg-emerald-50/50 border border-dashed border-emerald-200">
                  <Ticket className="w-8 h-8 mx-auto text-emerald-400" />
                  <p className="text-sm font-semibold text-slate-700 mt-3">
                    No recent bookings
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Your confirmed tickets will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 bg-white/70 hover:border-emerald-200 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">
                            {booking.routeShortName || 'Journey'}
                          </span>

                          <span className="text-[10px] font-mono bg-violet-50 border border-violet-100 text-violet-700 px-2 py-1 rounded-lg">
                            {booking.bookingReference || 'Booking'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-2">
                          {booking.fromStopName || 'Origin'} → {booking.toStopName || 'Destination'}
                        </p>

                        <p className="text-[11px] text-slate-400 mt-1">
                          <Clock className="inline w-3 h-3 mr-1" />
                          {booking.departureTime || 'Time unavailable'}
                        </p>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <p className="text-base font-extrabold text-slate-900">
                          ₹{booking.totalFare ?? '—'}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                          {booking.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Journey History */}
            <section className="tc-glass rounded-3xl p-5 sm:p-6 border border-white/70 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <History className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Recent Journey History</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your recently searched journeys
                  </p>
                </div>
              </div>

              {history.length === 0 ? (
                <div className="py-7 text-center rounded-2xl bg-indigo-50/50 border border-dashed border-indigo-200">
                  <Compass className="w-8 h-8 mx-auto text-indigo-400" />
                  <p className="text-sm font-semibold text-slate-700 mt-3">
                    No journey history yet
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Start planning a journey to build your travel history.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-slate-100"
                    >
                      <div className="w-9 h-9 shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-indigo-600" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {item.origin?.name && item.destination?.name
                            ? `${item.origin.name} → ${item.destination.name}`
                            : item.title || item.routeShortName || 'Previous journey'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {formatDate(item.createdAt || item.searchedAt || item.date)}
                        </p>
                      </div>

                      <Clock className="w-4 h-4 text-slate-300 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Travel Preferences */}
          <aside className="space-y-6">
            <section className="tc-glass rounded-3xl p-5 sm:p-6 border border-white/70 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-violet-700" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Travel Preferences</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize your journey experience
                  </p>
                </div>
              </div>

              <form onSubmit={handleSavePreferences} className="space-y-6">

                {/* Transport Modes */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-3">
                    Preferred Transport Modes
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {transportModes.map((mode) => {
                      const Icon = mode.icon;
                      const selected = (preferences.preferredModes || []).includes(mode.value);

                      return (
                        <button
                          key={mode.value}
                          type="button"
                          onClick={() => toggleMode(mode.value)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                            selected
                              ? 'bg-violet-100 border-violet-300 text-violet-800 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-violet-200'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {mode.label}
                          {selected && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optimization */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Optimization Priority
                  </label>

                  <div className="relative">
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 pointer-events-none" />

                    <select
                      value={preferences.optimizationPreference}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          optimizationPreference: e.target.value
                        })
                      }
                      className="tc-input w-full pl-10 pr-3 py-3 rounded-xl text-sm appearance-none"
                    >
                      <option value="balanced">Balanced Journey</option>
                      <option value="fastest">Fastest Travel Time</option>
                      <option value="lowest_fare">Lowest Fare</option>
                      <option value="fewest_transfers">Fewest Transfers</option>
                      <option value="least_walking">Least Walking</option>
                    </select>
                  </div>
                </div>

                {/* Walking Distance */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-slate-700">
                      Maximum Walking Distance
                    </label>
                    <span className="text-xs font-extrabold text-violet-700 bg-violet-50 px-2 py-1 rounded-lg">
                      {preferences.maxWalkingDistanceMeters}m
                    </span>
                  </div>

                  <input
                    type="range"
                    min="500"
                    max="3500"
                    step="250"
                    value={preferences.maxWalkingDistanceMeters}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        maxWalkingDistanceMeters: parseInt(e.target.value, 10)
                      })
                    }
                    className="w-full accent-violet-600 cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                    <span>500m</span>
                    <span>3.5km</span>
                  </div>
                </div>

                {/* Transfers */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Maximum Transfers Allowed
                  </label>

                  <select
                    value={preferences.maxTransfers}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        maxTransfers: parseInt(e.target.value, 10)
                      })
                    }
                    className="tc-input w-full px-3 py-3 rounded-xl text-sm"
                  >
                    <option value={1}>1 Transfer</option>
                    <option value={2}>2 Transfers</option>
                    <option value={3}>3 Transfers</option>
                  </select>
                </div>

                {/* Save */}
                <button
                  type="submit"
                  disabled={savingPref}
                  className="tc-button-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      Preferences Saved
                    </>
                  ) : savingPref ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Preferences
                    </>
                  )}
                </button>
              </form>
            </section>

            {/* Quick Actions */}
            <section className="rounded-3xl bg-gradient-to-br from-[#F2ECFF] to-[#E9E8FF] border border-violet-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="w-5 h-5 text-violet-700" />
                <h3 className="font-bold text-slate-900">Quick Actions</h3>
              </div>

              <div className="space-y-2">
                <Link
                  to="/search"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/80 hover:bg-white border border-white transition-all group"
                >
                  <span className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <Compass className="w-4 h-4 text-violet-600" />
                    Search Journeys
                  </span>
                  <ArrowRight className="w-4 h-4 text-violet-500 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/bookings"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/80 hover:bg-white border border-white transition-all group"
                >
                  <span className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                    <Ticket className="w-4 h-4 text-violet-600" />
                    Manage Bookings
                  </span>
                  <ArrowRight className="w-4 h-4 text-violet-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </section>
          </aside>
        </div>

        {/* Bottom Information */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3">
          <p className="text-xs text-slate-400">
            Your journeys, preferences and bookings in one place.
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-violet-600">
            <ShieldCheck className="w-4 h-4" />
            TransitChain Passenger Dashboard
          </div>
        </div>

      </div>
    </div>
  );
}
