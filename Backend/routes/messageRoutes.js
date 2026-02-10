const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', [
  protect,
  body('conversationId')
    .isMongoId()
    .withMessage('Valid conversation ID is required'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { conversationId, content } = req.body;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send message in this conversation'
      });
    }

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      content,
      messageType: 'text',
      isAI: false
    });

    // Update conversation
    conversation.lastMessage = content;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    await message.populate('sender', 'name email profilePicture');

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/messages
// @desc    Get messages for a conversation
// @access  Private
router.get('/', [
  protect,
  query('conversationId')
    .isMongoId()
    .withMessage('Valid conversation ID is required'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { conversationId, page = 1, limit = 50 } = req.query;

    // Verify conversation and authorization
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages'
      });
    }

    // Get messages
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Message.countDocuments({ conversation: conversationId });

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email profilePicture')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: messages.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('conversation');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check authorization
    const isParticipant = message.conversation.participants.some(
      p => p.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!message.read) {
      message.read = true;
      message.readAt = new Date();
      await message.save();
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Mark message read error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;

