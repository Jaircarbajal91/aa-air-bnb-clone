import { useEffect, useState } from "react"
import { createBookingThunk, getAllBookingsForSpotAction } from "../../../store/bookings";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom"

function CreateBookingForm({ spot }) {
  const dispatch = useDispatch()
  const history = useHistory()
  let today = new Date()
  let week = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  let tomorrow = new Date(today)
  today.setDate(today.getDate() + 1)
  tomorrow.setDate(tomorrow.getDate() + 2)

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
  const bookings = useSelector(state => state.bookings?.orderedBookingList)
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(week)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false);
  const [errors, setErrors] = useState([])
  const { price, avgStarRating, numReviews } = spot

  useEffect(() => {
    dispatch(getAllBookingsForSpotAction(spot.id))
  }, [dispatch])

  useEffect(() => {
    let newErrors = []

    const allDates = bookings
    if (allDates?.length) {
      for (let dates of allDates) {
        let start = dates.startDate
        let end = dates.endDate
        if ((startDate >= start && startDate <= end)) {
          newErrors.push("Start date conflicts with an existing booking")
          break;
        }
        if ((endDate >= start && endDate <= end)) {
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

  const rating = spot?.avgStarRating == 0 ? "New" : spot?.avgStarRating
  const handleSubmit = async (e) => {
    e.preventDefault()
    setHasSubmitted(true)
    if (errors.length > 0) return;
    const booking = await dispatch(createBookingThunk(spot.id, { startDate, endDate }))
    history.push(`/bookings/${booking.id}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
    >
      <p><strong>${price}</strong> night</p>
      <div>
        <i className="fa-solid fa-star"></i>
        <span> {rating}  {reviews}</span>
      </div>
      <label htmlFor="">CHECK-IN: </label>
      <input type="date" id="start" name="trip-start"
        value={startDate}
        min={today}
        onChange={(e) => setStartDate(e.target.value)}
      >
      </input>
      <label htmlFor="">CHECKOUT: </label>
      <input type="date" id="start" name="trip-start"
        value={endDate}
        min={tomorrow}
        onChange={(e) => setEndDate(e.target.value)}
      >
      </input>
      <button type="submit">Reserve</button>
      {hasSubmitted && errors.length > 0 && (
        <ul>
          {errors.map(error => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      <p>You won't be charged yet</p>
    </form>
  )
}

export default CreateBookingForm
