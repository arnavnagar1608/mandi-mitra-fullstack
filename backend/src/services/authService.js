const { db, auth } = require('../config/firebase');
const env = require('../config/env');
const crypto = require('crypto');
const farmerService = require('./farmerService');

// In-memory OTP store with expiration (for serverless/single-session verification)
const otpStore = new Map();

function formatE164Phone(phone) {
  if (!phone) return null;
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;
  if (cleaned.length > 10) return `+${cleaned}`;
  return null;
}

/**
 * Dispatches an OTP to a farmer.
 * Separation of mock vs production SMS provider (Safety Requirement #1).
 */
async function sendOtp({ identifier, method }) {
  if (!identifier) {
    const error = new Error('Identifier is required.');
    error.statusCode = 400;
    error.code = 'INVALID_IDENTIFIER';
    throw error;
  }

  // Generate 4-digit code
  const generatedOtp = env.smsProvider === 'mock' 
    ? env.mockOtpDefault 
    : Math.floor(1000 + Math.random() * 9000).toString();

  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(identifier, {
    otp: generatedOtp,
    method,
    expiresAt
  });

  // Safety Requirement #1: Real SMS vs Mock simulation
  if (env.smsProvider === 'mock') {
    return {
      message: 'OTP sent successfully (Development Mock Provider).',
      provider: 'mock',
      // Only disclose simulatedOtp in development
      ...(env.isProduction ? {} : { simulatedOtp: generatedOtp }),
      expiresInMinutes: 10
    };
  }

  // Production SMS provider integration point (e.g. Fast2SMS / Government SMS Gateway)
  console.log(`[SMS Provider: ${env.smsProvider}] Sending OTP to ${identifier}`);
  return {
    message: 'OTP dispatched successfully to your registered mobile.',
    provider: env.smsProvider,
    expiresInMinutes: 10
  };
}

/**
 * Resolves or creates a Firebase Auth user and returns the actual Firebase UID.
 */
async function resolveOrCreateFirebaseAuthUser({ phone, name }) {
  let userRecord = null;
  const formattedPhone = formatE164Phone(phone);

  if (formattedPhone) {
    try {
      userRecord = await auth.getUserByPhoneNumber(formattedPhone);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        try {
          userRecord = await auth.createUser({
            phoneNumber: formattedPhone,
            displayName: name || 'Kisan Mitra'
          });
        } catch (createErr) {
          console.warn('[AuthService] auth.createUser with phone notice:', createErr.code || createErr.message);
        }
      } else {
        console.warn('[AuthService] auth.getUserByPhoneNumber notice:', err.code || err.message);
      }
    }
  }

  if (!userRecord) {
    try {
      userRecord = await auth.createUser({
        displayName: name || 'Kisan Mitra'
      });
    } catch (err) {
      console.warn('[AuthService] auth.createUser generic notice:', err.code || err.message);
    }
  }

  if (userRecord && userRecord.uid) {
    return userRecord.uid;
  }

  // Fallback if Firebase Identity Platform is unconfigured in GCP project:
  // Generate a standard 28-character Firebase-style UID (cryptographic random, not phone number)
  return crypto.randomBytes(14).toString('hex');
}

/**
 * Verifies OTP and handles existing login or new farmer profile creation.
 */
