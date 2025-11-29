const axios = require('axios');
require('dotenv').config();

// Track used image URLs to ensure uniqueness
const usedImageUrls = new Set();

/**
 * Validates that an image URL is accessible
 * @param {string} imageUrl - The image URL to validate
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 * @returns {Promise<boolean>} - True if image is accessible, false otherwise
 */
async function validateImageUrl(imageUrl, timeout = 10000) {
  try {
    const response = await axios.head(imageUrl, {
      timeout,
      validateStatus: (status) => status >= 200 && status < 400,
      maxRedirects: 5
    });
    
    const contentType = response.headers['content-type'] || '';
    const isImage = contentType.startsWith('image/');
    
    return isImage && response.status >= 200 && response.status < 300;
  } catch (error) {
    return false;
  }
}

/**
 * Fetches images from Unsplash API
 * @param {string} query - Search query term
 * @param {number} perPage - Number of results per page (max 30)
 * @param {number} page - Page number
 * @returns {Promise<Array>} - Array of image objects with metadata
 */
async function fetchFromUnsplash(query, perPage = 30, page = 1) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  
  if (!accessKey) {
    throw new Error('UNSPLASH_ACCESS_KEY is not set in environment variables');
  }

  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query,
        per_page: Math.min(perPage, 30),
        page,
        orientation: 'landscape'
      },
      headers: {
        'Authorization': `Client-ID ${accessKey}`
      },
      timeout: 15000
    });

    const images = response.data.results.map(photo => ({
      url: photo.urls.regular || photo.urls.full,
      fullUrl: photo.urls.full,
      rawUrl: photo.urls.raw,
      description: photo.description || photo.alt_description || photo.alt || '',
      location: photo.location?.name || null,
      city: photo.location?.city || null,
      country: photo.location?.country || null,
      photographer: photo.user?.name || 'Unknown',
      photographerUsername: photo.user?.username || '',
      width: photo.width,
      height: photo.height,
      apiSource: 'unsplash',
      id: photo.id
    }));

    return images;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('Unsplash API rate limit exceeded or invalid API key');
    }
    throw error;
  }
}

/**
 * Fetches images from Pexels API
 * @param {string} query - Search query term
 * @param {number} perPage - Number of results per page (max 80)
 * @param {number} page - Page number
 * @returns {Promise<Array>} - Array of image objects with metadata
 */
async function fetchFromPexels(query, perPage = 80, page = 1) {
  const apiKey = process.env.PEXELS_API_KEY;
  
  if (!apiKey) {
    throw new Error('PEXELS_API_KEY is not set in environment variables');
  }

  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      params: {
        query,
        per_page: Math.min(perPage, 80),
        page
      },
      headers: {
        'Authorization': apiKey
      },
      timeout: 15000
    });

    const images = response.data.photos.map(photo => ({
      url: photo.src.large || photo.src.original,
      fullUrl: photo.src.original,
      description: photo.alt || '',
      photographer: photo.photographer || 'Unknown',
      photographerId: photo.photographer_id || null,
      width: photo.width,
      height: photo.height,
      apiSource: 'pexels',
      id: photo.id
    }));

    return images;
  } catch (error) {
    if (error.response?.status === 403 || error.response?.status === 429) {
      throw new Error('Pexels API rate limit exceeded or invalid API key');
    }
    throw error;
  }
}

/**
 * Fetches a unique, validated image from either API
 * @param {Array<string>} queries - Array of search queries to try
 * @param {string} preferredApi - 'unsplash', 'pexels', or 'random'
 * @param {number} maxRetries - Maximum number of retries for validation
 * @param {Object} locationContext - Optional object with city and/or state for location-specific queries
 * @returns {Promise<Object>} - Validated image object with metadata
 */
