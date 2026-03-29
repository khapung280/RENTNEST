const express = require('express');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead
} = require('../controllers/notificationController');

const router = express.Router();

router.get('/unread-count', protect, asyncHandler(getUnreadCount));
router.get('/', protect, asyncHandler(getNotifications));
router.patch('/read-all', protect, asyncHandler(markAllRead));
router.patch('/:id/read', protect, asyncHandler(markRead));

module.exports = router;
