const mongoose = require('mongoose');

/**
 * Booking schema - production-ready
 * property, renter, owner refs; checkIn/checkOut; status: pending | approved | rejected
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
    enum: { values: ['pending', 'approved', 'rejected'], message: 'Status must be pending, approved, or rejected' },
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

// API compatibility: frontend expects checkInDate, checkOutDate
bookingSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.checkInDate = ret.checkIn;
    ret.checkOutDate = ret.checkOut;
    ret.user = ret.renter;
    return ret;
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
