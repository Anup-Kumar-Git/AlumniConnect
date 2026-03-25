const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Alumni', 'Admin'], required: true },
  domain: { type: String },
  contactNo: { type: String },
  interestedSubject: { type: String },
  profilePicture: { type: String },
  otherDetails: { type: String },
  resume: { type: String },
  isVerified: { type: Boolean, default: false }, // Admin approval
  academicYear: { type: String },
  expertise: { type: String },
  experience: { type: String },
  company: { type: String },
  linkedin: { type: String },
  github: { type: String }
});

module.exports = mongoose.model('User', UserSchema);