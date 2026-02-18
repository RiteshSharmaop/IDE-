const fs = require("fs");
const { exec, spawn } = require("child_process");
const { promisify } = require("util");
const path = require("path");

const execPromise = promisify(exec);

class DockerExecutor {
  /**
   * @param {string} containerName - Name of the running Docker container
   * @param {string} containerTempDir - Directory inside container to store temp files
   */
  constructor(containerName, containerTempDir = "/execution") {
    this.containerName = containerName; // e.g., "code-executor"
    this.containerTempDir = containerTempDir; // inside container
    this.localTempDir = "/tmp"; // local temp files
  }

  /**
   * Executes code in Docker
   * @param {string} code - The code to execute
   * @param {string} language - Programming language (currently only "javascript")
   * @param {string} input - Optional input to pass to the program
   * @returns {Promise<{ success: boolean, output: string, error: string, executionTime: number, language: string }>}
   */
  async executeInDocker(code, language = "javascript", input = "") {
    if (language.toLowerCase() !== "javascript") {
      throw new Error("Only JavaScript is supported for now.");
    }

    const fileName = `code_${Date.now()}.js`;
    const localTempFile = path.join(this.localTempDir, fileName);
    // Write code to local temp file (kept for debugging/backup)
    fs.writeFileSync(localTempFile, code);
    // Use container /tmp to avoid writing into mounted /execution (which triggers nodemon)
    const containerTempFile = path.posix.join('/tmp', fileName);

    const startTime = Date.now();

    try {
      
      // Stream the code into the container's /tmp to avoid touching the mounted /execution folder
      console.log("[dockerExecutor] streaming code into container:/tmp ->", containerTempFile);
      await new Promise((resolve, reject) => {
        const cp = spawn("docker", ["exec", "-i", this.containerName, "sh", "-c", `cat > ${containerTempFile}`]);
        cp.on("close", (code) => {
          console.log("[dockerExecutor] docker exec cat close code:", code);
          return code === 0 ? resolve() : reject(new Error("docker exec cat failed"));
        });
        cp.on("error", (err) => {
          console.error("[dockerExecutor] docker exec cat error:", err && err.message ? err.message : err);
          reject(err);
        });

        // write the code into the container process stdin
        try {
          cp.stdin.write(code);
        } catch (e) {
          console.error('[dockerExecutor] error writing code to cp.stdin', e && e.message ? e.message : e);
        }
        try { cp.stdin.end(); } catch (e) {}
      });
      
      // Prepare execution command
      let execCmd = `node ${containerTempFile}`;
      if (input) {
        // Sanitize and pipe input
        const sanitizedInput = input.replace(/'/g, "'\\''");
        execCmd = `echo '${sanitizedInput}' | ${execCmd}`;
      }
      
      // Execute code inside Docker using spawn to support stdin and robust timeout handling
      const timeoutMs = 10000; // match previous timeout
      
      const dockerArgs = ["exec", "-i", this.containerName, "node", containerTempFile];

      console.log("[dockerExecutor] docker exec args:", dockerArgs.join(" "));
      console.log("[dockerExecutor] localTempFile exists:", fs.existsSync(localTempFile), "->", localTempFile);
      console.log("[dockerExecutor] containerTempFile:", containerTempFile);

      console.log("---------------------------------------------------------------");
      const dockerProc = spawn("docker", dockerArgs, { stdio: ["pipe", "pipe", "pipe"] });
      // console.log("Executing in Docker with command:", `docker ${dockerArgs.join(" ")}`);
      // // console.log(dockerProc);
      


      let stdout = "";
      let stderr = "";
      let timedOut = false;

      dockerProc.stdout.on("data", (data) => {
        const s = data.toString();
        stdout += s;
        console.log("[dockerExecutor] docker stdout chunk:", s);
      });
      dockerProc.stderr.on("data", (data) => {
        const s = data.toString();
        stderr += s;
        console.error("[dockerExecutor] docker stderr chunk:", s);
      });

      dockerProc.on("error", (err) => {
        console.error("[dockerExecutor] dockerProc error:", err && err.message ? err.message : err);
        stderr += (err && err.message) || String(err);
      });

      if (input) {
        try {
          console.log("[dockerExecutor] writing input to dockerProc");
          dockerProc.stdin.write(input + "\n");
        } catch (e) {
          console.error("[dockerExecutor] error writing stdin:", e && e.message ? e.message : e);
        }
      }
      try { dockerProc.stdin.end(); } catch (e) { console.error("[dockerExecutor] stdin.end error:", e && e.message ? e.message : e); }

      const timer = setTimeout(() => {
        timedOut = true;
        console.error("[dockerExecutor] docker exec timeout, killing process");
        try { dockerProc.kill("SIGKILL"); } catch (e) { console.error("[dockerExecutor] kill error:", e && e.message ? e.message : e); }
      }, timeoutMs);

      const exitCode = await new Promise((resolve) => {
        dockerProc.on("close", (code) => {
          clearTimeout(timer);
          resolve(code);
        });
      });

      // Logs kept for debugging
      console.log("docker exec exit code:", exitCode);
      console.log("output :", stdout);
      console.log("Error :", stderr);
  
      // Cleanup temp files
      try { fs.unlinkSync(localTempFile); } catch (e) {}
      // remove container temp file using spawn
      await new Promise((resolve) => {
        const rm = spawn("docker", ["exec", this.containerName, "rm", "-f", containerTempFile]);
        rm.on("close", () => resolve());
        rm.on("error", () => resolve());
      });

      return {
        success: !stderr || stderr.trim() === "",
        output: stdout.trim(),
        error: stderr.trim(),
        executionTime: Date.now() - startTime,
        language,
      };
    } catch (error) {
      // Cleanup local file on failure
      if (fs.existsSync(localTempFile)) fs.unlinkSync(localTempFile);

      // Attempt to remove container temp file
      try {
        await execPromise(`docker exec ${this.containerName} rm -f ${containerTempFile}`);
      } catch {}

      return {
        success: false,
        output: error.stdout?.trim() || "",
        error: error.stderr?.trim() || error.message,
        executionTime: Date.now() - startTime,
        language,
      };
    }
  }
}

module.exports = DockerExecutor;
