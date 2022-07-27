import { csrfFetch } from './csrf';

const GET_SPOT_DETAILS = 'spots/getSpotDetails';

const getSingleSpot = spot => {
  return {
    type: GET_SPOT_DETAILS,
    spot
  };
};

export const getSpotDetails = (id) => async dispatch => {
  const response = await csrfFetch(`/api/spots/${id}`);
  if (response.ok) {
    const spot = await response.json();
    dispatch(getSingleSpot(spot));
    return spot
  }
  return response;
};

const selectedSpotsReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_SPOT_DETAILS: {
      let newState = {}
      newState[action.spot.id] = action.spot
      const images = action.spot.Images
      newState[action.spot.id].images = {}
      images.forEach((image, i) => {
        newState[action.spot.id].images[i + 1] = image.url
      })
      delete newState[action.spot.id].Images
      return newState
    }
    default:
      return state
  }
}

export default selectedSpotsReducer;
