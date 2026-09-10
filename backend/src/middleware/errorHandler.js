const { errorResponse } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error('[API Error]:', err);

  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected server error occurred.';

  return errorResponse(res, code, message, statusCode, err.details || null);
}

module.exports = { errorHandler };
