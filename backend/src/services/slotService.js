const { db } = require('../config/firebase');

/**
 * Retrieves appointment slots filtered by centerId and date.
 */
async function getSlots({ centerId, date, period }) {
  let query = db.collection('slots');

  if (centerId) query = query.where('centerId', '==', centerId);
  if (date) query = query.where('date', '==', date);
  if (period) query = query.where('period', '==', period);

  const snap = await query.get();
  const slots = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Sort by startTime
  slots.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  return slots;
}

/**
 * Retrieves single slot by ID.
 */
async function getSlotById(slotId) {
  const doc = await db.collection('slots').doc(slotId).get();
  if (!doc.exists) {
    const error = new Error(`Slot '${slotId}' not found.`);
    error.statusCode = 404;
    error.code = 'SLOT_NOT_FOUND';
    throw error;
  }
  return { id: doc.id, ...doc.data() };
}

/**
 * Retrieves grouped slots for a center on a specific date.
 */
async function getCenterSlotsGrouped(centerId, date) {
  const targetDate = date || '2026-09-08';
  const slots = await getSlots({ centerId, date: targetDate });

  return {
    centerId,
    date: targetDate,
    morning: slots.filter(s => s.period === 'morning'),
    afternoon: slots.filter(s => s.period === 'afternoon'),
    evening: slots.filter(s => s.period === 'evening'),
    allSlots: slots
  };
}

module.exports = {
  getSlots,
  getSlotById,
  getCenterSlotsGrouped
};
