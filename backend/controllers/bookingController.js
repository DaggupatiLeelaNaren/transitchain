import { Booking, Notification } from '../models/Operations.js';
import { ProviderAdapterFactory } from '../integrations/providerAdapters.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const createBooking = async (req, res, next) => {
  try {
    const {
      journeyId,
      providerCode = 'TGSRTC',
      routeShortName,
      fromStopName,
      toStopName,
      departureTime,
      arrivalTime,
      passengerCount = 1,
      totalFare
    } = req.body;

    if (!fromStopName || !toStopName || totalFare === undefined) {
      return sendError(res, 'Trip endpoints and fare are required', 400);
    }

    const adapter = ProviderAdapterFactory.getAdapter(providerCode);

    // Call provider integration
    const providerResult = await adapter.createBooking({
      fromStopName,
      toStopName,
      passengerCount,
      totalFare
    });

    // Save confirmed booking in database
    const booking = await Booking.create({
      bookingReference: providerResult.bookingReference,
      userId: req.user._id,
      journeyId: journeyId || null,
      providerCode: adapter.providerCode,
      routeShortName: routeShortName || 'Transit Line',
      fromStopName,
      toStopName,
      departureTime: departureTime || '08:30',
      arrivalTime: arrivalTime || '09:15',
      passengerCount,
      totalFare,
      fareCurrency: 'INR',
      status: 'confirmed',
      ticketNumber: providerResult.ticketNumber,
      qrPayload: providerResult.qrPayload
    });

    // Create In-App Notification
    await Notification.create({
      userId: req.user._id,
      title: 'Booking Confirmed!',
      message: `Your ticket for ${routeShortName} from ${fromStopName} to ${toStopName} is confirmed. Ref: ${booking.bookingReference}`,
      type: 'booking',
      metadata: { bookingId: booking._id, reference: booking.bookingReference }
    });

    logger.info(`[Booking] Created: ${booking.bookingReference} for user ${req.user.email}`);
    return sendSuccess(res, booking, 'Booking successfully confirmed!', 201);
  } catch (err) {
    next(err);
  }
};

export const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, bookings);
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) return sendError(res, 'Booking not found', 404);
    return sendSuccess(res, booking);
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) return sendError(res, 'Booking not found', 404);

    if (booking.status === 'cancelled') {
      return sendError(res, 'Booking is already cancelled', 400);
    }

    const adapter = ProviderAdapterFactory.getAdapter(booking.providerCode);
    await adapter.cancelBooking(booking.bookingReference, reason);

    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'User requested cancellation';
    booking.refundAmount = booking.totalFare;
    booking.refundStatus = 'processed';
    await booking.save();

    await Notification.create({
      userId: req.user._id,
      title: 'Booking Cancelled',
      message: `Booking ${booking.bookingReference} was cancelled. Refund of ₹${booking.totalFare} has been initiated.`,
      type: 'booking'
    });

    return sendSuccess(res, booking, 'Booking cancelled and refund processed');
  } catch (err) {
    next(err);
  }
};

export const getBookingStatus = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!booking) return sendError(res, 'Booking not found', 404);
    return sendSuccess(res, {
      bookingReference: booking.bookingReference,
      status: booking.status,
      ticketNumber: booking.ticketNumber,
      updatedAt: booking.updatedAt
    });
  } catch (err) {
    next(err);
  }
};
