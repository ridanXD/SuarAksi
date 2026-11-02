"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Role } from "@suaraksi/shared";
import { api } from "./api";

export interface CurrentUser {
  id: string;
  email: string;
  username: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  bio?: string | null;
  phone?: string | null;
  isVerified: boolean;
  instanceProfile?: {
    id: string;
    instanceName: string;
    jurisdiction: string;
    categoryFocus?: string | null;
    officialAddress?: string | null;
    websiteUrl?: string | null;
  } | null;
  stats?: {
    reportsCount: number;
    bookmarksCount: number;
    followersCount: number;
    followingCount: number;
    upvotesCount: number;
  };
}

interface AuthContextType {
  user: CurrentUser | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<CurrentUser>;
  register: (data: any) => Promise<CurrentUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem("suaraksi_token");
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }
      setToken(storedToken);
      const userData = await api.get<CurrentUser>("/auth/me");
      setUser(userData);
    } catch {
      localStorage.removeItem("suaraksi_token");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: any): Promise<CurrentUser> => {
    const res = await api.post<{ user: CurrentUser; token: string }>("/auth/login", credentials);
    localStorage.setItem("suaraksi_token", res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (data: any): Promise<CurrentUser> => {
    const res = await api.post<{ user: CurrentUser; token: string }>("/auth/register", data);
    localStorage.setItem("suaraksi_token", res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem("suaraksi_token");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}
