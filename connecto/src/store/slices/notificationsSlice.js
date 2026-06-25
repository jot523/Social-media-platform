/**
 * Notifications Slice
 */

export const NOTIF_ACTIONS = {
  SET:          'SET',
  ADD:          'ADD',
  MARK_READ:    'MARK_READ',
  MARK_ALL:     'MARK_ALL',
  SET_LOADING:  'SET_LOADING',
};

export const notifInitialState = {
  items:       [],
  unreadCount: 0,
  loading:     false,
};

export const notificationsReducer = (state, action) => {
  switch (action.type) {
    case NOTIF_ACTIONS.SET:
      return {
        ...state,
        items: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
        loading: false,
      };

    case NOTIF_ACTIONS.ADD:
      return {
        ...state,
        items: [action.payload, ...state.items],
        unreadCount: state.unreadCount + 1,
      };

    case NOTIF_ACTIONS.MARK_READ:
      return {
        ...state,
        items: state.items.map(n =>
          n._id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };

    case NOTIF_ACTIONS.MARK_ALL:
      return {
        ...state,
        items: state.items.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      };

    case NOTIF_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    default:
      return state;
  }
};