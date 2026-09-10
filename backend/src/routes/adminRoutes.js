'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdminRole } = require('../middleware/role');
const { scopeCenterOfficer } = require('../middleware/centerScope');
const {
  getDashboardMetricsHandler,
  getCenterRosterHandler,
  callNextTokenHandler,
  updateQueueEntryHandler,
  getCenterAnalyticsHandler,
} = require('../controllers/adminController');

// All admin routes require admin auth
const adminAuth = [authenticate, requireAdminRole(['super_admin', 'center_officer'])];

// Super admin only
router.get('/metrics', authenticate, requireAdminRole(['super_admin']), getDashboardMetricsHandler);

// Center-scoped routes (center_officer sees only their center; super_admin sees all)
router.get('/centers/:centerId/roster', ...adminAuth, scopeCenterOfficer, getCenterRosterHandler);
router.post(
  '/centers/:centerId/call-next',
  ...adminAuth,
  scopeCenterOfficer,
  callNextTokenHandler
);
router.get(
  '/centers/:centerId/analytics',
  ...adminAuth,
  scopeCenterOfficer,
  getCenterAnalyticsHandler
);

// Booking queue entry update
router.patch('/bookings/:bookingId/status', ...adminAuth, updateQueueEntryHandler);

module.exports = router;
