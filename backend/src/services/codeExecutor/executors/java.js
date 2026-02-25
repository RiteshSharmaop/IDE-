const { exec } = require("child_process");
const { promisify } = require("util");
const execPromise = promisify(exec);
const { getCommands } = require("../getCmd");

const containerName = "code-executor";
const timeout = 15000; // 15s for compile+run

exports.runJavaCode = async (code, input = "") => {
	// detect public class name to name the file correctly (Java requires filename == public class)
	const classMatch = code.match(/public\s+class\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
	const fallbackMatch = code.match(/class\s+([A-Za-z_$][A-Za-z0-9_$]*)/);
	let className = (classMatch && classMatch[1]) || (fallbackMatch && fallbackMatch[1]) || null;
	if (!className) {
		// fallback to 'Main' if no class declaration found
		className = 'Main';
	}
	const srcPath = `/tmp/${className}.java`;
	const commands = getCommands("java", `/tmp/${className}`);

	try {
		// write code into container using base64 to avoid here-doc/quoting issues
		const b64 = Buffer.from(code, "utf8").toString("base64");
		const writeCmd = `echo '${b64}' | base64 -d | docker exec -i ${containerName} sh -c "cat > ${srcPath}"`;
		await execPromise(writeCmd, { timeout: 5000, maxBuffer: 1024 * 1024 });

		// Compile if needed
		if (commands.compile) {
			const compileCmd = `docker exec -i ${containerName} bash -c \"${commands.compile}\"`;
			await execPromise(compileCmd, { timeout: timeout / 2, maxBuffer: 1024 * 1024 });
		}

		// Execute program, piping input if present
		const trimmedInput = input || "";
		const inputB64 = Buffer.from(trimmedInput, 'utf8').toString('base64');
		const executeCmd = trimmedInput
			? `docker exec -i ${containerName} bash -c \"echo '${inputB64}' | base64 -d | ${commands.execute}\"`
			: `docker exec -i ${containerName} bash -c \"${commands.execute}\"`;

		const { stdout, stderr } = await execPromise(executeCmd, {
			timeout: timeout,
			maxBuffer: 1024 * 1024,
		});

		// Cleanup (remove source and compiled class)
		await execPromise(`docker exec -i ${containerName} bash -c "rm -f ${srcPath} /tmp/${className}.class || true"`).catch(() => {});

		return {
			success: !stderr || stderr.trim() === "",
			output: stdout.trim(),
			error: stderr.trim(),
		};
	} catch (error) {
		// Attempt cleanup
		try {
			await execPromise(`docker exec -i ${containerName} bash -c "rm -f ${srcPath} /tmp/${className}.class || true"`);
		} catch (e) {}

		return {
			success: false,
			output: error.stdout?.trim() || "",
			error: error.stderr?.trim() || error.message,
		};
	}
};

