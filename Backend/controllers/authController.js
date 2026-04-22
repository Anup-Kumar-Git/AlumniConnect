const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ msg: 'Email is required' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });

    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>AlumniConnect Registration OTP</h2>
        <p>Your One-Time Password for registration is:</p>
        <h1 style="color: #4CAF50; font-size: 40px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    await sendEmail({
      email,
      subject: 'AlumniConnect - Registration OTP Verification',
      html: message,
    });

    res.status(200).json({ msg: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ msg: 'There was an error sending the OTP' });
  }
};

exports.register = async (req, res) => {
  const { name, email, password, role, domain, instituteName, degree, session, department, profilePicture, otp } = req.body;
  try {
    if (!otp) {
      return res.status(400).json({ msg: 'OTP is required' });
    }

    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Students/Admins are auto-verified, Alumni start as false
    const isVerified = (role === 'Student' || role === 'Admin');

    user = new User({ name, email, password, role, domain, isVerified, instituteName, degree, session, department, profilePicture });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    await Otp.deleteMany({ email });

    // STOP HERE for Alumni: Do not send a token
    if (role === 'Alumni') {
      return res.json({ msg: 'Registration successful! Please wait for Admin approval before logging in.' });
    }

    // Auto-login for Students/Admins
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' }, (err, token) => {
      if (err) throw err;
      res.json({ token, name: user.name, role: user.role, profilePicture: user.profilePicture });
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.login = async (req, res) => {
  const { email, password, loginType } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    if (loginType && user.role !== loginType) {
      return res.status(403).json({
        msg: `Access Denied: You are registered as ${user.role}, not ${loginType}.`
      });
    }

    // THE GATEKEEPER: Check if Alumni is verified
    if (user.role === 'Alumni' && user.isVerified === false) {
      return res.status(401).json({
        msg: 'Your account is pending Admin approval. Access denied until verified.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' }, (err, token) => {
      if (err) throw err;
      res.json({ token, name: user.name, role: user.role, profilePicture: user.profilePicture });
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};