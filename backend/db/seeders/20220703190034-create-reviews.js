'use strict';

const reviews = [{
  userId: 1,
  spotId: 1,
  review: 'This place ruled!',
  stars: 5.0,
  imageId: 1
}
]
module.exports = {
  async up(queryInterface, Sequelize) {
    // try {
      await queryInterface.bulkInsert('Reviews', reviews, {});
    // } catch (err) {
    //   console.log(err);
    //   throw err;
    // }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Reviews', {
      where: userId
    });
  }
};
