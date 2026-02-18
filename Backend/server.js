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

// CORS MUST BE FIRST
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://rentnest-xn1v.vercel.app"
  ],
  credentials: true
}));

// THEN JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// THEN ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/conversations", require("./routes/conversationRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

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
