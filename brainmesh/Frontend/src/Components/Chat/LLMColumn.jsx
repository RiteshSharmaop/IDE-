import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

const LLMColumn = ({
  name,
  model,
  color,
  messages,
  isTyping,
  onClose,
  isVisible,
}) => {
  const icons = {
    ChatGPT: "🤖",
    Gemini: "💎",
    DeepSeek: "🔍",
    Perplexity: "🧠",
    Lama: "☁️",
  };

  const messagesEndRef = useRef(null);

  // Scroll to latest message whenever messages or typing changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isVisible) return null;

  return (
    <div className="flex flex-col h-full bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div
        className={`p-4 border-b border-gray-700/50 ${color} flex items-center justify-between rounded-t-xl`}
      >
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span className="text-xl">{icons[name] || "🤖"}</span>
          {name}
        </h3>

        <button
          onClick={() => onClose(name)}
          className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1 transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 ">
        {messages.map((msg) => (
          <div
            key={msg.id || `${msg.time}-${msg.type}`}
            className={`p-3 rounded-lg ${
              msg.type === "user"
                ? "bg-blue-600 text-white ml-6"
                : "bg-gray-800 text-gray-100 mr-6"
            }`}
          >
            <div className="text-sm">{msg.content}</div>
            <div className="text-xs opacity-70 mt-1">{msg.time}</div>
          </div>
        ))}

        {isTyping && (
          <div className="bg-gray-800 text-gray-100 mr-6 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>
    </div>
  );
};

export default LLMColumn;
