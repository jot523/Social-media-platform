/**
 * Auth Slice — lightweight state store (no Redux dependency)
 * Uses React Context + useReducer pattern as a Redux-like store.
 * Drop-in replacement if you add Redux Toolkit later.
 */

export const AUTH_ACTIONS = {
  SET_USER:    'SET_USER',
  SET_TOKEN:   'SET_TOKEN',
  LOGOUT:      'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER',
};

export const authInitialState = {
  user:    null,
  token:   localStorage.getItem('token') || null,
  loading: true,
};

export const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_USER:
      return { ...state, user: action.payload, loading: false };
    case AUTH_ACTIONS.SET_TOKEN:
      return { ...state, token: action.payload };
    case AUTH_ACTIONS.UPDATE_USER:
      return { ...state, user: { ...state.user, ...action.payload } };
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case AUTH_ACTIONS.LOGOUT:
      return { ...authInitialState, token: null, loading: false };
    default:
      return state;
  }
};