'use strict';

const testimonialService = require('../services/testimonialService');
const { successResponse } = require('../utils/response');

async function getTestimonialsHandler(req, res, next) {
  try {
    const testimonials = await testimonialService.getTestimonials();
    return successResponse(res, { count: testimonials.length, testimonials });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTestimonialsHandler };
