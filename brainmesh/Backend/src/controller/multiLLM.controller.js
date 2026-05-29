
import {agentResponseService} from "../services/agentReply.service.js";


const getMultiLLMResult = async (results) => {
  
  

  const consolidationPrompt = `
    You are given multiple responses from different Large Language Models (LLMs) about the same query. Each LLM may phrase things differently or add extra details.
    Your task is to:

    Extract the common, important, and crucial facts that appear across the responses.

    Remove redundant or less important details (e.g., exaggerated praise, subjective claims like "greatest" or "legend").

    Present the final result in one concise, factual summary.
    this is different Large Language Models (LLMs) responses ${JSON.stringify(results)}
  `;


  
  const response = await agentResponseService("openai/gpt-4o-mini", consolidationPrompt);

  return response;
};

export { getMultiLLMResult };

