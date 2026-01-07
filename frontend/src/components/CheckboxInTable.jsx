"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowUpDown,
  ArrowUpRightSquare,
  Trash2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { useRoom } from "../context/RoomContext";

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

export default function CheckboxInTable() {
  const [selectedRows, setSelectedRows] = useState(new Set([]));
  const [notifications, setNotifications] = useState([]);
  const [tableData, setTableData] = useState([]);
  const { socket, socketId } = useSocket();
  const { roomId } = useRoom();

  // Map notification type to status
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

  // Format time
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

  // Listen for notifications from socket
  useEffect(() => {
    if (!socket || !roomId) {
      console.log("⏳ Waiting for socket or roomId:", {
        socketExists: !!socket,
        roomId,
      });
      return;
    }

    console.log("🎧 Setting up notification listener for room:", roomId);

    const handleNotification = (data) => {
      console.log("📬 Received notification from socket:", data);
      console.log("   Room ID from notification:", data.roomId);
      console.log("   Current room ID:", roomId);
      console.log("   Match?", data.roomId === roomId);

      if (data.roomId !== roomId) {
        console.log("❌ Notification is for different room:", data.roomId);
        return;
      }

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
      console.log("✅ Adding notification:", newNotification);

      setTableData((prev) => {
        const updated = [newNotification, ...prev];
        console.log("📊 Updated table data, now has", updated.length, "items");
        return updated;
      });
      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        console.log(
          "📋 Updated notifications, now has",
          updated.length,
          "items"
        );
        return updated;
      });
    };

    console.log("🔌 Attaching socket listener for 'notification' event");
    socket.on("notification", handleNotification);

    return () => {
      console.log("🧹 Removing notification listener for room:", roomId);
      socket.off("notification", handleNotification);
    };
  }, [socket, roomId]);

  // Load initial notifications from API
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
          const formattedNotifications = data.data.map((notif) => ({
            id: notif._id,
            username: notif.username,
            title: notif.message,
            type: notif.type,
            role: typeLabel[notif.type] || "Notification",
            status: mapStatus(notif.type),
            createdAt: notif.createdAt,
            read: notif.read,
          }));

          // API returns newest first; keep that order so newest notifications appear on top
          // Ensure newest notifications appear on top by sorting descending by createdAt
          const sorted = formattedNotifications.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setTableData(sorted);
          setNotifications(sorted);
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    loadNotifications();
  }, [roomId]);

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

  // Delete selected notifications
  const handleDeleteSelected = async () => {
    const toDelete = Array.from(selectedRows);

    for (const notifId of toDelete) {
      try {
        await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:8000"
          }/api/notifications/${notifId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } catch (error) {
        console.error(`Error deleting notification ${notifId}:`, error);
      }
    }

    setTableData((prev) => prev.filter((row) => !toDelete.includes(row.id)));
    setNotifications((prev) => prev.filter((n) => !toDelete.includes(n.id)));
    setSelectedRows(new Set());
  };

  // Mark selected as read
  const handleMarkAsRead = async () => {
    const toMark = Array.from(selectedRows);

    for (const notifId of toMark) {
      try {
        await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:8000"
          }/api/notifications/${notifId}/read`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } catch (error) {
        console.error(`Error marking notification ${notifId} as read:`, error);
      }
    }

    setTableData((prev) =>
      prev.map((row) =>
        toMark.includes(row.id) ? { ...row, read: true } : row
      )
    );

    setSelectedRows(new Set());
  };

  // Log render state
  console.log(
    "🎨 Rendering CheckboxInTable with",
    tableData.length,
    "notifications"
  );

  return (
    <div className="w-full">
      {/* Action Bar */}
      {selectedRows.size > 0 && (
        <div className="flex gap-2 mb-4 p-3 bg-[#1a1a1a] rounded-lg">
          <button
            onClick={handleMarkAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm"
          >
            <CheckCircle size={16} />
            Mark as Read ({selectedRows.size})
          </button>
          <button
            onClick={handleDeleteSelected}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm"
          >
            <Trash2 size={16} />
            Delete ({selectedRows.size})
          </button>
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
              />
            </TableHead>
            <TableHead className="text-white">Username</TableHead>
            <TableHead className="text-white">Message</TableHead>
            <TableHead className="text-white">Type</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white text-right">Time</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tableData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No notifications yet
              </TableCell>
            </TableRow>
          ) : (
            tableData.map((row) => (
              <TableRow
                key={row.id}
                data-state={selectedRows.has(row.id) ? "selected" : undefined}
                className={`hover:bg-[#181818] data-[state=selected]:bg-[#262626] ${
                  row.read ? "opacity-60" : ""
                }`}
              >
                <TableCell>
                  <Checkbox
                    id={`row-${row.id}`}
                    checked={selectedRows.has(row.id)}
                    onCheckedChange={(checked) => {
                      if (checked === "indeterminate") return;
                      handleSelectRow(row.id, checked);
                    }}
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
                <TableCell className="text-right text-xs text-gray-400 flex items-center justify-end gap-1">
                  <Clock size={14} />
                  {formatTime(row.createdAt)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Stats */}
      {tableData.length > 0 && (
        <div className="mt-4 p-3 bg-[#1a1a1a] rounded-lg text-sm text-gray-400">
          Total Notifications: {tableData.length} | Unread:{" "}
          {tableData.filter((n) => !n.read).length}
        </div>
      )}
    </div>
  );
}
