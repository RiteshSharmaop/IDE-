// frontend/src/lib/notificationDeletionApi.js

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Notification Deletion API Client
 * Handles optimistic updates, retries, and exponential backoff
 */

class NotificationDeletionAPI {
  constructor() {
    this.maxRetries = 3;
    this.baseDelay = 1000; // 1 second
  }

  /**
   * Get auth token from storage
   */
  getAuthToken() {
    return localStorage.getItem("token");
  }

  /**
   * Create axios instance with auth headers
   */
  createAxiosInstance() {
    return axios.create({
      baseURL: API_BASE,
      headers: {
        Authorization: `Bearer ${this.getAuthToken()}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Batch delete notifications with retry logic
   * @param {string[]} notificationIds
   * @returns {Promise<{status, idempotencyKey, deletionId}>}
   */
  async batchDelete(notificationIds) {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      throw new Error("Invalid notification IDs");
    }

    const axiosInstance = this.createAxiosInstance();

    try {
      const response = await this.retryWithBackoff(
        () =>
          axiosInstance.post("/api/notifications/batch-delete", {
            notificationIds,
          }),
        "batchDelete",
        notificationIds
      );

      // 202 Accepted is expected
      if (response.status === 202) {
        return {
          status: response.data.status,
          idempotencyKey: response.data.idempotencyKey,
          deletionId: response.data.deletionId,
          message: response.data.message,
        };
      }

      throw new Error(`Unexpected response status: ${response.status}`);
    } catch (error) {
      console.error("Batch deletion failed:", error);
      throw error;
    }
  }

  /**
   * Delete single notification
   * @param {string} notificationId
   * @returns {Promise}
   */
  async deleteNotification(notificationId) {
    const axiosInstance = this.createAxiosInstance();

    try {
      const response = await this.retryWithBackoff(
        () => axiosInstance.delete(`/api/notifications/${notificationId}`),
        "deleteNotification",
        [notificationId]
      );

      return response.data;
    } catch (error) {
      console.error(`Failed to delete notification ${notificationId}:`, error);
      throw error;
    }
  }

  /**
   * Get deletion status
   * @param {string} deletionId
   * @returns {Promise}
   */
  async getDeletionStatus(deletionId) {
    const axiosInstance = this.createAxiosInstance();

    try {
      const response = await axiosInstance.get(
        `/api/notifications/deletion/${deletionId}/status`
      );

      return response.data;
    } catch (error) {
      console.error(`Failed to get deletion status for ${deletionId}:`, error);
      throw error;
    }
  }

  /**
   * Retry logic with exponential backoff
   * @param {Function} requestFn
   * @param {string} operation
   * @param {any} params
   * @param {number} attempt
   * @returns {Promise}
   */
  async retryWithBackoff(
    requestFn,
    operation = "request",
    params = null,
    attempt = 0
  ) {
    try {
      console.log(
        `📤 Attempt ${attempt + 1}/${this.maxRetries + 1}: ${operation}`,
        params
      );
      return await requestFn();
    } catch (error) {
      const isRetryable =
        error.code === "ECONNABORTED" ||
        error.code === "ENOTFOUND" ||
        (error.response && error.response.status >= 500);

      if (attempt < this.maxRetries && isRetryable) {
        const delayMs = this.baseDelay * Math.pow(2, attempt);
        console.warn(
          `⏳ Retrying in ${delayMs}ms... (attempt ${attempt + 1}/${
            this.maxRetries
          })`
        );

        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.retryWithBackoff(requestFn, operation, params, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Poll deletion status with timeout
   * @param {string} deletionId
   * @param {number} maxWaitMs
   * @returns {Promise}
   */
  async pollDeletionStatus(deletionId, maxWaitMs = 30000) {
    const pollIntervalMs = 1000;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      try {
        const status = await this.getDeletionStatus(deletionId);

        if (status.status === "HARD_DELETED" || status.status === "FAILED") {
          return status;
        }

        console.log(`🔄 Deletion status: ${status.status}, polling again...`);
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      } catch (error) {
        console.error("Error polling deletion status:", error);
        throw error;
      }
    }

    throw new Error(`Deletion status poll timeout after ${maxWaitMs}ms`);
  }
}

export default new NotificationDeletionAPI();
