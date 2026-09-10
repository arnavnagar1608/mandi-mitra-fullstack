const { db } = require('../config/firebase');
const admin = require('firebase-admin');

/**
 * Retrieves the authenticated farmer's profile.
 */
async function getFarmerProfile(uid) {
  const doc = await db.collection('farmers').doc(uid).get();
  if (!doc.exists) {
    const error = new Error('Farmer profile not found. Please complete registration.');
    error.statusCode = 404;
    error.code = 'FARMER_NOT_FOUND';
    throw error;
  }
  return { id: doc.id, ...doc.data() };
}

/**
 * Registers a new farmer using transaction-safe uniqueness locks.
 */
async function registerFarmer(uid, data) {
  const { name, phone, village, district, state = 'Madhya Pradesh', aadhaarLast4, languagePref = 'hi' } = data;

  if (!phone || !name) {
    const error = new Error('Name and phone number are required for registration.');
    error.statusCode = 400;
    error.code = 'INVALID_INPUT';
    throw error;
  }

  const cleanLast4 = aadhaarLast4 ? String(aadhaarLast4).slice(-4) : phone.slice(-4);
  const statePrefix = (state.toLowerCase().includes('punjab') ? 'PB' : 'MP');
  const generatedFarmerId = `${statePrefix}-KISAN-${cleanLast4}`;

  const phoneLockRef = db.collection('unique_phones').doc(phone);
  const farmerIdLockRef = db.collection('unique_farmer_ids').doc(generatedFarmerId);
  const farmerRef = db.collection('farmers').doc(uid);

  return await db.runTransaction(async (transaction) => {
    // 1. Check uniqueness lock documents
    const phoneSnap = await transaction.get(phoneLockRef);
    if (phoneSnap.exists && phoneSnap.data().uid !== uid) {
      const error = new Error(`Phone number ${phone} is already linked to another farmer account.`);
      error.statusCode = 409;
      error.code = 'PHONE_ALREADY_EXISTS';
      throw error;
    }

    const farmerIdSnap = await transaction.get(farmerIdLockRef);
    if (farmerIdSnap.exists && farmerIdSnap.data().uid !== uid) {
      const error = new Error(`Kisan Farmer ID ${generatedFarmerId} is already registered.`);
      error.statusCode = 409;
      error.code = 'FARMER_ID_ALREADY_EXISTS';
      throw error;
    }

    const farmerSnap = await transaction.get(farmerRef);
    if (farmerSnap.exists) {
      return { id: farmerSnap.id, ...farmerSnap.data() };
    }

    const now = admin.firestore.FieldValue.serverTimestamp();

    // 2. Set uniqueness locks
    transaction.set(phoneLockRef, { uid, phone, createdAt: now });
    transaction.set(farmerIdLockRef, { uid, farmerId: generatedFarmerId, createdAt: now });

    // 3. Create farmer profile
    const profile = {
      id: uid,
      name,
      nameHi: data.nameHi || name,
      phone,
      village: village || 'Gram Panchayat',
      villageHi: data.villageHi || village || 'ग्राम पंचायत',
      district: district || 'Bhopal',
      districtHi: data.districtHi || district || 'भोपाल',
      state,
      stateHi: data.stateHi || (state === 'Punjab' ? 'पंजाब' : 'मध्य प्रदेश'),
      aadhaarLast4: cleanLast4,
      farmerId: generatedFarmerId,
      bankName: data.bankName || 'State Bank of India',
      accountLast4: data.accountLast4 || '7890',
      photo: data.photo || '/images/farmers/farmer1.jpg',
      languagePref,
      registeredAt: now,
      updatedAt: now
    };

    transaction.set(farmerRef, profile);

    // 4. Create welcome notification
    const notifRef = farmerRef.collection('notifications').doc('welcome');
    transaction.set(notifRef, {
      id: 'welcome',
      farmerId: uid,
      title: 'Welcome to Mandi Mitra',
      titleHi: 'मंडी मित्र में आपका स्वागत है',
      message: 'Your farmer registration has been verified. You can now book procurement slots and track queues live.',
      messageHi: 'आपका किसान पंजीकरण सत्यापित हो गया है। अब आप खरीद स्लॉट बुक कर सकते हैं व लाइव कतार ट्रैक कर सकते हैं।',
      type: 'success',
      read: false,
      createdAt: now
    });

    return profile;
  });
}

/**
 * Updates editable farmer profile details.
 * Prevents modifying immutable identifiers (id, aadhaarLast4, farmerId).
 */
async function updateFarmerProfile(uid, data) {
  const immutableKeys = ['id', 'aadhaarLast4', 'farmerId', 'registeredAt'];
  for (const key of immutableKeys) {
    if (data[key] !== undefined) {
      const error = new Error(`Field '${key}' is immutable and cannot be modified.`);
      error.statusCode = 400;
      error.code = 'IMMUTABLE_FIELD';
      throw error;
    }
  }

  const farmerRef = db.collection('farmers').doc(uid);
  const snap = await farmerRef.get();
  if (!snap.exists) {
    const error = new Error('Farmer profile not found.');
    error.statusCode = 404;
    error.code = 'FARMER_NOT_FOUND';
    throw error;
  }

  const allowedUpdates = {};
  const allowedFields = ['name', 'nameHi', 'village', 'villageHi', 'district', 'districtHi', 'bankName', 'accountLast4', 'languagePref', 'photo'];
  
  allowedFields.forEach(f => {
    if (data[f] !== undefined) allowedUpdates[f] = data[f];
  });

  allowedUpdates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

  await farmerRef.update(allowedUpdates);

  const updatedDoc = await farmerRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

/**
 * Lists notifications for the authenticated farmer.
 */
async function getFarmerNotifications(uid) {
  const snap = await db.collection('farmers').doc(uid).collection('notifications')
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Marks a notification as read.
 */
async function markNotificationRead(uid, notifId) {
  const ref = db.collection('farmers').doc(uid).collection('notifications').doc(notifId);
  const snap = await ref.get();
  if (!snap.exists) {
    const error = new Error('Notification not found.');
    error.statusCode = 404;
    error.code = 'NOTIFICATION_NOT_FOUND';
    throw error;
  }

  await ref.update({ read: true });
  return { id: notifId, read: true };
}

module.exports = {
  getFarmerProfile,
  registerFarmer,
  updateFarmerProfile,
  getFarmerNotifications,
  markNotificationRead
};
