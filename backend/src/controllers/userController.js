const User = require('../models/User');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Handler wrapper to use in routes: router.post('/avatar', protect, upload.single('avatar'), uploadAvatar)
exports.uploadMiddleware = upload.single('avatar');

exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Upload buffer to Cloudinary via upload_stream
    const bufferStream = streamifier.createReadStream(req.file.buffer);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder: 'avatars', transformation: { width: 400, height: 400, crop: 'thumb', gravity: 'face' } }, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
      bufferStream.pipe(uploadStream);
    });

    // Update user record with avatar url
    const updated = await User.findByIdAndUpdate(userId, { avatar: result.secure_url }, { new: true }).select('-password');

    res.json({ success: true, message: 'Avatar uploaded', data: { url: result.secure_url, user: updated } });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload avatar' });
  }
};

// Simple endpoint to get user profile data
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};

// Update profile (username)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ success: false, message: 'Username can only contain letters, numbers, and underscores' });
    }

    // Check uniqueness
    const existing = await User.findOne({ username, _id: { $ne: userId } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    const updated = await User.findByIdAndUpdate(userId, { username }, { new: true }).select('-password');

    // Invalidate or refresh cache if available
    try {
      const { invalidateUserCache, cacheUser } = require('../config/redis');
      if (invalidateUserCache) await invalidateUserCache(userId.toString());
      if (cacheUser) await cacheUser(userId.toString(), updated.toObject());
    } catch (e) {
      // ignore cache errors
    }

    res.json({ success: true, message: 'Profile updated', data: updated });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};
