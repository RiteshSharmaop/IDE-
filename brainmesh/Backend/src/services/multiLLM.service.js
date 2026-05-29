import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import agentResponseService from "../services/agentReply.service.js";

const multiLLM = asyncHandler(async (req, res) => {
    const { prompt, selectedLLMs } = req.body;
    if (!prompt || !selectedLLMs || !Array.isArray(selectedLLMs)) {
        return res
            .status(401)
            .json(new ApiError(401, "Either prompt or selectedLLMs is empty"));
    }
    try {
        // Run all LLM calls in parallel
        const resultsArray = await Promise.all(
            selectedLLMs.map(async (llm) => {
                try {
                    const response = await agentResponseService(llm, prompt);
                    return [llm, response];
                } catch (err) {
                    console.error(
                        `${llm} failed:`,
                        err.response?.data || err.message
                    );
                    return [llm, `Error: ${err.message}`];
                }
            })
        );

        // Step 1: Convert results object into readable string
        const formattedResponses = Object.entries(results)
        .map(([llm, response]) => `${llm}: ${response}`)
        .join("\n\n");

        // Step 2: Create the consolidation prompt
        const consolidationPrompt = `
            You are an AI tasked with consolidating responses from multiple language models.
            Your job is to:
            1. Identify overlapping information and ensure factual accuracy.
            2. Extract the most important and relevant details.
            3. Remove redundancies, contradictions, and filler text.
            4. Present the final response in a clear, concise, and well-structured way.

            Here are the responses from the different models:
            ${formattedResponses}

            Now, provide a single high-quality consolidated answer:
            `;

            const response = await agentResponseService("openai/gpt-4o-mini", consolidationPrompt);
            if(!response){
                return res
                    .status(500)
                    .json(new ApiError(500, "Consolidation failed"));
            }

        return res
            .status(200)
            .json(new ApiResponse(200, response, "Chat Successfully"));
    } catch (err) {
        console.error("Unexpected error:", err.response?.data || err.message);
        return res
            .status(500)
            .json(new ApiError(500, err.message || "Chat Failed"));
    }
});

export { multiLLM };
