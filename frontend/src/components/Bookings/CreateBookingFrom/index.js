import { useEffect, useState } from "react"
import { createBookingThunk, getAllBookingsForSpotThunk } from "../../../store/bookings";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom"
import { useParams } from 'react-router-dom'

function CreateBookingForm({ spot }) {
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
  const bookings = useSelector(state => state.bookings?.orderedBookingList)
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(week)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false);
  const [errors, setErrors] = useState([])
  const { price, avgStarRating, numReviews } = spot

  useEffect(() => {
    let newErrors = []

    if (bookings?.length && isLoaded) {
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

  useEffect(() => {
    if (sessionUser) {
      if (bookings?.length) {
        for (let booking of bookings) {
          if (booking.spotId !== spotId) {
            dispatch(getAllBookingsForSpotThunk(spotId)).then(() => setIsLoaded(true))
            break;
          }
        }
      } else {
        dispatch(getAllBookingsForSpotThunk(spotId)).then(() => setIsLoaded(true)).catch(async (err) => {
          const errors = await err.json()
          setErrors(errors.errors)
        })
      }
    }
  }, [dispatch, isLoaded])

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

  return isLoaded && (
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
      <button
      disabled={sessionUser === null}
       type="submit">Reserve</button>
      {errors.length > 0 && (
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
