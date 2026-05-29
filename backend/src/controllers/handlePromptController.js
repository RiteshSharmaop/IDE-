const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { agentResponseService, multiLLMConsolidate, AVAILABLE_MODELS } = require('../services/agentReplyService');
const { getMultiLLMResult } = require('./multiLLM.controller');

const getRecentConversationHistory = async (chatId, limit = 20) => {
  if (!chatId) return [];
  return Message.find({ chatId })
    .sort({ createdAt: 1 })
    .limit(limit);
};

// Handle single LLM prompt
exports.handlePrompt = async (req, res) => {
  try {
    const { chatId, prompt, model } = req.body;
    console.log("Received prompt:", { chatId, prompt, model });
    const userId = req.user._id;

    const conversationHistory = await getRecentConversationHistory(chatId);

    // Save user message
    const userMessage = new Message({
      chatId,
      type: 'user',
      content: prompt,
      userId,
      model
    });
    await userMessage.save();

    // Get response from selected model using prior chat history
    const response = await agentResponseService(prompt, model, '', conversationHistory);

    if (!response.success) {
      return res.status(500).json({ success: false, error: response.error });
    }

    // Save assistant message
    const assistantMessage = new Message({
      chatId,
      type: 'assistant',
      content: response.content,
      model: response.model,
      userId
    });
    await assistantMessage.save();

    // Update chat with messages
    await Chat.findByIdAndUpdate(
      chatId,
      { $push: { messages: [userMessage._id, assistantMessage._id] } }
    );

    res.json({
      success: true,
      userMessage,
      assistantMessage
    });
  } catch (error) {
    console.error('Error handling prompt:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};



// Handle multi-LLM prompt
// exports.handleMultiLLMPrompt = async (req, res) => {
//   try {
//     const { chatId, prompt, models } = req.body;
//     console.log("Received multi-LLM prompt:", { chatId, prompt, models });
//     const userId = req.user._id;

//     // Enforce subscription for multi-LLM access
//     if (!req.user || req.user.plan !== 'premium') {
//       return res.status(402).json({
//         success: false,
//         error: 'Multi-LLM access requires an active premium subscription.',
//         paymentRequired: true,
//         redirectUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment`
//       });
//     }

//     // Validate input
//     if (!chatId || !prompt || !models || models.length === 0) {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Missing required fields: chatId, prompt, and non-empty models array' 
//       });
//     }

//     // Validate chat and multi-LLM status
//     const chat = await Chat.findById(chatId);

//     if (!chat) {
//       return res.status(404).json({ success: false, error: 'Chat not found' });
//     }

//     if (!chat.isMultiLLM) {
//       return res.status(400).json({ success: false, error: 'Multi-LLM not enabled for this chat' });
//     }

//     // Save user message
//     const userMessage = new Message({
//       chatId,
//       type: 'user',
//       content: prompt,
//       userId,
//       isMultiLLM: true
//     });
//     await userMessage.save();

//     // Get responses from all models in parallel
//     const modelPromises = models.map(model =>
//       agentResponseService(prompt, model).catch(err => ({
//         success: false,
//         model,
//         error: err.message
//       }))
//     );

//     const responses = await Promise.all(modelPromises);
//     const successfulResponses = responses.filter(r => r.success);

//     if (successfulResponses.length === 0) {
//       return res.status(500).json({ 
//         success: false, 
//         error: 'All model requests failed',
//         details: responses
//       });
//     }

//     console.log(`Got ${successfulResponses.length}/${models.length} successful responses`);

//     // Consolidate responses
//     const consolidatedResponse = await multiLLMConsolidate(successfulResponses);

//     if (!consolidatedResponse.success) {
//       console.error('Consolidation failed:', consolidatedResponse.error);
//       return res.status(500).json({ 
//         success: false, 
//         error: 'Failed to consolidate responses',
//         details: consolidatedResponse.error
//       });
//     }

//     // Save assistant message with multi-LLM data
//     const assistantMessage = new Message({
//       chatId,
//       type: 'assistant',
//       content: consolidatedResponse.content,
//       isMultiLLM: true,
//       multiLLMResponses: successfulResponses.map(r => ({
//         model: r.model,
//         content: r.content,
//         tokens: r.tokens
//       })),
//       consolidatedResponse: consolidatedResponse.content,
//       userId
//     });
//     await assistantMessage.save();

//     // Update chat
//     await Chat.findByIdAndUpdate(
//       chatId,
//       { $push: { messages: [userMessage._id, assistantMessage._id] } }
//     );

//     res.json({
//       success: true,
//       userMessage,
//       assistantMessage,
//       multiLLMResponses: successfulResponses
//     });
//   } catch (error) {
//     console.error('Error handling multi-LLM prompt:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

exports.handleMultiLLMPrompt = async (req, res) => {

  const { chatId, prompt, models } = req.body;
  console.log("Received multi-LLM prompt:", { chatId, prompt, models });
  const userId = req.user._id;
  if (!chatId || !prompt || !models || models.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: chatId, prompt, and non-empty models array'
    });
  }
  console.log("start handling multi-LLM prompt... ");

  try {
    const conversationHistory = await getRecentConversationHistory(chatId);

    // Save user message
    console.log("User message saving...");
    const userMessage = await Message.create({
      chatId,
      type: "user",
      content: prompt,
      userId,
      isMultiLLM: true
    });
    console.log("User message saved");

    console.log("Fetching responses from models...");
    // Get responses from all models in parallel using prior chat history
    const modelPromises = models.map((m) =>
      console.log(`Requesting response from model: ${m}`) ||
      agentResponseService(prompt, m, '', conversationHistory).catch((err) => ({ success: false, model: m, error: err.message }))
    );

    const responses = await Promise.all(modelPromises);
    const allResponses = responses.map((r) => ({
      model: r?.model || null,
      success: !!(r && r.success),
      content: r?.content || null,
      tokens: r?.tokens || 0,
      error: r?.error || null
    }));

    const successfulResponses = allResponses.filter((r) => r.success && r.content);

    console.log(`Got ${successfulResponses.length}/${models.length} successful responses`);

    // Consolidate responses using the consolidation service (try/catch to allow fallback)
    let consolidated = null;
    try {
      consolidated = await multiLLMConsolidate(successfulResponses);
    } catch (e) {
      console.error('Consolidation threw error:', e.message);
      consolidated = { success: false, error: e.message };
    }

    // Fallback: if consolidation failed but we have successful responses, join them
    let finalContent = null;
    if (consolidated && consolidated.success && consolidated.content) {
      finalContent = consolidated.content;
    } else if (successfulResponses.length > 0) {
      finalContent = successfulResponses.map((r, i) => `Response ${i + 1} (${r.model}):\n${r.content}`).join('\n\n---\n\n');
    } else {
      finalContent = null;
    }

    const assistantMessage = await Message.create({
      chatId,
      type: 'assistant',
      content: finalContent,
      model: 'multi-llm',
      isMultiLLM: true,
      multiLLMResponses: allResponses,
      consolidatedResponse: consolidated && consolidated.content ? consolidated.content : null,
      userId
    });

    // Update chat with message IDs
    await Chat.findByIdAndUpdate(chatId, { $push: { messages: [userMessage._id, assistantMessage._id] } });

    return res.status(200).json({ success: true, userMessage, assistantMessage, multiLLMResponses: allResponses, consolidated: consolidated });
  } catch (err) {
    console.error("Error in MultiLLM processing:", err.message);
    return res.status(401).json({ success: false, error: "Insufficient Credits❌❌" });
  }
};


// Get available models
exports.getAvailableModels = (req, res) => {
  res.json({ success: true, models: AVAILABLE_MODELS });
};
