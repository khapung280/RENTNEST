const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult, query } = require('express-validator');
const Property = require('../models/Property');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/properties
// @desc    Get all properties with filtering and sorting
// @access  Public
router.get('/', [
  query('type').optional().isIn(['house', 'flat_apartment']),
  query('location').optional().trim(),
  query('minPrice').optional().isInt({ min: 0 }),
  query('maxPrice').optional().isInt({ min: 0 }),
  query('bedrooms').optional().isInt({ min: 0 }),
  query('verified').optional().isBoolean(),
  query('status').optional().isIn(['pending', 'approved', 'rejected']),
  query('sortBy').optional().isIn(['price_asc', 'price_desc', 'newest', 'oldest']),
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

    const {
      type,
      location,
      minPrice,
      maxPrice,
      bedrooms,
      verified,
      status,
      sortBy,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = {};

    // Only show approved and active properties for public access
    if (!req.user || req.user.accountType !== 'admin') {
      filter.status = 'approved';
      filter.isActive = true;
    } else if (status) {
      // Admin can filter by status
      filter.status = status;
    }

    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    if (bedrooms) filter.bedrooms = { $gte: parseInt(bedrooms) };
    if (verified !== undefined) filter.verified = verified === 'true';

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      default:
        sort = { createdAt: -1 }; // Default: newest first
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count for pagination
    const total = await Property.countDocuments(filter);

    // Get properties
    const properties = await Property.find(filter)
      .populate('owner', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: properties.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: properties
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching properties',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/properties/owner/my-properties
// @desc    Get current owner's properties
// @access  Private (Owner/Admin)
router.get('/owner/my-properties', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id })
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    console.error('Get my properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching properties',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }

    const property = await Property.findById(id)
      .populate('owner', 'name email phone accountType');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Only show approved properties to non-owners/non-admins
    if (property.status !== 'approved' && 
        (!req.user || 
         (req.user.accountType !== 'admin' && req.user.id !== property.owner._id.toString()))) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Get property by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/properties
// @desc    Create new property (Owner only)
// @access  Private (Owner/Admin)
router.post('/', [
  protect,
  authorize('owner', 'admin'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['house', 'flat_apartment'])
    .withMessage('Type must be house or flat_apartment'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 100 })
    .withMessage('Location cannot be more than 100 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isInt({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('bedrooms')
    .notEmpty()
    .withMessage('Bedrooms is required')
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a non-negative number'),
  body('bathrooms')
    .notEmpty()
    .withMessage('Bathrooms is required')
    .isInt({ min: 0 })
    .withMessage('Bathrooms must be a non-negative number'),
  body('areaSqft')
    .notEmpty()
    .withMessage('Area is required')
    .isInt({ min: 0 })
    .withMessage('Area must be a positive number'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('image')
    .trim()
    .notEmpty()
    .withMessage('Main image URL is required')
    .isURL()
    .withMessage('Image must be a valid URL')
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

    // Get owner info
    const owner = await User.findById(req.user.id);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    // Create property
    const property = await Property.create({
      ...req.body,
      owner: req.user.id,
      ownerName: owner.name,
      status: 'pending' // New properties need admin approval
    });

    // Populate owner info
    await property.populate('owner', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Property created successfully. Waiting for admin approval.',
      data: property
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating property',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update property (Owner/Admin only)
// @access  Private
router.put('/:id', [
  protect,
  body('title').optional().trim().isLength({ min: 5, max: 100 }),
  body('type').optional().isIn(['house', 'flat_apartment']),
  body('location').optional().trim().isLength({ max: 100 }),
  body('price').optional().isInt({ min: 0 }),
  body('bedrooms').optional().isInt({ min: 0 }),
  body('bathrooms').optional().isInt({ min: 0 }),
  body('areaSqft').optional().isInt({ min: 0 }),
  body('description').optional().trim().isLength({ min: 20, max: 2000 }),
  body('image').optional().trim().isURL()
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

    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user is owner or admin
    if (property.owner.toString() !== req.user.id && req.user.accountType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    // Update property
    property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('owner', 'name email phone');

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: property
    });
  } catch (error) {
    console.error('Update property error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating property',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property (Owner/Admin only)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user is owner or admin
    if (property.owner.toString() !== req.user.id && req.user.accountType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Property deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Delete property error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting property',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;

