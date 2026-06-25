/**
 * Messages Routes (MVC)
 */
const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth');
const controller = require('../controllers/messages.controller');

router.get('/conversations', auth, controller.getConversations);
router.get('/:userId',       auth, controller.getMessages);
router.post('/',             auth, controller.sendMessage);

module.exports = router;