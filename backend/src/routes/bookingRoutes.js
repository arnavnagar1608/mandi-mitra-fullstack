'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createBookingHandler,
  getMyBookingsHandler,
  getBookingByIdHandler,
  cancelBookingHandler,
  getBookingQueueStatusHandler,
} = require('../controllers/bookingController');

// All booking routes require authentication
router.post('/', authenticate, createBookingHandler);
router.get('/my', authenticate, getMyBookingsHandler);
router.get('/:bookingId', authenticate, getBookingByIdHandler);
router.post('/:bookingId/cancel', authenticate, cancelBookingHandler);
router.get('/:bookingId/queue-status', authenticate, getBookingQueueStatusHandler);

module.exports = router;
