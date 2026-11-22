import React, { useCallback, useEffect, useState } from 'react';
import { adminService } from '../services/api';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cloud,
  Database,
  DollarSign,
  FileText,
  Globe,
  Gauge,
  Layers,
  MapPin,
  Plane,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Shield,
  ShieldCheck,
  Sparkles,
  Train,
  TrendingUp,
  Users,
  Wifi,
  X,
  Zap
} from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'mapek', label: 'MAPE-K Engine', icon: Sparkles },
  { id: 'overseas', label: 'Overseas Hub', icon: Globe },
  { id: 'fleet', label: 'Fleet & Telemetry', icon: Bus },
  { id: 'bookings', label: 'Bookings & Revenue', icon: DollarSign },
  { id: 'feeds', label: 'GTFS Feeds', icon: Database },
  { id: 'logs', label: 'Audit Logs', icon: FileText }
];

const panelClass =
  'rounded-2xl border border-slate-200/80 bg-white shadow-sm';

const buttonPrimary =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50';

const buttonSecondary =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50';

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2
  })}`;
};

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
};

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
            {eyebrow}
          </p>
        )}

        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'violet'
}) {
  const colors = {
    violet: 'bg-violet-50 text-violet-600 ring-violet-100',
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
    rose: 'bg-rose-50 text-rose-600 ring-rose-100',
    cyan: 'bg-cyan-50 text-cyan-600 ring-cyan-100'
  };

  return (
    <div className={`${panelClass} group p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100/70`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">
            {title}
          </p>

          <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
            {value ?? '—'}
          </p>
        </div>

        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${colors[color] || colors.violet}`}>
          <Icon size={20} />
        </div>
      </div>

      {subtitle && (
        <p className="mt-3 text-xs text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const value = String(status || 'unknown').toLowerCase();

  const positive = [
    'active',
    'confirmed',
    'ticket_issued',
    'ticket issued',
    'refund_processed',
    'refund processed',
    'online',
    'connected',
    'success',
    'completed',
    'healthy',
    'verified'
  ].some((word) => value.includes(word));

  const negative = [
    'failed',
    'error',
    'offline',
    'inactive',
    'critical',
    'rejected'
  ].some((word) => value.includes(word));

  const styles = positive
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    : negative
      ? 'bg-rose-50 text-rose-700 ring-rose-200'
      : 'bg-amber-50 text-amber-700 ring-amber-200';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ring-1 ${styles}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status || 'Unknown'}
    </span>
  );
}

