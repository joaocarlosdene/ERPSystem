"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/services/api";
import {jwtDecode} from "jwt-decode";

interface User {
  id: number;
  email: string;
  roles: string[];
  isMaster: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Tenta buscar o usuário na inicialização
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("users");
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  // 🔹 Login
  const login = async (email: string, password: string) => {
    const res = await api.post("/login", { email, password });
    setUser(res.data.user);
  };

  // 🔹 Logout
  const logout = async () => {
    await api.post("/logout");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};
