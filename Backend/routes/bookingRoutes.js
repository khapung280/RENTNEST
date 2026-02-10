const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Calculate FairFlex pricing
const calculateFairFlexPrice = (basePrice, duration) => {
  const discounts = {
    1: 0,      // No discount for 1 month
    3: 0.05,   // 5% discount for 3 months
    6: 0.10,   // 10% discount for 6 months
    12: 0.15   // 15% discount for 12 months
  };
  const discount = discounts[duration] || 0;
  return Math.round(basePrice * (1 - discount));
};

// @route   GET /api/bookings
// @desc    Get all bookings (filtered by user role)
// @access  Private
router.get('/', [
  protect,
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled']),
  query('sortBy').optional().isIn(['newest', 'oldest', 'status']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, sortBy, page = 1, limit = 20 } = req.query;

    // Build filter based on user role
    const filter = {};
    
    if (req.user.accountType === 'renter') {
      // Renters see only their bookings
      filter.renter = req.user.id;
    } else if (req.user.accountType === 'owner') {
      // Owners see bookings for their properties
      filter.owner = req.user.id;
    } else if (req.user.accountType === 'admin') {
      // Admins see all bookings
      // No filter needed
    }

    if (status) {
      filter.status = status;
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'status':
        sort = { status: 1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 }; // Default: newest first
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const total = await Booking.countDocuments(filter);

    // Get bookings
    const bookings = await Booking.find(filter)
      .populate('property', 'title location image bedrooms bathrooms areaSqft price')
      .populate('renter', 'name email phone')
      .populate('owner', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: bookings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: bookings
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

// @route   GET /api/bookings/:id
// @desc    Get single booking by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property', 'title location image bedrooms bathrooms areaSqft price type')
      .populate('renter', 'name email phone accountType')
      .populate('owner', 'name email phone accountType');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization: renter, owner, or admin can view
    const isRenter = booking.renter._id.toString() === req.user.id;
    const isOwner = booking.owner._id.toString() === req.user.id;
    const isAdmin = req.user.accountType === 'admin';

    if (!isRenter && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   POST /api/bookings
// @desc    Create new booking request
// @access  Private (Renter)
router.post('/', [
  protect,
  body('propertyId')
    .notEmpty()
    .withMessage('Property ID is required')
    .isMongoId()
    .withMessage('Invalid property ID'),
  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isIn([1, 3, 6, 12])
    .withMessage('Duration must be 1, 3, 6, or 12 months'),
  body('moveInDate')
    .notEmpty()
    .withMessage('Move-in date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('renterName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('renterEmail')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('renterPhone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be a valid 10-digit number'),
  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Special requests cannot be more than 1000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { propertyId, duration, moveInDate, renterName, renterEmail, renterPhone, specialRequests } = req.body;

    // Get property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if property is approved and active
    if (property.status !== 'approved' || !property.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This property is not available for booking'
      });
    }

    // Check if user is trying to book their own property
    if (property.owner.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own property'
      });
    }

    // Validate move-in date (must be today or later)
    const moveIn = new Date(moveInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    moveIn.setHours(0, 0, 0, 0);
    
    if (moveIn < today) {
      return res.status(400).json({
        success: false,
        message: 'Move-in date must be today or later'
      });
    }

    // Calculate FairFlex pricing
    const baseMonthlyRate = property.price;
    const monthlyRate = calculateFairFlexPrice(baseMonthlyRate, duration);
    const discountPercentage = duration === 1 ? 0 : duration === 3 ? 5 : duration === 6 ? 10 : 15;
    const totalAmount = monthlyRate * duration;
    const savings = (baseMonthlyRate * duration) - totalAmount;

    // Get owner
    const owner = await User.findById(property.owner);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Property owner not found'
      });
    }

    // Create booking
    const booking = await Booking.create({
      property: propertyId,
      renter: req.user.id,
      owner: property.owner,
      duration,
      moveInDate,
      monthlyRate,
      baseMonthlyRate,
      discountPercentage,
      totalAmount,
      savings,
      status: 'pending',
      specialRequests: specialRequests || '',
      renterName,
      renterEmail,
      renterPhone,
      propertySnapshot: {
        title: property.title,
        location: property.location,
        image: property.image,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        areaSqft: property.areaSqft
      }
    });

    // Populate booking data
    await booking.populate('property', 'title location image bedrooms bathrooms areaSqft price');
    await booking.populate('renter', 'name email phone');
    await booking.populate('owner', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
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

// @route   PUT /api/bookings/:id/approve
// @desc    Approve booking (Owner/Admin only)
// @access  Private
router.put('/:id/approve', [
  protect,
  body('ownerNotes').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization: owner or admin
    const isOwner = booking.owner.toString() === req.user.id;
    const isAdmin = req.user.accountType === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this booking'
      });
    }

    // Check if booking is already processed
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status}`
      });
    }

    // Update booking
    booking.status = 'approved';
    if (req.body.ownerNotes) {
      booking.ownerNotes = req.body.ownerNotes;
    }
    await booking.save();

    // Populate booking data
    await booking.populate('property', 'title location image');
    await booking.populate('renter', 'name email phone');
    await booking.populate('owner', 'name email phone');

    res.json({
      success: true,
      message: 'Booking approved successfully',
      data: booking
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while approving booking',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/bookings/:id/reject
// @desc    Reject booking (Owner/Admin only)
// @access  Private
router.put('/:id/reject', [
  protect,
  body('ownerNotes').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization: owner or admin
    const isOwner = booking.owner.toString() === req.user.id;
    const isAdmin = req.user.accountType === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this booking'
      });
    }

    // Check if booking is already processed
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status}`
      });
    }

    // Update booking
    booking.status = 'rejected';
    if (req.body.ownerNotes) {
      booking.ownerNotes = req.body.ownerNotes;
    }
    await booking.save();

    // Populate booking data
    await booking.populate('property', 'title location image');
    await booking.populate('renter', 'name email phone');
    await booking.populate('owner', 'name email phone');

    res.json({
      success: true,
      message: 'Booking rejected',
      data: booking
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting booking',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking (Renter only, for pending bookings)
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization: only renter can cancel
    if (booking.renter.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Only pending bookings can be cancelled by renter
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}. Only pending bookings can be cancelled.`
      });
    }

    // Update booking
    booking.status = 'cancelled';
    await booking.save();

    // Populate booking data
    await booking.populate('property', 'title location image');
    await booking.populate('renter', 'name email phone');
    await booking.populate('owner', 'name email phone');

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/bookings/my-bookings
// @desc    Get current user's bookings (Renter)
// @access  Private
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.user.id })
      .populate('property', 'title location image bedrooms bathrooms areaSqft price')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/bookings/owner/my-bookings
// @desc    Get bookings for owner's properties
// @access  Private (Owner)
router.get('/owner/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user.id })
      .populate('property', 'title location image bedrooms bathrooms areaSqft price')
      .populate('renter', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
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

module.exports = router;

