const express = require('express');
const router = express.Router();
const { uploadAvatar, uploadMiddleware, getProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Upload avatar
router.post('/avatar', protect, uploadMiddleware, uploadAvatar);

// Get profile
router.get('/me', protect, getProfile);

// Update profile (username)
router.put('/update', protect, updateProfile);

module.exports = router;
