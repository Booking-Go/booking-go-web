/**
 * Forward-geocode a city name using the Nominatim (OpenStreetMap) API.
 * Returns approximate coordinates or `null` when the city cannot be resolved.
 *
 * @param city  - City name to geocode
 * @param state - Indian state/UT the city belongs to (improves accuracy)
 * @returns Coordinates `{ lat, lng }` or `null`
 *
 * @example
 * const coords = await geocodeCity('Thrissur', 'Kerala');
 * // => { lat: 10.527, lng: 76.214 }
 */
export const geocodeCity = async (
  city: string,
  state: string
): Promise<{ lat: number; lng: number } | null> => {
  try {
    const query = encodeURIComponent(`${city}, ${state}, India`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'BookingGo/1.0' },
    });

    if (!res.ok) return null;

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
};
