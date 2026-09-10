'use strict';

const cropService = require('../services/cropService');
const { successResponse } = require('../utils/response');

async function getCropsHandler(req, res, next) {
  try {
    const crops = await cropService.getAllCrops();
    return successResponse(res, { count: crops.length, crops });
  } catch (err) {
    next(err);
  }
}

async function getCropByIdHandler(req, res, next) {
  try {
    const crop = await cropService.getCropById(req.params.cropId);
    return successResponse(res, { crop });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCropsHandler, getCropByIdHandler };
