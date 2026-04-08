const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const sessionRequestController = require('../controllers/sessionRequestController');

// @route   POST api/session-requests
// @desc    Submit a session request to an alumni
// @access  Private (Student)
router.post('/', auth, sessionRequestController.createSessionRequest);

// @route   GET api/session-requests/student
// @desc    Get session requests made by the student
// @access  Private (Student)
router.get('/student', auth, sessionRequestController.getStudentSessions);

// @route   GET api/session-requests/alumni/pending
// @desc    Get pending session requests for an alumni
// @access  Private (Alumni)
router.get('/alumni/pending', auth, sessionRequestController.getPendingSessions);

// @route   PUT api/session-requests/:id/status
// @desc    Accept or reject a session request
// @access  Private (Alumni)
router.put('/:id/status', auth, sessionRequestController.updateSessionRequestStatus);

// @route   GET api/session-requests/alumni/booked
// @desc    Get booked session requests for an alumni
// @access  Private (Alumni)
router.get('/alumni/booked', auth, sessionRequestController.getAlumniBookedSessions);

// @route   GET api/session-requests/student/booked
// @desc    Get booked session requests for a student
// @access  Private (Student)
router.get('/student/booked', auth, sessionRequestController.getStudentBookedSessions);

module.exports = router;
