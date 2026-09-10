'use strict';

const { db } = require('../config/firebase');

/**
 * Get all payments for the authenticated farmer.
 */
async function getFarmerPayments(farmerId) {
  const snap = await db
    .collection('payments')
    .where('farmerId', '==', farmerId)
    .orderBy('processedAt', 'desc')
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Get a single payment by ID (must belong to farmer or be admin).
 */
async function getPaymentById(paymentId, requestingFarmerId = null) {
  const doc = await db.collection('payments').doc(paymentId).get();
  if (!doc.exists) {
    const err = new Error('Payment not found');
    err.statusCode = 404;
    throw err;
  }
  const data = { id: doc.id, ...doc.data() };

  if (requestingFarmerId && data.farmerId !== requestingFarmerId) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  return data;
}

/**
 * Compute total earned and payment summary for a farmer (used in /payments page).
 */
async function getFarmerPaymentSummary(farmerId) {
  const payments = await getFarmerPayments(farmerId);
  const totalEarned = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  return { totalEarned, count: payments.length, payments };
}

module.exports = { getFarmerPayments, getPaymentById, getFarmerPaymentSummary };
