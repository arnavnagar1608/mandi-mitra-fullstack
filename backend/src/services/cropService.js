'use strict';

const { supabase } = require('../config/supabase');

const fallbackCrops = [
  { id: 'wheat', type: 'wheat', nameEn: 'Wheat', nameHi: 'गेहूं', mspRate: 2275, season: 'Rabi', seasonHi: 'रबी', color: '#D4912A' },
  { id: 'rice', type: 'rice', nameEn: 'Rice', nameHi: 'धान', mspRate: 2320, season: 'Kharif', seasonHi: 'खरीफ', color: '#14532d' },
  { id: 'mustard', type: 'mustard', nameEn: 'Mustard', nameHi: 'सरसों', mspRate: 5650, season: 'Rabi', seasonHi: 'रबी', color: '#E8A94D' },
  { id: 'chana', type: 'chana', nameEn: 'Gram (Chana)', nameHi: 'चना', mspRate: 5440, season: 'Rabi', seasonHi: 'रबी', color: '#C4956A' },
  { id: 'maize', type: 'maize', nameEn: 'Maize', nameHi: 'मक्का', mspRate: 2090, season: 'Kharif', seasonHi: 'खरीफ', color: '#D4C12A' },
  { id: 'soybean', type: 'soybean', nameEn: 'Soybean', nameHi: 'सोयाबीन', mspRate: 4892, season: 'Kharif', seasonHi: 'खरीफ', color: '#8BA85B' },
  { id: 'cotton', type: 'cotton', nameEn: 'Cotton', nameHi: 'कपास', mspRate: 7121, season: 'Kharif', seasonHi: 'खरीफ', color: '#E8E0D0' },
  { id: 'sugarcane', type: 'sugarcane', nameEn: 'Sugarcane', nameHi: 'गन्ना', mspRate: 340, season: 'Annual', seasonHi: 'वार्षिक', color: '#0f3d21' },
];

/**
 * Get all crops (reference data, public).
 */
async function getAllCrops() {
  try {
    const { data, error } = await supabase.from('crops').select('*');
    if (!error && data && data.length > 0) {
      return data.map(c => ({
        id: c.id,
        type: c.id,
        nameEn: c.name_en,
        nameHi: c.name_hi,
        mspRate: Number(c.msp_rate),
        season: c.season,
        seasonHi: c.season_hi,
        color: c.color,
      })).sort((a, b) => a.nameEn.localeCompare(b.nameEn));
    }
  } catch (err) {
    console.warn('[cropService] Supabase read fallback:', err.message);
  }

  return [...fallbackCrops].sort((a, b) => a.nameEn.localeCompare(b.nameEn));
}

/**
 * Get a single crop by ID.
 */
async function getCropById(cropId) {
  try {
    const { data, error } = await supabase.from('crops').select('*').eq('id', cropId).single();
    if (!error && data) {
      return {
        id: data.id,
        type: data.id,
        nameEn: data.name_en,
        nameHi: data.name_hi,
        mspRate: Number(data.msp_rate),
        season: data.season,
        seasonHi: data.season_hi,
        color: data.color,
      };
    }
  } catch (err) {
    // continue to fallback
  }

  const found = fallbackCrops.find(c => c.id === cropId || c.type === cropId);
  if (!found) {
    const err = new Error('Crop not found');
    err.statusCode = 404;
    throw err;
  }
  return found;
}

module.exports = { getAllCrops, getCropById };
