import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getSpotDetails } from "../../store/spots"
import Review from "./Review"
import '../Reviews/Reviews.css'

function Reviews({sessionUser, spot, reviews, setUpdateShowReviewModal, setReviewToUpdate}) {
  return (
    <div className="reviews-container">
      {reviews.map(review => (
        <Review key={review.id} setReviewToUpdate={setReviewToUpdate} setUpdateShowReviewModal={setUpdateShowReviewModal} sessionUser={sessionUser} review={review}/>
      ))}
    </div>
  )
}

export default Reviews
