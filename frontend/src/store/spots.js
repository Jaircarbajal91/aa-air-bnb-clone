import { csrfFetch } from './csrf';

const GET_ALL_SPOTS = 'spots/getAllSpots';
const GET_SPOT_DETAILS = 'spots/getSpotDetails';
const CREAT_NEW_SPOT = 'spots/createNewSpot'
const UPDATE_SPOT = 'spots/updateSpot'

const getSpots = (spots) => {
  return {
    type: GET_ALL_SPOTS,
    spots
  };
};

const getSingleSpot = (spot) => {
  return {
    type: GET_SPOT_DETAILS,
    spot
  };
};

const createSingleSpot = (spot) => {
  return {
    type: CREAT_NEW_SPOT,
    spot
  };
};

const updateSpotAction = (spot) => {
return {
    type: UPDATE_SPOT,
    spot
  };
};


export const getAllSpots = () => async dispatch => {
  const response = await csrfFetch('/api/spots');
  if (response.ok) {
    const spots = await response.json();
    dispatch(getSpots(spots.Spots));
    return response
  }
  return response;
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

export const createNewSpot = spot => async dispatch => {
  const response = await csrfFetch('/api/spots/auth', {
    method: "POST",
    body: JSON.stringify(spot)
  })
  if (response.ok) {
    const newSpot = await response.json()
    dispatch(createSingleSpot(newSpot))
    return newSpot;
  }
  return response
}

export const updateSpot = spot => async dispatch => {
  const response = await csrfFetch(`api/spots/auth/${spot.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(spot)
  })
  if (response.ok) {
    const spot = await response.json()
    dispatch(updateSpot(spot))
    return spot;
  }
  return response
}

const spotsReducer = (state = {}, action) => {
  switch(action.type) {
    case GET_ALL_SPOTS: {
      let newState = {...state}
      action.spots.forEach(spot => {
        newState[spot.id] = spot
      })
      newState.orderedSpotsList = [...action.spots.sort((a, b) => a.id - b.id)]
      return newState
    }
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
    case UPDATE_SPOT:
    case CREAT_NEW_SPOT:
      let newState = {...state};
      newState[action.spot.id] = action.spot
      return newState;
    default:
      return state;
  }
}

export default spotsReducer
