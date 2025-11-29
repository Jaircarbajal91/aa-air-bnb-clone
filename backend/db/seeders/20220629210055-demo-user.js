'use strict';
const bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      {
        email: 'demo@user.io',
        username: 'Demo-lition',
        hashedPassword: bcrypt.hashSync('password'),
        firstName: 'demo',
        lastName: 'lition',
        token: 'asdfasssssdfa'
      },
      {
        email: 'user1@user.io',
        username: 'FakeUser1',
        hashedPassword: bcrypt.hashSync('password2'),
        firstName: 'fake',
        lastName: 'user',
        token: 'asdfasdfa'
      },
      {
        email: 'user2@user.io',
        username: 'FakeUser2',
        hashedPassword: bcrypt.hashSync('password3'),
        firstName: 'third',
        lastName: 'entry',
        token: 'asdfasdfas'
      },
      {
        email: 'sarah.johnson@user.io',
        username: 'SarahJ',
        hashedPassword: bcrypt.hashSync('password4'),
        firstName: 'Sarah',
        lastName: 'Johnson',
        token: 'token4'
      },
      {
        email: 'michael.chen@user.io',
        username: 'MikeChen',
        hashedPassword: bcrypt.hashSync('password5'),
        firstName: 'Michael',
        lastName: 'Chen',
        token: 'token5'
      },
      {
        email: 'emily.rodriguez@user.io',
        username: 'EmilyR',
        hashedPassword: bcrypt.hashSync('password6'),
        firstName: 'Emily',
        lastName: 'Rodriguez',
        token: 'token6'
      },
      {
        email: 'david.kim@user.io',
        username: 'DavidK',
        hashedPassword: bcrypt.hashSync('password7'),
        firstName: 'David',
        lastName: 'Kim',
        token: 'token7'
      },
      {
        email: 'jessica.martinez@user.io',
        username: 'JessM',
        hashedPassword: bcrypt.hashSync('password8'),
        firstName: 'Jessica',
        lastName: 'Martinez',
        token: 'token8'
      },
      {
        email: 'robert.taylor@user.io',
        username: 'RobT',
        hashedPassword: bcrypt.hashSync('password9'),
        firstName: 'Robert',
        lastName: 'Taylor',
        token: 'token9'
      },
      {
        email: 'amanda.williams@user.io',
        username: 'AmandaW',
        hashedPassword: bcrypt.hashSync('password10'),
        firstName: 'Amanda',
        lastName: 'Williams',
        token: 'token10'
      },
      {
        email: 'james.brown@user.io',
        username: 'JamesB',
        hashedPassword: bcrypt.hashSync('password11'),
        firstName: 'James',
        lastName: 'Brown',
        token: 'token11'
      },
      {
        email: 'lisa.anderson@user.io',
        username: 'LisaA',
        hashedPassword: bcrypt.hashSync('password12'),
        firstName: 'Lisa',
        lastName: 'Anderson',
        token: 'token12'
      },
      {
        email: 'chris.thomas@user.io',
        username: 'ChrisT',
        hashedPassword: bcrypt.hashSync('password13'),
        firstName: 'Chris',
        lastName: 'Thomas',
        token: 'token13'
      },
      {
        email: 'nicole.jackson@user.io',
        username: 'NicoleJ',
        hashedPassword: bcrypt.hashSync('password14'),
        firstName: 'Nicole',
        lastName: 'Jackson',
        token: 'token14'
      },
      {
        email: 'ryan.white@user.io',
        username: 'RyanW',
        hashedPassword: bcrypt.hashSync('password15'),
        firstName: 'Ryan',
        lastName: 'White',
        token: 'token15'
      },
      {
        email: 'michelle.harris@user.io',
        username: 'MichelleH',
        hashedPassword: bcrypt.hashSync('password16'),
        firstName: 'Michelle',
        lastName: 'Harris',
        token: 'token16'
      },
      {
        email: 'kevin.martin@user.io',
        username: 'KevinM',
        hashedPassword: bcrypt.hashSync('password17'),
        firstName: 'Kevin',
        lastName: 'Martin',
        token: 'token17'
      },
      {
        email: 'ashley.thompson@user.io',
        username: 'AshleyT',
        hashedPassword: bcrypt.hashSync('password18'),
        firstName: 'Ashley',
        lastName: 'Thompson',
        token: 'token18'
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete('Users', {
      username: { 
        [Op.in]: [
          'Demo-lition', 'FakeUser1', 'FakeUser2', 'SarahJ', 'MikeChen', 
          'EmilyR', 'DavidK', 'JessM', 'RobT', 'AmandaW', 'JamesB', 
          'LisaA', 'ChrisT', 'NicoleJ', 'RyanW', 'MichelleH', 'KevinM', 'AshleyT'
        ] 
      }
    }, {});
  }
};
