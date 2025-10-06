// src/models/File.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
    maxlength: [255, 'File name cannot exceed 255 characters']
  },
  content: {
    type: String,
    default: '',
    maxlength: [1000000, 'File content cannot exceed 1MB'] // 1MB limit
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'cpp', 'c', 'java', 'csharp', 'text'],
    default: 'text'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  size: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastExecuted: {
    type: Date
  },
  executionCount: {
    type: Number,
    default: 0
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ userId: 1, name: 'text' }); // Text search on name
fileSchema.index({ userId: 1, isStarred: 1 });

// Calculate file size before saving
fileSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.size = Buffer.byteLength(this.content, 'utf8');
  }
  next();
});

// Auto-detect language from file extension
fileSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.isModified('language')) {
    const ext = this.name.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'py': 'python',
      'cpp': 'cpp',
      'c': 'c',
      'java': 'java',
      'cs': 'csharp',
      'txt': 'text'
    };
    this.language = languageMap[ext] || 'text';
  }
  next();
});

// Method to increment execution count
fileSchema.methods.recordExecution = async function() {
  this.executionCount += 1;
  this.lastExecuted = new Date();
  return this.save();
};

// Static method to get user's files with pagination
fileSchema.statics.getUserFiles = async function(userId, options = {}) {
  const {
    page = 1,
    limit = 50,
    search = '',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const query = { userId };

  // Add search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [files, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);

  return {
    files,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const File = mongoose.model('File', fileSchema);

module.exports = File;