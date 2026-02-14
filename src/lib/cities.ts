import type { GeoCoords } from './use-geolocation';

/** A city with coordinates for manual location selection. */
export interface CityOption {
  name: string;
  state: string;
  coords: GeoCoords;
}

/** A state containing its cities. */
export interface StateOption {
  name: string;
  cities: Omit<CityOption, 'state'>[];
}

/**
 * Indian states/UTs with their major cities and approximate centre coordinates.
 * Sorted alphabetically by state name.
 */
export const STATES_AND_CITIES: StateOption[] = [
  {
    name: 'Andhra Pradesh',
    cities: [
      { name: 'Visakhapatnam', coords: { lat: 17.6868, lng: 83.2185 } },
      { name: 'Vijayawada', coords: { lat: 16.5062, lng: 80.648 } },
      { name: 'Guntur', coords: { lat: 16.3067, lng: 80.4365 } },
      { name: 'Tirupati', coords: { lat: 13.6288, lng: 79.4192 } },
      { name: 'Nellore', coords: { lat: 14.4426, lng: 79.9865 } },
      { name: 'Kakinada', coords: { lat: 16.9891, lng: 82.2475 } },
      { name: 'Rajahmundry', coords: { lat: 17.0005, lng: 81.804 } },
      { name: 'Kurnool', coords: { lat: 15.8281, lng: 78.0373 } },
    ],
  },
  {
    name: 'Arunachal Pradesh',
    cities: [
      { name: 'Itanagar', coords: { lat: 27.0844, lng: 93.6053 } },
      { name: 'Naharlagun', coords: { lat: 27.1045, lng: 93.6927 } },
    ],
  },
  {
    name: 'Assam',
    cities: [
      { name: 'Guwahati', coords: { lat: 26.1445, lng: 91.7362 } },
      { name: 'Silchar', coords: { lat: 24.8333, lng: 92.7789 } },
      { name: 'Dibrugarh', coords: { lat: 27.4728, lng: 94.912 } },
      { name: 'Jorhat', coords: { lat: 26.7509, lng: 94.2037 } },
      { name: 'Tezpur', coords: { lat: 26.6338, lng: 92.8006 } },
    ],
  },
  {
    name: 'Bihar',
    cities: [
      { name: 'Patna', coords: { lat: 25.6093, lng: 85.1376 } },
      { name: 'Gaya', coords: { lat: 24.7955, lng: 84.9994 } },
      { name: 'Muzaffarpur', coords: { lat: 26.1209, lng: 85.3647 } },
      { name: 'Bhagalpur', coords: { lat: 25.2425, lng: 86.9842 } },
      { name: 'Darbhanga', coords: { lat: 26.1542, lng: 85.8918 } },
      { name: 'Purnia', coords: { lat: 25.7771, lng: 87.4753 } },
    ],
  },
  {
    name: 'Chandigarh',
    cities: [{ name: 'Chandigarh', coords: { lat: 30.7333, lng: 76.7794 } }],
  },
  {
    name: 'Chhattisgarh',
    cities: [
      { name: 'Raipur', coords: { lat: 21.2514, lng: 81.6296 } },
      { name: 'Bhilai', coords: { lat: 21.2094, lng: 81.3784 } },
      { name: 'Bilaspur', coords: { lat: 22.0797, lng: 82.1409 } },
      { name: 'Durg', coords: { lat: 21.1904, lng: 81.2849 } },
      { name: 'Korba', coords: { lat: 22.3595, lng: 82.7501 } },
    ],
  },
  {
    name: 'Delhi',
    cities: [
      { name: 'New Delhi', coords: { lat: 28.6139, lng: 77.209 } },
      { name: 'Dwarka', coords: { lat: 28.5921, lng: 77.046 } },
      { name: 'Rohini', coords: { lat: 28.7495, lng: 77.0565 } },
      { name: 'Saket', coords: { lat: 28.5244, lng: 77.2066 } },
      { name: 'Connaught Place', coords: { lat: 28.6315, lng: 77.2167 } },
    ],
  },
  {
    name: 'Goa',
    cities: [
      { name: 'Panaji', coords: { lat: 15.4989, lng: 73.8278 } },
      { name: 'Margao', coords: { lat: 15.2832, lng: 73.9862 } },
      { name: 'Vasco da Gama', coords: { lat: 15.3982, lng: 73.8113 } },
      { name: 'Mapusa', coords: { lat: 15.5916, lng: 73.8087 } },
    ],
  },
  {
    name: 'Gujarat',
    cities: [
      { name: 'Ahmedabad', coords: { lat: 23.0225, lng: 72.5714 } },
      { name: 'Surat', coords: { lat: 21.1702, lng: 72.8311 } },
      { name: 'Vadodara', coords: { lat: 22.3072, lng: 73.1812 } },
      { name: 'Rajkot', coords: { lat: 22.3039, lng: 70.8022 } },
      { name: 'Gandhinagar', coords: { lat: 23.2156, lng: 72.6369 } },
      { name: 'Bhavnagar', coords: { lat: 21.7645, lng: 72.1519 } },
      { name: 'Junagadh', coords: { lat: 21.5222, lng: 70.4579 } },
    ],
  },
  {
    name: 'Haryana',
    cities: [
      { name: 'Gurugram', coords: { lat: 28.4595, lng: 77.0266 } },
      { name: 'Faridabad', coords: { lat: 28.4089, lng: 77.3178 } },
      { name: 'Panipat', coords: { lat: 29.3909, lng: 76.9635 } },
      { name: 'Ambala', coords: { lat: 30.3782, lng: 76.7767 } },
      { name: 'Karnal', coords: { lat: 29.6857, lng: 76.9905 } },
      { name: 'Hisar', coords: { lat: 29.1492, lng: 75.7217 } },
      { name: 'Rohtak', coords: { lat: 28.8955, lng: 76.6066 } },
    ],
  },
  {
    name: 'Himachal Pradesh',
    cities: [
      { name: 'Shimla', coords: { lat: 31.1048, lng: 77.1734 } },
      { name: 'Manali', coords: { lat: 32.2396, lng: 77.1887 } },
      { name: 'Dharamshala', coords: { lat: 32.219, lng: 76.3234 } },
      { name: 'Kullu', coords: { lat: 31.9579, lng: 77.1095 } },
      { name: 'Solan', coords: { lat: 30.9045, lng: 77.0967 } },
    ],
  },
  {
    name: 'Jammu & Kashmir',
    cities: [
      { name: 'Srinagar', coords: { lat: 34.0837, lng: 74.7973 } },
      { name: 'Jammu', coords: { lat: 32.7266, lng: 74.857 } },
      { name: 'Anantnag', coords: { lat: 33.7311, lng: 75.1487 } },
    ],
  },
  {
    name: 'Jharkhand',
    cities: [
      { name: 'Ranchi', coords: { lat: 23.3441, lng: 85.3096 } },
      { name: 'Jamshedpur', coords: { lat: 22.8046, lng: 86.2029 } },
      { name: 'Dhanbad', coords: { lat: 23.7957, lng: 86.4304 } },
      { name: 'Bokaro', coords: { lat: 23.6693, lng: 86.1511 } },
      { name: 'Hazaribagh', coords: { lat: 23.9966, lng: 85.3637 } },
    ],
  },
  {
    name: 'Karnataka',
    cities: [
      { name: 'Bangalore', coords: { lat: 12.9716, lng: 77.5946 } },
      { name: 'Mysore', coords: { lat: 12.2958, lng: 76.6394 } },
      { name: 'Hubli', coords: { lat: 15.3647, lng: 75.124 } },
      { name: 'Mangalore', coords: { lat: 12.9141, lng: 74.856 } },
      { name: 'Belgaum', coords: { lat: 15.8497, lng: 74.4977 } },
      { name: 'Gulbarga', coords: { lat: 17.3297, lng: 76.8343 } },
      { name: 'Davangere', coords: { lat: 14.4644, lng: 75.9218 } },
    ],
  },
  {
    name: 'Kerala',
    cities: [
      { name: 'Thiruvananthapuram', coords: { lat: 8.5241, lng: 76.9366 } },
      { name: 'Kochi', coords: { lat: 9.9312, lng: 76.2673 } },
      { name: 'Kozhikode', coords: { lat: 11.2588, lng: 75.7804 } },
      { name: 'Thrissur', coords: { lat: 10.5276, lng: 76.2144 } },
      { name: 'Kannur', coords: { lat: 11.8745, lng: 75.3704 } },
      { name: 'Kollam', coords: { lat: 8.8932, lng: 76.6141 } },
    ],
  },
  {
    name: 'Madhya Pradesh',
    cities: [
      { name: 'Bhopal', coords: { lat: 23.2599, lng: 77.4126 } },
      { name: 'Indore', coords: { lat: 22.7196, lng: 75.8577 } },
      { name: 'Jabalpur', coords: { lat: 23.1815, lng: 79.9864 } },
      { name: 'Gwalior', coords: { lat: 26.2183, lng: 78.1828 } },
      { name: 'Ujjain', coords: { lat: 23.1765, lng: 75.7885 } },
      { name: 'Sagar', coords: { lat: 23.8388, lng: 78.7378 } },
    ],
  },
  {
    name: 'Maharashtra',
    cities: [
      { name: 'Mumbai', coords: { lat: 19.076, lng: 72.8777 } },
      { name: 'Pune', coords: { lat: 18.5204, lng: 73.8567 } },
      { name: 'Nagpur', coords: { lat: 21.1458, lng: 79.0882 } },
      { name: 'Nashik', coords: { lat: 19.9975, lng: 73.7898 } },
      { name: 'Aurangabad', coords: { lat: 19.8762, lng: 75.3433 } },
      { name: 'Thane', coords: { lat: 19.2183, lng: 72.9781 } },
      { name: 'Navi Mumbai', coords: { lat: 19.033, lng: 73.0297 } },
      { name: 'Kolhapur', coords: { lat: 16.705, lng: 74.2433 } },
      { name: 'Solapur', coords: { lat: 17.6599, lng: 75.9064 } },
    ],
  },
  {
    name: 'Manipur',
    cities: [{ name: 'Imphal', coords: { lat: 24.817, lng: 93.9368 } }],
  },
  {
    name: 'Meghalaya',
    cities: [{ name: 'Shillong', coords: { lat: 25.5788, lng: 91.8933 } }],
  },
  {
    name: 'Mizoram',
    cities: [{ name: 'Aizawl', coords: { lat: 23.7271, lng: 92.7176 } }],
  },
  {
    name: 'Nagaland',
    cities: [
      { name: 'Dimapur', coords: { lat: 25.9042, lng: 93.727 } },
      { name: 'Kohima', coords: { lat: 25.6751, lng: 94.1086 } },
    ],
  },
  {
    name: 'Odisha',
    cities: [
      { name: 'Bhubaneswar', coords: { lat: 20.2961, lng: 85.8245 } },
      { name: 'Cuttack', coords: { lat: 20.4625, lng: 85.883 } },
      { name: 'Rourkela', coords: { lat: 22.2604, lng: 84.8536 } },
      { name: 'Puri', coords: { lat: 19.8135, lng: 85.8312 } },
      { name: 'Berhampur', coords: { lat: 19.315, lng: 84.7941 } },
    ],
  },
  {
    name: 'Punjab',
    cities: [
      { name: 'Ludhiana', coords: { lat: 30.901, lng: 75.8573 } },
      { name: 'Amritsar', coords: { lat: 31.634, lng: 74.8723 } },
      { name: 'Jalandhar', coords: { lat: 31.326, lng: 75.5762 } },
      { name: 'Patiala', coords: { lat: 30.334, lng: 76.3869 } },
      { name: 'Bathinda', coords: { lat: 30.211, lng: 74.9455 } },
      { name: 'Mohali', coords: { lat: 30.7046, lng: 76.7179 } },
    ],
  },
  {
    name: 'Rajasthan',
    cities: [
      { name: 'Jaipur', coords: { lat: 26.9124, lng: 75.7873 } },
      { name: 'Jodhpur', coords: { lat: 26.2389, lng: 73.0243 } },
      { name: 'Udaipur', coords: { lat: 24.5854, lng: 73.7125 } },
      { name: 'Kota', coords: { lat: 25.2138, lng: 75.8648 } },
      { name: 'Ajmer', coords: { lat: 26.4499, lng: 74.6399 } },
      { name: 'Bikaner', coords: { lat: 28.0229, lng: 73.3119 } },
      { name: 'Jaisalmer', coords: { lat: 26.9157, lng: 70.9083 } },
    ],
  },
  {
    name: 'Sikkim',
    cities: [{ name: 'Gangtok', coords: { lat: 27.3389, lng: 88.6065 } }],
  },
  {
    name: 'Tamil Nadu',
    cities: [
      { name: 'Chennai', coords: { lat: 13.0827, lng: 80.2707 } },
      { name: 'Coimbatore', coords: { lat: 11.0168, lng: 76.9558 } },
      { name: 'Madurai', coords: { lat: 9.9252, lng: 78.1198 } },
      { name: 'Tiruchirappalli', coords: { lat: 10.7905, lng: 78.7047 } },
      { name: 'Salem', coords: { lat: 11.6643, lng: 78.146 } },
      { name: 'Tirunelveli', coords: { lat: 8.7139, lng: 77.7567 } },
      { name: 'Vellore', coords: { lat: 12.9165, lng: 79.1325 } },
    ],
  },
  {
    name: 'Telangana',
    cities: [
      { name: 'Hyderabad', coords: { lat: 17.385, lng: 78.4867 } },
      { name: 'Warangal', coords: { lat: 17.9784, lng: 79.5941 } },
      { name: 'Nizamabad', coords: { lat: 18.6725, lng: 78.0941 } },
      { name: 'Karimnagar', coords: { lat: 18.4386, lng: 79.1288 } },
      { name: 'Khammam', coords: { lat: 17.2473, lng: 80.1514 } },
    ],
  },
  {
    name: 'Tripura',
    cities: [{ name: 'Agartala', coords: { lat: 23.8315, lng: 91.2868 } }],
  },
  {
    name: 'Uttar Pradesh',
    cities: [
      { name: 'Lucknow', coords: { lat: 26.8467, lng: 80.9462 } },
      { name: 'Noida', coords: { lat: 28.5355, lng: 77.391 } },
      { name: 'Kanpur', coords: { lat: 26.4499, lng: 80.3319 } },
      { name: 'Agra', coords: { lat: 27.1767, lng: 78.0081 } },
      { name: 'Varanasi', coords: { lat: 25.3176, lng: 82.9739 } },
      { name: 'Prayagraj', coords: { lat: 25.4358, lng: 81.8463 } },
      { name: 'Ghaziabad', coords: { lat: 28.6692, lng: 77.4538 } },
      { name: 'Meerut', coords: { lat: 28.9845, lng: 77.7064 } },
      { name: 'Greater Noida', coords: { lat: 28.4744, lng: 77.504 } },
    ],
  },
  {
    name: 'Uttarakhand',
    cities: [
      { name: 'Dehradun', coords: { lat: 30.3165, lng: 78.0322 } },
      { name: 'Haridwar', coords: { lat: 29.9457, lng: 78.1642 } },
      { name: 'Rishikesh', coords: { lat: 30.0869, lng: 78.2676 } },
      { name: 'Nainital', coords: { lat: 29.3803, lng: 79.4636 } },
      { name: 'Haldwani', coords: { lat: 29.2183, lng: 79.513 } },
    ],
  },
  {
    name: 'West Bengal',
    cities: [
      { name: 'Kolkata', coords: { lat: 22.5726, lng: 88.3639 } },
      { name: 'Howrah', coords: { lat: 22.5958, lng: 88.2636 } },
      { name: 'Durgapur', coords: { lat: 23.5204, lng: 87.3119 } },
      { name: 'Siliguri', coords: { lat: 26.7271, lng: 88.3953 } },
      { name: 'Asansol', coords: { lat: 23.6889, lng: 86.9661 } },
      { name: 'Darjeeling', coords: { lat: 27.036, lng: 88.2627 } },
    ],
  },
];

/**
 * Flat list of all cities (for backward compatibility and search).
 * Derived from the state-grouped data above.
 */
export const ALL_CITIES: CityOption[] = STATES_AND_CITIES.flatMap((state) =>
  state.cities.map((city) => ({ ...city, state: state.name }))
);

/**
 * Get cities for a given state.
 */
export const getCitiesByState = (stateName: string): CityOption[] => {
  const state = STATES_AND_CITIES.find((s) => s.name === stateName);
  if (!state) return [];
  return state.cities.map((city) => ({ ...city, state: state.name }));
};
