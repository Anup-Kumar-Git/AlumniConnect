const User = require('../models/User');

// Get All Admin Stats and Lists
exports.getStats = async (req, res) => {
  try {
    const type = req.query.type;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    if (type === 'students') {
      const [studentList, total] = await Promise.all([
        User.find({ role: 'Student' })
          .select('-password -resume')
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments({ role: 'Student' })
      ]);
      const hasMore = skip + studentList.length < total;
      return res.json({ studentList, hasMore });
    }

    if (type === 'alumni') {
      const [alumniList, total] = await Promise.all([
        User.find({ role: 'Alumni', isVerified: true })
          .select('-password -resume')
          .sort({ name: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments({ role: 'Alumni', isVerified: true })
      ]);
      const hasMore = skip + alumniList.length < total;
      return res.json({ alumniList, hasMore });
    }

    if (type === 'dashboard') {
      const [totalUsers, pendingAlumni, pendingTotal] = await Promise.all([
        User.countDocuments(),
        User.find({ role: 'Alumni', isVerified: false })
          .select('-password -resume')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments({ role: 'Alumni', isVerified: false })
      ]);
      const hasMore = skip + pendingAlumni.length < pendingTotal;
      return res.json({ totalUsers, pendingAlumni, hasMore });
    }

    return res.status(400).json({ msg: 'Invalid type parameter' });
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

const sendEmail = require('../utils/sendEmail');

// Reject (Delete) pending Alumni requests
exports.rejectAlumni = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Ensure we only delete unverified alumni
    if (user.role !== 'Alumni' || user.isVerified === true) {
      return res.status(400).json({ msg: 'Can only reject pending alumni.' });
    }

    const reason = req.body.reason || "Your identity or details could not be verified.";

    // Send email using Nodemailer before deleting the user
    try {
      await sendEmail({
        email: user.email,
        subject: 'Update on AlumniConnect Registration',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #d9534f;">Registration Request Update</h2>
            <p>Dear ${user.name},</p>
            <p>We regret to inform you that your recent registration request for AlumniConnect could not be approved at this time.</p>
            <p><strong>Reason for rejection:</strong></p>
            <blockquote style="border-left: 4px solid #d9534f; margin: 10px 0; padding-left: 15px; color: #555; font-style: italic;">
              ${reason}
            </blockquote>
            <p>If you believe this is a mistake, please reach out to our support team.</p>
            <p>Best Regards,<br><strong>The AlumniConnect Admin Team</strong></p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error("Failed to send rejection email:", emailErr);
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

    const reason = req.body.reason || "Violation of platform policies.";

    try {
      await sendEmail({
        email: user.email,
        subject: 'Notice of Account Deletion',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #d9534f;">Account Deletion Notice</h2>
            <p>Dear ${user.name},</p>
            <p>Your account has been deleted from AlumniConnect.</p>
            <p><strong>Reason for deletion:</strong></p>
            <blockquote style="border-left: 4px solid #d9534f; margin: 10px 0; padding-left: 15px; color: #555; font-style: italic;">
              ${reason}
            </blockquote>
            <p>Best Regards,<br><strong>The AlumniConnect Admin Team</strong></p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error("Failed to send deletion email:", emailErr);
    }

    // Ensure only Admin logic reaches here (handled via frontend/routes natively, but good measure)
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User successfully deleted.' });
  } catch (err) {
    console.error("Error in deleteUser:", err);
    res.status(500).send('Server Error');
  }
};