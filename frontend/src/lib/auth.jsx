import React, { createContext, useContext, useEffect, useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import { useRoom } from "../context/RoomContext";

const AuthContext = createContext(null);

// Helper function to get auth token from localStorage
export function getAuthToken() {
  return localStorage.getItem("token");
}

export function AuthProvider({ children }) {
  const files = []; // or fetched later
  const [user, setUser] = useState({
    id: "",
    username: "",
    email: "",
    createdAt: "",
    lastLogin: "",
    theme: "dark",
    filesCreated: files.length || 0,
    plan: "Free",
    avatar: "",
  });

  const [loading, setLoading] = useState(true);

  const { roomId, setRoomId } = useRoom();

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Use cached user immediately
      const cached = localStorage.getItem("user");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          localStorage.removeItem("user");
        }
      }

      try {
        const res = await api.get("/api/auth/me");
        if (res?.data?.success) {
          const backendUser = res.data.data.user;

          // Merge backend user with your extra fields
          const mergedUser = {
            ...user, // keep defaults like theme
            ...backendUser, // override with backend data
            filesCreated: files.length || 0,
          };

          // Ensure both `id` and `_id` are present for compatibility
          if (!mergedUser._id && mergedUser.id) mergedUser._id = mergedUser.id;
          if (!mergedUser.id && mergedUser._id) mergedUser.id = mergedUser._id;

          setUser(mergedUser);
          localStorage.setItem("user", JSON.stringify(mergedUser));
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const signin = (token, userObj) => {
    // Normalize user object to include both `id` and `_id`
    const normalized = { ...userObj };
    if (!normalized._id && normalized.id) normalized._id = normalized.id;
    if (!normalized.id && normalized._id) normalized.id = normalized._id;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(normalized));
    setUser(normalized);
  };

  const signout = async () => {
    try {
      await api.post("/api/auth/logout");
      console.log("Logout Room : ", roomId);
      setRoomId("");
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("roomId");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signin, signout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (!user?.id) {
    navigate("/signin");
    return null;
  }
  return children;
}
