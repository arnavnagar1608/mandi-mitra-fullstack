/**
 * Standardized API Response Envelopes
 */

function successResponse(res, data = {}, message = null, statusCode = 200) {
  const payload = {
    success: true,
    data
  };
  if (message) payload.message = message;
  return res.status(statusCode).json(payload);
}

function errorResponse(res, code = 'INTERNAL_ERROR', message = 'An unexpected error occurred.', statusCode = 500, details = null) {
  const payload = {
    success: false,
    error: {
      code,
      message
    }
  };
  if (details) payload.error.details = details;
  return res.status(statusCode).json(payload);
}

module.exports = {
  successResponse,
  errorResponse
};
