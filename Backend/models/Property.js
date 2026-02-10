const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a property title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Please provide a property type'],
    enum: ['house', 'flat_apartment'],
    lowercase: true
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a monthly rent price'],
    min: [0, 'Price cannot be negative']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Please provide number of bedrooms'],
    min: [0, 'Bedrooms cannot be negative']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Please provide number of bathrooms'],
    min: [0, 'Bathrooms cannot be negative']
  },
  areaSqft: {
    type: Number,
    required: [true, 'Please provide area in square feet'],
    min: [0, 'Area cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  image: {
    type: String,
    required: [true, 'Please provide a main image URL'],
    trim: true
  },
  images: {
    type: [String],
    default: []
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide an owner']
  },
  ownerName: {
    type: String,
    required: [true, 'Please provide owner name'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  amenities: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot be more than 5']
  },
  utilities: {
    water: {
      type: Boolean,
      default: false
    },
    electricity: {
      type: Boolean,
      default: false
    },
    internet: {
      type: Boolean,
      default: false
    },
    maintenance: {
      type: Boolean,
      default: false
    }
  },
  houseRules: {
    petsAllowed: {
      type: Boolean,
      default: false
    },
    smokingAllowed: {
      type: Boolean,
      default: false
    },
    guestsAllowed: {
      type: Boolean,
      default: true
    },
    quietHours: {
      type: String,
      default: ''
    }
  },
  nearbyPlaces: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String, // 'school', 'hospital', 'market', 'bus_stop', 'restaurant'
      required: true
    },
    distance: {
      type: String, // e.g., "500m", "1km"
      required: true
    }
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for faster queries
propertySchema.index({ location: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ owner: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ verified: 1 });

module.exports = mongoose.model('Property', propertySchema);

