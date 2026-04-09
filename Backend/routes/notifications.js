const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// @route   GET api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, notificationController.getNotifications);

// @route   PUT api/notifications/read
// @desc    Mark notifications as read
// @access  Private
router.put('/read', auth, notificationController.markAsRead);

module.exports = router;
