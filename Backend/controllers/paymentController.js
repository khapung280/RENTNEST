const Stripe = require('stripe');
const Booking = require('../models/Booking');

const khaltiApiBase = () =>
  process.env.KHALTI_MODE === 'live'
    ? 'https://khalti.com/api/v2'
    : 'https://dev.khalti.com/api/v2';

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
};

/**
 * Stripe Checkout uses USD cents by default (works with US test keys).
 * Set STRIPE_CHECKOUT_CURRENCY=npr if your Stripe account settles in NPR.
 */
const checkoutCurrency = () => (process.env.STRIPE_CHECKOUT_CURRENCY || 'usd').toLowerCase();

const nprToUsd = () => parseFloat(process.env.NPR_TO_USD || '0.0075') || 0.0075;

/** Amount in smallest currency unit for Stripe Checkout */
const amountMinorUnits = (totalNpr) => {
  const npr = Math.max(0, Math.round(Number(totalNpr) || 0));
  const cur = checkoutCurrency();
  if (cur === 'npr') {
    return Math.round(npr * 100);
  }
  const usd = npr * nprToUsd();
  return Math.max(50, Math.round(usd * 100));
};

const frontendBase = () =>
  (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

/**
 * POST /api/payments/create-checkout-session
 */
exports.createCheckoutSession = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({
      success: false,
      message: 'Payments are not configured. Set STRIPE_SECRET_KEY in the server environment.'
    });
  }

  const { bookingId } = req.body;
  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'bookingId is required' });
  }

  const booking = await Booking.findById(bookingId).populate('property', 'title location price');

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  const renterId = booking.renter?.toString?.();
  if (renterId !== req.user.id.toString()) {
    return res.status(403).json({ success: false, message: 'Not your booking' });
  }

  if (booking.status !== 'confirmed') {
    return res.status(400).json({
      success: false,
      message: 'Payment is only available after the owner confirms this booking.'
    });
  }

  if (booking.paymentStatus === 'paid') {
    return res.status(400).json({ success: false, message: 'This booking is already paid.' });
  }

  let totalNpr = booking.totalAmount;
  if (totalNpr == null && booking.property?.price) {
    const months = booking.durationMonths || 1;
    const monthly = booking.monthlyRate ?? booking.property.price;
    totalNpr = Math.round(monthly * months);
  }

  if (!totalNpr || totalNpr <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid booking amount.' });
  }

  const unitAmount = amountMinorUnits(totalNpr);
  const cur = checkoutCurrency();
  const title = booking.property?.title || 'Rent payment';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: cur,
          unit_amount: unitAmount,
          product_data: {
            name: `RentNest — ${title}`,
            description:
              cur === 'npr'
                ? `Total NPR ${totalNpr.toLocaleString()}`
                : `Approx. NPR ${totalNpr.toLocaleString()} (charged in USD)`
          }
        }
      }
    ],
    metadata: {
      bookingId: booking._id.toString(),
      renterId: req.user.id.toString()
    },
    success_url: `${frontendBase()}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendBase()}/payment/cancel?booking_id=${booking._id}`,
    customer_email: req.user.email || undefined
  });

  booking.stripeCheckoutSessionId = session.id;
  booking.paymentStatus = 'processing';
  booking.paymentProvider = 'stripe';
  await booking.save();

  res.json({
    success: true,
    url: session.url,
    sessionId: session.id
  });
};

/**
 * GET /api/payments/verify-session?session_id=
 */
exports.verifySession = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ success: false, message: 'Stripe not configured' });
  }

  const { session_id: sessionId } = req.query;
  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'session_id is required' });
  }

  const session = await stripe.checkout.sessions.retrieve(String(sessionId));
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'Invalid session' });
  }

  let booking = await Booking.findById(bookingId)
    .populate('property', 'title location image price')
    .populate('owner', 'name email');

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  const renterRef = booking.renter?._id || booking.renter;
  if (renterRef.toString() !== req.user.id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  // Sync DB when checkout succeeded but webhook not yet delivered (local dev / slow webhooks)
  if (session.payment_status === 'paid' && booking.paymentStatus !== 'paid') {
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'paid',
      paymentProvider: 'stripe',
      stripePaymentIntentId: session.payment_intent || null,
      paidAt: new Date(),
      stripeCheckoutSessionId: session.id
    });
    booking = await Booking.findById(bookingId)
      .populate('property', 'title location image price')
      .populate('owner', 'name email');
  }

  res.json({
    success: true,
    paymentStatus: session.payment_status,
    bookingPaid: booking.paymentStatus === 'paid',
    booking
  });
};

/**
 * Stripe webhook — must use raw body (registered in server.js)
 */
