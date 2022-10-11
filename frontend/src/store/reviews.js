import { csrfFetch } from './csrf';

const GET_SPOT_REVIEWS = 'review/getSpotReviews';
const CREATE_SPOT_REVIEW = 'review/createSpotReview'

const getSpotReviewsAction = reviews => ({
  type: GET_SPOT_REVIEWS,
  reviews
})

const createReviewAction = review => ({
  type: CREATE_SPOT_REVIEW,
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

export const createReviewThunk = (review, id) => async dispatch => {
  const res = await csrfFetch(`/api/reviews/auth/${id}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(review)
  })
  if (res.ok) {
    const newReview = await res.json()
    dispatch(createReviewAction(newReview))
    return newReview
  }
  const data = await res.json()
  return data
}


const reviewsReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_SPOT_REVIEWS: {
      const newState = { ...state }
      action.reviews.Reviews.forEach(review => {
        newState[review.id] = review
      })
      newState.orderedReviewsList = [ ...action.reviews.Reviews.sort((a, b) => b.createdAt - a.createdAt) ]
      return newState
    }
    case CREATE_SPOT_REVIEW: {
      const newState = { ...state }
      console.log(action.review)
      newState[action.review.review.id] = action.review
      newState.orderedReviewsList.push(action.review.review)
      return newState
    }
    default:
      return state;
  }
}

export default reviewsReducer
