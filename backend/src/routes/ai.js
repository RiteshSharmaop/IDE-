const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

/**
 * AI Assistant Routes
 */

// Main assistance endpoint - handles all AI queries
router.post("/assist", aiController.assistWithCode);

// Get improvement suggestions
router.post("/suggest-improvements", aiController.suggestImprovements);

// Get code explanation
router.post("/explain", aiController.explainCode);

module.exports = router;
