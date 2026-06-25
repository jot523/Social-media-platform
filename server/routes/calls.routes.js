/**
 * Calls Routes (MVC)
 */
const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth');
const controller = require('../controllers/calls.controller');

router.post('/',     auth, controller.createCall);
router.put('/:id',   auth, controller.updateCall);
router.get('/',      auth, controller.getCallHistory);

module.exports = router;
