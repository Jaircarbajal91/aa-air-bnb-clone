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
    history.push(`/spots/${spot.id}`)
  }
  const rating = spot.avgStarRating == 0 ? "New" : spot.avgStarRating
  const getRandomInt = (max) => {
    return Math.floor(Math.random() * max);
  }
  return (
    <div id={`spot-${spot.id}`} className="spot-card-container"
      onClick={(e) => handleClick(e)}
    >
      <div className="card-container">
        {spot && (
          <div className="spot-img-wrapper">
            <img src={`${spot.previewImage}`} className="spot-img" alt={`${spot.name || spot.city}`} />
          </div>
        )}
        <div className="spot-info-container">
          <div className="spot-info-left">
            <div className="spot-location">{spot.city}, {spot.state}</div>
            <p className="spot-distance">{getRandomInt(100)} miles away</p>
            <div className="spot-price">
              <strong>${spot.price}</strong>
              <span> night</span>
            </div>
          </div>
          <div className="spot-info-right">
            <i className="fa-solid fa-star"></i>
            <div className="spot-rating">{rating}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Card
