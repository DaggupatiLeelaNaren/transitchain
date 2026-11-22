
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trackingService } from '../services/api';
import io from 'socket.io-client';

import {
  Navigation,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Bus,
  Train,
  Footprints,
  Radio,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Route,
  Activity,
  Signal,
  ShieldCheck,
  CircleDot,
  Timer,
  LocateFixed
} from 'lucide-react';

export default function TrackingPage() {
  const { journeyId } = useParams();
  const navigate = useNavigate();

  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveSocketStatus, setLiveSocketStatus] = useState('connecting');

  useEffect(() => {
    let socket;
    let active = true;

    const fetchTracking = async () => {
      try {
        if (journeyId) {
          const res = await trackingService.getJourneyTracking(journeyId);

          if (active) {
            setTracking(res.data.data);
          }
        } else {
          // Demo active tracking
          if (active) {
            setTracking({
              journeyId: 'active_corridor_195w',
              status: 'in_progress',
              currentLegIndex: 1,
              totalLegs: 3,
              currentLeg: {
                mode: 'bus',
                route_short_name: '195W',
                provider_name: 'TGSRTC',
                from_stop_name: 'Indira Nagar - Gachibowli',
                to_stop_name: 'KPHB Colony',
                arrival_time: '09:12'
              },
              nextBoardingPoint: 'Indira Nagar Bus Stop',
              nextDestinationPoint: 'KPHB Colony Bus Stop',
              expectedArrival: '09:12',
              delaySeconds: 0,
              transferReminder: 'Alight at KPHB Colony Bus Stop for direct Metro entrance.',
              lastUpdated: new Date()
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch tracking:', err);

        // Demo fallback
        if (active) {
          setTracking({
            journeyId: 'demo_tracking',
            status: 'in_progress',
            currentLegIndex: 0,
            totalLegs: 2,
            currentLeg: {
              mode: 'metro',
              route_short_name: 'Blue Line',
              provider_name: 'HMRL',
              from_stop_name: 'Raidurg Metro',
              to_stop_name: 'Ameerpet Metro',
              arrival_time: '08:55'
            },
            nextBoardingPoint: 'Raidurg Metro Platform 1',
            nextDestinationPoint: 'Ameerpet Interchange',
            expectedArrival: '08:55',
            delaySeconds: 0,
            transferReminder: 'Prepare to switch to Red Line (Platform 3) at Ameerpet.',
            lastUpdated: new Date()
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTracking();

    // Socket.IO live connection
    socket = io('http://127.0.0.1:5000');

    socket.on('connect', () => {
      if (!active) return;

      setLiveSocketStatus('connected');

      if (journeyId) {
        socket.emit('subscribe:journey', journeyId);
      }
    });

    socket.on('disconnect', () => {
      if (active) {
        setLiveSocketStatus('disconnected');
      }
    });

    return () => {
      active = false;

      if (socket) {
        socket.disconnect();
      }
    };
  }, [journeyId]);

  const formatDelay = (seconds) => {
    const delay = Number(seconds || 0);

    if (delay <= 0) return 'On Time';

    const minutes = Math.ceil(delay / 60);
    return `${minutes} min delay`;
  };

  const getDelayColor = (seconds) => {
    const delay = Number(seconds || 0);

    if (delay <= 0) return 'text-emerald-600';
    if (delay <= 600) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStatusLabel = (status) => {
    const labels = {
      in_progress: 'In Progress',
      completed: 'Completed',
      delayed: 'Delayed',
      cancelled: 'Cancelled',
      scheduled: 'Scheduled'
    };

    return labels[status] || status || 'Tracking';
  };

  const getTransportIcon = (mode) => {
    if (mode === 'metro') return Train;
    if (mode === 'walk') return Footprints;
    return Bus;
  };

  if (loading) {
    return (
      <div className="tc-page min-h-screen flex items-center justify-center px-4">
        <div className="tc-glass rounded-3xl p-10 text-center border border-white/70 max-w-sm w-full">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto">
            <RefreshCw className="w-7 h-7 text-violet-700 animate-spin" />
          </div>
          <h2 className="font-bold text-slate-800 mt-5">
            Loading Live Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Retrieving your journey information...
          </p>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="tc-page min-h-screen flex items-center justify-center px-4">
        <div className="tc-glass rounded-3xl p-10 text-center max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-extrabold text-slate-900 mt-4">
            Tracking Unavailable
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            We couldn't retrieve the journey tracking information.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="tc-button-primary mt-6 px-5 py-3 rounded-xl text-sm font-bold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentLegIndex = Number(tracking.currentLegIndex || 0);
  const totalLegs = Math.max(Number(tracking.totalLegs || 1), 1);
  const progress = Math.min(
    100,
    Math.max(0, Math.round(((currentLegIndex + 1) / totalLegs) * 100))
  );

  const currentLeg = tracking.currentLeg || {};
  const TransportIcon = getTransportIcon(currentLeg.mode);
  const delaySeconds = tracking.delaySeconds || 0;

  const isCompleted = tracking.status === 'completed';
  const isCancelled = tracking.status === 'cancelled';

  return (
    <div className="tc-page min-h-screen py-8 sm:py-10 px-4 sm:px-6">
      <div className="tc-container max-w-5xl mx-auto space-y-7">

        {/* Page Header */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-violet-700 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-2 text-violet-600 text-xs font-bold uppercase tracking-[0.2em] mb-2">
              <Navigation className="w-4 h-4" />
              Journey Intelligence
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Live Journey Tracker
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              Follow your current transport leg and journey progress.
            </p>
          </div>

          {/* Socket status */}
          <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold ${
            liveSocketStatus === 'connected'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : liveSocketStatus === 'connecting'
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            <Radio className={`w-4 h-4 ${
              liveSocketStatus === 'connected' ? 'animate-pulse' : ''
            }`} />
            {liveSocketStatus === 'connected'
              ? 'LIVE CONNECTION'
              : liveSocketStatus === 'connecting'
                ? 'CONNECTING...'
                : 'CONNECTION LOST'}
          </div>
        </section>

        {/* Journey Overview */}
        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#241342] via-[#4C1D95] to-[#6D28D9] p-6 sm:p-8 text-white shadow-2xl shadow-violet-950/15">
          <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-violet-300/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 w-72 h-72 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-5">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-violet-200 mb-3">
                Your Active Journey
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold">
                {currentLeg.route_short_name || 'Multimodal Journey'}
              </h2>

              <p className="text-sm text-violet-200 mt-2">
                {currentLeg.provider_name || 'Transit Provider'}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur-md">
              <span className={`w-2 h-2 rounded-full ${
                isCompleted ? 'bg-emerald-400' : isCancelled ? 'bg-red-400' : 'bg-green-400 animate-pulse'
              }`} />
              {getStatusLabel(tracking.status)}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t border-white/15">
            <div className="rounded-2xl bg-white/[0.08] border border-white/10 p-4">
              <div className="flex items-center gap-2 text-violet-200 text-xs">
                <Route className="w-4 h-4" />
                Journey Leg
              </div>
              <p className="text-2xl font-extrabold mt-2">
                {Math.min(currentLegIndex + 1, totalLegs)} / {totalLegs}
              </p>
            </div>

            <div className="rounded-2xl bg-white/[0.08] border border-white/10 p-4">
              <div className="flex items-center gap-2 text-violet-200 text-xs">
                <Clock className="w-4 h-4" />
                Expected Arrival
              </div>
              <p className="text-2xl font-extrabold mt-2">
                {tracking.expectedArrival || currentLeg.arrival_time || '--:--'}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white/[0.08] border border-white/10 p-4">
              <div className="flex items-center gap-2 text-violet-200 text-xs">
                <Activity className="w-4 h-4" />
                Journey Progress
              </div>
              <p className="text-2xl font-extrabold mt-2">
                {progress}%
              </p>
            </div>
          </div>
        </section>

        {/* Journey Progress */}
        <section className="tc-glass rounded-3xl border border-white/70 p-5 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-extrabold text-slate-900">
                Journey Progress
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Current leg of your complete journey
              </p>
            </div>

            <span className="text-sm font-extrabold text-violet-700">
              {progress}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-violet-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between mt-3 text-[10px] font-semibold text-slate-400">
            <span>Journey Started</span>
            <span>{isCompleted ? 'Journey Completed' : 'Destination Ahead'}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6">
            {Array.from({ length: totalLegs }).map((_, index) => (
              <div
                key={index}
                className={`rounded-xl p-3 text-center border ${
                  index < currentLegIndex
                    ? 'bg-emerald-50 border-emerald-200'
                    : index === currentLegIndex
                      ? 'bg-violet-50 border-violet-300'
                      : 'bg-white/70 border-slate-200'
                }`}
              >
                {index < currentLegIndex ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                ) : index === currentLegIndex ? (
                  <CircleDot className="w-4 h-4 text-violet-600 mx-auto" />
                ) : (
                  <CircleDot className="w-4 h-4 text-slate-300 mx-auto" />
                )}

                <p className="text-[10px] font-bold text-slate-600 mt-2">
                  Leg {index + 1}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Current Transport Card */}
        <section className="tc-glass rounded-3xl border border-white/70 p-5 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center">
                <TransportIcon className="w-5 h-5 text-violet-700" />
              </div>

              <div>
                <h2 className="font-extrabold text-slate-900">
                  Current Transport
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Active transit connection
                </p>
              </div>
            </div>

            <span className="tc-pill text-xs">
              {currentLeg.mode || 'Transit'}
            </span>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-5">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Boarding
                </p>
                <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-2 break-words">
                  {tracking.nextBoardingPoint || currentLeg.from_stop_name || 'Boarding point'}
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-white border border-violet-100 flex items-center justify-center shadow-sm">
                <ArrowRight className="w-5 h-5 text-violet-600" />
              </div>

              <div className="min-w-0 text-right">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Destination
                </p>
                <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-2 break-words">
                  {tracking.nextDestinationPoint || currentLeg.to_stop_name || 'Destination'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white/70">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Boarding Station
                </p>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {currentLeg.from_stop_name || tracking.nextBoardingPoint || 'Not available'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white/70">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Expected Arrival
                </p>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {tracking.expectedArrival || currentLeg.arrival_time || 'Not available'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Transfer Reminder */}
        {tracking.transferReminder && (
          <section className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 shrink-0 rounded-2xl bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-amber-900">
                    Transfer Reminder
                  </h3>
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-amber-200/70 text-amber-900 px-2 py-1 rounded-full">
                    Important
                  </span>
                </div>

                <p className="text-sm text-amber-800 mt-2 leading-relaxed">
                  {tracking.transferReminder}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Delay Status */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="tc-glass rounded-3xl border border-white/70 p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <Timer className="w-6 h-6 text-emerald-600" />
            </div>

            <div>
              <p className="text-xs text-slate-500 font-semibold">
                Schedule Status
              </p>
              <p className={`text-lg font-extrabold mt-1 ${getDelayColor(delaySeconds)}`}>
                {formatDelay(delaySeconds)}
              </p>
            </div>
          </div>

          <div className="tc-glass rounded-3xl border border-white/70 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              liveSocketStatus === 'connected'
                ? 'bg-emerald-50'
                : 'bg-amber-50'
            }`}>
              <Signal className={`w-6 h-6 ${
                liveSocketStatus === 'connected'
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`} />
            </div>

            <div>
              <p className="text-xs text-slate-500 font-semibold">
                Live Telemetry
              </p>
              <p className={`text-lg font-extrabold mt-1 ${
                liveSocketStatus === 'connected'
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}>
                {liveSocketStatus === 'connected' ? 'Connected' : 'Offline'}
              </p>
            </div>
          </div>
        </section>

        {/* Destination Footer */}
        <section className="rounded-3xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <LocateFixed className="w-5 h-5 text-violet-700" />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Next Target
                </p>
                <p className="font-extrabold text-slate-900 mt-1">
                  {tracking.nextDestinationPoint || currentLeg.to_stop_name || 'Destination'}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Last Updated
              </p>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                {tracking.lastUpdated
                  ? new Date(tracking.lastUpdated).toLocaleTimeString('en-IN')
                  : 'Not available'}
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pb-3">
          <ShieldCheck className="w-4 h-4 text-violet-500" />
          TransitChain Journey Tracking
        </div>
      </div>
    </div>
  );
}
