/**
 * Realistic US cities with their states and approximate coordinates
 */
const US_CITIES = [
  { city: 'San Francisco', state: 'California', lat: 37.7749, lng: -122.4194 },
  { city: 'Los Angeles', state: 'California', lat: 34.0522, lng: -118.2437 },
  { city: 'New York', state: 'New York', lat: 40.7128, lng: -74.0060 },
  { city: 'Chicago', state: 'Illinois', lat: 41.8781, lng: -87.6298 },
  { city: 'Miami', state: 'Florida', lat: 25.7617, lng: -80.1918 },
  { city: 'Seattle', state: 'Washington', lat: 47.6062, lng: -122.3321 },
  { city: 'Austin', state: 'Texas', lat: 30.2672, lng: -97.7431 },
  { city: 'Denver', state: 'Colorado', lat: 39.7392, lng: -104.9903 },
  { city: 'Portland', state: 'Oregon', lat: 45.5152, lng: -122.6784 },
  { city: 'Nashville', state: 'Tennessee', lat: 36.1627, lng: -86.7816 },
  { city: 'Boston', state: 'Massachusetts', lat: 42.3601, lng: -71.0589 },
  { city: 'Phoenix', state: 'Arizona', lat: 33.4484, lng: -112.0740 },
  { city: 'Las Vegas', state: 'Nevada', lat: 36.1699, lng: -115.1398 },
  { city: 'San Diego', state: 'California', lat: 32.7157, lng: -117.1611 },
  { city: 'Honolulu', state: 'Hawaii', lat: 21.3099, lng: -157.8581 },
  { city: 'Charleston', state: 'South Carolina', lat: 32.7765, lng: -79.9311 },
  { city: 'Savannah', state: 'Georgia', lat: 32.0809, lng: -81.0912 },
  { city: 'Santa Fe', state: 'New Mexico', lat: 35.6870, lng: -105.9378 },
  { city: 'Asheville', state: 'North Carolina', lat: 35.5951, lng: -82.5515 },
  { city: 'Sedona', state: 'Arizona', lat: 34.8697, lng: -111.7610 },
  { city: 'Key West', state: 'Florida', lat: 24.5551, lng: -81.7826 },
  { city: 'Big Bear Lake', state: 'California', lat: 34.2439, lng: -116.9114 },
  { city: 'Lake Tahoe', state: 'California', lat: 39.0968, lng: -120.0324 },
  { city: 'Aspen', state: 'Colorado', lat: 39.1911, lng: -106.8175 },
  { city: 'Jackson Hole', state: 'Wyoming', lat: 43.4799, lng: -110.7624 },
  { city: 'Napa', state: 'California', lat: 38.2975, lng: -122.2869 },
  { city: 'Carmel', state: 'California', lat: 36.5552, lng: -121.9233 },
  { city: 'Monterey', state: 'California', lat: 36.6002, lng: -121.8947 },
  { city: 'Santa Barbara', state: 'California', lat: 34.4208, lng: -119.6982 },
  { city: 'Malibu', state: 'California', lat: 34.0259, lng: -118.7798 }
];

const STREET_NAMES = [
  'Main', 'Park', 'Oak', 'Pine', 'Elm', 'Maple', 'Cedar', 'First', 'Second', 'Third',
  'Washington', 'Lincoln', 'Jefferson', 'Madison', 'Monroe', 'Adams', 'Jackson',
  'Ocean', 'Beach', 'Sunset', 'Sunrise', 'Hill', 'Valley', 'River', 'Lake',
  'Garden', 'Rose', 'Lily', 'Magnolia', 'Cherry', 'Willow', 'Cypress',
  'Bay', 'Harbor', 'Cove', 'Bluff', 'Ridge', 'Trail', 'Path', 'Lane', 'Drive',
  'Avenue', 'Boulevard', 'Court', 'Place', 'Way', 'Circle', 'Terrace'
];

const STREET_TYPES = ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Rd', 'Ct', 'Pl', 'Way', 'Cir'];

/**
 * Generates a random street address
 * @returns {string} - Random street address
 */
function generateAddress() {
  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const streetName = STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)];
  const streetType = STREET_TYPES[Math.floor(Math.random() * STREET_TYPES.length)];
  
  return `${streetNumber} ${streetName} ${streetType}`;
}

/**
 * Gets location data from API image metadata if available
 * @param {Object} imageMetadata - Image metadata from API
 * @returns {Object|null} - Location data or null
 */
