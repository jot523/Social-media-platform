/**
 * API Constants
 * Centralised API endpoint definitions
 */

export const API_BASE = '/api';

export const AUTH_ENDPOINTS = {
  LOGIN:    `${API_BASE}/auth/login`,
  REGISTER: `${API_BASE}/auth/register`,
  LOGOUT:   `${API_BASE}/auth/logout`,
};

export const POST_ENDPOINTS = {
  FEED:    `${API_BASE}/posts`,
  SINGLE:  (id)      => `${API_BASE}/posts/${id}`,
  LIKE:    (id)      => `${API_BASE}/posts/${id}/like`,
  COMMENT: (id)      => `${API_BASE}/posts/${id}/comment`,
  SAVE:    (id)      => `${API_BASE}/posts/${id}/save`,
  SHARE:   (id)      => `${API_BASE}/posts/${id}/share`,
  REPORT:  (id)      => `${API_BASE}/posts/${id}/report`,
};

export const USER_ENDPOINTS = {
  ME:          `${API_BASE}/users/me`,
  SEARCH:      `${API_BASE}/users/search`,
  SUGGESTIONS: `${API_BASE}/users/suggestions`,
  PROFILE:     (id)  => `${API_BASE}/users/${id}`,
  POSTS:       (id)  => `${API_BASE}/users/${id}/posts`,
  FOLLOW:      (id)  => `${API_BASE}/users/${id}/follow`,
  UPDATE:      `${API_BASE}/users/profile`,
};

export const STORY_ENDPOINTS = {
  LIST:   `${API_BASE}/stories`,
  CREATE: `${API_BASE}/stories`,
  VIEW:   (id) => `${API_BASE}/stories/${id}/view`,
  DELETE: (id) => `${API_BASE}/stories/${id}`,
};

export const REEL_ENDPOINTS = {
  LIST:   `${API_BASE}/reels`,
  CREATE: `${API_BASE}/reels`,
  LIKE:   (id) => `${API_BASE}/reels/${id}/like`,
};

export const MESSAGE_ENDPOINTS = {
  CONVERSATIONS: `${API_BASE}/messages/conversations`,
  THREAD:        (userId) => `${API_BASE}/messages/${userId}`,
  SEND:          `${API_BASE}/messages`,
};

export const NOTIFICATION_ENDPOINTS = {
  LIST:       `${API_BASE}/notifications`,
  READ_ALL:   `${API_BASE}/notifications/read-all`,
  READ_ONE:   (id) => `${API_BASE}/notifications/${id}/read`,
};

export const UPLOAD_ENDPOINT = `${API_BASE}/upload`;