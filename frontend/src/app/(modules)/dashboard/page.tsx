"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import Layout from "@/components/Layout";

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [access, setAccess] = useState<Record<string, boolean> | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const router = useRouter();

  // ----------------------------
  // Redireciona automaticamente se o usuário não estiver logado
  // ----------------------------
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  // ----------------------------
  // Inicializa o Dashboard
  // ----------------------------
  useEffect(() => {
    const initDashboard = async () => {
      if (authLoading || !user) return;

      try {
        const res = await api.get("/dashboard", { withCredentials: true });
        setAccess(res.data.access);
      } catch (err: any) {
        // Se 401 ou 403, força logout (que também redireciona via efeito acima)
        if (err.response?.status === 401 || err.response?.status === 403) {
          await logout();
        } else {
          setAccess(null);
        }
      } finally {
        setDashboardLoading(false);
      }
    };

    initDashboard();
  }, [authLoading, user, logout]);

  // ----------------------------
  // Loading global ou do dashboard
  // ----------------------------
  if (authLoading || dashboardLoading) return <p>Carregando...</p>;

  if (!user) return null; // já será redirecionado pelo efeito acima
  if (!access) return <p>Acesso negado</p>;

  return (
    <Layout>
      <div>
        <h1>Bem-vindo ao Dashboard</h1>
        <p>Usuário: {user.id}</p>
        <p>Roles: {(user.roles ?? []).join(", ")}</p>
        <p>Master: {user.isMaster ? "Sim" : "Não"}</p>

        <h2>Acessos:</h2>
        <ul>
          {Object.entries(access).map(([module, allowed]) => (
            <li key={module}>
              {module}: {allowed ? "✔️" : "❌"}
            </li>
          ))}
        </ul>

        <button onClick={logout}>Sair</button>
      </div>
    </Layout>
  );
}
