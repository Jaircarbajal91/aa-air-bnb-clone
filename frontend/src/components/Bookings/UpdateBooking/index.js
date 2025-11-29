import { useSelector, useDispatch } from "react-redux"
import { Redirect, useHistory, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { updateBookingThunk, getAllUserBookingsThunk } from "../../../store/bookings";
import { format } from 'date-fns';
import './UpdateBooking.css'

function UpdateBookingForm ({booking, setShowUpdate}) {
  const {bookingId} = useParams()
  const sessionUser = useSelector(state => state.session.user)
  const dispatch = useDispatch()
  const history = useHistory()
  
  // Get tomorrow's date (minimum booking date - must be at least 1 day ahead)
  const getTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow
  }
  
  // Initialize dates from booking
  const getInitialStartDate = () => {
    if (booking?.startDate) {
      const date = new Date(booking.startDate)
      return format(date, 'yyyy-MM-dd')
    }
    return format(getTomorrow(), 'yyyy-MM-dd')
  }
  
  const getInitialEndDate = () => {
    if (booking?.endDate) {
      const date = new Date(booking.endDate)
      return format(date, 'yyyy-MM-dd')
    }
    const tomorrow = getTomorrow()
    const dayAfter = new Date(tomorrow)
    dayAfter.setDate(dayAfter.getDate() + 1)
    return format(dayAfter, 'yyyy-MM-dd')
  }
  
  const [startDate, setStartDate] = useState(getInitialStartDate())
  const [endDate, setEndDate] = useState(getInitialEndDate())
  const [minEndDate, setMinEndDate] = useState(() => {
    const start = new Date(startDate)
    start.setDate(start.getDate() + 1)
    return start
  })
  const [errors, setErrors] = useState([])
  const [hasSubmitted, setHasSubmitted] = useState(false)

  useEffect(() => {
    if (booking) {
      const initialStart = booking.startDate 
        ? format(new Date(booking.startDate), 'yyyy-MM-dd')
        : format(getTomorrow(), 'yyyy-MM-dd')
      const initialEnd = booking.endDate
        ? format(new Date(booking.endDate), 'yyyy-MM-dd')
        : format(new Date(getTomorrow().getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      setStartDate(initialStart)
      setEndDate(initialEnd)
    }
  }, [booking])

  useEffect(() => {
    const updatedStart = new Date(startDate)
    updatedStart.setHours(0, 0, 0, 0)
    const tomorrow = getTomorrow()
    
    // Update minimum end date based on start date (must be at least 1 day after)
    const minEnd = new Date(updatedStart)
    minEnd.setDate(minEnd.getDate() + 1)
    minEnd.setHours(0, 0, 0, 0)
    setMinEndDate(minEnd)
    
    // Ensure end date is at least 1 day after start (not equal to or before)
    const updatedEnd = new Date(endDate)
    updatedEnd.setHours(0, 0, 0, 0)
    if (updatedEnd.getTime() <= updatedStart.getTime()) {
      setEndDate(format(minEnd, 'yyyy-MM-dd'))
    }
  }, [startDate, endDate])

  if (sessionUser === null) {
    return <Redirect to="/" />
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    
    // Validate that checkout is at least 1 day after check-in
    const startDateObj = new Date(startDate)
    startDateObj.setHours(0, 0, 0, 0)
    const endDateObj = new Date(endDate)
    endDateObj.setHours(0, 0, 0, 0)
    
    if (endDateObj.getTime() <= startDateObj.getTime()) {
      setErrors(["Check-out date must be at least 1 day after check-in date"])
      setHasSubmitted(true)
      return
    }
    
    setHasSubmitted(true)
    
    try {
      const updateData = {
        startDate,
        endDate
      }
      
      const updatedBooking = await dispatch(updateBookingThunk(bookingId, updateData))
      
      if (updatedBooking && updatedBooking.id) {
        // Refresh bookings to get updated data
        await dispatch(getAllUserBookingsThunk())
        setShowUpdate(false)
        // Reload the page to show updated booking
        window.location.reload()
      }
    } catch (err) {
      let errorData
      try {
        errorData = await err.json()
      } catch (parseError) {
        setErrors([err.message || "An error occurred while updating the booking"])
        setHasSubmitted(false)
        return
      }
      
      const newErrors = []
      if (errorData.message) {
        newErrors.push(errorData.message)
      }
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
  return (
    <form
      onSubmit={handleSubmit}
      className="update-booking-form"
    >
      <h3>Update Booking</h3>
      <div className="update-booking-errors">
        {errors.length > 0 && (
          <ul className="errors-list">
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        )}
      </div>
      <label>
        Check-In Date:
        <input
          type="date"
          value={startDate}
          min={format(getTomorrow(), 'yyyy-MM-dd')}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </label>
      <label>
        Check-Out Date:
        <input
          type="date"
          value={endDate}
          min={format(minEndDate, 'yyyy-MM-dd')}
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
              setEndDate(format(minEnd, 'yyyy-MM-dd'))
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
              setEndDate(format(minEnd, 'yyyy-MM-dd'))
            }
          }}
          required
        />
      </label>
      <p className="date-help-text">Bookings must be made at least 1 day in advance. Check-out must be at least 1 day after check-in.</p>
      <div className="update-booking-buttons">
        <button type="submit" disabled={hasSubmitted}>
          {hasSubmitted ? 'Updating...' : 'Update Reservation'}
        </button>
        <button type="button" onClick={() => setShowUpdate(false)}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default UpdateBookingForm
