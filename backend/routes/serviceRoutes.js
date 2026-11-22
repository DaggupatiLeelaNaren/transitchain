import express from 'express';
import * as sc from '../controllers/serviceController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Notifications
router.get('/notifications', authenticateToken, sc.getNotifications);
router.put('/notifications/:id/read', authenticateToken, sc.markNotificationRead);
router.post('/notifications', authenticateToken, sc.createNotification);

// Chatbot
router.post('/chat/message', optionalAuth, sc.handleChatMessage);
router.get('/chat/history/:sessionId', sc.getChatHistory);

// Nearby Places
router.get('/places/nearby', sc.getNearbyPlaces);

export default router;