function EmptyState({
  icon: Icon = Database,
  title,
  description
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-500">
        <Icon size={22} />
      </div>

      <p className="text-sm font-semibold text-slate-700">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function DataTable({ columns, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            {columns.map((column) => (
              <th
                key={column}
                className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState(null);
  const [mapekStatus, setMapekStatus] = useState(null);
  const [mapekHistory, setMapekHistory] = useState([]);
  const [fleet, setFleet] = useState([]);

  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const [bookingPagination, setBookingPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  const [revenue, setRevenue] = useState({
    grossRevenue: 0,
    refundTotal: 0,
    netRevenue: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0
  });

  const [selectedBooking, setSelectedBooking] = useState(null);

  const [revenueAnalytics, setRevenueAnalytics] = useState(null);

  const [feeds, setFeeds] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState([]);

  const [overseasGateways, setOverseasGateways] = useState([]);
  const [overseasProviders, setOverseasProviders] = useState([]);
  const [fxRates, setFxRates] = useState(null);
  const [pingResults, setPingResults] = useState(null);

  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingProviderFilter, setBookingProviderFilter] = useState('all');

  const [logSearch, setLogSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [mapekRunning, setMapekRunning] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);
  const [syncingFeeds, setSyncingFeeds] = useState(false);

  const [alertBanner, setAlertBanner] = useState(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const [alertForm, setAlertForm] = useState({
    title: '',
    message: '',
    mode: 'all',
    priority: 'warning'
  });

  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);

  const [delayForm, setDelayForm] = useState({
    vehicleNumber: '',
    delaySeconds: 300,
    status: 'delayed'
  });

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedBookingForRefund, setSelectedBookingForRefund] = useState(null);
  const [refundReason, setRefundReason] = useState('Commuter dispute resolution');

  const [selectedLogPayload, setSelectedLogPayload] = useState(null);

  const showBanner = useCallback((message, type = 'success') => {
    setAlertBanner({ message, type });

    window.setTimeout(() => setAlertBanner(null), 5000);
  }, []);

  const fetchAllData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);

    try {
      const [
        dashRes,
        mapekRes,
        feedsRes,
        logsRes,
        healthRes,
        revRes
      ] = await Promise.all([
        adminService.getDashboard(),
        adminService.getMapekStatus().catch(() => ({
          data: { data: null }
        })),
        adminService.getFeeds(),
        adminService.getAuditLogs({ limit: 50 }),
        adminService.getHealth(),
        adminService.getRevenueAnalytics().catch(() => ({
          data: { data: null }
        }))
      ]);

      setStats(dashRes.data.data);
      setMapekStatus(mapekRes.data?.data || null);
      setFeeds(feedsRes.data.data || []);
      setAuditLogs(logsRes.data.data || []);
      setSystemHealth(healthRes.data.data || []);
      setRevenueAnalytics(revRes.data?.data || null);

    } catch (err) {
      console.error('Admin data fetch error:', err);

      showBanner(
        err.response?.data?.message ||
        'Unable to load some admin information.',
        'error'
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showBanner]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const fetchFleet = useCallback(async () => {
    try {
      const res = await adminService.getFleet();

      setFleet(res.data.data || []);

    } catch (err) {
      console.error('Fetch fleet error:', err);

      showBanner('Unable to load fleet information.', 'error');
    }
  }, [showBanner]);

  // UPDATED BOOKINGS AND REVENUE API

  const fetchBookings = useCallback(async () => {
    setBookingLoading(true);
    setBookingError('');

    try {
      const response = await adminService.getBookings({
        page: bookingPagination.page,
        limit: 15,
        search: bookingSearch.trim(),
        status: bookingStatusFilter,
        provider: bookingProviderFilter
      });

      const payload = response?.data?.data ?? {};
      const revenueData = payload.revenue ?? {};

      setBookings(
        Array.isArray(payload.bookings)
          ? payload.bookings
          : []
      );

      setBookingPagination({
        page: Number(payload.pagination?.page) || bookingPagination.page,
        pages: Math.max(
          1,
          Number(payload.pagination?.pages) || 1
        ),
        total: Number(payload.pagination?.total) || 0
      });

      setRevenue({
        grossRevenue: Number(revenueData.grossRevenue) || 0,
        refundTotal: Number(revenueData.refundTotal) || 0,
        netRevenue: Number(revenueData.netRevenue) || 0,
        totalBookings: Number(revenueData.totalBookings) || 0,
        confirmedBookings: Number(revenueData.confirmedBookings) || 0,
        cancelledBookings: Number(revenueData.cancelledBookings) || 0
      });

    } catch (err) {
      console.error('Admin bookings loading error:', err);

      setBookings([]);

      setBookingError(
        err.response?.data?.message ||
        'Unable to load bookings. Please check the admin bookings API.'
      );

    } finally {
      setBookingLoading(false);
    }
  }, [
    bookingPagination.page,
    bookingSearch,
    bookingStatusFilter,
    bookingProviderFilter
  ]);

  const fetchMapekHistory = useCallback(async () => {
    try {
      const [statusRes, histRes] = await Promise.all([
        adminService.getMapekStatus(),
        adminService.getMapekHistory({ limit: 15 })
      ]);

      setMapekStatus(statusRes.data.data);
      setMapekHistory(histRes.data.data || []);

    } catch (err) {
      console.error('Fetch MAPE-K history error:', err);
    }
  }, []);

  const fetchOverseasData = useCallback(async () => {
    try {
      const [gatewaysRes, providersRes, fxRes] = await Promise.all([
        adminService.getOverseasGateways(),
        adminService.getOverseasProviders(),
        adminService.getOverseasFxRates()
      ]);

      setOverseasGateways(gatewaysRes.data.data || []);
      setOverseasProviders(providersRes.data.data || []);
      setFxRates(fxRes.data.data || null);

    } catch (err) {
      console.error('Fetch overseas data error:', err);

      showBanner(
        'Unable to load overseas gateway information.',
        'error'
      );
    }
  }, [showBanner]);

  useEffect(() => {
    if (activeTab === 'fleet') {
      fetchFleet();
    }

    if (activeTab === 'bookings') {
      fetchBookings();
    }

    if (activeTab === 'mapek') {
      fetchMapekHistory();
    }

    if (activeTab === 'overseas') {
      fetchOverseasData();
    }

  }, [
    activeTab,
    fetchFleet,
    fetchBookings,
    fetchMapekHistory,
    fetchOverseasData
  ]);

  const handleRunMapek = async () => {
    setMapekRunning(true);

    try {
      const res = await adminService.runMapek();

      const data = res.data.data || {};

      showBanner(
        `MAPE-K Cycle ${data.cycleId ?? ''} completed. System fitness: ${data.fitnessScore ?? '—'}%`
      );

      await fetchAllData(true);

      if (activeTab === 'mapek') {
        await fetchMapekHistory();
      }

    } catch (err) {
      showBanner(
        err.response?.data?.message ||
        'Failed to execute MAPE-K cycle.',
        'error'
      );

    } finally {
      setMapekRunning(false);
    }
  };

  const handleToggleAutopilot = async (enabled) => {
    setActionLoading(true);

    try {
      const res = await adminService.toggleMapekAutopilot(enabled);

      setMapekStatus(res.data.data);

      showBanner(
        `MAPE-K Autopilot ${enabled ? 'activated' : 'paused'}.`
      );

    } catch (err) {
      showBanner(
        'Failed to update MAPE-K autopilot.',
        'error'
      );

    } finally {
      setActionLoading(false);
    }
  };

  const handleInjectChaos = async (type) => {
    setActionLoading(true);

    try {
      await adminService.injectMapekChaos({
        type,
        durationSec: 45
      });

      showBanner(
        `Stress anomaly "${type}" injected.`,
        'warning'
      );

      window.setTimeout(() => {
        handleRunMapek();
      }, 800);

    } catch (err) {
      showBanner(
        'Failed to inject stress anomaly.',
        'error'
      );

    } finally {
      setActionLoading(false);
    }
  };

  const handleForceRefund = async () => {
    if (!selectedBookingForRefund) return;

    setActionLoading(true);

    try {
      await adminService.forceRefundBooking(
        selectedBookingForRefund._id,
        { reason: refundReason }
      );

      showBanner(
        `Refund processed for booking ${selectedBookingForRefund.bookingReference}.`
      );

      setIsRefundModalOpen(false);
      setSelectedBookingForRefund(null);

      await fetchBookings();
      await fetchAllData(true);

    } catch (err) {
      showBanner(
        err.response?.data?.message ||
        'Refund failed.',
        'error'
      );

    } finally {
      setActionLoading(false);
    }
  };

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();

    setActionLoading(true);

    try {
      const res = await adminService.broadcastAlert(alertForm);

      showBanner(
        `Network advisory broadcasted to ${res.data.data.recipientsCount} commuters.`
      );

      setIsAlertModalOpen(false);

      setAlertForm({
        title: '',
        message: '',
        mode: 'all',
        priority: 'warning'
      });

    } catch (err) {
      showBanner(
        err.response?.data?.message ||
        'Broadcast failed.',
        'error'
      );

    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateDelay = async (e) => {
    e.preventDefault();

    setActionLoading(true);

    try {
      await adminService.simulateFleetDelay(delayForm);

      showBanner(
        `Delay of +${delayForm.delaySeconds}s injected for ${delayForm.vehicleNumber}.`
      );

      setIsDelayModalOpen(false);

      await fetchFleet();

    } catch (err) {
      showBanner(
        'Failed to inject fleet delay.',
        'error'
      );

    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateFeed = async (id) => {
    try {
      const res = await adminService.activateFeed(id);

      showBanner(
        res.data.message || 'Feed activated successfully.'
      );

      await fetchAllData(true);

    } catch (err) {
      showBanner(
        err.response?.data?.message ||
        'Feed activation failed.',
        'error'
      );
    }
  };

  const handleRollbackFeed = async (id) => {
    try {
      const res = await adminService.rollbackFeed(id);

      showBanner(
        res.data.message || 'Feed rolled back successfully.'
      );

      await fetchAllData(true);

    } catch (err) {
      showBanner(
        err.response?.data?.message ||
        'Feed rollback failed.',
        'error'
      );
    }
  };

  const handleClearCache = async () => {
    try {
      await adminService.clearSystemCache();

      showBanner(
        'Routing spatial cache cleared successfully.'
      );

      await fetchAllData(true);

    } catch (err) {
      showBanner(
        'Cache clear failed.',
        'error'
      );
    }
  };

  const handlePingOverseasApis = async () => {
    setPingLoading(true);

    try {
      const res = await adminService.testOverseasApiPing();

      setPingResults(res.data.data);

      showBanner(
        'Global transportation APIs pinged successfully.'
      );

      await fetchOverseasData();

    } catch (err) {
      showBanner(
        'Failed to ping overseas APIs.',
        'error'
      );

    } finally {
      setPingLoading(false);
    }
  };

  const handleSyncOverseasSchedules = async () => {
    setSyncingFeeds(true);

    try {
      await adminService.syncOverseasSchedules();

      showBanner(
        'Overseas schedules synchronized successfully.'
      );

      await fetchOverseasData();

    } catch (err) {
      showBanner(
        'Failed to synchronize overseas schedules.',
        'error'
      );

    } finally {
      setSyncingFeeds(false);
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const searchText = logSearch.toLowerCase();

    if (!searchText) return true;

    return JSON.stringify(log).toLowerCase().includes(searchText);
  });

  const fitnessScore = mapekStatus?.currentFitnessScore;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f8f7fc]">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
          <Shield size={28} />

          <span className="absolute -right-1 -top-1 h-4 w-4 animate-ping rounded-full bg-violet-400 opacity-50" />
        </div>

        <p className="mt-5 text-sm font-bold text-slate-800">
          Preparing your operations center
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Connecting to TransitChain services...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7fc] text-slate-800">
      <main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#21143f] via-[#38206b] to-[#6335b5] p-6 text-white shadow-xl shadow-violet-900/10 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[45px] border-white/5" />

          <div className="pointer-events-none absolute -bottom-36 right-1/4 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-100">
                <ShieldCheck size={13} />
                Administrator workspace
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Network Operations Center
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100/80">
                Monitor your multimodal transport network, manage providers,
                oversee bookings and maintain system performance.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-violet-100/80">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  TransitChain administration
                </span>

                <span className="hidden text-white/30 sm:inline">
                  •
                </span>

                <span>
                  TGSRTC · HMRL · Overseas gateways
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => fetchAllData(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? 'animate-spin' : ''}
                />
                Refresh
              </button>

              <button
                onClick={() => setIsAlertModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-violet-800 shadow-lg transition hover:bg-violet-50"
              >
                <Bell size={15} />
                Broadcast alert
              </button>

              <button
                onClick={handleRunMapek}
                disabled={mapekRunning}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-xs font-bold text-amber-950 shadow-lg transition hover:bg-amber-300 disabled:opacity-50"
              >
                <Play size={14} />
                {mapekRunning ? 'Running...' : 'Run MAPE-K'}
              </button>
            </div>
          </div>
        </section>

        {alertBanner && (
          <div className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-sm shadow-sm ${
            alertBanner.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : alertBanner.type === 'warning'
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}>
            <div className="flex items-center gap-2">
              {alertBanner.type === 'error'
                ? <AlertCircle size={17} />
                : <CheckCircle2 size={17} />}

              <span className="font-medium">
                {alertBanner.message}
              </span>
            </div>

            <button
              onClick={() => setAlertBanner(null)}
              aria-label="Dismiss notification"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className={`${panelClass} p-2`}>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition ${
                    selected
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                      : 'text-slate-500 hover:bg-violet-50 hover:text-violet-700'
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* OVERVIEW */}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Network overview"
              title="Your network at a glance"
              description="A consolidated view of travelers, providers, infrastructure and system performance."
              action={
                <span className="text-xs text-slate-400">
                  <Clock size={13} className="mr-1 inline" />
                  Updated {new Date().toLocaleTimeString()}
                </span>
              }
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <MetricCard
                title="Total commuters"
                value={stats?.totalUsers ?? '—'}
                subtitle={`${stats?.verifiedUsers ?? 0} verified users`}
                icon={Users}
                color="violet"
              />

              <MetricCard
                title="Active providers"
                value={stats?.activeProviders ?? '—'}
                subtitle="Transport service providers"
                icon={Bus}
                color="emerald"
              />

              <MetricCard
                title="Stops & hubs"
                value={stats?.totalStops ?? '—'}
                subtitle="Network locations"
                icon={MapPin}
                color="amber"
              />

              <MetricCard
                title="Total bookings"
                value={stats?.totalBookings ?? '—'}
                subtitle="Bookings recorded"
                icon={Layers}
                color="blue"
              />

              <MetricCard
                title="Gross revenue"
                value={formatCurrency(stats?.totalRevenue)}
                subtitle="Recorded booking revenue"
                icon={DollarSign}
                color="cyan"
              />

              <MetricCard
                title="System fitness"
                value={fitnessScore != null ? `${fitnessScore}%` : '—'}
                subtitle="MAPE-K fitness score"
                icon={Gauge}
                color="rose"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <section className={`${panelClass} xl:col-span-2`}>
                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Infrastructure health
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Connected application services
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                    Service overview
                  </span>
                </div>

                <div className="grid gap-3 p-5 sm:grid-cols-2">
                  {[
                    {
                      title: 'Node.js & Express API',
                      description: 'Authentication, providers and core application services',
                      icon: Server,
                      status: systemHealth[0]?.status
                    },
                    {
                      title: 'Python FastAPI',
                      description: 'Multimodal route optimization service',
                      icon: Zap,
                      status: systemHealth[1]?.status
                    },
                    {
                      title: 'MongoDB',
                      description: 'Users, transport data and booking records',
                      icon: Database,
                      status: systemHealth[2]?.status
                    },
                    {
                      title: 'Transport network',
                      description: 'Bus, metro and connected transport feeds',
                      icon: Train,
                      status: systemHealth[3]?.status
                    }
                  ].map((service) => {
                    const Icon = service.icon;

                    return (
                      <div
                        key={service.title}
                        className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                          <Icon size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800">
                            {service.title}
                          </p>

                          <p className="mt-1 text-[11px] leading-5 text-slate-400">
                            {service.description}
                          </p>

                          {service.status && (
                            <div className="mt-2">
                              <StatusBadge status={service.status} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className={`${panelClass} p-5`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Autonomous engine
                    </p>

                    <h3 className="mt-1 text-base font-bold text-slate-900">
                      MAPE-K performance
                    </h3>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Sparkles size={19} />
                  </div>
                </div>

                <div className="mt-7 flex items-end gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-violet-700">
                    {fitnessScore != null ? fitnessScore : '—'}
                  </span>

                  <span className="mb-1 text-sm font-semibold text-slate-400">
                    {fitnessScore != null ? '%' : 'Fitness unavailable'}
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(0, Number(fitnessScore) || 0))}%`
                    }}
                  />
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Autopilot</span>

                    <StatusBadge
                      status={mapekStatus?.autopilotEnabled ? 'Active' : 'Paused'}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Transfer buffer</span>

                    <span className="font-semibold text-slate-700">
                      {mapekStatus?.learnedWeights?.transferBufferSec ?? '—'}s
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Congestion factor</span>

                    <span className="font-semibold text-slate-700">
                      {mapekStatus?.learnedWeights?.congestionFactor ?? '—'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('mapek')}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-50 py-3 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
                >
                  View MAPE-K details
                  <ArrowRight size={14} />
                </button>
              </section>
            </div>

            <section className={`${panelClass} overflow-hidden`}>
              <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin size={17} className="text-violet-600" />

                    <h3 className="text-sm font-bold text-slate-900">
                      Hyderabad multimodal corridor
                    </h3>
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    Indira Nagar – Gachibowli → Raidurg Hub → Ameerpet Interchange → KPHB Colony
                  </p>
                </div>

                <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
                  ROUTE BENCHMARK
                </span>
              </div>

              <div className="grid gap-3 p-5 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Bus size={15} className="text-violet-600" />
                    DIRECT BUS
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-900">
                    TGSRTC Route 195W
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    38 mins · ₹35 · 0 transfers
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Train size={15} className="text-blue-600" />
                    MULTIMODAL ROUTE
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-900">
                    Bus 113 + HMRL Blue + Red
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    27 mins · ₹65 · 2 transfers
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Radio size={15} className="text-emerald-600" />
                    TRANSFER VERIFICATION
                  </div>

                  <p className="mt-3 text-sm font-bold text-emerald-700">
                    Raidurg Bus to Metro: 130m
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Ameerpet interchange: 90s walking
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* MAPE-K */}

        {activeTab === 'mapek' && (
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Autonomous optimization"
              title="MAPE-K control center"
              description="Monitor, analyze, plan and execute adaptive system improvements."
              action={
                <button
                  onClick={handleRunMapek}
                  disabled={mapekRunning}
                  className={buttonPrimary}
                >
                  <Play size={15} />
                  {mapekRunning ? 'Executing...' : 'Run cycle'}
                </button>
              }
            />

            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Current fitness"
                value={fitnessScore != null ? `${fitnessScore}%` : '—'}
                subtitle="Latest MAPE-K fitness score"
                icon={Gauge}
              />

              <MetricCard
                title="Autopilot"
                value={mapekStatus?.autopilotEnabled ? 'Enabled' : 'Paused'}
                subtitle="Automatic adaptation mode"
                icon={Sparkles}
                color="emerald"
              />

              <MetricCard
                title="Transfer buffer"
                value={`${mapekStatus?.learnedWeights?.transferBufferSec ?? '—'}s`}
                subtitle="Learned transfer margin"
                icon={Clock}
                color="blue"
              />
            </div>

            <section className={`${panelClass} p-5`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Autopilot configuration
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Enable or pause automatic MAPE-K adaptation.
                  </p>
                </div>

                <button
                  onClick={() => handleToggleAutopilot(!mapekStatus?.autopilotEnabled)}
                  disabled={actionLoading}
                  className={mapekStatus?.autopilotEnabled ? buttonSecondary : buttonPrimary}
                >
                  <Activity size={15} />

                  {actionLoading
                    ? 'Updating...'
                    : mapekStatus?.autopilotEnabled
                      ? 'Pause autopilot'
                      : 'Enable autopilot'}
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: 'Walk penalty weight',
                    value: mapekStatus?.learnedWeights?.walkPenaltyWeight,
                    unit: 'x'
                  },
                  {
                    label: 'Transfer buffer',
                    value: mapekStatus?.learnedWeights?.transferBufferSec,
                    unit: 's'
                  },
                  {
                    label: 'Congestion factor',
                    value: mapekStatus?.learnedWeights?.congestionFactor,
                    unit: 'x'
                  },
                  {
                    label: 'Fare sensitivity',
                    value: mapekStatus?.learnedWeights?.fareSensitivity,
                    unit: 'x'
                  }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.label}
                    </p>

                    <p className="mt-2 text-xl font-extrabold text-violet-700">
                      {item.value ?? '—'}{item.unit}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className={`${panelClass} p-5`}>
              <SectionHeading
                eyebrow="Testing tools"
                title="Stress and recovery simulator"
                description="Inject a test anomaly and observe the MAPE-K cycle."
              />

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  {
                    type: 'latency_spike',
                    title: 'Search latency spike',
                    description: 'Simulate increased journey search latency.',
                    icon: Zap,
                    color: 'amber'
                  },
                  {
                    type: 'fleet_delay',
                    title: 'Fleet delay',
                    description: 'Inject a transport delay event.',
                    icon: Bus,
                    color: 'rose'
                  },
                  {
                    type: 'feed_drift',
                    title: 'GTFS feed desync',
                    description: 'Simulate a transport feed inconsistency.',
                    icon: Database,
                    color: 'blue'
                  }
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.type}
                      className="rounded-2xl border border-slate-100 p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <Icon size={19} />
                      </div>

                      <p className="mt-3 text-sm font-bold text-slate-800">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {item.description}
                      </p>

                      <button
                        onClick={() => handleInjectChaos(item.type)}
                        disabled={actionLoading}
                        className={`${buttonSecondary} mt-4 w-full`}
                      >
                        Inject test
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className={`${panelClass} overflow-hidden`}>
              <div className="p-5">
                <h3 className="text-sm font-bold text-slate-900">
                  MAPE-K cycle history
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Recent recorded adaptation cycles.
                </p>
              </div>

              <DataTable columns={['Cycle ID', 'Timestamp', 'Trigger', 'Fitness', 'Actions']}>
                {mapekHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <EmptyState
                        icon={Activity}
                        title="No cycle history available"
                        description="Run a MAPE-K cycle to create a new history record."
                      />
                    </td>
                  </tr>
                ) : (
                  mapekHistory.map((cycle) => (
                    <tr
                      key={cycle._id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-bold text-violet-700">
                        {cycle.cycleId || cycle._id}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(cycle.timestamp)}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-600">
                        {cycle.triggerType || '—'}
                      </td>

                      <td className="px-4 py-3 text-xs font-bold text-emerald-700">
                        {cycle.fitnessScore ?? '—'}%
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {cycle.execute?.executedActions?.join(', ') || 'Baseline validation'}
                      </td>
                    </tr>
                  ))
                )}
              </DataTable>
            </section>
          </div>
        )}

        {/* OVERSEAS */}

        {activeTab === 'overseas' && (
          <div className="space-y-6">
            <SectionHeading
              eyebrow="International connectivity"
              title="Overseas transit hub"
              description="Manage international transport gateways and external provider integrations."
              action={
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handlePingOverseasApis}
                    disabled={pingLoading}
                    className={buttonSecondary}
                  >
                    <Wifi size={15} />
                    {pingLoading ? 'Testing...' : 'Test APIs'}
                  </button>

                  <button
                    onClick={handleSyncOverseasSchedules}
                    disabled={syncingFeeds}
                    className={buttonPrimary}
                  >
                    <RefreshCw size={15} />
                    {syncingFeeds ? 'Syncing...' : 'Sync schedules'}
                  </button>
                </div>
              }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                title="Overseas gateways"
                value={overseasGateways.length}
                subtitle="Gateway records returned"
                icon={Globe}
                color="blue"
              />

              <MetricCard
                title="Overseas providers"
                value={overseasProviders.length}
                subtitle="Provider records returned"
                icon={Plane}
                color="violet"
              />

              <MetricCard
                title="Currency data"
                value={fxRates ? 'Available' : '—'}
                subtitle="Foreign exchange information"
                icon={DollarSign}
                color="emerald"
              />
            </div>

            {pingResults && (
              <section className={`${panelClass} p-5`}>
                <h3 className="text-sm font-bold text-slate-900">
                  Latest API ping response
                </h3>

                <pre className="mt-3 max-h-60 overflow-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
                  {JSON.stringify(pingResults, null, 2)}
                </pre>
              </section>
            )}

            <section className={`${panelClass} overflow-hidden`}>
              <div className="p-5">
                <h3 className="text-sm font-bold text-slate-900">
                  Overseas gateways
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Gateway information returned by the backend.
                </p>
              </div>

              <DataTable columns={['Gateway', 'Location', 'Status', 'Details']}>
                {overseasGateways.length === 0 ? (
                  <tr>
                    <td colSpan="4">
                      <EmptyState
                        icon={Globe}
                        title="No gateway records"
                        description="No overseas gateway records were returned."
                      />
                    </td>
                  </tr>
                ) : (
                  overseasGateways.map((item, index) => (
                    <tr
                      key={item._id || index}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3 text-xs font-semibold text-slate-800">
                        {item.name || item.code || item.airportCode || 'Gateway'}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {item.city || item.location || item.country || '—'}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge
                          status={item.status || (item.active ? 'Active' : 'Unknown')}
                        />
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {item.type || item.description || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </DataTable>
            </section>

            <section className={`${panelClass} overflow-hidden`}>
              <div className="p-5">
                <h3 className="text-sm font-bold text-slate-900">
                  Overseas providers
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Connected international transportation providers.
                </p>
              </div>

              <DataTable columns={['Provider', 'Type', 'Status']}>
                {overseasProviders.length === 0 ? (
                  <tr>
                    <td colSpan="3">
                      <EmptyState
                        icon={Plane}
                        title="No overseas providers"
                        description="No provider records were returned."
                      />
                    </td>
                  </tr>
                ) : (
                  overseasProviders.map((item, index) => (
                    <tr
                      key={item._id || index}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3 text-xs font-semibold text-slate-800">
                        {item.name || item.providerName || 'Provider'}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {item.type || item.mode || '—'}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge
                          status={item.status || (item.active ? 'Active' : 'Unknown')}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </DataTable>
            </section>

            {fxRates && (
              <section className={`${panelClass} p-5`}>
                <h3 className="text-sm font-bold text-slate-900">
                  Foreign exchange information
                </h3>

                <pre className="mt-3 max-h-60 overflow-auto rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
                  {JSON.stringify(fxRates, null, 2)}
                </pre>
              </section>
            )}
          </div>
        )}

        {/* FLEET */}

        {activeTab === 'fleet' && (
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Transport operations"
              title="Fleet & telemetry"
              description="Review available fleet records and simulate a vehicle delay."
              action={
                <div className="flex gap-2">
                  <button
                    onClick={fetchFleet}
                    className={buttonSecondary}
                  >
                    <RefreshCw size={15} />
                    Refresh
                  </button>

                  <button
                    onClick={() => setIsDelayModalOpen(true)}
                    className={buttonPrimary}
                  >
                    <Clock size={15} />
                    Simulate delay
                  </button>
                </div>
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard
                title="Fleet records"
                value={fleet.length}
                subtitle="Vehicles returned by the service"
                icon={Bus}
              />

              <MetricCard
                title="Fleet management"
                value="Available"
                subtitle="Fleet data endpoint"
                icon={Activity}
                color="emerald"
              />
            </div>

            <section className={`${panelClass} overflow-hidden`}>
              <div className="p-5">
                <h3 className="text-sm font-bold text-slate-900">
                  Fleet records
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Vehicle details returned by the fleet service.
                </p>
              </div>

              <DataTable columns={['Vehicle', 'Provider', 'Route', 'Status', 'Last update']}>
                {fleet.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <EmptyState
                        icon={Bus}
                        title="No fleet records found"
                        description="The fleet endpoint did not return any vehicle records."
                      />
                    </td>
                  </tr>
                ) : (
                  fleet.map((vehicle, index) => (
                    <tr
                      key={vehicle._id || index}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3 text-xs font-semibold text-slate-800">
                        {vehicle.vehicleNumber || vehicle.registrationNumber || vehicle.name || '—'}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {vehicle.providerName || vehicle.provider?.name || '—'}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {vehicle.routeName || vehicle.route?.name || '—'}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={vehicle.status || 'Unknown'} />
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(vehicle.updatedAt || vehicle.lastUpdated)}
                      </td>
                    </tr>
                  ))
                )}
              </DataTable>
            </section>
          </div>
        )}

        {/* BOOKINGS & REVENUE - CORRECTED IMPLEMENTATION */}

        {activeTab === 'bookings' && (
          <div className="space-y-6">

            <SectionHeading
              eyebrow="Financial operations"
              title="Bookings & revenue"
              description="Review platform-wide booking records, refunds and revenue analytics."
              action={
                <button
                  type="button"
                  onClick={fetchBookings}
                  disabled={bookingLoading}
                  className={buttonSecondary}
                >
                  <RefreshCw
                    size={15}
                    className={bookingLoading ? 'animate-spin' : ''}
                  />
                  Refresh bookings
                </button>
              }
            />

            {/* REVENUE CARDS */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <MetricCard
                title="Gross revenue"
                value={formatCurrency(revenue.grossRevenue)}
                subtitle="Confirmed and ticket-issued bookings"
                icon={TrendingUp}
                color="emerald"
              />

              <MetricCard
                title="Refund total"
                value={formatCurrency(revenue.refundTotal)}
                subtitle="Recorded refund amounts"
                icon={RotateCcw}
                color="rose"
              />

              <MetricCard
                title="Net revenue"
                value={formatCurrency(revenue.netRevenue)}
                subtitle="Gross revenue less refunds"
                icon={DollarSign}
                color="violet"
              />

              <MetricCard
                title="Total bookings"
                value={revenue.totalBookings}
                subtitle="All platform booking records"
                icon={Layers}
                color="blue"
              />

              <MetricCard
                title="Confirmed bookings"
                value={revenue.confirmedBookings}
                subtitle="Confirmed or ticket issued"
                icon={CheckCircle2}
                color="emerald"
              />

              <MetricCard
                title="Cancelled bookings"
                value={revenue.cancelledBookings}
                subtitle="Cancelled booking records"
                icon={AlertTriangle}
                color="amber"
              />

            </div>

            {/* BOOKING FILTERS */}

            <section className={`${panelClass} p-4 sm:p-5`}>

              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Booking registry
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Search and filter platform booking records.
                  </p>
                </div>

                <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold text-violet-700">
                  {bookingPagination.total} records
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-3">

                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={bookingSearch}
                    onChange={(e) => {
                      setBookingPagination((prev) => ({
                        ...prev,
                        page: 1
                      }));

                      setBookingSearch(e.target.value);
                    }}
                    placeholder="Search reference, passenger..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <select
                  value={bookingStatusFilter}
                  onChange={(e) => {
                    setBookingPagination((prev) => ({
                      ...prev,
                      page: 1
                    }));

                    setBookingStatusFilter(e.target.value);
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700 outline-none focus:border-violet-400"
                >
                  <option value="all">All booking statuses</option>
                  <option value="initiated">Initiated</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="ticket_issued">Ticket issued</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refund_processed">Refund processed</option>
                  <option value="failed">Failed</option>
                </select>

                <select
                  value={bookingProviderFilter}
                  onChange={(e) => {
                    setBookingPagination((prev) => ({
                      ...prev,
                      page: 1
                    }));

                    setBookingProviderFilter(e.target.value);
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700 outline-none focus:border-violet-400"
                >
                  <option value="all">All providers</option>
                  <option value="TGSRTC">TGSRTC</option>
                  <option value="HMRL">HMRL</option>
                </select>

              </div>

              {(bookingSearch ||
                bookingStatusFilter !== 'all' ||
                bookingProviderFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setBookingSearch('');
                    setBookingStatusFilter('all');
                    setBookingProviderFilter('all');

                    setBookingPagination((prev) => ({
                      ...prev,
                      page: 1
                    }));
                  }}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900"
                >
                  <X size={13} />
                  Clear filters
                </button>
              )}

            </section>

            {/* BOOKING ERROR */}

            {bookingError && (
              <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />

                <div>
                  <p className="font-semibold">
                    Unable to load bookings
                  </p>

                  <p className="mt-1 text-xs">
                    {bookingError}
                  </p>

                  <button
                    type="button"
                    onClick={fetchBookings}
                    className="mt-3 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold hover:bg-rose-100"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* BOOKING TABLE */}

            <section className={`${panelClass} overflow-hidden`}>

              <DataTable
                columns={[
                  'Booking reference',
                  'Passenger',
                  'Provider / Route',
                  'Journey',
                  'Travel date',
                  'Fare',
                  'Status',
                  'Created',
                  'Actions'
                ]}
              >

                {bookingLoading ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="p-12 text-center text-slate-400"
                    >
                      <RefreshCw
                        className="mx-auto mb-3 animate-spin text-violet-500"
                        size={23}
                      />

                      Loading booking records...
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="9">
                      <EmptyState
                        icon={Layers}
                        title="No booking records found"
                        description="Try changing your search or filters. New platform bookings will appear here."
                      />
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="border-t border-slate-100 transition hover:bg-violet-50/40"
                    >

                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-bold text-violet-700">
                          {booking.bookingReference || booking._id || '—'}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {booking.ticketNumber || 'No ticket number'}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-xs">
                        <p className="font-semibold text-slate-800">
                          {booking.userId?.name ||
                            booking.user?.name ||
                            booking.passengerName ||
                            'Passenger'}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {booking.userId?.email ||
                            booking.user?.email ||
                            '—'}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-xs">
                        <p className="font-semibold text-slate-700">
                          {booking.providerCode ||
                            booking.providerName ||
                            '—'}
                        </p>

                        <p className="mt-1 text-slate-400">
                          {booking.routeShortName ||
                            booking.routeName ||
                            '—'}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-600">
                        <p>
                          {booking.fromStopName || '—'}
                        </p>

                        <p className="mt-1 text-slate-400">
                          → {booking.toStopName || '—'}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {booking.departureTime || '—'}
                      </td>

                      <td className="px-4 py-3 text-xs font-bold text-slate-800">
                        {formatCurrency(
                          booking.totalFare ??
                          booking.totalAmount ??
                          booking.fare
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge
                          status={booking.status || 'unknown'}
                        />
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(booking.createdAt)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">

                          <button
                            type="button"
                            onClick={() => setSelectedBooking(booking)}
                            className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-[10px] font-bold text-violet-700 transition hover:bg-violet-100"
                          >
                            View
                          </button>

                          {['confirmed', 'ticket_issued'].includes(
                            String(booking.status || '').toLowerCase()
                          ) && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBookingForRefund(booking);
                                setIsRefundModalOpen(true);
                              }}
                              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-bold text-rose-700 transition hover:bg-rose-100"
                            >
                              Refund
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  ))
                )}

              </DataTable>

              {/* PAGINATION */}

              <div className="flex flex-col justify-between gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center">

                <p className="text-xs text-slate-500">
                  Showing {bookings.length} of {bookingPagination.total} booking records
                </p>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    disabled={
                      bookingLoading ||
                      bookingPagination.page <= 1
                    }
                    onClick={() =>
                      setBookingPagination((prev) => ({
                        ...prev,
                        page: Math.max(
                          1,
                          (Number(prev.page) || 1) - 1
                        )
                      }))
                    }
                    className={buttonSecondary}
                  >
                    <ChevronLeft size={15} />
                    Previous
                  </button>

                  <span className="px-2 text-xs text-slate-500">
                    Page {bookingPagination.page} of {bookingPagination.pages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      bookingLoading ||
                      bookingPagination.page >= bookingPagination.pages
                    }
                    onClick={() =>
                      setBookingPagination((prev) => ({
                        ...prev,
                        page: Math.min(
                          prev.pages,
                          (Number(prev.page) || 1) + 1
                        )
                      }))
                    }
                    className={buttonSecondary}
                  >
                    Next
                    <ChevronRight size={15} />
                  </button>

                </div>
              </div>

            </section>
          </div>
        )}

        {/* FEEDS */}

        {activeTab === 'feeds' && (
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Transport data management"
              title="GTFS feeds"
              description="Review configured transport feeds and manage their activation state."
              action={
                <button
                  onClick={() => fetchAllData(true)}
                  className={buttonSecondary}
                >
                  <RefreshCw size={15} />
                  Refresh feeds
                </button>
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard
                title="Feed records"
                value={feeds.length}
                subtitle="Configured feed entries"
                icon={Database}
                color="violet"
              />

              <MetricCard
                title="Feed management"
                value="Available"
                subtitle="Activation and rollback controls"
                icon={Cloud}
                color="emerald"
              />
            </div>

            <section className={`${panelClass} overflow-hidden`}>
              <div className="p-5">
                <h3 className="text-sm font-bold text-slate-900">
                  Feed registry
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Feed information returned by the backend.
                </p>
              </div>

              <DataTable columns={['Feed', 'Provider', 'Status', 'Last update', 'Actions']}>
                {feeds.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <EmptyState
                        title="No feed records"
                        description="No GTFS feed entries were returned."
                      />
                    </td>
                  </tr>
                ) : (
                  feeds.map((feed, index) => (
                    <tr
                      key={feed._id || index}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3 text-xs font-semibold text-slate-800">
                        {feed.name ||
                          feed.feedName ||
                          feed.source ||
                          'Transport feed'}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {feed.providerName || feed.provider || '—'}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge
                          status={feed.status || (feed.isActive ? 'Active' : 'Inactive')}
                        />
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(feed.updatedAt || feed.lastSyncedAt)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleActivateFeed(feed._id)}
                            className="rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                          >
                            Activate
                          </button>

                          <button
                            onClick={() => handleRollbackFeed(feed._id)}
                            className="rounded-lg bg-amber-50 px-3 py-2 text-[10px] font-bold text-amber-700 hover:bg-amber-100"
                          >
                            <RotateCcw size={12} className="mr-1 inline" />
                            Rollback
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </DataTable>
            </section>
          </div>
        )}

        {/* AUDIT LOGS */}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Security and compliance"
              title="Audit logs"
              description="Review recorded administrative and system events."
              action={
                <button
                  onClick={() => fetchAllData(true)}
                  className={buttonSecondary}
                >
                  <RefreshCw size={15} />
                  Refresh logs
                </button>
              }
            />

            <section className={`${panelClass} p-4`}>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Search audit events..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </section>

            <section className={`${panelClass} overflow-hidden`}>
              <DataTable columns={['Event', 'Actor', 'Action', 'Timestamp', 'Details']}>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <EmptyState
                        icon={ShieldCheck}
                        title="No matching audit events"
                        description="Try another search term or refresh the records."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => (
                    <tr
                      key={log._id || index}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3 text-xs font-semibold text-slate-800">
                        {log.event || log.action || log.type || 'System event'}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {log.user?.name ||
                          log.actor?.name ||
                          log.userName ||
                          'System'}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {log.action || log.method || '—'}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(log.createdAt || log.timestamp)}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedLogPayload(log)}
                          className="rounded-lg bg-violet-50 px-3 py-2 text-[10px] font-bold text-violet-700 hover:bg-violet-100"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </DataTable>
            </section>
          </div>
        )}

        <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 py-5 text-[11px] text-slate-400 sm:flex-row">
          <p>TransitChain Network Operations Center</p>

          <p className="flex items-center gap-2">
            <ShieldCheck size={13} className="text-violet-500" />
            Administrator workspace
          </p>
        </footer>

      </main>

      {/* BROADCAST ALERT MODAL */}

      {isAlertModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Broadcast network alert
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Send an advisory to commuters.
                </p>
              </div>

              <button
                onClick={() => setIsAlertModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleBroadcastAlert}
              className="space-y-4 p-5"
            >
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Alert title
                </label>

                <input
                  value={alertForm.title}
                  onChange={(e) =>
                    setAlertForm({
                      ...alertForm,
                      title: e.target.value
                    })
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400"
                  placeholder="Enter alert title"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Message
                </label>

                <textarea
                  value={alertForm.message}
                  onChange={(e) =>
                    setAlertForm({
                      ...alertForm,
                      message: e.target.value
                    })
                  }
                  required
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400"
                  placeholder="Enter the advisory message..."
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Audience
                  </label>

                  <select
                    value={alertForm.mode}
                    onChange={(e) =>
                      setAlertForm({
                        ...alertForm,
                        mode: e.target.value
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs outline-none"
                  >
                    <option value="all">All commuters</option>
                    <option value="bus">Bus commuters</option>
                    <option value="metro">Metro commuters</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Priority
                  </label>

                  <select
                    value={alertForm.priority}
                    onChange={(e) =>
                      setAlertForm({
                        ...alertForm,
                        priority: e.target.value
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs outline-none"
                  >
                    <option value="info">Information</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAlertModalOpen(false)}
                  className={buttonSecondary}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className={buttonPrimary}
                >
                  <Bell size={15} />
                  {actionLoading ? 'Sending...' : 'Broadcast alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLEET DELAY MODAL */}

      {isDelayModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Simulate fleet delay
              </h3>

              <button
                onClick={() => setIsDelayModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSimulateDelay}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Vehicle number
                </label>

                <input
                  value={delayForm.vehicleNumber}
                  onChange={(e) =>
                    setDelayForm({
                      ...delayForm,
                      vehicleNumber: e.target.value
                    })
                  }
                  required
                  placeholder="Enter vehicle number"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Delay duration (seconds)
                </label>

                <input
                  type="number"
                  min="1"
                  value={delayForm.delaySeconds}
                  onChange={(e) =>
                    setDelayForm({
                      ...delayForm,
                      delaySeconds: Number(e.target.value)
                    })
                  }
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Status
                </label>

                <select
                  value={delayForm.status}
                  onChange={(e) =>
                    setDelayForm({
                      ...delayForm,
                      status: e.target.value
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                >
                  <option value="delayed">Delayed</option>
                  <option value="active">Active</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDelayModalOpen(false)}
                  className={buttonSecondary}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className={buttonPrimary}
                >
                  {actionLoading ? 'Applying...' : 'Apply simulation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING DETAILS MODAL */}

      {selectedBooking && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-bold text-slate-900">
                  Booking details
                </h2>

                <p className="mt-1 text-xs text-violet-600">
                  {selectedBooking.bookingReference || selectedBooking._id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close booking details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {[
                [
                  'Passenger',
                  selectedBooking.userId?.name ||
                  selectedBooking.user?.name ||
                  selectedBooking.passengerName
                ],
                [
                  'Email',
                  selectedBooking.userId?.email ||
                  selectedBooking.user?.email
                ],
                [
                  'Provider',
                  selectedBooking.providerCode ||
                  selectedBooking.providerName
                ],
                [
                  'Route',
                  selectedBooking.routeShortName ||
                  selectedBooking.routeName
                ],
                ['From', selectedBooking.fromStopName],
                ['To', selectedBooking.toStopName],
                ['Departure', selectedBooking.departureTime],
                ['Arrival', selectedBooking.arrivalTime],
                ['Passengers', selectedBooking.passengerCount],
                [
                  'Fare',
                  formatCurrency(
                    selectedBooking.totalFare ??
                    selectedBooking.totalAmount ??
                    selectedBooking.fare
                  )
                ],
                ['Status', selectedBooking.status],
                ['Ticket number', selectedBooking.ticketNumber],
                [
                  'Refund amount',
                  formatCurrency(selectedBooking.refundAmount)
                ],
                ['Refund status', selectedBooking.refundStatus],
                ['Created', formatDate(selectedBooking.createdAt)]
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 text-xs"
                >
                  <span className="text-slate-400">
                    {label}
                  </span>

                  <span className="max-w-[65%] break-words text-right font-semibold text-slate-700">
                    {value || '—'}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="mt-6 w-full rounded-xl bg-violet-600 py-3 text-xs font-bold text-white transition hover:bg-violet-700"
            >
              Close details
            </button>
          </div>
        </div>
      )}

      {/* REFUND MODAL */}

      {isRefundModalOpen && selectedBookingForRefund && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Process booking refund
              </h3>

              <button
                onClick={() => {
                  setIsRefundModalOpen(false);
                  setSelectedBookingForRefund(null);
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">
                Booking reference
              </p>

              <p className="mt-1 font-mono text-sm font-bold text-slate-900">
                {selectedBookingForRefund.bookingReference || selectedBookingForRefund._id}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {selectedBookingForRefund.fromStopName || 'Origin'} → {selectedBookingForRefund.toStopName || 'Destination'}
              </p>

              <p className="mt-2 text-sm font-bold text-slate-900">
                {formatCurrency(
                  selectedBookingForRefund.totalFare ??
                  selectedBookingForRefund.totalAmount ??
                  selectedBookingForRefund.fare
                )}
              </p>
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Refund reason
              </label>

              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsRefundModalOpen(false);
                  setSelectedBookingForRefund(null);
                }}
                className={buttonSecondary}
              >
                Cancel
              </button>

              <button
                onClick={handleForceRefund}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOG DETAIL MODAL */}

      {selectedLogPayload && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Audit event details
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Full event payload
                </p>
              </div>

              <button
                onClick={() => setSelectedLogPayload(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <pre className="max-h-[60vh] overflow-auto bg-slate-50 p-5 text-xs leading-6 text-slate-700">
              {JSON.stringify(selectedLogPayload, null, 2)}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}

function TicketIcon(props) {
  return <Layers {...props} />;
}