import { useEffect, useState } from "react"
import { createBookingThunk, getAllBookingsForSpotThunk } from "../../../store/bookings";
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
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [errors, setErrors] = useState([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [today, setToday] = useState(new Date(new Date() - new Date().getTimezoneOffset()))
  const [tomorrow, setTomorrow] = useState(new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000))
  const [startDate, setStartDate] = useState(format(today, 'yyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(today).getTime() + 120 * 60 * 60 * 1000, 'yyy-MM-dd'))
  const { price, avgStarRating, numReviews } = spot
  const getDate = (today) => {
    let result;
    let month = (today.getMonth() + 1) < 10 ? `0${(today.getMonth() + 1)}` : (today.getMonth() + 1)
    let day = (today.getDate()) < 10 ? `0${(today.getDate())}` : today.getDate()
    result = `${today.getFullYear()}-${month}-${(day)}`
    return result;
  }

  useEffect(() => {
    setErrors([])
    let updatedStart = new Date(startDate);
    let updatedEnd = new Date(endDate);
    if (updatedStart.getTime() > updatedEnd.getTime()) {
      setEndDate(format(new Date(new Date(updatedStart).getTime() + 48 * 60 * 60 * 1000), 'yyy-MM-dd'))
      setTomorrow(new Date(new Date(updatedStart).getTime() + 48 * 60 * 60 * 1000))
    } else {
      setTomorrow(new Date(new Date(updatedStart).getTime() + 48 * 60 * 60 * 1000))
    }
  }, [startDate])

  let reviews;
  if (numReviews === 0) reviews = ``
  else if (numReviews === 1) reviews = `1 review`
  else reviews = `${numReviews} reviews`

  const rating = spot.avgStarRating === 0 ? "New" : spot.avgStarRating
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (errors.length > 0) return;
    setHasSubmitted(true)
    try {
      const booking = await dispatch(createBookingThunk(spot.id, { startDate, endDate }))
      history.push(`/bookings/${booking.id}`)
    } catch (err) {
      const errors = await err.json()
      const newErrors = [];
      for (let error in errors.errors) {
        newErrors.push(errors.errors[error])
      }
      setErrors(newErrors)
    }
  }
  const showLogin = (e) => {
    e.preventDefault()
    setShowLoginModal(true)
  }
  return (

    <div className="form-container">
      <form
        className="booking-form"
        onSubmit={handleSubmit}
      >
        {showLoginModal && <LoginFormModal setShowLoginModal={setShowLoginModal} showLoginModal={showLoginModal}/>}
        <div className="booking-content-wrapper">
          <p className="price-wrapper"><strong>${price}</strong> night</p>
          <div className="booking-rating-wrapper">
            <i className="fa-solid fa-star"></i>
            <span> {rating}  {reviews}</span>
          </div>
        </div>
        <div className="booking-input-wrapper">
          <div className="checkin-wrapper">
            <div className="checkin">CHECK-IN</div>
            <input type="date" id="start" name="trip-start"
              value={startDate}
              className="checkin"
              min={format(today, 'yyy-MM-dd')}
              onChange={(e) => setStartDate(e.target.value)}
            >
            </input>
          </div>
          <div className="checkout-wrapper">
            <div className="checkout">CHECK-OUT</div>
            <input type="date" id="end" name="trip-start"
              value={endDate}
              className="checkout"
              min={format(tomorrow, 'yyy-MM-dd')}
              onChange={(e) => setEndDate(e.target.value)}
            >
            </input>
          </div>
        </div>
        <div className="booking-errors-container">
          {errors.length > 0 && (
            <ul className="errors-list">
              {errors.map(error => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
        {sessionUser ? <button
          className="submit-button booking"
          onClick={handleSubmit}
          type="submit">Reserve</button> :
          <button onClick={showLogin} className="submit-button booking">Login to reserve a date</button>
          }
        {/* <p className="booking-description">{sessionUser ? "You won't be charged yet" : "Please log in to reserve a date"}</p> */}
      </form>

    </div>
  )
}

export default CreateBookingForm
