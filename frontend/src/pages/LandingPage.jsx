
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  MapPin,
  Compass,
  Bus,
  Train,
  Footprints,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Search,
  Route,
  Navigation,
  ChevronDown,
  CheckCircle2,
  Zap,
  MapPinned,
  ArrowUpRight,
  Globe2,
  Wallet,
  RefreshCw,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('08:30');
  const [modes, setModes] = useState(['bus', 'metro', 'walk']);
  const [preference, setPreference] = useState('balanced');
  const [openFaq, setOpenFaq] = useState(null);

  const taglineRef = useRef(null);
  const [wordsRevealed, setWordsRevealed] = useState(0);

  const taglineText =
    'Connecting city buses, rapid metro lines, and verified walking paths into one seamless route. Every transfer timed before you step out the door.';

  const taglineWords = taglineText.split(' ');

  const popularDestinations = [
    {
      from: 'Indira Nagar, Gachibowli',
      to: 'KPHB Colony',
      modes: ['bus', 'metro'],
      desc: 'Direct bus 195W or feeder bus with Blue and Red Line metro interchange at Ameerpet',
    },
    {
      from: 'Gachibowli Junction',
      to: 'Ameerpet Metro Station',
      modes: ['bus', 'metro'],
      desc: 'Feeder bus connection to Raidurg followed by rapid Blue Line metro to Ameerpet',
    },
    {
      from: 'Raidurg Metro Terminal',
      to: 'Secunderabad East',
      modes: ['metro'],
      desc: 'Continuous Blue Line metro transit traversing the central IT corridor',
    },
    {
      from: 'Cyber Towers, Hitec City',
      to: 'JNTU College',
      modes: ['bus', 'metro'],
      desc: 'Direct Route 195W express or metro connection with minimal walking',
    },
  ];

  const benefits = [
    {
      title: 'Zero guesswork transfers',
      description:
        'Physical transfer walkways between bus stops and metro stations verified on foot with realistic walking seconds.',
      icon: Footprints,
      color: 'emerald',
    },
    {
      title: 'Multi-objective ranking',
      description:
        'Pareto optimization evaluates duration, walking distance, transfer frequency, and known fares simultaneously.',
      icon: TrendingUp,
      color: 'violet',
    },
    {
      title: 'Live schedule coordination',
      description:
        'Synchronized TGSRTC bus timetables and HMRL metro timetables so you never sprint to an empty platform.',
      icon: Clock,
      color: 'sky',
    },
    {
      title: 'Integrated digital ticketing',
      description:
        'Single tap PNR and verified QR code issuance through official transport provider adapters.',
      icon: ShieldCheck,
      color: 'amber',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Enter your locations',
      description:
        'Type your starting point and final destination anywhere in the greater metropolitan area.',
      detail: 'Origin and destination',
      icon: MapPinned,
    },
    {
      number: '02',
      title: 'Choose your priority',
      description:
        'Choose whether your trip prioritizes fastest arrival time, lowest ticket price, or least walking strain.',
      detail: 'Personalized trade-offs',
      icon: SlidersIcon,
    },
    {
      number: '03',
      title: 'Board with confidence',
      description:
        'Follow step by step guidance with interchange station walking cues and live vehicle tracking.',
      detail: 'Turn by turn navigation',
      icon: Navigation,
    },
  ];

  const faqs = [
    {
      q: 'How does TransitChain calculate door-to-door travel time?',
      a: 'TransitChain uses high-precision timetable schedules from TGSRTC buses and HMRL metro, combining them with verified walking connection distances (such as the 130 meter walk between Raidurg Bus Stop and Raidurg Metro Station) to compute actual door-to-door travel duration.',
    },
    {
      q: 'What is Pareto multi-objective optimization?',
      a: 'Instead of forcing you into a single rigid route, Pareto optimization evaluates multiple competing travel goals at once: total travel time, walking distance, transfer count, and fare in rupees. It filters out strictly inferior routes and presents the most practical balanced choices.',
    },
    {
      q: 'Can I book tickets for both bus and metro in one place?',
      a: 'Yes. TransitChain connects directly to official transport provider adapters, allowing you to generate booking references (PNR) and secure QR code passes for your multi-leg commute where provider integrations support them.',
    },
    {
      q: 'Does TransitChain support live vehicle tracking?',
      a: 'When live GPS coordinates are broadcast by active vehicles on supported routes, TransitChain can display real-time position, speed, and delay information.',
    },
    {
      q: 'What happens if a bus or train is running late?',
      a: 'The monitoring engine tracks schedule delays. If a service delay threatens your transfer window, the system can recalculate connection buffers and help identify alternative journeys.',
    },
    {
      q: 'Is TransitChain free to use for commuters?',
      a: 'Route planning and schedule exploration are available through the platform. Any digital ticket purchase is subject to the official transport provider fare and integration availability.',
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!taglineRef.current) return;

      const rect = taglineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight * 0.85 && rect.bottom > 0) {
        const progress = Math.min(
          1,
          Math.max(
            0,
            (windowHeight * 0.85 - rect.top) / (windowHeight * 0.45)
          )
        );

        setWordsRevealed(Math.floor(progress * taglineWords.length));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [taglineWords.length]);

  const handleSearch = (e) => {
    e?.preventDefault();

    if (!origin.trim() || !destination.trim()) return;

    const query = new URLSearchParams({
      origin: origin.trim(),
      destination: destination.trim(),
      departureTime,
      modes: modes.join(','),
      preference,
    }).toString();

    navigate(`/search?${query}`);
  };

  const handleSelectPopular = (item) => {
    const query = new URLSearchParams({
      origin: item.from,
      destination: item.to,
      departureTime,
      modes: item.modes.concat(['walk']).join(','),
      preference,
    }).toString();

    navigate(`/search?${query}`);
  };

  const toggleMode = (mode) => {
    if (modes.includes(mode)) {
      if (modes.length > 1) {
        setModes(modes.filter((m) => m !== mode));
      }
    } else {
      setModes([...modes, mode]);
    }
  };

  const pageBg = darkMode
    ? 'bg-[#100b1c] text-white'
    : 'bg-[#f8f5ff] text-[#241638]';

  const sectionBg = darkMode
    ? 'bg-[#171126]/90 border-white/10'
    : 'bg-white/55 border-violet-100';

  const cardBg = darkMode
    ? 'bg-white/[0.055] border-white/10'
    : 'bg-white/75 border-violet-100/90';

  const headingColor = darkMode ? 'text-white' : 'text-[#241638]';

  const bodyColor = darkMode ? 'text-slate-300' : 'text-slate-600';

  const mutedColor = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <main className={`relative min-h-screen overflow-hidden ${pageBg}`}>

      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -left-32 w-[520px] h-[520px] rounded-full bg-violet-400/15 blur-[110px]" />
        <div className="absolute top-[600px] -right-40 w-[520px] h-[520px] rounded-full bg-fuchsia-300/10 blur-[120px]" />
        <div className="absolute bottom-[500px] -left-40 w-[450px] h-[450px] rounded-full bg-indigo-400/10 blur-[100px]" />
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-20">
        <div className="max-w-7xl mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Hero text */}
            <div className="lg:col-span-5 text-center lg:text-left">

              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-xl mb-7 ${
                  darkMode
                    ? 'bg-violet-400/10 border-violet-300/20'
                    : 'bg-white/75 border-violet-200 shadow-sm'
                }`}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-violet-600 dark:text-violet-300">
                  Verified timetables across 25 hubs and 350 daily departures
                </span>
              </div>

              <h1
                className={`text-4xl sm:text-5xl lg:text-[3.65rem] font-extrabold tracking-tight leading-[1.12] ${headingColor}`}
              >
                Your city.
                <br />
                Your journey.
                <br />
                <span className="tc-gradient-text">
                  Connected.
                </span>
              </h1>

              <p className={`mt-6 text-base sm:text-lg leading-8 max-w-xl mx-auto lg:mx-0 ${bodyColor}`}>
                Door-to-door journeys across Hyderabad without the confusion.
                Combine city buses, rapid metro lines, and verified walking
                connections in one intelligent journey planner.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => navigate('/search')}
                  className="tc-button-primary px-6"
                >
                  <Search className="w-4 h-4" />
                  Explore journeys
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#how-it-works"
                  className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${
                    darkMode
                      ? 'text-violet-200 hover:bg-white/10'
                      : 'text-violet-700 hover:bg-violet-100'
                  }`}
                >
                  How it works
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              <div className={`flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-3 mt-8 text-xs font-semibold ${mutedColor}`}>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Multimodal planning
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Timetable-aware
                </span>
              </div>
            </div>

            {/* Search glass panel */}
            <div className="lg:col-span-7 relative">

              <div className="absolute -top-10 -right-8 w-40 h-40 bg-violet-400/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-8 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl" />

              <div
                className={`relative rounded-[2rem] p-5 sm:p-8 border backdrop-blur-2xl shadow-[0_25px_90px_rgba(76,29,149,0.13)] ${
                  darkMode
                    ? 'bg-[#211832]/85 border-white/10'
                    : 'bg-white/80 border-white shadow-violet-900/10'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-7">
                  <div>
                    <div className="tc-section-label">
                      <Sparkles className="w-4 h-4" />
                      Smart journey planner
                    </div>
                    <h2 className={`text-xl sm:text-2xl font-extrabold mt-2 ${headingColor}`}>
                      Where would you like to go?
                    </h2>
                    <p className={`text-xs mt-1 ${mutedColor}`}>
                      Find practical bus, metro and walking combinations.
                    </p>
                  </div>

                  <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white items-center justify-center shadow-lg shadow-violet-500/20">
                    <Route className="w-6 h-6" />
                  </div>
                </div>

                <form onSubmit={handleSearch} className="space-y-5">

                  {/* Locations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold mb-2 ${bodyColor}`}>
                        Starting point
                      </label>

                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                        <input
                          type="text"
                          value={origin}
                          onChange={(e) => setOrigin(e.target.value)}
                          placeholder="e.g. Indira Nagar, Gachibowli"
                          className="tc-input pl-12"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold mb-2 ${bodyColor}`}>
                        Destination
                      </label>

                      <div className="relative">
                        <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-500" />
                        <input
                          type="text"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="e.g. KPHB Colony"
                          className="tc-input pl-12"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Travel preferences */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold mb-2 ${bodyColor}`}>
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
                      <label className={`block text-xs font-bold mb-2 ${bodyColor}`}>
                        Journey objective
                      </label>
                      <select
                        value={preference}
                        onChange={(e) => setPreference(e.target.value)}
                        className="tc-input"
                      >
                        <option value="balanced">Balanced optimal trade-offs</option>
                        <option value="fastest">Fastest travel duration</option>
                        <option value="lowest_fare">Lowest ticket fare</option>
                        <option value="fewest_transfers">Fewest vehicle changes</option>
                        <option value="least_walking">Least walking strain</option>
                      </select>
                    </div>
                  </div>

                  {/* Transport modes */}
                  <div>
                    <label className={`block text-xs font-bold mb-3 ${bodyColor}`}>
                      Permitted transport modes
                    </label>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          id: 'bus',
                          label: 'Bus',
                          icon: Bus,
                          active: 'border-sky-400 bg-sky-50 text-sky-700',
                          inactive: 'text-sky-600',
                        },
                        {
                          id: 'metro',
                          label: 'Metro',
                          icon: Train,
                          active: 'border-emerald-400 bg-emerald-50 text-emerald-700',
                          inactive: 'text-emerald-600',
                        },
                        {
                          id: 'walk',
                          label: 'Walk',
                          icon: Footprints,
                          active: 'border-amber-400 bg-amber-50 text-amber-700',
                          inactive: 'text-amber-600',
                        },
                      ].map((mode) => {
                        const Icon = mode.icon;
                        const active = modes.includes(mode.id);

                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => toggleMode(mode.id)}
                            aria-pressed={active}
                            className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 rounded-xl border text-xs font-bold transition-all duration-200 ${
                              active
                                ? `${mode.active} shadow-sm`
                                : darkMode
                                  ? 'bg-white/5 border-white/10 text-slate-400'
                                  : 'bg-white/60 border-violet-100 text-slate-500'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${active ? '' : mode.inactive}`} />
                            {mode.label}
                            {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Search */}
                  <button
                    type="submit"
                    className="tc-button-primary w-full py-4 text-sm rounded-xl"
                  >
                    <Search className="w-5 h-5" />
                    Find best multimodal journeys
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <p className={`text-center text-[11px] ${mutedColor}`}>
                    Your journey preferences are used to find suitable route alternatives.
                  </p>
                </form>
              </div>
            </div>
          </div>

          {/* Feature strip */}
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 mt-16 p-4 sm:p-5 rounded-2xl border backdrop-blur-xl ${cardBg}`}>
            {[
              { icon: Bus, label: 'City bus networks', color: 'text-sky-500' },
              { icon: Train, label: 'Metro connectivity', color: 'text-rose-500' },
              { icon: Footprints, label: 'Walking connections', color: 'text-emerald-500' },
              { icon: Route, label: 'Optimized journeys', color: 'text-violet-500' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-center gap-2 py-2">
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className={`text-xs sm:text-sm font-bold ${bodyColor}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. TAGLINE REVEAL */}
      <section className={`relative py-20 sm:py-28 px-4 border-y ${sectionBg}`}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="tc-section-label mb-5">
            <Sparkles className="w-4 h-4" />
            The core promise
          </div>

          <h2
            ref={taglineRef}
            className={`text-2xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.4] tracking-tight ${headingColor}`}
          >
            {taglineWords.map((word, index) => (
              <span
                key={index}
                className={`inline-block mr-2 transition-all duration-500 ${
                  index < wordsRevealed
                    ? 'opacity-100 translate-y-0 tc-gradient-text'
                    : darkMode
                      ? 'opacity-20 translate-y-2 text-white'
                      : 'opacity-25 translate-y-2 text-violet-900'
                }`}
              >
                {word}
              </span>
            ))}
          </h2>

          <p className={`max-w-2xl mx-auto mt-7 text-sm sm:text-base leading-7 ${mutedColor}`}>
            One connected experience for planning the complete journey,
            including transfers and walking connections.
          </p>
        </div>
      </section>

      {/* 3. BENEFITS */}
      <section className="relative py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">

          <div className="max-w-2xl mx-auto text-center mb-14">
            <div className="tc-section-label">
              <Sparkles className="w-4 h-4" />
              Why commuters choose TransitChain
            </div>

            <h2 className={`text-3xl sm:text-4xl font-extrabold mt-4 ${headingColor}`}>
              Built for real city journeys,
              <span className="tc-gradient-text"> not theoretical maps.</span>
            </h2>

            <p className={`mt-4 text-sm sm:text-base leading-7 ${bodyColor}`}>
              Standard navigation apps may show separate transport legs.
              TransitChain focuses on the complete multimodal connection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  key={benefit.title}
                  className={`tc-card tc-card-hover p-6 sm:p-7`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-700 mb-6">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className={`text-lg font-extrabold mb-3 ${headingColor}`}>
                    {benefit.title}
                  </h3>

                  <p className={`text-sm leading-7 ${bodyColor}`}>
                    {benefit.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-xs font-bold text-violet-600">
                    <span>TransitChain advantage</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section
        id="how-it-works"
        className={`relative py-20 sm:py-24 px-4 border-y ${sectionBg}`}
      >
        <div className="max-w-7xl mx-auto">

          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="tc-section-label">
              <Zap className="w-4 h-4" />
              Three simple steps
            </div>

            <h2 className={`text-3xl sm:text-4xl font-extrabold mt-4 ${headingColor}`}>
              How the application works
            </h2>

            <p className={`mt-4 text-sm sm:text-base ${bodyColor}`}>
              From entering your destination to following your selected journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className={`relative tc-card p-7 ${darkMode ? 'bg-white/[0.04]' : 'bg-white/75'}`}
                >
                  <div className="flex items-center justify-between mb-7">
                    <span className="text-4xl font-extrabold tc-gradient-text">
                      {step.number}
                    </span>

                    <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className={`text-xl font-extrabold mb-3 ${headingColor}`}>
                    {step.title}
                  </h3>

                  <p className={`text-sm leading-7 ${bodyColor}`}>
                    {step.description}
                  </p>

                  <div className="mt-6 pt-4 border-t border-violet-200/50">
                    <span className="text-xs font-bold text-violet-600">
                      {step.detail}
                    </span>
                  </div>

                  {index < 2 && (
                    <div className="hidden md:flex absolute -right-4 top-1/2 z-10 w-8 h-8 rounded-full bg-violet-600 text-white items-center justify-center shadow-lg">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. POPULAR HYDERABAD COMMUTES */}
      <section className="relative py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10">
            <div>
              <div className="tc-section-label">
                <MapPinned className="w-4 h-4" />
                High-demand corridors
              </div>

              <h2 className={`text-3xl sm:text-4xl font-extrabold mt-4 ${headingColor}`}>
                Popular Hyderabad commutes
              </h2>

              <p className={`mt-3 text-sm ${bodyColor}`}>
                Select a corridor to search for multimodal travel alternatives.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/search')}
              className="tc-button-secondary self-start md:self-auto"
            >
              Explore all journeys
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularDestinations.map((item, index) => (
              <button
                type="button"
                key={item.from}
                onClick={() => handleSelectPopular(item)}
                className={`group text-left tc-card tc-card-hover p-6 flex flex-col justify-between min-h-[270px] ${
                  darkMode ? 'bg-white/[0.055]' : 'bg-white/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="tc-pill">
                      Corridor {index + 1}
                    </span>

                    <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Route className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className={`text-lg font-extrabold leading-snug ${headingColor}`}>
                    {item.from}
                  </h3>

                  <div className="flex items-center gap-2 my-3 text-violet-500">
                    <div className="h-px w-7 bg-violet-300" />
                    <ArrowRight className="w-4 h-4" />
                    <div className="h-px w-7 bg-violet-300" />
                  </div>

                  <h3 className={`text-lg font-extrabold leading-snug ${headingColor}`}>
                    {item.to}
                  </h3>

                  <p className={`text-xs leading-6 mt-4 ${bodyColor}`}>
                    {item.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-violet-200/50">
                  <span className="text-xs font-bold text-violet-600">
                    Search this route
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-violet-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className={`relative py-20 sm:py-24 px-4 border-y ${sectionBg}`}>
        <div className="max-w-3xl mx-auto">

          <div className="text-center mb-12">
            <div className="tc-section-label">
              <Globe2 className="w-4 h-4" />
              Frequently asked questions
            </div>

            <h2 className={`text-3xl sm:text-4xl font-extrabold mt-4 ${headingColor}`}>
              Everything you need to know
            </h2>

            <p className={`mt-4 text-sm ${bodyColor}`}>
              Learn about route optimization, transport schedules, and journey planning.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <article
                  key={faq.q}
                  className={`rounded-2xl border overflow-hidden backdrop-blur-xl transition-all ${
                    darkMode
                      ? 'bg-white/[0.05] border-white/10'
                      : 'bg-white/75 border-violet-100 shadow-sm'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className={`w-full px-5 sm:px-6 py-5 text-left flex items-center justify-between gap-4 ${
                      darkMode
                        ? 'hover:bg-white/5'
                        : 'hover:bg-violet-50/70'
                    }`}
                  >
                    <span className={`text-sm sm:text-base font-bold ${headingColor}`}>
                      {faq.q}
                    </span>

                    <span className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </span>
                  </button>

                  {isOpen && (
                    <div className={`px-5 sm:px-6 pb-6 pt-1 text-sm leading-7 border-t ${
                      darkMode
                        ? 'border-white/10 text-slate-300'
                        : 'border-violet-100 text-slate-600'
                    }`}>
                      {faq.a}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="relative px-4 sm:px-6 py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800" />

        <div className="absolute -top-32 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-24 w-96 h-96 bg-fuchsia-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto text-center text-white">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/15 border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-xl">
            <Navigation className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs font-bold mt-7">
            <Sparkles className="w-4 h-4" />
            Your next journey starts here
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight mt-6">
            Plan your next commute in seconds.
          </h2>

          <p className="text-sm sm:text-base text-violet-100 leading-8 mt-5 max-w-xl mx-auto">
            Explore multimodal journey combinations across Hyderabad and
            compare travel time, walking distance, transfers, and fares.
          </p>

          <button
            type="button"
            onClick={() => navigate('/search')}
            className="inline-flex items-center justify-center gap-3 mt-8 px-7 py-4 rounded-xl bg-white text-violet-800 font-extrabold text-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <Search className="w-5 h-5" />
            Find best multimodal journeys
            <ArrowRight className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center justify-center gap-5 mt-8 text-xs text-violet-100">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Journey planning
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Multimodal routes
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Timetable-aware
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

function SlidersIcon({ className = 'w-5 h-5' }) {
  return <RefreshCw className={className} />;
}
