const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', authController.register);

router.post('/register-company', authController.registerCompany);

router.post('/login', authController.login);

router.get('/me', authMiddleware.verifyAuth, authController.me);

module.exports = router;
