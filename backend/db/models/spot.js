'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Spot.hasMany(models.Booking, {
        foreignKey: 'spotId', onDelete: 'SET NULL'
      })
      Spot.hasMany(models.Review, {
        foreignKey: 'spotId', as: 'reviews', onDelete: 'SET NULL'
      })
      Spot.hasMany(models.Image, {
        foreignKey: 'spotId', as: 'images', onDelete: 'SET NULL'
      })
      Spot.belongsTo(models.User, {
        foreignKey: 'ownerId', as: 'Owner', onDelete: 'SET NULL'
      })
    }
  }
  Spot.init({
    name: {
      type: DataTypes.STRING,
    },
    description: {
      type:DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    lat: {
      type: DataTypes.FLOAT,
    },
    lng: {
      type: DataTypes.FLOAT,
    },
    price: {
      type: DataTypes.DECIMAL,
    },
    ownerId: {
      type: DataTypes.INTEGER,
    },
    previewImage: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};
