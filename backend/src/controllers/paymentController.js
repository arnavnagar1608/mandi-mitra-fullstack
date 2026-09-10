'use strict';

const paymentService = require('../services/paymentService');
const { successResponse } = require('../utils/response');

async function getMyPaymentsHandler(req, res, next) {
  try {
    const summary = await paymentService.getFarmerPaymentSummary(req.user.uid);
    return successResponse(res, summary);
  } catch (err) {
    next(err);
  }
}

async function getPaymentByIdHandler(req, res, next) {
  try {
    const farmerId = req.admin ? null : req.user.uid;
    const payment = await paymentService.getPaymentById(req.params.paymentId, farmerId);
    return successResponse(res, { payment });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyPaymentsHandler, getPaymentByIdHandler };
