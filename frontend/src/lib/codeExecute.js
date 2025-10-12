import axios from "axios";

const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
});

const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  typescript: "5.0.3",
  python: "3.10.0",
  java: "15.0.2",
  csharp: "6.12.0",
  cpp: "10.2.0",
};

export const runTheCode = async (language, sourceCode, input = "") => {
  try {
    const res = await API.post("/execute", {
      language,
      version: LANGUAGE_VERSIONS[language],
      files: [{ content: sourceCode }],
      stdin: input, // 👈 this is where you send user input
    });

    return res.data.run;
  } catch (error) {
    console.error("❌ Error running code:", error.response?.data || error.message);
    throw error;
  }
};
