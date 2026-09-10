const { supabase } = require('../config/supabase');
const env = require('../config/env');
const crypto = require('crypto');
const farmerService = require('./farmerService');
const notificationService = require('./notificationService');

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

  if (env.smsProvider === 'mock') {
    return {
      message: 'OTP sent successfully (Development Mock Provider).',
      provider: 'mock',
      ...(env.isProduction ? {} : { simulatedOtp: generatedOtp }),
      expiresInMinutes: 10
    };
  }

  // Call the actual notification service
  await notificationService.sendSMS(identifier, `Your Mandi Mitra verification code is ${generatedOtp}. Valid for 10 minutes.`);
  
  return {
    message: 'OTP dispatched successfully to your registered mobile.',
    provider: env.smsProvider,
    expiresInMinutes: 10
  };
}

/**
 * Resolves or creates a Supabase Auth user and returns the UID.
 */
async function resolveOrCreateSupabaseAuthUser({ phone, name }) {
  const formattedPhone = formatE164Phone(phone);
  
  // For the sake of the hackathon, we will generate a UUID for the farmer
  // if we aren't using strict Supabase Auth yet.
  return crypto.randomUUID();
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

  otpStore.delete(identifier);

  // Look up existing farmer in Supabase
  let matchedFarmer = null;

  if (method === 'mobile') {
    const { data } = await supabase.from('farmers').select('*').eq('phone', identifier).single();
    if (data) matchedFarmer = data;
  } else if (method === 'aadhaar') {
    const { data } = await supabase.from('farmers').select('*').eq('aadhaarLast4', identifier.slice(-4)).single();
    if (data) matchedFarmer = data;
  } else if (method === 'farmerId') {
    const { data } = await supabase.from('farmers').select('*').eq('id', identifier).single();
    if (data) matchedFarmer = data;
  }

  if (matchedFarmer) {
    const token = `mock-token-${matchedFarmer.id}`;
    return {
      isNewFarmer: false,
      token,
      farmer: matchedFarmer
    };
  }

  // Case B: New Farmer Registration
  const phoneToUse = (method === 'mobile') ? identifier : (registrationData?.phone || identifier);
  const actualUid = await resolveOrCreateSupabaseAuthUser({
    phone: phoneToUse,
    name: registrationData?.name
  });

  const regPayload = {
    id: actualUid,
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

  const newFarmerProfile = await farmerService.registerFarmer(actualUid, regPayload);

  return {
    isNewFarmer: true,
    token: `mock-token-${actualUid}`,
    farmer: newFarmerProfile,
    message: 'Farmer registered and authenticated successfully.'
  };
}

module.exports = {
  sendOtp,
  verifyOtp
};
