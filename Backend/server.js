// ============================================
// MAIN SERVER FILE - START POINT OF BACKEND
// ============================================
// This file starts the server and connects everything together
// When we run "npm start", this file executes first

// Import libraries we need
const express = require('express');        // Express helps create API server
const cors = require('cors');             // Allows frontend to talk to backend
const dotenv = require('dotenv');          // Reads .env file for secret keys
const connectDB = require('./config/db');  // Connects to MongoDB database

// Load secret keys from .env file (database password, JWT secret, etc.)
dotenv.config();

// Connect to MongoDB database
// This connects our app to the database where we store users, properties, bookings
connectDB();

// Create Express app (this is our server)
const app = express();

// Set which port to run on (5000 is default)
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE - RUNS ON EVERY REQUEST
// ============================================
// Middleware processes requests before they reach our routes

// CORS - Allow frontend to make requests (development + production)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin);
      if (
        allowedOrigins.includes(origin) ||
        isLocalhost ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Convert JSON data from requests into JavaScript objects
// When frontend sends JSON, we can read it easily
app.use(express.json());

// Convert form data from requests into JavaScript objects
app.use(express.urlencoded({ extended: true }));

// ============================================
// API ROUTES - DIFFERENT ENDPOINTS
// ============================================
// Each line connects a URL path to its handler file
// Example: /api/auth/login goes to authRoutes.js

app.use('/api/auth', require('./routes/authRoutes'));           // Login, Register, Get User
app.use('/api/properties', require('./routes/propertyRoutes')); // Get, Create, Update, Delete Properties
app.use('/api/bookings', require('./routes/bookingRoutes'));    // Create, Approve, Reject Bookings
app.use('/api/users', require('./routes/userRoutes'));          // User Profile Management
app.use('/api/admin', require('./routes/adminRoutes'));         // Admin Functions
app.use('/api/ai', require('./routes/aiRoutes'));                // AI Chatbot
app.use('/api/conversations', require('./routes/conversationRoutes')); // Conversations
app.use('/api/messages', require('./routes/messageRoutes'));    // Messages

// ============================================
// SIMPLE TEST ROUTES
// ============================================

// Test if server is running - visit http://localhost:5000/
app.get('/', (req, res) => {
  res.json({ message: 'RentNest API is running' });
});

// Health check - visit http://localhost:5000/api/health
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ERROR HANDLER
// ============================================
// If any error happens in routes, this catches it and sends error message
// Must be placed after all routes
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// ============================================
// START THE SERVER
// ============================================
// Start listening for requests on the port
// When someone visits our API, server responds

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
