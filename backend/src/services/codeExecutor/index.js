const { exec } = require("child_process");
const { promisify } = require("util");
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

    const fileName = `code_${Date.now()}`;
    const tempFile = `/tmp/${fileName}`;
    const commands = this.getCommands(language, tempFile);

    try {
      // 📝 Write code to temp file using echo (simplified approach)
      const sanitizedCode = code
        .replace(/"/g, '\\"')
        .replace(/\$/g, "\\$")
        .replace(/`/g, "\\`");
      const writeCmd = `docker exec -i ${this.containerName} bash -c "echo \\"${sanitizedCode}\\" > ${tempFile}${commands.extension}"`;
      console.log("Write Command:", writeCmd);
      await execPromise(writeCmd);

      // ⚙️ Compile step (if needed)
      if (commands.compile) {
        const compileCmd = `docker exec -i ${this.containerName} bash -c "${commands.compile}"`;
        console.log("Compile Command:", compileCmd);
        await execPromise(compileCmd, { timeout: this.timeout / 2 });
      }

      // ▶️ Execute the program, piping input if present
      const sanitizedInput = input.replace(/'/g, "'\\''").replace(/\$/g, "\\$");
      const executeCmd = `docker exec -i ${this.containerName} bash -c "echo '${sanitizedInput}' | ${commands.execute}"`;
      console.log("Execute Command:", executeCmd);

      const { stdout, stderr } = await execPromise(executeCmd, {
        timeout: this.timeout,
        maxBuffer: 1024 * 1024, // 1 MB output limit
      });

      // 🧹 Cleanup temporary files
      // await execPromise(
      //   `docker exec -i ${this.containerName} bash -c "rm -f ${tempFile}* || true"`
      // );

      return {
        success: !stderr || stderr.trim() === "",
        output: stdout.trim(),
        error: stderr.trim(),
      };
    } catch (error) {
      // Cleanup on failure
      try {
        await execPromise(
          `docker exec -i ${this.containerName} bash -c "rm -f ${tempFile}* || true"`
        );
      } catch {}

      return {
        success: false,
        output: error.stdout?.trim() || "",
        error: error.stderr?.trim() || error.message,
      };
    }
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
