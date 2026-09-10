const { auth } = require('../config/firebase');
const env = require('../config/env');
const { errorResponse } = require('../utils/response');

/**
 * Authentication Middleware
 * 
 * Verifies Firebase ID Token from Authorization header:
 * Authorization: Bearer <Firebase_ID_Token>
 * 
 * In development/test mode only: Supports mock tokens formatted as 'mock-token-{uid}'
 * for integration testing. Mock tokens are strictly rejected in production.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'UNAUTHORIZED', 'Authentication token is required.', 401);
    }

    const token = authHeader.split('Bearer ')[1].trim();

    // 1. Check development mock token guard
    if (token.startsWith('mock-token-')) {
      if (env.isProduction) {
        return errorResponse(res, 'FORBIDDEN', 'Mock authentication tokens are disabled in production.', 403);
      }
      const uid = token.replace('mock-token-', '');
      req.user = {
        uid,
        isMock: true
      };
      return next();
    }

    // 2. Production Firebase ID Token verification
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      phone: decodedToken.phone_number,
      email: decodedToken.email,
      isMock: false
    };

    return next();
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      return errorResponse(res, 'TOKEN_EXPIRED', 'Authentication token has expired. Please log in again.', 401);
    }
    return errorResponse(res, 'INVALID_TOKEN', 'Failed to authenticate user token.', 401);
  }
}

/**
 * Optional Authentication Middleware
 * Populates req.user if a valid token is present, but doesn't block unauthenticated requests.
 */
async function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1].trim();
      if (token.startsWith('mock-token-') && !env.isProduction) {
        req.user = { uid: token.replace('mock-token-', ''), isMock: true };
      } else {
        const decodedToken = await auth.verifyIdToken(token);
        req.user = { uid: decodedToken.uid, phone: decodedToken.phone_number, email: decodedToken.email };
      }
    }
  } catch (err) {
    // Ignore invalid optional tokens
  }
  return next();
}

module.exports = {
  authenticate,
  optionalAuthenticate
};
