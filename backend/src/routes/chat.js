const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createChat,
  getUserChats,
  getChat,
  deleteChat,
  updateChat
} = require('../controllers/chatController');

// All routes require authentication
router.use(protect);

// Chat CRUD operations
router.post('/', createChat);
router.get('/', getUserChats);
router.get('/:chatId', getChat);
router.put('/:chatId', updateChat);
router.delete('/:chatId', deleteChat);

module.exports = router;
