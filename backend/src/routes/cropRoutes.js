'use strict';

const express = require('express');
const router = express.Router();
const { getCropsHandler, getCropByIdHandler } = require('../controllers/cropController');

// Public endpoints — no auth required
router.get('/', getCropsHandler);
router.get('/:cropId', getCropByIdHandler);

module.exports = router;
