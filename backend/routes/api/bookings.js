const express = require('express');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot, User, Review, Image, Booking, sequelize } = require('../../db/models');
const { Op, EmptyResultError } = require("sequelize");
const router = express.Router();

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const user = require('../../db/models/user');


router.get('/auth/:spotId', requireAuth, async (req, res) => {
  const spot = await Spot.findByPk(req.params.spotId)

  if (!spot) {
    return res.status(404).json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    })
  }

  let spotBookings = await Booking.scope(['nonOwner']).findAll({
    where: {
        spotId: req.params.spotId,
    }
  })

  if (spotBookings.length === 0) {
    return res.json({
      "message": "This spot has no bookings yet",
      statusCode: 204
    })
  }

  if (spot.ownerId === req.user.id) {
    spotBookings = await Booking.findAll({
      include: {
        model: User,
        attributes: ['id', 'firstName', 'lastName']
      },
      where: {
          spotId: req.params.spotId,
      }
    })
  }

  res.json(spotBookings)
})

router.get('/auth', requireAuth, async (req, res) => {
  const bookings = await Booking.findAll({
    include: [
      {
        model: Spot
      }
    ],
    where: {
      userId: req.user.id
    }
  })
  if (!bookings.length) {
    return res.status(204).json({
      message: "You have no bookings yet",
      statusCode: 204
    })
  }
  res.json(bookings);
})


router.post('/auth/:spotId', requireAuth, async (req, res) => {
  
})

module.exports = router;
