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

// @route   GET api/requests/student/connections
// @desc    Get accepted connections for a student
// @access  Private (Student)
router.get('/student/connections', auth, requestController.getStudentConnections);

// @route   GET api/requests/status/:alumniId
// @desc    Check request status between student and alumni
// @access  Private (Student)
router.get('/status/:alumniId', auth, requestController.getRequestStatus);

module.exports = router;
