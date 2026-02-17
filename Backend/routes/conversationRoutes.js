const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/conversations
// @desc    Create a new conversation (renter-owner or AI chat)
// @access  Private
router.post('/', [
  protect,
  body('participantId').optional().isMongoId(),
  body('propertyId').optional().isMongoId(),
  body('type').optional().isIn(['renter_owner', 'ai_chat'])
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

    const { participantId, propertyId, type = 'renter_owner' } = req.body;
    
    let participants = [req.user.id];
    if (participantId && type === 'renter_owner') {
      participants.push(participantId);
    }

    // Check if conversation already exists
    if (type === 'renter_owner' && participantId) {
      const existing = await Conversation.findOne({
        participants: { $all: participants },
        type: 'renter_owner',
        property: propertyId || null
      });
      
      if (existing) {
        return res.json({
          success: true,
          data: existing
        });
      }
    }

    const conversation = await Conversation.create({
      participants,
      type,
      property: propertyId || null
    });

    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/', [
  protect,
  query('type').optional().isIn(['renter_owner', 'ai_chat'])
], async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {
      participants: req.user.id
    };
    
    if (type) {
      filter.type = type;
    }

    const conversations = await Conversation.find(filter)
      .populate('participants', 'name email profilePicture')
      .populate('property', 'title location image')
      .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/conversations/:id
// @desc    Get single conversation
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name email profilePicture role')
      .populate('property', 'title location image price bedrooms bathrooms');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p._id.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation'
      });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;

