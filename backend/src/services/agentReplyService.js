const axios = require('axios');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Available models for multi-LLM
const AVAILABLE_MODELS = [
  'openai/gpt-4o-mini',
  'anthropic/claude-3.5-sonnet',
  'meta-llama/llama-3.1-405b-instruct',
  'mistralai/mistral-large',
  'google/gemini-2.0-flash-001',
  'baidu/cobuddy:free'
];

// Alias mapping: allow friendly names or provider-neutral names to map to actual models
const MODEL_ALIASES = {
  // Map generic 'claude' requests to Baidu CoBuddy free model
  'claude': 'baidu/cobuddy:free',
  'anthropic/claude': 'baidu/cobuddy:free',
  'claude-3.5': 'baidu/cobuddy:free'
};

const agentResponseService = async (prompt, model = 'openai/gpt-4o-mini', systemPrompt = '', history = []) => {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    // Resolve aliases to concrete model identifiers
    const resolveModel = (m) => {
      if (!m) return m;
      // exact alias
      if (MODEL_ALIASES[m]) return MODEL_ALIASES[m];
      const lower = String(m).toLowerCase();
      // catch any variant that mentions 'claude' and map to free CoBuddy
      if (lower.includes('claude')) return MODEL_ALIASES['claude'];
      return m;
    };

    const resolvedModel = resolveModel(model);
    const memoryPrompt = systemPrompt || 'You are a helpful AI assistant. Remember the conversation history, refer back to earlier messages when relevant, and preserve context across turns.';
    const recentHistory = Array.isArray(history) ? history.slice(-20) : [];

    const messages = [
      {
        role: 'system',
        content: memoryPrompt
      }
    ];

    recentHistory.forEach((message) => {
      if (!message || !message.content) return;
      const role = message.type === 'user' ? 'user' : 'assistant';
      messages.push({
        role,
        content: String(message.content)
      });
    });

    messages.push({
      role: 'user',
      content: prompt
    });

    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: resolvedModel,
        messages,
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
          'X-Title': 'BrainMesh IDE'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    if (!response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response format from API');
    }

    return {
      success: true,
      model: resolvedModel,
      content: response.data.choices[0].message.content,
      tokens: response.data.usage?.total_tokens || 0
    };
  } catch (error) {
    console.error(`Error in agentResponseService for model ${model}:`, error.message);
    return {
      success: false,
      model,
      error: error.message || 'Unknown error'
    };
  }
};

// Multi-LLM consolidation service
const multiLLMConsolidate = async (responses) => {
  try {
    if (!responses || responses.length === 0) {
      throw new Error('No responses to consolidate');
    }

    // Filter to only successful responses
    const validResponses = responses.filter(r => r.success && r.content);
    
    if (validResponses.length === 0) {
      throw new Error('No valid responses to consolidate');
    }

    // If only one response, return it directly
    if (validResponses.length === 1) {
      return {
        success: true,
        content: validResponses[0].content,
        model: 'consolidated',
        tokens: validResponses[0].tokens || 0
      };
    }

    const consolidationPrompt = `You are tasked with consolidating multiple AI responses to a user's query. 
    
Here are the responses from different models:
${validResponses.map((r, i) => `Model ${i + 1} (${r.model}): ${r.content}`).join('\n\n')}

Please create a unified, high-quality response that combines the best insights from all models. Focus on accuracy, clarity, and comprehensiveness. Remove redundancy and conflicting information.`;

    const consolidatedResponse = await agentResponseService(
      consolidationPrompt,
      'openai/gpt-4o-mini',
      'You are an expert at synthesizing information from multiple sources into coherent, accurate, comprehensive responses.'
    );

    return consolidatedResponse;
  } catch (error) {
    console.error('Error consolidating responses:', error.message);
    return {
      success: false,
      error: error.message || 'Failed to consolidate responses'
    };
  }
};

module.exports = {
  agentResponseService,
  multiLLMConsolidate,
  AVAILABLE_MODELS
};
