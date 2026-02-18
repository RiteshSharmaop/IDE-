const axios = require('axios');

exports.askAI = async (req, res) => {
  try {
    const { question, codeContext = '', language = 'javascript' } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Question is required',
      });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'LLM API key not configured',
      });
    }

    // Build prompt with code context
    let systemPrompt = `You are a helpful code assistant for an IDE. Keep responses concise and focused.

FORMATTING RULES (VERY IMPORTANT):
1. **Use bold text** for:
   - Key concepts and technical terms
   - Method/function names
   - Important keywords
   - Solutions and main ideas

2. *Use italic text* for:
   - File names
   - Variable names
   - Emphasis on important points

3. **Always use bullet points for:**
   - Lists of options
   - Key features
   - Multiple approaches
   - Prerequisites

4. **Use numbered lists for:**
   - Step-by-step instructions
   - Sequential processes
   - Order-dependent operations
   - Explanations with sequence

5. **Code blocks:**
   - Always wrap code with triple backticks and language name
   - Example: \`\`\`javascript
   - Keep code snippets short and functional
   - Add brief comments for clarity

6. **Response structure:**
   - Start with a brief answer
   - Use bullets or numbers for main points
   - Include code examples with proper formatting
   - End with a short conclusion

7. **Keep it concise:**
   - No lengthy paragraphs
   - Direct and to the point
   - Remove unnecessary explanations
   - Maximum clarity`;

    let userPrompt = question;

    if (codeContext) {
      userPrompt = `Current code in ${language}:\n\`\`\`${language}\n${codeContext}\n\`\`\`\n\nQuestion: ${question}`;
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo', // or 'openai/gpt-4-turbo-preview' for better quality
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
          'X-Title': 'IDE AI Assistant',
        },
      }
    );

    const answer = response.data.choices[0].message.content;

    return res.status(200).json({
      success: true,
      answer,
      model: response.data.model,
    });
  } catch (error) {
    console.error('LLM API Error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.error?.message || 'Failed to get AI response',
    });
  }
};