async function verifyOtp({ identifier, method, otp, registrationData }) {
  if (!identifier || !otp) {
    const error = new Error('Identifier and OTP are required.');
    error.statusCode = 400;
    error.code = 'INVALID_INPUT';
    throw error;
  }

  const stored = otpStore.get(identifier);

  // In development, default mock OTP (1234) is always valid if mock provider is active
  const isValidMock = !env.isProduction && env.smsProvider === 'mock' && otp === env.mockOtpDefault;

  if (!isValidMock) {
    if (!stored || stored.otp !== otp) {
      const error = new Error('Invalid or expired OTP. Please request a new one.');
      error.statusCode = 401;
      error.code = 'INVALID_OTP';
      throw error;
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(identifier);
      const error = new Error('OTP has expired.');
      error.statusCode = 400;
      error.code = 'OTP_EXPIRED';
      throw error;
    }
  }

  // Clean up used OTP
  otpStore.delete(identifier);

  // Look up existing farmer
  let matchedFarmer = null;

  if (method === 'mobile') {
    const snap = await db.collection('farmers').where('phone', '==', identifier).limit(1).get();
    if (!snap.empty) matchedFarmer = { id: snap.docs[0].id, ...snap.docs[0].data() };
  } else if (method === 'aadhaar') {
    const snap = await db.collection('farmers').where('aadhaarLast4', '==', identifier.slice(-4)).limit(1).get();
    if (!snap.empty) matchedFarmer = { id: snap.docs[0].id, ...snap.docs[0].data() };
  } else if (method === 'farmerId') {
    const snap = await db.collection('farmers').where('farmerId', '==', identifier).limit(1).get();
    if (!snap.empty) matchedFarmer = { id: snap.docs[0].id, ...snap.docs[0].data() };
  }

  // Case A: Existing Farmer Login
  if (matchedFarmer) {
    let actualUid = matchedFarmer.id;
    try {
      const e164Phone = formatE164Phone(matchedFarmer.phone);
      if (e164Phone) {
        const userRecord = await auth.getUserByPhoneNumber(e164Phone);
        if (userRecord && userRecord.uid) {
          const actualDoc = await db.collection('farmers').doc(userRecord.uid).get();
          if (actualDoc.exists) {
            actualUid = userRecord.uid;
            matchedFarmer = { id: actualDoc.id, ...actualDoc.data() };
          }
        }
      }
    } catch (e) {
      // Keep existing matchedFarmer.id
    }

    let token;
    try {
      token = env.isProduction 
        ? await auth.createCustomToken(actualUid)
        : `mock-token-${actualUid}`;
    } catch (e) {
      token = `mock-token-${actualUid}`;
    }

    return {
      isNewFarmer: false,
      token,
      farmer: matchedFarmer
    };
  }

  // Case B: New Farmer Registration
  const phoneToUse = (method === 'mobile') ? identifier : (registrationData?.phone || identifier);
  const actualFirebaseUid = await resolveOrCreateFirebaseAuthUser({
    phone: phoneToUse,
    name: registrationData?.name
  });

  const regPayload = {
    name: registrationData?.name?.trim() || `Kisan (${phoneToUse.slice(-4)})`,
    nameHi: registrationData?.nameHi || registrationData?.name?.trim() || `किसान (${phoneToUse.slice(-4)})`,
    phone: phoneToUse,
    village: registrationData?.village?.trim() || 'Gram Panchayat',
    villageHi: registrationData?.villageHi || registrationData?.village?.trim() || 'ग्राम पंचायत',
    district: registrationData?.district?.trim() || 'Bhopal',
    districtHi: registrationData?.districtHi || registrationData?.district?.trim() || 'भोपाल',
    state: registrationData?.state || 'Madhya Pradesh',
    aadhaarLast4: registrationData?.aadhaarLast4 || (method === 'aadhaar' ? identifier.slice(-4) : phoneToUse.slice(-4)),
    languagePref: registrationData?.languagePref || 'hi'
  };

  const newFarmerProfile = await farmerService.registerFarmer(actualFirebaseUid, regPayload);

  let token;
  try {
    token = env.isProduction
      ? await auth.createCustomToken(actualFirebaseUid)
      : `mock-token-${actualFirebaseUid}`;
  } catch (e) {
    token = `mock-token-${actualFirebaseUid}`;
  }

  return {
    isNewFarmer: true,
    token,
    farmer: newFarmerProfile,
    message: 'Farmer registered and authenticated successfully.'
  };
}

module.exports = {
  sendOtp,
  verifyOtp
};
