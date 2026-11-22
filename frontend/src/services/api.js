import axios from 'axios';

const API_BASE = 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('transitchain_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('transitchain_token');
        localStorage.removeItem('transitchain_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export const journeyService = {
  search: (data) => api.post('/journeys/search', data),
  getById: (id) => api.get(`/journeys/${id}`),
  getStatus: (id) => api.get(`/journeys/${id}/status`),
  getHistory: () => api.get('/journeys/history'),
  favorite: (id) => api.post(`/journeys/${id}/favorite`)
};

export const bookingService = {
  create: (data) => api.post('/bookings', data),
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id, data) => api.post(`/bookings/${id}/cancel`, data)
};

export const trackingService = {
  getJourneyTracking: (journeyId) => api.get(`/tracking/${journeyId}`)
};

export const placeService = {
  getNearby: (lat, lon, category) => api.get(`/places/nearby?lat=${lat}&lon=${lon}${category ? `&category=${category}` : ''}`)
};

export const chatService = {
  sendMessage: (data) => api.post('/chat/message', data),
  getHistory: (sessionId) => api.get(`/chat/history/${sessionId}`)
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getPreferences: () => api.get('/users/preferences'),
  updatePreferences: (data) => api.put('/users/preferences', data),
  getFavorites: () => api.get('/users/favorites'),
  addFavorite: (data) => api.post('/users/favorites', data),
  deleteFavorite: (id) => api.delete(`/users/favorites/${id}`)
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getFeeds: () => api.get('/admin/feeds'),
  activateFeed: (id) => api.post(`/admin/feeds/${id}/activate`),
  rollbackFeed: (id) => api.post(`/admin/feeds/${id}/rollback`),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getHealth: () => api.get('/admin/health'),
  
  // User Management
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, isVerified) => api.put(`/admin/users/${id}/status`, { isVerified }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Bookings & Revenue
  getBookings: (params) => api.get('/admin/bookings', { params }),
  forceRefundBooking: (id, data) => api.post(`/admin/bookings/${id}/force-refund`, data),
  getRevenueAnalytics: () => api.get('/admin/analytics/revenue'),

  // Fleet & Telemetry
  getFleet: () => api.get('/admin/fleet'),
  simulateFleetDelay: (data) => api.post('/admin/fleet/simulate-delay', data),
  broadcastAlert: (data) => api.post('/admin/broadcast-alert', data),

  // Autonomous MAPE-K Self-Evolving Engine
  getMapekStatus: () => api.get('/admin/mapek/status'),
  runMapek: () => api.post('/admin/mapek/run'),
  toggleMapekAutopilot: (enabled) => api.post('/admin/mapek/toggle-autopilot', { enabled }),
  injectMapekChaos: (data) => api.post('/admin/mapek/chaos', data),
  getMapekHistory: (params) => api.get('/admin/mapek/history', { params }),
  tuneMapekParameters: (data) => api.put('/admin/mapek/tune-weights', data),

  // System Diagnostics
  clearSystemCache: () => api.post('/admin/system/clear-cache'),
  getSystemMetrics: () => api.get('/admin/system/metrics'),

  // Overseas & International Transportation Gateway
  getOverseasGateways: () => api.get('/admin/overseas/gateways'),
  getOverseasProviders: () => api.get('/admin/overseas/providers'),
  testOverseasApiPing: (data) => api.post('/admin/overseas/test-ping', data || {}),
  syncOverseasSchedules: () => api.post('/admin/overseas/sync-schedules'),
  getOverseasFxRates: () => api.get('/admin/overseas/fx-rates'),

  getProviders: () => api.get('/providers'),
  getStops: (params) => api.get('/stops', { params }),
  getRoutes: () => api.get('/routes'),
  getTrips: () => api.get('/trips')
};

export default api;
