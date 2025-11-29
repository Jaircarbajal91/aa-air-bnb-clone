require('dotenv').config();
const config = require(".");

module.exports = {
  development: {
    storage: config.dbFile || 'db/dev.db',
    dialect: 'sqlite',
    seederStorage: 'sequelize',
    logQueryParameters: true,
    typValications: true,
    benchmark: true,
    // logging: (...msg) => console.log(msg),
    logging: false
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    seederStorage: 'sequelize',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
}
