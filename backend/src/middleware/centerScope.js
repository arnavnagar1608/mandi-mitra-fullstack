const { errorResponse } = require('../utils/response');

/**
 * Center Scoping Middleware
 * 
 * Ensures that a center_officer can only query or modify data
 * belonging to their assigned center.
 * 
 * Extracts target centerId from:
 * - req.params.centerId
 * - req.body.centerId
 * - req.query.centerId
 */
function scopeCenterOfficer(req, res, next) {
  if (!req.admin) {
    return errorResponse(res, 'FORBIDDEN', 'Administrative role required.', 403);
  }

  // Super admins have universal access across all centers
  if (req.admin.role === 'super_admin') {
    return next();
  }

  const targetCenterId = req.params.centerId || req.body.centerId || req.query.centerId;

  if (!targetCenterId) {
    return errorResponse(res, 'CENTER_ID_REQUIRED', 'Center identifier must be specified.', 400);
  }

  if (req.admin.assignedCenterId !== targetCenterId) {
    return errorResponse(
      res,
      'FORBIDDEN_CENTER_MISMATCH',
      `Officer is only authorized to manage assigned center '${req.admin.assignedCenterId}'. Access to '${targetCenterId}' denied.`,
      403
    );
  }

  return next();
}

module.exports = {
  scopeCenterOfficer
};
