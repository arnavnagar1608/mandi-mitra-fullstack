const { supabase } = require('../config/supabase');

/**
 * Retrieves the authenticated farmer's profile.
 */
async function getFarmerProfile(uid) {
  const { data: farmer, error } = await supabase.from('farmers').select('*').eq('id', uid).single();
  if (error || !farmer) {
    const err = new Error('Farmer profile not found. Please complete registration.');
    err.statusCode = 404;
    err.code = 'FARMER_NOT_FOUND';
    throw err;
  }
  return farmer;
}

/**
 * Registers a new farmer.
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

  // Check if farmer already exists by ID
  const { data: existingFarmer } = await supabase.from('farmers').select('*').eq('id', uid).single();
  if (existingFarmer) {
    return existingFarmer;
  }

  // Check if phone exists
  const { data: phoneCheck } = await supabase.from('farmers').select('id').eq('phone', phone).single();
  if (phoneCheck && phoneCheck.id !== uid) {
    const error = new Error(`Phone number ${phone} is already linked to another farmer account.`);
    error.statusCode = 409;
    error.code = 'PHONE_ALREADY_EXISTS';
    throw error;
  }

  const profile = {
    id: uid,
    name,
    name_hi: data.nameHi || name,
    phone,
    village: village || 'Gram Panchayat',
    village_hi: data.villageHi || village || 'ग्राम पंचायत',
    district: district || 'Bhopal',
    district_hi: data.districtHi || district || 'भोपाल',
    state,
    state_hi: data.stateHi || (state === 'Punjab' ? 'पंजाब' : 'मध्य प्रदेश'),
    aadhaar_last4: cleanLast4,
    farmer_id: generatedFarmerId,
    bank_name: data.bankName || 'State Bank of India',
    account_last4: data.accountLast4 || '7890',
    photo: data.photo || '/images/farmers/farmer1.jpg',
    language_pref: languagePref,
  };

  const { data: insertedFarmer, error: insertError } = await supabase.from('farmers').insert([profile]).select().single();
  
  if (insertError) {
    const error = new Error(`Failed to register farmer: ${insertError.message}`);
    error.statusCode = 500;
    throw error;
  }

  // Create welcome notification
  await supabase.from('notifications').insert([{
    farmer_id: uid,
    title: 'Welcome to Mandi Mitra',
    title_hi: 'मंडी मित्र में आपका स्वागत है',
    message: 'Your farmer registration has been verified. You can now book procurement slots and track queues live.',
    message_hi: 'आपका किसान पंजीकरण सत्यापित हो गया है। अब आप खरीद स्लॉट बुक कर सकते हैं व लाइव कतार ट्रैक कर सकते हैं।',
    type: 'success',
    read: false
  }]);

  return insertedFarmer;
}

/**
 * Updates editable farmer profile details.
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

  const allowedUpdates = {};
  const allowedFieldsMap = {
    name: 'name', nameHi: 'name_hi', village: 'village', villageHi: 'village_hi',
    district: 'district', districtHi: 'district_hi', bankName: 'bank_name',
    accountLast4: 'account_last4', languagePref: 'language_pref', photo: 'photo'
  };
  
  Object.keys(allowedFieldsMap).forEach(f => {
    if (data[f] !== undefined) allowedUpdates[allowedFieldsMap[f]] = data[f];
  });

  const { data: updatedDoc, error } = await supabase.from('farmers').update(allowedUpdates).eq('id', uid).select().single();
  
  if (error || !updatedDoc) {
    const err = new Error('Farmer profile not found or update failed.');
    err.statusCode = 404;
    err.code = 'UPDATE_FAILED';
    throw err;
  }

  return updatedDoc;
}

/**
 * Lists notifications for the authenticated farmer.
 */
async function getFarmerNotifications(uid) {
  const { data, error } = await supabase.from('notifications')
    .select('*')
    .eq('farmer_id', uid)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return [];
  return data;
}

/**
 * Marks a notification as read.
 */
async function markNotificationRead(uid, notifId) {
  const { data, error } = await supabase.from('notifications')
    .update({ read: true })
    .eq('id', notifId)
    .eq('farmer_id', uid)
    .select()
    .single();

  if (error || !data) {
    const err = new Error('Notification not found.');
    err.statusCode = 404;
    err.code = 'NOTIFICATION_NOT_FOUND';
    throw err;
  }

  return { id: notifId, read: true };
}

module.exports = {
  getFarmerProfile,
  registerFarmer,
  updateFarmerProfile,
  getFarmerNotifications,
  markNotificationRead
};
