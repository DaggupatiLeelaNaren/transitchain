import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`[Unhandled Error] ${err.name}: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map(e => e.message);
    return sendError(res, 'Validation error', 400, details);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return sendError(res, `Duplicate field value: ${field}`, 409);
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token signature', 401);
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';

  return sendError(res, message, statusCode);
};
