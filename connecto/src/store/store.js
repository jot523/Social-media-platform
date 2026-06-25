/**
 * App Store
 * Lightweight context-based store using useReducer.
 * Provides a Redux-like pattern without adding Redux as a dependency.
 * Each slice has its own reducer; this file wires them together.
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { postsReducer,         postsInitialState         } from './slices/postsSlice';
import { notificationsReducer, notifInitialState         } from './slices/notificationsSlice';

// ── Context ────────────────────────────────────────────────────
const StoreContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────
export const StoreProvider = ({ children }) => {
  const [postsState,  dispatchPosts]  = useReducer(postsReducer,         postsInitialState);
  const [notifState,  dispatchNotif]  = useReducer(notificationsReducer, notifInitialState);

  const store = {
    posts:         postsState,
    notifications: notifState,
  };

  const dispatch = useCallback((action) => {
    // Route action to the correct slice by prefix
    if (action.type.startsWith('posts/') || action.type.startsWith('POSTS_')) {
      dispatchPosts(action);
    } else if (action.type.startsWith('notif/') || action.type.startsWith('NOTIF_')) {
      dispatchNotif(action);
    } else {
      // Broadcast to all slices (for shared actions)
      dispatchPosts(action);
      dispatchNotif(action);
    }
  }, []);

  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────
export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};

export default StoreProvider;