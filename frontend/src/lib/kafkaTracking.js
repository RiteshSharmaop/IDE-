// frontend/src/lib/kafkaTracking.js
// Kafka event tracking for IDE events

import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

// Add request interceptor to include authentication token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Track code execution event to Kafka
 * @param {object} data - { fileName, language, executionTime, status, output, error, roomId }
 */
export async function trackCodeExecution(data) {
  try {
    const response = await API.post("/ide/track-execution", {
      fileName: data.fileName,
      language: data.language,
      executionTime: data.executionTime,
      status: data.status, // 'success' or 'error'
      output: data.output,
      error: data.error,
      roomId: data.roomId || "default",
    });

    console.log("✅ Code execution tracked:", response.data.eventId);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("⚠️ Not authenticated. Please log in to track execution.");
    } else {
      console.error("❌ Failed to track code execution:", error.response?.data?.message || error.message);
    }
    // Don't throw - tracking shouldn't block execution
  }
}

/**
 * Track file operation event to Kafka
 * @param {object} data - { operation, fileName, filePath, language, roomId }
 */
export async function trackFileOperation(data) {
  try {
    const response = await API.post("/ide/track-file-operation", {
      operation: data.operation, // 'create', 'delete', 'modify', 'save'
      fileName: data.fileName,
      filePath: data.filePath,
      language: data.language,
      roomId: data.roomId || "default",
    });

    console.log("✅ File operation tracked:", response.data.eventId);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("⚠️ Not authenticated. Please log in to track file operations.");
    } else {
      console.error("❌ Failed to track file operation:", error.response?.data?.message || error.message);
    }
  }
}

/**
 * Track IDE metrics to Kafka
 * @param {object} data - { activeFiles, openFiles, theme, roomId }
 */
export async function trackIDEMetrics(data) {
  try {
    const response = await API.post("/ide/track-metrics", {
      activeFiles: data.activeFiles,
      openFiles: data.openFiles,
      theme: data.theme,
      roomId: data.roomId || "default",
    });
if (error.response?.status === 401) {
      console.warn("⚠️ Not authenticated. Please log in to track IDE metrics.");
    } else {
      console.error("❌ Failed to track IDE metrics:", error.response?.data?.message || error.message);
    }
    console.log("✅ IDE metrics tracked");
    return response.data;
  } catch (error) {
    console.error("❌ Failed to track IDE metrics:", error);
    // Don't throw - metrics shouldn't block anything
  }
}

/**
 * Get IDE Kafka health status
 */
export async function getIDEHealth() {
  try {
    const response = await API.get("/ide/health");
    return response.data;
  } catch (error) {
    console.error("❌ IDE health check failed:", error);
    return { success: false, message: "Health check failed" };
  }
}

export default {
  trackCodeExecution,
  trackFileOperation,
  trackIDEMetrics,
  getIDEHealth,
};
