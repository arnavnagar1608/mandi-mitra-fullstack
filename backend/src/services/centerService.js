'use strict';

const { supabase } = require('../config/supabase');
const { calculateHaversineDistance } = require('../utils/geo');

const fallbackCenters = [
  {
    id: 'center-001',
    name: 'Indore APMC Main Yard',
    nameHi: 'इंदौर मंडी मुख्य यार्ड',
    district: 'Indore',
    districtHi: 'इंदौर',
    tehsil: 'Sanwer Road',
    tehsilHi: 'सांवेर रोड',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    address: 'Sector A, Sanwer Road Industrial Area, Indore, MP 452015',
    addressHi: 'सेक्टर ए, सांवेर रोड, इंदौर',
    phone: '+91 731 245 8890',
    operatingHours: '08:00 AM - 06:00 PM',
    dailyCapacity: 150,
    currentQueue: 8,
    crowdLevel: 'low',
    status: 'open',
    cropsAccepted: ['wheat', 'chana', 'mustard', 'soybean'],
    latitude: 22.7533,
    longitude: 75.8711,
    currentServingToken: 104,
    todayArrived: 45,
    todayProcessed: 37,
    avgProcessingTime: 14,
  },
  {
    id: 'center-002',
    name: 'Bhopal Krishi Upaj Mandi',
    nameHi: 'भोपाल कृषि उपज मंडी',
    district: 'Bhopal',
    districtHi: 'भोपाल',
    tehsil: 'Karond',
    tehsilHi: 'करोंद',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    address: 'Karond Bypass Road, Bhopal, MP 462038',
    addressHi: 'करोंद बाईपास रोड, भोपाल',
    phone: '+91 755 273 1122',
    operatingHours: '08:00 AM - 06:00 PM',
    dailyCapacity: 120,
    currentQueue: 14,
    crowdLevel: 'moderate',
    status: 'open',
    cropsAccepted: ['wheat', 'chana', 'mustard', 'soybean', 'maize'],
    latitude: 23.2989,
    longitude: 77.4107,
    currentServingToken: 88,
    todayArrived: 52,
    todayProcessed: 38,
    avgProcessingTime: 18,
  },
  {
    id: 'center-003',
    name: 'Ujjain Grain Terminal Depot',
    nameHi: 'उज्जैन अनाज टर्मिनल डिपो',
    district: 'Ujjain',
    districtHi: 'उज्जैन',
    tehsil: 'Maksi Road',
    tehsilHi: 'मक्सी रोड',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    address: 'Maksi Road Warehouse Complex, Ujjain, MP 456006',
    addressHi: 'मक्सी रोड, उज्जैन',
    phone: '+91 734 251 3344',
    operatingHours: '08:30 AM - 05:30 PM',
    dailyCapacity: 100,
    currentQueue: 3,
    crowdLevel: 'low',
    status: 'open',
    cropsAccepted: ['wheat', 'chana', 'soybean'],
    latitude: 23.1824,
    longitude: 75.7952,
    currentServingToken: 42,
    todayArrived: 25,
    todayProcessed: 22,
    avgProcessingTime: 12,
  },
  {
    id: 'center-004',
    name: 'Jabalpur Agri Hub',
    nameHi: 'जबलपुर कृषि हब',
    district: 'Jabalpur',
    districtHi: 'जबलपुर',
    tehsil: 'Vijay Nagar',
    tehsilHi: 'विजय नगर',
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    address: 'Krishi Upaj Mandi, Vijay Nagar, Jabalpur, MP 482002',
    addressHi: 'कृषि उपज मंडी, विजय नगर, जबलपुर',
    phone: '+91 761 268 4400',
    operatingHours: '08:00 AM - 06:00 PM',
    dailyCapacity: 80,
    currentQueue: 22,
    crowdLevel: 'high',
    status: 'busy',
    cropsAccepted: ['wheat', 'rice', 'chana'],
    latitude: 23.1686,
    longitude: 79.9339,
    currentServingToken: 61,
    todayArrived: 65,
    todayProcessed: 43,
    avgProcessingTime: 25,
  }
];

/**
 * Retrieves procurement centers with dynamic geonavigation distance,
 * crop filters, crowd filters, and text search.
 */
