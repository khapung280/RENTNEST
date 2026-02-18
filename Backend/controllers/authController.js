const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/** Build user payload for API (accountType = role for frontend compatibility) */
function toUserPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    accountType: user.role,
    role: user.role,
    profilePicture: user.profilePicture || '',
    isVerified: user.isVerified
  };
}

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, accountType, phone } = req.body;
    const roleValue = role || accountType;

    const normalizedEmail = (email && String(email).trim().toLowerCase()) || '';
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const validRoles = ['renter', 'owner', 'admin'];
    const userRole = validRoles.includes(roleValue) ? roleValue : 'renter';

    const user = await User.create({
      name: name && String(name).trim(),
      email: normalizedEmail,
      password,
      role: userRole,
      phone: phone ? String(phone).trim() : ''
    });

    const token = generateToken(user._id, user.role ?? 'renter');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: toUserPayload(user)
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = (email && String(email).trim().toLowerCase()) || '';
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact support.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log("DB USER ROLE:", user.role);
    console.log("DB USER ACCOUNT TYPE:", user.accountType);

    const token = generateToken(user._id, user.role ?? 'renter');

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: toUserPayload(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        ...toUserPayload(user),
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

