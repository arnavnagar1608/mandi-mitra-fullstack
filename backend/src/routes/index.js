'use strict';

const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/farmers', require('./farmerRoutes'));
router.use('/centers', require('./centerRoutes'));
router.use('/slots', require('./slotRoutes'));
router.use('/bookings', require('./bookingRoutes'));
router.use('/procurements', require('./procurementRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/crops', require('./cropRoutes'));
router.use('/testimonials', require('./testimonialRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;
