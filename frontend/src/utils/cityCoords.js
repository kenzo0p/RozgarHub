/**
 * Coordinates for major Indian cities — used to render the job-location
 * map on the details page. Jobs store location as free text, so we map
 * known city names to coordinates client-side (no geocoding API needed).
 *
 * Unknown locations fall back to an "Open in Maps" link instead of a map.
 */
const CITY_COORDS = {
  pune: { lat: 18.5204, lng: 73.8567 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  "new delhi": { lat: 28.6139, lng: 77.209 },
  "delhi ncr": { lat: 28.6139, lng: 77.209 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  surat: { lat: 21.1702, lng: 72.8311 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  lucknow: { lat: 26.8467, lng: 80.9462 },
  kanpur: { lat: 26.4499, lng: 80.3319 },
  nagpur: { lat: 21.1458, lng: 79.0882 },
  indore: { lat: 22.7196, lng: 75.8577 },
  bhopal: { lat: 23.2599, lng: 77.4126 },
  patna: { lat: 25.5941, lng: 85.1376 },
  chandigarh: { lat: 30.7333, lng: 76.7794 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  gurgaon: { lat: 28.4595, lng: 77.0266 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  noida: { lat: 28.5355, lng: 77.391 },
  thane: { lat: 19.2183, lng: 72.9781 },
  nashik: { lat: 19.9975, lng: 73.7898 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
  visakhapatnam: { lat: 17.6868, lng: 83.2185 },
};

/**
 * Look up coordinates for a location string. Tries an exact (normalized)
 * match first, then checks whether any known city name appears within the
 * string (handles values like "Pune, Maharashtra").
 *
 * @param {string} location
 * @returns {{lat: number, lng: number} | null}
 */
export function getCityCoords(location) {
  if (!location) return null;
  const normalized = location.toLowerCase().trim();

  if (CITY_COORDS[normalized]) return CITY_COORDS[normalized];

  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (normalized.includes(city)) return coords;
  }
  return null;
}
