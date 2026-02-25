
// src/controllers/executeController.js
// 🌐 PISTON API VERSION - Currently Active
// Uses remote Piston API for code execution
// For Docker-based local execution, see dockerExecuteController.js (reference only)

const axios = require("axios");

// Piston API configuration
const PISTON_API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
});

const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  typescript: "5.0.3",
  python: "3.10.0",
  java: "15.0.2",
  csharp: "6.12.0",
  cpp: "10.2.0",
  c: "10.2.0",
};

exports.executeCodeApi = async (req, res) => {
  try {
    const { code, language, input = "" } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required",
      });
    }
    
    // Supported languages
    const supportedLanguages = [
      "javascript",
      "python",
      "cpp",
      "c",
      "java",
      "csharp",
      "typescript",
    ];
    
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: `Language ${language} is not supported. Supported: ${supportedLanguages.join(", ")}`,
      });
    }

    if (!LANGUAGE_VERSIONS[language]) {
      return res.status(400).json({
        success: false,
        message: `Language version not found for ${language}`,
      });
    }

    console.log("Executing code with Piston:", { language, codeLength: code.length, hasInput: !!input });

    const startTime = Date.now();

    try {
      // Call Piston API
      const response = await PISTON_API.post("/execute", {
        language,
        version: LANGUAGE_VERSIONS[language],
        files: [{ content: code }],
        stdin: input || "",
        timeout: 10,
      });

      const executionTime = Date.now() - startTime;

      // Extract output from Piston response
      const pistonResult = response.data.run;

      return res.json({
        success: true,
        data: {
          success: true,
          output: pistonResult.output || "",
          error: pistonResult.stderr || pistonResult.error || "",
          executionTime,
          language,
        },
      });
    } catch (pistonError) {
      console.error("Piston API Error:", {
        status: pistonError.response?.status,
        message: pistonError.response?.data?.message || pistonError.message,
      });

      // Handle specific Piston errors
      if (pistonError.response?.status === 401) {
        return res.status(503).json({
          success: false,
          message: "Piston API is temporarily unavailable. Please try again later.",
          error: "API_UNAVAILABLE",
        });
      }

      if (pistonError.response?.status === 429) {
        return res.status(429).json({
          success: false,
          message: "Too many requests to Piston API. Please wait and try again.",
          error: "RATE_LIMIT",
        });
      }

      throw pistonError;
    }
  } catch (error) {
    console.error("Execute code error:", error.message);
    
    const executionTime = Date.now() - Date.now();

    return res.status(500).json({
      success: false,
      message: "Error executing code",
      error: error.message,
      data: {
        success: false,
        output: "",
        error: error.message,
        executionTime: 0,
        language: req.body.language,
      },
    });
  }
};


exports.test = async (req, res) => {
  try {
    const testCode = `console.log('Hello, World!')`;
    const testLanguage = "javascript";

    console.log("Running test with Piston API...");

    const response = await PISTON_API.post("/execute", {
      language: testLanguage,
      version: LANGUAGE_VERSIONS[testLanguage],
      files: [{ content: testCode }],
      stdin: "",
      timeout: 10,
    });

    const pistonResult = response.data.run;

    res.status(200).json({
      success: true,
      data: {
        success: true,
        output: pistonResult.output || "",
        error: pistonResult.stderr || "",
        language: testLanguage,
      },
      message: "Test successful",
    });
  } catch (error) {
    console.error("Test error:", error.message);
    res.status(500).json({
      success: false,
      message: "Test failed",
      error: error.message,
    });
  }
};

/**
 * ========================================
 * SWITCHING BETWEEN EXECUTION ENGINES
 * ========================================
 * 
 * CURRENT: Piston API (Remote)
 * - Pros: No setup, works from anywhere, reliable
 * - Cons: Requires internet, rate-limited
 * 
 * ALTERNATIVE: Docker (Local)
 * - Pros: No internet needed, unlimited, faster
 * - Cons: Requires Docker setup, local only
 * 
 * TO SWITCH TO DOCKER:
 * 1. Go to src/routes/execute.js
 * 2. Replace executeController with dockerExecuteController
 * 3. Ensure Docker is running: docker ps
 * 4. Start containers: docker-compose -f docker-compose.executor.yml up -d
 * 5. Restart backend: npm run dev
 * 
 * TO SWITCH BACK TO PISTON:
 * 1. Go to src/routes/execute.js
 * 2. Replace dockerExecuteController with executeController
 * 3. Restart backend: npm run dev
 * ========================================
 */