async function fetchUniqueValidatedImage(queries, preferredApi = 'random', maxRetries = 3, locationContext = null) {
  // Build location-specific queries if location context is provided
  let locationQueries = [];
  if (locationContext) {
    const { city, state } = locationContext;
    if (city) {
      locationQueries.push(
        `${city} property`,
        `${city} vacation rental`,
        `${city} home`,
        `${city} house`
      );
      if (state) {
        locationQueries.push(
          `${city} ${state} property`,
          `${city} ${state} vacation rental`,
          `${city} ${state} home`
        );
      }
    }
  }

  // Default queries if none provided
  const defaultQueries = [
    'vacation rental',
    'airbnb',
    'luxury home',
    'beach house',
    'mountain cabin',
    'modern apartment',
    'cozy cottage',
    'lake house',
    'desert retreat',
    'city loft',
    'countryside villa',
    'seaside bungalow',
    'treehouse',
    'penthouse',
    'rustic cabin'
  ];

  // Prioritize location-specific queries, then provided queries, then defaults
  const searchQueries = queries && queries.length > 0 
    ? [...locationQueries, ...queries, ...defaultQueries]
    : locationQueries.length > 0
    ? [...locationQueries, ...defaultQueries]
    : defaultQueries;

  let attempts = 0;
  let unsplashRateLimited = false;
  let pexelsRateLimited = false;
  const maxAttempts = Math.min(maxRetries * 2, 6); // Reduced max attempts

  while (attempts < maxAttempts) {
    // If both APIs are rate limited, give up immediately
    if (unsplashRateLimited && pexelsRateLimited) {
      throw new Error('Both APIs are rate limited. Please wait before trying again.');
    }

    try {
      // Alternate between APIs or use preferred, but skip rate-limited APIs
      let useUnsplash;
      if (preferredApi === 'random') {
        // If one is rate limited, use the other
        if (unsplashRateLimited) useUnsplash = false;
        else if (pexelsRateLimited) useUnsplash = true;
        else useUnsplash = Math.random() > 0.5;
      } else {
        useUnsplash = preferredApi === 'unsplash';
        // Skip if the preferred API is rate limited
        if (useUnsplash && unsplashRateLimited) {
          if (pexelsRateLimited) throw new Error('Both APIs are rate limited');
          useUnsplash = false;
        } else if (!useUnsplash && pexelsRateLimited) {
          if (unsplashRateLimited) throw new Error('Both APIs are rate limited');
          useUnsplash = true;
        }
      }
      
      const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
      const page = Math.floor(Math.random() * 5) + 1; // Random page 1-5 for variety
      
      let images;
      if (useUnsplash) {
        images = await fetchFromUnsplash(query, 30, page);
        unsplashRateLimited = false; // Reset on success
      } else {
        images = await fetchFromPexels(query, 80, page);
        pexelsRateLimited = false; // Reset on success
      }

      // Filter out already used images
      const unusedImages = images.filter(img => !usedImageUrls.has(img.url));

      if (unusedImages.length === 0) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }

      // Try to validate images, starting with a random one
      const shuffled = unusedImages.sort(() => Math.random() - 0.5);
      
      for (const image of shuffled.slice(0, 5)) { // Limit validation attempts
        const isValid = await validateImageUrl(image.url);
        
        if (isValid && !usedImageUrls.has(image.url)) {
          usedImageUrls.add(image.url);
          return image;
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      attempts++;
      
      // Detect rate limiting
      if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
        const isUnsplashError = error.message.includes('Unsplash');
        const isPexelsError = error.message.includes('Pexels');
        
        if (isUnsplashError) {
          unsplashRateLimited = true;
        } else if (isPexelsError) {
          pexelsRateLimited = true;
        }
        
        // If both are rate limited, throw immediately
        if (unsplashRateLimited && pexelsRateLimited) {
          throw new Error('Both APIs are rate limited. Please wait before trying again.');
        }
        
        // Don't retry if rate limited - wait longer or skip
        if (attempts >= 2) {
          throw new Error('API rate limit exceeded. Please wait before trying again.');
        }
        
        // Wait longer for rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // For other errors, wait a bit but continue
        if (attempts >= maxAttempts) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  throw new Error(`Failed to fetch unique validated image after ${maxAttempts} attempts`);
}

/**
 * Fetches multiple unique, validated images
 * @param {number} count - Number of images to fetch
 * @param {Array<string>} queries - Array of search queries
 * @param {Object} locationContext - Optional object with city and/or state for location-specific queries
 * @returns {Promise<Array>} - Array of validated image objects
 */
async function fetchMultipleUniqueImages(count, queries = null, locationContext = null) {
  const images = [];
  const errors = [];

  for (let i = 0; i < count; i++) {
    try {
      const image = await fetchUniqueValidatedImage(queries, 'random', 3, locationContext);
      images.push(image);
      console.log(`Fetched image ${i + 1}/${count} from ${image.apiSource}`);
      
      // Add delay between fetches to respect rate limits
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Error fetching image ${i + 1}:`, error.message);
      errors.push(error);
      
      // If too many errors, throw
      if (errors.length > count / 2) {
        throw new Error(`Too many errors fetching images: ${errors.length} failures`);
      }
    }
  }

  return images;
}

/**
 * Resets the used image URLs tracker (useful for testing)
 */
function resetUsedImages() {
  usedImageUrls.clear();
}

/**
 * Adds URLs to the used image tracker (useful when you want to exclude certain images)
 * @param {Array<string>} urls - Array of image URLs to mark as used
 */
function markImagesAsUsed(urls) {
  urls.forEach(url => usedImageUrls.add(url));
}

module.exports = {
  fetchFromUnsplash,
  fetchFromPexels,
  fetchUniqueValidatedImage,
  fetchMultipleUniqueImages,
  validateImageUrl,
  resetUsedImages,
  markImagesAsUsed
};

