import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronDown, ChevronUp, Home, Copy, Check } from "lucide-react";

const SharedChatPage = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [sharedChat, setSharedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedModels, setExpandedModels] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSharedChat();
  }, [shareId]);

  const fetchSharedChat = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL
        }api/shared/${shareId}`
      );

      const data = response.data?.data || response.data;
      setSharedChat(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load shared chat");
      console.error("Error fetching shared chat:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModel = (model) => {
    setExpandedModels((prev) => ({
      ...prev,
      [model]: !prev[model],
    }));
  };

  const copyShareLink = () => {
    if (sharedChat?.shareUrl) {
      navigator.clipboard.writeText(sharedChat.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const groupMessagesByModel = () => {
    const grouped = {};
    sharedChat?.messages?.forEach((msg) => {
      const model = msg.model || "Unknown";
      if (!grouped[model]) {
        grouped[model] = [];
      }
      grouped[model].push(msg);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading shared chat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const modelMessages = groupMessagesByModel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-800/80 backdrop-blur border-b border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
            >
              <Home size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{sharedChat?.title}</h1>
              <p className="text-sm text-gray-400">
                Shared by{" "}
                <span className="font-semibold text-purple-400">
                  {sharedChat?.owner?.username ||
                    sharedChat?.owner?.fullName ||
                    "Unknown"}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={copyShareLink}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition border border-purple-500/30"
          >
            {copied ? (
              <>
                <Check size={18} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={18} />
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Chat Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Messages</p>
            <p className="text-3xl font-bold text-purple-400">
              {sharedChat?.messages?.length || 0}
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Active Models</p>
            <p className="text-3xl font-bold text-purple-400">
              {Object.keys(modelMessages).length}
            </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Views</p>
            <p className="text-3xl font-bold text-purple-400">
              {sharedChat?.accessCount || 0}
            </p>
          </div>
        </div>

        {/* Models Section */}
        <div className="space-y-4">
          {Object.entries(modelMessages).map(([model, messages]) => (
            <div
              key={model}
              className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Model Header */}
              <button
                onClick={() => toggleModel(model)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">{model}</h3>
                    <p className="text-sm text-gray-400">
                      {messages.length} message
                      {messages.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                {expandedModels[model] ? (
                  <ChevronUp size={20} className="text-gray-400" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400" />
                )}
              </button>

              {/* Messages */}
              {expandedModels[model] && (
                <div className="border-t border-gray-700 bg-gray-900/50">
                  <div className="max-h-96 overflow-y-auto">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`px-6 py-4 border-b border-gray-700/50 ${
                          msg.role === "user"
                            ? "bg-gray-800/30"
                            : "bg-purple-900/20"
                        }`}
                      >
                        <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">
                          {msg.role === "user" ? "You" : "Model"}
                        </p>
                        <p className="text-gray-200 whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                        {msg.timestamp && (
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(msg.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {(!sharedChat?.messages || sharedChat.messages.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No messages in this shared chat
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedChatPage;
