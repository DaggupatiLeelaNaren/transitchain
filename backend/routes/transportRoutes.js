import express from 'express';
import * as tc from '../controllers/transportController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Providers
router.get('/providers', tc.getProviders);
router.get('/providers/:id', tc.getProviderById);
router.post('/providers', authenticateToken, requireAdmin, tc.createProvider);
router.put('/providers/:id', authenticateToken, requireAdmin, tc.updateProvider);
router.delete('/providers/:id', authenticateToken, requireAdmin, tc.deleteProvider);

// Locations
router.get('/locations', tc.getLocations);
router.get('/locations/search', tc.searchLocations);
router.post('/locations', authenticateToken, requireAdmin, tc.createLocation);

// Stops
router.get('/stops', tc.getStops);
router.get('/stops/nearby', tc.getNearbyStops);
router.post('/stops', authenticateToken, requireAdmin, tc.createStop);
router.put('/stops/:id', authenticateToken, requireAdmin, tc.updateStop);
router.delete('/stops/:id', authenticateToken, requireAdmin, tc.deleteStop);

// Routes
router.get('/routes', tc.getRoutes);
router.post('/routes', authenticateToken, requireAdmin, tc.createRoute);
router.put('/routes/:id', authenticateToken, requireAdmin, tc.updateRoute);
router.delete('/routes/:id', authenticateToken, requireAdmin, tc.deleteRoute);

// Trips
router.get('/trips', tc.getTrips);
router.post('/trips', authenticateToken, requireAdmin, tc.createTrip);
router.put('/trips/:id', authenticateToken, requireAdmin, tc.updateTrip);
router.delete('/trips/:id', authenticateToken, requireAdmin, tc.deleteTrip);

export default router;
