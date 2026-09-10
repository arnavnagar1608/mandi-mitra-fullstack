'use strict';

const { db } = require('../config/firebase');

/**
 * Get all approved testimonials (public).
 */
async function getTestimonials() {
  const snap = await db.collection('testimonials').get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((t) => t.approved === true)
    .sort((a, b) => {
      const aTime = a.createdAt?._seconds || 0;
      const bTime = b.createdAt?._seconds || 0;
      return bTime - aTime; // newest first
    });
}

module.exports = { getTestimonials };
