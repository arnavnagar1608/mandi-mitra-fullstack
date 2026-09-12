'use strict';

const { db, admin } = require('../config/firebase');
const { supabase } = require('../config/supabase');

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

const CENTER_META = {
  c1: { name: 'Bhopal Central Mandi', nameHi: 'भोपाल सेंट्रल मंडी' },
  c2: { name: 'Indore Mandi Complex', nameHi: 'इंदौर मंडी कॉम्प्लेक्स' },
  c3: { name: 'Ujjain Krishi Upaj Mandi', nameHi: 'उज्जैन कृषि उपज मंडी' },
  c4: { name: 'Vidisha Grain Mandi', nameHi: 'विदिशा अनाज मंडी' },
  c5: { name: 'Jabalpur Krishi Mandi', nameHi: 'जबलपुर कृषि मंडी' },
  c6: { name: 'Gwalior Mandi Center', nameHi: 'ग्वालियर मंडी केंद्र' },
};

// In-memory officer store for zero-friction fallback
const registeredOfficersMemory = new Map([
  [
    'officer-mp-001',
    {
      officerId: 'OFFICER-MP-001',
      aliases: ['admin@mandimitra.gov.in', 'officer_1', 'admin', 'rajesh.sharma'],
      password: process.env.OFFICER_PASSWORD || 'Mandi@Officer2026',
      name: 'Shri Rajesh Sharma',
      nameHi: 'श्री राजेश शर्मा',
      designation: 'Mandi Center In-Charge',
      designationHi: 'मंडी केंद्र प्रभारी',
      role: 'center_officer',
      assignedCenterId: 'c1',
      centerName: 'Bhopal Central Mandi',
      centerNameHi: 'भोपाल सेंट्रल मंडी'
    }
  ],
  [
    'officer-mp-002',
    {
      officerId: 'OFFICER-MP-002',
      aliases: ['indore@mandimitra.gov.in', 'officer_2', 'anita.verma'],
      password: process.env.OFFICER_PASSWORD || 'Mandi@Officer2026',
      name: 'Smt. Anita Verma',
      nameHi: 'श्रीमती अनीता वर्मा',
      designation: 'Senior Procurement Inspector',
      designationHi: 'वरिष्ठ खरीद निरीक्षक',
      role: 'center_officer',
      assignedCenterId: 'c2',
      centerName: 'Indore Mandi Complex',
      centerNameHi: 'इंदौर मंडी कॉम्प्लेक्स'
    }
  ],
  [
    'super-admin-01',
    {
      officerId: 'SUPER-ADMIN-01',
      aliases: ['superadmin@mandimitra.gov.in', 'super_admin'],
      password: process.env.SUPER_ADMIN_PASSWORD || 'Super@Admin2026',
      name: 'Dr. Alok Nath (IAS)',
      nameHi: 'डॉ. आलोक नाथ (आईएएस)',
      designation: 'State Procurement Commissioner',
      designationHi: 'राज्य खरीद आयुक्त',
      role: 'super_admin',
      assignedCenterId: null,
      centerName: 'All Mandis (Headquarters)',
      centerNameHi: 'सभी मंडियां (मुख्यालय)'
    }
  ]
]);

/**
 * Register a new Mandi Officer in Supabase database & in-memory registry.
 */
