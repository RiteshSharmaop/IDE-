

const getCommands = (language, tempFile) => {
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
  exports.getCommands = getCommands;