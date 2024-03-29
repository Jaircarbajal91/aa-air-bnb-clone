const express = require('express');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { Spot, User, Review, Image, Booking, sequelize } = require('../../db/models');
const { Op } = require("sequelize");
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
        spotId: spot.id,
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
          spotId: spot.id,
      }
    })
  }

  res.json({Bookings: spotBookings})
})

router.get('/auth', requireAuth, async (req, res) => {
  const bookings = await Booking.findAll({
    include: [
      {
        model: Spot,
      }
    ],
    where: {
      userId: req.user.id
    }
  })

  let result = []
  for (let booking of bookings) {
    let final = {...booking.toJSON()}
    let spot = final.Spot;
    let user = await User.findByPk(spot.ownerId)
    user = user.toJSON()
    spot.Owner = user
    result.push(final)
  }
  result = result.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
  res.json({Bookings: result});
})


router.post('/auth/:spotId', requireAuth, async (req, res, next) => {
  const spot = await Spot.findByPk(req.params.spotId)

  if (!spot) {
    return res.status(404).json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    })
  }
  const err = {
    "message": "Validation error",
    "statusCode": 400,
    "errors": {}
  }
  const {startDate, endDate} = req.body;
  if (!startDate) err.errors.startDate = "Start date is required"
  if (!endDate) err.errors.endDate = "End date is required"
  if (startDate > endDate) err.errors.endDate = "endDate cannot come before startDate"

  if (!startDate || !endDate || (startDate > endDate)) {
    return res.status(400).json(err)
  }
  const date1 = new Date(endDate).getTime()
  const date2 = new Date().getTime()
  if (date1 < date2) {
    return res.status(400).json({
      "message": "Can't book a spot in the past",
      "statusCode": 400
    })
  }

  const allDates = await Booking.findAll({
    attributes: ['startDate', 'endDate'],
    raw: true,
    where: {
      spotId: spot.id
    }
  })

  err.message = "Sorry, this spot is already booked for the specified dates"
  err.errors = {}
  for (let dates of allDates) {
    let start = dates.startDate
    let end = dates.endDate
    let formattedStart = new Date(start).getTime()
    let formattedEnd = new Date(end).getTime()
    let formattedStartDate = new Date(startDate).getTime()
    let formattedEndDate = new Date(endDate).getTime()
    if ((formattedStartDate >= formattedStart && formattedStartDate <= formattedEnd)) {
      err.errors.startDate = "Start date conflicts with an existing booking"
    }
    if ((formattedEndDate >= formattedStart && formattedEndDate <= formattedEnd)) {
      err.errors.endDate = "End date conflicts with an existing booking"
    }
  }

  if ('endDate' in err.errors || 'startDate' in err.errors) {
    return res.status(400).json({
      "message": "Can't book a spot in the past",
      "statusCode": 400,
      "errors": err.errors
    })
  }

  const booking = await Booking.create({
    spotId: spot.id,
    userId: req.user.id,
    startDate,
    endDate
  })
  res.json(booking);
})


router.put('/auth/:bookingId', requireAuth, async (req, res, next) => {
  const booking = await Booking.findByPk(req.params.bookingId);
  if (!booking) {
    return res.status(404).json({
      "message": "Booking couldn't be found",
      "statusCode": 404
    })
  }
  if (booking.userId !== req.user.id) {
    return res.status(403).json({
      "message": "Forbidden",
      "statusCode": 403
    })
  }
  const {spotId} = booking.toJSON()
  const allDates = await Booking.findAll({
    attributes: ['startDate', 'endDate'],
    raw: true,
    where: {
      spotId
    }
  })

  const err = {
    "message": "Validation error",
    "statusCode": 400,
    errors: {}
  };
  const {startDate, endDate} = req.body;

  if (new Date(booking.endDate) < new Date()) {
    return res.status(400).json({
      "message": "Past bookings can't be modified",
      "statusCode": 400
    })
  }
  if (!startDate) err.errors.startDate = "Start date is required"
  if (!endDate) err.errors.endDate = "End date is required"
  if (startDate > endDate) err.errors.endDate = "endDate cannot come before startDate"

  if (!startDate || !endDate || (startDate > endDate)) {
    return res.status(400).json(err)
  }
  if (new Date(endDate) < new Date()) {
    return res.status(400).json({
      "message": "Cannot set bookings in the past",
      "statusCode": 400
    })
  }


  err.message = "Sorry, this spot is already booked for the specified dates"
  err.statusCode = 403
  err.errors = {}
  for (let dates of allDates) {
    let start = dates.startDate
    let end = dates.endDate
    if ((startDate >= start && startDate <= end)) {
      err.errors.startDate = "Start date conflicts with an existing booking"
    }
    if ((endDate >= start && endDate <= end)) {
      err.errors.endDate = "End date conflicts with an existing booking"
    }
  }

  if ('endDate' in err.errors || 'startDate' in err.errors) {
    return res.status(403).json(err);
  }

  booking.startDate = startDate
  booking.endDate = endDate

  await booking.save()

  res.json(booking)

})

router.delete('/auth/:bookingId', requireAuth, async (req, res) => {
  const booking = await Booking.findByPk(req.params.bookingId);
  if (!booking) {
    return res.status(404).json({
      "message": "Booking couldn't be found",
      "statusCode": 404
    })
  }
  if (booking.userId !== req.user.id) {
    return res.status(403).json({
      "message": "Forbidden",
      "statusCode": 403
    })
  }
  const {startDate} = booking.toJSON()

  if (new Date(startDate).getTime() < new Date().getTime()) {
    return res.status(400).json({
      "message": "Bookings that have been started can't be deleted",
      "statusCode": 400
    })
  }

  await booking.destroy();
  res.status(200).json({
    "message": "Successfully deleted",
    "statusCode": 200
  })
})

module.exports = router;
