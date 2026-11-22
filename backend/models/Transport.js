import mongoose from 'mongoose';

const ProviderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true }, // e.g. TGSRTC, HMRL
  transportModes: { type: [String], required: true }, // ['bus'], ['metro']
  contactEmail: { type: String, required: true },
  contactPhone: { type: String },
  coverageArea: { type: String, default: 'Hyderabad Metropolitan Region' },
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  bookingSupported: { type: Boolean, default: false },
  trackingSupported: { type: Boolean, default: false },
  apiKeyMasked: { type: String, default: '••••••••••••' },
  feedKey: { type: String, required: true, unique: true } // e.g. tgsrtc, hmrl
}, { timestamps: true });

const CitySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  state: { type: String, required: true },
  country: { type: String, default: 'India' },
  centerCoordinates: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  address: { type: String },
  category: { type: String, enum: ['transit_hub', 'commercial', 'residential', 'poi', 'station'], default: 'poi' },
  coordinates: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  }
}, { timestamps: true });

const StopSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
  feedKey: { type: String, required: true, index: true },
  externalStopId: { type: String, required: true, index: true },
  name: { type: String, required: true, index: true },
  code: { type: String },
  mode: { type: String, enum: ['bus', 'metro', 'train', 'tram'], required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  },
  zoneId: { type: String },
  wheelchairBoarding: { type: Number, default: 0 },
  platformCode: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

StopSchema.index({ 'coordinates.lat': 1, 'coordinates.lon': 1 });
StopSchema.index({ feedKey: 1, externalStopId: 1 }, { unique: true });

const RouteSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
  feedKey: { type: String, required: true, index: true },
  externalRouteId: { type: String, required: true, index: true },
  routeShortName: { type: String, required: true, index: true },
  routeLongName: { type: String, required: true },
  routeType: { type: Number, required: true }, // GTFS route_type (3: bus, 1: subway/metro)
  mode: { type: String, enum: ['bus', 'metro', 'train'], required: true },
  routeColor: { type: String, default: '#0284c7' },
  routeTextColor: { type: String, default: '#ffffff' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

RouteSchema.index({ feedKey: 1, externalRouteId: 1 }, { unique: true });

const TripSchema = new mongoose.Schema({
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  feedKey: { type: String, required: true, index: true },
  externalTripId: { type: String, required: true, index: true },
  serviceId: { type: String, required: true, index: true },
  tripHeadsign: { type: String },
  directionId: { type: Number, default: 0 },
  blockId: { type: String },
  shapeId: { type: String },
  mode: { type: String, default: 'bus' }
}, { timestamps: true });

TripSchema.index({ feedKey: 1, externalTripId: 1 }, { unique: true });

const VehicleSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
  feedKey: { type: String, required: true },
  vehicleNumber: { type: String, required: true, unique: true },
  currentTripId: { type: String },
  currentRouteId: { type: String },
  mode: { type: String, enum: ['bus', 'metro'], default: 'bus' },
  status: { type: String, enum: ['in_service', 'out_of_service', 'maintenance'], default: 'in_service' },
  lastCoordinates: {
    lat: { type: Number },
    lon: { type: Number }
  },
  lastSpeedKmph: { type: Number, default: 0 },
  lastBearing: { type: Number, default: 0 },
  lastUpdatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Provider = mongoose.model('Provider', ProviderSchema);
export const City = mongoose.model('City', CitySchema);
export const Location = mongoose.model('Location', LocationSchema);
export const Stop = mongoose.model('Stop', StopSchema);
export const Route = mongoose.model('Route', RouteSchema);
export const Trip = mongoose.model('Trip', TripSchema);
export const Vehicle = mongoose.model('Vehicle', VehicleSchema);
