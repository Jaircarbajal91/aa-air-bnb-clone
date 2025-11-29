'use strict';

const { hasBookingConflict, randomDate, formatDate, addDays, parseLocalDate } = require('../../utils/bookingHelper');

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Starting to seed bookings...');

    try {
      // Get all spots
      const spots = await queryInterface.sequelize.query(
        'SELECT id FROM "Spots" ORDER BY id',
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (spots.length === 0) {
        console.log('No spots found. Skipping booking seeding.');
        return;
      }

      // Get all users (including usernames so we can identify the demo user)
      const users = await queryInterface.sequelize.query(
        'SELECT id, username FROM "Users" ORDER BY id',
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (users.length === 0) {
        console.log('No users found. Skipping booking seeding.');
        return;
      }

      const userIds = users.map(u => u.id);

      // Try to find the demo user by username; fall back to the smallest user id
      const demoUser = users.find(u => u.username === 'Demo-lition');
      const DEMO_USER_ID = demoUser ? demoUser.id : Math.min(...userIds);
      const bookings = [];
      
      // Track bookings per spot to check for conflicts
      const bookingsBySpot = new Map(); // spotId -> array of bookings

      // Set up date ranges
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = addDays(today, 1);
      const yesterday = addDays(today, -1);
      const sixMonthsAgo = addDays(today, -180); // ~6 months ago
      const sixMonthsAhead = addDays(today, 180); // ~6 months ahead

      console.log('Generating bookings for demo user...');

      // Generate bookings for demo user (id: 1)
      // ~14-16 past bookings, 4-6 future bookings = ~20 total
      const demoPastBookings = 14 + Math.floor(Math.random() * 3); // 14-16
      const demoFutureBookings = 4 + Math.floor(Math.random() * 3); // 4-6
      const demoTotalBookings = demoPastBookings + demoFutureBookings;

      let demoBookingsCreated = 0;

      // Generate past bookings for demo user
      for (let i = 0; i < demoPastBookings; i++) {
        let attempts = 0;
        let bookingCreated = false;

        while (!bookingCreated && attempts < 50) {
          // Pick a random spot
          const spot = spots[Math.floor(Math.random() * spots.length)];
          const spotId = spot.id;

          // Generate random past date (between 6 months ago and yesterday)
          const startDate = randomDate(sixMonthsAgo, yesterday);
          const duration = Math.floor(Math.random() * 6) + 1; // 1-7 days
          const endDate = addDays(startDate, duration);

          // Check for conflicts
          const existingBookings = bookingsBySpot.get(spotId) || [];
          if (!hasBookingConflict(existingBookings, startDate, endDate)) {
            const booking = {
              spotId: spotId,
              userId: DEMO_USER_ID,
              startDate: formatDate(startDate),
              endDate: formatDate(endDate),
              createdAt: new Date(),
              updatedAt: new Date()
            };

            bookings.push(booking);
            
            // Track this booking
            if (!bookingsBySpot.has(spotId)) {
              bookingsBySpot.set(spotId, []);
            }
            bookingsBySpot.get(spotId).push({
              startDate: formatDate(startDate),
              endDate: formatDate(endDate)
            });

            demoBookingsCreated++;
            bookingCreated = true;
          }
          attempts++;
        }
      }

      // Generate future bookings for demo user (at least 1 day ahead)
      for (let i = 0; i < demoFutureBookings; i++) {
        let attempts = 0;
        let bookingCreated = false;

        while (!bookingCreated && attempts < 50) {
          // Pick a random spot
          const spot = spots[Math.floor(Math.random() * spots.length)];
          const spotId = spot.id;

          // Generate random future date (between tomorrow and 6 months ahead)
          const startDate = randomDate(tomorrow, sixMonthsAhead);
          const duration = Math.floor(Math.random() * 6) + 1; // 1-7 days
          const endDate = addDays(startDate, duration);

          // Ensure start date is at least tomorrow
          if (startDate.getTime() < tomorrow.getTime()) {
            attempts++;
            continue;
          }

          // Check for conflicts
          const existingBookings = bookingsBySpot.get(spotId) || [];
          if (!hasBookingConflict(existingBookings, startDate, endDate)) {
            const booking = {
              spotId: spotId,
              userId: DEMO_USER_ID,
              startDate: formatDate(startDate),
              endDate: formatDate(endDate),
              createdAt: new Date(),
              updatedAt: new Date()
            };

            bookings.push(booking);
            
            // Track this booking
            if (!bookingsBySpot.has(spotId)) {
              bookingsBySpot.set(spotId, []);
            }
            bookingsBySpot.get(spotId).push({
              startDate: formatDate(startDate),
              endDate: formatDate(endDate)
            });

            demoBookingsCreated++;
            bookingCreated = true;
          }
          attempts++;
        }
      }

      console.log(`Created ${demoBookingsCreated} bookings for demo user.`);
      console.log('Generating bookings for other users...');

      // Generate bookings for other users
      // Distribute bookings across all users (excluding demo user for now since we already did them)
      const otherUserIds = userIds.filter(id => id !== DEMO_USER_ID);
      const bookingsPerUser = Math.floor(100 / otherUserIds.length); // ~100 total bookings for other users

      for (const userId of otherUserIds) {
        let userBookingsCreated = 0;
        const targetBookings = bookingsPerUser + Math.floor(Math.random() * 5) - 2; // Some variation

        for (let i = 0; i < targetBookings; i++) {
          let attempts = 0;
          let bookingCreated = false;

          while (!bookingCreated && attempts < 50) {
            // Pick a random spot
            const spot = spots[Math.floor(Math.random() * spots.length)];
            const spotId = spot.id;

            // Decide if past or future booking (70% past, 30% future)
            const isPast = Math.random() < 0.7;
            let startDate, endDate;

            if (isPast) {
              // Past booking
              startDate = randomDate(sixMonthsAgo, yesterday);
            } else {
              // Future booking (at least 1 day ahead)
              startDate = randomDate(tomorrow, sixMonthsAhead);
              if (startDate.getTime() < tomorrow.getTime()) {
                attempts++;
                continue;
              }
            }

            const duration = Math.floor(Math.random() * 6) + 1; // 1-7 days
            endDate = addDays(startDate, duration);

            // Check for conflicts
            const existingBookings = bookingsBySpot.get(spotId) || [];
            if (!hasBookingConflict(existingBookings, startDate, endDate)) {
              const booking = {
                spotId: spotId,
                userId: userId,
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
                createdAt: new Date(),
                updatedAt: new Date()
              };

              bookings.push(booking);
              
              // Track this booking
              if (!bookingsBySpot.has(spotId)) {
                bookingsBySpot.set(spotId, []);
              }
              bookingsBySpot.get(spotId).push({
                startDate: formatDate(startDate),
                endDate: formatDate(endDate)
              });

              userBookingsCreated++;
              bookingCreated = true;
            }
            attempts++;
          }
        }
      }

      if (bookings.length > 0) {
        console.log(`Inserting ${bookings.length} bookings into database...`);
        await queryInterface.bulkInsert('Bookings', bookings, {});
        console.log('Successfully seeded bookings!');
      } else {
        console.log('No bookings were generated.');
      }

    } catch (error) {
      console.error('Error seeding bookings:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Bookings', {}, {});
  }
};
