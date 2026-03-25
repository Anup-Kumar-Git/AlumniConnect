const Request = require('../models/Request');
const User = require('../models/User');

exports.createRequest = async (req, res) => {
  try {
    const { alumniId } = req.body;
    const studentId = req.user.id;

    // Check if the alumni exists
    const alumni = await User.findById(alumniId);
    if (!alumni || alumni.role !== 'Alumni') {
      return res.status(404).json({ msg: 'Alumni not found' });
    }

    // Check if a pending request already exists
    const existingRequest = await Request.findOne({
      student: studentId,
      alumni: alumniId,
      status: 'Pending'
    });

    if (existingRequest) {
      return res.status(400).json({ msg: 'You already have a pending request with this Alumni' });
    }

    const newRequest = new Request({
      student: studentId,
      alumni: alumniId,
      status: 'Pending'
    });

    await newRequest.save();
    res.json({ msg: 'Appointment requested successfully', request: newRequest });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getAlumniRequests = async (req, res) => {
  try {
    const alumniId = req.user.id;
    // Fetch pending requests for this alumni, populate student details
    const requests = await Request.find({ alumni: alumniId })
      .populate('student', 'name email domain profilePicture resume')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'Accepted' or 'Rejected'
    const requestId = req.params.id;

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ msg: 'Request not found' });
    }

    // Ensure the alumni updating the status is the one who received the request
    if (request.alumni.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this request' });
    }

    request.status = status;
    await request.save();

    res.json({ msg: `Request ${status.toLowerCase()} successfully`, request });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Request not found' });
    }
    res.status(500).send('Server Error');
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    let stats = {};

    if (user.role === 'Student') {
      const totalRequests = await Request.countDocuments({ student: userId });
      const acceptedRequests = await Request.countDocuments({ student: userId, status: 'Accepted' });
      const pendingRequests = await Request.countDocuments({ student: userId, status: 'Pending' });
      
      stats = {
        totalRequests,
        acceptedRequests,
        pendingRequests
      };
    } else if (user.role === 'Alumni') {
      const totalReceived = await Request.countDocuments({ alumni: userId });
      const acceptedMentorships = await Request.countDocuments({ alumni: userId, status: 'Accepted' });
      const pendingApprovals = await Request.countDocuments({ alumni: userId, status: 'Pending' });

      stats = {
        totalReceived,
        acceptedMentorships,
        pendingApprovals
      };
    }

    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
