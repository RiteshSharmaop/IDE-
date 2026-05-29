// controllers/chat.controller.js
import { getMultiLLMResult } from "./multiLLM.controller.js";
import { agentResponseService } from "../services/agentReply.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Chat } from "../models/chats.model.js";
import { Message } from "../models/message.model.js";

const handlePrompt = async (req, res) => {
    const { chatId } = req.params;
    const { prompt, selectedLLMs, isMultiLLM } = req.body;

    if (!prompt) {
        return res.status(400).json(new ApiError(400, "Prompt is required"));
    }

    const userId = req.user._id;
    try {
        // ✅ 1. Save the user message first

        await Message.create({
          chatId,
          type: "user",
          content: prompt,
        });



        // --- Normal LLM responses ---
        const resultsArray = await Promise.all(
          selectedLLMs.map(async (llm) => {
            try {
              const response = await agentResponseService(llm, prompt);

              // Save AI response for each LLM
              await Message.create({
                chatId,
                type: "ai",
                content: response,
                model: llm,
              });



              return [llm, response];
            } catch (err) {
              return res.status(401).json(new ApiError(401, "Inshufficient Credits❌❌"));
            }
          })
        );

        const results = Object.fromEntries(resultsArray);

        // --- MultiLLM consolidated response ---
        let multiLLMResponse = null;

        try{

          if (isMultiLLM) {
              multiLLMResponse = await getMultiLLMResult(results);

              // Save consolidated MultiLLM response
              await Message.create({
                chatId,
                type: "ai",
                content: multiLLMResponse,
                model: "multi-llm",
                isMultiLLM: true,
              });


              return res
                  .status(200)
                  .json(
                      new ApiResponse(
                          200,
                          { results, multiLLMResponse },
                          "Chat Successfully"
                      )
                  );
          }
        }catch(err){
          console.error("Error in MultiLLM processing:", err.message);
          return res.status(401).json(new ApiError(401, "Inshufficient Credits❌❌"));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, { results }, "Chat Successfully"));
    } catch (err) {
        console.error("Unexpected error:", err.message);
        return res.status(500).json(new ApiError(500, "Chat Failed"));
    }
};

const loadChats = async (req, res) => {
    const chats = await Chat.find({ userId: req.params.userId });
    res.json({ chats });
};

export { handlePrompt, loadChats };
