const DockerExecutor = require("../services/codeExecutor/dockerExecutor");
const { runJavaCode } = require("../services/codeExecutor/executors/java");
const dockerExecutor = new DockerExecutor("code-executor"); // pass your container name

const test = async (req, res) => {
    
    
    
    try {
        
        const code = "public class Main {\n    public static void main(String[] args) {\n        System.out.println(678);\n    }\n}";
        
        const result = await runJavaCode(code, "");
        console.log(result);
    
    // ✅ Single response
    return res.status(200).json({
      success: result.success,
      message: result.success ? "Code executed successfully" : "Code execution failed",
      data: {
        ...result,
        executionTime: result.executionTime,
        language: "java",
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
  test,
};




