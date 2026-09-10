'use strict';

const procurementService = require('../services/procurementService');
const { successResponse } = require('../utils/response');

async function getMyProcurementsHandler(req, res, next) {
  try {
    const procurements = await procurementService.getFarmerProcurements(req.user.uid);
    return successResponse(res, { count: procurements.length, procurements });
  } catch (err) {
    next(err);
  }
}

async function getProcurementByIdHandler(req, res, next) {
  try {
    // Farmers see only their own; admins can pass null for farmerId check
    const farmerId = req.admin ? null : req.user.uid;
    const procurement = await procurementService.getProcurementById(
      req.params.procurementId,
      farmerId
    );
    return successResponse(res, { procurement });
  } catch (err) {
    next(err);
  }
}

async function updateProcurementStatusHandler(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'status is required' });
    }
    const result = await procurementService.updateProcurementStatus(
      req.params.procurementId,
      status,
      req.admin.uid
    );
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyProcurementsHandler,
  getProcurementByIdHandler,
  updateProcurementStatusHandler,
};
