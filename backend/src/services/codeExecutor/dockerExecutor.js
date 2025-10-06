const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

class DockerExecutor {
  constructor() {
    this.containerName = 'code-executor';
    this.timeout = 10000;
  }

  async executeInDocker(code, language, input = '') {
    const tempFile = `/tmp/code_${Date.now()}`;
    const commands = this.getCommands(language, tempFile);

    try {
      // Write code to temp file in container
      await execPromise(
        `docker exec ${this.containerName} bash -c "echo '${code.replace(/'/g, "'\\''")}' > ${tempFile}${commands.extension}"`
      );

      // Compile if needed
      if (commands.compile) {
        const compileCmd = `docker exec ${this.containerName} bash -c "${commands.compile}"`;
        await execPromise(compileCmd, { timeout: this.timeout / 2 });
      }

      // Execute
      const executeCmd = `docker exec ${this.containerName} bash -c "echo '${input}' | ${commands.execute}"`;
      const { stdout, stderr } = await execPromise(executeCmd, {
        timeout: this.timeout,
        maxBuffer: 1024 * 1024
      });

      // Cleanup
      await execPromise(
        `docker exec ${this.containerName} bash -c "rm -f ${tempFile}* || true"`
      );

      return {
        success: !stderr || stderr.trim() === '',
        output: stdout,
        error: stderr
      };

    } catch (error) {
      // Cleanup on error
      try {
        await execPromise(
          `docker exec ${this.containerName} bash -c "rm -f ${tempFile}* || true"`
        );
      } catch {}

      return {
        success: false,
        output: error.stdout || '',
        error: error.stderr || error.message
      };
    }
  }

  getCommands(language, tempFile) {
    const commands = {
      javascript: {
        extension: '.js',
        execute: `node ${tempFile}.js`
      },
      python: {
        extension: '.py',
        execute: `python3 ${tempFile}.py`
      },
      cpp: {
        extension: '.cpp',
        compile: `g++ ${tempFile}.cpp -o ${tempFile}.out`,
        execute: `${tempFile}.out`
      },
      c: {
        extension: '.c',
        compile: `gcc ${tempFile}.c -o ${tempFile}.out`,
        execute: `${tempFile}.out`
      },
      java: {
        extension: '.java',
        compile: `javac ${tempFile}.java`,
        execute: `java -cp /tmp Main`
      },
      csharp: {
        extension: '.cs',
        compile: `mcs ${tempFile}.cs -out:${tempFile}.exe`,
        execute: `mono ${tempFile}.exe`
      }
    };

    return commands[language] || commands.javascript;
  }

  async checkContainer() {
    try {
      const { stdout } = await execPromise(
        `docker ps --filter name=${this.containerName} --format "{{.Names}}"`
      );
      return stdout.trim() === this.containerName;
    } catch {
      return false;
    }
  }

  async startContainer() {
    const isRunning = await this.checkContainer();
    if (!isRunning) {
      await execPromise('docker-compose -f docker-compose.executor.yml up -d');
      // Wait for container to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

module.exports = new DockerExecutor();