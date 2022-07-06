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
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('*')), 'numReviews'],
          [sequelize.fn('AVG', sequelize.col('stars')), 'avgStarRating']
        ]
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
    ]
  });


  if (!spot.id) {
    res.statusCode = 404;
    return res.json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    })
  }
  res.json(spot);
})

router.get('/', async (req, res) => {
  const spots = await Spot.findAll()
  res.json(spots)
})

module.exports = router;
