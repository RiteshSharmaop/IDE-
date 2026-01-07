import React, { useState, useEffect } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Plus, Folder, Clock, Users, Trash2, ChevronRight } from "lucide-react";

const RoomsSidebar = ({
  rooms = [],
  activeRoom = null,
  onRoomClick,
  onCreateRoom,
  onDeleteRoom,
  theme,
  sidebarCollapsed,
}) => {
  const [expandedRooms, setExpandedRooms] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      onCreateRoom({
        roomId: `room-${Date.now()}`,
        roomName: newRoomName,
        description: "",
      });
      setNewRoomName("");
      setIsCreating(false);
    }
  };

  const toggleRoomExpanded = (roomId) => {
    setExpandedRooms((prev) => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString();
  };

  return (
    <SidebarGroup className="border-t border-[#3E3F3E]">
      <div className="flex items-center justify-between">
        <SidebarGroupLabel className="text-[#3E3F3E] text-xs font-semibold uppercase">
          Rooms
        </SidebarGroupLabel>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="p-1 hover:bg-[#898888] rounded-md transition-colors"
          title="Create new room"
        >
          <Plus className="h-4 w-4 text-[#D0D0D0]" />
        </button>
      </div>

      <SidebarGroupContent>
        <SidebarMenu>
          {isCreating && (
            <SidebarMenuItem className="mb-2">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreateRoom()}
                onBlur={() => !newRoomName && setIsCreating(false)}
                placeholder="Room name"
                className="w-full rounded-md border border-[#3E3F3E] bg-[#171717] px-3 py-2 text-sm text-[#D0D0D0] placeholder:text-[#3E3F3E] focus:outline-none focus:border-[#898888]"
                autoFocus
              />
            </SidebarMenuItem>
          )}

          {rooms.length === 0 ? (
            <div className="px-3 py-4 text-center text-[#3E3F3E] text-sm">
              No rooms yet. Create one to get started!
            </div>
          ) : (
            rooms.map((room) => (
              <SidebarMenuItem key={room._id || room.roomId} className="mb-1">
                <div
                  className={`w-full rounded-md transition-colors ${
                    activeRoom?.roomId === room.roomId
                      ? "bg-[#212121] text-amber-500"
                      : "hover:bg-[#212121] text-[#D0D0D0] hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between p-2">
                    <button
                      onClick={() => onRoomClick(room)}
                      className="flex-1 flex items-center gap-2 text-left truncate"
                    >
                      <Folder className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm font-medium">
                        {room.roomName}
                      </span>
                    </button>

                    <button
                      onClick={() => toggleRoomExpanded(room.roomId)}
                      className="p-1 hover:bg-[#898888] rounded transition-colors"
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          expandedRooms[room.roomId] ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => onDeleteRoom(room.roomId)}
                      className="p-1 hover:bg-red-900 rounded text-red-400 hover:text-red-300 transition-colors"
                      title="Delete room"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  {expandedRooms[room.roomId] && (
                    <div className="px-4 py-2 bg-[#0a0a0a] text-xs text-[#9CA3AF] space-y-1 border-t border-[#3E3F3E]">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>Accessed: {formatDate(room.lastAccessed)}</span>
                      </div>
                      {room.collaborators && (
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>
                            {room.collaborators.length} collaborator
                            {room.collaborators.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                      {room.files && (
                        <div className="flex items-center gap-2">
                          <span>Files: {room.files.length}</span>
                        </div>
                      )}
                      {room.description && (
                        <p className="text-[#6B7280] italic truncate">
                          {room.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default RoomsSidebar;
