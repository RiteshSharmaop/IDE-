const { exec } = require("child_process");
const { promisify } = require("util");
const { runPythonCode } = require("./executors/python");
const { runJavascriptCode } = require("./executors/javascript");
const execPromise = promisify(exec);

class DockerExecutor {
  constructor() {
    this.containerName = "code-executor";
    this.timeout = 10000; // 10 seconds
  }

  // ✅ Check if the container is already running
  async checkContainer() {
    try {
      const { stdout } = await execPromise(
        `docker ps --filter "name=${this.containerName}" --format "{{.Names}}"`
      );
      return stdout.trim() === this.containerName;
    } catch {
      return false;
    }
  }

  // ✅ Start the container in background if not running
  async startContainer() {
    console.log("Ensuring Docker container is running...");

    const isRunning = await this.checkContainer();
    if (!isRunning) {
      console.log("Container not running — starting now...");
      // Use 'up -d' to start the container in detached mode
      await execPromise("docker-compose -f docker-compose.executor.yml up -d");

      // Wait a bit to let Docker initialize
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log("Docker container is running.");
  }

  // ✅ Execute code safely inside Docker
  async executeInDocker(code, language, input = "") {
    await this.startContainer();

    let result;
    let output, error, success;
    
    switch (language) {
      case "python":
        
        result = await runPythonCode(code, input);
        break;

      case "javascript":
        result = await runJavascriptCode(code, input);
        break;

      // case "java":
      //   result = await DockerExecutor.executeInDocker(code, "java", input);
      //   break;

      // Add more languages as needed
      default:
        console.log(`Language ${language} not supported`);
        result = { success: false, output: "", error: "Unsupported language" };
    }

    // Store returned data in variables
    output = result.output;
    error = result.error;
    success = result.success;

    console.log("Success:", success);
    console.log("Output:", output);
    console.log("Error:", error);
    return { success, output, error };
  }

  // ✅ Language-specific compile and run commands
  getCommands(language, tempFile) {
    const commands = {
      javascript: {
        extension: ".js",
        execute: `node ${tempFile}.js`,
      },
      python: {
        extension: ".py",
        execute: `python3 ${tempFile}.py`,
      },
      cpp: {
        extension: ".cpp",
        compile: `g++ ${tempFile}.cpp -o ${tempFile}.out`,
        execute: `./${tempFile}.out`,
      },
      c: {
        extension: ".c",
        compile: `gcc ${tempFile}.c -o ${tempFile}.out`,
        execute: `./${tempFile}.out`,
      },
      java: {
        extension: ".java",
        compile: `javac ${tempFile}.java`,
        execute: `java -cp /tmp $(basename ${tempFile})`,
      },
      csharp: {
        extension: ".cs",
        compile: `mcs ${tempFile}.cs -out:${tempFile}.exe`,
        execute: `mono ${tempFile}.exe`,
      },
    };

    return commands[language] || commands.javascript;
  }
}

module.exports = new DockerExecutor();
