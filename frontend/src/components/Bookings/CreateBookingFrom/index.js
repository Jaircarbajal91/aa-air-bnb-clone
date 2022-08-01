import { useEffect, useState } from "react"
import { createBookingThunk, getAllBookingsForSpotThunk } from "../../../store/bookings";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom"
import { useParams } from 'react-router-dom'
import './CreateBooking.css'

function CreateBookingForm({ spot, bookings }) {
  const { spotId } = useParams()
  const dispatch = useDispatch()
  const history = useHistory()
  let today = new Date()
  let tomorrow = new Date(today)
  today.setDate(today.getDate() + 2)
  let week = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  tomorrow.setDate(tomorrow.getDate() + 3)
  const sessionUser = useSelector((state) => state.session.user);
  const getDate = (today) => {
    let result;
    let month = (today.getMonth() + 1) < 10 ? `0${(today.getMonth() + 1)}` : (today.getMonth() + 1)
    let day = (today.getDate()) < 10 ? `0${(today.getDate())}` : today.getDate()
    result = `${today.getFullYear()}-${month}-${(day)}`
    return result;
  }

  today = getDate(today)
  week = getDate(week)
  tomorrow = getDate(tomorrow)
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(week)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [errors, setErrors] = useState([])
  const { price, avgStarRating, numReviews } = spot

  useEffect(() => {
    let newErrors = []

    if (bookings) {
      for (let dates of bookings) {
        let start = dates.startDate
        let end = dates.endDate
        let formattedStart = new Date(start).getTime()
        let formattedEnd = new Date(end).getTime()
        let formattedStartDate = new Date(startDate).getTime()
        let formattedEndDate = new Date(endDate).getTime()
        if ((formattedStartDate >= formattedStart && formattedStartDate <= formattedEnd)) {
          newErrors.push("Start date conflicts with an existing booking")
          break;
        }
        if ((formattedEndDate >= formattedStart && formattedEndDate <= formattedEnd)) {
          newErrors.push("End date conflicts with an existing booking")
          break
        }
      }
    }

    const date1 = new Date(startDate).getTime()
    const date2 = new Date(endDate).getTime()
    if (date2 < date1) {
      newErrors.push("Check out date cannot come before check in date")
    }

    setErrors(newErrors)
  }, [startDate, endDate])

  let reviews;
  if (numReviews === 0) reviews = ``
  else if (numReviews === 1) reviews = `1 review`
  else reviews = `${numReviews} reviews`

  const rating = spot?.avgStarRating === 0 ? "New" : spot?.avgStarRating
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
      // history.push(`/spots/${spotId}`)
    }

  }

  return (
    <div className="form-container">
      <form
        className="booking-form"
        onSubmit={handleSubmit}
      >
        <div className="booking-content-wrapper">
          <p className="price-wrapper"><strong>${price}</strong> night</p>
          <div className="booking-rating-wrapper">
            <i className="fa-solid fa-star"></i>
            <span> {rating}  {reviews}</span>
          </div>
        </div>
        <div>
          <div className="booking-input-wrapper">
            <div className="checkin-wrapper">
              <div className="checkin">CHECK-IN</div>
              <input type="date" id="start" name="trip-start"
                value={startDate}
                className="checkin"
                min={today}
                onChange={(e) => setStartDate(e.target.value)}
              >
              </input>
            </div>
            <div className="checkout-wrapper">
              <div className="checkout">CHECK-OUT</div>
              <input type="date" id="start" name="trip-start"
                value={endDate}
                className="checkout"
                min={tomorrow}
                onChange={(e) => setEndDate(e.target.value)}
              >
              </input>
            </div>
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
      {!sessionUser ? (
        <div className="sub-text" style={{
          fontSize: "1.5rem",
          textAlign: 'center'
        }}>Log in to reserve a spot</div>
      ) : (
        <button
        className="submit-button booking"
          disabled={sessionUser === null}
          type="submit">Reserve</button>
      )}
        {/* <p className="booking-description">{sessionUser ? "You won't be charged yet" : "Please log in to reserve a date"}</p> */}
      </form>

    </div>
  )
}

export default CreateBookingForm
