import { TrackingEvent, Journey } from '../models/Operations.js';
import { Vehicle } from '../models/Transport.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getJourneyTracking = async (req, res, next) => {
  try {
    const { journeyId } = req.params;
    const journey = await Journey.findById(journeyId);
    if (!journey) return sendError(res, 'Journey not found', 404);

    const latestEvent = await TrackingEvent.findOne({ journeyId }).sort({ timestamp: -1 });

    // Build tracking status based on journey legs
    const currentLegIndex = latestEvent ? latestEvent.currentLegIndex : 0;
    const legs = journey.selectedAlternative?.legs || (journey.alternatives[0] ? journey.alternatives[0].legs : []);
    const currentLeg = legs[currentLegIndex] || legs[0];

    const trackingData = {
      journeyId,
      status: journey.status,
      currentLegIndex,
      totalLegs: legs.length,
      currentLeg: currentLeg || null,
      nextBoardingPoint: currentLeg ? currentLeg.from_stop_name : 'Starting point',
      nextDestinationPoint: currentLeg ? currentLeg.to_stop_name : 'Destination',
      expectedArrival: currentLeg ? currentLeg.arrival_time : 'On schedule',
      delaySeconds: latestEvent ? latestEvent.delaySeconds : 0,
      liveVehiclePosition: latestEvent ? latestEvent.coordinates : null,
      transferReminder: legs.length > 2 ? 'Transfer ahead at ' + (legs[2]?.from_stop_name || 'Interchange') : null,
      lastUpdated: latestEvent ? latestEvent.timestamp : new Date()
    };

    return sendSuccess(res, trackingData);
  } catch (err) {
    next(err);
  }
};

export const getVehicleTracking = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await Vehicle.findOne({ vehicleNumber: vehicleId });
    if (!vehicle) return sendError(res, 'Vehicle not found or inactive', 404);

    return sendSuccess(res, vehicle);
  } catch (err) {
    next(err);
  }
};

export const ingestVehiclePosition = async (req, res, next) => {
  try {
    const { vehicleNumber, lat, lon, speedKmph, bearing, currentTripId, feedKey } = req.body;
    if (!vehicleNumber || lat === undefined || lon === undefined) {
      return sendError(res, 'vehicleNumber, lat, and lon are required', 400);
    }

    let vehicle = await Vehicle.findOne({ vehicleNumber });
    if (!vehicle) {
      vehicle = new Vehicle({
        vehicleNumber,
        feedKey: feedKey || 'tgsrtc'
      });
    }

    vehicle.lastCoordinates = { lat, lon };
    if (speedKmph !== undefined) vehicle.lastSpeedKmph = speedKmph;
    if (bearing !== undefined) vehicle.lastBearing = bearing;
    if (currentTripId) vehicle.currentTripId = currentTripId;
    vehicle.lastUpdatedAt = new Date();
    await vehicle.save();

    // Broadcast through Socket.IO if io is attached to app
    const io = req.app.get('io');
    if (io) {
      io.emit(`tracking:${vehicleNumber}`, {
        vehicleNumber,
        coordinates: { lat, lon },
        speedKmph,
        timestamp: new Date()
      });
    }

    return sendSuccess(res, vehicle, 'Position ingested');
  } catch (err) {
    next(err);
  }
};
