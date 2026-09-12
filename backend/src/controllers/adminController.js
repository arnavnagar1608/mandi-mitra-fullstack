'use strict';

const adminService = require('../services/adminService');
const { successResponse } = require('../utils/response');

async function getDashboardMetricsHandler(req, res, next) {
  try {
    const metrics = await adminService.getDashboardMetrics();
    return successResponse(res, { metrics });
  } catch (err) {
    next(err);
  }
}

async function getCenterRosterHandler(req, res, next) {
  try {
    const { centerId } = req.params;
    const { date } = req.query;
    const roster = await adminService.getCenterRoster(centerId, date);
    return successResponse(res, { count: roster.length, roster });
  } catch (err) {
    next(err);
  }
}

async function callNextTokenHandler(req, res, next) {
  try {
    const { centerId } = req.params;
    const result = await adminService.callNextToken(centerId, req.admin.uid);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

async function updateQueueEntryHandler(req, res, next) {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'status is required' });
    }
    const result = await adminService.updateQueueEntry(bookingId, status, req.admin.uid);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

async function getCenterAnalyticsHandler(req, res, next) {
  try {
    const { centerId } = req.params;
    const analytics = await adminService.getCenterAnalytics(centerId);
    return successResponse(res, { analytics });
  } catch (err) {
    next(err);
  }
}

async function adminLoginHandler(req, res, next) {
  try {
    const { officerId, password } = req.body;
    const result = await adminService.officerLogin({ officerId, password });
    return successResponse(res, result, 'Officer authenticated successfully.');
  } catch (err) {
    next(err);
  }
}

async function adminRegisterHandler(req, res, next) {
  try {
    const result = await adminService.registerOfficer(req.body);
    return successResponse(res, result, result.message || 'Officer registered successfully.', 201);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardMetricsHandler,
  getCenterRosterHandler,
  callNextTokenHandler,
  updateQueueEntryHandler,
  getCenterAnalyticsHandler,
  adminLoginHandler,
  adminRegisterHandler,
};
