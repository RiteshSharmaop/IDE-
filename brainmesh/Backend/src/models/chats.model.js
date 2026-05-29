import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: "New Conversation" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

export const Chat = mongoose.model("Chat", ChatSchema);
