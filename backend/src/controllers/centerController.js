const centerService = require('../services/centerService');
const { successResponse } = require('../utils/response');

async function getCentersHandler(req, res, next) {
  try {
    const { lat, lng, crop, crowd, status, search, district, tehsil } = req.query;
    const centers = await centerService.getAllCenters({ lat, lng, crop, crowd, status, search, district, tehsil });
    return successResponse(res, { count: centers.length, centers });
  } catch (err) {
    next(err);
  }
}

async function getCenterByIdHandler(req, res, next) {
  try {
    const center = await centerService.getCenterById(req.params.centerId);
    return successResponse(res, { center });
  } catch (err) {
    next(err);
  }
}

async function getCenterQueueHandler(req, res, next) {
  try {
    const telemetry = await centerService.getCenterQueueTelemetry(req.params.centerId);
    return successResponse(res, { queue: telemetry });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCentersHandler,
  getCenterByIdHandler,
  getCenterQueueHandler
};
