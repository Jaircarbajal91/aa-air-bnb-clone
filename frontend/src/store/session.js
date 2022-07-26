import { csrfFetch } from './csrf';

const SET_USER = 'session/setUser';
const DEMO_USER = 'session/demoUser';
const REMOVE_USER = 'session/removeUser';

const setUser = (user) => {
  return {
    type: SET_USER,
    payload: user,
  };
};

const removeUser = () => {
  return {
    type: REMOVE_USER,
  };
};

const demoLogIn = (user) => {
  return {
    type: DEMO_USER,
    payload: user
  };
};

export const login = (user) => async (dispatch) => {
  const { credential, password } = user;
  const response = await csrfFetch('/api/session/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      credential,
      password,
    }),
  });
  if (response.ok) {
    const data = await response.json();
    dispatch(setUser(data));
    return response
  }
  return response;
};

export const logInAsDemo = () => async dispatch => {
  const response = await csrfFetch('/api/session/demo');
  if (response.ok) {
    const user = await response.json();
    dispatch(demoLogIn(user))
    return user
  }
  return response
}

export const restoreUser = () => async dispatch => {
  const response = await csrfFetch('/api/session');
  const data = await response.json();
  if (Object.values(data).length) {
    dispatch(setUser(data.user));
    return response;
  }
  dispatch(setUser(null));
  return response;
};


export const signupUser = (user) => async dispatch => {
  const { firstName, lastName, email, password, username } = user;
  const response = await csrfFetch('api/users/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      username,
      password
    })
  });
  if (response.ok) {
    const data = await response.json();
    dispatch(setUser(data));
    return response;
  }
  return response;
}

export const logout = () => async (dispatch) => {
  const response = await csrfFetch('/api/session', {
    method: 'DELETE',
  });
  if (response.ok) {
    dispatch(removeUser());
    return response;
  }
  return response;
};

const initialState = { user: null };

const sessionReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case SET_USER:
    case DEMO_USER:
      newState = Object.assign({}, state);
      newState.user = action.payload;
      return newState;
    case REMOVE_USER:
      newState = Object.assign({}, state);
      newState.user = null;
      return newState;
    default:
      return state;
  }
};

export default sessionReducer;
