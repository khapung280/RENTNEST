/**
 * Create the first admin user.
 * Run: node scripts/seedAdmin.js
 * Or: npm run seed:admin
 *
 * Set in .env:
 *   ADMIN_EMAIL=admin@rentnest.com
 *   ADMIN_PASSWORD=your_secure_password
 *   ADMIN_NAME=Admin
 *
 * If not set, uses defaults for development only.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@rentnest.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

const run = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/rentnest';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected.');

    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`Admin already exists: ${ADMIN_EMAIL}`);
        process.exit(0);
        return;
      }
      existing.role = 'admin';
      await existing.save();
      console.log(`Updated user ${ADMIN_EMAIL} to admin.`);
    } else {
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL.toLowerCase(),
        password: ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log(`Admin created: ${ADMIN_EMAIL}`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
};

run();
