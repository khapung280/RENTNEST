const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Property = require('../models/Property');

/**
 * Check for overlapping bookings (same property, non-rejected, overlapping dates).
 * Two ranges [a1,a2] and [b1,b2] overlap if a1 < b2 AND b1 < a2.
 */
const hasOverlappingBooking = async (propertyId, checkIn, checkOut, excludeBookingId = null) => {
  const filter = {
    property: propertyId,
    status: { $in: ['pending', 'approved'] },
    $or: [
      { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
    ]
  };
  if (excludeBookingId) {
    filter._id = { $ne: excludeBookingId };
  }
  const overlap = await Booking.findOne(filter);
  return !!overlap;
};

/**
 * @route   POST /api/bookings
 * @desc    Create booking (renter only)
 * @access  Private
 */
exports.createBooking = async (req, res) => {
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

  const overlapping = await hasOverlappingBooking(property, checkIn, checkOut);
  if (overlapping) {
    return res.status(409).json({
      success: false,
      message: 'This property is already booked for the selected dates. Please choose different dates.'
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
    message: 'Booking request sent successfully',
    data: booking
  });
};

/**
 * @route   GET /api/bookings/my
 * @desc    Get current renter's bookings
 * @access  Private (Renter)
 */
exports.getMyBookings = async (req, res) => {
  const data = await Booking.find({ renter: req.user.id })
    .populate('property', 'title location image price')
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: data.length,
    data
  });
};

/**
 * @route   GET /api/bookings/property/:propertyId
 * @desc    Get bookings for a property (owner only, must own the property)
 * @access  Private (Owner)
 */
exports.getPropertyBookings = async (req, res) => {
  const { propertyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid property ID'
    });
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  const ownerId = property.owner?.toString?.() || property.owner.toString();
  if (ownerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to view bookings for this property'
    });
  }

  const data = await Booking.find({ property: propertyId })
    .populate('renter', 'name email')
    .populate('property', 'title location image price')
    .sort({ checkIn: -1 });

  res.json({
    success: true,
    count: data.length,
    data
  });
};

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Update booking status (owner: approve/reject; admin: approve/reject)
 * @access  Private (Owner or Admin)
 */
exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid booking ID'
    });
  }

  const validStatuses = ['approved', 'rejected'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Use "approved" or "rejected"'
    });
  }

  const booking = await Booking.findById(id)
    .populate('property', 'owner');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  const ownerId = booking.owner?.toString?.() || booking.owner.toString();
  const propOwnerId = booking.property?.owner?.toString?.() || booking.property?.owner?.toString?.();

  if (req.user.role !== 'admin' && ownerId !== req.user.id && propOwnerId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to update this booking'
    });
  }

  if (booking.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Booking is already ${booking.status}`
    });
  }

  booking.status = status;
  await booking.save();

  await booking.populate('renter', 'name email');
  await booking.populate('property', 'title location image price');
  await booking.populate('owner', 'name email');

  res.json({
    success: true,
    message: status === 'approved' ? 'Booking approved' : 'Booking rejected',
    data: booking
  });
};

/**
 * @route   GET /api/bookings/admin
 * @desc    Get all bookings (admin only)
 * @access  Private (Admin)
 */
exports.getAdminBookings = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(100, Math.max(1, parseInt(limit)));

  const total = await Booking.countDocuments(filter);
  const data = await Booking.find(filter)
    .populate('renter', 'name email')
    .populate('owner', 'name email')
    .populate('property', 'title location image price')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Math.min(100, Math.max(1, parseInt(limit))));

  res.json({
    success: true,
    count: data.length,
    total,
    page: parseInt(page) || 1,
    pages: Math.ceil(total / (parseInt(limit) || 20)),
    data
  });
};

/**
 * Alias for updateBookingStatus - maps PUT /approve to status=approved
 */
exports.approveBooking = (req, res) => {
  req.body = { ...req.body, status: 'approved' };
  return exports.updateBookingStatus(req, res);
};

/**
 * Alias for updateBookingStatus - maps PUT /reject to status=rejected
 */
exports.rejectBooking = (req, res) => {
  req.body = { ...req.body, status: 'rejected' };
  return exports.updateBookingStatus(req, res);
};

/**
 * @route   GET /api/bookings/owner/my-bookings
 * @desc    Get all bookings for owner's properties (backward compat)
 * @access  Private (Owner or Admin)
 */
exports.getOwnerBookings = async (req, res) => {
  const data = await Booking.find({ owner: req.user.id })
    .populate('renter', 'name email')
    .populate('property', 'title location image price')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: data.length,
    data
  });
};
