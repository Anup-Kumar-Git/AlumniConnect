const User = require('../models/User');

// Get All Admin Stats and Lists
exports.getStats = async (req, res) => {
  try {
    // 1. Calculate Summary Stats
    const totalUsers = await User.countDocuments();
    
    // 2. Fetch Pending Alumni (role is Alumni AND isVerified is false)
    // We use .select('-password') for security
    const pendingAlumni = await User.find({ role: 'Alumni', isVerified: false })
      .select('-password')
      .sort({ createdAt: -1 }); // Newest first

    // 3. Fetch Verified Alumni List
    const alumniList = await User.find({ role: 'Alumni', isVerified: true })
      .select('-password')
      .sort({ name: 1 }); // Alphabetical

    // 4. Fetch Student List
    const studentList = await User.find({ role: 'Student' })
      .select('-password')
      .sort({ name: 1 });

    res.json({
      totalUsers,
      pendingAlumni, // This is the array for your "Pending Approvals" section
      alumniList,    // This is the array for your "Active Alumni List" section
      studentList
    });
  } catch (err) {
    console.error("Error in getStats:", err);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// Approve Alumni registrations
exports.verifyAlumni = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.isVerified = true;
    await user.save();
    
    res.json({ msg: 'Alumni verified successfully' });
  } catch (err) {
    console.error("Error in verifyAlumni:", err);
    res.status(500).send('Server Error');
  }
};

// Reject (Delete) pending Alumni requests
exports.rejectAlumni = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Ensure we only delete unverified alumni
    if (user.role !== 'Alumni' || user.isVerified === true) {
      return res.status(400).json({ msg: 'Can only reject pending alumni.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Alumni request rejected and deleted successfully' });
  } catch (err) {
    console.error("Error in rejectAlumni:", err);
    res.status(500).send('Server Error');
  }
};

// Delete any active User (Admin privilege)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Ensure only Admin logic reaches here (handled via frontend/routes natively, but good measure)
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User successfully deleted.' });
  } catch (err) {
    console.error("Error in deleteUser:", err);
    res.status(500).send('Server Error');
  }
};