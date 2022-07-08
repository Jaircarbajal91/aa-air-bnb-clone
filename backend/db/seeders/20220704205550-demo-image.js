'use strict';

const images = [
  {
    url: 'http://cdn.cnn.com/cnnnext/dam/assets/180219103122-zanzibar-and-its-islands---mnemba-a-view-from-the-sky-mnemba-island-lodge.jpg',
    spotId: 2,
    reviewId: 1,
    imageableId: 1,
    imageableType: "Spot"
  },
  {
    url: 'https://cdn.britannica.com/67/19367-050-885866B4/Valley-Taurus-Mountains-Turkey.jpg',
    spotId: 2,
    reviewId: 2,
    imageableId: 2,
    imageableType: "Spot"
  },
  {
    url: 'https://cdn.mos.cms.futurecdn.net/CbivdLKKTLVsjak9RDT9J5.jpg',
    spotId: 1,
    reviewId: 1,
    imageableId: 1,
    imageableType: "Review"
  },
  {
    url: 'https://cdn.mos.cms.futurecdn.net/CbivdLKKTLVsjak9RDT9J5.jpg',
    spotId: 3,
    reviewId: null,
    imageableId: 1,
    imageableType: "Spot"
  },
  {
    url: 'https://cdn.mos.cms.futurecdn.net/CbivdLKKTLVsjak9RDT9J5.jpg',
    spotId: 1,
    reviewId: 1,
    imageableId: 2,
    imageableType: "Review"
  },
  {
    url: 'https://cdn.mos.cms.futurecdn.net/CbivdLKKTLVsjak9RDT9J5.jpg',
    spotId: 4,
    reviewId: null,
    imageableId: 1,
    imageableType: "Spot"
  },
]

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Images',images, {})
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     */
    await queryInterface.bulkDelete('Images', {}, {});
  }
};
