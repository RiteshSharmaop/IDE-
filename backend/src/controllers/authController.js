// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { cacheUser, invalidateUserCache, blacklistToken } = require('../config/redis');
const emailService = require('../services/emailService');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log("aaya");
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email and password'
      });
    }

    // Validate username format early to avoid creating invalid documents
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        message: 'Username can only contain letters, numbers, and underscores'
      });
    }

    // Validate Gmail account
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return res.status(400).json({
        success: false,
        message: 'Only Gmail accounts are supported for registration'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // Create user with OTP
    const user = await User.create({
      username,
      email,
      password,
      otp,
      otpExpiry,
      isEmailVerified: false
    });

    // Send OTP email and handle send result
    const emailResult = await emailService.sendOTPEmail(email, otp, username);

    if (emailService && emailService.isConfigured) {
      // SMTP configured in environment: require successful send
      if (!emailResult || !emailResult.success) {
        console.error(`❌ Failed to send OTP to ${email} while email service is configured. Error: ${emailResult && emailResult.message ? emailResult.message : 'unknown'}`);
        // Do NOT delete the created user here to avoid accidental data loss; keep the account and let admin/developer fix SMTP and use /api/auth/resend-otp
        return res.status(500).json({
          success: false,
          message: `Failed to send OTP: ${emailResult && emailResult.message ? emailResult.message : 'Unknown error'}. Ensure EMAIL_USER and EMAIL_PASSWORD (Gmail App Password) are set correctly.`
        });
      }
    }

    // On development or when email isn't configured, continue but expose testOTP only in dev
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for OTP.',
      data: {
        userId: user._id,
        email: user.email,
        username: user.username,
        message: 'Please verify your email with the 6-digit OTP sent to your Gmail',
        testOTP: process.env.NODE_ENV === 'development' ? otp : undefined
      }
    });
  } catch (error) {
    console.error('Signup error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/signin
 * @access  Public
 */
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Find user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first. OTP was sent to your registered Gmail.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Cache user data
    const userObj = user.toObject();
    delete userObj.password;
    await cacheUser(user._id.toString(), userObj);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          lastLogin: user.lastLogin
        },
        token
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    const token = req.token;
    const userId = req.user.id || req.user._id;

    // Decode token to get expiration time
    const decoded = jwt.decode(token);
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

    // Add token to blacklist
    if (expiresIn > 0) {
      await blacklistToken(token, expiresIn);
    }

    // Invalidate user cache
    await invalidateUserCache(userId.toString());

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.id || req.user._id).select('+password');

    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Invalidate cache
    await invalidateUserCache(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Verify OTP and complete email verification
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Find user with OTP
    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP exists
    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please sign up again.'
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpiry) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please sign up again.'
      });
    }

    // Verify OTP
    if (user.otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Cache user data
    const userObj = user.toObject();
    delete userObj.password;
    await cacheUser(user._id.toString(), userObj);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isEmailVerified: user.isEmailVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification'
    });
  }
};

/**
 * @desc    Resend OTP to user email
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    const emailResult = await emailService.sendOTPEmail(email, otp, user.username);

    if (emailService && emailService.isConfigured) {
      if (!emailResult || !emailResult.success) {
        console.error(`❌ Failed to resend OTP to ${email}. Error: ${emailResult && emailResult.message ? emailResult.message : 'unknown'}`);
        return res.status(500).json({
          success: false,
          message: `Failed to send OTP: ${emailResult && emailResult.message ? emailResult.message : 'Unknown error'}. Check EMAIL credentials.`
        });
      }
    } else {
      if (!emailResult || !emailResult.success) {
        console.warn(`⚠️  Email not sent to ${email}, but OTP regenerated: ${otp}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      // For development/testing without email:
      testOTP: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP resend'
    });
  }
};

module.exports = {
  signup,
  signin,
  getMe,
  logout,
  updatePassword,
  verifyOTP,
  resendOTP
};