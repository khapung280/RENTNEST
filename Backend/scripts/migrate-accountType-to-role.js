#!/usr/bin/env node
/**
 * One-time migration: Copy accountType to role for existing users.
 * Run once after deploying the User model refactor (single role field).
 *
 * Usage: node scripts/migrate-accountType-to-role.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/rentnest';

const migrate = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const result = await mongoose.connection.db.collection('users').updateMany(
      { role: { $exists: false }, accountType: { $exists: true } },
      [{ $set: { role: '$accountType' } }]
    );

    console.log(`Migrated ${result.modifiedCount} user(s): accountType -> role`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
};

migrate();
