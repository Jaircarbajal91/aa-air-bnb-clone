const express = require('express');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot, User, Review, Image, Booking, sequelize } = require('../../db/models');
const { Op, EmptyResultError } = require("sequelize");
const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const user = require('../../db/models/user');


router.post('/auth/spot/:spotId', requireAuth, async (req, res) => {
  const spot = await Spot.findByPk(req.params.spotId, {
    where: {
      ownerId: req.user.id
    }
  });

  if (!spot) {
    return res.status(404).json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    })
  }
  const {url} = req.body;
  const err = {
    "message": "Validation error",
    "statusCode": 400,
    "errors": {}
  }
  if (!url) {
    err.errors.url = "Image url is required"
    return res.status(400).json(err)
  }

  const allImagesForSpot = await Image.findAll({
    where: {
      [Op.and]: [
        { spotId: req.params.spotId},
        { imageableType: "Spot" }
      ]
    }
  })

  let image = await Image.create({
    url,
    imageableId: allImagesForSpot.length + 1,
    imageableType: "Spot",
    spotId: req.params.spotId
  })
  image = image.toJSON()
  delete image['spotId']
  delete image['reviewId']
  delete image['createdAt']
  delete image['updatedAt']

  res.json(image)
})


router.post('/auth/review/:reviewId', requireAuth, async (req, res) => {
  const review = await Review.findByPk(req.params.reviewId, {
    where: {
      userId: req.user.id
    }
  });

  if (!review) {
    return res.status(404).json({
      "message": "Review couldn't be found",
      "statusCode": 404
    })
  }

  const {url} = req.body;
  const err = {
    "message": "Validation error",
    "statusCode": 400,
    "errors": {}
  }
  if (!url) {
    err.errors.url = "Image url is required"
    return res.status(400).json(err)
  }

  const allReviewsForSpot = await Image.findAll({
    where: {
      [Op.and]: [
        { reviewId: req.params.reviewId},
        { imageableType: "Review" }
      ]
    }
  })

  if (allReviewsForSpot.length > 9) {
    return res.status(400).json({
      "message": "Maximum number of images for this resource was reached",
      "statusCode": 400
    })
  }

  let image = await Image.create({
    url,
    imageableId: allImagesForSpot.length + 1,
    imageableType: "Review",
    reviewId: req.params.reviewId
  })
  image = image.toJSON()
  delete image['spotId']
  delete image['reviewId']
  delete image['createdAt']
  delete image['updatedAt']
  res.json(image)
})


router.delete('/auth/:imageId', requireAuth, async (req, res) => {
  const image = await Image.findByPk(req.params.imageId, {
    where: {
      userId: req.user.id
    }
  })
  if (!image) {
    return res.status(404).json({
      "message": "Image couldn't be found",
      "statusCode": 404
    })
  }
  await image.destroy()
  res.json({
    "message": "Successfully deleted",
    "statusCode": 200
  })
})

module.exports = router
