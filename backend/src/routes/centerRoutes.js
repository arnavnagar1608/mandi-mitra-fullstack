const express = require('express');
const router = express.Router();
const centerController = require('../controllers/centerController');
const slotController = require('../controllers/slotController');

router.get('/', centerController.getCentersHandler);
router.get('/:centerId', centerController.getCenterByIdHandler);
router.get('/:centerId/queue', centerController.getCenterQueueHandler);
router.get('/:centerId/slots', slotController.getCenterSlotsHandler);

module.exports = router;
