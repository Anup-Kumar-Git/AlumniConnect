const express = require('express');
const router = express.Router();
const { register, login, sendOtp, updateHeartbeat } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/heartbeat', auth, updateHeartbeat);

module.exports = router;