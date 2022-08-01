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
        {spot && (<img src={`${spot.previewImage}`} className="spot-img" />)}
        <div className="spot-info-container">
          <div className="spot-info-left">
            <div style={{
              fontSize: '.9rem'
            }}>{spot.city}, {spot.state}</div>
            <p style={{
              fontSize: '.9rem',
              color: 'grey'
            }}>{getRandomInt(100)} miles away</p>
            <div><strong>${spot.price}</strong> <span style={{
              fontSize: '.9rem'
            }}>night</span></div>
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
