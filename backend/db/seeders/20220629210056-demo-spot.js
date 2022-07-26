'use strict';

const spots = [
  {
    name: 'Joshua Tree Luxury',
    description: 'Luxury Home in Desert Retreat',
    address: '11223 Desert St',
    city: 'Vegas',
    state: 'NV',
    country: 'United States',
    lat: 37.7645358,
    lng: -122.4730327,
    price: 450,
    ownerId: 2,
    previewImage: 'https://media.architecturaldigest.com/photos/55e7745fcd709ad62e8f16cd/16:9/w_896,h_504,c_limit/dam-images-decor-2015-07-desert-exteriors-desert-exteriors-01-wm.jpg'
  },
  {
    name: 'Isolate Luxury Manion',
    description: 'Luxury Manion on Honolulu Island',
    address: '12312 Island St',
    city: 'Honolulu',
    state: 'HI',
    country: 'United States',
    lat: 37.7645358,
    lng: -122.4730327,
    price: 4500,
    ownerId: 1,
    previewImage: 'https://img.gtsstatic.net/reno/imagereader.aspx?imageurl=https%3A%2F%2Fsir.azureedge.net%2F1103i215%2F5gfymq0hcqmfmz6f8gscybcd05i215&option=N&h=472&permitphotoenlargement=false'
  },
  {
    name: 'Modern TreeHouse',
    description: 'Modern treehouse in the heart of Topanga canyon',
    address: '1233 Mountain St',
    city: 'Big Bear',
    state: 'CA',
    country: 'United States',
    lat: 37.7645358,
    lng: -122.4730327,
    price: 123,
    ownerId: 3,
    previewImage: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'
  },
  {
    name: 'Place 4',
    description: 'City',
    address: '32 Washington Pl,',
    city: 'New York',
    state: 'New York',
    country: 'United States',
    lat: 37.7645358,
    lng: -122.4730327,
    price: 123,
    ownerId: 2,
    previewImage: 'https://pi.movoto.com/p/202/OC22162677_0_UVIjEY_p.jpeg'
  },
  {
    name: 'Box Home',
    description: 'Suburbs',
    address: '1233 Beverly Hills',
    city: 'Los Angeles',
    state: 'California',
    country: 'United States',
    lat: 37.7645358,
    lng: -122.4730327,
    price: 123,
    ownerId: 2,
    previewImage: 'https://pi.movoto.com/p/202/OC22162677_0_UVIjEY_p.jpeg'
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
