import React from "react";
import { Plus, Trash2 } from "lucide-react";

const ChatHistory = ({ chats, activeChat, onSelectChat, onNewChat, onDeleteChat }) => {
  return (
    <div className="space-y-2">
      <button
        onClick={onNewChat}
        className="w-full flex items-center gap-3 p-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
      >
        <Plus size={18} />
        <span>New Chat</span>
      </button>

      <div className="space-y-1">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`group relative rounded-lg transition-colors ${
              activeChat === chat.id
                ? "bg-purple-600/20 border border-purple-500/30"
                : "hover:bg-gray-700/30"
            }`}
          >
            <button
              onClick={() => onSelectChat(chat.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                activeChat === chat.id
                  ? "text-purple-300"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <div className="font-medium text-sm pr-8">{chat.title}</div>
              <div className="text-xs opacity-70 mt-1">{chat.subtitle}</div>
            </button>

            {chats.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 p-1 rounded transition-all"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory;
