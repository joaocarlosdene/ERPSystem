"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setAuthTokens, clearAuthTokens } from "@/services/api";

interface User {
  id: string;
  name: string;
  email: string;
  roles?: string[];
  isMaster: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Atualiza usuário autenticado
  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/validate");
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Carrega tokens ao abrir a aplicação
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken && refreshToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ Login
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      console.log("📥 Resposta da API:", res.data);

      const { user, accessToken, refreshToken } = res.data;

      // Salva tokens no localStorage
      setAuthTokens(accessToken, refreshToken);

      // Verifica se salvou
      console.log("✅ Tokens salvos:");
      console.log("Access Token:", localStorage.getItem("accessToken"));
      console.log("Refresh Token:", localStorage.getItem("refreshToken"));

      // Atualiza usuário
      setUser(user);
    } catch (err: any) {
      console.error("❌ Erro ao logar:", err.response?.data || err);
      clearAuthTokens();
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.warn("Erro ao deslogar:", e);
    } finally {
      clearAuthTokens();
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};
