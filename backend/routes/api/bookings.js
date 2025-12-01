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
  
  // Ensure bookings are at least 1 day ahead (start date must be tomorrow or later)
  // Use UTC dates consistently to avoid timezone issues across different server/client timezones
  
  // Parse date string as UTC date (YYYY-MM-DD format)
  const parseUTCDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number)
    // Create date in UTC to avoid timezone issues
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
    return date
  }
  
  // Get today's date in UTC as YYYY-MM-DD string and parse it consistently
  const now = new Date()
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
  const todayStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
  const tomorrow = new Date(todayUTC)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  
  const startDateObj = parseUTCDate(startDate)
  const endDateObj = parseUTCDate(endDate)
  
  // Check if start date is at least tomorrow (or today if it's early enough in the day)
  // Allow same-day bookings if it's before 2 PM UTC (gives users in earlier timezones a chance)
  const currentHourUTC = now.getUTCHours()
  const allowSameDay = currentHourUTC < 14 // Before 2 PM UTC
  
  if (startDateObj.getTime() < todayUTC.getTime()) {
    // Start date is in the past
    return res.status(400).json({
      "message": "Start date must be at least 1 day in advance",
      "statusCode": 400
    })
  } else if (startDateObj.getTime() === todayUTC.getTime() && !allowSameDay) {
    // Start date is today but it's too late in the day
    return res.status(400).json({
      "message": "Start date must be at least 1 day in advance",
      "statusCode": 400
    })
  } else if (startDateObj.getTime() < tomorrow.getTime() && startDateObj.getTime() !== todayUTC.getTime()) {
    // This shouldn't happen, but just in case
    return res.status(400).json({
      "message": "Start date must be at least 1 day in advance",
      "statusCode": 400
    })
  }
  
  // Check if end date is in the past
  if (endDateObj.getTime() < todayUTC.getTime()) {
    return res.status(400).json({
      "message": "Can't book a spot in the past",
      "statusCode": 400
    })
  }

  // Check that end date is at least 1 day after start date
  const minEndDate = new Date(startDateObj)
  minEndDate.setDate(minEndDate.getDate() + 1)
  minEndDate.setHours(0, 0, 0, 0, 0)
  
  if (endDateObj.getTime() <= startDateObj.getTime()) {
    return res.status(400).json({
      "message": "Validation error",
      "statusCode": 400,
      "errors": {
        "endDate": "Check-out date must be at least 1 day after check-in date"
      }
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
  
  // Normalize dates to midnight for accurate comparison
  const newStartTime = startDateObj.getTime()
  const newEndTime = endDateObj.getTime()
  
  // Helper to parse date strings from database as UTC dates
  const parseDbDate = (dateString) => {
    // dateString might be a Date object or string
    if (dateString instanceof Date) {
      const date = new Date(dateString)
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))
    }
    const dateStr = dateString.toString()
    if (dateStr.includes('T')) {
      // ISO format with time - parse and convert to UTC date
      const date = new Date(dateStr)
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))
    }
    // YYYY-MM-DD format - parse as UTC
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  }
  
  for (let dates of allDates) {
    const existingStart = parseDbDate(dates.startDate)
    const existingEnd = parseDbDate(dates.endDate)
    
    const existingStartTime = existingStart.getTime()
    const existingEndTime = existingEnd.getTime()
    
    // Check for date overlap conflicts
    // Case 1: New booking starts within existing booking
    if (newStartTime >= existingStartTime && newStartTime <= existingEndTime) {
      err.errors.startDate = "Start date conflicts with an existing booking"
    }
    // Case 2: New booking ends within existing booking
    if (newEndTime >= existingStartTime && newEndTime <= existingEndTime) {
      err.errors.endDate = "End date conflicts with an existing booking"
    }
    // Case 3: New booking completely encompasses existing booking
    if (newStartTime <= existingStartTime && newEndTime >= existingEndTime) {
      if (!err.errors.startDate) {
        err.errors.startDate = "These dates conflict with an existing booking"
      }
      if (!err.errors.endDate) {
        err.errors.endDate = "These dates conflict with an existing booking"
      }
    }
    // Case 4: Existing booking completely encompasses new booking
    if (existingStartTime <= newStartTime && existingEndTime >= newEndTime) {
      if (!err.errors.startDate) {
        err.errors.startDate = "These dates conflict with an existing booking"
      }
      if (!err.errors.endDate) {
        err.errors.endDate = "These dates conflict with an existing booking"
      }
    }
  }

  if ('endDate' in err.errors || 'startDate' in err.errors) {
    return res.status(400).json({
      "message": "Sorry, this spot is already booked for the specified dates",
      "statusCode": 400,
      "errors": err.errors
    })
  }

  // Check if user already has a booking that overlaps with these dates (across all spots)
  const userBookings = await Booking.findAll({
    attributes: ['id', 'startDate', 'endDate', 'spotId'],
    raw: true,
    where: {
      userId: req.user.id
    }
  })

  const userOverlapErr = {
    "message": "You already have a booking that overlaps with these dates",
    "statusCode": 400,
    "errors": {}
  }

  let hasUserOverlap = false

  for (let existingBooking of userBookings) {
    const existingStart = parseDbDate(existingBooking.startDate)
    const existingEnd = parseDbDate(existingBooking.endDate)

    const existingStartTime = existingStart.getTime()
    const existingEndTime = existingEnd.getTime()

    // Check for any overlap
    // Case 1: New booking starts within existing booking
    if (newStartTime >= existingStartTime && newStartTime <= existingEndTime) {
      userOverlapErr.errors.startDate = "You already have a booking that overlaps with these dates"
      hasUserOverlap = true
    }
    // Case 2: New booking ends within existing booking
    if (newEndTime >= existingStartTime && newEndTime <= existingEndTime) {
      userOverlapErr.errors.endDate = "You already have a booking that overlaps with these dates"
      hasUserOverlap = true
    }
    // Case 3: New booking completely encompasses existing booking
    if (newStartTime <= existingStartTime && newEndTime >= existingEndTime) {
      if (!userOverlapErr.errors.startDate) {
        userOverlapErr.errors.startDate = "You already have a booking that overlaps with these dates"
      }
      if (!userOverlapErr.errors.endDate) {
        userOverlapErr.errors.endDate = "You already have a booking that overlaps with these dates"
      }
      hasUserOverlap = true
    }
    // Case 4: Existing booking completely encompasses new booking
    if (existingStartTime <= newStartTime && existingEndTime >= newEndTime) {
      if (!userOverlapErr.errors.startDate) {
        userOverlapErr.errors.startDate = "You already have a booking that overlaps with these dates"
      }
      if (!userOverlapErr.errors.endDate) {
        userOverlapErr.errors.endDate = "You already have a booking that overlaps with these dates"
      }
      hasUserOverlap = true
    }
  }

  if (hasUserOverlap) {
    return res.status(400).json(userOverlapErr)
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
    attributes: ['id', 'startDate', 'endDate'],
    raw: true,
    where: {
      spotId,
      id: { [Op.ne]: booking.id } // Exclude the current booking being updated
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
  
  // Ensure bookings are at least 1 day ahead (start date must be tomorrow or later)
  // Use UTC dates consistently to avoid timezone issues across different server/client timezones
  
  // Parse date string as UTC date (YYYY-MM-DD format)
  const parseUTCDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number)
    // Create date in UTC to avoid timezone issues
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
    return date
  }
  
  // Get today's date in UTC as YYYY-MM-DD string and parse it consistently
  const now = new Date()
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
  const todayStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
  const tomorrow = new Date(todayUTC)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  
  const startDateObj = parseUTCDate(startDate)
  const endDateObj = parseUTCDate(endDate)
  
  // Check if start date is at least tomorrow (or today if it's early enough in the day)
  // Allow same-day bookings if it's before 2 PM UTC (gives users in earlier timezones a chance)
  const currentHourUTC = now.getUTCHours()
  const allowSameDay = currentHourUTC < 14 // Before 2 PM UTC
  
  if (startDateObj.getTime() < todayUTC.getTime()) {
    // Start date is in the past
    return res.status(400).json({
      "message": "Start date must be at least 1 day in advance",
      "statusCode": 400
    })
  } else if (startDateObj.getTime() === todayUTC.getTime() && !allowSameDay) {
    // Start date is today but it's too late in the day
    return res.status(400).json({
      "message": "Start date must be at least 1 day in advance",
      "statusCode": 400
    })
  } else if (startDateObj.getTime() < tomorrow.getTime() && startDateObj.getTime() !== todayUTC.getTime()) {
    // This shouldn't happen, but just in case
    return res.status(400).json({
      "message": "Start date must be at least 1 day in advance",
      "statusCode": 400
    })
  }
  
  // Check if end date is in the past
  if (endDateObj.getTime() < todayUTC.getTime()) {
    return res.status(400).json({
      "message": "Cannot set bookings in the past",
      "statusCode": 400
    })
  }

  // Check that end date is at least 1 day after start date
  if (endDateObj.getTime() <= startDateObj.getTime()) {
    return res.status(400).json({
      "message": "Validation error",
      "statusCode": 400,
      "errors": {
        "endDate": "Check-out date must be at least 1 day after check-in date"
      }
    })
  }

  err.message = "Sorry, this spot is already booked for the specified dates"
  err.statusCode = 403
  err.errors = {}
  
  // Normalize dates to midnight for accurate comparison
  const newStartTime = startDateObj.getTime()
  const newEndTime = endDateObj.getTime()
  
  // Helper to parse date strings from database as UTC dates
  const parseDbDate = (dateString) => {
    // dateString might be a Date object or string
    if (dateString instanceof Date) {
      const date = new Date(dateString)
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))
    }
    const dateStr = dateString.toString()
    if (dateStr.includes('T')) {
      // ISO format with time - parse and convert to UTC date
      const date = new Date(dateStr)
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))
    }
    // YYYY-MM-DD format - parse as UTC
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  }
  
  for (let dates of allDates) {
    const existingStart = parseDbDate(dates.startDate)
    const existingEnd = parseDbDate(dates.endDate)
    
    const existingStartTime = existingStart.getTime()
    const existingEndTime = existingEnd.getTime()
    
    // Check for date overlap conflicts
    // Case 1: New booking starts within existing booking
    if (newStartTime >= existingStartTime && newStartTime <= existingEndTime) {
      err.errors.startDate = "Start date conflicts with an existing booking"
    }
    // Case 2: New booking ends within existing booking
    if (newEndTime >= existingStartTime && newEndTime <= existingEndTime) {
      err.errors.endDate = "End date conflicts with an existing booking"
    }
    // Case 3: New booking completely encompasses existing booking
    if (newStartTime <= existingStartTime && newEndTime >= existingEndTime) {
      if (!err.errors.startDate) {
        err.errors.startDate = "These dates conflict with an existing booking"
      }
      if (!err.errors.endDate) {
        err.errors.endDate = "These dates conflict with an existing booking"
      }
    }
    // Case 4: Existing booking completely encompasses new booking
    if (existingStartTime <= newStartTime && existingEndTime >= newEndTime) {
      if (!err.errors.startDate) {
        err.errors.startDate = "These dates conflict with an existing booking"
      }
      if (!err.errors.endDate) {
        err.errors.endDate = "These dates conflict with an existing booking"
      }
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

  // Parse dates as UTC dates to avoid timezone issues
  const parseUTCDate = (dateString) => {
    if (!dateString) return null
    if (dateString instanceof Date) {
      const date = new Date(dateString)
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))
    }
    const dateStr = dateString.toString()
    if (dateStr.includes('T')) {
      // ISO format with time - parse and convert to UTC date
      const date = new Date(dateStr)
      return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))
    }
    // YYYY-MM-DD format - parse as UTC date
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  }

  const bookingStartDate = parseUTCDate(startDate)
  // Get today's date in UTC as YYYY-MM-DD string and parse it consistently
  const now = new Date()
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
  const todayStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
  const today = parseUTCDate(todayStr)

  // Only prevent deletion if the booking has already started (start date is today or in the past)
  if (bookingStartDate && bookingStartDate.getTime() < today.getTime()) {
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
