import { Provider, City, Location, Stop, Route, Trip } from '../models/Transport.js';
import { sendSuccess, sendError } from '../utils/response.js';

// --- PROVIDERS ---
export const getProviders = async (req, res, next) => {
  try {
    const providers = await Provider.find().sort({ name: 1 });
    return sendSuccess(res, providers);
  } catch (err) {
    next(err);
  }
};

export const getProviderById = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) return sendError(res, 'Provider not found', 404);
    return sendSuccess(res, provider);
  } catch (err) {
    next(err);
  }
};

export const createProvider = async (req, res, next) => {
  try {
    const provider = await Provider.create(req.body);
    return sendSuccess(res, provider, 'Provider registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!provider) return sendError(res, 'Provider not found', 404);
    return sendSuccess(res, provider, 'Provider updated');
  } catch (err) {
    next(err);
  }
};

export const deleteProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findByIdAndDelete(req.params.id);
    if (!provider) return sendError(res, 'Provider not found', 404);
    return sendSuccess(res, {}, 'Provider deactivated');
  } catch (err) {
    next(err);
  }
};

// --- LOCATIONS ---
export const getLocations = async (req, res, next) => {
  try {
    const locations = await Location.find().limit(50);
    return sendSuccess(res, locations);
  } catch (err) {
    next(err);
  }
};

export const searchLocations = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      const all = await Location.find().limit(10);
      return sendSuccess(res, all);
    }
    const regex = new RegExp(q.trim(), 'i');
    const locations = await Location.find({
      $or: [{ name: regex }, { address: regex }]
    }).limit(15);
    return sendSuccess(res, locations);
  } catch (err) {
    next(err);
  }
};

export const createLocation = async (req, res, next) => {
  try {
    const loc = await Location.create(req.body);
    return sendSuccess(res, loc, 'Location created', 201);
  } catch (err) {
    next(err);
  }
};

// --- STOPS ---
export const getStops = async (req, res, next) => {
  try {
    const { feedKey, mode, q } = req.query;
    const filter = {};
    if (feedKey) filter.feedKey = feedKey;
    if (mode) filter.mode = mode;
    if (q) filter.name = new RegExp(q, 'i');

    const stops = await Stop.find(filter).limit(100);
    return sendSuccess(res, stops);
  } catch (err) {
    next(err);
  }
};

export const getNearbyStops = async (req, res, next) => {
  try {
    const { lat, lon, radius = 2500 } = req.query;
    if (!lat || !lon) {
      return sendError(res, 'lat and lon are required', 400);
    }

    const cLat = parseFloat(lat);
    const cLon = parseFloat(lon);
    const maxDist = parseFloat(radius);

    // Simple haversine lookup in Mongo
    const stops = await Stop.find();
    const results = [];

    for (const s of stops) {
      const dLat = (s.coordinates.lat - cLat) * Math.PI / 180;
      const dLon = (s.coordinates.lon - cLon) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(cLat * Math.PI / 180) * Math.cos(s.coordinates.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const dist = 6371000 * c;

      if (dist <= maxDist) {
        results.push({
          ...s.toObject(),
          distanceMeters: Math.round(dist)
        });
      }
    }

    results.sort((a, b) => a.distanceMeters - b.distanceMeters);
    return sendSuccess(res, results.slice(0, 20));
  } catch (err) {
    next(err);
  }
};

export const createStop = async (req, res, next) => {
  try {
    const stop = await Stop.create(req.body);
    return sendSuccess(res, stop, 'Stop created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateStop = async (req, res, next) => {
  try {
    const stop = await Stop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!stop) return sendError(res, 'Stop not found', 404);
    return sendSuccess(res, stop, 'Stop updated');
  } catch (err) {
    next(err);
  }
};

export const deleteStop = async (req, res, next) => {
  try {
    const stop = await Stop.findByIdAndDelete(req.params.id);
    if (!stop) return sendError(res, 'Stop not found', 404);
    return sendSuccess(res, {}, 'Stop removed');
  } catch (err) {
    next(err);
  }
};

// --- ROUTES ---
export const getRoutes = async (req, res, next) => {
  try {
    const { feedKey, mode } = req.query;
    const filter = {};
    if (feedKey) filter.feedKey = feedKey;
    if (mode) filter.mode = mode;

    const routes = await Route.find(filter).sort({ routeShortName: 1 });
    return sendSuccess(res, routes);
  } catch (err) {
    next(err);
  }
};

export const createRoute = async (req, res, next) => {
  try {
    const route = await Route.create(req.body);
    return sendSuccess(res, route, 'Route created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!route) return sendError(res, 'Route not found', 404);
    return sendSuccess(res, route, 'Route updated');
  } catch (err) {
    next(err);
  }
};

export const deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return sendError(res, 'Route not found', 404);
    return sendSuccess(res, {}, 'Route removed');
  } catch (err) {
    next(err);
  }
};

// --- TRIPS ---
export const getTrips = async (req, res, next) => {
  try {
    const { routeId, feedKey } = req.query;
    const filter = {};
    if (routeId) filter.routeId = routeId;
    if (feedKey) filter.feedKey = feedKey;

    const trips = await Trip.find(filter).populate('routeId').limit(50);
    return sendSuccess(res, trips);
  } catch (err) {
    next(err);
  }
};

export const createTrip = async (req, res, next) => {
  try {
    const trip = await Trip.create(req.body);
    return sendSuccess(res, trip, 'Trip scheduled', 201);
  } catch (err) {
    next(err);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!trip) return sendError(res, 'Trip not found', 404);
    return sendSuccess(res, trip, 'Trip updated');
  } catch (err) {
    next(err);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return sendError(res, 'Trip not found', 404);
    return sendSuccess(res, {}, 'Trip removed');
  } catch (err) {
    next(err);
  }
};
