const express = require('express');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot, User, Review, Image, sequelize } = require('../../db/models');
const router = express.Router();
const { Op, EmptyResultError } = require("sequelize");
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const user = require('../../db/models/user');
const { multiplePublicFileUpload, singlePublicFileUpload, singleMulterUpload, multipleMulterUpload, s3 } = require('../../awsS3')

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
  const spot = await Spot.findByPk(req.params.spotId)
  if (!spot) {
    return res.status(404).json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    })
  }
  const images = await Image.findAll({
    where: {
      spotId: req.params.spotId
    }
  })
  const reviews = await Review.findAll({
    where: {
      spotId: req.params.spotId
    }
  })


  let sum = 0;
  let avg = 0;
  if (reviews.length) {
    for (let review of reviews) {
      sum += review.stars;
    }
    avg = (sum / reviews.length).toFixed(1);
  }

  const result = spot.toJSON()
  const user = await User.findByPk(spot.ownerId, {
    attributes: {
      exclude: ['username']
    }
  });

  result.numReviews = reviews.length;
  result.avgStarRating = avg;
  result.Images = images
  result.Owner = user
  res.json(result);
})

router.get('/', async (req, res) => {

  const pagination = {
    options: []
  }
  let { page, size, maxLat, minLat, minLng, maxLng, minPrice, maxPrice } = req.query;
  const err = {
    "message": "Validation Error",
    "statusCode": 400,
    "errors": {}
  }

  page = Number(page);
  size = Number(size);


  if (Number.isNaN(page)) page = 0;
  if (Number.isNaN(size)) size = 100;

  if (page > 10) page = 10
  if (size > 100) size = 100

  if (page < 0) err.errors.page = "Page must be greater than or equal to 0"
  if (size < 0) err.errors.size = "Size must be greater than or equal to 0"
  if (Number(maxLat) > 90) {
    err.errors.maxLat = "Maximum latitude is invalid"
    maxLat = false
  }
  if (Number(minLat) < -90) {
    err.errors.maxLat = "Minimum latitude is invalid"
    minLng = false
  }
  if (Number(maxLng) > 180) {
    err.errors.maxLng = "Maximum longitude is invalid"
    maxLng = false
  }
  if (Number(minLng) < -180) {
    err.errors.minLng = "Minimum longitude is invalid"
    minLng = false
  }
  if (Number(minPrice) < 0) {
    err.errors.minPrice = "Maximum price must be greater than 0"
    minPrice = false
  }
  if (Number(maxPrice) < 0) {
    err.errors.maxPrice = "Minimum price must be greater than 0"
    maxPrice = false
  }

  if (page < 0 || size < 0 || (!maxLat && maxLat !== undefined) || (!minLat && minLat !== undefined) || (!maxLng && maxLng !== undefined) || (!minLng && minLng !== undefined) || (!minPrice && minPrice !== undefined) || (!maxPrice && maxPrice !== undefined)) {
    return res.status(400).json(err)
  }

  if (maxLat) {
    pagination.options.push(
      {
        lat: { [Op.lte]: Number(maxLat) }
      }
    )
  }
  if (minLat) {
    pagination.options.push(
      {
        lat: { [Op.gte]: Number(minLat) }
      }
    )
  }
  if (minLng) {
    pagination.options.push(
      {
        lng: { [Op.gte]: Number(minLng) }
      }
    )
  }
  if (maxLng) {
    pagination.options.push(
      {
        lng: { [Op.lte]: Number(maxLng) }
      }
    )
  }
  if (minPrice) {
    pagination.options.push(
      {
        price: { [Op.gte]: Number(minPrice) }
      }
    )
  }
  if (maxPrice) { pagination.options.push({ price: { [Op.lte]: Number(maxPrice) } }) }

  pagination.size = size
  pagination.page = page


  const spots = await Spot.findAll({
    where: {
      [Op.and]: pagination.options
    },
    include: [
      {
        model: Review
      },
      {
        model: Image
      }
    ],
    limit: pagination.size || 100,
    offset: pagination.size * pagination.page
  })

  spots.forEach(async (spot, i) => {
    let result = {}
    spot = spot.toJSON()
    let sum = 0;
    let avg = 0;
    let reviews = spot.Reviews
    if (reviews.length) {
      for (let review of reviews) {
        sum += review.stars;
      }
      avg = (sum / reviews.length).toFixed(1);
      spot.numReviews = reviews.length;
      spot.avgStarRating = avg;
      delete spot.Reviews
      result = { ...spot }
      spots[i] = result;
    } else {
      spot.numReviews = reviews.length;
      spot.avgStarRating = "0";
      delete spot.Reviews
      result = { ...spot }
      spots[i] = result;
    }
  })

  res.json({
    Spots: spots,
    page: pagination.page,
    size: pagination.size || 100,
  })
})

