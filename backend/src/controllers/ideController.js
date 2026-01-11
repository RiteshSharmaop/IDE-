// src/controllers/ideController.js
// Controller for IDE events and Kafka integration

const {
  publishCodeExecution,
  publishFileOperation,
  publishIDEMetrics,
} = require("../services/kafka/ide-producer");

/**
 * Track code execution event
 * POST /api/ide/track-execution
 */
async function trackCodeExecution(req, res) {
  try {
    const { fileName, language, executionTime, status, output, error } =
      req.body;
    const userId = req.user?._id || "anonymous";
    const username = req.user?.username || "anonymous";
    const roomId = req.body.roomId || "default";

    // Publish to Kafka
    const event = await publishCodeExecution({
      userId,
      username,
      roomId,
      fileName,
      language,
      executionTime,
      status,
      output,
      error,
    });

    res.json({
      success: true,
      message: "Code execution tracked",
      eventId: event.eventId,
    });
  } catch (error) {
    console.error("Error tracking code execution:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track code execution",
      error: error.message,
    });
  }
}

/**
 * Track file operation event
 * POST /api/ide/track-file-operation
 */
async function trackFileOperation(req, res) {
  try {
    const { operation, fileName, filePath, language } = req.body;
    const userId = req.user?._id || "anonymous";
    const username = req.user?.username || "anonymous";
    const roomId = req.body.roomId || "default";

    // Publish to Kafka
    const event = await publishFileOperation({
      userId,
      username,
      roomId,
      operation,
      fileName,
      filePath,
      language,
    });

    res.json({
      success: true,
      message: "File operation tracked",
      eventId: event.eventId,
    });
  } catch (error) {
    console.error("Error tracking file operation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track file operation",
      error: error.message,
    });
  }
}

/**
 * Track IDE metrics
 * POST /api/ide/track-metrics
 */
async function trackIDEMetrics(req, res) {
  try {
    const { activeFiles, openFiles, theme } = req.body;
    const userId = req.user?._id || "anonymous";
    const username = req.user?.username || "anonymous";
    const roomId = req.body.roomId || "default";

    // Publish to Kafka (non-critical)
    await publishIDEMetrics({
      userId,
      username,
      roomId,
      activeFiles,
      openFiles,
      theme,
    });

    res.json({
      success: true,
      message: "IDE metrics tracked",
    });
  } catch (error) {
    console.error("Error tracking IDE metrics:", error);
    // Don't fail the request for metrics
    res.json({
      success: true,
      message: "Metrics received (tracking may have failed)",
    });
  }
}

/**
 * Get IDE events health status
 * GET /api/ide/health
 */
async function getIDEHealth(req, res) {
  res.json({
    success: true,
    message: "IDE Kafka integration is healthy",
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  trackCodeExecution,
  trackFileOperation,
  trackIDEMetrics,
  getIDEHealth,
};
