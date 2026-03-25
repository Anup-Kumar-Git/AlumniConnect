const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requestController = require('../controllers/requestController');

// @route   POST api/requests
// @desc    Create an appointment request
// @access  Private (Student)
router.post('/', auth, requestController.createRequest);

// @route   GET api/requests/alumni
// @desc    Get requests for an alumni
// @access  Private (Alumni)
router.get('/alumni', auth, requestController.getAlumniRequests);

// @route   PUT api/requests/:id/status
// @desc    Accept or reject a request
// @access  Private (Alumni)
router.put('/:id/status', auth, requestController.updateRequestStatus);

// @route   GET api/requests/stats/dashboard
// @desc    Get dashboard stats for logic
// @access  Private
router.get('/stats/dashboard', auth, requestController.getDashboardStats);

module.exports = router;
