const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['booking_approved', 'booking_declined', 'message', 'booking_cancelled'],
      required: true
    },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, maxlength: 500 },
    link: { type: String, default: '' },
    read: { type: Boolean, default: false, index: true },
    meta: {
      bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
      conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
      propertyTitle: { type: String }
    }
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