async function getAllCenters({ lat, lng, crop, crowd, status, search, district, tehsil } = {}) {
  const userLat = lat !== undefined && lat !== null ? parseFloat(lat) : null;
  const userLng = lng !== undefined && lng !== null ? parseFloat(lng) : null;

  let centers = [...fallbackCenters];

  try {
    const { data, error } = await supabase.from('procurement_centers').select('*');
    if (!error && data && data.length > 0) {
      centers = data.map(c => ({
        id: c.id,
        name: c.name,
        nameHi: c.name_hi,
        district: c.district,
        districtHi: c.district_hi,
        tehsil: c.tehsil,
        tehsilHi: c.tehsil_hi,
        state: c.state,
        stateHi: c.state_hi,
        address: c.address,
        addressHi: c.address_hi,
        phone: c.phone,
        operatingHours: c.operating_hours,
        dailyCapacity: c.daily_capacity,
        currentQueue: c.current_queue,
        crowdLevel: c.crowd_level,
        status: c.is_active ? 'open' : 'closed',
        cropsAccepted: c.crops_accepted || ['wheat', 'chana'],
        latitude: c.latitude,
        longitude: c.longitude,
        currentServingToken: 100 + (c.current_queue || 0),
        todayArrived: (c.current_queue || 0) * 3,
        todayProcessed: (c.current_queue || 0) * 2,
        avgProcessingTime: 15,
      }));
    }
  } catch (err) {
    console.warn('[centerService] Supabase read fallback:', err.message);
  }

  // Filter by Status
  if (status && status !== 'all') {
    centers = centers.filter(c => c.status === status);
  }

  // Dynamic Haversine distance computation
  centers = centers.map(center => {
    let distance = center.distance || null;
    if (userLat !== null && userLng !== null && center.latitude && center.longitude) {
      distance = calculateHaversineDistance(userLat, userLng, center.latitude, center.longitude);
    }
    return {
      ...center,
      distance: distance !== null ? Number(distance.toFixed(1)) : 5.0
    };
  });

  // Filter by District
  if (district && district !== 'all') {
    const dLower = district.trim().toLowerCase();
    centers = centers.filter(c => 
      (c.district && c.district.toLowerCase() === dLower) ||
      (c.districtHi && c.districtHi.includes(district))
    );
  }

  // Filter by Tehsil
  if (tehsil && tehsil !== 'all') {
    const tLower = tehsil.trim().toLowerCase();
    centers = centers.filter(c => 
      (c.tehsil && c.tehsil.toLowerCase() === tLower) ||
      (c.tehsilHi && c.tehsilHi.includes(tehsil)) ||
      (c.address && c.address.toLowerCase().includes(tLower))
    );
  }

  // Filter by crop
  if (crop && crop !== 'all') {
    centers = centers.filter(c => Array.isArray(c.cropsAccepted) && c.cropsAccepted.includes(crop));
  }

  // Filter by crowd level
  if (crowd && crowd !== 'all') {
    centers = centers.filter(c => c.crowdLevel === crowd);
  }

  // Search filter
  if (search && search.trim().length > 0) {
    const q = search.trim().toLowerCase();
    centers = centers.filter(c => 
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.nameHi && c.nameHi.includes(q)) ||
      (c.district && c.district.toLowerCase().includes(q)) ||
      (c.districtHi && c.districtHi.includes(q)) ||
      (c.tehsil && c.tehsil.toLowerCase().includes(q)) ||
      (c.tehsilHi && c.tehsilHi.includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  }

  // Sort by nearest first if coordinates provided
  if (userLat !== null && userLng !== null) {
    centers.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  return centers;
}

/**
 * Retrieves single center by ID.
 */
async function getCenterById(centerId) {
  const centers = await getAllCenters();
  const center = centers.find(c => c.id === centerId);
  if (!center) {
    const error = new Error(`Procurement center '${centerId}' not found.`);
    error.statusCode = 404;
    error.code = 'CENTER_NOT_FOUND';
    throw error;
  }
  return center;
}

/**
 * Retrieves live queue telemetry for a center.
 */
async function getCenterQueueTelemetry(centerId) {
  const center = await getCenterById(centerId);
  return {
    centerId: center.id,
    name: center.name,
    nameHi: center.nameHi,
    status: center.status,
    crowdLevel: center.crowdLevel,
    currentServingToken: center.currentServingToken || 0,
    currentQueue: center.currentQueue || 0,
    todayArrived: center.todayArrived || 0,
    todayProcessed: center.todayProcessed || 0,
    avgProcessingTime: center.avgProcessingTime || 15,
    dailyCapacity: center.dailyCapacity
  };
}

module.exports = {
  getAllCenters,
  getCenterById,
  getCenterQueueTelemetry
};
