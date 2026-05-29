const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { agentResponseService, multiLLMConsolidate, AVAILABLE_MODELS } = require('../services/agentReplyService');

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    const { title, subtitle, isMultiLLM, models } = req.body;
    const userId = req.user._id;

    const chat = new Chat({
      title: title || 'New Chat',
      subtitle: subtitle || '',
      userId,
      isMultiLLM,
      models: isMultiLLM ? models : ['openai/gpt-4o-mini']
    });

    await chat.save();
    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all chats for user
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ userId })
      .populate('messages')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single chat
exports.getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId)
      .populate('messages');

    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    res.json({ success: true, data: chat });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete chat
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findOneAndDelete({ _id: chatId, userId });

    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chatId });

    res.json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update chat title
exports.updateChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title, subtitle } = req.body;
    const userId = req.user._id;

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { title, subtitle },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    res.json({ success: true, data: chat });
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
