const fs = require("fs");
const { exec } = require("child_process");
const { promisify } = require("util");
const execPromise = promisify(exec);

const containerName = "code-executor";
const timeout = 10000;

exports.runJavascriptCode = async (code, input = "") => {
  const fileName = `code_${Date.now()}.js`;
  const localTempFile = `/tmp/${fileName}`;
  const containerTempFile = `/tmp/${fileName}`;

  // write local copy for debugging
  fs.writeFileSync(localTempFile, code);

  try {
    // write code into container using base64 encoding to preserve all characters including quotes
    const encodedCode = Buffer.from(code).toString('base64');
    const writeCmd = `docker exec -i ${containerName} bash -c "echo '${encodedCode}' | base64 -d > ${containerTempFile}"`;
    await execPromise(writeCmd, { timeout: 5000, maxBuffer: 1024 * 1024 });

    // prepare execute command, piping input if provided
    const sanitizedInput = (input || "").replace(/'/g, "'\\''");
    const execCmd = sanitizedInput
      ? `docker exec -i ${containerName} bash -c "echo '${sanitizedInput}' | node ${containerTempFile}"`
      : `docker exec -i ${containerName} bash -c "node ${containerTempFile}"`;

    const { stdout, stderr } = await execPromise(execCmd, { timeout, maxBuffer: 1024 * 1024 });

    // cleanup
    try { fs.unlinkSync(localTempFile); } catch (e) {}
    await execPromise(`docker exec -i ${containerName} bash -c "rm -f ${containerTempFile} || true"`).catch(() => {});

    return { success: !stderr || stderr.trim() === "", output: stdout.trim(), error: stderr.trim() };
  } catch (error) {
    try { if (fs.existsSync(localTempFile)) fs.unlinkSync(localTempFile); } catch (e) {}
    try { await execPromise(`docker exec -i ${containerName} bash -c "rm -f ${containerTempFile} || true"`); } catch (e) {}
    return { success: false, output: error.stdout?.trim() || "", error: error.stderr?.trim() || error.message };
  }
};
