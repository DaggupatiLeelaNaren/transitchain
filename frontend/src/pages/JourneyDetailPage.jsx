
import React, { useState, useEffect } from 'react';
import {
  useParams,
  useLocation,
  useNavigate,
  Link
} from 'react-router-dom';

import {
  journeyService,
  bookingService,
  userService
} from '../services/api';

import { useAuth } from '../context/AuthContext';
import JourneyMap from '../components/JourneyMap';

import {
  ArrowLeft,
  Clock,
  Footprints,
  Bus,
  Train,
  CheckCircle2,
  Ticket,
  Heart,
  Navigation,
  Utensils,
  AlertCircle,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
  Route,
  RefreshCw,
  Wallet,
  Star
} from 'lucide-react';

export default function JourneyDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [alternative, setAlternative] = useState(
    location.state?.alternative || null
  );

  const [loading, setLoading] = useState(!alternative);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [favoriteSaved, setFavoriteSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!alternative && id) {
      let active = true;

      const fetchJourney = async () => {
        try {
          const res = await journeyService.getById(id);
          const journey = res.data.data;

          if (active && journey.alternatives?.length > 0) {
            setAlternative(journey.alternatives[0]);
          } else if (active) {
            setError('No journey alternatives are available.');
          }
        } catch (err) {
          if (active) {
            setError('Could not load journey details.');
          }
        } finally {
          if (active) setLoading(false);
        }
      };

      fetchJourney();

      return () => {
        active = false;
      };
    }
  }, [id, alternative]);

  const legs = alternative?.legs || [];
  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];

  const handleBookTrip = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!alternative || !legs.length) return;

    setBookingLoading(true);
    setError(null);

    const firstTransit =
      legs.find(leg => leg.leg_type === 'transit') || firstLeg;

    try {
      const res = await bookingService.create({
        journeyId: id,
        providerCode: firstTransit.provider_name?.includes('Metro')
          ? 'HMRL'
          : 'TGSRTC',
        routeShortName: firstTransit.route_short_name || 'Transit Line',
        fromStopName: firstTransit.from_stop_name,
        toStopName: firstTransit.to_stop_name,
        departureTime: alternative.departure_time,
        arrivalTime: alternative.arrival_time,
        passengerCount: 1,
        totalFare: alternative.fare
      });

      setBookingSuccess(res.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to complete booking. Please try again.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const handleSaveFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!legs.length) return;

    try {
      await userService.addFavorite({
        title: `${firstLeg.from_stop_name} to ${lastLeg.to_stop_name}`,
        origin: firstLeg.from_coords,
        destination: lastLeg.to_coords,
        modes: alternative.modes_used
      });

      setFavoriteSaved(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Could not save this journey to favorites.'
      );
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.max(0, Math.round((seconds || 0) / 60));
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    return hours > 0
      ? `${hours}h ${remaining}m`
      : `${minutes} min`;
  };

  const formatDistance = (meters) => {
    if (!Number.isFinite(Number(meters))) return '0 m';

    return Number(meters) >= 1000
      ? `${(Number(meters) / 1000).toFixed(1)} km`
      : `${Math.round(Number(meters))} m`;
  };

  const inputIcon = (leg) => {
    const isWalk = leg.leg_type === 'walk' || leg.mode === 'walk';
    const isMetro = leg.mode === 'metro';

    if (isWalk) return <Footprints className="w-5 h-5" />;
    if (isMetro) return <Train className="w-5 h-5" />;
    return <Bus className="w-5 h-5" />;
  };

  const legTheme = (leg) => {
    const isWalk = leg.leg_type === 'walk' || leg.mode === 'walk';
    const isMetro = leg.mode === 'metro';

    if (isWalk) {
      return {
        color: 'text-slate-600',
        bg: 'bg-slate-100',
        border: 'border-slate-200',
        line: 'bg-slate-300'
      };
    }

    if (isMetro) {
      return {
        color: 'text-fuchsia-700',
        bg: 'bg-fuchsia-100',
        border: 'border-fuchsia-200',
        line: 'bg-fuchsia-300'
      };
    }

    return {
      color: 'text-violet-700',
      bg: 'bg-violet-100',
      border: 'border-violet-200',
      line: 'bg-violet-300'
    };
  };

  if (loading) {
    return (
      <div className="tc-page min-h-screen flex items-center justify-center px-4">
        <div className="tc-glass rounded-3xl p-10 text-center">
          <Loader2 className="w-9 h-9 text-violet-600 animate-spin mx-auto" />
          <p className="mt-4 text-sm font-bold text-slate-700">
            Preparing your journey...
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Loading route and travel details
          </p>
        </div>
      </div>
    );
  }

  if (!alternative || !legs.length) {
    return (
      <div className="tc-page min-h-screen flex items-center justify-center px-4 py-12">
        <div className="tc-glass max-w-md w-full rounded-3xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto">
            <Route className="w-8 h-8 text-violet-600" />
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 mt-5">
            Journey details unavailable
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            {error || 'We could not find the requested journey.'}
          </p>

          <button
            onClick={() => navigate('/search')}
            className="tc-button-primary mt-6 px-6 py-3 rounded-xl text-sm font-bold"
          >
            Return to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tc-page min-h-screen py-7 sm:py-10 px-4 sm:px-6">
      <div className="tc-container max-w-6xl mx-auto space-y-7">

        {/* Top Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-violet-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Results
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSaveFavorite}
              disabled={favoriteSaved}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                favoriteSaved
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white/80 border-violet-100 text-slate-700 hover:border-rose-200 hover:text-rose-600'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  favoriteSaved ? 'fill-rose-500' : ''
                }`}
              />
              {favoriteSaved ? 'Saved to Favorites' : 'Save Favorite'}
            </button>

            <Link
              to={`/places?lat=${lastLeg.to_coords.lat}&lon=${lastLeg.to_coords.lon}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-100 bg-white/80 text-xs font-bold text-slate-700 hover:text-violet-700 hover:border-violet-300 transition-all"
            >
              <Utensils className="w-4 h-4 text-amber-500" />
              Nearby Places
            </Link>
          </div>
        </div>

        {/* Journey Hero */}
        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#201139] via-[#4C1D95] to-[#6D28D9] p-6 sm:p-9 text-white shadow-2xl shadow-violet-950/15">
          <div className="absolute -top-28 -right-16 w-80 h-80 rounded-full bg-violet-300/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold uppercase tracking-wider text-violet-100">
                <Sparkles className="w-3.5 h-3.5" />
                Door-to-Door Itinerary
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-400/15 border border-emerald-300/20 text-[10px] font-bold text-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Multimodal Route
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-7 items-end">
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight text-white">
                  {firstLeg.from_stop_name}
                  <span className="text-violet-300 mx-2">→</span>
                  {lastLeg.to_stop_name}
                </h1>

                <p className="text-sm text-violet-200 mt-3 max-w-2xl">
                  {alternative.summary || 'Your optimized multimodal journey.'}
                </p>

                <div className="flex flex-wrap gap-3 mt-5 text-xs text-violet-100">
                  <span className="inline-flex items-center gap-1.5">
                    <Navigation className="w-4 h-4" />
                    {legs.length} journey segments
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {alternative.departure_time} – {alternative.arrival_time}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl p-5 min-w-[180px]">
                <p className="text-[10px] uppercase tracking-widest font-bold text-violet-200">
                  Estimated Fare
                </p>
                <p className="text-4xl font-black mt-1">
                  ₹{alternative.fare}
                </p>
                <p className="text-[11px] text-violet-200 mt-1">
                  Combined journey fare
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Booking Confirmation */}
        {bookingSuccess && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-extrabold text-emerald-900">
                  Booking Confirmed!
                </h2>
                <p className="text-sm text-emerald-700 mt-1">
                  Your booking reference:
                  <span className="font-mono font-extrabold ml-2">
                    {bookingSuccess.bookingReference}
                  </span>
                </p>
              </div>

              <Link
                to="/bookings"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors"
              >
                View My Bookings
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 mt-5">
              <Link
                to={`/tracking/${id}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950"
              >
                <Navigation className="w-4 h-4" />
                Track Journey
              </Link>
            </div>
          </div>
        )}

        {/* Journey Metrics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: 'Total Duration',
              value: formatDuration(alternative.total_duration_seconds),
              icon: Clock,
              color: 'text-violet-600',
              bg: 'bg-violet-100'
            },
            {
              label: 'Walking Distance',
              value: formatDistance(alternative.walking_distance_meters),
              icon: Footprints,
              color: 'text-indigo-600',
              bg: 'bg-indigo-100'
            },
            {
              label: 'Transfers',
              value: alternative.transfer_count === 0
                ? 'Direct'
                : `${alternative.transfer_count} transfers`,
              icon: RefreshCw,
              color: 'text-fuchsia-600',
              bg: 'bg-fuchsia-100'
            },
            {
              label: 'Reliability',
              value: `${alternative.reliability_score ?? '—'}${alternative.reliability_score != null ? '%' : ''}`,
              icon: Star,
              color: 'text-emerald-600',
              bg: 'bg-emerald-100'
            }
          ].map((metric, index) => {
            const Icon = metric.icon;

            return (
              <div
                key={index}
                className="tc-glass rounded-2xl border border-white/70 p-4 sm:p-5 shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl ${metric.bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>

                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  {metric.label}
                </p>
                <p className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                  {metric.value}
                </p>
              </div>
            );
          })}
        </section>

        {/* Route Map */}
        <section className="tc-glass rounded-3xl border border-white/70 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-violet-600">
                Geographic Overview
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                Route Map
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Visual overview of your complete journey.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 text-xs font-bold text-violet-700 bg-violet-50 border border-violet-100 rounded-xl px-3 py-2">
              <MapPin className="w-4 h-4" />
              {legs.length} segments
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-violet-100">
            <JourneyMap alternative={alternative} height="420px" />
          </div>
        </section>

        {/* Step-by-step Itinerary */}
        <section className="tc-glass rounded-3xl border border-white/70 p-5 sm:p-8 shadow-sm">
          <div className="mb-7">
            <span className="text-[10px] uppercase tracking-widest font-bold text-violet-600">
              Your Travel Plan
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Journey Breakdown
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Follow each segment from your starting point to your destination.
            </p>
          </div>

          <div className="relative space-y-5">
            {legs.map((leg, index) => {
              const theme = legTheme(leg);
              const isWalk =
                leg.leg_type === 'walk' || leg.mode === 'walk';

              const isMetro = leg.mode === 'metro';

              return (
                <div key={index} className="relative flex gap-4 sm:gap-5">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-11 h-11 rounded-2xl ${theme.bg} border ${theme.border} flex items-center justify-center ${theme.color}`}>
                      {inputIcon(leg)}
                    </div>

                    {index !== legs.length - 1 && (
                      <div className={`w-0.5 flex-1 min-h-10 mt-2 ${theme.line}`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pb-4">
                    <div className="rounded-2xl border border-violet-100 bg-white/70 p-4 sm:p-5 hover:border-violet-200 hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] uppercase tracking-wider font-extrabold ${theme.color}`}>
                              Segment {index + 1}
                            </span>

                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${theme.bg} ${theme.color}`}>
                              {isWalk ? 'Walking' : isMetro ? 'Metro' : 'Bus / Transit'}
                            </span>
                          </div>

                          <h3 className="text-base font-extrabold text-slate-900 mt-2">
                            {isWalk
                              ? 'Walk to next stop'
                              : `${leg.provider_name || 'Transit'} ${leg.route_short_name ? `· ${leg.route_short_name}` : ''}`}
                          </h3>

                          {leg.headsign && (
                            <p className="text-xs text-slate-500 mt-1">
                              Towards {leg.headsign}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 rounded-xl bg-violet-50 border border-violet-100 px-3 py-2">
                          <p className="text-xs font-extrabold text-violet-800">
                            {leg.departure_time} – {leg.arrival_time}
                          </p>
                          <p className="text-[10px] text-violet-500 mt-1">
                            {formatDuration(leg.duration_seconds)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                              From
                            </p>
                            <p className="text-xs font-bold text-slate-800 mt-1">
                              {leg.from_stop_name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                            <Navigation className="w-3.5 h-3.5 text-rose-700" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                              To
                            </p>
                            <p className="text-xs font-bold text-slate-800 mt-1">
                              {leg.to_stop_name}
                            </p>
                          </div>
                        </div>
                      </div>

                      {leg.instructions && (
                        <div className="mt-4 rounded-xl bg-violet-50/70 border border-violet-100 p-3">
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {leg.instructions}
                          </p>
                        </div>
                      )}

                      {leg.intermediate_stops?.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-violet-100">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                            {leg.intermediate_stops.length} Intermediate Stops
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {leg.intermediate_stops.map((stop, stopIndex) => (
                              <span
                                key={stopIndex}
                                className="text-[10px] font-semibold text-slate-600 bg-slate-100 rounded-lg px-2.5 py-1.5"
                              >
                                {stop.stop_name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Booking Panel */}
        {!bookingSuccess && (
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#21143C] via-[#4C1D95] to-[#6D28D9] p-6 sm:p-8 text-white shadow-xl shadow-violet-950/15">
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-violet-300/15 blur-3xl" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 text-violet-200 text-[10px] uppercase tracking-widest font-bold">
                  <Ticket className="w-4 h-4" />
                  Ready to travel?
                </div>

                <h2 className="text-2xl font-extrabold mt-2">
                  Book this journey
                </h2>

                <p className="text-sm text-violet-200 mt-2 max-w-xl">
                  Continue to create your journey booking using the selected itinerary.
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-violet-100">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Secure booking
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Wallet className="w-4 h-4" />
                    ₹{alternative.fare} estimated fare
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="rounded-xl bg-white/10 border border-white/15 px-5 py-3 text-center">
                  <p className="text-[10px] text-violet-200 uppercase tracking-wider font-bold">
                    Total Fare
                  </p>
                  <p className="text-2xl font-black mt-1">
                    ₹{alternative.fare}
                  </p>
                </div>

                <button
                  onClick={handleBookTrip}
                  disabled={bookingLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-4 text-sm font-extrabold text-violet-800 shadow-lg hover:bg-violet-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Issuing Ticket...
                    </>
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      Book Now
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pb-3">
          <ShieldCheck className="w-4 h-4 text-violet-500" />
          TransitChain multimodal journey planner
        </div>
      </div>
    </div>
  );
}
