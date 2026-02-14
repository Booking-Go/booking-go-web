/**
 * Forward-geocoding via Nominatim (OpenStreetMap).
 *
 * Production considerations:
 * - Request timeout via AbortController (prevents hanging UI)
 * - In-memory cache to avoid redundant API calls for the same query
 * - Input sanitisation & validation
 * - Structured result validation (lat/lng range checks)
 * - Rate-limit-safe: Nominatim allows max 1 req/sec; callers should debounce
 * - User-Agent header required by Nominatim ToS
 *
 * @module geocode
 */

/** Geocoding result coordinates. */
export interface GeoResult {
  lat: number;
  lng: number;
}

/** Maximum time (ms) to wait for a Nominatim response. */
const REQUEST_TIMEOUT_MS = 5_000;

/** Simple in-memory cache keyed by normalised query string. */
const geocodeCache = new Map<string, GeoResult | null>();

/** Max cache size to prevent unbounded memory growth. */
const MAX_CACHE_SIZE = 200;

/**
 * Normalise a query string for consistent cache hits.
 * Strips excess whitespace and lowercases.
 */
const normaliseKey = (city: string, state: string): string =>
  `${city.trim().toLowerCase()}|${state.trim().toLowerCase()}`;

/**
 * Validates that coordinates fall within physically possible ranges.
 *
 * @param lat - Latitude value
 * @param lng - Longitude value
 * @returns Whether the coordinates are valid
 */
const isValidCoord = (lat: number, lng: number): boolean =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180;

/**
 * Forward-geocode a city name using the Nominatim (OpenStreetMap) API.
 * Returns approximate coordinates or `null` when the city cannot be resolved.
 *
 * Results are cached in-memory to avoid redundant network calls within the
 * same session. Failed lookups are also cached (as `null`) to prevent
 * repeated requests for non-existent locations.
 *
 * @param city  - City name to geocode (must be non-empty after trimming)
 * @param state - Indian state/UT the city belongs to (improves accuracy)
 * @returns Coordinates `{ lat, lng }` or `null` if unresolvable
 *
 * @example
 * const coords = await geocodeCity('Thrissur', 'Kerala');
 * // => { lat: 10.527, lng: 76.214 }
 *
 * @example
 * const coords = await geocodeCity('  ', 'Kerala');
 * // => null (empty input)
 */
export const geocodeCity = async (city: string, state: string): Promise<GeoResult | null> => {
  // ── Input validation ──
  const trimmedCity = city.trim();
  const trimmedState = state.trim();
  if (!trimmedCity || !trimmedState) return null;

  // ── Cache lookup ──
  const cacheKey = normaliseKey(trimmedCity, trimmedState);
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) ?? null;
  }

  // ── Network request with timeout ──
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const query = encodeURIComponent(`${trimmedCity}, ${trimmedState}, India`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=in`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'BookingGo/1.0 (https://booking.go)',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const data: unknown = await res.json();

    // ── Response validation ──
    if (!Array.isArray(data) || data.length === 0) {
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const first = data[0] as Record<string, unknown>;
    const lat = parseFloat(String(first.lat));
    const lng = parseFloat(String(first.lon));

    if (!isValidCoord(lat, lng)) {
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const result: GeoResult = { lat, lng };

    // ── Cache write (with eviction) ──
    if (geocodeCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = geocodeCache.keys().next().value;
      if (oldestKey !== undefined) geocodeCache.delete(oldestKey);
    }
    geocodeCache.set(cacheKey, result);

    return result;
  } catch {
    // AbortError (timeout), network failure, JSON parse error — all return null
    geocodeCache.set(cacheKey, null);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};
