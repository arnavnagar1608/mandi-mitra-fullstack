'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getMyPaymentsHandler, getPaymentByIdHandler } = require('../controllers/paymentController');

router.get('/my', authenticate, getMyPaymentsHandler);
router.get('/:paymentId', authenticate, getPaymentByIdHandler);

module.exports = router;
