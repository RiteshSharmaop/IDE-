// src/routes/auth.js
const express = require('express');
const router = express.Router();
const {
  signup,
  signin,
  getMe,
  logout,
  updatePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/signup', signup);
router.post('/signin', signin);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/update-password', protect, updatePassword);

module.exports = router;
