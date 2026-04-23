const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const profileController = require('../controllers/profileController');
const resumeMatcherController = require('../controllers/resumeMatcherController');

// @route   GET /api/profile
router.get('/', auth, profileController.getProfile);

// @route   PUT /api/profile
router.put('/', auth, profileController.updateProfile);

// @route   GET /api/profile/recommendations
// @desc    Get AI Alumni recommendations based on resume
// @access  Private
router.get('/recommendations', auth, resumeMatcherController.getRecommendations);

// @route   GET /api/profile/user/:id
// @desc    Get another user's profile by ID
// @access  Private
router.get('/user/:id', auth, profileController.getUserProfileById);

module.exports = router;
