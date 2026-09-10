const authService = require('../services/authService');
const env = require('../config/env');
const { successResponse, errorResponse } = require('../utils/response');

async function sendOtpHandler(req, res, next) {
  try {
    const { identifier, method = 'mobile' } = req.body;
    const result = await authService.sendOtp({ identifier, method });
    return successResponse(res, result, result.message);
  } catch (err) {
    next(err);
  }
}

async function verifyOtpHandler(req, res, next) {
  try {
    const { identifier, method = 'mobile', otp, name, village, district, state, aadhaarLast4 } = req.body;
    const registrationData = { name, village, district, state, aadhaarLast4 };
    const result = await authService.verifyOtp({ identifier, method, otp, registrationData });
    return successResponse(res, result, result.message || 'Authentication successful.');
  } catch (err) {
    next(err);
  }
}

/**
 * Development-Only Mock Token Generator (Safety Requirement #2)
 * Strictly disabled in production.
 */
function mockTokenHandler(req, res) {
  if (env.isProduction) {
    return errorResponse(res, 'FORBIDDEN', 'Mock token generation is strictly disabled in production environments.', 403);
  }

  const { uid = 'f1' } = req.body;
  const mockToken = `mock-token-${uid}`;

  return successResponse(res, {
    token: mockToken,
    uid,
    note: 'Development mock token. Header: Authorization: Bearer mock-token-' + uid
  });
}

module.exports = {
  sendOtpHandler,
  verifyOtpHandler,
  mockTokenHandler
};
