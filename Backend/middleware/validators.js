const { body } = require('express-validator');

/**
 * Validation rules for user registration
 */
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('accountType')
    .optional()
    .isIn(['renter', 'owner', 'admin'])
    .withMessage('Account type must be renter, owner, or admin'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be a valid 10-digit number')
];

/**
 * Validation rules for user login
 */
exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for AI search
 */
exports.aiSearchValidation = [
  body('query')
    .trim()
    .notEmpty()
    .withMessage('Query is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Query must be between 3 and 500 characters')
];

/**
 * Validation rules for AI chat
 */
exports.aiChatValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
  body('conversationId')
    .optional()
    .isMongoId()
    .withMessage('Conversation ID must be a valid MongoDB ID')
];
