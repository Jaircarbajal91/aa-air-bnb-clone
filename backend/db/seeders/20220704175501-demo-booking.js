'use strict';

let today = new Date().toISOString().split('T')[0]

const bookings = [
  {
    spotId: 1,
    userId: 1,
    startDate: today,
    endDate: today
  },
  {
    spotId: 2,
    userId: 2,
    startDate: today,
    endDate: today
  },
  {
    spotId: 3,
    userId: 3,
    startDate: today,
    endDate: today
  },
]

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
   await queryInterface.bulkInsert('Bookings', bookings, {})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete('Bookings', {}, {})
  }
};