function extractLocationFromMetadata(imageMetadata) {
  if (!imageMetadata) return null;

  // Unsplash location data
  if (imageMetadata.location || imageMetadata.city || imageMetadata.country) {
    return {
      city: imageMetadata.city || imageMetadata.location?.split(',')[0] || null,
      state: null, // Unsplash doesn't typically provide state
      country: imageMetadata.country || 'United States',
      location: imageMetadata.location
    };
  }

  return null;
}

/**
 * Generates location data, preferring API metadata, then random US city
 * @param {Object} imageMetadata - Optional image metadata from API
 * @param {Set} usedAddresses - Set of already used addresses to avoid duplicates
 * @returns {Object} - Complete location data with address, city, state, country, lat, lng
 */
function generateLocation(imageMetadata = null, usedAddresses = new Set()) {
  // Try to extract location from API metadata first
  const apiLocation = extractLocationFromMetadata(imageMetadata);
  
  let city, state, country, lat, lng;
  
  if (apiLocation && apiLocation.city) {
    // Use API location if available
    city = apiLocation.city;
    country = apiLocation.country || 'United States';
    
    // Try to match with known US city for state/coordinates
    const matchedCity = US_CITIES.find(c => 
      c.city.toLowerCase() === city.toLowerCase() ||
      city.toLowerCase().includes(c.city.toLowerCase())
    );
    
    if (matchedCity) {
      state = matchedCity.state;
      lat = matchedCity.lat + (Math.random() * 0.1 - 0.05); // Add small random offset
      lng = matchedCity.lng + (Math.random() * 0.1 - 0.05);
    } else {
      // Use random US city if can't match
      const randomCity = US_CITIES[Math.floor(Math.random() * US_CITIES.length)];
      state = randomCity.state;
      city = randomCity.city;
      lat = randomCity.lat + (Math.random() * 0.1 - 0.05);
      lng = randomCity.lng + (Math.random() * 0.1 - 0.05);
    }
  } else {
    // Use random US city
    const randomCity = US_CITIES[Math.floor(Math.random() * US_CITIES.length)];
    city = randomCity.city;
    state = randomCity.state;
    country = 'United States';
    lat = randomCity.lat + (Math.random() * 0.1 - 0.05);
    lng = randomCity.lng + (Math.random() * 0.1 - 0.05);
  }

  // Generate unique address
  let address;
  let attempts = 0;
  do {
    address = generateAddress();
    attempts++;
    if (attempts > 100) {
      // Fallback: add random number to make unique
      address = `${address} #${Math.floor(Math.random() * 1000)}`;
      break;
    }
  } while (usedAddresses.has(address));
  
  usedAddresses.add(address);

  return {
    address,
    city,
    state,
    country,
    lat: parseFloat(lat.toFixed(7)),
    lng: parseFloat(lng.toFixed(7))
  };
}

/**
 * Generates a realistic price based on location and property type
 * @param {string} city - City name
 * @param {string} description - Property description (hints at type)
 * @returns {number} - Price per night
 */
function generatePrice(city, description = '') {
  const desc = description.toLowerCase();
  
  // Base prices by city (luxury cities cost more)
  const luxuryCities = ['san francisco', 'new york', 'los angeles', 'honolulu', 'aspen', 'malibu'];
  const midCities = ['seattle', 'austin', 'denver', 'boston', 'miami', 'charleston'];
  
  let basePrice;
  if (luxuryCities.some(c => city.toLowerCase().includes(c))) {
    basePrice = 200;
  } else if (midCities.some(c => city.toLowerCase().includes(c))) {
    basePrice = 120;
  } else {
    basePrice = 80;
  }
  
  // Adjust based on property type keywords
  if (desc.includes('luxury') || desc.includes('penthouse') || desc.includes('mansion')) {
    basePrice *= 2.5;
  } else if (desc.includes('cabin') || desc.includes('cottage') || desc.includes('rustic')) {
    basePrice *= 0.7;
  } else if (desc.includes('beach') || desc.includes('ocean') || desc.includes('waterfront')) {
    basePrice *= 1.5;
  } else if (desc.includes('mountain') || desc.includes('lake')) {
    basePrice *= 1.2;
  }
  
  // Add random variation
  const variation = basePrice * 0.4 * (Math.random() - 0.5);
  const price = Math.round(basePrice + variation);
  
  // Ensure price is within reasonable bounds
  return Math.max(50, Math.min(5000, price));
}

module.exports = {
  generateLocation,
  generateAddress,
  generatePrice,
  US_CITIES
};

