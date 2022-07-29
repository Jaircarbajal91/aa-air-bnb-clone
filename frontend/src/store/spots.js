import { csrfFetch } from './csrf';

const GET_ALL_SPOTS = 'spots/getAllSpots';
const CREAT_NEW_SPOT = 'spots/createNewSpot';
const UPDATE_SPOT = 'spots/updateSpot';
const DELETE_SPOT = 'spots/deleteSpot';
const GET_SPOT_DETAILS = 'spots/getSpotDetails';


const getSingleSpot = spot => {
  return {
    type: GET_SPOT_DETAILS,
    spot
  };
};

const getSpots = spots => {
  return {
    type: GET_ALL_SPOTS,
    spots
  };
};


const createSingleSpot = spot => {
  return {
    type: CREAT_NEW_SPOT,
    spot
  };
};

const updateSpotAction = spot => {
  return {
    type: UPDATE_SPOT,
    spot
  };
};

const deleteSpotAction = id => {
  return {
    type: DELETE_SPOT,
    id
  }
}


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
  console.log('in thunk')
  const response = await csrfFetch('/api/spots/auth', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(spot)
  })
  console.log("here above!!!!!", response)
  if (response.ok) {
    const newSpot = await response.json()
    dispatch(createSingleSpot(newSpot))
    return newSpot;
  }
  console.log("getting errors")
  const errors = await response.json()
  console.log(errors.errors)
  return errors
}

export const updateSpot = spot => async dispatch => {
  const response = await csrfFetch(`/api/spots/auth/${spot.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(spot)
  })
  if (response.ok) {
    const spot = await response.json()
    dispatch(updateSpotAction(spot))
    return spot;
  }
  const errors = await response.json()
  return errors
}

export const deleteSpot = id => async dispatch => {
  const response = await csrfFetch(`/api/spots/auth/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (response.ok) {
    const message = await response.json()
    dispatch(deleteSpotAction(id))
    return message
  }
  return response;
}

const spotsReducer = (state = {}, action) => {
  switch (action.type) {
    case GET_ALL_SPOTS: {
      let newState = { ...state }
      action.spots.forEach(spot => {
        newState[spot.id] = spot
      })
      newState.orderedSpotsList = [...action.spots.sort((a, b) => b.id - a.id)]
      return newState
    }
    case GET_SPOT_DETAILS: {
      let newState = { ...state }
      newState.selectedSpot = {}
      newState.selectedSpot[action.spot.id] = action.spot
      const images = action.spot.Images
      newState.selectedSpot[action.spot.id].images = {}
      images.forEach((image, i) => {
        newState.selectedSpot[action.spot.id].images[i + 1] = image.url
      })
      delete newState.selectedSpot[action.spot.id].Images
      return newState
    }
    case DELETE_SPOT: {
      const newState = { ...state }
      delete newState[action.id]
      return newState
    }
    case UPDATE_SPOT: {
      let newState = { ...state };
      newState[action.spot.id] = action.spot
      return newState;
    }
    case CREAT_NEW_SPOT: {
      let newState = { ...state };
      newState[action.spot.id] = action.spot
      return newState;
    }
    default:
      return state;
  }
}

export default spotsReducer
