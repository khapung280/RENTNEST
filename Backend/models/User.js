const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User model - single role field: admin | owner | renter
 * Production-ready: no redundant fields, validated enum
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: { values: ['admin', 'owner', 'renter'], message: 'Role must be admin, owner, or renter' },
    default: 'renter'
  },
  phone: {
    type: String,
    trim: true,
    default: '',
    match: [/^$|^[0-9]{10}$/, 'Phone must be empty or a valid 10-digit number']
  },
  profilePicture: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSuspended: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

userSchema.index({ role: 1 });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.matchPassword = async function (enteredPassword) {
  return this.comparePassword(enteredPassword);
};

module.exports = mongoose.model('User', userSchema);
