const { exec } = require("child_process");
const { promisify } = require("util");
const execPromise = promisify(exec);
const { getCommands } = require("../getCmd");

const containerName = "code-executor"; // Make sure this matches your Docker container
const timeout = 10000; // 10 seconds

exports.runPythonCode = async (code, input = "") => {
  const fileName = `code_${Date.now()}`;
  const tempFile = `/tmp/${fileName}`;
  const commands = getCommands("python", tempFile);

  try {
      // 📝 Write code to temp file using base64 encoding to preserve all characters including quotes
      const encodedCode = Buffer.from(code).toString('base64');
      const writeCmd = `docker exec -i ${containerName} bash -c "echo '${encodedCode}' | base64 -d > ${tempFile}${commands.extension}"`;
      console.log("Write Command:", writeCmd);
      await execPromise(writeCmd);

      // ⚙️ Compile step (if needed)
      if (commands.compile) {
        const compileCmd = `docker exec -i ${containerName} bash -c "${commands.compile}"`;
        console.log("Compile Command:", compileCmd);
        await execPromise(compileCmd, { timeout: timeout / 2 });
      }

      // ▶️ Execute the program, piping input if present
      const sanitizedInput = input.replace(/'/g, "'\\''").replace(/\$/g, "\\$");
      const executeCmd = `docker exec -i ${containerName} bash -c "echo '${sanitizedInput}' | ${commands.execute}"`;
      console.log("Execute Command:", executeCmd);

      const { stdout, stderr } = await execPromise(executeCmd, {
        timeout: timeout,
        maxBuffer: 1024 * 1024, // 1 MB output limit
      });

      // 🧹 Cleanup temporary files
      await execPromise(
        `docker exec -i ${containerName} bash -c "rm -f ${tempFile}* || true"`
      );

      return {
        success: !stderr || stderr.trim() === "",
        output: stdout.trim(),
        error: stderr.trim(),
      };
    } catch (error) {
      // Cleanup on failure
      try {
        await execPromise(
          `docker exec -i ${containerName} bash -c "rm -f ${tempFile}* || true"`
        );
      } catch {}

      return {
        success: false,
        output: error.stdout?.trim() || "",
        error: error.stderr?.trim() || error.message,
      };
    }
};
