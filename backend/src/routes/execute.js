// src/routes/execute.js
// Code execution routes - supports both Piston (remote) and Docker (local)

const express = require('express');
const router = express.Router();



// 🌐 PISTON API (Currently Active)
// const { executeCodeApi: pistonExecute } = require('../controllers/executeController');

/**
 * POST /api/execute/run
 * 
 * Execute code using Piston API (remote)
 * To switch to Docker: replace pistonExecute with dockerExecute
 */

// router.post('/run', pistonExecute);

const { executeCode } = require("../controllers/dockerExecuteController");
router.post('/run', executeCode);

/**
 * GET /api/execute/test
 * Test the code execution service
*/

const { test } = require('../controllers/testDocker');
router.get('/test', test);

module.exports = router;
