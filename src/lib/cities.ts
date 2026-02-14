import type { GeoCoords } from './use-geolocation';

/** A pre-defined city with coordinates for manual location selection. */
export interface CityOption {
  name: string;
  state: string;
  coords: GeoCoords;
}

/** Popular Indian cities with their approximate centre coordinates. */
export const POPULAR_CITIES: CityOption[] = [
  { name: 'Mumbai', state: 'Maharashtra', coords: { lat: 19.076, lng: 72.8777 } },
  { name: 'Delhi', state: 'Delhi', coords: { lat: 28.6139, lng: 77.209 } },
  { name: 'Bangalore', state: 'Karnataka', coords: { lat: 12.9716, lng: 77.5946 } },
  { name: 'Hyderabad', state: 'Telangana', coords: { lat: 17.385, lng: 78.4867 } },
  { name: 'Chennai', state: 'Tamil Nadu', coords: { lat: 13.0827, lng: 80.2707 } },
  { name: 'Kolkata', state: 'West Bengal', coords: { lat: 22.5726, lng: 88.3639 } },
  { name: 'Pune', state: 'Maharashtra', coords: { lat: 18.5204, lng: 73.8567 } },
  { name: 'Ahmedabad', state: 'Gujarat', coords: { lat: 23.0225, lng: 72.5714 } },
  { name: 'Jaipur', state: 'Rajasthan', coords: { lat: 26.9124, lng: 75.7873 } },
  { name: 'Lucknow', state: 'Uttar Pradesh', coords: { lat: 26.8467, lng: 80.9462 } },
  { name: 'Chandigarh', state: 'Punjab', coords: { lat: 30.7333, lng: 76.7794 } },
  { name: 'Goa', state: 'Goa', coords: { lat: 15.2993, lng: 74.124 } },
  { name: 'Kochi', state: 'Kerala', coords: { lat: 9.9312, lng: 76.2673 } },
  { name: 'Indore', state: 'Madhya Pradesh', coords: { lat: 22.7196, lng: 75.8577 } },
  { name: 'Nagpur', state: 'Maharashtra', coords: { lat: 21.1458, lng: 79.0882 } },
  { name: 'Bhopal', state: 'Madhya Pradesh', coords: { lat: 23.2599, lng: 77.4126 } },
];
