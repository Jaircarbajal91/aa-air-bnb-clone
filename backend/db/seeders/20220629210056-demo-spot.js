'use strict';

const { fetchUniqueValidatedImage, resetUsedImages } = require('../../utils/imageApiService');
const { generateLocation, generatePrice } = require('../../utils/locationGenerator');

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Starting to seed spots with API data...');
    
    // Reset used images tracker for fresh seeding
    resetUsedImages();
    
    // Ensure we have API keys
    if (!process.env.UNSPLASH_ACCESS_KEY && !process.env.PEXELS_API_KEY) {
      throw new Error('At least one API key (UNSPLASH_ACCESS_KEY or PEXELS_API_KEY) must be set in environment variables');
    }

    const NUM_SPOTS = 100;
    const usedAddresses = new Set();
    const spots = [];

    // Generic search queries for property images (used as a final fallback)
    const baseSearchQueries = [
      'vacation rental exterior',
      'airbnb house exterior',
      'luxury home exterior',
      'beach house exterior',
      'mountain cabin exterior',
      'modern apartment building',
      'cozy cottage exterior',
      'lake house exterior',
      'desert retreat home',
      'city loft building',
      'countryside villa exterior',
      'seaside bungalow exterior',
      'treehouse rental',
      'penthouse exterior',
      'rustic cabin exterior',
      'coastal home exterior',
      'ski lodge exterior',
      'tropical villa exterior',
      'urban apartment exterior',
      'country estate exterior'
    ];

    // Get property type based on location
    const getPropertyTypeForLocation = (city, state) => {
      const cityLower = city.toLowerCase();
      const stateLower = state.toLowerCase();
      
      if (cityLower.includes('beach') || cityLower.includes('coast') || cityLower.includes('ocean') || 
          cityLower === 'miami' || cityLower === 'san diego' || cityLower === 'honolulu' || 
          cityLower === 'key west' || cityLower === 'malibu' || cityLower === 'santa barbara') {
        return 'Beach House';
      }
      if (cityLower.includes('mountain') || cityLower === 'aspen' || cityLower === 'jackson hole' || 
          cityLower === 'big bear lake' || cityLower === 'lake tahoe' || cityLower === 'sedona') {
        return 'Mountain Cabin';
      }
      if (cityLower.includes('lake') || cityLower === 'lake tahoe' || cityLower === 'big bear lake') {
        return 'Lake House';
      }
      if (cityLower === 'new york' || cityLower === 'chicago' || cityLower === 'san francisco' || 
          cityLower === 'los angeles' || cityLower === 'seattle' || cityLower === 'boston') {
        return 'Modern Apartment';
      }
      if (cityLower === 'napa' || cityLower === 'carmel' || cityLower === 'monterey' || 
          cityLower === 'santa fe' || cityLower === 'charleston' || cityLower === 'savannah') {
        return 'Charming Cottage';
      }
      return ['Luxury Home', 'Cozy Cottage', 'Modern Apartment', 'Beach House', 'Mountain Cabin'][Math.floor(Math.random() * 5)];
    };

    try {
      // Get actual user IDs from database to ensure foreign key constraints are met
      const users = await queryInterface.sequelize.query(
        'SELECT id FROM "Users" ORDER BY id',
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (users.length === 0) {
        throw new Error('No users found. Please run the user seeder first.');
      }

      const userIds = users.map(u => u.id);
      const DEMO_USER_ID = userIds[0]; // First user is demo user

      console.log(`Generating ${NUM_SPOTS} spots with location-specific images...`);
      console.log(`Found ${userIds.length} users (IDs: ${userIds.join(', ')})`);

      for (let i = 0; i < NUM_SPOTS; i++) {
        // Generate location first (without image metadata)
        const location = generateLocation(null, usedAddresses);
        
        // Determine property type based on location
        const propertyType = getPropertyTypeForLocation(location.city, location.state);

        // Build strongly-typed, location-aware queries so images better match descriptions
        const propertyKey = propertyType.toLowerCase();
        const propertyQueries = [
          `${propertyKey} exterior`,
          `${propertyKey} front view`,
          `${propertyKey} outside`,
          `${propertyKey} rental`,
          `${propertyKey} vacation rental`
        ];

        const city = location.city;
        const state = location.state;
        const locationQueries = [
          `${city} ${state} ${propertyKey} exterior`,
          `${city} ${state} vacation rental exterior`,
          `${city} ${propertyKey} exterior`,
          `${city} vacation rental exterior`,
          `${state} ${propertyKey} exterior`
        ];

        const searchQueries = [
          ...locationQueries,
          ...propertyQueries,
          ...baseSearchQueries
        ];

        // Fetch image with location context
        let image;
        try {
          const locationContext = { city: location.city, state: location.state };
          image = await fetchUniqueValidatedImage(searchQueries, 'random', 3, locationContext);
        } catch (error) {
          console.log(`Failed to fetch location-specific image for ${location.city}, using fallback...`);
          // Fallback to generic image
          image = await fetchUniqueValidatedImage(searchQueries, 'random', 3, null);
        }
        
        // Generate name from property type and location
        let name;
        if (image.description && image.description.length > 0) {
          // Try to extract meaningful words from description
          const cleanDesc = image.description
            .replace(/[^\w\s]/g, '')
            .split(' ')
            .filter(word => word.length > 3) // Filter short words
            .slice(0, 3)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          
          if (cleanDesc.length > 5) {
            name = `${cleanDesc} in ${location.city}`;
          } else {
            name = `${propertyType} in ${location.city}`;
          }
        } else {
          name = `${propertyType} in ${location.city}`;
        }
        
        // Ensure name is within 50 character limit
        if (name.length > 50) {
          name = name.substring(0, 47) + '...';
        }

        // Generate unique description from location and property type
        const descriptionTemplates = [
          `Beautiful ${propertyType.toLowerCase()} located in ${location.city}, ${location.state}. Perfect for your next getaway with stunning views and modern amenities.`,
          `Stunning ${propertyType.toLowerCase()} in the heart of ${location.city}. Experience comfort, luxury, and the best of ${location.state} hospitality.`,
          `Charming ${propertyType.toLowerCase()} in ${location.city} offering a unique and memorable stay. Discover the beauty of ${location.state} from this perfect location.`,
          `Elegant ${propertyType.toLowerCase()} retreat in ${location.city}, ${location.state}. Ideal for relaxation, adventure, and creating lasting memories.`,
          `Welcome to this exceptional ${propertyType.toLowerCase()} in ${location.city}. Experience the charm of ${location.state} with all the comforts of home.`,
          `Discover ${location.city} from this beautiful ${propertyType.toLowerCase()}. Located in ${location.state}, this property offers the perfect base for your travels.`,
          `This lovely ${propertyType.toLowerCase()} in ${location.city}, ${location.state} provides a peaceful escape with easy access to local attractions and amenities.`,
          `Experience the best of ${location.city} at this wonderful ${propertyType.toLowerCase()}. A perfect blend of comfort and ${location.state} charm awaits you.`
        ];
        const description = descriptionTemplates[Math.floor(Math.random() * descriptionTemplates.length)];

        // Generate price based on location and description
        const price = generatePrice(location.city, description);

        // Distribute ownership across all users with bias toward demo user
        // Demo user gets ~20% of spots, others distributed evenly
        let ownerId;
        const rand = Math.random();
        if (rand < 0.2) {
          ownerId = DEMO_USER_ID; // Demo user
        } else {
          // Distribute among all users
          ownerId = userIds[Math.floor(Math.random() * userIds.length)];
        }

        const spot = {
          name,
          description,
          address: location.address,
          city: location.city,
          state: location.state,
          country: location.country,
          lat: location.lat,
          lng: location.lng,
          price,
          ownerId,
          previewImage: image.url,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        spots.push(spot);
        
        if ((i + 1) % 10 === 0) {
          console.log(`Generated ${i + 1}/${NUM_SPOTS} spots...`);
        }
        
        // Small delay to respect rate limits
        if (i < NUM_SPOTS - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log(`Inserting ${spots.length} spots into database...`);
      await queryInterface.bulkInsert('Spots', spots, {});
      console.log('Successfully seeded spots!');
      
    } catch (error) {
      console.error('Error seeding spots:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Spots', {}, {});
  }
};
