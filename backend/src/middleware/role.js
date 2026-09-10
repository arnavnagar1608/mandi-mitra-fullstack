const { db } = require('../config/firebase');
const { errorResponse } = require('../utils/response');

/**
 * Role-Based Access Control Middleware
 * 
 * Verifies that the authenticated user has an active administrative record
 * in /admin_users/{uid}.
 * 
 * @param {string[]} allowedRoles Array of allowed role strings, e.g. ['super_admin', 'center_officer']
 */
function requireAdminRole(allowedRoles = ['super_admin', 'center_officer']) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.uid) {
        return errorResponse(res, 'UNAUTHORIZED', 'Authentication required.', 401);
      }

      const adminDoc = await db.collection('admin_users').doc(req.user.uid).get();

      if (!adminDoc.exists) {
        // In development/mock mode, support mock admin uids
        if (req.user?.isMock && (req.user.uid === 'super_admin' || req.user.uid.startsWith('officer_'))) {
          req.admin = {
            id: req.user.uid,
            uid: req.user.uid,
            role: req.user.uid === 'super_admin' ? 'super_admin' : 'center_officer',
            assignedCenterId: 'c1',
            name: req.user.uid === 'super_admin' ? 'Super Administrator' : 'Shri Rajesh Sharma',
            email: `${req.user.uid}@mandimitra.gov.in`
          };
          return next();
        }
        return errorResponse(res, 'FORBIDDEN', 'Administrative privileges required.', 403);
      }

      const adminData = adminDoc.data();

      if (!adminData.isActive) {
        return errorResponse(res, 'ACCOUNT_DEACTIVATED', 'Administrative account has been suspended.', 403);
      }

      if (!allowedRoles.includes(adminData.role)) {
        return errorResponse(res, 'INSUFFICIENT_PERMISSIONS', `Access restricted to roles: ${allowedRoles.join(', ')}`, 403);
      }

      req.admin = {
        id: adminDoc.id,
        uid: adminDoc.id,
        role: adminData.role,
        assignedCenterId: adminData.assignedCenterId || null,
        name: adminData.name,
        email: adminData.email
      };

      return next();
    } catch (err) {
      console.error('Error in requireAdminRole:', err);
      return errorResponse(res, 'AUTH_CHECK_FAILED', 'Failed to verify administrative role.', 500);
    }
  };
}

module.exports = {
  requireAdminRole
};
