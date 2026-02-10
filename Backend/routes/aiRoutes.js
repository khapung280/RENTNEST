const express = require('express');
const router = express.Router();

// Controllers
const aiController = require('../controllers/aiController');

// Middleware
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { aiSearchValidation, aiChatValidation } = require('../middleware/validators');

/**
 * @route   POST /api/ai/search
 * @desc    Natural language property search
 * @access  Private
 */
router.post(
  '/search',
  protect,
  aiSearchValidation,
  handleValidationErrors,
  aiController.search
);

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI assistant
 * @access  Private
 */
router.post(
  '/chat',
  protect,
  aiChatValidation,
  handleValidationErrors,
  aiController.chat
);

module.exports = router;
