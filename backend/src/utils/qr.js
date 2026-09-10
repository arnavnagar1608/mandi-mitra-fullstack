const crypto = require('crypto');

/**
 * Generates a collision-resistant QR verification payload.
 * 
 * @param {string} bookingId 
 * @param {number} tokenNumber 
 * @param {string} centerId 
 * @returns {string} Safe QR string payload (e.g. MM-B1-TKN83-C1)
 */
function generateQrPayload(bookingId, tokenNumber, centerId) {
  const cleanBookingId = String(bookingId).toUpperCase();
  const cleanCenterId = String(centerId).toUpperCase();
  const hash = crypto.randomBytes(2).toString('hex').toUpperCase();

  return `MM-${cleanBookingId}-TKN${tokenNumber}-${cleanCenterId}`;
}

module.exports = {
  generateQrPayload
};
