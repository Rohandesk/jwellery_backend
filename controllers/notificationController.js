const Notification = require('../models/Notification');

// @desc    Get User Notifications (Targeted + Broadcast)
// @route   GET /api/v1/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ userId: req.user._id }, { userId: null }]
    }).sort({ createdAt: -1 }).limit(50);

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark Notification as Read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });

    notif.isRead = true;
    await notif.save();
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getNotifications, markAsRead };
