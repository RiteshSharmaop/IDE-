// src/routes/ide.js
// Routes for IDE Kafka integration

const express = require("express");
const router = express.Router();
const {
  trackCodeExecution,
  trackFileOperation,
  trackIDEMetrics,
  getIDEHealth,
} = require("../controllers/ideController");
const { protect } = require("../middleware/auth");

// Track code execution event
router.post("/track-execution", protect, trackCodeExecution);

// Track file operation event
router.post("/track-file-operation", protect, trackFileOperation);

// Track IDE metrics
router.post("/track-metrics", protect, trackIDEMetrics);

// Health check for IDE Kafka integration
router.get("/health", getIDEHealth);

module.exports = router;
