// src/controllers/fileController.js
const File = require('../models/File');
const User = require('../models/User');
const { redisUtils, getRedisClient, cacheFile } = require('../config/redis');

// Helper to get language from extension
const getLanguageFromExtension = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const langMap = {
    'js': 'javascript',
    'py': 'python',
    'html': 'html',
    'cpp': 'cpp',
    'c': 'c',
    'java': 'java',
    'cs': 'csharp',
    'css': 'css',
    'json': 'json',
    'md': 'markdown'
  };
  return langMap[ext] || 'plaintext';
};

// @desc    Create new file
// @route   POST /api/files
exports.createFile = async (req, res) => {
  try {
    const { name, content = '', folder } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'File name is required'
      });
    } 
    const userId = (req.user?.id || req.user?._id);  
    
    // TODO: "Check file with name for the user is already exists or not"
    const alreadyExists = await File.findOne({
      $and: [{ name }, { userId }]
    });
    if(alreadyExists){
      return res.status(409).json({
        success: false,
        message: 'File name is already exists'
      });
    }
    
    const extension = name.split('.').pop();
    const language = getLanguageFromExtension(name);
    
    // Create file
    const file = await File.create({
      name,
      content,
      lang:language,
      extension,
      userId: userId,
      folder: folder || "src"
    });
    
    // Update user's file count
    await User.findByIdAndUpdate(userId, {
      $inc: { filesCreated: 1 }
    });
    
    console.log("Runn till heare,.....................");
    // Cache file in Redis (1 hour)
    await cacheFile(file._id.toString(), file, 3600);
    
    // Increment user file count in Redis
    const cacheKey = `user:${userId}:fileCount`;
    await getRedisClient().incr(cacheKey);
    await getRedisClient().expire(cacheKey, 3600);

    res.status(201).json({
      success: true,
      message: 'File created successfully',
      data: { file }
    });

  } catch (error) {
    console.error('Create file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating file',
      error: error.message
    });
  }
};

// @desc    Get all user files
// @route   GET /api/files
exports.getFiles = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;

    // Check Redis cache first
    const cacheKey = `user:${req.user.id}:files:${page}:${search}`;
    const cachedFiles = await redisUtils.get(cacheKey);

    if (cachedFiles) {
      return res.json({
        success: true,
        data: cachedFiles,
        cached: true
      });
    }

    // Build query
    const query = {
      userId: req.user.id,
      isDeleted: false
    };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Get files from database
    const files = await File.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const count = await File.countDocuments(query);

    const result = {
      files,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    };

    // Cache for 5 minutes
    await redisUtils.setex(cacheKey, 300, result);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching files',
      error: error.message
    });
  }
};

// @desc    Get single file
// @route   GET /api/files/:id
exports.getFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Check Redis cache first
    const cachedFile = await redisUtils.get(`file:${id}`);

    if (cachedFile) {
      return res.json({
        success: true,
        data: { file: cachedFile },
        cached: true
      });
    }

    // Get from database
    const file = await File.findOne({
      _id: id,
      userId: req.user.id,
      isDeleted: false
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Cache for 1 hour
    await redisUtils.setex(`file:${id}`, 3600, file);

    res.json({
      success: true,
      data: { file }
    });

  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching file',
      error: error.message
    });
  }
};

// @desc    Update file
// @route   PUT /api/files/:id
exports.updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, content } = req.body;

    const file = await File.findOne({
      _id: id,
      userId: req.user.id,
      isDeleted: false
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Update fields
    if (name) {
      file.name = name;
      file.extension = name.split('.').pop();
      file.language = getLanguageFromExtension(name);
    }
    if (content !== undefined) {
      file.content = content;
    }

    await file.save();

    // Update cache
    await redisUtils.setex(`file:${id}`, 3600, file);

    // Invalidate user files list cache
    const cachePattern = `user:${req.user.id}:files:*`;
    // Note: In production, you'd want to use SCAN to delete pattern matches
    
    res.json({
      success: true,
      message: 'File updated successfully',
      data: { file }
    });

  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating file',
      error: error.message
    });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await File.findOne({
      _id: id,
      userId: req.user.id,
      isDeleted: false
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Soft delete
    file.isDeleted = true;
    await file.save();

    // Remove from cache
    await redisUtils.del(`file:${id}`);

    // Decrement user file count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { filesCreated: -1 }
    });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
};
