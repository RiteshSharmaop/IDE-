import React, { useState } from "react";
import { Menu, X, Share2, LogOut, User, TvMinimal, ScanHeart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Navbar = ({ onShare, isActiveChat, sidebarWidth }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}api/user/logout`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert(error.response?.data?.message || "Logout failed");
    }
  };

  const handleHealthPrediction = ()=>{

  }

  return (
    // <nav className="fixed top-0 right-0 z-50 px-4 py-2 bg-gray-800/30 backdrop-blur-md border-b border-gray-700/50 w-full"  >
    <nav
      style={{ width: `calc(100% - ${sidebarWidth + 20}px)` }}
      className="fixed top-0 right-0 z-50 px-4 py-2 mt-2 "
    >
      <div className="flex justify-between items-center w-full">
        {/* Logo or Brand */}
        <div className="text-xl font-bold text-white"> </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-4">

          {/* HexaHub Prediction */}
          {isActiveChat && (
            <Link
              to="https://hexahub-mern.onrender.com"
              className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors"
            >
              <TvMinimal size={18} />
              <span className="hidden sm:inline">HexaHub</span>
            </Link>
          )}


          {/* Health Prediction */}
          {isActiveChat && (
            <Link
            to="https://multiplediseaseprediction-22127.streamlit.app/"
            className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors"
            >
              <ScanHeart size={18} />
              <span className="hidden sm:inline">Health Prediction</span>
            </Link>
          )}

          {/* Share Button */}
          {isActiveChat && (
            <button
            onClick={onShare}
            className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg transition-colors"
            >
              <Share2 size={18} />
              <span className="hidden sm:inline">Share Chat</span>
            </button>
          )}
          {/* Hamburger Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    // Navigate to profile page
                    setIsMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <User size={18} />
                  Profile
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
