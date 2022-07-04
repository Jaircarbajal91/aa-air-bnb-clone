'use strict';

const spots = [
  {
    name: 'Place 1',
    description: 'Desert',
    address: '11223 Desert St',
    city: 'Vegas',
    state: 'NV',
    country: 'United States',
    lat: 37.7645358,
    lng: -122.4730327,
    price: 123,
    ownerId: 2
  },
  {
    name: 'Place 2',
    description: 'Island',
    address: '12312 Island St',
    city: 'Honolulu',
    state: 'HI',
    country: 'United States',
    lat: 37.7645358,
    lng: -122.4730327,
    price: 1232,
    ownerId: 1
  },
  {
    name: 'Place 3',
    description: 'Mountain',
    address: '1233 Mountain St',
    city: 'Big Bear',
    state: 'CA',
    country: 'United States',
    lat: 37.7645358,
    lng: -122.4730327,
    price: 123,
    ownerId: 3
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
   await queryInterface.bulkInsert('Spots', spots, {})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete('Spots', {}, {})
  }
};
