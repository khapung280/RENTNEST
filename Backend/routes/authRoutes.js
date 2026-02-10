const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/authController');

// Middleware
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { registerValidation, loginValidation } = require('../middleware/validators');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  registerValidation,
  handleValidationErrors,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  loginValidation,
  handleValidationErrors,
  authController.login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get(
  '/me',
  protect,
  authController.getMe
);

module.exports = router;
