import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  Send,
  MessageCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Trash2,
  FileCode,
} from "lucide-react";
import { aiApi } from "../lib/aiApi";

const AIAssistantSidebar = ({
  theme = "dark",
  activeFile = null,
  fileContent = null,
  onInsertCode = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [insertedId, setInsertedId] = useState(null);
  const messagesEndRef = useRef(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("aiChatHistory");
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (e) {
        console.error("Failed to load chat history:", e);
        setMessages([
          {
            id: 1,
            type: "bot",
            text: "Hello! I can help you understand your code and identify issues. Ask me anything about the current file or how to improve it.",
          },
        ]);
      }
    } else {
      setMessages([
        {
          id: 1,
          type: "bot",
          text: "Hello! I can help you understand your code and identify issues. Ask me anything about the current file or how to improve it.",
        },
      ]);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("aiChatHistory", JSON.stringify(messages));
    }
  }, [messages]);

  const colors = {
    dark: {
      bg: "#1E1E1E",
      bgSecondary: "#252526",
      bgTertiary: "#2D2D2D",
      border: "#3E3E42",
      text: "#E0E0E0",
      textMuted: "#9CA3AF",
      accent: "#B0C4DE",
      accentHover: "#C0D0E8",
      success: "#A9B7B7",
    },
    light: {
      bg: "#FFFFFF",
      bgSecondary: "#F8F8F8",
      bgTertiary: "#F0F0F0",
      border: "#E0E0E0",
      text: "#2D2D2D",
      textMuted: "#6B7280",
      accent: "#36454F",
      accentHover: "#4B5A68",
      success: "#8A9A9A",
    },
  };

  const c = colors[theme];

  // Copy code to clipboard
  const handleCopyCode = (text, msgId) => {
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Insert code into editor
  const handleInsertCode = (code, msgId) => {
    if (onInsertCode) {
      onInsertCode(code);
      setInsertedId(msgId);
      setTimeout(() => setInsertedId(null), 2000);
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle message expansion
  const toggleExpanded = (msgId) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  // Clear all chat history
  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all chat history?")) {
      setMessages([
        {
          id: 1,
          type: "bot",
          text: "Hello! I can help you understand your code and identify issues. Ask me anything about the current file or how to improve it.",
        },
      ]);
      localStorage.removeItem("aiChatHistory");
    }
  };

  // Extract code blocks from text
  const extractCodeBlocks = (text) => {
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const matches = [...text.matchAll(codeBlockRegex)];
    return matches.length > 0
      ? matches.map((m) => ({
          language: m[1] || "code",
          code: m[2].trim(),
        }))
      : null;
  };

  // Truncate text for preview
  const truncateText = (text, maxLength = 500) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Render message with copy button for code
  const renderMessageContent = (msg) => {
    const codeBlocks = extractCodeBlocks(msg.text);
    const isExpanded = expandedMessages[msg.id];
    const displayText = isExpanded ? msg.text : truncateText(msg.text);
    const shouldShowExpand = msg.text.length > 500 && msg.type === "bot";

    return (
      <div className="space-y-2">
        <p style={{ whiteSpace: "pre-wrap" }}>{displayText}</p>

        {codeBlocks && codeBlocks.length > 0 && (
          <div className="mt-2 space-y-2">
            {codeBlocks.map((block, idx) => (
              <div
                key={idx}
                className="bg-black bg-opacity-50 rounded p-2 text-xs font-mono relative group"
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() =>
                      handleInsertCode(block.code, `${msg.id}-code-${idx}`)
                    }
                    className="p-1 rounded hover:bg-opacity-70 transition-all"
                    style={{
                      backgroundColor:
                        insertedId === `${msg.id}-code-${idx}`
                          ? c.success
                          : c.accent,
                    }}
                    title="Insert code into editor"
                  >
                    {insertedId === `${msg.id}-code-${idx}` ? (
                      <span className="text-xs">✓ Inserted!</span>
                    ) : (
                      <FileCode size={14} />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      handleCopyCode(block.code, `${msg.id}-code-${idx}`)
                    }
                    className="p-1 rounded hover:bg-opacity-70 transition-all"
                    style={{ backgroundColor: c.accent }}
                    title="Copy code"
                  >
                    {copiedId === `${msg.id}-code-${idx}` ? (
                      <span className="text-xs">✓ Copied!</span>
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                <div className="text-xs text-gray-400 mb-1">
                  {block.language}
                </div>
                <div className="overflow-x-auto max-h-40">
                  <code>{block.code}</code>
                </div>
              </div>
            ))}
          </div>
        )}

        {shouldShowExpand && (
          <button
            onClick={() => toggleExpanded(msg.id)}
            className="text-xs flex items-center gap-1 transition-all"
            style={{ color: c.accent }}
          >
            {isExpanded ? (
              <>
                <ChevronUp size={14} /> Show less
              </>
            ) : (
              <>
                <ChevronDown size={14} /> Show more
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      text: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    const userQuery = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      // Determine language based on file extension
      let language = "javascript";
      if (activeFile?.name) {
        const ext = activeFile.name.split(".").pop()?.toLowerCase();
        const langMap = {
          py: "python",
          java: "java",
          cpp: "cpp",
          c: "c",
          cs: "csharp",
          rb: "ruby",
          go: "go",
          rs: "rust",
          ts: "typescript",
          jsx: "javascript",
          tsx: "typescript",
        };
        language = langMap[ext] || "javascript";
      }

      // Call the backend API
      const response = await aiApi.assistWithCode(
        userQuery,
        fileContent || "",
        activeFile?.name || "code",
        language,
      );

      // Add bot response
      const botMessage = {
        id: messages.length + 2,
        type: "bot",
        text:
          response.response ||
          "I couldn't process your request. Please try again.",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: messages.length + 2,
        type: "bot",
        text: `Error: ${error.response?.data?.error || error.message || "Failed to get AI response"}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Toggle Bar - Right side minimal bar */}
      <div
        className="fixed right-0 top-0 bottom-0 w-[3%] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg"
        style={{
          backgroundColor: c.bgSecondary,
          borderLeft: `1px solid ${c.border}`,
          zIndex: 45,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col gap-2 items-center">
          <MessageCircle size={24} style={{ color: c.accent }} />
          <span
            className="text-xs font-semibold"
            style={{ color: c.textMuted }}
          >
            AI
          </span>
        </div>
      </div>

      {/* Sidebar Panel - Slides in from right */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-[#fff0] bg-opacity-0 z-40"
            onClick={() => setIsOpen(false)}
            style={{ right: "64px" }}
          />

          {/* Chat Panel */}
          <div
            className="fixed top-0 bottom-0 right-16 w-[30%] flex flex-col shadow-2xl border-l transition-all duration-300 z-41"
            style={{
              backgroundColor: c.bg,
              borderColor: c.border,
            }}
          >
            {/* Header with Clear Button */}
            <div
              className="flex items-center justify-between px-4 py-4 border-b"
              style={{ borderColor: c.border, backgroundColor: c.bgSecondary }}
            >
              <div className="flex items-center gap-2">
                <MessageCircle size={20} style={{ color: c.accent }} />
                <h3 className="font-semibold" style={{ color: c.text }}>
                  AI Assistant
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearHistory}
                  className="p-1 rounded hover:opacity-70 transition-opacity"
                  style={{ color: c.textMuted }}
                  title="Clear chat history"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:opacity-70 transition-opacity"
                  style={{ color: c.textMuted }}
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
            </div>

            {/* Current File Info */}
            {activeFile && (
              <div
                className="px-4 py-2 text-xs border-b"
                style={{
                  backgroundColor: c.bgTertiary,
                  borderColor: c.border,
                  color: c.textMuted,
                }}
              >
                Current file:{" "}
                <span style={{ color: c.accent }}>{activeFile.name}</span>
              </div>
            )}

            {/* Messages Container */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ backgroundColor: c.bgSecondary }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="px-4 py-2 rounded-lg max-w-xs text-sm leading-relaxed"
                    style={{
                      backgroundColor:
                        msg.type === "user" ? c.accent : c.bgTertiary,
                      color:
                        msg.type === "user"
                          ? theme === "dark"
                            ? "#1E1E1E"
                            : "#FFFFFF"
                          : c.text,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.type === "bot" ? renderMessageContent(msg) : msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="px-4 py-2 rounded-lg"
                    style={{ backgroundColor: c.bgTertiary }}
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{
                          backgroundColor: c.accent,
                          animationDelay: "0s",
                        }}
                      />
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{
                          backgroundColor: c.accent,
                          animationDelay: "0.2s",
                        }}
                      />
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{
                          backgroundColor: c.accent,
                          animationDelay: "0.4s",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              className="border-t p-3 space-y-2"
              style={{ borderColor: c.border, backgroundColor: c.bgSecondary }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your code..."
                  className="flex-1 px-3 py-2 rounded-lg border focus:outline-none text-sm transition-all"
                  style={{
                    backgroundColor: c.bg,
                    borderColor: c.border,
                    color: c.text,
                  }}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="px-3 py-2 rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  style={{
                    backgroundColor: c.accent,
                    color: theme === "dark" ? "#1E1E1E" : "#FFFFFF",
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-xs" style={{ color: c.textMuted }}>
                Ask questions about the code or request modifications
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AIAssistantSidebar;
