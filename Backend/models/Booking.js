const mongoose = require('mongoose');

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
  duration: {
    type: Number,
    required: [true, 'Please provide stay duration'],
    enum: [1, 3, 6, 12],
    default: 1
  },
  moveInDate: {
    type: Date,
    required: [true, 'Please provide move-in date']
  },
  monthlyRate: {
    type: Number,
    required: [true, 'Please provide monthly rate'],
    min: [0, 'Monthly rate cannot be negative']
  },
  baseMonthlyRate: {
    type: Number,
    required: [true, 'Please provide base monthly rate'],
    min: [0, 'Base monthly rate cannot be negative']
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Please provide total amount'],
    min: [0, 'Total amount cannot be negative']
  },
  savings: {
    type: Number,
    default: 0,
    min: [0, 'Savings cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [1000, 'Special requests cannot be more than 1000 characters'],
    default: ''
  },
  ownerNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Owner notes cannot be more than 1000 characters'],
    default: ''
  },
  renterName: {
    type: String,
    required: [true, 'Please provide renter name'],
    trim: true
  },
  renterEmail: {
    type: String,
    required: [true, 'Please provide renter email'],
    trim: true,
    lowercase: true
  },
  renterPhone: {
    type: String,
    required: [true, 'Please provide renter phone'],
    trim: true
  },
  // Store property snapshot at time of booking (in case property details change)
  propertySnapshot: {
    title: String,
    location: String,
    image: String,
    bedrooms: Number,
    bathrooms: Number,
    areaSqft: Number
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for faster queries
bookingSchema.index({ renter: 1 });
bookingSchema.index({ owner: 1 });
bookingSchema.index({ property: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ moveInDate: 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual for requestedDate (same as createdAt)
bookingSchema.virtual('requestedDate').get(function() {
  return this.createdAt;
});

// Ensure virtuals are included in JSON output
bookingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);

