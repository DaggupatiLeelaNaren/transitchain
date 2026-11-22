import express from 'express';
import * as bc from '../controllers/bookingController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', bc.createBooking);
router.get('/', bc.getBookings);
router.get('/:id', bc.getBookingById);
router.post('/:id/cancel', bc.cancelBooking);
router.get('/:id/status', bc.getBookingStatus);

export default router;
