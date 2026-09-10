/**
 * Computes the great-circle distance between two points in kilometers
 * using the Haversine formula.
 * 
 * @param {number} lat1 Latitude of point 1 (degrees)
 * @param {number} lon1 Longitude of point 1 (degrees)
 * @param {number} lat2 Latitude of point 2 (degrees)
 * @param {number} lon2 Longitude of point 2 (degrees)
 * @returns {number} Distance in kilometers, rounded to 1 decimal place
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }

  const toRad = (angle) => (angle * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

module.exports = {
  calculateHaversineDistance
};
