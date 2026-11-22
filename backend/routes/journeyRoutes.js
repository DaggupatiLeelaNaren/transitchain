import express from 'express';
import * as jc from '../controllers/journeyController.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/search', optionalAuth, jc.searchJourneys);
router.get('/history', authenticateToken, jc.getJourneyHistory);
router.get('/:id', optionalAuth, jc.getJourneyById);
router.get('/:id/status', optionalAuth, jc.getJourneyStatus);
router.post('/:id/favorite', authenticateToken, jc.favoriteJourney);

export default router;
