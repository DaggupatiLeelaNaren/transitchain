import mongoose from 'mongoose';

const GtfsFeedSchema = new mongoose.Schema({
  feedKey: { type: String, required: true, index: true }, // e.g. 'tgsrtc', 'hmrl'
  providerName: { type: String, required: true },
  feedVersion: { type: String, required: true },
  feedStartDate: { type: String },
  feedEndDate: { type: String },
  feedPublisherName: { type: String },
  feedLang: { type: String, default: 'en' },
  status: { type: String, enum: ['pending', 'validated', 'active', 'archived', 'rolled_back', 'failed'], default: 'pending', index: true },
  isActive: { type: Boolean, default: false, index: true },
  fileSize: { type: Number },
  recordCounts: {
    stops: { type: Number, default: 0 },
    routes: { type: Number, default: 0 },
    trips: { type: Number, default: 0 },
    stopTimes: { type: Number, default: 0 },
    shapes: { type: Number, default: 0 },
    transfers: { type: Number, default: 0 }
  },
  importedAt: { type: Date, default: Date.now },
  activatedAt: { type: Date }
}, { timestamps: true });

GtfsFeedSchema.index({ feedKey: 1, feedVersion: 1 }, { unique: true });

const GtfsAgencySchema = new mongoose.Schema({
  feedKey: { type: String, required: true, index: true },
  feedVersion: { type: String, required: true },
  agencyId: { type: String, required: true },
  agencyName: { type: String, required: true },
  agencyUrl: { type: String },
  agencyTimezone: { type: String, default: 'Asia/Kolkata' },
  agencyLang: { type: String },
  agencyPhone: { type: String }
}, { timestamps: true });

const GtfsStopSchema = new mongoose.Schema({
  feedKey: { type: String, required: true, index: true },
  feedVersion: { type: String, required: true, index: true },
  stopId: { type: String, required: true, index: true },
  stopCode: { type: String },
  stopName: { type: String, required: true, index: true },
  stopDesc: { type: String },
  stopLat: { type: Number, required: true },
  stopLon: { type: Number, required: true },
  zoneId: { type: String },
  locationType: { type: Number, default: 0 },
  parentStation: { type: String },
  wheelchairBoarding: { type: Number, default: 0 }
}, { timestamps: true });

GtfsStopSchema.index({ feedKey: 1, feedVersion: 1, stopId: 1 }, { unique: true });
GtfsStopSchema.index({ stopLat: 1, stopLon: 1 });

const GtfsRouteSchema = new mongoose.Schema({
  feedKey: { type: String, required: true, index: true },
  feedVersion: { type: String, required: true, index: true },
  routeId: { type: String, required: true, index: true },
  agencyId: { type: String },
  routeShortName: { type: String, required: true, index: true },
  routeLongName: { type: String, required: true },
  routeType: { type: Number, required: true },
  routeColor: { type: String },
  routeTextColor: { type: String }
}, { timestamps: true });

GtfsRouteSchema.index({ feedKey: 1, feedVersion: 1, routeId: 1 }, { unique: true });

const GtfsTripSchema = new mongoose.Schema({
  feedKey: { type: String, required: true, index: true },
  feedVersion: { type: String, required: true, index: true },
  routeId: { type: String, required: true, index: true },
  serviceId: { type: String, required: true, index: true },
  tripId: { type: String, required: true, index: true },
  tripHeadsign: { type: String },
  directionId: { type: Number, default: 0 },
  blockId: { type: String },
  shapeId: { type: String }
}, { timestamps: true });

GtfsTripSchema.index({ feedKey: 1, feedVersion: 1, tripId: 1 }, { unique: true });

const GtfsStopTimeSchema = new mongoose.Schema({
  feedKey: { type: String, required: true, index: true },
  feedVersion: { type: String, required: true, index: true },
  tripId: { type: String, required: true, index: true },
  arrivalTime: { type: String, required: true, index: true }, // e.g. "08:30:00"
  departureTime: { type: String, required: true, index: true },
  stopId: { type: String, required: true, index: true },
  stopSequence: { type: Number, required: true, index: true },
  pickupType: { type: Number, default: 0 },
  dropOffType: { type: Number, default: 0 }
}, { timestamps: true });

