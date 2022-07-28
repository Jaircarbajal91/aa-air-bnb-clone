import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { getSpotDetails } from "../../store/spots";
import "./Card.css"
import { useHistory, Route } from "react-router-dom";
import Review from "../Reviews";

function Card({ spot }) {
  const dispatch = useDispatch()
  const history = useHistory();
  const [review, setReview] = useState("")
  async function handleClick(e) {
    const clickedSpot = await dispatch(getSpotDetails(spot.id))
    history.push(`/spots/${spot.id}`)
  }
  const rating = spot.avgStarRating == 0 ? "New" : spot.avgStarRating
  return (
    <div id={`spot-${spot.id}`} className="spot-card-container"
      onClick={(e) => handleClick(e)}
    >
      <div className="card-container">
        <img src={`${spot.previewImage}`} className="spot-img" />
        <div>{spot.city} {spot.state}</div>
        <div>
          <i className="fa-solid fa-star"></i>
          <p>{rating}</p>
        </div>
        <p>79 miles away</p>
        <p><strong>${spot.price}</strong> night</p>
      </div>
    </div>
  )
}

export default Card
