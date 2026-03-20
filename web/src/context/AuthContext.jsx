"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "@/services/authService";
import { saveToken, clearToken, getToken, wakeUpServer } from "@/services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user || data);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    wakeUpServer();
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const { data } = await authAPI.signin(email, password);
    if (data.requires2FA) return { requires2FA: true, tempToken: data.tempToken };
    saveToken(data.token);
    setUser(data.user);
    return { success: true };
  };

  const signup = async (name, email, password) => {
    const { data } = await authAPI.signup(name, email, password);
    saveToken(data.token);
    setUser(data.user);
    return { success: true };
  };

  const verify2FA = async (tempToken, code) => {
    const { data } = await authAPI.login2FA(tempToken, code);
    saveToken(data.token);
    setUser(data.user);
    return { success: true };
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const value = {
    user,
    loading,
    login,
    signup,
    verify2FA,
    logout,
    updateUser,
    refreshUser: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
