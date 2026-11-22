
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { journeyService } from '../services/api';
import JourneyCard from '../components/JourneyCard';
import JourneyMap from '../components/JourneyMap';
import {
  Search,
  Filter,
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle,
  MapPin,
  Compass,
  Bus,
  Train,
  Footprints,
  Check,
  Route,
  SlidersHorizontal,
  Wallet,
  Timer,
  Navigation,
  RefreshCw,
  MapPinned,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

export default function JourneySearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search form state
  const [origin, setOrigin] = useState(
    searchParams.get('origin') || 'Indira Nagar - Gachibowli'
  );

  const [destination, setDestination] = useState(
    searchParams.get('destination') || 'KPHB Colony'
  );

  const [departureTime, setDepartureTime] = useState(
    searchParams.get('departureTime') || '08:30'
  );

  const [preference, setPreference] = useState(
    searchParams.get('preference') || 'balanced'
  );

  const [maxWalkDistance, setMaxWalkDistance] = useState(2000);

  const [modes, setModes] = useState(
    searchParams.get('modes')
      ? searchParams.get('modes').split(',')
      : ['bus', 'metro', 'walk']
  );

  // Search execution state
  const [alternatives, setAlternatives] = useState([]);
  const [selectedAlt, setSelectedAlt] = useState(null);
  const [journeyId, setJourneyId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);

  // Sorting
  const [activeSort, setActiveSort] = useState('pareto');

  // Coordinate resolution dictionary for Hyderabad transit hubs
  const knownCoords = {
    'indira nagar': { lat: 17.4435, lon: 78.3582 },
    'indira nagar - gachibowli': { lat: 17.4435, lon: 78.3582 },
    gachibowli: { lat: 17.4401, lon: 78.3615 },
    'gachibowli orr junction': { lat: 17.4401, lon: 78.3615 },
    kphb: { lat: 17.4975, lon: 78.4014 },
    'kphb colony': { lat: 17.4975, lon: 78.4014 },
    raidurg: { lat: 17.4374, lon: 78.3798 },
    'raidurg metro': { lat: 17.4374, lon: 78.3798 },
    ameerpet: { lat: 17.4344, lon: 78.4482 },
    'hitec city': { lat: 17.4474, lon: 78.3768 },
    'cyber towers': { lat: 17.4510, lon: 78.3810 },
    biodiversity: { lat: 17.4385, lon: 78.3789 },
    jntu: { lat: 17.5025, lon: 78.3921 },
    secunderabad: { lat: 17.4399, lon: 78.5032 },
    koti: { lat: 17.3820, lon: 78.4862 },
    miyapur: { lat: 17.4968, lon: 78.3614 },
  };

  const resolveCoord = (name, fallbackLat, fallbackLon) => {
    const lower = (name || '').toLowerCase().trim();

    for (const [key, coord] of Object.entries(knownCoords)) {
      if (lower.includes(key)) return coord;
    }

    return { lat: fallbackLat, lon: fallbackLon };
  };

  // Execute journey search
  const executeSearch = async () => {
    if (!origin.trim() || !destination.trim()) {
      setError('Please enter both starting point and destination.');
      return;
    }

    if (modes.length === 0) {
      setError('Please select at least one transport mode.');
      return;
    }

    setLoading(true);
    setError(null);
    setAlternatives([]);
    setSelectedAlt(null);

    const origCoords = resolveCoord(origin, 17.4435, 78.3582);
    const destCoords = resolveCoord(destination, 17.4975, 78.4014);

    try {
      const res = await journeyService.search({
        origin: {
          lat: origCoords.lat,
          lon: origCoords.lon,
          name: origin,
        },
        destination: {
          lat: destCoords.lat,
          lon: destCoords.lon,
          name: destination,
        },
        departureTime,
        modes,
        maxWalkingDistanceMeters: maxWalkDistance,
        optimizationPreference: preference,
      });

      const data = res.data.data;

      setAlternatives(data.alternatives || []);
      setJourneyId(data.journeyId);
      setDiagnostics(data.diagnostics);

      if (data.alternatives && data.alternatives.length > 0) {
        setSelectedAlt(data.alternatives[0]);
      } else {
        setSelectedAlt(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to search journeys. Ensure backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial search
  useEffect(() => {
    executeSearch();
  }, []);

  // Booking handoff
  const handleBookingHandoff = (alt) => {
    navigate(`/journey/${journeyId}`, {
      state: { alternative: alt },
    });
  };

  // Transport mode selection
  const toggleMode = (mode) => {
    if (modes.includes(mode)) {
      if (modes.length > 1) {
        setModes(modes.filter((item) => item !== mode));
      }
    } else {
      setModes([...modes, mode]);
    }
  };

  // Sorting alternatives
  const getSortedAlternatives = () => {
    const list = [...alternatives];

    if (activeSort === 'duration') {
      return list.sort(
        (a, b) =>
          a.total_duration_seconds - b.total_duration_seconds
      );
    }

    if (activeSort === 'fare') {
      return list.sort((a, b) => a.fare - b.fare);
    }

    if (activeSort === 'walking') {
      return list.sort(
        (a, b) =>
          a.walking_distance_meters - b.walking_distance_meters
      );
    }

    return list;
  };

  const sortedList = getSortedAlternatives();

  const sortOptions = [
    { id: 'pareto', label: 'Recommended', icon: Sparkles },
    { id: 'duration', label: 'Fastest', icon: Timer },
    { id: 'fare', label: 'Lowest fare', icon: Wallet },
    { id: 'walking', label: 'Least walking', icon: Footprints },
  ];

  const transportOptions = [
    {
      id: 'bus',
      label: 'Bus',
      icon: Bus,
      color: 'text-sky-600',
      active: 'bg-sky-50 border-sky-300 text-sky-700',
    },
    {
      id: 'metro',
      label: 'Metro',
      icon: Train,
      color: 'text-emerald-600',
      active: 'bg-emerald-50 border-emerald-300 text-emerald-700',
    },
    {
      id: 'walk',
      label: 'Walk',
      icon: Footprints,
      color: 'text-amber-600',
      active: 'bg-amber-50 border-amber-300 text-amber-700',
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8f5ff] text-[#241638]">

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-300/20 blur-[110px]" />
        <div className="absolute top-[500px] -right-40 w-[450px] h-[450px] rounded-full bg-indigo-300/15 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-fuchsia-200/20 blur-[100px]" />
      </div>

      <div className="relative max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-7">

        {/* PAGE HEADER */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <div className="tc-section-label">
              <Navigation className="w-4 h-4" />
              Smart multimodal navigation
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mt-4">
              Find your best
              <span className="tc-gradient-text"> journey.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-500 mt-3 max-w-2xl leading-7">
              Compare bus, metro, and walking combinations with intelligent
              route optimization across Hyderabad.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <Route className="w-5 h-5" />
            </div>

            <div>
              <p className="text-xs font-bold text-violet-700">
                TransitChain planner
              </p>
              <p className="text-[11px] text-slate-500">
                Timetable-aware route search
              </p>
            </div>
          </div>
        </section>

        {/* SEARCH PANEL */}
        <section className="relative rounded-[1.75rem] border border-white bg-white/75 backdrop-blur-2xl shadow-[0_20px_65px_rgba(76,29,149,0.09)] p-5 sm:p-7">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-7">
            <div>
              <div className="tc-section-label">
                <Sparkles className="w-4 h-4" />
                Journey configuration
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold mt-2">
                Where are you travelling?
              </h2>
            </div>

            <span className="tc-pill self-start">
              <ShieldCheck className="w-3.5 h-3.5" />
              Smart route optimization
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeSearch();
            }}
            className="space-y-6"
          >

            {/* Origin and destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Starting point
                </label>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />

                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="Enter your starting location"
                    className="tc-input pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Destination
                </label>

                <div className="relative">
                  <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-500" />

                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter your destination"
                    className="tc-input pl-12"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Departure, preference, walking */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Departure time
                </label>

                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" />

                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="tc-input pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">
                  Journey objective
                </label>

                <div className="relative">
                  <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 pointer-events-none" />

                  <select
                    value={preference}
                    onChange={(e) => setPreference(e.target.value)}
                    className="tc-input pl-11 appearance-none"
                  >
                    <option value="balanced">
                      Balanced optimal trade-offs
                    </option>
                    <option value="fastest">
                      Fastest travel duration
                    </option>
                    <option value="lowest_fare">
                      Lowest ticket fare
                    </option>
                    <option value="fewest_transfers">
                      Fewest transfers
                    </option>
                    <option value="least_walking">
                      Least walking strain
                    </option>
                  </select>

                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-600">
                    Maximum walking distance
                  </label>

                  <span className="text-xs font-extrabold text-violet-700">
                    {maxWalkDistance.toLocaleString()} m
                  </span>
                </div>

                <div className="h-12 px-4 flex items-center rounded-xl border border-violet-100 bg-white/80">
                  <Footprints className="w-4 h-4 text-amber-500 mr-3 shrink-0" />

                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="100"
                    value={maxWalkDistance}
                    onChange={(e) =>
                      setMaxWalkDistance(Number(e.target.value))
                    }
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Transport mode selection */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-3">
                Permitted transport modes
              </label>

              <div className="grid grid-cols-3 gap-3">
                {transportOptions.map((mode) => {
                  const Icon = mode.icon;
                  const active = modes.includes(mode.id);

                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => toggleMode(mode.id)}
                      aria-pressed={active}
                      className={`flex items-center justify-center gap-2 py-3.5 px-3 rounded-xl border text-sm font-bold transition-all duration-200 ${
                        active
                          ? `${mode.active} shadow-sm`
                          : 'bg-white/60 border-violet-100 text-slate-500 hover:bg-violet-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? '' : mode.color}`} />
                      {mode.label}

                      {active && (
                        <Check className="w-4 h-4 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-400 mt-2">
                Select at least one transport mode to continue.
              </p>
            </div>

            {/* Search action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="tc-button-primary w-full py-4 rounded-xl text-sm sm:text-base disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Optimizing your journey...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Find best multimodal journeys
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* SEARCH SUMMARY */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: 'Transport modes',
              value: modes.length,
              detail: 'Selected',
              icon: Bus,
              color: 'text-sky-600',
            },
            {
              label: 'Walking limit',
              value: `${(maxWalkDistance / 1000).toFixed(1)} km`,
              detail: 'Maximum distance',
              icon: Footprints,
              color: 'text-amber-600',
            },
            {
              label: 'Journey objective',
              value: preference === 'balanced'
                ? 'Balanced'
                : preference.replace('_', ' '),
              detail: 'Optimization preference',
              icon: SlidersHorizontal,
              color: 'text-violet-600',
            },
            {
              label: 'Departure',
              value: departureTime,
              detail: 'Selected time',
              icon: Clock,
              color: 'text-emerald-600',
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-2xl border border-violet-100 bg-white/70 backdrop-blur-xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-[11px] font-semibold text-slate-500">
                    {item.label}
                  </span>
                </div>

                <p className="text-lg font-extrabold text-[#241638] capitalize truncate">
                  {item.value}
                </p>

                <p className="text-[10px] text-slate-400 mt-1">
                  {item.detail}
                </p>
              </div>
            );
          })}
        </section>

        {/* RESULTS HEADER AND SORTING */}
        <section className="rounded-2xl border border-white bg-white/75 backdrop-blur-xl shadow-sm p-4 sm:p-5">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Route className="w-5 h-5 text-violet-600" />
                <h2 className="text-lg sm:text-xl font-extrabold text-[#241638]">
                  Journey alternatives
                </h2>
              </div>

              <p className="text-xs text-slate-500 mt-1">
                Compare available route combinations and select the most suitable one.
              </p>
            </div>

            {diagnostics && (
              <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-2 rounded-xl bg-violet-50 border border-violet-100">
                <Sparkles className="w-4 h-4 text-violet-600" />

                <span className="text-xs font-bold text-violet-700">
                  {sortedList.length} options found
                </span>

                <span className="text-[10px] text-violet-500">
                  • {diagnostics.search_time_ms} ms
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-violet-600" />
            <span className="text-xs font-bold text-slate-600">
              Sort journey results
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              const active = activeSort === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveSort(option.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    active
                      ? 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-500/20'
                      : 'bg-white border-violet-100 text-slate-600 hover:bg-violet-50 hover:border-violet-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ERROR ALERT */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex items-start gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

            <div className="flex-1">
              <p className="font-bold text-sm">
                Journey search notice
              </p>

              <p className="text-xs leading-6 mt-1">
                {error}
              </p>

              <button
                type="button"
                onClick={executeSearch}
                className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-red-700 hover:text-red-900"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try again
              </button>
            </div>
          </div>
        )}

        {/* RESULTS AND MAP */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

          {/* Journey alternatives */}
          <div className="xl:col-span-6 space-y-4">

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#241638]">
                Available routes
              </h3>

              {!loading && (
                <span className="text-xs text-slate-500">
                  {sortedList.length} results
                </span>
              )}
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="rounded-3xl border border-violet-100 bg-white/80 backdrop-blur-xl p-10 sm:p-14 text-center shadow-sm">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-violet-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />

                  <Route className="absolute inset-0 m-auto w-6 h-6 text-violet-600" />
                </div>

                <h3 className="text-base font-extrabold text-[#241638]">
                  Optimizing multimodal connections
                </h3>

                <p className="text-xs text-slate-500 mt-3 leading-6">
                  Checking transport schedules, transfer connections,
                  walking distances, and journey objectives.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                  <span className="tc-pill">
                    <Bus className="w-3.5 h-3.5" />
                    Bus
                  </span>
                  <span className="tc-pill">
                    <Train className="w-3.5 h-3.5" />
                    Metro
                  </span>
                  <span className="tc-pill">
                    <Footprints className="w-3.5 h-3.5" />
                    Walking
                  </span>
                </div>
              </div>
            ) : sortedList.length === 0 ? (
              <div className="rounded-3xl border border-violet-100 bg-white/80 backdrop-blur-xl p-10 sm:p-14 text-center shadow-sm">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-5">
                  <Compass className="w-8 h-8" />
                </div>

                <h3 className="text-lg font-extrabold text-[#241638]">
                  No journeys found
                </h3>

                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-6">
                  No suitable journey alternatives were returned for these
                  search settings. Try another departure time or increase
                  your allowed walking distance.
                </p>

                <button
                  type="button"
                  onClick={executeSearch}
                  className="tc-button-primary mt-6"
                >
                  <RefreshCw className="w-4 h-4" />
                  Search again
                </button>
              </div>
            ) : (
              sortedList.map((alt, index) => (
                <div
                  key={alt.id}
                  className={`rounded-2xl transition-all ${
                    selectedAlt?.id === alt.id
                      ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-[#f8f5ff]'
                      : ''
                  }`}
                >
                  <JourneyCard
                    alternative={alt}
                    isSelected={selectedAlt?.id === alt.id}
                    onSelect={() => setSelectedAlt(alt)}
                    onBook={handleBookingHandoff}
                  />

                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-[10px] text-slate-400 font-semibold">
                      OPTION {String(index + 1).padStart(2, '0')}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleBookingHandoff(alt)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors"
                    >
                      View step-by-step directions
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Interactive map */}
          <div className="xl:col-span-6 xl:sticky xl:top-24 space-y-4">

            <div className="rounded-3xl border border-white bg-white/80 backdrop-blur-2xl shadow-[0_18px_55px_rgba(76,29,149,0.10)] overflow-hidden">

              <div className="p-5 border-b border-violet-100">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPinned className="w-5 h-5 text-violet-600" />
                      <h3 className="text-base font-extrabold text-[#241638]">
                        Journey map
                      </h3>
                    </div>

                    <p className="text-xs text-slate-500 mt-1">
                      Visualize your selected multimodal route.
                    </p>
                  </div>

                  <span className="tc-pill">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Interactive
                  </span>
                </div>

                {selectedAlt && (
                  <div className="mt-4 p-3 rounded-xl bg-violet-50 border border-violet-100">
                    <p className="text-xs font-bold text-violet-800 line-clamp-2">
                      {selectedAlt.summary}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-4">
                <div className="rounded-2xl overflow-hidden border border-violet-100">
                  <JourneyMap
                    alternative={selectedAlt}
                    height="480px"
                  />
                </div>
              </div>

              {/* Map legend */}
              <div className="px-5 pb-5">
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Origin
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    Destination
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    Transit
                  </div>
                </div>
              </div>
            </div>

            {/* Map information card */}
            <div className="rounded-2xl border border-violet-100 bg-white/65 backdrop-blur-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>

                <div>
                  <h4 className="text-xs font-extrabold text-[#241638]">
                    Route-aware journey planning
                  </h4>

                  <p className="text-[11px] text-slate-500 mt-1">
                    Review each route alternative before continuing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom note */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4 border-t border-violet-200/70">
          <p className="text-[11px] text-slate-400 text-center sm:text-left">
            TransitChain — Smart multimodal journey planning.
          </p>

          <p className="text-[11px] text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            Optimizing time, fare, transfers and walking distance
          </p>
        </div>
      </div>
    </main>
  );
}
