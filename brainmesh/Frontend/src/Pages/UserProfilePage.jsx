import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  Share2,
  BarChart3,
  Clock,
  Eye,
  Settings,
  LogOut,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react";
import { UserDataContext } from "../context/UserContext";

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserDataContext);
  const [sharedChats, setSharedChats] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("shared"); // "shared" or "history"
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch user's shared chats
      const sharedResponse = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL
        }api/shared/user-shares`,
        { headers }
      );
      const sharedData = sharedResponse.data?.data || sharedResponse.data;
      setSharedChats(Array.isArray(sharedData) ? sharedData : []);

      // Fetch user's chats
      const chatsResponse = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL
        }api/chat`,
        { headers }
      );
      const chatsData =
        chatsResponse.data?.data || chatsResponse.data?.chats || [];
      setUserChats(Array.isArray(chatsData) ? chatsData : []);

      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load user data");
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = (shareUrl) => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(shareUrl);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL
        }api/user/logout`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
    } catch (err) {
      console.warn("logout error", err);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const deleteSharedChat = async (shareId) => {
    if (!window.confirm("Are you sure you want to delete this shared chat?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${
          import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL
        }api/shared/share/${shareId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSharedChats((prev) => prev.filter((chat) => chat.shareId !== shareId));
    } catch (err) {
      console.error("Error deleting shared chat:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-800/80 backdrop-blur border-b border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition border border-red-500/30"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* User Info Card */}
        <div className="bg-gradient-to-br from-purple-900/30 to-gray-900 border border-purple-500/30 rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User size={40} />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {user?.username || "User"}
                </h2>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-2">
                    <Mail size={18} />
                    {user?.email || "N/A"}
                  </div>
                </div>
              </div>
            </div>
            <button className="p-3 hover:bg-gray-700/50 rounded-lg transition">
              <Settings size={24} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Shared Chats</p>
              <p className="text-2xl font-bold text-purple-400">
                {sharedChats.length}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Total Chats</p>
              <p className="text-2xl font-bold text-purple-400">
                {userChats.length}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Total Views</p>
              <p className="text-2xl font-bold text-purple-400">
                {sharedChats.reduce(
                  (sum, chat) => sum + (chat.accessCount || 0),
                  0
                )}
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Member Since</p>
              <p className="text-2xl font-bold text-purple-400">
                {user?.createdAt ? new Date(user.createdAt).getFullYear() : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("shared")}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeTab === "shared"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <Share2 size={18} />
              Shared Chats ({sharedChats.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeTab === "history"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              Chat History ({userChats.length})
            </div>
          </button>
        </div>

        {/* Shared Chats Tab */}
        {activeTab === "shared" && (
          <div className="space-y-4">
            {error && <p className="text-red-400 mb-4">{error}</p>}
            {sharedChats.length === 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                <Share2 size={48} className="mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 text-lg">No shared chats yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Share your first chat to get started
                </p>
              </div>
            ) : (
              sharedChats.map((chat) => (
                <div
                  key={chat.shareId}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500/50 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {chat.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          {new Date(chat.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye size={16} />
                          {chat.accessCount || 0} views
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyShareLink(chat.shareUrl)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition"
                        title="Copy share link"
                      >
                        {copiedId === chat.shareUrl ? (
                          <Check size={18} className="text-green-400" />
                        ) : (
                          <Copy size={18} className="text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => window.open(chat.shareUrl, "_blank")}
                        className="p-2 hover:bg-purple-600/30 rounded-lg transition text-purple-400"
                        title="Open in new tab"
                      >
                        <BarChart3 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-900/50 rounded-md p-3 mb-4 border border-gray-700">
                    <p className="text-xs text-gray-400 mb-2">Share URL:</p>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-300 text-sm break-all flex-1 font-mono">
                        {chat.shareUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteSharedChat(chat.shareId)}
                      className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-md transition border border-red-500/30 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Chat History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {userChats.length === 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
                <MessageCircle
                  size={48}
                  className="mx-auto text-gray-500 mb-4"
                />
                <p className="text-gray-400 text-lg">No chats yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Start a new conversation to begin
                </p>
              </div>
            ) : (
              userChats.map((chat) => (
                <div
                  key={chat._id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500/50 transition cursor-pointer"
                  onClick={() => navigate(`/chat/${chat._id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {chat.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        {chat.subtitle}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={14} />
                        {new Date(chat.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
