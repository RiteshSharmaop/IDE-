import React, { useEffect, useState } from "react";
import UserProfile from "../components/UserProfile";
import { apiClient } from "../lib/api";
import { getUserRooms } from "../lib/roomApi";
import { useAuth } from "../lib/auth";
import { useTheme } from "../context/ThemeContext";
import ThemeToggleButton from "../components/ThemeToggleButton";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [userFiles, setUserFiles] = useState([]);
  const [rooms, setRooms] = useState([]);

  const loadUserFiles = async () => {
    try {
      const res = await apiClient.get("/files");
      if (res?.data?.success) {
        setUserFiles(res.data.data.files || []);
      }
    } catch (err) {
      console.error("Failed loading user files:", err);
    }
  };

  const loadUserRooms = async () => {
    try {
      const res = await getUserRooms();
      if (res?.success) setRooms(res.data || []);
    } catch (err) {
      console.error("Failed loading rooms:", err);
    }
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await apiClient.post("/users/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res?.data?.success) {
        const updated = { ...user, avatar: res.data.data.url };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      } else {
        alert("Failed to upload avatar");
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Avatar upload failed");
    }
  };

  useEffect(() => {
    loadUserFiles();
    loadUserRooms();
  }, []);

  return (
    <div className={`relative min-h-screen ${isDark ? "bg-[#0A0A0F] text-white" : "bg-[#F6F7FB] text-slate-900"}`}>
      <div className="absolute right-4 top-4 z-30">
        <ThemeToggleButton />
      </div>
      <UserProfile
        user={user}
        userFiles={userFiles}
        rooms={rooms}
        uploadAvatar={uploadAvatar}
        onClose={() => window.history.back()}
        loadUserFiles={loadUserFiles}
        loadUserRooms={loadUserRooms}
      />
    </div>
  );
}
