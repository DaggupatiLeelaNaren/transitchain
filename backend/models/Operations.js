import mongoose from 'mongoose';

const JourneySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestId: { type: String, required: true, index: true },
  origin: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    name: { type: String }
  },
  destination: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    name: { type: String }
  },
  travelDate: { type: String, required: true },
  departureTime: { type: String, required: true },
  modes: { type: [String], default: ['bus', 'metro', 'walk'] },
  optimizationPreference: { type: String, default: 'balanced' },
  status: { type: String, enum: ['planned', 'in_progress', 'completed', 'cancelled'], default: 'planned' },
  selectedAlternative: { type: mongoose.Schema.Types.Mixed },
  alternatives: { type: [mongoose.Schema.Types.Mixed], default: [] },
  diagnostics: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

const JourneyHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  journeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Journey' },
  originName: { type: String, required: true },
  destinationName: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  durationSeconds: { type: Number, required: true },
  modesUsed: { type: [String], default: [] },
  fare: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const BookingSchema = new mongoose.Schema({
  bookingReference: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  journeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Journey' },
  providerCode: { type: String, required: true }, // e.g. 'TGSRTC', 'HMRL'
  routeShortName: { type: String, required: true },
  fromStopName: { type: String, required: true },
  toStopName: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  passengerCount: { type: Number, default: 1 },
  totalFare: { type: Number, required: true },
  fareCurrency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['initiated', 'confirmed', 'ticket_issued', 'cancelled', 'refund_processed', 'failed'],
    default: 'initiated',
    index: true
  },
  ticketNumber: { type: String },
  qrPayload: { type: String },
  externalTransactionId: { type: String },
  cancellationReason: { type: String },
  refundAmount: { type: Number, default: 0 },
  refundStatus: { type: String, enum: ['none', 'pending', 'processed', 'failed'], default: 'none' }
}, { timestamps: true });

const TrackingEventSchema = new mongoose.Schema({
  journeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Journey', index: true },
  vehicleId: { type: String, index: true },
  feedKey: { type: String },
  coordinates: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  },
  currentLegIndex: { type: Number, default: 0 },
  nextStopName: { type: String },
  estimatedArrivalSec: { type: Number },
  delaySeconds: { type: Number, default: 0 },
  statusMessage: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['journey', 'booking', 'tracking', 'alert', 'system'], default: 'system' },
  read: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

const FeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  journeyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Journey' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, trim: true },
  category: { type: String, enum: ['accuracy', 'comfort', 'timing', 'pricing', 'general'], default: 'general' }
}, { timestamps: true });

const FavoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  origin: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    name: { type: String, required: true }
  },
  destination: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    name: { type: String, required: true }
  },
  modes: { type: [String], default: ['bus', 'metro'] }
}, { timestamps: true });

const ChatConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  sessionId: { type: String, required: true, unique: true, index: true },
  topic: { type: String, default: 'General Support' }
}, { timestamps: true });

const ChatMessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatConversation', required: true, index: true },
  sender: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  text: { type: String, required: true },
  intent: { type: String },
  actionPayload: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

const SystemHealthSchema = new mongoose.Schema({
  component: { type: String, required: true, index: true }, // 'mongodb', 'optimization_service', 'gtfs_engine', 'socket_io'
  status: { type: String, enum: ['healthy', 'degraded', 'down'], required: true },
  latencyMs: { type: Number },
  details: { type: mongoose.Schema.Types.Mixed },
  recordedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  action: { type: String, required: true, index: true },
  resourceType: { type: String, required: true },
  resourceId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

const MapekKnowledgeSchema = new mongoose.Schema({
  cycleId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  status: { type: String, enum: ['healthy', 'degraded', 'adapting', 'healed'], default: 'healthy' },
  fitnessScore: { type: Number, default: 98 },
  monitor: {
    latencies: { type: mongoose.Schema.Types.Mixed },
    errorJourneys: { type: Number, default: 0 },
    activeFeeds: { type: Number, default: 2 },
    totalStops: { type: Number, default: 0 },
    totalVehicles: { type: Number, default: 0 },
    avgDelaySec: { type: Number, default: 0 },
    memoryMb: { type: Number, default: 0 }
  },
  analyze: {
    anomalies: [{ type: mongoose.Schema.Types.Mixed }],
    riskLevel: { type: String, enum: ['low', 'moderate', 'high', 'critical'], default: 'low' },
    symptomsDetected: { type: Number, default: 0 }
  },
  plan: {
    strategies: [{ type: mongoose.Schema.Types.Mixed }],
    recommendedActions: [String]
  },
  execute: {
    executedActions: [String],
    executionTimeMs: { type: Number, default: 0 },
    success: { type: Boolean, default: true }
  },
  learnedWeights: {
    walkPenaltyWeight: { type: Number, default: 1.2 },
    transferBufferSec: { type: Number, default: 120 },
    congestionFactor: { type: Number, default: 1.0 },
    fareSensitivity: { type: Number, default: 1.0 }
  },
  triggerType: { type: String, enum: ['manual', 'autonomous_loop', 'chaos_simulation'], default: 'manual' }
}, { timestamps: true });

export const Journey = mongoose.model('Journey', JourneySchema);
export const JourneyHistory = mongoose.model('JourneyHistory', JourneyHistorySchema);
export const Booking = mongoose.model('Booking', BookingSchema);
export const TrackingEvent = mongoose.model('TrackingEvent', TrackingEventSchema);
export const Notification = mongoose.model('Notification', NotificationSchema);
export const Feedback = mongoose.model('Feedback', FeedbackSchema);
export const Favorite = mongoose.model('Favorite', FavoriteSchema);
export const ChatConversation = mongoose.model('ChatConversation', ChatConversationSchema);
export const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);
export const SystemHealth = mongoose.model('SystemHealth', SystemHealthSchema);
export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export const MapekKnowledge = mongoose.model('MapekKnowledge', MapekKnowledgeSchema);
