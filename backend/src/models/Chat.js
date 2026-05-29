const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'New Chat'
    },
    subtitle: {
      type: String,
      default: ''
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    messages: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }],
    isMultiLLM: {
      type: Boolean,
      default: false
    },
    models: {
      type: [String],
      default: ['openai/gpt-4o-mini']
    },
    isPremium: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);
