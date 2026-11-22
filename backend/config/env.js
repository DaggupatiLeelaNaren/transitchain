
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  mongoUri:
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/transitchain',

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',

  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtRefreshExpiresIn:
    process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  otpSecret: process.env.OTP_SECRET,

  optimizationServiceUrl:
    process.env.OPTIMIZATION_SERVICE_URL ||
    'http://127.0.0.1:8000',

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_APP_PASSWORD || '',
    from: process.env.EMAIL_USER || ''
  },

  corsOrigin: process.env.CORS_ORIGIN || '*'
};
