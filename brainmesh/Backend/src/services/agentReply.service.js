import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:8000",
    "X-Title": "AiFiesta Hub",
  },
});

// helper: check if model supports vision
const supportsVision = (llm) => {
  return (
    llm.includes("vision") ||
    llm.includes("gpt-4o") ||
    llm.includes("gpt-4-vision")
  );
};

let conversationHistory = [];
const agentResponseService = async (llm, prompt) => {
  const content = [{ type: "text", text: prompt }];

  if (supportsVision(llm)) {
    content.push({
      type: "image_url",
      image_url: {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
      },
    });
  }
  
  conversationHistory.push({ role: "user", content: prompt });
  const completion = await openai.chat.completions.create({
    model: llm,
    messages: [
      {
        role: "user",
        content,
      },
    ],
    max_tokens: 200,
  });
  
  const msg = completion.choices[0].message;
  conversationHistory.push({ role: "assistant", content: msg.content });
  return msg.content || msg // fallback if content is missing
};

export { agentResponseService};
