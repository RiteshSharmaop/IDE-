import express from "express";

import { handlePrompt } from "../controller/handlePrompt.controller.js";
import { authUser } from "../middleware/auth.middelware.js";
import { createChat, deleteChat, getAllchats, getMessagesForChat } from "../controller/chat.controller.js";


const router = express.Router();


// Send a prompt in a specific chat
router.post("/:chatId/messages", authUser, handlePrompt);

// Get messages in a chat
router.get("/:chatId/messages", authUser, getMessagesForChat);

// Create new chat
router.post("/", authUser, createChat);

// Get all chats
router.get("/", authUser, getAllchats);

// Delete a chat
router.delete("/:chatId", authUser, deleteChat);


export default router;
