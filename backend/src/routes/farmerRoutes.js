const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const { authenticate } = require('../middleware/auth');

// All farmer endpoints require authentication
router.use(authenticate);

router.get('/me', farmerController.getMeHandler);
router.post('/', farmerController.registerFarmerHandler);
router.patch('/me', farmerController.updateMeHandler);

router.get('/me/notifications', farmerController.getNotificationsHandler);
router.patch('/me/notifications/:notificationId', farmerController.markNotificationReadHandler);

module.exports = router;
