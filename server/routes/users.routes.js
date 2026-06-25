/**
 * Users Routes (MVC — Route Layer)
 * 
 * IMPORTANT: Specific named routes must come BEFORE parameterized /:id routes,
 * otherwise Express will interpret 'profile', 'search', etc. as the :id param.
 */

const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth');
const controller = require('../controllers/users.controller');

// ── Specific named routes (MUST come before /:id) ──────────────
router.get('/me',            auth, controller.getMe);
router.get('/search',        auth, controller.searchUsers);
router.get('/suggestions',   auth, controller.getSuggestions);
router.put('/profile',       auth, controller.updateProfile);
router.put('/change-password', auth, controller.changePassword);
router.put('/settings',        auth, controller.updateSettings);
router.put('/block/:id',       auth, controller.toggleBlock);
router.post('/highlights',           auth, controller.createHighlight);
router.delete('/highlights/:highlightId', auth, controller.deleteHighlight);

// ── Parameterized routes ───────────────────────────────────────
router.get('/:id',           auth, controller.getProfile);
router.get('/:id/posts',     auth, controller.getUserPosts);
router.get('/:id/followers', auth, controller.getFollowers);
router.get('/:id/following', auth, controller.getFollowing);
router.get('/:id/highlights', auth, controller.getHighlights);
router.put('/:id/follow',    auth, controller.toggleFollow);

module.exports = router;