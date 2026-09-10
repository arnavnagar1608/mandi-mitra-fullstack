'use strict';

const express = require('express');
const router = express.Router();
const { getTestimonialsHandler } = require('../controllers/testimonialController');

// Public endpoint — no auth required
router.get('/', getTestimonialsHandler);

module.exports = router;
