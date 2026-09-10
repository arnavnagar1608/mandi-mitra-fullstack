const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');

router.get('/', slotController.getSlotsHandler);
router.get('/:slotId', slotController.getSlotByIdHandler);

module.exports = router;
