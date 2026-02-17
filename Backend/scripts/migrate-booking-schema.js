#!/usr/bin/env node
/**
 * One-time migration: Update existing bookings to new schema.
 * - user -> renter
 * - add owner from property
 * - checkInDate -> checkIn, checkOutDate -> checkOut
 * - status: approved -> confirmed, rejected -> cancelled
 *
 * Usage: node scripts/migrate-booking-schema.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/rentnest';

const migrate = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    const bookings = await mongoose.connection.db.collection('bookings').find({}).toArray();
    const properties = await mongoose.connection.db.collection('properties').find({}).toArray();
    const propMap = new Map(properties.map(p => [p._id.toString(), p]));

    let updated = 0;
    for (const b of bookings) {
      const updates = {};
      if (b.user && !b.renter) updates.renter = b.user;
      if (b.checkInDate && !b.checkIn) updates.checkIn = b.checkInDate;
      if (b.checkOutDate && !b.checkOut) updates.checkOut = b.checkOutDate;
      if (!b.owner && b.property) {
        const prop = propMap.get(b.property.toString());
        if (prop?.owner) updates.owner = prop.owner;
      }
      if (b.status === 'approved') updates.status = 'confirmed';
      else if (b.status === 'rejected') updates.status = 'cancelled';

      if (Object.keys(updates).length > 0) {
        await mongoose.connection.db.collection('bookings').updateOne(
          { _id: b._id },
          { $set: updates }
        );
        updated++;
      }
    }

    console.log(`Migrated ${updated} booking(s) to new schema`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
};

migrate();
