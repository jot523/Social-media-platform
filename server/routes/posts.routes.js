/**
 * Posts Routes (MVC — Route Layer)
 * Maps HTTP verbs + paths to controller methods.
 */

const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth');
const controller = require('../controllers/posts.controller');

// Public / Authenticated
router.get('/',    auth, controller.getFeed);
router.get('/saved', auth, controller.getSavedPosts);
router.get('/:id', auth, controller.getPost);

// Protected
router.post('/',              auth, controller.createPost);
router.delete('/:id',         auth, controller.deletePost);
router.put('/:id/like',       auth, controller.toggleLike);
router.post('/:id/comment',   auth, controller.addComment);
router.put('/:id/save',       auth, controller.toggleSave);
router.post('/:id/share',      auth, controller.sharePost);

module.exports = router;