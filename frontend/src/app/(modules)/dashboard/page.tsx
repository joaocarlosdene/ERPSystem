"use client";
import useAuthGuard from "@/hooks/useAuth";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { authorized, loading } = useAuthGuard(["master", "gestao", "financeiro", "producao"]);
  const { user, logout } = useAuth();

  if (loading) return <p>Carregando...</p>;
  if (!authorized) return <p>Acesso negado</p>;

  return (
    <div>
      <h1>Bem-vindo ao Dashboard, {user?.email}</h1>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
