/**
 * Reels Routes (MVC)
 */
const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth');
const controller = require('../controllers/reels.controller');

router.get('/',     auth,     controller.getReels);
router.get('/saved', auth, controller.getSavedReels);
router.post('/',     auth, controller.createReel);
router.put('/:id/like', auth, controller.toggleLike);
router.put('/:id/save', auth, controller.toggleSave);
router.post('/:id/comment', auth, controller.addComment);
router.put('/:id/share', auth, controller.shareReel);

module.exports = router;