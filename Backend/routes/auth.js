const express = require('express');
const router = express.Router();
const { register, login, sendOtp } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);

module.exports = router;