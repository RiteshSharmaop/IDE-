import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export const askAI = async (question, codeContext = '', language = 'javascript') => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/llm/ask`,
      {
        question,
        codeContext,
        language,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('LLM API Error:', error);
    throw error;
  }
};
