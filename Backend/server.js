// ============================================
// MAIN SERVER FILE - START POINT OF BACKEND
// ============================================
// This file starts the server and connects everything together
// When we run "npm start", this file executes first

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

const { handleStripeWebhook } = require("./controllers/paymentController");

function buildCorsOrigins() {
  const defaults = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://rentnest-xn1v.vercel.app",
    "https://rentnests.vercel.app"
  ];
  const fromFrontend = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const extra = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return [...new Set([...defaults, ...fromFrontend, ...extra])];
}

// Vercel may assign a new *.vercel.app hostname when the project slug changes.
const RENTNEST_VERCEL = /^https:\/\/rentnest-[a-z0-9-]+\.vercel\.app$/i;

// CORS MUST BE FIRST — browser blocks /properties if your Vercel origin is not listed
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = buildCorsOrigins();
      if (!origin || allowed.includes(origin)) {
        return callback(null, true);
      }
      if (RENTNEST_VERCEL.test(origin)) {
        return callback(null, true);
      }
      console.warn(`CORS blocked origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true
  })
);

// Stripe webhooks need the raw body for signature verification (must be before express.json)
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// THEN JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded images
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// THEN ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/conversations", require("./routes/conversationRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.get("/", (req, res) => {
  res.json({ message: "RentNest API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

const { errorHandler } = require("./middleware/errorHandler");
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
