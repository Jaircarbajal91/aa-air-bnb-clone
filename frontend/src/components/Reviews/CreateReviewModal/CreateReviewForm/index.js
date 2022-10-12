import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { createReviewThunk } from "../../../../store/reviews"
import Stars from '../../../Stars'
import './CreateReviewFrom.css'

const CreateReviewForm = ({ spot, setShowReviewModal, setNewReviewPosted }) => {
  const [starRating, setStarRating] = useState(0)
  const [review, setReview] = useState('')
  const [errors, setErrors] = useState([])
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const dispatch = useDispatch()

  useEffect(() => {
    if (hasSubmitted) {
      const newErrors = []
      if (starRating === 0) newErrors.push("Please select a star rating")
      if (review.length < 10 || review.length > 400) newErrors.push("Review length should be between 10 and 400 characters")
      setErrors(newErrors)
    }
  }, [starRating, review, hasSubmitted])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (errors.length) return
    const res = await dispatch(createReviewThunk({ review, stars: starRating }, spot.id))
    if (res.statusCode >= 400) {
      if (res.message === 'User already has a review for this spot') {
        setErrors(['User already has a review for this spot'])
      } else {
        setHasSubmitted(true)
      }
    } else {
      setShowReviewModal(false)
      setNewReviewPosted(true)
      setNewReviewPosted(false)
    }
  }
  return (
    <div className="create-review-container">
      <h3>How was your stay?</h3>
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

export default CreateReviewForm
