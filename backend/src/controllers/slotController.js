const slotService = require('../services/slotService');
const { successResponse } = require('../utils/response');

async function getSlotsHandler(req, res, next) {
  try {
    const { centerId, date, period } = req.query;
    const slots = await slotService.getSlots({ centerId, date, period });
    return successResponse(res, { count: slots.length, slots });
  } catch (err) {
    next(err);
  }
}

async function getSlotByIdHandler(req, res, next) {
  try {
    const slot = await slotService.getSlotById(req.params.slotId);
    return successResponse(res, { slot });
  } catch (err) {
    next(err);
  }
}

async function getCenterSlotsHandler(req, res, next) {
  try {
    const { centerId } = req.params;
    const { date } = req.query;
    const result = await slotService.getCenterSlotsGrouped(centerId, date);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSlotsHandler,
  getSlotByIdHandler,
  getCenterSlotsHandler
};
