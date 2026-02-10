import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const aiApi = {
  /**
   * Get AI assistance for code
   * @param {string} message - User's question or request
   * @param {string} fileContent - The code content to analyze
   * @param {string} fileName - Name of the file being analyzed
   * @param {string} language - Programming language of the file
   * @returns {Promise}
   */
  assistWithCode: async (
    message,
    fileContent = null,
    fileName = "code",
    language = "javascript",
  ) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/assist`, {
        message,
        fileContent,
        fileName,
        language,
      });
      return response.data;
    } catch (error) {
      console.error("AI Assistant Error:", error);
      throw error;
    }
  },

  /**
   * Get improvement suggestions for code
   * @param {string} fileContent - The code to review
   * @param {string} fileName - Name of the file
   * @param {string} language - Programming language
   * @returns {Promise}
   */
  suggestImprovements: async (
    fileContent,
    fileName = "code",
    language = "javascript",
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ai/suggest-improvements`,
        {
          fileContent,
          fileName,
          language,
        },
      );
      return response.data;
    } catch (error) {
      console.error("AI Suggestions Error:", error);
      throw error;
    }
  },

  /**
   * Get explanation of code
   * @param {string} fileContent - The code to explain
   * @param {string} fileName - Name of the file
   * @param {string} language - Programming language
   * @returns {Promise}
   */
  explainCode: async (
    fileContent,
    fileName = "code",
    language = "javascript",
  ) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/explain`, {
        fileContent,
        fileName,
        language,
      });
      return response.data;
    } catch (error) {
      console.error("AI Explanation Error:", error);
      throw error;
    }
  },
};

export default aiApi;
