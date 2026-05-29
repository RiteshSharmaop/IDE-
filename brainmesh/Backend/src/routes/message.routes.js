import express from "express";
import { Message } from "../models/message.model.js";


const router = express.Router();

// Save a message
router.post("/", async (req, res) => {
  try {
    const { chatId, message } = req.body;
    const newMessage = new Message({
      chatId,
      type: message.type,
      content: message.content,
      time: message.time || new Date()
    });
    await newMessage.save();
    res.json({ success: true, message: newMessage });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
