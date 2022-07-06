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
        foreignKey: 'spotId', onDelete: 'CASCADE'
      })
      Spot.hasMany(models.Review, {
        foreignKey: 'spotId', as: 'reviews', onDelete: 'CASCADE'
      })
      Spot.hasMany(models.Image, {
        foreignKey: 'spotId', as: 'images', onDelete: 'CASCADE'
      })
      Spot.belongsTo(models.User, {
        foreignKey: 'ownerId', as: 'Owner', onDelete: 'CASCADE'
      })
    }
  }
  Spot.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 50]
      }
    },
    description: {
      type:DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lat: {
      type: DataTypes.FLOAT(3, 15),
    },
    lng: {
      type: DataTypes.FLOAT(3, 15),
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
