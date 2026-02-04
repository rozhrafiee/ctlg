import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data);
    } catch (err) {
      console.error("Auth error:", err);
      localStorage.removeItem("access");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    localStorage.setItem("access", res.data.access);
    await fetchUser();
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    hasTakenPlacementTest: user?.has_taken_placement_test || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
