// src/routes/codeExecutor.js
const express = require('express');
const router = express.Router();
const { executeCode } = require('../controllers/executeController');
const { protect } = require('../middleware/auth');

// @route   POST /api/code/execute
// @desc    Execute user-submitted code inside Docker
// @access  Private (requires JWT auth)
router.post('/execute', protect, executeCode);

module.exports = router;
