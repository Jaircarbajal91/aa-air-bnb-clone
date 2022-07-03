'use strict';

const reviews = [{
  userId: 1,
  spotId: 1,
  review: 'This place ruled!',
  stars: 5.0,
  imageId: 1
},
{
  userId: 2,
  spotId: 2,
  review: 'This place SUCKED!',
  stars: 1.5,
  imageId: 2
},
{
  userId: 3,
  spotId: 3,
  review: 'This place was ok!',
  stars: 3.5,
  imageId: 3
},
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
    await queryInterface.deleteInsert('Reviews', {
      where: userId
    });
  }
};
