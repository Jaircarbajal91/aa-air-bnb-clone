import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { updateReviewThunk } from "../../../../store/reviews"
import Stars from "../../../Stars"

const UpdateReviewForm = ({ spot, setUpdateShowReviewModal, reviewToUpdate, setUpdateReviewPosted }) => {
  console.log(reviewToUpdate.id)
  const [starRating, setStarRating] = useState(reviewToUpdate.stars)
  const [review, setReview] = useState(reviewToUpdate.review)
  const [errors, setErrors] = useState([])
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const dispatch = useDispatch()

  useEffect(() => {
    const newErrors = []
    if (starRating === 0) newErrors.push("Please select a star rating")
    if (review.length < 10 || review.length > 400) newErrors.push("Review length should be between 10 and 400 characters")
    setErrors(newErrors)
  }, [starRating, review, hasSubmitted])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setHasSubmitted(true)
    if (errors.length) return
    const res = await dispatch(updateReviewThunk({ review, stars: starRating }, reviewToUpdate.id))
    if (res.message) {
      console.log(res)
      setErrors([res.message])
    } else {
      setUpdateShowReviewModal(false)
      setUpdateReviewPosted(true)
      setUpdateReviewPosted(false)
    }
  }
  return (
    <div className="create-review-container">
      <h3>Update your review</h3>
      <div className="review-errors-container">
        {errors.length > 0 && errors.map(error => (
          <div key={error} className="review-errors">{error}</div>
        ))}
      </div>
      <div className="stars-wrapper">
        <Stars starRating={starRating} setStarRating={setStarRating} />
        <span className={review.length > 400 ? "review-length-overflow" : "review-length"}>{review.length} / 400</span>
      </div>
      <form className="create-review-form" onSubmit={handleSubmit}>
        <textarea
          className="review-textarea-input"
          cols="30"
          rows="10"
          placeholder="Write a review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        >
        </textarea>
        <button className="button new-review" type="submit">Submit Review</button>
      </form>
    </div>
  )
}

export default UpdateReviewForm
