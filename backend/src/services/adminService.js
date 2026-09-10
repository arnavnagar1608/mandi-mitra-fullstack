'use strict';

const { db, admin } = require('../config/firebase');

/**
 * Get dashboard metrics — total farmers, bookings today, active centers, total payments.
 * Used on the admin dashboard analytics tab.
 */
async function getDashboardMetrics() {
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  const [farmersSnap, bookingsTodaySnap, centersSnap, paymentsSnap] = await Promise.all([
    db.collection('farmers').count().get(),
    db.collection('bookings').where('date', '==', today).count().get(),
    db.collection('procurement_centers').where('isActive', '==', true).count().get(),
    db.collection('payments').get(),
  ]);

  const totalRevenue = paymentsSnap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);

  return {
    totalFarmers: farmersSnap.data().count,
    bookingsToday: bookingsTodaySnap.data().count,
    activeCenters: centersSnap.data().count,
    totalRevenue,
  };
}

/**
 * Get the live queue roster for a center on a given date.
 * Returns all bookings with status 'confirmed' or 'arrived' sorted by token number.
 */
async function getCenterRoster(centerId, date) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const snap = await db
    .collection('bookings')
    .where('centerId', '==', centerId)
    .where('date', '==', targetDate)
    .orderBy('tokenNumber', 'asc')
    .get();

  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Call the next token in the live queue.
 * - Finds the current "serving" booking and marks it 'completed'
 * - Finds the next 'arrived' booking and marks it 'serving'
 * - Updates the live_queue telemetry subcollection
 */
async function callNextToken(centerId, adminUid) {
  return db.runTransaction(async (tx) => {
    // Find currently serving booking
    const servingSnap = await db
      .collection('bookings')
      .where('centerId', '==', centerId)
      .where('status', '==', 'serving')
      .limit(1)
      .get();

    // Find next arrived booking (lowest token number)
    const nextSnap = await db
      .collection('bookings')
      .where('centerId', '==', centerId)
      .where('status', '==', 'arrived')
      .orderBy('tokenNumber', 'asc')
      .limit(1)
      .get();

    const now = new Date().toISOString();

    // Mark current as completed
    if (!servingSnap.empty) {
      tx.update(servingSnap.docs[0].ref, {
        status: 'completed',
        completedAt: now,
        completedBy: adminUid,
      });
    }

    if (nextSnap.empty) {
      return { nextToken: null, message: 'No more farmers in queue' };
    }

    const nextDoc = nextSnap.docs[0];
    const nextData = nextDoc.data();

    // Mark next as serving
    tx.update(nextDoc.ref, {
      status: 'serving',
      calledAt: now,
      calledBy: adminUid,
    });

    // Update live_queue telemetry
    const queueRef = db
      .collection('procurement_centers')
      .doc(centerId)
      .collection('live_queue')
      .doc('current');
    tx.set(
      queueRef,
      {
        currentToken: nextData.tokenNumber,
        currentFarmerId: nextData.farmerId,
        calledAt: now,
        calledBy: adminUid,
      },
      { merge: true }
    );

    return { nextToken: nextData.tokenNumber, bookingId: nextDoc.id };
  });
}

/**
 * Update a queue entry's status manually (e.g., mark 'arrived', 'no-show').
 */
async function updateQueueEntry(bookingId, newStatus, adminUid) {
  const ALLOWED = ['confirmed', 'arrived', 'serving', 'completed', 'no-show', 'cancelled'];
  if (!ALLOWED.includes(newStatus)) {
    const err = new Error(`Invalid queue status: ${newStatus}`);
    err.statusCode = 400;
    throw err;
  }

  const ref = db.collection('bookings').doc(bookingId);
  const doc = await ref.get();
  if (!doc.exists) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }

  await ref.update({
    status: newStatus,
    updatedAt: new Date().toISOString(),
    updatedBy: adminUid,
  });

  return { bookingId, status: newStatus };
}

/**
 * Get analytics data for a center: bookings per day for the last 30 days,
 * crop breakdown, and completion rate.
 */
async function getCenterAnalytics(centerId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

  const snap = await db
    .collection('bookings')
    .where('centerId', '==', centerId)
    .where('date', '>=', fromDate)
    .get();

  const bookings = snap.docs.map((d) => d.data());

  // Bookings per day
  const perDay = {};
  // Crop breakdown
  const perCrop = {};
  let completed = 0;
  let cancelled = 0;

  for (const b of bookings) {
    perDay[b.date] = (perDay[b.date] || 0) + 1;
    if (b.cropId) perCrop[b.cropId] = (perCrop[b.cropId] || 0) + 1;
    if (b.status === 'completed') completed++;
    if (b.status === 'cancelled') cancelled++;
  }

  const total = bookings.length;
  return {
    total,
    completed,
    cancelled,
    completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0',
    bookingsPerDay: perDay,
    cropBreakdown: perCrop,
  };
}

module.exports = {
  getDashboardMetrics,
  getCenterRoster,
  callNextToken,
  updateQueueEntry,
  getCenterAnalytics,
};
