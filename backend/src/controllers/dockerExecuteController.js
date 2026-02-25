// // src/controllers/dockerExecuteController.js
// // ⚠️ REFERENCE ONLY - Not currently in use
// // This controller uses local Docker-based code execution
// // To use this instead of Piston, uncomment routes in execute.js

// const dockerExecutor = require("../services/codeExecutor/dockerExecutor");

// const executeCode = async (req, res) => {
//   try {
//     const { code, language, input = "" } = req.body;

    

//     if (!code || !language) {
//       return res.status(400).json({
//         success: false,
//         message: "Code and language are required",
//       });
//     }

//     // Supported languages
//     const supportedLanguages = [
//       "javascript",
//       "python",
//       "cpp",
//       "c",
//       "java",
//       "csharp",
//     ];

//     if (!supportedLanguages.includes(language)) {
//       return res.status(400).json({
//         success: false,
//         message: `Language ${language} is not supported. Supported: ${supportedLanguages.join(
//           ", "
//         )}`,
//       });
//     }

//     console.log("🐳 Executing code with Docker:", {
//       language,
//       codeLength: code.length,
//       hasInput: !!input,
//     });

//     // Ensure Docker container is running
//     // await dockerExecutor.startContainer();

//     // Execute code in Docker
//     const startTime = Date.now();
//     const result = await dockerExecutor.executeInDocker(code, language, input);
//     const executionTime = Date.now() - startTime;

   

//     res.status(200).json({
//       success: true,
//       data: { ...result, executionTime, language },
//     });

//   } catch (error) {
//     console.error("🐳 Docker Execute code error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error executing code",
//       error: error.message,
//       data: {
//         success: false,
//         output: "",
//         error: error.message,
//         executionTime: 0,
//         language: req.body.language,
//       },
//     });
//   }
// };

// /**
//  * HOW TO SWITCH TO DOCKER EXECUTION:
//  * 
//  * 1. In src/routes/execute.js, change:
//  *    const { executeCodeApi } = require("../controllers/executeController");
//  *    to:
//  *    const { executeCode } = require("../controllers/dockerExecuteController");
//  * 
//  * 2. Change route from:
//  *    router.post('/run', executeCodeApi);
//  *    to:
//  *    router.post('/run', executeCode);
//  * 
//  * 3. Make sure Docker is running:
//  *    docker ps
//  *    docker-compose -f backend/docker-compose.executor.yml up -d
//  * 
//  * 4. Restart backend:
//  *    npm run dev
//  */

// module.exports = {
//   executeCode,
// };



// const dockerExecutor = require("../services/codeExecutor/dockerExecutor");
const DockerExecutor = require("../services/codeExecutor/dockerExecutor");

const executeCode = async (req, res) => {

  
  try {
    const { code, language, input = "" } = req.body;
    console.log("Backend : " , code , " " , language , " " , input);
    
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required",
      });
    }
    const dockerExecutor = new DockerExecutor("code-executor"); // pass your container name

    const supportedLanguages = ["javascript", "python", "cpp", "c", "java", "csharp"];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: `Language ${language} not supported. Supported: ${supportedLanguages.join(", ")}`,
      });
    }

    // ✅ Log BEFORE executing code
    console.log("🐳 Executing code with Docker:", {
      language,
      codeLength: code.length,
      hasInput: !!input,
    });

    const startTime = Date.now();

    console.log("Executing code in Docker container...");
    const result = await dockerExecutor.executeInDocker(code, language, input);
    console.log(result);

    const executionTime = Date.now() - startTime;


    
    console.log("Result:", result, "ExecutionTime:", executionTime);











    // ✅ Single response
    return res.status(200).json({
      success: result.success,
      message: result.success ? "Code executed successfully" : "Code execution failed",
      data: {
        ...result,
        executionTime,
        language,
      },
    });
  } catch (error) {
    console.error("🐳 Docker Execute code error:", error);
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

module.exports = {
  executeCode,
};
