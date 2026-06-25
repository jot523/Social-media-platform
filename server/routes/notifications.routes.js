/**
 * Notifications Routes (MVC)
 */
const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth');
const controller = require('../controllers/notifications.controller');

router.get('/',              auth, controller.getNotifications);
router.put('/read-all',      auth, controller.markAllRead);
router.put('/:id/read',      auth, controller.markOneRead);

module.exports = router;