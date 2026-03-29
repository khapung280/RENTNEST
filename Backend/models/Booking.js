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
  },
  /** Monthly rent (NPR) at time of booking — copied from property */
  monthlyRate: {
    type: Number,
    min: 0,
    default: null
  },
  /** Whole months for pricing (derived from check-in / check-out) */
  durationMonths: {
    type: Number,
    min: 1,
    default: 1
  },
  /** Total due in NPR (monthlyRate × durationMonths) before Stripe conversion */
  totalAmount: {
    type: Number,
    min: 0,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'processing', 'paid', 'failed', 'refunded'],
    default: 'unpaid'
  },
  stripeCheckoutSessionId: { type: String, default: null },
  stripePaymentIntentId: { type: String, default: null },
  paidAt: { type: Date, default: null },
  /** Last attempted or completed provider: stripe | khalti | esewa */
  paymentProvider: { type: String, enum: ['stripe', 'khalti', 'esewa'], default: null },
  khaltiPidx: { type: String, default: null },
  esewaTransactionUuid: { type: String, default: null }
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
    ret.duration = ret.durationMonths;
    ret.moveInDate = ret.checkIn;
    ret.checkInDate = ret.checkIn;
    ret.checkOutDate = ret.checkOut;
    return ret;
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
