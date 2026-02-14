'use client';

import { useState, useCallback, useEffect } from 'react';

/** Coordinates returned by the geolocation hook. */
export interface GeoCoords {
  lat: number;
  lng: number;
}

/** Status of the geolocation request. */
export type GeoStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable';

/** Return type for the useGeolocation hook. */
export interface UseGeolocationReturn {
  coords: GeoCoords | null;
  status: GeoStatus;
  cityName: string | null;
  requestLocation: () => void;
  clearLocation: () => void;
  setCityManually: (city: string, coords?: GeoCoords) => void;
}

const STORAGE_KEY = 'booking-go-location';

/**
 * Hook that wraps the browser Geolocation API with caching and reverse geocoding.
 * Persists granted location to localStorage so users aren't re-prompted on every visit.
 */
export const useGeolocation = (): UseGeolocationReturn => {
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [cityName, setCityName] = useState<string | null>(null);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { coords: GeoCoords; city: string };
        setCoords(parsed.coords);
        setCityName(parsed.city);
        setStatus('granted');
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  /** Reverse geocode coordinates to a city name using the free Nominatim API. */
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.suburb ||
        data.address?.county ||
        'Your area';
      return city;
    } catch {
      return 'Your area';
    }
  }, []);

  /** Persist location to localStorage. */
  const persistLocation = useCallback((c: GeoCoords, city: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ coords: c, city }));
    } catch {
      // Ignore quota errors
    }
  }, []);

  /** Prompt the browser for geolocation permission. */
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      return;
    }

    setStatus('loading');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const c: GeoCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(c);
        setStatus('granted');

        const city = await reverseGeocode(c.lat, c.lng);
        setCityName(city);
        persistLocation(c, city);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('denied');
        } else {
          setStatus('unavailable');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, [reverseGeocode, persistLocation]);

  /** Clear stored location. */
  const clearLocation = useCallback(() => {
    setCoords(null);
    setCityName(null);
    setStatus('idle');
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /** Set a city manually (from search/dropdown). */
  const setCityManually = useCallback(
    (city: string, manualCoords?: GeoCoords) => {
      setCityName(city);
      if (manualCoords) {
        setCoords(manualCoords);
        setStatus('granted');
        persistLocation(manualCoords, city);
      }
    },
    [persistLocation]
  );

  return { coords, status, cityName, requestLocation, clearLocation, setCityManually };
};
