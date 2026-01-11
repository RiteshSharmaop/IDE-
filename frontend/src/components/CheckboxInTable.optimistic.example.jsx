// frontend/src/components/CheckboxInTable.optimistic.example.jsx
/**
 * EXAMPLE: How to integrate optimistic deletion into CheckboxInTable
 *
 * This shows the updated component using the new optimistic deletion system
 * Replace the current delete handlers with this approach
 */

"use client";

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, CheckCircle, Clock, Loader, AlertCircle } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { useRoom } from "../context/RoomContext";
import { useOptimisticNotificationDelete } from "../hooks/useOptimisticNotificationDelete";

const typeColor = {
  USER_JOINED: "bg-green-600",
  USER_LEFT: "bg-red-600",
  FILE_CREATED: "bg-blue-600",
  FILE_DELETED: "bg-orange-600",
  FOLDER_CREATED: "bg-purple-600",
  FOLDER_DELETED: "bg-pink-600",
};

const typeLabel = {
  USER_JOINED: "User Joined",
  USER_LEFT: "User Left",
  FILE_CREATED: "File Created",
  FILE_DELETED: "File Deleted",
  FOLDER_CREATED: "Folder Created",
  FOLDER_DELETED: "Folder Deleted",
};

const CheckboxInTable = forwardRef((props, ref) => {
  const [selectedRows, setSelectedRows] = useState(new Set([]));
  const [notifications, setNotifications] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const { socket, socketId } = useSocket();
  const { roomId } = useRoom();

  // NEW: Optimistic deletion hook
  const { isDeleting, deleteSelected, deleteSingle, getDeletionState } =
    useOptimisticNotificationDelete(
      (response) => {
        console.log("✅ Deletion accepted:", response);
        showToast(`${response.deletionId} notifications queued for deletion`);
      },
      (error) => {
        console.error("❌ Deletion failed:", error);
        showToast(`Error: ${error.message}`, "error");
      }
    );

  // Toast notification helper
  const showToast = (message, type = "success") => {
    setToastMessage({ text: message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ... existing mapStatus, formatTime functions ...
  const mapStatus = (type) => {
    switch (type) {
      case "USER_JOINED":
        return "Active";
      case "USER_LEFT":
        return "Inactive";
      case "FILE_CREATED":
      case "FILE_DELETED":
      case "FOLDER_CREATED":
      case "FOLDER_DELETED":
        return "Pending";
      default:
        return "Pending";
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now - notifDate;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return notifDate.toLocaleDateString();
  };

  // Load notifications from API (existing code)
  useEffect(() => {
    const loadNotifications = async () => {
      if (!roomId) return;

      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"
          }/api/notifications/room/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const formattedNotifications = data.data
            .filter((notif) => !notif.deletedAt) // Exclude soft-deleted
            .map((notif) => ({
              id: notif._id,
              username: notif.username,
              title: notif.message,
              type: notif.type,
              role: typeLabel[notif.type] || "Notification",
              status: mapStatus(notif.type),
              createdAt: notif.createdAt,
              read: notif.read,
            }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

          setTableData(formattedNotifications);
          setNotifications(formattedNotifications);
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    loadNotifications();
  }, [roomId]);

  // Listen for socket notifications (existing code)
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleNotification = (data) => {
      if (data.roomId !== roomId) return;

      const newNotification = {
        id: crypto.randomUUID(),
        username: data.username || "System",
        title: data.message,
        type: data.type,
        role: typeLabel[data.type] || "Notification",
        status: mapStatus(data.type),
        createdAt: data.createdAt,
        read: false,
      };

      setTableData((prev) => [newNotification, ...prev]);
      setNotifications((prev) => [newNotification, ...prev]);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, roomId]);

  // Select/Deselect functionality
  const selectAll =
    tableData.length > 0 && selectedRows.size === tableData.length;

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(tableData.map((row) => row.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id, checked) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  // NEW: Optimistic delete handler for selected
  const handleDeleteSelectedOptimistic = async () => {
    const toDelete = Array.from(selectedRows);

    if (toDelete.length === 0) {
      showToast("No notifications selected", "error");
      return;
    }

    const ok = window.confirm(
      `Delete ${toDelete.length} notification${toDelete.length > 1 ? "s" : ""}?`
    );
    if (!ok) return;

    // Define optimistic update function
    const optimisticUpdate = (ids) => {
      setTableData((prev) => prev.filter((n) => !ids.includes(n.id)));
      setSelectedRows(new Set());
    };

    // Send deletion (no blocking, returns immediately)
    await deleteSelected(toDelete, optimisticUpdate);
  };

  // NEW: Optimistic delete handler for single row
  const handleDeleteSingleOptimistic = async (notifId) => {
    const ok = window.confirm("Delete this notification?");
    if (!ok) return;

    const optimisticUpdate = (id) => {
      setTableData((prev) => prev.filter((n) => n.id !== id));
    };

    await deleteSingle(notifId, optimisticUpdate);
  };

  // NEW: Expose methods via ref for header button
  useImperativeHandle(ref, () => ({
    getSelectedCount: () => selectedRows.size,
    deleteSelected: async () => {
      const toDelete = Array.from(selectedRows);
      if (toDelete.length === 0) return;

      const optimisticUpdate = (ids) => {
        setTableData((prev) => prev.filter((n) => !ids.includes(n.id)));
        setSelectedRows(new Set());
      };

      await deleteSelected(toDelete, optimisticUpdate);
    },
  }));

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            toastMessage.type === "error"
              ? "bg-red-900 text-red-200"
              : "bg-green-900 text-green-200"
          }`}
        >
          {toastMessage.type === "error" ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle size={18} />
          )}
          {toastMessage.text}
        </div>
      )}

      {/* Notifications Table */}
      <Table className="bg-[#0A0A0A] text-white">
        <TableHeader>
          <TableRow className="bg-[#111111]">
            <TableHead className="w-8">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                disabled={isDeleting}
              />
            </TableHead>
            <TableHead className="text-white">Username</TableHead>
            <TableHead className="text-white">Message</TableHead>
            <TableHead className="text-white">Type</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white">Actions</TableHead>
            <TableHead className="text-white text-right">Time</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tableData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No notifications yet
              </TableCell>
            </TableRow>
          ) : (
            tableData.map((row) => {
              const deletionState = getDeletionState(row.id);
              const isDeletingThis =
                deletionState === "DELETING" ||
                deletionState === "DELETION_QUEUED";

              return (
                <TableRow
                  key={row.id}
                  data-state={selectedRows.has(row.id) ? "selected" : undefined}
                  className={`hover:bg-[#181818] data-[state=selected]:bg-[#262626] transition-opacity ${
                    isDeletingThis ? "opacity-50" : ""
                  } ${row.read ? "opacity-60" : ""}`}
                >
                  <TableCell>
                    <Checkbox
                      id={`row-${row.id}`}
                      checked={selectedRows.has(row.id)}
                      onCheckedChange={(checked) => {
                        if (checked === "indeterminate") return;
                        handleSelectRow(row.id, checked);
                      }}
                      disabled={isDeletingThis || isDeleting}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{row.username}</TableCell>
                  <TableCell className="text-sm">{row.title}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                        typeColor[row.type] || "bg-gray-600"
                      }`}
                    >
                      {row.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        row.status === "Active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : row.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {row.status}
                    </span>
                  </TableCell>

                  {/* Delete button with optimistic feedback */}
                  <TableCell className="text-right relative">
                    {isDeletingThis ? (
                      <Loader
                        size={16}
                        className="animate-spin text-blue-400"
                      />
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSingleOptimistic(row.id);
                        }}
                        className="p-1 text-red-400 hover:text-red-500 rounded transition-colors"
                        aria-label="Delete notification"
                        disabled={isDeleting}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </TableCell>

                  <TableCell className="text-right text-xs text-gray-400 flex items-center justify-end gap-1">
                    <Clock size={14} />
                    {formatTime(row.createdAt)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Stats */}
      {tableData.length > 0 && (
        <div className="mt-4 p-3 bg-[#1a1a1a] rounded-lg text-sm text-gray-400">
          Total Notifications: {tableData.length} | Unread:{" "}
          {tableData.filter((n) => !n.read).length} | Selected:{" "}
          {selectedRows.size}
          {selectedRows.size > 0 && (
            <button
              onClick={handleDeleteSelectedOptimistic}
              disabled={isDeleting}
              className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : `Delete (${selectedRows.size})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
});

CheckboxInTable.displayName = "CheckboxInTable";

export default CheckboxInTable;

/**
 * INTEGRATION NOTES:
 *
 * 1. Replace the old handleDeleteSelected and handleDeleteNotification
 *    with the new optimistic handlers
 *
 * 2. The component now uses useOptimisticNotificationDelete hook
 *    which handles:
 *    - Immediate UI removal (optimistic)
 *    - Background API call with retries
 *    - Error handling and recovery
 *    - Deletion state tracking
 *
 * 3. The exposed ref methods allow parent (CodeIDE) to trigger
 *    deletion from the header trash button
 *
 * 4. Toast notifications show deletion status
 *
 * 5. Loading spinners show while deletion is in progress
 *
 * 6. Buttons are disabled during deletion to prevent double-clicks
 */
