import express from 'express';
import * as tc from '../controllers/trackingController.js';

const router = express.Router();

router.get('/:journeyId', tc.getJourneyTracking);
router.get('/vehicle/:vehicleId', tc.getVehicleTracking);
router.post('/vehicle-position', tc.ingestVehiclePosition);

export default router;
