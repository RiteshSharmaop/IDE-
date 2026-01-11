// frontend/src/hooks/useOptimisticNotificationDelete.js

import { useState, useCallback } from "react";
import notificationDeletionApi from "../lib/notificationDeletionApi";

/**
 * Custom hook for optimistic notification deletion
 * Handles UI updates, retries, and async deletion tracking
 */
export function useOptimisticNotificationDelete(onSuccess, onError) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionStates, setDeletionStates] = useState(new Map()); // Track per-notification state

  /**
   * Delete selected notifications optimistically
   * @param {string[]} notificationIds
   * @param {Function} optimisticUpdate - Update UI immediately
   */
  const deleteSelected = useCallback(
    async (notificationIds, optimisticUpdate) => {
      if (!notificationIds || notificationIds.length === 0) {
        return;
      }

      setIsDeleting(true);

      try {
        // 1. Optimistic update (no blocking)
        console.log(
          "⚡ Applying optimistic delete for",
          notificationIds.length,
          "notifications"
        );
        optimisticUpdate?.(notificationIds);

        // Mark as deleting
        const newStates = new Map(deletionStates);
        notificationIds.forEach((id) => {
          newStates.set(id, "DELETING");
        });
        setDeletionStates(newStates);

        // 2. Send to backend (async, with retry)
        console.log("📤 Sending deletion request to backend...");
        const response = await notificationDeletionApi.batchDelete(
          notificationIds
        );

        console.log("✅ Server accepted deletion:", {
          idempotencyKey: response.idempotencyKey,
          deletionId: response.deletionId,
        });

        // 3. Update deletion states
        newStates.forEach((_, id) => {
          if (notificationIds.includes(id)) {
            newStates.set(id, "DELETION_QUEUED");
          }
        });
        setDeletionStates(newStates);

        // 4. Poll for completion (optional, non-blocking)
        // Client doesn't wait for hard deletion; just track
        pollDeletionCompletion(response.deletionId, notificationIds);

        onSuccess?.(response);
      } catch (error) {
        console.error("❌ Deletion failed:", error);

        // Revert optimistic update on error
        const newStates = new Map(deletionStates);
        notificationIds.forEach((id) => {
          newStates.set(id, "DELETION_FAILED");
        });
        setDeletionStates(newStates);

        onError?.(error);
      } finally {
        setIsDeleting(false);
      }
    },
    [deletionStates, onSuccess, onError]
  );

  /**
   * Delete single notification optimistically
   */
  const deleteSingle = useCallback(
    async (notificationId, optimisticUpdate) => {
      setIsDeleting(true);

      try {
        optimisticUpdate?.(notificationId);

        setDeletionStates((prev) =>
          new Map(prev).set(notificationId, "DELETING")
        );

        const response = await notificationDeletionApi.deleteNotification(
          notificationId
        );

        setDeletionStates((prev) =>
          new Map(prev).set(notificationId, "DELETION_QUEUED")
        );

        onSuccess?.(response);
      } catch (error) {
        console.error("❌ Single deletion failed:", error);

        setDeletionStates((prev) =>
          new Map(prev).set(notificationId, "DELETION_FAILED")
        );

        onError?.(error);
      } finally {
        setIsDeleting(false);
      }
    },
    [onSuccess, onError]
  );

  /**
   * Poll for deletion completion (background task)
   * Non-blocking; updates UI as hard deletion completes
   */
  const pollDeletionCompletion = useCallback((deletionId, notificationIds) => {
    // Run in background; don't await
    notificationDeletionApi
      .pollDeletionStatus(deletionId, 60000) // 60s timeout
      .then((status) => {
        console.log("🎉 Hard deletion completed:", {
          deletionId,
          finalStatus: status.status,
        });

        if (status.status === "HARD_DELETED") {
          setDeletionStates((prev) => {
            const newStates = new Map(prev);
            notificationIds.forEach((id) => {
              newStates.set(id, "HARD_DELETED");
            });
            return newStates;
          });
        }
      })
      .catch((error) => {
        console.error("⚠️ Polling error:", error);
        // Don't fail the whole operation; deletion is queued
      });
  }, []);

  /**
   * Get deletion state for a notification
   */
  const getDeletionState = useCallback(
    (notificationId) => deletionStates.get(notificationId) || "ACTIVE",
    [deletionStates]
  );

  return {
    isDeleting,
    deleteSelected,
    deleteSingle,
    getDeletionState,
    deletionStates,
  };
}
