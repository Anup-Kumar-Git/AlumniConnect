const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { verifyAlumni, getStats, rejectAlumni } = require('../controllers/adminController');

// Verification and Stats (Admin only)
router.put('/verify/:id', auth, verifyAlumni);
router.delete('/reject/:id', auth, rejectAlumni);
router.get('/stats', auth, getStats);

module.exports = router;