import React, { createContext, useState, useEffect } from "react";

export const UserDataContext = createContext();

const UserContext = ({ children }) => {
  const [user, setUser] = useState({
    email: "",
    fullName: "",
    isPaid: false,
  });
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // ✅ Sync token with localStorage whenever it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // ✅ Detect manual changes to localStorage (like delete from inspect)
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token")); // resync with localStorage
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const logout = () => {
    setToken(null);
    setUser({ email: "", fullName: "" });
  };

  return (
    <UserDataContext.Provider
      value={{ user, setUser, token, setToken, logout }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export { UserContext };
