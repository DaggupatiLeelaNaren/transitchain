
import crypto from 'crypto';
import { config } from '../config/env.js';

export const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const hashOTP = (otp) => {
  if (!config.otpSecret) {
    throw new Error('OTP_SECRET is not configured');
  }

  return crypto
    .createHmac('sha256', config.otpSecret)
    .update(String(otp))
    .digest('hex');
};

export const verifyOTP = (otp, storedHash) => {
  if (!otp || !storedHash) return false;

  const inputHash = Buffer.from(hashOTP(otp), 'hex');
  const savedHash = Buffer.from(storedHash, 'hex');

  if (inputHash.length !== savedHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(inputHash, savedHash);
};
