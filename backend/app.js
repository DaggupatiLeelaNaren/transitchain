import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import transportRoutes from './routes/transportRoutes.js';
import journeyRoutes from './routes/journeyRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';
import { sendSuccess } from './utils/response.js';

const app = express();

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// General rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Health check
app.get('/api/health', (req, res) => {
  return sendSuccess(res, {
    status: 'healthy',
    service: 'TransitChain Node.js Primary Backend',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', transportRoutes);
app.use('/api/journeys', journeyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api', serviceRoutes);
app.use('/api/admin', adminRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
