import axios from 'axios';
import { Journey, JourneyHistory, Favorite } from '../models/Operations.js';
import { config } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const searchJourneys = async (req, res, next) => {
  try {
    const {
      origin,
      destination,
      departureTime = '08:30',
      travelDate = new Date().toISOString().split('T')[0],
      modes = ['bus', 'metro', 'walk'],
      maxWalkingDistanceMeters = 2000,
      maxTransfers = 3,
      optimizationPreference = 'balanced',
      accessibleOnly = false
    } = req.body;

    if (!origin || !destination || origin.lat === undefined || destination.lat === undefined) {
      return sendError(res, 'Valid origin and destination coordinates are required', 400);
    }

    const payload = {
      origin: {
        lat: parseFloat(origin.lat),
        lon: parseFloat(origin.lon),
        name: origin.name || 'Origin'
      },
      destination: {
        lat: parseFloat(destination.lat),
        lon: parseFloat(destination.lon),
        name: destination.name || 'Destination'
      },
      departure_time: departureTime,
      travel_date: travelDate,
      modes,
      max_walking_distance_meters: maxWalkingDistanceMeters,
      max_transfers: maxTransfers,
      optimization_preference: optimizationPreference,
      accessible_only: accessibleOnly
    };

    logger.info(`[Journey Search] Routing from "${origin.name}" to "${destination.name}" via Python engine...`);

    let optResponse;
    try {
      optResponse = await axios.post(
        `${config.optimizationServiceUrl}/api/v1/journeys/search`,
        payload,
        { timeout: 12000 }
      );
    } catch (err) {
      logger.error(`[Optimization Engine Error] ${err.message}`);
      return sendError(res, 'Route optimization engine is currently unavailable', 503);
    }

    const optData = optResponse.data;

    // Persist journey search in MongoDB
    const journey = await Journey.create({
      userId: req.user ? req.user._id : null,
      requestId: optData.request_id,
      origin: payload.origin,
      destination: payload.destination,
      travelDate,
      departureTime,
      modes,
      optimizationPreference,
      status: 'planned',
      alternatives: optData.alternatives,
      diagnostics: optData.diagnostics
    });

    return sendSuccess(res, {
      journeyId: journey._id,
      requestId: optData.request_id,
      searchTimeMs: optData.search_time_ms,
      origin: optData.origin,
      destination: optData.destination,
      alternatives: optData.alternatives,
      totalAlternatives: optData.total_alternatives,
      paretoCount: optData.pareto_count,
      diagnostics: optData.diagnostics
    });
  } catch (err) {
    next(err);
  }
};

export const getJourneyById = async (req, res, next) => {
  try {
    const journey = await Journey.findById(req.params.id);
    if (!journey) return sendError(res, 'Journey not found', 404);
    return sendSuccess(res, journey);
  } catch (err) {
    next(err);
  }
};

export const getJourneyStatus = async (req, res, next) => {
  try {
    const journey = await Journey.findById(req.params.id);
    if (!journey) return sendError(res, 'Journey not found', 404);
    return sendSuccess(res, {
      journeyId: journey._id,
      status: journey.status,
      updatedAt: journey.updatedAt
    });
  } catch (err) {
    next(err);
  }
};

export const getJourneyHistory = async (req, res, next) => {
  try {
    if (!req.user) return sendError(res, 'Authentication required', 401);
    const history = await Journey.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    return sendSuccess(res, history);
  } catch (err) {
    next(err);
  }
};

export const favoriteJourney = async (req, res, next) => {
  try {
    if (!req.user) return sendError(res, 'Authentication required', 401);
    const journey = await Journey.findById(req.params.id);
    if (!journey) return sendError(res, 'Journey not found', 404);

    const fav = await Favorite.create({
      userId: req.user._id,
      title: `${journey.origin.name} to ${journey.destination.name}`,
      origin: journey.origin,
      destination: journey.destination,
      modes: journey.modes
    });

    return sendSuccess(res, fav, 'Saved to favorites');
  } catch (err) {
    next(err);
  }
};
