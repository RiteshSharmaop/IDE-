const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { createServer } = require("node:http");
require("dotenv").config();

const connectDB = require("./config/database");

// Import routes
const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/files");
const executeRoutes = require("./routes/execute");
const { roomRouter } = require("./routes/room");
const notificationRoutes = require("./routes/notifications");
const ideRoutes = require("./routes/ide");
const llmRoutes = require("./routes/llm");
const usersRoutes = require("./routes/users");

// Create Express app and HTTP server
const app = express();
const httpServer = createServer(app);

// Connect to databases
const { connectRedisCloud } = require("./config/redis");

connectDB();
// Connect to Redis (reads REDIS_HOST and REDIS_PORT from env; defaults to localhost:6379)
connectRedisCloud();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/execute", executeRoutes);
app.use("/api/rooms", roomRouter);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ide", ideRoutes);
app.use("/api/llm", llmRoutes);
app.use("/api/users", usersRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "IDE server is healthy and running smoothly!",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Import socket configuration
const { initSocket } = require("./socket");
initSocket(httpServer);

const PORT = process.env.PORT || 8080;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, httpServer };
