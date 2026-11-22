import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { mapekEngine } from './services/mapekEngine.js';

const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Attach io to Express app instance so controllers can emit real-time events
app.set('io', io);

io.on('connection', (socket) => {
  logger.info(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('subscribe:journey', (journeyId) => {
    socket.join(`journey:${journeyId}`);
    logger.info(`[Socket.IO] Client ${socket.id} subscribed to journey ${journeyId}`);
  });

  socket.on('subscribe:vehicle', (vehicleId) => {
    socket.join(`vehicle:${vehicleId}`);
    logger.info(`[Socket.IO] Client ${socket.id} subscribed to vehicle ${vehicleId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  try {
    await connectDB();
    mapekEngine.init(app);
    server.listen(config.port, () => {
      logger.info(`=======================================================`);
      logger.info(`TransitChain Backend Server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Optimization Service Target: ${config.optimizationServiceUrl}`);
      logger.info(`WebSocket (Socket.IO): Ready`);
      logger.info(`=======================================================`);
    });
  } catch (error) {
    logger.error(`[Server Start Error] ${error.message}`);
    process.exit(1);
  }
};

startServer();
