const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public OTP flow
router.post('/send-otp', authController.sendOtpHandler);
router.post('/verify-otp', authController.verifyOtpHandler);

// Development-only testing token (disabled in production)
router.post('/mock-token', authController.mockTokenHandler);

module.exports = router;
