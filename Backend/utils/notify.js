const Notification = require('../models/Notification');

/**
 * Create an in-app notification for a user.
 */
async function createNotification({ recipientId, type, title, body, link, meta }) {
  if (!recipientId) return null;
  try {
    return await Notification.create({
      recipient: recipientId,
      type,
      title,
      body: body || '',
      link: link || '',
      meta: meta || {}
    });
  } catch (e) {
    console.error('createNotification error:', e.message);
    return null;
  }
}

/**
 * Notify renter when owner changes booking status.
 */
async function notifyBookingDecision(booking, newStatus, previousStatus) {
  const renterId = booking.renter?._id || booking.renter;
  if (!renterId) return;

  const propTitle =
    booking.property?.title || booking.property?.name || 'a property';

  if (newStatus === 'confirmed' && previousStatus === 'pending') {
    await createNotification({
      recipientId: renterId,
      type: 'booking_approved',
      title: 'Booking approved',
      body: `Your booking request for "${propTitle}" was approved. Open My Bookings to pay or view details.`,
      link: '/my-bookings',
      meta: {
        bookingId: booking._id,
        propertyTitle: propTitle
      }
    });
    return;
  }

  if (newStatus === 'cancelled' && previousStatus === 'pending') {
    await createNotification({
      recipientId: renterId,
      type: 'booking_declined',
      title: 'Booking request declined',
      body: `Your booking request for "${propTitle}" was not accepted by the owner.`,
      link: '/my-bookings',
      meta: {
        bookingId: booking._id,
        propertyTitle: propTitle
      }
    });
    return;
  }

  if (newStatus === 'cancelled' && previousStatus === 'confirmed') {
    await createNotification({
      recipientId: renterId,
      type: 'booking_cancelled',
      title: 'Booking cancelled',
      body: `Your confirmed stay at "${propTitle}" was cancelled by the owner. Contact them or support if you have questions.`,
      link: '/my-bookings',
      meta: {
        bookingId: booking._id,
        propertyTitle: propTitle
      }
    });
  }
}

module.exports = {
  createNotification,
  notifyBookingDecision
};
