const Notification = require('../models/Notification');

// Fetch notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'name profilePicture role')
      .sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (err) {
    console.error('Error fetching notifications:', err.message);
    res.status(500).send('Server Error');
  }
};

// Mark notifications as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationIds } = req.body; // Expecting an array of string IDs

    if (notificationIds && notificationIds.length > 0) {
      await Notification.updateMany(
        { _id: { $in: notificationIds }, recipient: userId },
        { $set: { read: true } }
      );
    } else {
      // If no array provided, mark all as read
      await Notification.updateMany(
        { recipient: userId, read: false },
        { $set: { read: true } }
      );
    }

    res.json({ msg: 'Notifications marked as read' });
  } catch (err) {
    console.error('Error updating notifications:', err.message);
    res.status(500).send('Server Error');
  }
};