async function registerOfficer(data) {
  const { 
    officerId, 
    password, 
    name, 
    nameHi, 
    designation, 
    designationHi, 
    role = 'center_officer', 
    assignedCenterId = 'c1',
    phone, 
    email 
  } = data;

  if (!officerId || !password || !name) {
    const error = new Error('Officer ID, full name, and password are required for registration.');
    error.statusCode = 400;
    error.code = 'INVALID_INPUT';
    throw error;
  }

  const cleanId = String(officerId).trim();
  const normalizedKey = cleanId.toLowerCase();

  // Check in memory first
  if (registeredOfficersMemory.has(normalizedKey)) {
    const error = new Error(`Officer with ID '${cleanId}' is already registered.`);
    error.statusCode = 409;
    error.code = 'OFFICER_EXISTS';
    throw error;
  }

  const centerInfo = CENTER_META[assignedCenterId] || {
    name: data.centerName || 'Mandi Procurement Center',
    nameHi: data.centerNameHi || 'मंडी खरीद केंद्र'
  };

  const newOfficer = {
    officerId: cleanId,
    aliases: [cleanId.toLowerCase(), email?.toLowerCase()].filter(Boolean),
    password: password.trim(),
    name: name.trim(),
    nameHi: nameHi?.trim() || name.trim(),
    designation: designation?.trim() || 'Mandi Procurement Officer',
    designationHi: designationHi?.trim() || 'मंडी खरीद अधिकारी',
    role,
    assignedCenterId,
    centerName: centerInfo.name,
    centerNameHi: centerInfo.nameHi,
    phone: phone || '',
    email: email || '',
  };

  // 1. Persist to Supabase admin_officers table if accessible
  try {
    const supabasePayload = {
      officer_id: newOfficer.officerId,
      password: newOfficer.password,
      name: newOfficer.name,
      name_hi: newOfficer.nameHi,
      designation: newOfficer.designation,
      designation_hi: newOfficer.designationHi,
      role: newOfficer.role,
      assigned_center_id: newOfficer.assignedCenterId,
      center_name: newOfficer.centerName,
      center_name_hi: newOfficer.centerNameHi,
      phone: newOfficer.phone,
      email: newOfficer.email,
    };

    const { data: dbData, error: dbError } = await supabase
      .from('admin_officers')
      .insert([supabasePayload])
      .select()
      .single();

    if (dbError) {
      console.warn('[Supabase admin_officers notice]:', dbError.message);
    }
  } catch (err) {
    console.warn('[Supabase admin_officers notice]:', err.message);
  }

  // 2. Save into memory registry
  registeredOfficersMemory.set(normalizedKey, newOfficer);

  const token = `mock-token-${newOfficer.role === 'super_admin' ? 'super_admin' : 'officer_1'}`;

  return {
    token,
    officer: {
      officerId: newOfficer.officerId,
      name: newOfficer.name,
      nameHi: newOfficer.nameHi,
      designation: newOfficer.designation,
      designationHi: newOfficer.designationHi,
      role: newOfficer.role,
      assignedCenterId: newOfficer.assignedCenterId,
      centerName: newOfficer.centerName,
      centerNameHi: newOfficer.centerNameHi
    },
    message: 'Officer account created and authenticated successfully.'
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

  const queryId = officerId.trim();
  const lowerQuery = queryId.toLowerCase();

  let matched = null;

  // Step 1: Check Supabase admin_officers table
  try {
    const { data: dbOfficer, error: dbErr } = await supabase
      .from('admin_officers')
      .select('*')
      .or(`officer_id.ilike.${queryId},email.ilike.${queryId}`)
      .single();

    if (dbOfficer && !dbErr) {
      matched = {
        officerId: dbOfficer.officer_id,
        password: dbOfficer.password,
        name: dbOfficer.name,
        nameHi: dbOfficer.name_hi || dbOfficer.name,
        designation: dbOfficer.designation,
        designationHi: dbOfficer.designation_hi || dbOfficer.designation,
        role: dbOfficer.role || 'center_officer',
        assignedCenterId: dbOfficer.assigned_center_id || 'c1',
        centerName: dbOfficer.center_name,
        centerNameHi: dbOfficer.center_name_hi || dbOfficer.center_name,
      };
    }
  } catch (err) {
    // Supabase table query notice (will fall back to memory)
  }

  // Step 2: Fallback to memory store
  if (!matched) {
    for (const officer of registeredOfficersMemory.values()) {
      if (
        officer.officerId.toLowerCase() === lowerQuery ||
        (officer.aliases && officer.aliases.some(a => a.toLowerCase() === lowerQuery))
      ) {
        matched = officer;
        break;
      }
    }
  }

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
  registerOfficer,
};
