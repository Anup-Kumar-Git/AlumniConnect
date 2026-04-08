const mongoose = require('mongoose');

const SessionRequestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  alumni: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  date: { type: String },
  time: { type: String },
  meetLink: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SessionRequest', SessionRequestSchema);
