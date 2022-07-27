import { useEffect, useState } from "react"
import { createBookingThunk } from "../../../store/bookings";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom"

function CreateBookingForm({ spot }) {
  const dispatch = useDispatch()
  const history  = useHistory()
  let today = new Date()
  let week = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  let tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const getDate = (today) => {
    let result;
    let month = (today.getMonth() + 1) < 10 ? `0${(today.getMonth() + 1)}` : (today.getMonth() + 1)
    let day = (today.getDate()) < 10 ? `0${(today.getDate())}` : today.getDate()
    result = `${today.getFullYear()}-${month}-${(day)}`
    return result;
  }

  // useEffect(() => {

  // }, [today])

  today = getDate(today)
  week = getDate(week)
  tomorrow = getDate(tomorrow)

  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(week)
  const { price, avgStarRating, numReviews } = spot

  let review;
  if (numReviews === 0) review = `New`
  else if (numReviews === 1) review = `1 review`
  else review = `${numReviews} reviews`


  const handleSubmit = async (e) => {
    e.preventDefault()
    const booking = await dispatch(createBookingThunk(spot.id, {startDate, endDate}))
    history.push('/bookings')
  }
  return (
    <form
      onSubmit={handleSubmit}
    >
      <p><strong>${price}</strong> night</p>
      <div>
        <i className="fa-solid fa-star"></i>
        <span>{spot.avgStarRating} {review}</span>
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
      <p>You won't be charged yet</p>
    </form>
  )
}

export default CreateBookingForm
