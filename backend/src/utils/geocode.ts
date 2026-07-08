/**
 * Lightweight city → coordinates lookup for Indian cities.
 *
 * Jobs are posted with a free-text location ("Pune"), but proximity search
 * needs coordinates. Rather than call an external geocoding API on every
 * job post (rate limits, latency, keys), we resolve the common Indian
 * cities this platform serves from a static table.
 *
 * Unknown locations simply get no coordinates — the job still saves and is
 * searchable by text, it just won't appear in radius ("near me") results.
 * Swap this for a real geocoder (Nominatim/Mapbox) later without touching
 * callers: the contract is (location: string) => [lng, lat] | null.
 */
const CITY_COORDS: Record<string, [number, number]> = {
  // [longitude, latitude] — GeoJSON order
  pune: [73.8567, 18.5204],
  mumbai: [72.8777, 19.076],
  delhi: [77.209, 28.6139],
  'new delhi': [77.209, 28.6139],
  'delhi ncr': [77.209, 28.6139],
  bangalore: [77.5946, 12.9716],
  bengaluru: [77.5946, 12.9716],
  hyderabad: [78.4867, 17.385],
  chennai: [80.2707, 13.0827],
  kolkata: [88.3639, 22.5726],
  ahmedabad: [72.5714, 23.0225],
  surat: [72.8311, 21.1702],
  jaipur: [75.7873, 26.9124],
  lucknow: [80.9462, 26.8467],
  kanpur: [80.3319, 26.4499],
  nagpur: [79.0882, 21.1458],
  indore: [75.8577, 22.7196],
  bhopal: [77.4126, 23.2599],
  patna: [85.1376, 25.5941],
  chandigarh: [76.7794, 30.7333],
  kochi: [76.2673, 9.9312],
  coimbatore: [76.9558, 11.0168],
  gurgaon: [77.0266, 28.4595],
  gurugram: [77.0266, 28.4595],
  noida: [77.391, 28.5355],
  thane: [72.9781, 19.2183],
  nashik: [73.7898, 19.9975],
  vadodara: [73.1812, 22.3072],
  visakhapatnam: [83.2185, 17.6868],
};

/**
 * Resolve a location string to GeoJSON [lng, lat], or null if unknown.
 * Tries an exact normalized match first, then a substring match so values
 * like "Pune, Maharashtra" still resolve.
 */
export function geocodeLocation(location?: string): [number, number] | null {
  if (!location) return null;
  const normalized = location.toLowerCase().trim();

  if (CITY_COORDS[normalized]) return CITY_COORDS[normalized];

  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (normalized.includes(city)) return coords;
  }
  return null;
}
