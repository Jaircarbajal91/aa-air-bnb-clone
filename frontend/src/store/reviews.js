import { csrfFetch } from './csrf';

const GET_SPOT_REVIEWS = 'spots/getSpotReviews';

const getSpotReviewsAction = reviews => ({
  type: GET_SPOT_REVIEWS,
  reviews
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
    default:
      return state;
  }
}

export default reviewsReducer
