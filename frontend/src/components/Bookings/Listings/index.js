import { useHistory } from "react-router-dom"
import { format } from 'date-fns'
import "./Listing.css"

function Listing({ booking }) {
  const history = useHistory()
  const { name, previewImage, city, state, price } = booking.Spot
  const { firstName, lastName } = booking.Spot.Owner
  let { id } = booking
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
  const startDate = startDateObj ? format(startDateObj, 'MMM dd') : ''
  const endDate = endDateObj ? format(endDateObj, 'MMM dd, yyy') : ''
  const startDateFull = startDateObj ? format(startDateObj, 'MMM dd, yyy') : ''
  
  // Calculate time difference using date objects, not formatted strings
  const timeDifference = startDateObj && endDateObj 
    ? endDateObj.getTime() - startDateObj.getTime() 
    : 0
  const daysCount = timeDifference / (1000 * 3600 * 24)
  const subTotal = price * daysCount
  const cleaningFee = Math.ceil(price / 5)
  const weeklyDiscount = Math.ceil(subTotal / 7)
  const serviceFee = Math.ceil(subTotal / 4)
  const total = subTotal - weeklyDiscount + cleaningFee + serviceFee

  // Determine booking status
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let bookingStatus = 'upcoming'
  if (startDateObj && endDateObj) {
    const startTime = startDateObj.getTime()
    const endTime = endDateObj.getTime()
    const todayTime = today.getTime()
    
    if (endTime < todayTime) {
      bookingStatus = 'past'
    } else if (startTime <= todayTime && endTime >= todayTime) {
      bookingStatus = 'current'
    }
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const handleClick = (e) => {
    history.push(`/bookings/${id}`)
  }
  return (
    <div onClick={handleClick} className="single-booking-container">
      <div className="booking-image-container">
        <img className="single-booking-image" src={`${previewImage}`} alt={`${name} in ${city}, ${state}`} />
        <div className={`booking-status-badge ${bookingStatus}`}>
          {bookingStatus === 'current' ? 'Current Stay' : bookingStatus === 'past' ? 'Past' : 'Upcoming'}
        </div>
      </div>
      <div className="booking-content-container">
        <div className="spot-name-container">
          <div className="spot-title-row">
            <span className="spot-name">{name}</span>
            {booking.Spot?.avgStarRating > 0 && (
              <div className="spot-rating-badge">
                <i className="fa-solid fa-star"></i>
                <span>{Number(booking.Spot.avgStarRating).toFixed(1)}</span>
              </div>
            )}
          </div>
          <span className="spot-host">Hosted by <span className="user-name">{firstName} {lastName}</span></span>
        </div>
        <div className="booking-details-grid">
          <div className="booking-detail-item">
            <div className="detail-icon">
              <i className="fa-solid fa-location-dot"></i>
            </div>
            <div className="detail-content">
              <span className="detail-label">Location</span>
              <span className="detail-value">{city}, {state}</span>
            </div>
          </div>
          <div className="booking-detail-item">
            <div className="detail-icon">
              <i className="fa-solid fa-calendar-days"></i>
            </div>
            <div className="detail-content">
              <span className="detail-label">Check-in</span>
              <span className="detail-value">{startDateFull}</span>
            </div>
          </div>
          <div className="booking-detail-item">
            <div className="detail-icon">
              <i className="fa-solid fa-calendar-check"></i>
            </div>
            <div className="detail-content">
              <span className="detail-label">Check-out</span>
              <span className="detail-value">{endDate}</span>
            </div>
          </div>
          <div className="booking-detail-item">
            <div className="detail-icon">
              <i className="fa-solid fa-moon"></i>
            </div>
            <div className="detail-content">
              <span className="detail-label">Nights</span>
              <span className="detail-value">{daysCount} {daysCount === 1 ? 'night' : 'nights'}</span>
            </div>
          </div>
        </div>
        <div className="booking-footer">
          <div className="price-info">
            <span className="price-per-night">{formatter.format(price)}/night</span>
            <span className="nights-count">{daysCount} {daysCount === 1 ? 'night' : 'nights'}</span>
          </div>
          <div className="booking-total">
            <span className="total-label">Total</span>
            <span className="total-amount">{formatter.format(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Listing
