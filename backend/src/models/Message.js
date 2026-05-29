const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true
    },
    type: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    model: {
      type: String,
      default: 'gpt-3.5-turbo'
    },
    isMultiLLM: {
      type: Boolean,
      default: false
    },
    multiLLMResponses: [{
      model: String,
      content: String,
      tokens: Number
    }],
    consolidatedResponse: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
