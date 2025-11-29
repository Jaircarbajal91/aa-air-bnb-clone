import { useEffect, useState } from "react"
import { createBookingThunk, getAllBookingsForSpotThunk, getAllUserBookingsThunk } from "../../../store/bookings";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom"
import { format, formatDistanceToNow, intlFormatDistance } from 'date-fns'
import LoginFormModal from "../../LoginFormModal";
import './CreateBooking.css'

function CreateBookingForm({ spot, bookings }) {
  const { spotId } = useParams()
  const dispatch = useDispatch()
  const history = useHistory()
  const sessionUser = useSelector((state) => state.session.user);
  const userBookings = useSelector((state) => state.bookings?.orderedBookingList || []);
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [errors, setErrors] = useState([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [userBookingsLoaded, setUserBookingsLoaded] = useState(false)
  // Get today's date at midnight for accurate comparison
  const getToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  }
  // Get tomorrow's date (minimum booking date - must be at least 1 day ahead)
  const getTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow
  }
  // Get day after tomorrow (minimum checkout date)
  const getDayAfterTomorrow = () => {
    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 2)
    dayAfter.setHours(0, 0, 0, 0)
    return dayAfter
  }
  const [startDate, setStartDate] = useState(format(getTomorrow(), 'yyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(getDayAfterTomorrow(), 'yyy-MM-dd'))
  const [minEndDate, setMinEndDate] = useState(getDayAfterTomorrow())
  const [timeDifference, setTimeDifference] = useState(new Date(endDate).getTime() - new Date(startDate).getTime())
  const [daysCount, setDaysCount] = useState(timeDifference / (1000 * 3600 * 24))
  const { price, avgStarRating, numReviews } = spot
  const [subTotal, setSubTotal] = useState(price * daysCount)
  const [cleaningFee, setCleaningFee] = useState(Math.ceil(price / 5))
  const [weeklyDiscount, setWeeklyDiscount] = useState(Math.ceil(subTotal / 7))
  const [serviceFee, setServiceFee] = useState(Math.ceil(subTotal / 4))
  const [total, setTotal] = useState(subTotal - weeklyDiscount + cleaningFee + serviceFee)

  const getDate = (today) => {
    let result;
    let month = (today.getMonth() + 1) < 10 ? `0${(today.getMonth() + 1)}` : (today.getMonth() + 1)
    let day = (today.getDate()) < 10 ? `0${(today.getDate())}` : today.getDate()
    result = `${today.getFullYear()}-${month}-${(day)}`
    return result;
  }

  // Fetch user bookings on mount
  useEffect(() => {
    if (sessionUser?.id && !userBookingsLoaded) {
      dispatch(getAllUserBookingsThunk())
        .then(() => setUserBookingsLoaded(true))
        .catch(() => setUserBookingsLoaded(true))
    }
  }, [dispatch, sessionUser?.id, userBookingsLoaded])

  // Helper function to parse dates as local dates
  const parseLocalDate = (dateValue) => {
    if (!dateValue) return null
    if (dateValue instanceof Date) {
      const date = new Date(dateValue)
      date.setHours(0, 0, 0, 0)
      return date
    }
    const dateStr = dateValue.toString()
    // If it's in YYYY-MM-DD format, parse as local date
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day)
    }
    // Try parsing as ISO date
    const date = new Date(dateValue)
    date.setHours(0, 0, 0, 0)
    return date
  }

  // Check if dates overlap with any existing user booking
  const checkDateOverlap = (newStartDate, newEndDate) => {
    if (!sessionUser?.id || !userBookings || userBookings.length === 0) {
      return null
    }

    const newStart = parseLocalDate(newStartDate)
    const newEnd = parseLocalDate(newEndDate)

    if (!newStart || !newEnd) return null

    const newStartTime = newStart.getTime()
    const newEndTime = newEnd.getTime()

    for (let booking of userBookings) {
      // Skip if this booking doesn't have dates
      if (!booking.startDate || !booking.endDate) continue

      const existingStart = parseLocalDate(booking.startDate)
      const existingEnd = parseLocalDate(booking.endDate)

      if (!existingStart || !existingEnd) continue

      const existingStartTime = existingStart.getTime()
      const existingEndTime = existingEnd.getTime()

      // Check for any overlap
      // Case 1: New booking starts within existing booking
      if (newStartTime >= existingStartTime && newStartTime <= existingEndTime) {
        return {
          message: "You already have a booking that overlaps with these dates",
          conflict: true
        }
      }
      // Case 2: New booking ends within existing booking
      if (newEndTime >= existingStartTime && newEndTime <= existingEndTime) {
        return {
          message: "You already have a booking that overlaps with these dates",
          conflict: true
        }
      }
      // Case 3: New booking completely encompasses existing booking
      if (newStartTime <= existingStartTime && newEndTime >= existingEndTime) {
        return {
          message: "You already have a booking that overlaps with these dates",
          conflict: true
        }
      }
      // Case 4: Existing booking completely encompasses new booking
      if (existingStartTime <= newStartTime && existingEndTime >= newEndTime) {
        return {
          message: "You already have a booking that overlaps with these dates",
          conflict: true
        }
      }
    }

    return null
  }

  // Clear errors when dates change (user is fixing the issue)
  useEffect(() => {
    if (hasSubmitted && errors.length > 0) {
      setErrors([])
      setHasSubmitted(false)
    }
  }, [startDate, endDate])

  // Check for date overlaps in real-time
  useEffect(() => {
    if (!sessionUser?.id || !userBookingsLoaded || !userBookings || userBookings.length === 0) {
      // Clear overlap error if user bookings are not loaded or don't exist
      if (errors.length > 0 && errors[0] === "You already have a booking that overlaps with these dates") {
        setErrors([])
      }
      return
    }

    const overlapError = checkDateOverlap(startDate, endDate)
    if (overlapError) {
      // Only show error if dates are valid and overlap exists
      const startDateObj = parseLocalDate(startDate)
      const endDateObj = parseLocalDate(endDate)
      // Ensure dates are at least 1 day apart before checking overlap
      if (startDateObj && endDateObj && endDateObj > startDateObj) {
        setErrors([overlapError.message])
      }
    } else {
      // Clear overlap error if dates no longer overlap
      const currentError = errors.length > 0 ? errors[0] : ""
      if (currentError === "You already have a booking that overlaps with these dates") {
        setErrors([])
      }
    }
  }, [startDate, endDate, userBookingsLoaded, userBookings])

  useEffect(() => {
    const updatedStart = parseLocalDate(startDate)
    const updatedEnd = parseLocalDate(endDate)
    
    if (!updatedStart) return
    
    // Ensure start date is at least tomorrow
    const tomorrow = getTomorrow()
    if (updatedStart.getTime() < tomorrow.getTime()) {
      const validStart = format(tomorrow, 'yyy-MM-dd')
      setStartDate(validStart)
      const validEnd = format(getDayAfterTomorrow(), 'yyy-MM-dd')
      setEndDate(validEnd)
      setMinEndDate(getDayAfterTomorrow())
      return
    }
    
    // Calculate minimum end date (must be at least 1 day after start)
    const minEnd = new Date(updatedStart)
    minEnd.setDate(minEnd.getDate() + 1)
    minEnd.setHours(0, 0, 0, 0)
    setMinEndDate(minEnd)
    
    // Always ensure end date is at least 1 day after start date (not equal to or before)
    if (!updatedEnd || updatedEnd.getTime() <= updatedStart.getTime()) {
      // If end date is before or equal to start date, set it to 1 day after start
      setEndDate(format(minEnd, 'yyy-MM-dd'))
    }
  }, [startDate, endDate])

  useEffect(() => {
    setTimeDifference(new Date(endDate).getTime() - new Date(startDate).getTime())
    setDaysCount(timeDifference / (1000 * 3600 * 24))
    setSubTotal(price * daysCount)
    setWeeklyDiscount(subTotal / 7)
    setServiceFee(subTotal / 4)
    setTotal(subTotal - weeklyDiscount + cleaningFee + serviceFee)
  }, [startDate, endDate, timeDifference, daysCount, subTotal, weeklyDiscount, serviceFee])

  const rating = spot.avgStarRating === 0 ? "New" : spot.avgStarRating
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Ensure checkout is always at least 1 day after check-in (handled by date pickers)
    const startDateObj = parseLocalDate(startDate)
    const endDateObj = parseLocalDate(endDate)
    if (startDateObj && endDateObj && endDateObj.getTime() <= startDateObj.getTime()) {
      // Auto-adjust end date to be 1 day after start if somehow they're equal
      const minEnd = new Date(startDateObj)
      minEnd.setDate(minEnd.getDate() + 1)
      setEndDate(format(minEnd, 'yyy-MM-dd'))
      return
    }
    
    // Check for date overlap before submitting
    if (sessionUser?.id && userBookingsLoaded) {
      const overlapError = checkDateOverlap(startDate, endDate)
      if (overlapError) {
        setErrors([overlapError.message])
        setHasSubmitted(true)
        return
      }
    }

    if (errors.length > 0) return;
    setHasSubmitted(true)
    setErrors([]) // Clear previous errors
    try {
      const booking = await dispatch(createBookingThunk(spot.id, { startDate, endDate }))
      if (booking && booking.id) {
        history.push(`/bookings/${booking.id}`)
      }
    } catch (err) {
      let errorData;
      try {
        errorData = await err.json()
      } catch (parseError) {
        // If error is not JSON, use the error message directly
        setErrors([err.message || "An error occurred while creating the booking"])
        setHasSubmitted(false)
        return
      }
      
      const newErrors = [];
      // Add main error message if it exists
      if (errorData.message) {
        newErrors.push(errorData.message)
      }
      // Add field-specific errors
      if (errorData.errors) {
        for (let error in errorData.errors) {
          if (errorData.errors[error] && !newErrors.includes(errorData.errors[error])) {
            newErrors.push(errorData.errors[error])
          }
        }
      }
      setErrors(newErrors)
      setHasSubmitted(false)
    }
  }
  const showLogin = (e) => {
    e.preventDefault()
    setShowLoginModal(true)
  }

  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });


  return (

    <div className="form-container">
      <form
        className="booking-form"
        onSubmit={handleSubmit}
      >
        {showLoginModal && <LoginFormModal setShowLoginModal={setShowLoginModal} showLoginModal={showLoginModal} />}
        <div className="booking-content-wrapper">
          <span className="price-wrapper"><strong>${price}</strong> night</span>
          <div className="booking-rating-wrapper">
            <i className="fa-solid fa-star"></i>
            <span> {rating} · <u>{numReviews} {numReviews === 1 ? "review" : "reviews"}</u></span>
          </div>
        </div>
        <div className="booking-input-wrapper">
          <div className="checkin-wrapper">
            <div className="checkin">CHECK-IN</div>
            <input 
              type="date" 
              id="start" 
              name="trip-start"
              value={startDate}
              className="checkin"
              min={format(getTomorrow(), 'yyy-MM-dd')}
              max="2099-12-31"
              onChange={(e) => {
                const selectedDate = e.target.value
                const selectedDateObj = new Date(selectedDate)
                selectedDateObj.setHours(0, 0, 0, 0)
                const tomorrow = getTomorrow()
                
                // Prevent selecting dates before tomorrow
                if (selectedDateObj.getTime() < tomorrow.getTime()) {
                  setStartDate(format(tomorrow, 'yyy-MM-dd'))
                  // Set end date to day after tomorrow
                  setEndDate(format(getDayAfterTomorrow(), 'yyy-MM-dd'))
                } else {
                  setStartDate(selectedDate)
                  // Automatically set end date to be at least 1 day after the new start date
                  const currentEndDateObj = parseLocalDate(endDate)
                  const minEndDateObj = new Date(selectedDateObj)
                  minEndDateObj.setDate(minEndDateObj.getDate() + 1)
                  minEndDateObj.setHours(0, 0, 0, 0)
                  
                  // Always update end date if it's before or equal to new start date
                  if (!currentEndDateObj || currentEndDateObj.getTime() <= selectedDateObj.getTime()) {
                    setEndDate(format(minEndDateObj, 'yyy-MM-dd'))
                  }
                }
              }}
              required
            >
            </input>
          </div>
          <div className="checkout-wrapper">
            <div className="checkout">CHECK-OUT</div>
            <input 
              type="date" 
              id="end" 
              name="trip-end"
              value={endDate}
              className="checkout"
              min={(() => {
                const startDateObj = parseLocalDate(startDate)
                if (!startDateObj) return format(getDayAfterTomorrow(), 'yyy-MM-dd')
                const minEnd = new Date(startDateObj)
                minEnd.setDate(minEnd.getDate() + 1)
                return format(minEnd, 'yyy-MM-dd')
              })()}
              max="2099-12-31"
              onChange={(e) => {
                const selectedDate = e.target.value
                const selectedDateObj = new Date(selectedDate)
                selectedDateObj.setHours(0, 0, 0, 0)
                const startDateObj = new Date(startDate)
                startDateObj.setHours(0, 0, 0, 0)
                const minEnd = new Date(startDateObj)
                minEnd.setDate(minEnd.getDate() + 1)
                minEnd.setHours(0, 0, 0, 0)
                
                // Prevent selecting dates before or equal to start date (must be at least 1 day after)
                if (selectedDateObj.getTime() <= startDateObj.getTime()) {
                  setEndDate(format(minEnd, 'yyy-MM-dd'))
                } else {
                  setEndDate(selectedDate)
                }
              }}
              onBlur={(e) => {
                // On blur, ensure the date is still valid (at least 1 day after start)
                const selectedDate = e.target.value
                const selectedDateObj = new Date(selectedDate)
                selectedDateObj.setHours(0, 0, 0, 0)
                const startDateObj = new Date(startDate)
                startDateObj.setHours(0, 0, 0, 0)
                const minEnd = new Date(startDateObj)
                minEnd.setDate(minEnd.getDate() + 1)
                minEnd.setHours(0, 0, 0, 0)
                
                if (selectedDateObj.getTime() <= startDateObj.getTime()) {
                  setEndDate(format(minEnd, 'yyy-MM-dd'))
                }
              }}
              required
            >
            </input>
          </div>
        </div>
        <p className="date-help-text">Bookings must be made at least 1 day in advance.</p>
        {sessionUser ? <button
          className="submit-button booking"
          onClick={handleSubmit}
          type="submit">Reserve</button> :
          <button onClick={showLogin} className="submit-button booking">Login to reserve a date</button>
        }
        <p className="no-charge">You won't be charged yet</p>
        <div className="booking-errors-container">
          {errors.length > 0 && (
            <ul className="errors-list">
              {errors.map(error => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="adjusted-pricing-container">
          <div className="adjusted-pricing initial">
            <u>{formatter.format(spot.price)} x {daysCount} {daysCount === 1 ? "night" : "nights"}</u>
            <span>{formatter.format(subTotal)}</span>
          </div>
          <div className="adjusted-pricing discount">
            <u>Weekly Discount</u>
            <span>-{formatter.format(weeklyDiscount)}</span>
          </div>
          <div className="adjusted-pricing">
            <u>Cleaning Fee</u>
            <span>{formatter.format(cleaningFee)}</span>
          </div>
          <div className="adjusted-pricing last">
            <u>Service fee</u>
            <span>{formatter.format(serviceFee)}</span>
          </div>
          <div className="adjusted-pricing total">
            <span>Total before taxes</span>
            <span>{formatter.format(total)}</span>
          </div>
        </div>
        {/* <p className="booking-description">{sessionUser ? "You won't be charged yet" : "Please log in to reserve a date"}</p> */}
      </form>

    </div>
  )
}

export default CreateBookingForm
