"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import Layout from "@/components/Layout";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const [access, setAccess] = useState<Record<string, boolean> | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard", { withCredentials: true });
        setAccess(res.data.access);
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout(); // limpa user
          router.replace("/login"); // redireciona
        } else {
          setAccess(null);
        }
      } finally {
        setDashboardLoading(false);
      }
    };

    if (!loading && user) {
      fetchDashboard();
    } else if (!user && !loading) {
      router.replace("/login");
      setDashboardLoading(false);
    }
  }, [user, loading, router, logout]);

  if (loading || dashboardLoading) return <p>Carregando...</p>;
  if (!access) return <p>Acesso negado</p>;

  return (
    <Layout>
    <div>
      <h1>Bem-vindo ao Dashboard</h1>
      <p>Usuário: {user!.id}</p>
      <p>Roles: {user!.roles.join(", ")}</p>
      <p>Master: {user!.isMaster ? "Sim" : "Não"}</p>

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
