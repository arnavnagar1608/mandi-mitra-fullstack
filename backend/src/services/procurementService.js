'use strict';

const { db } = require('../config/firebase');

const VALID_STAGES = [
  'slot-confirmed',
  'arrived',
  'weight-check',
  'quality-inspection',
  'grading-done',
  'payment-initiated',
  'payment-complete',
  'cancelled',
];

/**
 * Get all procurements for the authenticated farmer.
 */
async function getFarmerProcurements(farmerId) {
  const snap = await db
    .collection('procurements')
    .where('farmerId', '==', farmerId)
    .orderBy('createdAt', 'desc')
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get a single procurement by ID (must belong to farmer or be admin).
 */
async function getProcurementById(procurementId, requestingFarmerId = null) {
  const doc = await db.collection('procurements').doc(procurementId).get();
  if (!doc.exists) {
    const err = new Error('Procurement not found');
    err.statusCode = 404;
    throw err;
  }
  const data = { id: doc.id, ...doc.data() };

  // Farmers can only see their own procurements
  if (requestingFarmerId && data.farmerId !== requestingFarmerId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  return data;
}

/**
 * Update procurement status (admin only).
 * Enforces 8-stage order and immutable centerId.
 */
async function updateProcurementStatus(procurementId, newStatus, adminUid) {
  if (!VALID_STAGES.includes(newStatus)) {
    const err = new Error(`Invalid status. Must be one of: ${VALID_STAGES.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }

  const ref = db.collection('procurements').doc(procurementId);
  const doc = await ref.get();
  if (!doc.exists) {
    const err = new Error('Procurement not found');
    err.statusCode = 404;
    throw err;
  }

  const current = doc.data();

  // centerId is immutable — detect if someone tried to change it
  if (current.status === 'cancelled') {
    const err = new Error('Cannot update a cancelled procurement');
    err.statusCode = 409;
    throw err;
  }

  const currentIdx = VALID_STAGES.indexOf(current.status);
  const newIdx = VALID_STAGES.indexOf(newStatus);

  // Allow cancellation from any non-cancelled state
  if (newStatus !== 'cancelled' && newIdx < currentIdx) {
    const err = new Error(
      `Cannot move procurement backwards from '${current.status}' to '${newStatus}'`
    );
    err.statusCode = 400;
    throw err;
  }

  await ref.update({
    status: newStatus,
    updatedAt: new Date().toISOString(),
    updatedBy: adminUid,
  });

  return { id: procurementId, status: newStatus };
}

module.exports = { getFarmerProcurements, getProcurementById, updateProcurementStatus };
