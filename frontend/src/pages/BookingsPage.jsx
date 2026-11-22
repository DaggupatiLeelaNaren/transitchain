
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/api';
import {
  Ticket,
  Clock,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  XCircle,
  QrCode,
  ArrowRight,
  MapPin,
  Bus,
  RefreshCw,
  ShieldCheck,
  X,
  CreditCard,
  Route,
  Sparkles
} from 'lucide-react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      setError(null);
      const res = await bookingService.getAll();
      setBookings(res.data.data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const openCancelModal = (booking) => {
    setSelectedBooking(booking);
    setCancellationReason('Change of travel plan');
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    if (cancellingId) return;
    setShowCancelModal(false);
    setSelectedBooking(null);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setCancellingId(selectedBooking._id);

    try {
      await bookingService.cancel(selectedBooking._id, {
        reason: cancellationReason
      });

      setShowCancelModal(false);
      setSelectedBooking(null);
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setCancellingId(null);
    }
  };

  const confirmedCount = bookings.filter(
    booking => booking.status !== 'cancelled'
  ).length;

  const cancelledCount = bookings.filter(
    booking => booking.status === 'cancelled'
  ).length;

  const formatDate = (value) => {
    if (!value) return 'Date unavailable';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="tc-page min-h-screen py-8 sm:py-10 px-4 sm:px-6">
      <div className="tc-container max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#241342] via-[#4C1D95] to-[#6D28D9] p-6 sm:p-9 text-white shadow-2xl shadow-violet-950/15">
          <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-violet-300/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 w-72 h-72 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-violet-200 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                <Ticket className="w-4 h-4" />
                Tickets & Passes
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                My Bookings
              </h1>

              <p className="text-sm text-violet-200 mt-2 max-w-lg">
                Your journeys, digital tickets and booking information in one place.
              </p>
            </div>

            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-violet-800 font-bold text-sm shadow-lg hover:bg-violet-50 transition-all"
            >
              <Route className="w-4 h-4" />
              Book a Journey
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-white/15">
            {[
              { label: 'Total Bookings', value: bookings.length, icon: Ticket },
              { label: 'Active Tickets', value: confirmedCount, icon: CheckCircle2 },
              { label: 'Cancelled', value: cancelledCount, icon: XCircle }
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
                <p className="text-2xl sm:text-3xl font-extrabold mt-2 tabular-nums">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Information */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Your Travel Tickets
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Review your reservations and manage your travel plans.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-violet-700 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Secure Booking Management
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="tc-glass rounded-3xl p-12 text-center border border-white/70">
            <RefreshCw className="w-9 h-9 text-violet-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700 mt-4">
              Loading your tickets...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Retrieving your booking information
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="font-bold text-red-800 mt-3">{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchBookings();
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && bookings.length === 0 && (
          <div className="tc-glass rounded-3xl p-10 sm:p-14 text-center border border-white/70">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-violet-100 flex items-center justify-center">
              <Ticket className="w-9 h-9 text-violet-600" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mt-5">
              No Bookings Yet
            </h3>

            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
              When you book a bus or metro trip, your digital ticket information will appear here.
            </p>

            <Link
              to="/search"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-700 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 transition-all"
            >
              <CompassIcon />
              Find a Journey
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Booking Cards */}
        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-5">
            {bookings.map((b) => {
              const isCancelled = b.status === 'cancelled';

              return (
                <article
                  key={b._id}
                  className={`relative overflow-hidden rounded-3xl border bg-white/85 backdrop-blur-xl shadow-sm transition-all ${
                    isCancelled
                      ? 'border-slate-200 opacity-80'
                      : 'border-violet-100 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-100/50'
                  }`}
                >
                  {/* Ticket top */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center ${
                          isCancelled
                            ? 'bg-slate-100 text-slate-400'
                            : 'bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700'
                        }`}>
                          <Bus className="w-6 h-6" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-900">
                              {b.routeShortName || 'Transit Journey'}
                            </h3>

                            <span className="text-[10px] px-2 py-1 rounded-lg bg-violet-50 border border-violet-100 font-mono text-violet-700">
                              {b.bookingReference || 'Reference unavailable'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 mt-1">
                            {b.providerCode || 'Transit'} Authorized Service
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
                          isCancelled
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {isCancelled ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          {isCancelled ? 'Cancelled' : 'Confirmed'}
                        </span>

                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                            Total Fare
                          </p>
                          <p className="text-xl font-extrabold text-slate-900">
                            ₹{b.totalFare ?? '—'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Journey route */}
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-4 mt-6 p-4 rounded-2xl bg-gradient-to-r from-violet-50/80 to-indigo-50/80 border border-violet-100/70">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 shrink-0 rounded-xl bg-emerald-100 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-emerald-700" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            From
                          </p>
                          <p className="text-sm font-bold text-slate-800 mt-1 break-words">
                            {b.fromStopName || 'Origin'}
                          </p>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white border border-violet-100 flex items-center justify-center shadow-sm">
                          <ArrowRight className="w-5 h-5 text-violet-600" />
                        </div>
                      </div>

                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 shrink-0 rounded-xl bg-rose-100 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-rose-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            To
                          </p>
                          <p className="text-sm font-bold text-slate-800 mt-1 break-words">
                            {b.toStopName || 'Destination'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Departure and arrival */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Departure
                          </p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">
                            {b.departureTime || 'Not available'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                          <CalendarDays className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Arrival
                          </p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">
                            {b.arrivalTime || 'Not available'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket footer */}
                  <div className="border-t border-dashed border-violet-200 px-5 sm:px-6 py-4 bg-violet-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-white border border-violet-100 flex items-center justify-center">
                        <QrCode className="w-5 h-5 text-violet-700" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Digital Ticket Reference
                        </p>
                        <p className="text-xs font-mono font-bold text-slate-700 mt-1 break-all">
                          {b.ticketNumber || b.bookingReference || 'Unavailable'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => openCancelModal(b)}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 text-xs font-bold transition-all"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {isCancelled && b.refundStatus && (
                        <div className="text-xs text-emerald-700 font-semibold flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Refund: ₹{b.refundAmount} ({b.refundStatus})
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom trust information */}
        {!loading && bookings.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3">
            <p className="text-xs text-slate-400">
              Keep your ticket reference available during your journey.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-600">
              <ShieldCheck className="w-4 h-4" />
              TransitChain Booking Records
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && selectedBooking && (
        <div
          className="fixed inset-0 z-[100] bg-[#171326]/65 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeCancelModal();
          }}
        >
          <div className="w-full max-w-md rounded-[28px] bg-white border border-violet-100 shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>

                <button
                  type="button"
                  onClick={closeCancelModal}
                  disabled={Boolean(cancellingId)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  aria-label="Close cancellation dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mt-5">
                Cancel this booking?
              </h3>

              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                You're about to cancel booking{' '}
                <span className="font-bold font-mono text-slate-800">
                  {selectedBooking.bookingReference}
                </span>.
                Please confirm your cancellation reason.
              </p>

              <div className="mt-5">
                <label
                  htmlFor="cancellationReason"
                  className="block text-xs font-bold text-slate-700 mb-2"
                >
                  Reason for cancellation
                </label>

                <input
                  id="cancellationReason"
                  type="text"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Enter cancellation reason"
                  className="tc-input w-full px-4 py-3 rounded-xl text-sm"
                />
              </div>

              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={closeCancelModal}
                  disabled={Boolean(cancellingId)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Keep Ticket
                </button>

                <button
                  type="button"
                  onClick={handleCancelBooking}
                  disabled={Boolean(cancellingId) || !cancellationReason.trim()}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {cancellingId ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Confirm Cancellation
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="px-6 py-3 bg-red-50 border-t border-red-100">
              <p className="text-[11px] text-red-700 text-center">
                Please review your booking before confirming cancellation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompassIcon() {
  return <Sparkles className="w-4 h-4" />;
}
