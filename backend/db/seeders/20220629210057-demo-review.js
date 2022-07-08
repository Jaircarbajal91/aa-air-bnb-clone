'use strict';

const reviews = [
  {
    userId: 3,
    spotId: 1,
    review: 'This is fine',
    stars: 1,
    imageId: 1
  },
  {
    userId: 2,
    spotId: 1,
    review: 'This is fine',
    stars: 3,
    imageId: 1
  },
  {
    userId: 3,
    spotId: 1,
    review: 'This is fine',
    stars: 4,
    imageId: 1
  },
  {
    userId: 1,
    spotId: 2,
    review: 'This is great',
    stars: 2,
    imageId: 2
  },
  {
    userId: 2,
    spotId: 3,
    review: 'This is amazing',
    stars: 3,
    imageId: 3
  },
  {
    userId: 2,
    spotId: 4,
    review: 'This is amazing',
    stars: 3,
    imageId: 3
  },
  {
    userId: 1,
    spotId: 4,
    review: 'This is fantastic',
    stars: 4,
    imageId: 3
  },
]


module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   await queryInterface.bulkInsert('Reviews', reviews, {})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Reviews', {}, {})
  }
};
