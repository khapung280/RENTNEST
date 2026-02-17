const mongoose = require('mongoose');

/**
 * Booking schema - enterprise production
 * status: pending | confirmed | cancelled
 */
const bookingSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Please provide a property']
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a renter']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide an owner']
  },
  checkIn: {
    type: Date,
    required: [true, 'Please provide check-in date']
  },
  checkOut: {
    type: Date,
    required: [true, 'Please provide check-out date']
  },
  status: {
    type: String,
    enum: { values: ['pending', 'confirmed', 'cancelled'], message: 'Status must be pending, confirmed, or cancelled' },
    default: 'pending'
  }
}, {
  timestamps: true
});

bookingSchema.index({ renter: 1 });
bookingSchema.index({ owner: 1 });
bookingSchema.index({ property: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ checkIn: 1 });
bookingSchema.index({ property: 1, checkIn: 1, checkOut: 1 });

// API compatibility: frontend expects checkInDate, checkOutDate, user, approved/rejected
bookingSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.checkInDate = ret.checkIn;
    ret.checkOutDate = ret.checkOut;
    ret.user = ret.renter;
    if (ret.status === 'confirmed') ret.approved = true;
    if (ret.status === 'cancelled') ret.rejected = true;
    return ret;
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
