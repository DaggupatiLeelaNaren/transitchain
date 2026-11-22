
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['', 'male', 'female', 'other', 'prefer_not_to_say'],
    default: ''
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 300,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    maxlength: 250,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  state: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  country: {
    type: String,
    trim: true,
    maxlength: 100,
    default: 'India'
  },
  postalCode: {
    type: String,
    trim: true,
    maxlength: 15,
    default: ''
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['passenger', 'user', 'admin'],
    default: 'passenger',
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otpHash: {
    type: String,
    default: null
  },
  otpExpiresAt: {
    type: Date,
    default: null
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  otpLastSentAt: {
    type: Date,
    default: null
  },
  resetTokenHash: {
    type: String,
    default: null
  },
  resetTokenExpiresAt: {
    type: Date,
    default: null
  },
  refreshToken: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const UserPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  preferredModes: {
    type: [String],
    default: ['bus', 'metro', 'walk']
  },
  maxWalkingDistanceMeters: {
    type: Number,
    default: 2000
  },
  maxTransfers: {
    type: Number,
    default: 3
  },
  optimizationPreference: {
    type: String,
    enum: ['fastest', 'lowest_fare', 'fewest_transfers', 'least_walking', 'balanced'],
    default: 'balanced'
  },
  accessibleOnly: {
    type: Boolean,
    default: false
  },
  notificationEmail: {
    type: Boolean,
    default: true
  },
  notificationSms: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const User = mongoose.model('User', UserSchema);
export const UserPreference = mongoose.model('UserPreference', UserPreferenceSchema);
