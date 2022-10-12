import { csrfFetch } from './csrf';

const GET_SPOT_REVIEWS = 'review/getSpotReviews';
const CREATE_SPOT_REVIEW = 'review/createSpotReview'
const UPDATE_SPOT_REVIEW = 'review/updateSpotReview'
const DELETE_SPOT_REVIEW = 'review/deleteSpotReview'

const getSpotReviewsAction = reviews => ({
  type: GET_SPOT_REVIEWS,
  reviews
})

const createReviewAction = review => ({
  type: CREATE_SPOT_REVIEW,
  review
})

const updateReviewAction = review => ({
  type: UPDATE_SPOT_REVIEW,
  review
})

const deleteReviewAction = review => ({
  type: DELETE_SPOT_REVIEW,
  review
})

export const getSpotReviewsThunk = id => async dispatch => {
  const response = await csrfFetch(`/api/reviews/${id}`);
  if (response.ok) {
    const reviews = await response.json();
    dispatch(getSpotReviewsAction(reviews));
    return reviews
  }
  return response;
};

export const createReviewThunk = ({ review, stars }, id) => async dispatch => {
  try {
    const res = await csrfFetch(`/api/reviews/auth/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ review, stars })
    })
    if (res.ok) {
      const newReview = await res.json()
      dispatch(createReviewAction(newReview))
      return newReview
    }
  } catch (err) {
    const data = await err.json()
    return data
  }
}

export const updateReviewThunk = ({ review, stars }, id) => async dispatch => {
  try {
    const res = await csrfFetch(`/api/reviews/auth/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ review, stars })
    })
    if (res.ok) {
      const udpatedReview = await res.json()
      dispatch(updateReviewAction(udpatedReview))
      return udpatedReview
    }
  } catch (err) {
    const data = await err.json()
    return data
  }
}

export const deleteReviewThunk = id => async dispatch => {
  try {
    const res = await csrfFetch(`/api/reviews/auth/${id}`, { method: 'DELETE' })
    if (res.ok) {
      const deletedReview = await res.json()
      dispatch(deleteReviewAction(deletedReview))
      return deletedReview
    }
  } catch (err) {
    const data = await err.json()
    return data
  }
}


const reviewsReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_SPOT_REVIEWS: {
      const newState = { ...state }
      action.reviews.Reviews.forEach(review => {
        newState[review.id] = review
      })
      newState.orderedReviewsList = [...action.reviews.Reviews.sort((a, b) => b.createdAt - a.createdAt)]
      return newState
    }
    case UPDATE_SPOT_REVIEW:
    case CREATE_SPOT_REVIEW: {
      const newState = { ...state }
      // console.log(action.review)
      // newState[action.review.review.id] = action.review
      // newState.orderedReviewsList.push(action.review.review)
      return newState
    }
    default:
      return state;
  }
}

export default reviewsReducer
