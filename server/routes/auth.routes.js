/**
 * Auth Routes (MVC)
 */
const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../validators/auth.validator');

router.post('/register', validateRegister, controller.register);
router.post('/login',    validateLogin,    controller.login);

module.exports = router;