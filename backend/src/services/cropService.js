'use strict';

const { db } = require('../config/firebase');

/**
 * Get all crops (reference data, public).
 */
async function getAllCrops() {
  const snap = await db.collection('crops').get();
  const crops = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort in memory — avoids composite index requirement for small reference collection
  return crops.sort((a, b) => (a.nameEn || a.name || '').localeCompare(b.nameEn || b.name || ''));
}

/**
 * Get a single crop by ID.
 */
async function getCropById(cropId) {
  const doc = await db.collection('crops').doc(cropId).get();
  if (!doc.exists) {
    const err = new Error('Crop not found');
    err.statusCode = 404;
    throw err;
  }
  return { id: doc.id, ...doc.data() };
}

module.exports = { getAllCrops, getCropById };
