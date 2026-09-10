'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getMyProcurementsHandler,
  getProcurementByIdHandler,
  updateProcurementStatusHandler,
} = require('../controllers/procurementController');
const { requireAdminRole } = require('../middleware/role');

// Farmer routes
router.get('/my', authenticate, getMyProcurementsHandler);
router.get('/:procurementId', authenticate, getProcurementByIdHandler);

// Admin-only status update
router.patch(
  '/:procurementId/status',
  authenticate,
  requireAdminRole(['super_admin', 'center_officer']),
  updateProcurementStatusHandler
);

module.exports = router;