GtfsStopTimeSchema.index({ feedKey: 1, feedVersion: 1, tripId: 1, stopSequence: 1 });
GtfsStopTimeSchema.index({ feedKey: 1, feedVersion: 1, stopId: 1, departureTime: 1 });

const GtfsCalendarSchema = new mongoose.Schema({
  feedKey: { type: String, required: true, index: true },
  feedVersion: { type: String, required: true, index: true },
  serviceId: { type: String, required: true, index: true },
  monday: { type: Number, default: 1 },
  tuesday: { type: Number, default: 1 },
  wednesday: { type: Number, default: 1 },
  thursday: { type: Number, default: 1 },
  friday: { type: Number, default: 1 },
  saturday: { type: Number, default: 1 },
  sunday: { type: Number, default: 1 },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true }
}, { timestamps: true });

const GtfsCalendarDateSchema = new mongoose.Schema({
  feedKey: { type: String, required: true, index: true },
  feedVersion: { type: String, required: true, index: true },
  serviceId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true }, // YYYYMMDD
  exceptionType: { type: Number, required: true } // 1: added, 2: removed
}, { timestamps: true });

const GtfsShapePointSchema = new mongoose.Schema({
  feedKey: { type: String, required: true, index: true },
  feedVersion: { type: String, required: true, index: true },
  shapeId: { type: String, required: true, index: true },
  shapePtLat: { type: Number, required: true },
  shapePtLon: { type: Number, required: true },
  shapePtSequence: { type: Number, required: true, index: true },
  shapeDistTraveled: { type: Number }
}, { timestamps: true });

const GtfsTransferSchema = new mongoose.Schema({
  feedKey: { type: String, required: true, index: true },
  feedVersion: { type: String, required: true, index: true },
  fromStopId: { type: String, required: true, index: true },
  toStopId: { type: String, required: true, index: true },
  transferType: { type: Number, default: 0 },
  minTransferTime: { type: Number, default: 180 }, // in seconds
  isCrossFeed: { type: Boolean, default: false }
}, { timestamps: true });

const GtfsDomainMappingSchema = new mongoose.Schema({
  domainStopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true },
  feedKey: { type: String, required: true, index: true },
  feedStopId: { type: String, required: true, index: true },
  verified: { type: Boolean, default: true }
}, { timestamps: true });

const FeedImportLogSchema = new mongoose.Schema({
  feedKey: { type: String, required: true },
  feedVersion: { type: String, required: true },
  action: { type: String, enum: ['upload', 'validate', 'import', 'activate', 'rollback'], required: true },
  status: { type: String, enum: ['in_progress', 'completed', 'failed'], default: 'in_progress' },
  details: { type: mongoose.Schema.Types.Mixed },
  errorMessages: { type: [String], default: [] },
  importedBy: { type: String, default: 'admin' },
  durationMs: { type: Number }
}, { timestamps: true });

export const GtfsFeed = mongoose.model('GtfsFeed', GtfsFeedSchema);
export const GtfsAgency = mongoose.model('GtfsAgency', GtfsAgencySchema);
export const GtfsStop = mongoose.model('GtfsStop', GtfsStopSchema);
export const GtfsRoute = mongoose.model('GtfsRoute', GtfsRouteSchema);
export const GtfsTrip = mongoose.model('GtfsTrip', GtfsTripSchema);
export const GtfsStopTime = mongoose.model('GtfsStopTime', GtfsStopTimeSchema);
export const GtfsCalendar = mongoose.model('GtfsCalendar', GtfsCalendarSchema);
export const GtfsCalendarDate = mongoose.model('GtfsCalendarDate', GtfsCalendarDateSchema);
export const GtfsShapePoint = mongoose.model('GtfsShapePoint', GtfsShapePointSchema);
export const GtfsTransfer = mongoose.model('GtfsTransfer', GtfsTransferSchema);
export const GtfsDomainMapping = mongoose.model('GtfsDomainMapping', GtfsDomainMappingSchema);
export const FeedImportLog = mongoose.model('FeedImportLog', FeedImportLogSchema);
