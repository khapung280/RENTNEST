const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Property = require('../models/Property');

/**
 * Check for overlapping bookings.
 * Same property, status !== "cancelled", and date ranges overlap.
 * Overlap: (checkInDate < existing.checkOutDate) AND (checkOutDate > existing.checkInDate)
 */
const hasOverlappingBooking = async (propertyId, checkIn, checkOut, excludeBookingId = null) => {
  const filter = {
    property: propertyId,
    status: { $ne: 'cancelled' },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn }
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

  const ownerId = (prop.owner?._id || prop.owner).toString();
  if (ownerId === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'You cannot book your own property'
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
    return res.status(400).json({
      success: false,
      message: 'This property is already booked for the selected dates. Please choose different dates.'
    });
  }

  const booking = await Booking.create({
    renter: req.user.id,
    property,
    owner: prop.owner?._id || prop.owner,
    checkIn,
    checkOut,
    status: 'pending'
  });

  await booking.populate('property', 'title location image price');
  await booking.populate('renter', 'name email');
  await booking.populate('owner', 'name email');

  res.status(201).json({
    success: true,
    message: 'Booking request sent successfully',
    data: booking
  });
};

/**
 * @route   GET /api/bookings/my
 * @desc    Get current renter's bookings (user === req.user.id)
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
 * @desc    Get bookings for a property (owner only; property.owner === req.user.id)
 * @access  Private (Owner or Admin)
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

  const ownerId = (property.owner?.toString?.() || property.owner.toString());
  if (ownerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to view bookings for this property'
    });
  }

  const data = await Booking.find({ property: propertyId })
    .populate('renter', 'name email')
    .populate('property', 'title location image price')
    .populate('owner', 'name email')
    .sort({ checkIn: -1 });

  res.json({
    success: true,
    count: data.length,
    data
  });
};

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Update booking status (owner of property or admin only)
 *          Allowed: confirmed | cancelled
 *          Prevents invalid transitions (e.g. cancelled → confirmed)
 * @access  Private (Owner or Admin)
 */
exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  let { status } = req.body;

  // Support legacy aliases for frontend compat
  if (status === 'approved') status = 'confirmed';
  if (status === 'rejected') status = 'cancelled';

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid booking ID'
    });
  }

  const validStatuses = ['confirmed', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Use "confirmed" or "cancelled"'
    });
  }

  const booking = await Booking.findById(id).populate('property', 'owner');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  const ownerId = (booking.owner?.toString?.() || booking.owner.toString());
  const propOwnerId = (booking.property?.owner?.toString?.() || booking.property?.owner?.toString?.() || ownerId);

  if (req.user.role !== 'admin' && propOwnerId !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to update this booking'
    });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Cannot update a cancelled booking'
    });
  }

  if (booking.status === 'confirmed' && status === 'cancelled') {
    // Allow owner to cancel an already confirmed booking
  } else if (booking.status !== 'pending') {
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
    message: status === 'confirmed' ? 'Booking confirmed' : 'Booking cancelled',
    data: booking
  });
};

/**
 * @route   GET /api/bookings/admin
 * @desc    Get all bookings (admin only, role === "admin")
 * @access  Private (Admin)
 */
exports.getAdminBookings = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const pageNum = Math.max(1, parseInt(page) || 1);
  const skip = (pageNum - 1) * limitNum;

  const total = await Booking.countDocuments(filter);
  const data = await Booking.find(filter)
    .populate('renter', 'name email')
    .populate('owner', 'name email')
    .populate('property', 'title location image price')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.json({
    success: true,
    count: data.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data
  });
};

/**
 * Alias: PUT /approve -> status=confirmed (frontend compat)
 */
exports.approveBooking = (req, res) => {
  req.body = { ...req.body, status: 'confirmed' };
  return exports.updateBookingStatus(req, res);
};

/**
 * Alias: PUT /reject -> status=cancelled (frontend compat)
 */
exports.rejectBooking = (req, res) => {
  req.body = { ...req.body, status: 'cancelled' };
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
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: data.length,
    data
  });
};
