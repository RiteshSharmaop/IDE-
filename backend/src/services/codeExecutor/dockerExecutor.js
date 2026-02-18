
// Simplified dispatcher that delegates to per-language executor modules
const jsExec = require("./executors/javascript");
const pyExec = require("./executors/python");
const javaExec = require("./executors/java");
const cppExec = require("./executors/cpp");

class DockerExecutor {
  constructor(containerName = "code-executor") {
    this.containerName = containerName;
  }

  async executeInDocker(code, language = "javascript", input = "") {
    language = (language || "").toLowerCase();

    switch (language) {
      case "javascript":
      case "js":
        return await jsExec.runJavascriptCode(code, input);
      case "python":
      case "py":
        return await pyExec.runPythonCode(code, input);
      case "java":
        return await javaExec.runJavaCode(code, input);
      case "cpp":
      case "c++":
        return await cppExec.runCppCode(code, input);
      default:
        return { success: false, output: "", error: `Unsupported language: ${language}` };
    }
  }
}

module.exports = DockerExecutor;
