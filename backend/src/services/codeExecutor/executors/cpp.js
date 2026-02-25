

const { exec } = require("child_process");
const { promisify } = require("util");
const execPromise = promisify(exec);
const { getCommands } = require("../getCmd");

const containerName = "code-executor";
const timeout = 15000;

exports.runCppCode = async (code, input = "") => {
	const fileName = `code_${Date.now()}`;
	const srcPath = `/tmp/${fileName}.cpp`;
	const outPath = `/home/coderunner/${fileName}.out`;
	const commands = getCommands("cpp", `/tmp/${fileName}`);

	try {
		// write code into container using base64 to avoid quoting/here-doc pitfalls
		const b64 = Buffer.from(code, "utf8").toString("base64");
		const writeCmd = `echo '${b64}' | base64 -d | docker exec -i ${containerName} sh -c "cat > ${srcPath}"`;
		console.log("[cppExec] writeCmd:", writeCmd.slice(0, 200));
		await execPromise(writeCmd, { timeout: 5000, maxBuffer: 1024 * 1024 });

		// compile
		if (commands.compile) {
			// compile to an executable location that is not mounted noexec (/home/coderunner)
			const compileCmd = `docker exec -i ${containerName} bash -c \"g++ ${srcPath} -o ${outPath}\"`;
			await execPromise(compileCmd, { timeout: timeout / 2, maxBuffer: 1024 * 1024 });
			// Ensure the compiled binary has execute permission
			const chmodCmd = `docker exec -i ${containerName} bash -c \"chmod +x ${outPath} || true\"`;
			const chmodRes = await execPromise(chmodCmd).catch((e) => ({ error: e }));
			console.log("[cppExec] chmod result:", chmodRes && (chmodRes.stdout || chmodRes.error && chmodRes.error.message));
			// log file listing for debugging
			try {
				const ls = await execPromise(`docker exec -i ${containerName} bash -c "ls -l ${outPath} || true"`);
				console.log("[cppExec] ls:", ls.stdout || ls.stderr);
				// additional diagnostics: id, /tmp permissions, mount options, stat and file
				const diag = await execPromise(
					`docker exec -i ${containerName} bash -c "id && ls -ld /tmp && mount | grep -E ' /tmp |tmpfs' || true && stat -c '%a %U %G' ${outPath} || true && file ${outPath} || true"`
				);
				console.log("[cppExec] diag:\n", diag.stdout || diag.stderr);
			} catch (e) { console.error("[cppExec] ls error:", e && e.message ? e.message : e); }
		}

		// run
		const trimmedInput = input || "";
		let executeCmd;
		if (trimmedInput) {
			const inputB64 = Buffer.from(trimmedInput, 'utf8').toString('base64');
			executeCmd = `docker exec -i ${containerName} bash -c "echo '${inputB64}' | base64 -d | ${outPath}"`;
		} else {
			executeCmd = `docker exec -i ${containerName} bash -c "${outPath}"`;
		}

		const { stdout, stderr } = await execPromise(executeCmd, { timeout, maxBuffer: 1024 * 1024 });

		// cleanup source and binary
		await execPromise(`docker exec -i ${containerName} bash -c "rm -f ${srcPath} ${outPath} || true"`).catch(() => {});

		return { success: !stderr || stderr.trim() === "", output: stdout.trim(), error: stderr.trim() };
	} catch (error) {
		try { await execPromise(`docker exec -i ${containerName} bash -c "rm -f ${tempFile}* || true"`); } catch {}
		return { success: false, output: error.stdout?.trim() || "", error: error.stderr?.trim() || error.message };
	}
};