import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  }
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export function AuthProvider({ children }) {
  // null = checking, object = authed, false = not authed
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  const checkAuth = useCallback(async () => {
    // If session_id is in hash, let the callback handler deal with it
    if (typeof window !== "undefined" && window.location.hash?.includes("session_id=")) {
      setChecked(true);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      setUser(false);
    } finally {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const register = async ({ email, password, name }) => {
    const { data } = await api.post("/auth/register", { email, password, name });
    setUser(data);
    return data;
  };

  const login = async ({ email, password }) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    setUser(false);
  };

  const completeGoogle = async (sessionId) => {
    const { data } = await api.post("/auth/google", { session_id: sessionId });
    setUser(data);
    return data;
  };

  const completeFarcaster = async (payload) => {
    const { data } = await api.post("/auth/farcaster", payload);
    setUser(data);
    return data;
  };

  const refreshMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      return data;
    } catch {
      setUser(false);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        checked,
        isAuthenticated: !!user && user !== false,
        register,
        login,
        logout,
        completeGoogle,
        completeFarcaster,
        refreshMe,
        formatApiError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
