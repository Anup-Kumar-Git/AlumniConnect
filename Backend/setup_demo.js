const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setup() {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/alumni-connect';
    await mongoose.connect(dbUri);
    console.log('Connected to DB');

    const password = await bcrypt.hash('demo123', 10);

    let student = await User.findOne({ email: 'demo_student@test.com' });
    if (!student) {
      student = new User({ name: 'Demo Student', email: 'demo_student@test.com', password, role: 'Student', isVerified: true });
      await student.save();
    }

    let alumni = await User.findOne({ email: 'demo_alumni@test.com' });
    if (!alumni) {
      alumni = new User({ name: 'Demo Alumni', email: 'demo_alumni@test.com', password, role: 'Alumni', isVerified: true, domain: 'Software Engineering', expertise: 'React' });
      await alumni.save();
    }

    console.log('Demo users created successfully: demo_student@test.com & demo_alumni@test.com with password "demo123"');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setup();
