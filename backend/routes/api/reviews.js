const express = require('express');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot, User, Review, Image, sequelize } = require('../../db/models');
const { Op } = require("sequelize");
const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const user = require('../../db/models/user');


router.get('/auth', requireAuth, async (req, res) => {
  const {id} = req.user;

  const reviews = await Review.findAll({
    include: [
      {
        model: Spot,
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'previewImage']
        }
      },
      {
        model: Image,
        attributes: ['url']
      }
    ],
    where: {
      userId: id
    }
  })
  res.json(reviews)
})

router.get('/:spotId', async (req, res) => {
  const reviews = await Review.findAll({
    include: [
      {
        model: Image,
        attributes: ['url']
      }
    ],
    where: {
      spotId: req.params.spotId
    }
  })
  if (!reviews.length) {
    return res.status(404).json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    })
  }
  res.json({Reviews:reviews})
})

router.post('/auth/:spotId', requireAuth, async (req, res) => {
  const {review, stars} = req.body;
  const err = {
    "message": "Validation error",
    "statusCode": 400,
    "errors": {}
  }

  const spot = await Spot.findByPk(req.params.spotId);
  if (!spot) {
    return res.status(404).json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    });
  }

  const checkReview = await Review.findAll({
    where: {
      [Op.and]: [
        { spotId: req.params.spotId},
        { userId: req.user.id }
      ]
    }
  })
  if (checkReview.length >= 1) {
    return res.status(403).json({
      "message": "User already has a review for this spot",
      "statusCode": 403
    });
  }

  if (!review) err.errors.review = "Review text is required"
  if (!stars) err.errors.stars = "Stars must be an integer from 1 to 5"
  if (!review || !stars) {
    return res.status(400).json(err);
  }



  const newReview = await Review.create({
    review,
    stars,
    spotId: req.params.spotId,
    userId: req.user.id
  })
  res.json(newReview)
})

router.put('/auth/:reviewId', requireAuth, async (req, res) => {
  const reviewToUpdate = await Review.findByPk(req.params.reviewId);
  const {review, stars} = req.body

  if (!reviewToUpdate || reviewToUpdate.userId !== req.user.id) {
    return res.status(404).json({
      "message": "Review couldn't be found",
      "statusCode": 404
    })
  }


  const err = {
    "message": "Validation error",
    "statusCode": 400,
    "errors": {}
  }
  if (!review) err.errors.review = "Review text is required"
  if (!stars) err.errors.stars = "Stars must be an integer from 1 to 5"
  if (!review || !stars) {
    return res.status(400).json(err);
  }

  reviewToUpdate.review = review
  reviewToUpdate.stars = stars
  await reviewToUpdate.save()
  res.json(reviewToUpdate);
})

router.delete('/auth/:reviewId', requireAuth, async (req, res) => {
  const review = await Review.findByPk(req.params.reviewId);

  if (!review || review.userId !== req.user.id) {
    return res.status(404).json({
      "message": "Review couldn't be found",
      "statusCode": 404
    })
  }

  await review.destroy()
  res.json({
    "message": "Successfully deleted",
    "statusCode": 200
  })
})

module.exports = router;
