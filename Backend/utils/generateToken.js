const jwt = require('jsonwebtoken');

/**
 * Generate JWT for authenticated user.
 * Payload includes id and role (for protected route checks on frontend).
 * JWT_SECRET must be set in env (required in production).
 */
const generateToken = (id, role = 'renter') => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET must be set in environment and at least 16 characters');
  }
  return jwt.sign(
    { id, role },
    secret,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = generateToken;

