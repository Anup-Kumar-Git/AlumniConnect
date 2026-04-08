const SessionRequest = require('../models/SessionRequest');
const User = require('../models/User');

// Create a session request
exports.createSessionRequest = async (req, res) => {
  try {
    const { alumniId } = req.body;
    const studentId = req.user.id;

    const alumni = await User.findById(alumniId);
    if (!alumni || alumni.role !== 'Alumni') {
      return res.status(404).json({ msg: 'Alumni not found' });
    }

    // Checking if a request already exists
    const existingRequest = await SessionRequest.findOne({
      student: studentId,
      alumni: alumniId,
      status: 'Pending'
    });

    if (existingRequest) {
      return res.status(400).json({ msg: 'You already requested a session with this Alumni' });
    }

    const newSessionRequest = new SessionRequest({
      student: studentId,
      alumni: alumniId,
      status: 'Pending'
    });

    await newSessionRequest.save();
    res.json({ msg: 'Session requested successfully', sessionRequest: newSessionRequest });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Alumni gets pending session requests
exports.getPendingSessions = async (req, res) => {
  try {
    const alumniId = req.user.id;
    const requests = await SessionRequest.find({ alumni: alumniId })
      .populate('student', 'name email domain profilePicture resume github linkedin expertise')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update Session Request Status
exports.updateSessionRequestStatus = async (req, res) => {
  try {
    const { status, date, time, meetLink } = req.body;
    const requestId = req.params.id;

    if (!['Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const request = await SessionRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ msg: 'Session request not found' });
    }

    if (request.alumni.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to update this session request' });
    }

    request.status = status;
    if (status === 'Accepted') {
      request.date = date;
      request.time = time;
      request.meetLink = meetLink;
    }
    
    await request.save();

    res.json({ msg: `Session Request ${status.toLowerCase()}`, request });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Session request not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Student gets their session requests
exports.getStudentSessions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const requests = await SessionRequest.find({ student: studentId });
    res.json({ requests });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Alumni gets accepted (booked) sessions
exports.getAlumniBookedSessions = async (req, res) => {
  try {
    const alumniId = req.user.id;
    const requests = await SessionRequest.find({ alumni: alumniId, status: 'Accepted' })
      .populate('student', 'name email domain profilePicture resume github linkedin')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Student gets accepted (booked) sessions
exports.getStudentBookedSessions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const requests = await SessionRequest.find({ student: studentId, status: 'Accepted' })
      .populate('alumni', 'name email domain profilePicture company expertise github linkedin')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
