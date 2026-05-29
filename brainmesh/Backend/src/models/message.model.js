import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
  type: {
    type: String,
    enum: ["user", "ai"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  model: {
    type: String, // e.g. "gpt-4", "claude", "gemini", "multi-llm"
    default: null,
  },
  isMultiLLM: {
    type: Boolean,
    default: false,
  },
  time: {
    type: Date,
    default: Date.now,
  },
});

export const Message = mongoose.model("Message", MessageSchema);
