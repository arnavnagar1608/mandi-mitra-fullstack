const farmerService = require('../services/farmerService');
const { successResponse } = require('../utils/response');

async function getMeHandler(req, res, next) {
  try {
    const profile = await farmerService.getFarmerProfile(req.user.uid);
    return successResponse(res, { farmer: profile });
  } catch (err) {
    next(err);
  }
}

async function registerFarmerHandler(req, res, next) {
  try {
    const profile = await farmerService.registerFarmer(req.user.uid, req.body);
    return successResponse(res, { farmer: profile }, 'Farmer registered successfully.', 201);
  } catch (err) {
    next(err);
  }
}

async function updateMeHandler(req, res, next) {
  try {
    const updated = await farmerService.updateFarmerProfile(req.user.uid, req.body);
    return successResponse(res, { farmer: updated }, 'Profile updated successfully.');
  } catch (err) {
    next(err);
  }
}

async function getNotificationsHandler(req, res, next) {
  try {
    const notifications = await farmerService.getFarmerNotifications(req.user.uid);
    return successResponse(res, { notifications });
  } catch (err) {
    next(err);
  }
}

async function markNotificationReadHandler(req, res, next) {
  try {
    const result = await farmerService.markNotificationRead(req.user.uid, req.params.notificationId);
    return successResponse(res, result, 'Notification marked as read.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMeHandler,
  registerFarmerHandler,
  updateMeHandler,
  getNotificationsHandler,
  markNotificationReadHandler
};
