const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password, role, domain, instituteName, degree, session, department, profilePicture } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Students/Admins are auto-verified, Alumni start as false
    const isVerified = (role === 'Student' || role === 'Admin');

    user = new User({ name, email, password, role, domain, isVerified, instituteName, degree, session, department, profilePicture });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // STOP HERE for Alumni: Do not send a token
    if (role === 'Alumni') {
      return res.json({ msg: 'Registration successful! Please wait for Admin approval before logging in.' });
    }

    // Auto-login for Students/Admins
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
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
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, name: user.name, role: user.role, profilePicture: user.profilePicture });
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};