const bookingService = require('../services/bookingService');
const { successResponse } = require('../utils/response');

async function createBookingHandler(req, res, next) {
  try {
    const booking = await bookingService.createBooking(req.user.uid, req.body);
    return successResponse(res, { booking }, 'Slot booked and digital token generated successfully.', 201);
  } catch (err) {
    next(err);
  }
}

async function cancelBookingHandler(req, res, next) {
  try {
    const result = await bookingService.cancelBooking(req.params.bookingId, req.user.uid);
    return successResponse(res, result, 'Booking cancelled successfully.');
  } catch (err) {
    next(err);
  }
}

async function getMyBookingsHandler(req, res, next) {
  try {
    const { status } = req.query;
    const bookings = await bookingService.getFarmerBookings(req.user.uid, { status });
    return successResponse(res, { count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
}

async function getBookingByIdHandler(req, res, next) {
  try {
    const booking = await bookingService.getBookingById(req.params.bookingId);
    return successResponse(res, { booking });
  } catch (err) {
    next(err);
  }
}

async function getBookingQueueStatusHandler(req, res, next) {
  try {
    const queueStatus = await bookingService.getBookingQueueStatus(req.params.bookingId, req.user.uid);
    return successResponse(res, { queueStatus });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBookingHandler,
  cancelBookingHandler,
  getMyBookingsHandler,
  getBookingByIdHandler,
  getBookingQueueStatusHandler
};
