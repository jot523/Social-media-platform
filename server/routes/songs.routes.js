/**
 * Songs Routes (MVC)
 */
const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth');
const controller = require('../controllers/songs.controller');

router.get('/',         auth, controller.getSongs);
router.get('/trending', auth, controller.getTrending);
router.post('/',        auth, controller.uploadSong);
router.get('/:id',      auth, controller.getSong);

module.exports = router;
