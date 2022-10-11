import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getSpotDetails } from "../../store/spots"
import Review from "./Review"
import '../Reviews/Reviews.css'

function Reviews({spot, reviews}) {
  return (
    <div className="reviews-container">
      {reviews.map(review => (
        <Review key={review.id} review={review}/>
      ))}
    </div>
  )
}

export default Reviews
