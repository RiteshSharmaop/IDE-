// backend/src/middleware/notificationDeletionInitializer.js
// Middleware to initialize notification deletion system on server startup

const {
  initializeNotificationDeletionSystem,
  shutdownNotificationDeletionSystem,
} = require("../services/notification-deletion-service");

let isInitialized = false;

/**
 * Express middleware to initialize notification deletion system
 * Call once at server startup
 */
function initializeNotificationDeletionMiddleware(req, res, next) {
  if (isInitialized) {
    return next();
  }

  // Initialize asynchronously
  initializeNotificationDeletionSystem()
    .then(() => {
      isInitialized = true;
      next();
    })
    .catch((error) => {
      console.error(
        "Failed to initialize notification deletion system:",
        error
      );
      // Don't block server startup; log and continue
      // In production, may want to fail fast
      next();
    });
}

/**
 * Register graceful shutdown handler
 */
function registerShutdownHandler() {
  const signals = ["SIGINT", "SIGTERM"];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      console.log(`\nReceived ${signal}, shutting down...`);
      await shutdownNotificationDeletionSystem();
      process.exit(0);
    });
  });
}

module.exports = {
  initializeNotificationDeletionMiddleware,
  registerShutdownHandler,
};
