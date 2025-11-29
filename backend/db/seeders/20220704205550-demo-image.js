'use strict';

const { fetchUniqueValidatedImage, markImagesAsUsed } = require('../../utils/imageApiService');

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Starting to seed additional images for spots...');

    // Ensure we have API keys
    if (!process.env.UNSPLASH_ACCESS_KEY && !process.env.PEXELS_API_KEY) {
      console.log('No API keys found. Skipping image seeding.');
      return;
    }

    try {
      // Get all spots from the database
      const spots = await queryInterface.sequelize.query(
        'SELECT id, "previewImage", name, city, state FROM "Spots" ORDER BY id',
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (spots.length === 0) {
        console.log('No spots found. Skipping image seeding.');
        return;
      }

      console.log(`Found ${spots.length} spots. Generating additional images...`);

      const images = [];
      const previewImageUrls = [];

      // Track preview images to avoid duplicates
      spots.forEach(spot => {
        if (spot.previewImage) {
          previewImageUrls.push(spot.previewImage);
        }
      });

      // Mark preview images as used in the API service
      markImagesAsUsed(previewImageUrls);

      // Search queries for property images
      const searchQueries = [
        'vacation rental interior',
        'airbnb bedroom',
        'luxury home kitchen',
        'beach house living room',
        'mountain cabin bathroom',
        'modern apartment dining',
        'cozy cottage interior',
        'lake house bedroom',
        'desert retreat patio',
        'city loft living space',
        'property interior design',
        'home decor',
        'vacation rental amenities',
        'luxury accommodation',
        'property details'
      ];

      let consecutiveFailures = 0;
      const maxConsecutiveFailures = 5; // Stop after 5 consecutive failures

      for (let i = 0; i < spots.length; i++) {
        const spot = spots[i];
        
        // If we've hit too many consecutive failures, likely rate limited
        if (consecutiveFailures >= maxConsecutiveFailures) {
          console.log(`\nStopping early due to ${consecutiveFailures} consecutive failures (likely rate limited).`);
          console.log(`Processed ${i}/${spots.length} spots. You can run this seeder again later to continue.`);
          break;
        }
        
        // Generate 3-5 additional images per spot
        const numImages = Math.floor(Math.random() * 3) + 3; // 3-5 images
        
        // Try to use queries related to the spot's location/type
        const spotQueries = [...searchQueries];
        if (spot.city) {
          spotQueries.unshift(`${spot.city} property interior`, `${spot.city} vacation rental interior`, `${spot.city} property`);
        }
        if (spot.name) {
          const nameWords = spot.name.toLowerCase().split(' ');
          nameWords.forEach(word => {
            if (word.length > 3) {
              spotQueries.push(`${word} interior`, `${word} property`);
            }
          });
        }

        // Create location context for location-specific image fetching
        const locationContext = spot.city ? { 
          city: spot.city, 
          state: spot.state || null 
        } : null;

        let spotImagesAdded = 0;
        for (let j = 0; j < numImages; j++) {
          try {
            // Fetch a unique validated image with location context (reduced retries)
            const image = await fetchUniqueValidatedImage(spotQueries, 'random', 2, locationContext);
            
            // Ensure it's not the preview image
            if (image.url === spot.previewImage) {
              continue;
            }

            // Get current image count for this spot to set imageableId
            const existingImages = images.filter(img => img.spotId === spot.id);
            const imageableId = existingImages.length + 1;

            images.push({
              url: image.url,
              spotId: spot.id,
              reviewId: null,
              imageableId,
              imageableType: 'Spot',
              createdAt: new Date(),
              updatedAt: new Date()
            });

            spotImagesAdded++;
            consecutiveFailures = 0; // Reset on success
            
            // Small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            if (error.message.includes('rate limit') || error.message.includes('Both APIs')) {
              consecutiveFailures++;
              console.log(`Rate limited for spot ${spot.id}. Stopping early.`);
              break; // Break out of image loop for this spot
            }
            // For other errors, continue trying
            if (j === numImages - 1) {
              consecutiveFailures++;
            }
          }
        }

        if (spotImagesAdded === 0) {
          consecutiveFailures++;
        }

        if ((i + 1) % 10 === 0) {
          console.log(`Generated images for ${i + 1}/${spots.length} spots...`);
        }
      }

      if (images.length > 0) {
        console.log(`Inserting ${images.length} additional images into database...`);
        await queryInterface.bulkInsert('Images', images, {});
        console.log('Successfully seeded additional images!');
      } else {
        console.log('No images were generated.');
      }

    } catch (error) {
      console.error('Error seeding images:', error);
      // Don't throw - allow seeding to continue even if image seeding fails
      console.log('Continuing without additional images...');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Images', {}, {});
  }
};
