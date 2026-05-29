const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  handlePrompt,
  handleMultiLLMPrompt,
  getAvailableModels
} = require('../controllers/handlePromptController');

// All routes require authentication
router.use(protect);

// Single LLM prompt
router.post('/prompt', handlePrompt);

// Multi-LLM prompt
router.post('/multi-llm', handleMultiLLMPrompt);

// Get available models
router.get('/models', getAvailableModels);

module.exports = router;