exports.handleStripeWebhook = async (req, res) => {
  try {
    const stripe = getStripe();
    const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe || !whSecret) {
      return res.status(503).send('Stripe webhook not configured');
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, whSecret);
    } catch (err) {
      console.error('Stripe webhook signature error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (bookingId && session.payment_status === 'paid') {
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: 'paid',
          paymentProvider: 'stripe',
          stripePaymentIntentId: session.payment_intent || null,
          paidAt: new Date(),
          stripeCheckoutSessionId: session.id
        });
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: 'unpaid',
          stripeCheckoutSessionId: null
        });
      }
    }

    res.json({ received: true });
  } catch (e) {
    console.error('Stripe webhook handler error:', e);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

/**
 * POST /api/payments/khalti/initiate
 * Amount in paisa (1 NPR = 100 paisa)
 */
exports.khaltiInitiate = async (req, res) => {
  const secret = process.env.KHALTI_SECRET_KEY;
  if (!secret) {
    return res.status(503).json({
      success: false,
      configured: false,
      message: 'Khalti is not configured. Add KHALTI_SECRET_KEY to the server environment.'
    });
  }

  const { bookingId } = req.body;
  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'bookingId is required' });
  }

  const booking = await Booking.findById(bookingId).populate('property', 'title location price');

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (booking.renter.toString() !== req.user.id.toString()) {
    return res.status(403).json({ success: false, message: 'Not your booking' });
  }

  if (booking.status !== 'confirmed') {
    return res.status(400).json({
      success: false,
      message: 'Payment is only available after the owner confirms this booking.'
    });
  }

  if (booking.paymentStatus === 'paid') {
    return res.status(400).json({ success: false, message: 'This booking is already paid.' });
  }

  let totalNpr = booking.totalAmount;
  if (totalNpr == null && booking.property?.price) {
    const months = booking.durationMonths || 1;
    const monthly = booking.monthlyRate ?? booking.property.price;
    totalNpr = Math.round(monthly * months);
  }

  if (!totalNpr || totalNpr <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid booking amount.' });
  }

  const amountPaisa = Math.round(Number(totalNpr) * 100);
  const title = booking.property?.title || 'Rent';

  const payload = {
    return_url: `${frontendBase()}/payment/khalti-return`,
    website_url: frontendBase(),
    amount: amountPaisa,
    purchase_order_id: booking._id.toString(),
    purchase_order_name: `RentNest — ${title}`.slice(0, 80),
    customer_info: {
      name: (req.user.name || 'Guest').slice(0, 60),
      email: req.user.email || '',
      phone: (req.user.phone || '9800000000').toString().replace(/\D/g, '').slice(-10) || '9800000000'
    }
  };

  const url = `${khaltiApiBase()}/epayment/initiate/`;
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Key ${secret}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await r.json().catch(() => ({}));

  if (!r.ok) {
    const msg =
      data.detail ||
      data.error_key ||
      data.message ||
      (typeof data === 'string' ? data : JSON.stringify(data)) ||
      'Khalti initiate failed';
    return res.status(400).json({ success: false, message: msg });
  }

  if (!data.payment_url || !data.pidx) {
    return res.status(400).json({
      success: false,
      message: data.detail || 'Invalid response from Khalti'
    });
  }

  booking.paymentStatus = 'processing';
  booking.paymentProvider = 'khalti';
  booking.khaltiPidx = data.pidx;
  await booking.save();

  res.json({
    success: true,
    url: data.payment_url,
    pidx: data.pidx
  });
};

/**
 * GET /api/payments/khalti/verify?pidx=
 */
exports.khaltiVerify = async (req, res) => {
  const secret = process.env.KHALTI_SECRET_KEY;
  if (!secret) {
    return res.status(503).json({ success: false, message: 'Khalti not configured' });
  }

  const { pidx } = req.query;
  if (!pidx) {
    return res.status(400).json({ success: false, message: 'pidx is required' });
  }

  const lookupUrl = `${khaltiApiBase()}/epayment/lookup/`;
  const r = await fetch(lookupUrl, {
    method: 'POST',
    headers: {
      Authorization: `Key ${secret}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pidx: String(pidx) })
  });

  const data = await r.json().catch(() => ({}));

  if (!r.ok) {
    return res.status(400).json({
      success: false,
      message: data.detail || 'Khalti lookup failed'
    });
  }

  const status = data.status || data.state || data?.transaction_details?.status;
  const purchaseOrderId =
    data.purchase_order_id || data.purchase_order?.id || data?.purchase_order_idx;

  let booking =
    (await Booking.findOne({ khaltiPidx: String(pidx) })) ||
    (purchaseOrderId ? await Booking.findById(purchaseOrderId) : null);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found for this payment' });
  }

  if (booking.renter.toString() !== req.user.id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }

  const paid = status === 'Completed' || status === 'completed';

  if (paid && booking.paymentStatus !== 'paid') {
    await Booking.findByIdAndUpdate(booking._id, {
      paymentStatus: 'paid',
      paidAt: new Date(),
      paymentProvider: 'khalti',
      khaltiPidx: String(pidx)
    });
    booking = await Booking.findById(booking._id)
      .populate('property', 'title location image price')
      .populate('owner', 'name email');
  }

  res.json({
    success: true,
    khaltiStatus: status,
    bookingPaid: paid || booking.paymentStatus === 'paid',
    booking
  });
};

/**
 * POST /api/payments/esewa/initiate
 * Returns configuration status; full merchant signing requires ESEWA_* keys in production.
 */
exports.esewaInitiate = async (req, res) => {
  const merchantId = process.env.ESEWA_MERCHANT_ID;
  const secret = process.env.ESEWA_SECRET_KEY;

  if (!merchantId || !secret) {
    return res.status(503).json({
      success: false,
      configured: false,
      message:
        'eSewa merchant keys are not set. Add ESEWA_MERCHANT_ID and ESEWA_SECRET_KEY to the server .env (see eSewa developer docs).'
    });
  }

  const { bookingId } = req.body;
  if (!bookingId) {
    return res.status(400).json({ success: false, message: 'bookingId is required' });
  }

  const booking = await Booking.findById(bookingId).populate('property', 'title location price');

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (booking.renter.toString() !== req.user.id.toString()) {
    return res.status(403).json({ success: false, message: 'Not your booking' });
  }

  if (booking.status !== 'confirmed') {
    return res.status(400).json({
      success: false,
      message: 'Payment is only available after the owner confirms this booking.'
    });
  }

  if (booking.paymentStatus === 'paid') {
    return res.status(400).json({ success: false, message: 'Already paid.' });
  }

  return res.status(501).json({
    success: false,
    message:
      'eSewa server-side signing is not enabled in this build. Use Khalti or Stripe from My Bookings, or extend Backend with eSewa v2 signing per https://developer.esewa.com.np'
  });
};
