const axios = require("axios");
const logger = require("../utils/logger");

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Analyze code and provide AI assistance
 * POST /api/ai/assist
 */
exports.assistWithCode = async (req, res) => {
  try {
    const {
      message,
      fileContent,
      fileName,
      language = "javascript",
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!OPENROUTER_API_KEY) {
      return res
        .status(500)
        .json({ error: "OpenRouter API key not configured" });
    }

    // Build the context for the AI
    let systemPrompt = `You are an expert code assistant helping developers. You are helpful, concise, and provide practical solutions.`;

    let userPrompt = message;

    // If file content is provided, add it to the context
    if (fileContent) {
      userPrompt = `File: ${fileName || "unknown"} (Language: ${language})\n\n\`\`\`${language}\n${fileContent}\n\`\`\`\n\nUser question: ${message}`;
      systemPrompt += ` When analyzing code, provide specific line references and actionable suggestions. Focus on identifying bugs, performance issues, security concerns, and best practices.`;

      // Keywords to detect different types of queries
      const issueKeywords = [
        "wrong",
        "error",
        "bug",
        "issue",
        "not working",
        "failing",
        "broken",
        "help",
        "problem",
        "debug",
        "fix",
      ];
      const codeWriteKeywords = [
        "write",
        "generate",
        "create",
        "code",
        "algo",
        "algorithm",
        "function",
        "implement",
        "build",
        "make",
      ];
      const correctionKeywords = [
        "correct",
        "fix",
        "improve",
        "refactor",
        "optimize",
        "rewrite",
      ];

      const isIssueQuery = issueKeywords.some((keyword) =>
        message.toLowerCase().includes(keyword),
      );
      const isCodeWriteQuery = codeWriteKeywords.some((keyword) =>
        message.toLowerCase().includes(keyword),
      );
      const isCorrectionQuery = correctionKeywords.some((keyword) =>
        message.toLowerCase().includes(keyword),
      );

      if (isIssueQuery) {
        systemPrompt = `You are an expert code debugger and code reviewer. Analyze the provided code for bugs, errors, logic issues, and problems.
When analyzing code looking for issues, you should:
1. Identify syntax errors
2. Find logic bugs and logical flaws
3. Spot potential runtime errors
4. Detect security vulnerabilities
5. Point out performance problems
6. Suggest specific fixes with line numbers

Be direct and specific about what's wrong and how to fix it. Provide corrected code in code blocks.`;
      } else if (isCodeWriteQuery) {
        systemPrompt = `You are an expert ${language} developer. The user is asking you to write or generate code.
When writing code, you should:
1. Provide complete, working code
2. Include proper comments explaining the logic
3. Handle edge cases
4. Follow best practices for ${language}
5. Make the code efficient and readable

IMPORTANT: Wrap your entire code response in a single code block with the language specified (e.g., \`\`\`${language}....\`\`\`).
Do not split the code into multiple sections - provide it as one complete, runnable block.`;
        userPrompt = `File: ${fileName || "unknown"} (Language: ${language})\n\nUser request: ${message}\n\nProvide the complete, working code in a single code block.`;
      } else if (isCorrectionQuery && fileContent) {
        systemPrompt = `You are an expert ${language} developer specialized in code correction and optimization.
When correcting or improving code, you should:
1. Fix any bugs or errors
2. Improve performance and efficiency
3. Apply best practices
4. Make code more readable
5. Add comments where needed

Provide the corrected code that works properly. Wrap the corrected code in a code block (e.g., \`\`\`${language}....\`\`\`).
IMPORTANT: The corrected code should be a complete replacement of the above code, not just snippets.`;
      }
    }

    // Call OpenRouter API
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "openai/gpt-4-turbo-preview", // Changed to a more reliable model
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
          "X-Title": "Code IDE AI Assistant",
        },
      },
    );

    // Extract the response
    const aiResponse = response.data.choices[0].message.content;

    return res.status(200).json({
      success: true,
      response: aiResponse,
      model: response.data.model,
      usage: response.data.usage,
    });
  } catch (error) {
    logger.error("AI Assistant Error:", error.response?.data || error.message);

    // More helpful error messages
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: "OpenRouter API authentication failed. Check your API key.",
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please try again later.",
      });
    }

    return res.status(500).json({
      error: "Failed to get AI response: " + (error.message || "Unknown error"),
      details: error.response?.data?.message,
    });
  }
};

/**
 * Get AI suggestions for code quality improvements
 * POST /api/ai/suggest-improvements
 */
exports.suggestImprovements = async (req, res) => {
  try {
    const { fileContent, fileName, language = "javascript" } = req.body;

    if (!fileContent) {
      return res.status(400).json({ error: "File content is required" });
    }

    if (!OPENROUTER_API_KEY) {
      return res
        .status(500)
        .json({ error: "OpenRouter API key not configured" });
    }

    const systemPrompt = `You are an expert code reviewer. Analyze the provided code and suggest improvements for:
1. Performance optimization
2. Security vulnerabilities
3. Code clarity and readability
4. Best practices and patterns
5. Potential bugs

Format your response as a numbered list with specific recommendations.`;

    const userPrompt = `Review this ${language} code and suggest improvements:\n\n\`\`\`${language}\n${fileContent}\n\`\`\``;

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "openai/gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        top_p: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
          "X-Title": "Code IDE AI Assistant",
        },
      },
    );

    const suggestions = response.data.choices[0].message.content;

    return res.status(200).json({
      success: true,
      suggestions: suggestions,
      model: response.data.model,
    });
  } catch (error) {
    logger.error(
      "AI Suggestions Error:",
      error.response?.data || error.message,
    );
    return res.status(500).json({
      error: "Failed to get AI suggestions: " + error.message,
    });
  }
};

/**
 * Explain code functionality
 * POST /api/ai/explain
 */
exports.explainCode = async (req, res) => {
  try {
    const { fileContent, fileName, language = "javascript" } = req.body;

    if (!fileContent) {
      return res.status(400).json({ error: "File content is required" });
    }

    if (!OPENROUTER_API_KEY) {
      return res
        .status(500)
        .json({ error: "OpenRouter API key not configured" });
    }

    const systemPrompt = `You are an expert code instructor. Explain the provided code clearly and concisely.
Focus on:
1. What the code does
2. How it works step by step
3. Key functions and their purposes
4. Data flow through the application`;

    const userPrompt = `Explain this ${language} code:\n\n\`\`\`${language}\n${fileContent}\n\`\`\``;

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: "openai/gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1200,
        top_p: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
          "X-Title": "Code IDE AI Assistant",
        },
      },
    );

    const explanation = response.data.choices[0].message.content;

    return res.status(200).json({
      success: true,
      explanation: explanation,
      model: response.data.model,
    });
  } catch (error) {
    logger.error(
      "AI Explanation Error:",
      error.response?.data || error.message,
    );
    return res.status(500).json({
      error: "Failed to explain code: " + error.message,
    });
  }
};
