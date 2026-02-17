const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// ==================== USER MANAGEMENT ====================

// @route   GET /api/admin/users
// @desc    Get all users with filtering and search
// @access  Private (Admin only)
router.get('/users', [
  query('search').optional().trim(),
  query('role').optional().isIn(['renter', 'owner', 'admin']),
  query('status').optional().isIn(['active', 'suspended', 'inactive']),
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

    const { search, role, status, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) filter.role = role;

    if (status === 'active') {
      filter.isActive = true;
      filter.isSuspended = false;
    } else if (status === 'suspended') {
      filter.isSuspended = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await User.countDocuments(filter);

    // Get users
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/admin/users/:id/suspend
// @desc    Suspend a user
// @access  Private (Admin only)
router.put('/users/:id/suspend', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow suspending other admins
    if (user.role === 'admin' && user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot suspend another admin'
      });
    }

    user.isSuspended = true;
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User suspended successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isSuspended: user.isSuspended,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while suspending user',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/admin/users/:id/activate
// @desc    Activate a user
// @access  Private (Admin only)
router.put('/users/:id/activate', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isSuspended = false;
    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: 'User activated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isSuspended: user.isSuspended,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Activate user error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while activating user',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ==================== PROPERTY MANAGEMENT ====================

// @route   GET /api/admin/properties
// @desc    Get all properties (any status) for admin
// @access  Private (Admin only)
router.get('/properties', async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Property.countDocuments(filter);
    const properties = await Property.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.json({
      success: true,
      count: properties.length,
      total,
      data: properties
    });
  } catch (error) {
    console.error('Get admin properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/admin/properties/:id/approve
// @desc    Approve a property
// @access  Private (Admin only)
router.put('/properties/:id/approve', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (property.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Property is already approved'
      });
    }

    property.status = 'approved';
    property.isActive = true;
    await property.save();

    await property.populate('owner', 'name email');

    res.json({
      success: true,
      message: 'Property approved successfully',
      data: property
    });
  } catch (error) {
    console.error('Approve property error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while approving property',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/admin/properties/:id/reject
// @desc    Reject a property
// @access  Private (Admin only)
router.put('/properties/:id/reject', [
  body('reason').optional().trim().isLength({ max: 500 })
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

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    if (property.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Property is already rejected'
      });
    }

    property.status = 'rejected';
    property.isActive = false;
    await property.save();

    await property.populate('owner', 'name email');

    res.json({
      success: true,
      message: 'Property rejected successfully',
      data: property
    });
  } catch (error) {
    console.error('Reject property error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting property',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// ==================== STATISTICS & REPORTS ====================

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true, isSuspended: false });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });
    const renterUsers = await User.countDocuments({ role: 'renter' });
    const ownerUsers = await User.countDocuments({ role: 'owner' });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // Get property statistics
    const totalProperties = await Property.countDocuments();
    const approvedProperties = await Property.countDocuments({ status: 'approved' });
    const pendingProperties = await Property.countDocuments({ status: 'pending' });
    const rejectedProperties = await Property.countDocuments({ status: 'rejected' });
    const activeProperties = await Property.countDocuments({ isActive: true, status: 'approved' });

    // Get booking statistics
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Calculate revenue (sum of confirmed bookings)
    const revenueData = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Get this month's statistics
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    const propertiesAddedThisMonth = await Property.countDocuments({ createdAt: { $gte: startOfMonth } });
    const bookingsThisMonth = await Booking.countDocuments({ createdAt: { $gte: startOfMonth } });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          renters: renterUsers,
          owners: ownerUsers,
          admins: adminUsers,
          newThisMonth: newUsersThisMonth
        },
        properties: {
          total: totalProperties,
          approved: approvedProperties,
          pending: pendingProperties,
          rejected: rejectedProperties,
          active: activeProperties,
          newThisMonth: propertiesAddedThisMonth
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings,
          thisMonth: bookingsThisMonth
        },
        revenue: {
          total: totalRevenue
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/admin/reports
// @desc    Get detailed reports
// @access  Private (Admin only)
router.get('/reports', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
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

    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get reports data
    const usersReport = await User.find(dateFilter).select('-password').sort({ createdAt: -1 });
    const propertiesReport = await Property.find(dateFilter).populate('owner', 'name email').sort({ createdAt: -1 });
    const bookingsReport = await Booking.find(dateFilter)
      .populate('property', 'title location')
      .populate('renter', 'name email')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        users: usersReport,
        properties: propertiesReport,
        bookings: bookingsReport,
        dateRange: {
          start: startDate || null,
          end: endDate || null
        }
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;

