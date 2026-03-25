const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createSlot, bookSlot } = require('../controllers/slotController');

// @route   POST api/slots
// @desc    Create a slot (Alumni) [cite: 34]
router.post('/', auth, createSlot);

// @route   PUT api/slots/book/:id
// @desc    Book a slot (Student) [cite: 39]
router.put('/book/:id', auth, bookSlot);

module.exports = router;