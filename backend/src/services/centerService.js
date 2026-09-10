const { db } = require('../config/firebase');
const { calculateHaversineDistance } = require('../utils/geo');

/**
 * Retrieves procurement centers with dynamic geonavigation distance,
 * crop filters, crowd filters, and text search.
 */
async function getAllCenters({ lat, lng, crop, crowd, status, search }) {
  const userLat = lat !== undefined ? parseFloat(lat) : null;
  const userLng = lng !== undefined ? parseFloat(lng) : null;

  let query = db.collection('procurement_centers');

  if (status && status !== 'all') {
    query = query.where('status', '==', status);
  }

  const snap = await query.get();
  let centers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Dynamic Haversine distance computation (No static coords stored on farmers)
  centers = centers.map(center => {
    let distance = center.distance || null;
    if (userLat !== null && userLng !== null && center.latitude && center.longitude) {
      distance = calculateHaversineDistance(userLat, userLng, center.latitude, center.longitude);
    }
    return {
      ...center,
      distance: distance !== null ? distance : 5.0 // Fallback distance if GPS unavailable
    };
  });

  // Filter by crop
  if (crop && crop !== 'all') {
    centers = centers.filter(c => Array.isArray(c.cropsAccepted) && c.cropsAccepted.includes(crop));
  }

  // Filter by crowd level
  if (crowd && crowd !== 'all') {
    centers = centers.filter(c => c.crowdLevel === crowd);
  }

  // Search filter
  if (search && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    centers = centers.filter(c => 
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.nameHi && c.nameHi.includes(q)) ||
      (c.district && c.district.toLowerCase().includes(q)) ||
      (c.districtHi && c.districtHi.includes(q))
    );
  }

  // Sort by nearest first if coordinates provided
  if (userLat !== null && userLng !== null) {
    centers.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  return centers;
}

/**
 * Retrieves single center by ID.
 */
async function getCenterById(centerId) {
  const doc = await db.collection('procurement_centers').doc(centerId).get();
  if (!doc.exists) {
    const error = new Error(`Procurement center '${centerId}' not found.`);
    error.statusCode = 404;
    error.code = 'CENTER_NOT_FOUND';
    throw error;
  }
  return { id: doc.id, ...doc.data() };
}

/**
 * Retrieves live queue telemetry for a center.
 */
async function getCenterQueueTelemetry(centerId) {
  const center = await getCenterById(centerId);
  return {
    centerId: center.id,
    name: center.name,
    nameHi: center.nameHi,
    status: center.status,
    crowdLevel: center.crowdLevel,
    currentServingToken: center.currentServingToken || 0,
    currentQueue: center.currentQueue || 0,
    todayArrived: center.todayArrived || 0,
    todayProcessed: center.todayProcessed || 0,
    avgProcessingTime: center.avgProcessingTime || 18,
    dailyCapacity: center.dailyCapacity
  };
}

module.exports = {
  getAllCenters,
  getCenterById,
  getCenterQueueTelemetry
};
