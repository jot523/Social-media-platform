/**
 * Route Constants
 * Single source of truth for all app routes
 */

export const ROUTES = {
  // Public
  LANDING:  '/landing',

  // Protected
  HOME:     '/',
  PROFILE:  '/profile',
  PROFILE_USER: (id) => `/profile/${id}`,
  CHAT:     '/chat',
  REELS:    '/reels',
  NEWSFEED: '/newsfeed',
  EXPLORE:  '/explore',
  EXPLORE_TAG: (tag) => `/explore/tag/${tag}`,
  ACTIVITY: '/activity',
  TIMELINE: '/timelineabout',
};