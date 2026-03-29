const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const {
  createCheckoutSession,
  verifySession,
  khaltiInitiate,
  khaltiVerify,
  esewaInitiate
} = require('../controllers/paymentController');

const router = express.Router();

router.post(
  '/create-checkout-session',
  protect,
  authorize('renter', 'owner', 'admin'),
  asyncHandler(createCheckoutSession)
);

router.get('/verify-session', protect, asyncHandler(verifySession));

router.post(
  '/khalti/initiate',
  protect,
  authorize('renter', 'owner', 'admin'),
  asyncHandler(khaltiInitiate)
);

router.get('/khalti/verify', protect, asyncHandler(khaltiVerify));

router.post(
  '/esewa/initiate',
  protect,
  authorize('renter', 'owner', 'admin'),
  asyncHandler(esewaInitiate)
);

module.exports = router;
