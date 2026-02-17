const jwt = require('jsonwebtoken');
const User = require('../models/User');

const ROLES = Object.freeze(['admin', 'owner', 'renter']);

/**
 * Protect: require valid JWT.
 * Extracts token from Authorization: Bearer <token>
 * Verifies JWT and attaches user to req.user
 */
exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 16) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

/**
 * Admin only: allow only role === 'admin'
 * Use after protect
 */
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin only.'
  });
};

/**
 * Role-based authorization: allow only specified roles
 * Use after protect
 * @param {...string} roles - 'admin' | 'owner' | 'renter'
 */
exports.authorize = (...roles) => {
  const allowed = roles.filter(r => ROLES.includes(r));
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowed.join(' or ')}`
      });
    }
    next();
  };
};
