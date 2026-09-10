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
  try {
    const snap = await db
      .collection('bookings')
      .where('centerId', '==', centerId)
      .where('date', '==', targetDate)
      .orderBy('tokenNumber', 'asc')
      .get();

    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    if (err.code === 9 || String(err.message).includes('index')) {
      const snap = await db
        .collection('bookings')
        .where('centerId', '==', centerId)
        .where('date', '==', targetDate)
        .get();
      const results = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return results.sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0));
    }
    throw err;
  }
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

/**
 * Authenticate Mandi Officer / Center In-Charge credentials.
 */
async function officerLogin({ officerId, password }) {
  if (!officerId || !password) {
    const error = new Error('Officer ID and password are required.');
    error.statusCode = 400;
    error.code = 'INVALID_INPUT';
    throw error;
  }

  // Pre-configured official officer records with fallback credentials
  const defaultPassword = process.env.OFFICER_PASSWORD || 'Mandi@Officer2026';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Super@Admin2026';

  const validOfficers = [
    {
      officerId: 'OFFICER-MP-001',
      aliases: ['admin@mandimitra.gov.in', 'officer_1', 'admin', 'rajesh.sharma'],
      password: defaultPassword,
      name: 'Shri Rajesh Sharma',
      nameHi: 'श्री राजेश शर्मा',
      designation: 'Mandi Center In-Charge',
      designationHi: 'मंडी केंद्र प्रभारी',
      role: 'center_officer',
      assignedCenterId: 'c1',
      centerName: 'Bhopal Central Mandi',
      centerNameHi: 'भोपाल सेंट्रल मंडी'
    },
    {
      officerId: 'OFFICER-MP-002',
      aliases: ['indore@mandimitra.gov.in', 'officer_2', 'anita.verma'],
      password: defaultPassword,
      name: 'Smt. Anita Verma',
      nameHi: 'श्रीमती अनीता वर्मा',
      designation: 'Senior Procurement Inspector',
      designationHi: 'वरिष्ठ खरीद निरीक्षक',
      role: 'center_officer',
      assignedCenterId: 'c2',
      centerName: 'Indore Mandi Complex',
      centerNameHi: 'इंदौर मंडी कॉम्प्लेक्स'
    },
    {
      officerId: 'SUPER-ADMIN-01',
      aliases: ['superadmin@mandimitra.gov.in', 'super_admin'],
      password: superAdminPassword,
      name: 'Dr. Alok Nath (IAS)',
      nameHi: 'डॉ. आलोक नाथ (आईएएस)',
      designation: 'State Procurement Commissioner',
      designationHi: 'राज्य खरीद आयुक्त',
      role: 'super_admin',
      assignedCenterId: null,
      centerName: 'All Mandis (Headquarters)',
      centerNameHi: 'सभी मंडियां (मुख्यालय)'
    }
  ];

  const matched = validOfficers.find(o => 
    o.officerId.toLowerCase() === officerId.trim().toLowerCase() ||
    o.aliases.some(a => a.toLowerCase() === officerId.trim().toLowerCase())
  );

  if (!matched || matched.password !== password.trim()) {
    const error = new Error('Invalid Officer ID or Password. Access denied.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const token = `mock-token-${matched.role === 'super_admin' ? 'super_admin' : 'officer_1'}`;

  return {
    token,
    officer: {
      officerId: matched.officerId,
      name: matched.name,
      nameHi: matched.nameHi,
      designation: matched.designation,
      designationHi: matched.designationHi,
      role: matched.role,
      assignedCenterId: matched.assignedCenterId,
      centerName: matched.centerName,
      centerNameHi: matched.centerNameHi
    }
  };
}

module.exports = {
  getDashboardMetrics,
  getCenterRoster,
  callNextToken,
  updateQueueEntry,
  getCenterAnalytics,
  officerLogin,
};
