const Notification = require('../models/Notification');

/**
 * GET /api/notifications — list for current user (newest first)
 */
exports.getNotifications = async (req, res) => {
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const unreadOnly = req.query.unread === '1' || req.query.unread === 'true';

  const filter = { recipient: req.user.id };
  if (unreadOnly) filter.read = false;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json({
    success: true,
    count: notifications.length,
    data: notifications
  });
};

/**
 * GET /api/notifications/unread-count
 */
exports.getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user.id,
    read: false
  });
  res.json({ success: true, count });
};

/**
 * PATCH /api/notifications/:id/read
 */
exports.markRead = async (req, res) => {
  const n = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user.id
  });

  if (!n) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  n.read = true;
  await n.save();

  res.json({ success: true, data: n });
};

/**
 * PATCH /api/notifications/read-all
 */
exports.markAllRead = async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, read: false },
    { $set: { read: true } }
  );
  res.json({ success: true, message: 'All notifications marked read' });
};
