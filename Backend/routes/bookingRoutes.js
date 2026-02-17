const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult, query } = require('express-validator');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { protect, adminOnly, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a booking (authenticated renter)
// @access  Private
router.post('/', [
  protect,
  body('property')
    .notEmpty()
    .withMessage('Property is required')
    .isMongoId()
    .withMessage('Invalid property ID'),
  body('checkInDate')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Invalid check-in date'),
  body('checkOutDate')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isISO8601()
    .withMessage('Invalid check-out date')
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

    const { property, checkInDate, checkOutDate } = req.body;

    const prop = await Property.findById(property).populate('owner', '_id');
    if (!prop) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    if (prop.status !== 'approved' || !prop.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for booking'
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date must be today or later'
      });
    }
    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    const ownerId = prop.owner?._id || prop.owner;

    const booking = await Booking.create({
      renter: req.user.id,
      property,
      owner: ownerId,
      checkIn,
      checkOut,
      status: 'pending'
    });

    await booking.populate('property', 'title location image price');
    await booking.populate('renter', 'name email');

    res.status(201).json({
      success: true,
      message: 'Booking created',
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/bookings/owner/my-bookings
// @desc    Get bookings for properties owned by current user
// @access  Private (Owner or Admin)
router.get('/owner/my-bookings', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const data = await Booking.find({ owner: req.user.id })
      .populate('renter', 'name email')
      .populate('property', 'title location image price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Get owner bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings (admin only)
// @access  Private (Admin)
router.get('/', [
  protect,
  adminOnly,
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
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

    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Booking.countDocuments(filter);
    const data = await Booking.find(filter)
      .populate('renter', 'name email')
      .populate('owner', 'name email')
      .populate('property', 'title location image price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: data.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PATCH /api/bookings/:id/confirm
// @desc    Approve a booking (admin only)
// @access  Private (Admin)
router.patch('/:id/confirm', [protect, adminOnly], async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status}`
      });
    }

    booking.status = 'approved';
    await booking.save();

    await booking.populate('renter', 'name email');
    await booking.populate('property', 'title location image price');

    res.json({
      success: true,
      message: 'Booking approved',
      data: booking
    });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving booking',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;
