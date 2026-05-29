import { Chat } from "../models/chats.model.js";
import { Message } from "../models/message.model.js";


const createChat = async (req, res) => {
  try {
    const { title, subtitle } = req.body;
    const userId = req.user._id; // Assuming auth middleware sets req.user
    const chat = new Chat({ title, subtitle, userId });
    await chat.save();
    res.json({ success: true, chat });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


const getAllchats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}


const getMessagesForChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId: req.params.chatId }).sort({ time: 1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



const deleteChat =  async (req, res) => {
  try {
    const { chatId } = req.params;
    const  delChat = await Chat.findByIdAndDelete(chatId);
    if(!delChat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }
    const delMessages = await Message.deleteMany({ chatId });
    
    res.json({ success: true, message: "Chat deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}



// const shareChat = async (req, res) => {
//   const { chatId } = req.body;

//   // Fetch messages from DB
//   const chat = await Chat.findById(chatId);

//   if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

//   // Create share entry
//   const shareId = crypto.randomBytes(8).toString("hex");

//   await SharedChat.create({
//     shareId,
//     chatId,
//     messages: chat.messages,
//   });

//   res.json({
//     success: true,
//     url: `${process.env.FRONTEND_URL}/share/${shareId}`,
//   });
// }

export {
    createChat,
    getAllchats,
    getMessagesForChat,
    deleteChat
};