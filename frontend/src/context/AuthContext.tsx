// src/context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "@/services/api";
import type { AxiosRequestConfig } from "axios";
import toast from "react-hot-toast";

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  isMaster: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Trava pra evitar múltiplos refreshes simultâneos
  const isRefreshing = useRef(false);
  // Promise compartilhada quando refresh está em andamento
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);
  // token em memória (opcional)
  const accessTokenRef = useRef<string | null>(null);

  // Retorna token atual
  const getAccessToken = () => accessTokenRef.current;

  // Define header Authorization globalmente
  const setAuthHeader = (token: string | null) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      accessTokenRef.current = token;
    } else {
      delete api.defaults.headers.common["Authorization"];
      accessTokenRef.current = null;
    }
  };

  // =============================
  // LOGIN
  // =============================
  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password }, { withCredentials: true });
      const { accessToken, user: userFromApi } = res.data;
      if (!accessToken || !userFromApi) throw new Error("Resposta inválida da API");

      setAuthHeader(accessToken);
      setUser(userFromApi);
    } catch (err) {
      // garante limpeza
      setAuthHeader(null);
      setUser(null);
      throw err;
    }
  }, []);

  // =============================
  // LOGOUT
  // =============================
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      toast.success("Logout realizado com sucesso!");
    } catch (err) {
      // ignora erros de rede ao deslogar
      console.warn("Erro ao chamar logout:", err);
    } finally {
      setAuthHeader(null);
      setUser(null);
      // redirecionamento controlado pelo seu componente (ex: router.replace('/login'))
    }
  }, []);

  // =============================
  // REFRESH ACCESS TOKEN
  // =============================
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    // Se já está em progresso, retorna a promise existente
    if (isRefreshing.current && refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    isRefreshing.current = true;
    const promise = (async () => {
      try {
        const res = await api.post("/auth/refresh", {}, { withCredentials: true });
        const newToken = res.data?.accessToken ?? null;
        if (newToken) {
          setAuthHeader(newToken);
        } else {
          // sem token: limpar
          setAuthHeader(null);
        }
        return newToken;
      } catch (err) {
        setAuthHeader(null);
        setUser(null);
        return null;
      } finally {
        isRefreshing.current = false;
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = promise;
    return promise;
  }, []);

  // =============================
  // REFRESH DO USUÁRIO
  // =============================
  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const token = await refreshAccessToken();
      if (!token) {
        setUser(null);
        return;
      }

      // token já aplicado no header por refreshAccessToken
      const res = await api.get("/auth/validate", { withCredentials: true });
      const userFromApi = res.data?.user ?? null;
      setUser(userFromApi);
    } catch (err) {
      setUser(null);
      console.error("refreshUser error:", err);
    } finally {
      setLoading(false);
    }
  }, [refreshAccessToken]);

  // =============================
  // init once on mount
  // =============================
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await refreshUser();
    })();

    // periodic background refresh (10 minutos)
    const interval = setInterval(() => {
      // não await para não bloquear UI; a função tem trava interna
      refreshUser().catch((err) => console.error("background refresh failed:", err));
    }, 10 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [refreshUser]);

  // =============================
  // axios response interceptor global (opcional)
  // Se preferir interceptors que automaticamente tentam refresh em qualquer 401, você pode
  // adicionar aqui. Entretanto, com a estratégia atual onde refresh é chamado explicitamente,
  // interferência de interceptors não é necessária. Se quiser, eu adiciono.
  // =============================

  return (
  <AuthContext.Provider
    value={{
      user,
      loading,
      login,
      logout,
      refreshUser,
      getAccessToken,
    }}
  >
    {loading ? (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    ) : (
      children
    )}
  </AuthContext.Provider>
);
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};
