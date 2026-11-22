import express from 'express';
import * as ac from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken, requireAdmin);

// Dashboard Overview
router.get('/dashboard', ac.getDashboardStats);

// User Management & RBAC
router.get('/users', ac.getUsers);
router.put('/users/:id/role', ac.updateUserRole);
router.put('/users/:id/status', ac.updateUserStatus);
router.delete('/users/:id', ac.deleteUser);

// Bookings & Revenue Management
router.get('/bookings', ac.getBookings);
router.post('/bookings/:id/force-refund', ac.forceRefundBooking);
router.get('/analytics/revenue', ac.getRevenueAnalytics);

// Fleet & Transit Control
router.get('/fleet', ac.getFleetTelemetry);
router.post('/fleet/simulate-delay', ac.simulateFleetDelay);
router.post('/broadcast-alert', ac.broadcastAlert);

// Autonomous MAPE-K Self-Evolving Engine
router.get('/mapek/status', ac.getMapekStatus);
router.post('/mapek/run', ac.runMapekAnalysis);
router.post('/mapek/toggle-autopilot', ac.toggleMapekAutopilot);
router.post('/mapek/chaos', ac.injectMapekChaos);
router.get('/mapek/history', ac.getMapekHistory);
router.put('/mapek/tune-weights', ac.tuneMapekParameters);

// GTFS Feeds
router.get('/feeds', ac.getGtfsFeeds);
router.post('/feeds/:id/activate', ac.activateGtfsFeed);
router.post('/feeds/:id/rollback', ac.rollbackGtfsFeed);

// Audit & Telemetry
router.get('/audit-logs', ac.getAuditLogs);
router.get('/health', ac.getSystemHealth);
router.post('/system/clear-cache', ac.clearSystemCache);
router.get('/system/metrics', ac.getSystemMetrics);

// Overseas & International Transportation Gateway
router.get('/overseas/gateways', ac.getOverseasGateways);
router.get('/overseas/providers', ac.getOverseasProviders);
router.post('/overseas/test-ping', ac.testOverseasApiPing);
router.post('/overseas/sync-schedules', ac.syncOverseasSchedules);
router.get('/overseas/fx-rates', ac.getOverseasFxRates);

export default router;
