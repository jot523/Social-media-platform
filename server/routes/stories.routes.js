/**
 * Stories Routes (MVC)
 */
const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth');
const controller = require('../controllers/stories.controller');

router.get('/',           auth, controller.getStories);
router.post('/',          auth, controller.createStory);
router.put('/:id/view',   auth, controller.viewStory);
router.delete('/:id',     auth, controller.deleteStory);
router.post('/:id/react', auth, controller.reactStory);
router.post('/:id/reply', auth, controller.replyStory);

module.exports = router;