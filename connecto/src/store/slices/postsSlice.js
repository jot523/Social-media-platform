/**
 * Posts Slice — lightweight reducer for post state
 */

export const POSTS_ACTIONS = {
  SET_POSTS:      'SET_POSTS',
  APPEND_POSTS:   'APPEND_POSTS',
  ADD_POST:       'ADD_POST',
  UPDATE_POST:    'UPDATE_POST',
  REMOVE_POST:    'REMOVE_POST',
  SET_LOADING:    'SET_LOADING',
  SET_ERROR:      'SET_ERROR',
  SET_HAS_MORE:   'SET_HAS_MORE',
  TOGGLE_LIKE:    'TOGGLE_LIKE',
  ADD_COMMENT:    'ADD_COMMENT',
};

export const postsInitialState = {
  posts:   [],
  loading: false,
  error:   null,
  hasMore: true,
  page:    1,
};

export const postsReducer = (state, action) => {
  switch (action.type) {
    case POSTS_ACTIONS.SET_POSTS:
      return { ...state, posts: action.payload, loading: false, error: null };

    case POSTS_ACTIONS.APPEND_POSTS:
      return { ...state, posts: [...state.posts, ...action.payload], loading: false };

    case POSTS_ACTIONS.ADD_POST:
      return { ...state, posts: [action.payload, ...state.posts] };

    case POSTS_ACTIONS.UPDATE_POST:
      return {
        ...state,
        posts: state.posts.map(p => p._id === action.payload._id ? action.payload : p)
      };

    case POSTS_ACTIONS.REMOVE_POST:
      return { ...state, posts: state.posts.filter(p => p._id !== action.payload) };

    case POSTS_ACTIONS.TOGGLE_LIKE: {
      const { postId, userId, liked } = action.payload;
      return {
        ...state,
        posts: state.posts.map(p => {
          if (p._id !== postId) return p;
          const likes = liked
            ? [...(p.likes || []), userId]
            : (p.likes || []).filter(id => id !== userId);
          return { ...p, likes };
        })
      };
    }

    case POSTS_ACTIONS.ADD_COMMENT: {
      const { postId, comment } = action.payload;
      return {
        ...state,
        posts: state.posts.map(p =>
          p._id === postId
            ? { ...p, comments: [...(p.comments || []), comment] }
            : p
        )
      };
    }

    case POSTS_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case POSTS_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case POSTS_ACTIONS.SET_HAS_MORE:
      return { ...state, hasMore: action.payload };

    default:
      return state;
  }
};