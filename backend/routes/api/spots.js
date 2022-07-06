const express = require('express');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot, User, Review, Image, sequelize } = require('../../db/models');
const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const user = require('../../db/models/user');


router.get('/auth', requireAuth, async (req, res) => {
  const { id } = req.user
  const spot = await Spot.findAll({
    where: {
      ownerId: id
    }
  })
  res.json(spot)
})

router.get('/:spotId', async (req, res) => {
  const spot = await Spot.findByPk(req.params.spotId, {
    include: [
      {
        model: Review,
        as: 'reviews',
        attributes: []
      },
      {
        model: Image,
        as: 'images',
        attributes: ['url']
      },
      {
        model: User,
        as: 'Owner',
        attributes: ['id', 'firstName', 'lastName']
      }
    ],
    attributes: {
      include: [
        [sequelize.fn('COUNT', sequelize.col('Reviews.id')), 'numReviews'],
        [sequelize.fn('AVG', sequelize.col('Reviews.stars')), 'avgStarRating'],
      ]
    }
  });

  const spotData = spot.toJSON()
  spotData.avgStarRating = Number(spotData.avgStarRating.toFixed(1))


  if (!spot.id) {
    res.statusCode = 404;
    return res.json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    })
  }
  res.json(spotData);
})

router.get('/', async (req, res) => {
  const spots = await Spot.findAll()
  res.json(spots)
})

router.post('/auth', requireAuth, async (req, res) => {
  const {address, city, state, country, lat, lng, name, description, price} = req.body;

  const error = {
    "message": "Validation Error",
    "statusCode": 400,
    "errors": {}
  }

  if (!address) error.errors.address = "Street address is required"
  if (!city) error.errors.city = "City is required"
  if (!state) error.errors.state = "State is required"
  if (!country) error.errors.country = "Country is required"
  if (!lat) error.errors.lat = "Latitude is not valid"
  if (!lng) error.errors.lng = "Longitude is not valid"
  if (!name) error.errors.name = "Name must be less than 50 characters"
  if (!description) error.errors.description = "Description is required"
  if (!price) error.errors.price = "Price per day is required"

  if (!address || !city || !state || !country || !lat || !lng || !name || !description || !price) {
    res.statusCode = 400;
    return res.json(error);
  }

  const spot = await Spot.create({
    ownerId: req.user.id,
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price
  });

  res.status(201).json(spot);
})

router.put('/auth/:spotId', requireAuth, async (req, res) => {
  const {spotId} = req.params;
  const {address, city, state, country, lat, lng, name, description, price} = req.body;
  const spot = await Spot.findByPk(spotId);

  if (!spot) {
    return res.status(404).json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    })
  }

  const error = {
    "message": "Validation Error",
    "statusCode": 400,
    "errors": {}
  }

  if (!address) error.errors.address = "Street address is required"
  if (!city) error.errors.city = "City is required"
  if (!state) error.errors.state = "State is required"
  if (!country) error.errors.country = "Country is required"
  if (!lat) error.errors.lat = "Latitude is not valid"
  if (!lng) error.errors.lng = "Longitude is not valid"
  if (!name) error.errors.name = "Name must be less than 50 characters"
  if (!description) error.errors.description = "Description is required"
  if (!price) error.errors.price = "Price per day is required"

  if (!address || !city || !state || !country || !lat || !lng || !name || !description || !price) {
    res.statusCode = 400;
    return res.json(error);
  }

  spot.address = address
  spot.city = city
  spot.state = state
  spot.lat = lat
  spot.lng = lng
  spot.name = name
  spot.description = description
  spot.price = price

  await spot.save()
  res.status(200).json(spot);
})

router.delete('/auth/:spotId', requireAuth, async (req, res) => {
  const spot = await Spot.findByPk(req.params.spotId);
  if (!spot) {
    return res.status(404).json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    })
  }
  await spot.destroy()
  res.status(200).json({
    "message": "Successfully deleted",
    "statusCode": 200
  })
})

module.exports = router;