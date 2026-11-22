
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserPreference } from '../models/User.js';
import { config } from '../config/env.js';
import { sendOtpEmail } from '../utils/mailer.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

import {
  generateOTP,
  hashOTP,
  verifyOTP
} from '../utils/otp.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, termsAccepted } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    if (confirmPassword && password !== confirmPassword) {
      return sendError(res, 'Passwords do not match', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    if (termsAccepted !== undefined && !termsAccepted) {
      return sendError(res, 'You must accept the terms of service', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      return sendError(res, 'An account with this email already exists', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const otp = generateOTP();
    const otpHash = hashOTP(otp);

    const otpExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'passenger',
      isVerified: false,
      otpHash,
      otpExpiresAt,
      otpAttempts: 0,
      otpLastSentAt: new Date()
    });

    await UserPreference.create({ userId: user._id });

    await sendOtpEmail(normalizedEmail, otp);

    logger.info(`[Auth] User registered: ${normalizedEmail}`);

    return sendSuccess(
      res,
      {
        userId: user._id,
        email: user.email,
        name: user.name
      },
      'Registration successful. Please verify the OTP sent to your email.',
      201
    );

  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendError(res, 'Email and OTP are required', 400);
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user.isVerified) {
      return sendSuccess(res, {}, 'Account is already verified. You can log in.');
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return sendError(res, 'No OTP request found. Please request a new code.', 400);
    }

    if (new Date() > user.otpExpiresAt) {
      return sendError(res, 'OTP has expired. Please request a new one.', 400);
    }

    if (user.otpAttempts >= 5) {
      return sendError(res, 'Too many failed attempts. Please request a new OTP.', 429);
    }

    const isMatch = verifyOTP(
      otp.trim(),
      user.otpHash
    );

    if (!isMatch) {
      user.otpAttempts += 1;
      await user.save();

      return sendError(
        res,
        `Invalid OTP. ${5 - user.otpAttempts} attempts remaining.`,
        400
      );
    }

    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;

    await user.save();

    logger.info(`[Auth] Email verified: ${user.email}`);

    return sendSuccess(
      res,
      {
        userId: user._id,
        email: user.email,
        isVerified: true
      },
      'Email verified successfully! You may now log in.'
    );

  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 'Email is required', 400);
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user.isVerified) {
      return sendError(res, 'Account is already verified. Please log in.', 400);
    }

    // Rate limit resend to 45 seconds
    if (
      user.otpLastSentAt &&
      (Date.now() - new Date(user.otpLastSentAt).getTime()) < 45000
    ) {
      return sendError(
        res,
        'Please wait 45 seconds before requesting another code',
        429
      );
    }

    const otp = generateOTP();

    user.otpHash = hashOTP(otp);

    user.otpExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    user.otpAttempts = 0;
    user.otpLastSentAt = new Date();

    await user.save();

    await sendOtpEmail(user.email, otp);

    return sendSuccess(
      res,
      { email: user.email },
      'A fresh verification OTP has been sent.'
    );

  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (!user.isVerified) {
      return sendError(
        res,
        'Account not verified. Please verify your email first.',
        403,
        {
          needsVerification: true,
          email: user.email
        }
      );
    }

    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(
      tokenPayload,
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const refreshToken = jwt.sign(
      tokenPayload,
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn }
    );

    user.refreshToken = refreshToken;

    await user.save();

    return sendSuccess(
      res,
      {
        token,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      },
      'Login successful'
    );

  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 'Email is required', 400);
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      // Don't leak user existence
      return sendSuccess(
        res,
        {},
        'If an account exists, a reset code was sent.'
      );
    }

    const otp = generateOTP();

    user.resetTokenHash = await bcrypt.hash(otp, 10);

    user.resetTokenExpiresAt = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    const mailResult = await sendOtpEmail(user.email, otp);

    return sendSuccess(
      res,
      {
        email: user.email,
        debugOtp: mailResult.debugOtp
      },
      'Password reset code has been sent.'
    );

  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return sendError(
        res,
        'Email, OTP code, and new password are required',
        400
      );
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (
      !user ||
      !user.resetTokenHash ||
      !user.resetTokenExpiresAt
    ) {
      return sendError(
        res,
        'Invalid or expired password reset request',
        400
      );
    }

    if (new Date() > user.resetTokenExpiresAt) {
      return sendError(res, 'Reset code has expired', 400);
    }

    // Keep bcrypt comparison for password-reset OTP
    const isMatch = await bcrypt.compare(
      otp.trim(),
      user.resetTokenHash
    );

    if (!isMatch) {
      return sendError(res, 'Invalid reset code', 400);
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);

    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;

    await user.save();

    return sendSuccess(
      res,
      {},
      'Password reset successfully. Please log in with your new password.'
    );

  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(
        req.user._id,
        { refreshToken: null }
      );
    }

    return sendSuccess(res, {}, 'Logged out successfully');

  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const pref = await UserPreference.findOne({
      userId: req.user._id
    });

    return sendSuccess(res, {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified,
        createdAt: req.user.createdAt
      },
      preferences: pref || {}
    });

  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: incomingToken } = req.body;

    if (!incomingToken) {
      return sendError(res, 'Refresh token required', 400);
    }

    const decoded = jwt.verify(
      incomingToken,
      config.jwtRefreshSecret
    );

    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== incomingToken) {
      return sendError(
        res,
        'Invalid or expired refresh token',
        403
      );
    }

    const newToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return sendSuccess(res, { token: newToken });

  } catch (error) {
    return sendError(res, 'Invalid refresh token', 403);
  }
};
