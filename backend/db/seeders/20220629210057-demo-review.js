'use strict';

const { generateReview, extractPropertyType } = require('../../utils/reviewGenerator');

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Starting to seed reviews...');

    try {
      // Get all spots from the database
      const spots = await queryInterface.sequelize.query(
        'SELECT id, name, city, state FROM "Spots" ORDER BY id',
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (spots.length === 0) {
        console.log('No spots found. Skipping review seeding.');
        return;
      }

      // Get total number of users (should be 18)
      const users = await queryInterface.sequelize.query(
        'SELECT id FROM "Users" ORDER BY id',
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (users.length === 0) {
        console.log('No users found. Skipping review seeding.');
        return;
      }

      const userIds = users.map(u => u.id);
      const reviews = [];
      const userSpotPairs = new Set(); // Track user-spot pairs to prevent duplicates

      console.log(`Generating reviews for ${spots.length} spots...`);

      // Helper to generate a random past date within the last 18 months
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eighteenMonthsAgo = new Date(today);
      eighteenMonthsAgo.setMonth(eighteenMonthsAgo.getMonth() - 18);

      const randomPastDate = () => {
        const minTime = eighteenMonthsAgo.getTime();
        const maxTime = today.getTime();
        const randomTime = Math.random() * (maxTime - minTime) + minTime;
        return new Date(randomTime);
      };

      for (const spot of spots) {
        // Generate 5-10 reviews per spot
        const numReviews = Math.floor(Math.random() * 6) + 5; // 5-10 reviews

        // Keep track of review texts for this spot so they stay unique
        const usedReviewsForSpot = new Set();

        // Get available users (those who haven't reviewed this spot)
        const availableUsers = userIds.filter(userId => {
          const pairKey = `${userId}-${spot.id}`;
          return !userSpotPairs.has(pairKey);
        });

        // Shuffle available users to randomize selection
        const shuffledUsers = [...availableUsers].sort(() => Math.random() - 0.5);

        // Select users for this spot (up to numReviews or available users)
        const selectedUsers = shuffledUsers.slice(0, Math.min(numReviews, availableUsers.length));

        // Extract property type from spot name
        const propertyType = extractPropertyType(spot.name);

        for (const userId of selectedUsers) {
          // Generate star rating (heavily weighted toward positive reviews)
          // ~5% chance of 1-2 stars, 15% chance of 3 stars, 80% chance of 4-5 stars
          const rand = Math.random();
          let stars;
          if (rand < 0.05) {
            // 1-2 stars (negative)
            stars = Math.random() < 0.5 ? 1 : 2;
          } else if (rand < 0.20) {
            // 3 stars (neutral)
            stars = 3;
          } else {
            // 4-5 stars (positive)
            stars = Math.random() < 0.5 ? 4 : 5;
          }

          // Generate review text and ensure it is unique for this spot
          let reviewText;
          let attempts = 0;
          do {
            reviewText = generateReview({
              city: spot.city,
              state: spot.state,
              propertyType: propertyType,
              stars: stars
            });
            attempts++;
          } while (usedReviewsForSpot.has(reviewText) && attempts < 5);

          // As a final fallback, append a small unique suffix so the text is still unique
          if (usedReviewsForSpot.has(reviewText)) {
            reviewText = `${reviewText} (Stay ${usedReviewsForSpot.size + 1})`;
          }

          usedReviewsForSpot.add(reviewText);

          // Track this user-spot pair
          const pairKey = `${userId}-${spot.id}`;
          userSpotPairs.add(pairKey);

          const createdAt = randomPastDate();

          reviews.push({
            userId: userId,
            spotId: spot.id,
            review: reviewText,
            stars: stars,
            imageId: null, // Reviews don't require images
            createdAt,
            updatedAt: createdAt
          });
        }

        if (reviews.length % 50 === 0) {
          console.log(`Generated ${reviews.length} reviews so far...`);
        }
      }

      if (reviews.length > 0) {
        console.log(`Inserting ${reviews.length} reviews into database...`);
        await queryInterface.bulkInsert('Reviews', reviews, {});
        console.log('Successfully seeded reviews!');
      } else {
        console.log('No reviews were generated.');
      }

    } catch (error) {
      console.error('Error seeding reviews:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Reviews', {}, {});
  }
};
