import React, { createContext, useContext, useEffect, useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

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
    plan: 'Free',
    avatar: '',
  });

  const [loading, setLoading] = useState(true);

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
            ...user,            // keep defaults like theme
            ...backendUser,     // override with backend data
            filesCreated: files.length || 0,
          };

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
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userObj));
    setUser(userObj);
  };

  const signout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
