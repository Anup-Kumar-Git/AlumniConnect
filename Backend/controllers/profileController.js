const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  const { 
    name, contactNo, interestedSubject, domain, otherDetails, profilePicture, resume,
    academicYear, expertise, experience, company, linkedin, github
  } = req.body;

  // Build profile object
  const profileFields = {};
  if (name !== undefined) profileFields.name = name;
  if (contactNo !== undefined) profileFields.contactNo = contactNo;
  if (interestedSubject !== undefined) profileFields.interestedSubject = interestedSubject;
  if (domain !== undefined) profileFields.domain = domain;
  if (otherDetails !== undefined) profileFields.otherDetails = otherDetails;
  if (profilePicture !== undefined) profileFields.profilePicture = profilePicture;
  if (resume !== undefined) profileFields.resume = resume;
  if (academicYear !== undefined) profileFields.academicYear = academicYear;
  if (expertise !== undefined) profileFields.expertise = expertise;
  if (experience !== undefined) profileFields.experience = experience;
  if (company !== undefined) profileFields.company = company;
  if (linkedin !== undefined) profileFields.linkedin = linkedin;
  if (github !== undefined) profileFields.github = github;

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update
    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
