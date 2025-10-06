const dockerExecutor = require("../services/codeExecutor/dockerExecutor");
const { redisUtils } = require("../config/redis");

exports.executeCode = async (req, res) => {
  try {
    const { code, language, input = "" } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: "Code and language are required",
      });
    }

    // Supported languages
    const supportedLanguages = [
      "javascript",
      "python",
      "cpp",
      "c",
      "java",
      "csharp",
    ];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: `Language ${language} is not supported. Supported: ${supportedLanguages.join(
          ", "
        )}`,
      });
    }

    // Rate limiting
    const rateLimitKey = `ratelimit:execute:${req.user.id}`;
    const execCount = (await redisUtils.get(rateLimitKey)) || 0;

    if (execCount >= 50) {
      return res.status(429).json({
        success: false,
        message: "Rate limit exceeded. Maximum 50 executions per hour.",
      });
    }

    // Ensure Docker container is running
    await dockerExecutor.startContainer();

    // Execute code in Docker
    const startTime = Date.now();
    const result = await dockerExecutor.executeInDocker(code, language, input);
    const executionTime = Date.now() - startTime;

    // Update rate limit
    await redisUtils.incr(rateLimitKey);
    // tll 1hre
    await redisUtils.expire(rateLimitKey, 3600);

    res.json({
      success: true,
      data: {
        ...result,
        executionTime,
        language,
      },
    });
  } catch (error) {
    console.error("Execute code error:", error);
    res.status(500).json({
      success: false,
      message: "Error executing code",
      error: error.message,
    });
  }
};
