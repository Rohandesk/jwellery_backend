const Notification = require('../models/Notification');

// @desc    Get User Notifications (Targeted + Broadcast)
// @route   GET /api/v1/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      jewellerId: req.jewellerId,
      $or: [{ userId: req.user._id }, { userId: null }]
    }).sort({ createdAt: -1 }).limit(50);

    const data = notifications.map((notification) => {
      const item = notification.toObject();
      item.isRead = notification.readBy.some((userId) => String(userId) === String(req.user._id));
      return item;
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark Notification as Read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate({
      _id: req.params.id,
      jewellerId: req.jewellerId,
      $or: [{ userId: req.user._id }, { userId: null }],
    }, { $addToSet: { readBy: req.user._id } }, { new: true });
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });

    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getNotifications, markAsRead };
