
import React from 'react';
import {
  Clock,
  ArrowRight,
  Footprints,
  Bus,
  Train,
  ShieldCheck,
  Sparkles,
  Wallet,
  ArrowUpRight,
  Route,
  CheckCircle2,
  Timer,
} from 'lucide-react';

export default function JourneyCard({
  alternative,
  isSelected,
  onSelect,
  onBook,
}) {
  if (!alternative) return null;

  const legs = alternative.legs || [];

  const formatDuration = (seconds = 0) => {
    const mins = Math.round(seconds / 60);

    if (mins < 60) return `${mins} min`;

    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;

    return remaining === 0
      ? `${hours} hr`
      : `${hours} hr ${remaining} min`;
  };

  const formatDistance = (meters = 0) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }

    return `${Math.round(meters)} m`;
  };

  const getModeDetails = (leg) => {
    const mode = (leg.mode || leg.leg_type || '').toLowerCase();

    if (mode === 'walk' || leg.leg_type === 'walk') {
      return {
        label: 'Walk',
        icon: Footprints,
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    }

    if (mode === 'metro') {
      return {
        label: leg.route_short_name || 'Metro',
        icon: Train,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    }

    return {
      label: leg.route_short_name || 'Bus',
      icon: Bus,
      className: 'bg-sky-50 text-sky-700 border-sky-200',
      dot: 'bg-sky-500',
    };
  };

  const isWalk = (leg) =>
    leg.leg_type === 'walk' ||
    (leg.mode || '').toLowerCase() === 'walk';

  const transitLegs = legs.filter((leg) => !isWalk(leg));

  const transferCount = alternative.transfer_count || 0;
  const walkingDistance = alternative.walking_distance_meters || 0;
  const walkingDuration = alternative.walking_duration_seconds || 0;
  const waitingDuration = alternative.waiting_duration_seconds || 0;
  const reliability = alternative.reliability_score;

  return (
    <article
      onClick={onSelect}
      onKeyDown={(event) => {
        if (
          onSelect &&
          (event.key === 'Enter' || event.key === ' ')
        ) {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={Boolean(isSelected)}
      className={`
        group relative overflow-hidden rounded-[1.4rem]
        border backdrop-blur-2xl cursor-pointer
        transition-all duration-300
        ${
          isSelected
            ? 'bg-violet-50/90 border-violet-400 shadow-[0_16px_45px_rgba(109,40,217,0.13)] ring-2 ring-violet-300/50'
            : 'bg-white/85 border-violet-100 shadow-[0_10px_32px_rgba(64,35,105,0.06)] hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_18px_45px_rgba(109,40,217,0.11)]'
        }
      `}
    >
      {/* Decorative background */}
      <div className="absolute -top-20 -right-16 w-48 h-48 rounded-full bg-violet-200/20 blur-3xl pointer-events-none" />

      <div className="relative p-5 sm:p-6">

        {/* TOP ROW: Time and fare */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-violet-600">
                Journey option
              </span>

              {alternative.pareto_optimal && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 border border-violet-200 px-2 py-1 text-[9px] font-extrabold text-violet-700">
                  <Sparkles className="w-3 h-3" />
                  Recommended
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-2xl sm:text-[1.8rem] font-extrabold tracking-tight text-[#241638]">
                    {alternative.departure_time || '--:--'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">
                    DEPARTURE
                  </p>
                </div>

                <ArrowRight className="w-5 h-5 text-violet-400 mx-1" />

                <div>
                  <p className="text-2xl sm:text-[1.8rem] font-extrabold tracking-tight text-[#241638]">
                    {alternative.arrival_time || '--:--'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">
                    ARRIVAL
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Fare */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="sm:text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Estimated fare
              </p>

              <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                ₹{alternative.fare ?? '--'}
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* DURATION AND TRANSFERS */}
        <div className="flex flex-wrap items-center gap-2 mt-5">

          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-100/80 border border-violet-200/70 text-violet-800 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(alternative.total_duration_seconds)}
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold">
            <Route className="w-3.5 h-3.5 text-violet-500" />
            {transitLegs.length} transit {transitLegs.length === 1 ? 'leg' : 'legs'}
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold">
            <ArrowUpRight className="w-3.5 h-3.5 text-sky-500" />
            {transferCount === 0
              ? 'Direct route'
              : `${transferCount} ${transferCount === 1 ? 'transfer' : 'transfers'}`}
          </span>
        </div>

        {/* ROUTE TIMELINE */}
        <div className="mt-5 rounded-2xl border border-violet-100 bg-white/75 p-4">

          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              Your route
            </p>

            <span className="text-[10px] font-semibold text-violet-600">
              {legs.length} journey segments
            </span>
          </div>

          {/* Origin */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-[#241638]">
                Starting point
              </p>
              <p className="text-[10px] text-slate-400">
                {alternative.origin_name || 'Journey origin'}
              </p>
            </div>
          </div>

          {/* Transport segments */}
          {legs.map((leg, index) => {
            const details = getModeDetails(leg);
            const Icon = details.icon;
            const walking = isWalk(leg);

            return (
              <div
                key={leg.id || `leg-${index}`}
                className="relative ml-3.5 pl-7 pb-3 border-l-2 border-dashed border-violet-200 last:border-l-transparent"
              >
                <div className={`absolute -left-[7px] top-0 w-3 h-3 rounded-full border-2 border-white ${details.dot}`} />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold ${details.className}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {details.label}
                  </span>

                  <span className="text-[10px] font-semibold text-slate-500">
                    {formatDuration(leg.duration_seconds)}
                  </span>
                </div>

                <div className="mt-2">
                  <p className="text-xs font-semibold text-slate-700">
                    {leg.from_stop_name || leg.from_name || (walking ? 'Walking connection' : 'Boarding point')}
                  </p>

                  {leg.to_stop_name || leg.to_name ? (
                    <p className="text-[10px] text-slate-400 mt-1">
                      To {leg.to_stop_name || leg.to_name}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}

          {/* Destination */}
          <div className="flex items-center gap-3 mt-1">
            <div className="w-7 h-7 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-[#241638]">
                Destination
              </p>
              <p className="text-[10px] text-slate-400">
                {alternative.destination_name || 'Journey destination'}
              </p>
            </div>
          </div>
        </div>

        {/* JOURNEY SUMMARY */}
        {alternative.summary && (
          <div className="mt-4 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />

            <p className="text-xs leading-6 text-slate-600 line-clamp-2">
              {alternative.summary}
            </p>
          </div>
        )}

        {/* METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5">

          <div className="rounded-xl bg-violet-50/80 border border-violet-100 p-3">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Footprints className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[9px] font-bold uppercase tracking-wide">
                Walking
              </span>
            </div>

            <p className="text-sm font-extrabold text-[#241638]">
              {formatDistance(walkingDistance)}
            </p>

            <p className="text-[10px] text-slate-400 mt-1">
              {formatDuration(walkingDuration)}
            </p>
          </div>

          <div className="rounded-xl bg-violet-50/80 border border-violet-100 p-3">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Timer className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[9px] font-bold uppercase tracking-wide">
                Waiting
              </span>
            </div>

            <p className="text-sm font-extrabold text-[#241638]">
              {formatDuration(waitingDuration)}
            </p>

            <p className="text-[10px] text-slate-400 mt-1">
              Estimated wait
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl bg-emerald-50/80 border border-emerald-100 p-3">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[9px] font-bold uppercase tracking-wide">
                Reliability
              </span>
            </div>

            <p className="text-sm font-extrabold text-emerald-700">
              {reliability != null ? `${reliability}%` : 'N/A'}
            </p>

            <p className="text-[10px] text-emerald-600 mt-1">
              Route reliability score
            </p>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-violet-100">

          <div className="flex items-center gap-2">
            {isSelected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-violet-600" />
                <span className="text-xs font-bold text-violet-700">
                  Selected route
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-xs font-medium text-slate-500">
                  Select to view on map
                </span>
              </>
            )}
          </div>

          {onBook && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onBook(alternative);
              }}
              className="tc-button-primary w-full sm:w-auto text-xs px-5 py-3"
            >
              View journey details
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </article>
  );
}