router.post('/auth', multipleMulterUpload("images"), requireAuth, async (req, res, next) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const spotImages = await multiplePublicFileUpload(req.files);
  const previewImage = spotImages.shift()
  const error = {
    "message": "Validation Error",
    "statusCode": 400,
    "errors": {}
  }

  if (!address) error.errors.address = "Street address is required"
  if (!city) error.errors.city = "City is required"
  if (!state) error.errors.state = "State is required"
  if (!country) error.errors.country = "Country is required"
  if (!lat) error.errors.lat = "Latitude is required"
  if (Number(lat) > 90 || Number(lat) < -90) error.errors.lat = "Latitude is not valid"
  if (!lng) error.errors.lng = "Longitude is required"
  if (Number(lng) > 180 || Number(lng) < -180) error.errors.lat = "Longitude is not valid"
  if (!name) error.errors.name = "Name is required"
  if (name?.length > 50) error.errors.name = "Name must be less than 50 characters"
  if (!description) error.errors.description = "Description is required"
  if (!price) error.errors.price = "Price per day is required"
  if (!previewImage) error.errors.previewImage = 'Preview image is required'

  if (!address || !city || !state || !country || !lat || !lng || !name || !description || !price || name?.length > 50 || (Number(lat) > 90 || Number(lat) < -90) || (Number(lng) > 180 || Number(lng) < -180) || !previewImage) {
    res.statusCode = 400;
    console.log(error.errors)
    return res.json(error);
  }

  const checkSpots = await Spot.findOne({
    where: {
      address
    }
  })

  if (checkSpots) {
    const err = new Error('Address already exists')
    err.status = 400
    err.errors = [err.message]
    next(err)
  }

  let spot = await Spot.create({
    ownerId: req.user.id,
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
    previewImage
  });

  spot = spot.toJSON()
  for (let i = 0; i < spotImages.length; i++) {
    await Image.create({
      url: spotImages[i],
      spotId: spot.id,
      imageableType: "Spot",
      imageableId: i
    })
  }
  let allSpotImagesArr = await Image.findAll({
    where: {
      spotId: spot.id
    }
  })
  spot.Images = allSpotImagesArr
  res.status(201).json(spot);
})

router.put('/auth/:spotId', multipleMulterUpload("images"), requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { address, city, state, country, lat, lng, name, description, price, imagesToDelete } = req.body;
  let spot = await Spot.findByPk(spotId);

  let previewImageDeleted = false;
  if (Array.isArray(imagesToDelete)) {
    for (let image of imagesToDelete) {
      const imageToDelete = await Image.findOne({
        where: {
          url: image
        }
      })
      if (imageToDelete) {
        await imageToDelete.destroy()
      }
      console.log(image)
      const splitUrl = image.split('/')
      const key = splitUrl[splitUrl.length - 1]
      const params = {
        Bucket: 'jair-bnb',
        Key: key
      };
      s3.deleteObject(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
      });
      if (image === spot.previewImage) {
        previewImageDeleted = true
      }
    }
  } else if (typeof imagesToDelete === 'string') {
    const splitUrl = imagesToDelete.split('/')
      const key = splitUrl[splitUrl.length - 1]
      const params = {
        Bucket: 'jair-bnb',
        Key: key
      };
      s3.deleteObject(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
      });
    previewImageDeleted = true
  }

  const spotImages = await multiplePublicFileUpload(req.files);
  let newPreviewImage;
  let previewImage = spot.previewImage
  if (previewImageDeleted) {
    newPreviewImage = spotImages.shift()
  }

  if (!spot) {
    return res.status(404).json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    })
  }
  if (spot.ownerId !== req.user.id) {
    return res.status(403).json({
      "message": "Forbidden",
      "statusCode": 403
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
  if (!lat) error.errors.lat = "Latitude is required"
  if (Number(lat) > 90 || Number(lat) < -90) error.errors.lat = "Latitude is not valid"
  if (!lng) error.errors.lng = "Longitude is required"
  if (Number(lng) > 180 || Number(lng) < -180) error.errors.lat = "Longitude is not valid"
  if (!name) error.errors.name = "Name is required"
  if (name?.length > 50) error.errors.name = "Name must be less than 50 characters"
  if (!description) error.errors.description = "Description is required"
  if (!price) error.errors.price = "Price per day is required"
  if (!previewImage) error.errors.previewImage = "Preview Image is required"

  if (!address || !city || !state || !country || !lat || !lng || !name || !description || !price || !previewImage || name?.length > 50 || (Number(lat) > 90 || Number(lat) < -90) || (Number(lng) > 180 || Number(lng) < -180)) {
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
  spot.previewImage = previewImage
  spot.country = country
  previewImageDeleted ? spot.previewImage = newPreviewImage : spot.previewImage = previewImage


  for (let i = 0; i < spotImages.length; i++) {
    await Image.create({
      url: spotImages[i],
      spotId,
      imageableType: "Spot",
      imageableId: i
    })
  }
  let allSpotImagesArr = await Image.findAll({
    where: {
      spotId
    }
  })

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

  if (spot.ownerId !== req.user.id) {
    return res.status(403).json({
      "message": "Forbidden",
      "statusCode": 403
    })
  }
  const Images = await Image.findAll({
    where: {
      spotId: req.params.spotId
    }
  })

  for (let image of Images) {
    const jsonImage = image.toJSON()
    const splitUrl = jsonImage.url.split('/')
    const key = splitUrl[splitUrl.length - 1]
    const params = {
      Bucket: 'jair-bnb',
      Key: key
    };
    s3.deleteObject(params, function (err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else console.log(data);           // successful response
    });

  }

  let splitUrl = spot.previewImage.split('/')
  const key = splitUrl[splitUrl.length - 1]
  const params = {
    Bucket: 'jair-bnb',
    Key: key
  };
  s3.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data);           // successful response
  });

  await spot.destroy()
  res.status(200).json({
    "message": "Successfully deleted",
    "statusCode": 200
  })
})

module.exports = router;
