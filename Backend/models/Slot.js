const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  alumni: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['Available', 'Booked', 'Completed'], default: 'Available' }, // [cite: 20]
  feedback: { // Standardized rating form [cite: 36]
    technical: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    logical: { type: Number, min: 1, max: 5 },
    comments: String
  }
});

module.exports = mongoose.model('Slot', SlotSchema);