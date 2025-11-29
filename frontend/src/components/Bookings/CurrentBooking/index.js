import { useEffect, useState } from "react"
import { useParams, useHistory, Redirect } from "react-router-dom"
import { format } from 'date-fns'
import { useSelector, useDispatch } from "react-redux"
import { getAllUserBookingsThunk } from "../../../store/bookings"
import { Modal } from "../../../context/Modal"
import DeleteBooking from "../DeleteBooking"
import UpdateBookingForm from "../UpdateBooking"
import { deleteBookingThunk } from "../../../store/bookings";
import './CurrentBooking.css'

function CurrentBooking() {


  const { bookingId } = useParams()
  const sessionUser = useSelector(state => state.session.user)
  const bookings = useSelector(state => state.bookings?.orderedBookingList)
  const booking = bookings?.find(booking => booking.id === Number(bookingId))
  const spot = booking?.Spot

  const history = useHistory()
  const dispatch = useDispatch()
  const [showDelete, setShowDelete] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [bookingStatus, setBookingStatus] = useState('future'); // 'future', 'current', 'past'
  const [deleted, setDeleted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false)
  const [price, setPrice] = useState(0)
  const [avgStarRating, setAvgStarRating] = useState(spot?.avgStarRating)
  const [numReviews, setNumReviews] = useState(spot?.numReviews)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [timeDifference, setTimeDifference] = useState(0)
  const [daysCount, setDaysCount] = useState(0)
  const [subTotal, setSubTotal] = useState(0)
  const [cleaningFee, setCleaningFee] = useState(0)
  const [weeklyDiscount, setWeeklyDiscount] = useState(0)
  const [serviceFee, setServiceFee] = useState(0)
  const [total, setTotal] = useState(0)
  const [checkIn, setCheckin] = useState('')
  const [checkOut, setCheckOut] = useState('')


  // Fetch bookings only once on mount
  useEffect(() => {
    if (sessionUser?.id) {
      dispatch(getAllUserBookingsThunk())
        .then(() => setIsLoaded(true))
        .catch((err) => {
          setIsLoaded(true) // Set to true even on error to prevent infinite loading
        })
    }
  }, [dispatch, sessionUser?.id])

  // Process booking data when booking and spot are available
  useEffect(() => {
    if (spot && booking && isLoaded) {
      // Parse dates as local dates to avoid timezone issues
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
      
      const startDateObj = parseLocalDate(booking.startDate)
      const endDateObj = parseLocalDate(booking.endDate)
      
      if (startDateObj && endDateObj) {
        // Format dates for display
        const formattedStartDate = format(startDateObj, 'MMM dd, yyy')
        const formattedEndDate = format(endDateObj, 'MMM dd, yyy')
        setStartDate(formattedStartDate)
        setEndDate(formattedEndDate)
        
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const timeDiff = endDateObj.getTime() - startDateObj.getTime()
        const days = timeDiff / (1000 * 3600 * 24)
        
        setTimeDifference(timeDiff)
        setDaysCount(days)
        setPrice(spot?.price)
        const subTotalCalc = spot?.price * days
        setSubTotal(subTotalCalc)
        setCleaningFee((Math.ceil(spot?.price / 5)))
        setWeeklyDiscount(Math.ceil(subTotalCalc / 7))
        setServiceFee(Math.ceil(subTotalCalc / 4))
        setTotal(subTotalCalc - Math.ceil(subTotalCalc / 7) + Math.ceil(spot?.price / 5) + Math.ceil(subTotalCalc / 4))
      }
    }
  }, [booking, spot, isLoaded])


  useEffect(() => {
    if (booking) {
      // Parse dates as local dates to avoid timezone issues
      const parseLocalDate = (dateValue) => {
        if (!dateValue) return null
        // If it's already a Date object
        if (dateValue instanceof Date) {
          const date = new Date(dateValue)
          date.setHours(0, 0, 0, 0)
          return date
        }
        // If it's a string in YYYY-MM-DD format
        const dateStr = dateValue.toString()
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = dateStr.split('-').map(Number)
          const date = new Date(year, month - 1, day)
          date.setHours(0, 0, 0, 0)
          return date
        }
        // Try parsing as ISO date
        const date = new Date(dateValue)
        date.setHours(0, 0, 0, 0)
        return date
      }
      
      const startDateObj = parseLocalDate(booking.startDate)
      const endDateObj = parseLocalDate(booking.endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (!startDateObj || !endDateObj) return
      
      const startTime = startDateObj.getTime()
      const endTime = endDateObj.getTime()
      const todayTime = today.getTime()
      
      // Determine booking status
      // Past: end date is before today
      if (endTime < todayTime) {
        setBookingStatus('past')
      } 
      // Current: start date is today or earlier AND end date is today or later
      else if (startTime <= todayTime && endTime >= todayTime) {
        setBookingStatus('current')
      } 
      // Future: start date is after today
      else {
        setBookingStatus('future')
      }
    }
  }, [booking])

  useEffect(() => {
    if (deleted) {
      dispatch(deleteBookingThunk(bookingId))
        .then(() => history.push('/bookings'))
    }
  }, [deleted, dispatch, history])

  // Disable body and html scroll when component mounts
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
    }
  }, [])

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  if (isLoaded && !spot) {
    return <Redirect to="/bookings" />
  }

  const handleImageClick = () => {
    if (spot?.id) {
      history.push(`/spots/${spot.id}`)
    }
  }

  const getHeaderMessage = () => {
    switch (bookingStatus) {
      case 'current':
        return "You're currently staying here!"
      case 'past':
        return "We hope you enjoyed your stay!"
      case 'future':
      default:
        return "Your reservation is confirmed!"
    }
  }

  const getSubHeaderMessage = () => {
    switch (bookingStatus) {
      case 'current':
        return <span>Enjoy your stay in <u>{spot.city}, {spot.state}</u>!</span>
      case 'past':
        return null
      case 'future':
      default:
        return <span>You're going to <u>{spot.city}, {spot.state}</u>!</span>
    }
  }

  return isLoaded && spot && (
    <div className="current-booking-wrapper">
      <div className="current-booking">
      <div className="confirmation-header">
        <h1 className={`booking heading ${bookingStatus === 'current' ? 'current-stay' : ''}`}>
          {getHeaderMessage()}
        </h1>
        {getSubHeaderMessage()}
      </div>
      <div className="confirmation-container">
        <div className="confirmation-right-container">
          {spot && (
            <img 
              className="booking-spot-img" 
              src={spot.previewImage} 
              alt={`${spot.name} in ${spot.city}, ${spot.state}`}
              onClick={handleImageClick}
              style={{ cursor: 'pointer' }}
            />
          )}
          <div className="confirmation-description">
            <span>{spot.name}</span>
            <span>{spot.city}, {spot.state}</span>
          </div>
          <div className="confirmation-booking info">
            <div className="confirmation-left-itinerary">
              <h3 className="start date">Check-in</h3>
              <span>{startDate}</span>
              <span>4PM - 9PM</span>
            </div>
            <div className="confirmation-right-itinerary">
              <h3 className="end date">Check-out</h3>
              <span>{endDate}</span>
              <span>11AM</span>
            </div>
          </div>
        </div>
        <div className="confirmation-middle-container"></div>
        <div className="confirmation-left-container">
          <div className="confirmation-address-container">
            <h3>Address</h3>
            <p>{spot.address}, {spot.city}, {spot.state}, {spot.country}</p>
          </div>
          <div className="confirmation-total-amount">
            <h3>Total Amount</h3>
            <p>{formatter.format(total)}</p>
          </div>
          {booking.userId === sessionUser.id && bookingStatus === 'future' && (
            <div className="confirmation-actions">
              <button className="confirmation-button" onClick={() => setShowUpdate(true)}>
                Change Reservation
              </button>
              <button className="confirmation-button cancel-button" onClick={() => setShowDelete(true)}>
                Cancel Reservation
              </button>
              {showUpdate && (
                <Modal onClose={() => setShowUpdate(false)}>
                  <UpdateBookingForm booking={booking} setShowUpdate={setShowUpdate} />
                </Modal>
              )}
              {showDelete && (
                <Modal onClose={() => setShowDelete(false)}>
                  <DeleteBooking setDeleted={setDeleted} booking={booking} setShowDelete={setShowDelete} />
                </Modal>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}

export default CurrentBooking
