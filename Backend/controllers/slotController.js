const Slot = require('../models/Slot');

// Alumni: Create 30-minute bookable slots [cite: 35]
exports.createSlot = async (req, res) => {
  const { startTime, endTime } = req.body;
  try {
    const newSlot = new Slot({
      alumni: req.user.id,
      startTime,
      endTime,
      status: 'Available'
    });
    await newSlot.save();
    res.status(201).json(newSlot);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Student: Book a slot [cite: 39]
exports.bookSlot = async (req, res) => {
  try {
    let slot = await Slot.findById(req.params.id);
    if (!slot || slot.status !== 'Available') {
      return res.status(400).json({ msg: 'Slot is not available' });
    }
    slot.student = req.user.id;
    slot.status = 'Booked';
    await slot.save();
    res.json(slot);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};