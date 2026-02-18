const express = require('express');
const router = express.Router();
const { askAI } = require('../controllers/llmController');
const { protect } = require('../middleware/auth');

// Protected route - requires authentication
router.post('/ask', protect, askAI);

module.exports = router;
