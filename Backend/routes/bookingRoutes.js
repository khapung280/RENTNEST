const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { protect, adminOnly, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const {
  createBooking,
  getMyBookings,
  getPropertyBookings,
  updateBookingStatus,
  approveBooking,
  rejectBooking,
  getAdminBookings,
  getOwnerBookings
} = require('../controllers/bookingController');

const router = express.Router();

// Validation helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// ==================== RENTER ROUTES ====================

// POST /api/bookings - Create booking (renter only)
router.post('/', [
  protect,
  authorize('renter'),
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
], validate, asyncHandler(createBooking));

// GET /api/bookings/my - Renter's bookings (also /my-bookings for frontend compat)
router.get('/my', protect, authorize('renter'), asyncHandler(getMyBookings));
router.get('/my-bookings', protect, authorize('renter'), asyncHandler(getMyBookings));

// ==================== OWNER ROUTES ====================

// GET /api/bookings/property/:propertyId - Owner's bookings for a property
router.get('/property/:propertyId', protect, authorize('owner', 'admin'), asyncHandler(getPropertyBookings));

// GET /api/bookings/owner/my-bookings - Owner's all bookings (backward compat)
router.get('/owner/my-bookings', protect, authorize('owner', 'admin'), asyncHandler(getOwnerBookings));

// PATCH /api/bookings/:id/status - Owner/Admin approve or reject booking
router.patch('/:id/status', [
  protect,
  authorize('owner', 'admin'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be "approved" or "rejected"')
], validate, asyncHandler(updateBookingStatus));

// PUT /api/bookings/:id/approve - Alias (frontend compat)
router.put('/:id/approve', protect, authorize('owner', 'admin'), asyncHandler(approveBooking));

// PUT /api/bookings/:id/reject - Alias (frontend compat)
router.put('/:id/reject', protect, authorize('owner', 'admin'), asyncHandler(rejectBooking));

// ==================== ADMIN ROUTES ====================

// GET /api/bookings/admin - Admin sees all bookings
router.get('/admin', [
  protect,
  adminOnly,
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], validate, asyncHandler(getAdminBookings));

// GET /api/bookings - Admin all bookings (backward compat for bookingService.getAll)
router.get('/', [
  protect,
  adminOnly,
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], validate, asyncHandler(getAdminBookings));

module.exports = router;
